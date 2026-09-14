import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { estimateFactors, FACTOR_MIN_OBS, leaveOneOutMean, type FactorPanel, type FactorPrint } from "./factors.ts";
import { researchDebugBook, researchTape } from "./research.ts";
import { GOLDEN } from "./golden/catalog.ts";
import { runLocalV2 } from "./local-v2.ts";
import { vesperMomentumScore } from "./math.ts";
import type { TickerSnapshot } from "../types.ts";

function print(t: number, pairs: Array<[string, number | null]>): FactorPrint {
  return { t, rows: pairs.map(([symbol, signedMove]) => ({ symbol, signedMove })) };
}

function panelOf(series: Record<string, Array<number | null>>, times?: number[]): FactorPanel {
  const names = Object.keys(series);
  const n = series[names[0]!]!.length;
  const ts = times ?? Array.from({ length: n }, (_, i) => i + 1);
  return ts.map((t, i) => print(t, names.map((s) => [s, series[s]![i] ?? null])));
}

describe("Phase 3 factor residual", () => {
  it("A — perfect tracker: y = 2x ⇒ beta 2, residual ~ 0", () => {
    const panel = panelOf({
      ETH: [1, 2, 3, 4, 5],
      BTC: [2, 4, 6, 8, 10],
    });
    const f = estimateFactors(panel, "BTC", 5);
    assert.equal(f.sufficient, true);
    assert.equal(f.observationCount, 5);
    assert.ok(Math.abs(f.marketBeta! - 2) < 1e-12);
    assert.ok(Math.abs(f.marketAlpha!) < 1e-12);
    assert.ok(Math.abs(f.marketResidual!) < 1e-12);
    assert.ok(Math.abs(f.residual!) < 1e-12);
    assert.equal(f.marketFactor, 5);
    assert.equal(f.marketFitted, 10);
  });

  it("B — unrelated series keeps a material residual", () => {
    const panel = panelOf({
      ETH: [1, 2, 3, 4, 5],
      BTC: [10, -4, 8, -1, 3],
    });
    const f = estimateFactors(panel, "BTC", 5);
    assert.equal(f.sufficient, true);
    assert.ok(Math.abs(f.residual!) > 1);
  });

  it("C — constant market: beta and residual null, no divide-by-zero", () => {
    const panel = panelOf({
      ETH: [3, 3, 3, 3, 3],
      BTC: [1, 2, 3, 4, 5],
    });
    const f = estimateFactors(panel, "BTC", 5);
    assert.equal(f.marketBeta, null);
    assert.equal(f.marketResidual, null);
    assert.equal(f.residual, null);
    assert.equal(f.sufficient, false);
    assert.equal(f.observationCount, 5);
  });

  it("D — insufficient history is null", () => {
    const panel = panelOf({
      ETH: [1, 2],
      BTC: [2, 4],
    });
    const f = estimateFactors(panel, "BTC", 2);
    assert.ok(f.observationCount < FACTOR_MIN_OBS);
    assert.equal(f.sufficient, false);
    assert.equal(f.marketBeta, null);
    assert.equal(f.residual, null);
  });

  it("E — null observations are dropped, not fabricated", () => {
    const panel = panelOf({
      ETH: [1, null, 3, 4, 5, 6],
      BTC: [2, 99, 6, 8, 10, 12],
    });
    const f = estimateFactors(panel, "BTC", 6);
    assert.equal(f.observationCount, 5);
    assert.equal(f.sufficient, true);
    assert.ok(Math.abs(f.marketBeta! - 2) < 1e-12);
    assert.ok(Math.abs(f.residual!) < 1e-12);
  });

  it("F — future print at T+1 does not change residual at T", () => {
    const base = panelOf({
      ETH: [1, 2, 3, 4, 5],
      BTC: [2, 4, 6, 8, 10],
    });
    const at5 = estimateFactors(base, "BTC", 5);
    const withFuture = [...base, print(6, [["ETH", 99], ["BTC", 0]])];
    const still5 = estimateFactors(withFuture, "BTC", 5);
    assert.deepEqual(still5, at5);
    const at6 = estimateFactors(withFuture, "BTC", 6);
    assert.notEqual(at6.residual, at5.residual);
  });

  it("G — ETH moves BTC only through the leave-one-out market factor", () => {
    const a = panelOf({
      ETH: [1, 2, 3, 4, 5],
      GOLD: [0, 0, 0, 0, 0],
      BTC: [2, 4, 6, 8, 10],
    });
    const b = panelOf({
      ETH: [1, 2, 3, 4, 9],
      GOLD: [0, 0, 0, 0, 0],
      BTC: [2, 4, 6, 8, 10],
    });
    const fa = estimateFactors(a, "BTC", 5);
    const fb = estimateFactors(b, "BTC", 5);
    assert.notEqual(fa.marketFactor, fb.marketFactor);
    assert.notEqual(fa.residual, fb.residual);
    const untouchedGold = panelOf({
      ETH: [1, 2, 3, 4, 5],
      GOLD: [0, 0, 0, 0, 7],
      BTC: [2, 4, 6, 8, 10],
    });
    const fg = estimateFactors(untouchedGold, "BTC", 5);
    assert.notEqual(fa.marketFactor, fg.marketFactor);
    const noGhost = estimateFactors(a, "BTC", 5);
    assert.deepEqual(noGhost, fa);
  });

  it("H — same-sector peer is the sector factor; market still uses the full LOO set", () => {
    const panel = panelOf({
      ETH: [1, 2, 3, 4, 5],
      SPY: [0, 0, 0, 0, 0],
      GOLD: [0, 0, 0, 0, 0],
      BTC: [2, 4, 6, 8, 10],
    });
    const f = estimateFactors(panel, "BTC", 5);
    assert.equal(f.sector, "crypto");
    assert.equal(f.sectorFactor, 5);
    assert.ok(f.marketFactor != null);
    assert.notEqual(f.marketFactor, f.sectorFactor);
    assert.ok(f.sectorBeta != null);
  });

  it("I — no sector peers ⇒ sector outputs stay null, market residual still used", () => {
    const panel = panelOf({
      SPY: [1, 2, 3, 4, 5],
      GOLD: [0, 0, 0, 0, 0],
      BTC: [2, 4, 6, 8, 10],
    });
    const f = estimateFactors(panel, "BTC", 5);
    assert.equal(f.sector, "crypto");
    assert.equal(f.sectorFactor, null);
    assert.equal(f.sectorBeta, null);
    assert.equal(f.sectorResidual, null);
    assert.equal(f.sufficient, true);
    assert.ok(f.marketResidual != null);
    assert.equal(f.residual, f.marketResidual);
  });
});

describe("Phase 3 isolation / locks", () => {
  it("snapshot-only debug book does not fabricate beta", () => {
    const tickers: TickerSnapshot[] = [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 100,
        open: 99,
        changePct: 1,
        high: 101,
        low: 98,
        rsi: 50,
        vsSma: 0,
        livePx: 100,
        liveBps: 0,
        vol: { method: "wilder", period: 14, tf: "15m", atr: 1, atrPct: 1, normalizedMove: 1, signedMove: 1.2 },
      },
    ];
    const rows = researchDebugBook(tickers);
    assert.equal(rows[0]!.factors.sufficient, false);
    assert.equal(rows[0]!.factors.marketBeta, null);
    assert.equal(rows[0]!.factors.residual, null);
    assert.equal(researchTape(tickers[0]!).factors.sufficient, false);
  });

  it("L — Vesper lean still ignores Kai labels", () => {
    const tape = { buyWick: true as const, sellWick: false as const };
    const base: TickerSnapshot = {
      symbol: "BTC",
      name: "Bitcoin",
      price: 100_000,
      open: 99_000,
      changePct: 1,
      high: 101_000,
      low: 98_500,
      rsi: 60,
      vsSma: 1,
      livePx: 100_000,
      liveBps: 0,
      rvol: 1.2,
      ...tape,
      buySetup: "none",
    };
    const labeled = { ...base, buySetup: "pullback" as const, buyRetrace: 40, buyTf: "4h" as const };
    assert.equal(researchTape(base).alpha.vesperLean, researchTape(labeled).alpha.vesperLean);
    assert.equal(vesperMomentumScore(base, "buy"), vesperMomentumScore(labeled, "buy"));
  });

  it("M — golden 01 ticket and score unchanged", () => {
    const g = GOLDEN.find((row) => row.id === "01");
    assert.ok(g?.snap);
    const r = runLocalV2({ snap: g.snap(), locale: "en" });
    assert.equal(r.finalScore, 63.66);
    assert.equal(r.order?.symbol, "BTC");
    assert.equal(r.band, "small");
    assert.equal(r.engineVersion, "2.4");
  });

  it("factors module does not import agents or Kai", () => {
    const src = readFileSync(new URL("./factors.ts", import.meta.url), "utf8");
    assert.equal(src.includes("vesperMomentumScore"), false);
    assert.equal(src.includes("kaiKind"), false);
    assert.equal(src.includes("damianSectorScores"), false);
  });

  it("leave-one-out mean ignores self and nulls", () => {
    assert.equal(
      leaveOneOutMean(
        [
          { symbol: "BTC", signedMove: 10 },
          { symbol: "ETH", signedMove: 2 },
          { symbol: "SPY", signedMove: 4 },
          { symbol: "GOLD", signedMove: null },
        ],
        "BTC",
      ),
      3,
    );
  });
});
