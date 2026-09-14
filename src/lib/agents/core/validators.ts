import type {
  AshIdea,
  AshOutput,
  DamianOutput,
  DamianSector,
  IrisChecks,
  IrisOutput,
  KaiOutput,
  KaiSetup,
  Recommendation,
  VesperIdea,
  VesperOutput,
} from "@/lib/agents/core/types";
import type { MarketSnapshot } from "@/lib/types";

export function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function asConfidence(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return clamp(fallback, 0, 1);
  if (n > 1 && n <= 100) return clamp(n / 100, 0, 1);
  return clamp(n, 0, 1);
}

export function asScore(v: unknown, fallback: number): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return clamp(fallback, 0, 100);
  return clamp(n, 0, 100);
}

export function clipText(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function knownSymbol(snap: MarketSnapshot, symbol: string | null | undefined): string | null {
  if (!symbol) return null;
  const hit = snap.tickers.find((t) => t.symbol === symbol);
  return hit ? hit.symbol : null;
}

export function recommendationFrom(
  ideas: Array<{ side: "buy" | "sell"; score: number; confidence: number; symbol: string }>,
): Recommendation {
  const top = ideas[0];
  if (!top || top.score < 40) {
    return { direction: "hold", strength: top?.score ?? 0, confidence: top?.confidence ?? 0.3 };
  }
  return { direction: top.side, strength: top.score, confidence: top.confidence };
}

export function validateVesper(out: VesperOutput, snap: MarketSnapshot): VesperOutput {
  const ideas: VesperIdea[] = [];
  const seen = new Set<string>();
  for (const idea of out.ideas) {
    const symbol = knownSymbol(snap, idea.symbol);
    if (!symbol || seen.has(symbol)) continue;
    seen.add(symbol);
    ideas.push({
      ...idea,
      symbol,
      score: asScore(idea.score, 0),
      confidence: asConfidence(idea.confidence, idea.score / 100),
      thesis: clipText(idea.thesis, 280),
      evidence: (idea.evidence ?? []).slice(0, 6),
    });
    if (ideas.length >= 3) break;
  }
  return {
    ...out,
    ideas,
    noTradeReason: ideas.length ? null : out.noTradeReason,
    recommendation: recommendationFrom(ideas),
  };
}

export function validateAsh(out: AshOutput, snap: MarketSnapshot): AshOutput {
  const ideas: AshIdea[] = [];
  const seen = new Set<string>();
  for (const idea of out.ideas) {
    const symbol = knownSymbol(snap, idea.symbol);
    if (!symbol || seen.has(symbol)) continue;
    seen.add(symbol);
    ideas.push({
      ...idea,
      symbol,
      score: asScore(idea.score, 0),
      confidence: asConfidence(idea.confidence, idea.score / 100),
      thesis: clipText(idea.thesis, 280),
      evidence: (idea.evidence ?? []).slice(0, 6),
    });
    if (ideas.length >= 3) break;
  }
  return { ...out, ideas, recommendation: recommendationFrom(ideas) };
}

export function validateKai(out: KaiOutput, snap: MarketSnapshot): KaiOutput {
  const scan: KaiSetup[] = [];
  const seen = new Set<string>();
  for (const row of out.scan) {
    const symbol = knownSymbol(snap, row.symbol);
    if (!symbol || seen.has(symbol)) continue;
    seen.add(symbol);
    const tk = snap.tickers.find((t) => t.symbol === symbol)!;
    const px = tk.livePx && tk.livePx > 0 ? tk.livePx : tk.price;
    let entry = row.entryPrice;
    if (entry != null && px > 0) {
      const drift = Math.abs(entry - px) / px;
      if (drift > 0.08) entry = null;
    }
    const rr = Number.isFinite(row.rr) ? clamp(row.rr, 0, 20) : 0;
    scan.push({
      ...row,
      symbol,
      qualityScore: asScore(row.qualityScore, 0),
      rr,
      entryPrice: row.status === "blocked" ? null : entry,
      reason: clipText(row.reason, 280),
      evidence: (row.evidence ?? []).slice(0, 6),
    });
    if (scan.length >= 3) break;
  }
  const primary = scan[0] ?? null;
  const rec: Recommendation = primary && primary.status !== "blocked"
    ? { direction: primary.side, strength: primary.qualityScore, confidence: primary.status === "ready" ? 0.72 : 0.55 }
    : { direction: "hold", strength: primary?.qualityScore ?? 0, confidence: 0.35 };
  return { ...out, scan, primary, recommendation: rec };
}

export function validateDamian(out: DamianOutput): DamianOutput {
  const ids: DamianSector["id"][] = ["equities", "crypto", "metals", "dollar", "vol"];
  const byId = new Map(out.sectors.map((s) => [s.id, s]));
  const sectors: DamianSector[] = ids.map((id) => {
    const row = byId.get(id);
    return {
      id,
      stance: row?.stance === "bullish" || row?.stance === "bearish" ? row.stance : "neutral",
      score: clamp(Number(row?.score) || 0, -100, 100),
      why: clipText(row?.why, 80) || "—",
    };
  });
  return {
    ...out,
    sectors,
    summary: clipText(out.summary, 220) || sectors.filter((s) => s.stance !== "neutral").map((s) => `${s.id} ${s.stance}`).join(" · ") || "Mixed.",
    confidence: asConfidence(out.confidence, 0.55),
    recommendation: { direction: "hold", strength: 0, confidence: asConfidence(out.confidence, 0.55) },
  };
}

export function validateIris(out: IrisOutput, snap: MarketSnapshot, checks: IrisChecks): IrisOutput {
  const symbol = knownSymbol(snap, out.symbol);
  let decision = out.decision;
  if (!checks.openLegLimit || !checks.teamLock || !checks.feeLimit || !checks.restingOrderLimit) decision = "reject";
  if (!checks.scoutScore || !checks.kaiStatus || !checks.kaiDirection || !checks.rr) {
    if (decision === "approve" || decision === "reduce") decision = checks.kaiStatus ? "wait" : "reject";
  }
  const size = decision === "reject" || decision === "wait" ? 0 : clamp(out.risk.finalSizePct ?? 0, 0, 6);
  return {
    ...out,
    decision,
    symbol: decision === "reject" ? out.symbol : symbol,
    side: out.side,
    risk: { ...out.risk, finalSizePct: size },
    order:
      decision === "approve" || decision === "reduce"
        ? { type: out.order?.type ?? "limit", price: out.order?.price ?? null, sizePct: size }
        : null,
    checks,
    reason: clipText(out.reason, 280),
  };
}

export function emptyChecks(overrides: Partial<IrisChecks> = {}): IrisChecks {
  return {
    openLegLimit: true,
    restingOrderLimit: true,
    feeLimit: true,
    teamLock: true,
    liquidity: true,
    drawdown: true,
    scoutScore: true,
    kaiStatus: true,
    kaiDirection: true,
    rr: true,
    ...overrides,
  };
}

