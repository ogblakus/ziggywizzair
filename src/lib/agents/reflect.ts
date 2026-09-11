import { AGENTS, type AgentId, type Vote } from "@/lib/agents/personas";
import type { Locale } from "@/lib/i18n/catalog";
import type { ClosedTrade, CouncilResult } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

/** Post-close notes — what each agent takes from this trade. Always in `locale`. */
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
  const fromRow = closed.agents ?? [];

  return AGENTS.map((p) => {
    const prior =
      lastCouncil?.agents.find((a) => a.id === p.id) ?? fromRow.find((a) => a.id === p.id);
    const vote: Vote = prior?.vote ?? "hold";
    const priorSym = (prior as { symbol?: string | null } | undefined)?.symbol;
    const called = Boolean(prior && prior.vote !== "hold" && (!priorSym || priorSym === name));
    const withUs =
      called &&
      ((long && prior!.vote === "buy") || (!long && prior!.vote === "sell"));

    let thesis: string;
    if (p.id === "vesper") {
      thesis = withUs
        ? win
          ? L(locale, `${name} paid the trend (${pnl}). I keep riding names that still expand versus the 20-day average.`, `${name} zapłaciło za trend (${pnl}). Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej.`)
          : L(locale, `${name} stalled on me (${pnl}). Next time I cut faster when the move rolls over versus the 20-day average.`, `${name} stanęło (${pnl}). Następnym razem szybciej zdejmę, gdy ruch się zawija względem 20-sesyjnej średniej.`)
        : L(locale, `Wasn't my momentum name. Result ${pnl}.`, `To nie był mój ruch z momentum. Wynik ${pnl}.`);
    } else if (p.id === "ash") {
      thesis = withUs
        ? win
          ? L(locale, `The fade on ${name} worked (${pnl}). Extremes still mean-revert — one small ticket.`, `Odbicie na ${name} zadziałało (${pnl}). Skrajności wracają do średniej — jedna mała noga.`)
          : L(locale, `${name} kept going (${pnl}). That wasn't an extreme, it was trend. I sit out the next stretch.`, `${name} pojechało dalej (${pnl}). To nie była skrajność, tylko trend. Następne wyciągnięcie odpuszczam.`)
        : L(locale, `Not my fade. ${name} closed ${pnl}.`, `Nie moje odbicie. ${name} zamknięte ${pnl}.`);
    } else if (p.id === "kai") {
      thesis = withUs
        ? win
          ? L(locale, `The 15m/1h/4h setup on ${name} held (${pnl}). An FVG on the higher timeframe or a 15m pullback plus volume was enough.`, `Setup 15m/1h/4h na ${name} się obronił (${pnl}). Luka FVG z wyższego interwału albo cofnięcie 15m plus wolumen wystarczyły.`)
          : L(locale, `The 15m/1h/4h setup on ${name} failed (${pnl}). Next time I want a cleaner higher-timeframe FVG or a deeper 15m retrace.`, `Setup 15m/1h/4h na ${name} padł (${pnl}). Następnym razem czystsze FVG z 1h/4h albo głębsze cofnięcie 15m.`)
        : L(locale, `I didn't set a limit on ${name}. Closed ${pnl}. If 15m/1h/4h had no pullback and no FVG, sitting out was correct.`, `Nie stawiałem limitu na ${name}. Zamknięte ${pnl}. Jeśli 15m/1h/4h nie dały cofnięcia i FVG, czekanie było w porządku.`);
    } else if (p.id === "damian") {
      const weather = lastCouncil?.sentiment?.summary;
      thesis = win
        ? L(locale, `Result ${pnl}. ${weather ? `${weather}. ` : ""}The weather didn't fight this trade.`, `Wynik ${pnl}. ${weather ? `${weather}. ` : ""}Pogoda nie biła się z tą nogą.`)
        : L(locale, `Result ${pnl}. ${weather ? `${weather}. ` : ""}I'll flag this sector more carefully next round.`, `Wynik ${pnl}. ${weather ? `${weather}. ` : ""}Ten sektor następnym razem oznaczę ostrożniej.`);
    } else {
      thesis = win
        ? L(locale, `${name} ${pnl}. Size from Damian's weather was fine. I keep this 2–6% band.`, `${name} ${pnl}. Wielkość od pogody Damiana była w porządku. Zostaję przy 2–6%.`)
        : L(locale, `${name} ${pnl}. I'll size smaller next time Damian is mixed.`, `${name} ${pnl}. Następnym razem mniejsza noga, gdy Damian jest mieszany.`);
    }
    return { id: p.id, vote, thesis };
  });
}
