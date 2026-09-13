import { z } from "zod";

const Side = z.enum(["buy", "sell"]);
const Direction = z.enum(["buy", "sell", "hold"]);
const Tf = z.enum(["15m", "1h", "4h"]);

export const EvidenceSchema = z.object({
  metric: z.string(),
  timeframe: z.string().optional(),
  value: z.union([z.number(), z.string()]),
});

export const InvalidationSchema = z.object({
  type: z.string(),
  price: z.number().nullable().optional(),
});

export const RecommendationSchema = z.object({
  direction: Direction,
  strength: z.number(),
  confidence: z.number(),
});

export const VesperIdeaSchema = z.object({
  symbol: z.string(),
  side: Side,
  score: z.number().optional(),
  confidence: z.number().optional(),
  setup: z.string().optional(),
  evidence: z.array(EvidenceSchema).optional(),
  invalidation: InvalidationSchema.optional(),
  thesis: z.string().optional(),
});

export const VesperLlmSchema = z.object({
  agent: z.string().optional(),
  ideas: z.array(VesperIdeaSchema).optional(),
  marketView: z.enum(["bullish", "bearish", "neutral"]).optional(),
  noTradeReason: z.string().nullable().optional(),
  recommendation: RecommendationSchema.optional(),
  knowledgeUsed: z.array(z.string()).optional(),
});

export const AshIdeaSchema = z.object({
  symbol: z.string(),
  side: Side,
  score: z.number().optional(),
  confidence: z.number().optional(),
  setup: z.string().optional(),
  evidence: z.array(EvidenceSchema).optional(),
  targetType: z.string().optional(),
  invalidation: InvalidationSchema.optional(),
  thesis: z.string().optional(),
});

export const AshLlmSchema = z.object({
  agent: z.string().optional(),
  ideas: z.array(AshIdeaSchema).optional(),
  marketView: z.string().optional(),
  recommendation: RecommendationSchema.optional(),
  knowledgeUsed: z.array(z.string()).optional(),
});

export const KaiLlmSchema = z.object({
  agent: z.string().optional(),
  symbol: z.string().optional(),
  side: Side.optional(),
  status: z.enum(["ready", "wait", "blocked", "READY", "WAIT", "BLOCKED"]).optional(),
  setup: z
    .object({
      type: z.string().optional(),
      timeframe: Tf.optional(),
      fvg: z
        .object({
          low: z.number().optional(),
          high: z.number().optional(),
        })
        .optional(),
      retracementPct: z.number().optional(),
    })
    .optional(),
  entry: z
    .object({
      type: z.enum(["limit", "market"]).optional(),
      price: z.number().optional(),
    })
    .optional(),
  invalidation: z.number().optional(),
  target: z.number().optional(),
  rr: z.number().optional(),
  qualityScore: z.number().optional(),
  evidence: z.array(z.string()).optional(),
  reason: z.string().optional(),
  scan: z
    .array(
      z.object({
        symbol: z.string(),
        side: Side,
        status: z.enum(["ready", "wait", "blocked"]).optional(),
        qualityScore: z.number().optional(),
        rr: z.number().optional(),
      }),
    )
    .optional(),
  recommendation: RecommendationSchema.optional(),
  knowledgeUsed: z.array(z.string()).optional(),
});

export const DamianLlmSchema = z.object({
  agent: z.string().optional(),
  regime: z.enum(["risk_on", "cautious", "risk_off", "risk-on", "risk-off"]).optional(),
  confidence: z.number().optional(),
  sectors: z
    .array(
      z.object({
        id: z.enum(["equities", "crypto", "metals", "dollar", "vol"]),
        stance: z.enum(["bullish", "bearish", "neutral"]),
        score: z.number().optional(),
        why: z.string().optional(),
      }),
    )
    .optional(),
  cryptoMarketCap: z
    .object({
      usd: z.number().nullable().optional(),
      changePct: z.number().nullable().optional(),
    })
    .optional(),
  macroEvents: z.array(z.string()).optional(),
  summary: z.string().optional(),
  recommendation: RecommendationSchema.optional(),
  knowledgeUsed: z.array(z.string()).optional(),
});

export const IrisLlmSchema = z.object({
  agent: z.string().optional(),
  decision: z.enum(["approve", "reduce", "wait", "reject"]).optional(),
  symbol: z.string().nullable().optional(),
  side: Side.nullable().optional(),
  risk: z
    .object({
      basePct: z.number().optional(),
      macroMultiplier: z.number().optional(),
      portfolioMultiplier: z.number().optional(),
      performanceMultiplier: z.number().optional(),
      finalSizePct: z.number().optional(),
    })
    .optional(),
  order: z
    .object({
      type: z.enum(["limit", "market"]).optional(),
      price: z.number().nullable().optional(),
      sizePct: z.number().optional(),
    })
    .nullable()
    .optional(),
  reason: z.string().optional(),
});

export type VesperLlm = z.infer<typeof VesperLlmSchema>;
export type AshLlm = z.infer<typeof AshLlmSchema>;
export type KaiLlm = z.infer<typeof KaiLlmSchema>;
export type DamianLlm = z.infer<typeof DamianLlmSchema>;
export type IrisLlm = z.infer<typeof IrisLlmSchema>;
