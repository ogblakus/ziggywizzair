/**
 * Read-only desk presentation. Copies fields the engine already produced.
 * Does not score, size, or invent geometry.
 */
import { DECISION_ENGINE_VERSION } from "@/lib/agents/core/versions";
import type {
  AshOutput,
  DamianOutput,
  DecisionDraft,
  Direction,
  EvidenceItem,
  IrisChecks,
  IrisDecision,
  IrisOutput,
  KaiOutput,
  KaiStatus,
  Side,
  VesperOutput,
} from "@/lib/agents/core/types";
import type { SectorId, Stance } from "@/lib/types";

export type DeskGeometry = {
  entry: number | null;
  stop: number | null;
  target: number | null;
  rr: number | null;
  valid: boolean;
};

export type DeskView = {
  engineVersion: string;
  candidate: { symbol: string | null; side: Side | null };
  score: number;
  band: DecisionDraft["band"];
  agreement: DecisionDraft["agreement"];
  sizePct: number;
  gates: {
    passed: boolean;
    scoutScore: boolean;
    kai: boolean;
    direction: boolean;
    rr: boolean;
    portfolio: boolean;
  };
  geometry: DeskGeometry;
  vesper: {
    direction: Direction;
    score: number | null;
    confidence: number;
    symbol: string | null;
    thesis: string;
    evidence: EvidenceItem[];
  };
  ash: {
    direction: Direction;
    score: number | null;
    confidence: number;
    symbol: string | null;
    thesis: string;
  };
  kai: {
    status: KaiStatus | "none";
    side: Side | null;
    symbol: string | null;
    setupType: string | null;
    timeframe: string | null;
    qualityScore: number | null;
    reason: string;
    geometry: DeskGeometry;
  };
  damian: {
    regime: DamianOutput["regime"];
    confidence: number;
    summary: string;
    sectors: Array<{ id: SectorId; stance: Stance; score: number; why: string }>;
  };
  iris: {
    decision: IrisDecision;
    sizePct: number;
    checks: IrisChecks;
    reason: string;
  };
};

const KAI_LEAK = /setup|retrace|wick|\btf\b|fvg|limit|pullback|chase/i;

function finitePos(n: number | null | undefined): number | null {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}

function kaiGeometry(kai: KaiOutput): DeskGeometry {
  const k = kai.primary;
  const entry = finitePos(k?.entryPrice);
  const stop = finitePos(k?.invalidation);
  const target = finitePos(k?.target);
  const rr = typeof k?.rr === "number" && Number.isFinite(k.rr) && k.rr > 0 ? k.rr : null;
  const valid = Boolean(entry && stop && target && rr);
  if (!valid) return { entry: null, stop: null, target: null, rr: null, valid: false };
  return { entry, stop, target, rr, valid: true };
}

function tapeEvidence(items: EvidenceItem[]): EvidenceItem[] {
  return items.filter((e) => !KAI_LEAK.test(e.metric) && !KAI_LEAK.test(String(e.value)));
}

export function buildDeskView(input: {
  vesper: VesperOutput;
  ash: AshOutput;
  kai: KaiOutput;
  damian: DamianOutput;
  iris: IrisOutput;
  decision: DecisionDraft;
}): DeskView {
  const { vesper, ash, kai, damian, iris, decision } = input;
  const vTop = vesper.ideas[0];
  const aTop = ash.ideas[0];
  const k = kai.primary;
  const geometry = kaiGeometry(kai);
  return {
    engineVersion: DECISION_ENGINE_VERSION,
    candidate: { symbol: decision.symbol, side: decision.side },
    score: decision.finalScore,
    band: decision.band,
    agreement: decision.agreement,
    sizePct: iris.risk.finalSizePct ?? 0,
    gates: {
      passed: decision.gate.passed,
      scoutScore: decision.gate.scoutScore,
      kai: decision.gate.kaiNotBlocked,
      direction: decision.gate.kaiDirection,
      rr: decision.gate.rr,
      portfolio: decision.gate.portfolio,
    },
    geometry,
    vesper: {
      direction: vesper.recommendation.direction,
      score: vTop?.score ?? (vesper.recommendation.strength || null),
      confidence: vesper.recommendation.confidence,
      symbol: vesper.recommendation.direction === "hold" ? null : (vTop?.symbol ?? null),
      thesis: vTop?.thesis || vesper.noTradeReason || "",
      evidence: tapeEvidence(vTop?.evidence ?? []),
    },
    ash: {
      direction: ash.recommendation.direction,
      score: aTop?.score ?? (ash.recommendation.strength || null),
      confidence: ash.recommendation.confidence,
      symbol: ash.recommendation.direction === "hold" ? null : (aTop?.symbol ?? null),
      thesis: aTop?.thesis || "",
    },
    kai: {
      status: k?.status ?? "none",
      side: k?.side ?? null,
      symbol: k?.symbol ?? null,
      setupType: k?.setupType ?? null,
      timeframe: k?.timeframe ?? null,
      qualityScore: k?.qualityScore ?? null,
      reason: k?.reason || "",
      geometry,
    },
    damian: {
      regime: damian.regime,
      confidence: damian.confidence,
      summary: damian.summary,
      sectors: damian.sectors.map((s) => ({ id: s.id, stance: s.stance, score: s.score, why: s.why })),
    },
    iris: {
      decision: iris.decision,
      sizePct: iris.risk.finalSizePct ?? 0,
      checks: { ...iris.checks },
      reason: iris.reason,
    },
  };
}

/** UI label for Kai — never BUY/SELL unless READY. */
export function kaiFace(status: KaiStatus | "none"): "ready" | "wait" | "blocked" | "hold" {
  if (status === "ready") return "ready";
  if (status === "wait") return "wait";
  if (status === "blocked") return "blocked";
  return "hold";
}
