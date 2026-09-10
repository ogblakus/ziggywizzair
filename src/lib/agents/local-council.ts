import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { gateCouncilOrder } from "@/lib/agents/quorum";
import { isWhyOpenedQuestion, replyLocale } from "@/lib/ai/ask-lang";
import { isAddOn, pullbackInTrend } from "@/lib/desk/holds";
import { clipPctOf, markOf, qtyForClip } from "@/lib/desk/size";
import type { Locale } from "@/lib/i18n/catalog";
import { macroHint, sectorBoard, sentimentBias } from "@/lib/market/macro";
import type { CouncilResult, MacroTape, MarketSnapshot, ProposedOrder, SentimentReport, TickerSnapshot } from "@/lib/types";

let councilRound = 0;

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

function damianReport(
  locale: Locale,
  opts?: { macro?: MacroTape | null; tickers?: TickerSnapshot[] },
): {
  thesis: string;
  vote: "hold";
  symbol: null;
  conviction: number;
  sizePct: number;
  sentiment: SentimentReport;
} {
  const board = sectorBoard(opts?.macro, opts?.tickers ?? [], locale);
  const hint = macroHint(opts?.macro, locale);
  const thesis = hint ? `${board.summary}. ${hint}` : board.summary;
  return {
    thesis: thesis.slice(0, 280),
    vote: "hold",
    symbol: null,
    conviction: 0.55,
    sizePct: 0,
    sentiment: board,
  };
}

function rank(tickers: TickerSnapshot[], pred: (t: TickerSnapshot) => number) {
  return [...tickers].sort((a, b) => pred(b) - pred(a));
}

function at(list: TickerSnapshot[], i: number) {
  return list[Math.min(Math.max(i, 0), list.length - 1)];
}

function skipLast(list: TickerSnapshot[], lastSymbol: string | null | undefined, i = 0) {
  if (!lastSymbol) return at(list, i);
  const filtered = list.filter((t) => t.symbol !== lastSymbol);
  if (!filtered.length) return at(list, i);
  return at(filtered, i);
}

function nums(t: TickerSnapshot, locale: Locale) {
  const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
  const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
  const rvol = t.rvol != null ? `rvol ${t.rvol.toFixed(2)}` : locale === "pl" ? "brak rvol" : "no rvol";
  return locale === "pl"
    ? `${t.symbol}: ${chg} od otwarcia, RSI ${t.rsi.toFixed(0)}, vs SMA20 ${sma}, ${rvol}`
    : `${t.symbol}: ${chg} from the open, RSI ${t.rsi.toFixed(0)}, vs 20-SMA ${sma}, ${rvol}`;
}

function kaiLine(tk: TickerSnapshot, side: "buy" | "sell", locale: Locale) {
  const retrace = side === "buy" ? tk.buyRetrace : tk.sellRetrace;
  const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
  const wick = side === "buy" ? tk.buyWick : tk.sellWick;
  const kind = side === "buy" ? tk.buySetup : tk.sellSetup;
  const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
  const rvol = tk.rvol != null ? `rvol ${tk.rvol.toFixed(2)}` : locale === "pl" ? "brak rvol" : "no rvol";
  const extreme = side === "buy" ? L(locale, "the 12-bar high", "szczytu 12 świec") : L(locale, "the 12-bar low", "dołka 12 świec");
  const dir = side === "buy" ? L(locale, "long", "kupno") : L(locale, "short", "sprzedaż");
  const bits: string[] = [
    L(locale, `${tk.symbol} ${dir} on last 12×1m HL candles.`, `${tk.symbol} ${dir} — ostatnie 12 świec 1m z Hyperliquid.`),
  ];
  if (kind === "chase") {
    bits.push(
      L(
        locale,
        `Price sits in the last ${retrace ?? 0}% off ${extreme} and the last bar still prints that way — chase, no limit.`,
        `Cena siedzi ${retrace ?? 0}% od ${extreme} i ostatnia świeca dalej to potwierdza — pogoń, bez limitu.`,
      ),
    );
  } else if (retrace != null) {
    bits.push(
      L(
        locale,
        `Retrace ${retrace}% from ${extreme}${kind === "pullback" ? " (in the 18–62% entry band)" : ""}.`,
        `Cofnięcie ${retrace}% od ${extreme}${kind === "pullback" ? " (pasmo wejścia 18–62%)" : ""}.`,
      ),
    );
  }
  if (fvg) {
    bits.push(
      L(
        locale,
        `${side === "buy" ? "Bullish" : "Bearish"} FVG ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — price is tagging the gap.`,
        `FVG ${side === "buy" ? "wzrostowa" : "spadkowa"} ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — cena testuje lukę.`,
      ),
    );
  } else {
    bits.push(L(locale, "No unfilled 3-bar FVG in this window.", "W tym oknie nie ma niezasypanego FVG (3 świece)."));
  }
  if (wick) {
    bits.push(
      L(
        locale,
        `Last bar has a ${side === "buy" ? "lower" : "upper"} rejection wick.`,
        `Ostatnia świeca ma knot ${side === "buy" ? "dolny" : "górny"} (odrzucenie).`,
      ),
    );
  }
  bits.push(rvol + (limit && kind === "pullback" ? L(locale, `. Limit ${limit.toFixed(2)}.`, `. Limit ${limit.toFixed(2)}.`) : "."));
  return bits.join(" ");
}

function weatherFromSentiment(s: SentimentReport | undefined): { bias: number; en: string; pl: string } {
  const bias = sentimentBias(s?.sectors);
  if (!s?.sectors?.length) {
    return { bias: 0, en: "Damian has no read yet", pl: "Damian jeszcze nic nie powiedział" };
  }
  if (bias >= 0.35) {
    return { bias, en: "Damian: weather is friendly — clip a bit larger", pl: "Damian: pogoda sprzyja — clip trochę większy" };
  }
  if (bias <= -0.35) {
    return { bias, en: "Damian: weather is hostile — clip smaller", pl: "Damian: pogoda nie sprzyja — mniejszy clip" };
  }
  return { bias, en: "Damian: mixed weather — standard clip", pl: "Damian: pogoda mieszana — zwykły clip" };
}

function sizeQty(equity: number, sizePct: number, t: TickerSnapshot) {
  return qtyForClip(equity, sizePct, markOf(t), t.symbol);
}

export function localCouncil(
  snap: MarketSnapshot,
  last?: CouncilResult | null,
  locale: Locale = "en",
  _seenNews: string[] = [],
): CouncilResult {
  councilRound += 1;
  const v = councilRound % 3;
  const tickers = snap.tickers.filter((t) => t.price > 0);
  const lastSym = last?.order?.symbol ?? last?.agents.find((a) => a.vote !== "hold")?.symbol ?? null;

  if (!tickers.length) {
    return {
      mood: "cautious",
      summary: L(locale, "Board is empty. Waiting on live prices.", "Rynek pusty. Czekam na ceny."),
      agents: AGENTS.map((p) => ({
        id: p.id,
        thesis: L(locale, "No prints yet. Nothing to vote.", "Jeszcze nic nie widać. Nie mam głosu."),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.2,
        sizePct: 0,
      })),
      order: null,
      sentiment: sectorBoard(snap.macro, tickers, locale),
    };
  }

  const byMom = rank(tickers, (t) => t.changePct + (t.rvol && t.rvol > 1 ? 0.15 : 0));
  const byWash = rank(tickers, (t) => -t.vsSma);
  const byStretch = rank(tickers, (t) => t.vsSma);
  const byRsiLow = rank(tickers, (t) => -t.rsi);
  const byRsiHigh = rank(tickers, (t) => t.rsi);

  const hot = skipLast(byMom, lastSym, v === 2 ? 1 : 0) ?? byMom[0]!;
  const washed = byWash.find((t) => t.vsSma < -0.55 && t.rsi < 42) ?? skipLast(byWash, lastSym, v === 0 ? 0 : 1)!;
  const stretched = byStretch.find((t) => t.vsSma > 0.85 && t.rsi > 62) ?? skipLast(byStretch, lastSym, v === 2 ? 0 : 1)!;
  const openPos = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8);
  const of = (sym: string) => tickers.find((t) => t.symbol === sym);
  const stalled = openPos.find((p) => {
    const tk = of(p.symbol);
    if (!tk) return false;
    if (p.qty > 0) return tk.changePct < -0.9 || (p.pnlPct < -0.8 && tk.vsSma < 0);
    return tk.changePct > 0.9 || (p.pnlPct < -0.8 && tk.vsSma > 0);
  });
  const stalledTape = stalled ? of(stalled.symbol) : undefined;

  const vesperBuy = hot.changePct > 0.35 && hot.vsSma > 0.15 && hot.rsi >= 50 && hot.rsi < 78;
  const vesperCut = Boolean(stalled && stalledTape);
  const ashBuy = washed.vsSma < -0.55 && washed.rsi < 42;
  const ashSell = stretched.vsSma > 0.85 && stretched.rsi > 62;

  const vesperPick =
    vesperCut && stalled
      ? { side: (stalled.qty < 0 ? "buy" : "sell") as "buy" | "sell", symbol: stalled.symbol, cut: true }
      : vesperBuy
        ? { side: "buy" as const, symbol: hot.symbol, cut: false }
        : null;
  const ashPick = ashBuy
    ? { side: "buy" as const, symbol: washed.symbol, cut: false }
    : ashSell
      ? { side: "sell" as const, symbol: stretched.symbol, cut: false }
      : null;
  const ideas = [vesperPick, ashPick].filter((x): x is NonNullable<typeof vesperPick> => Boolean(x));

  let sentiment: SentimentReport = sectorBoard(snap.macro, tickers, locale);
  const agents: CouncilResult["agents"] = AGENTS.map((p) => {
    if (p.id === "vesper") {
      if (vesperCut && stalled && stalledTape) {
        const cover = stalled.qty < 0;
        return {
          id: p.id,
          thesis: L(
            locale,
            `${stalled.symbol} stalled. ${nums(stalledTape, locale)}. I'd rather be flat than hopeful.`,
            `${stalled.symbol} stanęło. ${nums(stalledTape, locale)}. Wolałabym nic nie trzymać, niż liczyć na cud.`,
          ),
          vote: (cover ? "buy" : "sell") as "buy" | "sell",
          symbol: stalled.symbol,
          conviction: 0.62,
          sizePct: 0,
        };
      }
      if (vesperBuy) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${nums(hot, locale)}. Leader — I want a small long, not a big bet.`,
            `${nums(hot, locale)}. Lider — chcę małą długą, nie duży zakład.`,
          ),
          vote: "buy" as const,
          symbol: hot.symbol,
          conviction: Math.min(0.88, 0.42 + hot.changePct / 4),
          sizePct: 5,
        };
      }
      return {
        id: p.id,
        thesis: L(
          locale,
          `No trend. Hottest print is ${nums(hot, locale)} — noise, not a signal (need >+0.35% from open, vs SMA20 >+0.15, RSI 50–78).`,
          `Nie ma trendu. Najmocniejszy ruch: ${nums(hot, locale)} — szum, nie sygnał (chcę >+0,35% od otwarcia, vs SMA20 >+0,15, RSI 50–78).`,
        ),
        vote: "hold" as const,
        symbol: hot.symbol,
        conviction: 0.38,
        sizePct: 0,
      };
    }
    if (p.id === "ash") {
      if (ashBuy) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${nums(washed, locale)}. Washed (vs SMA20 < −0.55 and RSI < 42) — one clip, no averaging down.`,
            `${nums(washed, locale)}. Przecena (vs SMA20 < −0,55 i RSI < 42) — jeden clip, bez dokładania.`,
          ),
          vote: "buy" as const,
          symbol: washed.symbol,
          conviction: Math.min(0.84, 0.4 + Math.abs(washed.vsSma) / 3),
          sizePct: 4,
        };
      }
      if (ashSell) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${nums(stretched, locale)}. Too far (vs SMA20 > +0.85 and RSI > 62) — I sell strength, I don't chase.`,
            `${nums(stretched, locale)}. Za daleko (vs SMA20 > +0,85 i RSI > 62) — sprzedaję siłę, nie gonię.`,
          ),
          vote: "sell" as const,
          symbol: stretched.symbol,
          conviction: 0.64,
          sizePct: 4,
        };
      }
      return {
        id: p.id,
        thesis: L(
          locale,
          `Extremes: ${byRsiLow[0] ? nums(byRsiLow[0], locale) : "—"} vs ${byRsiHigh[0] ? nums(byRsiHigh[0], locale) : "—"}. Still not a fade I will size (need vs SMA20 < −0.55 / > +0.85).`,
          `Skrajności: ${byRsiLow[0] ? nums(byRsiLow[0], locale) : "—"} vs ${byRsiHigh[0] ? nums(byRsiHigh[0], locale) : "—"}. Nadal za mało na fade (chcę vs SMA20 < −0,55 / > +0,85).`,
        ),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.34,
        sizePct: 0,
      };
    }
    if (p.id === "kai") {
      if (vesperPick?.cut && stalled && stalledTape) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${stalled.symbol} is done. Flatten now — I don't wait for a limit to get out.`,
            `${stalled.symbol} się skończyło. Zdejmuję teraz — z zejścia nie czekam na limit.`,
          ),
          vote: vesperPick.side,
          symbol: stalled.symbol,
          conviction: 0.6,
          sizePct: 0,
        };
      }
      const fresh = ideas.filter((idea) => !idea.cut);
      const stamped = fresh
        .map((idea) => {
          const tk = of(idea.symbol);
          if (!tk) return null;
          if (tk.rvol != null && tk.rvol < 0.55) {
            return { idea, tk, kind: "thin" as const, limit: undefined as number | undefined };
          }
          const kind = idea.side === "buy" ? tk.buySetup : tk.sellSetup;
          const limit = idea.side === "buy" ? tk.buyLimit : tk.sellLimit;
          return { idea, tk, kind: kind ?? "none", limit: limit ?? undefined };
        })
        .filter((x): x is NonNullable<typeof x> => Boolean(x));
      const ready = stamped.filter((x) => x.kind === "pullback" && x.limit);
      ready.sort((a, b) => (b.tk.rvol ?? 1) - (a.tk.rvol ?? 1));
      const best = ready[0];
      if (best && best.limit) {
        return {
          id: p.id,
          thesis: kaiLine(best.tk, best.idea.side, locale),
          vote: best.idea.side,
          symbol: best.idea.symbol,
          conviction: 0.66,
          sizePct: 3,
        };
      }
      const thin = stamped.find((x) => x.kind === "thin");
      if (thin) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${thin.idea.symbol}: rvol ${thin.tk.rvol?.toFixed(2)} (need ≥ 0.55). Dead tape — no limit.`,
            `${thin.idea.symbol}: rvol ${thin.tk.rvol?.toFixed(2)} (chcę ≥ 0,55). Martwy obrót — bez limitu.`,
          ),
          vote: "hold" as const,
          symbol: thin.idea.symbol,
          conviction: 0.5,
          sizePct: 0,
        };
      }
      const chase = stamped.find((x) => x.kind === "chase");
      if (chase) {
        return {
          id: p.id,
          thesis: kaiLine(chase.tk, chase.idea.side, locale),
          vote: "hold" as const,
          symbol: chase.idea.symbol,
          conviction: 0.55,
          sizePct: 0,
        };
      }
      if (fresh[0]) {
        const tk = of(fresh[0].symbol);
        return {
          id: p.id,
          thesis: tk
            ? kaiLine(tk, fresh[0].side, locale)
            : L(
                locale,
                `${fresh[0].symbol}: 12×1m has no pullback (18–62% off the extreme) and no tagging FVG. No limit.`,
                `${fresh[0].symbol}: 12×1m bez cofnięcia (18–62% od ekstremum) i bez FVG pod ceną. Bez limitu.`,
              ),
          vote: "hold" as const,
          symbol: fresh[0].symbol,
          conviction: 0.4,
          sizePct: 0,
        };
      }
      return {
        id: p.id,
        thesis: L(
          locale,
          `No name this round. I read 12×1m candles (pullback 18–62% or FVG + rvol ≥ 0.55) after someone else picks the ticker.`,
          `Nikt nie wskazał spółki. Czytam 12 świec 1m (cofnięcie 18–62% albo FVG + rvol ≥ 0,55), gdy już jest kierunek i ticker.`,
        ),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.3,
        sizePct: 0,
      };
    }
    if (p.id === "damian") {
      const report = damianReport(locale, { macro: snap.macro, tickers });
      sentiment = report.sentiment;
      return {
        id: p.id,
        thesis: report.thesis,
        vote: "hold" as const,
        symbol: null,
        conviction: report.conviction,
        sizePct: 0,
      };
    }
    const cashPct = (100 * snap.book.cash) / Math.max(snap.book.equity, 1);
    const riskOff = snap.book.dayPnlPct < -2.4 || cashPct < 18;
    const names = snap.book.positions.map((p) => p.symbol).join(", ");
    return {
      id: p.id,
      thesis: riskOff
        ? L(
            locale,
            `Book is ${snap.book.dayPnlPct.toFixed(2)}% on the day, cash ${cashPct.toFixed(0)}%. No new risk until things calm. Fees stay ≤ 5% round-trip.`,
            `Portfel ${snap.book.dayPnlPct.toFixed(2)}% w ciągu dnia, gotówka ${cashPct.toFixed(0)}%. Bez nowego ryzyka, dopóki się nie uspokoi. Opłaty ≤ 5% za otwarcie i zamknięcie.`,
          )
        : names
          ? L(
              locale,
              `Cash ${cashPct.toFixed(0)}% · open ${names}. I size 2–6% from Damian's weather. Adds only on a pullback, max two a day. Fees ≤ 5% round-trip.`,
              `Gotówka ${cashPct.toFixed(0)}% · otwarte: ${names}. Clip 2–6% od pogody Damiana. Dokładki tylko na korekcie, max dwie dziennie. Opłaty ≤ 5% za otwarcie i zamknięcie.`,
            )
          : L(
              locale,
              `Cash is ${cashPct.toFixed(0)}% of equity. I size 2–6% from Damian's weather. Fees ≤ 5% round-trip.`,
              `Gotówka to ${cashPct.toFixed(0)}% kapitału. Clip 2–6% od pogody Damiana. Opłaty ≤ 5% za otwarcie i zamknięcie.`,
            ),
      vote: "hold" as const,
      symbol: null,
      conviction: 0.7,
      sizePct: 0,
    };
  });

  const iris = agents.find((a) => a.id === "iris")!;
  const kai = agents.find((a) => a.id === "kai")!;
  const weather = weatherFromSentiment(sentiment);
  const scouts = agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
  const kaiReady = kai.vote !== "hold" && kai.symbol && (kai.vote === "buy" || kai.vote === "sell");

  const mood: CouncilResult["mood"] =
    iris.thesis.includes("No new risk") || iris.thesis.includes("Bez nowego ryzyka")
      ? "risk-off"
      : kaiReady
        ? "risk-on"
        : "cautious";

  let order: ProposedOrder | null = null;
  const cut = scouts.find((a) => {
    const pos = snap.book.positions.find((p) => p.symbol === a.symbol);
    if (!pos) return false;
    return (pos.qty > 0 && a.vote === "sell") || (pos.qty < 0 && a.vote === "buy");
  });

  if (mood !== "risk-off" && kaiReady) {
    const side = kai.vote as "buy" | "sell";
    const symbol = kai.symbol!;
    const lead = scouts.find((a) => a.symbol === symbol && a.vote === side) ?? kai;
    const repeat = last?.order && last.order.symbol === symbol && last.order.side === side;
    const card = snap.scorecard?.find((r) => r.id === lead.id);
    const hits =
      card && card.closed >= 2
        ? L(locale, `${card.wins}/${card.closed} recent hits`, `${card.wins}/${card.closed} ostatnich trafień`)
        : L(locale, "too few closed calls to score", "za mało zamkniętych, żeby ocenić");
    const who = scouts
      .filter((a) => a.symbol === symbol && a.vote === side)
      .map((a) => (a.id === "vesper" ? "Vesper" : "Ash"))
      .join(" + ");
    const adding = isAddOn(
      snap.book.positions.map((p) => ({ symbol: p.symbol, qty: p.qty, avg: p.avg })),
      symbol,
      side,
    );
    const tk = tickers.find((x) => x.symbol === symbol);
    if (repeat) {
      iris.thesis = L(
        locale,
        `We already called ${side.toUpperCase()} ${symbol}. I will not print the same ticket again.`,
        `Już zagłosowaliśmy ${side === "buy" ? "KUP" : "SPRZEDAJ"} ${symbol}. Nie składam tego samego zlecenia drugi raz.`,
      );
    } else if (adding && tk && !pullbackInTrend(side, tk.vsSma, tk.rsi, tk.changePct)) {
      iris.thesis = L(
        locale,
        `${symbol} is not at the end of a pullback. I add only there — not into extension.`,
        `${symbol} nie jest na końcu korekty. Dokładam tylko tam, nie w wyciągnięcie.`,
      );
    } else if (tk) {
      const pctWanted = Math.min(
        6,
        Math.max(2, (card?.sizePct ?? Math.max(lead.sizePct, 3)) * (1 + weather.bias * 0.4)),
      );
      const px = markOf(tk);
      const qty = sizeQty(snap.book.equity, adding ? Math.min(pctWanted, 3) : pctWanted, tk);
      const pct = clipPctOf(qty, px, snap.book.equity);
      const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
      if (qty > 0) {
        order = {
          side,
          symbol,
          qty,
          limitPx: limit && limit > 0 ? Number(limit.toFixed(4)) : undefined,
          rationale: L(
            locale,
            `${who ? `${who} on direction. ` : ""}Iris ${pct.toFixed(1)}% of equity. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`,
            `${who ? `${who} dał kierunek. ` : ""}Iris ${pct.toFixed(1)}% kapitału. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`,
          ),
        };
        iris.vote = side;
        iris.symbol = symbol;
        iris.sizePct = pct;
        iris.thesis = `${order.rationale} ${nums(tk, locale)}.`;
      }
    }
  } else if (mood !== "risk-off" && cut?.symbol) {
    const tk = tickers.find((x) => x.symbol === cut.symbol);
    const pos = snap.book.positions.find((p) => p.symbol === cut.symbol);
    if (tk && pos) {
      order = {
        side: cut.vote as "buy" | "sell",
        symbol: cut.symbol,
        qty: Math.abs(pos.qty),
        rationale: L(
          locale,
          `Iris cuts ${cut.symbol} after ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`,
          `Iris zdejmuje ${cut.symbol} po sygnale ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`,
        ),
      };
      iris.vote = cut.vote;
      iris.symbol = cut.symbol;
      iris.thesis = order.rationale;
    }
  } else if (scouts.length) {
    iris.thesis = L(
      locale,
      `Vesper/Ash have a name, but 12×1m is not an entry yet (need pullback 18–62% or a tagging FVG, and rvol ≥ 0.55). Waiting.`,
      `Vesper/Ash mają spółkę, ale 12×1m nie daje wejścia (potrzeba cofnięcia 18–62% albo FVG pod ceną i rvol ≥ 0,55). Czekamy.`,
    );
  }

  order = gateCouncilOrder(order, agents, snap);
  if (!order) {
    iris.thesis = `${L(locale, weather.en, weather.pl)}. ${iris.thesis}`;
  }

  const summary =
    mood === "risk-off"
      ? L(locale, "Chair keeps the book light. No new risk this round.", "Iris trzyma portfel lekki. Bez nowego ryzyka w tej rundzie.")
      : order
        ? L(
            locale,
            `Limit on ${order.side.toUpperCase()} ${order.symbol}. Iris sized from Damian's weather.`,
            `Limit ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}. Iris dała clip od pogody Damiana.`,
          )
        : L(locale, "No 12×1m setup this round. Stay in cash.", "Brak setupu na 12×1m. Zostajemy w gotówce.");

  return { mood, summary, agents, order, sentiment };
}

export type AskFill = {
  symbol: string;
  side: string;
  qty: number;
  price: number;
  note?: string;
  source?: string;
};

export type AskContext = {
  lastCouncil?: CouncilResult | null;
  recentFills?: AskFill[];
};

const AGENT_NAME: Record<AgentId, string> = {
  vesper: "Vesper",
  ash: "Ash",
  kai: "Kai",
  damian: "Damian",
  iris: "Iris",
};

function plainMove(t: TickerSnapshot, locale: Locale) {
  const chg = t.changePct;
  if (!Number.isFinite(chg) || Math.abs(chg) < 0.2) {
    return L(locale, `${t.symbol} is going nowhere today.`, `${t.symbol} dziś stoi w miejscu.`);
  }
  if (chg >= 1.2) return L(locale, `${t.symbol} is up hard from the open.`, `${t.symbol} ostro rośnie od otwarcia.`);
  if (chg >= 0.35) return L(locale, `${t.symbol} is grinding higher.`, `${t.symbol} idzie w górę.`);
  if (chg <= -1.2) return L(locale, `${t.symbol} is down hard from the open.`, `${t.symbol} wyraźnie spada od otwarcia.`);
  return L(locale, `${t.symbol} is sliding.`, `${t.symbol} się zsuwa.`);
}

function plainHeat(t: TickerSnapshot, locale: Locale) {
  if (t.rsi >= 70) return L(locale, "It looks stretched — chasing here is a bad idea.", "Wygląda na rozgrzane — gonienie teraz nie ma sensu.");
  if (t.rsi <= 30) return L(locale, "It looks washed out.", "Wygląda na przecenione.");
  if (t.vsSma > 0.8) return L(locale, "It's running ahead of its recent average.", "Uciekło powyżej swojej ostatniej średniej.");
  if (t.vsSma < -0.8) return L(locale, "It's sitting below its recent average.", "Siedzi poniżej swojej ostatniej średniej.");
  return L(locale, "Nothing extreme on the short tape.", "Na krótkiej taśmie nic skrajnego.");
}

function plainBook(
  pos: MarketSnapshot["book"]["positions"][number] | undefined,
  symbol: string,
  locale: Locale,
) {
  if (!pos) return L(locale, `We are flat ${symbol}.`, `Nie mamy pozycji na ${symbol}.`);
  const dir = pos.qty > 0 ? L(locale, "long", "długą") : L(locale, "short", "krótką");
  const pnl =
    pos.pnlPct >= 0
      ? L(locale, `up about ${pos.pnlPct.toFixed(1)}%`, `jest na plusie ok. ${pos.pnlPct.toFixed(1)}%`)
      : L(locale, `down about ${Math.abs(pos.pnlPct).toFixed(1)}%`, `jest na minusie ok. ${Math.abs(pos.pnlPct).toFixed(1)}%`);
  return L(
    locale,
    `We are ${dir} ${symbol} and the trade is ${pnl}.`,
    `Trzymamy ${dir} ${symbol} i ten trade ${pnl}.`,
  );
}

function pickFocus(snap: MarketSnapshot, question: string): TickerSnapshot {
  const upper = question.toUpperCase();
  const hit = snap.tickers.find((t) => upper.includes(t.symbol));
  if (hit) return hit;
  const held = snap.book.positions[0];
  if (held) {
    const t = snap.tickers.find((x) => x.symbol === held.symbol);
    if (t) return t;
  }
  return snap.tickers[0] ?? {
    symbol: "SPY",
    name: "S&P",
    price: 0,
    open: 0,
    changePct: 0,
    high: 0,
    low: 0,
    rsi: 50,
    vsSma: 0,
    livePx: null,
    liveBps: null,
  };
}

export function localAsk(
  question: string,
  snap: MarketSnapshot,
  locale: Locale = "en",
  ctx?: AskContext,
): { speaker: AgentId; text: string } {
  const loc = replyLocale(locale, question);
  const focus = pickFocus(snap, question);
  const pos = snap.book.positions.find((p) => p.symbol === focus.symbol);
  const hold = plainBook(pos, focus.symbol, loc);

  if (isWhyOpenedQuestion(question)) {
    const fill = (ctx?.recentFills ?? []).find((f) => f.symbol === focus.symbol);
    const voter =
      ctx?.lastCouncil?.agents.find((a) => a.id !== "iris" && a.symbol === focus.symbol && a.vote !== "hold") ??
      null;
    const who = (voter?.id ?? "iris") as AgentId;
    const weather = ctx?.lastCouncil?.sentiment?.summary;
    return {
      speaker: who,
      text: L(
        loc,
        [
          voter
            ? `${AGENT_NAME[who]} wanted ${voter.vote === "buy" ? "to buy" : "to sell"} ${focus.symbol}.`
            : `Iris put ${focus.symbol} on because the floor had a name.`,
          voter?.thesis ? voter.thesis : "",
          fill
            ? `We actually got filled ${fill.side === "buy" ? "long" : "short"} around ${fill.price.toFixed(2)}.`
            : `I don't see the fill ticket in front of me, but ${hold}`,
          weather ? `Damian's weather at the time: ${weather}.` : "",
          hold,
        ]
          .filter(Boolean)
          .join("\n\n"),
        [
          voter
            ? `${AGENT_NAME[who]} chciał${who === "vesper" ? "a" : ""} ${voter.vote === "buy" ? "kupić" : "sprzedać"} ${focus.symbol}.`
            : `Iris wstawiła ${focus.symbol}, bo rada miała spółkę.`,
          voter?.thesis ? voter.thesis : "",
          fill
            ? `Weszliśmy ${fill.side === "buy" ? "długo" : "krótko"} po około ${fill.price.toFixed(2)}.`
            : `Nie widzę teraz biletu z wejścia, ale ${hold}`,
          weather ? `Pogoda Damiana wtedy: ${weather}.` : "",
          hold,
        ]
          .filter(Boolean)
          .join("\n\n"),
      ),
    };
  }

  const q = question.toLowerCase();
  if (/sentyment|sentiment|sektor|dollar|dolar|vol\b|zmienn|rynek|market/.test(q)) {
    const board = sectorBoard(snap.macro, snap.tickers, loc);
    const bits = board.sectors
      .filter((s) => s.stance !== "neutral")
      .map((s) => `${s.id === "equities" ? (loc === "pl" ? "akcje" : "stocks") : s.id === "vol" ? (loc === "pl" ? "zmienność" : "vol") : s.id === "dollar" ? (loc === "pl" ? "dolar" : "dollar") : s.id === "metals" ? (loc === "pl" ? "metale" : "metals") : "crypto"}: ${s.why}`)
      .slice(0, 4);
    return {
      speaker: "damian",
      text: [board.summary, bits.join("\n"), L(loc, "I don't pick tickers. Iris sizes from this weather.", "Ja spółek nie wybieram. Iris z tej pogody liczy clip.")].filter(Boolean).join("\n\n"),
    };
  }
  if (/iris|ryzyk|risk|cash|gotów|zamkn|close|size|ile/.test(q)) {
    return {
      speaker: "iris",
      text: L(
        loc,
        [
          hold,
          "Vesper hunts trend, Ash hunts extremes — they are not a vote against each other.",
          "I clip size from Damian's weather. Kai puts the limit on last, or we wait.",
          "A normal trade is a few hours. Only a working name may stay a few days. Two add-ons a day, only on a pullback.",
        ].join("\n\n"),
        [
          hold,
          "Vesper szuka trendu, Ash skrajności — nie głosują przeciw sobie.",
          "Wielkość liczę od pogody Damiana. Kai na końcu stawia limit, albo czekamy.",
          "Zwykły trade to kilka godzin. Tylko działająca noga może zostać kilka dni. Dwie dokładki dziennie, tylko na korekcie.",
        ].join("\n\n"),
      ),
    };
  }

  const speaker: AgentId = pos ? "ash" : focus.changePct > 0.3 ? "vesper" : "kai";
  const next =
    speaker === "kai"
      ? L(
          loc,
          "I would wait for a pullback and a limit. I don't chase the print.",
          "Poczekałbym na cofnięcie i limit. Nie gonię ceny.",
        )
      : speaker === "vesper"
        ? L(loc, "If it keeps expanding, a small long is the idea. If it stalls, I'm out.", "Jeśli dalej się rozszerza, mała długa ma sens. Jak stanie — zdejmuję.")
        : L(loc, "I only probe a washout, one clip, no averaging down.", "Sprawdzam tylko przecenę, jednym clipem, bez dokładania.");
  return {
    speaker,
    text: [plainMove(focus, loc), plainHeat(focus, loc), hold, next].join("\n\n"),
  };
}
