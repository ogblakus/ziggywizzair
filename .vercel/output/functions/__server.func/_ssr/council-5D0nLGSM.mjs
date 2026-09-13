import { c as gateCouncilOrder, l as markOf, s as clipPctOf, u as qtyForClip } from "./local-council-BdVu5uQG.mjs";
import { t as __exportAll } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/council-5D0nLGSM.js
var council_exports = /* @__PURE__ */ __exportAll({
	askFloor: () => askFloor,
	conveneCouncil: () => conveneCouncil,
	runCouncilSession: () => runCouncilSession
});
var AGENTS = [
	"vesper",
	"ash",
	"kai",
	"damian",
	"iris"
];
function extractJson(text) {
	const start = text.indexOf("{");
	const end = text.lastIndexOf("}");
	if (start < 0 || end <= start) throw new Error("No JSON in model output");
	return JSON.parse(text.slice(start, end + 1));
}
function asVote(v) {
	return v === "buy" || v === "sell" || v === "hold" ? v : "hold";
}
function asMood(v) {
	return v === "risk-on" || v === "risk-off" || v === "cautious" ? v : "cautious";
}
function asStance(v) {
	return v === "bullish" || v === "bearish" || v === "neutral" ? v : "neutral";
}
function parseSentiment(raw) {
	if (!raw || typeof raw !== "object") return null;
	const o = raw;
	const ids = [
		"equities",
		"crypto",
		"metals",
		"dollar",
		"vol"
	];
	const list = Array.isArray(o.sectors) ? o.sectors : [];
	const byId = /* @__PURE__ */ new Map();
	for (const row of list) if (row && typeof row === "object") {
		const r = row;
		if (typeof r.id === "string") byId.set(r.id, r);
	}
	const sectors = ids.map((id) => {
		const r = byId.get(id) ?? {};
		return {
			id,
			stance: asStance(r.stance),
			why: typeof r.why === "string" && r.why.trim() ? r.why.trim().slice(0, 80) : "—"
		};
	});
	return {
		summary: typeof o.summary === "string" && o.summary.trim() ? o.summary.trim().slice(0, 220) : sectors.filter((s) => s.stance !== "neutral").map((s) => `${s.id} ${s.stance}`).join(" · ") || "Mixed.",
		sectors
	};
}
function parseCouncil(raw, snap) {
	const o = raw ?? {};
	const session = o.session ?? o;
	const list = Array.isArray(o.agents) ? o.agents : [];
	const byId = /* @__PURE__ */ new Map();
	for (const row of list) if (row && typeof row === "object") {
		const r = row;
		if (typeof r.id === "string") byId.set(r.id, r);
	}
	const symbols = new Set(snap.tickers.map((t) => t.symbol));
	const sentiment = parseSentiment(o.sentiment) ?? parseSentiment(session.sentiment);
	const agents = AGENTS.map((id) => {
		const r = byId.get(id) ?? {};
		const symbol = typeof r.symbol === "string" && symbols.has(r.symbol) ? r.symbol : null;
		const conviction = Math.min(1, Math.max(0, Number(r.conviction) || 0));
		const sizePct = Math.min(12, Math.max(0, Number(r.sizePct) || 0));
		return {
			id,
			thesis: typeof r.thesis === "string" && r.thesis.trim() ? r.thesis.trim().slice(0, 280) : id === "damian" && sentiment?.summary ? sentiment.summary : "No view this print.",
			vote: id === "damian" ? "hold" : asVote(r.vote),
			symbol: id === "damian" ? null : symbol,
			conviction,
			sizePct: id === "damian" ? 0 : sizePct
		};
	});
	const orderRaw = o.order && typeof o.order === "object" ? o.order : null;
	let order = null;
	if (orderRaw && (orderRaw.side === "buy" || orderRaw.side === "sell")) {
		const symbol = typeof orderRaw.symbol === "string" ? orderRaw.symbol : "";
		const t = snap.tickers.find((x) => x.symbol === symbol);
		const iris = agents.find((a) => a.id === "iris");
		const intended = iris && iris.sizePct > 0 ? iris.sizePct : Number(orderRaw.qty) > 0 ? 3 : 3;
		const px = t ? markOf(t) : 0;
		const qty = t ? qtyForClip(snap.book.equity, intended, px, symbol) : 0;
		if (t && qty > 0) {
			const actual = clipPctOf(qty, px, snap.book.equity);
			const rationale = (typeof orderRaw.rationale === "string" ? orderRaw.rationale.slice(0, 220) : "Chair synthesis.").replace(/(daje|sizes)\s+\d+(?:[.,]\d+)?%/gi, `$1 ${actual.toFixed(1)}%`).replace(/\d+(?:[.,]\d+)?%\s+(na|on)\s+/gi, `${actual.toFixed(1)}% $1 `);
			order = {
				side: orderRaw.side,
				symbol,
				qty,
				rationale,
				limitPx: Number(orderRaw.limitPx) > 0 ? Number(Number(orderRaw.limitPx).toFixed(4)) : void 0
			};
		}
	}
	order = gateCouncilOrder(order, agents, snap);
	return {
		mood: asMood(session.mood ?? o.mood),
		summary: typeof session.summary === "string" ? session.summary.slice(0, 200) : typeof o.summary === "string" ? o.summary.slice(0, 200) : "Council closed without a single view.",
		agents,
		order,
		sentiment
	};
}
async function chat(system, user, maxTokens, opts) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) throw new Error("AI is not available in this environment");
	const json = opts?.json !== false;
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		signal: AbortSignal.timeout(opts?.timeoutMs ?? 8e3),
		body: JSON.stringify({
			model: "grok-4.5",
			temperature: opts?.temperature ?? (json ? .85 : .7),
			max_tokens: maxTokens,
			...json ? { response_format: { type: "json_object" } } : {},
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
function langBlock(locale, kind) {
	if (locale === "pl") return kind === "council" ? "JĘZYK OBOWIĄZKOWY: session.summary, każda teza agenta, sentiment.summary i why sektorów pisz PO POLSKU, prostym językiem. Tickerów (META, BTC) nie tłumacz. Zakazany żargon: tape, wire, floor, probe, fills, heurystyki, quorum, lastCouncil, livePx, RSI, SMA20 — zamiast tego: notowania, wiadomości, rada, mała pozycja, transakcje, portfel, cena na żywo, średnia. Damian NIE głosuje na spółkę. Damian wypełnia sentiment (akcje, krypto, metale, dolar, zmienność): byczo/niedźwiedzio/brak kierunku + krótko czemu. BEZ cytowania nagłówka. Nie mów VIX/DXY — mów zmienność i dolar." : "JĘZYK OBOWIĄZKOWY: pole text w CAŁOŚCI PO POLSKU. Mów jak starszy kolega z biurka, nie jak terminal i nie jak czatbot. Dwa akapity, nie więcej. Żadnego zdania-hasła w osobnej linijce. Jeśli P&L koło zera: „praktycznie na zero”, nigdy „+0,0%”. Tickerów nie tłumacz. Zakazany żargon (tape, clip, rvol, RSI, SMA, livePx, quorum). Wolno jedną cenę albo jeden procent jako kolor. Zero angielskich sloganów.";
	return "LANGUAGE: English. Keep ticker symbols as-is.";
}
function clipText(v, n) {
	return typeof v === "string" ? v.slice(0, n) : "";
}
function compactSnap(snap) {
	return {
		tickers: (snap.tickers ?? []).slice(0, 12).map((t) => ({
			s: t.symbol,
			px: Number(t.price.toFixed(2)),
			livePx: t.livePx != null ? Number(t.livePx.toFixed(4)) : null,
			chg: Number(t.changePct.toFixed(2)),
			rsi: Number(t.rsi.toFixed(1)),
			vsSma: Number(t.vsSma.toFixed(2)),
			buySetup: t.buySetup ?? "none",
			buyLimit: t.buyLimit != null ? Number(t.buyLimit.toFixed(4)) : null,
			buyRetrace: t.buyRetrace ?? null,
			buyFvg: t.buyFvg ? [Number(t.buyFvg.low.toFixed(2)), Number(t.buyFvg.high.toFixed(2))] : null,
			buyWick: t.buyWick ?? false,
			buyTf: t.buyTf ?? null,
			sellSetup: t.sellSetup ?? "none",
			sellLimit: t.sellLimit != null ? Number(t.sellLimit.toFixed(4)) : null,
			sellRetrace: t.sellRetrace ?? null,
			sellFvg: t.sellFvg ? [Number(t.sellFvg.low.toFixed(2)), Number(t.sellFvg.high.toFixed(2))] : null,
			sellWick: t.sellWick ?? false,
			sellTf: t.sellTf ?? null,
			rvol: t.rvol != null ? Number(t.rvol.toFixed(2)) : null,
			session: t.session ?? null
		})),
		book: {
			cash: Math.round(snap.book.cash),
			equity: Math.round(snap.book.equity),
			dayPnlPct: Number(snap.book.dayPnlPct.toFixed(2)),
			positions: (snap.book.positions ?? []).slice(0, 16).map((p) => ({
				s: p.symbol,
				qty: Number(p.qty.toFixed(4)),
				pnlPct: Number((p.pnlPct ?? 0).toFixed(2)),
				lock: Boolean(p.teamLock)
			})),
			working: snap.book.working ? {
				s: snap.book.working.symbol,
				side: snap.book.working.side,
				limitPx: snap.book.working.limitPx ?? null
			} : null
		},
		wire: (snap.headlines ?? []).slice(0, 6).map((h) => ({
			t: clipText(h.text, 160),
			s: h.symbol ?? null
		})),
		macro: snap.macro ? {
			vol: snap.macro.vix,
			volChg: snap.macro.vixChg,
			dollar: snap.macro.dxy,
			dollarChg: snap.macro.dxyChg,
			cryptoMcap: snap.macro.cryptoMcap,
			cryptoMcapPct: snap.macro.cryptoMcapPct,
			stocksPct: snap.macro.equityPct
		} : null,
		scorecard: (snap.scorecard ?? []).slice(0, 12)
	};
}
function tooBig(payload) {
	try {
		return JSON.stringify(payload).length > 24e3;
	} catch {
		return true;
	}
}
async function runCouncilSession(data) {
	try {
		const snap = data.snap;
		const last = data.last;
		const locale = data.locale === "pl" ? "pl" : "en";
		const compact = {
			lookingAt: data.selected ?? null,
			...compactSnap(snap),
			lastSession: last ? {
				summary: clipText(last.summary, 240),
				mood: last.mood,
				order: last.order ? {
					side: last.order.side,
					symbol: last.order.symbol,
					rationale: clipText(last.order.rationale, 180)
				} : null,
				votes: (last.agents ?? []).slice(0, 6).map((a) => ({
					id: a.id,
					vote: a.vote,
					symbol: a.symbol
				})),
				damianSaid: clipText(last.sentiment?.summary ?? last.agents.find((a) => a.id === "damian")?.thesis, 180) || null
			} : null
		};
		if (tooBig(compact)) return {
			ok: false,
			error: "Council payload too large."
		};
		return {
			ok: true,
			result: parseCouncil(extractJson(await chat(`${langBlock(locale, "council")}

You chair ZiggyWizzAir, a five-agent paper desk. The market tab chart is Hyperliquid 1m for the trader's eye. Agents NEVER analyse 1m — that is noise.
Agents (do NOT write job titles like scout, executor, chain, zwiadowca, egzekutor, pieczęć, last in the chain — those are fixed):
- vesper: momentum. Cite changePct, RSI 15m, vsSma 15m, rvol 15m. Rank 1–3 names with a 0–100 score (lean ≥42, act ≥62). No hard AND of thresholds. Cuts stalls.
- ash: mean reversion. Cite vsSma 15m, RSI 15m, changePct. Rank 1–3 fades (wash longs / stretch shorts) with the same score bands. They do not vote Vesper down.
- kai: setup on a name already picked. Reads 15m, 1h, 4h only. Ready = tagging FVG or 15m pullback 18–62% → set limitPx. If direction is good but no tag yet, WAIT-LIMIT (limit a tick into the gap / 0.2% from mark) — do NOT hold. Hard veto only: chase (last 12% of the TF range) or rvol 15m < 0.55. Cite TF, retrace%, FVG, rvol, limit.
- damian: NOT TA. Sector weather only (equities, crypto, metals, dollar, vol). Always cite daily crypto market cap in $ and % (cryptoMcap / cryptoMcapPct). No ticker vote. His weather FILTERS a class (bearish crypto does not silence gold).
- iris: PM. Sizes 2–6% from Damian's weather and open count (0 legs full, 1 leg ~¾, 2 legs no new). HARD RULE: round-trip fees ≤ 5%. Max TWO filled legs plus ONE resting limit. Max TWO adds/day on a pullback. New entries need Vesper or Ash on direction AND Kai ready-or-wait (not a veto). Cite size% and cash%. lock:true on a position = the user owns it — never close or add.
Rules:
- SIZE qty from livePx. Charts on screen are 1m; your numbers are 15m/1h/4h.
- thesis MUST cite TF + numbers (RSI 15m, vs SMA20 15m, rvol 15m, retrace on that TF, FVG high/low). Never role talk.
- Skip dead tape (rvol 15m < 0.55) as a Kai veto, not a silent hold on the whole desk.
- order.limitPx required for new entries (ready or wait). Cuts omit limitPx.
- Never claim a real broker fill.
Return JSON only:
{"session":{"mood":"risk-on"|"cautious"|"risk-off","summary":"one sentence"},
 "agents":[{"id":"vesper"|"ash"|"kai"|"damian"|"iris","thesis":"1-2 sentences","vote":"buy"|"sell"|"hold","symbol":"TICKER"|null,"conviction":0-1,"sizePct":0-10}],
 "sentiment":{"summary":"one sentence","sectors":[{"id":"equities"|"crypto"|"metals"|"dollar"|"vol","stance":"bullish"|"bearish"|"neutral","why":"short"}]},
 "order":null|{"side":"buy"|"sell","symbol":"TICKER","qty":number,"limitPx":number|null,"rationale":"one sentence"}}
qty is share/oz count sized to sizePct of equity at livePx. Include all five agents. Only Iris fills order. Damian never fills order.`, JSON.stringify(compact), 900)), snap)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Council failed"
		};
	}
}
var conveneCouncil = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("53881b375384a18162b7ca1787b680b3eb6d294180d70aa1bdaffe14fae37181"));
var askFloor = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("06af118d79fe5ca379095b3430783683b1e862954f62a809c1317e28038a0981"));
//#endregion
export { conveneCouncil as n, council_exports as r, askFloor as t };
