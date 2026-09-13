import { ashReversionScore, vesperMomentumScore } from "@/lib/agents/math";
import type { Locale } from "@/lib/agents/core/types";
import type { MarketSnapshot, TickerSnapshot } from "@/lib/types";

function n(v: number | null | undefined, d = 2): number | null {
  if (v == null || !Number.isFinite(v)) return null;
  return Number(v.toFixed(d));
}

function tickerCore(t: TickerSnapshot) {
  return {
    symbol: t.symbol,
    price: n(t.price, 4) ?? 0,
    livePx: n(t.livePx, 4),
    changePct: n(t.changePct) ?? 0,
    rsi: n(t.rsi, 1) ?? 0,
    vsSma: n(t.vsSma) ?? 0,
    rvol: n(t.rvol),
  };
}

/** Vesper — 15m momentum + 1h/4h confirmation. No book, no news, no other agents. */
export function vesperSnapshot(snap: MarketSnapshot, lookingAt: string | null) {
  return {
    lookingAt,
    note: "15m primary. 1h/4h confirmation. Do not use 1m.",
    tickers: snap.tickers.slice(0, 12).map((t) => ({
      ...tickerCore(t),
      buySetup: t.buySetup ?? "none",
      sellSetup: t.sellSetup ?? "none",
      buyRetrace: t.buyRetrace ?? null,
      sellRetrace: t.sellRetrace ?? null,
      buyTf: t.buyTf ?? null,
      sellTf: t.sellTf ?? null,
      buyWick: Boolean(t.buyWick),
      sellWick: Boolean(t.sellWick),
      math: {
        long: Number(vesperMomentumScore(t, "buy").toFixed(1)),
        short: Number(vesperMomentumScore(t, "sell").toFixed(1)),
      },
    })),
  };
}

/** Ash — displacement from mean. Independent of Vesper. */
export function ashSnapshot(snap: MarketSnapshot, lookingAt: string | null) {
  return {
    lookingAt,
    note: "Mean reversion. Do not fade clean expansion with rising RVOL.",
    tickers: snap.tickers.slice(0, 12).map((t) => ({
      ...tickerCore(t),
      buyWick: Boolean(t.buyWick),
      sellWick: Boolean(t.sellWick),
      buySetup: t.buySetup ?? "none",
      sellSetup: t.sellSetup ?? "none",
      math: {
        fadeLong: Number(ashReversionScore(t, "buy").toFixed(1)),
        fadeShort: Number(ashReversionScore(t, "sell").toFixed(1)),
      },
    })),
  };
}

/** Kai — entry quality only. 15m/1h/4h setups. No RSI-as-direction. */
export function kaiSnapshot(snap: MarketSnapshot, lookingAt: string | null) {
  return {
    lookingAt,
    note: "Entry quality. Never use 1m. Do not flip BUY to SELL because entry is poor — return WAIT.",
    tickers: snap.tickers.slice(0, 12).map((t) => ({
      symbol: t.symbol,
      price: n(t.livePx ?? t.price, 4) ?? 0,
      rvol: n(t.rvol),
      session: t.session ?? null,
      buy: {
        setup: t.buySetup ?? "none",
        limit: n(t.buyLimit, 4),
        retrace: t.buyRetrace ?? null,
        fvg: t.buyFvg ? { low: n(t.buyFvg.low, 4), high: n(t.buyFvg.high, 4) } : null,
        wick: Boolean(t.buyWick),
        tf: t.buyTf ?? null,
      },
      sell: {
        setup: t.sellSetup ?? "none",
        limit: n(t.sellLimit, 4),
        retrace: t.sellRetrace ?? null,
        fvg: t.sellFvg ? { low: n(t.sellFvg.low, 4), high: n(t.sellFvg.high, 4) } : null,
        wick: Boolean(t.sellWick),
        tf: t.sellTf ?? null,
      },
    })),
  };
}

/** Damian — macro and news only. No RSI, no ticker vote. */
export function damianSnapshot(snap: MarketSnapshot) {
  const spy = snap.tickers.find((t) => t.symbol === "SPY");
  const btc = snap.tickers.find((t) => t.symbol === "BTC");
  const eth = snap.tickers.find((t) => t.symbol === "ETH");
  const gold = snap.tickers.find((t) => t.symbol === "GOLD");
  return {
    note: "You do NOT vote BUY/SELL on a ticker. Classify asset-class weather.",
    macro: snap.macro
      ? {
          vix: snap.macro.vix,
          vixChg: snap.macro.vixChg,
          dxy: snap.macro.dxy,
          dxyChg: snap.macro.dxyChg,
          cryptoMcap: snap.macro.cryptoMcap,
          cryptoMcapPct: snap.macro.cryptoMcapPct,
          equityPct: snap.macro.equityPct,
        }
      : null,
    prints: {
      spy: spy ? n(spy.changePct) : null,
      btc: btc ? n(btc.changePct) : null,
      eth: eth ? n(eth.changePct) : null,
      gold: gold ? n(gold.changePct) : null,
    },
    news: (snap.headlines ?? []).slice(0, 6).map((h) => ({
      text: h.text.slice(0, 180),
      symbol: h.symbol ?? null,
    })),
  };
}

/** Iris — structured agent results + book. Cannot change other agents' facts. */
export function irisSnapshot(input: {
  locale: Locale;
  book: MarketSnapshot["book"];
  scorecard: MarketSnapshot["scorecard"];
  decision: unknown;
  contributors: unknown;
  agreement: unknown;
  checks: unknown;
}) {
  return {
    note: "You do NOT invent direction. APPROVE / REDUCE / WAIT / REJECT. Code owns size and hard limits.",
    book: {
      cash: Math.round(input.book.cash),
      equity: Math.round(input.book.equity),
      dayPnlPct: n(input.book.dayPnlPct) ?? 0,
      positions: input.book.positions.slice(0, 16).map((p) => ({
        symbol: p.symbol,
        qty: n(p.qty, 4) ?? 0,
        pnlPct: n(p.pnlPct) ?? 0,
        teamLock: Boolean(p.teamLock),
      })),
      working: input.book.working
        ? {
            symbol: input.book.working.symbol,
            side: input.book.working.side,
            limitPx: input.book.working.limitPx ?? null,
          }
        : null,
    },
    scorecard: (input.scorecard ?? []).slice(0, 8),
    decision: input.decision,
    contributors: input.contributors,
    agreement: input.agreement,
    hardChecks: input.checks,
  };
}

export function tooBig(payload: unknown, max = 18_000) {
  try {
    return JSON.stringify(payload).length > max;
  } catch {
    return true;
  }
}
