import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ashSnapshot, vesperSnapshot } from "./core/snapshots.ts";
import { ashReversionScore, vesperMomentumScore } from "./math.ts";
import { atrStopFloor, researchTape } from "./research.ts";
import {
  lastCloseMove,
  moveOverAtr,
  trueRange,
  volatilityFeatures,
  wilderAtr,
} from "../market/volatility.ts";
import type { MarketSnapshot, TickBar, TickerSnapshot } from "../types.ts";

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
    buySetup: "pullback",
    buyRetrace: 31,
    buyTf: "1h",
    buyWick: true,
    buyFvg: { low: 99_200, high: 99_600 },
    buyLimit: 99_400,
    ...over,
  };
}

describe("True Range / Wilder ATR", () => {
  it("A — prev close inside the bar does not inflate TR past high-low", () => {
    assert.equal(trueRange(110, 100, 105), 10);
  });

  it("B — gap up: TR is high − prevClose", () => {
    assert.equal(trueRange(120, 115, 100), 20);
  });

  it("C — gap down: TR is prevClose − low", () => {
    assert.equal(trueRange(90, 85, 100), 15);
  });

  it("D — Wilder ATR seeds on the first period then recurrences", () => {
    const bars: TickBar[] = [
      bar(9, 10, 8),
      bar(10, 11, 9),
      bar(11, 12, 10),
      bar(9, 10, 8),
      bar(12, 13, 9),
    ];
    const atr = wilderAtr(bars, 3);
    assert.ok(atr != null);
    assert.ok(Math.abs(atr! - 26 / 9) < 1e-12);
  });

  it("E — insufficient history is null, never a fabricated value", () => {
    assert.equal(wilderAtr([], 14), null);
    assert.equal(wilderAtr([bar(1, 1, 1)], 14), null);
    assert.equal(wilderAtr(Array.from({ length: 14 }, (_, i) => bar(100 + i, 101 + i, 99 + i)), 14), null);
    assert.equal(trueRange(Number.NaN, 100, 105), null);
    assert.equal(trueRange(110, 100, Number.POSITIVE_INFINITY), null);
    assert.equal(trueRange(90, 100, 95), null);
    const vol = volatilityFeatures([bar(100, 101, 99)]);
    assert.equal(vol.atr, null);
    assert.equal(vol.atrPct, null);
    assert.equal(vol.normalizedMove, null);
    assert.equal(vol.signedMove, null);
  });
});

describe("volatility normalization", () => {
  it("same nominal move is smaller when ATR is larger", () => {
    const move = 10;
    const quiet = moveOverAtr(move, 5);
    const loud = moveOverAtr(move, 20);
    assert.equal(quiet, 2);
    assert.equal(loud, 0.5);
    assert.ok(quiet! > loud!);
  });

  it("ATR null or zero yields null — no divide by zero, no NaN/Inf", () => {
    assert.equal(moveOverAtr(10, null), null);
    assert.equal(moveOverAtr(10, 0), null);
    assert.equal(moveOverAtr(10, -1), null);
    assert.equal(moveOverAtr(Number.NaN, 5), null);
    assert.equal(moveOverAtr(Number.POSITIVE_INFINITY, 5), null);
    const n = moveOverAtr(10, 5);
    assert.ok(n != null && Number.isFinite(n));
  });

  it("volatilityFeatures wires last close-to-close over Wilder ATR", () => {
    const bars: TickBar[] = [
      bar(9, 10, 8),
      bar(10, 11, 9),
      bar(11, 12, 10),
      bar(9, 10, 8),
      bar(12, 13, 9),
    ];
    const atr = wilderAtr(bars, 3);
    const move = lastCloseMove(bars);
    assert.equal(move, 3);
    const n = moveOverAtr(move!, atr);
    assert.ok(n != null);
    assert.ok(Math.abs(n! - 3 / (26 / 9)) < 1e-12);
  });
});

describe("Alpha research tape does not change V2.4 scores", () => {
  it("Vesper score ignores Kai-derived setup labels", () => {
    const base = ticker({ buySetup: "none", buyRetrace: null, buyTf: null, buyWick: false, buyFvg: null, buyLimit: undefined });
    const labeled = ticker({ buySetup: "pullback", buyRetrace: 40, buyTf: "4h", buyWick: true });
    assert.equal(vesperMomentumScore(base, "buy"), vesperMomentumScore(labeled, "buy"));
  });

  it("Ash score ignores Kai-derived setup labels", () => {
    const base = ticker({ sellSetup: "none", buySetup: "none", buyWick: true, sellWick: false });
    const labeled = ticker({ sellSetup: "chase", buySetup: "pullback", buyWick: true, sellWick: false });
    assert.equal(ashReversionScore(base, "buy"), ashReversionScore(labeled, "buy"));
  });

  it("researchTape keeps raw features next to vol — vol null without bars", () => {
    const t = ticker();
    const tape = researchTape(t);
    assert.equal(tape.version, "1.2");
    assert.equal(tape.raw.price, 100_000);
    assert.equal(tape.raw.changePct, 1);
    assert.equal(tape.vol.atr, null);
    assert.equal(tape.vol.normalizedMove, null);
  });

  it("atrStopFloor is a research hook and stays inert on missing ATR", () => {
    assert.equal(atrStopFloor(null, 1.5), null);
    assert.equal(atrStopFloor(0, 1.5), null);
    assert.equal(atrStopFloor(10, 1.5), 15);
  });
});

describe("scout snapshots stay independent of Kai and expose research-only vol", () => {
  it("Vesper snapshot has research keys and no Kai labels; math is unchanged by labels", () => {
    const snap: MarketSnapshot = {
      tickers: [ticker()],
      headlines: [],
      book: { cash: 90_000, equity: 100_000, dayPnlPct: 0, positions: [] },
    };
    const v = vesperSnapshot(snap, null);
    const raw = JSON.stringify(v);
    assert.equal(raw.includes("buySetup"), false);
    assert.equal(raw.includes("pullback"), false);
    assert.equal(v.tickers[0]?.research.atr, null);
    const labeled = ticker();
    const plain = ticker({ buySetup: "none", buyTf: null, buyRetrace: null, buyFvg: null });
    assert.equal(vesperMomentumScore(labeled, "buy"), vesperMomentumScore(plain, "buy"));
  });

  it("Ash snapshot has no Kai labels", () => {
    const snap: MarketSnapshot = {
      tickers: [ticker({ buySetup: "pullback", sellSetup: "chase" })],
      headlines: [],
      book: { cash: 90_000, equity: 100_000, dayPnlPct: 0, positions: [] },
    };
    const a = JSON.stringify(ashSnapshot(snap, null));
    assert.equal(a.includes("buySetup"), false);
    assert.equal(a.includes("chase"), false);
    assert.equal(a.includes("pullback"), false);
  });
});
