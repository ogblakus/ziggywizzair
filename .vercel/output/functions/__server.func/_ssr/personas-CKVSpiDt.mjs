//#region node_modules/.nitro/vite/services/ssr/assets/personas-CKVSpiDt.js
function sma(series, n) {
	if (series.length === 0) return 0;
	const slice = series.slice(-n);
	return slice.reduce((a, b) => a + b, 0) / slice.length;
}
function rsi(series, n = 14) {
	if (series.length < n + 1) return 50;
	let gains = 0;
	let losses = 0;
	for (let i = series.length - n; i < series.length; i++) {
		const d = series[i] - series[i - 1];
		if (d >= 0) gains += d;
		else losses -= d;
	}
	if (losses === 0) return 100;
	return 100 - 100 / (1 + gains / losses);
}
function changePct(price, open) {
	if (!open) return 0;
	return (price - open) / open * 100;
}
/** Default: about one session, not a hard close-at-bell. */
var SESSION_HOLD_MS = 216e5;
/** Only names still working with the trend. */
var PROMISING_HOLD_MS = 2592e5;
function localDayStart(ts) {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}
function isAddOn(positions, symbol, side) {
	const pos = positions.find((p) => p.symbol === symbol);
	if (!pos || Math.abs(pos.qty) < 1e-8) return false;
	const signed = side === "buy" ? 1 : -1;
	return Math.sign(pos.qty) === signed;
}
function isReduce(positions, symbol, side) {
	const pos = positions.find((p) => p.symbol === symbol);
	if (!pos || Math.abs(pos.qty) < 1e-8) return false;
	const signed = side === "buy" ? 1 : -1;
	return Math.sign(pos.qty) !== signed;
}
/** Walk fills oldest-first; an add is a same-side increase of an already-open name. */
function addCountToday(fills, now) {
	const start = localDayStart(now);
	const qty = /* @__PURE__ */ new Map();
	const ordered = [...fills].sort((a, b) => a.ts - b.ts);
	let adds = 0;
	for (const f of ordered) {
		const signed = f.side === "buy" ? f.qty : -f.qty;
		const prev = qty.get(f.symbol) ?? 0;
		if (Math.abs(prev) > 1e-8 && Math.sign(prev) === Math.sign(signed) && f.ts >= start) adds += 1;
		qty.set(f.symbol, prev + signed);
	}
	return adds;
}
function stampOpened(prev, next, fill) {
	return next.map((p) => {
		if (p.symbol !== fill.symbol) return p;
		const flip = !prev || Math.abs(prev.qty) < 1e-8 || Math.sign(prev.qty) !== Math.sign(p.qty);
		return {
			...p,
			openedAt: flip ? fill.ts : prev?.openedAt ?? fill.ts,
			entryNote: flip ? fill.note : prev?.entryNote ?? fill.note,
			teamLock: flip ? fill.source === "manual" : Boolean(prev?.teamLock),
			stopLoss: flip ? p.stopLoss ?? null : p.stopLoss ?? prev?.stopLoss ?? null,
			takeProfit: flip ? p.takeProfit ?? null : p.takeProfit ?? prev?.takeProfit ?? null
		};
	});
}
function inferManualOpen(fills, symbol) {
	const ordered = [...fills].filter((f) => f.symbol === symbol).sort((a, b) => a.ts - b.ts);
	let qty = 0;
	let source = "council";
	for (const f of ordered) {
		const signed = f.side === "buy" ? f.qty : -f.qty;
		const prev = qty;
		qty += signed;
		if (Math.abs(prev) < 1e-8 && Math.abs(qty) > 1e-8) source = f.source;
	}
	return source === "manual";
}
function withTeamLocks(positions, fills) {
	return positions.map((p) => ({
		...p,
		teamLock: typeof p.teamLock === "boolean" ? p.teamLock : inferManualOpen(fills, p.symbol)
	}));
}
function teamBlocks(positions, symbol) {
	const pos = positions.find((p) => p.symbol === symbol);
	if (!pos || Math.abs(pos.qty) < 1e-8) return false;
	return Boolean(pos.teamLock);
}
function promisingHold(pos, price, vsSma, dayChg) {
	if (!(price > 0) || !(pos.avg > 0)) return false;
	if ((price - pos.avg) / pos.avg * 100 * Math.sign(pos.qty || 1) < 1.2) return false;
	return pos.qty > 0 ? vsSma > 0 || dayChg > .2 : vsSma < 0 || dayChg < -.2;
}
function holdExpired(pos, now, price, vsSma, dayChg) {
	const age = now - (pos.openedAt ?? now);
	if (promisingHold(pos, price, vsSma, dayChg)) return age >= PROMISING_HOLD_MS;
	return age >= SESSION_HOLD_MS;
}
function viewOf(asset) {
	if (!asset || !(asset.price > 0)) return null;
	const px = asset.livePx && asset.livePx > 0 ? asset.livePx : asset.price;
	const mean = sma20(asset.series);
	return {
		px,
		vsSma: mean ? (px - mean) / mean * 100 : 0,
		dayChg: changePct(px, asset.open)
	};
}
function sma20(series) {
	if (series.length < 2) return 0;
	const slice = series.slice(-20);
	return slice.reduce((s, b) => s + b.px, 0) / slice.length;
}
var AGENTS = [
	{
		id: "vesper",
		name: "Vesper",
		role: "Momentum",
		mandate: "Independent momentum specialist. 15m expansion score. Does not see the others.",
		mark: "V"
	},
	{
		id: "ash",
		name: "Ash",
		role: "Mean reversion",
		mandate: "Independent mean-reversion specialist. HOLD is valid. Does not oppose Vesper.",
		mark: "A"
	},
	{
		id: "kai",
		name: "Kai",
		role: "Setup",
		mandate: "Entry quality only. Ready / wait / blocked. Never flips direction.",
		mark: "K"
	},
	{
		id: "damian",
		name: "Damian Kaczmarski",
		role: "Sentiment",
		mandate: "Macro regime only. Never votes a ticker. Headwind, not a veto.",
		mark: "D"
	},
	{
		id: "iris",
		name: "Iris",
		role: "Risk chair",
		mandate: "Risk control: APPROVE / REDUCE / WAIT / REJECT. Does not invent direction.",
		mark: "I"
	}
];
var AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
function agentShort(id) {
	return AGENT_BY_ID[id].name.split(" ")[0] ?? AGENT_BY_ID[id].name;
}
//#endregion
export { changePct as a, isReduce as c, sma as d, stampOpened as f, withTeamLocks as h, agentShort as i, promisingHold as l, viewOf as m, AGENT_BY_ID as n, holdExpired as o, teamBlocks as p, addCountToday as r, isAddOn as s, AGENTS as t, rsi as u };
