import { runLocalV2 } from "@/lib/agents/local-v2";
import type { CouncilResult, ProposedOrder } from "@/lib/types";
import type { GoldenExpect, GoldenScenario } from "./catalog.ts";

export type GoldenVerdict = {
  id: string;
  name: string;
  order: ProposedOrder | null;
  band: CouncilResult["band"];
  finalScore: number | null;
  agreement: CouncilResult["agreement"];
  mode: "online" | "degraded" | null;
  agents: number;
  irisVote: "buy" | "sell" | "hold" | null;
  irisSizePct: number | null;
  vesperVote: "buy" | "sell" | "hold" | null;
  ashVote: "buy" | "sell" | "hold" | null;
  kaiVote: "buy" | "sell" | "hold" | null;
  sources: NonNullable<CouncilResult["status"]>["sources"] | null;
  lastCouncilLeaked: boolean;
};

function voteOf(result: CouncilResult, id: string): "buy" | "sell" | "hold" | null {
  return result.agents.find((a) => a.id === id)?.vote ?? null;
}

export function play(scenario: GoldenScenario): { result: CouncilResult; verdict: GoldenVerdict } {
  if (!scenario.snap) throw new Error(`scenario ${scenario.id} has no snapshot`);
  const result = runLocalV2({ snap: scenario.snap(), locale: "en" });
  const iris = result.agents.find((a) => a.id === "iris");
  const verdict: GoldenVerdict = {
    id: scenario.id,
    name: scenario.name,
    order: result.order,
    band: result.band ?? null,
    finalScore: result.finalScore ?? null,
    agreement: result.agreement ?? null,
    mode: result.status?.mode ?? null,
    agents: result.agents.length,
    irisVote: iris?.vote ?? null,
    irisSizePct: iris?.sizePct ?? null,
    vesperVote: voteOf(result, "vesper"),
    ashVote: voteOf(result, "ash"),
    kaiVote: voteOf(result, "kai"),
    sources: result.status?.sources ?? null,
    lastCouncilLeaked: JSON.stringify(result).includes("lastCouncil"),
  };
  return { result, verdict };
}

export function checkExpect(verdict: GoldenVerdict, expect: GoldenExpect): string[] {
  const fail: string[] = [];
  if (expect.order === "present" && !verdict.order) fail.push("expected an order, got null");
  if (expect.order === "absent" && verdict.order) {
    fail.push(`expected no order, got ${verdict.order.side} ${verdict.order.symbol} x${verdict.order.qty}`);
  }
  if (verdict.order) {
    if (expect.side && verdict.order.side !== expect.side) fail.push(`side ${verdict.order.side} != ${expect.side}`);
    if (expect.symbol && verdict.order.symbol !== expect.symbol) {
      fail.push(`symbol ${verdict.order.symbol} != ${expect.symbol}`);
    }
    if (expect.qty != null && Math.abs(verdict.order.qty - expect.qty) > 1e-8) {
      fail.push(`qty ${verdict.order.qty} != ${expect.qty}`);
    }
    if (expect.qtyPositive && !(verdict.order.qty > 0)) fail.push(`qty ${verdict.order.qty} is not > 0`);
    if (expect.notSymbol && verdict.order.symbol === expect.notSymbol) {
      fail.push(`order must not be ${expect.notSymbol}`);
    }
  } else if (expect.order === "present") {
    if (expect.side) fail.push(`missing order (wanted ${expect.side})`);
    if (expect.symbol) fail.push(`missing order (wanted ${expect.symbol})`);
  }
  if (expect.mode && verdict.mode !== expect.mode) fail.push(`mode ${verdict.mode} != ${expect.mode}`);
  if (expect.agents != null && verdict.agents !== expect.agents) fail.push(`agents ${verdict.agents} != ${expect.agents}`);
  if (expect.irisVote && verdict.irisVote !== expect.irisVote) {
    fail.push(`iris vote ${verdict.irisVote} != ${expect.irisVote}`);
  }
  if (expect.vesperVote && verdict.vesperVote !== expect.vesperVote) {
    fail.push(`vesper vote ${verdict.vesperVote} != ${expect.vesperVote}`);
  }
  if (expect.ashVote && verdict.ashVote !== expect.ashVote) {
    fail.push(`ash vote ${verdict.ashVote} != ${expect.ashVote}`);
  }
  if (expect.kaiVote && verdict.kaiVote !== expect.kaiVote) {
    fail.push(`kai vote ${verdict.kaiVote} != ${expect.kaiVote}`);
  }
  if (expect.band) {
    const allowed = (Array.isArray(expect.band) ? expect.band : [expect.band]).map(String);
    if (!allowed.includes(String(verdict.band))) fail.push(`band ${verdict.band} not in ${allowed.join("|")}`);
  }
  if (expect.minScore != null) {
    if (verdict.finalScore == null || verdict.finalScore < expect.minScore) {
      fail.push(`score ${verdict.finalScore} < min ${expect.minScore}`);
    }
  }
  if (expect.maxScore != null) {
    if (verdict.finalScore == null || verdict.finalScore > expect.maxScore) {
      fail.push(`score ${verdict.finalScore} > max ${expect.maxScore}`);
    }
  }
  if (expect.agreement && verdict.agreement?.level !== expect.agreement) {
    fail.push(`agreement ${verdict.agreement?.level} != ${expect.agreement}`);
  }
  if (expect.irisSizePct != null) {
    if (verdict.irisSizePct == null || Math.abs(verdict.irisSizePct - expect.irisSizePct) > 1e-8) {
      fail.push(`iris sizePct ${verdict.irisSizePct} != ${expect.irisSizePct}`);
    }
  }
  if (expect.sources) {
    for (const [id, src] of Object.entries(expect.sources)) {
      const got = verdict.sources?.[id as keyof NonNullable<typeof verdict.sources>];
      if (got !== src) fail.push(`source ${id} ${got} != ${src}`);
    }
  }
  if (verdict.lastCouncilLeaked) fail.push("lastCouncil leaked into the result");
  return fail;
}
