import { r as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/macro-Bg8vwTHR.js
var macro_Bg8vwTHR_exports = /* @__PURE__ */ __exportAll({
	a: () => sectorBoard,
	i: () => macro_exports,
	n: () => fetchLiveMacro,
	o: () => sentimentBias,
	r: () => macroHint,
	s: () => withEquityPct,
	t: () => classifyMacro
});
var macro_exports = /* @__PURE__ */ __exportAll$1({
	classifyMacro: () => classifyMacro,
	cryptoCapTalk: () => cryptoCapTalk,
	emptyMacro: () => emptyMacro,
	fetchLiveMacro: () => fetchLiveMacro,
	loadLiveMacro: () => loadLiveMacro,
	macroHint: () => macroHint,
	sectorBoard: () => sectorBoard,
	sentimentBias: () => sentimentBias,
	withEquityPct: () => withEquityPct
});
function sentimentBias(sectors) {
	if (!sectors?.length) return 0;
	let score = 0;
	for (const row of sectors) {
		const sign = row.stance === "bullish" ? 1 : row.stance === "bearish" ? -1 : 0;
		score += row.id === "dollar" ? -sign : sign;
	}
	return score / 5;
}
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
function emptyMacro(at = Date.now()) {
	return {
		vix: null,
		vixChg: null,
		dxy: null,
		dxyChg: null,
		cryptoMcap: null,
		cryptoMcapPct: null,
		equityPct: null,
		at
	};
}
function classifyMacro(m) {
	if (!m) return {
		vol: "unknown",
		dollar: "unknown",
		crypto: "unknown",
		equity: "unknown"
	};
	return {
		vol: m.vix == null ? "unknown" : m.vix >= 22 || m.vixChg != null && m.vixChg >= 8 ? "hot" : m.vix <= 14 && (m.vixChg == null || m.vixChg < 4) ? "calm" : "elevated",
		dollar: m.dxyChg == null ? "unknown" : m.dxyChg >= .35 ? "firm" : m.dxyChg <= -.35 ? "soft" : "flat",
		crypto: m.cryptoMcapPct == null ? "unknown" : m.cryptoMcapPct >= 1.5 ? "in" : m.cryptoMcapPct <= -1.5 ? "out" : "flat",
		equity: m.equityPct == null ? "unknown" : m.equityPct >= .35 ? "up" : m.equityPct <= -.35 ? "down" : "flat"
	};
}
function withEquityPct(m, spyChg) {
	if (!m && spyChg == null) return null;
	return {
		...m ?? emptyMacro(),
		equityPct: spyChg
	};
}
function n(v, d = 1) {
	return v.toFixed(d);
}
function cryptoCapTalk(m, locale) {
	const pl = locale === "pl";
	const cap = m?.cryptoMcap;
	const pct = m?.cryptoMcapPct;
	const capStr = cap != null && cap > 0 ? cap >= 0xe8d4a51000 ? `$${(cap / 0xe8d4a51000).toFixed(2)}T` : cap >= 1e9 ? `$${(cap / 1e9).toFixed(0)}B` : `$${cap.toFixed(0)}` : null;
	const pctStr = pct != null && Number.isFinite(pct) ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : null;
	if (capStr && pctStr) return pl ? `kapitalizacja krypto ${capStr}, ${pctStr} na dobę` : `crypto market cap ${capStr}, ${pctStr} on the day`;
	if (pctStr) return pl ? `kapitalizacja krypto ${pctStr} na dobę` : `crypto market cap ${pctStr} on the day`;
	if (capStr) return pl ? `kapitalizacja krypto ${capStr}` : `crypto market cap ${capStr}`;
	return "";
}
/** One-line pulse Damian can speak. Skips unknown fields. No ticker dump. */
function macroHint(m, locale) {
	const p = classifyMacro(m);
	const bits = [];
	const pl = locale === "pl";
	const cap = cryptoCapTalk(m, locale);
	if (cap) bits.unshift(cap);
	if (p.vol === "hot") bits.push(pl ? "zmienność skoczyła" : "vol jumped");
	else if (p.vol === "calm") bits.push(pl ? "zmienność spokojna" : "vol is calm");
	else if (p.vol === "elevated") bits.push(pl ? "zmienność podwyższona" : "vol is elevated");
	if (p.dollar === "firm") bits.push(pl ? `dolar mocniejszy${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — presja na BTC i metale` : `dollar firmer${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — headwind for BTC and metals`);
	else if (p.dollar === "soft") bits.push(pl ? `dolar słabszy${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — wiatr w plecy dla BTC i metali` : `dollar softer${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — tailwind for BTC and metals`);
	if (p.equity === "up" && m?.equityPct != null) bits.push(pl ? `szeroki rynek akcji +${n(m.equityPct)}%` : `broad stocks +${n(m.equityPct)}%`);
	else if (p.equity === "down" && m?.equityPct != null) bits.push(pl ? `szeroki rynek akcji ${n(m.equityPct)}%` : `broad stocks ${n(m.equityPct)}%`);
	return bits.slice(0, 3).join(". ");
}
function asStance(up, down) {
	if (down) return "bearish";
	if (up) return "bullish";
	return "neutral";
}
/** Damian's board — sector bias, not a ticker vote. */
function sectorBoard(m, tickers, locale) {
	const p = classifyMacro(m);
	const pl = locale === "pl";
	const spy = tickers.find((t) => t.symbol === "SPY");
	const btc = tickers.find((t) => t.symbol === "BTC");
	const gold = tickers.find((t) => t.symbol === "GOLD");
	const eqChg = m?.equityPct ?? spy?.changePct ?? null;
	const btcChg = btc?.changePct ?? null;
	const goldChg = gold?.changePct ?? null;
	const equities = asStance(p.equity === "up" || eqChg != null && eqChg >= .35, p.equity === "down" || p.vol === "hot" || eqChg != null && eqChg <= -.35);
	const crypto = asStance(p.crypto === "in" || p.dollar === "soft" || btcChg != null && btcChg >= .8, p.crypto === "out" || p.dollar === "firm" || btcChg != null && btcChg <= -.8);
	const metals = asStance(p.dollar === "soft" || goldChg != null && goldChg >= .4, p.dollar === "firm" || goldChg != null && goldChg <= -.4);
	const dollar = asStance(p.dollar === "firm", p.dollar === "soft");
	const vol = asStance(p.vol === "calm", p.vol === "hot");
	const why = (id, stance) => {
		if (id === "equities") {
			if (stance === "bullish") return pl ? "szeroki rynek w górę, zmienność nie przeszkadza" : "broad stocks up, vol not in the way";
			if (stance === "bearish") return pl ? "akcje słabe albo skok zmienności" : "stocks weak or vol jumped";
			return pl ? "akcje bez kierunku" : "stocks have no one-way read";
		}
		if (id === "crypto") {
			const cap = cryptoCapTalk(m, locale);
			if (stance === "bullish") return cap ? pl ? `${cap} — dolar nie dusi` : `${cap} — dollar not squeezing` : pl ? "kapitalizacja krypto / BTC w górę, dolar nie dusi" : "crypto cap / BTC bid, dollar not squeezing";
			if (stance === "bearish") return cap ? pl ? `${cap} — presja dolara albo odpływ` : `${cap} — firm dollar or outflows` : pl ? "krypto pod presją dolara albo odpływu" : "crypto under a firm dollar or outflows";
			return cap ? pl ? `${cap} — krypto w dwie strony` : `${cap} — crypto two-way` : pl ? "krypto w dwie strony" : "crypto two-way";
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
	const sectors = [
		{
			id: "equities",
			stance: equities,
			why: why("equities", equities)
		},
		{
			id: "crypto",
			stance: crypto,
			why: why("crypto", crypto)
		},
		{
			id: "metals",
			stance: metals,
			why: why("metals", metals)
		},
		{
			id: "dollar",
			stance: dollar,
			why: why("dollar", dollar)
		},
		{
			id: "vol",
			stance: vol,
			why: why("vol", vol)
		}
	];
	const leaned = sectors.filter((s) => s.stance !== "neutral");
	return {
		summary: leaned.length ? leaned.slice(0, 3).map((s) => {
			return `${s.id === "equities" ? pl ? "akcje" : "stocks" : s.id === "crypto" ? pl ? "krypto" : "crypto" : s.id === "metals" ? pl ? "metale" : "metals" : s.id === "dollar" ? pl ? "dolar" : "dollar" : pl ? "zmienność" : "vol"} ${s.stance === "bullish" ? pl ? "byczo" : "bullish" : pl ? "niedźwiedzio" : "bearish"}`;
		}).join(" · ") : pl ? "Sentyment mieszany — bez jednostronnego rynku." : "Mixed tape — no one-way market.",
		sectors
	};
}
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
var fetchLiveMacro = createServerFn({ method: "POST" }).handler(createSsrRpc("a7be02895f47f640d4141f35b0a9984e080e3df81e54a1a9215b88264d8ffb12"));
//#endregion
export { sectorBoard as a, macro_Bg8vwTHR_exports as i, fetchLiveMacro as n, sentimentBias as o, macroHint as r, withEquityPct as s, classifyMacro as t };
