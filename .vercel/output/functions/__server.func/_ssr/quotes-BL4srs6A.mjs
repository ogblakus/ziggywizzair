import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as UNIVERSE } from "./universe-8y-43p2g.mjs";
import { r as loadDeskMids } from "./hyperliquid-eaqPsVI7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes-BL4srs6A.js
var CACHE_MS = 5e3;
var cache = null;
var inflight = null;
function lastNum(xs) {
	if (!xs) return void 0;
	for (let i = xs.length - 1; i >= 0; i--) {
		const v = xs[i];
		if (typeof v === "number" && Number.isFinite(v)) return v;
	}
}
function stampLive(quote, mids) {
	const hit = mids[quote.symbol];
	return {
		...quote,
		livePx: hit?.mid ?? null,
		liveCoin: hit?.coin ?? null
	};
}
async function fetchYahoo(symbol, yahoo) {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1m&range=1d`;
	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			"User-Agent": "Mozilla/5.0"
		},
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error(`${symbol} ${res.status}`);
	const body = await res.json();
	const result = body.chart?.result?.[0];
	if (!result) throw new Error(body.chart?.error?.description ?? `${symbol} empty`);
	const quote = result.indicators?.quote?.[0];
	const closes = quote?.close ?? [];
	const highs = quote?.high ?? [];
	const lows = quote?.low ?? [];
	const stamps = result.timestamp ?? [];
	const series = [];
	for (let i = 0; i < stamps.length; i++) {
		const px = closes[i];
		const t = stamps[i];
		if (typeof px === "number" && Number.isFinite(px) && typeof t === "number") series.push({
			t: t * 1e3,
			px
		});
	}
	const meta = result.meta ?? {};
	const price = meta.regularMarketPrice ?? lastNum(closes);
	const prev = meta.previousClose ?? meta.chartPreviousClose ?? series[0]?.px;
	if (!price || !prev) throw new Error(`${symbol} no last`);
	const high = meta.regularMarketDayHigh ?? lastNum(highs) ?? price;
	const low = meta.regularMarketDayLow ?? lastNum(lows) ?? price;
	return {
		symbol,
		price,
		prevClose: prev,
		open: series[0]?.px ?? prev,
		high,
		low,
		series: series.length ? series.slice(-180) : [{
			t: Date.now(),
			px: price
		}],
		livePx: null,
		liveCoin: null
	};
}
async function fetchCoinGeckoCrypto() {
	const out = /* @__PURE__ */ new Map();
	try {
		const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true", {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return out;
		const body = await res.json();
		if (body.bitcoin?.usd) out.set("BTC", {
			price: body.bitcoin.usd,
			changePct: body.bitcoin.usd_24h_change ?? 0
		});
		if (body.ethereum?.usd) out.set("ETH", {
			price: body.ethereum.usd,
			changePct: body.ethereum.usd_24h_change ?? 0
		});
	} catch {}
	return out;
}
async function pullQuotes() {
	const now = Date.now();
	try {
		const [settled, mids] = await Promise.all([Promise.allSettled(UNIVERSE.map((u) => fetchYahoo(u.symbol, u.yahoo))), loadDeskMids()]);
		const quotes = [];
		const missing = [];
		for (let i = 0; i < UNIVERSE.length; i++) {
			const row = settled[i];
			if (row.status === "fulfilled") quotes.push(stampLive(row.value, mids));
			else missing.push(UNIVERSE[i].symbol);
		}
		if (missing.includes("BTC") || missing.includes("ETH")) {
			const cg = await fetchCoinGeckoCrypto();
			for (const sym of ["BTC", "ETH"]) {
				if (!missing.includes(sym)) continue;
				const row = cg.get(sym);
				if (!row) continue;
				const prev = row.price / (1 + row.changePct / 100);
				quotes.push(stampLive({
					symbol: sym,
					price: row.price,
					prevClose: prev,
					open: prev,
					high: Math.max(row.price, prev),
					low: Math.min(row.price, prev),
					series: [{
						t: now,
						px: row.price
					}],
					livePx: null,
					liveCoin: null
				}, mids));
			}
		}
		if (!quotes.length) return {
			ok: false,
			error: "Tape is dark"
		};
		quotes.sort((a, b) => UNIVERSE.findIndex((u) => u.symbol === a.symbol) - UNIVERSE.findIndex((u) => u.symbol === b.symbol));
		cache = {
			at: now,
			quotes
		};
		return {
			ok: true,
			quotes,
			at: now
		};
	} catch (err) {
		const message = err instanceof Error ? err.message : "Tape is dark";
		if (cache) return {
			ok: true,
			quotes: cache.quotes,
			at: cache.at
		};
		return {
			ok: false,
			error: message
		};
	}
}
async function loadLiveMarket() {
	if (cache && Date.now() - cache.at < CACHE_MS) return {
		ok: true,
		quotes: cache.quotes,
		at: cache.at
	};
	if (inflight) return inflight;
	inflight = pullQuotes().finally(() => {
		inflight = null;
	});
	return inflight;
}
var fetchLiveMarket_createServerFn_handler = createServerRpc({
	id: "238f4028a28e239225c3d6a7d7a63ab0b7feb27ffd420abcf6ca03b53e9d039f",
	name: "fetchLiveMarket",
	filename: "src/lib/market/quotes.ts"
}, (opts) => fetchLiveMarket.__executeServer(opts));
var fetchLiveMarket = createServerFn({ method: "POST" }).handler(fetchLiveMarket_createServerFn_handler, async () => loadLiveMarket());
loadLiveMarket();
//#endregion
export { fetchLiveMarket_createServerFn_handler };
