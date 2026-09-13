import { AGENT_BY_ID } from "@/lib/agents/personas";
import { looksLikeReflection } from "@/lib/agents/reflect";
import { getLocale, type Locale } from "@/lib/i18n";
import { assetLabel } from "@/lib/i18n/labels";
import { STARTING_CASH } from "@/lib/market/universe";
import type {
  ClosedTrade,
  CouncilResult,
  Fill,
  MarketAsset,
  PeriodAnchors,
  Position,
} from "@/lib/types";

export function positionCapital(p: Position, mark: number) {
  return Math.abs(p.qty) * p.avg + (mark - p.avg) * p.qty;
}

export function equityOf(
  cash: number,
  positions: Position[],
  assets: Record<string, MarketAsset>,
) {
  return (
    cash +
    positions.reduce((sum, p) => {
      const mark = assets[p.symbol]?.price || p.avg;
      return sum + positionCapital(p, mark);
    }, 0)
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function periodKeys(d = new Date()) {
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const utc = new Date(Date.UTC(y, d.getMonth(), d.getDate()));
  const dow = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((+utc - +yearStart) / 86400000 + 1) / 7);
  return {
    day: `${y}-${m}-${day}`,
    week: `${utc.getUTCFullYear()}-W${pad(week)}`,
    month: `${y}-${m}`,
    year: `${y}`,
  };
}

export function defaultAnchors(equity = STARTING_CASH): PeriodAnchors {
  const keys = periodKeys();
  return {
    day: { key: keys.day, equity },
    week: { key: keys.week, equity },
    month: { key: keys.month, equity },
    year: { key: keys.year, equity },
  };
}

export function rollAnchors(anchors: PeriodAnchors | undefined, equity: number): PeriodAnchors {
  const keys = periodKeys();
  const base = anchors ?? defaultAnchors(equity);
  const next = { ...base };
  (["day", "week", "month", "year"] as const).forEach((k) => {
    if (!next[k] || next[k].key !== keys[k]) {
      next[k] = { key: keys[k], equity };
    }
  });
  return next;
}

export function closedFromFill(existing: Position | undefined, fill: Fill): ClosedTrade | null {
  if (!existing || existing.qty === 0) return null;
  const signed = fill.side === "buy" ? fill.qty : -fill.qty;
  if (Math.sign(existing.qty) === Math.sign(signed)) return null;
  const closedQty = Math.min(Math.abs(existing.qty), fill.qty);
  const realized = (fill.price - existing.avg) * closedQty * Math.sign(existing.qty);
  const share = closedQty / Math.abs(existing.qty);
  const fees = (existing.fees ?? 0) * share + (fill.fee ?? 0);
  const pnl = realized - fees;
  const side = existing.qty > 0 ? "long" : "short";
  const pnlPct = existing.avg ? (pnl / (existing.avg * closedQty)) * 100 : 0;
  return {
    id: fill.id,
    ts: fill.ts,
    symbol: fill.symbol,
    pnl,
    side,
    qty: closedQty,
    entry: existing.avg,
    exit: fill.price,
    openedAt: existing.openedAt,
    pnlPct,
    source: fill.source,
    entryNote: existing.entryNote,
    closeNote: fill.note,
    fees,
  };
}

export function humanCloseNote(row: ClosedTrade, locale: Locale = "pl"): string {
  const pl = locale === "pl";
  const note = (row.closeNote ?? "").trim();
  const src = row.source;

  if (
    note === "close.hyperliquid" ||
    /hyperliquid/i.test(note) ||
    /Closed on Hyperliquid/i.test(note) ||
    /Zamknięcie na Hyperliquid/i.test(note)
  ) {
    return pl
      ? "Zamknięcie na Hyperliquid — nie z pulpitu demo."
      : "Closed on Hyperliquid — not from the demo desk.";
  }
  if (
    src === "manual" ||
    /^close$/i.test(note) ||
    /^ręcznie$/i.test(note) ||
    note === "close.manual" ||
    /^You closed this by hand/i.test(note) ||
    /^Zamknąłeś pozycję ręcznie/i.test(note)
  ) {
    return pl ? "Zamknąłeś pozycję ręcznie — to nie była decyzja rady." : "You closed this by hand — not the floor.";
  }
  if (
    /partial close|ręcznie \(część\)|close.manualPartial/i.test(note) ||
    /You closed part of the trade by hand/i.test(note)
  ) {
    return pl
      ? "Zamknąłeś część pozycji ręcznie. Reszta zostaje."
      : "You closed part of the trade by hand. The rest stays on.";
  }
  if (
    note === "close.timeSession" ||
    note === "Time stop" ||
    /time stop — session/i.test(note) ||
    /A default trade is one session/i.test(note) ||
    /Zwykły trade trzymamy jak jedną sesję/i.test(note)
  ) {
    return pl
      ? "Czas minął. Zwykły trade trzymamy jak jedną sesję (kilka godzin), a tu nie było powodu zostawać dłużej."
      : "Time was up. A default trade is one session (a few hours), and there was no reason to stay longer.";
  }
  if (
    note === "close.timePromising" ||
    /time stop — stretched/i.test(note) ||
    /let it run a few days/i.test(note) ||
    /trzymaliśmy dłużej \(do kilku dni\)/i.test(note)
  ) {
    return pl
      ? "Czas minął. Szło z nami, więc trzymaliśmy dłużej (do kilku dni), ale i ten limit się skończył."
      : "Time was up. It was working so we let it run a few days, then flattened.";
  }
  if (
    note === "close.stopLoss" ||
    /^stop loss$/i.test(note)
  ) {
    return pl ? "Zadziałał stop loss — pozycja zamknięta na ustawionym poziomie." : "Stop loss hit — flattened at the level you set.";
  }
  if (
    note === "close.takeProfit" ||
    /^take profit$/i.test(note)
  ) {
    return pl ? "Zadziałał take profit — pozycja zamknięta na ustawionym poziomie." : "Take profit hit — flattened at the level you set.";
  }
  if (
    note === "close.contrary" ||
    /contrary signal/i.test(note) ||
    /przeciwny sygnał/i.test(note)
  ) {
    return pl
      ? "Rada zdjęła pozycję, bo przyszedł przeciwny sygnał — to nie było nowe otwarcie."
      : "The floor flattened on a contrary signal — not a new entry.";
  }
  if (/cut|zdejmuje|stall|stanę/i.test(note) && !/Time was up/i.test(note)) {
    return pl
      ? `Rada zdjęła pozycję, bo ruch się skończył.${note.length > 12 && /[ąćęłńóśźż]/i.test(note) ? ` ${note}` : ""}`
      : note;
  }
  if (/daje \d|sizes \d|clip od pogody|% kapitału na |quorum |limit Kaia/i.test(note)) {
    return pl
      ? "Rada zamknęła pozycję (przeciwny sygnał). Notatka z otwarcia nie dotyczy zejścia."
      : "The floor closed this (contrary signal). The entry note does not explain the exit.";
  }
  if (src === "council" || src === "autopilot") {
    if (note.length > 12) return polishDeskProse(note, locale);
    return pl ? "Autopilot zamknął pozycję na sygnał rady." : "Autopilot closed on a floor signal.";
  }
  return polishDeskProse(note, locale) || (pl ? "Brak uzasadnienia." : "No close note.");
}

export function polishDeskProse(raw: string, locale: Locale): string {
  if (!raw) return raw;
  if (locale !== "pl") {
    return raw
      .replace(/\bclip od pogody Damiana\b/gi, "size from Damian's weather")
      .replace(/\bZwiad\s+/gi, "Direction: ")
      .replace(/\bZłoto\b/g, "Gold")
      .replace(/\bSrebro\b/g, "Silver")
      .replace(/\bzłoto\b/g, "gold")
      .replace(/\bsrebro\b/g, "silver")
      .replace(/\bGotówka\b/g, "Cash")
      .replace(/\bręcznie\b/gi, "by hand")
      .replace(/\bNarada\b/g, "Convene");
  }
  return raw
    .replace(/\bclip od pogody Damiana\b/gi, "wielkość od pogody Damiana")
    .replace(/\bClip from Damian's weather was fine\b/gi, "Wielkość od pogody Damiana była w porządku")
    .replace(/\bClip from Damian's weather\b/gi, "wielkość od pogody Damiana")
    .replace(/\bI size 2–6% from Damian's weather\b/gi, "Wielkość 2–6% od pogody Damiana")
    .replace(/\bWeather didn't fight this clip\b/gi, "Pogoda nie biła się z tą nogą")
    .replace(/\bTape\b/g, "Notowania")
    .replace(/\bZwiad\s+vesper\+kai\b/gi, "Kierunek: Vesper i Kai")
    .replace(/\bZwiad\s+/gi, "Kierunek: ")
    .replace(/Limit Kaia na końcu/gi, "Kai stawia limit na końcu")
    .replace(/\btoo few closed calls to score\b/gi, "za mało zamkniętych, żeby ocenić")
    .replace(/\bpaid the trend\b/gi, "zapłaciło za trend")
    .replace(/\bNot my fade\b/gi, "Nie moje odbicie")
    .replace(/\bI didn't set a limit on\b/gi, "Nie stawiałem limitu na")
    .replace(/\bsitting out was correct\b/gi, "czekanie było w porządku")
    .replace(/\bI keep this 2–6% band\b/gi, "Zostaję przy 2–6%")
    .replace(/\bI keep riding names that still expand vs the 20-SMA\b/gi, "Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej")
    .replace(/\bClosed \+/g, "Zamknięte +")
    .replace(/\bround-trip\b/gi, "otwarcie i zamknięcie")
    .replace(/\bSilver\b/g, "Srebro")
    .replace(/\bGold\b/g, "Złoto")
    .replace(/\bSILVER\b/g, "srebro")
    .replace(/\bGOLD\b/g, "złoto")
    .replace(/\bclip\b/gi, "noga");
}

export function humanEntryNote(note: string | undefined, locale: Locale = "pl"): string {
  const raw = (note ?? "").trim();
  if (!raw) return locale === "pl" ? "Brak uzasadnienia." : "No entry note.";
  return polishDeskProse(raw, locale);
}

export function decorateClosed(
  closed: ClosedTrade,
  lastCouncil: CouncilResult | null | undefined,
  fill: Fill,
  priorFills: Fill[] = [],
  locale: Locale = getLocale(),
): ClosedTrade {
  const original = (lastCouncil?.agents ?? [])
    .filter((a) => a.thesis)
    .map((a) => ({ id: a.id, vote: a.vote, thesis: a.thesis, symbol: a.symbol }));
  const agents = original.length ? original : closed.agents;
  const wantSide = closed.side === "short" ? "sell" : "buy";
  const openFill = priorFills
    .filter((f) => f.symbol === fill.symbol && f.side === wantSide && f.ts < fill.ts)
    .at(-1);
  const withAgents = {
    ...closed,
    source: closed.source ?? fill.source,
    openedAt: closed.openedAt ?? openFill?.ts,
    closeNote: fill.note ?? closed.closeNote,
    agents,
    entryNote: closed.entryNote ?? openFill?.note,
  };
  return {
    ...withAgents,
    closeNote: withAgents.closeNote,
    analysis: explainTrade(withAgents, locale),
    agents,
  };
}

export function explainTrade(row: ClosedTrade, locale: Locale = "pl"): string {
  const pl = locale === "pl";
  const name = assetLabel(row.symbol, locale);
  const want = row.side === "short" ? "sell" : "buy";
  const dir = row.side === "short" ? (pl ? "sprzedaż" : "a short") : pl ? "kupno" : "a long";
  const voters = (row.agents ?? []).filter(
    (a) => a.vote === want && !looksLikeReflection(a.thesis ?? ""),
  );
  if (!voters.length) {
    const pnl =
      row.pnlPct != null ? `${row.pnlPct >= 0 ? "+" : ""}${row.pnlPct.toFixed(2)}%` : "";
    return pl
      ? `Pozycja ${dir} ${name}${pnl ? ` (${pnl})` : ""}. Rada nie zapisała głosów za tym kierunkiem — szczegóły są w uzasadnieniu wejścia.`
      : `${dir[0].toUpperCase()}${dir.slice(1)} ${name}${pnl ? ` (${pnl})` : ""}. No recorded votes for this side — see the entry note.`;
  }
  const head = pl
    ? `Rada poszła w ${dir} ${name}, ponieważ:`
    : `The desk went ${dir} ${name} because:`;
  const lines = voters.map((a) => {
    const who = AGENT_BY_ID[a.id]?.name ?? a.id;
    return `• ${who}: ${polishDeskProse(a.thesis, locale)}`;
  });
  return [head, ...lines].join("\n");
}

export type AllocationKind = "cash" | "long" | "short";

export type AllocationSlice = {
  name: string;
  value: number;
  pct: number;
  kind: AllocationKind;
};

export type PortfolioStats = {
  equity: number;
  cash: number;
  netCash: number;
  longMv: number;
  shortMv: number;
  floating: number;
  realized: number;
  total: number;
  totalPct: number;
  winrate: number;
  wins: number;
  trades: number;
  openCount: number;
  day: number;
  dayPct: number;
  week: number;
  weekPct: number;
  month: number;
  monthPct: number;
  year: number;
  yearPct: number;
  slices: AllocationSlice[];
  exposures: AllocationSlice[];
};

function pctOf(delta: number, base: number) {
  if (!base) return 0;
  return (delta / base) * 100;
}

function withPercents(slices: Omit<AllocationSlice, "pct">[], total: number): AllocationSlice[] {
  if (total <= 0) return [];
  const tenths = slices.map((s) => Math.floor((s.value / total) * 1000));
  let leftover = 1000 - tenths.reduce((a, b) => a + b, 0);
  const order = slices
    .map((s, i) => ({ i, frac: (s.value / total) * 1000 - tenths[i]! }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < leftover; k++) {
    const idx = order[k % order.length]?.i;
    if (idx === undefined) break;
    tenths[idx] += 1;
  }
  return slices.map((s, i) => ({ ...s, pct: tenths[i]! / 10 }));
}

export function portfolioStats(
  cash: number,
  positions: Position[],
  assets: Record<string, MarketAsset>,
  closedTrades: ClosedTrade[],
  anchors: PeriodAnchors,
  startingEquity: number,
): PortfolioStats {
  const equity = equityOf(cash, positions, assets);
  const floating = positions.reduce((sum, p) => {
    const px = assets[p.symbol]?.price || p.avg;
    return sum + (px - p.avg) * p.qty;
  }, 0);
  const realized = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const total = equity - startingEquity;
  const wins = closedTrades.filter((t) => t.pnl > 0).length;
  const trades = closedTrades.length;
  const day = equity - anchors.day.equity;
  const week = equity - anchors.week.equity;
  const month = equity - anchors.month.equity;
  const year = equity - anchors.year.equity;

  const longs: Omit<AllocationSlice, "pct">[] = [];
  const shorts: Omit<AllocationSlice, "pct">[] = [];
  let longMv = 0;
  let shortMv = 0;
  for (const p of positions) {
    const px = assets[p.symbol]?.price || p.avg;
    const value = Math.abs(p.qty * px);
    if (value < 0.5) continue;
    if (p.qty >= 0) {
      longMv += value;
      longs.push({ name: p.symbol, value, kind: "long" });
    } else {
      shortMv += value;
      shorts.push({ name: p.symbol, value, kind: "short" });
    }
  }

  const freeCash = Math.max(cash, 0);
  const pieParts: Omit<AllocationSlice, "pct">[] = [
    ...(freeCash > 0.5 ? [{ name: "Cash", value: freeCash, kind: "cash" as const }] : []),
    ...longs,
    ...shorts,
  ];
  const pieTotal = pieParts.reduce((s, x) => s + x.value, 0);
  const slices = withPercents(pieParts, pieTotal);

  return {
    equity,
    cash,
    netCash: cash,
    longMv,
    shortMv,
    floating,
    realized,
    total,
    totalPct: pctOf(total, startingEquity),
    winrate: trades ? (wins / trades) * 100 : 0,
    wins,
    trades,
    openCount: positions.length,
    day,
    dayPct: pctOf(day, anchors.day.equity),
    week,
    weekPct: pctOf(week, anchors.week.equity),
    month,
    monthPct: pctOf(month, anchors.month.equity),
    year,
    yearPct: pctOf(year, anchors.year.equity),
    slices,
    exposures: [],
  };
}
