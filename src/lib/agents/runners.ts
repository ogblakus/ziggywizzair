import {
  agentChat,
  extractJson,
  hasXaiKey,
  langBlock,
} from "@/lib/agents/core/chat";
import {
  AshLlmSchema,
  DamianLlmSchema,
  IrisLlmSchema,
  KaiLlmSchema,
  VesperLlmSchema,
} from "@/lib/agents/core/schemas";
import { ashSnapshot, damianSnapshot, irisSnapshot, kaiSnapshot, tooBig, vesperSnapshot } from "@/lib/agents/core/snapshots";
import type {
  AshIdea,
  AshOutput,
  DamianOutput,
  DamianSector,
  DecisionDraft,
  IrisChecks,
  IrisOutput,
  KaiOutput,
  KaiSetup,
  Locale,
  VesperIdea,
  VesperOutput,
} from "@/lib/agents/core/types";
import { asConfidence, asScore, clipText, validateAsh, validateDamian, validateIris, validateKai, validateVesper } from "@/lib/agents/core/validators";
import {
  ASH_KNOWLEDGE,
  ASH_SYSTEM,
  DAMIAN_KNOWLEDGE,
  DAMIAN_SYSTEM,
  IRIS_SYSTEM,
  KAI_KNOWLEDGE,
  KAI_SYSTEM,
  VESPER_KNOWLEDGE,
  VESPER_SYSTEM,
} from "@/lib/agents/knowledge/prompts";
import {
  ashFallback,
  damianFallback,
  irisRules,
  kaiFallback,
  kaiValidate,
  vesperFallback,
} from "@/lib/agents/local-models";
import { ashReversionScore, damianSectorScores, kaiSetupFor, vesperMomentumScore } from "@/lib/agents/math";
import type { MarketSnapshot, TickerSnapshot } from "@/lib/types";

const MAX_TOKENS = 420;

function nums(t: TickerSnapshot, locale: Locale) {
  const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
  const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
  const rvol = t.rvol != null ? t.rvol.toFixed(2) : "—";
  return locale === "pl"
    ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs średnia 15m ${sma}, obrót ${rvol}`
    : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 15m mean ${sma}, volume ${rvol}`;
}

async function llmJson(system: string, user: unknown, locale: Locale): Promise<unknown> {
  if (!hasXaiKey()) throw new Error("no-key");
  if (tooBig(user)) throw new Error("payload");
  const raw = await agentChat(`${langBlock(locale, "council")}\n\n${system}`, JSON.stringify(user), MAX_TOKENS, {
    timeoutMs: 6_500,
    temperature: 0.35,
  });
  return extractJson(raw);
}

function of(snap: MarketSnapshot, symbol: string) {
  return snap.tickers.find((t) => t.symbol === symbol);
}

export async function runVesper(snap: MarketSnapshot, lookingAt: string | null, locale: Locale, hash: string): Promise<VesperOutput> {
  const local = vesperFallback(snap, locale, hash);
  try {
    const parsed = VesperLlmSchema.parse(await llmJson(VESPER_SYSTEM, vesperSnapshot(snap, lookingAt), locale));
    const ideas: VesperIdea[] = (parsed.ideas ?? []).map((idea) => {
      const t = of(snap, idea.symbol);
      const math = t ? vesperMomentumScore(t, idea.side) : 0;
      return {
        symbol: idea.symbol,
        side: idea.side,
        score: math,
        confidence: asConfidence(idea.confidence, math / 100),
        setup: clipText(idea.setup, 40) || "momentum_continuation",
        evidence: (idea.evidence ?? []).slice(0, 6).map((e) => ({ metric: e.metric, timeframe: e.timeframe, value: e.value })),
        invalidation: { type: idea.invalidation?.type ?? "structure", price: idea.invalidation?.price ?? t?.low ?? null },
        thesis: clipText(idea.thesis, 280) || (t ? nums(t, locale) : idea.symbol),
      };
    });
    const merged = ideas.length ? ideas : local.ideas;
    return validateVesper(
      {
        ...local,
        ideas: merged,
        marketView: parsed.marketView ?? local.marketView,
        noTradeReason: clipText(parsed.noTradeReason, 180) || local.noTradeReason,
        knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : VESPER_KNOWLEDGE.slice(0, 3),
        source: "llm",
      },
      snap,
    );
  } catch {
    return local;
  }
}

export async function runAsh(snap: MarketSnapshot, lookingAt: string | null, locale: Locale, hash: string): Promise<AshOutput> {
  const local = ashFallback(snap, locale, hash);
  try {
    const parsed = AshLlmSchema.parse(await llmJson(ASH_SYSTEM, ashSnapshot(snap, lookingAt), locale));
    const ideas: AshIdea[] = (parsed.ideas ?? []).map((idea) => {
      const t = of(snap, idea.symbol);
      const math = t ? ashReversionScore(t, idea.side) : 0;
      return {
        symbol: idea.symbol,
        side: idea.side,
        score: math,
        confidence: asConfidence(idea.confidence, math / 100),
        setup: clipText(idea.setup, 40) || "overextension_reversion",
        evidence: (idea.evidence ?? []).slice(0, 6).map((e) => ({ metric: e.metric, timeframe: e.timeframe, value: e.value })),
        targetType: clipText(idea.targetType, 20) || "mean",
        invalidation: { type: idea.invalidation?.type ?? "continuation", price: idea.invalidation?.price ?? null },
        thesis: clipText(idea.thesis, 280) || (t ? nums(t, locale) : idea.symbol),
      };
    });
    return validateAsh(
      {
        ...local,
        ideas: ideas.length ? ideas : local.ideas,
        marketView: clipText(parsed.marketView, 40) || local.marketView,
        knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : ASH_KNOWLEDGE.slice(0, 3),
        source: "llm",
      },
      snap,
    );
  } catch {
    return local;
  }
}

export async function runKai(snap: MarketSnapshot, lookingAt: string | null, locale: Locale, hash: string): Promise<KaiOutput> {
  const local = kaiFallback(snap, locale, hash);
  try {
    const parsed = KaiLlmSchema.parse(await llmJson(KAI_SYSTEM, kaiSnapshot(snap, lookingAt), locale));
    const scanFromLlm: KaiSetup[] = [];
    if (parsed.symbol && parsed.side) {
      const t = of(snap, parsed.symbol);
      if (t) {
        const math = kaiSetupFor(t, parsed.side);
        const statusRaw = (parsed.status ?? math.status).toString().toLowerCase();
        const status = statusRaw === "ready" || statusRaw === "wait" ? statusRaw : "blocked";
        scanFromLlm.push({
          ...math,
          status: math.status === "blocked" ? "blocked" : status,
          reason: clipText(parsed.reason, 280) || math.reason,
          evidence: parsed.evidence?.length ? parsed.evidence.slice(0, 6) : math.evidence,
        });
      }
    }
    for (const row of parsed.scan ?? []) {
      if (scanFromLlm.some((s) => s.symbol === row.symbol)) continue;
      const t = of(snap, row.symbol);
      if (!t) continue;
      const math = kaiSetupFor(t, row.side);
      scanFromLlm.push({ ...math, reason: math.reason });
    }
    const scan = scanFromLlm.length ? scanFromLlm : local.scan;
    return validateKai(
      {
        ...local,
        scan,
        primary: scan[0] ?? null,
        knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : KAI_KNOWLEDGE.slice(0, 3),
        source: "llm",
      },
      snap,
    );
  } catch {
    return local;
  }
}

export async function runDamian(snap: MarketSnapshot, locale: Locale, hash: string): Promise<DamianOutput> {
  const local = damianFallback(snap, locale, hash);
  try {
    const parsed = DamianLlmSchema.parse(await llmJson(DAMIAN_SYSTEM, damianSnapshot(snap), locale));
    const math = damianSectorScores(snap.macro, snap.tickers);
    const byId = new Map((parsed.sectors ?? []).map((s) => [s.id, s]));
    const sectors: DamianSector[] = local.sectors.map((row) => {
      const llm = byId.get(row.id);
      return {
        id: row.id,
        stance: llm?.stance ?? row.stance,
        score: math[row.id],
        why: clipText(llm?.why, 80) || row.why,
      };
    });
    const regimeRaw = parsed.regime?.replace("-", "_");
    const regime =
      regimeRaw === "risk_on" || regimeRaw === "risk_off" || regimeRaw === "cautious" ? regimeRaw : local.regime;
    return validateDamian({
      ...local,
      regime,
      confidence: asConfidence(parsed.confidence, local.confidence),
      sectors,
      cryptoMarketCap: {
        usd: parsed.cryptoMarketCap?.usd ?? local.cryptoMarketCap.usd,
        changePct: parsed.cryptoMarketCap?.changePct ?? local.cryptoMarketCap.changePct,
      },
      macroEvents: (parsed.macroEvents ?? []).slice(0, 4).map((e) => clipText(e, 80)),
      summary: clipText(parsed.summary, 220) || local.summary,
      knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : DAMIAN_KNOWLEDGE.slice(0, 3),
      source: "llm",
    });
  } catch {
    return local;
  }
}

export async function runIris(input: {
  snap: MarketSnapshot;
  locale: Locale;
  decision: DecisionDraft;
  checks: IrisChecks;
  vesper: VesperOutput;
  ash: AshOutput;
  kai: KaiOutput;
  damian: DamianOutput;
}): Promise<IrisOutput> {
  const { snap, locale, decision, checks } = input;
  const local = irisRules({ locale, decision, checks });
  try {
    const parsed = IrisLlmSchema.parse(
      await llmJson(
        IRIS_SYSTEM,
        irisSnapshot({
          locale,
          book: snap.book,
          scorecard: snap.scorecard,
          decision: {
            symbol: decision.symbol,
            side: decision.side,
            band: decision.band,
            finalScore: decision.finalScore,
            cut: decision.cut,
            entry: decision.entry,
            risk: decision.risk,
          },
          contributors: decision.contributors,
          agreement: decision.agreement,
          checks,
        }),
        locale,
      ),
    );
    let decisionKind = parsed.decision ?? local.decision;
    if (local.decision === "reject" && !decision.cut) decisionKind = "reject";
    if (decisionKind === "approve" && local.decision === "reduce") decisionKind = "reduce";
    const sizeWanted = asScore(parsed.risk?.finalSizePct, decision.risk.sizePct);
    const size =
      decisionKind === "approve" || decisionKind === "reduce"
        ? Math.min(decision.risk.sizePct, Math.max(0, sizeWanted))
        : 0;
    return validateIris(
      {
        ...local,
        decision: decisionKind,
        symbol: parsed.symbol ?? local.symbol,
        side: parsed.side ?? local.side,
        risk: { ...local.risk, finalSizePct: size },
        order:
          decisionKind === "approve" || decisionKind === "reduce"
            ? { type: "limit", price: decision.entry.price, sizePct: size }
            : null,
        reason: clipText(parsed.reason, 280) || local.reason,
        source: "llm",
      } as IrisOutput,
      snap,
      checks,
    );
  } catch {
    return local;
  }
}

export { kaiValidate };
