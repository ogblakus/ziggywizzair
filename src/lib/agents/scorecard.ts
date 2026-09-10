import type { AgentId } from "@/lib/agents/personas";
import type { AgentCall, AgentRecord, CouncilResult, Side } from "@/lib/types";

export const SPECIALISTS: Array<Exclude<AgentId, "iris" | "damian">> = ["vesper", "ash", "kai"];

export function emptyRecords(): AgentRecord[] {
  return SPECIALISTS.map((id) => ({
    id,
    calls: 0,
    closed: 0,
    wins: 0,
    hitRate: null,
    avgPnl: null,
    last5: [],
    sizeMult: 1,
    trusted: true,
  }));
}

export function recordsFrom(calls: AgentCall[]): AgentRecord[] {
  const byId = new Map(emptyRecords().map((r) => [r.id, { ...r, last5: [] as AgentRecord["last5"] }]));
  for (const c of calls) {
    const row = byId.get(c.agentId);
    if (!row) continue;
    row.calls += 1;
    if (c.closedAt != null && c.pnlPct != null) {
      row.closed += 1;
      if (c.pnlPct > 0) row.wins += 1;
      row.last5.push({ symbol: c.symbol, side: c.side, pnlPct: c.pnlPct });
    }
  }
  return SPECIALISTS.map((id) => {
    const row = byId.get(id)!;
    const closedCalls = calls.filter((c) => c.agentId === id && c.pnlPct != null);
    const avgPnl =
      closedCalls.length > 0
        ? closedCalls.reduce((s, c) => s + (c.pnlPct ?? 0), 0) / closedCalls.length
        : null;
    const hitRate = row.closed >= 2 ? row.wins / row.closed : null;
    const sizeMult =
      hitRate == null ? 1 : hitRate >= 0.6 ? 1.15 : hitRate >= 0.45 ? 1 : hitRate >= 0.35 ? 0.75 : 0.55;
    return {
      ...row,
      last5: row.last5.slice(0, 5),
      avgPnl,
      hitRate,
      sizeMult,
      trusted: !(row.closed >= 4 && hitRate != null && hitRate < 0.35),
    };
  });
}

/** 3–5% clip, scaled by the specialist's recent hits. */
export function sizeFor(agentId: AgentId, recs: AgentRecord[], basePct = 3) {
  const rec = recs.find((r) => r.id === agentId);
  const mult = rec?.sizeMult ?? 1;
  return Math.max(1.5, Math.min(5, basePct * mult));
}

export function irisAllows(agentId: AgentId, recs: AgentRecord[], seconded: boolean) {
  if (seconded) return true;
  const rec = recs.find((r) => r.id === agentId);
  return rec ? rec.trusted : true;
}

export function proposerFrom(council: CouncilResult | null, symbol: string, side: Side): Exclude<AgentId, "iris"> | null {
  if (!council) return null;
  const want: "buy" | "sell" = side;
  const hit =
    council.agents.find((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote === want) ??
    council.agents
      .filter((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote !== "hold")
      .sort((a, b) => b.conviction - a.conviction)[0];
  if (!hit || hit.id === "iris") return null;
  return hit.id as Exclude<AgentId, "iris">;
}

export function openCall(input: {
  id: string;
  ts: number;
  agentId: Exclude<AgentId, "iris">;
  symbol: string;
  side: Side;
  entry: number;
  qty: number;
  fillId: string;
}): AgentCall {
  return { ...input, open: true };
}

export function closeCallsFor(
  calls: AgentCall[],
  symbol: string,
  exit: number,
  now: number,
  stillOpen: boolean,
): AgentCall[] {
  if (stillOpen) return calls;
  return calls.map((c) => {
    if (!c.open || c.symbol !== symbol) return c;
    const dir = c.side === "buy" ? 1 : -1;
    const pnlPct = c.entry ? ((exit - c.entry) / c.entry) * 100 * dir : 0;
    return { ...c, open: false, closedAt: now, exit, pnlPct };
  });
}

export function markOpenCalls(
  calls: AgentCall[],
  prices: Record<string, number>,
  now: number,
): AgentCall[] {
  let changed = false;
  const next = calls.map((c) => {
    if (!c.open || c.mark1h != null) return c;
    if (now - c.ts < 60 * 60 * 1000) return c;
    const px = prices[c.symbol];
    if (!px) return c;
    changed = true;
    const dir = c.side === "buy" ? 1 : -1;
    const pnl1h = c.entry ? ((px - c.entry) / c.entry) * 100 * dir : 0;
    return { ...c, mark1h: px, pnl1h };
  });
  return changed ? next : calls;
}

export function compactScorecard(recs: AgentRecord[], calls: AgentCall[]) {
  return recs.map((r) => {
    const open = calls
      .filter((c) => c.agentId === r.id && c.open)
      .slice(0, 3)
      .map((c) => ({
        s: c.symbol,
        side: c.side,
        ageMin: Math.round((Date.now() - c.ts) / 60_000),
        pnl1h: c.pnl1h != null ? Number(c.pnl1h.toFixed(2)) : null,
      }));
    return {
      id: r.id,
      closed: r.closed,
      wins: r.wins,
      hitPct: r.hitRate != null ? Math.round(r.hitRate * 100) : null,
      sizePct: Number(sizeFor(r.id, recs).toFixed(1)),
      trusted: r.trusted,
      last5: r.last5.map((x) => ({ s: x.symbol, pnl: Number(x.pnlPct.toFixed(1)) })),
      open,
    };
  });
}
