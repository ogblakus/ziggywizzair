import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runLocalV2 } from "./local-v2.ts";
import { justBelowBand60, snap as goldenSnap } from "./golden/fixtures.ts";
import type { CouncilResult, MarketSnapshot } from "../types.ts";

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

  it("hysteresis is per-symbol and per-side, not a global last band", () => {
    const tape = goldenSnap([justBelowBand60("BTC")]);
    const fresh = runLocalV2({ snap: tape, locale: "en" });
    assert.equal(fresh.order, null);
    assert.equal(fresh.band, "wait");

    const lastEth: CouncilResult = {
      ...fresh,
      band: "small",
      order: { side: "buy", symbol: "ETH", qty: 1, rationale: "last ETH" },
    };
    const fromEth = runLocalV2({ snap: tape, locale: "en", last: lastEth });
    assert.equal(fromEth.order, null);
    assert.equal(fromEth.band, "wait");

    const lastBtc: CouncilResult = {
      ...fresh,
      band: "small",
      order: { side: "buy", symbol: "BTC", qty: 0.03, rationale: "last BTC" },
    };
    const fromBtc = runLocalV2({ snap: tape, locale: "en", last: lastBtc });
    assert.ok(fromBtc.order);
    assert.equal(fromBtc.order?.symbol, "BTC");
    assert.equal(fromBtc.band, "small");

    const lastOpp: CouncilResult = {
      ...fresh,
      band: "small",
      order: { side: "sell", symbol: "BTC", qty: 0.03, rationale: "last short" },
    };
    const fromOpp = runLocalV2({ snap: tape, locale: "en", last: lastOpp });
    assert.equal(fromOpp.order, null);
  });

  it("Kai wait shows HOLD on the card, not the observed side", () => {
    const result = runLocalV2({
      snap: goldenSnap([
        justBelowBand60("BTC", {
          buySetup: "none",
          buyLimit: undefined,
          buyFvg: null,
        }),
      ]),
      locale: "en",
    });
    const kai = result.agents.find((a) => a.id === "kai");
    assert.equal(kai?.vote, "hold");
  });
});
