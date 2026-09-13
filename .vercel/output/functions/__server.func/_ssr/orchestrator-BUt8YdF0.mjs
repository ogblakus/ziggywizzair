import { A as validateIris, C as kaiValidate, D as validateAndFinalize, E as stalledCut, M as validateVesper, N as vesperFallback, O as validateAsh, P as vesperMomentumScore, S as kaiSetupFor, _ as damianSectorScores, a as IRIS_SYSTEM, b as irisRules, c as VESPER_KNOWLEDGE, d as asConfidence, f as asScore, g as damianFallback, h as clipText, i as DAMIAN_SYSTEM, j as validateKai, k as validateDamian, l as VESPER_SYSTEM, m as ashReversionScore, n as ASH_SYSTEM, o as KAI_KNOWLEDGE, p as ashFallback, r as DAMIAN_KNOWLEDGE, s as KAI_SYSTEM, t as ASH_KNOWLEDGE, u as applyRestingLimitGate, v as decisionEngine, w as marketStateHash, x as kaiFallback, y as irisChecks } from "./local-v2-PvgmS_Qo.mjs";
import { $t as union, Jt as number, Qt as string, Ut as array, Vt as _enum, Yt as object } from "../_libs/@better-auth/core+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orchestrator-BUt8YdF0.js
function extractJson(text) {
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("No JSON in model output");
	return JSON.parse(text.slice(start, end + 1));
}
function langBlock(locale, kind) {
	if (locale === "pl") return kind === "council" ? "JĘZYK OBOWIĄZKOWY: tezy, podsumowania i pola why pisz PO POLSKU, prostym językiem. Tickerów (META, BTC) nie tłumacz. Zakazany żargon: tape, wire, floor, probe, fills, heurystyki, quorum, lastCouncil, livePx, RSI, SMA20 — zamiast tego: notowania, wiadomości, rada, mała pozycja, transakcje, portfel, cena na żywo, średnia. Damian NIE głosuje na spółkę. Nie mów VIX/DXY — mów zmienność i dolar." : "JĘZYK OBOWIĄZKOWY: pole text w CAŁOŚCI PO POLSKU. Mów jak starszy kolega z biurka, nie jak terminal i nie jak czatbot. Dwa akapity, nie więcej. Żadnego zdania-hasła w osobnej linijce. Jeśli P&L koło zera: „praktycznie na zero”, nigdy „+0,0%”. Tickerów nie tłumacz. Zakazany żargon (tape, clip, rvol, RSI, SMA, livePx, quorum). Wolno jedną cenę albo jeden procent jako kolor. Zero angielskich sloganów.";
	return "LANGUAGE: English. Keep ticker symbols as-is.";
}
async function agentChat(system, user, maxTokens, opts) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("AI is not available in this environment");
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		signal: AbortSignal.timeout(opts?.timeoutMs ?? 12e3),
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: opts?.temperature ?? .35,
			max_tokens: maxTokens,
			response_format: { type: "json_object" },
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		})
	});
	if (!res.ok) throw new Error(`xAI API error ${res.status}`);
	return (await res.json()).choices?.[0]?.message?.content ?? "";
}
function hasXaiKey() {
	return Boolean(process.env.XAI_API_KEY);
}
var Side = _enum(["buy", "sell"]);
var Direction = _enum([
	"buy",
	"sell",
	"hold"
]);
var Tf = _enum([
	"15m",
	"1h",
	"4h"
]);
var EvidenceSchema = object({
	metric: string(),
	timeframe: string().optional(),
	value: union([number(), string()])
});
var InvalidationSchema = object({
	type: string(),
	price: number().nullable().optional()
});
var RecommendationSchema = object({
	direction: Direction,
	strength: number(),
	confidence: number()
});
var VesperIdeaSchema = object({
	symbol: string(),
	side: Side,
	score: number().optional(),
	confidence: number().optional(),
	setup: string().optional(),
	evidence: array(EvidenceSchema).optional(),
	invalidation: InvalidationSchema.optional(),
	thesis: string().optional()
});
var VesperLlmSchema = object({
	agent: string().optional(),
	ideas: array(VesperIdeaSchema).optional(),
	marketView: _enum([
		"bullish",
		"bearish",
		"neutral"
	]).optional(),
	noTradeReason: string().nullable().optional(),
	recommendation: RecommendationSchema.optional(),
	knowledgeUsed: array(string()).optional()
});
var AshIdeaSchema = object({
	symbol: string(),
	side: Side,
	score: number().optional(),
	confidence: number().optional(),
	setup: string().optional(),
	evidence: array(EvidenceSchema).optional(),
	targetType: string().optional(),
	invalidation: InvalidationSchema.optional(),
	thesis: string().optional()
});
var AshLlmSchema = object({
	agent: string().optional(),
	ideas: array(AshIdeaSchema).optional(),
	marketView: string().optional(),
	recommendation: RecommendationSchema.optional(),
	knowledgeUsed: array(string()).optional()
});
var KaiLlmSchema = object({
	agent: string().optional(),
	symbol: string().optional(),
	side: Side.optional(),
	status: _enum([
		"ready",
		"wait",
		"blocked",
		"READY",
		"WAIT",
		"BLOCKED"
	]).optional(),
	setup: object({
		type: string().optional(),
		timeframe: Tf.optional(),
		fvg: object({
			low: number().optional(),
			high: number().optional()
		}).optional(),
		retracementPct: number().optional()
	}).optional(),
	entry: object({
		type: _enum(["limit", "market"]).optional(),
		price: number().optional()
	}).optional(),
	invalidation: number().optional(),
	target: number().optional(),
	rr: number().optional(),
	qualityScore: number().optional(),
	evidence: array(string()).optional(),
	reason: string().optional(),
	scan: array(object({
		symbol: string(),
		side: Side,
		status: _enum([
			"ready",
			"wait",
			"blocked"
		]).optional(),
		qualityScore: number().optional(),
		rr: number().optional()
	})).optional(),
	recommendation: RecommendationSchema.optional(),
	knowledgeUsed: array(string()).optional()
});
var DamianLlmSchema = object({
	agent: string().optional(),
	regime: _enum([
		"risk_on",
		"cautious",
		"risk_off",
		"risk-on",
		"risk-off"
	]).optional(),
	confidence: number().optional(),
	sectors: array(object({
		id: _enum([
			"equities",
			"crypto",
			"metals",
			"dollar",
			"vol"
		]),
		stance: _enum([
			"bullish",
			"bearish",
			"neutral"
		]),
		score: number().optional(),
		why: string().optional()
	})).optional(),
	cryptoMarketCap: object({
		usd: number().nullable().optional(),
		changePct: number().nullable().optional()
	}).optional(),
	macroEvents: array(string()).optional(),
	summary: string().optional(),
	recommendation: RecommendationSchema.optional(),
	knowledgeUsed: array(string()).optional()
});
var IrisLlmSchema = object({
	agent: string().optional(),
	decision: _enum([
		"approve",
		"reduce",
		"wait",
		"reject"
	]).optional(),
	symbol: string().nullable().optional(),
	side: Side.nullable().optional(),
	risk: object({
		basePct: number().optional(),
		macroMultiplier: number().optional(),
		portfolioMultiplier: number().optional(),
		performanceMultiplier: number().optional(),
		finalSizePct: number().optional()
	}).optional(),
	order: object({
		type: _enum(["limit", "market"]).optional(),
		price: number().nullable().optional(),
		sizePct: number().optional()
	}).nullable().optional(),
	reason: string().optional()
});
function n(v, d = 2) {
	if (v == null || !Number.isFinite(v)) return null;
	return Number(v.toFixed(d));
}
function tickerCore(t) {
	return {
		symbol: t.symbol,
		price: n(t.price, 4) ?? 0,
		livePx: n(t.livePx, 4),
		changePct: n(t.changePct) ?? 0,
		rsi: n(t.rsi, 1) ?? 0,
		vsSma: n(t.vsSma) ?? 0,
		rvol: n(t.rvol)
	};
}
/** Vesper — 15m momentum + 1h/4h confirmation. No book, no news, no other agents. */
function vesperSnapshot(snap, lookingAt) {
	return {
		lookingAt,
		note: "15m primary. 1h/4h confirmation. Do not use 1m.",
		tickers: snap.tickers.slice(0, 12).map((t) => ({
			...tickerCore(t),
			buySetup: t.buySetup ?? "none",
			sellSetup: t.sellSetup ?? "none",
			buyRetrace: t.buyRetrace ?? null,
			sellRetrace: t.sellRetrace ?? null,
			buyTf: t.buyTf ?? null,
			sellTf: t.sellTf ?? null,
			buyWick: Boolean(t.buyWick),
			sellWick: Boolean(t.sellWick),
			math: {
				long: Number(vesperMomentumScore(t, "buy").toFixed(1)),
				short: Number(vesperMomentumScore(t, "sell").toFixed(1))
			}
		}))
	};
}
/** Ash — displacement from mean. Independent of Vesper. */
function ashSnapshot(snap, lookingAt) {
	return {
		lookingAt,
		note: "Mean reversion. Do not fade clean expansion with rising RVOL.",
		tickers: snap.tickers.slice(0, 12).map((t) => ({
			...tickerCore(t),
			buyWick: Boolean(t.buyWick),
			sellWick: Boolean(t.sellWick),
			buySetup: t.buySetup ?? "none",
			sellSetup: t.sellSetup ?? "none",
			math: {
				fadeLong: Number(ashReversionScore(t, "buy").toFixed(1)),
				fadeShort: Number(ashReversionScore(t, "sell").toFixed(1))
			}
		}))
	};
}
/** Kai — entry quality only. 15m/1h/4h setups. No RSI-as-direction. */
function kaiSnapshot(snap, lookingAt) {
	return {
		lookingAt,
		note: "Entry quality. Never use 1m. Do not flip BUY to SELL because entry is poor — return WAIT.",
		tickers: snap.tickers.slice(0, 12).map((t) => ({
			symbol: t.symbol,
			price: n(t.livePx ?? t.price, 4) ?? 0,
			rvol: n(t.rvol),
			session: t.session ?? null,
			buy: {
				setup: t.buySetup ?? "none",
				limit: n(t.buyLimit, 4),
				retrace: t.buyRetrace ?? null,
				fvg: t.buyFvg ? {
					low: n(t.buyFvg.low, 4),
					high: n(t.buyFvg.high, 4)
				} : null,
				wick: Boolean(t.buyWick),
				tf: t.buyTf ?? null
			},
			sell: {
				setup: t.sellSetup ?? "none",
				limit: n(t.sellLimit, 4),
				retrace: t.sellRetrace ?? null,
				fvg: t.sellFvg ? {
					low: n(t.sellFvg.low, 4),
					high: n(t.sellFvg.high, 4)
				} : null,
				wick: Boolean(t.sellWick),
				tf: t.sellTf ?? null
			}
		}))
	};
}
/** Damian — macro and news only. No RSI, no ticker vote. */
function damianSnapshot(snap) {
	const spy = snap.tickers.find((t) => t.symbol === "SPY");
	const btc = snap.tickers.find((t) => t.symbol === "BTC");
	const eth = snap.tickers.find((t) => t.symbol === "ETH");
	const gold = snap.tickers.find((t) => t.symbol === "GOLD");
	return {
		note: "You do NOT vote BUY/SELL on a ticker. Classify asset-class weather.",
		macro: snap.macro ? {
			vix: snap.macro.vix,
			vixChg: snap.macro.vixChg,
			dxy: snap.macro.dxy,
			dxyChg: snap.macro.dxyChg,
			cryptoMcap: snap.macro.cryptoMcap,
			cryptoMcapPct: snap.macro.cryptoMcapPct,
			equityPct: snap.macro.equityPct
		} : null,
		prints: {
			spy: spy ? n(spy.changePct) : null,
			btc: btc ? n(btc.changePct) : null,
			eth: eth ? n(eth.changePct) : null,
			gold: gold ? n(gold.changePct) : null
		},
		news: (snap.headlines ?? []).slice(0, 6).map((h) => ({
			text: h.text.slice(0, 180),
			symbol: h.symbol ?? null
		}))
	};
}
/** Iris — structured agent results + book. Cannot change other agents' facts. */
function irisSnapshot(input) {
	return {
		note: "You do NOT invent direction. APPROVE / REDUCE / WAIT / REJECT. Code owns size and hard limits.",
		book: {
			cash: Math.round(input.book.cash),
			equity: Math.round(input.book.equity),
			dayPnlPct: n(input.book.dayPnlPct) ?? 0,
			positions: input.book.positions.slice(0, 16).map((p) => ({
				symbol: p.symbol,
				qty: n(p.qty, 4) ?? 0,
				pnlPct: n(p.pnlPct) ?? 0,
				teamLock: Boolean(p.teamLock)
			})),
			working: input.book.working ? {
				symbol: input.book.working.symbol,
				side: input.book.working.side,
				limitPx: input.book.working.limitPx ?? null
			} : null
		},
		scorecard: (input.scorecard ?? []).slice(0, 8),
		decision: input.decision,
		contributors: input.contributors,
		agreement: input.agreement,
		hardChecks: input.checks
	};
}
function tooBig(payload, max = 18e3) {
	try {
		return JSON.stringify(payload).length > max;
	} catch {
		return true;
	}
}
var MAX_TOKENS = 420;
function nums(t, locale) {
	const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
	const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
	const rvol = t.rvol != null ? t.rvol.toFixed(2) : "—";
	return locale === "pl" ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs średnia 15m ${sma}, obrót ${rvol}` : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 15m mean ${sma}, volume ${rvol}`;
}
async function llmJson(system, user, locale) {
	if (!hasXaiKey()) throw new Error("no-key");
	if (tooBig(user)) throw new Error("payload");
	return extractJson(await agentChat(`${langBlock(locale, "council")}\n\n${system}`, JSON.stringify(user), MAX_TOKENS, {
		timeoutMs: 6500,
		temperature: .35
	}));
}
function of(snap, symbol) {
	return snap.tickers.find((t) => t.symbol === symbol);
}
async function runVesper(snap, lookingAt, locale, hash) {
	const local = vesperFallback(snap, locale, hash);
	try {
		const parsed = VesperLlmSchema.parse(await llmJson(VESPER_SYSTEM, vesperSnapshot(snap, lookingAt), locale));
		const ideas = (parsed.ideas ?? []).map((idea) => {
			const t = of(snap, idea.symbol);
			const math = t ? vesperMomentumScore(t, idea.side) : 0;
			return {
				symbol: idea.symbol,
				side: idea.side,
				score: math,
				confidence: asConfidence(idea.confidence, math / 100),
				setup: clipText(idea.setup, 40) || "momentum_continuation",
				evidence: (idea.evidence ?? []).slice(0, 6).map((e) => ({
					metric: e.metric,
					timeframe: e.timeframe,
					value: e.value
				})),
				invalidation: {
					type: idea.invalidation?.type ?? "structure",
					price: idea.invalidation?.price ?? t?.low ?? null
				},
				thesis: clipText(idea.thesis, 280) || (t ? nums(t, locale) : idea.symbol)
			};
		});
		const merged = ideas.length ? ideas : local.ideas;
		return validateVesper({
			...local,
			ideas: merged,
			marketView: parsed.marketView ?? local.marketView,
			noTradeReason: clipText(parsed.noTradeReason, 180) || local.noTradeReason,
			knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : VESPER_KNOWLEDGE.slice(0, 3),
			source: "llm"
		}, snap);
	} catch {
		return local;
	}
}
async function runAsh(snap, lookingAt, locale, hash) {
	const local = ashFallback(snap, locale, hash);
	try {
		const parsed = AshLlmSchema.parse(await llmJson(ASH_SYSTEM, ashSnapshot(snap, lookingAt), locale));
		const ideas = (parsed.ideas ?? []).map((idea) => {
			const t = of(snap, idea.symbol);
			const math = t ? ashReversionScore(t, idea.side) : 0;
			return {
				symbol: idea.symbol,
				side: idea.side,
				score: math,
				confidence: asConfidence(idea.confidence, math / 100),
				setup: clipText(idea.setup, 40) || "overextension_reversion",
				evidence: (idea.evidence ?? []).slice(0, 6).map((e) => ({
					metric: e.metric,
					timeframe: e.timeframe,
					value: e.value
				})),
				targetType: clipText(idea.targetType, 20) || "mean",
				invalidation: {
					type: idea.invalidation?.type ?? "continuation",
					price: idea.invalidation?.price ?? null
				},
				thesis: clipText(idea.thesis, 280) || (t ? nums(t, locale) : idea.symbol)
			};
		});
		return validateAsh({
			...local,
			ideas: ideas.length ? ideas : local.ideas,
			marketView: clipText(parsed.marketView, 40) || local.marketView,
			knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : ASH_KNOWLEDGE.slice(0, 3),
			source: "llm"
		}, snap);
	} catch {
		return local;
	}
}
async function runKai(snap, lookingAt, locale, hash) {
	const local = kaiFallback(snap, locale, hash);
	try {
		const parsed = KaiLlmSchema.parse(await llmJson(KAI_SYSTEM, kaiSnapshot(snap, lookingAt), locale));
		const scanFromLlm = [];
		if (parsed.symbol && parsed.side) {
			const t = of(snap, parsed.symbol);
			if (t) {
				const math = kaiSetupFor(t, parsed.side);
				const statusRaw = (parsed.status ?? math.status).toString().toLowerCase();
				const status = statusRaw === "ready" || statusRaw === "wait" ? statusRaw : "blocked";
				scanFromLlm.push({
					...math,
					status: math.status === "blocked" ? "blocked" : status,
					reason: clipText(parsed.reason, 280) || math.reason,
					evidence: parsed.evidence?.length ? parsed.evidence.slice(0, 6) : math.evidence
				});
			}
		}
		for (const row of parsed.scan ?? []) {
			if (scanFromLlm.some((s) => s.symbol === row.symbol)) continue;
			const t = of(snap, row.symbol);
			if (!t) continue;
			const math = kaiSetupFor(t, row.side);
			scanFromLlm.push({
				...math,
				reason: math.reason
			});
		}
		const scan = scanFromLlm.length ? scanFromLlm : local.scan;
		return validateKai({
			...local,
			scan,
			primary: scan[0] ?? null,
			knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : KAI_KNOWLEDGE.slice(0, 3),
			source: "llm"
		}, snap);
	} catch {
		return local;
	}
}
async function runDamian(snap, locale, hash) {
	const local = damianFallback(snap, locale, hash);
	try {
		const parsed = DamianLlmSchema.parse(await llmJson(DAMIAN_SYSTEM, damianSnapshot(snap), locale));
		const math = damianSectorScores(snap.macro, snap.tickers);
		const byId = new Map((parsed.sectors ?? []).map((s) => [s.id, s]));
		const sectors = local.sectors.map((row) => {
			const llm = byId.get(row.id);
			return {
				id: row.id,
				stance: llm?.stance ?? row.stance,
				score: math[row.id],
				why: clipText(llm?.why, 80) || row.why
			};
		});
		const regimeRaw = parsed.regime?.replace("-", "_");
		const regime = regimeRaw === "risk_on" || regimeRaw === "risk_off" || regimeRaw === "cautious" ? regimeRaw : local.regime;
		return validateDamian({
			...local,
			regime,
			confidence: asConfidence(parsed.confidence, local.confidence),
			sectors,
			cryptoMarketCap: {
				usd: parsed.cryptoMarketCap?.usd ?? local.cryptoMarketCap.usd,
				changePct: parsed.cryptoMarketCap?.changePct ?? local.cryptoMarketCap.changePct
			},
			macroEvents: (parsed.macroEvents ?? []).slice(0, 4).map((e) => clipText(e, 80)),
			summary: clipText(parsed.summary, 220) || local.summary,
			knowledgeUsed: parsed.knowledgeUsed?.length ? parsed.knowledgeUsed.slice(0, 6) : DAMIAN_KNOWLEDGE.slice(0, 3),
			source: "llm"
		});
	} catch {
		return local;
	}
}
async function runIris(input) {
	const { snap, locale, decision, checks } = input;
	const local = irisRules({
		locale,
		decision,
		checks
	});
	try {
		const parsed = IrisLlmSchema.parse(await llmJson(IRIS_SYSTEM, irisSnapshot({
			locale,
			book: snap.book,
			scorecard: snap.scorecard,
			decision: {
				symbol: decision.symbol,
				side: decision.side,
				band: decision.band,
				finalScore: decision.finalScore,
				cut: decision.cut,
				entry: decision.entry,
				risk: decision.risk
			},
			contributors: decision.contributors,
			agreement: decision.agreement,
			checks
		}), locale));
		let decisionKind = parsed.decision ?? local.decision;
		if (local.decision === "reject" && !decision.cut) decisionKind = "reject";
		if (decisionKind === "approve" && local.decision === "reduce") decisionKind = "reduce";
		const sizeWanted = asScore(parsed.risk?.finalSizePct, decision.risk.sizePct);
		const size = decisionKind === "approve" || decisionKind === "reduce" ? Math.min(decision.risk.sizePct, Math.max(0, sizeWanted)) : 0;
		return validateIris({
			...local,
			decision: decisionKind,
			symbol: parsed.symbol ?? local.symbol,
			side: parsed.side ?? local.side,
			risk: {
				...local.risk,
				finalSizePct: size
			},
			order: decisionKind === "approve" || decisionKind === "reduce" ? {
				type: "limit",
				price: decision.entry.price,
				sizePct: size
			} : null,
			reason: clipText(parsed.reason, 280) || local.reason,
			source: "llm"
		}, snap, checks);
	} catch {
		return local;
	}
}
async function runOrchestrator(input) {
	const locale = input.locale === "pl" ? "pl" : "en";
	const snap = input.snap;
	const lookingAt = input.selected ?? null;
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
	const [vesper, ash, kaiScanOut, damian] = await Promise.all([
		runVesper(snap, lookingAt, locale, hash),
		runAsh(snap, lookingAt, locale, hash),
		runKai(snap, lookingAt, locale, hash),
		runDamian(snap, locale, hash)
	]);
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
	const iris = await runIris({
		snap,
		locale,
		decision,
		checks,
		vesper,
		ash,
		kai,
		damian
	});
	return {
		result: validateAndFinalize({
			snap,
			locale,
			vesper,
			ash,
			kai,
			damian,
			iris,
			decision
		}),
		vesper,
		ash,
		kai,
		damian,
		iris,
		decision
	};
}
//#endregion
export { runOrchestrator as i, extractJson as n, langBlock as r, agentChat as t };
