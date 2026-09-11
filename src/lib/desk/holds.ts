import type { Fill, MarketAsset, Position, TickBar } from "@/lib/types";
import { changePct } from "@/lib/market/engine";

/** Default: about one session, not a hard close-at-bell. */
export const SESSION_HOLD_MS = 6 * 60 * 60 * 1000;
/** Only names still working with the trend. */
export const PROMISING_HOLD_MS = 3 * 24 * 60 * 60 * 1000;
export const MAX_ADDS_PER_DAY = 2;

export function localDayStart(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isAddOn(
  positions: Position[],
  symbol: string,
  side: "buy" | "sell",
) {
  const pos = positions.find((p) => p.symbol === symbol);
  if (!pos || Math.abs(pos.qty) < 1e-8) return false;
  const signed = side === "buy" ? 1 : -1;
  return Math.sign(pos.qty) === signed;
}

export function isReduce(
  positions: Position[],
  symbol: string,
  side: "buy" | "sell",
) {
  const pos = positions.find((p) => p.symbol === symbol);
  if (!pos || Math.abs(pos.qty) < 1e-8) return false;
  const signed = side === "buy" ? 1 : -1;
  return Math.sign(pos.qty) !== signed;
}

/** Walk fills oldest-first; an add is a same-side increase of an already-open name. */
export function addCountToday(fills: Fill[], now: number) {
  const start = localDayStart(now);
  const qty = new Map<string, number>();
  const ordered = [...fills].sort((a, b) => a.ts - b.ts);
  let adds = 0;
  for (const f of ordered) {
    const signed = f.side === "buy" ? f.qty : -f.qty;
    const prev = qty.get(f.symbol) ?? 0;
    if (Math.abs(prev) > 1e-8 && Math.sign(prev) === Math.sign(signed) && f.ts >= start) adds += 1;
    qty.set(f.symbol, prev + signed);
  }
  return adds;
}

export function stampOpened(prev: Position | undefined, next: Position[], fill: Fill): Position[] {
  return next.map((p) => {
    if (p.symbol !== fill.symbol) return p;
    const flip = !prev || Math.abs(prev.qty) < 1e-8 || Math.sign(prev.qty) !== Math.sign(p.qty);
    return {
      ...p,
      openedAt: flip ? fill.ts : (prev?.openedAt ?? fill.ts),
      entryNote: flip ? fill.note : (prev?.entryNote ?? fill.note),
      teamLock: flip ? fill.source === "manual" : Boolean(prev?.teamLock),
    };
  });
}

export function inferManualOpen(fills: Fill[], symbol: string) {
  const ordered = [...fills].filter((f) => f.symbol === symbol).sort((a, b) => a.ts - b.ts);
  let qty = 0;
  let source: Fill["source"] = "council";
  for (const f of ordered) {
    const signed = f.side === "buy" ? f.qty : -f.qty;
    const prev = qty;
    qty += signed;
    if (Math.abs(prev) < 1e-8 && Math.abs(qty) > 1e-8) source = f.source;
  }
  return source === "manual";
}

export function withTeamLocks(positions: Position[], fills: Fill[]): Position[] {
  return positions.map((p) => ({
    ...p,
    teamLock: typeof p.teamLock === "boolean" ? p.teamLock : inferManualOpen(fills, p.symbol),
  }));
}

export function teamBlocks(positions: Position[], symbol: string) {
  const pos = positions.find((p) => p.symbol === symbol);
  if (!pos || Math.abs(pos.qty) < 1e-8) return false;
  return Boolean(pos.teamLock);
}

export function promisingHold(pos: Position, price: number, vsSma: number, dayChg: number) {
  if (!(price > 0) || !(pos.avg > 0)) return false;
  const pnl = ((price - pos.avg) / pos.avg) * 100 * Math.sign(pos.qty || 1);
  if (pnl < 1.2) return false;
  return pos.qty > 0 ? vsSma > 0 || dayChg > 0.2 : vsSma < 0 || dayChg < -0.2;
}

export function holdExpired(
  pos: Position,
  now: number,
  price: number,
  vsSma: number,
  dayChg: number,
) {
  const age = now - (pos.openedAt ?? now);
  if (promisingHold(pos, price, vsSma, dayChg)) return age >= PROMISING_HOLD_MS;
  return age >= SESSION_HOLD_MS;
}

export function pullbackInTrend(side: "buy" | "sell", vsSma: number, rsi: number, dayChg: number) {
  if (side === "buy") return vsSma > 0.05 && rsi >= 38 && rsi <= 55 && dayChg > -0.5;
  return vsSma < -0.05 && rsi >= 45 && rsi <= 62 && dayChg < 0.5;
}

export function viewOf(asset: MarketAsset | undefined) {
  if (!asset || !(asset.price > 0)) return null;
  const px = asset.livePx && asset.livePx > 0 ? asset.livePx : asset.price;
  const mean = sma20(asset.series);
  const vsSma = mean ? ((px - mean) / mean) * 100 : 0;
  return { px, vsSma, dayChg: changePct(px, asset.open) };
}

function sma20(series: TickBar[]) {
  if (series.length < 2) return 0;
  const slice = series.slice(-20);
  return slice.reduce((s, b) => s + b.px, 0) / slice.length;
}
