import { o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { i as isLot, n as UNIVERSE } from "./universe-BHNCzOwL.mjs";
import { a as changePct, c as isReduce, g as withTeamLocks, h as viewOf, l as promisingHold, m as teamBlocks, o as holdExpired, p as stampOpened, r as addCountToday, s as isAddOn, t as AGENTS } from "./holds-BpglsS1V.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { o as withEquityPct } from "./macro-DaPt4VNL.mjs";
import { C as t, S as subscribeLocale, b as hydrateLocale, g as tapeFillText, r as normalizeAlertPrefs, t as DEFAULT_ALERT_PREFS, v as LOCALES, x as setLocale, y as getLocale } from "./alert-prefs-BDQeOj_T.mjs";
import { A as recordsFrom, C as liveProposal, E as openCall, M as rollAnchors, N as stampProposal, T as markOpenCalls, _ as compactScorecard, a as hitStop, c as notionalOk, d as preferBook, f as scrubGhostAutopilot, g as closedFromFill, h as closeCallsFor, i as emptyBook, k as proposerFrom, o as hlFeeUsd, s as idleAgents, t as applyFill, v as decorateClosed, y as equityOf } from "./engine-C1GaS4Le.mjs";
import { t as analysisSnapshot } from "./setup-Dx2LqFQi.mjs";
import { $ as union, J as number, K as literal, Q as string, Y as object } from "../_libs/@better-auth/core+[...].mjs";
import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { i as TriangleAlert, o as Plane } from "../_libs/lucide-react.mjs";
import { i as newsOverlap, n as newsKey, r as newsKeysFrom, t as isQuietNews } from "./news-key-By_bmI6f.mjs";
import { t as auth } from "./server-B2mxShfj.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as Trigger, i as Root3, n as Portal, r as Provider, t as Content2 } from "../_libs/@radix-ui/react-tooltip+[...].mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-DRZ3PoR7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function useLocale() {
	const locale = (0, import_react.useSyncExternalStore)(subscribeLocale, getLocale, getLocale);
	(0, import_react.useLayoutEffect)(() => {
		hydrateLocale();
	}, []);
	return locale;
}
function useT() {
	const locale = useLocale();
	return (0, import_react.useCallback)((key, vars) => t(key, vars, locale), [locale]);
}
function LanguageSwitch({ compact }) {
	const locale = useLocale();
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "group",
		"aria-label": t("settings.language"),
		"data-language-switch": "",
		className: cn("grid grid-cols-2 gap-1 rounded-lg bg-surface p-1", compact && "max-w-[12rem]"),
		children: LOCALES.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setLocale(row.id),
			"aria-pressed": locale === row.id,
			"data-locale": row.id,
			className: cn("flex h-11 items-center justify-center rounded-md text-sm font-medium", locale === row.id ? "bg-elevated text-fg" : "text-muted"),
			children: row.label
		}, row.id))
	});
}
var APP_NAME = "ZiggyWizzAir";
var BOOT_LINES = [
	"splash.line1",
	"splash.line2",
	"splash.line3",
	"splash.line4",
	"splash.line5",
	"splash.line6",
	"splash.line7",
	"splash.line8"
];
var BOOT_MIN_MS = 3200;
var bootShownAt = 0;
function markBootSplash() {
	if (!bootShownAt) bootShownAt = Date.now();
}
function bootSplashHolding(hydrated, feed) {
	if (!hydrated || feed === "idle") return true;
	const start = bootShownAt || Date.now();
	return Date.now() - start < BOOT_MIN_MS;
}
function PlaneMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
			className: "size-[58%] -rotate-45",
			strokeWidth: 2.25,
			"aria-hidden": true
		})
	});
}
function ModeKicker({ mode, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: cn("mode-kicker text-3xs font-medium tracking-[0.22em] uppercase", mode === "live" ? "text-down" : "text-muted", className),
		children: mode
	}, mode);
}
function TakeoffSplash({ overlay, caption, kind = "takeoff", mode, cycle }) {
	const locale = useLocale();
	const takeoff = kind === "takeoff";
	const [line, setLine] = (0, import_react.useState)(0);
	if (cycle) markBootSplash();
	(0, import_react.useEffect)(() => {
		if (!cycle) return;
		markBootSplash();
		const id = window.setInterval(() => setLine((n) => n + 1), 2e3);
		return () => window.clearInterval(id);
	}, [cycle]);
	const phrase = cycle ? t(BOOT_LINES[line % BOOT_LINES.length], void 0, locale) : caption;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center overflow-hidden bg-bg", overlay ? "absolute inset-0 z-50" : "h-dvh"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "takeoff-stage relative flex h-40 w-full items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn(takeoff ? "takeoff-contrail" : "landing-contrail", cycle && "takeoff-loop"),
				"aria-hidden": true
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
				className: cn("size-14 text-fg", takeoff ? "takeoff-plane" : "landing-plane", cycle && "takeoff-loop"),
				strokeWidth: 1.75,
				"aria-hidden": true
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("mt-2 text-center", !cycle && "takeoff-title"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold tracking-tight",
					children: APP_NAME
				}),
				mode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeKicker, {
					mode,
					className: "mt-1.5"
				}) : null,
				phrase ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("mt-1.5 px-6 text-2xs tracking-wide text-muted", cycle && "splash-now"),
					children: phrase
				}, cycle ? `${locale}-${line}` : phrase) : null
			]
		})]
	});
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CjFCPsMZ.js
var KEY = "quorum-appearance";
function readAppearance() {
	if (typeof window === "undefined") return "dark";
	try {
		const raw = window.localStorage.getItem(KEY);
		if (raw === "light" || raw === "dark" || raw === "system") return raw;
	} catch {}
	return "dark";
}
function resolveAppearance(mode) {
	if (mode !== "system") return mode;
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
function applyAppearance(mode) {
	if (typeof document === "undefined") return;
	const resolved = resolveAppearance(mode);
	const root = document.documentElement;
	root.classList.toggle("light", resolved === "light");
	root.classList.toggle("dark", resolved === "dark");
	root.style.colorScheme = resolved;
	const meta = document.querySelector("meta[name=\"theme-color\"]");
	if (meta) meta.setAttribute("content", resolved === "light" ? "#f4f4f5" : "#09090b");
	try {
		window.localStorage.setItem(KEY, mode);
	} catch {}
}
var Ctx = (0, import_react.createContext)(null);
function ThemeProvider({ children }) {
	const [appearance, setAppearanceState] = (0, import_react.useState)("dark");
	const [resolved, setResolved] = (0, import_react.useState)("dark");
	(0, import_react.useLayoutEffect)(() => {
		const mode = readAppearance();
		setAppearanceState(mode);
		setResolved(resolveAppearance(mode));
		applyAppearance(mode);
	}, []);
	(0, import_react.useEffect)(() => {
		if (appearance !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: light)");
		const onChange = () => {
			setResolved(resolveAppearance("system"));
			applyAppearance("system");
		};
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [appearance]);
	const value = (0, import_react.useMemo)(() => ({
		appearance,
		resolved,
		setAppearance: (mode) => {
			setAppearanceState(mode);
			setResolved(resolveAppearance(mode));
			applyAppearance(mode);
		}
	}), [appearance, resolved]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useAppearance() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useAppearance needs ThemeProvider");
	return ctx;
}
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
			const print = (a.livePx && a.livePx > 0 ? a.livePx : a.price) || 0;
			if (!print) continue;
			if (quiet) {
				next[a.symbol] = print;
				continue;
			}
			const last = prev[a.symbol] ?? print;
			const raw = last + (print - last) * .55 + (quiet ? 0 : print * a.vol * .006 * (Math.random() * 2 - 1));
			const lo = print * .9994;
			const hi = print * 1.0006;
			next[a.symbol] = Math.min(hi, Math.max(lo, raw));
		}
		set({ marks: next });
	}
}));
function useMark(symbol) {
	return useMarks((s) => s.marks[symbol] ?? 0);
}
var useTradingMode = create()(persist((set) => ({
	mode: "demo",
	setMode: (mode) => set({ mode })
}), { name: "zw-trading-mode" }));
function bindTradingMode(userId) {
	useTradingMode.persist.setOptions({ name: `zw-trading-mode-${userId}` });
}
function bumpLast(bars, mid, now, stepMs, keep) {
	if (!bars?.length) return bars;
	const bucket = Math.floor(now / stepMs) * stepMs;
	const last = bars.at(-1);
	if (now - last.t < stepMs) return [...bars.slice(0, -1), {
		t: last.t,
		px: mid,
		v: last.v,
		o: last.o ?? last.px,
		h: last.h != null ? Math.max(last.h, mid) : Math.max(last.px, mid),
		l: last.l != null ? Math.min(last.l, mid) : Math.min(last.px, mid)
	}];
	return [...bars.slice(-(keep - 1)), {
		t: bucket,
		px: mid,
		o: mid,
		h: mid,
		l: mid
	}];
}
var empty = emptyBook();
var ASK_TTL_MS = 864e5;
function pruneAsk(ask, now = Date.now()) {
	if (!ask) return null;
	const rows = (ask.log?.length ? ask.log : [{
		question: ask.question,
		speaker: ask.speaker,
		text: ask.text,
		ts: ask.ts
	}]).map((r) => ({
		...r,
		ts: r.ts ?? 0
	})).filter((r) => r.ts > now - ASK_TTL_MS);
	if (!rows.length) return null;
	const last = rows[rows.length - 1];
	return {
		question: last.question,
		speaker: last.speaker,
		text: last.text,
		ts: last.ts,
		log: rows
	};
}
function keepAsk(incoming, current) {
	const now = Date.now();
	const a = pruneAsk(incoming, now);
	const b = pruneAsk(current, now);
	const aLen = a?.log?.length ?? (a ? 1 : 0);
	const bLen = b?.log?.length ?? (b ? 1 : 0);
	if (bLen > aLen) return b;
	if (aLen > bLen) return a;
	if (b && a && (b.text?.length ?? 0) > (a.text?.length ?? 0)) return b;
	return a ?? b;
}
function speechFromCouncil(result) {
	return AGENTS.map((p) => {
		const a = result.agents.find((row) => row.id === p.id);
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
function uniqueNewsTape(tape) {
	const seen = /* @__PURE__ */ new Set();
	const out = [];
	for (const row of tape) {
		if (row.kind === "news" || row.agentId === "damian") {
			const k = newsKey(row.text);
			if (k && seen.has(k)) continue;
			if (k) seen.add(k);
		}
		out.push(row);
	}
	return out.slice(0, 120);
}
function mergeAssets(assets) {
	const out = {};
	for (const [k, a] of Object.entries(assets)) {
		const px = a.livePx && a.livePx > 0 ? a.livePx : a.price;
		out[k] = {
			...a,
			price: px || a.price
		};
	}
	return out;
}
function bookEquity(cash, positions, assets) {
	return equityOf(cash, positions, mergeAssets(assets));
}
function liveAssets() {
	return mergeAssets(useDesk.getState().assets);
}
function useAssets() {
	return useDesk((s) => s.assets);
}
function useSelectedTape() {
	return useDesk((s) => s.assets[s.selected] ?? null);
}
function useFeed() {
	return useDesk((s) => s.feed);
}
function useMarkedAssets() {
	const assets = useDesk((s) => s.assets);
	const marks = useMarks((s) => s.marks);
	const out = {};
	for (const [k, a] of Object.entries(assets)) {
		const px = marks[k] || a.livePx || a.price;
		out[k] = {
			...a,
			price: px || a.price
		};
	}
	return out;
}
var bootQuotes = null;
function installBootQuotes(quotes) {
	bootQuotes = quotes;
}
function preferServerBook(server, local) {
	return preferBook(server, local);
}
function toDeskBook(s) {
	return {
		cash: s.cash,
		positions: s.positions,
		fills: s.fills,
		closedTrades: s.closedTrades,
		autopilot: s.autopilot,
		lastCouncil: s.lastCouncil,
		lastAsk: pruneAsk(s.lastAsk),
		agents: s.agents,
		startingEquity: s.startingEquity,
		periodAnchors: s.periodAnchors,
		tape: s.tape,
		proposal: s.proposal,
		working: s.working,
		selected: s.selected,
		lastAutoAt: s.lastAutoAt,
		lastTickAt: s.lastTickAt,
		fillSeq: s.fillSeq,
		clientUntil: Date.now() + 45e3,
		deskEpoch: s.deskEpoch,
		agentCalls: s.agentCalls,
		lastCouncilAt: s.lastCouncilAt,
		locale: getLocale(),
		mode: useTradingMode.getState().mode,
		alertPrefs: s.alertPrefs ?? { ...DEFAULT_ALERT_PREFS }
	};
}
function bindDeskStorage(userId) {
	useDesk.persist.setOptions({ name: `zw-desk-${userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)}` });
}
var useDesk = create()(persist((set, get) => ({
	...empty,
	hydrated: false,
	assets: {},
	headlines: [],
	macro: null,
	convening: false,
	asking: false,
	pendingAsk: null,
	paused: false,
	feed: "idle",
	lastFeedAt: 0,
	clock: Date.now(),
	markHydrated: () => set({ hydrated: true }),
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
				price: q.livePx ?? q.price,
				open: q.prevClose,
				high: q.high,
				low: q.low,
				series: (q.series.length ? q.series : prev?.series ?? [{
					t: now,
					px: q.livePx ?? q.price
				}]).slice(-120),
				chart5: q.chart5 && q.chart5.length >= 2 ? q.chart5.slice(-90) : prev?.chart5,
				htf: q.htf && (q.htf.m15?.length ?? 0) >= (prev?.htf?.m15.length ?? 0) ? q.htf : q.htf && (q.htf.m15?.length ?? 0) >= 48 ? q.htf : prev?.htf ?? q.htf,
				vol: u.vol,
				beta: u.beta,
				livePx: q.livePx ?? prev?.livePx ?? null,
				liveCoin: q.liveCoin ?? prev?.liveCoin ?? null,
				spotPx: q.spotPx ?? prev?.spotPx ?? q.price,
				tape: q.tape ?? prev?.tape ?? "yahoo"
			};
		}
		set({
			assets,
			clock: now,
			feed: "live",
			lastFeedAt: now,
			agentCalls: markOpenCalls(s.agentCalls ?? [], Object.fromEntries(Object.entries(assets).map(([k, a]) => [k, a?.price ?? 0])), now)
		});
		useMarks.getState().tick(mergeAssets(assets));
		if (first) {
			if (!s.tape.some((row) => row.kind === "system" && (row.text.startsWith("Live tape on") || row.text.startsWith("Ceny na żywo")))) get().speak({
				kind: "system",
				text: t("tape.liveOn")
			});
		}
		get().applyPriceStops();
		get().applyTimeStops();
		get().tryFillWorking();
	},
	applyLiveMids: (mids) => {
		const s = get();
		const assets = { ...s.assets };
		let hit = false;
		const now = Date.now();
		const selected = s.selected;
		for (const [sym, mid] of Object.entries(mids)) {
			const prev = assets[sym];
			if (!prev || !(mid > 0)) continue;
			const lastPx = prev.livePx && prev.livePx > 0 ? prev.livePx : prev.price;
			if (Math.abs(lastPx - mid) / mid < 1e-8) continue;
			hit = true;
			const last = prev.series.at(-1);
			const bucket = Math.floor(now / 6e4) * 6e4;
			const series = sym === selected ? last && bucket - last.t < 6e4 ? [...prev.series.slice(0, -1), {
				t: last.t,
				px: mid,
				v: last.v,
				o: last.o ?? last.px,
				h: last.h != null ? Math.max(last.h, mid) : Math.max(last.px, mid),
				l: last.l != null ? Math.min(last.l, mid) : Math.min(last.px, mid)
			}] : [...prev.series.slice(-119), {
				t: bucket,
				px: mid,
				o: mid,
				h: mid,
				l: mid
			}] : prev.series;
			const chart5 = bumpLast(prev.chart5, mid, now, 3e5, 90);
			const htf = prev.htf ? {
				m15: bumpLast(prev.htf.m15, mid, now, 9e5, 96) ?? prev.htf.m15,
				h1: prev.htf.h1,
				h4: prev.htf.h4
			} : prev.htf;
			assets[sym] = {
				...prev,
				price: mid,
				livePx: mid,
				high: prev.high ? Math.max(prev.high, mid) : mid,
				low: prev.low ? Math.min(prev.low, mid) : mid,
				series,
				chart5,
				htf
			};
		}
		if (!hit) return;
		set({
			assets,
			clock: now,
			feed: "live",
			lastFeedAt: now
		});
		useMarks.getState().tick(mergeAssets(assets));
		const proposal = liveProposal(get().proposal, now);
		if (proposal !== get().proposal) set({ proposal });
		get().applyPriceStops();
		get().applyTimeStops();
		get().tryFillWorking();
	},
	applySymbolChart: (symbol, tf, bars) => {
		if (!bars || bars.length < 2) return;
		const s = get();
		const prev = s.assets[symbol];
		if (!prev) return;
		const incomingLast = bars.at(-1).t;
		if (tf === "1m") {
			const have = prev.series;
			if (have.length >= bars.length && (have.at(-1)?.t ?? 0) >= incomingLast) return;
			set({ assets: {
				...s.assets,
				[symbol]: {
					...prev,
					series: bars.slice(-120)
				}
			} });
			return;
		}
		if (tf === "5m") {
			const have = prev.chart5 ?? [];
			if (have.length >= bars.length && (have.at(-1)?.t ?? 0) >= incomingLast) return;
			set({ assets: {
				...s.assets,
				[symbol]: {
					...prev,
					chart5: bars.slice(-90)
				}
			} });
			return;
		}
		const have = prev.htf?.m15 ?? [];
		if (have.length >= bars.length && (have.at(-1)?.t ?? 0) >= incomingLast) return;
		set({ assets: {
			...s.assets,
			[symbol]: {
				...prev,
				htf: {
					m15: bars.slice(-96),
					h1: prev.htf?.h1 ?? [],
					h4: prev.htf?.h4 ?? []
				}
			}
		} });
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
				symbol: h.symbol,
				text: h.symbol ? `${h.symbol} · ${h.text}` : h.text
			});
			spoken += 1;
		}
	},
	applyMacro: (macro) => set({
		macro,
		lastTickAt: Date.now()
	}),
	setFeed: (feed) => set({ feed }),
	select: (symbol) => {
		if (!symbol || symbol === get().selected) return;
		set({ selected: symbol });
	},
	setPaused: (paused) => set({ paused }),
	setAutopilot: (on) => {
		if (on && useTradingMode.getState().mode === "live") return;
		set({
			autopilot: on,
			lastTickAt: Date.now()
		});
		get().speak({
			kind: "system",
			text: on ? t("tape.autoOn") : t("tape.autoOff")
		});
	},
	setConvening: (on) => set({
		convening: on,
		lastAutoAt: on ? Date.now() : get().lastAutoAt
	}),
	setAsking: (on, question) => set({
		asking: on,
		pendingAsk: on ? question ?? get().pendingAsk : null
	}),
	setAgentStatus: (id, status) => set({ agents: get().agents.map((a) => a.id === id ? {
		...a,
		status
	} : a) }),
	placeOrder: ({ symbol, side, qty, source, note, skipRisk, feeKind, stopLoss, takeProfit }) => {
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
		if ((source === "council" || source === "autopilot") && teamBlocks(s.positions, symbol)) return {
			ok: false,
			error: "Team locked out of this trade."
		};
		const price = asset.price;
		const kind = feeKind ?? "taker";
		const fee = hlFeeUsd(sized, price, kind);
		const priced = mergeAssets(s.assets);
		const adding = isAddOn(s.positions, symbol, side);
		if (!skipRisk && adding && addCountToday(s.fills, Date.now()) >= 2) return {
			ok: false,
			error: "Iris veto — two adds today."
		};
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
			note,
			fee,
			feeKind: kind
		};
		const next = applyFill(s.cash, s.positions, fill);
		if (!skipRisk && next.cash < -.5) return {
			ok: false,
			error: "Iris veto — not enough cash."
		};
		const withStops = stampOpened(s.positions.find((p) => p.symbol === symbol), next.positions, fill).map((p) => {
			if (p.symbol !== symbol) return p;
			const sl = stopLoss !== void 0 ? stopLoss : p.stopLoss ?? null;
			const tp = takeProfit !== void 0 ? takeProfit : p.takeProfit ?? null;
			return {
				...p,
				stopLoss: sl,
				takeProfit: tp
			};
		});
		const closed = closedFromFill(s.positions.find((p) => p.symbol === symbol), fill);
		const decorated = closed ? decorateClosed(closed, s.lastCouncil, fill, s.fills, s.locale) : null;
		const closedTrades = decorated ? [decorated, ...s.closedTrades ?? []].slice(0, 200) : s.closedTrades ?? [];
		const eq = bookEquity(next.cash, withStops, priced);
		const stillOpen = Math.abs(withStops.find((p) => p.symbol === symbol)?.qty ?? 0) > 1e-8;
		let agentCalls = closeCallsFor(s.agentCalls ?? [], symbol, price, now, stillOpen);
		if (source === "council") {
			const who = proposerFrom(s.lastCouncil, symbol, side);
			if (who) agentCalls = [openCall({
				id: `c-${now.toString(36)}-${nextSeq.toString(36)}`,
				ts: now,
				agentId: who,
				symbol,
				side,
				entry: price,
				qty: sized,
				fillId: fill.id
			}), ...agentCalls].slice(0, 80);
		}
		set({
			cash: next.cash,
			positions: withStops,
			fills: [fill, ...s.fills].slice(0, 80),
			closedTrades,
			fillSeq: nextSeq,
			lastTickAt: now,
			periodAnchors: rollAnchors(s.periodAnchors, eq),
			agentCalls,
			proposal: s.proposal && s.proposal.symbol === symbol && s.proposal.side === side ? null : s.proposal
		});
		get().speak({
			kind: "fill",
			symbol,
			text: tapeFillText(fill, get().locale)
		});
		return {
			ok: true,
			fill
		};
	},
	setStops: (symbol, stops) => {
		const s = get();
		if (!s.positions.some((p) => p.symbol === symbol)) return;
		set({
			positions: s.positions.map((p) => p.symbol === symbol ? {
				...p,
				stopLoss: stops.stopLoss,
				takeProfit: stops.takeProfit
			} : p),
			lastTickAt: Date.now()
		});
	},
	setAlertPrefs: (prefs) => set({ alertPrefs: normalizeAlertPrefs(prefs) }),
	toggleTeamLock: (symbol) => {
		const s = get();
		const pos = s.positions.find((p) => p.symbol === symbol);
		if (!pos) return;
		const next = !pos.teamLock;
		set({
			positions: s.positions.map((p) => p.symbol === symbol ? {
				...p,
				teamLock: next
			} : p),
			working: next && s.working?.symbol === symbol ? null : s.working,
			proposal: next && s.proposal?.symbol === symbol ? null : s.proposal,
			lastTickAt: Date.now()
		});
	},
	closePosition: (symbol, qty) => {
		const pos = get().positions.find((p) => p.symbol === symbol);
		if (!pos || Math.abs(pos.qty) < 1e-8) return {
			ok: false,
			error: "No open trade."
		};
		const full = Math.abs(pos.qty);
		const closeQty = qty && qty > 0 ? Math.min(full, qty) : full;
		const partial = closeQty < full - 1e-8;
		return get().placeOrder({
			symbol,
			side: pos.qty > 0 ? "sell" : "buy",
			qty: closeQty,
			source: "manual",
			note: partial ? "close.manualPartial" : "close.manual",
			skipRisk: true
		});
	},
	applyCouncil: (result, source, opts) => {
		const live = useTradingMode.getState().mode === "live";
		const order = result.order && teamBlocks(get().positions, result.order.symbol) ? null : result.order;
		set({
			lastCouncil: {
				...result,
				order
			},
			lastCouncilAt: Date.now(),
			proposal: live ? null : stampProposal(order),
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
		if (!live && get().autopilot && order) get().executeProposal();
	},
	answerAsk: (question, result) => {
		const now = Date.now();
		const prior = pruneAsk(get().lastAsk, now)?.log ?? [];
		const turn = {
			question,
			speaker: result.speaker,
			text: result.text,
			ts: now
		};
		const log = pruneAsk({
			...turn,
			log: [...prior, turn]
		}, now)?.log ?? [turn];
		set({
			lastAsk: {
				...turn,
				log
			},
			asking: false,
			pendingAsk: null,
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
		const proposal = liveProposal(s.proposal);
		if (!proposal) return {
			ok: false,
			error: "No ticket on the rail."
		};
		if (proposal !== s.proposal) set({ proposal });
		const reducing = isReduce(s.positions, proposal.symbol, proposal.side);
		if (teamBlocks(s.positions, proposal.symbol)) {
			set({
				proposal: null,
				lastTickAt: Date.now()
			});
			return {
				ok: false,
				error: "Team locked out of this trade."
			};
		}
		if (proposal.limitPx && proposal.limitPx > 0 && !reducing) {
			if (s.working && (s.working.symbol !== proposal.symbol || s.working.side !== proposal.side)) {
				set({
					proposal: null,
					lastTickAt: Date.now()
				});
				return { ok: true };
			}
			set({
				working: proposal,
				proposal: null,
				lastTickAt: Date.now()
			});
			get().speak({
				kind: "system",
				text: t("tape.limitRest", {
					side: proposal.side.toUpperCase(),
					symbol: proposal.symbol,
					px: String(proposal.limitPx)
				})
			});
			return { ok: true };
		}
		const res = get().placeOrder({
			symbol: proposal.symbol,
			side: proposal.side,
			qty: proposal.qty,
			source: "council",
			note: proposal.rationale
		});
		if (!res.ok) return res;
		set({ proposal: null });
		return { ok: true };
	},
	dismissProposal: () => set({
		proposal: null,
		working: null,
		lastTickAt: Date.now(),
		lastCouncilAt: Date.now()
	}),
	tryFillWorking: () => {
		const s = get();
		const w = s.working;
		if (!w?.limitPx) return;
		if (teamBlocks(s.positions, w.symbol)) {
			set({ working: null });
			return;
		}
		const px = mergeAssets(s.assets)[w.symbol]?.price;
		if (!(px > 0)) return;
		if (!(w.side === "buy" ? px <= w.limitPx : px >= w.limitPx)) return;
		if (get().placeOrder({
			symbol: w.symbol,
			side: w.side,
			qty: w.qty,
			source: "council",
			note: w.rationale,
			feeKind: "maker"
		}).ok) {
			set({ working: null });
			get().speak({
				kind: "system",
				text: t("tape.limitFill", {
					symbol: w.symbol,
					px: String(px)
				})
			});
		}
	},
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
			id: `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
			ts: Date.now(),
			kind: item.kind,
			text: item.text,
			agentId: item.agentId,
			symbol: item.symbol
		}, ...get().tape].slice(0, 120) });
	},
	unveilAgent: (row) => {
		set({ agents: get().agents.map((a) => a.id === row.id ? {
			...a,
			status: "spoken",
			thesis: row.thesis,
			vote: row.vote,
			symbol: row.symbol,
			conviction: row.conviction
		} : a) });
	},
	snapshot: () => {
		const s = get();
		const assets = mergeAssets(s.assets);
		const tickers = [];
		for (const u of UNIVERSE) {
			const a = assets[u.symbol];
			if (!a || !(a.price > 0)) continue;
			tickers.push({
				symbol: a.symbol,
				name: a.name,
				price: a.price,
				open: a.open,
				changePct: changePct(a.price, a.open),
				high: a.high,
				low: a.low,
				livePx: a.livePx,
				liveBps: null,
				...analysisSnapshot(a.htf, a.price)
			});
		}
		if (!tickers.length) return {
			tickers: [],
			headlines: [],
			book: {
				cash: s.cash,
				equity: s.cash,
				dayPnlPct: 0,
				positions: [],
				working: s.working
			},
			macro: s.macro,
			scorecard: compactScorecard(recordsFrom(s.agentCalls ?? []), s.agentCalls ?? [])
		};
		const eq = equityOf(s.cash, s.positions, assets);
		const spy = assets.SPY;
		const spyChg = spy?.price && spy.open ? changePct(spy.price, spy.open) : s.macro?.equityPct ?? null;
		return {
			tickers,
			headlines: s.headlines.slice(0, 6).map((h) => ({
				text: h.text,
				symbol: h.symbol,
				shock: h.shock
			})),
			book: {
				cash: s.cash,
				equity: eq,
				dayPnlPct: s.startingEquity ? (eq - s.startingEquity) / s.startingEquity * 100 : 0,
				positions: s.positions.map((p) => {
					const px = assets[p.symbol]?.price || p.avg;
					const pnlPct = p.avg ? (px - p.avg) / p.avg * 100 * Math.sign(p.qty || 1) : 0;
					return {
						symbol: p.symbol,
						qty: p.qty,
						avg: p.avg,
						pnlPct,
						teamLock: Boolean(p.teamLock)
					};
				}),
				working: s.working ? {
					side: s.working.side,
					symbol: s.working.symbol,
					qty: s.working.qty,
					limitPx: s.working.limitPx
				} : null
			},
			macro: withEquityPct(s.macro, spyChg),
			scorecard: compactScorecard(recordsFrom(s.agentCalls ?? []), s.agentCalls ?? [])
		};
	},
	hydrateBook: (book) => {
		const clean = scrubGhostAutopilot(book);
		const keep = get().selected;
		const selected = keep && UNIVERSE.some((u) => u.symbol === keep) ? keep : clean.selected || "BTC";
		set({
			cash: clean.cash,
			positions: withTeamLocks(clean.positions, clean.fills),
			fills: clean.fills,
			closedTrades: clean.closedTrades,
			autopilot: clean.autopilot,
			lastCouncil: clean.lastCouncil,
			lastAsk: keepAsk(clean.lastAsk, get().lastAsk),
			agents: clean.agents.length ? clean.agents : idleAgents(),
			startingEquity: clean.startingEquity,
			periodAnchors: clean.periodAnchors,
			tape: clean.tape,
			proposal: liveProposal(clean.proposal),
			working: clean.working ?? null,
			selected,
			lastAutoAt: clean.lastAutoAt,
			lastTickAt: clean.lastTickAt,
			fillSeq: clean.fillSeq,
			deskEpoch: clean.deskEpoch,
			agentCalls: clean.agentCalls,
			lastCouncilAt: clean.lastCouncilAt,
			alertPrefs: normalizeAlertPrefs(clean.alertPrefs)
		});
	},
	touchTick: () => set({
		lastTickAt: Date.now(),
		clientUntil: Date.now() + 45e3
	}),
	reset: () => {
		set({
			...emptyBook(),
			deskEpoch: get().deskEpoch + 1,
			assets: get().assets,
			headlines: get().headlines,
			macro: get().macro,
			feed: get().feed,
			lastFeedAt: get().lastFeedAt,
			clock: Date.now(),
			hydrated: true,
			asking: false,
			pendingAsk: null
		});
	},
	applyPriceStops: () => {
		const s = get();
		const assets = mergeAssets(s.assets);
		for (const pos of s.positions) {
			const a = assets[pos.symbol];
			const px = a?.livePx && a.livePx > 0 ? a.livePx : a?.price;
			if (!(px && px > 0)) continue;
			const hit = hitStop(pos, px);
			if (!hit) continue;
			get().placeOrder({
				symbol: pos.symbol,
				side: pos.qty > 0 ? "sell" : "buy",
				qty: Math.abs(pos.qty),
				source: "manual",
				note: hit === "sl" ? "close.stopLoss" : "close.takeProfit",
				skipRisk: true
			});
		}
	},
	applyTimeStops: () => {
		const s = get();
		const now = Date.now();
		const assets = mergeAssets(s.assets);
		for (const pos of s.positions) {
			if (pos.teamLock) continue;
			const a = assets[pos.symbol];
			const v = viewOf(a);
			if (!v) continue;
			if (!holdExpired(pos, now, v.px, v.vsSma, v.dayChg)) continue;
			get().placeOrder({
				symbol: pos.symbol,
				side: pos.qty > 0 ? "sell" : "buy",
				qty: Math.abs(pos.qty),
				source: "council",
				note: promisingHold(pos, v.px, v.vsSma, v.dayChg) ? "close.timePromising" : "close.timeSession",
				skipRisk: true
			});
		}
	}
}), {
	name: "zw-desk",
	storage: createJSONStorage(() => localStorage),
	version: 6,
	partialize: (s) => ({
		cash: s.cash,
		positions: s.positions,
		fills: s.fills,
		closedTrades: s.closedTrades,
		autopilot: s.autopilot,
		lastCouncil: s.lastCouncil,
		lastAsk: s.lastAsk,
		agents: s.agents,
		startingEquity: s.startingEquity,
		periodAnchors: s.periodAnchors,
		tape: s.tape,
		proposal: s.proposal,
		working: s.working,
		selected: s.selected,
		lastAutoAt: s.lastAutoAt,
		fillSeq: s.fillSeq,
		deskEpoch: s.deskEpoch,
		agentCalls: s.agentCalls,
		lastCouncilAt: s.lastCouncilAt,
		locale: s.locale,
		alertPrefs: s.alertPrefs ?? { ...DEFAULT_ALERT_PREFS }
	}),
	onRehydrateStorage: () => (state) => {
		if (!state) return;
		state.positions = withTeamLocks(state.positions ?? [], state.fills ?? []);
		state.alertPrefs = normalizeAlertPrefs(state.alertPrefs);
	}
}));
if (typeof window !== "undefined" && bootQuotes) queueMicrotask(() => useDesk.getState().applyLiveQuotes(bootQuotes));
function TooltipProvider({ delayDuration = 200, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Provider, {
		delayDuration,
		...props
	});
}
function Tooltip({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root3, { ...props });
}
function TooltipTrigger({ ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, { ...props });
}
function TooltipContent({ className, sideOffset = 6, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Portal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		sideOffset,
		className: cn("z-50 max-w-xs rounded-md bg-elevated px-2.5 py-1.5 text-xs text-fg shadow-[var(--shadow-border)]", className),
		...props
	}) });
}
var $$splitComponentImporter$1 = () => import("./routes-C6F_7nwi.mjs");
var Route$3 = createFileRoute("/")({
	loader: () => ({
		ok: false,
		error: "boot"
	}),
	staleTime: Infinity,
	pendingMs: Infinity,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-C6_Lgo_k.js
var router_C6_Lgo_k_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
function LocaleHydrator({ children }) {
	const locale = useLocale();
	(0, import_react.useLayoutEffect)(() => {
		hydrateLocale();
	}, []);
	(0, import_react.useLayoutEffect)(() => {
		document.documentElement.lang = locale;
		document.documentElement.setAttribute("data-locale", locale);
		useDesk.setState({ locale });
	}, [locale]);
	return children;
}
/** Kill pinch / ctrl-wheel / Safari gesture zoom so the desk stays 1:1. */
function ZoomLock() {
	(0, import_react.useEffect)(() => {
		const block = (e) => {
			e.preventDefault();
		};
		const onWheel = (e) => {
			if (e.ctrlKey) e.preventDefault();
		};
		const onTouch = (e) => {
			if (e.touches.length > 1) e.preventDefault();
		};
		document.addEventListener("gesturestart", block, { passive: false });
		document.addEventListener("gesturechange", block, { passive: false });
		document.addEventListener("gestureend", block, { passive: false });
		document.addEventListener("wheel", onWheel, { passive: false });
		document.addEventListener("touchmove", onTouch, { passive: false });
		return () => {
			document.removeEventListener("gesturestart", block);
			document.removeEventListener("gesturechange", block);
			document.removeEventListener("gestureend", block);
			document.removeEventListener("wheel", onWheel);
			document.removeEventListener("touchmove", onTouch);
		};
	}, []);
	return null;
}
var styles_default = "/assets/styles-WhTYG_tT.css";
var Route$2 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "theme-color",
				content: "#09090b"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "description",
				content: "Paper-trading desk. Four AI agents, live tape, your book."
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-180.png"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Sora:wght@400;500;600&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `(function(){try{var l=localStorage.getItem("zw-locale");if(l!=="pl"&&l!=="en"){var m=document.cookie.match(/(?:^|; )zw-locale=(pl|en)/);l=m?m[1]:((navigator.language||"").toLowerCase().indexOf("pl")===0?"pl":"en")}document.documentElement.lang=l;document.documentElement.setAttribute("data-locale",l)}catch(e){}})();` } }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ZoomLock, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocaleHydrator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemedToaster, {})] }) }) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
function ThemedToaster() {
	const { resolved } = useAppearance();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		theme: resolved,
		position: "bottom-right",
		toastOptions: { className: "bg-elevated text-fg shadow-[var(--shadow-border)]" }
	});
}
var $$splitComponentImporter = () => import("./login-BwDUZ0dX.mjs");
var Route$1 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var rootRouteChildren = {
	IndexRoute: Route$3.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	LoginRoute: Route$1.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$2
	}),
	ApiAuthSplatRoute: Route.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { useLocale as A, LanguageSwitch as C, bootSplashHolding as D, TakeoffSplash as E, cn as O, APP_NAME as S, PlaneMark as T, useMark as _, TooltipTrigger as a, useSelectedTape as b, bookEquity as c, preferServerBook as d, toDeskBook as f, useFeed as g, getRouter, useDesk as h, TooltipContent as i, useT as j, markBootSplash as k, installBootQuotes as l, useAssets as m, Route$3 as n, bindDeskStorage as o, useAppearance as p, Tooltip as r, bindTradingMode as s, router_C6_Lgo_k_exports as t, liveAssets as u, useMarkedAssets as v, ModeKicker as w, useTradingMode as x, useMarks as y };
