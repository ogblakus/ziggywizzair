import { n as UNIVERSE } from "./universe-BHNCzOwL.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { a as loadHlHtf, i as loadHlChart5, n as loadDeskMids, r as loadHlCandles } from "./hyperliquid-CyQ1Swyx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/quotes-BfNKKZaD.js
var CACHE_MS = 8e3;
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
	const volumes = quote?.volume ?? [];
	const opens = quote?.open ?? [];
	const series = [];
	for (let i = 0; i < stamps.length; i++) {
		const px = closes[i];
		const t = stamps[i];
		if (typeof px === "number" && Number.isFinite(px) && typeof t === "number") {
			const v = volumes[i];
			const o = opens[i];
			const h = highs[i];
			const l = lows[i];
			const row = {
				t: t * 1e3,
				px
			};
			if (typeof v === "number" && Number.isFinite(v) && v > 0) row.v = v;
			if (typeof o === "number" && Number.isFinite(o) && o > 0) row.o = o;
			if (typeof h === "number" && Number.isFinite(h) && h > 0) row.h = h;
			if (typeof l === "number" && Number.isFinite(l) && l > 0) row.l = l;
			series.push(row);
		}
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
		liveCoin: null,
		spotPx: price,
		tape: "yahoo"
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
		const [mids, hlCandles, chart5, htf] = await Promise.all([
			loadDeskMids(),
			loadHlCandles(3),
			loadHlChart5(),
			loadHlHtf()
		]);
		const quotes = [];
		const needYahoo = [];
		for (const u of UNIVERSE) {
			const series = hlCandles[u.symbol];
			const mid = mids[u.symbol]?.mid;
			const last = mid ?? series?.at(-1)?.px;
			if (last && series && series.length >= 12) {
				const pxs = series.map((b) => b.px);
				quotes.push({
					symbol: u.symbol,
					price: last,
					prevClose: series[0]?.px ?? last,
					open: series[0]?.px ?? last,
					high: Math.max(...pxs),
					low: Math.min(...pxs),
					series,
					livePx: mid ?? last,
					liveCoin: mids[u.symbol]?.coin ?? null,
					spotPx: null,
					tape: "hl"
				});
			} else needYahoo.push(u);
		}
		if (needYahoo.length) {
			const settled = await Promise.allSettled(needYahoo.map((u) => fetchYahoo(u.symbol, u.yahoo)));
			const missing = [];
			for (let i = 0; i < needYahoo.length; i++) {
				const row = settled[i];
				const symbol = needYahoo[i].symbol;
				if (row.status === "fulfilled") {
					let q = stampLive(row.value, mids);
					const hlSeries = hlCandles[symbol];
					if (hlSeries && hlSeries.length >= 12) {
						const pxs = hlSeries.map((b) => b.px);
						q = {
							...q,
							series: hlSeries,
							high: Math.max(...pxs),
							low: Math.min(...pxs),
							tape: "hl"
						};
					}
					quotes.push(q);
				} else missing.push(symbol);
			}
			if (missing.includes("BTC") || missing.includes("ETH")) {
				const cg = await fetchCoinGeckoCrypto();
				for (const sym of ["BTC", "ETH"]) {
					if (!missing.includes(sym)) continue;
					const row = cg.get(sym);
					if (!row) continue;
					const hlSeries = hlCandles[sym];
					const prev = row.price / (1 + row.changePct / 100);
					const series = hlSeries && hlSeries.length >= 12 ? hlSeries : [{
						t: now,
						px: row.price
					}];
					const pxs = series.map((b) => b.px);
					quotes.push(stampLive({
						symbol: sym,
						price: row.price,
						prevClose: prev,
						open: prev,
						high: Math.max(...pxs, row.price, prev),
						low: Math.min(...pxs, row.price, prev),
						series,
						livePx: null,
						liveCoin: null,
						spotPx: row.price,
						tape: hlSeries && hlSeries.length >= 12 ? "hl" : "yahoo"
					}, mids));
				}
			}
			const have = new Set(quotes.map((q) => q.symbol));
			for (const u of UNIVERSE) {
				if (have.has(u.symbol)) continue;
				const series = hlCandles[u.symbol];
				const mid = mids[u.symbol]?.mid;
				const last = mid ?? series?.at(-1)?.px;
				if (!last) continue;
				const pxs = series?.map((b) => b.px) ?? [last];
				quotes.push({
					symbol: u.symbol,
					price: last,
					prevClose: series?.[0]?.px ?? last,
					open: series?.[0]?.px ?? last,
					high: Math.max(...pxs),
					low: Math.min(...pxs),
					series: series ?? [{
						t: now,
						px: last
					}],
					livePx: mid ?? null,
					liveCoin: mids[u.symbol]?.coin ?? null,
					spotPx: null,
					tape: series && series.length >= 12 ? "hl" : "yahoo"
				});
			}
		}
		if (!quotes.length) return {
			ok: false,
			error: "Tape is dark"
		};
		for (const q of quotes) {
			q.htf = htf[q.symbol];
			q.chart5 = chart5[q.symbol];
		}
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
var fetchLiveMarket = createServerFn({ method: "POST" }).handler(createSsrRpc("238f4028a28e239225c3d6a7d7a63ab0b7feb27ffd420abcf6ca03b53e9d039f"));
var fetchLiveMids = createServerFn({ method: "POST" }).handler(createSsrRpc("a1d9379c2a0fe824ff0ca88ea323ce4a39e643e1baeadbed73e0fc272fc2162d"));
var fetchSymbolChart = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("3f36642fc10b3e489d77fdfe508cef0f7e033b5289ef17cd95f395f2a7ec870c"));
loadLiveMarket();
//#endregion
export { loadLiveMarket as i, fetchLiveMids as n, fetchSymbolChart as r, fetchLiveMarket as t };
