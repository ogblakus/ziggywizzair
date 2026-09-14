import { kaiKind, kaiLimit } from "@/lib/agents/pipeline";
import type { KaiSetup, KaiStatus, Side } from "@/lib/agents/core/types";
import { markOf } from "@/lib/desk/size";
import { sectorOf } from "@/lib/market/universe";
import type { MacroTape, TickerSnapshot } from "@/lib/types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function clamp01(n: number) {
  return clamp(n, 0, 1);
}

export function sessionRange(t: TickerSnapshot): number {
  const range = t.high - t.low;
  return range > 0 && Number.isFinite(range) ? range : 0;
}

/** Floor on stop distance: 35% of session range or 40 bps, whichever is larger.
 *  True ATR is available as a research hook (`atrStopFloor`) — not used here until a k is calibrated. */
export function minStopDist(t: TickerSnapshot): number {
  const px = markOf(t);
  if (!(px > 0)) return 0;
  return Math.max(sessionRange(t) * 0.35, px * 0.004);
}

function sittingOnExtreme(t: TickerSnapshot, side: Side): boolean {
  const range = sessionRange(t);
  const px = markOf(t);
  if (!(range > 0) || !(px > 0)) return false;
  const retrace = side === "buy" ? (t.high - px) / range : (px - t.low) / range;
  return retrace < 0.12;
}

/**
 * Spec §9 — code owns the momentum score.
 * 25% price expansion, 20% rvol, 20% session structure, 15% SMA, 10% RSI, 10% trend alignment.
 * Does NOT read Kai labels (buySetup / retrace / wick / tf).
 */
export function vesperMomentumScore(t: TickerSnapshot, side: Side): number {
  const dir = side === "buy" ? 1 : -1;
  const px = markOf(t);
  const price = clamp01((dir * t.changePct) / 1.2) * 25;
  let rvol = 2;
  if (t.rvol == null) rvol = 2;
  else if (t.rvol >= 1.3) rvol = 20;
  else if (t.rvol >= 0.9) rvol = 16;
  else if (t.rvol >= 0.7) rvol = 12;
  else if (t.rvol >= 0.55) rvol = 8;
  else rvol = 2;
  const range = sessionRange(t);
  const rangePct = px > 0 ? range / px : 0;
  let structure = 6;
  if (rangePct >= 0.008) {
    const retrace = side === "buy" ? (t.high - px) / range : (px - t.low) / range;
    if (retrace >= 0.18 && retrace <= 0.62) structure = 16;
    else if (retrace < 0.12) structure = 6;
    else structure = 10;
    const bodyLow = Math.min(t.open, px);
    const bodyHigh = Math.max(t.open, px);
    if (side === "buy" && (bodyLow - t.low) / range >= 0.38) structure += 4;
    if (side === "sell" && (t.high - bodyHigh) / range >= 0.38) structure += 4;
  }
  structure = clamp(structure, 0, 20);
  const sma = clamp01((dir * t.vsSma) / 1.2) * 15;
  const rsi =
    side === "buy"
      ? t.rsi >= 48 && t.rsi < 72
        ? 10
        : t.rsi >= 44 && t.rsi < 80
          ? 6
          : t.rsi >= 72
            ? 3
            : 2
      : t.rsi <= 52 && t.rsi > 28
        ? 10
        : t.rsi <= 56 && t.rsi > 20
          ? 6
          : t.rsi <= 28
            ? 3
            : 2;
  const aligned = dir * t.changePct > 0.3 && dir * t.vsSma > 0.2;
  const htf = aligned ? 10 : 3;
  return clamp(price + rvol + structure + sma + rsi + htf, 0, 100);
}

/**
 * Mean-reversion score. Distance from mean, RSI extremes, failed breakout, exhaustion.
 * Does not fade clean expansion with rising RVOL (spec §13).
 */
export function ashReversionScore(t: TickerSnapshot, side: Side): number {
  const extDir = side === "buy" ? -1 : 1;
  const dist = clamp01((extDir * t.vsSma) / 1.8) * 32;
  const rsi =
    side === "buy"
      ? t.rsi <= 30
        ? 24
        : t.rsi <= 38
          ? 16
          : t.rsi <= 46
            ? 8
            : 2
      : t.rsi >= 74
        ? 24
        : t.rsi >= 66
          ? 16
          : t.rsi >= 58
            ? 8
            : 2;
  const wick = side === "buy" ? t.buyWick : t.sellWick;
  const failed = wick ? 14 : sittingOnExtreme(t, side === "buy" ? "sell" : "buy") ? 10 : 4;
  const chg = Math.abs(t.changePct);
  let exhaust = 8;
  if (t.rvol != null && t.rvol < 0.7 && chg > 0.8) exhaust = 16;
  else if (t.rvol != null && t.rvol > 1.35 && chg > 0.6) exhaust = 3;
  const againstExpansion =
    t.rvol != null &&
    t.rvol >= 1.2 &&
    ((side === "sell" && t.changePct > 0.8 && t.vsSma > 0.6) ||
      (side === "buy" && t.changePct < -0.8 && t.vsSma < -0.6));
  const raw = dist + rsi + failed + exhaust;
  return clamp(againstExpansion ? raw * 0.45 : raw, 0, 100);
}

export function kaiQualityScore(t: TickerSnapshot, side: Side): { status: KaiStatus; score: number } {
  const kind = kaiKind(t, side);
  if (kind === "thin" || kind === "chase") return { status: "blocked", score: kind === "thin" ? 12 : 18 };
  const retrace = side === "buy" ? t.buyRetrace : t.sellRetrace;
  const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
  const wick = side === "buy" ? t.buyWick : t.sellWick;
  const tf = side === "buy" ? t.buyTf : t.sellTf;
  let score = kind === "ready" ? 68 : 48;
  if (fvg) score += tf === "4h" ? 14 : tf === "1h" ? 10 : 6;
  if (retrace != null && retrace >= 18 && retrace <= 62) score += 10;
  if (wick) score += 4;
  if (t.rvol != null && t.rvol >= 0.9) score += 6;
  else if (t.rvol != null && t.rvol >= 0.55) score += 3;
  return { status: kind === "ready" ? "ready" : "wait", score: clamp(score, 0, 100) };
}

export function kaiGeometry(t: TickerSnapshot, side: Side): {
  entry: number | null;
  invalidation: number | null;
  target: number | null;
  rr: number;
} {
  const entry = kaiLimit(t, side);
  if (!(entry && entry > 0)) return { entry: null, invalidation: null, target: null, rr: 0 };
  const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
  let inv: number | null =
    side === "buy"
      ? fvg && fvg.low < entry
        ? fvg.low * 0.998
        : t.low < entry
          ? t.low
          : null
      : fvg && fvg.high > entry
        ? fvg.high * 1.002
        : t.high > entry
          ? t.high
          : null;
  if (inv == null) return { entry, invalidation: null, target: null, rr: 0 };
  if ((side === "buy" && inv >= entry) || (side === "sell" && inv <= entry)) {
    return { entry, invalidation: null, target: null, rr: 0 };
  }
  const minRisk = minStopDist(t);
  let stop = inv;
  let risk = Math.abs(entry - stop);
  if (minRisk > 0 && risk < minRisk) {
    stop = side === "buy" ? entry - minRisk : entry + minRisk;
    risk = minRisk;
  }
  if (!(risk > 0)) return { entry, invalidation: stop, target: null, rr: 0 };
  const target = side === "buy" ? (t.high > entry ? t.high : null) : (t.low < entry ? t.low : null);
  if (target == null) return { entry, invalidation: stop, target: null, rr: 0 };
  const reward = Math.abs(target - entry);
  if (!(reward > 0)) return { entry, invalidation: stop, target: null, rr: 0 };
  return { entry, invalidation: stop, target, rr: Number((reward / risk).toFixed(2)) };
}

export function kaiSetupFor(t: TickerSnapshot, side: Side): KaiSetup {
  const q = kaiQualityScore(t, side);
  const g = kaiGeometry(t, side);
  const kind = kaiKind(t, side);
  const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
  const retrace = side === "buy" ? t.buyRetrace : t.sellRetrace;
  const tf = (side === "buy" ? t.buyTf : t.sellTf) ?? "15m";
  const evidence: string[] = [];
  if (fvg) evidence.push(`${tf} FVG ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)}`);
  if (retrace != null) evidence.push(`${retrace}% retracement`);
  if (t.rvol != null) evidence.push(`15m RVOL ${t.rvol.toFixed(2)}`);
  if (kind === "thin") evidence.push("thin tape");
  if (kind === "chase") evidence.push("chase — extreme of range");
  const setupType = fvg ? `${tf}_fvg_pullback` : retrace != null ? "15m_pullback" : "structural_retest";
  return {
    symbol: t.symbol,
    side,
    status: q.status,
    setupType,
    timeframe: tf,
    fvg: fvg ? { low: fvg.low, high: fvg.high } : null,
    retracementPct: retrace ?? null,
    entryType: "limit",
    entryPrice: q.status === "blocked" ? null : g.entry,
    invalidation: g.invalidation,
    target: g.target,
    rr: g.rr,
    qualityScore: q.score,
    evidence,
    reason: "",
  };
}

export function kaiScan(tickers: TickerSnapshot[], limit = 3): KaiSetup[] {
  const rows: KaiSetup[] = [];
  for (const t of tickers) {
    for (const side of ["buy", "sell"] as const) {
      rows.push(kaiSetupFor(t, side));
    }
  }
  const rank: Record<KaiStatus, number> = { ready: 0, wait: 1, blocked: 2 };
  rows.sort((a, b) => rank[a.status] - rank[b.status] || b.qualityScore - a.qualityScore);
  const seen = new Set<string>();
  const out: KaiSetup[] = [];
  for (const row of rows) {
    if (seen.has(row.symbol)) continue;
    seen.add(row.symbol);
    out.push(row);
    if (out.length >= limit) break;
  }
  return out;
}

export function damianSectorScores(macro: MacroTape | null | undefined, tickers: TickerSnapshot[]) {
  const spy = tickers.find((t) => t.symbol === "SPY");
  const btc = tickers.find((t) => t.symbol === "BTC");
  const gold = tickers.find((t) => t.symbol === "GOLD");
  const eq = macro?.equityPct ?? spy?.changePct ?? 0;
  const btcChg = btc?.changePct ?? 0;
  const goldChg = gold?.changePct ?? 0;
  const vix = macro?.vix ?? 18;
  const vixChg = macro?.vixChg ?? 0;
  const dxyChg = macro?.dxyChg ?? 0;
  const capPct = macro?.cryptoMcapPct ?? btcChg;
  const volHot = vix >= 22 || vixChg >= 8;
  const dollarFirm = dxyChg >= 0.35;
  const dollarSoft = dxyChg <= -0.35;
  return {
    equities: clamp(eq * 18 + (volHot ? -35 : vix <= 14 ? 12 : 0), -100, 100),
    crypto: clamp(capPct * 14 + (dollarFirm ? -22 : dollarSoft ? 14 : 0), -100, 100),
    metals: clamp(goldChg * 16 + (dollarSoft ? 18 : dollarFirm ? -18 : 0), -100, 100),
    dollar: clamp(dxyChg * 40, -100, 100),
    vol: clamp((14 - vix) * 4 - vixChg * 2, -100, 100),
  } as const;
}

export function sectorScoreFor(symbol: string, scores: ReturnType<typeof damianSectorScores>): number {
  const id = sectorOf(symbol);
  return scores[id];
}

export function historicalMultiplier(closed: number, hitPct: number | null): number {
  if (closed < 30 || hitPct == null) return 1;
  return clamp(0.5 + (hitPct / 100) * 0.75, 0.5, 1.25);
}

export function historicalEdge(closed: number, hitPct: number | null): number {
  if (closed < 30 || hitPct == null) return 0;
  return clamp((hitPct - 50) * 1.2, -100, 100);
}
