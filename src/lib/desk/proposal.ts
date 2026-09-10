import type { ProposedOrder } from "@/lib/types";

/** How long a pending ticket stays on the rail before it dies. Prices move. */
export const PROPOSAL_TTL_MS = 15 * 60 * 1000;

export function stampProposal(order: ProposedOrder | null | undefined, now = Date.now()): ProposedOrder | null {
  if (!order) return null;
  return { ...order, proposedAt: order.proposedAt ?? now };
}

export function liveProposal(order: ProposedOrder | null | undefined, now = Date.now()): ProposedOrder | null {
  if (!order) return null;
  const at = order.proposedAt ?? now;
  if (order.proposedAt && now - order.proposedAt > PROPOSAL_TTL_MS) return null;
  if (!order.proposedAt) return { ...order, proposedAt: at };
  return order;
}

export function proposalMsLeft(order: ProposedOrder, now = Date.now()) {
  const at = order.proposedAt ?? now;
  return Math.max(0, at + PROPOSAL_TTL_MS - now);
}

export function withLiveProposal<T extends { proposal: ProposedOrder | null }>(book: T, now = Date.now()): T {
  const next = liveProposal(book.proposal, now);
  if (next === book.proposal) return book;
  return { ...book, proposal: next };
}
