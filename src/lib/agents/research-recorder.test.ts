import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { runLocalV2 } from "./local-v2.ts";
import { GOLDEN } from "./golden/catalog.ts";
import {
  MemoryResearchStore,
  RESEARCH_BAR_MS,
  bucket15,
  draftClosedPrints,
  isFormingBar,
  latestClosedBar,
  recordClosedResearch,
} from "./research-recorder.ts";
import type { LiveQuote } from "../market/quotes.ts";
import type { TickBar } from "../types.ts";

function bar(t: number, px: number, extra: Partial<TickBar> = {}): TickBar {
  return { t, px, o: px, h: px + 1, l: px - 1, v: 10, ...extra };
}

function series(n: number, start: number, px0 = 100): TickBar[] {
  return Array.from({ length: n }, (_, i) => bar(start + i * RESEARCH_BAR_MS, px0 + i * 0.5));
}

function quote(symbol: string, m15: TickBar[]): LiveQuote {
  const last = m15.at(-1);
  const px = last?.px ?? 1;
  return {
    symbol,
    price: px,
    prevClose: m15[0]?.px ?? px,
    open: m15[0]?.px ?? px,
    high: Math.max(...m15.map((b) => b.h ?? b.px)),
    low: Math.min(...m15.map((b) => b.l ?? b.px)),
    series: m15,
    htf: { m15, h1: [], h4: [] },
    livePx: px,
    liveCoin: null,
    spotPx: px,
    tape: "hl",
  };
}

describe("Research recorder — closed 15m only", () => {
  it("duplicate of the same candle inserts once", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const last = m15.at(-1)!;
    const now = last.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    const q = [quote("BTC", m15), quote("ETH", m15.map((b) => ({ ...b, px: b.px + 2 })))];
    const a = await recordClosedResearch(q, now, store);
    const b = await recordClosedResearch(q, now, store);
    assert.equal(a.lastInserted, 40);
    assert.equal(b.lastInserted, 0);
    assert.equal(b.lastDuplicate, 40);
    assert.equal(await store.count(), 40);
  });

  it("restart/reload sees prior rows and does not duplicate", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const disk = new MemoryResearchStore();
    await recordClosedResearch([quote("BTC", m15)], now, disk);
    const reloaded = disk.clone();
    const again = await recordClosedResearch([quote("BTC", m15)], now, reloaded);
    assert.equal(again.lastInserted, 0);
    assert.equal(again.lastDuplicate, 20);
    assert.equal(await reloaded.count(), 20);
  });

  it("missing ATR is stored as null, not fabricated", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(4, start);
    const now = m15.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    await recordClosedResearch([quote("BTC", m15)], now, store);
    const row = [...store.rows.values()][0]!;
    assert.equal(row.atr, null);
    assert.equal(row.signedMove, null);
    assert.ok(row.missing.includes("atr"));
    assert.ok(row.missing.includes("signedMove"));
    assert.equal(row.factors.sufficient, false);
    assert.equal(row.factors.residual, null);
    assert.equal(row.factors.marketBeta, null);
  });

  it("incomplete candle records null OHLC fields and is not treated as complete", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const last = m15.at(-1)!;
    m15[m15.length - 1] = { t: last.t, px: last.px };
    const now = last.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    await recordClosedResearch([quote("BTC", m15)], now, store);
    const row = [...store.rows.values()].find((r) => r.barT === bucket15(last.t))!;
    assert.equal(row.ohlcv.close, last.px);
    assert.equal(row.ohlcv.open, null);
    assert.equal(row.ohlcv.high, null);
    assert.equal(row.barComplete, false);
    assert.ok(row.missing.includes("open"));
  });

  it("timestamps in the same 15m bucket share barT; forming bar is skipped", () => {
    const t0 = bucket15(1_700_000_000_000);
    const closedNow = t0 + RESEARCH_BAR_MS + 1;
    const closed = latestClosedBar(
      [bar(t0 - RESEARCH_BAR_MS, 100), bar(t0 - RESEARCH_BAR_MS + 3_000, 101)],
      closedNow,
    );
    assert.ok(closed);
    assert.equal(bucket15(closed!.t), t0 - RESEARCH_BAR_MS);
    const formingNow = t0 + 1;
    assert.equal(isFormingBar(t0, formingNow), true);
    const forming = latestClosedBar([bar(t0, 102)], formingNow);
    assert.equal(forming, null);
  });

  it("clock sync: names in the same 15m bucket share barT", () => {
    const t0 = bucket15(1_700_000_000_000);
    const start = t0 - 19 * RESEARCH_BAR_MS;
    const btc = series(20, start, 100);
    const eth = series(20, start, 200).map((b, i) => (i === 19 ? { ...b, t: b.t + 12_000 } : b));
    const now = t0 + RESEARCH_BAR_MS + 1;
    const { drafts } = draftClosedPrints([quote("BTC", btc), quote("ETH", eth)], now);
    const last = drafts.filter((d) => d.barT === t0);
    assert.equal(last.length, 2);
    assert.equal(last[0]!.barT, last[1]!.barT);
  });

  it("cross-section only uses names on the same closed barT", () => {
    const start = 1_700_000_000_000;
    const btc = series(20, start);
    const eth = series(20, start + RESEARCH_BAR_MS);
    const now = eth.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const { drafts } = draftClosedPrints([quote("BTC", btc), quote("ETH", eth)], now);
    const times = new Set(drafts.map((d) => d.barT));
    assert.ok(times.size > 1);
    for (const d of drafts) {
      assert.equal(d.xsSufficient, false);
      assert.equal(d.xs, null);
    }
  });

  it("storage error is recorded and does not fabricate a row", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    store.failNext = true;
    const diag = await recordClosedResearch([quote("BTC", m15)], now, store);
    assert.equal(diag.lastError, "storage failed");
    assert.equal(await store.count(), 0);
  });

  it("forming 15m bar is never written", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + 1;
    const store = new MemoryResearchStore();
    await recordClosedResearch([quote("BTC", m15)], now, store);
    const forming = bucket15(m15.at(-1)!.t);
    assert.equal([...store.rows.values()].some((r) => r.barT === forming), false);
    const latest = Math.max(...[...store.rows.values()].map((r) => r.barT));
    assert.equal(latest, bucket15(m15[m15.length - 2]!.t));
  });

  it("backfills closed bars after last stored, not only the latest", async () => {
    const start = 1_700_000_000_000;
    const first = series(5, start);
    const now1 = first.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    const a = await recordClosedResearch([quote("BTC", first)], now1, store);
    assert.equal(a.lastInserted, 5);
    const more = series(8, start);
    const now2 = more.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const b = await recordClosedResearch([quote("BTC", more)], now2, store);
    assert.equal(b.lastInserted, 3);
    assert.equal(b.lastDuplicate, 5);
    assert.equal(await store.count(), 8);
    assert.equal(b.gaps.length, 0);
  });

  it("reports a gap when vendor history does not cover bars after last stored", async () => {
    const t0 = bucket15(1_700_000_000_000);
    const stored = series(2, t0);
    const now1 = stored.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    await recordClosedResearch([quote("BTC", stored)], now1, store);
    const laterStart = t0 + 5 * RESEARCH_BAR_MS;
    const later = series(3, laterStart);
    const now2 = later.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const diag = await recordClosedResearch([quote("BTC", later)], now2, store);
    assert.equal(diag.lastInserted, 3);
    assert.ok(diag.gaps.length >= 1);
    const gapBars = diag.gaps.reduce((n, g) => n + g.bars, 0);
    assert.equal(gapBars, 3);
    assert.equal(await store.count(), 5);
    const times = [...store.rows.values()].map((r) => r.barT).sort((a, b) => a - b);
    assert.equal(times.includes(t0 + 2 * RESEARCH_BAR_MS), false);
    assert.equal(times.includes(t0 + 3 * RESEARCH_BAR_MS), false);
    assert.equal(times.includes(t0 + 4 * RESEARCH_BAR_MS), false);
  });

  it("fills an interior hole when vendor later has those bars; does not interpolate the rest", async () => {
    const t0 = bucket15(1_700_000_000_000);
    const first = [bar(t0, 100), bar(t0 + RESEARCH_BAR_MS, 101), bar(t0 + 4 * RESEARCH_BAR_MS, 104)];
    const now1 = t0 + 5 * RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    const a = await recordClosedResearch([quote("BTC", first)], now1, store);
    assert.equal(a.lastInserted, 3);
    const gapBars = a.gaps.reduce((n, g) => n + g.bars, 0);
    assert.equal(gapBars, 2);
    const later = series(6, t0);
    const now2 = t0 + 6 * RESEARCH_BAR_MS + 1;
    const b = await recordClosedResearch([quote("BTC", later)], now2, store);
    assert.equal(b.lastInserted, 3);
    assert.equal(b.lastDuplicate, 3);
    assert.equal(await store.count(), 6);
    assert.equal(b.gaps.length, 0);
    const times = [...store.rows.values()].map((r) => r.barT).sort((a, b) => a - b);
    assert.deepEqual(times, [
      t0,
      t0 + RESEARCH_BAR_MS,
      t0 + 2 * RESEARCH_BAR_MS,
      t0 + 3 * RESEARCH_BAR_MS,
      t0 + 4 * RESEARCH_BAR_MS,
      t0 + 5 * RESEARCH_BAR_MS,
    ]);
  });

  it("first run does not invent a gap before the vendor window", () => {
    const t0 = bucket15(1_700_000_000_000);
    const start = t0 + 5 * RESEARCH_BAR_MS;
    const m15 = series(4, start);
    const now = start + 4 * RESEARCH_BAR_MS + 1;
    const { drafts, gaps } = draftClosedPrints([quote("BTC", m15)], now);
    assert.equal(drafts.length, 4);
    assert.equal(gaps.length, 0);
    assert.equal(drafts[0]!.barT, bucket15(start));
  });
});

describe("Research recorder isolation", () => {
  it("does not import the V2.4 engine, Kai, Iris, or sizing", () => {
    const src = readFileSync(new URL("./research-recorder.ts", import.meta.url), "utf8");
    assert.equal(/from ["'][^"']*decision-engine/.test(src), false);
    assert.equal(/kaiValidate/.test(src), false);
    assert.equal(/irisRules/.test(src), false);
    assert.equal(/from ["']@\/lib\/desk\/size/.test(src), false);
    assert.equal(/import type \{[^}]*DeskBook/.test(src), false);
    const store = readFileSync(new URL("./research-store.ts", import.meta.url), "utf8");
    assert.equal(/from ["']@\/lib\/db["']/.test(store), false);
    assert.equal(/from ["'][^"']*decision-engine/.test(store), false);
    assert.equal(/from ["'][^"']*desk\/engine/.test(store), false);
    const tick = readFileSync(new URL("./research-tick.ts", import.meta.url), "utf8");
    assert.equal(/from ["'][^"']*decision-engine/.test(tick), false);
  });

  it("golden 01 ticket and score stay identical", () => {
    const g = GOLDEN.find((row) => row.id === "01");
    assert.ok(g?.snap);
    const r = runLocalV2({ snap: g.snap(), locale: "en" });
    assert.equal(r.finalScore, 63.66);
    assert.equal(r.order?.symbol, "BTC");
    assert.equal(r.order?.side, "buy");
    assert.equal(r.band, "small");
    assert.equal(r.engineVersion, "2.4");
    assert.ok(r.order);
  });
});
