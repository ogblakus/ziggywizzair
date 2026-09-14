import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { MAD_TO_SIGMA, robustCrossSection } from "./cross-section.ts";
import { researchDebugBook, researchTape, signedMoveCrossSection } from "./research.ts";
import { ashReversionScore, vesperMomentumScore } from "./math.ts";
import { GOLDEN } from "./golden/catalog.ts";
import { runLocalV2 } from "./local-v2.ts";
import { lastCloseMove, moveOverAtr, signedMoveOverAtr, volatilityFeatures, wilderAtr } from "../market/volatility.ts";
import type { TickBar, TickerSnapshot } from "../types.ts";

function bar(px: number, h: number, l: number, t = 1): TickBar {
  return { t, px, o: px, h, l };
}

function ticker(over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  return {
    symbol: "BTC",
    name: "Bitcoin",
    price: 100_000,
    open: 99_000,
    changePct: 1.0,
    high: 101_000,
    low: 98_500,
    rsi: 60,
    vsSma: 1.0,
    livePx: 100_000,
    liveBps: 0,
    rvol: 1.2,
    ...over,
  };
}

function volOf(signedMove: number | null): NonNullable<TickerSnapshot["vol"]> {
  return {
    method: "wilder",
    period: 14,
    tf: "15m",
    atr: signedMove == null ? null : 1,
    atrPct: signedMove == null ? null : 1,
    normalizedMove: signedMove == null ? null : Math.abs(signedMove),
    signedMove,
  };
}

describe("robust cross-section", () => {
  it("A — [1,2,3] robust-z around the median", () => {
    const xs = robustCrossSection([
      { symbol: "a", value: 1 },
      { symbol: "b", value: 2 },
      { symbol: "c", value: 3 },
    ]);
    assert.equal(xs.method, "robust-z");
    assert.equal(xs.n, 3);
    assert.equal(xs.median, 2);
    assert.equal(xs.mad, 1);
    const scale = MAD_TO_SIGMA;
    assert.ok(Math.abs(xs.rows[0]!.z! - -1 / scale) < 1e-12);
    assert.equal(xs.rows[1]!.z, 0);
    assert.ok(Math.abs(xs.rows[2]!.z! - 1 / scale) < 1e-12);
  });

  it("B — identical values: z = 0, no divide-by-zero", () => {
    const xs = robustCrossSection([
      { symbol: "a", value: 5 },
      { symbol: "b", value: 5 },
      { symbol: "c", value: 5 },
    ]);
    assert.equal(xs.mad, 0);
    assert.ok(xs.rows.every((r) => r.z === 0));
  });

  it("C — outlier [1,2,3,100]: even-n MAD averages two central |dev| (=1, not 0.5)", () => {
    const vals = [1, 2, 3, 100];
    const xs = robustCrossSection(vals.map((v, i) => ({ symbol: String(i), value: v })));
    assert.equal(xs.median, 2.5);
    assert.equal(xs.mad, 1);
    const z100 = (100 - 2.5) / (MAD_TO_SIGMA * 1);
    assert.ok(Math.abs(xs.rows[3]!.z! - z100) < 1e-12);
    assert.ok(Math.abs(xs.rows[3]!.z! - 65.76284904896804) < 1e-12);
    const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
    const std = Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length);
    const meanZ = (100 - mean) / std;
    assert.ok(z100 > 10);
    assert.ok(meanZ < 3);
    assert.ok(z100 > meanZ * 10);
  });

  it("D — missing values are ignored, never fabricated", () => {
    const two = robustCrossSection([
      { symbol: "a", value: 1 },
      { symbol: "b", value: null },
      { symbol: "c", value: 3 },
    ]);
    assert.equal(two.n, 2);
    assert.equal(two.rows[1]!.value, null);
    assert.ok(two.rows.every((r) => r.z === null));

    const three = robustCrossSection([
      { symbol: "a", value: 1 },
      { symbol: "b", value: null },
      { symbol: "c", value: 3 },
      { symbol: "d", value: 5 },
    ]);
    assert.equal(three.n, 3);
    assert.equal(three.rows[1]!.z, null);
    assert.equal(three.rows[1]!.symbol, "b");
    assert.ok(three.rows[0]!.z != null);
  });

  it("E — BTC / ETH / SOL symbols are preserved", () => {
    const xs = robustCrossSection([
      { symbol: "BTC", value: 1.2 },
      { symbol: "ETH", value: 0.4 },
      { symbol: "SOL", value: -0.3 },
    ]);
    assert.deepEqual(
      xs.rows.map((r) => r.symbol),
      ["BTC", "ETH", "SOL"],
    );
    const btc = xs.rows[0]!.z!;
    const sol = xs.rows[2]!.z!;
    assert.ok(btc > 0);
    assert.ok(sol < 0);
  });

  it("F — single instrument is insufficient", () => {
    const xs = robustCrossSection([{ symbol: "BTC", value: 1.2 }]);
    assert.equal(xs.n, 1);
    assert.equal(xs.median, null);
    assert.equal(xs.rows[0]!.z, null);
    assert.equal(xs.rows[0]!.sufficient, false);
  });

  it("G — no look-ahead: only the values in this snapshot count", () => {
    const now = [
      { symbol: "BTC", value: 1.2 },
      { symbol: "ETH", value: 0.4 },
      { symbol: "SOL", value: -0.3 },
    ];
    const a = robustCrossSection(now);
    const future = robustCrossSection([...now, { symbol: "FUT", value: 99 }]);
    assert.equal(a.rows.length, 3);
    assert.equal(
      a.rows.find((r) => r.symbol === "FUT"),
      undefined,
    );
    assert.notEqual(a.rows[0]!.z, future.rows[0]!.z);
    const src = readFileSync(new URL("./cross-section.ts", import.meta.url), "utf8");
    assert.equal(src.includes("vesper"), false);
    assert.equal(src.includes("kaiKind"), false);
    assert.equal(src.includes("TickBar"), false);
    assert.equal(src.includes("from \"./math"), false);
  });
});

describe("Phase 2 alpha research — market-only, engine-inert", () => {
  it("H — Vesper/Ash leans ignore Kai labels", () => {
    const tape = {
      buyWick: true as const,
      sellWick: false as const,
    };
    const base = ticker({ ...tape, buySetup: "none", buyRetrace: null, buyTf: null, buyFvg: null, buyLimit: undefined, sellSetup: "none" });
    const labeled = ticker({ ...tape, buySetup: "pullback", buyRetrace: 40, buyTf: "4h", buyFvg: { low: 99_200, high: 99_600 }, sellSetup: "chase" });
    assert.equal(researchTape(base).alpha.vesperLean, researchTape(labeled).alpha.vesperLean);
    assert.equal(researchTape(base).alpha.ashLean, researchTape(labeled).alpha.ashLean);
    assert.equal(vesperMomentumScore(base, "buy"), vesperMomentumScore(labeled, "buy"));
    assert.equal(ashReversionScore(base, "buy"), ashReversionScore(labeled, "buy"));
  });

  it("cross-section uses signedMove, not agent leans or setups", () => {
    const rows = [
      ticker({ symbol: "BTC", vsSma: 3, changePct: 4, vol: volOf(1.2), buySetup: "pullback" }),
      ticker({ symbol: "ETH", vsSma: 0, changePct: 0, vol: volOf(0.4), buySetup: "none" }),
      ticker({ symbol: "SOL", vsSma: -2, changePct: -3, vol: volOf(-0.3), buySetup: "chase" }),
    ];
    const xs = signedMoveCrossSection(rows);
    assert.equal(xs.feature, "signedMove");
    assert.deepEqual(
      xs.rows.map((r) => r.value),
      [1.2, 0.4, -0.3],
    );
    const debug = researchDebugBook(rows);
    assert.equal(debug[0]!.symbol, "BTC");
    assert.ok(debug[0]!.xs != null);
    assert.ok(debug[0]!.vesperLean !== debug[2]!.vesperLean);
    assert.equal(debug[0]!.signedMove, 1.2);
  });

  it("I — Phase 1 ATR and |Δclose|/ATR stay identical", () => {
    const bars: TickBar[] = [
      bar(9, 10, 8),
      bar(10, 11, 9),
      bar(11, 12, 10),
      bar(9, 10, 8),
      bar(12, 13, 9),
    ];
    assert.ok(Math.abs(wilderAtr(bars, 3)! - 26 / 9) < 1e-12);
    const move = lastCloseMove(bars);
    assert.equal(move, 3);
    const abs = moveOverAtr(move!, wilderAtr(bars, 3));
    const signed = signedMoveOverAtr(move!, wilderAtr(bars, 3));
    assert.ok(Math.abs(abs! - 3 / (26 / 9)) < 1e-12);
    assert.ok(Math.abs(signed! - 3 / (26 / 9)) < 1e-12);
    const long = Array.from({ length: 20 }, (_, i) => bar(100, 102, 99, i));
    const vol = volatilityFeatures(long);
    assert.equal(vol.atr, 3);
    assert.equal(vol.normalizedMove, 0);
    assert.equal(vol.signedMove, 0);
  });

  it("J — golden 01 ticket and finalScore are unchanged", () => {
    const g = GOLDEN.find((row) => row.id === "01");
    assert.ok(g?.snap);
    const r = runLocalV2({ snap: g.snap(), locale: "en" });
    assert.equal(r.finalScore, 63.66);
    assert.equal(r.order?.symbol, "BTC");
    assert.equal(r.order?.side, "buy");
    assert.equal(r.band, "small");
    assert.equal(r.engineVersion, "2.4");
  });

  it("Kai/Damian verdicts are not inputs to the cross-section", () => {
    const src = readFileSync(new URL("./research.ts", import.meta.url), "utf8");
    assert.match(src, /signedMoveCrossSection/);
    assert.equal(src.includes("kaiKind"), false);
    assert.equal(src.includes("damianSectorScores"), false);
  });
});
