import { newRunId } from "@/lib/agents/core/hash";
import { stampAgentMeta } from "@/lib/agents/core/versions";
import type {
  AshIdea,
  AshOutput,
  DamianOutput,
  DamianSector,
  DecisionDraft,
  IrisChecks,
  IrisOutput,
  KaiOutput,
  KaiSetup,
  Locale,
  VesperIdea,
  VesperOutput,
} from "@/lib/agents/core/types";
import {
  ASH_KNOWLEDGE,
  DAMIAN_KNOWLEDGE,
  KAI_KNOWLEDGE,
  VESPER_KNOWLEDGE,
} from "@/lib/agents/knowledge/prompts";
import {
  ashReversionScore,
  damianSectorScores,
  kaiScan,
  kaiSetupFor,
  vesperMomentumScore,
} from "@/lib/agents/math";
import { classifyMacro } from "@/lib/market/macro";
import type { MarketSnapshot, Stance, TickerSnapshot } from "@/lib/types";

export function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

function nums(t: TickerSnapshot, locale: Locale) {
  const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
  const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
  const rvol = t.rvol != null ? t.rvol.toFixed(2) : "—";
  return locale === "pl"
    ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs średnia 15m ${sma}, obrót ${rvol}`
    : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 15m mean ${sma}, volume ${rvol}`;
}

function of(snap: MarketSnapshot, symbol: string) {
  return snap.tickers.find((t) => t.symbol === symbol);
}

export function vesperFallback(snap: MarketSnapshot, locale: Locale, hash: string): VesperOutput {
  const ideas: VesperIdea[] = [];
  const ranked = snap.tickers
    .map((t) => {
      const long = vesperMomentumScore(t, "buy");
      const short = vesperMomentumScore(t, "sell");
      const side = long >= short ? ("buy" as const) : ("sell" as const);
      const score = Math.max(long, short);
      return { t, side, score };
    })
    .sort((a, b) => b.score - a.score);
  for (const row of ranked) {
    if (row.score < 42) break;
    const t = row.t;
    ideas.push({
      symbol: t.symbol,
      side: row.side,
      score: row.score,
      confidence: Math.min(0.9, 0.4 + row.score / 140),
      setup: "momentum_continuation",
      evidence: [
        { metric: "changePct", timeframe: "15m", value: Number(t.changePct.toFixed(2)) },
        { metric: "rvol", timeframe: "15m", value: t.rvol ?? 0 },
        { metric: "rsi", timeframe: "15m", value: Number(t.rsi.toFixed(1)) },
      ],
      invalidation: { type: "structure", price: t.low || t.price * 0.992 },
      thesis: L(
        locale,
        `${nums(t, locale)}. Score ${row.score.toFixed(0)} — ${row.score >= 62 ? "expansion I will ride" : "lean, not a full run"}.`,
        `${nums(t, locale)}. Wynik ${row.score.toFixed(0)} — ${row.score >= 62 ? "ekspansja, którą chcę jechać" : "nachylenie, nie pełny bieg"}.`,
      ),
    });
    if (ideas.length >= 3) break;
  }
  const top = ideas[0];
  return stampAgentMeta({
    agent: "vesper",
    runId: newRunId(),
    timestamp: Date.now(),
    marketStateHash: hash,
    ideas,
    marketView: top ? (top.side === "buy" ? "bullish" : "bearish") : "neutral",
    noTradeReason: ideas.length
      ? null
      : L(locale, "Nothing clearing a momentum threshold.", "Nic nie przebija progu momentum."),
    recommendation: top
      ? { direction: top.side, strength: top.score, confidence: top.confidence }
      : { direction: "hold", strength: 0, confidence: 0.3 },
    knowledgeUsed: VESPER_KNOWLEDGE.slice(0, 3),
    source: "local",
  });
}

export function ashFallback(snap: MarketSnapshot, locale: Locale, hash: string): AshOutput {
  const ideas: AshIdea[] = [];
  const ranked = snap.tickers
    .map((t) => {
      const buy = ashReversionScore(t, "buy");
      const sell = ashReversionScore(t, "sell");
      const side = buy >= sell ? ("buy" as const) : ("sell" as const);
      return { t, side, score: Math.max(buy, sell) };
    })
    .sort((a, b) => b.score - a.score);
  for (const row of ranked) {
    if (row.score < 42) break;
    const t = row.t;
    ideas.push({
      symbol: t.symbol,
      side: row.side,
      score: row.score,
      confidence: Math.min(0.88, 0.4 + row.score / 140),
      setup: "overextension_reversion",
      evidence: [
        { metric: "vsSma", timeframe: "15m", value: Number(t.vsSma.toFixed(2)) },
        { metric: "rsi", timeframe: "15m", value: Number(t.rsi.toFixed(1)) },
      ],
      targetType: "mean",
      invalidation: { type: "continuation", price: row.side === "buy" ? t.low : t.high },
      thesis: L(
        locale,
        `${nums(t, locale)}. Score ${row.score.toFixed(0)} — ${row.side === "buy" ? "wash, one clip" : "stretch, I sell strength"}.`,
        `${nums(t, locale)}. Wynik ${row.score.toFixed(0)} — ${row.side === "buy" ? "przecena, jeden clip" : "wyciągnięcie, sprzedaję siłę"}.`,
      ),
    });
    if (ideas.length >= 3) break;
  }
  const top = ideas[0];
  return stampAgentMeta({
    agent: "ash",
    runId: newRunId(),
    timestamp: Date.now(),
    marketStateHash: hash,
    ideas,
    marketView: top ? (top.side === "sell" ? "reversion_short" : "reversion_long") : "hold",
    recommendation: top
      ? { direction: top.side, strength: top.score, confidence: top.confidence }
      : { direction: "hold", strength: 0, confidence: 0.45 },
    knowledgeUsed: ASH_KNOWLEDGE.slice(0, 3),
    source: "local",
  });
}

export function kaiFallback(snap: MarketSnapshot, locale: Locale, hash: string): KaiOutput {
  const scan = kaiScan(snap.tickers, 3).map((row) => {
    const t = of(snap, row.symbol);
    const reason = !t
      ? ""
      : row.status === "blocked"
        ? L(
            locale,
            `${row.symbol}: ${row.evidence.join(", ") || "blocked"}.`,
            `${row.symbol}: ${row.evidence.join(", ") || "zablokowane"}.`,
          )
        : L(
            locale,
            `${row.symbol} ${row.side} on ${row.timeframe ?? "15m"}. ${row.evidence.join(", ")}. RR ${row.rr.toFixed(2)}.`,
            `${row.symbol} ${row.side === "buy" ? "kupno" : "sprzedaż"} na ${row.timeframe ?? "15m"}. ${row.evidence.join(", ")}. RR ${row.rr.toFixed(2)}.`,
          );
    return { ...row, reason };
  });
  const primary = scan[0] ?? null;
  return stampAgentMeta({
    agent: "kai",
    runId: newRunId(),
    timestamp: Date.now(),
    marketStateHash: hash,
    scan,
    primary,
    recommendation:
      primary && primary.status !== "blocked"
        ? { direction: primary.side, strength: primary.qualityScore, confidence: primary.status === "ready" ? 0.7 : 0.55 }
        : { direction: "hold", strength: 0, confidence: 0.3 },
    knowledgeUsed: KAI_KNOWLEDGE.slice(0, 3),
    source: "local",
  });
}

function stanceFromScore(score: number): Stance {
  if (score >= 18) return "bullish";
  if (score <= -18) return "bearish";
  return "neutral";
}

export function damianFallback(snap: MarketSnapshot, locale: Locale, hash: string): DamianOutput {
  const scores = damianSectorScores(snap.macro, snap.tickers);
  const pulse = classifyMacro(snap.macro);
  const cap = snap.macro?.cryptoMcap ?? null;
  const capPct = snap.macro?.cryptoMcapPct ?? null;
  const why = (id: DamianSector["id"], stance: Stance): string => {
    if (id === "crypto") {
      const capBit =
        cap != null
          ? cap >= 1e12
            ? `$${(cap / 1e12).toFixed(2)}T`
            : `$${Math.round(cap / 1e9)}B`
          : null;
      const pctBit = capPct != null ? `${capPct >= 0 ? "+" : ""}${capPct.toFixed(2)}%` : null;
      const head = [capBit, pctBit].filter(Boolean).join(", ");
      if (stance === "bearish") return L(locale, `${head || "crypto"} — liquidity weaker.`, `${head || "krypto"} — płynność słabsza.`);
      if (stance === "bullish") return L(locale, `${head || "crypto"} — liquidity supportive.`, `${head || "krypto"} — płynność sprzyja.`);
      return L(locale, `${head || "crypto"} — two-way.`, `${head || "krypto"} — w dwie strony.`);
    }
    if (id === "equities") {
      return stance === "bearish"
        ? L(locale, "Stocks weak or vol jumped.", "Akcje słabe albo skok zmienności.")
        : stance === "bullish"
          ? L(locale, "Broad stocks bid, vol not in the way.", "Szeroki rynek w górę, zmienność nie przeszkadza.")
          : L(locale, "Stocks have no one-way read.", "Akcje bez kierunku.");
    }
    if (id === "metals") {
      return stance === "bullish"
        ? L(locale, "Softer dollar helps gold and silver.", "Słabszy dolar sprzyja złotu i srebru.")
        : stance === "bearish"
          ? L(locale, "Firmer dollar weighs on metals.", "Mocniejszy dolar waży na metalach.")
          : L(locale, "Metals have no impulse.", "Metale bez impulsu.");
    }
    if (id === "dollar") {
      return stance === "bullish"
        ? L(locale, "The dollar is firming.", "Dolar się umacnia.")
        : stance === "bearish"
          ? L(locale, "The dollar is softening.", "Dolar słabnie.")
          : L(locale, "Dollar is flat.", "Dolar płaski.");
    }
    return stance === "bearish"
      ? L(locale, "Vol is expanding.", "Zmienność się rozszerza.")
      : stance === "bullish"
        ? L(locale, "Vol is calm — risk is allowed.", "Zmienność spokojna — ryzyko można brać.")
        : L(locale, "Vol is ordinary.", "Zmienność zwyczajna.");
  };
  const sectors: DamianSector[] = (["equities", "crypto", "metals", "dollar", "vol"] as const).map((id) => {
    const score = scores[id];
    const stance = stanceFromScore(score);
    return { id, stance, score, why: why(id, stance) };
  });
  const regime =
    pulse.vol === "hot" || (scores.equities < -25 && scores.crypto < -25)
      ? "risk_off"
      : scores.equities > 20 && scores.crypto > 10
        ? "risk_on"
        : "cautious";
  const summary = L(
    locale,
    `${regime.replace("_", "-")} — ${sectors
      .filter((s) => s.stance !== "neutral")
      .map((s) => `${s.id} ${s.stance}`)
      .join(" · ") || "mixed weather"}.`,
    `${regime === "risk_on" ? "chętni do ryzyka" : regime === "risk_off" ? "risk-off" : "ostrożnie"} — ${
      sectors
        .filter((s) => s.stance !== "neutral")
        .map((s) => `${s.id} ${s.stance === "bullish" ? "byczo" : "niedźwiedzio"}`)
        .join(" · ") || "pogoda mieszana"
    }.`,
  );
  return stampAgentMeta({
    agent: "damian",
    runId: newRunId(),
    timestamp: Date.now(),
    marketStateHash: hash,
    regime,
    confidence: 0.55,
    sectors,
    cryptoMarketCap: { usd: cap, changePct: capPct },
    macroEvents: [],
    summary,
    recommendation: { direction: "hold", strength: 0, confidence: 0.55 },
    knowledgeUsed: DAMIAN_KNOWLEDGE.slice(0, 3),
    source: "local",
  });
}

export function kaiValidate(snap: MarketSnapshot, symbol: string, side: "buy" | "sell", locale: Locale): KaiSetup | null {
  const t = of(snap, symbol);
  if (!t) return null;
  const row = kaiSetupFor(t, side);
  row.reason = L(
    locale,
    `${symbol} ${side} validate: ${row.status} · RR ${row.rr.toFixed(2)} · ${row.evidence.join(", ") || "no setup"}.`,
    `${symbol} ${side === "buy" ? "kupno" : "sprzedaż"}: ${row.status} · RR ${row.rr.toFixed(2)} · ${row.evidence.join(", ") || "brak setupu"}.`,
  );
  return row;
}

export function irisRules(input: {
  locale: Locale;
  decision: DecisionDraft;
  checks: IrisChecks;
}): IrisOutput {
  const { locale, decision, checks } = input;
  const codeDecision: IrisOutput["decision"] = (() => {
    if (decision.cut) return "approve";
    if (!decision.gate.passed) return decision.band === "wait" ? "wait" : "reject";
    if (decision.band === "reject") return "reject";
    if (decision.band === "wait") return "wait";
    if (decision.band === "small") return "reduce";
    return "approve";
  })();
  return stampAgentMeta({
    agent: "iris",
    runId: newRunId(),
    timestamp: Date.now(),
    decision: codeDecision,
    symbol: decision.symbol,
    side: decision.side,
    risk: {
      basePct: decision.risk.sizePct,
      macroMultiplier: 1,
      portfolioMultiplier: 1,
      performanceMultiplier: 1,
      disagreementMultiplier: decision.agreement.level === "low" ? 0.5 : 1,
      finalSizePct: codeDecision === "approve" || codeDecision === "reduce" ? decision.risk.sizePct : 0,
    },
    order:
      codeDecision === "approve" || codeDecision === "reduce"
        ? { type: "limit", price: decision.entry.price, sizePct: decision.risk.sizePct }
        : null,
    riskReward: { stop: decision.risk.stop, target: decision.risk.target, rr: decision.risk.rr },
    checks,
    reason: L(
      locale,
      codeDecision === "reject"
        ? decision.gate.passed
          ? `Rejected. Score ${decision.finalScore.toFixed(0)} below 45.`
          : `Rejected. ${decision.gate.reasons.join(" ") || "Hard gate."}`
        : codeDecision === "wait"
          ? `Wait. Agreement ${decision.agreement.level}, score ${decision.finalScore.toFixed(0)}.`
          : `Sized ${decision.risk.sizePct.toFixed(1)}% · score ${decision.finalScore.toFixed(0)} · ${decision.agreement.level} agreement.`,
      codeDecision === "reject"
        ? decision.gate.passed
          ? `Odrzucam. Wynik ${decision.finalScore.toFixed(0)} poniżej 45.`
          : `Odrzucam. ${decision.gate.reasons.join(" ") || "Twarda bramka."}`
        : codeDecision === "wait"
          ? `Czekam. Zgoda ${decision.agreement.level}, wynik ${decision.finalScore.toFixed(0)}.`
          : `Wielkość ${decision.risk.sizePct.toFixed(1)}% · wynik ${decision.finalScore.toFixed(0)} · zgoda ${decision.agreement.level}.`,
    ),
    source: "rules",
  });
}
