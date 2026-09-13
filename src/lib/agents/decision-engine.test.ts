import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bandOf, decisionEngine, disagreement } from "./decision-engine.ts";
import { HARD, WEIGHTS } from "./core/scoring.ts";
import type { AshOutput, DamianOutput, KaiOutput, VesperOutput } from "./core/types.ts";
import { validateDamian } from "./core/validators.ts";
import type { MarketSnapshot } from "../types.ts";

function emptySnap(): MarketSnapshot {
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
        buyLimit: 112850,
        buyRetrace: 31,
        buyFvg: { low: 112700, high: 112980 },
        buyTf: "1h",
      },
    ],
    headlines: [],
    book: { cash: 90_000, equity: 100_000, dayPnlPct: 0.2, positions: [] },
  };
}

function vesper(score: number, side: "buy" | "sell" = "buy"): VesperOutput {
  return {
    agent: "vesper",
    runId: "v",
    timestamp: 1,
    marketStateHash: "h",
    ideas: [
      {
        symbol: "BTC",
        side,
        score,
        confidence: 0.8,
        setup: "momentum_continuation",
        evidence: [],
        invalidation: { type: "structure", price: 111920 },
        thesis: "momentum",
      },
    ],
    marketView: side === "buy" ? "bullish" : "bearish",
    noTradeReason: null,
    recommendation: { direction: side, strength: score, confidence: 0.8 },
    knowledgeUsed: [],
    source: "local",
  };
}

function ash(score: number, side: "buy" | "sell" = "buy"): AshOutput {
  return {
    agent: "ash",
    runId: "a",
    timestamp: 1,
    marketStateHash: "h",
    ideas: [
      {
        symbol: "BTC",
        side,
        score,
        confidence: 0.7,
        setup: "overextension_reversion",
        evidence: [],
        targetType: "mean",
        invalidation: { type: "continuation", price: 4210 },
        thesis: "reversion",
      },
    ],
    marketView: "reversion",
    recommendation: { direction: side, strength: score, confidence: 0.7 },
    knowledgeUsed: [],
    source: "local",
  };
}

function kai(status: "ready" | "wait" | "blocked", side: "buy" | "sell" = "buy", quality = 91, rr = 3.08): KaiOutput {
  const row = {
    symbol: "BTC",
    side,
    status,
    setupType: "1h_fvg_pullback",
    timeframe: "1h" as const,
    fvg: { low: 112700, high: 112980 },
    retracementPct: 31,
    entryType: "limit" as const,
    entryPrice: status === "blocked" ? null : 112850,
    invalidation: 111920,
    target: 115600,
    rr,
    qualityScore: quality,
    evidence: ["1h FVG"],
    reason: "setup",
  };
  return {
    agent: "kai",
    runId: "k",
    timestamp: 1,
    marketStateHash: "h",
    scan: [row],
    primary: row,
    recommendation: { direction: status === "blocked" ? "hold" : side, strength: quality, confidence: 0.8 },
    knowledgeUsed: [],
    source: "local",
  };
}

function damian(cryptoScore: number): DamianOutput {
  return validateDamian({
    agent: "damian",
    runId: "d",
    timestamp: 1,
    marketStateHash: "h",
    regime: cryptoScore < -20 ? "risk_off" : "cautious",
    confidence: 0.81,
    sectors: [
      { id: "equities", stance: "neutral", score: 0, why: "—" },
      { id: "crypto", stance: cryptoScore < 0 ? "bearish" : "bullish", score: cryptoScore, why: "cap" },
      { id: "metals", stance: "neutral", score: 0, why: "—" },
      { id: "dollar", stance: "neutral", score: 0, why: "—" },
      { id: "vol", stance: "neutral", score: 0, why: "—" },
    ],
    cryptoMarketCap: { usd: 3.12e12, changePct: -2.4 },
    macroEvents: [],
    summary: "macro",
    recommendation: { direction: "hold", strength: 0, confidence: 0.81 },
    knowledgeUsed: [],
    source: "local",
  });
}

describe("decision engine V2.2", () => {
  it("reproduces the spec weighted example", () => {
    const final =
      82 * WEIGHTS.vesper * 1.1 +
      35 * WEIGHTS.ash * 0.92 +
      91 * WEIGHTS.kai * 1.17 +
      -61 * WEIGHTS.damian +
      12 * WEIGHTS.historical;
    assert.ok(Math.abs(final - 51.98) < 0.05);
    assert.equal(bandOf(final), "wait");
  });

  it("rejects when scout score is below 60", () => {
    const d = decisionEngine({
      vesper: vesper(40),
      ash: ash(20),
      kai: kai("ready"),
      damian: damian(0),
      snap: emptySnap(),
      locale: "en",
    });
    assert.equal(d.gate.scoutScore, false);
    assert.equal(d.gate.passed, false);
  });

  it("rejects when Kai is blocked", () => {
    const d = decisionEngine({
      vesper: vesper(82),
      ash: ash(35),
      kai: kai("blocked"),
      damian: damian(-61),
      snap: emptySnap(),
      locale: "en",
    });
    assert.equal(d.gate.kaiNotBlocked, false);
    assert.equal(d.gate.passed, false);
  });

  it("rejects when RR is below 1.5", () => {
    const d = decisionEngine({
      vesper: vesper(82),
      ash: ash(35),
      kai: kai("ready", "buy", 91, 1.1),
      damian: damian(0),
      snap: emptySnap(),
      locale: "en",
    });
    assert.equal(d.gate.rr, false);
    assert.equal(d.gate.passed, false);
  });

  it("flags high disagreement when Vesper and Ash oppose at high score", () => {
    const agree = disagreement(89, -82, 91);
    assert.equal(agree.level, "low");
    const d = decisionEngine({
      vesper: vesper(89, "buy"),
      ash: ash(82, "sell"),
      kai: kai("ready", "buy"),
      damian: damian(-61),
      snap: emptySnap(),
      locale: "en",
    });
    assert.equal(d.agreement.level, "low");
    assert.equal(d.gate.passed, false);
  });

  it("passes the entry gate on a clean aligned setup", () => {
    const d = decisionEngine({
      vesper: vesper(82),
      ash: ash(35),
      kai: kai("ready", "buy", 91, 3.08),
      damian: damian(20),
      snap: emptySnap(),
      locale: "en",
    });
    assert.equal(d.gate.scoutScore, true);
    assert.equal(d.gate.kaiNotBlocked, true);
    assert.equal(d.gate.kaiDirection, true);
    assert.equal(d.gate.rr, true);
    assert.equal(d.symbol, "BTC");
    assert.equal(d.side, "buy");
    assert.ok(d.gate.passed);
    assert.ok(d.finalScore > 0);
  });

  it("Damian never contributes a ticker vote", () => {
    const d = damian(-61);
    assert.equal(d.recommendation.direction, "hold");
    assert.equal(HARD.MIN_SCOUT_SCORE, 60);
    assert.equal(HARD.MIN_RR, 1.5);
  });
});
