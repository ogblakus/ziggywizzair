/**
 * Alpha Research Layer — contract v1.2
 *
 * raw market features
 *      ↓
 * volatility normalization        [Phase 1]
 *      ↓
 * normalized alpha + xs research  [Phase 2]
 *      ↓
 * market / sector residual        [Phase 3]
 *      ↓
 * future: alpha combination       [Phase 4]
 *
 * Research-only. Does not feed Decision Engine, sizing, or Kai readiness.
 *
 * Residual is the OLS leftover after market (and sector, if estimable).
 * It is not a Vesper/Ash score and not a raw return.
 */
import { robustCrossSection, type CrossSectionalSnapshot } from "@/lib/agents/cross-section";
import {
  emptyFactorResearch,
  estimateFactors,
  type FactorPanel,
  type FactorResearch,
} from "@/lib/agents/factors";
import { ashReversionScore, vesperMomentumScore } from "@/lib/agents/math";
import { type VolatilityFeatures, emptyVolatilityFeatures, volatilityFeatures } from "@/lib/market/volatility";
import type { TickBar, TickerSnapshot } from "@/lib/types";

export const ALPHA_RESEARCH_VERSION = "1.2";
export { ATR_METHOD, WILDER_ATR_PERIOD, volatilityFeatures } from "@/lib/market/volatility";
export { robustCrossSection, XS_MIN_N } from "@/lib/agents/cross-section";
export { emptyFactorResearch, estimateFactors, FACTOR_MIN_OBS, FACTOR_WINDOW } from "@/lib/agents/factors";
export type { VolatilityFeatures, CrossSectionalSnapshot, FactorPanel, FactorResearch };

export type RawMarketFeatures = {
  price: number;
  open: number;
  high: number;
  low: number;
  changePct: number;
  rsi: number;
  vsSma: number;
  rvol: number | null;
};

/** Directional research representation. Not a replacement for V2.4 scores. */
export type NormalizedAlpha = {
  /** Δclose / ATR (signed). Null without a true ATR. */
  signedMove: number | null;
  /** (Vesper long − short) / 100. Quality lean, not vol-adjusted. */
  vesperLean: number;
  /** (Ash fade-long − fade-short) / 100. Reversion lean, not vol-adjusted. */
  ashLean: number;
};

export type AlphaResearchTape = {
  version: typeof ALPHA_RESEARCH_VERSION;
  raw: RawMarketFeatures;
  vol: VolatilityFeatures;
  alpha: NormalizedAlpha;
  xs: number | null;
  factors: FactorResearch;
};

export type ResearchDebugRow = {
  symbol: string;
  raw: RawMarketFeatures;
  atr: number | null;
  atrPct: number | null;
  normalizedMove: number | null;
  signedMove: number | null;
  vesperLean: number;
  ashLean: number;
  xs: number | null;
  sufficient: boolean;
  factors: FactorResearch;
};

function lean(long: number, short: number): number {
  const n = (long - short) / 100;
  if (!Number.isFinite(n)) return 0;
  return Math.max(-1, Math.min(1, n));
}

export function rawMarketFeatures(t: TickerSnapshot): RawMarketFeatures {
  return {
    price: t.price,
    open: t.open,
    high: t.high,
    low: t.low,
    changePct: t.changePct,
    rsi: t.rsi,
    vsSma: t.vsSma,
    rvol: t.rvol ?? null,
  };
}

export function normalizedAlpha(t: TickerSnapshot, vol: VolatilityFeatures): NormalizedAlpha {
  return {
    signedMove: vol.signedMove ?? null,
    vesperLean: lean(vesperMomentumScore(t, "buy"), vesperMomentumScore(t, "sell")),
    ashLean: lean(ashReversionScore(t, "buy"), ashReversionScore(t, "sell")),
  };
}

export function researchTape(t: TickerSnapshot, bars?: TickBar[] | null): AlphaResearchTape {
  const src = t.vol ?? volatilityFeatures(bars);
  const vol: VolatilityFeatures = {
    ...emptyVolatilityFeatures(),
    ...src,
    signedMove: src.signedMove ?? null,
  };
  return {
    version: ALPHA_RESEARCH_VERSION,
    raw: rawMarketFeatures(t),
    vol,
    alpha: normalizedAlpha(t, vol),
    xs: null,
    factors: emptyFactorResearch(),
  };
}

/**
 * Cross-section of tape signedMove at this snapshot only.
 * Does not read Vesper / Ash / Kai / Damian verdicts.
 */
export function signedMoveCrossSection(tickers: TickerSnapshot[]): CrossSectionalSnapshot {
  return robustCrossSection(
    tickers.map((t) => ({
      symbol: t.symbol,
      value: (t.vol ?? volatilityFeatures(null)).signedMove,
    })),
    "signedMove",
  );
}

/** Debug/telemetry rows. Not a UI panel. Factors stay null without a historical panel. */
export function researchDebugBook(
  tickers: TickerSnapshot[],
  panel?: FactorPanel | null,
  at?: number,
): ResearchDebugRow[] {
  const xs = signedMoveCrossSection(tickers);
  const bySym = new Map(xs.rows.map((r) => [r.symbol, r]));
  const tEnd = at ?? (panel?.length ? Math.max(...panel.map((p) => p.t)) : 0);
  return tickers.map((t) => {
    const tape = researchTape(t);
    const row = bySym.get(t.symbol);
    return {
      symbol: t.symbol,
      raw: tape.raw,
      atr: tape.vol.atr,
      atrPct: tape.vol.atrPct,
      normalizedMove: tape.vol.normalizedMove,
      signedMove: tape.alpha.signedMove,
      vesperLean: tape.alpha.vesperLean,
      ashLean: tape.alpha.ashLean,
      xs: row?.z ?? null,
      sufficient: row?.sufficient ?? false,
      factors: panel?.length ? estimateFactors(panel, t.symbol, tEnd) : emptyFactorResearch(),
    };
  });
}

/**
 * Research hook only — not wired into kaiGeometry / minStopDist.
 * A stop floor of ATR × k needs a calibrated k; Phase 1 does not pick one.
 */
export function atrStopFloor(atr: number | null | undefined, k: number): number | null {
  if (atr == null || !(atr > 0) || !Number.isFinite(k) || !(k > 0)) return null;
  const floor = atr * k;
  return Number.isFinite(floor) ? floor : null;
}
