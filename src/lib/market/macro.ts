import { createServerFn } from "@tanstack/react-start";
import type { MacroTape, SectorCall, SentimentReport, Stance, TickerSnapshot } from "@/lib/types";

export type { MacroTape };

export function sentimentBias(sectors: SectorCall[] | undefined): number {
  if (!sectors?.length) return 0;
  let score = 0;
  for (const row of sectors) {
    const sign = row.stance === "bullish" ? 1 : row.stance === "bearish" ? -1 : 0;
    score += row.id === "dollar" ? -sign : sign;
  }
  return score / 5;
}

export type MacroPulse = {
  vol: "calm" | "elevated" | "hot" | "unknown";
  dollar: "soft" | "firm" | "flat" | "unknown";
  crypto: "in" | "out" | "flat" | "unknown";
  equity: "up" | "down" | "flat" | "unknown";
};

export type LiveMacroResult =
  | { ok: true; macro: MacroTape }
  | { ok: false; error: string };

const CACHE_MS = 60_000;
let cache: MacroTape | null = null;
let inflight: Promise<LiveMacroResult> | null = null;

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; previousClose?: number; chartPreviousClose?: number };
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

function lastNum(xs: Array<number | null | undefined> | undefined) {
  if (!xs) return undefined;
  for (let i = xs.length - 1; i >= 0; i--) {
    const v = xs[i];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return undefined;
}

async function yahooLast(yahoo: string): Promise<{ px: number; chg: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as YahooChart;
  const result = body.chart?.result?.[0];
  if (!result) return null;
  const px = result.meta?.regularMarketPrice ?? lastNum(result.indicators?.quote?.[0]?.close);
  const prev = result.meta?.previousClose ?? result.meta?.chartPreviousClose;
  if (!px || !Number.isFinite(px)) return null;
  const base = prev && Number.isFinite(prev) && prev !== 0 ? prev : px;
  return { px, chg: ((px - base) / base) * 100 };
}

async function firstYahoo(symbols: string[]): Promise<{ px: number; chg: number } | null> {
  const settled = await Promise.allSettled(symbols.map(yahooLast));
  for (const row of settled) {
    if (row.status === "fulfilled" && row.value) return row.value;
  }
  return null;
}

async function cryptoGlobal(): Promise<{ mcap: number; pct: number } | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: {
        total_market_cap?: { usd?: number };
        market_cap_change_percentage_24h_usd?: number;
      };
    };
    const mcap = body.data?.total_market_cap?.usd;
    const pct = body.data?.market_cap_change_percentage_24h_usd;
    if (typeof mcap !== "number" || !Number.isFinite(mcap)) return null;
    return { mcap, pct: typeof pct === "number" && Number.isFinite(pct) ? pct : 0 };
  } catch {
    return null;
  }
}

export function emptyMacro(at = Date.now()): MacroTape {
  return {
    vix: null,
    vixChg: null,
    dxy: null,
    dxyChg: null,
    cryptoMcap: null,
    cryptoMcapPct: null,
    equityPct: null,
    at,
  };
}

export function classifyMacro(m: MacroTape | null | undefined): MacroPulse {
  if (!m) {
    return { vol: "unknown", dollar: "unknown", crypto: "unknown", equity: "unknown" };
  }
  const vol: MacroPulse["vol"] =
    m.vix == null
      ? "unknown"
      : m.vix >= 22 || (m.vixChg != null && m.vixChg >= 8)
        ? "hot"
        : m.vix <= 14 && (m.vixChg == null || m.vixChg < 4)
          ? "calm"
          : "elevated";
  const dollar: MacroPulse["dollar"] =
    m.dxyChg == null ? "unknown" : m.dxyChg >= 0.35 ? "firm" : m.dxyChg <= -0.35 ? "soft" : "flat";
  const crypto: MacroPulse["crypto"] =
    m.cryptoMcapPct == null
      ? "unknown"
      : m.cryptoMcapPct >= 1.5
        ? "in"
        : m.cryptoMcapPct <= -1.5
          ? "out"
          : "flat";
  const equity: MacroPulse["equity"] =
    m.equityPct == null ? "unknown" : m.equityPct >= 0.35 ? "up" : m.equityPct <= -0.35 ? "down" : "flat";
  return { vol, dollar, crypto, equity };
}

export function withEquityPct(m: MacroTape | null | undefined, spyChg: number | null): MacroTape | null {
  if (!m && spyChg == null) return null;
  return {
    ...(m ?? emptyMacro()),
    equityPct: spyChg,
  };
}

function n(v: number, d = 1) {
  return v.toFixed(d);
}

/** One-line pulse Damian can speak. Skips unknown fields. No ticker dump. */
export function macroHint(m: MacroTape | null | undefined, locale: "en" | "pl"): string {
  const p = classifyMacro(m);
  const bits: string[] = [];
  const pl = locale === "pl";
  if (p.vol === "hot") bits.push(pl ? "zmienność skoczyła" : "vol jumped");
  else if (p.vol === "calm") bits.push(pl ? "zmienność spokojna" : "vol is calm");
  else if (p.vol === "elevated") bits.push(pl ? "zmienność podwyższona" : "vol is elevated");
  if (p.dollar === "firm") {
    bits.push(
      pl
        ? `dolar mocniejszy${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — presja na BTC i metale`
        : `dollar firmer${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — headwind for BTC and metals`,
    );
  } else if (p.dollar === "soft") {
    bits.push(
      pl
        ? `dolar słabszy${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — wiatr w plecy dla BTC i metali`
        : `dollar softer${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — tailwind for BTC and metals`,
    );
  }
  if (p.crypto === "in" && m?.cryptoMcapPct != null) {
    bits.push(pl ? `kapitalizacja krypto +${n(m.cryptoMcapPct)}% na dobę` : `crypto market cap +${n(m.cryptoMcapPct)}% on the day`);
  } else if (p.crypto === "out" && m?.cryptoMcapPct != null) {
    bits.push(pl ? `kapitalizacja krypto ${n(m.cryptoMcapPct)}% na dobę` : `crypto market cap ${n(m.cryptoMcapPct)}% on the day`);
  }
  if (p.equity === "up" && m?.equityPct != null) {
    bits.push(pl ? `szeroki rynek akcji +${n(m.equityPct)}%` : `broad stocks +${n(m.equityPct)}%`);
  } else if (p.equity === "down" && m?.equityPct != null) {
    bits.push(pl ? `szeroki rynek akcji ${n(m.equityPct)}%` : `broad stocks ${n(m.equityPct)}%`);
  }
  return bits.slice(0, 2).join(". ");
}

function asStance(up: boolean, down: boolean): Stance {
  if (down) return "bearish";
  if (up) return "bullish";
  return "neutral";
}

/** Damian's board — sector bias, not a ticker vote. */
export function sectorBoard(
  m: MacroTape | null | undefined,
  tickers: TickerSnapshot[],
  locale: "en" | "pl",
): SentimentReport {
  const p = classifyMacro(m);
  const pl = locale === "pl";
  const spy = tickers.find((t) => t.symbol === "SPY");
  const btc = tickers.find((t) => t.symbol === "BTC");
  const gold = tickers.find((t) => t.symbol === "GOLD");
  const eqChg = m?.equityPct ?? spy?.changePct ?? null;
  const btcChg = btc?.changePct ?? null;
  const goldChg = gold?.changePct ?? null;

  const equities = asStance(
    p.equity === "up" || (eqChg != null && eqChg >= 0.35),
    p.equity === "down" || p.vol === "hot" || (eqChg != null && eqChg <= -0.35),
  );
  const crypto = asStance(
    p.crypto === "in" || p.dollar === "soft" || (btcChg != null && btcChg >= 0.8),
    p.crypto === "out" || p.dollar === "firm" || (btcChg != null && btcChg <= -0.8),
  );
  const metals = asStance(
    p.dollar === "soft" || (goldChg != null && goldChg >= 0.4),
    p.dollar === "firm" || (goldChg != null && goldChg <= -0.4),
  );
  const dollar = asStance(p.dollar === "firm", p.dollar === "soft");
  const vol = asStance(p.vol === "calm", p.vol === "hot");

  const why = (id: SectorCall["id"], stance: Stance): string => {
    if (id === "equities") {
      if (stance === "bullish") return pl ? "szeroki rynek w górę, zmienność nie przeszkadza" : "broad stocks up, vol not in the way";
      if (stance === "bearish") return pl ? "akcje słabe albo skok zmienności" : "stocks weak or vol jumped";
      return pl ? "akcje bez kierunku" : "stocks have no one-way read";
    }
    if (id === "crypto") {
      if (stance === "bullish") return pl ? "kapitalizacja krypto / BTC w górę, dolar nie dusi" : "crypto cap / BTC bid, dollar not squeezing";
      if (stance === "bearish") return pl ? "krypto pod presją dolara albo odpływu" : "crypto under a firm dollar or outflows";
      return pl ? "krypto w dwie strony" : "crypto two-way";
    }
    if (id === "metals") {
      if (stance === "bullish") return pl ? "słabszy dolar sprzyja złotu i srebru" : "softer dollar helps gold and silver";
      if (stance === "bearish") return pl ? "mocniejszy dolar waży na metalach" : "firmer dollar weighs on metals";
      return pl ? "metale bez impulsu" : "metals have no impulse";
    }
    if (id === "dollar") {
      if (stance === "bullish") return pl ? "dolar się umacnia" : "the dollar is firming";
      if (stance === "bearish") return pl ? "dolar słabnie" : "the dollar is softening";
      return pl ? "dolar płaski" : "dollar is flat";
    }
    if (stance === "bullish") return pl ? "zmienność spokojna — ryzyko można brać" : "vol is calm — risk is allowed";
    if (stance === "bearish") return pl ? "zmienność gorąca — ostrożnie z akcjami" : "vol is hot — be careful with stocks";
    return pl ? "zmienność zwyczajna" : "vol is ordinary";
  };

  const sectors: SectorCall[] = [
    { id: "equities", stance: equities, why: why("equities", equities) },
    { id: "crypto", stance: crypto, why: why("crypto", crypto) },
    { id: "metals", stance: metals, why: why("metals", metals) },
    { id: "dollar", stance: dollar, why: why("dollar", dollar) },
    { id: "vol", stance: vol, why: why("vol", vol) },
  ];
  const leaned = sectors.filter((s) => s.stance !== "neutral");
  const summary = leaned.length
    ? leaned
        .slice(0, 3)
        .map((s) => {
          const name =
            s.id === "equities"
              ? pl ? "akcje" : "stocks"
              : s.id === "crypto"
                ? "crypto"
                : s.id === "metals"
                  ? pl ? "metale" : "metals"
                  : s.id === "dollar"
                    ? pl ? "dolar" : "dollar"
                    : pl ? "zmienność" : "vol";
          const dir = s.stance === "bullish" ? (pl ? "byczo" : "bullish") : pl ? "niedźwiedzio" : "bearish";
          return `${name} ${dir}`;
        })
        .join(" · ")
    : pl
      ? "Sentyment mieszany — bez jednostronnego rynku."
      : "Mixed tape — no one-way market.";
  return { summary, sectors };
}

async function pull(): Promise<LiveMacroResult> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return { ok: true, macro: cache };
  const [vix, dxy, cg] = await Promise.all([
    firstYahoo(["^VIX"]),
    firstYahoo(["DX-Y.NYB", "DX=F", "UUP"]),
    cryptoGlobal(),
  ]);
  const macro: MacroTape = {
    vix: vix?.px ?? null,
    vixChg: vix?.chg ?? null,
    dxy: dxy?.px ?? null,
    dxyChg: dxy?.chg ?? null,
    cryptoMcap: cg?.mcap ?? null,
    cryptoMcapPct: cg?.pct ?? null,
    equityPct: cache?.equityPct ?? null,
    at: now,
  };
  const any =
    macro.vix != null || macro.dxy != null || macro.cryptoMcapPct != null;
  if (!any) {
    if (cache) return { ok: true, macro: cache };
    return { ok: false, error: "macro quiet" };
  }
  cache = macro;
  return { ok: true, macro };
}

export async function loadLiveMacro(): Promise<LiveMacroResult> {
  if (inflight) return inflight;
  inflight = pull().finally(() => {
    inflight = null;
  });
  return inflight;
}

export const fetchLiveMacro = createServerFn({ method: "POST" }).handler(async (): Promise<LiveMacroResult> => {
  return loadLiveMacro();
});
