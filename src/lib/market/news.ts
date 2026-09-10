import { createServerFn } from "@tanstack/react-start";
import { deskSymbol, UNIVERSE } from "@/lib/market/universe";
import { newsKey } from "@/lib/market/news-key";
import type { Headline } from "@/lib/types";

export type LiveNewsResult =
  | { ok: true; headlines: Headline[]; at: number }
  | { ok: false; error: string };

type YahooNewsItem = {
  uuid?: string;
  title?: string;
  publisher?: string;
  providerPublishTime?: number;
  relatedTickers?: string[];
};

type YahooSearch = { news?: YahooNewsItem[] };

const CACHE_MS = 90_000;
const QUERIES = ["NVDA", "TSLA", "SPY", "GOLD", "SILVER", "BTC"];

let cache: { at: number; headlines: Headline[] } | null = null;
let inflight: Promise<LiveNewsResult> | null = null;

function shockFromTitle(title: string) {
  const t = title.toLowerCase();
  if (/crash|plunge|halt|ban|hack|default|war/.test(t)) return -0.8;
  if (/surge|record|beat|rally|breakout|all-time/.test(t)) return 0.7;
  if (/cut|miss|downgrade|probe|layoff/.test(t)) return -0.45;
  if (/upgrade|deal|approval|etf/.test(t)) return 0.4;
  return 0.15;
}

async function fetchQuery(q: string): Promise<Headline[]> {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=5&quotesCount=0`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`${q} ${res.status}`);
  const body = (await res.json()) as YahooSearch;
  const rows: Headline[] = [];
  for (const n of body.news ?? []) {
    const text = typeof n.title === "string" ? n.title.trim() : "";
    if (!text) continue;
    const related = (n.relatedTickers ?? []).map(deskSymbol).find(Boolean);
    const fromQuery = deskSymbol(q) ?? UNIVERSE.find((u) => u.name.toUpperCase() === q.toUpperCase())?.symbol;
    const ts = typeof n.providerPublishTime === "number" ? n.providerPublishTime * 1000 : Date.now();
    const key = newsKey(text);
    rows.push({
      id: key || n.uuid || `${q}-${text.slice(0, 40)}`,
      ts,
      text: n.publisher ? `${text} — ${n.publisher}` : text,
      symbol: related ?? fromQuery,
      shock: shockFromTitle(text),
    });
  }
  return rows;
}

async function pull(): Promise<LiveNewsResult> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return { ok: true, headlines: cache.headlines, at: cache.at };
  const settled = await Promise.allSettled(QUERIES.map(fetchQuery));
  const seen = new Set<string>();
  const headlines: Headline[] = [];
  for (const row of settled) {
    if (row.status !== "fulfilled") continue;
    for (const h of row.value) {
      const k = newsKey(h.text) || h.id;
      if (seen.has(h.id) || seen.has(k) || seen.has(h.text)) continue;
      seen.add(h.id);
      seen.add(k);
      seen.add(h.text);
      headlines.push(h);
    }
  }
  headlines.sort((a, b) => b.ts - a.ts);
  const sliced = headlines.slice(0, 16);
  if (!sliced.length) return { ok: false, error: "wire quiet" };
  cache = { at: now, headlines: sliced };
  return { ok: true, headlines: sliced, at: now };
}

export async function loadLiveNews(): Promise<LiveNewsResult> {
  if (inflight) return inflight;
  inflight = pull().finally(() => {
    inflight = null;
  });
  return inflight;
}

export const fetchLiveNews = createServerFn({ method: "POST" }).handler(async (): Promise<LiveNewsResult> => {
  return loadLiveNews();
});
