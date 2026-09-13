import { n as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/macro-DuI9oeuv.js
var CACHE_MS = 6e4;
var cache = null;
var inflight = null;
function lastNum(xs) {
	if (!xs) return void 0;
	for (let i = xs.length - 1; i >= 0; i--) {
		const v = xs[i];
		if (typeof v === "number" && Number.isFinite(v)) return v;
	}
}
async function yahooLast(yahoo) {
	const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`;
	const res = await fetch(url, {
		headers: {
			Accept: "application/json",
			"User-Agent": "Mozilla/5.0"
		},
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) return null;
	const result = (await res.json()).chart?.result?.[0];
	if (!result) return null;
	const px = result.meta?.regularMarketPrice ?? lastNum(result.indicators?.quote?.[0]?.close);
	const prev = result.meta?.previousClose ?? result.meta?.chartPreviousClose;
	if (!px || !Number.isFinite(px)) return null;
	const base = prev && Number.isFinite(prev) && prev !== 0 ? prev : px;
	return {
		px,
		chg: (px - base) / base * 100
	};
}
async function firstYahoo(symbols) {
	const settled = await Promise.allSettled(symbols.map(yahooLast));
	for (const row of settled) if (row.status === "fulfilled" && row.value) return row.value;
	return null;
}
async function cryptoGlobal() {
	try {
		const res = await fetch("https://api.coingecko.com/api/v3/global", {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		if (!res.ok) return null;
		const body = await res.json();
		const mcap = body.data?.total_market_cap?.usd;
		const pct = body.data?.market_cap_change_percentage_24h_usd;
		if (typeof mcap !== "number" || !Number.isFinite(mcap)) return null;
		return {
			mcap,
			pct: typeof pct === "number" && Number.isFinite(pct) ? pct : 0
		};
	} catch {
		return null;
	}
}
/** Damian's board — sector bias, not a ticker vote. */
async function pull() {
	const now = Date.now();
	if (cache && now - cache.at < CACHE_MS) return {
		ok: true,
		macro: cache
	};
	const [vix, dxy, cg] = await Promise.all([
		firstYahoo(["^VIX"]),
		firstYahoo([
			"DX-Y.NYB",
			"DX=F",
			"UUP"
		]),
		cryptoGlobal()
	]);
	const macro = {
		vix: vix?.px ?? null,
		vixChg: vix?.chg ?? null,
		dxy: dxy?.px ?? null,
		dxyChg: dxy?.chg ?? null,
		cryptoMcap: cg?.mcap ?? null,
		cryptoMcapPct: cg?.pct ?? null,
		equityPct: cache?.equityPct ?? null,
		at: now
	};
	if (!(macro.vix != null || macro.dxy != null || macro.cryptoMcapPct != null)) {
		if (cache) return {
			ok: true,
			macro: cache
		};
		return {
			ok: false,
			error: "macro quiet"
		};
	}
	cache = macro;
	return {
		ok: true,
		macro
	};
}
async function loadLiveMacro() {
	if (inflight) return inflight;
	inflight = pull().finally(() => {
		inflight = null;
	});
	return inflight;
}
var fetchLiveMacro_createServerFn_handler = createServerRpc({
	id: "a7be02895f47f640d4141f35b0a9984e080e3df81e54a1a9215b88264d8ffb12",
	name: "fetchLiveMacro",
	filename: "src/lib/market/macro.ts"
}, (opts) => fetchLiveMacro.__executeServer(opts));
var fetchLiveMacro = createServerFn({ method: "POST" }).handler(fetchLiveMacro_createServerFn_handler, async () => {
	return loadLiveMacro();
});
//#endregion
export { fetchLiveMacro_createServerFn_handler };
