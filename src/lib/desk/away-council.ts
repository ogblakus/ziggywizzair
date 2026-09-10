import { localCouncil } from "@/lib/agents/local-council";
import { compactScorecard, recordsFrom } from "@/lib/agents/scorecard";
import { AGENTS } from "@/lib/agents/personas";
import { t } from "@/lib/i18n/locale";
import { changePct, rsi, sma } from "@/lib/market/engine";
import { relativeVolume, tickerSetupFields } from "@/lib/market/setup";
import { withEquityPct } from "@/lib/market/macro";
import { UNIVERSE } from "@/lib/market/universe";
import type { LiveQuote } from "@/lib/market/quotes";
import { equityOf } from "@/lib/portfolio";
import type {
  CouncilResult,
  Headline,
  MacroTape,
  MarketAsset,
  MarketSnapshot,
  ProposedOrder,
  TapeItem,
} from "@/lib/types";
import type { DeskBook } from "@/lib/desk/engine";
import { stampProposal, liveProposal } from "@/lib/desk/proposal";

export const AWAY_COUNCIL_MS = 5 * 60_000;

export function bookLocale(book: DeskBook): "en" | "pl" {
  return book.locale === "pl" ? "pl" : "en";
}

export function shouldAwayCouncil(book: DeskBook, now: number): boolean {
  if (book.mode === "live") return false;
  if (now < (book.clientUntil || 0)) return false;
  if (liveProposal(book.proposal, now)) return false;
  const last = book.lastCouncilAt ?? 0;
  if (last && now - last < AWAY_COUNCIL_MS) return false;
  return true;
}

export function snapshotFromBook(
  book: DeskBook,
  quotes: LiveQuote[],
  headlines: Headline[],
  macro: MacroTape | null,
): MarketSnapshot | null {
  const assets: Record<string, MarketAsset> = {};
  const tickers: MarketSnapshot["tickers"] = [];
  for (const q of quotes) {
    const u = UNIVERSE.find((x) => x.symbol === q.symbol);
    if (!u || !(q.price > 0)) continue;
    const series = q.series.map((b) => b.px);
    const mean = sma(series, 20);
    assets[q.symbol] = {
      symbol: q.symbol,
      name: u.name,
      price: q.livePx ?? q.price,
      open: q.open || q.prevClose || q.price,
      high: q.high || q.price,
      low: q.low || q.price,
      series: q.series,
      vol: u.vol,
      beta: u.beta,
      livePx: q.livePx,
      liveCoin: q.liveCoin,
      spotPx: q.spotPx ?? q.price,
      tape: q.tape ?? "yahoo",
    };
    tickers.push({
      symbol: q.symbol,
      name: u.name,
      price: q.livePx ?? q.price,
      open: q.open || q.prevClose || q.price,
      changePct: changePct(q.livePx ?? q.price, q.open || q.prevClose || q.price),
      high: q.high || q.price,
      low: q.low || q.price,
      rsi: rsi(series),
      vsSma: mean ? (((q.livePx ?? q.price) - mean) / mean) * 100 : 0,
      livePx: q.livePx,
      liveBps: null,
      ...tickerSetupFields(q.series, q.livePx ?? q.price),
      rvol: relativeVolume(q.series),
    });
  }
  if (!tickers.length) return null;
  const eq = equityOf(book.cash, book.positions, assets);
  const spy = assets.SPY;
  const spyChg =
    spy?.price && spy.open ? changePct(spy.price, spy.open) : (macro?.equityPct ?? null);
  return {
    tickers,
    headlines: headlines.slice(0, 6).map((h) => ({ text: h.text, symbol: h.symbol, shock: h.shock })),
    book: {
      cash: book.cash,
      equity: eq,
      dayPnlPct: book.startingEquity ? ((eq - book.startingEquity) / book.startingEquity) * 100 : 0,
      positions: book.positions.map((p) => {
        const px = assets[p.symbol]?.price || p.avg;
        const pnlPct = p.avg ? ((px - p.avg) / p.avg) * 100 * Math.sign(p.qty || 1) : 0;
        return { symbol: p.symbol, qty: p.qty, avg: p.avg, pnlPct };
      }),
    },
    macro: withEquityPct(macro, spyChg),
    scorecard: compactScorecard(recordsFrom(book.agentCalls ?? []), book.agentCalls ?? []),
  };
}

function speak(book: DeskBook, item: Omit<TapeItem, "id">): DeskBook {
  const row: TapeItem = {
    id: `t-${item.ts.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ...item,
  };
  return { ...book, tape: [row, ...book.tape].slice(0, 120) };
}

export function applyCouncilBook(
  book: DeskBook,
  result: CouncilResult,
  now: number,
  source: "ai" | "local",
): DeskBook {
  const locale = bookLocale(book);
  const agents = AGENTS.map((p) => {
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
  let next: DeskBook = {
    ...book,
    lastCouncil: result,
    lastCouncilAt: now,
    proposal: book.mode === "live" ? null : stampProposal(result.order, now),
    agents,
    lastTickAt: now,
  };
  next = speak(next, {
    kind: "system",
    ts: now,
    text: t(source === "ai" ? "tape.councilAi" : "tape.councilLocal", { summary: result.summary }, locale),
  });
  for (const a of result.agents) {
    next = speak(next, {
      kind: "agent",
      ts: now,
      agentId: a.id,
      symbol: a.symbol ?? undefined,
      text: a.thesis,
    });
  }
  return next;
}

export async function conveneAway(
  book: DeskBook,
  quotes: LiveQuote[],
  headlines: Headline[],
  macro: MacroTape | null,
  now: number,
): Promise<{ book: DeskBook; proposal: ProposedOrder | null; notified: boolean }> {
  const snap = snapshotFromBook(book, quotes, headlines, macro);
  if (!snap) return { book: { ...book, lastTickAt: now }, proposal: null, notified: false };
  const locale = bookLocale(book);
  const seenNews = book.tape
    .filter((row) => row.kind === "news" || row.agentId === "damian")
    .map((row) => row.text);
  let source: "ai" | "local" = "ai";
  let result: CouncilResult;
  try {
    const { runCouncilSession } = await import("@/lib/ai/council");
    const res = await runCouncilSession({
      snap,
      last: book.lastCouncil,
      selected: book.selected,
      locale,
    });
    if (res.ok) result = res.result;
    else {
      result = localCouncil(snap, book.lastCouncil, locale, seenNews);
      source = "local";
    }
  } catch {
    result = localCouncil(snap, book.lastCouncil, locale, seenNews);
    source = "local";
  }
  const next = applyCouncilBook(book, result, now, source);
  const proposal = next.proposal && !book.autopilot ? next.proposal : null;
  return { book: next, proposal, notified: Boolean(proposal) };
}
