import { AGENTS, type AgentId, type Vote } from "@/lib/agents/personas";
import type { Locale } from "@/lib/i18n/catalog";
import type { ClosedTrade, CouncilResult } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

/** Post-close notes — what each agent takes from this trade. */
export function reflectClosed(
  closed: ClosedTrade,
  lastCouncil: CouncilResult | null | undefined,
  locale: Locale,
): Array<{ id: AgentId; vote: Vote; thesis: string }> {
  const win = (closed.pnl ?? 0) > 0;
  const pnl =
    closed.pnlPct != null ? `${closed.pnlPct >= 0 ? "+" : ""}${closed.pnlPct.toFixed(2)}%` : "";
  const name = closed.symbol;
  const long = closed.side !== "short";

  return AGENTS.map((p) => {
    const prior = lastCouncil?.agents.find((a) => a.id === p.id);
    const vote: Vote = prior?.vote ?? "hold";
    const called = Boolean(prior && prior.symbol === name && prior.vote !== "hold");
    const withUs =
      called &&
      ((long && prior!.vote === "buy") || (!long && prior!.vote === "sell"));

    let thesis: string;
    if (p.id === "vesper") {
      thesis = withUs
        ? win
          ? L(locale, `${name} paid the trend (${pnl}). I keep riding names that still expand vs the 20-SMA.`, `${name} zapłaciło za trend (${pnl}). Dalej jadę z tymi, które rosną vs SMA20.`)
          : L(locale, `${name} stalled on me (${pnl}). Next time I cut faster when RSI rolls over and vs SMA20 dies.`, `${name} stanęło (${pnl}). Następnym razem szybciej zdejmę, gdy RSI się zawija i vs SMA20 pada.`)
        : L(locale, `Wasn't my momentum name. Result ${pnl}.`, `To nie był mój momentum. Wynik ${pnl}.`);
    } else if (p.id === "ash") {
      thesis = withUs
        ? win
          ? L(locale, `The fade on ${name} worked (${pnl}). Extremes (RSI / vs SMA20) still mean-revert — one clip.`, `Fade na ${name} zadziałał (${pnl}). Skrajności RSI / vs SMA20 wracają — jeden clip.`)
          : L(locale, `${name} kept going (${pnl}). That wasn't an extreme, it was trend. I sit out the next stretch.`, `${name} pojechało dalej (${pnl}). To nie była skrajność, tylko trend. Następne wyciągnięcie odpuszczam.`)
        : L(locale, `Not my fade. ${name} closed ${pnl}.`, `Nie mój fade. ${name} zamknięte ${pnl}.`);
    } else if (p.id === "kai") {
      thesis = withUs
        ? win
          ? L(locale, `12×1m setup on ${name} held (${pnl}). Pullback / FVG + rvol was enough.`, `Setup 12×1m na ${name} się obronił (${pnl}). Cofnięcie / FVG + rvol wystarczyło.`)
          : L(locale, `12×1m setup on ${name} failed (${pnl}). Next time I want a cleaner FVG tag or a deeper retrace.`, `Setup 12×1m na ${name} padł (${pnl}). Następnym razem czystsze FVG albo głębsze cofnięcie.`)
        : L(locale, `I didn't set a limit on ${name}. Closed ${pnl}. If there was no pullback and no FVG, sitting out was correct.`, `Nie stawiałem limitu na ${name}. Zamknięte ${pnl}. Jeśli nie było cofnięcia i FVG, czekanie było OK.`);
    } else if (p.id === "damian") {
      const weather = lastCouncil?.sentiment?.summary;
      thesis = win
        ? L(locale, `Tape ${pnl}. ${weather ? `${weather}. ` : ""}Weather didn't fight this clip.`, `Taśma ${pnl}. ${weather ? `${weather}. ` : ""}Pogoda nie biła się z tym clipem.`)
        : L(locale, `Tape ${pnl}. ${weather ? `${weather}. ` : ""}I'll flag this sector more carefully next round.`, `Taśma ${pnl}. ${weather ? `${weather}. ` : ""}Ten sektor następnym razem oznaczę ostrożniej.`);
    } else {
      thesis = win
        ? L(locale, `${name} ${pnl}. Clip from Damian's weather was fine. I keep this 2–6% band.`, `${name} ${pnl}. Clip od pogody Damiana był OK. Zostaję przy 2–6%.`)
        : L(locale, `${name} ${pnl}. I'll clip smaller next time Damian is mixed.`, `${name} ${pnl}. Następnym razem mniejszy clip, gdy Damian jest mieszany.`);
    }
    return { id: p.id, vote, thesis };
  });
}
