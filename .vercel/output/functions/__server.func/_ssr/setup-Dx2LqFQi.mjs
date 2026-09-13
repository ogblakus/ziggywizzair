import { d as rsi, f as sma } from "./holds-BpglsS1V.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/setup-Dx2LqFQi.js
function hi(b) {
	return b.h ?? b.px;
}
function lo(b) {
	return b.l ?? b.px;
}
function op(b) {
	return b.o ?? b.px;
}
function relativeVolume(series) {
	const vols = series.map((b) => b.v).filter((v) => typeof v === "number" && v > 0);
	if (vols.length < 8) return null;
	const last = vols[vols.length - 1];
	const prior = vols.slice(0, -1);
	const avg = prior.reduce((s, x) => s + x, 0) / prior.length;
	if (!(avg > 0)) return null;
	return last / avg;
}
function fvgs(bars) {
	const out = [];
	for (let i = 0; i + 2 < bars.length; i++) {
		const a = bars[i];
		const c = bars[i + 2];
		if (lo(c) > hi(a) + 1e-9) out.push({
			kind: "bull",
			low: hi(a),
			high: lo(c),
			i
		});
		if (hi(c) + 1e-9 < lo(a)) out.push({
			kind: "bear",
			low: hi(c),
			high: lo(a),
			i
		});
	}
	return out;
}
function filled(gap, bars) {
	const after = bars.slice(gap.i + 3);
	if (gap.kind === "bull") return after.some((b) => lo(b) <= gap.low);
	return after.some((b) => hi(b) >= gap.high);
}
function tagging(gap, mark) {
	const w = Math.max(gap.high - gap.low, 1e-9);
	return mark >= gap.low - w * .12 && mark <= gap.high + w * .12;
}
function lastWick(bars, side) {
	const b = bars[bars.length - 1];
	if (!b) return false;
	const range = hi(b) - lo(b);
	if (!(range > 0)) return false;
	const bodyLow = Math.min(op(b), b.px);
	const bodyHigh = Math.max(op(b), b.px);
	if (side === "buy") return (bodyLow - lo(b)) / range >= .38;
	return (hi(b) - bodyHigh) / range >= .38;
}
var EMPTY = {
	kind: "none",
	px: null,
	retrace: null,
	fvg: null,
	wick: false,
	tf: null
};
/**
* Last 12 bars on one HTF (15m / 1h / 4h). Never 1m — that's chart noise.
* Chase = sitting on the extreme (no entry).
* Pullback = 18–62% off that extreme, or price tagging an unfilled 3-bar FVG.
*/
function candleSetup(series, mark, side, tf = null) {
	const bars = series.slice(-12);
	if (bars.length < 6 || !(mark > 0)) return {
		...EMPTY,
		tf
	};
	const his = bars.map(hi);
	const los = bars.map(lo);
	const rangeHi = Math.max(...his);
	const rangeLo = Math.min(...los);
	const range = rangeHi - rangeLo;
	if (!(range > 0)) return {
		...EMPTY,
		tf
	};
	const last = bars[bars.length - 1];
	const prev = bars[bars.length - 2];
	const wick = lastWick(bars, side);
	const gaps = fvgs(bars).filter((g) => !filled(g, bars));
	const want = side === "buy" ? "bull" : "bear";
	const liveGap = gaps.filter((g) => g.kind === want && tagging(g, mark)).at(-1) ?? null;
	const fvg = liveGap ? {
		low: liveGap.low,
		high: liveGap.high
	} : null;
	if (side === "buy") {
		const retrace = (rangeHi - mark) / range;
		if (retrace < .12 && last.px >= prev.px) return {
			kind: "chase",
			px: null,
			retrace,
			fvg,
			wick,
			tf
		};
		if (retrace >= .18 && retrace <= .62 && mark > rangeLo + range * .2 || fvg) return {
			kind: "pullback",
			px: Number((fvg ? Math.min(mark, (fvg.low + fvg.high) / 2) : Math.min(mark, last.px) * .999).toFixed(4)),
			retrace,
			fvg,
			wick,
			tf
		};
		return {
			kind: "none",
			px: null,
			retrace,
			fvg,
			wick,
			tf
		};
	}
	const retrace = (mark - rangeLo) / range;
	if (retrace < .12 && last.px <= prev.px) return {
		kind: "chase",
		px: null,
		retrace,
		fvg,
		wick,
		tf
	};
	if (retrace >= .18 && retrace <= .62 && mark < rangeHi - range * .2 || fvg) return {
		kind: "pullback",
		px: Number((fvg ? Math.max(mark, (fvg.low + fvg.high) / 2) : Math.max(mark, last.px) * 1.001).toFixed(4)),
		retrace,
		fvg,
		wick,
		tf
	};
	return {
		kind: "none",
		px: null,
		retrace,
		fvg,
		wick,
		tf
	};
}
function pickSetup(htf, mark, side) {
	if (!htf) return EMPTY;
	const ranked = [
		{
			tf: "4h",
			bars: htf.h4
		},
		{
			tf: "1h",
			bars: htf.h1
		},
		{
			tf: "15m",
			bars: htf.m15
		}
	];
	for (const row of ranked) {
		if (row.bars.length < 6) continue;
		const s = candleSetup(row.bars, mark, side, row.tf);
		if (s.fvg && s.kind === "pullback") return s;
	}
	if (htf.m15.length >= 6) return candleSetup(htf.m15, mark, side, "15m");
	if (htf.h1.length >= 6) return candleSetup(htf.h1, mark, side, "1h");
	if (htf.h4.length >= 6) return candleSetup(htf.h4, mark, side, "4h");
	return EMPTY;
}
function packFields(s, prefix) {
	if (prefix === "buy") return {
		buySetup: s.kind,
		buyLimit: s.px ?? void 0,
		buyRetrace: s.retrace != null ? Math.round(s.retrace * 100) : null,
		buyFvg: s.fvg,
		buyWick: s.wick,
		buyTf: s.tf
	};
	return {
		sellSetup: s.kind,
		sellLimit: s.px ?? void 0,
		sellRetrace: s.retrace != null ? Math.round(s.retrace * 100) : null,
		sellFvg: s.fvg,
		sellWick: s.wick,
		sellTf: s.tf
	};
}
/** Agent fields from 15m / 1h / 4h only. Charts still use 1m `series`. */
function analysisSnapshot(htf, mark) {
	const pack = htf ?? {
		m15: [],
		h1: [],
		h4: []
	};
	const bars = pack.m15.length >= 16 ? pack.m15 : pack.h1.length >= 16 ? pack.h1 : pack.h4;
	const closes = bars.map((b) => b.px);
	const mean = sma(closes, 20);
	const buy = pickSetup(pack, mark, "buy");
	const sell = pickSetup(pack, mark, "sell");
	return {
		rsi: closes.length >= 15 ? rsi(closes) : 50,
		vsSma: mean && mark > 0 ? (mark - mean) / mean * 100 : 0,
		rvol: relativeVolume(pack.m15.length >= 8 ? pack.m15 : bars),
		session: notableSession(pack.m15),
		...packFields(buy, "buy"),
		...packFields(sell, "sell")
	};
}
var SESSION_MARKS = [
	{
		name: "utc",
		h: 0,
		m: 0
	},
	{
		name: "lon",
		h: 8,
		m: 0
	},
	{
		name: "ny",
		h: 13,
		m: 30
	},
	{
		name: "tyo",
		h: 15,
		m: 0
	}
];
function median(xs) {
	if (!xs.length) return 0;
	const s = [...xs].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}
function nearestBar(bars, ts) {
	let best = 0;
	let dist = Infinity;
	for (let i = 0; i < bars.length; i++) {
		const d = Math.abs(bars[i].t - ts);
		if (d < dist) {
			dist = d;
			best = i;
		}
	}
	return dist <= 12e5 ? best : -1;
}
/** Biggest Lon/NY/Tyo liquidity grab on 15m in this window. */
function notableSession(bars) {
	if (bars.length < 12) return null;
	const from = bars[0].t;
	const to = bars.at(-1).t;
	const typical = median(bars.map((b) => hi(b) - lo(b)).filter((r) => r > 0));
	if (!(typical > 0) || !(to > from)) return null;
	let best = null;
	const start = Date.UTC(new Date(from).getUTCFullYear(), new Date(from).getUTCMonth(), new Date(from).getUTCDate() - 1);
	for (let day = start; day <= to + 36e5; day += 864e5) {
		const d = new Date(day);
		const y = d.getUTCFullYear();
		const mo = d.getUTCMonth();
		const da = d.getUTCDate();
		for (const s of SESSION_MARKS) {
			const ts = Date.UTC(y, mo, da, s.h, s.m);
			if (ts < from || ts > to) continue;
			const i = nearestBar(bars, ts);
			if (i < 0) continue;
			const window = bars.slice(i, Math.min(i + 3, bars.length));
			if (window.length < 2) continue;
			const hiW = Math.max(...window.map(hi));
			const loW = Math.min(...window.map(lo));
			const range = hiW - loW;
			const open0 = op(window[0]);
			if (!(open0 > 0) || range / typical < 1.45) continue;
			const dump = (open0 - loW) / open0 * 100;
			const pump = (hiW - open0) / open0 * 100;
			const closeN = window.at(-1).px;
			const down = dump >= pump;
			if (!(down ? closeN > loW + (open0 - loW) * .28 : closeN < hiW - (hiW - open0) * .28) && range / typical < 1.8) continue;
			const pct = down ? dump : pump;
			if (pct < .12) continue;
			const hoursAgo = Math.max(0, (to - ts) / 36e5);
			const score = range / typical * pct * (s.name === "ny" ? 1.3 : s.name === "lon" ? 1.1 : 1) / (1 + hoursAgo * .04);
			if (!best || score > best.score) best = {
				name: s.name,
				kind: down ? "grab-down" : "grab-up",
				pct,
				score
			};
		}
	}
	return best ? {
		name: best.name,
		kind: best.kind,
		pct: best.pct
	} : null;
}
//#endregion
export { analysisSnapshot as t };
