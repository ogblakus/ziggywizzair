import { type Agreement, type AshOutput, type DamianOutput, type DecisionDraft, type IrisChecks, type KaiOutput, type KaiSetup, type Locale, type ScoreBand, type Side, type VesperOutput } from "@/lib/agents/core/types";
import { HARD, WEIGHTS, bandOf, disagreement } from "@/lib/agents/core/scoring";
import { emptyChecks } from "@/lib/agents/core/validators";
import { newRunId } from "@/lib/agents/core/hash";
import { historicalEdge, historicalMultiplier, sectorScoreFor } from "@/lib/agents/math";
import { MAX_OPEN_LEGS } from "@/lib/agents/pipeline";
import { teamBlocks } from "@/lib/desk/holds";
import type { MarketSnapshot } from "@/lib/types";

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

function ideaScore(
  ideas: Array<{ symbol: string; side: Side; score: number }>,
  symbol: string,
  side: Side,
): number {
  const hit = ideas.find((i) => i.symbol === symbol && i.side === side);
  if (hit) return hit.score;
  const opp = ideas.find((i) => i.symbol === symbol && i.side !== side);
  if (opp) return -opp.score;
  return 0;
}

function kaiOn(kai: KaiOutput, validated: KaiSetup | null, symbol: string, side: Side): KaiSetup | null {
  if (validated && validated.symbol === symbol && validated.side === side) return validated;
  return (
    kai.scan.find((s) => s.symbol === symbol && s.side === side) ??
    (kai.primary && kai.primary.symbol === symbol && kai.primary.side === side ? kai.primary : null)
  );
}

function isFlatteningSide(
  pos: { qty: number } | undefined,
  side: Side | null | undefined,
): boolean {
  return Boolean(
    pos && side && Math.abs(pos.qty) > 1e-8 && ((pos.qty > 0 && side === "sell") || (pos.qty < 0 && side === "buy")),
  );
}

/** True when a working/resting limit must block a second non-cut, non-flattening ticket. */
export function hasBlockingRestingLimit(
  snap: MarketSnapshot,
  decision: { cut: boolean; symbol: string | null; side: Side | null },
): boolean {
  if (!snap.book.working) return false;
  if (decision.cut) return false;
  const pos = decision.symbol ? snap.book.positions.find((p) => p.symbol === decision.symbol) : undefined;
  if (isFlatteningSide(pos, decision.side)) return false;
  return true;
}

function portfolioOk(snap: MarketSnapshot, symbol: string, side: Side, cut: boolean): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const pos = snap.book.positions.find((p) => p.symbol === symbol);
  if (teamBlocks(snap.book.positions, symbol)) {
    reasons.push("teamLock");
    return { ok: false, reasons };
  }
  const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
  const adding = Boolean(pos && Math.abs(pos.qty) > 1e-8 && ((pos.qty > 0 && side === "buy") || (pos.qty < 0 && side === "sell")));
  if (!cut && !adding && openCount >= MAX_OPEN_LEGS) reasons.push("openLegs");
  if (!cut && hasBlockingRestingLimit(snap, { cut, symbol, side })) reasons.push("restingLimit");
  const cashPct = (100 * snap.book.cash) / Math.max(snap.book.equity, 1);
  if (!cut && (snap.book.dayPnlPct < -2.4 || cashPct < 18)) reasons.push("drawdown");
  if (!cut && adding) {
    const tk = snap.tickers.find((t) => t.symbol === symbol);
    if (tk && ((side === "buy" && (tk.vsSma > 1.2 || tk.rsi >= 72)) || (side === "sell" && (tk.vsSma < -1.2 || tk.rsi <= 28)))) {
      reasons.push("extension");
    }
  }
  return { ok: reasons.length === 0, reasons };
}

function sizeForBand(
  band: ScoreBand,
  damianScore: number,
  openCount: number,
  adding: boolean,
  agreement: Agreement,
): number {
  const weatherBias = damianScore / 100;
  const base = weatherBias >= 0.35 ? 5.2 : weatherBias <= -0.35 ? 2.2 : 3.2;
  const legs = openCount <= 0 ? 1 : openCount === 1 ? 0.78 : 0.55;
  let pct = base * legs;
  if (adding) pct = Math.min(3, pct);
  if (band === "small") pct *= 0.65;
  if (band === "high") pct = Math.min(6, pct);
  if (agreement.level === "low") pct *= 0.5;
  if (band === "wait" || band === "reject") return 0;
  return clamp(pct, 2, 6);
}

export function stalledCut(snap: MarketSnapshot): { symbol: string; side: Side } | null {
  const openPos = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8);
  const stalled = openPos.find((p) => {
    if (p.teamLock) return false;
    const tk = snap.tickers.find((t) => t.symbol === p.symbol);
    if (!tk) return false;
    const px = tk.livePx && tk.livePx > 0 ? tk.livePx : tk.price;
    const rangePct = px > 0 && tk.high > tk.low ? ((tk.high - tk.low) / px) * 100 : 0;
    const minAdverse = Math.max(0.8, rangePct * 0.35);
    if (p.pnlPct > -minAdverse) return false;
    if (p.qty > 0) return tk.vsSma < 0 || tk.changePct < -minAdverse;
    return tk.vsSma > 0 || tk.changePct > minAdverse;
  });
  if (!stalled) return null;
  return { symbol: stalled.symbol, side: stalled.qty < 0 ? "buy" : "sell" };
}

export function decisionEngine(input: {
  vesper: VesperOutput;
  ash: AshOutput;
  kai: KaiOutput;
  damian: DamianOutput;
  snap: MarketSnapshot;
  locale: Locale;
  validated?: KaiSetup | null;
  cut?: { symbol: string; side: Side } | null;
  prevBand?: ScoreBand | null;
}): DecisionDraft {
  const { vesper, ash, kai, damian, snap, locale } = input;
  const cards = snap.scorecard ?? [];
  const card = (id: "vesper" | "ash" | "kai") => cards.find((c) => c.id === id);
  const mv = historicalMultiplier(card("vesper")?.closed ?? 0, card("vesper")?.hitPct ?? null);
  const ma = historicalMultiplier(card("ash")?.closed ?? 0, card("ash")?.hitPct ?? null);
  const mk = historicalMultiplier(card("kai")?.closed ?? 0, card("kai")?.hitPct ?? null);
  const hist = historicalEdge(
    (card("vesper")?.closed ?? 0) + (card("ash")?.closed ?? 0) + (card("kai")?.closed ?? 0),
    (() => {
      const rows = ["vesper", "ash", "kai"] as const;
      let w = 0;
      let c = 0;
      for (const id of rows) {
        const r = card(id);
        if (r && r.closed >= 2 && r.hitPct != null) {
          w += r.hitPct * r.closed;
          c += r.closed;
        }
      }
      return c ? w / c : null;
    })(),
  );

  type Cand = { symbol: string; side: Side; cut: boolean };
  const cands: Cand[] = [];
  const seen = new Set<string>();
  function push(symbol: string, side: Side, cut = false) {
    const k = `${symbol}:${side}:${cut ? "c" : "n"}`;
    if (seen.has(k)) return;
    seen.add(k);
    cands.push({ symbol, side, cut });
  }
  if (input.cut) push(input.cut.symbol, input.cut.side, true);
  for (const i of vesper.ideas) push(i.symbol, i.side);
  for (const i of ash.ideas) push(i.symbol, i.side);
  for (const s of kai.scan) if (s.status === "ready") push(s.symbol, s.side);

  let best: DecisionDraft | null = null;

  for (const cand of cands) {
    const v = ideaScore(vesper.ideas, cand.symbol, cand.side);
    const a = ideaScore(ash.ideas, cand.symbol, cand.side);
    const setup = kaiOn(kai, input.validated ?? null, cand.symbol, cand.side);
    const kSigned = setup ? (setup.side === cand.side ? setup.qualityScore : -setup.qualityScore) : 0;
    const d = sectorScoreFor(cand.symbol, {
      equities: damian.sectors.find((s) => s.id === "equities")?.score ?? 0,
      crypto: damian.sectors.find((s) => s.id === "crypto")?.score ?? 0,
      metals: damian.sectors.find((s) => s.id === "metals")?.score ?? 0,
      dollar: damian.sectors.find((s) => s.id === "dollar")?.score ?? 0,
      vol: damian.sectors.find((s) => s.id === "vol")?.score ?? 0,
    });
    const final =
      v * WEIGHTS.vesper * mv +
      a * WEIGHTS.ash * ma +
      kSigned * WEIGHTS.kai * mk +
      d * WEIGHTS.damian +
      hist * WEIGHTS.historical;
    const agree = disagreement(v, a, kSigned);
    if (cand.side === "sell" && agree.direction === "buy") {
      /* keep candidate side; agreement is about signed contributions already in candidate frame */
    }
    const scout = Math.max(v, a);
    const kaiReady = Boolean(setup && setup.side === cand.side && setup.status === "ready");
    const rr = setup?.rr ?? 0;
    const port = portfolioOk(snap, cand.symbol, cand.side, cand.cut);
    const scoutOk = cand.cut || scout >= HARD.MIN_SCOUT_SCORE;
    const kaiOk = cand.cut || kaiReady;
    const rrOk = cand.cut || rr >= HARD.MIN_RR;
    const passed = scoutOk && kaiOk && rrOk && port.ok && agree.level !== "low";
    const band = cand.cut ? "normal" : !passed && agree.level === "low" ? "wait" : bandOf(final, input.prevBand ?? null);
    const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
    const pos = snap.book.positions.find((p) => p.symbol === cand.symbol);
    const adding = Boolean(pos && Math.abs(pos.qty) > 1e-8 && ((pos.qty > 0 && cand.side === "buy") || (pos.qty < 0 && cand.side === "sell")));
    const size = cand.cut ? 0 : sizeForBand(passed ? band : "wait", d, openCount, adding, agree);
    const reasons: string[] = [];
    if (!scoutOk) reasons.push(L(locale, "Scout score below 60.", "Wynik zwiadu poniżej 60."));
    if (!kaiOk) reasons.push(L(locale, "Kai not ready or direction mismatch.", "Kai nie ready albo inny kierunek."));
    if (!rrOk) reasons.push(L(locale, `RR ${rr.toFixed(2)} below 1.5.`, `RR ${rr.toFixed(2)} poniżej 1,5.`));
    if (!port.ok) reasons.push(port.reasons.join(", "));
    if (agree.level === "low") reasons.push(L(locale, "High disagreement.", "Duża rozbieżność."));

    const draft: DecisionDraft = {
      decisionId: newRunId(),
      symbol: cand.symbol,
      side: cand.side,
      finalScore: Number(final.toFixed(2)),
      band: cand.cut ? "normal" : passed ? band : band === "reject" ? "reject" : "wait",
      agreement: { ...agree, direction: cand.side },
      contributors: {
        vesper: Number(v.toFixed(2)),
        ash: Number(a.toFixed(2)),
        kai: Number(kSigned.toFixed(2)),
        damian: Number(d.toFixed(2)),
        historical: Number(hist.toFixed(2)),
      },
      multipliers: { vesper: mv, ash: ma, kai: mk },
      gate: {
        passed: cand.cut ? port.ok : passed,
        scoutScore: scoutOk,
        kaiNotBlocked: kaiReady || cand.cut,
        kaiDirection: kaiReady || cand.cut,
        rr: rrOk,
        portfolio: port.ok,
        reasons,
      },
      entry: { type: "limit", price: setup?.entryPrice ?? null },
      risk: { sizePct: size, stop: setup?.invalidation ?? null, target: setup?.target ?? null, rr },
      cut: cand.cut,
    };

    if (!best) best = draft;
    else if (cand.cut && !best.cut) best = draft;
    else if (cand.cut === best.cut && draft.finalScore > best.finalScore) best = draft;
    else if (cand.cut === best.cut && draft.gate.passed && !best.gate.passed) best = draft;
  }

  if (!best) {
    return {
      decisionId: newRunId(),
      symbol: null,
      side: null,
      finalScore: 0,
      band: "reject",
      agreement: { direction: "hold", level: "medium", score: 0 },
      contributors: { vesper: 0, ash: 0, kai: 0, damian: 0, historical: hist },
      multipliers: { vesper: mv, ash: ma, kai: mk },
      gate: {
        passed: false,
        scoutScore: false,
        kaiNotBlocked: false,
        kaiDirection: false,
        rr: false,
        portfolio: true,
        reasons: [L(locale, "No candidate.", "Brak kandydata.")],
      },
      entry: { type: "limit", price: null },
      risk: { sizePct: 0, stop: null, target: null, rr: 0 },
      cut: false,
    };
  }
  return best;
}

export function irisChecks(snap: MarketSnapshot, decision: DecisionDraft, _kai: KaiSetup | null): IrisChecks {
  const symbol = decision.symbol;
  const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
  const pos = symbol ? snap.book.positions.find((p) => p.symbol === symbol) : undefined;
  const flattening = isFlatteningSide(pos, decision.side);
  const tk = symbol ? snap.tickers.find((t) => t.symbol === symbol) : undefined;
  const rvol = tk?.rvol ?? 1;
  const adding = Boolean(
    pos && decision.side && Math.abs(pos.qty) > 1e-8 && ((pos.qty > 0 && decision.side === "buy") || (pos.qty < 0 && decision.side === "sell")),
  );
  return emptyChecks({
    openLegLimit: decision.cut || flattening || adding || openCount < HARD.MAX_OPEN_LEGS,
    restingOrderLimit: !hasBlockingRestingLimit(snap, decision),
    // Round-trip fees and MAX_ADDS_PER_DAY are enforced at paper fill (commitFill), not duplicated here.
    feeLimit: true,
    teamLock: !(symbol && teamBlocks(snap.book.positions, symbol)),
    liquidity: rvol >= 0.55 || decision.cut,
    drawdown: snap.book.dayPnlPct >= -2.4 && (100 * snap.book.cash) / Math.max(snap.book.equity, 1) >= 18,
    scoutScore: decision.gate.scoutScore,
    kaiStatus: decision.cut || decision.gate.kaiNotBlocked,
    kaiDirection: decision.cut || decision.gate.kaiDirection,
    rr: decision.cut || decision.gate.rr,
  });
}

export function applyRestingLimitGate(
  checks: IrisChecks,
  snap: MarketSnapshot,
  _kai: KaiSetup | null,
  decision: { cut: boolean; symbol: string | null; side: Side | null },
): IrisChecks {
  return { ...checks, restingOrderLimit: !hasBlockingRestingLimit(snap, decision) };
}

export { bandOf, disagreement };
