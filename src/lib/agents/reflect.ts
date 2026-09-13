import { AGENTS, type AgentId, type Vote } from "@/lib/agents/personas";
import type { Locale } from "@/lib/i18n/catalog";
import { assetLabel } from "@/lib/i18n/labels";
import type { ClosedTrade, CouncilResult } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

export function looksLikeReflection(thesis: string) {
  return /Wynik \+|Result \+|Nie moje odbicie|Wasn't my momentum|Nie stawiałem limitu|I didn't set a limit|To nie był mój ruch|Weather didn't fight|Pogoda nie biła|Wielkość od pogody|Size from Damian|I keep this 2–6|Zostaję przy 2/.test(
    thesis,
  );
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
  const name = assetLabel(closed.symbol, locale);
  const long = closed.side !== "short";
  const fromRow = closed.agents ?? [];
  const out: Array<{ id: AgentId; vote: Vote; thesis: string }> = [];

  for (const p of AGENTS) {
    const prior =
      lastCouncil?.agents.find((a) => a.id === p.id) ?? fromRow.find((a) => a.id === p.id);
    const vote: Vote = prior?.vote ?? "hold";
    const priorSym = (prior as { symbol?: string | null } | undefined)?.symbol;
    const called = Boolean(prior && prior.vote !== "hold" && (!priorSym || priorSym === closed.symbol));
    const withUs =
      called &&
      ((long && prior!.vote === "buy") || (!long && prior!.vote === "sell"));

    if ((p.id === "vesper" || p.id === "ash" || p.id === "kai") && !called) continue;

    let thesis: string;
    if (p.id === "vesper") {
      thesis = withUs
        ? win
          ? L(locale, `${name} paid the trend. I keep riding names that still expand versus the 20-day average.`, `${name} zapłaciło za trend. Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej.`)
          : L(locale, `${name} stalled on me. Next time I cut faster when the move rolls over versus the 20-day average.`, `${name} stanęło. Następnym razem szybciej zdejmę, gdy ruch się zawija względem 20-sesyjnej średniej.`)
        : L(locale, `I sat this one out — no expansion to ride.`, `Siedziałem — nie było momentum do jazdy.`);
    } else if (p.id === "ash") {
      thesis = withUs
        ? win
          ? L(locale, `The fade on ${name} worked. Extremes still mean-revert — one small ticket.`, `Odbicie na ${name} zadziałało. Skrajności wracają do średniej — jedna mała noga.`)
          : L(locale, `${name} kept going. That wasn't an extreme, it was trend. I sit out the next stretch.`, `${name} pojechało dalej. To nie była skrajność, tylko trend. Następne wyciągnięcie odpuszczam.`)
        : L(locale, `No washout to fade. I stayed out.`, `Nie było przeceny do odbicia. Zostałem z boku.`);
    } else if (p.id === "kai") {
      thesis = withUs
        ? win
          ? L(locale, `The 15m/1h/4h setup on ${name} held. An FVG on the higher timeframe or a 15m pullback plus volume was enough.`, `Setup 15m/1h/4h na ${name} się obronił. Luka FVG z wyższego interwału albo cofnięcie 15m plus wolumen wystarczyły.`)
          : L(locale, `The 15m/1h/4h setup on ${name} failed. Next time I want a cleaner higher-timeframe FVG or a deeper 15m retrace.`, `Setup 15m/1h/4h na ${name} padł. Następnym razem czystsze FVG z 1h/4h albo głębsze cofnięcie 15m.`)
        : L(locale, `No pullback and no FVG — sitting out was correct.`, `Nie było cofnięcia ani FVG — czekanie było w porządku.`);
    } else if (p.id === "damian") {
      const weather = lastCouncil?.sentiment?.summary;
      thesis = win
        ? L(locale, `${weather ? `${weather}. ` : ""}The weather didn't fight this trade.`, `${weather ? `${weather}. ` : ""}Pogoda nie biła się z tą nogą.`)
        : L(locale, `${weather ? `${weather}. ` : ""}I'll flag this sector more carefully next round.`, `${weather ? `${weather}. ` : ""}Ten sektor następnym razem oznaczę ostrożniej.`);
    } else {
      thesis = win
        ? L(locale, `Size from Damian's weather was fine. I keep this 2–6% band.`, `Wielkość od pogody Damiana była w porządku. Zostaję przy 2–6%.`)
        : L(locale, `I'll size smaller next time Damian is mixed.`, `Następnym razem mniejsza noga, gdy Damian jest mieszany.`);
    }
    out.push({ id: p.id, vote, thesis });
  }
  return out;
}