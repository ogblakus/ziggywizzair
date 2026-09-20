/**
 * Phase 3 Research Recorder — closed 15m prints only.
 * Does not import Decision Engine, Kai, Iris, sizing, or DeskBook.
 *
 * Vendor 15m tape is ~26h / 96 bars (Hyperliquid INTERVAL_SPEC). Bars older
 * than that window cannot be recovered; they are reported as gaps, never
 * interpolated.
 */
import { estimateFactors, FACTOR_WINDOW, type FactorPanel, type FactorPrint } from "@/lib/agents/factors";
import {
  ALPHA_RESEARCH_VERSION,
  researchTape,
  signedMoveCrossSection,
  type ResearchDebugRow,
} from "@/lib/agents/research";
import { analysisSnapshot } from "@/lib/market/setup";
import { UNIVERSE } from "@/lib/market/universe";
import { volatilityFeatures } from "@/lib/market/volatility";
import type { LiveQuote } from "@/lib/market/quotes";
import type { HtfPack, TickBar, TickerSnapshot } from "@/lib/types";

export const RESEARCH_BAR_MS = 15 * 60_000;
export const RESEARCH_ATR_BARS = 20;
/** Hyperliquid 15m lookback. Documented only — never used to invent bars. */
export const RESEARCH_VENDOR_HOURS = 26;

export function bucket15(t: number): number {
  return Math.floor(t / RESEARCH_BAR_MS) * RESEARCH_BAR_MS;
}

export function lastClosedBucket(now: number): number {
  return bucket15(now) - RESEARCH_BAR_MS;
}

export function isFormingBar(barT: number, now: number): boolean {
  return bucket15(barT) >= bucket15(now);
}

export type ResearchPrint = {
  barT: number;
  symbol: string;
  version: typeof ALPHA_RESEARCH_VERSION;
  ohlcv: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
  };
  window: TickBar[];
  raw: ResearchDebugRow["raw"];
  atr: number | null;
  atrPct: number | null;
  normalizedMove: number | null;
  signedMove: number | null;
  vesperLean: number;
  ashLean: number;
  xs: number | null;
  xsMedian: number | null;
  xsMad: number | null;
  xsN: number;
  xsSufficient: boolean;
  factors: ResearchDebugRow["factors"];
  barComplete: boolean;
  missing: string[];
};

export type ResearchGap = {
  symbol: string;
  from: number;
  to: number;
  bars: number;
};

export type ResearchTrigger = "cron" | "tickDesk";

export type ResearchDiagnostics = {
  count: number;
  lastBarT: number | null;
  lastInserted: number;
  lastDuplicate: number;
  lastError: string | null;
  missingSymbols: string[];
  gaps: ResearchGap[];
  lastTrigger: ResearchTrigger | null;
  lastRunAt: number | null;
};

export type ResearchLabPayload = {
  version: typeof ALPHA_RESEARCH_VERSION;
  stored: boolean;
  barT: number | null;
  rows: ResearchDebugRow[];
  diagnostics: ResearchDiagnostics;
};

export type ResearchStore = {
  upsert(row: ResearchPrint): Promise<"inserted" | "duplicate">;
  loadHistory(limitBars?: number): Promise<ResearchPrint[]>;
  count(): Promise<number>;
  lastBarT(): Promise<number | null>;
  lastBarBySymbol(): Promise<Map<string, number>>;
  writeStatus(diag: Omit<ResearchDiagnostics, "count" | "lastBarT"> & { lastBarT: number | null }): Promise<void>;
  readStatus(): Promise<Omit<ResearchDiagnostics, "count"> | null>;
};

export class MemoryResearchStore implements ResearchStore {
  readonly rows = new Map<string, ResearchPrint>();
  status: Omit<ResearchDiagnostics, "count"> | null = null;
  failNext = false;

  static key(barT: number, symbol: string) {
    return `${barT}:${symbol}`;
  }

  constructor(seed?: ResearchPrint[]) {
    for (const row of seed ?? []) this.rows.set(MemoryResearchStore.key(row.barT, row.symbol), row);
  }

  async upsert(row: ResearchPrint): Promise<"inserted" | "duplicate"> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("storage failed");
    }
    const k = MemoryResearchStore.key(row.barT, row.symbol);
    if (this.rows.has(k)) return "duplicate";
    this.rows.set(k, row);
    return "inserted";
  }

  async loadHistory(limitBars = FACTOR_WINDOW + 2): Promise<ResearchPrint[]> {
    const all = [...this.rows.values()].sort((a, b) => a.barT - b.barT || a.symbol.localeCompare(b.symbol));
    const times = [...new Set(all.map((r) => r.barT))];
    const keep = new Set(times.slice(-limitBars));
    return all.filter((r) => keep.has(r.barT));
  }

  async count() {
    return this.rows.size;
  }

  async lastBarT() {
    let max: number | null = null;
    for (const r of this.rows.values()) if (max == null || r.barT > max) max = r.barT;
    return max;
  }

  async lastBarBySymbol() {
    const out = new Map<string, number>();
    for (const r of this.rows.values()) {
      const prev = out.get(r.symbol);
      if (prev == null || r.barT > prev) out.set(r.symbol, r.barT);
    }
    return out;
  }

  async writeStatus(diag: Omit<ResearchDiagnostics, "count">) {
    this.status = { ...diag };
  }

  async readStatus() {
    return this.status;
  }

  /** Simulate process restart: new store, same durable rows. */
  clone(): MemoryResearchStore {
    const next = new MemoryResearchStore([...this.rows.values()]);
    next.status = this.status ? { ...this.status } : null;
    return next;
  }
}

function finitePos(n: unknown): number | null {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

export function latestClosedBar(bars: TickBar[] | undefined, now: number): TickBar | null {
  const closed = closedBuckets(bars, now);
  return closed.at(-1) ?? null;
}

/** Closed 15m buckets only. Forming bar omitted. One bar per bucket. No fabricated timestamps. */
export function closedBuckets(bars: TickBar[] | undefined, now: number): TickBar[] {
  if (!bars?.length) return [];
  const cutoff = lastClosedBucket(now);
  const by = new Map<number, TickBar>();
  for (const b of bars) {
    const t = bucket15(b.t);
    if (t > cutoff) continue;
    if (finitePos(b.px) == null) continue;
    const prev = by.get(t);
    if (!prev || b.t >= prev.t) by.set(t, b);
  }
  return [...by.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, b]) => b);
}

export function collapseGaps(missing: number[], symbol: string): ResearchGap[] {
  if (!missing.length) return [];
  const sorted = [...missing].sort((a, b) => a - b);
  const gaps: ResearchGap[] = [];
  let from = sorted[0]!;
  let to = from;
  let bars = 1;
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i]!;
    if (t === to + RESEARCH_BAR_MS) {
      to = t;
      bars += 1;
      continue;
    }
    gaps.push({ symbol, from, to, bars });
    from = t;
    to = t;
    bars = 1;
  }
  gaps.push({ symbol, from, to, bars });
  return gaps;
}

function barMissing(bar: TickBar): string[] {
  const missing: string[] = [];
  if (finitePos(bar.o) == null) missing.push("open");
  if (finitePos(bar.h) == null) missing.push("high");
  if (finitePos(bar.l) == null) missing.push("low");
  if (finitePos(bar.px) == null) missing.push("close");
  if (finitePos(bar.v) == null) missing.push("volume");
  return missing;
}

function thruClosed(bars: TickBar[], barT: number): TickBar[] {
  return bars.filter((b) => bucket15(b.t) <= barT);
}

function tickerFromClosed(quote: LiveQuote, bar: TickBar): TickerSnapshot | null {
  const close = finitePos(bar.px);
  if (close == null) return null;
  const barT = bucket15(bar.t);
  const m15 = thruClosed(quote.htf?.m15 ?? [], barT);
  const pack: HtfPack = {
    m15,
    h1: quote.htf?.h1 ?? [],
    h4: quote.htf?.h4 ?? [],
  };
  const open = finitePos(m15[0]?.px) ?? finitePos(bar.o) ?? close;
  const high = finitePos(bar.h) ?? close;
  const low = finitePos(bar.l) ?? close;
  const u = UNIVERSE.find((x) => x.symbol === quote.symbol);
  const snap = analysisSnapshot(pack, close);
  const vol = volatilityFeatures(m15.length ? m15.slice(-Math.max(RESEARCH_ATR_BARS, 16)) : null);
  return {
    symbol: quote.symbol,
    name: u?.name ?? quote.symbol,
    price: close,
    open,
    changePct: open ? ((close - open) / open) * 100 : 0,
    high,
    low,
    livePx: close,
    liveBps: 0,
    ...snap,
    vol,
  };
}

function panelFromPrints(prints: ResearchPrint[]): FactorPanel {
  const byT = new Map<number, FactorPrint["rows"]>();
  for (const p of prints) {
    const rows = byT.get(p.barT) ?? [];
    rows.push({ symbol: p.symbol, signedMove: p.signedMove });
    byT.set(p.barT, rows);
  }
  return [...byT.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, rows]) => ({ t, rows }));
}

function printFromQuoteBar(q: LiveQuote, bar: TickBar): ResearchPrint | null {
  if (finitePos(bar.px) == null) return null;
  const barT = bucket15(bar.t);
  const ticker = tickerFromClosed(q, bar);
  if (!ticker) return null;
  const tape = researchTape(ticker);
  const missing = barMissing(bar);
  if (tape.vol.atr == null) missing.push("atr");
  if (tape.alpha.signedMove == null) missing.push("signedMove");
  const m15 = thruClosed(q.htf?.m15 ?? [], barT);
  return {
    barT,
    symbol: q.symbol,
    version: ALPHA_RESEARCH_VERSION,
    ohlcv: {
      open: finitePos(bar.o),
      high: finitePos(bar.h),
      low: finitePos(bar.l),
      close: finitePos(bar.px),
      volume: finitePos(bar.v),
    },
    window: m15.slice(-RESEARCH_ATR_BARS),
    raw: tape.raw,
    atr: tape.vol.atr,
    atrPct: tape.vol.atrPct,
    normalizedMove: tape.vol.normalizedMove,
    signedMove: tape.alpha.signedMove,
    vesperLean: tape.alpha.vesperLean,
    ashLean: tape.alpha.ashLean,
    xs: null,
    xsMedian: null,
    xsMad: null,
    xsN: 0,
    xsSufficient: false,
    factors: tape.factors,
    barComplete: !missing.includes("close") && !missing.includes("open") && !missing.includes("high") && !missing.includes("low"),
    missing,
  };
}

function attachCrossSection(drafts: ResearchPrint[]) {
  const byT = new Map<number, ResearchPrint[]>();
  for (const d of drafts) {
    const g = byT.get(d.barT) ?? [];
    g.push(d);
    byT.set(d.barT, g);
  }
  for (const group of byT.values()) {
    const xs = signedMoveCrossSection(
      group.map((d) => ({
        symbol: d.symbol,
        name: d.symbol,
        price: d.ohlcv.close ?? 0,
        open: d.raw.open,
        changePct: d.raw.changePct,
        high: d.raw.high,
        low: d.raw.low,
        rsi: d.raw.rsi,
        vsSma: d.raw.vsSma,
        livePx: d.ohlcv.close,
        liveBps: 0,
        vol: {
          method: "wilder" as const,
          period: 14,
          tf: "15m" as const,
          atr: d.atr,
          atrPct: d.atrPct,
          normalizedMove: d.normalizedMove,
          signedMove: d.signedMove,
        },
      })),
    );
    for (const d of group) {
      const row = xs.rows.find((r) => r.symbol === d.symbol);
      d.xs = row?.z ?? null;
      d.xsMedian = xs.median;
      d.xsMad = xs.mad;
      d.xsN = xs.n;
      d.xsSufficient = Boolean(row?.sufficient);
    }
  }
}

export type DraftClosedResult = {
  drafts: ResearchPrint[];
  gaps: ResearchGap[];
  missingSymbols: string[];
};

/**
 * Every closed 15m bar still on the vendor tape.
 * Does not invent buckets the tape does not have.
 * `sinceBySymbol` is only the gap high-water mark — already-stored bars are
 * still drafted so a later vendor fill of an interior hole can be upserted
 * (PK / ON CONFLICT DO NOTHING). Never interpolates missing bars.
 */
export function draftClosedPrints(
  quotes: LiveQuote[],
  now: number,
  sinceBySymbol?: Map<string, number> | Record<string, number>,
): DraftClosedResult {
  const sinceOf = (symbol: string): number | null => {
    if (!sinceBySymbol) return null;
    if (sinceBySymbol instanceof Map) return sinceBySymbol.get(symbol) ?? null;
    const v = sinceBySymbol[symbol];
    return typeof v === "number" ? v : null;
  };
  const drafts: ResearchPrint[] = [];
  const gaps: ResearchGap[] = [];
  const missingSymbols: string[] = [];
  const cutoff = lastClosedBucket(now);

  for (const q of quotes) {
    const closed = closedBuckets(q.htf?.m15, now);
    if (!closed.length) {
      missingSymbols.push(q.symbol);
      continue;
    }
    const have = closed.map((b) => bucket15(b.t));
    const vendorMin = have[0]!;
    const since = sinceOf(q.symbol);
    // First run: do not invent a gap before the vendor window.
    const rangeFrom = since == null ? vendorMin : since + RESEARCH_BAR_MS;
    if (rangeFrom <= cutoff) {
      const present = new Set(have);
      const missingInWindow: number[] = [];
      for (let t = rangeFrom; t <= cutoff; t += RESEARCH_BAR_MS) {
        if (!present.has(t)) missingInWindow.push(t);
      }
      gaps.push(...collapseGaps(missingInWindow, q.symbol));
    }
    for (const bar of closed) {
      const barT = bucket15(bar.t);
      if (isFormingBar(barT, now)) continue;
      const print = printFromQuoteBar(q, bar);
      if (print) drafts.push(print);
    }
  }
  attachCrossSection(drafts);
  return { drafts, gaps, missingSymbols };
}

export async function recordClosedResearch(
  quotes: LiveQuote[],
  now = Date.now(),
  store: ResearchStore,
  opts?: { trigger?: ResearchTrigger | null },
): Promise<ResearchDiagnostics> {
  const trigger = opts?.trigger ?? null;
  const diag: ResearchDiagnostics = {
    count: 0,
    lastBarT: null,
    lastInserted: 0,
    lastDuplicate: 0,
    lastError: null,
    missingSymbols: [],
    gaps: [],
    lastTrigger: trigger,
    lastRunAt: null,
  };
  try {
    const since = await store.lastBarBySymbol();
    const { drafts, gaps, missingSymbols } = draftClosedPrints(quotes, now, since);
    diag.gaps = gaps;
    diag.missingSymbols = missingSymbols;
    const history = await store.loadHistory(FACTOR_WINDOW + 2);
    const merged = [...history];
    const sorted = [...drafts].sort((a, b) => a.barT - b.barT || a.symbol.localeCompare(b.symbol));
    for (const d of sorted) {
      if (!merged.some((h) => h.barT === d.barT && h.symbol === d.symbol)) merged.push(d);
    }
    const panel = panelFromPrints(merged);
    for (const d of sorted) {
      d.factors = estimateFactors(panel, d.symbol, d.barT);
      const result = await store.upsert(d);
      if (result === "inserted") diag.lastInserted += 1;
      else diag.lastDuplicate += 1;
      if (diag.lastBarT == null || d.barT > diag.lastBarT) diag.lastBarT = d.barT;
    }
    diag.count = await store.count();
    if (diag.lastBarT == null) diag.lastBarT = await store.lastBarT();
    diag.lastRunAt = Date.now();
    await store.writeStatus({
      lastBarT: diag.lastBarT,
      lastInserted: diag.lastInserted,
      lastDuplicate: diag.lastDuplicate,
      lastError: null,
      missingSymbols: diag.missingSymbols,
      gaps: diag.gaps,
      lastTrigger: trigger,
      lastRunAt: diag.lastRunAt,
    });
  } catch (err) {
    diag.lastError = err instanceof Error ? err.message : "storage failed";
    try {
      diag.count = await store.count();
      diag.lastBarT = await store.lastBarT();
      diag.lastRunAt = Date.now();
      await store.writeStatus({
        lastBarT: diag.lastBarT,
        lastInserted: diag.lastInserted,
        lastDuplicate: diag.lastDuplicate,
        lastError: diag.lastError,
        missingSymbols: diag.missingSymbols,
        gaps: diag.gaps,
        lastTrigger: trigger,
        lastRunAt: diag.lastRunAt,
      });
    } catch {
      /* status write may fail with the same store */
    }
  }
  return diag;
}

export function printToLabRow(p: ResearchPrint): ResearchDebugRow {
  return {
    symbol: p.symbol,
    raw: p.raw,
    atr: p.atr,
    atrPct: p.atrPct,
    normalizedMove: p.normalizedMove,
    signedMove: p.signedMove,
    vesperLean: p.vesperLean,
    ashLean: p.ashLean,
    xs: p.xs,
    sufficient: p.xsSufficient,
    factors: p.factors,
  };
}
