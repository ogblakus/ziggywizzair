import { i as isLot, n as UNIVERSE, t as STARTING_CASH } from "./universe-BHNCzOwL.mjs";
import { a as changePct, f as sma, l as promisingHold, m as teamBlocks, n as AGENT_BY_ID, o as holdExpired, p as stampOpened, r as addCountToday, s as isAddOn, t as AGENTS } from "./holds-BpglsS1V.mjs";
import { C as t, g as tapeFillText, i as assetLabel, t as DEFAULT_ALERT_PREFS, y as getLocale } from "./alert-prefs-BDQeOj_T.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proposal-B6CXYEBc.js
var SPECIALISTS = [
	"vesper",
	"ash",
	"kai"
];
function emptyRecords() {
	return SPECIALISTS.map((id) => ({
		id,
		calls: 0,
		closed: 0,
		wins: 0,
		hitRate: null,
		avgPnl: null,
		last5: [],
		sizeMult: 1,
		trusted: true
	}));
}
function recordsFrom(calls) {
	const byId = new Map(emptyRecords().map((r) => [r.id, {
		...r,
		last5: []
	}]));
	for (const c of calls) {
		const row = byId.get(c.agentId);
		if (!row) continue;
		row.calls += 1;
		if (c.closedAt != null && c.pnlPct != null) {
			row.closed += 1;
			if (c.pnlPct > 0) row.wins += 1;
			row.last5.push({
				symbol: c.symbol,
				side: c.side,
				pnlPct: c.pnlPct
			});
		}
	}
	return SPECIALISTS.map((id) => {
		const row = byId.get(id);
		const closedCalls = calls.filter((c) => c.agentId === id && c.pnlPct != null);
		const avgPnl = closedCalls.length > 0 ? closedCalls.reduce((s, c) => s + (c.pnlPct ?? 0), 0) / closedCalls.length : null;
		const hitRate = row.closed >= 2 ? row.wins / row.closed : null;
		const sizeMult = hitRate == null ? 1 : hitRate >= .6 ? 1.15 : hitRate >= .45 ? 1 : hitRate >= .35 ? .75 : .55;
		return {
			...row,
			last5: row.last5.slice(0, 5),
			avgPnl,
			hitRate,
			sizeMult,
			trusted: !(row.closed >= 4 && hitRate != null && hitRate < .35)
		};
	});
}
/** 3–5% clip, scaled by the specialist's recent hits. */
function sizeFor(agentId, recs, basePct = 3) {
	const mult = recs.find((r) => r.id === agentId)?.sizeMult ?? 1;
	return Math.max(1.5, Math.min(5, basePct * mult));
}
function proposerFrom(council, symbol, side) {
	if (!council) return null;
	const want = side;
	const hit = council.agents.find((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote === want) ?? council.agents.filter((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote !== "hold").sort((a, b) => b.conviction - a.conviction)[0];
	if (!hit || hit.id === "iris") return null;
	return hit.id;
}
function openCall(input) {
	return {
		...input,
		open: true
	};
}
function closeCallsFor(calls, symbol, exit, now, stillOpen) {
	if (stillOpen) return calls;
	return calls.map((c) => {
		if (!c.open || c.symbol !== symbol) return c;
		const dir = c.side === "buy" ? 1 : -1;
		const pnlPct = c.entry ? (exit - c.entry) / c.entry * 100 * dir : 0;
		return {
			...c,
			open: false,
			closedAt: now,
			exit,
			pnlPct
		};
	});
}
function markOpenCalls(calls, prices, now) {
	let changed = false;
	const next = calls.map((c) => {
		if (!c.open || c.mark1h != null) return c;
		if (now - c.ts < 36e5) return c;
		const px = prices[c.symbol];
		if (!px) return c;
		changed = true;
		const dir = c.side === "buy" ? 1 : -1;
		const pnl1h = c.entry ? (px - c.entry) / c.entry * 100 * dir : 0;
		return {
			...c,
			mark1h: px,
			pnl1h
		};
	});
	return changed ? next : calls;
}
function compactScorecard(recs, calls) {
	return recs.map((r) => {
		const open = calls.filter((c) => c.agentId === r.id && c.open).slice(0, 3).map((c) => ({
			s: c.symbol,
			side: c.side,
			ageMin: Math.round((Date.now() - c.ts) / 6e4),
			pnl1h: c.pnl1h != null ? Number(c.pnl1h.toFixed(2)) : null
		}));
		return {
			id: r.id,
			closed: r.closed,
			wins: r.wins,
			hitPct: r.hitRate != null ? Math.round(r.hitRate * 100) : null,
			sizePct: Number(sizeFor(r.id, recs).toFixed(1)),
			trusted: r.trusted,
			last5: r.last5.map((x) => ({
				s: x.symbol,
				pnl: Number(x.pnlPct.toFixed(1))
			})),
			open
		};
	});
}
function L(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function looksLikeReflection(thesis) {
	return /Wynik \+|Result \+|Nie moje odbicie|Wasn't my momentum|Nie stawiałem limitu|I didn't set a limit|To nie był mój ruch|Weather didn't fight|Pogoda nie biła|Wielkość od pogody|Size from Damian|I keep this 2–6|Zostaję przy 2/.test(thesis);
}
/** Post-close notes — what each agent takes from this trade. Always in `locale`. */
function reflectClosed(closed, lastCouncil, locale) {
	const win = (closed.pnl ?? 0) > 0;
	closed.pnlPct != null && (closed.pnlPct, `${closed.pnlPct.toFixed(2)}`);
	const name = assetLabel(closed.symbol, locale);
	const long = closed.side !== "short";
	const fromRow = closed.agents ?? [];
	const out = [];
	for (const p of AGENTS) {
		const prior = lastCouncil?.agents.find((a) => a.id === p.id) ?? fromRow.find((a) => a.id === p.id);
		const vote = prior?.vote ?? "hold";
		const priorSym = prior?.symbol;
		const called = Boolean(prior && prior.vote !== "hold" && (!priorSym || priorSym === closed.symbol));
		const withUs = called && (long && prior.vote === "buy" || !long && prior.vote === "sell");
		if ((p.id === "vesper" || p.id === "ash" || p.id === "kai") && !called) continue;
		let thesis;
		if (p.id === "vesper") thesis = withUs ? win ? L(locale, `${name} paid the trend. I keep riding names that still expand versus the 20-day average.`, `${name} zapłaciło za trend. Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej.`) : L(locale, `${name} stalled on me. Next time I cut faster when the move rolls over versus the 20-day average.`, `${name} stanęło. Następnym razem szybciej zdejmę, gdy ruch się zawija względem 20-sesyjnej średniej.`) : L(locale, `I sat this one out — no expansion to ride.`, `Siedziałem — nie było momentum do jazdy.`);
		else if (p.id === "ash") thesis = withUs ? win ? L(locale, `The fade on ${name} worked. Extremes still mean-revert — one small ticket.`, `Odbicie na ${name} zadziałało. Skrajności wracają do średniej — jedna mała noga.`) : L(locale, `${name} kept going. That wasn't an extreme, it was trend. I sit out the next stretch.`, `${name} pojechało dalej. To nie była skrajność, tylko trend. Następne wyciągnięcie odpuszczam.`) : L(locale, `No washout to fade. I stayed out.`, `Nie było przeceny do odbicia. Zostałem z boku.`);
		else if (p.id === "kai") thesis = withUs ? win ? L(locale, `The 15m/1h/4h setup on ${name} held. An FVG on the higher timeframe or a 15m pullback plus volume was enough.`, `Setup 15m/1h/4h na ${name} się obronił. Luka FVG z wyższego interwału albo cofnięcie 15m plus wolumen wystarczyły.`) : L(locale, `The 15m/1h/4h setup on ${name} failed. Next time I want a cleaner higher-timeframe FVG or a deeper 15m retrace.`, `Setup 15m/1h/4h na ${name} padł. Następnym razem czystsze FVG z 1h/4h albo głębsze cofnięcie 15m.`) : L(locale, `No pullback and no FVG — sitting out was correct.`, `Nie było cofnięcia ani FVG — czekanie było w porządku.`);
		else if (p.id === "damian") {
			const weather = lastCouncil?.sentiment?.summary;
			thesis = win ? L(locale, `${weather ? `${weather}. ` : ""}The weather didn't fight this trade.`, `${weather ? `${weather}. ` : ""}Pogoda nie biła się z tą nogą.`) : L(locale, `${weather ? `${weather}. ` : ""}I'll flag this sector more carefully next round.`, `${weather ? `${weather}. ` : ""}Ten sektor następnym razem oznaczę ostrożniej.`);
		} else thesis = win ? L(locale, `Size from Damian's weather was fine. I keep this 2–6% band.`, `Wielkość od pogody Damiana była w porządku. Zostaję przy 2–6%.`) : L(locale, `I'll size smaller next time Damian is mixed.`, `Następnym razem mniejsza noga, gdy Damian jest mieszany.`);
		out.push({
			id: p.id,
			vote,
			thesis
		});
	}
	return out;
}
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
	const realized = (fill.price - existing.avg) * closedQty * Math.sign(existing.qty);
	const share = closedQty / Math.abs(existing.qty);
	const fees = (existing.fees ?? 0) * share + (fill.fee ?? 0);
	const pnl = realized - fees;
	const side = existing.qty > 0 ? "long" : "short";
	const pnlPct = existing.avg ? pnl / (existing.avg * closedQty) * 100 : 0;
	return {
		id: fill.id,
		ts: fill.ts,
		symbol: fill.symbol,
		pnl,
		side,
		qty: closedQty,
		entry: existing.avg,
		exit: fill.price,
		openedAt: existing.openedAt,
		pnlPct,
		source: fill.source,
		entryNote: existing.entryNote,
		closeNote: fill.note,
		fees
	};
}
function humanCloseNote(row, locale = "pl") {
	const pl = locale === "pl";
	const note = (row.closeNote ?? "").trim();
	const src = row.source;
	if (note === "close.hyperliquid" || /hyperliquid/i.test(note) || /Closed on Hyperliquid/i.test(note) || /Zamknięcie na Hyperliquid/i.test(note)) return pl ? "Zamknięcie na Hyperliquid — nie z pulpitu demo." : "Closed on Hyperliquid — not from the demo desk.";
	if (src === "manual" || /^close$/i.test(note) || /^ręcznie$/i.test(note) || note === "close.manual" || /^You closed this by hand/i.test(note) || /^Zamknąłeś pozycję ręcznie/i.test(note)) return pl ? "Zamknąłeś pozycję ręcznie — to nie była decyzja rady." : "You closed this by hand — not the floor.";
	if (/partial close|ręcznie \(część\)|close.manualPartial/i.test(note) || /You closed part of the trade by hand/i.test(note)) return pl ? "Zamknąłeś część pozycji ręcznie. Reszta zostaje." : "You closed part of the trade by hand. The rest stays on.";
	if (note === "close.timeSession" || note === "Time stop" || /time stop — session/i.test(note) || /A default trade is one session/i.test(note) || /Zwykły trade trzymamy jak jedną sesję/i.test(note)) return pl ? "Czas minął. Zwykły trade trzymamy jak jedną sesję (kilka godzin), a tu nie było powodu zostawać dłużej." : "Time was up. A default trade is one session (a few hours), and there was no reason to stay longer.";
	if (note === "close.timePromising" || /time stop — stretched/i.test(note) || /let it run a few days/i.test(note) || /trzymaliśmy dłużej \(do kilku dni\)/i.test(note)) return pl ? "Czas minął. Szło z nami, więc trzymaliśmy dłużej (do kilku dni), ale i ten limit się skończył." : "Time was up. It was working so we let it run a few days, then flattened.";
	if (note === "close.stopLoss" || /^stop loss$/i.test(note)) return pl ? "Zadziałał stop loss — pozycja zamknięta na ustawionym poziomie." : "Stop loss hit — flattened at the level you set.";
	if (note === "close.takeProfit" || /^take profit$/i.test(note)) return pl ? "Zadziałał take profit — pozycja zamknięta na ustawionym poziomie." : "Take profit hit — flattened at the level you set.";
	if (note === "close.contrary" || /contrary signal/i.test(note) || /przeciwny sygnał/i.test(note)) return pl ? "Rada zdjęła pozycję, bo przyszedł przeciwny sygnał — to nie było nowe otwarcie." : "The floor flattened on a contrary signal — not a new entry.";
	if (/cut|zdejmuje|stall|stanę/i.test(note) && !/Time was up/i.test(note)) return pl ? `Rada zdjęła pozycję, bo ruch się skończył.${note.length > 12 && /[ąćęłńóśźż]/i.test(note) ? ` ${note}` : ""}` : note;
	if (/daje \d|sizes \d|clip od pogody|% kapitału na |quorum |limit Kaia/i.test(note)) return pl ? "Rada zamknęła pozycję (przeciwny sygnał). Notatka z otwarcia nie dotyczy zejścia." : "The floor closed this (contrary signal). The entry note does not explain the exit.";
	if (src === "council" || src === "autopilot") {
		if (note.length > 12) return polishDeskProse(note, locale);
		return pl ? "Autopilot zamknął pozycję na sygnał rady." : "Autopilot closed on a floor signal.";
	}
	return polishDeskProse(note, locale) || (pl ? "Brak uzasadnienia." : "No close note.");
}
function polishDeskProse(raw, locale) {
	if (!raw) return raw;
	if (locale !== "pl") return raw.replace(/\bclip od pogody Damiana\b/gi, "size from Damian's weather").replace(/\bZwiad\s+/gi, "Direction: ").replace(/\bZłoto\b/g, "Gold").replace(/\bSrebro\b/g, "Silver").replace(/\bzłoto\b/g, "gold").replace(/\bsrebro\b/g, "silver").replace(/\bGotówka\b/g, "Cash").replace(/\bręcznie\b/gi, "by hand").replace(/\bNarada\b/g, "Convene");
	return raw.replace(/\bclip od pogody Damiana\b/gi, "wielkość od pogody Damiana").replace(/\bClip from Damian's weather was fine\b/gi, "Wielkość od pogody Damiana była w porządku").replace(/\bClip from Damian's weather\b/gi, "wielkość od pogody Damiana").replace(/\bI size 2–6% from Damian's weather\b/gi, "Wielkość 2–6% od pogody Damiana").replace(/\bWeather didn't fight this clip\b/gi, "Pogoda nie biła się z tą nogą").replace(/\bTape\b/g, "Notowania").replace(/\bZwiad\s+vesper\+kai\b/gi, "Kierunek: Vesper i Kai").replace(/\bZwiad\s+/gi, "Kierunek: ").replace(/Limit Kaia na końcu/gi, "Kai stawia limit na końcu").replace(/\btoo few closed calls to score\b/gi, "za mało zamkniętych, żeby ocenić").replace(/\bpaid the trend\b/gi, "zapłaciło za trend").replace(/\bNot my fade\b/gi, "Nie moje odbicie").replace(/\bI didn't set a limit on\b/gi, "Nie stawiałem limitu na").replace(/\bsitting out was correct\b/gi, "czekanie było w porządku").replace(/\bI keep this 2–6% band\b/gi, "Zostaję przy 2–6%").replace(/\bI keep riding names that still expand vs the 20-SMA\b/gi, "Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej").replace(/\bClosed \+/g, "Zamknięte +").replace(/\bround-trip\b/gi, "otwarcie i zamknięcie").replace(/\bSilver\b/g, "Srebro").replace(/\bGold\b/g, "Złoto").replace(/\bSILVER\b/g, "srebro").replace(/\bGOLD\b/g, "złoto").replace(/\bclip\b/gi, "noga");
}
function humanEntryNote(note, locale = "pl") {
	const raw = (note ?? "").trim();
	if (!raw) return locale === "pl" ? "Brak uzasadnienia." : "No entry note.";
	return polishDeskProse(raw, locale);
}
function decorateClosed(closed, lastCouncil, fill, priorFills = [], locale = getLocale()) {
	const original = (lastCouncil?.agents ?? []).filter((a) => a.thesis).map((a) => ({
		id: a.id,
		vote: a.vote,
		thesis: a.thesis,
		symbol: a.symbol
	}));
	const agents = original.length ? original : closed.agents;
	const wantSide = closed.side === "short" ? "sell" : "buy";
	const openFill = priorFills.filter((f) => f.symbol === fill.symbol && f.side === wantSide && f.ts < fill.ts).at(-1);
	const withAgents = {
		...closed,
		source: closed.source ?? fill.source,
		openedAt: closed.openedAt ?? openFill?.ts,
		closeNote: fill.note ?? closed.closeNote,
		agents,
		entryNote: closed.entryNote ?? openFill?.note
	};
	return {
		...withAgents,
		closeNote: withAgents.closeNote,
		analysis: explainTrade(withAgents, locale),
		agents
	};
}
function explainTrade(row, locale = "pl") {
	const pl = locale === "pl";
	const name = assetLabel(row.symbol, locale);
	const want = row.side === "short" ? "sell" : "buy";
	const dir = row.side === "short" ? pl ? "sprzedaż" : "a short" : pl ? "kupno" : "a long";
	const voters = (row.agents ?? []).filter((a) => a.vote === want && !looksLikeReflection(a.thesis ?? ""));
	if (!voters.length) {
		const pnl = row.pnlPct != null ? `${row.pnlPct >= 0 ? "+" : ""}${row.pnlPct.toFixed(2)}%` : "";
		return pl ? `Pozycja ${dir} ${name}${pnl ? ` (${pnl})` : ""}. Rada nie zapisała głosów za tym kierunkiem — szczegóły są w uzasadnieniu wejścia.` : `${dir[0].toUpperCase()}${dir.slice(1)} ${name}${pnl ? ` (${pnl})` : ""}. No recorded votes for this side — see the entry note.`;
	}
	return [pl ? `Rada poszła w ${dir} ${name}, ponieważ:` : `The desk went ${dir} ${name} because:`, ...voters.map((a) => {
		return `• ${AGENT_BY_ID[a.id]?.name ?? a.id}: ${polishDeskProse(a.thesis, locale)}`;
	})].join("\n");
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
/** How long a pending ticket stays on the rail before it dies. Prices move. */
var PROPOSAL_TTL_MS = 9e5;
function stampProposal(order, now = Date.now()) {
	if (!order) return null;
	return {
		...order,
		proposedAt: order.proposedAt ?? now
	};
}
function liveProposal(order, now = Date.now()) {
	if (!order) return null;
	const at = order.proposedAt ?? now;
	if (order.proposedAt && now - order.proposedAt > 9e5) return null;
	if (!order.proposedAt) return {
		...order,
		proposedAt: at
	};
	return order;
}
function proposalMsLeft(order, now = Date.now()) {
	const at = order.proposedAt ?? now;
	return Math.max(0, at + PROPOSAL_TTL_MS - now);
}
function withLiveProposal(book, now = Date.now()) {
	const next = liveProposal(book.proposal, now);
	if (next === book.proposal) return book;
	return {
		...book,
		proposal: next
	};
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/engine-C1GaS4Le.js
function parseStop(raw) {
	const n = Number(String(raw).replace(",", "."));
	if (!Number.isFinite(n) || n <= 0) return null;
	return n;
}
function hitStop(pos, px) {
	if (!(px > 0)) return null;
	const long = pos.qty > 0;
	const sl = pos.stopLoss;
	const tp = pos.takeProfit;
	if (long) {
		if (sl != null && px <= sl) return "sl";
		if (tp != null && px >= tp) return "tp";
	} else {
		if (sl != null && px >= sl) return "sl";
		if (tp != null && px <= tp) return "tp";
	}
	return null;
}
function stopSideError(long, mark, sl, tp) {
	if (!(mark > 0)) return null;
	if (sl != null) {
		if (long && sl >= mark) return "sl";
		if (!long && sl <= mark) return "sl";
	}
	if (tp != null) {
		if (long && tp <= mark) return "tp";
		if (!long && tp >= mark) return "tp";
	}
	return null;
}
/** Hyperliquid perps, base tier (no volume discount). Market fills take. Limits make. */
var HL_TAKER_PCT = .045;
var HL_MAKER_PCT = .015;
function hlFeeUsd(qty, price, kind = "taker") {
	const notional = Math.abs(qty * price);
	if (!(notional > 0)) return 0;
	return Math.round(notional * ((kind === "maker" ? HL_MAKER_PCT : HL_TAKER_PCT) / 100) * 100) / 100;
}
function hlRoundTripPct() {
	return HL_TAKER_PCT * 2;
}
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
		working: null,
		selected: "BTC",
		lastAutoAt: 0,
		lastTickAt: 0,
		fillSeq: 0,
		clientUntil: 0,
		deskEpoch: 0,
		agentCalls: [],
		lastCouncilAt: 0,
		locale: "en",
		mode: "demo",
		alertPrefs: { ...DEFAULT_ALERT_PREFS }
	};
}
function applyFill(cash, positions, fill) {
	const signed = fill.side === "buy" ? fill.qty : -fill.qty;
	const fee = fill.fee ?? 0;
	const existing = positions.find((p) => p.symbol === fill.symbol);
	if (!existing || Math.abs(existing.qty) < 1e-8) {
		const rest = positions.filter((p) => p.symbol !== fill.symbol);
		return {
			cash: cash - Math.abs(signed) * fill.price - fee,
			positions: [...rest, {
				symbol: fill.symbol,
				qty: signed,
				avg: fill.price,
				fees: fee
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
			cash: cash - absAdd * fill.price - fee,
			positions: positions.map((p) => p.symbol === fill.symbol ? {
				...p,
				qty: newQty,
				avg,
				fees: (p.fees ?? 0) + fee
			} : p)
		};
	}
	const closedQty = Math.min(Math.abs(oldQty), Math.abs(signed));
	const realized = (fill.price - existing.avg) * closedQty * Math.sign(oldQty);
	const share = closedQty / Math.abs(oldQty);
	const remainFees = (existing.fees ?? 0) * (1 - share);
	let nextCash = cash + closedQty * existing.avg + realized - fee;
	if (Math.abs(newQty) < 1e-8) return {
		cash: nextCash,
		positions: positions.filter((p) => p.symbol !== fill.symbol)
	};
	if (Math.sign(newQty) === Math.sign(oldQty)) return {
		cash: nextCash,
		positions: positions.map((p) => p.symbol === fill.symbol ? {
			...p,
			qty: newQty,
			fees: remainFees
		} : p)
	};
	nextCash -= Math.abs(newQty) * fill.price;
	return {
		cash: nextCash,
		positions: positions.map((p) => p.symbol === fill.symbol ? {
			symbol: p.symbol,
			qty: newQty,
			avg: fill.price,
			fees: fee
		} : p)
	};
}
function estimatedRoundTripFeePct(_symbol, _live = false) {
	return hlRoundTripPct();
}
function feeCapOk(symbol, qty, price, live = false) {
	if (!(Math.abs(qty * price) > 0)) return false;
	return estimatedRoundTripFeePct(symbol, live) <= 5.000000001;
}
function notionalOk(cash, positions, assets, symbol, side, qty, price) {
	const eq = equityOf(cash, positions, assets);
	const nextQty = (positions.find((p) => p.symbol === symbol)?.qty ?? 0) + (side === "buy" ? qty : -qty);
	const nameNotional = Math.abs(nextQty * price);
	if (eq > 0 && nameNotional > eq * .5) return false;
	if (positions.filter((p) => p.symbol !== symbol).reduce((s, p) => s + Math.abs(p.qty * (assets[p.symbol]?.price || p.avg)), 0) + nameNotional > Math.max(eq, 1) * 2.2) return false;
	if (!feeCapOk(symbol, qty, price)) return false;
	return applyFill(cash, positions, {
		id: "probe",
		ts: 0,
		symbol,
		side,
		qty,
		price,
		source: "manual",
		fee: hlFeeUsd(qty, price, "taker"),
		feeKind: "taker"
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
	if ((input.source === "council" || input.source === "autopilot") && teamBlocks(book.positions, input.symbol)) return {
		ok: false,
		error: "Team locked out of this trade."
	};
	const adding = isAddOn(book.positions, input.symbol, input.side);
	if (!input.skipRisk && adding && addCountToday(book.fills, input.ts) >= 2) return {
		ok: false,
		error: "Iris veto — two adds today."
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
		note: input.note,
		feeKind: input.feeKind ?? "taker",
		fee: hlFeeUsd(sized, input.price, input.feeKind ?? "taker")
	};
	const next = applyFill(book.cash, book.positions, fill);
	const stamped = stampOpened(book.positions.find((p) => p.symbol === input.symbol), next.positions, fill);
	if (!input.skipRisk && next.cash < -.5) return {
		ok: false,
		error: "Iris veto — not enough cash."
	};
	const closed = closedFromFill(book.positions.find((p) => p.symbol === input.symbol), fill);
	const decorated = closed ? decorateClosed(closed, book.lastCouncil, fill, book.fills, book.locale) : null;
	const closedTrades = decorated ? [decorated, ...book.closedTrades].slice(0, 200) : book.closedTrades;
	const eq = equityOf(next.cash, stamped, input.assets);
	const stillOpen = Math.abs(stamped.find((p) => p.symbol === input.symbol)?.qty ?? 0) > 1e-8;
	let out = {
		...book,
		cash: next.cash,
		positions: stamped,
		fills: [fill, ...book.fills].slice(0, 80),
		closedTrades,
		fillSeq: book.fillSeq + 1,
		periodAnchors: rollAnchors(book.periodAnchors, eq),
		agentCalls: closeCallsFor(book.agentCalls ?? [], input.symbol, input.price, input.ts, stillOpen),
		proposal: book.proposal && book.proposal.symbol === input.symbol && book.proposal.side === input.side ? null : book.proposal
	};
	out = speak(out, {
		kind: "fill",
		symbol: input.symbol,
		ts: input.ts,
		text: tapeFillText(fill, book.locale)
	});
	return {
		ok: true,
		book: out,
		fill
	};
}
function expireHolds(book, quotes, now) {
	if (!book.positions.length) return book;
	const assets = {};
	const views = viewsAt(quotes, now);
	const bySym = new Map(views.map((v) => [v.symbol, v]));
	for (const v of views) {
		const u = UNIVERSE.find((x) => x.symbol === v.symbol);
		if (!u) continue;
		assets[v.symbol] = {
			symbol: v.symbol,
			name: u.name,
			price: v.price,
			open: v.price,
			high: v.price,
			low: v.price,
			series: [{
				t: now,
				px: v.price
			}],
			vol: u.vol,
			beta: u.beta,
			livePx: v.price,
			liveCoin: null,
			spotPx: null,
			tape: "hl"
		};
	}
	let next = book;
	for (const pos of book.positions) {
		const v = bySym.get(pos.symbol);
		if (!v) continue;
		if (pos.teamLock) continue;
		if (!holdExpired(pos, now, v.price, v.vsSma, v.changePct)) continue;
		const side = pos.qty > 0 ? "sell" : "buy";
		const note = promisingHold(pos, v.price, v.vsSma, v.changePct) ? "close.timePromising" : "close.timeSession";
		const filled = commitFill(next, {
			symbol: pos.symbol,
			side,
			qty: Math.abs(pos.qty),
			price: v.price,
			source: "council",
			note,
			skipRisk: true,
			ts: now,
			assets
		});
		if (filled.ok) next = filled.book;
	}
	return next;
}
function expireStops(book, quotes, now) {
	if (!book.positions.length) return book;
	const views = viewsAt(quotes, now);
	const bySym = new Map(views.map((v) => [v.symbol, v]));
	const assets = {};
	for (const v of views) {
		const u = UNIVERSE.find((x) => x.symbol === v.symbol);
		if (!u) continue;
		assets[v.symbol] = {
			symbol: v.symbol,
			name: u.name,
			price: v.price,
			open: v.price,
			high: v.price,
			low: v.price,
			series: [{
				t: now,
				px: v.price
			}],
			vol: u.vol,
			beta: u.beta,
			livePx: v.price,
			liveCoin: null,
			spotPx: null,
			tape: "hl"
		};
	}
	let next = book;
	for (const pos of [...next.positions]) {
		const v = bySym.get(pos.symbol);
		if (!v) continue;
		const hit = hitStop(pos, v.price);
		if (!hit) continue;
		const filled = commitFill(next, {
			symbol: pos.symbol,
			side: pos.qty > 0 ? "sell" : "buy",
			qty: Math.abs(pos.qty),
			price: v.price,
			source: "manual",
			note: hit === "sl" ? "close.stopLoss" : "close.takeProfit",
			skipRisk: true,
			ts: now,
			assets
		});
		if (filled.ok) next = filled.book;
	}
	return next;
}
function fillWorking(book, quotes, now) {
	const w = book.working;
	if (!w?.limitPx) return book;
	const q = quotes.find((x) => x.symbol === w.symbol);
	const px = q?.livePx && q.livePx > 0 ? q.livePx : q?.price;
	if (!(px && px > 0)) return book;
	if (!(w.side === "buy" ? px <= w.limitPx : px >= w.limitPx)) return book;
	const u = UNIVERSE.find((x) => x.symbol === w.symbol);
	const assets = u ? { [w.symbol]: {
		symbol: w.symbol,
		name: u.name,
		price: px,
		open: px,
		high: px,
		low: px,
		series: [{
			t: now,
			px
		}],
		vol: u.vol,
		beta: u.beta,
		livePx: px,
		liveCoin: null,
		spotPx: null,
		tape: "hl"
	} } : {};
	const filled = commitFill(book, {
		symbol: w.symbol,
		side: w.side,
		qty: w.qty,
		price: px,
		source: "council",
		note: w.rationale,
		feeKind: "maker",
		skipRisk: false,
		ts: now,
		assets
	});
	if (!filled.ok) return book;
	return {
		...filled.book,
		working: null
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
			liveCoin: null,
			spotPx: null,
			tape: "yahoo"
		};
	}
	return out;
}
function autopilotOnce(book, views, now) {
	if (!book.autopilot) return {
		...book,
		lastTickAt: now
	};
	if (now - book.lastAutoAt < 55e3) return {
		...book,
		lastTickAt: now
	};
	const ticket = book.proposal ?? book.lastCouncil?.order ?? null;
	if (!ticket) return {
		...book,
		lastTickAt: now
	};
	const row = views.find((t) => t.symbol === ticket.symbol);
	if (!row || !(row.price > 0)) return {
		...book,
		lastTickAt: now
	};
	const existing = book.positions.find((p) => p.symbol === ticket.symbol);
	const open = existing && Math.abs(existing.qty) > 1e-8;
	if (open && existing.teamLock) return {
		...book,
		lastAutoAt: now,
		lastTickAt: now
	};
	const reducing = open && (existing.qty > 0 && ticket.side === "sell" || existing.qty < 0 && ticket.side === "buy");
	if (open && !reducing) return {
		...book,
		lastAutoAt: now,
		lastTickAt: now
	};
	const note = reducing ? "close.contrary" : ticket.rationale;
	const assets = assetsFromViews(views);
	const price = row.price;
	const filled = commitFill({
		...book,
		lastAutoAt: now,
		lastTickAt: now
	}, {
		symbol: ticket.symbol,
		side: ticket.side,
		qty: ticket.qty,
		price,
		source: "council",
		note,
		ts: now,
		assets
	});
	if (!filled.ok) return {
		...book,
		lastAutoAt: now,
		lastTickAt: now
	};
	const who = proposerFrom(book.lastCouncil, ticket.symbol, ticket.side);
	if (!who) return filled.book;
	return {
		...filled.book,
		agentCalls: [openCall({
			id: `c-${now.toString(36)}-${filled.book.fillSeq.toString(36)}`,
			ts: now,
			agentId: who,
			symbol: ticket.symbol,
			side: ticket.side,
			entry: price,
			qty: ticket.qty,
			fillId: filled.fill.id
		}), ...filled.book.agentCalls ?? []].slice(0, 80)
	};
}
function catchUpBook(book, quotes, now) {
	book = withLiveProposal(book, now);
	if (!quotes.length) return {
		...book,
		lastTickAt: now
	};
	book = expireStops(book, quotes, now);
	book = expireHolds(book, quotes, now);
	book = fillWorking(book, quotes, now);
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
		text: t("tape.awayFills", { n: added }, book.locale)
	});
	else next = speak(next, {
		kind: "system",
		ts: now,
		text: t("tape.awayQuiet", void 0, book.locale)
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
	const aCouncil = a.lastCouncilAt ?? 0;
	const bCouncil = b.lastCouncilAt ?? 0;
	if (aCouncil !== bCouncil) return aCouncil > bCouncil;
	if (Boolean(a.proposal) !== Boolean(b.proposal)) return Boolean(a.proposal);
	return a.lastTickAt >= b.lastTickAt;
}
function pickBook(a, b) {
	if (!a) return b;
	if (!b) return a;
	return preferBook(a, b) ? a : b;
}
function isGhostAutopilotFill(fill) {
	if (fill.source !== "autopilot") return false;
	const note = fill.note ?? "";
	return /one probe, no add|desk stayed live/i.test(note);
}
/** Drop leftover independent-autopilot probes (pre-council) and unwind cash/qty. */
function scrubGhostAutopilot(book) {
	const ghosts = book.fills.filter(isGhostAutopilotFill);
	if (!ghosts.length) return book;
	let cash = book.cash;
	let positions = book.positions.map((p) => ({ ...p }));
	for (const fill of ghosts) {
		const signed = fill.side === "buy" ? fill.qty : -fill.qty;
		cash += Math.abs(signed) * fill.price;
		const i = positions.findIndex((p) => p.symbol === fill.symbol);
		if (i < 0) continue;
		const pos = positions[i];
		const qty = pos.qty - signed;
		if (Math.abs(qty) < 1e-6) positions = positions.filter((_, j) => j !== i);
		else positions[i] = {
			...pos,
			qty
		};
	}
	const ghostSym = new Set(ghosts.map((g) => g.symbol));
	const tape = book.tape.filter((row) => {
		if (row.kind === "fill" && row.symbol && ghostSym.has(row.symbol) && /Autopilot/i.test(row.text)) return false;
		if (/stary, samodzielny fill autopilota|leftover independent autopilot/i.test(row.text)) return false;
		if (/Autopilot · (one probe, no add|desk stayed live)/i.test(row.text)) return false;
		return true;
	});
	return {
		...book,
		cash,
		positions,
		fills: book.fills.filter((f) => !isGhostAutopilotFill(f)),
		tape
	};
}
//#endregion
export { recordsFrom as A, liveProposal as C, portfolioStats as D, openCall as E, rollAnchors as M, stampProposal as N, proposalMsLeft as O, humanEntryNote as S, markOpenCalls as T, compactScorecard as _, hitStop as a, explainTrade as b, notionalOk as c, preferBook as d, scrubGhostAutopilot as f, closedFromFill as g, closeCallsFor as h, emptyBook as i, reflectClosed as j, proposerFrom as k, parseStop as l, PROPOSAL_TTL_MS as m, bookLooksLive as n, hlFeeUsd as o, stopSideError as p, catchUpBook as r, idleAgents as s, applyFill as t, pickBook as u, decorateClosed as v, looksLikeReflection as w, humanCloseNote as x, equityOf as y };
