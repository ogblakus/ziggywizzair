import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AshLlmSchema, DamianLlmSchema, IrisLlmSchema, VesperLlmSchema } from "./schemas.ts";
import { KNOWLEDGE_VERSION, PROMPT_VERSION, SCHEMA_VERSION } from "./versions.ts";
import { validateDamian, validateIris, validateVesper, emptyChecks } from "./validators.ts";
import { kaiValidate, vesperFallback, damianFallback, irisRules } from "../local-models.ts";
import type { DamianOutput, DecisionDraft, IrisOutput, VesperOutput } from "./types.ts";
import type { MarketSnapshot } from "../../types.ts";

function snap(): MarketSnapshot {
  return {
    tickers: [
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 100_000,
        open: 99_000,
        changePct: 1.2,
        high: 101_000,
        low: 98_500,
        rsi: 62,
        vsSma: 1.1,
        livePx: 100_000,
        liveBps: 0,
        rvol: 1.1,
        buySetup: "pullback",
        buyLimit: 99_400,
        buyRetrace: 31,
        buyFvg: { low: 99_200, high: 99_600 },
        buyTf: "1h",
      },
    ],
    headlines: [],
    book: { cash: 90_000, equity: 100_000, dayPnlPct: 0.2, positions: [] },
  };
}

describe("V2 agent role contracts", () => {
  it("Zod strips qty/sizePct off scout payloads — they never enter typed output", () => {
    const vesper = VesperLlmSchema.parse({
      ideas: [{ symbol: "BTC", side: "buy", score: 80 }],
      qty: 12,
      sizePct: 5,
      finalOrder: { side: "buy" },
    });
    assert.equal("qty" in vesper, false);
    assert.equal("sizePct" in vesper, false);
    assert.equal("finalOrder" in vesper, false);

    const ash = AshLlmSchema.parse({
      ideas: [{ symbol: "BTC", side: "sell" }],
      qty: 3,
      risk: { finalSizePct: 9 },
    });
    assert.equal("qty" in ash, false);
    assert.equal("risk" in ash, false);
  });

  it("Damian recommendation is forced to hold even if the model votes a ticker", () => {
    const raw: DamianOutput = {
      agent: "damian",
      runId: "d",
      timestamp: 1,
      marketStateHash: "h",
      regime: "cautious",
      confidence: 0.9,
      sectors: [
        { id: "equities", stance: "neutral", score: 0, why: "—" },
        { id: "crypto", stance: "bullish", score: 40, why: "bid" },
        { id: "metals", stance: "neutral", score: 0, why: "—" },
        { id: "dollar", stance: "neutral", score: 0, why: "—" },
        { id: "vol", stance: "neutral", score: 0, why: "—" },
      ],
      cryptoMarketCap: { usd: 2e12, changePct: 1 },
      macroEvents: [],
      summary: "x",
      recommendation: { direction: "buy", strength: 99, confidence: 1 },
      knowledgeUsed: [],
      source: "llm",
    };
    const out = validateDamian(raw);
    assert.equal(out.recommendation.direction, "hold");
    assert.equal(out.recommendation.strength, 0);
    const parsed = DamianLlmSchema.parse({
      recommendation: { direction: "sell", strength: 80, confidence: 1 },
      sectors: [{ id: "crypto", stance: "bearish", score: -20, why: "dxy" }],
    });
    assert.equal(parsed.recommendation?.direction, "sell");
  });

  it("Kai Validate keeps the engine side — it does not flip buy to sell", () => {
    const row = kaiValidate(snap(), "BTC", "buy", "en");
    assert.ok(row);
    assert.equal(row!.side, "buy");
    const sell = kaiValidate(snap(), "BTC", "sell", "en");
    assert.ok(sell);
    assert.equal(sell!.side, "sell");
  });

  it("Iris typed order carries sizePct, never qty, and validate clamps size", () => {
    const parsed = IrisLlmSchema.parse({
      decision: "approve",
      qty: 8,
      risk: { finalSizePct: 3.2 },
      order: { type: "limit", price: 99_400, sizePct: 3.2 },
    });
    assert.equal("qty" in parsed, false);
    assert.equal(parsed.order?.sizePct, 3.2);

    const iris: IrisOutput = {
      agent: "iris",
      runId: "i",
      timestamp: 1,
      decision: "approve",
      symbol: "BTC",
      side: "buy",
      risk: {
        basePct: 3.2,
        macroMultiplier: 1,
        portfolioMultiplier: 1,
        performanceMultiplier: 1,
        disagreementMultiplier: 1,
        finalSizePct: 99,
      },
      order: { type: "limit", price: 99_400, sizePct: 99 },
      riskReward: { stop: 98_500, target: 102_000, rr: 2.5 },
      checks: emptyChecks(),
      reason: "sized",
      source: "llm",
    };
    const out = validateIris(iris, snap(), emptyChecks());
    assert.ok(out.risk.finalSizePct <= 6);
    assert.equal("qty" in (out.order ?? {}), false);
  });

  it("Vesper validate drops unknown symbols and never attaches size", () => {
    const raw: VesperOutput = {
      agent: "vesper",
      runId: "v",
      timestamp: 1,
      marketStateHash: "h",
      ideas: [
        {
          symbol: "FAKECOIN",
          side: "buy",
          score: 99,
          confidence: 1,
          setup: "x",
          evidence: [],
          invalidation: { type: "structure", price: 1 },
          thesis: "invented",
        },
        {
          symbol: "BTC",
          side: "buy",
          score: 82,
          confidence: 0.8,
          setup: "momentum_continuation",
          evidence: [],
          invalidation: { type: "structure", price: 98_500 },
          thesis: "momentum",
        },
      ],
      marketView: "bullish",
      noTradeReason: null,
      recommendation: { direction: "buy", strength: 82, confidence: 0.8 },
      knowledgeUsed: [],
      source: "local",
    };
    const out = validateVesper(raw, snap());
    assert.equal(out.ideas.length, 1);
    assert.equal(out.ideas[0]?.symbol, "BTC");
    assert.equal("qty" in out, false);
    assert.equal("sizePct" in out, false);
  });

  it("local envelopes stamp prompt/knowledge/schema versions", () => {
    const market = snap();
    const vesper = vesperFallback(market, "en", "hash");
    assert.equal(vesper.promptVersion, PROMPT_VERSION.vesper);
    assert.equal(vesper.knowledgeVersion, KNOWLEDGE_VERSION.vesper);
    assert.equal(vesper.schemaVersion, SCHEMA_VERSION);
    assert.equal(vesper.source, "local");
    assert.ok(vesper.marketStateHash);

    const damian = damianFallback(market, "en", "hash");
    assert.equal(damian.recommendation.direction, "hold");
    assert.equal(damian.promptVersion, PROMPT_VERSION.damian);

    const draft: DecisionDraft = {
      decisionId: "d1",
      symbol: "BTC",
      side: "buy",
      finalScore: 64,
      band: "small",
      agreement: { direction: "buy", level: "high", score: 1 },
      contributors: { vesper: 90, ash: 0, kai: 90, damian: 20, historical: 0 },
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
      risk: { sizePct: 3.2, stop: 98_500, target: 102_000, rr: 2.5 },
      cut: false,
    };
    const iris = irisRules({ locale: "en", decision: draft, checks: emptyChecks() });
    assert.equal(iris.source, "rules");
    assert.equal(iris.promptVersion, PROMPT_VERSION.iris);
    assert.equal(iris.schemaVersion, SCHEMA_VERSION);
    assert.equal("qty" in (iris.order ?? {}), false);
  });
});
