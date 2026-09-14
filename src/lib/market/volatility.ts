import type { TickBar } from "@/lib/types";

/** Classic Wilder period. One canonical implementation for the whole desk. */
export const WILDER_ATR_PERIOD = 14;
export const ATR_METHOD = "wilder" as const;

/**
 * True Range.
 * TR = max(high − low, |high − prevClose|, |low − prevClose|)
 * Returns null on non-finite or inverted bars — never fabricates a range.
 */
export function trueRange(high: number, low: number, prevClose: number): number | null {
  if (![high, low, prevClose].every((x) => typeof x === "number" && Number.isFinite(x))) return null;
  if (high < low) return null;
  const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
  return Number.isFinite(tr) && tr >= 0 ? tr : null;
}

function barHigh(b: TickBar): number {
  return typeof b.h === "number" && Number.isFinite(b.h) ? b.h : b.px;
}

function barLow(b: TickBar): number {
  return typeof b.l === "number" && Number.isFinite(b.l) ? b.l : b.px;
}

/**
 * Wilder ATR on a close-stamped OHLC series (`TickBar.px` = close).
 * Seed = SMA of the first `period` true ranges, then
 * ATR_t = (ATR_{t-1} * (period − 1) + TR_t) / period.
 * Needs period + 1 bars (one previous close). Short / dirty series → null.
 */
export function wilderAtr(bars: TickBar[] | null | undefined, period = WILDER_ATR_PERIOD): number | null {
  if (!bars || !Number.isInteger(period) || period < 1) return null;
  if (bars.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < bars.length; i++) {
    const prev = bars[i - 1]!;
    const cur = bars[i]!;
    if (!Number.isFinite(prev.px) || !Number.isFinite(cur.px)) return null;
    const tr = trueRange(barHigh(cur), barLow(cur), prev.px);
    if (tr == null) return null;
    trs.push(tr);
  }
  if (trs.length < period) return null;
  let atr = 0;
  for (let i = 0; i < period; i++) atr += trs[i]!;
  atr /= period;
  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]!) / period;
  }
  if (!(atr > 0) || !Number.isFinite(atr)) return null;
  return atr;
}

/** ATR as a percent of last close. Null when ATR or close is missing / non-positive. */
export function atrAsPct(atr: number | null | undefined, close: number | null | undefined): number | null {
  if (atr == null || close == null) return null;
  if (!(atr > 0) || !(close > 0) || !Number.isFinite(atr) || !Number.isFinite(close)) return null;
  const pct = (atr / close) * 100;
  return Number.isFinite(pct) ? pct : null;
}

/**
 * |priceMove| / ATR. Null when ATR is missing, zero, or the move is non-finite.
 * Never returns NaN / Infinity.
 */
export function moveOverAtr(priceMove: number, atr: number | null | undefined): number | null {
  if (atr == null || !(atr > 0) || !Number.isFinite(atr) || !Number.isFinite(priceMove)) return null;
  const n = Math.abs(priceMove) / atr;
  return Number.isFinite(n) ? n : null;
}

/** Signed Δprice / ATR. Null on missing/zero ATR. Never NaN / Infinity. */
export function signedMoveOverAtr(priceMove: number, atr: number | null | undefined): number | null {
  if (atr == null || !(atr > 0) || !Number.isFinite(atr) || !Number.isFinite(priceMove)) return null;
  const n = priceMove / atr;
  return Number.isFinite(n) ? n : null;
}

/** Last close-to-close of the series, or null. */
export function lastCloseMove(bars: TickBar[] | null | undefined): number | null {
  if (!bars || bars.length < 2) return null;
  const last = bars[bars.length - 1]!.px;
  const prev = bars[bars.length - 2]!.px;
  if (!Number.isFinite(last) || !Number.isFinite(prev)) return null;
  return last - prev;
}

export type VolatilityFeatures = {
  method: "wilder";
  period: number;
  tf: "15m";
  atr: number | null;
  atrPct: number | null;
  normalizedMove: number | null;
  /** Δclose / ATR. Signed. Null when ATR is missing. */
  signedMove: number | null;
};

export function emptyVolatilityFeatures(): VolatilityFeatures {
  return {
    method: ATR_METHOD,
    period: WILDER_ATR_PERIOD,
    tf: "15m",
    atr: null,
    atrPct: null,
    normalizedMove: null,
    signedMove: null,
  };
}

/** 15m Wilder ATR-14 + |last Δclose|/ATR and signed Δclose/ATR. Nulls when the series is too short. */
export function volatilityFeatures(bars: TickBar[] | null | undefined): VolatilityFeatures {
  const base = emptyVolatilityFeatures();
  if (!bars) return base;
  const atr = wilderAtr(bars, WILDER_ATR_PERIOD);
  const close = bars.length ? bars[bars.length - 1]!.px : null;
  const move = lastCloseMove(bars);
  return {
    ...base,
    atr,
    atrPct: atrAsPct(atr, close),
    normalizedMove: move == null ? null : moveOverAtr(move, atr),
    signedMove: move == null ? null : signedMoveOverAtr(move, atr),
  };
}
