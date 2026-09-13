import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runLocalV2 } from "./local-v2.ts";
import type { MarketSnapshot } from "../types.ts";

function snap(): MarketSnapshot {
  return {
    tickers: [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 112850,
        open: 111000,
        changePct: 1.42,
        high: 113420,
        low: 110920,
        rsi: 64,
        vsSma: 1.8,
        livePx: 112850,
        liveBps: 0,
        rvol: 0.84,
        buySetup: "pullback",
        buyLimit: 112400,
        buyRetrace: 31,
        buyFvg: { low: 112200, high: 112600 },
        buyTf: "1h",
      },
    ],
    headlines: [],
    book: { cash: 90_000, equity: 100_000, dayPnlPct: 0.2, positions: [] },
  };
}

describe("runLocalV2", () => {
  it("returns a stamped V2 result without lastCouncil", () => {
    const result = runLocalV2({ snap: snap(), locale: "pl" });
    assert.ok(result.status);
    assert.equal(result.status?.mode, "degraded");
    assert.equal(result.status?.sources.vesper, "local");
    assert.equal(result.status?.sources.iris, "rules");
    assert.equal(result.agents.length, 5);
    assert.ok(result.engineVersion);
    assert.ok(result.decisionId);
    assert.ok(result.band);
    const raw = JSON.stringify(result);
    assert.equal(raw.includes("lastCouncil"), false);
  });
});
