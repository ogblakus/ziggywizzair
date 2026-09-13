import { closedFromFill, decorateClosed, defaultAnchors, equityOf, rollAnchors } from "@/lib/portfolio";
import { changePct, sma } from "@/lib/market/engine";
import { isLot, STARTING_CASH, UNIVERSE } from "@/lib/market/universe";
import { withLiveProposal } from "@/lib/desk/proposal";
import type { LiveQuote } from "@/lib/market/quotes";
import type {
  AgentCall,
  AgentSpeech,
  ClosedTrade,
  CouncilResult,
  Fill,
  LastAsk,
  MarketAsset,
  PeriodAnchors,
  Position,
  ProposedOrder,
  TapeItem,
} from "@/lib/types";
import { AGENTS } from "@/lib/agents/personas";
import { closeCallsFor, openCall, proposerFrom } from "@/lib/agents/scorecard";
import { addCountToday, holdExpired, isAddOn, MAX_ADDS_PER_DAY, promisingHold, stampOpened, teamBlocks } from "@/lib/desk/holds";
import { hitStop } from "@/lib/desk/stops";
import { hlFeeUsd, hlRoundTripPct, type FeeKind } from "@/lib/desk/fees";
import { t } from "@/lib/i18n/locale";
import { tapeFillText } from "@/lib/i18n/labels";
import { DEFAULT_ALERT_PREFS, type AlertPrefs } from "@/lib/desk/alert-prefs";

export type DeskBook = {
  cash: number;
  positions: Position[];
  fills: Fill[];
  closedTrades: ClosedTrade[];
  autopilot: boolean;
  lastCouncil: CouncilResult | null;
  lastAsk: LastAsk | null;
  agents: AgentSpeech[];
  startingEquity: number;
  periodAnchors: PeriodAnchors;
  tape: TapeItem[];
  proposal: ProposedOrder | null;
  working: ProposedOrder | null;
  selected: string;
  lastAutoAt: number;
  lastTickAt: number;
  fillSeq: number;
  clientUntil: number;
  deskEpoch: number;
  agentCalls: AgentCall[];
  lastCouncilAt: number;
  locale: "en" | "pl";
  mode: "demo" | "live";
  alertPrefs: AlertPrefs;
};

export function idleAgents(): AgentSpeech[] {
  return AGENTS.map((a) => ({
    id: a.id,
    status: "idle" as const,
    thesis: a.mandate,
    vote: "hold" as const,
    symbol: null,
    conviction: 0,
  }));
}

export function emptyBook(now = Date.now()): DeskBook {
  return {
    cash: STARTING_CASH,
    positions: [],
    fills: [],
    closedTrades: [],
    autopilot: false,
    lastCouncil: null,
    lastAsk: null,
    agents: idleAgents(),
    startingEquity: STARTING_CASH,
    periodAnchors: defaultAnchors(STARTING_CASH),
    tape: [
      {
        id: "sys-open",
        ts: now,
        kind: "system",
        text: "Demo open. $100,000 virtual. Waiting on live prices.",
      },
    ],
    proposal: null,
    working: null,
    selected: "BTC",
    lastAutoAt: 0,
    lastTickAt: 0,
    fillSeq: 0,
    clientUntil: 0,
    deskEpoch: 0,
    agentCalls: [],
    lastCouncilAt: 0,
    locale: "en",
    mode: "demo",
    alertPrefs: { ...DEFAULT_ALERT_PREFS },
  };
}

export function applyFill(
  cash: number,
  positions: Position[],
  fill: Fill,
): { cash: number; positions: Position[] } {
  const signed = fill.side === "buy" ? fill.qty : -fill.qty;
  const fee = fill.fee ?? 0;
  const existing = positions.find((p) => p.symbol === fill.symbol);

  if (!existing || Math.abs(existing.qty) < 1e-8) {
    const rest = positions.filter((p) => p.symbol !== fill.symbol);
    return {
      cash: cash - Math.abs(signed) * fill.price - fee,
      positions: [...rest, { symbol: fill.symbol, qty: signed, avg: fill.price, fees: fee }],
    };
  }

  const oldQty = existing.qty;
  const newQty = oldQty + signed;

  if (Math.sign(oldQty) === Math.sign(signed)) {
    const absOld = Math.abs(oldQty);
    const absAdd = Math.abs(signed);
    const avg =
      absOld + absAdd === 0
        ? fill.price
        : (absOld * existing.avg + absAdd * fill.price) / (absOld + absAdd);
    return {
      cash: cash - absAdd * fill.price - fee,
      positions: positions.map((p) =>
        p.symbol === fill.symbol ? { ...p, qty: newQty, avg, fees: (p.fees ?? 0) + fee } : p,
      ),
    };
  }

  const closedQty = Math.min(Math.abs(oldQty), Math.abs(signed));
  const realized = (fill.price - existing.avg) * closedQty * Math.sign(oldQty);
  const share = closedQty / Math.abs(oldQty);
  const remainFees = (existing.fees ?? 0) * (1 - share);
  let nextCash = cash + closedQty * existing.avg + realized - fee;
  if (Math.abs(newQty) < 1e-8) {
    return {
      cash: nextCash,
      positions: positions.filter((p) => p.symbol !== fill.symbol),
    };
  }
  if (Math.sign(newQty) === Math.sign(oldQty)) {
    return {
      cash: nextCash,
      positions: positions.map((p) =>
        p.symbol === fill.symbol ? { ...p, qty: newQty, fees: remainFees } : p,
      ),
    };
  }
  nextCash -= Math.abs(newQty) * fill.price;
  return {
    cash: nextCash,
    positions: positions.map((p) =>
      p.symbol === fill.symbol
        ? { symbol: p.symbol, qty: newQty, avg: fill.price, fees: fee }
        : p,
    ),
  };
}

export function estimatedRoundTripFeePct(_symbol?: string, _live = false) {
  return hlRoundTripPct();
}

export function feeCapOk(symbol: string, qty: number, price: number, live = false) {
  if (!(Math.abs(qty * price) > 0)) return false;
  return estimatedRoundTripFeePct(symbol, live) <= 5.000000001;
}

export function notionalOk(
  cash: number,
  positions: Position[],
  assets: Record<string, MarketAsset>,
  symbol: string,
  side: "buy" | "sell",
  qty: number,
  price: number,
) {
  const eq = equityOf(cash, positions, assets);
  const nextQty = (positions.find((p) => p.symbol === symbol)?.qty ?? 0) + (side === "buy" ? qty : -qty);
  const nameNotional = Math.abs(nextQty * price);
  if (eq > 0 && nameNotional > eq * 0.5) return false;
  if (
    positions.filter((p) => p.symbol !== symbol).reduce((s, p) => s + Math.abs(p.qty * (assets[p.symbol]?.price || p.avg)), 0) +
      nameNotional >
    Math.max(eq, 1) * 2.2
  ) {
    return false;
  }
  if (!feeCapOk(symbol, qty, price)) return false;
  const fee = hlFeeUsd(qty, price, "taker");
  return (
    applyFill(cash, positions, {
      id: "probe",
      ts: 0,
      symbol,
      side,
      qty,
      price,
      source: "manual",
      fee,
      feeKind: "taker",
    }).cash >= -0.5
  );
}

function speak(book: DeskBook, item: Omit<TapeItem, "id" | "ts"> & { ts?: number }): DeskBook {
  const row: TapeItem = {
    id: `t-${(item.ts ?? Date.now()).toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ts: item.ts ?? Date.now(),
    kind: item.kind,
    text: item.text,
    agentId: item.agentId,
    symbol: item.symbol,
  };
  return { ...book, tape: [row, ...book.tape].slice(0, 120) };
}

export function commitFill(
  book: DeskBook,
  input: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    source: Fill["source"];
    note?: string;
    skipRisk?: boolean;
    feeKind?: FeeKind;
    ts: number;
    assets: Record<string, MarketAsset>;
  },
): { ok: true; book: DeskBook; fill: Fill } | { ok: false; error: string } {
  const sized = isLot(input.symbol) || input.skipRisk ? input.qty : Math.round(input.qty);
  if (!Number.isFinite(sized) || sized <= 0) return { ok: false, error: "Size the ticket." };
  if (
    (input.source === "council" || input.source === "autopilot") &&
    teamBlocks(book.positions, input.symbol)
  ) {
    return { ok: false, error: "Team locked out of this trade." };
  }
  const adding = isAddOn(book.positions, input.symbol, input.side);
  if (!input.skipRisk && adding && addCountToday(book.fills, input.ts) >= MAX_ADDS_PER_DAY) {
    return { ok: false, error: "Iris veto — two adds today." };
  }
  if (
    !input.skipRisk &&
    !notionalOk(book.cash, book.positions, input.assets, input.symbol, input.side, sized, input.price)
  ) {
    return { ok: false, error: "Iris veto — size or concentration." };
  }
  const fill: Fill = {
    id: `f-${input.ts.toString(36)}-${(book.fillSeq + 1).toString(36)}`,
    ts: input.ts,
    symbol: input.symbol,
    side: input.side,
    qty: sized,
    price: input.price,
    source: input.source,
    note: input.note,
    feeKind: input.feeKind ?? "taker",
    fee: hlFeeUsd(sized, input.price, input.feeKind ?? "taker"),
  };
  const next = applyFill(book.cash, book.positions, fill);
  const stamped = stampOpened(
    book.positions.find((p) => p.symbol === input.symbol),
    next.positions,
    fill,
  );
  if (!input.skipRisk && next.cash < -0.5) return { ok: false, error: "Iris veto — not enough cash." };
  const closed = closedFromFill(
    book.positions.find((p) => p.symbol === input.symbol),
    fill,
  );
  const decorated = closed ? decorateClosed(closed, book.lastCouncil, fill, book.fills, book.locale) : null;
  const closedTrades = decorated ? [decorated, ...book.closedTrades].slice(0, 200) : book.closedTrades;
  const eq = equityOf(next.cash, stamped, input.assets);
  const stillOpen = Math.abs(stamped.find((p) => p.symbol === input.symbol)?.qty ?? 0) > 1e-8;
  let out: DeskBook = {
    ...book,
    cash: next.cash,
    positions: stamped,
    fills: [fill, ...book.fills].slice(0, 80),
    closedTrades,
    fillSeq: book.fillSeq + 1,
    periodAnchors: rollAnchors(book.periodAnchors, eq),
    agentCalls: closeCallsFor(book.agentCalls ?? [], input.symbol, input.price, input.ts, stillOpen),
    proposal:
      book.proposal && book.proposal.symbol === input.symbol && book.proposal.side === input.side
        ? null
        : book.proposal,
  };
  out = speak(out, {
    kind: "fill",
    symbol: input.symbol,
    ts: input.ts,
    text: tapeFillText(fill, book.locale),
  });
  return { ok: true, book: out, fill };
}

export function expireHolds(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  if (!book.positions.length) return book;
  const assets: Record<string, MarketAsset> = {};
  const views = viewsAt(quotes, now);
  const bySym = new Map(views.map((v) => [v.symbol, v]));
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    assets[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: now, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: v.price,
      liveCoin: null,
      spotPx: null,
      tape: "hl",
    };
  }
  let next = book;
  for (const pos of book.positions) {
    const v = bySym.get(pos.symbol);
    if (!v) continue;
    if (pos.teamLock) continue;
    if (!holdExpired(pos, now, v.price, v.vsSma, v.changePct)) continue;
    const side = pos.qty > 0 ? "sell" : "buy";
    const note = promisingHold(pos, v.price, v.vsSma, v.changePct)
      ? "close.timePromising"
      : "close.timeSession";
    const filled = commitFill(next, {
      symbol: pos.symbol,
      side,
      qty: Math.abs(pos.qty),
      price: v.price,
      source: "council",
      note,
      skipRisk: true,
      ts: now,
      assets,
    });
    if (filled.ok) next = filled.book;
  }
  return next;
}

export function expireStops(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  if (!book.positions.length) return book;
  const views = viewsAt(quotes, now);
  const bySym = new Map(views.map((v) => [v.symbol, v]));
  const assets: Record<string, MarketAsset> = {};
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    assets[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: now, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: v.price,
      liveCoin: null,
      spotPx: null,
      tape: "hl",
    };
  }
  let next = book;
  for (const pos of [...next.positions]) {
    const v = bySym.get(pos.symbol);
    if (!v) continue;
    const hit = hitStop(pos, v.price);
    if (!hit) continue;
    const filled = commitFill(next, {
      symbol: pos.symbol,
      side: pos.qty > 0 ? "sell" : "buy",
      qty: Math.abs(pos.qty),
      price: v.price,
      source: "manual",
      note: hit === "sl" ? "close.stopLoss" : "close.takeProfit",
      skipRisk: true,
      ts: now,
      assets,
    });
    if (filled.ok) next = filled.book;
  }
  return next;
}

export function fillWorking(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  const w = book.working;
  if (!w?.limitPx) return book;
  const q = quotes.find((x) => x.symbol === w.symbol);
  const px = q?.livePx && q.livePx > 0 ? q.livePx : q?.price;
  if (!(px && px > 0)) return book;
  const hit = w.side === "buy" ? px <= w.limitPx : px >= w.limitPx;
  if (!hit) return book;
  const u = UNIVERSE.find((x) => x.symbol === w.symbol);
  const assets: Record<string, MarketAsset> = u
    ? {
        [w.symbol]: {
          symbol: w.symbol,
          name: u.name,
          price: px,
          open: px,
          high: px,
          low: px,
          series: [{ t: now, px }],
          vol: u.vol,
          beta: u.beta,
          livePx: px,
          liveCoin: null,
          spotPx: null,
          tape: "hl",
        },
      }
    : {};
  const filled = commitFill(book, {
    symbol: w.symbol,
    side: w.side,
    qty: w.qty,
    price: px,
    source: "council",
    note: w.rationale,
    feeKind: "maker",
    skipRisk: false,
    ts: now,
    assets,
  });
  if (!filled.ok) return book;
  return { ...filled.book, working: null };
}

type TickerView = {
  symbol: string;
  price: number;
  changePct: number;
  vsSma: number;
  vol: number;
};

function viewsAt(quotes: LiveQuote[], t: number): TickerView[] {
  return quotes.flatMap((q) => {
    const u = UNIVERSE.find((x) => x.symbol === q.symbol);
    if (!u) return [];
    const series = q.series.filter((b) => b.t <= t);
    const price = series.at(-1)?.px ?? q.price;
    if (!price) return [];
    const mean = sma(
      series.map((b) => b.px),
      20,
    );
    return [
      {
        symbol: q.symbol,
        price,
        changePct: changePct(price, q.prevClose || q.open || price),
        vsSma: mean ? ((price - mean) / mean) * 100 : 0,
        vol: u.vol,
      },
    ];
  });
}

function assetsFromViews(views: TickerView[]): Record<string, MarketAsset> {
  const out: Record<string, MarketAsset> = {};
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    out[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: 1, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: null,
      liveCoin: null,
      spotPx: null,
      tape: "yahoo",
    };
  }
  return out;
}

export function autopilotOnce(book: DeskBook, views: TickerView[], now: number): DeskBook {
  if (!book.autopilot) return { ...book, lastTickAt: now };
  if (now - book.lastAutoAt < 55_000) return { ...book, lastTickAt: now };
  const ticket = book.proposal ?? book.lastCouncil?.order ?? null;
  if (!ticket) return { ...book, lastTickAt: now };
  const row = views.find((t) => t.symbol === ticket.symbol);
  if (!row || !(row.price > 0)) return { ...book, lastTickAt: now };
  const existing = book.positions.find((p) => p.symbol === ticket.symbol);
  const open = existing && Math.abs(existing.qty) > 1e-8;
  if (open && existing.teamLock) return { ...book, lastAutoAt: now, lastTickAt: now };
  const reducing =
    open && ((existing.qty > 0 && ticket.side === "sell") || (existing.qty < 0 && ticket.side === "buy"));
  if (open && !reducing) return { ...book, lastAutoAt: now, lastTickAt: now };
  const note = reducing ? "close.contrary" : ticket.rationale;
  const assets = assetsFromViews(views);
  const price = row.price;
  const filled = commitFill(
    { ...book, lastAutoAt: now, lastTickAt: now },
    {
      symbol: ticket.symbol,
      side: ticket.side,
      qty: ticket.qty,
      price,
      source: "council",
      note,
      ts: now,
      assets,
    },
  );
  if (!filled.ok) return { ...book, lastAutoAt: now, lastTickAt: now };
  const who = proposerFrom(book.lastCouncil, ticket.symbol, ticket.side);
  if (!who) return filled.book;
  return {
    ...filled.book,
    agentCalls: [
      openCall({
        id: `c-${now.toString(36)}-${filled.book.fillSeq.toString(36)}`,
        ts: now,
        agentId: who,
        symbol: ticket.symbol,
        side: ticket.side,
        entry: price,
        qty: ticket.qty,
        fillId: filled.fill.id,
      }),
      ...(filled.book.agentCalls ?? []),
    ].slice(0, 80),
  };
}

export function catchUpBook(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  book = withLiveProposal(book, now);
  if (!quotes.length) return { ...book, lastTickAt: now };
  book = expireStops(book, quotes, now);
  book = expireHolds(book, quotes, now);
  book = fillWorking(book, quotes, now);
  if (!book.autopilot) return { ...book, lastTickAt: now };
  const since = Math.max(book.lastTickAt, book.lastAutoAt, 0);
  if (!since) return autopilotOnce(book, viewsAt(quotes, now), now);
  const elapsed = now - since;
  if (elapsed < 55_000) return autopilotOnce(book, viewsAt(quotes, now), now);

  const stamps = new Set<number>();
  for (const q of quotes) for (const b of q.series) if (b.t > since && b.t <= now) stamps.add(b.t);
  const times = [...stamps].sort((a, b) => a - b);
  const maxSteps = 16;
  const step = Math.max(1, Math.ceil(times.length / maxSteps));
  const picked = times.filter((_, i) => i % step === 0).slice(0, maxSteps);
  if (!picked.length) picked.push(now);

  let next = book;
  const beforeFills = book.fills.length;
  for (const t of picked) {
    next = autopilotOnce(next, viewsAt(quotes, t), t);
  }
  next = { ...next, lastTickAt: now };
  const away = elapsed >= 180_000;
  if (!away) return next;
  const added = next.fills.length - beforeFills;
  if (added > 0) {
    next = speak(next, {
      kind: "system",
      ts: now,
      text: t("tape.awayFills", { n: added }, book.locale),
    });
  } else {
    next = speak(next, {
      kind: "system",
      ts: now,
      text: t("tape.awayQuiet", undefined, book.locale),
    });
  }
  return next;
}

export function bookLooksLive(book: DeskBook | null | undefined) {
  if (!book) return false;
  return (
    book.fills.length > 0 ||
    book.positions.length > 0 ||
    Boolean(book.lastCouncil) ||
    Boolean(book.lastAsk)
  );
}

/** True when `a` should replace `b`. Empty never beats a live book. Reset wins via deskEpoch. */
export function preferBook(a: DeskBook, b: DeskBook) {
  const ae = a.deskEpoch ?? 0;
  const be = b.deskEpoch ?? 0;
  if (ae !== be) return ae > be;
  const aLive = bookLooksLive(a);
  const bLive = bookLooksLive(b);
  if (aLive && !bLive) return true;
  if (!aLive && bLive) return false;
  if (a.fills.length !== b.fills.length) return a.fills.length > b.fills.length;
  if (a.positions.length !== b.positions.length) return a.positions.length > b.positions.length;
  if (a.fillSeq !== b.fillSeq) return a.fillSeq > b.fillSeq;
  const aCouncil = a.lastCouncilAt ?? 0;
  const bCouncil = b.lastCouncilAt ?? 0;
  if (aCouncil !== bCouncil) return aCouncil > bCouncil;
  if (Boolean(a.proposal) !== Boolean(b.proposal)) return Boolean(a.proposal);
  return a.lastTickAt >= b.lastTickAt;
}

export function pickBook(a: DeskBook | null, b: DeskBook | null): DeskBook | null {
  if (!a) return b;
  if (!b) return a;
  return preferBook(a, b) ? a : b;
}

export function bookSame(a: DeskBook, b: DeskBook) {
  if (a.cash !== b.cash || a.autopilot !== b.autopilot || a.deskEpoch !== b.deskEpoch) return false;
  if (a.positions.length !== b.positions.length || a.fills.length !== b.fills.length) return false;
  if (a.fillSeq !== b.fillSeq) return false;
  if ((a.lastCouncilAt ?? 0) !== (b.lastCouncilAt ?? 0)) return false;
  if ((a.proposal?.symbol ?? "") !== (b.proposal?.symbol ?? "")) return false;
  if ((a.proposal?.side ?? "") !== (b.proposal?.side ?? "")) return false;
  for (let i = 0; i < a.positions.length; i++) {
    const x = a.positions[i]!;
    const y = b.positions[i]!;
    if (x.symbol !== y.symbol || x.qty !== y.qty || x.avg !== y.avg) return false;
  }
  return true;
}

export function isGhostAutopilotFill(fill: Fill): boolean {
  if (fill.source !== "autopilot") return false;
  const note = fill.note ?? "";
  return /one probe, no add|desk stayed live/i.test(note);
}

/** Drop leftover independent-autopilot probes (pre-council) and unwind cash/qty. */
export function scrubGhostAutopilot(book: DeskBook): DeskBook {
  const ghosts = book.fills.filter(isGhostAutopilotFill);
  if (!ghosts.length) return book;
  let cash = book.cash;
  let positions = book.positions.map((p) => ({ ...p }));
  for (const fill of ghosts) {
    const signed = fill.side === "buy" ? fill.qty : -fill.qty;
    cash += Math.abs(signed) * fill.price;
    const i = positions.findIndex((p) => p.symbol === fill.symbol);
    if (i < 0) continue;
    const pos = positions[i]!;
    const qty = pos.qty - signed;
    if (Math.abs(qty) < 1e-6) positions = positions.filter((_, j) => j !== i);
    else positions[i] = { ...pos, qty };
  }
  const ghostSym = new Set(ghosts.map((g) => g.symbol));
  const tape = book.tape.filter((row) => {
    if (row.kind === "fill" && row.symbol && ghostSym.has(row.symbol) && /Autopilot/i.test(row.text)) {
      return false;
    }
    if (/stary, samodzielny fill autopilota|leftover independent autopilot/i.test(row.text)) return false;
    if (/Autopilot · (one probe, no add|desk stayed live)/i.test(row.text)) return false;
    return true;
  });
  return { ...book, cash, positions, fills: book.fills.filter((f) => !isGhostAutopilotFill(f)), tape };
}
