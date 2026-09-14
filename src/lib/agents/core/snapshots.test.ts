import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ashSnapshot, damianSnapshot, kaiSnapshot, vesperSnapshot } from "./snapshots.ts";
import type { MarketSnapshot } from "../../types.ts";

function snap(): MarketSnapshot {
  return {
    tickers: [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 112850,
        open: 111000,
        changePct: 1.42,
        high: 113400,
        low: 110900,
        rsi: 64.2,
        vsSma: 1.8,
        livePx: 112862,
        liveBps: 2,
        rvol: 1.38,
        buySetup: "pullback",
        buyRetrace: 31,
        buyTf: "1h",
        buyFvg: { low: 112700, high: 112980 },
      },
    ],
    headlines: [{ text: "Fed holds rates", shock: 0.2 }],
    book: {
      cash: 80_000,
      equity: 100_000,
      dayPnlPct: 0.4,
      positions: [],
    },
    macro: {
      vix: 16,
      vixChg: 1,
      dxy: 104,
      dxyChg: 0.2,
      cryptoMcap: 3.12e12,
      cryptoMcapPct: -2.4,
      equityPct: 0.3,
      at: 1,
    },
  };
}

describe("V2 private snapshots", () => {
  it("does not leak lastCouncil, other agents, or the book to scouts", () => {
    const s = snap();
    const v = JSON.stringify(vesperSnapshot(s, "ETH"));
    const a = JSON.stringify(ashSnapshot(s, "ETH"));
    const k = JSON.stringify(kaiSnapshot(s, "ETH"));
    for (const raw of [v, a, k]) {
      assert.equal(raw.includes("lastCouncil"), false);
      assert.equal(raw.includes("lastSession"), false);
      assert.equal(raw.includes("vesper"), false);
      assert.equal(raw.includes("iris"), false);
      assert.equal(raw.includes("\"cash\""), false);
    }
  });

  it("keeps Damian off ticker RSI and off scout opinions", () => {
    const raw = JSON.stringify(damianSnapshot(snap()));
    assert.equal(raw.includes("rsi"), false);
    assert.equal(raw.includes("vsSma"), false);
    assert.equal(raw.includes("lastCouncil"), false);
    assert.match(raw, /cryptoMcap/);
  });

  it("does not leak Kai setup verdicts to Vesper or Ash", () => {
    const s = snap();
    const v = JSON.stringify(vesperSnapshot(s, "ETH"));
    const a = JSON.stringify(ashSnapshot(s, "ETH"));
    for (const raw of [v, a]) {
      assert.equal(raw.includes("buySetup"), false);
      assert.equal(raw.includes("sellSetup"), false);
      assert.equal(raw.includes("buyRetrace"), false);
      assert.equal(raw.includes("buyFvg"), false);
      assert.equal(raw.includes("buyTf"), false);
      assert.equal(raw.includes("pullback"), false);
    }
    const k = JSON.stringify(kaiSnapshot(s, "ETH"));
    assert.match(k, /pullback/);
  });

  it("hands Vesper the code-owned momentum math", () => {
    const v = vesperSnapshot(snap(), null);
    assert.ok(v.tickers[0]?.math.long > 0);
    assert.ok(v.tickers[0]?.math.short >= 0);
  });
});
