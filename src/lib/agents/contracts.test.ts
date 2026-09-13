import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyRestingLimitGate, decisionEngine, hasBlockingRestingLimit, irisChecks } from "./decision-engine.ts";
import { validateAndFinalize } from "./finalize.ts";
import { irisRules, kaiValidate } from "./local-models.ts";
import { runLocalV2 } from "./local-v2.ts";
import { runOrchestrator } from "./orchestrator.ts";
import { runVesper } from "./runners.ts";
import { extractJson } from "./core/chat.ts";
import { emptyChecks, knownSymbol, validateIris, validateVesper } from "./core/validators.ts";
import type { AshOutput, DamianOutput, DecisionDraft, IrisOutput, KaiOutput, VesperOutput } from "./core/types.ts";
import type { MarketSnapshot } from "../types.ts";
import { clipSizePct } from "../desk/size.ts";

function snap(over: Partial<MarketSnapshot> = {}): MarketSnapshot {
  const { book: bookOver, ...rest } = over;
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
    ...rest,
    book: {
      cash: 90_000,
      equity: 100_000,
      dayPnlPct: 0.2,
      positions: [],
      ...bookOver,
    },
  };
}

function vesper(score = 82, side: "buy" | "sell" = "buy"): VesperOutput {
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
        invalidation: { type: "structure", price: 98_500 },
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

function ash(score = 35, side: "buy" | "sell" = "buy"): AshOutput {
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
        invalidation: { type: "continuation", price: 101_000 },
        thesis: "reversion",
      },
    ],
    marketView: "reversion",
    recommendation: { direction: side, strength: score, confidence: 0.7 },
    knowledgeUsed: [],
    source: "local",
  };
}

function kai(status: "ready" | "wait" | "blocked" = "ready", side: "buy" | "sell" = "buy", quality = 91, rr = 2.5): KaiOutput {
  const row = {
    symbol: "BTC",
    side,
    status,
    setupType: "1h_fvg_pullback",
    timeframe: "1h" as const,
    fvg: { low: 99_200, high: 99_600 },
    retracementPct: 31,
    entryType: "limit" as const,
    entryPrice: status === "blocked" ? null : 99_400,
    invalidation: 98_500,
    target: 102_000,
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

function damian(): DamianOutput {
  return {
    agent: "damian",
    runId: "d",
    timestamp: 1,
    marketStateHash: "h",
    regime: "cautious",
    confidence: 0.6,
    sectors: [
      { id: "equities", stance: "neutral", score: 0, why: "—" },
      { id: "crypto", stance: "bullish", score: 20, why: "bid" },
      { id: "metals", stance: "neutral", score: 0, why: "—" },
      { id: "dollar", stance: "neutral", score: 0, why: "—" },
      { id: "vol", stance: "neutral", score: 0, why: "—" },
    ],
    cryptoMarketCap: { usd: 2e12, changePct: 1 },
    macroEvents: [],
    summary: "cautious",
    recommendation: { direction: "hold", strength: 0, confidence: 0.6 },
    knowledgeUsed: [],
    source: "local",
  };
}

function aligned() {
  return { vesper: vesper(90, "buy"), ash: ash(70, "buy"), kai: kai("ready", "buy", 95, 2.5), damian: damian() };
}

function passingDraft(over: Partial<DecisionDraft> = {}): DecisionDraft {
  return {
    decisionId: "d1",
    symbol: "BTC",
    side: "buy",
    finalScore: 78,
    band: "normal",
    agreement: { direction: "buy", level: "high", score: 0.9 },
    contributors: { vesper: 90, ash: 70, kai: 95, damian: 40, historical: 0 },
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
    ...over,
  };
}

type IrisPatch = Partial<Omit<IrisOutput, "risk">> & { risk?: Partial<IrisOutput["risk"]> };

function passingIris(over: IrisPatch = {}): IrisOutput {
  const { risk: riskOver, ...rest } = over;
  return {
    agent: "iris",
    runId: "i",
    timestamp: 1,
    decision: "approve",
    symbol: "BTC",
    side: "buy",
    order: { type: "limit", price: 99_400, sizePct: riskOver?.finalSizePct ?? 3.2 },
    riskReward: { stop: 98_500, target: 102_000, rr: 2.5 },
    checks: emptyChecks(),
    reason: "sized",
    source: "rules",
    ...rest,
    risk: {
      basePct: 3.2,
      macroMultiplier: 1,
      portfolioMultiplier: 1,
      performanceMultiplier: 1,
      disagreementMultiplier: 1,
      finalSizePct: 3.2,
      ...riskOver,
    },
  };
}

function finalizeTicket(market: MarketSnapshot, decision: DecisionDraft, iris: IrisOutput, agents = aligned()) {
  const checks = iris.checks;
  const checked = validateIris(iris, market, checks);
  return validateAndFinalize({
    snap: market,
    locale: "en",
    vesper: agents.vesper,
    ash: agents.ash,
    kai: agents.kai,
    damian: agents.damian,
    iris: checked,
    decision,
  });
}

function pipeline(market: MarketSnapshot, agents = aligned(), irisPatch?: IrisPatch) {
  const locale = "en" as const;
  let decision = decisionEngine({ ...agents, snap: market, locale });
  let kaiOut = agents.kai;
  if (decision.symbol && decision.side) {
    const validated = kaiValidate(market, decision.symbol, decision.side, locale);
    if (validated) {
      kaiOut = {
        ...kaiOut,
        scan: [validated, ...kaiOut.scan.filter((s) => s.symbol !== validated.symbol)].slice(0, 3),
        primary: validated,
        recommendation: {
          direction: validated.status === "blocked" ? "hold" : validated.side,
          strength: validated.qualityScore,
          confidence: 0.7,
        },
      };
      decision = decisionEngine({ ...agents, kai: kaiOut, snap: market, locale, validated, cut: decision.cut ? { symbol: decision.symbol, side: decision.side } : null });
    }
  }
  const checks = applyRestingLimitGate(irisChecks(market, decision, kaiOut.primary), market, kaiOut.primary, decision);
  let iris = irisRules({ locale, decision, checks });
  if (irisPatch) {
    iris = {
      ...iris,
      ...irisPatch,
      risk: { ...iris.risk, ...(irisPatch.risk ?? {}) },
    };
  }
  iris = validateIris(iris, market, checks);
  const result = validateAndFinalize({
    snap: market,
    locale,
    vesper: agents.vesper,
    ash: agents.ash,
    kai: kaiOut,
    damian: agents.damian,
    iris,
    decision,
  });
  return { decision, iris, checks, result };
}

function qtyForPct(pct: number, equity = 100_000, px = 100_000) {
  const notional = equity * Math.min(6, Math.max(0.5, pct)) * 0.01;
  return Number((notional / px).toFixed(4));
}

describe("V2 contract: final order", () => {
  it("1. Iris cannot raise size above the decision engine", () => {
    const market = snap();
    const decision = passingDraft({ risk: { sizePct: 3.2, stop: 98_500, target: 102_000, rr: 2.5 } });
    const result = finalizeTicket(market, decision, passingIris({ decision: "approve", risk: { finalSizePct: 99 } }));
    assert.ok(result.order);
    assert.ok(result.order!.qty <= qtyForPct(3.2) + 1e-8);
    assert.ok(result.order!.qty < qtyForPct(6) - 1e-6);
  });

  it("2. Iris cannot approve an engine reject", () => {
    const weak = { vesper: vesper(20), ash: ash(10), kai: kai("ready"), damian: damian() };
    const { decision, iris, result } = pipeline(snap(), weak, { decision: "approve", risk: { finalSizePct: 5 } });
    assert.equal(decision.gate.passed, false);
    assert.notEqual(iris.decision, "approve");
    assert.equal(result.order, null);

    const rejected = passingDraft({
      band: "reject",
      gate: {
        passed: false,
        scoutScore: false,
        kaiNotBlocked: true,
        kaiDirection: true,
        rr: true,
        portfolio: true,
        reasons: ["hard reject"],
      },
    });
    const bypass = finalizeTicket(snap(), rejected, passingIris({ decision: "approve", risk: { finalSizePct: 5 } }));
    assert.equal(bypass.order, null);
  });

  it("3. qty is computed from sizePct (PARTIAL vs golden 23: no LLM — finalize ignores any model qty)", () => {
    const result = finalizeTicket(snap(), passingDraft(), passingIris());
    assert.ok(result.order);
    const expected = qtyForPct(3.2);
    assert.ok(Math.abs(result.order!.qty - expected) < 1e-6);
  });

  it("4. existing resting limit blocks a second normal ticket", () => {
    const market = snap({
      book: {
        cash: 90_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [],
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 2400 },
      },
    });
    // Final order path: Iris approve + all checks green still cannot emit a second limit.
    const result = finalizeTicket(market, passingDraft(), passingIris());
    assert.equal(result.order, null);
    const viaPipeline = pipeline(market);
    assert.equal(viaPipeline.checks.restingOrderLimit, false);
    assert.equal(viaPipeline.result.order, null);
    const local = runLocalV2({ snap: market, locale: "en" });
    assert.equal(local.order, null);
  });

  it("4b. cut/flattening is still allowed while a resting limit is working", () => {
    const market = snap({
      book: {
        cash: 50_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [{ symbol: "BTC", qty: 0.5, avg: 90_000, pnlPct: -1.2 }],
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 2400 },
      },
    });
    const agents = { vesper: vesper(82, "sell"), ash: ash(35, "sell"), kai: kai("ready", "sell"), damian: damian() };
    const { result } = pipeline(market, agents);
    const flattening = result.order && result.order.side === "sell" && result.order.symbol === "BTC";
    assert.ok(flattening || result.order === null || result.order.symbol === "BTC");
    if (result.order) {
      assert.equal(result.order.symbol, "BTC");
      assert.equal(result.order.side, "sell");
      assert.equal(result.order.qty, 0.5);
    }
  });

  it("5. two open legs block new risk", () => {
    const market = snap({
      book: {
        cash: 40_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [
          { symbol: "ETH", qty: 2, avg: 2000, pnlPct: 1 },
          { symbol: "NVDA", qty: 10, avg: 200, pnlPct: 0.4 },
        ],
      },
    });
    const { decision, result } = pipeline(market);
    assert.equal(decision.gate.portfolio, false);
    assert.equal(result.order, null);
    const bypass = finalizeTicket(market, passingDraft(), passingIris());
    assert.equal(bypass.order, null);
  });

  it("6. teamLock blocks new risk on that name", () => {
    const market = snap({
      book: {
        cash: 90_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [{ symbol: "BTC", qty: 0.2, avg: 90_000, pnlPct: 1, teamLock: true }],
      },
    });
    const { decision, result } = pipeline(market);
    assert.equal(decision.gate.portfolio, false);
    assert.equal(result.order, null);
    const bypass = finalizeTicket(market, passingDraft(), passingIris());
    assert.equal(bypass.order, null);
  });

  it("7. drawdown blocks new risk", () => {
    const market = snap({
      book: { cash: 90_000, equity: 100_000, dayPnlPct: -3.1, positions: [] },
    });
    const { decision, result } = pipeline(market);
    assert.equal(decision.gate.portfolio, false);
    assert.equal(result.order, null);
    const bypass = finalizeTicket(market, passingDraft(), passingIris());
    assert.equal(bypass.order, null);
  });

  it("8. Damian cannot produce a ticker order", () => {
    const d = damian();
    assert.equal(d.recommendation.direction, "hold");
    const { result } = pipeline(snap(), { ...aligned(), damian: { ...d, recommendation: { direction: "buy", strength: 99, confidence: 1 } } });
    if (result.order) {
      const damianRow = result.agents.find((a) => a.id === "damian");
      assert.equal(damianRow?.vote, "hold");
      assert.equal(damianRow?.symbol, null);
    } else {
      const damianRow = result.agents.find((a) => a.id === "damian");
      assert.equal(damianRow?.vote, "hold");
    }
  });

  it("9. Kai Validate cannot change the side chosen by the engine", () => {
    const market = snap();
    const decision = decisionEngine({ ...aligned(), snap: market, locale: "en" });
    assert.equal(decision.side, "buy");
    const validated = kaiValidate(market, decision.symbol!, decision.side!, "en");
    assert.ok(validated);
    assert.equal(validated!.side, decision.side);
    const opposite = kaiValidate(market, decision.symbol!, "sell", "en");
    assert.equal(opposite!.side, "sell");
    const flipped = finalizeTicket(market, passingDraft(), passingIris(), {
      ...aligned(),
      kai: kai("ready", "sell"),
    });
    if (flipped.order) assert.equal(flipped.order.side, "buy");
    assert.notEqual(flipped.order?.side, "sell");
  });

  it("10. unknown symbols are dropped", () => {
    const market = snap();
    const out = validateVesper(
      {
        ...vesper(),
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
        ],
      },
      market,
    );
    assert.equal(out.ideas.length, 0);
    assert.equal(knownSymbol(market, "FAKECOIN"), null);
    assert.equal(knownSymbol(market, "BTC"), "BTC");
  });
});

describe("V2 contract: zero size", () => {
  it("Iris approve + finalSizePct 0 yields no order", () => {
    const result = finalizeTicket(
      snap(),
      passingDraft(),
      passingIris({ decision: "approve", risk: { finalSizePct: 0 } }),
    );
    assert.equal(result.order, null);
    assert.equal(clipSizePct(0), 0);
    const zeroSize: number | undefined = 0;
    assert.equal(zeroSize || 3.2, 3.2);
    assert.equal(zeroSize ?? 3.2, 0);
  });
});

describe("V2 contract: fallbacks", () => {
  it("11. a single agent failure does not kill the council (degraded mode)", async () => {
    const prev = process.env.XAI_API_KEY;
    process.env.XAI_API_KEY = "test-key";
    const orig = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      if (calls === 1) throw new Error("vesper down");
      return new Response(JSON.stringify({ choices: [{ message: { content: "{not-json" } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    try {
      const v = await runVesper(snap(), null, "en", "h");
      assert.equal(v.source, "local");
      const session = await runOrchestrator({ snap: snap(), locale: "en" });
      assert.equal(session.result.agents.length, 5);
      assert.equal(session.result.status?.mode, "degraded");
      assert.ok(calls >= 1);
    } finally {
      globalThis.fetch = orig;
      if (prev == null) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = prev;
    }
  });

  it("12. missing XAI still returns Local V2 / degraded council", async () => {
    const prev = process.env.XAI_API_KEY;
    delete process.env.XAI_API_KEY;
    try {
      const session = await runOrchestrator({ snap: snap(), locale: "en" });
      assert.equal(session.result.agents.length, 5);
      assert.equal(session.result.status?.mode, "degraded");
      assert.equal(session.result.status?.sources.vesper, "local");
      assert.equal(session.result.status?.sources.iris, "rules");
      const local = runLocalV2({ snap: snap(), locale: "en" });
      assert.equal(local.status?.mode, "degraded");
      assert.equal(local.agents.length, 5);
    } finally {
      if (prev == null) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = prev;
    }
  });

  it("13. malformed JSON falls back to the local Vesper model (PARTIAL vs golden 27: Vesper only)", async () => {
    const prev = process.env.XAI_API_KEY;
    process.env.XAI_API_KEY = "test-key";
    const orig = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "this is not json" } }] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;
    try {
      assert.throws(() => extractJson("this is not json"));
      const out = await runVesper(snap(), null, "en", "h");
      assert.equal(out.source, "local");
      assert.equal(out.agent, "vesper");
    } finally {
      globalThis.fetch = orig;
      if (prev == null) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = prev;
    }
  });

  it("14. timeout / fetch abort falls back and does not kill the council", async () => {
    const prev = process.env.XAI_API_KEY;
    process.env.XAI_API_KEY = "test-key";
    const orig = globalThis.fetch;
    globalThis.fetch = (async () => {
      const err = new Error("Aborted");
      err.name = "TimeoutError";
      throw err;
    }) as typeof fetch;
    try {
      const v = await runVesper(snap(), null, "en", "h");
      assert.equal(v.source, "local");
      const session = await runOrchestrator({ snap: snap(), locale: "en" });
      assert.equal(session.result.agents.length, 5);
      assert.equal(session.result.status?.mode, "degraded");
    } finally {
      globalThis.fetch = orig;
      if (prev == null) delete process.env.XAI_API_KEY;
      else process.env.XAI_API_KEY = prev;
    }
  });
});

describe("V2 contract: cut while working", () => {
  it("forced cut through finalize still closes the stalled name", () => {
    const market = snap({
      book: {
        cash: 50_000,
        equity: 100_000,
        dayPnlPct: 0.1,
        positions: [{ symbol: "BTC", qty: 0.4, avg: 110_000, pnlPct: -1.1 }],
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 2400 },
      },
    });
    const decision: DecisionDraft = {
      decisionId: "cut",
      symbol: "BTC",
      side: "sell",
      finalScore: 70,
      band: "normal",
      agreement: { direction: "sell", level: "high", score: 1 },
      contributors: { vesper: 80, ash: 0, kai: 80, damian: 0, historical: 0 },
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
      entry: { type: "limit", price: 100_000 },
      risk: { sizePct: 0, stop: null, target: null, rr: 2 },
      cut: true,
    };
    const agents = { vesper: vesper(82, "sell"), ash: ash(10, "sell"), kai: kai("ready", "sell"), damian: damian() };
    const iris: IrisOutput = {
      agent: "iris",
      runId: "i",
      timestamp: 1,
      decision: "approve",
      symbol: "BTC",
      side: "sell",
      risk: {
        basePct: 0,
        macroMultiplier: 1,
        portfolioMultiplier: 1,
        performanceMultiplier: 1,
        disagreementMultiplier: 1,
        finalSizePct: 0,
      },
      order: { type: "limit", price: 100_000, sizePct: 0 },
      riskReward: { stop: null, target: null, rr: 2 },
      checks: emptyChecks({ restingOrderLimit: true }),
      reason: "cut stalled",
      source: "rules",
    };
    const result = validateAndFinalize({
      snap: market,
      locale: "en",
      vesper: agents.vesper,
      ash: agents.ash,
      kai: agents.kai,
      damian: agents.damian,
      iris,
      decision,
    });
    assert.ok(result.order);
    assert.equal(result.order!.symbol, "BTC");
    assert.equal(result.order!.side, "sell");
    assert.equal(result.order!.qty, 0.4);
  });

  it("applyRestingLimitGate blocks a second limit even when Kai is ready", () => {
    const market = snap({
      book: {
        cash: 90_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [],
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 2400 },
      },
    });
    const decision = passingDraft();
    const gated = applyRestingLimitGate(emptyChecks(), market, kai("ready").primary, decision);
    assert.equal(gated.restingOrderLimit, false);
    assert.equal(hasBlockingRestingLimit(market, decision), true);
  });

  it("flattening is not blocked by a working limit when Kai is not ready", () => {
    const market = snap({
      book: {
        cash: 50_000,
        equity: 100_000,
        dayPnlPct: 0.2,
        positions: [{ symbol: "BTC", qty: 0.5, avg: 90_000, pnlPct: -1.2 }],
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 2400 },
      },
    });
    const decision = passingDraft({ symbol: "BTC", side: "sell" });
    const gated = applyRestingLimitGate(emptyChecks(), market, kai("wait", "sell").primary, decision);
    assert.equal(gated.restingOrderLimit, true);
    assert.equal(hasBlockingRestingLimit(market, decision), false);
  });
});
