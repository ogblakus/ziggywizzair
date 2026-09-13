import { n as UNIVERSE, r as deskSymbol } from "./universe-BHNCzOwL.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
import { n as newsKey } from "./news-key-By_bmI6f.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/news-k_cZ5MVF.js
var CACHE_MS = 9e4;
var QUERIES = [
	"NVDA",
	"TSLA",
	"SPY",
	"GOLD",
	"SILVER",
	"BTC"
];
var cache = null;
var inflight = null;
function shockFromTitle(title) {
	const t = title.toLowerCase();
	if (/crash|plunge|halt|ban|hack|default|war/.test(t)) return -.8;
	if (/surge|record|beat|rally|breakout|all-time/.test(t)) return .7;
	if (/cut|miss|downgrade|probe|layoff/.test(t)) return -.45;
	if (/upgrade|deal|approval|etf/.test(t)) return .4;
	return .15;
}
async function fetchQuery(q) {
	const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&newsCount=5&quotesCount=0`;
	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			"User-Agent": "Mozilla/5.0"
		},
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error(`${q} ${res.status}`);
	const body = await res.json();
	const rows = [];
	for (const n of body.news ?? []) {
		const text = typeof n.title === "string" ? n.title.trim() : "";
		if (!text) continue;
		const related = (n.relatedTickers ?? []).map(deskSymbol).find(Boolean);
		const fromQuery = deskSymbol(q) ?? UNIVERSE.find((u) => u.name.toUpperCase() === q.toUpperCase())?.symbol;
		const ts = typeof n.providerPublishTime === "number" ? n.providerPublishTime * 1e3 : Date.now();
		const key = newsKey(text);
		rows.push({
			id: key || n.uuid || `${q}-${text.slice(0, 40)}`,
			ts,
			text: n.publisher ? `${text} — ${n.publisher}` : text,
			symbol: related ?? fromQuery,
			shock: shockFromTitle(text)
		});
	}
	return rows;
}
async function pull() {
	const now = Date.now();
	if (cache && now - cache.at < CACHE_MS) return {
		ok: true,
		headlines: cache.headlines,
		at: cache.at
	};
	const settled = await Promise.allSettled(QUERIES.map(fetchQuery));
	const seen = /* @__PURE__ */ new Set();
	const headlines = [];
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
	if (!sliced.length) return {
		ok: false,
		error: "wire quiet"
	};
	cache = {
		at: now,
		headlines: sliced
	};
	return {
		ok: true,
		headlines: sliced,
		at: now
	};
}
async function loadLiveNews() {
	if (inflight) return inflight;
	inflight = pull().finally(() => {
		inflight = null;
	});
	return inflight;
}
var fetchLiveNews_createServerFn_handler = createServerRpc({
	id: "1b66c75a680b0a51980dfceffcd80f87128acb04fd3e8999702cec1a1744748e",
	name: "fetchLiveNews",
	filename: "src/lib/market/news.ts"
}, (opts) => fetchLiveNews.__executeServer(opts));
var fetchLiveNews = createServerFn({ method: "POST" }).handler(fetchLiveNews_createServerFn_handler, async () => {
	return loadLiveNews();
});
//#endregion
export { fetchLiveNews_createServerFn_handler };
