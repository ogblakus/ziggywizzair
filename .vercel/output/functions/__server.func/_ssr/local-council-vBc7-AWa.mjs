import { a as sectorBoard, r as macroHint } from "./macro-Bg8vwTHR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/local-council-vBc7-AWa.js
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
export { replyLocale as a, missedWhyOpened as i, isWhyOpenedQuestion as n, localAsk as r, isEnglishLeak as t };
