import type { MacroTape, MarketSnapshot, TickerSnapshot } from "@/lib/types";

type Book = MarketSnapshot["book"];

const NAMES: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ether",
  GOLD: "Gold",
  SILVER: "Silver",
  SPY: "S&P 500",
  NVDA: "NVIDIA",
  AAPL: "Apple",
  TSLA: "Tesla",
  MSFT: "Microsoft",
  AMZN: "Amazon",
  META: "Meta",
};

const PX: Record<string, number> = {
  BTC: 100_000,
  ETH: 3_500,
  GOLD: 2_400,
  SILVER: 30,
  SPY: 560,
  NVDA: 120,
  AAPL: 190,
  TSLA: 250,
  MSFT: 420,
  AMZN: 180,
  META: 510,
};

function nameOf(symbol: string, over: Partial<TickerSnapshot>) {
  return over.name ?? NAMES[symbol] ?? symbol;
}

function pxOf(symbol: string, over: Partial<TickerSnapshot>) {
  return over.price ?? PX[symbol] ?? 100;
}

function finish(symbol: string, base: Omit<TickerSnapshot, "symbol" | "name">, over: Partial<TickerSnapshot>): TickerSnapshot {
  return { ...base, ...over, symbol, name: nameOf(symbol, over) };
}

/** Quiet tape — below Vesper lean and below Kai ready. */
export function quietTicker(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  const px = pxOf(symbol, over);
  return finish(
    symbol,
    {
      price: px,
      open: px,
      changePct: 0.05,
      high: px * 1.002,
      low: px * 0.998,
      rsi: 50,
      vsSma: 0.05,
      livePx: px,
      liveBps: 0,
      rvol: 0.6,
      buySetup: "none",
      sellSetup: "none",
    },
    over,
  );
}

/**
 * Full-scoring 4h FVG pullback long. Weighted engine lands ≥ 60 (small)
 * so Iris may reduce, but a ticket still prints. Default riskOnMacro required.
 */
export function longPullback(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  const px = pxOf(symbol, over);
  const limit = over.buyLimit ?? Number((px * 0.994).toFixed(4));
  return finish(
    symbol,
    {
      price: px,
      open: px / 1.015,
      changePct: 1.5,
      high: px * 1.014,
      low: px * 0.986,
      rsi: 58,
      vsSma: 1.3,
      livePx: px,
      liveBps: 0,
      rvol: 1.4,
      buySetup: "pullback",
      buyLimit: limit,
      buyRetrace: 38,
      buyFvg: { low: px * 0.99, high: px * 0.996 },
      buyTf: "4h",
      buyWick: true,
      sellSetup: "none",
    },
    over,
  );
}

/** Mirror of longPullback for a short. */
export function shortPullback(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  const px = pxOf(symbol, over);
  const limit = over.sellLimit ?? Number((px * 1.006).toFixed(4));
  return finish(
    symbol,
    {
      price: px,
      open: px / 0.985,
      changePct: -1.5,
      high: px * 1.014,
      low: px * 0.986,
      rsi: 42,
      vsSma: -1.3,
      livePx: px,
      liveBps: 0,
      rvol: 1.4,
      sellSetup: "pullback",
      sellLimit: limit,
      sellRetrace: 38,
      sellFvg: { low: px * 1.004, high: px * 1.01 },
      sellTf: "4h",
      sellWick: true,
      buySetup: "none",
    },
    over,
  );
}

/** Soft dollar + expanding crypto mcap — Damian tailwind without flipping regime. */
export function riskOnMacro(over: Partial<MacroTape> = {}): MacroTape {
  return {
    vix: 14,
    vixChg: -1.2,
    dxy: 101.4,
    dxyChg: -0.5,
    cryptoMcap: 3.4e12,
    cryptoMcapPct: 3.6,
    equityPct: 0.5,
    at: 1,
    ...over,
  };
}

/**
 * Flat weather. Same 4h pullback as 01 but Damian crypto ≈ 0 so
 * 100*0.25 + 100*0.3 = 55 → band wait, size 0, no ticket.
 */
export function flatMacro(over: Partial<MacroTape> = {}): MacroTape {
  return {
    vix: 18,
    vixChg: 0,
    dxy: 104,
    dxyChg: 0,
    cryptoMcap: 3.4e12,
    cryptoMcapPct: 0,
    equityPct: 0,
    at: 1,
    ...over,
  };
}

/**
 * Strong crypto tailwind (Damian crypto ≈ 98). Used so a thin-tape snapshot
 * would still print if kaiKind stopped treating rvol < 0.55 as blocked.
 */
export function strongCryptoMacro(over: Partial<MacroTape> = {}): MacroTape {
  return riskOnMacro({ cryptoMcapPct: 6, dxyChg: -0.5, ...over });
}

/**
 * 4h pullback whose only Kai block is thin tape (rvol 0.54 < 0.55).
 * Ash is kept below lean so disagreement does not contaminate the test.
 * Pair with strongCryptoMacro: rvol 0.55 on the same tape prints.
 */
export function thinPullback(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  return longPullback(symbol, { rvol: 0.54, changePct: 0.7, vsSma: 0.6, rsi: 50, ...over });
}

/**
 * Vesper long vs Ash fade at high score (rsi/vsSma stretch, rvol < 1.2 so
 * Ash is not crushed by againstExpansion). Weighted final is ~48 without
 * scorecard; pair with scoutTrustedScorecard so final ≥ 60 and disagreement
 * is the only failing gate.
 */
export function stretchedLong(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  return longPullback(symbol, {
    rsi: 74,
    vsSma: 1.7,
    changePct: 1.1,
    rvol: 0.88,
    buyWick: false,
    sellWick: true,
    ...over,
  });
}

/** Just under bandOf 60 on an aligned ready tape (live ≈ 59.7 wait). */
export function justBelowBand60(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  return longPullback(symbol, { changePct: 0.8, vsSma: 0.6, rvol: 0.9, ...over });
}

/** Just at/over bandOf 60 on an aligned ready tape (live ≈ 60.01 small). */
export function justAtBand60(symbol: string, over: Partial<TickerSnapshot> = {}): TickerSnapshot {
  return longPullback(symbol, { changePct: 0.8, vsSma: 0.7, rvol: 0.9, ...over });
}

type Scorecard = NonNullable<MarketSnapshot["scorecard"]>;

/** Historical multipliers: Vesper/Kai trusted, Ash discounted. closed ≥ 30 to engage. */
export function scoutTrustedScorecard(closed = 40): Scorecard {
  const row = (id: Scorecard[number]["id"], hitPct: number): Scorecard[number] => ({
    id,
    closed,
    wins: Math.round((closed * hitPct) / 100),
    hitPct,
    sizePct: 3,
    trusted: hitPct >= 50,
    last5: [],
    open: [],
  });
  return [row("vesper", 100), row("ash", 0), row("kai", 100)];
}

export function book(over: Partial<Book> = {}): Book {
  return {
    cash: 90_000,
    equity: 100_000,
    dayPnlPct: 0.2,
    positions: [],
    ...over,
  };
}

export function snap(tickers: TickerSnapshot[], bookOver: Partial<Book> = {}, extra: Partial<MarketSnapshot> = {}): MarketSnapshot {
  return {
    tickers,
    headlines: extra.headlines ?? [],
    book: book(bookOver),
    macro: extra.macro === undefined ? riskOnMacro() : extra.macro,
    scorecard: extra.scorecard,
  };
}
