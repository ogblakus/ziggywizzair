import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { closeCallsFor, compactScorecard, markOpenCalls, openCall, proposerFrom, recordsFrom } from "@/lib/agents/scorecard";
import {
  applyFill,
  emptyBook,
  idleAgents,
  notionalOk,
  preferBook,
  scrubGhostAutopilot,
  type DeskBook,
} from "@/lib/desk/engine";
import { addCountToday, holdExpired, isAddOn, isReduce, MAX_ADDS_PER_DAY, stampOpened, viewOf } from "@/lib/desk/holds";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import { liveProposal, stampProposal } from "@/lib/desk/proposal";
import { changePct, rsi, sma } from "@/lib/market/engine";
import { relativeVolume, tickerSetupFields } from "@/lib/market/setup";
import { withEquityPct } from "@/lib/market/macro";
import { isQuietNews, newsKeysFrom, newsKey, newsOverlap } from "@/lib/market/news-key";
import type { LiveQuote } from "@/lib/market/quotes";
import { isLot, UNIVERSE } from "@/lib/market/universe";
import { useMarks } from "@/lib/marks-store";
import { closedFromFill, decorateClosed, equityOf, rollAnchors } from "@/lib/portfolio";
import { useTradingMode } from "@/lib/trading-mode";
import type {
  AgentSpeech,
  CouncilResult,
  Fill,
  Headline,
  LastAsk,
  MacroTape,
  MarketAsset,
  MarketSnapshot,
  Position,
} from "@/lib/types";

export type FeedStatusLocal = "live" | "stale" | "idle";

type DeskState = DeskBook & {
  hydrated: boolean;
  assets: Record<string, MarketAsset>;
  headlines: Headline[];
  macro: MacroTape | null;
  convening: boolean;
  asking: boolean;
  pendingAsk: string | null;
  paused: boolean;
  feed: FeedStatusLocal;
  lastFeedAt: number;
  clock: number;
};

type DeskActions = {
  markHydrated: () => void;
  applyLiveQuotes: (quotes: LiveQuote[]) => void;
  applyLiveMids: (mids: Record<string, number>) => void;
  applyHeadlines: (items: Headline[]) => void;
  applyMacro: (macro: MacroTape) => void;
  setFeed: (feed: FeedStatusLocal) => void;
  select: (symbol: string) => void;
  setPaused: (paused: boolean) => void;
  setAutopilot: (on: boolean) => void;
  setConvening: (on: boolean) => void;
  setAsking: (on: boolean, question?: string) => void;
  setAgentStatus: (id: AgentId, status: AgentSpeech["status"]) => void;
  placeOrder: (input: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    source: Fill["source"];
    note?: string;
    skipRisk?: boolean;
  }) => { ok: true; fill: Fill } | { ok: false; error: string };
  closePosition: (
    symbol: string,
    qty?: number,
  ) => { ok: true; fill: Fill } | { ok: false; error: string };
  applyCouncil: (result: CouncilResult, source: "ai" | "local", opts?: { spoken?: boolean }) => void;
  answerAsk: (question: string, result: { speaker: AgentId; text: string }, source: "ai" | "local") => void;
  executeProposal: () => { ok: true } | { ok: false; error: string };
  dismissProposal: () => void;
  tryFillWorking: () => void;
  speak: (item: { kind: "news" | "fill" | "agent" | "system"; text: string; agentId?: AgentId; symbol?: string }) => void;
  unveilAgent: (row: CouncilResult["agents"][number]) => void;
  snapshot: () => MarketSnapshot;
  hydrateBook: (book: DeskBook) => void;
  touchTick: () => void;
  reset: () => void;
  applyTimeStops: () => void;
};

const empty = emptyBook();

const ASK_TTL_MS = 24 * 60 * 60 * 1000;

function pruneAsk(ask: LastAsk | null | undefined, now = Date.now()): LastAsk | null {
  if (!ask) return null;
  const rows = (ask.log?.length
    ? ask.log
    : [{ question: ask.question, speaker: ask.speaker, text: ask.text, ts: ask.ts }])
    .map((r) => ({ ...r, ts: r.ts ?? 0 }))
    .filter((r) => r.ts > now - ASK_TTL_MS);
  if (!rows.length) return null;
  const last = rows[rows.length - 1]!;
  return { question: last.question, speaker: last.speaker, text: last.text, ts: last.ts, log: rows };
}

function keepAsk(incoming: LastAsk | null | undefined, current: LastAsk | null | undefined): LastAsk | null {
  const now = Date.now();
  const a = pruneAsk(incoming, now);
  const b = pruneAsk(current, now);
  const aLen = a?.log?.length ?? (a ? 1 : 0);
  const bLen = b?.log?.length ?? (b ? 1 : 0);
  if (bLen > aLen) return b;
  if (aLen > bLen) return a;
  if (b && a && (b.text?.length ?? 0) > (a.text?.length ?? 0)) return b;
  return a ?? b;
}

function speechFromCouncil(result: CouncilResult): AgentSpeech[] {
  return AGENTS.map((p) => {
    const a = result.agents.find((row) => row.id === p.id);
    if (!a) {
      return {
        id: p.id,
        status: "idle" as const,
        thesis: p.mandate,
        vote: "hold" as const,
        symbol: null,
        conviction: 0,
      };
    }
    return {
      id: a.id,
      status: "spoken" as const,
      thesis: a.thesis,
      vote: a.vote,
      symbol: a.symbol,
      conviction: a.conviction,
    };
  });
}

function uniqueNewsTape(tape: DeskBook["tape"]) {
  const seen = new Set<string>();
  const out: DeskBook["tape"] = [];
  for (const row of tape) {
    if (row.kind === "news" || row.agentId === "damian") {
      const k = newsKey(row.text);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
    }
    out.push(row);
  }
  return out.slice(0, 120);
}

export function mergeAssets(assets: Record<string, MarketAsset>) {
  const out: Record<string, MarketAsset> = {};
  for (const [k, a] of Object.entries(assets)) {
    const px = a.livePx && a.livePx > 0 ? a.livePx : a.price;
    out[k] = { ...a, price: px || a.price };
  }
  return out;
}

export function bookEquity(cash: number, positions: Position[], assets: Record<string, MarketAsset>) {
  return equityOf(cash, positions, mergeAssets(assets));
}

export function liveAssets() {
  return mergeAssets(useDesk.getState().assets);
}

export function useAssets() {
  return useDesk((s) => s.assets);
}

export function useSelectedTape() {
  return useDesk((s) => s.assets[s.selected] ?? null);
}

export function useFeed() {
  return useDesk((s) => s.feed);
}

export function useMarkedAssets() {
  const assets = useDesk((s) => s.assets);
  const marks = useMarks((s) => s.marks);
  const out: Record<string, MarketAsset> = {};
  for (const [k, a] of Object.entries(assets)) {
    const mark = marks[k];
    const px = mark || a.livePx || a.price;
    out[k] = { ...a, price: px || a.price };
  }
  return out;
}

let bootQuotes: LiveQuote[] | null = null;

export function installBootQuotes(quotes: LiveQuote[]) {
  bootQuotes = quotes;
}

export function preferServerBook(server: DeskBook, local: DeskBook) {
  return preferBook(server, local);
}

export function toDeskBook(s: DeskState): DeskBook {
  return {
    cash: s.cash,
    positions: s.positions,
    fills: s.fills,
    closedTrades: s.closedTrades,
    autopilot: s.autopilot,
    lastCouncil: s.lastCouncil,
    lastAsk: pruneAsk(s.lastAsk),
    agents: s.agents,
    startingEquity: s.startingEquity,
    periodAnchors: s.periodAnchors,
    tape: s.tape,
    proposal: s.proposal,
    working: s.working,
    selected: s.selected,
    lastAutoAt: s.lastAutoAt,
    lastTickAt: s.lastTickAt,
    fillSeq: s.fillSeq,
    clientUntil: Date.now() + 45_000,
    deskEpoch: s.deskEpoch,
    agentCalls: s.agentCalls,
    lastCouncilAt: s.lastCouncilAt,
    locale: getLocale(),
    mode: useTradingMode.getState().mode,
  };
}

export function bindDeskStorage(userId: string) {
  useDesk.persist.setOptions({ name: `zw-desk-${userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)}` });
}

export const useDesk = create<DeskState & DeskActions>()(
  persist(
    (set, get) => ({
      ...empty,
      hydrated: false,
      assets: {},
      headlines: [],
      macro: null,
      convening: false,
      asking: false,
      pendingAsk: null,
      paused: false,
      feed: "idle",
      lastFeedAt: 0,
      clock: Date.now(),

      markHydrated: () => set({ hydrated: true }),
      applyLiveQuotes: (quotes) => {
        const s = get();
        const first = s.lastFeedAt <= 1;
        const assets = { ...s.assets };
        const now = Date.now();
        for (const q of quotes) {
          const prev = assets[q.symbol];
          const u = UNIVERSE.find((x) => x.symbol === q.symbol);
          if (!u) continue;
          assets[q.symbol] = {
            symbol: q.symbol,
            name: u.name,
            price: q.livePx ?? q.price,
            open: q.prevClose,
            high: q.high,
            low: q.low,
            series: (q.series.length ? q.series : prev?.series ?? [{ t: now, px: q.livePx ?? q.price }]).slice(-120),
            vol: u.vol,
            beta: u.beta,
            livePx: q.livePx ?? prev?.livePx ?? null,
            liveCoin: q.liveCoin ?? prev?.liveCoin ?? null,
            spotPx: q.spotPx ?? prev?.spotPx ?? q.price,
            tape: q.tape ?? prev?.tape ?? "yahoo",
          };
        }
        set({
          assets,
          clock: now,
          feed: "live",
          lastFeedAt: now,
          agentCalls: markOpenCalls(
            s.agentCalls ?? [],
            Object.fromEntries(Object.entries(assets).map(([k, a]) => [k, a?.price ?? 0])),
            now,
          ),
        });
        useMarks.getState().tick(mergeAssets(assets));
        if (first) {
          const already = s.tape.some(
            (row) => row.kind === "system" && (row.text.startsWith("Live tape on") || row.text.startsWith("Ceny na żywo")),
          );
          if (!already) get().speak({ kind: "system", text: t("tape.liveOn") });
        }
        get().applyTimeStops();
        get().tryFillWorking();
      },
      applyLiveMids: (mids) => {
        const s = get();
        const assets = { ...s.assets };
        let hit = false;
        const now = Date.now();
        for (const [sym, mid] of Object.entries(mids)) {
          const prev = assets[sym];
          if (!prev || !(mid > 0)) continue;
          hit = true;
          const last = prev.series.at(-1);
          const bar =
            last && now - last.t < 60_000
              ? {
                  t: last.t,
                  px: mid,
                  v: last.v,
                  o: last.o ?? last.px,
                  h: last.h != null ? Math.max(last.h, mid) : Math.max(last.px, mid),
                  l: last.l != null ? Math.min(last.l, mid) : Math.min(last.px, mid),
                }
              : { t: now, px: mid, o: mid, h: mid, l: mid };
          assets[sym] = {
            ...prev,
            price: mid,
            livePx: mid,
            high: prev.high ? Math.max(prev.high, mid) : mid,
            low: prev.low ? Math.min(prev.low, mid) : mid,
            series:
              last && now - last.t < 60_000
                ? [...prev.series.slice(0, -1), bar]
                : [...prev.series.slice(-119), bar],
          };
        }
        if (!hit) return;
        set({ assets, clock: now, feed: "live", lastFeedAt: now });
        useMarks.getState().tick(mergeAssets(assets));
        const proposal = liveProposal(get().proposal, now);
        if (proposal !== get().proposal) set({ proposal });
        get().applyTimeStops();
        get().tryFillWorking();
      },
      applyHeadlines: (items) => {
        const prev = get();
        const headlines = items.slice(0, 16);
        const seen = new Set<string>();
        for (const h of prev.headlines) {
          for (const k of newsKeysFrom(h.text)) seen.add(k);
          if (h.id) seen.add(h.id);
        }
        for (const row of prev.tape) {
          if (row.kind === "news" || row.agentId === "damian") {
            for (const k of newsKeysFrom(row.text)) seen.add(k);
          }
        }
        const prunedTape = uniqueNewsTape(prev.tape);
        set({ headlines, lastTickAt: Date.now(), tape: prunedTape });
        let spoken = 0;
        for (const h of headlines) {
          if (spoken >= 1) break;
          const k = newsKey(h.text) || h.id;
          if (seen.has(k) || seen.has(h.id)) continue;
          if ([...seen].some((s) => s.length >= 16 && k.length >= 16 && (k.includes(s) || s.includes(k)))) continue;
          seen.add(k);
          for (const extra of newsKeysFrom(h.text)) seen.add(extra);
          get().speak({
            kind: "news",
            symbol: h.symbol,
            text: h.symbol ? `${h.symbol} · ${h.text}` : h.text,
          });
          spoken += 1;
        }
      },
      applyMacro: (macro) => set({ macro, lastTickAt: Date.now() }),
      setFeed: (feed) => set({ feed }),
      select: (symbol) => set({ selected: symbol, lastTickAt: Date.now() }),
      setPaused: (paused) => set({ paused }),
      setAutopilot: (on) => {
        if (on && useTradingMode.getState().mode === "live") return;
        set({ autopilot: on, lastTickAt: Date.now() });
        get().speak({ kind: "system", text: on ? t("tape.autoOn") : t("tape.autoOff") });
      },
      setConvening: (on) => set({ convening: on, lastAutoAt: on ? Date.now() : get().lastAutoAt }),
      setAsking: (on, question) =>
        set({
          asking: on,
          pendingAsk: on ? (question ?? get().pendingAsk) : null,
        }),
      setAgentStatus: (id, status) =>
        set({
          agents: get().agents.map((a) => (a.id === id ? { ...a, status } : a)),
        }),
      placeOrder: ({ symbol, side, qty, source, note, skipRisk }) => {
        if (useTradingMode.getState().mode === "live") {
          return { ok: false as const, error: "Live orders from this desk are not signed yet. Switch to Demo to practice." };
        }
        const s = get();
        const asset = mergeAssets(s.assets)[symbol];
        if (!asset || !asset.price) return { ok: false as const, error: "Waiting on the live tape." };
        const sized = isLot(symbol) || skipRisk ? qty : Math.round(qty);
        if (!Number.isFinite(sized) || sized <= 0) return { ok: false as const, error: "Size the ticket." };
        const mark = asset.price;
        const spread = isLot(symbol) ? 0.0004 : 0.00025;
        const price = side === "buy" ? mark * (1 + spread) : mark * (1 - spread);
        const priced = mergeAssets(s.assets);
        const adding = isAddOn(s.positions, symbol, side);
        if (!skipRisk && adding && addCountToday(s.fills, Date.now()) >= MAX_ADDS_PER_DAY) {
          return { ok: false as const, error: "Iris veto — two adds today." };
        }
        if (!skipRisk && !notionalOk(s.cash, s.positions, priced, symbol, side, sized, price)) {
          return { ok: false as const, error: "Iris veto — size or concentration." };
        }
        const nextSeq = s.fillSeq + 1;
        const now = Date.now();
        const fill: Fill = {
          id: `f-${now.toString(36)}-${nextSeq.toString(36)}`,
          ts: now,
          symbol,
          side,
          qty: sized,
          price,
          source,
          note,
        };
        const next = applyFill(s.cash, s.positions, fill);
        if (!skipRisk && next.cash < -0.5) {
          return { ok: false as const, error: "Iris veto — not enough cash." };
        }
        const stamped = stampOpened(
          s.positions.find((p) => p.symbol === symbol),
          next.positions,
          fill,
        );
        const closed = closedFromFill(
          s.positions.find((p) => p.symbol === symbol),
          fill,
        );
        const decorated = closed ? decorateClosed(closed, s.lastCouncil, fill, s.fills) : null;
        const closedTrades = decorated ? [decorated, ...(s.closedTrades ?? [])].slice(0, 200) : (s.closedTrades ?? []);
        const eq = bookEquity(next.cash, stamped, priced);
        const stillOpen = Math.abs(stamped.find((p) => p.symbol === symbol)?.qty ?? 0) > 1e-8;
        let agentCalls = closeCallsFor(s.agentCalls ?? [], symbol, price, now, stillOpen);
        if (source === "council") {
          const who = proposerFrom(s.lastCouncil, symbol, side);
          if (who) {
            agentCalls = [
              openCall({
                id: `c-${now.toString(36)}-${nextSeq.toString(36)}`,
                ts: now,
                agentId: who,
                symbol,
                side,
                entry: price,
                qty: sized,
                fillId: fill.id,
              }),
              ...agentCalls,
            ].slice(0, 80);
          }
        }
        set({
          cash: next.cash,
          positions: stamped,
          fills: [fill, ...s.fills].slice(0, 80),
          closedTrades,
          fillSeq: nextSeq,
          lastTickAt: now,
          periodAnchors: rollAnchors(s.periodAnchors, eq),
          agentCalls,
          proposal: s.proposal && s.proposal.symbol === symbol && s.proposal.side === side ? null : s.proposal,
        });
        get().speak({
          kind: "fill",
          symbol,
          text: `${side.toUpperCase()} ${sized.toFixed(isLot(symbol) ? 4 : 2)} ${symbol} @ ${price.toFixed(2)}${note ? ` · ${note}` : ""}`,
        });
        return { ok: true as const, fill };
      },
      closePosition: (symbol, qty) => {
        const s = get();
        const pos = s.positions.find((p) => p.symbol === symbol);
        if (!pos || Math.abs(pos.qty) < 1e-8) {
          return { ok: false as const, error: "No open trade." };
        }
        const full = Math.abs(pos.qty);
        const closeQty = qty && qty > 0 ? Math.min(full, qty) : full;
        const partial = closeQty < full - 1e-8;
        return get().placeOrder({
          symbol,
          side: pos.qty > 0 ? "sell" : "buy",
          qty: closeQty,
          source: "manual",
          note: partial ? t("close.manualPartial") : t("close.manual"),
          skipRisk: true,
        });
      },
      applyCouncil: (result, source, opts) => {
        const live = useTradingMode.getState().mode === "live";
        set({
          lastCouncil: result,
          lastCouncilAt: Date.now(),
          proposal: live ? null : stampProposal(result.order),
          agents: speechFromCouncil(result),
          convening: false,
          lastTickAt: Date.now(),
        });
        get().speak({
          kind: "system",
          text: t(source === "ai" ? "tape.councilAi" : "tape.councilLocal", { summary: result.summary }),
        });
        if (!opts?.spoken) {
          for (const a of result.agents) {
            get().speak({
              kind: "agent",
              agentId: a.id,
              symbol: a.symbol ?? undefined,
              text: a.thesis,
            });
          }
        }
        if (!live && get().autopilot && result.order) {
          get().executeProposal();
        }
      },
      answerAsk: (question, result) => {
        const now = Date.now();
        const prev = pruneAsk(get().lastAsk, now);
        const prior = prev?.log ?? [];
        const turn = { question, speaker: result.speaker, text: result.text, ts: now };
        const log = pruneAsk({ ...turn, log: [...prior, turn] }, now)?.log ?? [turn];
        set({
          lastAsk: { ...turn, log },
          asking: false,
          pendingAsk: null,
          lastTickAt: Date.now(),
          agents: get().agents.map((a) =>
            a.id === result.speaker ? { ...a, thesis: result.text, status: "spoken" as const } : a,
          ),
        });
        get().speak({ kind: "agent", agentId: result.speaker, text: result.text });
      },
      executeProposal: () => {
        const s = get();
        const proposal = liveProposal(s.proposal);
        if (!proposal) return { ok: false as const, error: "No ticket on the rail." };
        if (proposal !== s.proposal) set({ proposal });
        const reducing = isReduce(s.positions, proposal.symbol, proposal.side);
        if (proposal.limitPx && proposal.limitPx > 0 && !reducing) {
          set({ working: proposal, proposal: null, lastTickAt: Date.now() });
          get().speak({
            kind: "system",
            text: t("tape.limitRest", {
              side: proposal.side.toUpperCase(),
              symbol: proposal.symbol,
              px: String(proposal.limitPx),
            }),
          });
          return { ok: true as const };
        }
        const res = get().placeOrder({
          symbol: proposal.symbol,
          side: proposal.side,
          qty: proposal.qty,
          source: "council",
          note: proposal.rationale,
        });
        if (!res.ok) return res;
        set({ proposal: null });
        return { ok: true as const };
      },
      dismissProposal: () => set({ proposal: null, working: null, lastTickAt: Date.now(), lastCouncilAt: Date.now() }),
      tryFillWorking: () => {
        const s = get();
        const w = s.working;
        if (!w?.limitPx) return;
        const px = mergeAssets(s.assets)[w.symbol]?.price;
        if (!(px > 0)) return;
        const hit = w.side === "buy" ? px <= w.limitPx : px >= w.limitPx;
        if (!hit) return;
        const res = get().placeOrder({
          symbol: w.symbol,
          side: w.side,
          qty: w.qty,
          source: "council",
          note: w.rationale,
        });
        if (res.ok) {
          set({ working: null });
          get().speak({
            kind: "system",
            text: t("tape.limitFill", { symbol: w.symbol, px: String(px) }),
          });
        }
      },
      speak: (item) => {
        if (item.kind === "news" || item.agentId === "damian") {
          const dup = get().tape.some((row) => {
            if (row.kind !== "news" && row.agentId !== "damian") return false;
            return newsOverlap(row.text, item.text);
          });
          if (dup) return;
          if (item.agentId === "damian" && isQuietNews(item.text)) {
            const alreadyQuiet = get().tape.some((row) => row.agentId === "damian" && isQuietNews(row.text));
            if (alreadyQuiet) return;
          }
        }
        set({
          tape: [
            {
              id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ts: Date.now(),
              kind: item.kind,
              text: item.text,
              agentId: item.agentId,
              symbol: item.symbol,
            },
            ...get().tape,
          ].slice(0, 120),
        });
      },
      unveilAgent: (row) => {
        set({
          agents: get().agents.map((a) =>
            a.id === row.id
              ? {
                  ...a,
                  status: "spoken" as const,
                  thesis: row.thesis,
                  vote: row.vote,
                  symbol: row.symbol,
                  conviction: row.conviction,
                }
              : a,
          ),
        });
      },
      snapshot: () => {
        const s = get();
        const assets = mergeAssets(s.assets);
        const tickers: MarketSnapshot["tickers"] = [];
        for (const u of UNIVERSE) {
          const a = assets[u.symbol];
          if (!a || !(a.price > 0)) continue;
          const series = a.series.map((b) => b.px);
          const mean = sma(series, 20);
          tickers.push({
            symbol: a.symbol,
            name: a.name,
            price: a.price,
            open: a.open,
            changePct: changePct(a.price, a.open),
            high: a.high,
            low: a.low,
            rsi: rsi(series),
            vsSma: mean ? ((a.price - mean) / mean) * 100 : 0,
            livePx: a.livePx,
            liveBps: null,
            ...tickerSetupFields(a.series, a.price),
            rvol: relativeVolume(a.series),
          });
        }
        if (!tickers.length) {
          return {
            tickers: [],
            headlines: [],
            book: { cash: s.cash, equity: s.cash, dayPnlPct: 0, positions: [] },
            macro: s.macro,
            scorecard: compactScorecard(recordsFrom(s.agentCalls ?? []), s.agentCalls ?? []),
          };
        }
        const eq = equityOf(s.cash, s.positions, assets);
        const spy = assets.SPY;
        const spyChg = spy?.price && spy.open ? changePct(spy.price, spy.open) : (s.macro?.equityPct ?? null);
        return {
          tickers,
          headlines: s.headlines.slice(0, 6).map((h) => ({ text: h.text, symbol: h.symbol, shock: h.shock })),
          book: {
            cash: s.cash,
            equity: eq,
            dayPnlPct: s.startingEquity ? ((eq - s.startingEquity) / s.startingEquity) * 100 : 0,
            positions: s.positions.map((p) => {
              const px = assets[p.symbol]?.price || p.avg;
              const pnlPct = p.avg ? ((px - p.avg) / p.avg) * 100 * Math.sign(p.qty || 1) : 0;
              return { symbol: p.symbol, qty: p.qty, avg: p.avg, pnlPct };
            }),
          },
          macro: withEquityPct(s.macro, spyChg),
          scorecard: compactScorecard(recordsFrom(s.agentCalls ?? []), s.agentCalls ?? []),
        };
      },
      hydrateBook: (book) => {
        const clean = scrubGhostAutopilot(book);
        set({
          cash: clean.cash,
          positions: clean.positions,
          fills: clean.fills,
          closedTrades: clean.closedTrades,
          autopilot: clean.autopilot,
          lastCouncil: clean.lastCouncil,
          lastAsk: keepAsk(clean.lastAsk, get().lastAsk),
          agents: clean.agents.length ? clean.agents : idleAgents(),
          startingEquity: clean.startingEquity,
          periodAnchors: clean.periodAnchors,
          tape: clean.tape,
          proposal: liveProposal(clean.proposal),
          working: clean.working ?? null,
          selected: clean.selected,
          lastAutoAt: clean.lastAutoAt,
          lastTickAt: clean.lastTickAt,
          fillSeq: clean.fillSeq,
          deskEpoch: clean.deskEpoch,
          agentCalls: clean.agentCalls,
          lastCouncilAt: clean.lastCouncilAt,
        });
      },
      touchTick: () => set({ lastTickAt: Date.now(), clientUntil: Date.now() + 45_000 }),
      reset: () => {
        const next = emptyBook();
        set({
          ...next,
          deskEpoch: get().deskEpoch + 1,
          assets: get().assets,
          headlines: get().headlines,
          macro: get().macro,
          feed: get().feed,
          lastFeedAt: get().lastFeedAt,
          clock: Date.now(),
          hydrated: true,
          asking: false,
          pendingAsk: null,
        });
      },
      applyTimeStops: () => {
        const s = get();
        const now = Date.now();
        const assets = mergeAssets(s.assets);
        for (const pos of s.positions) {
          const a = assets[pos.symbol];
          const v = viewOf(a);
          if (!v) continue;
          if (!holdExpired(pos, now, v.px, v.vsSma, v.dayChg)) continue;
          get().placeOrder({
            symbol: pos.symbol,
            side: pos.qty > 0 ? "sell" : "buy",
            qty: Math.abs(pos.qty),
            source: "council",
            note: "Time stop",
            skipRisk: true,
          });
        }
      },
    }),
    {
      name: "zw-desk",
      storage: createJSONStorage(() => localStorage),
      version: 6,
      partialize: (s) => ({
        cash: s.cash,
        positions: s.positions,
        fills: s.fills,
        closedTrades: s.closedTrades,
        autopilot: s.autopilot,
        lastCouncil: s.lastCouncil,
        lastAsk: s.lastAsk,
        agents: s.agents,
        startingEquity: s.startingEquity,
        periodAnchors: s.periodAnchors,
        tape: s.tape,
        proposal: s.proposal,
        working: s.working,
        selected: s.selected,
        lastAutoAt: s.lastAutoAt,
        fillSeq: s.fillSeq,
        deskEpoch: s.deskEpoch,
        agentCalls: s.agentCalls,
        lastCouncilAt: s.lastCouncilAt,
      }),
    },
  ),
);

if (typeof window !== "undefined" && bootQuotes) {
  queueMicrotask(() => useDesk.getState().applyLiveQuotes(bootQuotes!));
}
