import { o as __toESM } from "../_runtime.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-DQLtvhPD.mjs";
import { i as signOut } from "./client-CVqXY6bk.mjs";
import { i as isLot, n as UNIVERSE, t as STARTING_CASH } from "./universe-8y-43p2g.mjs";
import { a as hasGateSessionMarker } from "./server-DOdXph7E.mjs";
import { a as Settings, c as Minus, d as Briefcase, f as Bell, g as ArrowDownRight, h as ArrowUpRight, l as Gavel, m as BellOff, n as Wallet, o as RotateCcw, p as BellRing, r as Users, t as X, u as ChartColumn } from "../_libs/lucide-react.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as useCurrentUserState, n as Input, r as useCurrentUser, t as Button } from "./use-current-user-BAl_fqJd.mjs";
import { n as newsKeysFrom, r as newsOverlap, t as newsKey } from "./news-key-Zjh6MVHg.mjs";
import { i as loadPerpsAccount, n as createSsrRpc, t as DESK_TO_PERP } from "./hyperliquid-eaqPsVI7.mjs";
import { _ as preferBook, a as bookSame, b as sma, c as closedFromFill, d as equityOf, f as fetchLiveMarket, g as portfolioStats, i as bookLooksLive, l as defaultAnchors, m as notionalOk, n as AGENT_BY_ID, r as applyFill, s as changePct, t as AGENTS, v as rollAnchors, y as rsi } from "./engine-D4bUUxwE.mjs";
import { a as qtyFmt, c as timeAgo, i as pct, n as compactPrice, o as signedClass, r as money, s as signedQty, t as compactMoney } from "./format-oJrLrLck.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as TooltipTrigger, c as LanguageSwitch, d as cn, f as t, h as useT, i as TooltipContent, l as PlaneMark, m as useLocale, n as Route$2, o as useAppearance, p as txError, r as Tooltip, s as APP_NAME, u as TakeoffSplash } from "./router-61qQF9sn.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { n as Root2, r as Trigger, t as List } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DRGdL766.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var KEY = (id) => `zw-tour-v1:${id}`;
var forceOpen = false;
var listeners = /* @__PURE__ */ new Set();
function emit() {
	for (const fn of listeners) fn();
}
function isTourDone(userId) {
	try {
		return localStorage.getItem(KEY(userId)) === "1";
	} catch {
		return false;
	}
}
function markTourDone(userId) {
	try {
		localStorage.setItem(KEY(userId), "1");
	} catch {}
	forceOpen = false;
	emit();
}
function requestTour() {
	forceOpen = true;
	emit();
}
function dismissTour(userId) {
	forceOpen = false;
	markTourDone(userId);
}
function shouldShowTour(userId) {
	if (!userId) return false;
	return forceOpen || !isTourDone(userId);
}
function subscribeTour(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
function tourSnapshot(userId) {
	return shouldShowTour(userId);
}
var STEP_KEYS = [
	{
		kicker: "tour.1.kicker",
		title: "tour.1.title",
		body: "tour.1.body"
	},
	{
		kicker: "tour.2.kicker",
		title: "tour.2.title",
		body: "tour.2.body"
	},
	{
		kicker: "tour.3.kicker",
		title: "tour.3.title",
		body: "tour.3.body"
	},
	{
		kicker: "tour.4.kicker",
		title: "tour.4.title",
		body: "tour.4.body"
	},
	{
		kicker: "tour.5.kicker",
		title: "tour.5.title",
		body: "tour.5.body"
	}
];
function DeskTour({ ready, userId, onOpenSettings }) {
	const t = useT();
	const open = (0, import_react.useSyncExternalStore)(subscribeTour, () => tourSnapshot(userId), () => false);
	const [step, setStep] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (open) setStep(0);
	}, [open]);
	if (!ready || !open || !userId) return null;
	const last = step === STEP_KEYS.length - 1;
	const row = STEP_KEYS[step];
	function finish() {
		dismissTour(userId);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-[60] flex items-end justify-center bg-bg/80 p-3 sm:items-center",
		"data-desk-tour": "open",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-elevated p-4 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaneMark, { className: "size-8" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xs font-medium tracking-wide text-subtle uppercase",
								children: t(row.kicker)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: APP_NAME
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto font-mono text-2xs tabular-nums text-muted",
							children: [
								step + 1,
								"/",
								STEP_KEYS.length
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-lg font-semibold tracking-tight",
					children: t(row.title)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 min-h-0 flex-1 overflow-y-auto text-sm leading-relaxed text-muted",
					children: t(row.body, { app: APP_NAME })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex justify-center gap-1.5",
					children: STEP_KEYS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 rounded-full", i === step ? "w-4 bg-accent" : "w-1.5 bg-surface") }, s.kicker))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [step === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "flex-1",
							onClick: finish,
							children: t("tour.skip")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "flex-1",
							onClick: () => setStep((n) => n - 1),
							children: t("tour.back")
						}), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: finish,
							children: t("tour.gotIt")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: () => setStep((n) => n + 1),
							children: t("tour.next")
						})]
					}), last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "w-full",
						onClick: () => {
							onOpenSettings();
							finish();
						},
						children: t("tour.openSettings")
					}) : null]
				})
			]
		})
	});
}
function replayDeskTour() {
	requestTour();
}
var useTradingMode = create()(persist((set) => ({
	mode: "demo",
	setMode: (mode) => set({ mode })
}), { name: "zw-trading-mode" }));
var reduced = null;
function prefersReduced() {
	if (typeof window === "undefined") return false;
	if (reduced === null) {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		reduced = mq.matches;
		mq.addEventListener("change", () => {
			reduced = mq.matches;
		});
	}
	return reduced;
}
var useMarks = create((set, get) => ({
	marks: {},
	tick: (assets) => {
		const prev = get().marks;
		const quiet = prefersReduced();
		const next = {};
		for (const a of Object.values(assets)) {
			if (!a?.price) continue;
			if (quiet) {
				next[a.symbol] = a.price;
				continue;
			}
			const print = a.price;
			const last = prev[a.symbol] ?? print;
			next[a.symbol] = Math.min(print * 1.0007, Math.max(print * .9993, last + (print - last) * .22 + print * a.vol * .016 * (Math.random() * 2 - 1)));
		}
		set({ marks: next });
	}
}));
function useMark(symbol) {
	return useMarks((s) => s.marks[symbol] ?? 0);
}
var idleAgents = () => AGENTS.map((a) => ({
	id: a.id,
	status: "idle",
	thesis: a.mandate,
	vote: "hold",
	symbol: null,
	conviction: 0
}));
function isQuietNews(text) {
	return /nic nowego|nothing new|already read|this tape|cisza w wiadomo|headlines are quiet|no fresh headlines|brak nowych wiadomo|waiting for the next/i.test(text);
}
function uniqueNewsTape(tape) {
	const out = [];
	for (const row of tape) {
		if (row.kind === "system" && /local heuristics|floor model lagged|model flooru|lokalne heuryst/i.test(row.text)) continue;
		if (row.kind === "news" || row.agentId === "damian") {
			if (out.some((prev) => (prev.kind === "news" || prev.agentId === "damian") && newsOverlap(prev.text, row.text))) continue;
			if (row.agentId === "damian" && isQuietNews(row.text) && out.some((prev) => prev.agentId === "damian" && isQuietNews(prev.text))) continue;
		}
		out.push(row);
	}
	return out;
}
function bookEquity(cash, positions, assets) {
	return equityOf(cash, positions, assets);
}
function emptyAssets() {
	return Object.fromEntries(UNIVERSE.map((u) => [u.symbol, {
		symbol: u.symbol,
		name: u.name,
		price: 0,
		open: 0,
		high: 0,
		low: 0,
		series: [],
		vol: u.vol,
		beta: u.beta,
		livePx: null,
		liveCoin: null
	}]));
}
function quotesToAssets(quotes) {
	const assets = emptyAssets();
	for (const q of quotes) {
		const u = UNIVERSE.find((x) => x.symbol === q.symbol);
		if (!u) continue;
		assets[q.symbol] = {
			symbol: q.symbol,
			name: u.name,
			price: q.price,
			open: q.prevClose,
			high: q.high,
			low: q.low,
			series: q.series.length ? q.series : [{
				t: 1,
				px: q.price
			}],
			vol: u.vol,
			beta: u.beta,
			livePx: q.livePx ?? null,
			liveCoin: q.liveCoin ?? null
		};
	}
	return assets;
}
var bootAssets = null;
var bootKey = "";
var mergeSrc = null;
var mergeBoot = null;
var mergeOut = null;
function installBootQuotes(quotes) {
	if (!quotes.length) return;
	const key = quotes.map((q) => `${q.symbol}:${q.price}`).join("|");
	if (key === bootKey && bootAssets) return;
	bootKey = key;
	bootAssets = quotesToAssets(quotes);
	mergeSrc = null;
	mergeOut = null;
}
function mergeAssets(store) {
	if (!bootAssets) return store;
	if (mergeOut && mergeSrc === store && mergeBoot === bootAssets) return mergeOut;
	const out = { ...bootAssets };
	for (const [k, v] of Object.entries(store)) if (v?.price) out[k] = v;
	mergeSrc = store;
	mergeBoot = bootAssets;
	mergeOut = out;
	return out;
}
function fresh() {
	return {
		clock: 0,
		paused: false,
		assets: emptyAssets(),
		selected: "NVDA",
		cash: STARTING_CASH,
		positions: [],
		fills: [],
		headlines: [],
		tape: [{
			id: "sys-open",
			ts: 0,
			kind: "system",
			text: t("tape.open")
		}],
		agents: idleAgents(),
		autopilot: false,
		convening: false,
		asking: false,
		lastCouncil: null,
		lastAsk: null,
		proposal: null,
		startingEquity: STARTING_CASH,
		periodAnchors: defaultAnchors(STARTING_CASH),
		closedTrades: [],
		feed: "idle",
		lastFeedAt: 0,
		lastAutoAt: 0,
		lastTickAt: 0,
		fillSeq: 0,
		deskEpoch: 0
	};
}
function speechFromCouncil(result) {
	const byId = new Map(result.agents.map((a) => [a.id, a]));
	return AGENTS.map((p) => {
		const a = byId.get(p.id);
		if (!a) return {
			id: p.id,
			status: "idle",
			thesis: p.mandate,
			vote: "hold",
			symbol: null,
			conviction: 0
		};
		return {
			id: a.id,
			status: "spoken",
			thesis: a.thesis,
			vote: a.vote,
			symbol: a.symbol,
			conviction: a.conviction
		};
	});
}
function toDeskBook(s) {
	return {
		cash: s.cash,
		positions: s.positions,
		fills: s.fills.slice(0, 80),
		closedTrades: s.closedTrades.slice(0, 200),
		autopilot: s.autopilot,
		lastCouncil: s.lastCouncil,
		lastAsk: s.lastAsk,
		agents: s.agents.length ? s.agents : idleAgents(),
		startingEquity: s.startingEquity,
		periodAnchors: s.periodAnchors,
		tape: s.tape.slice(0, 80),
		proposal: s.proposal,
		selected: s.selected,
		lastAutoAt: s.lastAutoAt,
		lastTickAt: s.lastTickAt,
		fillSeq: s.fillSeq,
		deskEpoch: s.deskEpoch ?? 0,
		clientUntil: 0
	};
}
function lastAutopilotTs(fills) {
	return fills.find((f) => f.source === "autopilot")?.ts ?? 0;
}
function runAutopilot(get, set) {
	const s = get();
	if (!s.autopilot || s.paused) return;
	if (useTradingMode.getState().mode === "live") return;
	const now = Date.now();
	if (now - Math.max(s.lastAutoAt, lastAutopilotTs(s.fills)) < 6e4) return;
	const snap = get().snapshot();
	if (!snap.tickers.some((t) => t.price > 0)) return;
	const mandate = s.lastCouncil;
	const mood = mandate?.mood ?? "cautious";
	if (mood === "risk-off") return;
	const best = [...snap.tickers.map((t) => {
		const mom = t.changePct;
		const rev = -t.vsSma;
		const wMom = mood === "risk-on" ? .7 : .45;
		let score = wMom * mom + (1 - wMom) * rev;
		if (mandate?.order?.symbol === t.symbol) score += mandate.order.side === "buy" ? 1.2 : -1.2;
		return {
			...t,
			score
		};
	})].sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];
	if (!best || Math.abs(best.score) < .85) return;
	const side = best.score > 0 ? "buy" : "sell";
	const existing = s.positions.find((p) => p.symbol === best.symbol);
	if (existing && Math.abs(existing.qty) > 1e-8) {
		const long = existing.qty > 0;
		const wantLong = side === "buy";
		set({
			lastAutoAt: now,
			lastTickAt: now
		});
		if (long === wantLong) return;
		if (get().closePosition(best.symbol).ok) get().speak({
			kind: "system",
			text: t("tape.autoFlat", { symbol: best.symbol })
		});
		return;
	}
	const raw = snap.book.equity * .03 / best.price;
	const qty = isLot(best.symbol) ? Number(raw.toFixed(4)) : Math.max(1, Math.round(raw));
	set({
		lastAutoAt: now,
		lastTickAt: now
	});
	get().placeOrder({
		symbol: best.symbol,
		side,
		qty,
		source: "autopilot",
		note: "Autopilot · one probe, no add"
	});
}
function preferServerBook(server, local) {
	return preferBook(server, local);
}
var useDesk = create()(persist((set, get) => ({
	hydrated: false,
	...fresh(),
	markHydrated: () => {
		const s = get();
		const assets = {
			...emptyAssets(),
			...s.assets
		};
		for (const u of UNIVERSE) if (!assets[u.symbol]) assets[u.symbol] = emptyAssets()[u.symbol];
		const now = Date.now();
		const eq = bookEquity(s.cash, s.positions, assets);
		set({
			hydrated: true,
			assets,
			clock: s.clock || now,
			periodAnchors: rollAnchors(s.periodAnchors, eq || s.startingEquity),
			tape: uniqueNewsTape(s.tape.map((item) => item.ts === 0 ? {
				...item,
				ts: now
			} : item)),
			agents: (() => {
				const base = s.lastCouncil ? s.agents.some((a) => a.status === "spoken") ? s.agents : speechFromCouncil(s.lastCouncil) : s.agents.length ? s.agents : idleAgents();
				const byId = new Map(base.map((a) => [a.id, a]));
				return AGENTS.map((p) => byId.get(p.id) ?? {
					id: p.id,
					status: "idle",
					thesis: p.mandate,
					vote: "hold",
					symbol: null,
					conviction: 0
				});
			})()
		});
	},
	applyLiveQuotes: (quotes) => {
		const s = get();
		const first = s.lastFeedAt <= 1;
		const assets = { ...s.assets };
		const now = Date.now();
		for (const q of quotes) {
			const prev = assets[q.symbol];
			const u = UNIVERSE.find((x) => x.symbol === q.symbol);
			if (!u) continue;
			assets[q.symbol] = {
				symbol: q.symbol,
				name: u.name,
				price: q.price,
				open: q.prevClose,
				high: q.high,
				low: q.low,
				series: (q.series.length ? q.series : prev?.series ?? [{
					t: now,
					px: q.price
				}]).slice(-120),
				vol: u.vol,
				beta: u.beta,
				livePx: q.livePx ?? prev?.livePx ?? null,
				liveCoin: q.liveCoin ?? prev?.liveCoin ?? null
			};
		}
		set({
			assets,
			clock: now,
			feed: "live",
			lastFeedAt: now
		});
		useMarks.getState().tick(mergeAssets(assets));
		if (first) {
			if (!s.tape.some((row) => row.kind === "system" && (row.text.startsWith("Live tape on") || row.text.startsWith("Ceny na żywo")))) get().speak({
				kind: "system",
				text: t("tape.liveOn")
			});
			if (s.autopilot) runAutopilot(get, set);
		} else runAutopilot(get, set);
	},
	applyHeadlines: (items) => {
		const prev = get();
		const headlines = items.slice(0, 16);
		const seen = /* @__PURE__ */ new Set();
		for (const h of prev.headlines) {
			for (const k of newsKeysFrom(h.text)) seen.add(k);
			if (h.id) seen.add(h.id);
		}
		for (const row of prev.tape) if (row.kind === "news" || row.agentId === "damian") for (const k of newsKeysFrom(row.text)) seen.add(k);
		const prunedTape = uniqueNewsTape(prev.tape);
		set({
			headlines,
			lastTickAt: Date.now(),
			tape: prunedTape
		});
		let spoken = 0;
		for (const h of headlines) {
			if (spoken >= 1) break;
			const k = newsKey(h.text) || h.id;
			if (seen.has(k) || seen.has(h.id)) continue;
			if ([...seen].some((s) => s.length >= 16 && k.length >= 16 && (k.includes(s) || s.includes(k)))) continue;
			seen.add(k);
			for (const extra of newsKeysFrom(h.text)) seen.add(extra);
			get().speak({
				kind: "news",
				agentId: "damian",
				symbol: h.symbol,
				text: h.symbol ? `${h.symbol} · ${h.text}` : h.text
			});
			spoken += 1;
		}
	},
	setFeed: (feed) => set({ feed }),
	select: (symbol) => set({
		selected: symbol,
		lastTickAt: Date.now()
	}),
	setPaused: (paused) => set({ paused }),
	setAutopilot: (on) => {
		set({
			autopilot: on,
			lastTickAt: Date.now()
		});
		get().speak({
			kind: "system",
			text: on ? t("tape.autoOn") : t("tape.autoOff")
		});
	},
	setConvening: (on) => set({ convening: on }),
	setAsking: (on) => set({ asking: on }),
	setAgentStatus: (id, status) => set({ agents: get().agents.map((a) => a.id === id ? {
		...a,
		status
	} : a) }),
	placeOrder: ({ symbol, side, qty, source, note, skipRisk }) => {
		if (useTradingMode.getState().mode === "live") return {
			ok: false,
			error: "Live orders from this desk are not signed yet. Switch to Demo to practice."
		};
		const s = get();
		const asset = mergeAssets(s.assets)[symbol];
		if (!asset || !asset.price) return {
			ok: false,
			error: "Waiting on the live tape."
		};
		const sized = isLot(symbol) || skipRisk ? qty : Math.round(qty);
		if (!Number.isFinite(sized) || sized <= 0) return {
			ok: false,
			error: "Size the ticket."
		};
		const mark = asset.price;
		const spread = isLot(symbol) ? 4e-4 : 25e-5;
		const price = side === "buy" ? mark * (1 + spread) : mark * (1 - spread);
		const priced = mergeAssets(s.assets);
		if (!skipRisk && !notionalOk(s.cash, s.positions, priced, symbol, side, sized, price)) return {
			ok: false,
			error: "Iris veto — size or concentration."
		};
		const nextSeq = s.fillSeq + 1;
		const now = Date.now();
		const fill = {
			id: `f-${now.toString(36)}-${nextSeq.toString(36)}`,
			ts: now,
			symbol,
			side,
			qty: sized,
			price,
			source,
			note
		};
		const next = applyFill(s.cash, s.positions, fill);
		if (!skipRisk && next.cash < -.5) return {
			ok: false,
			error: "Iris veto — not enough cash."
		};
		const closed = closedFromFill(s.positions.find((p) => p.symbol === symbol), fill);
		const closedTrades = closed ? [closed, ...s.closedTrades ?? []].slice(0, 200) : s.closedTrades ?? [];
		const eq = bookEquity(next.cash, next.positions, priced);
		set({
			cash: next.cash,
			positions: next.positions,
			fills: [fill, ...s.fills].slice(0, 80),
			closedTrades,
			fillSeq: nextSeq,
			lastTickAt: now,
			periodAnchors: rollAnchors(s.periodAnchors, eq),
			proposal: s.proposal && s.proposal.symbol === symbol && s.proposal.side === side ? null : s.proposal
		});
		get().speak({
			kind: "fill",
			symbol,
			text: `${side.toUpperCase()} ${sized.toFixed(isLot(symbol) ? 4 : 2)} ${symbol} @ ${price.toFixed(2)}${note ? ` · ${note}` : ""}`
		});
		return {
			ok: true,
			fill
		};
	},
	closePosition: (symbol) => {
		const pos = get().positions.find((p) => p.symbol === symbol);
		if (!pos || Math.abs(pos.qty) < 1e-8) return {
			ok: false,
			error: "No open trade."
		};
		return get().placeOrder({
			symbol,
			side: pos.qty > 0 ? "sell" : "buy",
			qty: Math.abs(pos.qty),
			source: "manual",
			note: "Close",
			skipRisk: true
		});
	},
	applyCouncil: (result, source, opts) => {
		set({
			lastCouncil: result,
			proposal: result.order,
			agents: speechFromCouncil(result),
			convening: false,
			lastTickAt: Date.now()
		});
		get().speak({
			kind: "system",
			text: t(source === "ai" ? "tape.councilAi" : "tape.councilLocal", { summary: result.summary })
		});
		if (!opts?.spoken) for (const a of result.agents) get().speak({
			kind: "agent",
			agentId: a.id,
			symbol: a.symbol ?? void 0,
			text: a.thesis
		});
		if (get().autopilot && result.order) get().executeProposal();
	},
	answerAsk: (question, result, source) => {
		const prev = get().lastAsk;
		const prior = [...prev?.log ?? (prev ? [{
			question: prev.question,
			speaker: prev.speaker,
			text: prev.text
		}] : [])];
		const turn = {
			question,
			speaker: result.speaker,
			text: result.text
		};
		const log = [...prior, turn].slice(-8);
		set({
			lastAsk: {
				...turn,
				log
			},
			asking: false,
			lastTickAt: Date.now(),
			agents: get().agents.map((a) => a.id === result.speaker ? {
				...a,
				thesis: result.text,
				status: "spoken"
			} : a)
		});
		get().speak({
			kind: "agent",
			agentId: result.speaker,
			text: result.text
		});
	},
	executeProposal: () => {
		const s = get();
		if (!s.proposal) return {
			ok: false,
			error: "No ticket on the rail."
		};
		const res = get().placeOrder({
			symbol: s.proposal.symbol,
			side: s.proposal.side,
			qty: s.proposal.qty,
			source: "council",
			note: s.proposal.rationale
		});
		if (!res.ok) return res;
		set({ proposal: null });
		return { ok: true };
	},
	dismissProposal: () => set({
		proposal: null,
		lastTickAt: Date.now()
	}),
	speak: (item) => {
		if (item.kind === "news" || item.agentId === "damian") {
			if (get().tape.some((row) => {
				if (row.kind !== "news" && row.agentId !== "damian") return false;
				return newsOverlap(row.text, item.text);
			})) return;
			if (item.agentId === "damian" && isQuietNews(item.text)) {
				if (get().tape.some((row) => row.agentId === "damian" && isQuietNews(row.text))) return;
			}
		}
		set({ tape: [{
			id: item.id ?? `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
			ts: Date.now(),
			kind: item.kind,
			text: item.text,
			agentId: item.agentId,
			symbol: item.symbol
		}, ...get().tape].slice(0, 120) });
	},
	snapshot: () => {
		const s = get();
		const assets = mergeAssets(s.assets);
		const eq = bookEquity(s.cash, s.positions, assets);
		return {
			tickers: UNIVERSE.flatMap((u) => {
				const a = assets[u.symbol];
				if (!a || !a.price) return [];
				const series = a.series.map((b) => b.px);
				const mean = sma(series, 20);
				return [{
					symbol: a.symbol,
					name: a.name,
					price: a.price,
					open: a.open,
					changePct: changePct(a.price, a.open),
					high: a.high,
					low: a.low,
					rsi: rsi(series),
					vsSma: mean ? (a.price - mean) / mean * 100 : 0,
					livePx: a.livePx,
					liveBps: a.livePx && a.price ? (a.livePx - a.price) / a.price * 1e4 : null
				}];
			}),
			headlines: s.headlines.slice(0, 5).map((h) => ({
				text: h.text,
				symbol: h.symbol,
				shock: h.shock
			})),
			book: {
				cash: s.cash,
				equity: eq,
				dayPnlPct: (eq - s.startingEquity) / s.startingEquity * 100,
				positions: s.positions.map((p) => {
					const px = assets[p.symbol]?.price || p.avg;
					const pnlPct = p.avg ? (px - p.avg) / p.avg * 100 * Math.sign(p.qty || 1) : 0;
					return {
						symbol: p.symbol,
						qty: p.qty,
						avg: p.avg,
						pnlPct
					};
				})
			}
		};
	},
	reset: () => {
		const liveAssets = get().assets;
		const now = Date.now();
		set({
			...fresh(),
			assets: liveAssets,
			lastFeedAt: get().lastFeedAt,
			feed: get().feed,
			clock: now,
			lastTickAt: now,
			deskEpoch: now,
			hydrated: true,
			tape: [{
				id: "sys-open",
				ts: now,
				kind: "system",
				text: t("tape.reset")
			}]
		});
	},
	unveilAgent: (row) => {
		set({ agents: get().agents.map((a) => a.id === row.id ? {
			id: row.id,
			status: "spoken",
			thesis: row.thesis,
			vote: row.vote,
			symbol: row.symbol,
			conviction: row.conviction
		} : a) });
	},
	hydrateBook: (book) => {
		const s = get();
		const current = toDeskBook(s);
		if (bookSame(current, book)) return;
		if (!preferBook(book, current)) return;
		set({
			cash: book.cash,
			positions: book.positions,
			fills: book.fills,
			closedTrades: book.closedTrades,
			autopilot: book.autopilot,
			lastCouncil: book.lastCouncil,
			lastAsk: book.lastAsk,
			agents: Array.isArray(book.agents) && book.agents.length ? AGENTS.map((p) => {
				return book.agents.find((a) => a.id === p.id) ?? {
					id: p.id,
					status: "idle",
					thesis: p.mandate,
					vote: "hold",
					symbol: null,
					conviction: 0
				};
			}) : book.lastCouncil ? speechFromCouncil(book.lastCouncil) : idleAgents(),
			startingEquity: book.startingEquity,
			periodAnchors: book.periodAnchors,
			tape: book.tape.length ? book.tape : s.tape,
			proposal: book.proposal,
			selected: s.selected,
			lastAutoAt: book.lastAutoAt,
			lastTickAt: book.lastTickAt,
			fillSeq: Math.max(s.fillSeq, book.fillSeq),
			deskEpoch: Math.max(s.deskEpoch ?? 0, book.deskEpoch ?? 0)
		});
	},
	touchTick: () => set({ lastTickAt: Date.now() })
}), {
	name: "quorum-desk-v2",
	version: 5,
	skipHydration: true,
	storage: (() => {
		const inner = createJSONStorage(() => localStorage);
		if (!inner) return void 0;
		let last = "";
		return {
			getItem: inner.getItem,
			setItem: (name, value) => {
				const raw = JSON.stringify(value);
				if (raw === last) return;
				last = raw;
				return inner.setItem(name, value);
			},
			removeItem: inner.removeItem
		};
	})(),
	migrate: (persisted, version) => {
		const p = persisted ?? {};
		let cash = typeof p.cash === "number" ? p.cash : STARTING_CASH;
		const startingEquity = typeof p.startingEquity === "number" ? p.startingEquity : STARTING_CASH;
		const positions = Array.isArray(p.positions) ? p.positions : [];
		if (version < 3) {
			const shortColl = positions.filter((pos) => pos.qty < 0).reduce((sum, pos) => sum + Math.abs(pos.qty) * pos.avg, 0);
			cash -= 2 * shortColl;
		}
		return {
			selected: p.selected ?? "NVDA",
			cash,
			positions,
			fills: Array.isArray(p.fills) ? p.fills : [],
			autopilot: Boolean(p.autopilot),
			lastCouncil: p.lastCouncil ?? null,
			lastAsk: p.lastAsk ?? null,
			agents: Array.isArray(p.agents) ? p.agents : [],
			startingEquity,
			tape: Array.isArray(p.tape) ? p.tape.slice(0, 40) : [],
			proposal: p.proposal ?? null,
			periodAnchors: p.periodAnchors ?? defaultAnchors(startingEquity),
			closedTrades: Array.isArray(p.closedTrades) ? p.closedTrades.slice(0, 200) : [],
			lastAutoAt: typeof p.lastAutoAt === "number" ? p.lastAutoAt : 0,
			lastTickAt: typeof p.lastTickAt === "number" ? p.lastTickAt : 0,
			fillSeq: typeof p.fillSeq === "number" ? p.fillSeq : 0,
			deskEpoch: typeof p.deskEpoch === "number" ? p.deskEpoch : 0
		};
	},
	partialize: (s) => ({
		selected: s.selected,
		cash: s.cash,
		positions: s.positions,
		fills: s.fills.slice(0, 80),
		autopilot: s.autopilot,
		lastCouncil: s.lastCouncil,
		lastAsk: s.lastAsk,
		agents: s.agents,
		startingEquity: s.startingEquity,
		tape: s.tape.slice(0, 40),
		proposal: s.proposal,
		periodAnchors: s.periodAnchors,
		closedTrades: s.closedTrades.slice(0, 200),
		lastAutoAt: s.lastAutoAt,
		lastTickAt: s.lastTickAt,
		fillSeq: s.fillSeq,
		deskEpoch: s.deskEpoch ?? 0
	}),
	merge: (persisted, current) => {
		const p = persisted ?? {};
		const next = {
			...current,
			selected: p.selected ?? current.selected,
			cash: typeof p.cash === "number" ? p.cash : current.cash,
			positions: Array.isArray(p.positions) ? p.positions : current.positions,
			fills: Array.isArray(p.fills) ? p.fills : current.fills,
			autopilot: Boolean(p.autopilot),
			lastCouncil: p.lastCouncil !== void 0 ? p.lastCouncil : current.lastCouncil,
			lastAsk: p.lastAsk !== void 0 ? p.lastAsk : current.lastAsk,
			agents: Array.isArray(p.agents) && p.agents.length ? p.agents : current.agents,
			startingEquity: typeof p.startingEquity === "number" ? p.startingEquity : current.startingEquity,
			tape: uniqueNewsTape(Array.isArray(p.tape) && p.tape.length ? p.tape : current.tape),
			proposal: p.proposal !== void 0 ? p.proposal : current.proposal,
			periodAnchors: p.periodAnchors ?? current.periodAnchors,
			closedTrades: Array.isArray(p.closedTrades) ? p.closedTrades : current.closedTrades,
			lastAutoAt: typeof p.lastAutoAt === "number" ? p.lastAutoAt : current.lastAutoAt,
			lastTickAt: typeof p.lastTickAt === "number" ? p.lastTickAt : current.lastTickAt,
			fillSeq: typeof p.fillSeq === "number" ? p.fillSeq : current.fillSeq,
			deskEpoch: typeof p.deskEpoch === "number" ? p.deskEpoch : current.deskEpoch
		};
		const curBook = toDeskBook(current);
		const nextBook = toDeskBook(next);
		if (bookLooksLive(curBook) && !preferBook(nextBook, curBook)) return current;
		return next;
	}
}));
function bindDeskStorage(userId) {
	useDesk.persist.setOptions({ name: `quorum-desk-${userId}` });
}
function liveAssets() {
	return mergeAssets(useDesk.getState().assets);
}
function useFeed() {
	const feed = useDesk((s) => s.feed);
	if (feed !== "idle") return feed;
	return bootAssets ? "live" : feed;
}
function useAssets() {
	return mergeAssets(useDesk((s) => s.assets));
}
function useSelectedTape() {
	const selected = useDesk((s) => s.selected);
	return mergeAssets(useDesk((s) => s.assets))[selected];
}
function useSelectedMark() {
	const selected = useDesk((s) => s.selected);
	return useMarks((s) => s.marks[selected] ?? 0);
}
var markedSrc = null;
var markedMarks = null;
var markedOut = null;
/** Official tape + 400ms mark overlay for live numbers. */
function useMarkedAssets() {
	const assets = useAssets();
	const marks = useMarks((s) => s.marks);
	if (markedOut && markedSrc === assets && markedMarks === marks) return markedOut;
	const out = { ...assets };
	for (const [sym, px] of Object.entries(marks)) {
		const row = out[sym];
		if (!row || !px) continue;
		out[sym] = {
			...row,
			price: px
		};
	}
	markedSrc = assets;
	markedMarks = marks;
	markedOut = out;
	return out;
}
var OrderTicket = (0, import_react.memo)(function OrderTicket() {
	const selected = useDesk((s) => s.selected);
	const assets = useAssets();
	const asset = assets[selected];
	const cash = useDesk((s) => s.cash);
	const positions = useDesk((s) => s.positions);
	const placeOrder = useDesk((s) => s.placeOrder);
	const closePosition = useDesk((s) => s.closePosition);
	const id = (0, import_react.useId)();
	const [side, setSide] = (0, import_react.useState)("buy");
	const [qty, setQty] = (0, import_react.useState)("10");
	const t$1 = useT();
	const lot = isLot(selected);
	const pos = positions.find((p) => p.symbol === selected);
	const equity = bookEquity(cash, positions, assets);
	const parsed = Number(qty);
	const notional = asset && Number.isFinite(parsed) ? parsed * asset.price : 0;
	const presets = (0, import_react.useMemo)(() => {
		if (!asset) return [];
		return [
			{
				label: "10%",
				pct: .1
			},
			{
				label: "25%",
				pct: .25
			},
			{
				label: t$1("ticket.max"),
				pct: .4
			}
		].map((p) => ({
			...p,
			qty: lot ? equity * p.pct / asset.price : Math.max(1, Math.round(equity * p.pct / asset.price))
		}));
	}, [
		asset,
		equity,
		lot,
		t$1
	]);
	if (!asset) return null;
	function submit() {
		const n = Number(qty);
		const res = placeOrder({
			symbol: selected,
			side,
			qty: n,
			source: "manual"
		});
		if (!res.ok) {
			toast.error(txError(res.error));
			return;
		}
		toast.success(t("ticket.filled", {
			side: t$1(side === "buy" ? "ticket.buyCap" : "ticket.sellCap"),
			symbol: selected
		}));
	}
	function close() {
		const res = closePosition(selected);
		if (!res.ok) {
			toast.error(txError(res.error));
			return;
		}
		toast.success(t("ticket.closed", { symbol: selected }));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-elevated p-2.5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 lg:flex-row lg:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex shrink-0 gap-1 rounded-lg bg-surface p-1",
						children: ["buy", "sell"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setSide(s),
							className: cn("h-9 flex-1 rounded-md px-3 text-sm font-medium capitalize transition-[background-color,color] duration-[var(--motion-quick)] lg:flex-none", side === s ? s === "buy" ? "bg-up/20 text-up" : "bg-down/20 text-down" : "text-muted hover:text-fg"),
							children: t$1(s === "buy" ? "ticket.buy" : "ticket.sell")
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 flex-1 items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: id,
								className: "sr-only",
								children: t$1("ticket.qtyAria")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id,
								inputMode: "decimal",
								value: qty,
								onChange: (e) => setQty(e.target.value),
								className: "h-11 font-mono tabular-nums lg:h-9 lg:max-w-28"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden font-mono text-xs text-muted tabular-nums lg:block",
								children: compactPrice(notional)
							}),
							presets.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setQty(qtyFmt(p.qty, lot)),
								className: "hidden h-9 rounded-md px-2 text-2xs font-medium text-muted transition-colors duration-[var(--motion-quick)] hover:text-fg lg:inline-flex lg:items-center",
								children: p.label
							}, p.label))
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: side === "buy" ? "buy" : "sell",
							className: "h-11 min-w-0 flex-1 lg:w-auto lg:flex-none lg:px-4",
							onClick: submit,
							disabled: !asset.price,
							children: [
								side === "buy" ? t$1("ticket.buyCap") : pos && pos.qty > 0 ? t$1("ticket.sellCap") : t$1("ticket.shortCap"),
								" ",
								asset.symbol
							]
						}), pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							className: "h-11 px-4",
							onClick: close,
							disabled: !asset.price,
							children: t$1("ticket.close")
						}) : null]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex gap-1 lg:hidden",
				children: [presets.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setQty(qtyFmt(p.qty, lot)),
					className: "h-11 flex-1 rounded-md bg-surface text-2xs font-medium text-muted",
					children: p.label
				}, p.label)), pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setQty(qtyFmt(Math.abs(pos.qty), lot)),
					className: "h-11 flex-1 rounded-md bg-surface text-2xs font-medium text-muted",
					children: t$1("ticket.flat")
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1.5 font-mono text-2xs text-muted tabular-nums lg:mt-1",
				children: [pos ? t$1(pos.qty >= 0 ? "ticket.heldLong" : "ticket.heldShort", {
					qty: signedQty(pos.qty, lot),
					avg: compactPrice(pos.avg)
				}) : side === "sell" ? t$1("ticket.sellOpens") : t$1("ticket.noPos"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "lg:hidden",
					children: [" · ", compactPrice(notional)]
				})]
			})
		]
	});
});
var Sparkline = (0, import_react.memo)(function Sparkline({ data, up, className }) {
	if (data.length < 2) return null;
	const min = Math.min(...data);
	const span = Math.max(...data) - min || 1;
	const w = 72;
	const h = 22;
	const d = data.map((v, i) => {
		const x = i / (data.length - 1) * w;
		const y = h - (v - min) / span * 20 - 1;
		return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: w,
		height: h,
		viewBox: `0 0 ${w} ${h}`,
		className: cn("overflow-visible", up ? "text-up" : "text-down", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})
	});
});
/** Full-width tape. SVG only — Recharts froze the desk. */
var PriceArea = (0, import_react.memo)(function PriceArea({ values, up }) {
	if (values.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center text-sm text-muted",
		children: "Waiting on the tape."
	});
	const min = Math.min(...values);
	const span = Math.max(...values) - min || 1;
	const w = 240;
	const h = 88;
	const padY = 4;
	const line = values.map((v, i) => {
		const x = i / (values.length - 1) * w;
		const y = padY + (1 - (v - min) / span) * 80;
		return `${x.toFixed(2)} ${y.toFixed(2)}`;
	}).map((c, i) => `${i === 0 ? "M" : "L"}${c}`).join(" ");
	const area = `${line} L${w} ${h} L0 ${h} Z`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		preserveAspectRatio: "none",
		className: cn("h-full w-full", up ? "text-up" : "text-down"),
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: area,
			fill: "currentColor",
			opacity: .22
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: line,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.6",
			strokeLinejoin: "round",
			strokeLinecap: "round",
			vectorEffect: "non-scaling-stroke"
		})]
	});
});
function ChartPanel() {
	const asset = useSelectedTape();
	const selected = useDesk((s) => s.selected);
	const t = useT();
	if (!asset) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center text-sm text-muted",
		children: t("chart.select")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChart, {
			asset,
			selected
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-10 shrink-0 bg-surface pt-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTicket, {})
		})]
	});
}
function LiveChart({ asset, selected }) {
	const t = useT();
	const px = useSelectedMark() || asset.price;
	const chg = changePct(px, asset.open);
	const up = chg >= 0;
	const bars = asset.series.slice(-90).map((b) => b.px);
	const last = px;
	const values = last ? bars.length ? [...bars, last] : [last] : bars;
	const liveBps = asset.livePx && asset.price ? (asset.livePx - asset.price) / asset.price * 1e4 : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 flex-wrap items-end justify-between gap-3 pb-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-chart-symbol": asset.symbol,
					className: "text-lg font-semibold tracking-tight",
					children: asset.symbol
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-muted",
					children: asset.name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-baseline gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-2xl tabular-nums tracking-tight",
					children: px ? compactPrice(px) : "—"
				}), px ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-sm tabular-nums ${signedClass(chg)}`,
					children: pct(chg)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-subtle",
					children: t("chart.connecting")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-2xs text-subtle",
				children: [t("chart.yahoo"), asset.livePx ? ` · ${t("chart.hlMid", { px: compactPrice(asset.livePx) })}${liveBps != null ? ` (${liveBps >= 0 ? "+" : ""}${liveBps.toFixed(0)} bps)` : ""}` : ` · ${t("chart.hlPending")}`]
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
			className: "flex gap-4 font-mono text-2xs tabular-nums text-muted",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-subtle",
					children: t("chart.tf")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-fg",
					children: "1m"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-subtle",
					children: t("chart.prev")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-fg",
					children: asset.open ? compactPrice(asset.open) : "—"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-subtle",
					children: t("chart.high")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-fg",
					children: asset.high ? compactPrice(asset.high) : "—"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-subtle",
					children: t("chart.low")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "text-fg",
					children: asset.low ? compactPrice(asset.low) : "—"
				})] })
			]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "relative min-h-[12rem] w-full flex-1 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceArea, {
			values,
			up
		}, selected)
	})] });
}
function TapePanel() {
	const tape = useDesk((s) => s.tape);
	const clock = useDesk((s) => s.clock);
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("tape.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "min-h-0 flex-1 space-y-1 overflow-y-auto pr-1",
			children: tape.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-1 text-sm text-muted",
				children: t("tape.wait")
			}) : tape.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "grid grid-cols-[4.5rem_1fr] gap-2 rounded-lg px-1 py-1.5 text-xs leading-relaxed",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-2xs text-subtle tabular-nums",
					children: [timeAgo(item.ts, clock), item.kind === "agent" && item.agentId ? ` · ${AGENT_BY_ID[item.agentId].name}` : item.kind === "fill" ? ` · ${t("tape.fill")}` : item.kind === "news" ? ` · ${item.agentId ? AGENT_BY_ID[item.agentId].name : t("tape.wire")}` : ""]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("text-muted", item.kind === "fill" && "text-fg", item.kind === "agent" && "text-fg"),
					children: item.text
				})]
			}, item.id))
		})]
	});
}
var badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", {
	variants: { variant: {
		default: "bg-elevated text-muted",
		accent: "bg-accent text-accent-fg",
		up: "bg-up/15 text-up",
		down: "bg-down/15 text-down",
		live: "bg-elevated text-fg"
	} },
	defaultVariants: { variant: "default" }
});
function Badge({ className, variant, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn(badgeVariants({ variant }), className),
		...props
	});
}
function Switch({ checked, onCheckedChange, className, disabled, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		disabled,
		onClick: () => onCheckedChange(!checked),
		className: cn("relative inline-flex h-6 w-10 shrink-0 items-center rounded-full bg-elevated shadow-[var(--shadow-border)] transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 data-[on=true]:bg-accent", className),
		"data-on": checked,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none block size-5 rounded-full bg-fg transition-transform duration-[var(--motion-fast)] ease-[var(--ease-smooth-out)]", checked ? "translate-x-[18px] bg-accent-fg" : "translate-x-0.5") })
	});
}
function Tabs({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root2, {
		className: cn("flex flex-col gap-3", className),
		...props
	});
}
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-11 items-center justify-center gap-1 rounded-lg bg-elevated p-1", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-9 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium text-muted transition-[background-color,color] duration-[var(--motion-quick)] ease-[var(--ease-out)] outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 data-[state=active]:bg-surface data-[state=active]:text-fg", className),
		...props
	});
}
function CouncilPanel({ onAsk }) {
	const [pane, setPane] = (0, import_react.useState)("agents");
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
			value: pane,
			onValueChange: (v) => setPane(v),
			className: "flex h-full min-h-0 flex-col gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
				className: "w-full shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "agents",
						className: "text-2xs sm:text-sm",
						children: t("floor.agents")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "chat",
						className: "text-2xs sm:text-sm",
						children: t("floor.chat")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "tape",
						className: "text-2xs sm:text-sm",
						children: t("floor.tape")
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-hidden",
				children: pane === "agents" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentsPane, {}) : pane === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPane, { onAsk }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapePanel, {})
			})]
		})
	});
}
function AgentsPane() {
	const agents = useDesk((s) => s.agents);
	const lastCouncil = useDesk((s) => s.lastCouncil);
	const proposal = useDesk((s) => s.proposal);
	const executeProposal = useDesk((s) => s.executeProposal);
	const dismissProposal = useDesk((s) => s.dismissProposal);
	const autopilot = useDesk((s) => s.autopilot);
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const mode = useTradingMode((s) => s.mode);
	const t = useT();
	function fill() {
		const res = executeProposal();
		if (!res.ok) toast.error(txError(res.error));
		else toast.success(t("floor.filled"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 items-center justify-between gap-2 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("floor.council")
				}), lastCouncil ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: lastCouncil.mood === "risk-off" ? "down" : lastCouncil.mood === "risk-on" ? "up" : "default",
					children: t(`mood.${lastCouncil.mood}`)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xs text-subtle",
					children: t("floor.idle")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2 lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xs font-medium text-muted",
					children: autopilot ? t("floor.autopilotLive") : t("header.autopilot")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
					checked: autopilot,
					onCheckedChange: setAutopilot,
					disabled: mode === "live",
					"aria-label": t("header.autopilot")
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: AGENTS.map((persona) => {
					const speech = agents.find((a) => a.id === persona.id);
					const reading = speech?.status === "reading";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "rounded-lg bg-elevated p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent",
								children: persona.mark
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium",
										children: persona.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-2xs text-subtle",
										children: t(`role.${persona.id}`)
									})] }), speech ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteChip, {
										vote: speech.vote,
										symbol: speech.symbol
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1.5 text-xs leading-relaxed text-muted", reading && "shimmer-text"),
									children: reading ? t("floor.reading") : lastCouncil ? speech?.thesis ?? t(`mandate.${persona.id}`) : t(`mandate.${persona.id}`)
								})]
							})]
						})
					}, persona.id);
				})
			}), proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: t("floor.proposed")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 font-mono text-sm tabular-nums",
						children: [
							proposal.side.toUpperCase(),
							" ",
							qtyFmt(proposal.qty, isLot(proposal.symbol)),
							" ",
							proposal.symbol
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs leading-relaxed text-muted",
						children: proposal.rationale
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							size: "sm",
							onClick: fill,
							children: t("floor.place")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							size: "sm",
							variant: "ghost",
							onClick: dismissProposal,
							children: t("floor.dismiss")
						})]
					})
				]
			}) : null]
		})]
	});
}
function ChatPane({ onAsk }) {
	const asking = useDesk((s) => s.asking);
	const convening = useDesk((s) => s.convening);
	const lastAsk = useDesk((s) => s.lastAsk);
	const selected = useDesk((s) => s.selected);
	const positions = useDesk((s) => s.positions);
	const [q, setQ] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	const t = useT();
	const thread = lastAsk?.log?.length ? lastAsk.log : lastAsk ? [{
		question: lastAsk.question,
		speaker: lastAsk.speaker,
		text: lastAsk.text
	}] : [];
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [
		thread.length,
		asking,
		lastAsk?.text
	]);
	const chips = [
		t("floor.chipTell", { symbol: selected }),
		positions[0] ? t("floor.chipClose", { symbol: positions[0].symbol }) : t("floor.chipProbe", { symbol: selected }),
		t("floor.chipWire")
	];
	async function submitAsk(e) {
		e.preventDefault();
		const text = q.trim();
		if (!text) return;
		setQ("");
		await onAsk(text);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: scroller,
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1",
			children: thread.length === 0 && !asking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 pt-2 text-sm leading-relaxed text-muted",
				children: t("floor.askEmpty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2 pb-2",
				children: [thread.map((turn, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xs font-medium tracking-wide text-subtle uppercase",
							children: t("floor.you")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm leading-relaxed text-fg",
							children: turn.question
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xs font-medium tracking-wide text-subtle uppercase",
							children: AGENT_BY_ID[turn.speaker].name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-fg",
							children: turn.text
						})]
					})]
				}, `${turn.question}-${i}`)), asking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: t("floor.ask")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-sm leading-relaxed text-muted shimmer-text",
						children: t("floor.onWire")
					})]
				}) : null]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shrink-0 space-y-2 border-t border-border pt-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: chips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void onAsk(c),
					disabled: asking || convening,
					className: "rounded-md bg-surface px-2 py-1 text-2xs text-muted hover:text-fg disabled:opacity-50",
					children: c
				}, c))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submitAsk,
				className: "flex flex-col gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: t("floor.askPh"),
						disabled: asking,
						className: "h-11"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "secondary",
						disabled: asking || !q.trim(),
						className: "px-4",
						children: asking ? "…" : t("floor.ask")
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-0.5 text-2xs leading-relaxed text-subtle",
					children: t("floor.askHint")
				})]
			})]
		})]
	});
}
function VoteChip({ vote, symbol }) {
	const t = useT();
	if (vote === "hold") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 text-2xs font-medium text-subtle",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" }), t("floor.hold")]
	});
	const Icon = vote === "buy" ? ArrowUpRight : ArrowDownRight;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 font-mono text-2xs font-medium tabular-nums", vote === "buy" ? "text-up" : "text-down"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3" }),
			vote === "buy" ? t("ticket.buyCap") : t("ticket.sellCap"),
			symbol ? ` ${symbol}` : ""
		]
	});
}
var getPushPublicKey = createServerFn({ method: "GET" }).handler(createSsrRpc("95fcd8f79dd8754227ad02b43e9237b62a286d94d18c2bbc4c2d56acaaa19276"));
var savePushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("11dcb0543b2739f8307b9fabfe4ff2c13d11fd5e0464f717908c2456bf5e2e27"));
var dropPushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ebf9a024314c19b45a067453fa6b269b5bf70177db374a41c0324456e6b8027a"));
var SEEN_KEY = "quorum-alerts-seen";
function withTimeout(p, ms) {
	return Promise.race([p, new Promise((_, reject) => {
		window.setTimeout(() => reject(/* @__PURE__ */ new Error("timeout")), ms);
	})]);
}
function urlBase64ToUint8Array(base64) {
	const padding = "=".repeat((4 - base64.length % 4) % 4);
	const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
	const out = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
	return out;
}
function permissionOf() {
	if (typeof window === "undefined") return "unsupported";
	if (!("Notification" in window)) return "unsupported";
	return Notification.permission;
}
function readSeen() {
	if (typeof window === "undefined") return 0;
	const n = Number(window.sessionStorage.getItem(SEEN_KEY) ?? 0);
	return Number.isFinite(n) ? n : 0;
}
function writeSeen(ts) {
	try {
		window.sessionStorage.setItem(SEEN_KEY, String(ts));
	} catch {}
}
function placeInbox(anchor) {
	const pad = 12;
	const width = Math.min(328, window.innerWidth - 24);
	const left = Math.min(Math.max(pad, anchor.right - width), window.innerWidth - width - pad);
	return {
		top: Math.min(anchor.bottom + 8, window.innerHeight - pad),
		left,
		width
	};
}
function usePushAlerts() {
	const [state, setState] = (0, import_react.useState)("off");
	(0, import_react.useEffect)(() => {
		const perm = permissionOf();
		if (perm === "granted") {
			setState("on");
			subscribe(false);
		} else if (perm === "denied" || perm === "unsupported") setState("blocked");
	}, []);
	async function subscribe(prompt) {
		if (typeof window === "undefined") return false;
		if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
			if (prompt) toast.message(t("alerts.needApp"));
			setState("blocked");
			return false;
		}
		setState("busy");
		try {
			const perm = prompt ? await Notification.requestPermission() : Notification.permission;
			if (perm !== "granted") {
				setState(perm === "denied" ? "blocked" : "off");
				if (prompt) toast.message(t("alerts.blockedToast"));
				return false;
			}
			const reg = await withTimeout(navigator.serviceWorker.register("/desk-sw.js", { scope: "/" }), 3e3);
			await withTimeout(navigator.serviceWorker.ready, 3e3);
			const { publicKey } = await withTimeout(getPushPublicKey(), 4e3);
			let sub = await reg.pushManager.getSubscription();
			if (!sub) sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(publicKey)
			});
			const json = sub.toJSON();
			const p256dh = json.keys?.p256dh;
			const auth = json.keys?.auth;
			if (!json.endpoint || !p256dh || !auth) throw new Error("bad sub");
			await savePushSubscription({ data: {
				endpoint: json.endpoint,
				keys: {
					p256dh,
					auth
				}
			} });
			setState("on");
			if (prompt) {
				await reg.showNotification(t("alerts.onTitle"), {
					body: t("alerts.onBody"),
					tag: "quorum-ready",
					icon: "/__grok/icon-180.png"
				});
				toast.success(t("alerts.onToast"));
			}
			return true;
		} catch {
			setState("blocked");
			if (prompt) toast.message(t("alerts.needStandalone"));
			return false;
		}
	}
	async function unsubscribe() {
		setState("busy");
		try {
			const sub = await (await navigator.serviceWorker.getRegistration("/"))?.pushManager.getSubscription();
			if (sub) {
				await dropPushSubscription({ data: { endpoint: sub.endpoint } });
				await sub.unsubscribe();
			}
		} catch {}
		setState("off");
		toast.message(t("alerts.offToast"));
	}
	return {
		state,
		on: state === "on",
		blocked: state === "blocked",
		busy: state === "busy",
		subscribe,
		unsubscribe
	};
}
function AlertsButton({ className }) {
	const tt = useT();
	const fills = useDesk((s) => s.fills);
	const clock = useDesk((s) => s.clock);
	const push = usePushAlerts();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [seen, setSeen] = (0, import_react.useState)(0);
	const [pos, setPos] = (0, import_react.useState)(null);
	const root = (0, import_react.useRef)(null);
	const panel = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setSeen(readSeen());
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const update = () => {
			const box = root.current?.getBoundingClientRect();
			if (box) setPos(placeInbox(box));
		};
		update();
		window.addEventListener("resize", update);
		window.addEventListener("scroll", update, true);
		const onDown = (e) => {
			const t = e.target;
			if (root.current?.contains(t) || panel.current?.contains(t)) return;
			setOpen(false);
		};
		const onKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			window.removeEventListener("resize", update);
			window.removeEventListener("scroll", update, true);
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);
	const unread = (fills[0]?.ts ?? 0) > seen;
	const Icon = push.blocked ? BellOff : unread ? BellRing : Bell;
	function toggle() {
		const next = !open;
		setOpen(next);
		if (next) {
			const ts = Date.now();
			writeSeen(ts);
			setSeen(ts);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "icon-sm",
			"aria-label": tt("alerts.aria"),
			"aria-expanded": open,
			className,
			onClick: toggle,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-4", unread ? "text-fg" : "text-muted") }), unread ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1.5 right-1.5 size-1.5 rounded-full bg-accent" }) : null]
		}), open && pos && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: panel,
			role: "dialog",
			"aria-label": tt("alerts.title"),
			className: "overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]",
			style: {
				position: "fixed",
				top: pos.top,
				left: pos.left,
				width: pos.width,
				zIndex: 80
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-border px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: tt("alerts.title")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-2xs text-subtle tabular-nums",
						children: fills.length
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "max-h-72 overflow-y-auto",
					children: fills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-3 py-6 text-sm leading-relaxed text-muted",
						children: tt("alerts.emptyBody")
					}) : fills.slice(0, 24).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-b border-border px-3 py-2.5 last:border-b-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("font-mono text-xs font-medium tabular-nums", f.side === "buy" ? "text-up" : "text-down"),
								children: [
									f.side.toUpperCase(),
									" ",
									qtyFmt(f.qty, isLot(f.symbol)),
									" ",
									f.symbol
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-2xs text-subtle tabular-nums",
								children: timeAgo(f.ts, clock)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-0.5 font-mono text-2xs text-muted tabular-nums",
							children: [
								"@",
								f.price.toFixed(2),
								f.note ? ` · ${f.note}` : ` · ${f.source}`
							]
						})]
					}, f.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 border-t border-border px-3 py-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xs font-medium",
						children: tt("alerts.away")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs leading-relaxed text-subtle",
						children: push.blocked ? tt("alerts.blocked") : tt("alerts.awayOn")
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: push.on,
						disabled: push.blocked || push.busy,
						onCheckedChange: (on) => {
							if (on) push.subscribe(true);
							else push.unsubscribe();
						},
						"aria-label": tt("alerts.awayAria")
					})]
				})
			]
		}), document.body) : null]
	});
}
function Dialog({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog$1, { ...props });
}
function DialogTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger$1, { ...props });
}
function DialogPortal({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogPortal$1, { ...props });
}
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] outline-none", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 flex size-9 items-center justify-center rounded-md text-muted transition-colors duration-[var(--motion-quick)] hover:bg-elevated hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 pr-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-base font-semibold tracking-tight text-fg", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm leading-relaxed text-muted", className),
		...props
	});
}
var ARBITRUM = {
	chainId: "0xa4b1",
	chainName: "Arbitrum One",
	nativeCurrency: {
		name: "Ether",
		symbol: "ETH",
		decimals: 18
	},
	rpcUrls: ["https://arb1.arbitrum.io/rpc"],
	blockExplorerUrls: ["https://arbiscan.io"]
};
/** Hyperliquid Bridge2 on Arbitrum. Native USDC transfer credits the sender. Min 5 USDC. */
var HL_BRIDGE = "0x2Df1c51E09aECF9cacB7bc98cB1742757f163dF7";
var USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
/** Comfortable pad so gas never blocks a second try. ≈ $2–3 at ~$2.5k ETH. */
var ARB_ETH_KEEP = .001;
/** Below this, MetaMask often fails even though a single transfer is cheaper. */
var ARB_ETH_WARN = 5e-5;
function getEthereum() {
	if (typeof window === "undefined") return null;
	const raw = window.ethereum;
	if (!raw) return null;
	return raw.providers?.find((p) => p.isMetaMask) ?? raw;
}
function isAddress(value) {
	return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}
function shortAddress(value) {
	const a = value.trim();
	if (a.length < 12) return a;
	return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function mmError(err) {
	const e = err;
	if (e?.code === 4001) return "Rejected in MetaMask.";
	const msg = e?.message ?? "";
	if (/user rejected/i.test(msg)) return "Rejected in MetaMask.";
	return msg || "Transaction failed";
}
async function requestMetaMaskAccounts() {
	const eth = getEthereum();
	if (!eth) {
		if (typeof window !== "undefined") {
			const host = window.location.host;
			const path = `${window.location.pathname}${window.location.search}`;
			window.open(`https://metamask.app.link/dapp/${host}${path}`, "_blank", "noopener,noreferrer");
		}
		throw new Error("Open this desk inside MetaMask, or install the extension.");
	}
	const accounts = await eth.request({ method: "eth_requestAccounts" });
	const first = (Array.isArray(accounts) ? accounts.filter((a) => typeof a === "string") : [])[0];
	if (!first || !isAddress(first)) throw new Error("MetaMask did not return an account.");
	return first;
}
async function ensureArbitrum(eth) {
	const id = await eth.request({ method: "eth_chainId" });
	if (typeof id === "string" && id.toLowerCase() === ARBITRUM.chainId) return;
	try {
		await eth.request({
			method: "wallet_switchEthereumChain",
			params: [{ chainId: ARBITRUM.chainId }]
		});
	} catch (err) {
		if (err.code === 4902) {
			await eth.request({
				method: "wallet_addEthereumChain",
				params: [ARBITRUM]
			});
			return;
		}
		throw err;
	}
}
function pad32(hex) {
	return hex.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}
function usdcUnits(amount) {
	if (!Number.isFinite(amount) || amount <= 0) return 0n;
	return BigInt(Math.round(amount * 1e6));
}
function encodeUsdcTransfer(to, units) {
	return `0xa9059cbb${pad32(to)}${pad32(units.toString(16))}`;
}
async function waitForTx(eth, hash, timeoutMs = 9e4) {
	const start = Date.now();
	while (Date.now() - start < timeoutMs) {
		const receipt = await eth.request({
			method: "eth_getTransactionReceipt",
			params: [hash]
		});
		if (receipt && typeof receipt === "object") {
			const status = receipt.status;
			if (status === "0x0") throw new Error("Deposit reverted on Arbitrum.");
			if (status === "0x1" || status === "1") return;
		}
		await new Promise((r) => setTimeout(r, 2e3));
	}
	throw new Error("Timed out waiting for the deposit.");
}
async function depositUsdcToHyperliquid(from, amount) {
	if (amount + 1e-9 < 5) throw new Error(`Hyperliquid min is $5. Under that is lost.`);
	const units = usdcUnits(amount);
	if (units <= 0n) throw new Error("Enter an amount.");
	const eth = getEthereum();
	if (!eth) throw new Error("Open this desk inside MetaMask.");
	const accounts = await eth.request({ method: "eth_requestAccounts" });
	const signer = (Array.isArray(accounts) ? accounts.filter((a) => typeof a === "string") : [])[0]?.toLowerCase();
	if (!signer) throw new Error("MetaMask did not return an account.");
	if (signer !== from.trim().toLowerCase()) throw new Error("Connected MetaMask is a different address. Switch account.");
	await ensureArbitrum(eth);
	const hash = await eth.request({
		method: "eth_sendTransaction",
		params: [{
			from: signer,
			to: USDC_ARB,
			data: encodeUsdcTransfer(HL_BRIDGE, units),
			chainId: ARBITRUM.chainId
		}]
	});
	if (typeof hash !== "string" || !hash.startsWith("0x")) throw new Error("MetaMask did not return a transaction.");
	await waitForTx(eth, hash);
	return hash;
}
async function pull(address) {
	const res = await loadPerpsAccount({ data: { address } });
	if (!res.ok) throw new Error(res.error);
	return res.account;
}
function applyAccount(account, extra = {}) {
	return {
		address: account.address,
		equity: account.equity,
		withdrawable: account.withdrawable,
		hlSpotUsdc: account.hlSpotUsdc,
		depositGasEth: account.depositGasEth,
		wallet: account.wallet,
		positions: account.positions,
		status: "live",
		error: null,
		...extra
	};
}
var useLiveWallet = create()(persist((set, get) => ({
	address: null,
	source: null,
	equity: null,
	withdrawable: null,
	hlSpotUsdc: null,
	depositGasEth: null,
	wallet: null,
	positions: [],
	status: "idle",
	depositing: false,
	lastTx: null,
	error: null,
	connectMetaMask: async () => {
		set({
			status: "connecting",
			error: null
		});
		try {
			set(applyAccount(await pull(await requestMetaMaskAccounts()), { source: "metamask" }));
		} catch (err) {
			set({
				status: "error",
				error: err instanceof Error ? err.message : "Could not connect MetaMask"
			});
		}
	},
	watchAddress: async (raw) => {
		const address = raw.trim();
		if (!isAddress(address)) {
			set({
				status: "error",
				error: "Paste a 0x address."
			});
			return;
		}
		set({
			status: "connecting",
			error: null
		});
		try {
			set(applyAccount(await pull(address), { source: "watch" }));
		} catch (err) {
			set({
				status: "error",
				error: err instanceof Error ? err.message : "Hyperliquid quiet"
			});
		}
	},
	refresh: async () => {
		const address = get().address;
		if (!address) return;
		try {
			set(applyAccount(await pull(address)));
		} catch (err) {
			set({
				status: "error",
				error: err instanceof Error ? err.message : "Hyperliquid quiet"
			});
		}
	},
	deposit: async (amount) => {
		const address = get().address;
		if (!address) throw new Error("Connect MetaMask first.");
		set({
			depositing: true,
			error: null
		});
		try {
			set({ lastTx: await depositUsdcToHyperliquid(address, amount) });
			const before = (get().hlSpotUsdc ?? 0) + (get().equity ?? 0);
			for (let i = 0; i < 12; i++) {
				await new Promise((r) => setTimeout(r, 4e3));
				await get().refresh();
				if ((get().hlSpotUsdc ?? 0) + (get().equity ?? 0) > before + amount * .5) break;
			}
		} catch (err) {
			set({ error: mmError(err) });
		} finally {
			set({ depositing: false });
		}
	},
	disconnect: () => set({
		address: null,
		source: null,
		equity: null,
		withdrawable: null,
		hlSpotUsdc: null,
		depositGasEth: null,
		wallet: null,
		positions: [],
		status: "idle",
		depositing: false,
		lastTx: null,
		error: null
	})
}), {
	name: "zw-live-wallet",
	partialize: (s) => ({
		address: s.address,
		source: s.source
	}),
	onRehydrateStorage: () => (state) => {
		if (!state?.address) return;
		state.refresh();
		const eth = getEthereum();
		if (!eth?.on) return;
		const onAccounts = (...args) => {
			const next = (Array.isArray(args[0]) ? args[0] : [])[0];
			if (!next) {
				useLiveWallet.getState().disconnect();
				return;
			}
			useLiveWallet.getState().watchAddress(next).then(() => {
				useLiveWallet.setState({ source: "metamask" });
			});
		};
		eth.on("accountsChanged", onAccounts);
	}
}));
function DeskHeader({ onConvene, convening, onOpenSettings }) {
	const autopilot = useDesk((s) => s.autopilot);
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const reset = useDesk((s) => s.reset);
	const feed = useFeed();
	const mode = useTradingMode((s) => s.mode);
	const t = useT();
	const [gate, setGate] = (0, import_react.useState)(false);
	const setMode = useTradingMode((s) => s.setMode);
	const address = useLiveWallet((s) => s.address);
	const source = useLiveWallet((s) => s.source);
	const refresh = useLiveWallet((s) => s.refresh);
	function requestLive() {
		if (!address || source === "watch") {
			if (source === "watch") toast.message(t("mode.watchOnly"));
			setGate(true);
			return;
		}
		setAutopilot(false);
		setMode("live");
		refresh();
		toast.success(t("mode.liveOn"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "shrink-0 border-b border-border",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2 sm:gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaneMark, { className: "size-8 sm:size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "truncate text-xs font-semibold tracking-tight sm:text-sm",
									children: APP_NAME
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 text-2xs font-medium text-muted",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${feed === "live" ? "live-dot bg-up" : feed === "stale" ? "bg-down" : "bg-subtle"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: feed === "live" ? t("header.liveTape") : feed === "stale" ? t("header.tapeStale") : t("header.connecting")
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "hidden truncate text-2xs text-subtle sm:block",
								children: mode === "live" ? t("header.liveLine") : autopilot ? t("header.autopilotOn") : t("header.paperLine")
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeSwitch, { onRequestLive: requestLive }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-2 sm:gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStats, { className: "hidden sm:contents" }),
							mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden items-center gap-2 lg:flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-2xs font-medium text-muted",
										children: t("header.autopilot")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: autopilot,
										onCheckedChange: setAutopilot,
										"aria-label": t("header.autopilot")
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t("header.autopilotTip") })] }) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertsButton, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWalletChip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon-sm",
									"aria-label": t("header.resetAria"),
									className: "hidden sm:inline-flex",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("header.resetDesk") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("header.resetDeskBody") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "sell",
								className: "mt-4 w-full",
								onClick: reset,
								children: t("header.resetBook")
							})] })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: onConvene,
									disabled: convening,
									className: "h-10 shrink-0 px-3 sm:h-11 sm:px-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gavel, { className: "size-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: convening ? t("header.inSession") : t("header.convene")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "sm:hidden",
											children: convening ? "…" : t("header.convene")
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t("header.conveneTip") })] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-2 border-t border-border px-3 py-1.5 sm:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStats, { mobile: true })
			}),
			mode === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-t border-border px-3 py-1.5 text-2xs leading-relaxed text-muted sm:px-5",
				children: t("mode.banner")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-t border-border px-3 py-2 sm:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "min-w-0 flex-1 text-2xs leading-relaxed text-muted",
					children: t("mode.demoBanner")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					className: "h-9 shrink-0 px-3",
					onClick: requestLive,
					children: t("mode.goLive")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveGateDialog, {
				open: gate,
				onOpenChange: setGate,
				onOpenSettings
			})
		]
	});
}
function ModeSwitch({ onRequestLive }) {
	const t = useT();
	const mode = useTradingMode((s) => s.mode);
	const setMode = useTradingMode((s) => s.setMode);
	function goDemo() {
		setMode("demo");
		toast.message(t("mode.demoOn"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "group",
		"aria-label": t("settings.mode"),
		className: "grid shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-surface p-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: goDemo,
			"aria-label": t("mode.demo"),
			"aria-pressed": mode === "demo",
			className: cn("flex h-9 flex-col items-center justify-center rounded-md px-2 sm:h-11 sm:px-3", mode === "demo" ? "bg-elevated text-fg" : "text-muted"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xs font-medium sm:text-xs",
				children: t("mode.demo")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-3xs text-subtle sm:block",
				children: t("mode.demoSub")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onRequestLive,
			"aria-label": t("mode.live"),
			"aria-pressed": mode === "live",
			className: cn("flex h-9 flex-col items-center justify-center rounded-md px-2 sm:h-11 sm:px-3", mode === "live" ? "bg-elevated text-fg" : "text-muted"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-2xs font-medium sm:text-xs",
				children: t("mode.live")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden text-3xs text-subtle sm:block",
				children: t("mode.liveSub")
			})]
		})]
	});
}
function LiveGateDialog({ open, onOpenChange, onOpenSettings }) {
	const t = useT();
	const setMode = useTradingMode((s) => s.setMode);
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const connectMetaMask = useLiveWallet((s) => s.connectMetaMask);
	const status = useLiveWallet((s) => s.status);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("mode.gateTitle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("mode.gateBody") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-4 w-full",
				disabled: status === "connecting",
				onClick: () => {
					connectMetaMask().then(() => {
						const w = useLiveWallet.getState();
						if (w.address && w.source === "metamask") {
							setAutopilot(false);
							setMode("live");
							onOpenChange(false);
							toast.success(t("mode.liveOn"));
						}
					});
				},
				children: status === "connecting" ? t("wallet.connecting") : t("mode.connect")
			}),
			onOpenSettings ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "mt-2 w-full",
				onClick: () => {
					onOpenChange(false);
					onOpenSettings();
				},
				children: t("tour.openSettings")
			}) : null
		] })
	});
}
function LiveWalletChip() {
	const address = useLiveWallet((s) => s.address);
	const equity = useLiveWallet((s) => s.equity);
	const wallet = useLiveWallet((s) => s.wallet);
	if (!address) return null;
	const usdc = (wallet?.usdcEth ?? 0) + (wallet?.usdcArb ?? 0);
	const shown = (equity ?? 0) > .5 ? equity : usdc;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "hidden items-center gap-1.5 rounded-md bg-surface px-2 py-1 sm:flex",
		title: address,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-3.5 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "font-mono text-2xs tabular-nums text-muted",
			children: [shortAddress(address), shown ? ` · ${money(shown)}` : ""]
		})]
	});
}
function LiveStats({ mobile, className }) {
	const t = useT();
	const mode = useTradingMode((s) => s.mode);
	const cash = useDesk((s) => s.cash);
	const positions = useDesk((s) => s.positions);
	const assets = useMarkedAssets();
	const starting = useDesk((s) => s.startingEquity);
	const liveEq = useLiveWallet((s) => s.equity);
	const liveSpot = useLiveWallet((s) => s.hlSpotUsdc);
	const livePos = useLiveWallet((s) => s.positions);
	const demoEq = bookEquity(cash, positions, assets);
	const equity = mode === "live" ? liveEq ?? 0 : demoEq;
	const cashShown = mode === "live" ? liveSpot ?? 0 : cash;
	const pnl = mode === "live" ? livePos.reduce((sum, p) => sum + p.pnl, 0) : demoEq - starting;
	const pnlPct = mode === "live" ? 0 : starting ? pnl / starting * 100 : 0;
	if (mobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("header.equity")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm tabular-nums",
			children: money(equity)
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("header.cash")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm tabular-nums text-muted",
			children: money(cashShown)
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-right",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("header.pnl")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `font-mono text-sm tabular-nums ${signedClass(pnl)}`,
				children: money(pnl)
			})]
		})
	] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
				label: t("header.equity"),
				value: money(equity)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
				label: t("header.pnl"),
				value: mode === "live" ? money(pnl) : pct(pnlPct),
				tone: signedClass(pnl)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
				label: t("header.cash"),
				value: money(cashShown),
				muted: true,
				className: "hidden md:block"
			})
		]
	});
}
function Stat$2({ label, value, tone, muted, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-mono text-sm tabular-nums ${tone ?? (muted ? "text-muted" : "text-fg")}`,
			children: value
		})]
	});
}
function closeTrade(symbol, closePosition) {
	const res = closePosition(symbol);
	if (!res.ok) {
		toast.error(txError(res.error ?? "Could not close"));
		return;
	}
	toast.success(t("ticket.closed", { symbol }));
}
function OpenedTrades() {
	const positions = useDesk((s) => s.positions);
	const assets = useMarkedAssets();
	const cash = useDesk((s) => s.cash);
	const closePosition = useDesk((s) => s.closePosition);
	const select = useDesk((s) => s.select);
	const equity = bookEquity(cash, positions, assets);
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("opened.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xs text-subtle tabular-nums",
			children: positions.length
		})]
	}), positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 px-1 text-sm leading-relaxed text-muted",
		children: t("opened.empty")
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1.5",
		children: positions.map((p) => {
			const crypto = isLot(p.symbol);
			const px = assets[p.symbol]?.price ?? p.avg;
			const pnl = (px - p.avg) * p.qty;
			const pnlPct = p.avg ? (px - p.avg) / p.avg * 100 * Math.sign(p.qty || 1) : 0;
			const weight = equity ? Math.abs(p.qty * px) / equity * 100 : 0;
			const long = p.qty >= 0;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => select(p.symbol),
						className: "min-w-0 flex-1 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", long ? "bg-up/15 text-up" : "bg-down/15 text-down"),
									children: long ? t("side.long") : t("side.short")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-sm font-medium",
									children: p.symbol
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 font-mono text-2xs text-muted tabular-nums",
								children: [
									signedQty(p.qty, crypto),
									" @ ",
									compactPrice(p.avg),
									" → ",
									compactPrice(px),
									" ·",
									" ",
									weight.toFixed(1),
									"%"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `mt-0.5 font-mono text-xs tabular-nums ${signedClass(pnl)}`,
								children: [
									money(pnl),
									" · ",
									pct(pnlPct)
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						size: "sm",
						className: "h-11 shrink-0 px-3",
						onClick: () => closeTrade(p.symbol, closePosition),
						"aria-label": t("opened.closeAria", { symbol: p.symbol }),
						children: t("ticket.close")
					})]
				})
			}, p.symbol);
		})
	})] });
}
function OpenedStrip() {
	const mode = useTradingMode((s) => s.mode);
	const demoPositions = useDesk((s) => s.positions);
	const livePositions = useLiveWallet((s) => s.positions);
	const closePosition = useDesk((s) => s.closePosition);
	const select = useDesk((s) => s.select);
	const t = useT();
	if (mode === "live") {
		if (livePositions.length === 0) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-b border-border px-3 py-1.5 sm:px-4 sm:py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 overflow-x-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("opened.title")
				}), livePositions.map((p) => {
					const long = p.qty >= 0;
					const name = p.desk ?? p.coin;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-9 shrink-0 items-center gap-2 rounded-md bg-surface px-2 shadow-[var(--shadow-border)] sm:h-11 sm:rounded-lg sm:px-2.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => p.desk && select(p.desk),
							className: "flex items-center gap-2 text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("font-mono text-sm font-medium", long ? "text-up" : "text-down"),
								children: name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-mono text-2xs tabular-nums ${signedClass(p.pnl)}`,
								children: money(p.pnl)
							})]
						})
					}, `${p.coin}-${p.desk ?? ""}`);
				})]
			})
		});
	}
	const positions = demoPositions;
	if (positions.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shrink-0 border-b border-border px-3 py-1.5 sm:px-4 sm:py-2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 overflow-x-auto",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("opened.title")
			}), positions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenedChip, {
				position: p,
				onSelect: select,
				onClose: closePosition
			}, p.symbol))]
		})
	});
}
function OpenedChip({ position: p, onSelect, onClose }) {
	const t = useT();
	const fallback = useDesk((s) => s.assets[p.symbol]?.price ?? p.avg);
	const px = useMark(p.symbol) || fallback;
	const crypto = isLot(p.symbol);
	const pnl = (px - p.avg) * p.qty;
	const long = p.qty >= 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-9 shrink-0 items-center gap-2 rounded-md bg-surface px-2 shadow-[var(--shadow-border)] sm:h-11 sm:rounded-lg sm:px-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onSelect(p.symbol),
			className: "flex items-center gap-2 text-left",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("font-mono text-sm font-medium", long ? "text-up" : "text-down"),
					children: p.symbol
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-2xs text-muted tabular-nums",
					children: [
						long ? "L" : "S",
						" ",
						signedQty(p.qty, crypto),
						" · ",
						compactMoney(Math.abs(p.qty * px))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-2xs tabular-nums ${signedClass(pnl)}`,
					children: money(pnl)
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => closeTrade(p.symbol, onClose),
			className: "h-9 rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg",
			"aria-label": t("opened.closeAria", { symbol: p.symbol }),
			children: t("ticket.close")
		})]
	});
}
var SLICE_FILL = {
	cash: "color-mix(in oklab, var(--color-fg) 55%, transparent)",
	long: "var(--color-up)",
	short: "var(--color-down)"
};
var EXTRA = [
	"var(--color-accent)",
	"color-mix(in oklab, var(--color-up) 55%, var(--color-fg))",
	"color-mix(in oklab, var(--color-fg) 32%, transparent)"
];
function sliceColor(kind, index) {
	if (kind === "cash") return SLICE_FILL.cash;
	if (kind === "short") return SLICE_FILL.short;
	return index === 0 ? SLICE_FILL.long : EXTRA[index % EXTRA.length];
}
function AllocRing({ slices }) {
	const total = slices.reduce((s, x) => s + x.value, 0) || 1;
	const r = 58;
	const c = 2 * Math.PI * r;
	const gap = 2.5;
	let acc = 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 160 160",
		className: "size-40",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "80",
			cy: "80",
			r,
			fill: "none",
			stroke: "color-mix(in oklab, var(--color-fg) 10%, transparent)",
			strokeWidth: "14"
		}), slices.map((s) => {
			const frac = s.value / total;
			const len = Math.max(0, frac * c - gap);
			const el = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "80",
				cy: "80",
				r,
				fill: "none",
				stroke: s.fill,
				strokeWidth: "14",
				strokeDasharray: `${len} ${c - len}`,
				strokeDashoffset: -acc,
				transform: "rotate(-90 80 80)"
			}, `${s.kind}-${s.name}`);
			acc += frac * c;
			return el;
		})]
	});
}
function PortfolioPanel() {
	const cash = useDesk((s) => s.cash);
	const positions = useDesk((s) => s.positions);
	const assets = useMarkedAssets();
	const closed = useDesk((s) => s.closedTrades);
	const anchors = useDesk((s) => s.periodAnchors);
	const starting = useDesk((s) => s.startingEquity);
	const fills = useDesk((s) => s.fills);
	const stats = portfolioStats(cash, positions, assets, closed, anchors, starting);
	const t = useT();
	let longI = 0;
	const colored = stats.slices.map((s) => {
		const i = s.kind === "long" ? longI++ : 0;
		return {
			...s,
			fill: sliceColor(s.kind, i)
		};
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("port.alloc")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative size-40 shrink-0",
						children: colored.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocRing, { slices: colored }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-2xs tabular-nums tracking-tight",
								children: money(stats.equity, 0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xs text-subtle",
								children: t("port.equity")
							})]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex size-full items-center justify-center text-2xs text-subtle",
							children: "—"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "min-w-0 flex-1 space-y-2",
						"data-allocation": true,
						children: colored.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex min-w-0 items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 size-1.5 shrink-0 rounded-full",
									style: { background: s.fill }
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "block truncate text-xs font-medium",
										children: [
											s.kind === "cash" ? t("port.cash") : s.name,
											s.kind === "short" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-down",
												children: [" ", t("port.short")]
											}) : null,
											s.kind === "long" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-up",
												children: [" ", t("port.long")]
											}) : null
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-mono text-2xs text-muted tabular-nums",
										children: money(s.value)
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "shrink-0 font-mono text-xs tabular-nums",
								"data-alloc-pct": true,
								children: [s.pct.toFixed(1), "%"]
							})]
						}, `${s.kind}-${s.name}`))
					})]
				}),
				stats.longMv + stats.shortMv > .5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 font-mono text-2xs leading-relaxed text-muted tabular-nums",
					children: [
						money(stats.cash),
						" ",
						t("port.cash"),
						stats.longMv > .5 ? ` + ${money(stats.longMv)} ${t("port.long")}` : "",
						stats.shortMv > .5 ? ` + ${money(stats.shortMv)} ${t("port.short")}` : "",
						" = ",
						money(stats.cash + stats.longMv + stats.shortMv),
						" ",
						t("port.deployed")
					]
				}) : null
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid shrink-0 grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.winrate"),
						value: `${stats.winrate.toFixed(0)}%`,
						sub: stats.trades ? `${stats.wins}W / ${stats.trades} · ${money(stats.realized)}` : t("port.noClosed")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.floating"),
						value: money(stats.floating),
						tone: signedClass(stats.floating),
						sub: t("port.openMarks")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.total"),
						value: money(stats.total),
						sub: pct(stats.totalPct),
						tone: signedClass(stats.total)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.day"),
						value: money(stats.day),
						sub: pct(stats.dayPct),
						tone: signedClass(stats.day)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.week"),
						value: money(stats.week),
						sub: pct(stats.weekPct),
						tone: signedClass(stats.week)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.month"),
						value: money(stats.month),
						sub: pct(stats.monthPct),
						tone: signedClass(stats.month)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.year"),
						value: money(stats.year),
						sub: pct(stats.yearPct),
						tone: signedClass(stats.year)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
						label: t("port.openedN"),
						value: String(stats.openCount),
						sub: stats.openCount === 1 ? t("port.oneTrade") : t("port.nTrades", { n: stats.openCount })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "border-t border-border pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenedTrades, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("port.fills")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: fills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-1 text-sm text-muted",
					children: t("port.noPrints")
				}) : fills.slice(0, 10).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-mono text-2xs tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn(f.side === "buy" ? "text-up" : "text-down"),
						children: [
							f.side.toUpperCase(),
							" ",
							qtyFmt(f.qty, isLot(f.symbol)),
							" ",
							f.symbol
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [compactPrice(f.price), f.note === "Close" ? ` · ${t("port.closeNote")}` : ""]
					})]
				}, f.id))
			})] })
		]
	});
}
function Stat$1({ label, value, sub, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-2xs font-medium tracking-wide text-subtle uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: `mt-0.5 font-mono text-sm tabular-nums ${tone ?? "text-fg"}`,
				children: value
			}),
			sub ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: `font-mono text-2xs tabular-nums ${tone ?? "text-muted"}`,
				children: sub
			}) : null
		]
	});
}
var loadProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3c41b1876898df8f5fcb2bd28184782e6d0ca416c908c5b17d80f5b2beffd8e3"));
var claimUsername = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("5fd1ce1e69f9d1258fb698f3f930de53b4dce082cdc1e22cc2087f5cd37e8dbe"));
function WalletCard() {
	const t = useT();
	const address = useLiveWallet((s) => s.address);
	const source = useLiveWallet((s) => s.source);
	const equity = useLiveWallet((s) => s.equity);
	const withdrawable = useLiveWallet((s) => s.withdrawable);
	const hlSpotUsdc = useLiveWallet((s) => s.hlSpotUsdc);
	const depositGasEth = useLiveWallet((s) => s.depositGasEth);
	const wallet = useLiveWallet((s) => s.wallet);
	const positions = useLiveWallet((s) => s.positions);
	const status = useLiveWallet((s) => s.status);
	const depositing = useLiveWallet((s) => s.depositing);
	const lastTx = useLiveWallet((s) => s.lastTx);
	const error = useLiveWallet((s) => s.error);
	const connectMetaMask = useLiveWallet((s) => s.connectMetaMask);
	const watchAddress = useLiveWallet((s) => s.watchAddress);
	const refresh = useLiveWallet((s) => s.refresh);
	const deposit = useLiveWallet((s) => s.deposit);
	const disconnect = useLiveWallet((s) => s.disconnect);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const busy = status === "connecting" || depositing;
	const usdcWallet = (wallet?.usdcEth ?? 0) + (wallet?.usdcArb ?? 0) + (wallet?.usdcArbE ?? 0);
	const arbUsdc = wallet?.usdcArb ?? 0;
	const parsed = Number(amount);
	const canDeposit = source === "metamask" && Number.isFinite(parsed) && parsed >= 5 && parsed <= arbUsdc + 1e-6;
	function onWatch(e) {
		e.preventDefault();
		watchAddress(draft);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: t("wallet.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-2xs leading-relaxed text-muted",
				children: t("wallet.body")
			}),
			address ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-md bg-surface px-3 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: source === "watch" ? t("wallet.watching") : t("wallet.mm")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 font-mono text-sm tabular-nums",
						children: shortAddress(address)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("wallet.wallet")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("wallet.usdc"),
						value: money(usdcWallet)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("wallet.eth"),
						value: wallet ? compactPrice(wallet.eth + wallet.arbEth) : "—"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-2xs leading-relaxed text-subtle",
					children: wallet ? t("wallet.breakdown", {
						arb: money(wallet.usdcArb),
						eth: money(wallet.usdcEth),
						e: wallet.usdcArbE ? t("wallet.usdcE", { amount: money(wallet.usdcArbE) }) : ""
					}) : t("wallet.reading")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("wallet.hyperliquid")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 grid grid-cols-2 gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("wallet.perpsEquity"),
						value: equity == null ? "—" : money(equity)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("wallet.hlSpot"),
						value: hlSpotUsdc == null ? "—" : money(hlSpotUsdc)
					})]
				}),
				withdrawable != null && withdrawable > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-2xs text-subtle",
					children: t("wallet.withdrawable", { amount: money(withdrawable) })
				}) : null,
				positions.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1",
					children: positions.slice(0, 8).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-baseline justify-between gap-2 font-mono text-2xs tabular-nums",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
							p.qty >= 0 ? t("wallet.long") : t("wallet.short"),
							" ",
							qtyFmt(Math.abs(p.qty), true),
							" ",
							p.desk ?? p.coin
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: signedClass(p.pnl),
							children: money(p.pnl)
						})]
					}, p.coin))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-2xs text-muted",
					children: t("wallet.noPerps", { min: 5 })
				}),
				source === "metamask" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded-md bg-surface p-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xs font-medium tracking-wide text-subtle uppercase",
							children: t("wallet.deposit")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 text-2xs leading-relaxed text-muted",
							children: t("wallet.depositBody", {
								min: 5,
								keep: ARB_ETH_KEEP,
								gas: gasLabel(depositGasEth),
								warn: ARB_ETH_WARN
							})
						}),
						arbUsdc < 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xs leading-relaxed text-down",
							children: t("wallet.needUsdc", { min: 5 })
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								inputMode: "decimal",
								value: amount,
								onChange: (e) => setAmount(e.target.value),
								placeholder: t("wallet.maxPh", { amount: money(arbUsdc) }),
								className: "h-11 font-mono text-xs"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								className: "shrink-0 px-3",
								onClick: () => setAmount(trimAmount(arbUsdc)),
								children: t("wallet.max")
							})]
						}),
						wallet && wallet.arbEth < 5e-5 && arbUsdc >= 5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xs leading-relaxed text-down",
							children: t("wallet.needEth", {
								eth: compactPrice(wallet.arbEth),
								keep: ARB_ETH_KEEP
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-2 w-full",
							disabled: busy || !canDeposit,
							onClick: () => setConfirm(true),
							children: depositing ? t("wallet.depositing") : t("wallet.deposit")
						}),
						lastTx ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "mt-2 block text-2xs text-accent underline",
							href: `https://arbiscan.io/tx/${lastTx}`,
							target: "_blank",
							rel: "noreferrer",
							children: t("wallet.arbScan")
						}) : null
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-2xs leading-relaxed text-muted",
					children: t("wallet.watchOnly")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-2xs leading-relaxed text-subtle",
					children: t("wallet.mapped", { names: Object.keys(DESK_TO_PERP).join(", ") })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "flex-1",
						disabled: busy,
						onClick: () => void refresh(),
						children: busy ? "…" : t("wallet.refresh")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						className: "flex-1",
						onClick: disconnect,
						children: t("wallet.disconnect")
					})]
				})
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-3 w-full",
				disabled: busy,
				onClick: () => void connectMetaMask(),
				children: busy ? t("wallet.connecting") : t("wallet.connect")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onWatch,
				className: "mt-2 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: t("wallet.watchPh"),
					autoComplete: "off",
					spellCheck: false,
					className: "h-11 font-mono text-xs"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					disabled: busy || !draft.trim(),
					className: "shrink-0 px-4",
					children: t("wallet.watch")
				})]
			})] }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs leading-relaxed text-down",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: confirm,
				onOpenChange: setConfirm,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("wallet.sendReal") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("wallet.sendRealBody", {
					amount: money(parsed || 0),
					min: 5
				}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					disabled: depositing,
					onClick: () => {
						setConfirm(false);
						deposit(parsed);
					},
					children: t("wallet.signMm")
				})] })
			})
		]
	});
}
function trimAmount(n) {
	return (Math.floor(n * 1e6) / 1e6).toString();
}
function gasLabel(eth) {
	if (!eth || !Number.isFinite(eth) || eth <= 0) return "0.00002";
	if (eth >= 1e-4) return eth.toFixed(5);
	return eth.toFixed(6);
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-surface px-3 py-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-0.5 font-mono text-sm tabular-nums",
			children: value
		})]
	});
}
var subscribeToNothing = () => () => {};
var noGateOnServer = () => false;
function SettingsPanel() {
	const t = useT();
	const { appearance, setAppearance } = useAppearance();
	const reset = useDesk((s) => s.reset);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-y-auto pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "px-1 pb-3 text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("settings.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandleCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.mode")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.modeBody")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsModeSwitch, {})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.language")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.languageBody")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitch, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.tour")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.tourBody")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "mt-3 w-full",
						onClick: () => replayDeskTour(),
						children: t("settings.replayTour")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.appearance")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.appearanceBody")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-1 rounded-lg bg-surface p-1",
						children: [
							"dark",
							"light",
							"system"
						].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setAppearance(id),
							className: cn("flex h-11 flex-col items-center justify-center rounded-md px-1 text-center", appearance === id ? "bg-elevated text-fg" : "text-muted"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-2xs font-medium",
								children: t(`settings.${id}`)
							})
						}, id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.reset")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.resetBody")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Dialog, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "sell",
							className: "mt-3 w-full",
							children: t("header.resetBook")
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("settings.reset") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("header.resetDeskBody") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "sell",
						className: "mt-4 w-full",
						onClick: reset,
						children: t("header.resetBook")
					})] })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignOutCard, {})
		]
	});
}
function HandleCard() {
	const t = useT();
	const [username, setUsername] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [loaded, setLoaded] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		loadProfile().then((res) => {
			if (!live) return;
			setUsername(res.username);
			setLoaded(true);
		}).catch(() => {
			if (live) setLoaded(true);
		});
		return () => {
			live = false;
		};
	}, []);
	async function onClaim(e) {
		e.preventDefault();
		setBusy(true);
		setError(null);
		try {
			const res = await claimUsername({ data: { username: draft } });
			if (!res.ok) {
				setError(res.error);
				return;
			}
			setUsername(res.username);
			setDraft("");
		} catch {
			setError(t("settings.handleFail"));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-medium",
			children: t("settings.handle")
		}), username ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-2xs leading-relaxed text-muted",
			children: t("settings.handleLocked")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 rounded-md bg-surface px-3 py-2 font-mono text-sm tabular-nums",
			children: ["@", username]
		})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-2xs leading-relaxed text-muted",
				children: t("settings.handlePick")
			}),
			loaded ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onClaim,
				className: "mt-3 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (e) => setDraft(e.target.value),
					placeholder: "your_name",
					autoComplete: "off",
					spellCheck: false,
					className: "h-11"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "secondary",
					disabled: busy || !draft.trim(),
					className: "shrink-0 px-4",
					children: busy ? "…" : t("settings.lock")
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-11 rounded-md bg-surface" }),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-2xs leading-relaxed text-down",
				children: error
			}) : null
		] })]
	});
}
function SettingsModeSwitch() {
	const t = useT();
	const mode = useTradingMode((s) => s.mode);
	const setMode = useTradingMode((s) => s.setMode);
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const address = useLiveWallet((s) => s.address);
	const source = useLiveWallet((s) => s.source);
	const connectMetaMask = useLiveWallet((s) => s.connectMetaMask);
	const status = useLiveWallet((s) => s.status);
	const refresh = useLiveWallet((s) => s.refresh);
	function pick(next) {
		if (next === "demo") {
			setMode("demo");
			toast.message(t("mode.demoOn"));
			return;
		}
		if (!address || source === "watch") {
			connectMetaMask().then(() => {
				const w = useLiveWallet.getState();
				if (w.address && w.source === "metamask") {
					setAutopilot(false);
					setMode("live");
					toast.success(t("mode.liveOn"));
				} else toast.message(t("mode.needWallet"));
			});
			return;
		}
		setAutopilot(false);
		setMode("live");
		refresh();
		toast.success(t("mode.liveOn"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3 grid grid-cols-2 gap-1 rounded-lg bg-surface p-1",
		children: ["demo", "live"].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => pick(id),
			disabled: status === "connecting",
			className: cn("flex h-11 items-center justify-center rounded-md text-sm font-medium", mode === id ? "bg-elevated text-fg" : "text-muted"),
			children: t(`mode.${id}`)
		}, id))
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 text-2xs leading-relaxed text-subtle",
		children: mode === "live" ? t("mode.liveHint") : t("mode.demoHint")
	})] });
}
function SignOutCard() {
	const t = useT();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	if ((0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateOnServer)) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: t("settings.signOut")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-2xs leading-relaxed text-muted",
				children: t("settings.signOutBody")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				className: "mt-3 w-full",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut("/login").catch(() => setSigningOut(false));
				},
				children: signingOut ? t("settings.signingOut") : t("settings.signOut")
			})
		]
	});
}
function Watchlist() {
	const assets = useAssets();
	const selected = useDesk((s) => s.selected);
	const select = useDesk((s) => s.select);
	const positions = useDesk((s) => s.positions);
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between px-1 pb-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("board.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-2xs text-subtle tabular-nums",
				children: UNIVERSE.length
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1",
			children: UNIVERSE.map((u) => {
				const a = assets[u.symbol];
				if (!a) return null;
				const held = positions.find((p) => p.symbol === u.symbol);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchlistRow, {
					asset: a,
					name: u.name,
					active: selected === u.symbol,
					held,
					onSelect: select
				}, u.symbol);
			})
		})]
	});
}
var WatchlistRow = (0, import_react.memo)(function WatchlistRow({ asset, name, active, held, onSelect }) {
	const t = useT();
	const series = asset.series.slice(-28).map((b) => b.px);
	const chg = changePct(asset.price, asset.open);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-symbol": asset.symbol,
		onClick: () => onSelect(asset.symbol),
		className: cn("flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]", active ? "bg-elevated" : "hover:bg-elevated/60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm font-medium tabular-nums",
						children: asset.symbol
					}), held ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded-full px-1.5 py-px text-2xs font-medium", held.qty >= 0 ? "bg-up/15 text-up" : "bg-down/15 text-down"),
						children: held.qty >= 0 ? t("side.long") : t("side.short")
					}) : null]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-2xs text-subtle",
					children: name
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
				data: series,
				up: chg >= 0,
				className: "hidden xl:block"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePx, {
				symbol: asset.symbol,
				open: asset.open,
				fallback: asset.price
			})
		]
	}) });
});
function LivePx({ symbol, open, fallback }) {
	const t = useT();
	const px = useMark(symbol) || fallback;
	const chg = changePct(px, open);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-right",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm tabular-nums",
			children: px ? compactPrice(px) : "—"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-mono text-2xs tabular-nums ${px ? signedClass(chg) : "text-subtle"}`,
			children: px ? pct(chg) : t("board.tape")
		})]
	});
}
function TickerStrip() {
	const assets = useAssets();
	const selected = useDesk((s) => s.selected);
	const select = useDesk((s) => s.select);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "shrink-0 overflow-x-auto",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "flex gap-1.5",
			children: UNIVERSE.map((u) => {
				const a = assets[u.symbol];
				if (!a) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerChip, {
					asset: a,
					active: selected === u.symbol,
					onSelect: select
				}, u.symbol);
			})
		})
	});
}
var TickerChip = (0, import_react.memo)(function TickerChip({ asset, active, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-symbol": asset.symbol,
		onClick: () => onSelect(asset.symbol),
		className: cn("flex h-14 min-w-[6.5rem] flex-col justify-center rounded-xl px-3 text-left shadow-[var(--shadow-border)]", active ? "bg-elevated" : "bg-surface"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-xs font-medium",
			children: asset.symbol
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChipPx, {
			symbol: asset.symbol,
			open: asset.open,
			fallback: asset.price
		})]
	}) });
});
function LiveChipPx({ symbol, open, fallback }) {
	const px = useMark(symbol) || fallback;
	const chg = changePct(px, open);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `font-mono text-2xs tabular-nums ${px ? signedClass(chg) : "text-subtle"}`,
		children: px ? `${compactPrice(px)} ${pct(chg)}` : "—"
	});
}
var councilRound = 0;
function L(locale, en, pl) {
	return locale === "pl" ? pl : en;
}
function rank(tickers, pred) {
	return [...tickers].sort((a, b) => pred(b) - pred(a));
}
function at(list, i) {
	return list[Math.min(Math.max(i, 0), list.length - 1)];
}
function skipLast(list, lastSymbol, i = 0) {
	if (!lastSymbol) return at(list, i);
	const filtered = list.filter((t) => t.symbol !== lastSymbol);
	if (!filtered.length) return at(list, i);
	return at(filtered, i);
}
function fmt(t, locale) {
	const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
	return locale === "pl" ? `${t.symbol} ${chg} od otwarcia` : `${t.symbol} ${chg} from the open`;
}
function sizeQty(equity, sizePct, t) {
	const px = t.livePx && t.livePx > 0 ? t.livePx : t.price;
	const notional = equity * Math.min(sizePct, 6) * .01;
	const qty = px > 0 ? notional / px : 0;
	return Number(qty.toFixed(isLot(t.symbol) ? 4 : 2));
}
function localCouncil(snap, last, locale = "en", seenNews = []) {
	councilRound += 1;
	const v = councilRound % 3;
	const tickers = snap.tickers.filter((t) => t.price > 0);
	const lastSym = last?.order?.symbol ?? last?.agents.find((a) => a.vote !== "hold")?.symbol ?? null;
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
		order: null
	};
	const byMom = rank(tickers, (t) => t.changePct);
	const byWash = rank(tickers, (t) => -t.vsSma);
	const byStretch = rank(tickers, (t) => t.vsSma);
	const byRsiLow = rank(tickers, (t) => -t.rsi);
	const byRsiHigh = rank(tickers, (t) => t.rsi);
	const hot = skipLast(byMom, lastSym, v === 2 ? 1 : 0) ?? byMom[0];
	const cold = skipLast(rank(tickers, (t) => -t.changePct), lastSym, v === 1 ? 1 : 0);
	const washed = skipLast(byWash, lastSym, v === 0 ? 0 : 1);
	const stretched = skipLast(byStretch, lastSym, v === 2 ? 0 : 1);
	const pos = snap.book.positions[0];
	const posTicker = pos ? tickers.find((t) => t.symbol === pos.symbol) : void 0;
	const vesperBuy = hot.changePct > .35 && hot.vsSma > .15 && hot.rsi < 72;
	const vesperCut = hot.changePct < -.8 || posTicker && pos.qty > 0 && posTicker.changePct < -.9;
	const ashBuy = washed.vsSma < -.55 && washed.rsi < 42;
	const ashSell = stretched.vsSma > .85 && stretched.rsi > 62;
	const kaiShort = cold.changePct < -.7;
	const kaiLong = hot.changePct > 1.1 && !vesperBuy;
	const agents = AGENTS.map((p) => {
		if (p.id === "vesper") {
			if (vesperCut && posTicker) return {
				id: p.id,
				thesis: L(locale, `${pos.symbol} stalled — ${fmt(posTicker, locale)}. I'd rather be flat than hopeful.`, `${pos.symbol} stanęło — ${fmt(posTicker, locale)}. Wolałabym nic nie trzymać, niż liczyć na cud.`),
				vote: "sell",
				symbol: pos.symbol,
				conviction: .58,
				sizePct: 0
			};
			if (vesperBuy) return {
				id: p.id,
				thesis: v === 0 ? L(locale, `${hot.symbol} is up ${hot.changePct.toFixed(2)}% and still climbing (${fmt(hot, locale)}). Ride it — a small position, not a hero trade.`, `${hot.symbol} jest ${hot.changePct.toFixed(2)}% na plusie i dalej idzie (${fmt(hot, locale)}). Jedź z tym — mała pozycja, nie cały kapitał.`) : L(locale, `${hot.symbol} is the leader. ${fmt(hot, locale)}. I want a small position, not a big bet.`, `${hot.symbol} prowadzi. ${fmt(hot, locale)}. Chcę małą pozycję, nie duży zakład.`),
				vote: "buy",
				symbol: hot.symbol,
				conviction: Math.min(.88, .42 + hot.changePct / 4),
				sizePct: 5
			};
			return {
				id: p.id,
				thesis: v === 1 ? L(locale, `Lead is ${hot.symbol} at ${hot.changePct.toFixed(2)}% but it is not a clean breakout. I stay flat.`, `Lider to ${hot.symbol} (${hot.changePct.toFixed(2)}%), ale to nie jest czyste wybicie. Zostaję bez pozycji.`) : L(locale, `No trend. Hottest print is ${fmt(hot, locale)} and that is noise.`, `Nie ma trendu. Najmocniejszy ruch to ${fmt(hot, locale)} — to szum, nie sygnał.`),
				vote: "hold",
				symbol: hot.symbol,
				conviction: .38,
				sizePct: 0
			};
		}
		if (p.id === "ash") {
			if (ashBuy) return {
				id: p.id,
				thesis: L(locale, `${washed.symbol} is washed out (${fmt(washed, locale)}). That's a dip I probe — one clip, no averaging down.`, `${washed.symbol} jest przecenione (${fmt(washed, locale)}). To spadek, który sprawdzam małą pozycją — bez dokładania.`),
				vote: "buy",
				symbol: washed.symbol,
				conviction: Math.min(.84, .4 + Math.abs(washed.vsSma) / 3),
				sizePct: 4
			};
			if (ashSell) return {
				id: p.id,
				thesis: L(locale, `${stretched.symbol} ran too far (${fmt(stretched, locale)}). I sell strength, I don't chase it.`, `${stretched.symbol} odjechało za daleko (${fmt(stretched, locale)}). Sprzedaję siłę, nie gonię jej.`),
				vote: "sell",
				symbol: stretched.symbol,
				conviction: .64,
				sizePct: 4
			};
			return {
				id: p.id,
				thesis: v === 2 ? L(locale, `Nothing is stretched enough. Washed is ${fmt(washed, locale)}; extended is ${fmt(stretched, locale)}. Let price come to us.`, `Nic nie jest wystarczająco skrajne. Przecena: ${fmt(washed, locale)}; wzrost: ${fmt(stretched, locale)}. Niech cena przyjdzie do nas.`) : L(locale, `Extremes: ${byRsiLow[0]?.symbol} looks cheap vs ${byRsiHigh[0]?.symbol} looking rich. Still not a fade I will size.`, `Skrajności: ${byRsiLow[0]?.symbol} wygląda tanio, ${byRsiHigh[0]?.symbol} drogo. Nadal za mało, żebym otwierał pozycję.`),
				vote: "hold",
				symbol: null,
				conviction: .34,
				sizePct: 0
			};
		}
		if (p.id === "kai") {
			if (posTicker && Math.abs(pos.pnlPct) > .8) return {
				id: p.id,
				thesis: L(locale, `We're already in ${pos.symbol} at ${pos.pnlPct >= 0 ? "+" : ""}${pos.pnlPct.toFixed(2)}% (${fmt(posTicker, locale)}). Manage the open trade before hunting a new name.`, `Już jesteśmy w ${pos.symbol} na ${pos.pnlPct >= 0 ? "+" : ""}${pos.pnlPct.toFixed(2)}% (${fmt(posTicker, locale)}). Najpierw ogarnij otwartą pozycję, potem szukaj nowej.`),
				vote: pos.qty > 0 && posTicker.changePct < -.5 ? "sell" : "hold",
				symbol: pos.symbol,
				conviction: .55,
				sizePct: 0
			};
			if (kaiShort) return {
				id: p.id,
				thesis: L(locale, `${cold.symbol} is the weakest on the board (${fmt(cold, locale)}). I would rather offer than hero — and I will not stack a name we already called.`, `${cold.symbol} jest najsłabsze na rynku (${fmt(cold, locale)}). Lepiej sprzedawać niż łapać spadek — i nie dokładam do spółki, którą już graliśmy.`),
				vote: "sell",
				symbol: cold.symbol,
				conviction: .52,
				sizePct: 3
			};
			if (kaiLong) return {
				id: p.id,
				thesis: L(locale, `Money is flowing one way into ${hot.symbol} (${fmt(hot, locale)}). I follow the move, not the average.`, `Pieniądz płynie w jedną stronę, w ${hot.symbol} (${fmt(hot, locale)}). Idę za ruchem, nie za średnią.`),
				vote: "buy",
				symbol: hot.symbol,
				conviction: .56,
				sizePct: 3
			};
			return {
				id: p.id,
				thesis: L(locale, `Two-way tape. Leader ${hot.symbol} ${hot.changePct.toFixed(2)}% vs laggard ${cold.symbol} ${cold.changePct.toFixed(2)}%. I will not invent a story.`, `Rynek w dwie strony. Lider ${hot.symbol} ${hot.changePct.toFixed(2)}%, najsłabszy ${cold.symbol} ${cold.changePct.toFixed(2)}%. Nie wymyślam historii.`),
				vote: "hold",
				symbol: null,
				conviction: .3,
				sizePct: 0
			};
		}
		if (p.id === "damian") {
			const news = snap.headlines.slice(0, 6);
			if (!news.length) return {
				id: p.id,
				thesis: L(locale, "No fresh headlines. I will not invent a story from the chart.", "Brak nowych wiadomości. Nie wymyślam historii z samego wykresu."),
				vote: "hold",
				symbol: null,
				conviction: .28,
				sizePct: 0
			};
			const unused = news.find((h) => !seenNews.some((row) => newsOverlap(row, h.text)));
			if (!unused) return {
				id: p.id,
				thesis: L(locale, "Nothing new in the headlines. I already read this tape — waiting for the next story.", "W wiadomościach nic nowego. Te nagłówki już czytałem — czekam na kolejną historię."),
				vote: "hold",
				symbol: null,
				conviction: .22,
				sizePct: 0
			};
			const t = unused.symbol ? tickers.find((x) => x.symbol === unused.symbol) : void 0;
			const line = t ? fmt(t, locale) : unused.symbol ?? L(locale, "the market", "rynek");
			const clip = unused.text.slice(0, 140);
			if (t && (unused.shock ?? 0) >= .4 && t.changePct > .15) return {
				id: p.id,
				thesis: L(locale, `Headline: ${clip}. ${line} is moving with the story — a small position, not a rumor chase.`, `Wiadomość: ${clip}. ${line} rusza razem z historią — mała pozycja, nie gonienie plotki.`),
				vote: "buy",
				symbol: t.symbol,
				conviction: .58,
				sizePct: 3
			};
			if (t && (unused.shock ?? 0) <= -.4) return {
				id: p.id,
				thesis: L(locale, `Headline: ${clip}. ${line}. That's a story I fade or cut — not one I add to.`, `Wiadomość: ${clip}. ${line}. Tę historię raczej sprzedaję albo zamykam — nie dokładam.`),
				vote: t.changePct > .4 ? "sell" : "hold",
				symbol: t.symbol,
				conviction: .54,
				sizePct: t.changePct > .4 ? 3 : 0
			};
			return {
				id: p.id,
				thesis: L(locale, `Headline: ${clip}. ${t ? `${line} — story is live, the move is not one-way.` : "No name on the board owns this print yet."}`, `Wiadomość: ${clip}. ${t ? `${line} — historia żyje, ale ruch nie jest jednostronny.` : "Żadna spółka z puli nie jest jeszcze podpięta pod ten nagłówek."}`),
				vote: "hold",
				symbol: t?.symbol ?? null,
				conviction: .36,
				sizePct: 0
			};
		}
		const cashPct = 100 * snap.book.cash / Math.max(snap.book.equity, 1);
		const riskOff = snap.book.dayPnlPct < -2.4 || cashPct < 18;
		const names = snap.book.positions.map((p) => p.symbol).join(", ");
		return {
			id: p.id,
			thesis: riskOff ? L(locale, `Book is ${snap.book.dayPnlPct.toFixed(2)}% on the day, cash ${cashPct.toFixed(0)}%. No new risk until things calm. Fees stay ≤ 5% round-trip.`, `Portfel ${snap.book.dayPnlPct.toFixed(2)}% w ciągu dnia, gotówka ${cashPct.toFixed(0)}%. Bez nowego ryzyka, dopóki się nie uspokoi. Opłaty ≤ 5% za otwarcie i zamknięcie.`) : names ? L(locale, `Cash ${cashPct.toFixed(0)}% · open ${names}. One small position max; I veto a second name until this one is flat.`, `Gotówka ${cashPct.toFixed(0)}% · otwarte: ${names}. Maksimum jedna mała pozycja; drugiej spółki nie puszczam, dopóki ta nie będzie zamknięta.`) : L(locale, `Cash is ${cashPct.toFixed(0)}% of equity. One 3–5% position is allowed; stacking names is not.`, `Gotówka to ${cashPct.toFixed(0)}% kapitału. Jedna pozycja 3–5% jest OK; pakowanie kilku spółek — nie.`),
			vote: "hold",
			symbol: null,
			conviction: .7,
			sizePct: 0
		};
	});
	const iris = agents.find((a) => a.id === "iris");
	const active = agents.filter((a) => a.id !== "iris" && a.vote !== "hold" && a.symbol);
	const sameName = active.length >= 2 && active.every((a) => a.symbol === active[0].symbol && a.vote === active[0].vote);
	const mood = iris.thesis.includes("No new risk") || iris.thesis.includes("Bez nowego ryzyka") ? "risk-off" : sameName ? "risk-on" : "cautious";
	let order = null;
	const lead = [...active].sort((a, b) => b.conviction - a.conviction)[0];
	const repeat = last?.order && lead && last.order.symbol === lead.symbol && last.order.side === lead.vote;
	if (mood !== "risk-off" && lead?.symbol && lead.vote !== "hold" && (sameName || lead.conviction >= .62) && !repeat) {
		const tk = tickers.find((x) => x.symbol === lead.symbol);
		if (tk) {
			const qty = sizeQty(snap.book.equity, Math.max(lead.sizePct, 3), tk);
			if (qty > 0) {
				order = {
					side: lead.vote,
					symbol: lead.symbol,
					qty,
					rationale: L(locale, `Iris sizes a ${Math.max(lead.sizePct, 3).toFixed(0)}% position behind ${lead.id} in ${lead.symbol}.`, `Iris daje ${Math.max(lead.sizePct, 3).toFixed(0)}% kapitału za głosem ${lead.id} na ${lead.symbol}.`)
				};
				iris.vote = lead.vote;
				iris.symbol = lead.symbol;
				iris.sizePct = Math.max(lead.sizePct, 3);
				iris.thesis = `${order.rationale} ${fmt(tk, locale)}.`;
			}
		}
	} else if (repeat) iris.thesis = L(locale, `We already called ${last?.order?.side.toUpperCase()} ${last?.order?.symbol}. I will not stamp the same ticket again.`, `Już zagłosowaliśmy ${last?.order?.side === "buy" ? "KUP" : "SPRZEDAJ"} ${last?.order?.symbol}. Nie pieczętuję tego samego zlecenia drugi raz.`);
	return {
		mood,
		summary: mood === "risk-off" ? L(locale, "Chair keeps the book light. No new risk this round.", "Iris trzyma portfel lekki. Bez nowego ryzyka w tej rundzie.") : order ? L(locale, `Quorum leans ${order.side.toUpperCase()} ${order.symbol}.`, `Rada skłania się ku ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}.`) : repeat ? L(locale, "Same picture as last session — no new ticket.", "Ten sam obraz co ostatnio — bez nowego zlecenia.") : L(locale, "The agents disagree. Stay in cash and wait.", "Agenci się nie zgadzają. Zostań w gotówce i czekaj."),
		agents,
		order
	};
}
function localAsk(question, snap, locale = "en") {
	const q = question.toLowerCase();
	const tickers = snap.tickers.filter((t) => t.price > 0);
	const focus = UNIVERSE.filter((u) => q.includes(u.symbol.toLowerCase()) || q.includes(u.name.toLowerCase()) || u.symbol === "BTC" && /bitcoin|btc/.test(q) || u.symbol === "ETH" && /ether|eth/.test(q) || u.symbol === "GOLD" && /gold|złot|zlot/.test(q) || u.symbol === "SILVER" && /silver|srebr/.test(q)).map((u) => tickers.find((t) => t.symbol === u.symbol)).filter(Boolean)[0] ?? tickers.find((t) => t.symbol === snap.book.positions[0]?.symbol) ?? rank(tickers, (t) => Math.abs(t.changePct))[0];
	if (!focus) return {
		speaker: "iris",
		text: L(locale, "Board is empty. Nothing to say until prices are live.", "Rynek pusty. Nie mam co powiedzieć, dopóki nie ma cen.")
	};
	const pos = snap.book.positions.find((p) => p.symbol === focus.symbol);
	const cashPct = 100 * snap.book.cash / Math.max(snap.book.equity, 1);
	const line = fmt(focus, locale);
	const range = L(locale, `session ${focus.low.toFixed(focus.price >= 100 ? 2 : 4)}–${focus.high.toFixed(focus.price >= 100 ? 2 : 4)}`, `sesja ${focus.low.toFixed(focus.price >= 100 ? 2 : 4)}–${focus.high.toFixed(focus.price >= 100 ? 2 : 4)}`);
	const hold = pos ? L(locale, `Book is ${pos.qty > 0 ? "long" : "short"} ${Math.abs(pos.qty).toFixed(isLot(pos.symbol) ? 4 : 2)} ${pos.symbol} from ${pos.avg.toFixed(2)}, now ${pos.pnlPct >= 0 ? "+" : ""}${pos.pnlPct.toFixed(2)}%.`, `Portfel trzyma ${pos.qty > 0 ? "długą" : "krótką"} ${Math.abs(pos.qty).toFixed(isLot(pos.symbol) ? 4 : 2)} ${pos.symbol} ze średniej ${pos.avg.toFixed(2)}, teraz ${pos.pnlPct >= 0 ? "+" : ""}${pos.pnlPct.toFixed(2)}%.`) : L(locale, `Flat ${focus.symbol}.`, `Brak pozycji na ${focus.symbol}.`);
	const hot = rank(tickers, (t) => t.changePct)[0];
	const cold = rank(tickers, (t) => -t.changePct)[0];
	if (/close|flat|stop|cut|exit|flatten|zamyk|zamkn/.test(q)) {
		if (!pos) return {
			speaker: "iris",
			text: L(locale, `Hold. ${hold} Cash is ${cashPct.toFixed(0)}% of equity (${snap.book.dayPnlPct.toFixed(2)}% on the day). ${line}. Nothing to close.`, `Czekaj. ${hold} Gotówka to ${cashPct.toFixed(0)}% kapitału (dzień ${snap.book.dayPnlPct.toFixed(2)}%). ${line}. Nie ma czego zamykać.`)
		};
		const cut = pos.pnlPct < -1.2 || pos.qty > 0 && focus.changePct < -.8;
		return {
			speaker: "iris",
			text: L(locale, `${cut ? "Flatten." : "Sit."} ${hold} ${line}, ${range}. ${cut ? "The idea is leaking. Cut, then wait for a new story." : "The P&L is still the trade. Chopping around the spread is how books die — leave it."}`, `${cut ? "Zamykaj." : "Siedź."} ${hold} ${line}, ${range}. ${cut ? "Pomysł się sypie. Zamknij i poczekaj na nową historię." : "Wynik nadal jest tym handlem. Strzyżenie spreadu zabija portfel — zostaw."}`)
		};
	}
	if (/risk|size|how much|draw|cash|kelly|probe|wielko|gotów|ryzyk/.test(q)) {
		const probe = snap.book.equity * .04;
		const shares = focus.price > 0 ? probe / focus.price : 0;
		return {
			speaker: "iris",
			text: L(locale, `Size from cash, not from mood. Cash ${cashPct.toFixed(0)}% · day ${snap.book.dayPnlPct.toFixed(2)}% · equity ~${Math.round(snap.book.equity).toLocaleString()}. A small position is 3–5% of equity: about ${isLot(focus.symbol) ? shares.toFixed(4) : shares.toFixed(1)} ${focus.symbol} at ${focus.price.toFixed(2)} (${line}). Never more than a quarter in one name. ${hold}`, `Wielkość z gotówki, nie z humoru. Gotówka ${cashPct.toFixed(0)}% · dzień ${snap.book.dayPnlPct.toFixed(2)}% · kapitał ~${Math.round(snap.book.equity).toLocaleString("pl-PL")}. Mała pozycja to 3–5% kapitału: około ${isLot(focus.symbol) ? shares.toFixed(4) : shares.toFixed(1)} ${focus.symbol} po ${focus.price.toFixed(2)} (${line}). Nigdy więcej niż ćwierć w jednej spółce. ${hold}`)
		};
	}
	if (/fade|dip|oversold|stretched|revert|mean|wash|przecen|skraj/.test(q)) {
		const washed = focus.vsSma < -.55 && focus.rsi < 42;
		const extended = focus.vsSma > .85 && focus.rsi > 62;
		return {
			speaker: "ash",
			text: L(locale, `${washed ? "Probe the dip." : extended ? "Offer it." : "Wait."} ${line}, ${range}. ${washed ? `${focus.symbol} looks washed out — one 3% clip, no average.` : extended ? `${focus.symbol} ran too far. If you are long, trail; if you are flat, do not chase.` : `Not stretched enough. Let ${focus.symbol} come to us. Leader is ${hot?.symbol} ${hot?.changePct.toFixed(2)}%.`} ${hold}`, `${washed ? "Sprawdź spadek małą pozycją." : extended ? "Sprzedawaj." : "Czekaj."} ${line}, ${range}. ${washed ? `${focus.symbol} wygląda na przecenione — jedna pozycja 3%, bez dokładania.` : extended ? `${focus.symbol} odjechało za daleko. Jeśli trzymasz długą — trzymaj z dystansem; jeśli nic nie masz — nie gonić.` : `Za mało skrajne. Niech ${focus.symbol} przyjdzie do nas. Lider to ${hot?.symbol} ${hot?.changePct.toFixed(2)}%.`} ${hold}`)
		};
	}
	if (/sell|short|weak|offer|sprzed|krótk|slab|słab/.test(q)) return {
		speaker: "kai",
		text: L(locale, `${focus.changePct < -.6 ? "The market is offering it." : "Not weak enough."} ${line}. Laggard is ${cold?.symbol} ${cold?.changePct.toFixed(2)}%, leader ${hot?.symbol} ${hot?.changePct.toFixed(2)}%. ${focus.changePct < -.6 ? `A small short in ${focus.symbol} is honest if Iris sizes 3–4%. Do not fade ${hot?.symbol} just because this one is red.` : `Do not short ${focus.symbol} out of boredom. Wait for a clean offer.`} ${hold}`, `${focus.changePct < -.6 ? "Rynek to sprzedaje." : "Za mało słabe."} ${line}. Najsłabszy ${cold?.symbol} ${cold?.changePct.toFixed(2)}%, lider ${hot?.symbol} ${hot?.changePct.toFixed(2)}%. ${focus.changePct < -.6 ? `Krótka na ${focus.symbol} ma sens, jeśli Iris da 3–4%. Nie graj przeciw ${hot?.symbol} tylko dlatego, że to jest na minusie.` : `Nie otwieraj krótkiej na ${focus.symbol} z nudów. Poczekaj na czysty sygnał sprzedaży.`} ${hold}`)
	};
	if (/break|momentum|trend|chase|leader|buy|long|kup|trend|goni/.test(q)) {
		const go = focus.changePct > .4 && focus.vsSma > .1 && focus.rsi < 72;
		return {
			speaker: "vesper",
			text: L(locale, `${go ? "Ride it." : "Not a breakout I chase."} ${line}, ${range}. ${go ? `${focus.symbol} is expanding. Small position, not a hero — cut if it stalls back through the open (${focus.open.toFixed(2)}).` : `Hottest print is ${hot?.symbol} ${hot?.changePct.toFixed(2)}%. ${focus.symbol} needs confirmation before I put size on.`} ${hold}`, `${go ? "Jedź z tym." : "To nie jest wybicie, które gonię."} ${line}, ${range}. ${go ? `${focus.symbol} idzie w górę. Mała pozycja, nie bohater — zamknij, jeśli wróci pod otwarcie (${focus.open.toFixed(2)}).` : `Najmocniejszy ruch to ${hot?.symbol} ${hot?.changePct.toFixed(2)}%. ${focus.symbol} potrzebuje potwierdzenia, zanim dam wielkość.`} ${hold}`)
		};
	}
	if (/why|news|flow|tape|happen|tell|who|headline|wire|nagłów|wiadom|dzieje/.test(q)) {
		const news = snap.headlines[0];
		if (news || /news|headline|wire|nagłów|wiadom/.test(q)) return {
			speaker: "damian",
			text: news ? L(locale, `Headline: ${news.text}. ${news.symbol ? `${news.symbol} is the name on that story.` : "No name tagged."} ${hold} ${line}, ${range}. I trade the story only when the price agrees — asking does not fill.`, `Wiadomość: ${news.text}. ${news.symbol ? `Spółka z tego nagłówka: ${news.symbol}.` : "Nie ma przypiętej spółki."} ${hold} ${line}, ${range}. Handluję historią tylko gdy cena się zgadza — pytanie nie składa zlecenia.`) : L(locale, `Headlines are quiet. Leader ${hot?.symbol} ${hot?.changePct.toFixed(2)}%, laggard ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. ${focus.symbol} sits ${focus.changePct.toFixed(2)}% vs open. No headline I will invent.`, `W wiadomościach cisza. Lider ${hot?.symbol} ${hot?.changePct.toFixed(2)}%, najsłabszy ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. ${focus.symbol} jest ${focus.changePct.toFixed(2)}% od otwarcia. Nie wymyślam nagłówka.`)
		};
		return {
			speaker: "kai",
			text: L(locale, `No headline feed — we trade the print. Leader ${hot?.symbol} ${hot?.changePct.toFixed(2)}%, laggard ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. ${focus.symbol} sits ${focus.changePct.toFixed(2)}% vs open, ${range}. ${hold} If you want a ticket, convene; asking does not fill.`, `Nie ma wiadomości — gramy to, co widać na cenach. Lider ${hot?.symbol} ${hot?.changePct.toFixed(2)}%, najsłabszy ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. ${focus.symbol} jest ${focus.changePct.toFixed(2)}% od otwarcia, ${range}. ${hold} Jeśli chcesz zlecenie, zwołaj radę; pytanie nic nie kupuje.`)
		};
	}
	const speaker = pos ? "ash" : focus.changePct > .3 ? "vesper" : "kai";
	return {
		speaker,
		text: speaker === "ash" ? L(locale, `Hold the thesis, not the hope. ${hold} ${line}, ${range}. I add on dips, not on squeezes.`, `Trzymaj pomysł, nie nadzieję. ${hold} ${line}, ${range}. Dokładam na spadkach, nie na panice w górę.`) : speaker === "vesper" ? L(locale, `The market is voting ${focus.symbol}. ${line}. If you need a single name, that is it — still a 3–5% position, cut on a stall through ${focus.open.toFixed(2)}.`, `Rynek głosuje na ${focus.symbol}. ${line}. Jeśli potrzebujesz jednej spółki, to ona — nadal pozycja 3–5%, zamknij gdy wróci pod ${focus.open.toFixed(2)}.`) : L(locale, `${line}, ${range}. Two-way until it is not. Leader ${hot?.symbol} ${hot?.changePct.toFixed(2)}% / laggard ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. Ask a sharper question (close, size, fade, chase) and I will take a side.`, `${line}, ${range}. Rynek w dwie strony, dopóki nie jest inaczej. Lider ${hot?.symbol} ${hot?.changePct.toFixed(2)}% / najsłabszy ${cold?.symbol} ${cold?.changePct.toFixed(2)}%. Spytaj ostrzej (zamknięcie, wielkość, spadek, trend), to wezmę stronę.`)
	};
}
var conveneCouncil = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("53881b375384a18162b7ca1787b680b3eb6d294180d70aa1bdaffe14fae37181"));
var askFloor = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("06af118d79fe5ca379095b3430783683b1e862954f62a809c1317e28038a0981"));
var loadDeskBook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fe8bb7b7a1cf2d937bc09dfe6254c5720783c76a41ac7b95d1367a7c2a461951"));
var saveDeskBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c5fd351cdb85b1f38396c6648973f61e8af17062402a3f2cda864a006ff4da33"));
var fetchLiveNews = createServerFn({ method: "POST" }).handler(createSsrRpc("1b66c75a680b0a51980dfceffcd80f87128acb04fd3e8999702cec1a1744748e"));
function subscribeLg(cb) {
	const mq = window.matchMedia("(min-width: 1024px)");
	mq.addEventListener("change", cb);
	return () => mq.removeEventListener("change", cb);
}
function useDesktop() {
	return (0, import_react.useSyncExternalStore)(subscribeLg, () => window.matchMedia("(min-width: 1024px)").matches, () => false);
}
var bootPromise = null;
var bootFor = null;
function bookChanged(a, b) {
	return a.cash !== b.cash || a.positions !== b.positions || a.fills !== b.fills || a.closedTrades !== b.closedTrades || a.autopilot !== b.autopilot || a.lastCouncil !== b.lastCouncil || a.lastAsk !== b.lastAsk || a.proposal !== b.proposal || a.fillSeq !== b.fillSeq || a.deskEpoch !== b.deskEpoch;
}
function DeskApp({ boot }) {
	if (boot.ok) installBootQuotes(boot.quotes);
	const hydrated = useDesk((s) => s.hydrated);
	const markHydrated = useDesk((s) => s.markHydrated);
	const applyLiveQuotes = useDesk((s) => s.applyLiveQuotes);
	const applyHeadlines = useDesk((s) => s.applyHeadlines);
	const setFeed = useDesk((s) => s.setFeed);
	const snapshot = useDesk((s) => s.snapshot);
	const setConvening = useDesk((s) => s.setConvening);
	const setAsking = useDesk((s) => s.setAsking);
	const applyCouncil = useDesk((s) => s.applyCouncil);
	const answerAsk = useDesk((s) => s.answerAsk);
	const setAgentStatus = useDesk((s) => s.setAgentStatus);
	const unveilAgent = useDesk((s) => s.unveilAgent);
	const convening = useDesk((s) => s.convening);
	const selected = useDesk((s) => s.selected);
	const feed = useFeed();
	const user = useCurrentUser();
	const t = useT();
	const locale = useLocale();
	const [tab, setTab] = (0, import_react.useState)("market");
	const [side, setSide] = (0, import_react.useState)("floor");
	const [splashCap, setSplashCap] = (0, import_react.useState)(false);
	const desktop = useDesktop();
	const synced = (0, import_react.useRef)(false);
	const saving = (0, import_react.useRef)(false);
	const syncing = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		const cap = window.setTimeout(() => setSplashCap(true), 1650);
		return () => window.clearTimeout(cap);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let live = true;
		fetchLiveMarket().then((res) => {
			if (!live) return;
			if (res.ok) applyLiveQuotes(res.quotes);
			else setFeed("stale");
		}).catch(() => {
			if (live) setFeed("stale");
		});
		if (bootFor !== user.id) {
			bootFor = user.id;
			bindDeskStorage(user.id);
			bootPromise = Promise.resolve().then(() => useDesk.persist.rehydrate()).then(() => void 0).catch(() => void 0);
		}
		bootPromise?.then(() => {
			if (!live) return;
			markHydrated();
			if (boot.ok) applyLiveQuotes(boot.quotes);
			syncBook(live);
			window.setTimeout(() => {
				if (live && document.visibilityState === "visible") syncBook(live);
			}, 2500);
		});
		return () => {
			live = false;
		};
	}, [user?.id]);
	async function syncBook(live = true) {
		if (syncing.current) return;
		syncing.current = true;
		let ok = false;
		try {
			const res = await Promise.race([loadDeskBook(), new Promise((_, reject) => window.setTimeout(() => reject(/* @__PURE__ */ new Error("desk sync timeout")), 4e3))]);
			if (!live) return;
			const server = res.book;
			const local = toDeskBook(useDesk.getState());
			if (preferServerBook(server, local)) useDesk.getState().hydrateBook(server);
			else if (bookLooksLive(local)) await saveDeskBook({ data: local });
			ok = true;
		} catch {} finally {
			syncing.current = false;
			const localLive = bookLooksLive(toDeskBook(useDesk.getState()));
			synced.current = ok || localLive;
		}
	}
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		let timer = 0;
		const unsub = useDesk.subscribe((state, prev) => {
			if (!synced.current) return;
			if (!bookChanged(state, prev)) return;
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				if (saving.current) return;
				saving.current = true;
				const book = toDeskBook(useDesk.getState());
				saveDeskBook({ data: book }).then((res) => {
					if (!res.accepted && res.book && preferServerBook(res.book, book)) useDesk.getState().hydrateBook(res.book);
				}).catch(() => void 0).finally(() => {
					saving.current = false;
				});
			}, 700);
		});
		return () => {
			unsub();
			window.clearTimeout(timer);
		};
	}, [hydrated]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		const beat = window.setInterval(() => {
			if (document.hidden || !synced.current) return;
			const book = toDeskBook(useDesk.getState());
			if (!bookLooksLive(book) && !book.autopilot) return;
			useDesk.getState().touchTick();
			saveDeskBook({ data: toDeskBook(useDesk.getState()) }).catch(() => void 0);
		}, 2e4);
		const onVis = () => {
			if (document.visibilityState === "visible") syncBook(true);
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			window.clearInterval(beat);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [hydrated]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		let live = true;
		let inFlight = false;
		async function pull() {
			if (inFlight || document.hidden) return;
			inFlight = true;
			try {
				const res = await fetchLiveMarket();
				if (!live) return;
				if (res.ok) applyLiveQuotes(res.quotes);
				else setFeed("stale");
			} catch {
				if (live) setFeed("stale");
			} finally {
				inFlight = false;
			}
		}
		const id = window.setInterval(() => void pull(), 8e3);
		const onVis = () => {
			if (document.visibilityState === "visible") pull();
		};
		document.addEventListener("visibilitychange", onVis);
		return () => {
			live = false;
			window.clearInterval(id);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, [
		hydrated,
		applyLiveQuotes,
		setFeed
	]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		let live = true;
		let inFlight = false;
		async function pullWire() {
			if (inFlight || document.hidden) return;
			inFlight = true;
			try {
				const res = await fetchLiveNews();
				if (!live) return;
				if (res.ok) applyHeadlines(res.headlines);
			} catch {} finally {
				inFlight = false;
			}
		}
		pullWire();
		const id = window.setInterval(() => void pullWire(), 6e4);
		return () => {
			live = false;
			window.clearInterval(id);
		};
	}, [hydrated, applyHeadlines]);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => {
			if (document.hidden) return;
			if (useDesk.getState().paused) return;
			useMarks.getState().tick(liveAssets());
		}, 400);
		return () => window.clearInterval(id);
	}, []);
	async function convene() {
		if (convening) return;
		setConvening(true);
		for (const a of AGENTS) setAgentStatus(a.id, "reading");
		const snap = snapshot();
		const last = useDesk.getState().lastCouncil;
		const selected = useDesk.getState().selected;
		let result;
		let source = "ai";
		const lastDamian = last?.agents.find((a) => a.id === "damian")?.thesis;
		const seenNews = [...useDesk.getState().tape.filter((row) => row.kind === "news" || row.agentId === "damian").map((row) => row.text), ...lastDamian ? [lastDamian] : []];
		try {
			const res = await conveneCouncil({ data: {
				snap,
				last,
				selected,
				locale
			} });
			if (res.ok) result = res.result;
			else {
				result = localCouncil(snap, last, locale, seenNews);
				source = "local";
			}
		} catch {
			result = localCouncil(snap, last, locale, seenNews);
			source = "local";
		}
		try {
			const speak = useDesk.getState().speak;
			for (const row of result.agents) {
				await new Promise((r) => window.setTimeout(r, 220));
				unveilAgent(row);
				if (row.id === "damian") {
					if (useDesk.getState().tape.some((item) => {
						if (item.kind !== "news" && item.agentId !== "damian") return false;
						return newsOverlap(item.text, row.thesis);
					})) continue;
				}
				speak({
					kind: "agent",
					agentId: row.id,
					symbol: row.symbol ?? void 0,
					text: row.thesis
				});
			}
			applyCouncil(result, source, { spoken: true });
			if (source === "ai") toast.success(t("toast.councilClosed"));
			else toast.message(t("toast.councilLocal"));
		} catch {
			setConvening(false);
			toast.error(t("toast.councilStalled"));
		}
	}
	async function ask(question) {
		if (useDesk.getState().asking) return;
		setAsking(true);
		const snap = snapshot();
		const state = useDesk.getState();
		try {
			const res = await Promise.race([askFloor({ data: {
				question,
				snap,
				selected: state.selected,
				lastCouncil: state.lastCouncil,
				lastAsk: state.lastAsk,
				recentFills: state.fills.slice(0, 6).map((f) => ({
					symbol: f.symbol,
					side: f.side,
					qty: f.qty,
					price: f.price,
					note: f.note
				})),
				locale
			} }), new Promise((resolve) => window.setTimeout(() => resolve({
				ok: false,
				error: "timeout"
			}), 24e3))]);
			if (res.ok) {
				answerAsk(question, res.result, "ai");
				toast.success(t("toast.answered", { name: AGENT_BY_ID[res.result.speaker].name }));
				return;
			}
			const fallback = localAsk(question, snap, locale);
			answerAsk(question, fallback, "local");
			toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
		} catch {
			const fallback = localAsk(question, snap, locale);
			answerAsk(question, fallback, "local");
			toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
		} finally {
			setAsking(false);
		}
	}
	const showSplash = !splashCap && (!hydrated || feed === "idle");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-selected": selected,
		className: "desk-wash relative flex h-dvh flex-col overflow-hidden",
		children: [
			showSplash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeoffSplash, {
				overlay: true,
				caption: t("splash.waiting")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTour, {
				ready: !showSplash,
				userId: user?.id,
				onOpenSettings: () => {
					setTab("settings");
					setSide("settings");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskHeader, {
				onConvene: convene,
				convening,
				onOpenSettings: () => {
					setTab("settings");
					setSide("settings");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenedStrip, {}),
			desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 grid-cols-[16.5rem_minmax(0,1fr)_22rem] grid-rows-[minmax(0,1fr)_12rem] gap-3 overflow-hidden p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "row-span-2 min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Watchlist, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 overflow-hidden rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPanel, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "row-span-2 min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							value: side,
							onValueChange: (v) => setSide(v),
							className: "flex h-full min-h-0 flex-col gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "w-full shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "floor",
										className: "text-2xs sm:text-sm",
										children: t("nav.floor")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "portfolio",
										className: "text-2xs sm:text-sm",
										children: t("nav.portfolio")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "settings",
										className: "text-2xs sm:text-sm",
										children: t("nav.settings")
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-h-0 flex-1 overflow-hidden",
								children: side === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouncilPanel, { onAsk: ask }) : side === "portfolio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapePanel, {})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 pb-24",
				children: [
					tab === "market" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerStrip, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPanel, {})
						})]
					}) : null,
					tab === "portfolio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPanel, {})
					}) : null,
					tab === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouncilPanel, { onAsk: ask })
					}) : null,
					tab === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden rounded-2xl bg-surface p-3 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {})
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-4",
					children: [
						[
							"market",
							t("nav.market"),
							ChartColumn
						],
						[
							"portfolio",
							t("nav.portfolio"),
							Briefcase
						],
						[
							"floor",
							t("nav.floor"),
							Users
						],
						[
							"settings",
							t("nav.settings"),
							Settings
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: cn("flex h-16 w-full flex-col items-center justify-center gap-0.5 px-0.5 text-center text-3xs font-medium leading-none tracking-tight whitespace-nowrap", tab === id ? "text-fg" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
					}) }, id))
				})
			})] })
		]
	});
}
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
function Home() {
	const boot = Route$2.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	const t = useT();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeoffSplash, { caption: t("splash.opening") });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskApp, { boot });
}
//#endregion
export { Home as component };
