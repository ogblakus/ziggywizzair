import type { CouncilResult, ProposedOrder } from "@/lib/types";
import type { MarketSnapshot } from "@/lib/types";

export function scoutVotes(agents: CouncilResult["agents"]) {
  return agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
}

export function kaiVote(agents: CouncilResult["agents"]) {
  return agents.find((a) => a.id === "kai") ?? null;
}

export function votesOn(
  agents: CouncilResult["agents"],
  symbol: string,
  side: "buy" | "sell",
) {
  return scoutVotes(agents).filter((a) => a.symbol === symbol && a.vote === side);
}

/**
 * Chain: Damian weather → Vesper/Ash rank names → Iris sizes → Kai stamps limit (ready or wait).
 * Kai does not veto direction — only chase and dead tape.
 * New risk needs a scout AND Kai on the same ticker/side. Cuts need one scout (or Kai).
 */
export function gateCouncilOrder(
  order: ProposedOrder | null,
  agents: CouncilResult["agents"],
  snap: MarketSnapshot,
): ProposedOrder | null {
  if (!order) return null;
  const scouts = votesOn(agents, order.symbol, order.side);
  const kai = kaiVote(agents);
  const kaiOk = kai?.symbol === order.symbol && kai.vote === order.side;
  const pos = snap.book.positions.find((p) => p.symbol === order.symbol);
  const open = pos && Math.abs(pos.qty) > 1e-8;
  if (open && pos.teamLock) return null;
  const reducing =
    open && ((pos.qty > 0 && order.side === "sell") || (pos.qty < 0 && order.side === "buy"));
  if (reducing) return scouts.length >= 1 || kaiOk ? order : null;
  return scouts.length >= 1 && kaiOk ? order : null;
}
