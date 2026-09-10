import { r as createServerFn } from "./ssr.mjs";
import { i as isLot, n as UNIVERSE, t as STARTING_CASH } from "./universe-8y-43p2g.mjs";
import { n as createSsrRpc, r as loadDeskMids } from "./hyperliquid-eaqPsVI7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/engine-D4bUUxwE.js
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
var fetchLiveMarket = createServerFn({ method: "POST" }).handler(createSsrRpc("238f4028a28e239225c3d6a7d7a63ab0b7feb27ffd420abcf6ca03b53e9d039f"));
loadLiveMarket();
function positionCapital(p, mark) {
	return Math.abs(p.qty) * p.avg + (mark - p.avg) * p.qty;
}
function equityOf(cash, positions, assets) {
	return cash + positions.reduce((sum, p) => {
		return sum + positionCapital(p, assets[p.symbol]?.price || p.avg);
	}, 0);
}
function pad(n) {
	return String(n).padStart(2, "0");
}
function periodKeys(d = /* @__PURE__ */ new Date()) {
	const y = d.getFullYear();
	const m = pad(d.getMonth() + 1);
	const day = pad(d.getDate());
	const utc = new Date(Date.UTC(y, d.getMonth(), d.getDate()));
	const dow = utc.getUTCDay() || 7;
	utc.setUTCDate(utc.getUTCDate() + 4 - dow);
	const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((+utc - +yearStart) / 864e5 + 1) / 7);
	return {
		day: `${y}-${m}-${day}`,
		week: `${utc.getUTCFullYear()}-W${pad(week)}`,
		month: `${y}-${m}`,
		year: `${y}`
	};
}
function defaultAnchors(equity = STARTING_CASH) {
	const keys = periodKeys();
	return {
		day: {
			key: keys.day,
			equity
		},
		week: {
			key: keys.week,
			equity
		},
		month: {
			key: keys.month,
			equity
		},
		year: {
			key: keys.year,
			equity
		}
	};
}
function rollAnchors(anchors, equity) {
	const keys = periodKeys();
	const next = { ...anchors ?? defaultAnchors(equity) };
	[
		"day",
		"week",
		"month",
		"year"
	].forEach((k) => {
		if (!next[k] || next[k].key !== keys[k]) next[k] = {
			key: keys[k],
			equity
		};
	});
	return next;
}
function closedFromFill(existing, fill) {
	if (!existing || existing.qty === 0) return null;
	const signed = fill.side === "buy" ? fill.qty : -fill.qty;
	if (Math.sign(existing.qty) === Math.sign(signed)) return null;
	const closedQty = Math.min(Math.abs(existing.qty), fill.qty);
	const pnl = (fill.price - existing.avg) * closedQty * Math.sign(existing.qty);
	return {
		id: fill.id,
		ts: fill.ts,
		symbol: fill.symbol,
		pnl
	};
}
function pctOf(delta, base) {
	if (!base) return 0;
	return delta / base * 100;
}
function withPercents(slices, total) {
	if (total <= 0) return [];
	const tenths = slices.map((s) => Math.floor(s.value / total * 1e3));
	let leftover = 1e3 - tenths.reduce((a, b) => a + b, 0);
	const order = slices.map((s, i) => ({
		i,
		frac: s.value / total * 1e3 - tenths[i]
	})).sort((a, b) => b.frac - a.frac);
	for (let k = 0; k < leftover; k++) {
		const idx = order[k % order.length]?.i;
		if (idx === void 0) break;
		tenths[idx] += 1;
	}
	return slices.map((s, i) => ({
		...s,
		pct: tenths[i] / 10
	}));
}
function portfolioStats(cash, positions, assets, closedTrades, anchors, startingEquity) {
	const equity = equityOf(cash, positions, assets);
	const floating = positions.reduce((sum, p) => {
		return sum + ((assets[p.symbol]?.price || p.avg) - p.avg) * p.qty;
	}, 0);
	const realized = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
	const total = equity - startingEquity;
	const wins = closedTrades.filter((t) => t.pnl > 0).length;
	const trades = closedTrades.length;
	const day = equity - anchors.day.equity;
	const week = equity - anchors.week.equity;
	const month = equity - anchors.month.equity;
	const year = equity - anchors.year.equity;
	const longs = [];
	const shorts = [];
	let longMv = 0;
	let shortMv = 0;
	for (const p of positions) {
		const px = assets[p.symbol]?.price || p.avg;
		const value = Math.abs(p.qty * px);
		if (value < .5) continue;
		if (p.qty >= 0) {
			longMv += value;
			longs.push({
				name: p.symbol,
				value,
				kind: "long"
			});
		} else {
			shortMv += value;
			shorts.push({
				name: p.symbol,
				value,
				kind: "short"
			});
		}
	}
	const freeCash = Math.max(cash, 0);
	const pieParts = [
		...freeCash > .5 ? [{
			name: "Cash",
			value: freeCash,
			kind: "cash"
		}] : [],
		...longs,
		...shorts
	];
	const slices = withPercents(pieParts, pieParts.reduce((s, x) => s + x.value, 0));
	return {
		equity,
		cash,
		netCash: cash,
		longMv,
		shortMv,
		floating,
		realized,
		total,
		totalPct: pctOf(total, startingEquity),
		winrate: trades ? wins / trades * 100 : 0,
		wins,
		trades,
		openCount: positions.length,
		day,
		dayPct: pctOf(day, anchors.day.equity),
		week,
		weekPct: pctOf(week, anchors.week.equity),
		month,
		monthPct: pctOf(month, anchors.month.equity),
		year,
		yearPct: pctOf(year, anchors.year.equity),
		slices,
		exposures: []
	};
}
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
var AGENTS = [
	{
		id: "vesper",
		name: "Vesper",
		role: "Momentum",
		mandate: "Ride expansion. Cut the names that stall.",
		mark: "V"
	},
	{
		id: "ash",
		name: "Ash",
		role: "Mean reversion",
		mandate: "Fade stretches. Buy panic, sell euphoria.",
		mark: "A"
	},
	{
		id: "kai",
		name: "Kai",
		role: "Flow",
		mandate: "Read the tape and the open book, not the model.",
		mark: "K"
	},
	{
		id: "damian",
		name: "Damian Kaczmarski",
		role: "Wire",
		mandate: "Read the headlines. Trade the story, not the rumor.",
		mark: "D"
	},
	{
		id: "iris",
		name: "Iris",
		role: "Risk chair",
		mandate: "Size the book. Veto concentration. Round-trip fees (open+close) stay ≤ 5% of notional.",
		mark: "I"
	}
];
var AGENT_BY_ID = Object.fromEntries(AGENTS.map((a) => [a.id, a]));
function idleAgents() {
	return AGENTS.map((a) => ({
		id: a.id,
		status: "idle",
		thesis: a.mandate,
		vote: "hold",
		symbol: null,
		conviction: 0
	}));
}
function emptyBook(now = Date.now()) {
	return {
		cash: STARTING_CASH,
		positions: [],
		fills: [],
		closedTrades: [],
		autopilot: false,
		lastCouncil: null,
		lastAsk: null,
		agents: idleAgents(),
		startingEquity: STARTING_CASH,
		periodAnchors: defaultAnchors(STARTING_CASH),
		tape: [{
			id: "sys-open",
			ts: now,
			kind: "system",
			text: "Demo open. $100,000 virtual. Waiting on live prices."
		}],
		proposal: null,
		selected: "NVDA",
		lastAutoAt: 0,
		lastTickAt: 0,
		fillSeq: 0,
		clientUntil: 0,
		deskEpoch: 0
	};
}
function applyFill(cash, positions, fill) {
	const signed = fill.side === "buy" ? fill.qty : -fill.qty;
	const existing = positions.find((p) => p.symbol === fill.symbol);
	if (!existing || Math.abs(existing.qty) < 1e-8) {
		const rest = positions.filter((p) => p.symbol !== fill.symbol);
		return {
			cash: cash - Math.abs(signed) * fill.price,
			positions: [...rest, {
				symbol: fill.symbol,
				qty: signed,
				avg: fill.price
			}]
		};
	}
	const oldQty = existing.qty;
	const newQty = oldQty + signed;
	if (Math.sign(oldQty) === Math.sign(signed)) {
		const absOld = Math.abs(oldQty);
		const absAdd = Math.abs(signed);
		const avg = absOld + absAdd === 0 ? fill.price : (absOld * existing.avg + absAdd * fill.price) / (absOld + absAdd);
		return {
			cash: cash - absAdd * fill.price,
			positions: positions.map((p) => p.symbol === fill.symbol ? {
				...p,
				qty: newQty,
				avg
			} : p)
		};
	}
	const closedQty = Math.min(Math.abs(oldQty), Math.abs(signed));
	const realized = (fill.price - existing.avg) * closedQty * Math.sign(oldQty);
	let nextCash = cash + closedQty * existing.avg + realized;
	if (Math.abs(newQty) < 1e-8) return {
		cash: nextCash,
		positions: positions.filter((p) => p.symbol !== fill.symbol)
	};
	if (Math.sign(newQty) === Math.sign(oldQty)) return {
		cash: nextCash,
		positions: positions.map((p) => p.symbol === fill.symbol ? {
			...p,
			qty: newQty
		} : p)
	};
	nextCash -= Math.abs(newQty) * fill.price;
	return {
		cash: nextCash,
		positions: positions.map((p) => p.symbol === fill.symbol ? {
			symbol: p.symbol,
			qty: newQty,
			avg: fill.price
		} : p)
	};
}
/** Paper half-spread, each side. */
var PAPER_SPREAD_LOT = 4e-4;
var PAPER_SPREAD = 25e-5;
/** HL taker ~0.045% + MetaMask builder 0.1%, both sides. */
var LIVE_ROUNDTRIP_FEE_PCT = .29;
function estimatedRoundTripFeePct(symbol, live = false) {
	const spreadPct = (isLot(symbol) ? PAPER_SPREAD_LOT : PAPER_SPREAD) * 2 * 100;
	return live ? Math.max(spreadPct, LIVE_ROUNDTRIP_FEE_PCT) : spreadPct;
}
function feeCapOk(symbol, qty, price, live = false) {
	if (!(Math.abs(qty * price) > 0)) return false;
	return estimatedRoundTripFeePct(symbol, live) <= 5.000000001;
}
function notionalOk(cash, positions, assets, symbol, side, qty, price) {
	const eq = equityOf(cash, positions, assets);
	const nextQty = (positions.find((p) => p.symbol === symbol)?.qty ?? 0) + (side === "buy" ? qty : -qty);
	const nameNotional = Math.abs(nextQty * price);
	if (eq > 0 && nameNotional > eq * .45) return false;
	if (positions.filter((p) => p.symbol !== symbol).reduce((s, p) => s + Math.abs(p.qty * (assets[p.symbol]?.price || p.avg)), 0) + nameNotional > Math.max(eq, 1) * 2.2) return false;
	if (!feeCapOk(symbol, qty, price)) return false;
	return applyFill(cash, positions, {
		id: "probe",
		ts: 0,
		symbol,
		side,
		qty,
		price,
		source: "manual"
	}).cash >= -.5;
}
function speak(book, item) {
	const row = {
		id: `t-${(item.ts ?? Date.now()).toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
		ts: item.ts ?? Date.now(),
		kind: item.kind,
		text: item.text,
		agentId: item.agentId,
		symbol: item.symbol
	};
	return {
		...book,
		tape: [row, ...book.tape].slice(0, 120)
	};
}
function commitFill(book, input) {
	const sized = isLot(input.symbol) || input.skipRisk ? input.qty : Math.round(input.qty);
	if (!Number.isFinite(sized) || sized <= 0) return {
		ok: false,
		error: "Size the ticket."
	};
	if (!input.skipRisk && !notionalOk(book.cash, book.positions, input.assets, input.symbol, input.side, sized, input.price)) return {
		ok: false,
		error: "Iris veto — size or concentration."
	};
	const fill = {
		id: `f-${input.ts.toString(36)}-${(book.fillSeq + 1).toString(36)}`,
		ts: input.ts,
		symbol: input.symbol,
		side: input.side,
		qty: sized,
		price: input.price,
		source: input.source,
		note: input.note
	};
	const next = applyFill(book.cash, book.positions, fill);
	if (!input.skipRisk && next.cash < -.5) return {
		ok: false,
		error: "Iris veto — not enough cash."
	};
	const closed = closedFromFill(book.positions.find((p) => p.symbol === input.symbol), fill);
	const closedTrades = closed ? [closed, ...book.closedTrades].slice(0, 200) : book.closedTrades;
	const eq = equityOf(next.cash, next.positions, input.assets);
	let out = {
		...book,
		cash: next.cash,
		positions: next.positions,
		fills: [fill, ...book.fills].slice(0, 80),
		closedTrades,
		fillSeq: book.fillSeq + 1,
		periodAnchors: rollAnchors(book.periodAnchors, eq),
		proposal: book.proposal && book.proposal.symbol === input.symbol && book.proposal.side === input.side ? null : book.proposal
	};
	out = speak(out, {
		kind: "fill",
		symbol: input.symbol,
		ts: input.ts,
		text: `${input.side.toUpperCase()} ${sized.toFixed(isLot(input.symbol) ? 4 : 2)} ${input.symbol} @ ${input.price.toFixed(2)}${input.note ? ` · ${input.note}` : ""}`
	});
	return {
		ok: true,
		book: out,
		fill
	};
}
function viewsAt(quotes, t) {
	return quotes.flatMap((q) => {
		const u = UNIVERSE.find((x) => x.symbol === q.symbol);
		if (!u) return [];
		const series = q.series.filter((b) => b.t <= t);
		const price = series.at(-1)?.px ?? q.price;
		if (!price) return [];
		const mean = sma(series.map((b) => b.px), 20);
		return [{
			symbol: q.symbol,
			price,
			changePct: changePct(price, q.prevClose || q.open || price),
			vsSma: mean ? (price - mean) / mean * 100 : 0,
			vol: u.vol
		}];
	});
}
function assetsFromViews(views) {
	const out = {};
	for (const v of views) {
		const u = UNIVERSE.find((x) => x.symbol === v.symbol);
		if (!u) continue;
		out[v.symbol] = {
			symbol: v.symbol,
			name: u.name,
			price: v.price,
			open: v.price,
			high: v.price,
			low: v.price,
			series: [{
				t: 1,
				px: v.price
			}],
			vol: u.vol,
			beta: u.beta,
			livePx: null,
			liveCoin: null
		};
	}
	return out;
}
function autopilotOnce(book, views, now) {
	if (!book.autopilot) return {
		...book,
		lastTickAt: now
	};
	if (now - Math.max(book.lastAutoAt, book.fills.find((f) => f.source === "autopilot")?.ts ?? 0) < 55e3) return {
		...book,
		lastTickAt: now
	};
	const mood = book.lastCouncil?.mood ?? "cautious";
	if (mood === "risk-off") return {
		...book,
		lastAutoAt: now,
		lastTickAt: now
	};
	if (!views.some((t) => t.price > 0)) return {
		...book,
		lastTickAt: now
	};
	const mandate = book.lastCouncil;
	const best = [...views.map((t) => {
		const wMom = mood === "risk-on" ? .7 : .45;
		let score = wMom * t.changePct + (1 - wMom) * -t.vsSma;
		if (mandate?.order?.symbol === t.symbol) score += mandate.order.side === "buy" ? 1.2 : -1.2;
		return {
			...t,
			score
		};
	})].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];
	if (!best || Math.abs(best.score) < .85) return {
		...book,
		lastTickAt: now
	};
	const side = best.score > 0 ? "buy" : "sell";
	const existing = book.positions.find((p) => p.symbol === best.symbol);
	const assets = assetsFromViews(views);
	const spread = isLot(best.symbol) ? 4e-4 : 25e-5;
	const price = side === "buy" ? best.price * (1 + spread) : best.price * (1 - spread);
	if (existing && Math.abs(existing.qty) > 1e-8) {
		const long = existing.qty > 0;
		const wantLong = side === "buy";
		let next = {
			...book,
			lastAutoAt: now,
			lastTickAt: now
		};
		if (long === wantLong) return next;
		const closed = commitFill(next, {
			symbol: best.symbol,
			side: long ? "sell" : "buy",
			qty: Math.abs(existing.qty),
			price,
			source: "autopilot",
			note: "Autopilot flattened — signal flipped",
			skipRisk: true,
			ts: now,
			assets
		});
		if (closed.ok) return speak(closed.book, {
			kind: "system",
			ts: now,
			text: `Autopilot flattened ${best.symbol} — signal flipped.`
		});
		return next;
	}
	const raw = equityOf(book.cash, book.positions, assets) * .03 / best.price;
	const qty = isLot(best.symbol) ? Number(raw.toFixed(4)) : Math.max(1, Math.round(raw));
	const opened = commitFill({
		...book,
		lastAutoAt: now,
		lastTickAt: now
	}, {
		symbol: best.symbol,
		side,
		qty,
		price,
		source: "autopilot",
		note: "Autopilot · desk stayed live",
		ts: now,
		assets
	});
	return opened.ok ? opened.book : {
		...book,
		lastAutoAt: now,
		lastTickAt: now
	};
}
function catchUpBook(book, quotes, now) {
	if (!quotes.length) return {
		...book,
		lastTickAt: now
	};
	if (!book.autopilot) return {
		...book,
		lastTickAt: now
	};
	const since = Math.max(book.lastTickAt, book.lastAutoAt, 0);
	if (!since) return autopilotOnce(book, viewsAt(quotes, now), now);
	const elapsed = now - since;
	if (elapsed < 55e3) return autopilotOnce(book, viewsAt(quotes, now), now);
	const stamps = /* @__PURE__ */ new Set();
	for (const q of quotes) for (const b of q.series) if (b.t > since && b.t <= now) stamps.add(b.t);
	const times = [...stamps].sort((a, b) => a - b);
	const maxSteps = 16;
	const step = Math.max(1, Math.ceil(times.length / maxSteps));
	const picked = times.filter((_, i) => i % step === 0).slice(0, maxSteps);
	if (!picked.length) picked.push(now);
	let next = book;
	const beforeFills = book.fills.length;
	for (const t of picked) next = autopilotOnce(next, viewsAt(quotes, t), t);
	next = {
		...next,
		lastTickAt: now
	};
	if (!(elapsed >= 18e4)) return next;
	const added = next.fills.length - beforeFills;
	if (added > 0) next = speak(next, {
		kind: "system",
		ts: now,
		text: `While the desk was dark, autopilot printed ${added} fill${added === 1 ? "" : "s"}. Book is live.`
	});
	else next = speak(next, {
		kind: "system",
		ts: now,
		text: "Desk was dark. Autopilot held — no new probe while you were away."
	});
	return next;
}
function bookLooksLive(book) {
	if (!book) return false;
	return book.fills.length > 0 || book.positions.length > 0 || Boolean(book.lastCouncil) || Boolean(book.lastAsk);
}
/** True when `a` should replace `b`. Empty never beats a live book. Reset wins via deskEpoch. */
function preferBook(a, b) {
	const ae = a.deskEpoch ?? 0;
	const be = b.deskEpoch ?? 0;
	if (ae !== be) return ae > be;
	const aLive = bookLooksLive(a);
	const bLive = bookLooksLive(b);
	if (aLive && !bLive) return true;
	if (!aLive && bLive) return false;
	if (a.fills.length !== b.fills.length) return a.fills.length > b.fills.length;
	if (a.positions.length !== b.positions.length) return a.positions.length > b.positions.length;
	if (a.fillSeq !== b.fillSeq) return a.fillSeq > b.fillSeq;
	return a.lastTickAt >= b.lastTickAt;
}
function pickBook(a, b) {
	if (!a) return b;
	if (!b) return a;
	return preferBook(a, b) ? a : b;
}
function bookSame(a, b) {
	if (a.cash !== b.cash || a.autopilot !== b.autopilot || a.deskEpoch !== b.deskEpoch) return false;
	if (a.positions.length !== b.positions.length || a.fills.length !== b.fills.length) return false;
	if (a.fillSeq !== b.fillSeq) return false;
	for (let i = 0; i < a.positions.length; i++) {
		const x = a.positions[i];
		const y = b.positions[i];
		if (x.symbol !== y.symbol || x.qty !== y.qty || x.avg !== y.avg) return false;
	}
	return true;
}
//#endregion
export { preferBook as _, bookSame as a, sma as b, closedFromFill as c, equityOf as d, fetchLiveMarket as f, portfolioStats as g, pickBook as h, bookLooksLive as i, defaultAnchors as l, notionalOk as m, AGENT_BY_ID as n, catchUpBook as o, loadLiveMarket as p, applyFill as r, changePct as s, AGENTS as t, emptyBook as u, rollAnchors as v, rsi as y };
