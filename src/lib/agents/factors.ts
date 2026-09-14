/**
 * Phase 3 — time-series factor residual (research-only).
 *
 * Market model (OLS with intercept), window ending at T, no look-ahead:
 *   R_i,t = α_i + β_i R_m,i,t + ε_i,t
 *   R_m,i,t = equal-weight mean of other names' signedMove at t  (leave-one-out)
 *
 * Sequential sector residual, only when universe sector peers exist:
 *   ε_m,t = α_s + β_s R_s,i,t + ε_s,t
 *   R_s,i,t = leave-one-out equal-weight mean of same-sector signedMove
 *
 * R is ATR-normalized signedMove, not raw return and not Vesper/Ash scores.
 * Insufficient / zero-variance / null inputs → null. Never β=1, never residual=raw.
 */
import { sectorOf, type DeskSector } from "@/lib/market/universe";

export const FACTOR_WINDOW = 20;
export const FACTOR_MIN_OBS = 5;
export const FACTOR_METHOD = "ols-intercept" as const;

export type FactorPrint = {
  t: number;
  rows: Array<{ symbol: string; signedMove: number | null | undefined }>;
};

export type FactorPanel = FactorPrint[];

export type FactorResearch = {
  method: typeof FACTOR_METHOD;
  window: number;
  marketFactor: number | null;
  marketBeta: number | null;
  marketAlpha: number | null;
  marketFitted: number | null;
  marketResidual: number | null;
  sector: DeskSector | null;
  sectorFactor: number | null;
  sectorBeta: number | null;
  sectorFitted: number | null;
  sectorResidual: number | null;
  /** Final residual alpha: sector residual if estimated, else market residual. */
  residual: number | null;
  observationCount: number;
  sufficient: boolean;
};

export function emptyFactorResearch(): FactorResearch {
  return {
    method: FACTOR_METHOD,
    window: FACTOR_WINDOW,
    marketFactor: null,
    marketBeta: null,
    marketAlpha: null,
    marketFitted: null,
    marketResidual: null,
    sector: null,
    sectorFactor: null,
    sectorBeta: null,
    sectorFitted: null,
    sectorResidual: null,
    residual: null,
    observationCount: 0,
    sufficient: false,
  };
}

function finite(n: number | null | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function mean(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Number.isFinite(s) ? s : null;
}

/** Leave-one-out equal-weight mean of finite signedMoves. */
export function leaveOneOutMean(
  rows: FactorPrint["rows"],
  symbol: string,
  peerOf?: (sym: string) => boolean,
): number | null {
  const vals: number[] = [];
  for (const r of rows) {
    if (r.symbol === symbol) continue;
    if (peerOf && !peerOf(r.symbol)) continue;
    if (finite(r.signedMove)) vals.push(r.signedMove);
  }
  return vals.length ? mean(vals) : null;
}

function olsIntercept(y: number[], x: number[]): { alpha: number; beta: number } | null {
  if (y.length !== x.length || y.length < FACTOR_MIN_OBS) return null;
  const mx = mean(x);
  const my = mean(y);
  if (mx == null || my == null) return null;
  let cov = 0;
  let vx = 0;
  for (let i = 0; i < y.length; i++) {
    const dx = x[i]! - mx;
    cov += dx * (y[i]! - my);
    vx += dx * dx;
  }
  if (!(vx > 0) || !Number.isFinite(vx) || !Number.isFinite(cov)) return null;
  const beta = cov / vx;
  const alpha = my - beta * mx;
  if (!Number.isFinite(beta) || !Number.isFinite(alpha)) return null;
  return { alpha, beta };
}

function printsThrough(panel: FactorPanel, at: number): FactorPrint[] {
  return panel.filter((p) => p.t <= at).sort((a, b) => a.t - b.t);
}

/**
 * Factor residual for `symbol` at timestamp `at`.
 * Uses only prints with t <= at, then the last FACTOR_WINDOW paired observations.
 */
export function estimateFactors(panel: FactorPanel, symbol: string, at: number): FactorResearch {
  const empty = emptyFactorResearch();
  const hist = printsThrough(panel, at);
  const sector = sectorOf(symbol);
  const marketPairs: Array<{ r: number; m: number; s: number | null; t: number }> = [];
  for (const p of hist) {
    const self = p.rows.find((r) => r.symbol === symbol);
    if (!self || !finite(self.signedMove)) continue;
    const m = leaveOneOutMean(p.rows, symbol);
    if (m == null) continue;
    const s = leaveOneOutMean(p.rows, symbol, (sym) => sectorOf(sym) === sector);
    marketPairs.push({ r: self.signedMove, m, s, t: p.t });
  }
  const windowed = marketPairs.slice(-FACTOR_WINDOW);
  const n = windowed.length;
  empty.observationCount = n;
  empty.sector = sector;
  if (n < FACTOR_MIN_OBS) return empty;
  const last = windowed[windowed.length - 1]!;
  if (last.t !== at) return empty;

  const y = windowed.map((p) => p.r);
  const xm = windowed.map((p) => p.m);
  const mkt = olsIntercept(y, xm);
  if (!mkt) return { ...empty, marketFactor: last.m, observationCount: n };

  const marketFitted = mkt.alpha + mkt.beta * last.m;
  const marketResidual = last.r - marketFitted;
  if (!Number.isFinite(marketFitted) || !Number.isFinite(marketResidual)) {
    return { ...empty, marketFactor: last.m, observationCount: n };
  }

  const out: FactorResearch = {
    ...empty,
    marketFactor: last.m,
    marketBeta: mkt.beta,
    marketAlpha: mkt.alpha,
    marketFitted,
    marketResidual,
    residual: marketResidual,
    observationCount: n,
    sufficient: true,
  };

  const sectorPairs = windowed.filter((p) => p.s != null);
  if (sectorPairs.length >= FACTOR_MIN_OBS && last.s != null) {
    const em = sectorPairs.map((p) => p.r - (mkt.alpha + mkt.beta * p.m));
    const xs = sectorPairs.map((p) => p.s as number);
    const sec = olsIntercept(em, xs);
    if (sec) {
      const sectorFitted = sec.alpha + sec.beta * last.s;
      const sectorResidual = marketResidual - sectorFitted;
      if (Number.isFinite(sectorFitted) && Number.isFinite(sectorResidual)) {
        out.sectorFactor = last.s;
        out.sectorBeta = sec.beta;
        out.sectorFitted = sectorFitted;
        out.sectorResidual = sectorResidual;
        out.residual = sectorResidual;
      }
    }
  }

  return out;
}

/** Snapshot-only path: one timestamp is never enough for OLS. Honest nulls. */
export function factorsFromSnapshot(): FactorResearch {
  return emptyFactorResearch();
}
