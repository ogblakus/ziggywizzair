import { a as sectorOf, i as isLot } from "./universe-BHNCzOwL.mjs";
import { m as teamBlocks, s as isAddOn, t as AGENTS, u as pullbackInTrend } from "./holds-BpglsS1V.mjs";
import { a as sentimentBias, i as sectorBoard, n as macroHint } from "./macro-DaPt4VNL.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/size-rwRzoUvn.js
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
	if (open && (pos.qty > 0 && order.side === "sell" || pos.qty < 0 && order.side === "buy")) return scouts.length >= 1 || kaiOk ? order : null;
	return scouts.length >= 1 && kaiOk ? order : null;
}
function clipSizePct(pct) {
	if (!Number.isFinite(pct)) return 3;
	return Math.min(6, Math.max(.5, pct));
}
/** Qty for a % of equity at the fill mark — same price the ticket will print. */
function qtyForClip(equity, pct, px, symbol) {
	if (!(equity > 0) || !(px > 0)) return 0;
	const raw = equity * clipSizePct(pct) * .01 / px;
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
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/local-council-BdVu5uQG.js
function clamp(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}
/** Damian filters a class, not the whole tape. Bearish crypto does not silence gold. */
function sectorWeight(sentiment, symbol) {
	const id = sectorOf(symbol);
	const row = sentiment?.sectors.find((s) => s.id === id);
	if (!row) return .85;
	if (row.stance === "bullish") return 1;
	if (row.stance === "bearish") return .42;
	return .85;
}
function rvolBoost(t) {
	if (t.rvol == null) return 4;
	if (t.rvol >= .9) return 16;
	if (t.rvol >= .7) return 12;
	if (t.rvol >= .55) return 7;
	return 0;
}
function vesperLongScore(t) {
	let s = 0;
	s += clamp(t.changePct / .7, 0, 1) * 38;
	s += clamp(t.vsSma / .5, 0, 1) * 24;
	if (t.rsi >= 48 && t.rsi < 78) s += 22;
	else if (t.rsi >= 44 && t.rsi < 82) s += 10;
	s += rvolBoost(t);
	return s;
}
function vesperShortScore(t) {
	let s = 0;
	s += clamp(-t.changePct / .7, 0, 1) * 38;
	s += clamp(-t.vsSma / .5, 0, 1) * 24;
	if (t.rsi <= 52 && t.rsi > 22) s += 22;
	else if (t.rsi <= 56 && t.rsi > 18) s += 10;
	s += rvolBoost(t);
	return s;
}
function ashBuyScore(t) {
	let s = 0;
	s += clamp(-t.vsSma / 1, 0, 1) * 40;
	s += clamp((48 - t.rsi) / 18, 0, 1) * 28;
	if (t.changePct < -.15) s += 14;
	s += rvolBoost(t) * .6;
	return s;
}
function ashSellScore(t) {
	let s = 0;
	s += clamp(t.vsSma / 1, 0, 1) * 40;
	s += clamp((t.rsi - 55) / 18, 0, 1) * 28;
	if (t.changePct > .15) s += 14;
	s += rvolBoost(t) * .6;
	return s;
}
function uniqueTop(ideas, n) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const idea of ideas.sort((a, b) => b.score - a.score)) {
		if (idea.score < 42) continue;
		if (seen.has(idea.symbol)) continue;
		seen.add(idea.symbol);
		out.push(idea);
		if (out.length >= n) break;
	}
	return out;
}
function vesperRank(tickers, sentiment) {
	const ideas = [];
	for (const t of tickers) {
		const w = sectorWeight(sentiment, t.symbol);
		const long = vesperLongScore(t) * w;
		const short = vesperShortScore(t) * w;
		if (long >= short && long >= 42) ideas.push({
			scout: "vesper",
			symbol: t.symbol,
			side: "buy",
			score: long
		});
		else if (short >= 42) ideas.push({
			scout: "vesper",
			symbol: t.symbol,
			side: "sell",
			score: short
		});
	}
	return uniqueTop(ideas, 3);
}
function ashRank(tickers, sentiment) {
	const ideas = [];
	for (const t of tickers) {
		const w = sectorWeight(sentiment, t.symbol);
		const buy = ashBuyScore(t) * w;
		const sell = ashSellScore(t) * w;
		if (buy >= sell && buy >= 42) ideas.push({
			scout: "ash",
			symbol: t.symbol,
			side: "buy",
			score: buy
		});
		else if (sell >= 42) ideas.push({
			scout: "ash",
			symbol: t.symbol,
			side: "sell",
			score: sell
		});
	}
	return uniqueTop(ideas, 3);
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
function rankKai(ideas, of) {
	const seen = /* @__PURE__ */ new Set();
	const rows = [];
	for (const idea of ideas) {
		if (idea.cut) continue;
		if (seen.has(`${idea.symbol}:${idea.side}`)) continue;
		const tk = of(idea.symbol);
		if (!tk) continue;
		seen.add(`${idea.symbol}:${idea.side}`);
		const kind = kaiKind(tk, idea.side);
		rows.push({
			idea,
			tk,
			kind,
			limit: kind === "thin" || kind === "chase" ? void 0 : kaiLimit(tk, idea.side)
		});
	}
	const rank = {
		ready: 0,
		wait: 1,
		none: 2,
		thin: 3,
		chase: 4
	};
	rows.sort((a, b) => rank[a.kind] - rank[b.kind] || b.idea.score - a.idea.score);
	return rows;
}
function irisClipPct(weatherBias, openCount, adding) {
	const pct = (weatherBias >= .35 ? 5.2 : weatherBias <= -.35 ? 2.2 : 3.2) * (openCount <= 0 ? 1 : openCount === 1 ? .78 : .55);
	if (adding) return Math.min(3, pct);
	return clamp(pct, 2, 6);
}
var PL_CHARS = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/;
var PL_STEMS = /podstaw|otworz|dlaczego|czemu|pozycj|zamkn|wiadomoś|prosz[eę]|możesz|mozesz|gotówk|kapita[lł]|zlecen|portfel|kupi[ćc]|sprzeda|krótk|na jakiej|co się dzieje|co sie dzieje|ile koszt|z jakiego|weszli|wzi[eę]/i;
function looksPolish(text) {
	return PL_CHARS.test(text) || PL_STEMS.test(text);
}
/** Settings locale wins; a clearly Polish question still forces Polish. */
function replyLocale(explicit, question) {
	if (looksPolish(question)) return "pl";
	return explicit === "pl" ? "pl" : "en";
}
function isWhyOpenedQuestion(q) {
	return /why.+(open|bought|long|short|trade|position)|on what basis|rationale|na jakiej|podstaw|dlaczego|czemu.+(otworz|kup|wesz|pozycj)|otworzy[lł]|z jakiego powodu|kto (to )?(otworz|kupi)|who (opened|bought|put us)/i.test(q);
}
/** LLM ignored the Polish instruction — dump the English slogan, use the local desk. */
function isEnglishLeak(text, locale) {
	if (locale !== "pl") return false;
	if (PL_CHARS.test(text)) return false;
	return /\b(hold the thesis|i add on dips|from the open|i do not chase|book is long|book is short|watch the tape|that's the add|if it rips)\b/i.test(text);
}
/** "Why did you open X?" answered with a live RSI dump and no fill/vote. */
function missedWhyOpened(question, answer) {
	if (!isWhyOpenedQuestion(question)) return false;
	return !/(voted|vote was|council|fill @|fill:|opened by|autopilot|manual|głosowa|glosowa|rada |otworzy[lła]|zlecen|sam otworz|tezę z rady|teze z rady|głos |glos |wpis |źródł|zrodl|rationale)/i.test(answer);
}
function L(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function damianReport(locale, opts) {
	const board = sectorBoard(opts?.macro, opts?.tickers ?? [], locale);
	const hint = macroHint(opts?.macro, locale);
	return {
		thesis: (hint ? `${hint}. ${board.summary}` : board.summary).slice(0, 340),
		vote: "hold",
		symbol: null,
		conviction: .55,
		sizePct: 0,
		sentiment: board
	};
}
function sessionLabel(name, locale) {
	if (name === "ny") return "NY";
	if (name === "lon") return locale === "pl" ? "Londyn" : "London";
	if (name === "tyo") return locale === "pl" ? "Tokio" : "Tokyo";
	return "00:00 UTC";
}
function sessionTalk(t, locale) {
	const s = t.session;
	if (!s) return "";
	const who = sessionLabel(s.name, locale);
	const pct = s.pct.toFixed(1);
	if (s.kind === "grab-down") return L(locale, `On the 15m, ${who} printed a fast dump (~${pct}%) and a bounce — that looks like a liquidity grab, not a new trend.`, `Na 15m przy ${who} była szybka zrzutka (ok. ${pct}%) i odbicie — to wygląda na zbieranie płynności, nie na nowy trend.`);
	return L(locale, `On the 15m, ${who} spiked (~${pct}%) and sold off — liquidity grab to the upside, not a clean breakout.`, `Na 15m przy ${who} był szybki strzał w górę (ok. ${pct}%) i zejście — zbieranie płynności od góry, nie czyste wybicie.`);
}
function nums(t, locale) {
	const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
	const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
	const rvol = t.rvol != null ? `rvol ${t.rvol.toFixed(2)}` : locale === "pl" ? "brak rvol" : "no rvol";
	return locale === "pl" ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs SMA20 (15m) ${sma}, ${rvol}` : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 20-SMA (15m) ${sma}, ${rvol}`;
}
function kaiLine(tk, side, locale) {
	const retrace = side === "buy" ? tk.buyRetrace : tk.sellRetrace;
	const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
	const wick = side === "buy" ? tk.buyWick : tk.sellWick;
	const kind = side === "buy" ? tk.buySetup : tk.sellSetup;
	const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
	const tf = (side === "buy" ? tk.buyTf : tk.sellTf) ?? "15m";
	const rvol = tk.rvol != null ? `rvol ${tk.rvol.toFixed(2)} (15m)` : locale === "pl" ? "brak rvol 15m" : "no 15m rvol";
	const extreme = side === "buy" ? L(locale, `the 12-bar ${tf} high`, `szczytu 12 świec ${tf}`) : L(locale, `the 12-bar ${tf} low`, `dołka 12 świec ${tf}`);
	const dir = side === "buy" ? L(locale, "long", "kupno") : L(locale, "short", "sprzedaż");
	const bits = [L(locale, `${tk.symbol} ${dir} on ${tf} HL candles (not 1m).`, `${tk.symbol} ${dir} — świece ${tf} z Hyperliquid (nie 1m).`)];
	if (kind === "chase") bits.push(L(locale, `Price sits in the last ${retrace ?? 0}% off ${extreme} and the last bar still prints that way — chase, no limit.`, `Cena siedzi ${retrace ?? 0}% od ${extreme} i ostatnia świeca dalej to potwierdza — pogoń, bez limitu.`));
	else if (retrace != null) bits.push(L(locale, `Retrace ${retrace}% from ${extreme}${kind === "pullback" ? " (in the 18–62% entry band)" : ""}.`, `Cofnięcie ${retrace}% od ${extreme}${kind === "pullback" ? " (pasmo wejścia 18–62%)" : ""}.`));
	if (fvg) bits.push(L(locale, `${side === "buy" ? "Bullish" : "Bearish"} FVG ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — price is tagging the gap.`, `FVG ${side === "buy" ? "wzrostowa" : "spadkowa"} ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — cena testuje lukę.`));
	else bits.push(L(locale, "No unfilled 3-bar FVG in this window.", "W tym oknie nie ma niezasypanego FVG (3 świece)."));
	if (wick) bits.push(L(locale, `Last bar has a ${side === "buy" ? "lower" : "upper"} rejection wick.`, `Ostatnia świeca ma knot ${side === "buy" ? "dolny" : "górny"} (odrzucenie).`));
	bits.push(rvol + (limit && kind === "pullback" ? L(locale, `. Limit ${limit.toFixed(2)}.`, `. Limit ${limit.toFixed(2)}.`) : "."));
	if (tk.session) bits.push(sessionTalk(tk, locale));
	return bits.join(" ");
}
function weatherFromSentiment(s) {
	const bias = sentimentBias(s?.sectors);
	if (!s?.sectors?.length) return {
		bias: 0,
		en: "Damian has no read yet",
		pl: "Damian jeszcze nic nie powiedział"
	};
	if (bias >= .35) return {
		bias,
		en: "Damian: weather is friendly — clip a bit larger",
		pl: "Damian: pogoda sprzyja — clip trochę większy"
	};
	if (bias <= -.35) return {
		bias,
		en: "Damian: weather is hostile — clip smaller",
		pl: "Damian: pogoda nie sprzyja — mniejszy clip"
	};
	return {
		bias,
		en: "Damian: mixed weather — standard clip",
		pl: "Damian: pogoda mieszana — zwykły clip"
	};
}
function sizeQty(equity, sizePct, t) {
	return qtyForClip(equity, sizePct, markOf(t), t.symbol);
}
function localCouncil(snap, last, locale = "en", _seenNews = []) {
	const tickers = snap.tickers.filter((t) => t.price > 0);
	if (!tickers.length) return {
		mood: "cautious",
		summary: L(locale, "Board is empty. Waiting on live prices.", "Rynek pusty. Czekam na ceny."),
		agents: AGENTS.map((p) => ({
			id: p.id,
			thesis: L(locale, "No prints yet. Nothing to vote.", "Jeszcze nic nie widać. Nie mam głosu."),
			vote: "hold",
			symbol: null,
			conviction: .2,
			sizePct: 0
		})),
		order: null,
		sentiment: sectorBoard(snap.macro, tickers, locale)
	};
	const of = (sym) => tickers.find((t) => t.symbol === sym);
	const damian = damianReport(locale, {
		macro: snap.macro,
		tickers
	});
	const sentiment = damian.sentiment;
	const weather = weatherFromSentiment(sentiment);
	const vesperIdeas = vesperRank(tickers, sentiment);
	const ashIdeas = ashRank(tickers, sentiment);
	const openPos = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8);
	const stalled = openPos.find((p) => {
		if (p.teamLock) return false;
		const tk = of(p.symbol);
		if (!tk) return false;
		if (p.qty > 0) return tk.changePct < -.9 || p.pnlPct < -.8 && tk.vsSma < 0;
		return tk.changePct > .9 || p.pnlPct < -.8 && tk.vsSma > 0;
	});
	const stalledTape = stalled ? of(stalled.symbol) : void 0;
	const cutIdea = stalled && stalledTape ? {
		scout: "vesper",
		symbol: stalled.symbol,
		side: stalled.qty < 0 ? "buy" : "sell",
		score: 88,
		cut: true
	} : null;
	const vesperLead = cutIdea ?? vesperIdeas[0] ?? null;
	const ashLead = ashIdeas[0] ?? null;
	const kaiRows = rankKai([
		...cutIdea ? [cutIdea] : [],
		...vesperIdeas,
		...ashIdeas
	], of);
	const kaiPick = kaiRows.find((r) => r.kind === "ready" || r.kind === "wait") ?? kaiRows[0] ?? null;
	const vesperVote = (kaiPick && vesperIdeas.find((i) => i.symbol === kaiPick.idea.symbol && i.side === kaiPick.idea.side)) ?? vesperLead;
	const ashVote = (kaiPick && ashIdeas.find((i) => i.symbol === kaiPick.idea.symbol && i.side === kaiPick.idea.side)) ?? ashLead;
	function listTalk(ideas) {
		if (!ideas.length) return "";
		return ideas.map((i) => `${i.symbol} ${i.side === "buy" ? L(locale, "long", "długa") : L(locale, "short", "krótka")} ${i.score.toFixed(0)}`).join(" · ");
	}
	const agents = AGENTS.map((p) => {
		if (p.id === "vesper") {
			if (cutIdea && stalled && stalledTape) {
				const cover = stalled.qty < 0;
				return {
					id: p.id,
					thesis: L(locale, `${stalled.symbol} stalled. ${nums(stalledTape, locale)}. I'd rather be flat than hopeful.`, `${stalled.symbol} stanęło. ${nums(stalledTape, locale)}. Wolałabym nic nie trzymać, niż liczyć na cud.`),
					vote: cover ? "buy" : "sell",
					symbol: stalled.symbol,
					conviction: .62,
					sizePct: 0
				};
			}
			if (vesperVote && !cutIdea) {
				const tk = of(vesperVote.symbol);
				const more = listTalk(vesperIdeas.filter((i) => i.symbol !== vesperVote.symbol));
				return {
					id: p.id,
					thesis: L(locale, `${nums(tk, locale)}. Score ${vesperVote.score.toFixed(0)}${vesperVote.score >= 62 ? " — expansion I will ride" : " — lean, not a full run"}${more ? `. Also watching ${more}` : ""}.`, `${nums(tk, locale)}. Wynik ${vesperVote.score.toFixed(0)}${vesperVote.score >= 62 ? " — ekspansja, którą chcę jechać" : " — nachylenie, nie pełny bieg"}${more ? `. Na oku też ${more}` : ""}.`),
					vote: vesperVote.side,
					symbol: vesperVote.symbol,
					conviction: Math.min(.9, .4 + vesperVote.score / 140),
					sizePct: vesperVote.score >= 62 ? 5 : 3
				};
			}
			const hot = [...tickers].sort((a, b) => b.changePct - a.changePct)[0];
			return {
				id: p.id,
				thesis: L(locale, `Nothing clearing 42 after Damian's weather. Hottest print is ${hot ? nums(hot, locale) : "—"}.`, `Nic nie przebija 42 po pogodzie Damiana. Najmocniejszy ruch: ${hot ? nums(hot, locale) : "—"}.`),
				vote: "hold",
				symbol: hot?.symbol ?? null,
				conviction: .38,
				sizePct: 0
			};
		}
		if (p.id === "ash") {
			if (ashVote) {
				const tk = of(ashVote.symbol);
				const more = listTalk(ashIdeas.filter((i) => i.symbol !== ashVote.symbol));
				const fade = ashVote.side === "buy";
				return {
					id: p.id,
					thesis: L(locale, `${nums(tk, locale)}. Score ${ashVote.score.toFixed(0)} — ${fade ? "wash, one clip" : "stretch, I sell strength"}${more ? `. Also ${more}` : ""}.`, `${nums(tk, locale)}. Wynik ${ashVote.score.toFixed(0)} — ${fade ? "przecena, jeden clip" : "wyciągnięcie, sprzedaję siłę"}${more ? `. Też ${more}` : ""}.`),
					vote: ashVote.side,
					symbol: ashVote.symbol,
					conviction: Math.min(.88, .4 + ashVote.score / 140),
					sizePct: 4
				};
			}
			const low = [...tickers].sort((a, b) => a.rsi - b.rsi)[0];
			const high = [...tickers].sort((a, b) => b.rsi - a.rsi)[0];
			return {
				id: p.id,
				thesis: L(locale, `Extremes: ${low ? nums(low, locale) : "—"} vs ${high ? nums(high, locale) : "—"}. Nothing I will fade yet.`, `Skrajności: ${low ? nums(low, locale) : "—"} vs ${high ? nums(high, locale) : "—"}. Jeszcze nic do fade.`),
				vote: "hold",
				symbol: null,
				conviction: .34,
				sizePct: 0
			};
		}
		if (p.id === "kai") {
			if (cutIdea && stalled && stalledTape) return {
				id: p.id,
				thesis: L(locale, `${stalled.symbol} is done. Flatten now — I don't wait for a limit to get out.`, `${stalled.symbol} się skończyło. Zdejmuję teraz — z zejścia nie czekam na limit.`),
				vote: cutIdea.side,
				symbol: stalled.symbol,
				conviction: .6,
				sizePct: 0
			};
			if (kaiPick && (kaiPick.kind === "ready" || kaiPick.kind === "wait")) {
				const extra = kaiPick.kind === "wait" ? L(locale, " No tagging FVG yet — I rest a limit and wait, I don't veto the direction.", " Jeszcze nie ma FVG pod ceną — kładę limit i czekam, kierunku nie kasuję.") : "";
				return {
					id: p.id,
					thesis: kaiLine(kaiPick.tk, kaiPick.idea.side, locale) + extra,
					vote: kaiPick.idea.side,
					symbol: kaiPick.idea.symbol,
					conviction: kaiPick.kind === "ready" ? .7 : .55,
					sizePct: 3
				};
			}
			if (kaiPick?.kind === "thin") return {
				id: p.id,
				thesis: L(locale, `${kaiPick.idea.symbol}: rvol ${kaiPick.tk.rvol?.toFixed(2)} (need ≥ 0.55). Dead tape — hard veto.`, `${kaiPick.idea.symbol}: rvol ${kaiPick.tk.rvol?.toFixed(2)} (chcę ≥ 0,55). Martwy obrót — twardy veto.`),
				vote: "hold",
				symbol: kaiPick.idea.symbol,
				conviction: .5,
				sizePct: 0
			};
			if (kaiPick?.kind === "chase") return {
				id: p.id,
				thesis: kaiLine(kaiPick.tk, kaiPick.idea.side, locale),
				vote: "hold",
				symbol: kaiPick.idea.symbol,
				conviction: .55,
				sizePct: 0
			};
			return {
				id: p.id,
				thesis: L(locale, `No name this round. I read 15m / 1h / 4h. Ready limit, rest a wait-limit, or veto chase/thin tape. 1m is noise.`, `Nikt nie wskazał spółki. Czytam 15m / 1h / 4h. Limit gotowy, limit czekający, albo veto na pogoń/martwy obrót. 1m to szum.`),
				vote: "hold",
				symbol: null,
				conviction: .3,
				sizePct: 0
			};
		}
		if (p.id === "damian") return {
			id: p.id,
			thesis: damian.thesis,
			vote: "hold",
			symbol: null,
			conviction: damian.conviction,
			sizePct: 0
		};
		const cashPct = 100 * snap.book.cash / Math.max(snap.book.equity, 1);
		const riskOff = snap.book.dayPnlPct < -2.4 || cashPct < 18;
		const names = snap.book.positions.map((p) => p.symbol).join(", ");
		return {
			id: p.id,
			thesis: riskOff ? L(locale, `Book is ${snap.book.dayPnlPct.toFixed(2)}% on the day, cash ${cashPct.toFixed(0)}%. No new risk until things calm. Fees stay ≤ 5% round-trip.`, `Portfel ${snap.book.dayPnlPct.toFixed(2)}% w ciągu dnia, gotówka ${cashPct.toFixed(0)}%. Bez nowego ryzyka, dopóki się nie uspokoi. Opłaty ≤ 5% za otwarcie i zamknięcie.`) : names ? L(locale, `Cash ${cashPct.toFixed(0)}% · open ${names}. I size 2–6% from Damian's weather. Max two legs plus one resting limit. Adds only on a pullback, max two a day.`, `Gotówka ${cashPct.toFixed(0)}% · otwarte: ${names}. Wielkość 2–6% od pogody Damiana. Max dwie nogi plus jeden limit w kolejce. Dokładki tylko na korekcie, max dwie dziennie.`) : L(locale, `Cash is ${cashPct.toFixed(0)}% of equity. I size 2–6% from Damian's weather. Two legs + one wait-limit. Fees ≤ 5% round-trip.`, `Gotówka to ${cashPct.toFixed(0)}% kapitału. Wielkość 2–6% od pogody Damiana. Dwie nogi + jeden limit czekający. Opłaty ≤ 5%.`),
			vote: "hold",
			symbol: null,
			conviction: .7,
			sizePct: 0
		};
	});
	const iris = agents.find((a) => a.id === "iris");
	const kai = agents.find((a) => a.id === "kai");
	const scouts = agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
	const kaiReady = kai.vote !== "hold" && kai.symbol && (kai.vote === "buy" || kai.vote === "sell");
	const openCount = openPos.filter((p) => !p.teamLock).length;
	const mood = iris.thesis.includes("No new risk") || iris.thesis.includes("Bez nowego ryzyka") ? "risk-off" : kaiReady ? "risk-on" : "cautious";
	let order = null;
	const cut = scouts.find((a) => {
		const pos = snap.book.positions.find((p) => p.symbol === a.symbol);
		if (!pos || pos.teamLock) return false;
		return pos.qty > 0 && a.vote === "sell" || pos.qty < 0 && a.vote === "buy";
	});
	if (mood !== "risk-off" && kaiReady) {
		const side = kai.vote;
		const symbol = kai.symbol;
		const lead = scouts.find((a) => a.symbol === symbol && a.vote === side) ?? kai;
		const repeat = last?.order && last.order.symbol === symbol && last.order.side === side;
		const card = snap.scorecard?.find((r) => r.id === lead.id);
		const hits = card && card.closed >= 2 ? L(locale, `${card.wins}/${card.closed} recent hits`, `${card.wins}/${card.closed} ostatnich trafień`) : L(locale, "too few closed calls to score", "za mało zamkniętych, żeby ocenić");
		const who = scouts.filter((a) => a.symbol === symbol && a.vote === side).map((a) => a.id === "vesper" ? "Vesper" : "Ash").join(" + ");
		const adding = isAddOn(snap.book.positions.map((p) => ({
			symbol: p.symbol,
			qty: p.qty,
			avg: p.avg
		})), symbol, side);
		const tk = tickers.find((x) => x.symbol === symbol);
		const kind = tk ? kaiKind(tk, side) : "none";
		const alreadyWorking = Boolean(snap.book.working);
		const held = snap.book.positions.find((p) => p.symbol === symbol);
		const flattening = Boolean(held && (held.qty > 0 && side === "sell" || held.qty < 0 && side === "buy"));
		if (repeat) iris.thesis = L(locale, `We already called ${side.toUpperCase()} ${symbol}. I will not print the same ticket again.`, `Już zagłosowaliśmy ${side === "buy" ? "KUP" : "SPRZEDAJ"} ${symbol}. Nie składam tego samego zlecenia drugi raz.`);
		else if (teamBlocks(snap.book.positions, symbol)) iris.thesis = L(locale, `${symbol} is locked — you own this trade. I will not add or close.`, `${symbol} jest zablokowane — to Twoja pozycja. Nie dokładam i nie zamykam.`);
		else if (flattening && held) {
			order = {
				side,
				symbol,
				qty: Math.abs(held.qty),
				rationale: L(locale, `Iris flattens ${symbol} — the move stalled.`, `Iris zdejmuje ${symbol} — ruch stanął.`)
			};
			iris.vote = side;
			iris.symbol = symbol;
			iris.sizePct = 0;
			iris.thesis = order.rationale;
		} else if (!adding && openCount >= 2) iris.thesis = L(locale, `Two legs already on. I will not open a third — only a cut or an add on a pullback.`, `Dwie nogi już są. Trzeciej nie otwieram — tylko zejście albo dokładka na korekcie.`);
		else if (!adding && alreadyWorking && kind !== "ready") iris.thesis = L(locale, `A limit is already resting. I keep that queue — no second wait-limit.`, `Limit już czeka. Zostawiam tę kolejkę — bez drugiego czekającego limitu.`);
		else if (adding && tk && !pullbackInTrend(side, tk.vsSma, tk.rsi, tk.changePct)) iris.thesis = L(locale, `${symbol} is not at the end of a pullback. I add only there — not into extension.`, `${symbol} nie jest na końcu korekty. Dokładam tylko tam, nie w wyciągnięcie.`);
		else if (tk) {
			const pctWanted = irisClipPct(weather.bias, openCount, adding);
			const px = markOf(tk);
			const qty = sizeQty(snap.book.equity, pctWanted, tk);
			const pct = clipPctOf(qty, px, snap.book.equity);
			const limit = kaiPick?.idea.symbol === symbol ? kaiPick.limit : kaiLimit(tk, side);
			if (qty > 0) {
				order = {
					side,
					symbol,
					qty,
					limitPx: limit && limit > 0 ? Number(limit.toFixed(4)) : void 0,
					rationale: L(locale, `${who ? `${who} on direction. ` : ""}Iris ${pct.toFixed(1)}% of equity. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`, `${who ? `${who} dał kierunek. ` : ""}Iris ${pct.toFixed(1)}% kapitału. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`)
				};
				iris.vote = side;
				iris.symbol = symbol;
				iris.sizePct = pct;
				iris.thesis = `${order.rationale} ${nums(tk, locale)}.`;
			}
		}
	} else if (mood !== "risk-off" && cut?.symbol) {
		const tk = tickers.find((x) => x.symbol === cut.symbol);
		const pos = snap.book.positions.find((p) => p.symbol === cut.symbol);
		if (tk && pos) {
			order = {
				side: cut.vote,
				symbol: cut.symbol,
				qty: Math.abs(pos.qty),
				rationale: L(locale, `Iris cuts ${cut.symbol} after ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`, `Iris zdejmuje ${cut.symbol} po sygnale ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`)
			};
			iris.vote = cut.vote;
			iris.symbol = cut.symbol;
			iris.thesis = order.rationale;
		}
	} else if (scouts.length) iris.thesis = L(locale, `Vesper/Ash have a name, but Kai vetoed chase or dead tape. Waiting.`, `Vesper/Ash mają spółkę, ale Kai zablokował pogoń albo martwy obrót. Czekamy.`);
	order = gateCouncilOrder(order, agents, snap);
	if (!order) iris.thesis = `${L(locale, weather.en, weather.pl)}. ${iris.thesis}`;
	return {
		mood,
		summary: mood === "risk-off" ? L(locale, "Chair keeps the book light. No new risk this round.", "Iris trzyma portfel lekki. Bez nowego ryzyka w tej rundzie.") : order ? L(locale, `${order.limitPx ? "Limit" : "Ticket"} on ${order.side.toUpperCase()} ${order.symbol}. Iris sized from Damian's weather.`, `${order.limitPx ? "Limit" : "Zlecenie"} ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}. Iris dała wielkość od pogody Damiana.`) : L(locale, "No ticket this round. Stay in cash.", "Brak biletu w tej rundzie. Zostajemy w gotówce."),
		agents,
		order,
		sentiment
	};
}
var AGENT_NAME = {
	vesper: "Vesper",
	ash: "Ash",
	kai: "Kai",
	damian: "Damian",
	iris: "Iris"
};
function pnlTalk(p, locale) {
	if (!Number.isFinite(p) || Math.abs(p) < .25) return L(locale, "basically unchanged", "praktycznie na zero");
	if (p > 0) return L(locale, `up about ${p.toFixed(1)}%`, `mniej więcej +${p.toFixed(1)}%`);
	return L(locale, `down about ${Math.abs(p).toFixed(1)}%`, `mniej więcej −${Math.abs(p).toFixed(1)}%`);
}
function holdTalk(pos, symbol, locale) {
	if (!pos) return L(locale, `We don't have ${symbol} on.`, `Nie mamy otwartego ${symbol}.`);
	const dir = pos.qty > 0 ? L(locale, "long", "długo") : L(locale, "short", "krótko");
	return L(locale, `We're ${dir} ${symbol}, ${pnlTalk(pos.pnlPct, locale)}.`, `Siedzimy ${dir} na ${symbol}, ${pnlTalk(pos.pnlPct, locale)}.`);
}
function readName(t, question, locale) {
	const q = question.toLowerCase();
	const chg = t.changePct;
	const thinksDown = /spad|zjazd|zjechał|zjechal|leci|dump|drop|down|przecen|wash|runę|runel|manipul/.test(q);
	const thinksUp = /uros|wzros|skoczył|skoczyl|rally|ripp|wybi/.test(q);
	const sess = sessionTalk(t, locale);
	let body;
	if (thinksDown && t.session?.kind === "grab-down") body = sess;
	else if (thinksUp && t.session?.kind === "grab-up") body = sess;
	else if (thinksDown && (!Number.isFinite(chg) || chg > -.35)) body = L(locale, `I get why ${t.symbol} looks heavy on a short chart, but from the open it has barely given anything back — this is a drift, not a washout.`, `Rozumiem, czemu ${t.symbol} wygląda na zjazd na krótkim wykresie, ale od otwarcia prawie nic nie oddał. To dryf, nie przecena.`);
	else if (thinksUp && (!Number.isFinite(chg) || chg < .35)) body = L(locale, `${t.symbol} hasn't really expanded from the open. If it felt loud, the session print doesn't confirm a breakout yet.`, `${t.symbol} od otwarcia prawie nie uciekł. Jeśli hałasuje na wykresie, sesja jeszcze nie potwierdza wybicia.`);
	else if (!Number.isFinite(chg) || Math.abs(chg) < .25) body = L(locale, `${t.symbol} is quiet from the open — no trend, no washout, just a tight range.`, `${t.symbol} od otwarcia jest cichy: ani trendu, ani przeceny, tylko wąski zakres.`);
	else if (chg >= 1.2) body = L(locale, `${t.symbol} has pushed hard from the open. That's momentum, not a dip to fade.`, `${t.symbol} ostro poszedł od otwarcia. To momentum, nie dołek do odbicia.`);
	else if (chg >= .35) body = L(locale, `${t.symbol} is grinding higher from the open, without looking stretched yet.`, `${t.symbol} od otwarcia idzie w górę, jeszcze bez euforii.`);
	else if (chg <= -1.2) body = L(locale, `${t.symbol} is genuinely offered from the open. This is the kind of move that can be a real washout.`, `${t.symbol} od otwarcia naprawdę spada. To już może być przecena, nie szum.`);
	else body = L(locale, `${t.symbol} is easing from the open, still orderly.`, `${t.symbol} od otwarcia się zsuwa, ale spokojnie, bez paniki.`);
	if (sess && body !== sess) return `${body} ${sess}`;
	return body;
}
function ashNext(t, locale) {
	if (t.rsi <= 32 || t.vsSma < -.8 || t.changePct <= -1) return L(locale, `This is the stretch I actually fade: one small ticket the other way, and I will not add if it keeps going against us.`, `Przy takiej przecenie siadam: jedna mała noga w drugą stronę i bez dokładania, jeśli pójdzie dalej przeciwko nam.`);
	return L(locale, `I'm not fading a quiet name. When a real washout shows up I'll take one small ticket — not two, and I don't average down.`, `Cichej spółki nie odbijam. Jak pojawi się prawdziwa przecena, wezmę jedną małą nogę — nie dwie i nie uśredniam.`);
}
function vesperNext(t, locale) {
	if (t.changePct > .3 && t.rsi < 72) return L(locale, `If it keeps expanding I'll keep a small long. If it stalls, I flatten. I'm not here to fade this.`, `Jeśli dalej się rozszerza, zostawiam małą długą. Jak stanie — zdejmuję. Tego nie gram w drugą stronę.`);
	return L(locale, `There's no expansion to ride. I'll wait for the name to actually start moving.`, `Nie ma tu momentum do jazdy. Poczekam, aż spółka naprawdę ruszy.`);
}
function kaiNext(_t, locale) {
	return L(locale, `I wouldn't chase the print. I want a pullback that actually comes to us, then a resting limit — not a market order into whatever is on the screen.`, `Nie goniłbym tej ceny. Chcę cofnięcia, które naprawdę do nas dojdzie, i limitu — nie rynku w to, co widać na ekranie.`);
}
function mentionsName(snap, question) {
	const upper = question.toUpperCase();
	const aliases = {
		BITCOIN: "BTC",
		ETHER: "ETH",
		ETHEREUM: "ETH",
		ZŁOTO: "GOLD",
		ZLOTO: "GOLD",
		SREBRO: "SILVER"
	};
	for (const t of snap.tickers) {
		if (upper.includes(t.symbol)) return t;
		if (t.name && upper.includes(t.name.toUpperCase())) return t;
	}
	for (const [word, sym] of Object.entries(aliases)) if (upper.includes(word)) return snap.tickers.find((t) => t.symbol === sym) ?? null;
	return null;
}
function isDamianQuestion(q) {
	return /sentyment|sentiment|sektor|dollar|dolar|vol\b|zmienn|rynek|market|krypto|crypto|bitcoin|\bbtc\b|\beth\b|kapitaliz|mcap|market.?cap|złot|zlot|srebr|gold|silver|metal|dxy|wiadomo|news|nagłów|naglów|pogod|weather|fear|greed|bull|bear/.test(q);
}
function isIrisQuestion(q) {
	return /iris|ryzyk|risk|cash|gotów|gotow|zamkn|close|size|wielko[sś][cć]|ile kapita|ile mam/.test(q);
}
function isKaiQuestion(q) {
	return /manipul|spoof|stop.?hunt|płynno|plynno|sesj|\bny\b|londyn|tokio|liquidity|fvg|limit|setup|cofni[eę]/.test(q);
}
function capUsd(n) {
	if (n == null || !(n > 0)) return null;
	if (n >= 0xe8d4a51000) return `$${(n / 0xe8d4a51000).toFixed(2)}T`;
	if (n >= 1e9) return `$${(n / 1e9).toFixed(0)}B`;
	return `$${n.toFixed(0)}`;
}
function damianAsk(question, snap, locale) {
	const board = sectorBoard(snap.macro, snap.tickers, locale);
	const m = snap.macro;
	const q = question.toLowerCase();
	const wantsCrypto = /krypto|crypto|bitcoin|\bbtc\b|\beth\b|kapitaliz|mcap|market.?cap/.test(q);
	const crypto = board.sectors.find((s) => s.id === "crypto");
	const btc = snap.tickers.find((t) => t.symbol === "BTC");
	const eth = snap.tickers.find((t) => t.symbol === "ETH");
	if (wantsCrypto) {
		const pct = m?.cryptoMcapPct;
		const cap = capUsd(m?.cryptoMcap ?? null);
		const pctStr = pct == null ? null : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
		return `${L(locale, [
			cap && pctStr ? `Crypto market cap is about ${cap}, ${pctStr} on the day.` : pctStr ? `Crypto market cap is ${pctStr} on the day.` : `I don't have a clean market-cap print yet.`,
			crypto ? crypto.why : "",
			btc ? `BTC ${btc.changePct >= 0 ? "+" : ""}${btc.changePct.toFixed(2)}% from the open.` : "",
			eth ? `ETH ${eth.changePct >= 0 ? "+" : ""}${eth.changePct.toFixed(2)}% from the open.` : ""
		].filter(Boolean).join(" "), [
			cap && pctStr ? `Kapitalizacja krypto to około ${cap}, ${pctStr} na dobę.` : pctStr ? `Kapitalizacja krypto ${pctStr} na dobę.` : `Nie mam teraz czystego odczytu kapitalizacji.`,
			crypto ? crypto.why : "",
			btc ? `BTC ${btc.changePct >= 0 ? "+" : ""}${btc.changePct.toFixed(2)}% od otwarcia.` : "",
			eth ? `ETH ${eth.changePct >= 0 ? "+" : ""}${eth.changePct.toFixed(2)}% od otwarcia.` : ""
		].filter(Boolean).join(" "))}\n\n${L(locale, `That's weather, not a ticker vote. Iris sizes from this. I don't pick names.`, `To pogoda, nie wybór spółki. Iris z tego liczy wielkość. Ja nazw nie wybieram.`)}`;
	}
	const hint = macroHint(m, locale);
	const bits = board.sectors.filter((s) => s.stance !== "neutral").map((s) => {
		return `${s.id === "equities" ? locale === "pl" ? "akcje" : "stocks" : s.id === "vol" ? locale === "pl" ? "zmienność" : "vol" : s.id === "dollar" ? locale === "pl" ? "dolar" : "dollar" : s.id === "metals" ? locale === "pl" ? "metale" : "metals" : "crypto"}: ${s.why}`;
	}).slice(0, 3);
	return [hint ? `${board.summary}. ${hint}` : board.summary, [bits.join(". "), L(locale, "I don't pick names. Iris sizes from this weather.", "Spółek nie wybieram. Iris z tej pogody liczy wielkość.")].filter(Boolean).join(" ")].join("\n\n");
}
function pickFocus(snap, question) {
	const upper = question.toUpperCase();
	const hit = snap.tickers.find((t) => upper.includes(t.symbol));
	if (hit) return hit;
	const held = snap.book.positions[0];
	if (held) {
		const t = snap.tickers.find((x) => x.symbol === held.symbol);
		if (t) return t;
	}
	return snap.tickers[0] ?? {
		symbol: "SPY",
		name: "S&P",
		price: 0,
		open: 0,
		changePct: 0,
		high: 0,
		low: 0,
		rsi: 50,
		vsSma: 0,
		livePx: null,
		liveBps: null
	};
}
function localAsk(question, snap, locale = "en", ctx) {
	const loc = replyLocale(locale, question);
	const named = mentionsName(snap, question);
	const focus = named ?? pickFocus(snap, question);
	const pos = named ? snap.book.positions.find((p) => p.symbol === named.symbol) : void 0;
	const hold = named ? holdTalk(pos, named.symbol, loc) : "";
	const q = question.toLowerCase();
	if (isWhyOpenedQuestion(question)) {
		const fill = (ctx?.recentFills ?? []).find((f) => f.symbol === focus.symbol);
		const voter = ctx?.lastCouncil?.agents.find((a) => a.id !== "iris" && a.symbol === focus.symbol && a.vote !== "hold") ?? null;
		const who = voter?.id ?? "iris";
		const weather = ctx?.lastCouncil?.sentiment?.summary;
		return {
			speaker: who,
			text: L(loc, [voter ? `${AGENT_NAME[who]} wanted ${voter.vote === "buy" ? "to buy" : "to sell"} ${focus.symbol}${voter.thesis ? ` — ${voter.thesis}` : "."}` : `Iris put ${focus.symbol} on because the floor had a name.`, [
				fill ? `We got filled ${fill.side === "buy" ? "long" : "short"} around ${fill.price.toFixed(2)}.` : `I don't have the fill ticket in front of me.`,
				weather ? `Damian's weather then: ${weather}.` : "",
				holdTalk(snap.book.positions.find((p) => p.symbol === focus.symbol), focus.symbol, loc)
			].filter(Boolean).join(" ")].join("\n\n"), [voter ? `${AGENT_NAME[who]} chciał${who === "vesper" ? "a" : ""} ${voter.vote === "buy" ? "kupić" : "sprzedać"} ${focus.symbol}${voter.thesis ? ` — ${voter.thesis}` : "."}` : `Iris wstawiła ${focus.symbol}, bo rada miała spółkę.`, [
				fill ? `Weszliśmy ${fill.side === "buy" ? "długo" : "krótko"} po około ${fill.price.toFixed(2)}.` : `Nie mam teraz biletu z wejścia pod ręką.`,
				weather ? `Pogoda Damiana wtedy: ${weather}.` : "",
				holdTalk(snap.book.positions.find((p) => p.symbol === focus.symbol), focus.symbol, loc)
			].filter(Boolean).join(" ")].join("\n\n"))
		};
	}
	if (isDamianQuestion(q) || !named && !isIrisQuestion(q) && !isKaiQuestion(q)) {
		if (!(named && (isKaiQuestion(q) || isIrisQuestion(q)))) return {
			speaker: "damian",
			text: damianAsk(question, snap, loc)
		};
	}
	if (isKaiQuestion(q)) {
		const sess = sessionTalk(focus, loc);
		return {
			speaker: "kai",
			text: L(loc, [
				sess || `${focus.symbol} has no sharp Lon/NY print on the 15m right now.`,
				hold,
				`I don't trade that spike. If we go, it is a limit after the grab, not into it.`
			].join("\n\n"), [
				sess || `Na 15m ${focus.symbol} nie ma teraz ostrego strzału przy Londynie/NY.`,
				hold,
				`Tego strzału nie gonimy. Jeśli wchodzimy, to limitem po zbieraniu płynności, nie w nie.`
			].join("\n\n"))
		};
	}
	if (isIrisQuestion(q)) return {
		speaker: "iris",
		text: L(loc, `${hold || L(loc, "Nothing open that I need to size.", "Nic otwartego do liczenia wielkości.")} Vesper and Ash rank names on their own scores. I size from Damian's weather; Kai rests a limit or waits — he does not veto the direction unless the tape is dead or it's a chase.\n\nTwo legs max, plus one resting limit. A normal trade is a few hours. Two add-ons a day, only on a pullback.`, `${hold || "Nic otwartego do liczenia wielkości."} Vesper i Ash rankują spółki własnym wynikiem. Wielkość liczę od pogody Damiana; Kai kładzie limit albo czeka — kierunku nie kasuje, chyba że obrót martwy albo pogoń.\n\nMax dwie nogi plus jeden limit w kolejce. Zwykły trade to kilka godzin. Dokładki — max dwie dziennie i tylko na korekcie.`)
	};
	const read = readName(focus, question, loc);
	const heldPos = snap.book.positions.find((p) => p.symbol === focus.symbol);
	const speaker = heldPos ? "ash" : focus.changePct > .3 ? "vesper" : "kai";
	const next = speaker === "kai" ? kaiNext(focus, loc) : speaker === "vesper" ? vesperNext(focus, loc) : ashNext(focus, loc);
	return {
		speaker,
		text: `${read}\n\n${holdTalk(heldPos, focus.symbol, loc)} ${next}`
	};
}
//#endregion
export { missedWhyOpened as a, gateCouncilOrder as c, localCouncil as i, markOf as l, isWhyOpenedQuestion as n, replyLocale as o, localAsk as r, clipPctOf as s, isEnglishLeak as t, qtyForClip as u };
