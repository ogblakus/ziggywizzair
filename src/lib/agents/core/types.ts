import type { AgentId } from "@/lib/agents/personas";
import type { SectorId, Stance } from "@/lib/types";

export type AgentSource = "llm" | "local" | "rules";
export type Side = "buy" | "sell";
export type Direction = Side | "hold";
export type Locale = "en" | "pl";

export type Recommendation = {
  direction: Direction;
  strength: number;
  confidence: number;
};

export type EvidenceItem = {
  metric: string;
  timeframe?: string;
  value: number | string;
};

export type Invalidation = {
  type: string;
  price: number | null;
};

export type VesperIdea = {
  symbol: string;
  side: Side;
  score: number;
  confidence: number;
  setup: string;
  evidence: EvidenceItem[];
  invalidation: Invalidation;
  thesis: string;
};

export type VesperOutput = {
  agent: "vesper";
  runId: string;
  timestamp: number;
  marketStateHash: string;
  ideas: VesperIdea[];
  marketView: "bullish" | "bearish" | "neutral";
  noTradeReason: string | null;
  recommendation: Recommendation;
  knowledgeUsed: string[];
  source: AgentSource;
};

export type AshIdea = {
  symbol: string;
  side: Side;
  score: number;
  confidence: number;
  setup: string;
  evidence: EvidenceItem[];
  targetType: string;
  invalidation: Invalidation;
  thesis: string;
};

export type AshOutput = {
  agent: "ash";
  runId: string;
  timestamp: number;
  marketStateHash: string;
  ideas: AshIdea[];
  marketView: string;
  recommendation: Recommendation;
  knowledgeUsed: string[];
  source: AgentSource;
};

export type KaiStatus = "ready" | "wait" | "blocked";

export type KaiSetup = {
  symbol: string;
  side: Side;
  status: KaiStatus;
  setupType: string;
  timeframe: "15m" | "1h" | "4h" | null;
  fvg: { low: number; high: number } | null;
  retracementPct: number | null;
  entryType: "limit" | "market";
  entryPrice: number | null;
  invalidation: number | null;
  target: number | null;
  rr: number;
  qualityScore: number;
  evidence: string[];
  reason: string;
};

export type KaiOutput = {
  agent: "kai";
  runId: string;
  timestamp: number;
  marketStateHash: string;
  scan: KaiSetup[];
  primary: KaiSetup | null;
  recommendation: Recommendation;
  knowledgeUsed: string[];
  source: AgentSource;
};

export type DamianSector = {
  id: SectorId;
  stance: Stance;
  score: number;
  why: string;
};

export type DamianOutput = {
  agent: "damian";
  runId: string;
  timestamp: number;
  marketStateHash: string;
  regime: "risk_on" | "cautious" | "risk_off";
  confidence: number;
  sectors: DamianSector[];
  cryptoMarketCap: { usd: number | null; changePct: number | null };
  macroEvents: string[];
  summary: string;
  recommendation: Recommendation;
  knowledgeUsed: string[];
  source: AgentSource;
};

export type IrisDecision = "approve" | "reduce" | "wait" | "reject";

export type IrisChecks = {
  openLegLimit: boolean;
  restingOrderLimit: boolean;
  feeLimit: boolean;
  teamLock: boolean;
  liquidity: boolean;
  drawdown: boolean;
  scoutScore: boolean;
  kaiStatus: boolean;
  kaiDirection: boolean;
  rr: boolean;
};

export type IrisOutput = {
  agent: "iris";
  runId: string;
  timestamp: number;
  decision: IrisDecision;
  symbol: string | null;
  side: Side | null;
  risk: {
    basePct: number;
    macroMultiplier: number;
    portfolioMultiplier: number;
    performanceMultiplier: number;
    disagreementMultiplier: number;
    finalSizePct: number;
  };
  order: { type: "limit" | "market"; price: number | null; sizePct: number } | null;
  riskReward: { stop: number | null; target: number | null; rr: number } | null;
  checks: IrisChecks;
  reason: string;
  source: AgentSource;
};

export type Agreement = {
  direction: Direction;
  level: "high" | "medium" | "low";
  score: number;
};

export type ScoreBand = "reject" | "wait" | "small" | "normal" | "high";

export type DecisionDraft = {
  decisionId: string;
  symbol: string | null;
  side: Side | null;
  finalScore: number;
  band: ScoreBand;
  agreement: Agreement;
  contributors: {
    vesper: number;
    ash: number;
    kai: number;
    damian: number;
    historical: number;
  };
  multipliers: {
    vesper: number;
    ash: number;
    kai: number;
  };
  gate: {
    passed: boolean;
    scoutScore: boolean;
    kaiNotBlocked: boolean;
    kaiDirection: boolean;
    rr: boolean;
    portfolio: boolean;
    reasons: string[];
  };
  entry: { type: "limit" | "market"; price: number | null };
  risk: { sizePct: number; stop: number | null; target: number | null; rr: number };
  cut: boolean;
};

export type OrchestratorContext = {
  snapHash: string;
  lookingAt: string | null;
  locale: Locale;
  runId: string;
  timestamp: number;
};

export type AgentRunMeta = {
  agent: AgentId;
  source: AgentSource;
  promptVersion: string;
  knowledgeVersion: string;
};

