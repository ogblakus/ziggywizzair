import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hyperliquid-CyQ1Swyx.js
var DESK_TO_PERP = {
	BTC: {
		coin: "BTC",
		dex: ""
	},
	ETH: {
		coin: "ETH",
		dex: ""
	},
	NVDA: {
		coin: "xyz:NVDA",
		dex: "xyz"
	},
	AAPL: {
		coin: "xyz:AAPL",
		dex: "xyz"
	},
	TSLA: {
		coin: "xyz:TSLA",
		dex: "xyz"
	},
	MSFT: {
		coin: "xyz:MSFT",
		dex: "xyz"
	},
	AMZN: {
		coin: "xyz:AMZN",
		dex: "xyz"
	},
	META: {
		coin: "xyz:META",
		dex: "xyz"
	},
	/** xyz:SP500 is the index (~10× the ETF). livePx = mid / 10. */
	SPY: {
		coin: "xyz:SP500",
		dex: "xyz",
		scale: 10
	},
	GOLD: {
		coin: "xyz:GOLD",
		dex: "xyz"
	},
	SILVER: {
		coin: "xyz:SILVER",
		dex: "xyz"
	}
};
function deskFromHlMid(symbol, rawMid) {
	return rawMid / (DESK_TO_PERP[symbol]?.scale ?? 1);
}
var MIDS_MS = 400;
var midsCache = null;
var midsInflight = null;
async function loadDeskMids() {
	if (midsCache && Date.now() - midsCache.at < MIDS_MS) return midsCache.mids;
	if (midsInflight) return midsInflight;
	midsInflight = (async () => {
		const out = {};
		try {
			const [core, xyz] = await Promise.all([hlInfo({ type: "allMids" }), hlInfo({
				type: "allMids",
				dex: "xyz"
			})]);
			const coreBook = core ?? {};
			const xyzBook = xyz ?? {};
			for (const [desk, row] of Object.entries(DESK_TO_PERP)) {
				const raw = Number((row.dex === "xyz" ? xyzBook : coreBook)[row.coin]);
				if (!Number.isFinite(raw) || raw <= 0) continue;
				out[desk] = {
					mid: deskFromHlMid(desk, raw),
					coin: row.coin
				};
			}
		} catch {}
		midsCache = {
			at: Date.now(),
			mids: Object.keys(out).length ? out : midsCache?.mids ?? out
		};
		return midsCache.mids;
	})().finally(() => {
		midsInflight = null;
	});
	return midsInflight;
}
function parseBars(raw, scale, keep) {
	if (!Array.isArray(raw)) return [];
	const series = [];
	for (const bar of raw) {
		const r = bar;
		const tRaw = Number(r.t);
		const t = tRaw > 0 && tRaw < 1e11 ? tRaw * 1e3 : tRaw;
		const px = Number(r.c) / scale;
		const v = Number(r.v);
		const o = Number(r.o) / scale;
		const h = Number(r.h) / scale;
		const l = Number(r.l) / scale;
		if (Number.isFinite(t) && Number.isFinite(px) && px > 0) {
			const row = {
				t,
				px
			};
			if (Number.isFinite(v) && v > 0) row.v = v;
			if (Number.isFinite(o) && o > 0) row.o = o;
			if (Number.isFinite(h) && h > 0) row.h = h;
			if (Number.isFinite(l) && l > 0) row.l = l;
			series.push(row);
		}
	}
	return series.slice(-keep);
}
var candleMemo = {};
var candleWait = {};
var symbolWait = /* @__PURE__ */ new Map();
var INTERVAL_SPEC = {
	"1m": {
		hours: 3,
		keep: 90,
		ttl: 8e3
	},
	"5m": {
		hours: 8,
		keep: 90,
		ttl: 2e4
	},
	"15m": {
		hours: 26,
		keep: 96,
		ttl: 2e4
	},
	"1h": {
		hours: 96,
		keep: 80,
		ttl: 9e4
	},
	"4h": {
		hours: 240,
		keep: 60,
		ttl: 18e4
	}
};
async function loadInterval(interval, hours, keep, ttl) {
	const now = Date.now();
	const hit = candleMemo[interval];
	if (hit && now - hit.at < hit.ttl && Object.keys(hit.data).length) return hit.data;
	if (candleWait[interval]) return candleWait[interval];
	const run = (async () => {
		const prev = hit?.data ?? {};
		const startTime = Date.now() - hours * 60 * 60 * 1e3;
		const endTime = Date.now();
		const out = { ...prev };
		const rows = Object.entries(DESK_TO_PERP);
		const limit = 3;
		for (let i = 0; i < rows.length; i += limit) await Promise.all(rows.slice(i, i + limit).map(async ([desk, row]) => {
			try {
				const payload = {
					type: "candleSnapshot",
					req: {
						coin: row.coin,
						interval,
						startTime,
						endTime
					}
				};
				if (row.dex) payload.dex = row.dex;
				const series = parseBars(await hlInfo(payload, 15e3), row.scale ?? 1, keep);
				if (series.length) out[desk] = series;
			} catch {}
		}));
		if (Object.keys(out).length) candleMemo[interval] = {
			at: Date.now(),
			data: out,
			ttl
		};
		return out;
	})().finally(() => {
		candleWait[interval] = void 0;
	});
	candleWait[interval] = run;
	return run;
}
async function loadHlCandles(hours = 3) {
	const spec = INTERVAL_SPEC["1m"];
	return loadInterval("1m", hours || spec.hours, spec.keep, spec.ttl);
}
async function loadHlChart5() {
	const spec = INTERVAL_SPEC["5m"];
	return loadInterval("5m", spec.hours, spec.keep, spec.ttl);
}
async function loadHlHtf() {
	const [m15, h1, h4] = await Promise.all([
		loadInterval("15m", INTERVAL_SPEC["15m"].hours, INTERVAL_SPEC["15m"].keep, INTERVAL_SPEC["15m"].ttl),
		loadInterval("1h", INTERVAL_SPEC["1h"].hours, INTERVAL_SPEC["1h"].keep, INTERVAL_SPEC["1h"].ttl),
		loadInterval("4h", INTERVAL_SPEC["4h"].hours, INTERVAL_SPEC["4h"].keep, INTERVAL_SPEC["4h"].ttl)
	]);
	const out = {};
	for (const desk of Object.keys(DESK_TO_PERP)) out[desk] = {
		m15: m15[desk] ?? [],
		h1: h1[desk] ?? [],
		h4: h4[desk] ?? []
	};
	return out;
}
/** One coin, one interval — for instant chart switches. Does not wait on the rest of the board. */
async function loadHlSymbolCandles(symbol, interval) {
	const row = DESK_TO_PERP[symbol];
	if (!row) return [];
	const spec = INTERVAL_SPEC[interval];
	const now = Date.now();
	const hit = candleMemo[interval];
	const cached = hit?.data[symbol];
	const age = hit ? now - hit.at : Infinity;
	if (cached && cached.length >= 2 && age < Math.max(spec.ttl, 12e4)) return cached;
	const key = `${symbol}:${interval}`;
	const inflight = symbolWait.get(key);
	if (inflight) return inflight;
	const run = (async () => {
		try {
			const payload = {
				type: "candleSnapshot",
				req: {
					coin: row.coin,
					interval,
					startTime: now - spec.hours * 60 * 60 * 1e3,
					endTime: now
				}
			};
			if (row.dex) payload.dex = row.dex;
			const series = parseBars(await hlInfo(payload, 4e3), row.scale ?? 1, spec.keep);
			if (series.length) {
				const prev = candleMemo[interval] ?? {
					at: 0,
					data: {},
					ttl: spec.ttl
				};
				candleMemo[interval] = {
					at: prev.at || now,
					data: {
						...prev.data,
						[symbol]: series
					},
					ttl: prev.ttl
				};
				return series;
			}
		} catch {}
		return cached ?? [];
	})().finally(() => {
		symbolWait.delete(key);
	});
	symbolWait.set(key, run);
	return run;
}
var HL = "https://api.hyperliquid.xyz/info";
async function hlInfo(body, ms = 8e3) {
	const res = await fetch(HL, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(ms)
	});
	if (!res.ok) throw new Error(`Hyperliquid ${res.status}`);
	return res.json();
}
var loadPerpsAccount = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("a83e9bb6d0e06e1153b552bd181a1f80edfd03abae9934fe7770ae473ebe348b"));
//#endregion
export { loadHlHtf as a, loadHlChart5 as i, loadDeskMids as n, loadHlSymbolCandles as o, loadHlCandles as r, loadPerpsAccount as s, DESK_TO_PERP as t };
