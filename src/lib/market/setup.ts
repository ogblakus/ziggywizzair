import type { TickBar } from "@/lib/types";

export type CandleKind = "pullback" | "chase" | "none";
export type Fvg = { low: number; high: number };

export type CandleSetup = {
  kind: CandleKind;
  px: number | null;
  retrace: number | null;
  fvg: Fvg | null;
  wick: boolean;
};

function hi(b: TickBar) {
  return b.h ?? b.px;
}
function lo(b: TickBar) {
  return b.l ?? b.px;
}
function op(b: TickBar) {
  return b.o ?? b.px;
}

export function relativeVolume(series: TickBar[]): number | null {
  const vols = series.map((b) => b.v).filter((v): v is number => typeof v === "number" && v > 0);
  if (vols.length < 8) return null;
  const last = vols[vols.length - 1]!;
  const prior = vols.slice(0, -1);
  const avg = prior.reduce((s, x) => s + x, 0) / prior.length;
  if (!(avg > 0)) return null;
  return last / avg;
}

function fvgs(bars: TickBar[]): Array<Fvg & { kind: "bull" | "bear"; i: number }> {
  const out: Array<Fvg & { kind: "bull" | "bear"; i: number }> = [];
  for (let i = 0; i + 2 < bars.length; i++) {
    const a = bars[i]!;
    const c = bars[i + 2]!;
    if (lo(c) > hi(a) + 1e-9) out.push({ kind: "bull", low: hi(a), high: lo(c), i });
    if (hi(c) + 1e-9 < lo(a)) out.push({ kind: "bear", low: hi(c), high: lo(a), i });
  }
  return out;
}

function filled(gap: Fvg & { kind: "bull" | "bear"; i: number }, bars: TickBar[]) {
  const after = bars.slice(gap.i + 3);
  if (gap.kind === "bull") return after.some((b) => lo(b) <= gap.low);
  return after.some((b) => hi(b) >= gap.high);
}

function tagging(gap: Fvg, mark: number) {
  const w = Math.max(gap.high - gap.low, 1e-9);
  return mark >= gap.low - w * 0.12 && mark <= gap.high + w * 0.12;
}

function lastWick(bars: TickBar[], side: "buy" | "sell") {
  const b = bars[bars.length - 1];
  if (!b) return false;
  const range = hi(b) - lo(b);
  if (!(range > 0)) return false;
  const bodyLow = Math.min(op(b), b.px);
  const bodyHigh = Math.max(op(b), b.px);
  if (side === "buy") return (bodyLow - lo(b)) / range >= 0.38;
  return (hi(b) - bodyHigh) / range >= 0.38;
}

/**
 * Last 12×1m Hyperliquid candles.
 * Chase = sitting on the extreme (no entry).
 * Pullback = 18–62% off that extreme, or price tagging an unfilled 3-bar FVG.
 * Limit = FVG near edge if tagging, else a tick inside the pullback.
 */
export function candleSetup(series: TickBar[], mark: number, side: "buy" | "sell"): CandleSetup {
  const empty: CandleSetup = { kind: "none", px: null, retrace: null, fvg: null, wick: false };
  const bars = series.slice(-12);
  if (bars.length < 6 || !(mark > 0)) return empty;
  const his = bars.map(hi);
  const los = bars.map(lo);
  const rangeHi = Math.max(...his);
  const rangeLo = Math.min(...los);
  const range = rangeHi - rangeLo;
  if (!(range > 0)) return empty;
  const last = bars[bars.length - 1]!;
  const prev = bars[bars.length - 2]!;
  const wick = lastWick(bars, side);

  const gaps = fvgs(bars).filter((g) => !filled(g, bars));
  const want = side === "buy" ? "bull" : "bear";
  const liveGap = gaps.filter((g) => g.kind === want && tagging(g, mark)).at(-1) ?? null;
  const fvg = liveGap ? { low: liveGap.low, high: liveGap.high } : null;

  if (side === "buy") {
    const retrace = (rangeHi - mark) / range;
    if (retrace < 0.12 && last.px >= prev.px) return { kind: "chase", px: null, retrace, fvg, wick };
    const pull = retrace >= 0.18 && retrace <= 0.62 && mark > rangeLo + range * 0.2;
    if (pull || fvg) {
      const px = Number((fvg ? Math.min(mark, (fvg.low + fvg.high) / 2) : Math.min(mark, last.px) * 0.999).toFixed(4));
      return { kind: "pullback", px, retrace, fvg, wick };
    }
    return { kind: "none", px: null, retrace, fvg, wick };
  }

  const retrace = (mark - rangeLo) / range;
  if (retrace < 0.12 && last.px <= prev.px) return { kind: "chase", px: null, retrace, fvg, wick };
  const pull = retrace >= 0.18 && retrace <= 0.62 && mark < rangeHi - range * 0.2;
  if (pull || fvg) {
    const px = Number((fvg ? Math.max(mark, (fvg.low + fvg.high) / 2) : Math.max(mark, last.px) * 1.001).toFixed(4));
    return { kind: "pullback", px, retrace, fvg, wick };
  }
  return { kind: "none", px: null, retrace, fvg, wick };
}

export function tickerSetupFields(series: TickBar[], mark: number) {
  const buy = candleSetup(series, mark, "buy");
  const sell = candleSetup(series, mark, "sell");
  return {
    buySetup: buy.kind,
    buyLimit: buy.px ?? undefined,
    sellSetup: sell.kind,
    sellLimit: sell.px ?? undefined,
    buyRetrace: buy.retrace != null ? Math.round(buy.retrace * 100) : null,
    sellRetrace: sell.retrace != null ? Math.round(sell.retrace * 100) : null,
    buyFvg: buy.fvg,
    sellFvg: sell.fvg,
    buyWick: buy.wick,
    sellWick: sell.wick,
  };
}
