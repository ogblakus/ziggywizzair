import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { DECISION_ENGINE_VERSION } from "@/lib/agents/core/versions";
import type {
  AgentSource,
  AshOutput,
  DamianOutput,
  DecisionDraft,
  IrisOutput,
  KaiOutput,
  Locale,
  VesperOutput,
} from "@/lib/agents/core/types";
import { gateCouncilOrder } from "@/lib/agents/quorum";
import { clipPctOf, markOf, qtyForClip } from "@/lib/desk/size";
import type { CouncilResult, MarketSnapshot, ProposedOrder, SentimentReport } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

function toVote(direction: "buy" | "sell" | "hold"): "buy" | "sell" | "hold" {
  return direction;
}

function mapAgents(
  vesper: VesperOutput,
  ash: AshOutput,
  kai: KaiOutput,
  damian: DamianOutput,
  iris: IrisOutput,
): CouncilResult["agents"] {
  const vTop = vesper.ideas[0];
  const aTop = ash.ideas[0];
  const k = kai.primary;
  return AGENTS.map((p) => {
    if (p.id === "vesper") {
      return {
        id: p.id,
        thesis: vTop?.thesis || vesper.noTradeReason || "No view this print.",
        vote: toVote(vesper.recommendation.direction),
        symbol: vesper.recommendation.direction === "hold" ? null : (vTop?.symbol ?? null),
        conviction: vesper.recommendation.confidence,
        sizePct: 0,
      };
    }
    if (p.id === "ash") {
      return {
        id: p.id,
        thesis: aTop?.thesis || "Nothing I will fade yet.",
        vote: toVote(ash.recommendation.direction),
        symbol: ash.recommendation.direction === "hold" ? null : (aTop?.symbol ?? null),
        conviction: ash.recommendation.confidence,
        sizePct: 0,
      };
    }
    if (p.id === "kai") {
      const blocked = !k || k.status === "blocked";
      return {
        id: p.id,
        thesis: k?.reason || "No name this round.",
        vote: blocked ? "hold" : k.side,
        symbol: k?.symbol ?? null,
        conviction: kai.recommendation.confidence,
        sizePct: 0,
      };
    }
    if (p.id === "damian") {
      return {
        id: p.id,
        thesis: damian.summary,
        vote: "hold" as const,
        symbol: null,
        conviction: damian.confidence,
        sizePct: 0,
      };
    }
    return {
      id: p.id,
      thesis: iris.reason,
      vote: iris.decision === "approve" || iris.decision === "reduce" ? (iris.side ?? "hold") : "hold",
      symbol: iris.symbol,
      conviction: iris.decision === "approve" ? 0.72 : iris.decision === "reduce" ? 0.58 : 0.45,
      sizePct: iris.risk.finalSizePct,
    };
  });
}

function sentimentOf(damian: DamianOutput): SentimentReport {
  return {
    summary: damian.summary,
    sectors: damian.sectors.map((s) => ({ id: s.id, stance: s.stance, why: s.why })),
  };
}

function moodOf(damian: DamianOutput, iris: IrisOutput, order: ProposedOrder | null): CouncilResult["mood"] {
  if (iris.decision === "reject" && damian.regime === "risk_off") return "risk-off";
  if (order) return "risk-on";
  if (damian.regime === "risk_on") return "risk-on";
  if (damian.regime === "risk_off") return "risk-off";
  return "cautious";
}

function buildOrder(
  snap: MarketSnapshot,
  decision: DecisionDraft,
  iris: IrisOutput,
  locale: Locale,
): ProposedOrder | null {
  if (!decision.symbol || !decision.side) return null;
  if (iris.decision !== "approve" && iris.decision !== "reduce") return null;
  const t = snap.tickers.find((x) => x.symbol === decision.symbol);
  if (!t) return null;
  const pos = snap.book.positions.find((p) => p.symbol === decision.symbol);
  if (decision.cut && pos) {
    return {
      side: decision.side,
      symbol: decision.symbol,
      qty: Math.abs(pos.qty),
      rationale: iris.reason,
    };
  }
  const flattening = Boolean(
    pos && ((pos.qty > 0 && decision.side === "sell") || (pos.qty < 0 && decision.side === "buy")),
  );
  if (flattening && pos) {
    return {
      side: decision.side,
      symbol: decision.symbol,
      qty: Math.abs(pos.qty),
      rationale: iris.reason,
    };
  }
  const sizePct = iris.risk.finalSizePct || decision.risk.sizePct;
  if (!(sizePct > 0)) return null;
  const px = markOf(t);
  const qty = qtyForClip(snap.book.equity, sizePct, px, decision.symbol);
  if (!(qty > 0)) return null;
  const actual = clipPctOf(qty, px, snap.book.equity);
  return {
    side: decision.side,
    symbol: decision.symbol,
    qty,
    limitPx: decision.entry.price && decision.entry.price > 0 ? Number(decision.entry.price.toFixed(4)) : undefined,
    rationale: `${iris.reason} ${L(locale, `Iris ${actual.toFixed(1)}% of equity.`, `Iris ${actual.toFixed(1)}% kapitału.`)}`,
  };
}

function sourcesOf(
  vesper: VesperOutput,
  ash: AshOutput,
  kai: KaiOutput,
  damian: DamianOutput,
  iris: IrisOutput,
): Record<AgentId, AgentSource> {
  return {
    vesper: vesper.source,
    ash: ash.source,
    kai: kai.source,
    damian: damian.source,
    iris: iris.source,
  };
}

export function validateAndFinalize(input: {
  snap: MarketSnapshot;
  locale: Locale;
  vesper: VesperOutput;
  ash: AshOutput;
  kai: KaiOutput;
  damian: DamianOutput;
  iris: IrisOutput;
  decision: DecisionDraft;
}): CouncilResult {
  const { snap, locale, vesper, ash, kai, damian, iris, decision } = input;
  const agents = mapAgents(vesper, ash, kai, damian, iris);
  let order = buildOrder(snap, decision, iris, locale);
  order = gateCouncilOrder(order, agents, snap);
  const src = sourcesOf(vesper, ash, kai, damian, iris);
  const llmCount = Object.values(src).filter((s) => s === "llm").length;
  const mode = llmCount === 5 ? "online" : "degraded";
  const summary = order
    ? L(
        locale,
        `${order.limitPx ? "Limit" : "Ticket"} on ${order.side.toUpperCase()} ${order.symbol}. Score ${decision.finalScore.toFixed(0)} (${decision.band}).`,
        `${order.limitPx ? "Limit" : "Zlecenie"} ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}. Wynik ${decision.finalScore.toFixed(0)} (${decision.band}).`,
      )
    : iris.reason.slice(0, 200) || L(locale, "No ticket this round. Stay in cash.", "Brak biletu w tej rundzie. Zostajemy w gotówce.");
  return {
    mood: moodOf(damian, iris, order),
    summary,
    agents,
    order,
    sentiment: sentimentOf(damian),
    agreement: decision.agreement,
    finalScore: decision.finalScore,
    band: decision.band,
    decisionId: decision.decisionId,
    engineVersion: DECISION_ENGINE_VERSION,
    status: { mode, sources: src },
  };
}
