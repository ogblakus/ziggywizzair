import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDeskView, kaiFace } from "./desk-view.ts";
import { GOLDEN } from "./golden/catalog.ts";
import { runLocalV2 } from "./local-v2.ts";
import type { AshOutput, DamianOutput, DecisionDraft, IrisOutput, KaiOutput, VesperOutput } from "./core/types.ts";

function draft(over: Partial<DecisionDraft> = {}): DecisionDraft {
  return {
    decisionId: "d",
    symbol: "BTC",
    side: "buy",
    finalScore: 63.66,
    band: "small",
    agreement: { direction: "buy", level: "medium", score: 0.4 },
    contributors: { vesper: 25, ash: 10, kai: 20, damian: 5, historical: 0 },
    multipliers: { vesper: 1, ash: 1, kai: 1 },
    gate: {
      passed: true,
      scoutScore: true,
      kaiNotBlocked: true,
      kaiDirection: true,
      rr: true,
      portfolio: true,
      reasons: [],
    },
    entry: { type: "limit", price: 99_400 },
    risk: { sizePct: 3.2, stop: 98_420, target: 101_400, rr: 2.04 },
    cut: false,
    ...over,
  };
}

const vesper: VesperOutput = {
  agent: "vesper",
  runId: "v",
  timestamp: 1,
  source: "local",
  marketStateHash: "h",
  ideas: [
    {
      symbol: "BTC",
      side: "buy",
      score: 82,
      confidence: 0.78,
      setup: "momentum_continuation",
      evidence: [
        { metric: "changePct", value: 1.8 },
        { metric: "vsSma", value: 1.8 },
        { metric: "rvol", value: 1.42 },
        { metric: "rsi", value: 64 },
        { metric: "buySetup", value: "pullback" },
      ],
      invalidation: { type: "structure", price: 1 },
      thesis: "expansion",
    },
  ],
  marketView: "bullish",
  noTradeReason: null,
  recommendation: { direction: "buy", strength: 82, confidence: 0.78 },
  knowledgeUsed: [],
};

const ash: AshOutput = {
  agent: "ash",
  runId: "a",
  timestamp: 1,
  source: "local",
  marketStateHash: "h",
  ideas: [],
  marketView: "none",
  recommendation: { direction: "hold", strength: 0, confidence: 0.45 },
  knowledgeUsed: [],
};

const kaiWait: KaiOutput = {
  agent: "kai",
  runId: "k",
  timestamp: 1,
  source: "local",
  marketStateHash: "h",
  scan: [],
  primary: {
    symbol: "BTC",
    side: "buy",
    status: "wait",
    setupType: "pullback",
    timeframe: "15m",
    fvg: null,
    retracementPct: null,
    entryType: "limit",
    entryPrice: 99_400,
    invalidation: 98_420,
    target: 100_000,
    rr: 1.18,
    qualityScore: 48,
    evidence: [],
    reason: "RR 1.18 below minimum",
  },
  recommendation: { direction: "buy", strength: 48, confidence: 0.4 },
  knowledgeUsed: [],
};

const damian: DamianOutput = {
  agent: "damian",
  runId: "d",
  timestamp: 1,
  source: "local",
  marketStateHash: "h",
  regime: "risk_on",
  confidence: 0.6,
  sectors: [
    { id: "crypto", stance: "bullish", score: 64, why: "bid" },
    { id: "equities", stance: "bullish", score: 31, why: "spy" },
    { id: "metals", stance: "neutral", score: 12, why: "—" },
    { id: "dollar", stance: "neutral", score: 0, why: "—" },
    { id: "vol", stance: "neutral", score: 0, why: "—" },
  ],
  cryptoMarketCap: { usd: null, changePct: null },
  macroEvents: [],
  summary: "risk-on",
  recommendation: { direction: "hold", strength: 0, confidence: 0.6 },
  knowledgeUsed: [],
};

const iris: IrisOutput = {
  agent: "iris",
  runId: "i",
  timestamp: 1,
  source: "rules",
  decision: "wait",
  symbol: "BTC",
  side: "buy",
  risk: {
    basePct: 3.2,
    macroMultiplier: 1,
    portfolioMultiplier: 1,
    performanceMultiplier: 1,
    disagreementMultiplier: 1,
    finalSizePct: 0,
  },
  order: null,
  riskReward: null,
  checks: {
    openLegLimit: true,
    restingOrderLimit: true,
    feeLimit: true,
    teamLock: true,
    liquidity: true,
    drawdown: true,
    scoutScore: true,
    kaiStatus: false,
    kaiDirection: true,
    rr: false,
  },
  reason: "Kai wait",
};

describe("desk view is read-only", () => {
  it("strips Kai setup labels from Vesper evidence", () => {
    const view = buildDeskView({ vesper, ash, kai: kaiWait, damian, iris, decision: draft() });
    assert.equal(
      view.vesper.evidence.some((e) => /setup|pullback/i.test(e.metric) || /pullback/i.test(String(e.value))),
      false,
    );
    assert.ok(view.vesper.evidence.some((e) => e.metric === "rvol"));
  });

  it("Kai wait stays WAIT in the face, internal side is not used as a vote", () => {
    const view = buildDeskView({ vesper, ash, kai: kaiWait, damian, iris, decision: draft() });
    assert.equal(view.kai.status, "wait");
    assert.equal(view.kai.side, "buy");
    assert.equal(kaiFace(view.kai.status), "wait");
  });

  it("does not invent geometry when RR is missing", () => {
    const bare: KaiOutput = {
      ...kaiWait,
      primary: { ...kaiWait.primary!, entryPrice: null, invalidation: null, target: null, rr: 0 },
    };
    const view = buildDeskView({ vesper, ash, kai: bare, damian, iris, decision: draft() });
    assert.equal(view.geometry.valid, false);
    assert.equal(view.geometry.entry, null);
    assert.equal(view.geometry.stop, null);
    assert.equal(view.geometry.target, null);
  });

  it("golden 01 ticket and score stay identical after attaching view", () => {
    const g = GOLDEN.find((row) => row.id === "01");
    assert.ok(g?.snap);
    const r = runLocalV2({ snap: g.snap(), locale: "en" });
    assert.equal(r.finalScore, 63.66);
    assert.equal(r.order?.symbol, "BTC");
    assert.equal(r.order?.side, "buy");
    assert.equal(r.band, "small");
    assert.ok(r.view);
    assert.equal(r.view.score, 63.66);
  });
});
