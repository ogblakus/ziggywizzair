import type { SentimentReport, TickerSnapshot } from "@/lib/types";
import { sectorOf, type DeskSector } from "@/lib/market/universe";
import { markOf } from "@/lib/desk/size";

export const LEAN_SCORE = 42;
export const ACT_SCORE = 62;
export const MAX_OPEN_LEGS = 2;
export const MAX_SCOUT_NAMES = 3;

export type ScoutId = "vesper" | "ash";
export type KaiKind = "ready" | "wait" | "thin" | "chase" | "none";

export type Idea = {
  scout: ScoutId;
  symbol: string;
  side: "buy" | "sell";
  score: number;
  cut?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Damian filters a class, not the whole tape. Bearish crypto does not silence gold. */
export function sectorWeight(sentiment: SentimentReport | undefined, symbol: string): number {
  const id: DeskSector = sectorOf(symbol);
  const row = sentiment?.sectors.find((s) => s.id === id);
  if (!row) return 0.85;
  if (row.stance === "bullish") return 1;
  if (row.stance === "bearish") return 0.42;
  return 0.85;
}

function rvolBoost(t: TickerSnapshot): number {
  if (t.rvol == null) return 4;
  if (t.rvol >= 0.9) return 16;
  if (t.rvol >= 0.7) return 12;
  if (t.rvol >= 0.55) return 7;
  return 0;
}

export function vesperLongScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(t.changePct / 0.7, 0, 1) * 38;
  s += clamp(t.vsSma / 0.5, 0, 1) * 24;
  if (t.rsi >= 48 && t.rsi < 78) s += 22;
  else if (t.rsi >= 44 && t.rsi < 82) s += 10;
  s += rvolBoost(t);
  return s;
}

export function vesperShortScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(-t.changePct / 0.7, 0, 1) * 38;
  s += clamp(-t.vsSma / 0.5, 0, 1) * 24;
  if (t.rsi <= 52 && t.rsi > 22) s += 22;
  else if (t.rsi <= 56 && t.rsi > 18) s += 10;
  s += rvolBoost(t);
  return s;
}

export function ashBuyScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(-t.vsSma / 1.0, 0, 1) * 40;
  s += clamp((48 - t.rsi) / 18, 0, 1) * 28;
  if (t.changePct < -0.15) s += 14;
  s += rvolBoost(t) * 0.6;
  return s;
}

export function ashSellScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(t.vsSma / 1.0, 0, 1) * 40;
  s += clamp((t.rsi - 55) / 18, 0, 1) * 28;
  if (t.changePct > 0.15) s += 14;
  s += rvolBoost(t) * 0.6;
  return s;
}

function uniqueTop(ideas: Idea[], n: number): Idea[] {
  const seen = new Set<string>();
  const out: Idea[] = [];
  for (const idea of ideas.sort((a, b) => b.score - a.score)) {
    if (idea.score < LEAN_SCORE) continue;
    if (seen.has(idea.symbol)) continue;
    seen.add(idea.symbol);
    out.push(idea);
    if (out.length >= n) break;
  }
  return out;
}

export function vesperRank(tickers: TickerSnapshot[], sentiment: SentimentReport | undefined): Idea[] {
  const ideas: Idea[] = [];
  for (const t of tickers) {
    const w = sectorWeight(sentiment, t.symbol);
    const long = vesperLongScore(t) * w;
    const short = vesperShortScore(t) * w;
    if (long >= short && long >= LEAN_SCORE) {
      ideas.push({ scout: "vesper", symbol: t.symbol, side: "buy", score: long });
    } else if (short >= LEAN_SCORE) {
      ideas.push({ scout: "vesper", symbol: t.symbol, side: "sell", score: short });
    }
  }
  return uniqueTop(ideas, MAX_SCOUT_NAMES);
}

export function ashRank(tickers: TickerSnapshot[], sentiment: SentimentReport | undefined): Idea[] {
  const ideas: Idea[] = [];
  for (const t of tickers) {
    const w = sectorWeight(sentiment, t.symbol);
    const buy = ashBuyScore(t) * w;
    const sell = ashSellScore(t) * w;
    if (buy >= sell && buy >= LEAN_SCORE) {
      ideas.push({ scout: "ash", symbol: t.symbol, side: "buy", score: buy });
    } else if (sell >= LEAN_SCORE) {
      ideas.push({ scout: "ash", symbol: t.symbol, side: "sell", score: sell });
    }
  }
  return uniqueTop(ideas, MAX_SCOUT_NAMES);
}

export function kaiKind(tk: TickerSnapshot, side: "buy" | "sell"): KaiKind {
  if (tk.rvol != null && tk.rvol < 0.55) return "thin";
  const setup = side === "buy" ? tk.buySetup : tk.sellSetup;
  if (setup === "chase") return "chase";
  const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
  if (setup === "pullback" && limit && limit > 0) {
    const range = tk.high - tk.low;
    const px = markOf(tk);
    if (range > 0 && px > 0) {
      const retrace = side === "buy" ? (tk.high - px) / range : (px - tk.low) / range;
      if (retrace < 0.12) return "chase";
    }
    return "ready";
  }
  return "wait";
}

export function kaiLimit(tk: TickerSnapshot, side: "buy" | "sell"): number | undefined {
  const ready = side === "buy" ? tk.buyLimit : tk.sellLimit;
  if (ready && ready > 0) return Number(ready.toFixed(4));
  const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
  if (fvg) return Number(((fvg.low + fvg.high) / 2).toFixed(4));
  return undefined;
}

export function rankKai(ideas: Idea[], of: (sym: string) => TickerSnapshot | undefined): {
  idea: Idea;
  tk: TickerSnapshot;
  kind: KaiKind;
  limit?: number;
}[] {
  const seen = new Set<string>();
  const rows: { idea: Idea; tk: TickerSnapshot; kind: KaiKind; limit?: number }[] = [];
  for (const idea of ideas) {
    if (idea.cut) continue;
    if (seen.has(`${idea.symbol}:${idea.side}`)) continue;
    const tk = of(idea.symbol);
    if (!tk) continue;
    seen.add(`${idea.symbol}:${idea.side}`);
    const kind = kaiKind(tk, idea.side);
    rows.push({ idea, tk, kind, limit: kind === "thin" || kind === "chase" ? undefined : kaiLimit(tk, idea.side) });
  }
  const rank: Record<KaiKind, number> = { ready: 0, wait: 1, none: 2, thin: 3, chase: 4 };
  rows.sort((a, b) => rank[a.kind] - rank[b.kind] || b.idea.score - a.idea.score);
  return rows;
}

export function irisClipPct(weatherBias: number, openCount: number, adding: boolean): number {
  const base =
    weatherBias >= 0.35 ? 5.2 : weatherBias <= -0.35 ? 2.2 : 3.2;
  const legs = openCount <= 0 ? 1 : openCount === 1 ? 0.78 : 0.55;
  const pct = base * legs;
  if (adding) return Math.min(3, pct);
  return clamp(pct, 2, 6);
}
