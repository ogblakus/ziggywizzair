import { a as sectorOf, i as isLot } from "./universe-BHNCzOwL.mjs";
import { p as teamBlocks, t as AGENTS } from "./personas-CKVSpiDt.mjs";
import { t as classifyMacro } from "./macro-Bg8vwTHR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-v2-PvgmS_Qo.js
/** Browser-safe snapshot fingerprint. Server audit can still SHA later. */
function marketStateHash(payload) {
	try {
		const s = JSON.stringify(payload);
		let h = 2166136261;
		for (let i = 0; i < s.length; i++) {
			h ^= s.charCodeAt(i);
			h = Math.imul(h, 16777619);
		}
		return (h >>> 0).toString(16).padStart(8, "0");
	} catch {
		return "00000000";
	}
}
function newRunId() {
	return globalThis.crypto?.randomUUID?.() ?? `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
var WEIGHTS = {
	vesper: .25,
	ash: .15,
	kai: .3,
	damian: .15,
	historical: .15
};
var HARD = {
	MAX_OPEN_LEGS: 2,
	MAX_RESTING_LIMITS: 1,
	MAX_ADDS_PER_DAY: 2,
	MAX_ROUND_TRIP_FEES: .05,
	MIN_SCOUT_SCORE: 60,
	MIN_RR: 1.5,
	MULT_MIN: .5,
	MULT_MAX: 1.25,
	SAMPLE_FOR_WEIGHT: 30
};
function bandOf(score) {
	if (score < 45) return "reject";
	if (score < 60) return "wait";
	if (score < 75) return "small";
	if (score < 85) return "normal";
	return "high";
}
/** Signed contributions are already in the candidate's direction frame. */
function disagreement(vesper, ash, kai) {
	const signed = [
		vesper,
		ash,
		kai
	].filter((n) => n !== 0);
	if (signed.length < 2) return {
		direction: Math.abs(vesper) < 40 && Math.abs(ash) < 40 ? "hold" : vesper >= ash ? vesper >= 0 ? "buy" : "sell" : ash >= 0 ? "buy" : "sell",
		level: "medium",
		score: .6
	};
	const pos = signed.filter((n) => n > 0).length;
	const neg = signed.filter((n) => n < 0).length;
	const mag = signed.reduce((s, n) => s + Math.abs(n), 0) || 1;
	const score = signed.filter((n) => pos >= neg ? n > 0 : n < 0).reduce((s, n) => s + Math.abs(n), 0) / mag;
	return {
		direction: pos === neg ? "hold" : pos > neg ? "buy" : "sell",
		level: vesper >= 60 && ash <= -60 || vesper <= -60 && ash >= 60 ? "low" : score >= .75 ? "high" : score >= .55 ? "medium" : "low",
		score: Number(score.toFixed(2))
	};
}
function clamp$2(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
function asConfidence(v, fallback) {
	const n = Number(v);
	if (!Number.isFinite(n)) return clamp$2(fallback, 0, 1);
	if (n > 1 && n <= 100) return clamp$2(n / 100, 0, 1);
	return clamp$2(n, 0, 1);
}
function asScore(v, fallback) {
	const n = Number(v);
	if (!Number.isFinite(n)) return clamp$2(fallback, 0, 100);
	return clamp$2(n, 0, 100);
}
function clipText(v, max) {
	return typeof v === "string" ? v.trim().slice(0, max) : "";
}
function knownSymbol(snap, symbol) {
	if (!symbol) return null;
	const hit = snap.tickers.find((t) => t.symbol === symbol);
	return hit ? hit.symbol : null;
}
function recommendationFrom(ideas) {
	const top = ideas[0];
	if (!top || top.score < 40) return {
		direction: "hold",
		strength: top?.score ?? 0,
		confidence: top?.confidence ?? .3
	};
	return {
		direction: top.side,
		strength: top.score,
		confidence: top.confidence
	};
}
function validateVesper(out, snap) {
	const ideas = [];
	const seen = /* @__PURE__ */ new Set();
	for (const idea of out.ideas) {
		const symbol = knownSymbol(snap, idea.symbol);
		if (!symbol || seen.has(symbol)) continue;
		seen.add(symbol);
		ideas.push({
			...idea,
			symbol,
			score: asScore(idea.score, 0),
			confidence: asConfidence(idea.confidence, idea.score / 100),
			thesis: clipText(idea.thesis, 280),
			evidence: (idea.evidence ?? []).slice(0, 6)
		});
		if (ideas.length >= 3) break;
	}
	return {
		...out,
		ideas,
		noTradeReason: ideas.length ? null : out.noTradeReason,
		recommendation: recommendationFrom(ideas)
	};
}
function validateAsh(out, snap) {
	const ideas = [];
	const seen = /* @__PURE__ */ new Set();
	for (const idea of out.ideas) {
		const symbol = knownSymbol(snap, idea.symbol);
		if (!symbol || seen.has(symbol)) continue;
		seen.add(symbol);
		ideas.push({
			...idea,
			symbol,
			score: asScore(idea.score, 0),
			confidence: asConfidence(idea.confidence, idea.score / 100),
			thesis: clipText(idea.thesis, 280),
			evidence: (idea.evidence ?? []).slice(0, 6)
		});
		if (ideas.length >= 3) break;
	}
	return {
		...out,
		ideas,
		recommendation: recommendationFrom(ideas)
	};
}
function validateKai(out, snap) {
	const scan = [];
	const seen = /* @__PURE__ */ new Set();
	for (const row of out.scan) {
		const symbol = knownSymbol(snap, row.symbol);
		if (!symbol || seen.has(symbol)) continue;
		seen.add(symbol);
		const tk = snap.tickers.find((t) => t.symbol === symbol);
		const px = tk.livePx && tk.livePx > 0 ? tk.livePx : tk.price;
		let entry = row.entryPrice;
		if (entry != null && px > 0) {
			if (Math.abs(entry - px) / px > .08) entry = null;
		}
		const rr = Number.isFinite(row.rr) ? clamp$2(row.rr, 0, 20) : 0;
		scan.push({
			...row,
			symbol,
			qualityScore: asScore(row.qualityScore, 0),
			rr,
			entryPrice: row.status === "blocked" ? null : entry,
			reason: clipText(row.reason, 280),
			evidence: (row.evidence ?? []).slice(0, 6)
		});
		if (scan.length >= 3) break;
	}
	const primary = scan[0] ?? null;
	const rec = primary && primary.status !== "blocked" ? {
		direction: primary.side,
		strength: primary.qualityScore,
		confidence: primary.status === "ready" ? .72 : .55
	} : {
		direction: "hold",
		strength: primary?.qualityScore ?? 0,
		confidence: .35
	};
	return {
		...out,
		scan,
		primary,
		recommendation: rec
	};
}
function validateDamian(out) {
	const ids = [
		"equities",
		"crypto",
		"metals",
		"dollar",
		"vol"
	];
	const byId = new Map(out.sectors.map((s) => [s.id, s]));
	const sectors = ids.map((id) => {
		const row = byId.get(id);
		return {
			id,
			stance: row?.stance === "bullish" || row?.stance === "bearish" ? row.stance : "neutral",
			score: clamp$2(Number(row?.score) || 0, -100, 100),
			why: clipText(row?.why, 80) || "—"
		};
	});
	return {
		...out,
		sectors,
		summary: clipText(out.summary, 220) || sectors.filter((s) => s.stance !== "neutral").map((s) => `${s.id} ${s.stance}`).join(" · ") || "Mixed.",
		confidence: asConfidence(out.confidence, .55),
		recommendation: {
			direction: "hold",
			strength: 0,
			confidence: asConfidence(out.confidence, .55)
		}
	};
}
function validateIris(out, snap, checks) {
	const symbol = knownSymbol(snap, out.symbol);
	let decision = out.decision;
	if (!checks.openLegLimit || !checks.teamLock || !checks.feeLimit || !checks.restingOrderLimit) decision = "reject";
	if (!checks.scoutScore || !checks.kaiStatus || !checks.kaiDirection || !checks.rr) {
		if (decision === "approve" || decision === "reduce") decision = checks.kaiStatus ? "wait" : "reject";
	}
	const size = decision === "reject" || decision === "wait" ? 0 : clamp$2(out.risk.finalSizePct ?? 0, 0, 6);
	return {
		...out,
		decision,
		symbol: decision === "reject" ? out.symbol : symbol,
		side: out.side,
		risk: {
			...out.risk,
			finalSizePct: size
		},
		order: decision === "approve" || decision === "reduce" ? {
			type: out.order?.type ?? "limit",
			price: out.order?.price ?? null,
			sizePct: size
		} : null,
		checks,
		reason: clipText(out.reason, 280)
	};
}
function emptyChecks(overrides = {}) {
	return {
		openLegLimit: true,
		restingOrderLimit: true,
		feeLimit: true,
		teamLock: true,
		liquidity: true,
		drawdown: true,
		scoutScore: true,
		kaiStatus: true,
		kaiDirection: true,
		rr: true,
		...overrides
	};
}
function clipSizePct(pct) {
	if (pct === 0) return 0;
	if (!Number.isFinite(pct)) return 3;
	return Math.min(6, Math.max(.5, pct));
}
/** Qty for a % of equity at the fill mark — same price the ticket will print. */
function qtyForClip(equity, pct, px, symbol) {
	if (!(equity > 0) || !(px > 0) || !(pct > 0)) return 0;
	const notional = equity * clipSizePct(pct) * .01;
	if (!(notional > 0)) return 0;
	const raw = notional / px;
	const qty = Number(raw.toFixed(isLot(symbol) ? 4 : 2));
	if (qty > 0) return qty;
	if (raw <= 0) return 0;
	return isLot(symbol) ? 1e-4 : 1;
}
function clipPctOf(qty, px, equity) {
	if (!(equity > 0) || !(px > 0)) return 0;
	return Math.abs(qty * px) / equity * 100;
}
function markOf(t) {
	return t.livePx && t.livePx > 0 ? t.livePx : t.price;
}
function kaiKind(tk, side) {
	if (tk.rvol != null && tk.rvol < .55) return "thin";
	const setup = side === "buy" ? tk.buySetup : tk.sellSetup;
	if (setup === "chase") return "chase";
	const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
	if (setup === "pullback" && limit && limit > 0) return "ready";
	return "wait";
}
function kaiLimit(tk, side) {
	const ready = side === "buy" ? tk.buyLimit : tk.sellLimit;
	if (ready && ready > 0) return Number(ready.toFixed(4));
	const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
	if (fvg) return Number(((fvg.low + fvg.high) / 2).toFixed(4));
	const px = markOf(tk);
	if (!(px > 0)) return void 0;
	return Number((side === "buy" ? px * .998 : px * 1.002).toFixed(4));
}
function clamp$1(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
function clamp01(n) {
	return clamp$1(n, 0, 1);
}
/**
* Spec §9 — code owns the momentum score.
* 25% price expansion, 20% rvol, 20% structure, 15% SMA, 10% RSI, 10% HTF.
*/
function vesperMomentumScore(t, side) {
	const dir = side === "buy" ? 1 : -1;
	const price = clamp01(dir * t.changePct / 1.2) * 25;
	let rvol = 8;
	if (t.rvol == null) rvol = 10;
	else if (t.rvol >= 1.3) rvol = 20;
	else if (t.rvol >= .9) rvol = 16;
	else if (t.rvol >= .7) rvol = 12;
	else if (t.rvol >= .55) rvol = 8;
	else rvol = 2;
	const retrace = side === "buy" ? t.buyRetrace : t.sellRetrace;
	const wick = side === "buy" ? t.buyWick : t.sellWick;
	const setup = side === "buy" ? t.buySetup : t.sellSetup;
	let structure = 6;
	if (setup === "pullback") structure += 8;
	if (retrace != null && retrace >= 18 && retrace <= 62) structure += 6;
	if (wick) structure += 4;
	if (setup === "chase") structure = Math.min(structure, 6);
	structure = clamp$1(structure, 0, 20);
	const sma = clamp01(dir * t.vsSma / 1.2) * 15;
	const rsi = side === "buy" ? t.rsi >= 48 && t.rsi < 72 ? 10 : t.rsi >= 44 && t.rsi < 80 ? 6 : t.rsi >= 72 ? 3 : 2 : t.rsi <= 52 && t.rsi > 28 ? 10 : t.rsi <= 56 && t.rsi > 20 ? 6 : t.rsi <= 28 ? 3 : 2;
	const tf = side === "buy" ? t.buyTf : t.sellTf;
	const htf = tf === "4h" ? 10 : tf === "1h" ? 8 : setup === "pullback" ? 6 : 3;
	return clamp$1(price + rvol + structure + sma + rsi + htf, 0, 100);
}
/**
* Mean-reversion score. Distance from mean, RSI extremes, failed breakout, exhaustion.
* Does not fade clean expansion with rising RVOL (spec §13).
*/
function ashReversionScore(t, side) {
	const dist = clamp01((side === "buy" ? -1 : 1) * t.vsSma / 1.8) * 32;
	const rsi = side === "buy" ? t.rsi <= 30 ? 24 : t.rsi <= 38 ? 16 : t.rsi <= 46 ? 8 : 2 : t.rsi >= 74 ? 24 : t.rsi >= 66 ? 16 : t.rsi >= 58 ? 8 : 2;
	const failed = (side === "buy" ? t.buyWick : t.sellWick) ? 14 : (side === "buy" ? t.sellSetup : t.buySetup) === "chase" ? 10 : 4;
	const chg = Math.abs(t.changePct);
	let exhaust = 8;
	if (t.rvol != null && t.rvol < .7 && chg > .8) exhaust = 16;
	else if (t.rvol != null && t.rvol > 1.35 && chg > .6) exhaust = 3;
	const againstExpansion = t.rvol != null && t.rvol >= 1.2 && (side === "sell" && t.changePct > .8 && t.vsSma > .6 || side === "buy" && t.changePct < -.8 && t.vsSma < -.6);
	const raw = dist + rsi + failed + exhaust;
	return clamp$1(againstExpansion ? raw * .45 : raw, 0, 100);
}
function kaiQualityScore(t, side) {
	const kind = kaiKind(t, side);
	if (kind === "thin" || kind === "chase") return {
		status: "blocked",
		score: kind === "thin" ? 12 : 18
	};
	const retrace = side === "buy" ? t.buyRetrace : t.sellRetrace;
	const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
	const wick = side === "buy" ? t.buyWick : t.sellWick;
	const tf = side === "buy" ? t.buyTf : t.sellTf;
	let score = kind === "ready" ? 68 : 48;
	if (fvg) score += tf === "4h" ? 14 : tf === "1h" ? 10 : 6;
	if (retrace != null && retrace >= 18 && retrace <= 62) score += 10;
	if (wick) score += 4;
	if (t.rvol != null && t.rvol >= .9) score += 6;
	else if (t.rvol != null && t.rvol >= .55) score += 3;
	return {
		status: kind === "ready" ? "ready" : "wait",
		score: clamp$1(score, 0, 100)
	};
}
function kaiGeometry(t, side) {
	const px = markOf(t);
	const entry = kaiLimit(t, side) ?? (px > 0 ? px : null);
	if (!(entry && entry > 0)) return {
		entry: null,
		invalidation: null,
		target: null,
		rr: 0
	};
	const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
	let inv = side === "buy" ? fvg && fvg.low < entry ? fvg.low * .998 : entry * .992 : fvg && fvg.high > entry ? fvg.high * 1.002 : entry * 1.008;
	if (side === "buy" && inv >= entry) inv = entry * .992;
	if (side === "sell" && inv <= entry) inv = entry * 1.008;
	const risk = Math.abs(entry - inv);
	if (!(risk > 0)) return {
		entry,
		invalidation: inv,
		target: null,
		rr: 0
	};
	const target = side === "buy" ? entry + risk * 2.5 : entry - risk * 2.5;
	return {
		entry,
		invalidation: inv,
		target,
		rr: Number((Math.abs(target - entry) / risk).toFixed(2))
	};
}
function kaiSetupFor(t, side) {
	const q = kaiQualityScore(t, side);
	const g = kaiGeometry(t, side);
	const kind = kaiKind(t, side);
	const fvg = side === "buy" ? t.buyFvg : t.sellFvg;
	const retrace = side === "buy" ? t.buyRetrace : t.sellRetrace;
	const tf = (side === "buy" ? t.buyTf : t.sellTf) ?? "15m";
	const evidence = [];
	if (fvg) evidence.push(`${tf} FVG ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)}`);
	if (retrace != null) evidence.push(`${retrace}% retracement`);
	if (t.rvol != null) evidence.push(`15m RVOL ${t.rvol.toFixed(2)}`);
	if (kind === "thin") evidence.push("thin tape");
	if (kind === "chase") evidence.push("chase — extreme of range");
	const setupType = fvg ? `${tf}_fvg_pullback` : retrace != null ? "15m_pullback" : "structural_retest";
	return {
		symbol: t.symbol,
		side,
		status: q.status,
		setupType,
		timeframe: tf,
		fvg: fvg ? {
			low: fvg.low,
			high: fvg.high
		} : null,
		retracementPct: retrace ?? null,
		entryType: "limit",
		entryPrice: q.status === "blocked" ? null : g.entry,
		invalidation: g.invalidation,
		target: g.target,
		rr: g.rr,
		qualityScore: q.score,
		evidence,
		reason: ""
	};
}
function kaiScan(tickers, limit = 3) {
	const rows = [];
	for (const t of tickers) for (const side of ["buy", "sell"]) rows.push(kaiSetupFor(t, side));
	const rank = {
		ready: 0,
		wait: 1,
		blocked: 2
	};
	rows.sort((a, b) => rank[a.status] - rank[b.status] || b.qualityScore - a.qualityScore);
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of rows) {
		if (seen.has(row.symbol)) continue;
		seen.add(row.symbol);
		out.push(row);
		if (out.length >= limit) break;
	}
	return out;
}
function damianSectorScores(macro, tickers) {
	const spy = tickers.find((t) => t.symbol === "SPY");
	const btc = tickers.find((t) => t.symbol === "BTC");
	const gold = tickers.find((t) => t.symbol === "GOLD");
	const eq = macro?.equityPct ?? spy?.changePct ?? 0;
	const btcChg = btc?.changePct ?? 0;
	const goldChg = gold?.changePct ?? 0;
	const vix = macro?.vix ?? 18;
	const vixChg = macro?.vixChg ?? 0;
	const dxyChg = macro?.dxyChg ?? 0;
	const capPct = macro?.cryptoMcapPct ?? btcChg;
	const volHot = vix >= 22 || vixChg >= 8;
	const dollarFirm = dxyChg >= .35;
	const dollarSoft = dxyChg <= -.35;
	return {
		equities: clamp$1(eq * 18 + (volHot ? -35 : vix <= 14 ? 12 : 0), -100, 100),
		crypto: clamp$1(capPct * 14 + (dollarFirm ? -22 : dollarSoft ? 14 : 0), -100, 100),
		metals: clamp$1(goldChg * 16 + (dollarSoft ? 18 : dollarFirm ? -18 : 0), -100, 100),
		dollar: clamp$1(dxyChg * 40, -100, 100),
		vol: clamp$1((14 - vix) * 4 - vixChg * 2, -100, 100)
	};
}
function sectorScoreFor(symbol, scores) {
	return scores[sectorOf(symbol)];
}
function historicalMultiplier(closed, hitPct) {
	if (closed < 30 || hitPct == null) return 1;
	return clamp$1(.5 + hitPct / 100 * .75, .5, 1.25);
}
function historicalEdge(closed, hitPct) {
	if (closed < 30 || hitPct == null) return 0;
	return clamp$1((hitPct - 50) * 1.2, -100, 100);
}
function clamp(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
function L$2(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function ideaScore(ideas, symbol, side) {
	const hit = ideas.find((i) => i.symbol === symbol && i.side === side);
	if (hit) return hit.score;
	const opp = ideas.find((i) => i.symbol === symbol && i.side !== side);
	if (opp) return -opp.score;
	return 0;
}
function kaiOn(kai, validated, symbol, side) {
	if (validated && validated.symbol === symbol && validated.side === side) return validated;
	return kai.scan.find((s) => s.symbol === symbol && s.side === side) ?? (kai.primary && kai.primary.symbol === symbol && kai.primary.side === side ? kai.primary : null);
}
function isFlatteningSide(pos, side) {
	return Boolean(pos && side && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && side === "sell" || pos.qty < 0 && side === "buy"));
}
/** True when a working/resting limit must block a second non-cut, non-flattening ticket. */
function hasBlockingRestingLimit(snap, decision) {
	if (!snap.book.working) return false;
	if (decision.cut) return false;
	if (isFlatteningSide(decision.symbol ? snap.book.positions.find((p) => p.symbol === decision.symbol) : void 0, decision.side)) return false;
	return true;
}
function portfolioOk(snap, symbol, side, cut) {
	const reasons = [];
	const pos = snap.book.positions.find((p) => p.symbol === symbol);
	if (teamBlocks(snap.book.positions, symbol)) {
		reasons.push("teamLock");
		return {
			ok: false,
			reasons
		};
	}
	const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
	const adding = Boolean(pos && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && side === "buy" || pos.qty < 0 && side === "sell"));
	if (!cut && !adding && openCount >= 2) reasons.push("openLegs");
	if (!cut && hasBlockingRestingLimit(snap, {
		cut,
		symbol,
		side
	})) reasons.push("restingLimit");
	const cashPct = 100 * snap.book.cash / Math.max(snap.book.equity, 1);
	if (!cut && (snap.book.dayPnlPct < -2.4 || cashPct < 18)) reasons.push("drawdown");
	return {
		ok: reasons.length === 0,
		reasons
	};
}
function sizeForBand(band, damianScore, openCount, adding, agreement) {
	const weatherBias = damianScore / 100;
	let pct = (weatherBias >= .35 ? 5.2 : weatherBias <= -.35 ? 2.2 : 3.2) * (openCount <= 0 ? 1 : openCount === 1 ? .78 : .55);
	if (adding) pct = Math.min(3, pct);
	if (band === "small") pct *= .65;
	if (band === "high") pct = Math.min(6, pct);
	if (agreement.level === "low") pct *= .5;
	if (band === "wait" || band === "reject") return 0;
	return clamp(pct, 2, 6);
}
function stalledCut(snap) {
	const stalled = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8).find((p) => {
		if (p.teamLock) return false;
		const tk = snap.tickers.find((t) => t.symbol === p.symbol);
		if (!tk) return false;
		if (p.qty > 0) return tk.changePct < -.9 || p.pnlPct < -.8 && tk.vsSma < 0;
		return tk.changePct > .9 || p.pnlPct < -.8 && tk.vsSma > 0;
	});
	if (!stalled) return null;
	return {
		symbol: stalled.symbol,
		side: stalled.qty < 0 ? "buy" : "sell"
	};
}
function decisionEngine(input) {
	const { vesper, ash, kai, damian, snap, locale } = input;
	const cards = snap.scorecard ?? [];
	const card = (id) => cards.find((c) => c.id === id);
	const mv = historicalMultiplier(card("vesper")?.closed ?? 0, card("vesper")?.hitPct ?? null);
	const ma = historicalMultiplier(card("ash")?.closed ?? 0, card("ash")?.hitPct ?? null);
	const mk = historicalMultiplier(card("kai")?.closed ?? 0, card("kai")?.hitPct ?? null);
	const hist = historicalEdge((card("vesper")?.closed ?? 0) + (card("ash")?.closed ?? 0) + (card("kai")?.closed ?? 0), (() => {
		const rows = [
			"vesper",
			"ash",
			"kai"
		];
		let w = 0;
		let c = 0;
		for (const id of rows) {
			const r = card(id);
			if (r && r.closed >= 2 && r.hitPct != null) {
				w += r.hitPct * r.closed;
				c += r.closed;
			}
		}
		return c ? w / c : null;
	})());
	const cands = [];
	const seen = /* @__PURE__ */ new Set();
	function push(symbol, side, cut = false) {
		const k = `${symbol}:${side}:${cut ? "c" : "n"}`;
		if (seen.has(k)) return;
		seen.add(k);
		cands.push({
			symbol,
			side,
			cut
		});
	}
	if (input.cut) push(input.cut.symbol, input.cut.side, true);
	for (const i of vesper.ideas) push(i.symbol, i.side);
	for (const i of ash.ideas) push(i.symbol, i.side);
	for (const s of kai.scan) if (s.status !== "blocked") push(s.symbol, s.side);
	let best = null;
	for (const cand of cands) {
		const v = ideaScore(vesper.ideas, cand.symbol, cand.side);
		const a = ideaScore(ash.ideas, cand.symbol, cand.side);
		const setup = kaiOn(kai, input.validated ?? null, cand.symbol, cand.side);
		const kSigned = setup ? setup.side === cand.side ? setup.qualityScore : -setup.qualityScore : 0;
		const d = sectorScoreFor(cand.symbol, {
			equities: damian.sectors.find((s) => s.id === "equities")?.score ?? 0,
			crypto: damian.sectors.find((s) => s.id === "crypto")?.score ?? 0,
			metals: damian.sectors.find((s) => s.id === "metals")?.score ?? 0,
			dollar: damian.sectors.find((s) => s.id === "dollar")?.score ?? 0,
			vol: damian.sectors.find((s) => s.id === "vol")?.score ?? 0
		});
		const final = v * WEIGHTS.vesper * mv + a * WEIGHTS.ash * ma + kSigned * WEIGHTS.kai * mk + d * WEIGHTS.damian + hist * WEIGHTS.historical;
		const agree = disagreement(v, a, kSigned);
		if (cand.side === "sell" && agree.direction === "buy") {}
		const scout = Math.max(v, a);
		const kaiBlocked = !setup || setup.status === "blocked";
		const kaiDir = Boolean(setup && setup.side === cand.side && setup.status !== "blocked");
		const rr = setup?.rr ?? 0;
		const port = portfolioOk(snap, cand.symbol, cand.side, cand.cut);
		const scoutOk = cand.cut || scout >= HARD.MIN_SCOUT_SCORE;
		const kaiOk = cand.cut || !kaiBlocked && kaiDir;
		const rrOk = cand.cut || rr >= HARD.MIN_RR;
		const passed = scoutOk && kaiOk && rrOk && port.ok && agree.level !== "low";
		const band = cand.cut ? "normal" : !passed && agree.level === "low" ? "wait" : bandOf(final);
		const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
		const pos = snap.book.positions.find((p) => p.symbol === cand.symbol);
		const adding = Boolean(pos && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && cand.side === "buy" || pos.qty < 0 && cand.side === "sell"));
		const size = cand.cut ? 0 : sizeForBand(passed ? band : "wait", d, openCount, adding, agree);
		const reasons = [];
		if (!scoutOk) reasons.push(L$2(locale, "Scout score below 60.", "Wynik zwiadu poniżej 60."));
		if (!kaiOk) reasons.push(L$2(locale, "Kai blocked or direction mismatch.", "Kai zablokował albo inny kierunek."));
		if (!rrOk) reasons.push(L$2(locale, `RR ${rr.toFixed(2)} below 1.5.`, `RR ${rr.toFixed(2)} poniżej 1,5.`));
		if (!port.ok) reasons.push(port.reasons.join(", "));
		if (agree.level === "low") reasons.push(L$2(locale, "High disagreement.", "Duża rozbieżność."));
		const draft = {
			decisionId: newRunId(),
			symbol: cand.symbol,
			side: cand.side,
			finalScore: Number(final.toFixed(2)),
			band: cand.cut ? "normal" : passed ? band : band === "reject" ? "reject" : "wait",
			agreement: {
				...agree,
				direction: cand.side
			},
			contributors: {
				vesper: Number(v.toFixed(2)),
				ash: Number(a.toFixed(2)),
				kai: Number(kSigned.toFixed(2)),
				damian: Number(d.toFixed(2)),
				historical: Number(hist.toFixed(2))
			},
			multipliers: {
				vesper: mv,
				ash: ma,
				kai: mk
			},
			gate: {
				passed: cand.cut ? port.ok : passed,
				scoutScore: scoutOk,
				kaiNotBlocked: !kaiBlocked,
				kaiDirection: kaiDir,
				rr: rrOk,
				portfolio: port.ok,
				reasons
			},
			entry: {
				type: "limit",
				price: setup?.entryPrice ?? null
			},
			risk: {
				sizePct: size,
				stop: setup?.invalidation ?? null,
				target: setup?.target ?? null,
				rr
			},
			cut: cand.cut
		};
		if (!best) best = draft;
		else if (cand.cut && !best.cut) best = draft;
		else if (cand.cut === best.cut && draft.finalScore > best.finalScore) best = draft;
		else if (cand.cut === best.cut && draft.gate.passed && !best.gate.passed) best = draft;
	}
	if (!best) return {
		decisionId: newRunId(),
		symbol: null,
		side: null,
		finalScore: 0,
		band: "reject",
		agreement: {
			direction: "hold",
			level: "medium",
			score: 0
		},
		contributors: {
			vesper: 0,
			ash: 0,
			kai: 0,
			damian: 0,
			historical: hist
		},
		multipliers: {
			vesper: mv,
			ash: ma,
			kai: mk
		},
		gate: {
			passed: false,
			scoutScore: false,
			kaiNotBlocked: false,
			kaiDirection: false,
			rr: false,
			portfolio: true,
			reasons: [L$2(locale, "No candidate.", "Brak kandydata.")]
		},
		entry: {
			type: "limit",
			price: null
		},
		risk: {
			sizePct: 0,
			stop: null,
			target: null,
			rr: 0
		},
		cut: false
	};
	return best;
}
function irisChecks(snap, decision, _kai) {
	const symbol = decision.symbol;
	const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
	const pos = symbol ? snap.book.positions.find((p) => p.symbol === symbol) : void 0;
	const flattening = isFlatteningSide(pos, decision.side);
	const rvol = (symbol ? snap.tickers.find((t) => t.symbol === symbol) : void 0)?.rvol ?? 1;
	const adding = Boolean(pos && decision.side && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && decision.side === "buy" || pos.qty < 0 && decision.side === "sell"));
	return emptyChecks({
		openLegLimit: decision.cut || flattening || adding || openCount < HARD.MAX_OPEN_LEGS,
		restingOrderLimit: !hasBlockingRestingLimit(snap, decision),
		feeLimit: true,
		teamLock: !(symbol && teamBlocks(snap.book.positions, symbol)),
		liquidity: rvol >= .55 || decision.cut,
		drawdown: snap.book.dayPnlPct >= -2.4 && 100 * snap.book.cash / Math.max(snap.book.equity, 1) >= 18,
		scoutScore: decision.gate.scoutScore,
		kaiStatus: decision.cut || decision.gate.kaiNotBlocked,
		kaiDirection: decision.cut || decision.gate.kaiDirection,
		rr: decision.cut || decision.gate.rr
	});
}
function applyRestingLimitGate(checks, snap, _kai, decision) {
	return {
		...checks,
		restingOrderLimit: !hasBlockingRestingLimit(snap, decision)
	};
}
function scoutVotes(agents) {
	return agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
}
function kaiVote(agents) {
	return agents.find((a) => a.id === "kai") ?? null;
}
function votesOn(agents, symbol, side) {
	return scoutVotes(agents).filter((a) => a.symbol === symbol && a.vote === side);
}
/**
* Chain: Damian weather → Vesper/Ash rank names → Iris sizes → Kai stamps limit (ready or wait).
* Kai does not veto direction — only chase and dead tape.
* New risk needs a scout AND Kai on the same ticker/side. Cuts need one scout (or Kai).
*/
function gateCouncilOrder(order, agents, snap) {
	if (!order) return null;
	const scouts = votesOn(agents, order.symbol, order.side);
	const kai = kaiVote(agents);
	const kaiOk = kai?.symbol === order.symbol && kai.vote === order.side;
	const pos = snap.book.positions.find((p) => p.symbol === order.symbol);
	const open = pos && Math.abs(pos.qty) > 1e-8;
	if (open && pos.teamLock) return null;
	const reducing = open && (pos.qty > 0 && order.side === "sell" || pos.qty < 0 && order.side === "buy");
	if (hasBlockingRestingLimit(snap, {
		cut: false,
		symbol: order.symbol,
		side: order.side
	})) return null;
	if (reducing) return scouts.length >= 1 || kaiOk ? order : null;
	return scouts.length >= 1 && kaiOk ? order : null;
}
function L$1(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function toVote(direction) {
	return direction;
}
function mapAgents(vesper, ash, kai, damian, iris) {
	const vTop = vesper.ideas[0];
	const aTop = ash.ideas[0];
	const k = kai.primary;
	return AGENTS.map((p) => {
		if (p.id === "vesper") return {
			id: p.id,
			thesis: vTop?.thesis || vesper.noTradeReason || "No view this print.",
			vote: toVote(vesper.recommendation.direction),
			symbol: vesper.recommendation.direction === "hold" ? null : vTop?.symbol ?? null,
			conviction: vesper.recommendation.confidence,
			sizePct: 0
		};
		if (p.id === "ash") return {
			id: p.id,
			thesis: aTop?.thesis || "Nothing I will fade yet.",
			vote: toVote(ash.recommendation.direction),
			symbol: ash.recommendation.direction === "hold" ? null : aTop?.symbol ?? null,
			conviction: ash.recommendation.confidence,
			sizePct: 0
		};
		if (p.id === "kai") {
			const blocked = !k || k.status === "blocked";
			return {
				id: p.id,
				thesis: k?.reason || "No name this round.",
				vote: blocked ? "hold" : k.side,
				symbol: k?.symbol ?? null,
				conviction: kai.recommendation.confidence,
				sizePct: 0
			};
		}
		if (p.id === "damian") return {
			id: p.id,
			thesis: damian.summary,
			vote: "hold",
			symbol: null,
			conviction: damian.confidence,
			sizePct: 0
		};
		return {
			id: p.id,
			thesis: iris.reason,
			vote: iris.decision === "approve" || iris.decision === "reduce" ? iris.side ?? "hold" : "hold",
			symbol: iris.symbol,
			conviction: iris.decision === "approve" ? .72 : iris.decision === "reduce" ? .58 : .45,
			sizePct: iris.risk.finalSizePct ?? 0
		};
	});
}
function sentimentOf(damian) {
	return {
		summary: damian.summary,
		sectors: damian.sectors.map((s) => ({
			id: s.id,
			stance: s.stance,
			why: s.why
		}))
	};
}
function moodOf(damian, iris, order) {
	if (iris.decision === "reject" && damian.regime === "risk_off") return "risk-off";
	if (order) return "risk-on";
	if (damian.regime === "risk_on") return "risk-on";
	if (damian.regime === "risk_off") return "risk-off";
	return "cautious";
}
function isFlattening(pos, side) {
	return Boolean(pos && side && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && side === "sell" || pos.qty < 0 && side === "buy"));
}
function buildOrder(snap, decision, iris, locale) {
	if (!decision.symbol || !decision.side) return null;
	if (iris.decision !== "approve" && iris.decision !== "reduce") return null;
	const t = snap.tickers.find((x) => x.symbol === decision.symbol);
	if (!t) return null;
	const pos = snap.book.positions.find((p) => p.symbol === decision.symbol);
	const flattening = isFlattening(pos, decision.side);
	const cut = Boolean(decision.cut && pos);
	if (teamBlocks(snap.book.positions, decision.symbol)) return null;
	if (hasBlockingRestingLimit(snap, {
		cut,
		symbol: decision.symbol,
		side: decision.side
	})) return null;
	if (cut && pos) return {
		side: decision.side,
		symbol: decision.symbol,
		qty: Math.abs(pos.qty),
		rationale: iris.reason
	};
	if (flattening && pos) return {
		side: decision.side,
		symbol: decision.symbol,
		qty: Math.abs(pos.qty),
		rationale: iris.reason
	};
	if (decision.cut) return null;
	if (!decision.gate.passed || decision.band === "reject" || decision.band === "wait") return null;
	const openCount = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8 && !p.teamLock).length;
	if (!Boolean(pos && Math.abs(pos.qty) > 1e-8 && (pos.qty > 0 && decision.side === "buy" || pos.qty < 0 && decision.side === "sell")) && openCount >= HARD.MAX_OPEN_LEGS) return null;
	const cashPct = 100 * snap.book.cash / Math.max(snap.book.equity, 1);
	if (snap.book.dayPnlPct < -2.4 || cashPct < 18) return null;
	const irisPct = iris.risk.finalSizePct ?? 0;
	const enginePct = decision.risk.sizePct ?? 0;
	const sizePct = Math.min(irisPct, enginePct, 6);
	if (!(sizePct > 0)) return null;
	const px = markOf(t);
	const qty = qtyForClip(snap.book.equity, sizePct, px, decision.symbol);
	if (!(qty > 0)) return null;
	const actual = clipPctOf(qty, px, snap.book.equity);
	return {
		side: decision.side,
		symbol: decision.symbol,
		qty,
		limitPx: decision.entry.price && decision.entry.price > 0 ? Number(decision.entry.price.toFixed(4)) : void 0,
		rationale: `${iris.reason} ${L$1(locale, `Iris ${actual.toFixed(1)}% of equity.`, `Iris ${actual.toFixed(1)}% kapitału.`)}`
	};
}
function sourcesOf(vesper, ash, kai, damian, iris) {
	return {
		vesper: vesper.source,
		ash: ash.source,
		kai: kai.source,
		damian: damian.source,
		iris: iris.source
	};
}
function validateAndFinalize(input) {
	const { snap, locale, vesper, ash, kai, damian, iris, decision } = input;
	const agents = mapAgents(vesper, ash, kai, damian, iris);
	let order = buildOrder(snap, decision, iris, locale);
	if (order && order.side !== decision.side) order = null;
	if (order && order.symbol !== decision.symbol) order = null;
	order = gateCouncilOrder(order, agents, snap);
	const src = sourcesOf(vesper, ash, kai, damian, iris);
	const mode = Object.values(src).filter((s) => s === "llm").length === 5 ? "online" : "degraded";
	const summary = order ? L$1(locale, `${order.limitPx ? "Limit" : "Ticket"} on ${order.side.toUpperCase()} ${order.symbol}. Score ${decision.finalScore.toFixed(0)} (${decision.band}).`, `${order.limitPx ? "Limit" : "Zlecenie"} ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}. Wynik ${decision.finalScore.toFixed(0)} (${decision.band}).`) : iris.reason.slice(0, 200) || L$1(locale, "No ticket this round. Stay in cash.", "Brak biletu w tej rundzie. Zostajemy w gotówce.");
	return {
		mood: moodOf(damian, iris, order),
		summary,
		agents,
		order,
		sentiment: sentimentOf(damian),
		agreement: decision.agreement,
		finalScore: decision.finalScore,
		band: decision.band,
		decisionId: decision.decisionId,
		engineVersion: "2.2",
		status: {
			mode,
			sources: src
		}
	};
}
var VESPER_KNOWLEDGE = [
	"momentum",
	"trend-following",
	"breakouts",
	"relative-strength",
	"volume-expansion",
	"volatility-expansion",
	"market-structure",
	"failed-breakouts",
	"multi-timeframe"
];
var ASH_KNOWLEDGE = [
	"mean-reversion",
	"overextension",
	"vwap",
	"bollinger",
	"rsi-extremes",
	"failed-breakouts",
	"liquidity-sweeps",
	"exhaustion",
	"range-markets"
];
var KAI_KNOWLEDGE = [
	"fair-value-gaps",
	"pullbacks",
	"liquidity",
	"market-structure",
	"session-behavior",
	"entries",
	"invalidation",
	"risk-reward",
	"chase-detection"
];
var DAMIAN_KNOWLEDGE = [
	"macro-regimes",
	"risk-on-risk-off",
	"monetary-policy",
	"dollar",
	"rates",
	"volatility",
	"crypto-liquidity",
	"commodities",
	"equities",
	"news-impact"
];
var VESPER_SYSTEM = `You are VESPER, the Momentum and Trend Specialist of ZiggyWizzAir.

MISSION

Your only job is to identify high-quality momentum and trend-continuation opportunities.

You are NOT a portfolio manager.
You are NOT a macro analyst.
You are NOT responsible for position sizing.
You are NOT responsible for execution.

You must independently analyze the market before seeing any other agent's opinion.

CORE PRINCIPLES

1. Follow evidence, not narrative.
2. Momentum must be supported by price behavior and volume.
3. Prefer continuation over prediction.
4. Distinguish genuine expansion from late-stage chasing.
5. Do not confuse high RSI with automatic bearishness.
6. Do not assume that a strong move must reverse.
7. Do not invent market data.
8. If the data does not support a trade, return HOLD.
9. You must explicitly identify what would invalidate your thesis.
10. Your score represents setup quality, not probability of profit.

TIMEFRAMES

Primary:
- 15m

Confirmation:
- 1h
- 4h

Do not use 1m data for decision making.

ANALYSIS

Evaluate:

- directional price change
- distance from SMA20
- RSI regime
- relative volume
- ATR expansion
- market structure
- breakout quality
- higher-timeframe alignment
- signs of exhaustion

PREFER

- expanding volume
- clean directional movement
- higher highs / higher lows for longs
- lower highs / lower lows for shorts
- 15m and 1h alignment
- breakout with confirmation
- continuation after controlled consolidation

AVOID

- low volume
- late breakout
- extreme extension without continuation
- contradictory higher timeframe structure
- random sideways movement

IMPORTANT

The field math.long / math.short is the official score. Do not invent a different score.
You interpret. Code calculates.

You must never say:
"the market will rise."

Instead say:
"the current evidence supports a bullish momentum setup."

OUTPUT ONLY VALID JSON.
{"ideas":[{"symbol":"BTC","side":"buy","setup":"momentum_continuation","confidence":0.84,"evidence":[{"metric":"changePct","timeframe":"15m","value":1.42}],"invalidation":{"type":"structure","price":111920},"thesis":"..."}],"marketView":"bullish","noTradeReason":null,"knowledgeUsed":["momentum"]}`;
var ASH_SYSTEM = `You are ASH, the Mean Reversion Specialist of ZiggyWizzAir.

MISSION

Find statistically and structurally credible mean-reversion opportunities.

You are not here to oppose Vesper.
You are not here to predict every reversal.

Your job is to identify situations where price appears excessively displaced
from a meaningful reference and where evidence of normalization exists.

CORE PRINCIPLES

1. Strong trends can remain overextended longer than expected.
2. Extreme RSI alone is never sufficient.
3. Distance from mean must be evaluated together with structure and volatility.
4. A failed breakout is stronger evidence than an extreme indicator alone.
5. Avoid fading strong momentum without exhaustion evidence.
6. Prefer asymmetric mean-reversion setups.
7. Never invent technical values.
8. HOLD is a valid and often preferable outcome.

ANALYZE

- RSI extremes
- distance from SMA20
- VWAP deviation
- ATR extension
- failed breakouts
- liquidity sweeps
- wick rejection
- volume exhaustion
- range conditions
- higher-timeframe trend

LONG REVERSION

Look for:
- excessive downside extension
- failed breakdown
- rejection
- stabilization
- return toward mean

SHORT REVERSION

Look for:
- excessive upside extension
- failed breakout
- rejection
- stabilization
- return toward mean

DO NOT FADE:

- strong expansion with increasing RVOL
- clean higher-timeframe trend continuation
- confirmed breakout with no exhaustion

The field math.fadeLong / math.fadeShort is the official score. Do not invent a different score.
You interpret. Code calculates.

OUTPUT ONLY VALID JSON.
{"ideas":[{"symbol":"ETH","side":"sell","setup":"overextension_reversion","confidence":0.79,"targetType":"mean","evidence":[{"metric":"vsSma","timeframe":"15m","value":2.4}],"invalidation":{"type":"continuation","price":4210},"thesis":"..."}],"marketView":"reversion_short","knowledgeUsed":["overextension"]}`;
var KAI_SYSTEM = `You are KAI, the Setup and Entry Specialist of ZiggyWizzAir.

MISSION

Determine whether a proposed directional idea has a technically valid
entry location.

You do not decide the portfolio direction.
You do not size positions.
You do not override the macro regime.

Your responsibility is ENTRY QUALITY.

TIMEFRAMES

Primary:
15m

Context:
1h
4h

Never use 1m for setup validation.

VALID SETUPS

1. Higher-timeframe FVG
2. 15m pullback
3. Liquidity sweep and reclaim
4. Structural retest
5. Confluence of multiple setup elements

PULLBACK

A 15m retracement between approximately 18% and 62% is considered
potentially actionable when structure remains valid.

FVG

Prefer:
4h > 1h > 15m

An FVG is stronger when:
- aligned with directional structure
- price is approaching rather than already far beyond it
- volume is not dead
- invalidation is clear

CHASE

Reject the entry when:
- price is near the extreme end of the current range
- the move has already consumed most of the expected expansion
- entry produces poor reward/risk

THIN MARKET

If RVOL < 0.55:
status = "blocked"

IMPORTANT

You are not allowed to change BUY into SELL simply because entry quality is poor.

If direction is valid but entry is not ready:
return WAIT.

SCAN independently for the best 1–3 setups on the board. Do not wait for another agent.

OUTPUT ONLY VALID JSON.
{"symbol":"BTC","side":"buy","status":"ready","setup":{"type":"1h_fvg_pullback","timeframe":"1h","fvg":{"low":112700,"high":112980},"retracementPct":31},"entry":{"type":"limit","price":112850},"invalidation":111920,"target":115600,"rr":3.08,"qualityScore":91,"evidence":["1h FVG","31% retracement"],"reason":"...","scan":[{"symbol":"BTC","side":"buy","status":"ready","qualityScore":91,"rr":3.08}]}`;
var DAMIAN_SYSTEM = `You are DAMIAN, the Macro and Market Regime Specialist of ZiggyWizzAir.

MISSION

Determine the broader market environment and how favorable or hostile
that environment is for each major asset class.

You do NOT select individual trades.

You do NOT vote BUY or SELL on individual tickers.

You classify:

- equities
- crypto
- metals
- dollar
- volatility

CORE QUESTIONS

1. Is the environment risk-on, cautious, or risk-off?
2. Is liquidity supportive or restrictive?
3. What is volatility doing?
4. What is the dollar doing?
5. What are rates doing?
6. Are major macro events approaching?
7. Which asset classes benefit?
8. Which asset classes face headwinds?

NEWS

News is evidence, not truth by itself.

Prioritize:
- central bank decisions
- inflation
- employment
- rates
- geopolitical shocks
- major regulatory decisions
- major market-moving events

Do not convert a headline into a trade automatically.

IMPORTANT

A bearish crypto regime does NOT automatically mean:
"do not trade BTC."

It means:
"BTC trades receive a macro headwind."

Gold, equities, crypto, dollar and volatility must be treated independently.

Always cite daily crypto market cap in $ and % when the snapshot has it.

Sector score is -100 to +100. Code may overwrite the number; you write why.

OUTPUT ONLY VALID JSON.
{"regime":"risk_off","confidence":0.81,"sectors":[{"id":"equities","stance":"bearish","score":-42,"why":"..."},{"id":"crypto","stance":"bearish","score":-61,"why":"..."},{"id":"metals","stance":"bullish","score":34,"why":"..."},{"id":"dollar","stance":"bullish","score":48,"why":"..."},{"id":"vol","stance":"bearish","score":-55,"why":"..."}],"cryptoMarketCap":{"usd":3120000000000,"changePct":-2.4},"macroEvents":[],"summary":"..."}`;
var IRIS_SYSTEM = `You are IRIS, the Portfolio Risk Manager of ZiggyWizzAir.

MISSION

Protect capital.

You are the final risk authority.

You do NOT invent trade direction.
You do NOT override technical evidence.
You do NOT fabricate expected returns.

You receive structured decisions from:

- Vesper
- Ash
- Kai
- Damian

Your job is to determine:

1. APPROVE
2. REDUCE
3. WAIT
4. REJECT

and determine safe position size.

HARD LIMITS (already computed in hardChecks — if a check is false, you MUST reject or wait)

- maximum 2 filled legs
- maximum 1 resting limit order
- maximum 2 adds per day
- round-trip fees must remain <= 5%
- user-owned teamLocked positions must never be modified
- never exceed portfolio exposure limits
- never create a position without a valid entry
- never create a position when required agents disagree on direction
- never increase risk during an active risk lock

POSITION SIZE

Base risk:

Bullish macro:
5.2%

Neutral:
3.2%

Bearish:
2.2%

Then reduce based on:

- open legs
- portfolio exposure
- drawdown
- agent historical performance
- setup quality
- correlation
- liquidity
- disagreement

RISK PRINCIPLE

When uncertain:
reduce size, do not invent certainty.

EXIT RISK

Exiting risk is easier than opening risk.

A reduction may be approved with fewer confirmations than a new position.

TEAM LOCK

If position.teamLock == true:
reject any AI close/add request.

You may write a reason. You may pick APPROVE/REDUCE/WAIT/REJECT.
You may not change other agents' scores, symbols, or facts.
Code owns final size and may override you.

OUTPUT ONLY VALID JSON.
{"decision":"approve","symbol":"BTC","side":"buy","risk":{"finalSizePct":1.85},"reason":"..."}`;
function L(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function nums(t, locale) {
	const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
	const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
	const rvol = t.rvol != null ? t.rvol.toFixed(2) : "—";
	return locale === "pl" ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs średnia 15m ${sma}, obrót ${rvol}` : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 15m mean ${sma}, volume ${rvol}`;
}
function of(snap, symbol) {
	return snap.tickers.find((t) => t.symbol === symbol);
}
function vesperFallback(snap, locale, hash) {
	const ideas = [];
	const ranked = snap.tickers.map((t) => {
		const long = vesperMomentumScore(t, "buy");
		const short = vesperMomentumScore(t, "sell");
		return {
			t,
			side: long >= short ? "buy" : "sell",
			score: Math.max(long, short)
		};
	}).sort((a, b) => b.score - a.score);
	for (const row of ranked) {
		if (row.score < 42) break;
		const t = row.t;
		ideas.push({
			symbol: t.symbol,
			side: row.side,
			score: row.score,
			confidence: Math.min(.9, .4 + row.score / 140),
			setup: "momentum_continuation",
			evidence: [
				{
					metric: "changePct",
					timeframe: "15m",
					value: Number(t.changePct.toFixed(2))
				},
				{
					metric: "rvol",
					timeframe: "15m",
					value: t.rvol ?? 0
				},
				{
					metric: "rsi",
					timeframe: "15m",
					value: Number(t.rsi.toFixed(1))
				}
			],
			invalidation: {
				type: "structure",
				price: t.low || t.price * .992
			},
			thesis: L(locale, `${nums(t, locale)}. Score ${row.score.toFixed(0)} — ${row.score >= 62 ? "expansion I will ride" : "lean, not a full run"}.`, `${nums(t, locale)}. Wynik ${row.score.toFixed(0)} — ${row.score >= 62 ? "ekspansja, którą chcę jechać" : "nachylenie, nie pełny bieg"}.`)
		});
		if (ideas.length >= 3) break;
	}
	const top = ideas[0];
	return {
		agent: "vesper",
		runId: newRunId(),
		timestamp: Date.now(),
		marketStateHash: hash,
		ideas,
		marketView: top ? top.side === "buy" ? "bullish" : "bearish" : "neutral",
		noTradeReason: ideas.length ? null : L(locale, "Nothing clearing a momentum threshold.", "Nic nie przebija progu momentum."),
		recommendation: top ? {
			direction: top.side,
			strength: top.score,
			confidence: top.confidence
		} : {
			direction: "hold",
			strength: 0,
			confidence: .3
		},
		knowledgeUsed: VESPER_KNOWLEDGE.slice(0, 3),
		source: "local"
	};
}
function ashFallback(snap, locale, hash) {
	const ideas = [];
	const ranked = snap.tickers.map((t) => {
		const buy = ashReversionScore(t, "buy");
		const sell = ashReversionScore(t, "sell");
		return {
			t,
			side: buy >= sell ? "buy" : "sell",
			score: Math.max(buy, sell)
		};
	}).sort((a, b) => b.score - a.score);
	for (const row of ranked) {
		if (row.score < 42) break;
		const t = row.t;
		ideas.push({
			symbol: t.symbol,
			side: row.side,
			score: row.score,
			confidence: Math.min(.88, .4 + row.score / 140),
			setup: "overextension_reversion",
			evidence: [{
				metric: "vsSma",
				timeframe: "15m",
				value: Number(t.vsSma.toFixed(2))
			}, {
				metric: "rsi",
				timeframe: "15m",
				value: Number(t.rsi.toFixed(1))
			}],
			targetType: "mean",
			invalidation: {
				type: "continuation",
				price: row.side === "buy" ? t.low : t.high
			},
			thesis: L(locale, `${nums(t, locale)}. Score ${row.score.toFixed(0)} — ${row.side === "buy" ? "wash, one clip" : "stretch, I sell strength"}.`, `${nums(t, locale)}. Wynik ${row.score.toFixed(0)} — ${row.side === "buy" ? "przecena, jeden clip" : "wyciągnięcie, sprzedaję siłę"}.`)
		});
		if (ideas.length >= 3) break;
	}
	const top = ideas[0];
	return {
		agent: "ash",
		runId: newRunId(),
		timestamp: Date.now(),
		marketStateHash: hash,
		ideas,
		marketView: top ? top.side === "sell" ? "reversion_short" : "reversion_long" : "hold",
		recommendation: top ? {
			direction: top.side,
			strength: top.score,
			confidence: top.confidence
		} : {
			direction: "hold",
			strength: 0,
			confidence: .3
		},
		knowledgeUsed: ASH_KNOWLEDGE.slice(0, 3),
		source: "local"
	};
}
function kaiFallback(snap, locale, hash) {
	const scan = kaiScan(snap.tickers, 3).map((row) => {
		const reason = !of(snap, row.symbol) ? "" : row.status === "blocked" ? L(locale, `${row.symbol}: ${row.evidence.join(", ") || "blocked"}.`, `${row.symbol}: ${row.evidence.join(", ") || "zablokowane"}.`) : L(locale, `${row.symbol} ${row.side} on ${row.timeframe ?? "15m"}. ${row.evidence.join(", ")}. RR ${row.rr.toFixed(2)}.`, `${row.symbol} ${row.side === "buy" ? "kupno" : "sprzedaż"} na ${row.timeframe ?? "15m"}. ${row.evidence.join(", ")}. RR ${row.rr.toFixed(2)}.`);
		return {
			...row,
			reason
		};
	});
	const primary = scan[0] ?? null;
	return {
		agent: "kai",
		runId: newRunId(),
		timestamp: Date.now(),
		marketStateHash: hash,
		scan,
		primary,
		recommendation: primary && primary.status !== "blocked" ? {
			direction: primary.side,
			strength: primary.qualityScore,
			confidence: primary.status === "ready" ? .7 : .55
		} : {
			direction: "hold",
			strength: 0,
			confidence: .3
		},
		knowledgeUsed: KAI_KNOWLEDGE.slice(0, 3),
		source: "local"
	};
}
function stanceFromScore(score) {
	if (score >= 18) return "bullish";
	if (score <= -18) return "bearish";
	return "neutral";
}
function damianFallback(snap, locale, hash) {
	const scores = damianSectorScores(snap.macro, snap.tickers);
	const pulse = classifyMacro(snap.macro);
	const cap = snap.macro?.cryptoMcap ?? null;
	const capPct = snap.macro?.cryptoMcapPct ?? null;
	const why = (id, stance) => {
		if (id === "crypto") {
			const head = [cap != null ? cap >= 0xe8d4a51000 ? `$${(cap / 0xe8d4a51000).toFixed(2)}T` : `$${Math.round(cap / 1e9)}B` : null, capPct != null ? `${capPct >= 0 ? "+" : ""}${capPct.toFixed(2)}%` : null].filter(Boolean).join(", ");
			if (stance === "bearish") return L(locale, `${head || "crypto"} — liquidity weaker.`, `${head || "krypto"} — płynność słabsza.`);
			if (stance === "bullish") return L(locale, `${head || "crypto"} — liquidity supportive.`, `${head || "krypto"} — płynność sprzyja.`);
			return L(locale, `${head || "crypto"} — two-way.`, `${head || "krypto"} — w dwie strony.`);
		}
		if (id === "equities") return stance === "bearish" ? L(locale, "Stocks weak or vol jumped.", "Akcje słabe albo skok zmienności.") : stance === "bullish" ? L(locale, "Broad stocks bid, vol not in the way.", "Szeroki rynek w górę, zmienność nie przeszkadza.") : L(locale, "Stocks have no one-way read.", "Akcje bez kierunku.");
		if (id === "metals") return stance === "bullish" ? L(locale, "Softer dollar helps gold and silver.", "Słabszy dolar sprzyja złotu i srebru.") : stance === "bearish" ? L(locale, "Firmer dollar weighs on metals.", "Mocniejszy dolar waży na metalach.") : L(locale, "Metals have no impulse.", "Metale bez impulsu.");
		if (id === "dollar") return stance === "bullish" ? L(locale, "The dollar is firming.", "Dolar się umacnia.") : stance === "bearish" ? L(locale, "The dollar is softening.", "Dolar słabnie.") : L(locale, "Dollar is flat.", "Dolar płaski.");
		return stance === "bearish" ? L(locale, "Vol is expanding.", "Zmienność się rozszerza.") : stance === "bullish" ? L(locale, "Vol is calm — risk is allowed.", "Zmienność spokojna — ryzyko można brać.") : L(locale, "Vol is ordinary.", "Zmienność zwyczajna.");
	};
	const sectors = [
		"equities",
		"crypto",
		"metals",
		"dollar",
		"vol"
	].map((id) => {
		const score = scores[id];
		const stance = stanceFromScore(score);
		return {
			id,
			stance,
			score,
			why: why(id, stance)
		};
	});
	const regime = pulse.vol === "hot" || scores.equities < -25 && scores.crypto < -25 ? "risk_off" : scores.equities > 20 && scores.crypto > 10 ? "risk_on" : "cautious";
	const summary = L(locale, `${regime.replace("_", "-")} — ${sectors.filter((s) => s.stance !== "neutral").map((s) => `${s.id} ${s.stance}`).join(" · ") || "mixed weather"}.`, `${regime === "risk_on" ? "chętni do ryzyka" : regime === "risk_off" ? "risk-off" : "ostrożnie"} — ${sectors.filter((s) => s.stance !== "neutral").map((s) => `${s.id} ${s.stance === "bullish" ? "byczo" : "niedźwiedzio"}`).join(" · ") || "pogoda mieszana"}.`);
	return {
		agent: "damian",
		runId: newRunId(),
		timestamp: Date.now(),
		marketStateHash: hash,
		regime,
		confidence: .55,
		sectors,
		cryptoMarketCap: {
			usd: cap,
			changePct: capPct
		},
		macroEvents: [],
		summary,
		recommendation: {
			direction: "hold",
			strength: 0,
			confidence: .55
		},
		knowledgeUsed: DAMIAN_KNOWLEDGE.slice(0, 3),
		source: "local"
	};
}
function kaiValidate(snap, symbol, side, locale) {
	const t = of(snap, symbol);
	if (!t) return null;
	const row = kaiSetupFor(t, side);
	row.reason = L(locale, `${symbol} ${side} validate: ${row.status} · RR ${row.rr.toFixed(2)} · ${row.evidence.join(", ") || "no setup"}.`, `${symbol} ${side === "buy" ? "kupno" : "sprzedaż"}: ${row.status} · RR ${row.rr.toFixed(2)} · ${row.evidence.join(", ") || "brak setupu"}.`);
	return row;
}
function irisRules(input) {
	const { locale, decision, checks } = input;
	const codeDecision = (() => {
		if (decision.cut) return "approve";
		if (!decision.gate.passed) return decision.band === "wait" ? "wait" : "reject";
		if (decision.band === "reject") return "reject";
		if (decision.band === "wait") return "wait";
		if (decision.band === "small") return "reduce";
		return "approve";
	})();
	return {
		agent: "iris",
		runId: newRunId(),
		timestamp: Date.now(),
		decision: codeDecision,
		symbol: decision.symbol,
		side: decision.side,
		risk: {
			basePct: decision.risk.sizePct,
			macroMultiplier: 1,
			portfolioMultiplier: 1,
			performanceMultiplier: 1,
			disagreementMultiplier: decision.agreement.level === "low" ? .5 : 1,
			finalSizePct: codeDecision === "approve" || codeDecision === "reduce" ? decision.risk.sizePct : 0
		},
		order: codeDecision === "approve" || codeDecision === "reduce" ? {
			type: "limit",
			price: decision.entry.price,
			sizePct: decision.risk.sizePct
		} : null,
		riskReward: {
			stop: decision.risk.stop,
			target: decision.risk.target,
			rr: decision.risk.rr
		},
		checks,
		reason: L(locale, codeDecision === "reject" ? decision.gate.passed ? `Rejected. Score ${decision.finalScore.toFixed(0)} below 45.` : `Rejected. ${decision.gate.reasons.join(" ") || "Hard gate."}` : codeDecision === "wait" ? `Wait. Agreement ${decision.agreement.level}, score ${decision.finalScore.toFixed(0)}.` : `Sized ${decision.risk.sizePct.toFixed(1)}% · score ${decision.finalScore.toFixed(0)} · ${decision.agreement.level} agreement.`, codeDecision === "reject" ? decision.gate.passed ? `Odrzucam. Wynik ${decision.finalScore.toFixed(0)} poniżej 45.` : `Odrzucam. ${decision.gate.reasons.join(" ") || "Twarda bramka."}` : codeDecision === "wait" ? `Czekam. Zgoda ${decision.agreement.level}, wynik ${decision.finalScore.toFixed(0)}.` : `Wielkość ${decision.risk.sizePct.toFixed(1)}% · wynik ${decision.finalScore.toFixed(0)} · zgoda ${decision.agreement.level}.`),
		source: "rules"
	};
}
/** Spec §65 — deterministic V2 path when Grok is down. No lastCouncil. */
function runLocalV2(input) {
	const locale = input.locale === "pl" ? "pl" : "en";
	const snap = input.snap;
	const hash = marketStateHash({
		t: snap.tickers.map((x) => [
			x.symbol,
			x.price,
			x.changePct,
			x.rsi,
			x.vsSma,
			x.rvol
		]),
		b: snap.book,
		m: snap.macro
	});
	const vesper = vesperFallback(snap, locale, hash);
	const ash = ashFallback(snap, locale, hash);
	const kaiScanOut = kaiFallback(snap, locale, hash);
	const damian = damianFallback(snap, locale, hash);
	const cut = stalledCut(snap);
	let decision = decisionEngine({
		vesper,
		ash,
		kai: kaiScanOut,
		damian,
		snap,
		locale,
		cut
	});
	let kai = kaiScanOut;
	if (decision.symbol && decision.side) {
		const validated = kaiValidate(snap, decision.symbol, decision.side, locale);
		if (validated) {
			const scan = [validated, ...kai.scan.filter((s) => s.symbol !== validated.symbol)].slice(0, 3);
			kai = {
				...kai,
				scan,
				primary: validated,
				recommendation: {
					direction: validated.status === "blocked" ? "hold" : validated.side,
					strength: validated.qualityScore,
					confidence: validated.status === "ready" ? .72 : validated.status === "wait" ? .55 : .35
				}
			};
			decision = decisionEngine({
				vesper,
				ash,
				kai,
				damian,
				snap,
				locale,
				validated,
				cut
			});
		}
	}
	const checks = applyRestingLimitGate(irisChecks(snap, decision, kai.primary), snap, kai.primary, decision);
	const iris = irisRules({
		locale,
		decision,
		checks
	});
	return validateAndFinalize({
		snap,
		locale,
		vesper,
		ash,
		kai,
		damian,
		iris,
		decision
	});
}
//#endregion
export { validateIris as A, kaiValidate as C, validateAndFinalize as D, stalledCut as E, validateVesper as M, vesperFallback as N, validateAsh as O, vesperMomentumScore as P, kaiSetupFor as S, runLocalV2 as T, damianSectorScores as _, IRIS_SYSTEM as a, irisRules as b, VESPER_KNOWLEDGE as c, asConfidence as d, asScore as f, damianFallback as g, clipText as h, DAMIAN_SYSTEM as i, validateKai as j, validateDamian as k, VESPER_SYSTEM as l, ashReversionScore as m, ASH_SYSTEM as n, KAI_KNOWLEDGE as o, ashFallback as p, DAMIAN_KNOWLEDGE as r, KAI_SYSTEM as s, ASH_KNOWLEDGE as t, applyRestingLimitGate as u, decisionEngine as v, marketStateHash as w, kaiFallback as x, irisChecks as y };
