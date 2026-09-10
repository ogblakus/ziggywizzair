import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as isLot } from "./universe-8y-43p2g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/council-CPBlQWbr.js
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
function asAgent(v) {
	return typeof v === "string" && AGENTS.includes(v) ? v : "iris";
}
function asMood(v) {
	return v === "risk-on" || v === "risk-off" || v === "cautious" ? v : "cautious";
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
	const agents = AGENTS.map((id) => {
		const r = byId.get(id) ?? {};
		const symbol = typeof r.symbol === "string" && symbols.has(r.symbol) ? r.symbol : null;
		const conviction = Math.min(1, Math.max(0, Number(r.conviction) || 0));
		const sizePct = Math.min(12, Math.max(0, Number(r.sizePct) || 0));
		return {
			id,
			thesis: typeof r.thesis === "string" && r.thesis.trim() ? r.thesis.trim().slice(0, 280) : "No view this print.",
			vote: asVote(r.vote),
			symbol,
			conviction,
			sizePct
		};
	});
	const orderRaw = o.order && typeof o.order === "object" ? o.order : null;
	let order = null;
	if (orderRaw && (orderRaw.side === "buy" || orderRaw.side === "sell")) {
		const symbol = typeof orderRaw.symbol === "string" ? orderRaw.symbol : "";
		const t = snap.tickers.find((x) => x.symbol === symbol);
		const qty = Number(Number(orderRaw.qty).toFixed(isLot(symbol) ? 4 : 2));
		if (t && Number.isFinite(qty) && qty > 0) order = {
			side: orderRaw.side,
			symbol,
			qty,
			rationale: typeof orderRaw.rationale === "string" ? orderRaw.rationale.slice(0, 220) : "Chair synthesis."
		};
	}
	return {
		mood: asMood(session.mood ?? o.mood),
		summary: typeof session.summary === "string" ? session.summary.slice(0, 200) : typeof o.summary === "string" ? o.summary.slice(0, 200) : "Council closed without a single view.",
		agents,
		order
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
			temperature: json ? .85 : .7,
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
var conveneCouncil_createServerFn_handler = createServerRpc({
	id: "53881b375384a18162b7ca1787b680b3eb6d294180d70aa1bdaffe14fae37181",
	name: "conveneCouncil",
	filename: "src/lib/ai/council.ts"
}, (opts) => conveneCouncil.__executeServer(opts));
var conveneCouncil = createServerFn({ method: "POST" }).validator((input) => input).handler(conveneCouncil_createServerFn_handler, async ({ data }) => {
	try {
		const snap = data.snap;
		const last = data.last;
		const compact = {
			lookingAt: data.selected ?? null,
			tickers: snap.tickers.map((t) => ({
				s: t.symbol,
				px: Number(t.price.toFixed(2)),
				livePx: t.livePx != null ? Number(t.livePx.toFixed(4)) : null,
				liveBps: t.liveBps != null ? Number(t.liveBps.toFixed(1)) : null,
				chg: Number(t.changePct.toFixed(2)),
				rsi: Number(t.rsi.toFixed(1)),
				vsSma: Number(t.vsSma.toFixed(2))
			})),
			book: {
				cash: Math.round(snap.book.cash),
				equity: Math.round(snap.book.equity),
				dayPnlPct: Number(snap.book.dayPnlPct.toFixed(2)),
				positions: snap.book.positions.map((p) => ({
					s: p.symbol,
					qty: Number(p.qty.toFixed(4)),
					pnlPct: Number(p.pnlPct.toFixed(2))
				}))
			},
			wire: snap.headlines.slice(0, 6).map((h) => ({
				t: h.text.slice(0, 160),
				s: h.symbol ?? null
			})),
			lastSession: last ? {
				summary: last.summary,
				mood: last.mood,
				order: last.order ? {
					side: last.order.side,
					symbol: last.order.symbol
				} : null,
				votes: last.agents.map((a) => ({
					id: a.id,
					vote: a.vote,
					symbol: a.symbol
				})),
				damianSaid: last.agents.find((a) => a.id === "damian")?.thesis.slice(0, 180) ?? null
			} : null
		};
		return {
			ok: true,
			result: parseCouncil(extractJson(await chat(`You chair ZiggyWizzAir, a five-agent paper desk. Charts are Yahoo. Live venue is Hyperliquid.
Agents (must all speak, and they should DISAGREE more often than not):
- vesper: momentum. Rides expansion, cuts stalls. Ignores washed-out mean-reversion names.
- ash: mean reversion. Fades stretches, buys panic. Will not chase breakouts.
- kai: tape/flow. Trades relative strength and the open book. Not a second Vesper.
- damian: wire. Reads headlines in "wire". Trades the story only when a name on the board is tagged. Will not invent news. Cite ONE headline that is not already in the tape. If every headline was already spoken, say the wire is unchanged and hold — do not paste the same titles again.
- iris: risk chair. Sizes 3–5% probes, vetoes concentration, may refuse a ticket. HARD RULE: round-trip transaction fees (open+close — spread, HL taker, builder) must stay ≤ 5% of position notional. Veto any ticket that would breach that.
Rules:
- px is Yahoo (charts and paper marks). livePx is Hyperliquid mid in desk units — SIZE qty from livePx, not px.
- SPY livePx is xyz:SP500 / 10 (ETF-equivalent). Never treat xyz:SP500 as a 1:1 SPY share.
- GOLD/SILVER livePx is the metal perp, not the Yahoo future. liveBps is (livePx-px)/px in basis points.
- If livePx is null, do not ticket that name.
- Use the numbers. Name specific tickers. 1–2 sentences each.
- Damian must cite a headline or say the wire is quiet. Do not let Damian copy Vesper. Never dump a list of headlines. Never repeat a title already on the tape.
- Do NOT rubber-stamp the previous session. If lastSession.order is the same name, either hold, pick another name, or explain why the tape still forces that name.
- Each agent should usually pick a DIFFERENT ticker or hold. Piling onto one name requires a one-way tape.
- If the book already has a position, at least one agent must address it.
- If risk-off, order is null.
- Never claim a real broker fill. Paper until live Place is wired.
Return JSON only:
{"session":{"mood":"risk-on"|"cautious"|"risk-off","summary":"one sentence"},
 "agents":[{"id":"vesper"|"ash"|"kai"|"damian"|"iris","thesis":"1-2 sentences","vote":"buy"|"sell"|"hold","symbol":"TICKER"|null,"conviction":0-1,"sizePct":0-10}],
 "order":null|{"side":"buy"|"sell","symbol":"TICKER","qty":number,"rationale":"one sentence"}}
qty is share/oz count sized to sizePct of equity at livePx. Include all five agents.
${data.locale === "pl" ? "Pisz session.summary, każdą tezę agenta i order.rationale po polsku, prostym językiem. Bez angielskich żargonów (tape, wire, floor, probe, fills, heurystyki, quorum). Zamiast tego: notowania, wiadomości, mała pozycja, portfel, rada. Tickerów nie tłumacz." : "Write in English. Keep ticker symbols as-is."}`, JSON.stringify(compact), 900)), snap)
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Council failed"
		};
	}
});
var askFloor_createServerFn_handler = createServerRpc({
	id: "06af118d79fe5ca379095b3430783683b1e862954f62a809c1317e28038a0981",
	name: "askFloor",
	filename: "src/lib/ai/council.ts"
}, (opts) => askFloor.__executeServer(opts));
var askFloor = createServerFn({ method: "POST" }).validator((input) => input).handler(askFloor_createServerFn_handler, async ({ data }) => {
	const question = data.question.trim().slice(0, 500);
	if (!question) return {
		ok: false,
		error: "Ask something first."
	};
	try {
		const focusSym = (() => {
			const q = question.toUpperCase();
			return data.snap.tickers.find((t) => q.includes(t.symbol) || q.includes(t.name.toUpperCase()))?.symbol ?? data.selected ?? null;
		})();
		const focus = data.snap.tickers.find((t) => t.symbol === focusSym) ?? null;
		const held = data.snap.book.positions.find((p) => p.symbol === focusSym) ?? null;
		const prior = [...data.lastAsk?.log ?? [], data.lastAsk ? {
			question: data.lastAsk.question,
			speaker: data.lastAsk.speaker,
			text: data.lastAsk.text
		} : null].filter(Boolean).slice(-4);
		const compact = {
			q: question,
			lookingAt: data.selected ?? null,
			focus: focus ? {
				s: focus.symbol,
				name: focus.name,
				px: Number(focus.price.toFixed(4)),
				livePx: focus.livePx != null ? Number(focus.livePx.toFixed(4)) : null,
				liveBps: focus.liveBps != null ? Number(focus.liveBps.toFixed(1)) : null,
				open: Number(focus.open.toFixed(4)),
				high: Number(focus.high.toFixed(4)),
				low: Number(focus.low.toFixed(4)),
				chg: Number(focus.changePct.toFixed(2)),
				rsi: Number(focus.rsi.toFixed(1)),
				vsSma: Number(focus.vsSma.toFixed(2)),
				held: held ? {
					qty: Number(held.qty.toFixed(4)),
					avg: Number(held.avg.toFixed(4)),
					pnlPct: Number(held.pnlPct.toFixed(2))
				} : null
			} : null,
			tape: data.snap.tickers.map((t) => ({
				s: t.symbol,
				px: Number(t.price.toFixed(2)),
				livePx: t.livePx != null ? Number(t.livePx.toFixed(4)) : null,
				liveBps: t.liveBps != null ? Number(t.liveBps.toFixed(1)) : null,
				chg: Number(t.changePct.toFixed(2)),
				rsi: Number(t.rsi.toFixed(1)),
				vsSma: Number(t.vsSma.toFixed(2))
			})),
			book: {
				cash: Math.round(data.snap.book.cash),
				equity: Math.round(data.snap.book.equity),
				dayPnlPct: Number(data.snap.book.dayPnlPct.toFixed(2)),
				positions: data.snap.book.positions.map((p) => ({
					s: p.symbol,
					qty: Number(p.qty.toFixed(4)),
					avg: Number(p.avg.toFixed(4)),
					pnlPct: Number(p.pnlPct.toFixed(2))
				}))
			},
			lastCouncil: data.lastCouncil ? {
				mood: data.lastCouncil.mood,
				summary: data.lastCouncil.summary,
				votes: data.lastCouncil.agents.map((a) => ({
					id: a.id,
					vote: a.vote,
					symbol: a.symbol,
					thesis: a.thesis
				})),
				order: data.lastCouncil.order ? {
					side: data.lastCouncil.order.side,
					symbol: data.lastCouncil.order.symbol,
					qty: data.lastCouncil.order.qty
				} : null
			} : null,
			recentAsks: prior.map((p) => ({
				q: p.question,
				speaker: p.speaker,
				a: p.text.slice(0, 280)
			})),
			recentFills: (data.recentFills ?? []).slice(0, 6),
			wire: data.snap.headlines.slice(0, 6).map((h) => ({
				t: h.text.slice(0, 160),
				s: h.symbol ?? null
			}))
		};
		const raw = extractJson(await chat(`You are one named agent on the ZiggyWizzAir paper desk. LIVE prices are in the payload. Answer the trader's question like a desk, not a chatbot.

Pick the speaker whose mandate fits THIS question:
- vesper — momentum, breakouts, leaders, chase/cut
- ash — dips, fades, mean reversion, stretched/washed
- kai — why is it moving, tape, relative strength, flow
- damian — headlines, news, the wire, "what's the story"
- iris — size, cash, close, risk, drawdown, "should I". Round-trip fees (open+close) max 5% of notional — veto fatter tickets.

Voice: first name last. Take a side in sentence one (buy / sell / hold / wait / flatten). Then argue with the numbers in the payload — Yahoo px for the chart, livePx (Hyperliquid mid in desk units) for any size talk, % vs open, RSI, vs 20-bar SMA, P&L if held. SPY livePx is SPX/10. GOLD/SILVER livePx is the metal perp. Compare to another name on the tape when it helps. If they follow up, use recentAsks. If lastCouncil voted, agree or dissent with a reason. Damian must cite ONE headline from "wire" or say it is quiet — never restate a title already used.

4–8 sentences. Specific. No "watch the tape", no brokerage, no generic macro sermon. Paper fills only.
${data.locale === "pl" ? "Odpowiadaj po polsku, prostym językiem. Bez angielskich żargonów (tape, wire, floor, probe, fills, heurystyki). Ticker symbols zostaw po angielsku." : "Answer in English."}

Return JSON only:
{"speaker":"vesper"|"ash"|"kai"|"damian"|"iris","text":"the answer"}`, JSON.stringify(compact), 900, {
			timeoutMs: 22e3,
			json: true
		}));
		return {
			ok: true,
			result: {
				speaker: asAgent(raw.speaker),
				text: typeof raw.text === "string" && raw.text.trim() ? raw.text.trim().slice(0, 1600) : "No view."
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Floor is quiet"
		};
	}
});
//#endregion
export { askFloor_createServerFn_handler, conveneCouncil_createServerFn_handler };
