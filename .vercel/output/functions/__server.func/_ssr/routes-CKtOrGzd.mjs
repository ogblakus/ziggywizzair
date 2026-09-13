import { o as __toESM } from "../_runtime.mjs";
import { i as isLot, n as UNIVERSE } from "./universe-BHNCzOwL.mjs";
import { a as changePct, i as agentShort, n as AGENT_BY_ID, t as AGENTS } from "./personas-CKVSpiDt.mjs";
import { l as require_react_dom, u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { n as fetchLiveMacro, o as sentimentBias } from "./macro-Bg8vwTHR.mjs";
import { T as runLocalV2 } from "./local-v2-PvgmS_Qo.mjs";
import { C as t, _ as timeAgo, a as assetName, c as compactPrice, d as money, f as pct, h as signedQty, i as assetLabel, l as fillNoteLabel, m as signedClass, o as chipPrice, p as qtyFmt, s as compactMoney, u as fillSideLabel, w as txError } from "./alert-prefs-BDQeOj_T.mjs";
import { A as recordsFrom, C as liveProposal, D as portfolioStats, O as proposalMsLeft, S as humanEntryNote, b as explainTrade, j as reflectClosed, l as parseStop, m as PROPOSAL_TTL_MS, n as bookLooksLive, o as hlFeeUsd, p as stopSideError, w as looksLikeReflection, x as humanCloseNote } from "./engine-BtZ74KnL.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { a as signOut } from "./client-r2HS9zuU.mjs";
import { n as conveneCouncil, t as askFloor } from "./council-B6kDihVd.mjs";
import { r as localAsk } from "./local-council-vBc7-AWa.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { _ as ChartColumn, a as Settings, b as ArrowUpRight, c as MessageSquare, d as History, g as CheckCheck, h as ChevronDown, l as Lock, m as CircleDot, n as Wallet, r as Users, s as Minus, t as X, u as LockOpen, v as Briefcase, x as ArrowDownRight, y as Bell } from "../_libs/lucide-react.mjs";
import { n as loadProfile, t as claimUsername } from "./profile-server-RnW0amzK.mjs";
import { n as issueRecoveryCode, o as trustThisDevice, r as passwordStatus, t as changeDeskPassword } from "./password-kIhJB4kA.mjs";
import { a as useCurrentUser, i as getDeviceToken, n as Input, o as useCurrentUserState, r as SecretField, t as Button } from "./device-BP6aaMIH.mjs";
import { i as newsOverlap } from "./news-key-By_bmI6f.mjs";
import { t as fetchLiveNews } from "./news-BCja-IdZ.mjs";
import { s as loadPerpsAccount, t as DESK_TO_PERP } from "./hyperliquid-CyQ1Swyx.mjs";
import { n as fetchLiveMids, r as fetchSymbolChart, t as fetchLiveMarket } from "./quotes-BfNKKZaD.mjs";
import { a as hasGateSessionMarker } from "./server-B2mxShfj.mjs";
import { n as persist, r as create } from "../_libs/zustand.mjs";
import { a as DialogOverlay$1, c as DialogTrigger$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { A as useLocale, C as LanguageSwitch, D as bootSplashHolding, E as TakeoffSplash, O as cn, S as APP_NAME, T as PlaneMark, _ as useMark, a as TooltipTrigger, b as useSelectedTape, c as bookEquity, d as preferServerBook, f as toDeskBook, g as useFeed, h as useDesk, i as TooltipContent, j as useT, k as markBootSplash, l as installBootQuotes, m as useAssets, n as Route, o as bindDeskStorage, p as useAppearance, r as Tooltip, s as bindTradingMode, u as liveAssets, v as useMarkedAssets, w as ModeKicker, x as useTradingMode, y as useMarks } from "./router-fKdFkJkx.mjs";
import { n as Root2, r as Trigger, t as List } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CKtOrGzd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var KEY$1 = (id) => `zw-tour-v1:${id}`;
var forceOpen = false;
var listeners$1 = /* @__PURE__ */ new Set();
function emit$1() {
	for (const fn of listeners$1) fn();
}
function isTourDone(userId) {
	try {
		return localStorage.getItem(KEY$1(userId)) === "1";
	} catch {
		return false;
	}
}
function markTourDone(userId) {
	try {
		localStorage.setItem(KEY$1(userId), "1");
	} catch {}
	forceOpen = false;
	emit$1();
}
function requestTour() {
	forceOpen = true;
	emit$1();
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
	listeners$1.add(cb);
	return () => {
		listeners$1.delete(cb);
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
	},
	{
		kicker: "tour.6.kicker",
		title: "tour.6.title",
		body: "tour.6.body"
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
function StopsFields({ long, mark, sl, tp, onSl, onTp }) {
	const t = useT();
	const slN = parseStop(sl);
	const tpN = parseStop(tp);
	const slBad = sl.trim() !== "" && stopSideError(long, mark, slN, null) === "sl";
	const tpBad = tp.trim() !== "" && stopSideError(long, mark, null, tpN) === "tp";
	const err = slBad ? "sl" : tpBad ? "tp" : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("ticket.sl")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				inputMode: "decimal",
				value: sl,
				placeholder: mark > 0 ? compactPrice(mark) : t("ticket.slPh"),
				onChange: (e) => onSl(e.target.value),
				className: `h-11 bg-surface font-mono tabular-nums ${slBad ? "text-down" : ""}`
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1 block text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("ticket.tp")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				inputMode: "decimal",
				value: tp,
				placeholder: mark > 0 ? compactPrice(mark) : t("ticket.tpPh"),
				onChange: (e) => onTp(e.target.value),
				className: `h-11 bg-surface font-mono tabular-nums ${tpBad ? "text-down" : ""}`
			})]
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-1 text-2xs leading-snug text-muted",
		children: err === "sl" ? t("ticket.badSl") : err === "tp" ? t("ticket.badTp") : t("ticket.stopsHint")
	})] });
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
		className: cn("fixed top-1/2 left-1/2 z-50 w-[min(28rem,calc(100vw-1.5rem))] max-h-[min(36rem,calc(100dvh-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)] outline-none", className),
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
var sdkProvider;
async function metamaskSdkProvider() {
	if (typeof window === "undefined") return null;
	if (sdkProvider !== void 0) return sdkProvider;
	try {
		const { MetaMaskSDK } = await import("../_libs/@metamask/sdk.mjs").then((n) => n.t);
		const sdk = new MetaMaskSDK({
			dappMetadata: {
				name: "ZiggyWizzAir",
				url: window.location.origin,
				iconUrl: `${window.location.origin}/favicon.svg`
			},
			checkInstallationImmediately: false,
			enableAnalytics: false,
			headless: true,
			useDeeplink: true,
			preferDesktop: false
		});
		await sdk.init();
		sdkProvider = sdk.getProvider() ?? null;
		return sdkProvider;
	} catch {
		sdkProvider = null;
		return null;
	}
}
async function requestMetaMaskAccounts() {
	let eth = getEthereum();
	if (!eth) eth = await metamaskSdkProvider();
	if (!eth) throw new Error("Install MetaMask and return here. Do not open this desk inside MetaMask’s browser.");
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
		closed: account.closed ?? [],
		status: "live",
		error: null,
		...extra
	};
}
function attachWalletKeepalive() {
	if (typeof window === "undefined") return;
	const w = window;
	if (w.__zwWalletKeep) return;
	w.__zwWalletKeep = true;
	const onAccounts = (...args) => {
		const next = (Array.isArray(args[0]) ? args[0] : [])[0];
		if (!next) return;
		const cur = useLiveWallet.getState();
		if (cur.address && next.toLowerCase() === cur.address.toLowerCase()) return;
		cur.watchAddress(next).then(() => {
			useLiveWallet.setState({ source: "metamask" });
		});
	};
	const bindEth = () => {
		const eth = getEthereum();
		if (!eth?.on) return;
		eth.on("accountsChanged", onAccounts);
	};
	bindEth();
	const wake = () => {
		const s = useLiveWallet.getState();
		if (s.address) s.refresh();
		const eth = getEthereum();
		if (!eth) return;
		eth.request({ method: "eth_accounts" }).then((raw) => {
			const list = Array.isArray(raw) ? raw : [];
			if (list[0]) onAccounts(list);
		}).catch(() => void 0);
	};
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") wake();
	});
	window.addEventListener("focus", wake);
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
	closed: [],
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
				status: get().address ? "live" : "error",
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
			set(applyAccount(await pull(address), { source: get().source ?? "watch" }));
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
				status: get().address ? "live" : "error",
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
		closed: [],
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
		attachWalletKeepalive();
		if (!state?.address) return;
		state.refresh();
	}
}));
var CLOSE_SCALE_KEY = "zw-close-scale";
function readCloseScale() {
	try {
		return window.localStorage.getItem(CLOSE_SCALE_KEY) === "usd" ? "usd" : "pct";
	} catch {
		return "pct";
	}
}
function writeCloseScale(scale) {
	try {
		window.localStorage.setItem(CLOSE_SCALE_KEY, scale);
	} catch {}
}
function runClose(symbol, qty, closePosition) {
	const res = closePosition(symbol, qty);
	if (!res.ok) {
		toast.error(txError(res.error ?? "Could not close"));
		return;
	}
	toast.success(t("ticket.closed", { symbol }));
}
function TeamLockButton({ position: p }) {
	const t = useT();
	const toggle = useDesk((s) => s.toggleTeamLock);
	const locked = Boolean(p.teamLock);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => {
				const next = !locked;
				toggle(p.symbol);
				toast.message(next ? t("lock.onToast", { symbol: assetLabel(p.symbol) }) : t("lock.offToast", { symbol: assetLabel(p.symbol) }));
			},
			className: cn("flex size-11 shrink-0 items-center justify-center rounded-md hover:bg-elevated", locked ? "text-fg" : "text-muted"),
			"aria-pressed": locked,
			"aria-label": t("lock.toggle", { symbol: p.symbol }),
			children: locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "size-3.5" })
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: locked ? t("lock.on") : t("lock.off") })] });
}
function StopsDialog({ position: p, open, onOpenChange }) {
	const t = useT();
	const setStops = useDesk((s) => s.setStops);
	const fallback = useDesk((s) => p ? s.assets[p.symbol]?.price ?? p.avg : 0);
	const mark = useMark(p?.symbol ?? "");
	const [sl, setSl] = (0, import_react.useState)("");
	const [tp, setTp] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open || !p) return;
		setSl(p.stopLoss != null ? String(p.stopLoss) : "");
		setTp(p.takeProfit != null ? String(p.takeProfit) : "");
	}, [
		open,
		p?.symbol,
		p?.stopLoss,
		p?.takeProfit
	]);
	if (!p) return null;
	const pos = p;
	const px = mark || fallback || pos.avg;
	const long = pos.qty >= 0;
	function save() {
		const slN = sl.trim() ? parseStop(sl) : null;
		const tpN = tp.trim() ? parseStop(tp) : null;
		if (sl.trim() && slN == null) {
			toast.error(t("ticket.badSl"));
			return;
		}
		if (tp.trim() && tpN == null) {
			toast.error(t("ticket.badTp"));
			return;
		}
		const err = stopSideError(long, px, slN, tpN);
		if (err) {
			toast.error(t(err === "sl" ? "ticket.badSl" : "ticket.badTp"));
			return;
		}
		setStops(pos.symbol, {
			stopLoss: slN,
			takeProfit: tpN
		});
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("ticket.stopsTitle", { symbol: assetLabel(pos.symbol) }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("ticket.stopsHint") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopsFields, {
					long,
					mark: px,
					sl,
					tp,
					onSl: setSl,
					onTp: setTp
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "flex-1",
					onClick: () => {
						setStops(pos.symbol, {
							stopLoss: null,
							takeProfit: null
						});
						onOpenChange(false);
					},
					children: t("ticket.stopsClear")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					onClick: save,
					children: t("ticket.stopsSave")
				})]
			})
		] })
	});
}
function CloseTradeDialog({ position: p, open, onOpenChange }) {
	const t = useT();
	const closePosition = useDesk((s) => s.closePosition);
	const fallback = useDesk((s) => p ? s.assets[p.symbol]?.price ?? p.avg : 0);
	const mark = useMark(p?.symbol ?? "");
	const [scale, setScale] = (0, import_react.useState)(readCloseScale);
	const [frac, setFrac] = (0, import_react.useState)(100);
	(0, import_react.useEffect)(() => {
		if (open) setFrac(100);
	}, [open, p?.symbol]);
	if (!p) return null;
	const pos = p;
	const px = mark || fallback || pos.avg;
	const crypto = isLot(pos.symbol);
	const full = Math.abs(pos.qty);
	const notional = full * px;
	const closeQty = Number((full * frac / 100).toFixed(crypto ? 4 : 2));
	const closeNotional = closeQty * px;
	const closeFee = hlFeeUsd(closeQty, px, "taker");
	function confirm() {
		if (!(closeQty > 0)) return;
		runClose(pos.symbol, closeQty, closePosition);
		onOpenChange(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("close.title", { symbol: pos.symbol }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("close.body") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex gap-1",
				children: ["pct", "usd"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setScale(s);
						writeCloseScale(s);
					},
					className: cn("h-9 flex-1 rounded-md text-sm font-medium", scale === s ? "bg-elevated text-fg" : "bg-surface text-muted"),
					children: t(s === "pct" ? "close.pct" : "close.usd")
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "range",
				min: 1,
				max: 100,
				step: 1,
				value: frac,
				onChange: (e) => setFrac(Number(e.target.value)),
				className: "mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-elevated accent-[var(--color-up)]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-mono text-sm tabular-nums",
				children: scale === "pct" ? `${frac}% · ${signedQty(closeQty * Math.sign(pos.qty), crypto)} · ${money(closeNotional)}` : `${money(closeNotional)} · ${frac}% · ${signedQty(closeQty * Math.sign(pos.qty), crypto)}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-2xs text-muted tabular-nums",
				children: [
					t("opened.title"),
					" ",
					signedQty(pos.qty, crypto),
					" · ",
					compactPrice(px),
					" · ",
					money(notional)
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-2xs text-muted tabular-nums",
				children: t("close.fee", { usd: money(closeFee) })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "mt-4 h-11 w-full",
				variant: "sell",
				onClick: confirm,
				children: [
					t("close.confirm"),
					" ",
					assetLabel(pos.symbol)
				]
			})
		] })
	});
}
function OpenedTrades() {
	const mode = useTradingMode((s) => s.mode);
	const demoPositions = useDesk((s) => s.positions);
	const livePositions = useLiveWallet((s) => s.positions);
	const assets = useMarkedAssets();
	const cash = useDesk((s) => s.cash);
	const select = useDesk((s) => s.select);
	const equity = bookEquity(cash, demoPositions, assets);
	const t = useT();
	const [closing, setClosing] = (0, import_react.useState)(null);
	const [stopping, setStopping] = (0, import_react.useState)(null);
	if (mode === "live") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-baseline justify-between px-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("opened.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-2xs text-subtle tabular-nums",
			children: livePositions.length
		})]
	}), livePositions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-2 px-1 text-sm leading-relaxed text-muted",
		children: t("opened.liveEmpty")
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-2 space-y-1.5",
		children: livePositions.map((p) => {
			const long = p.qty >= 0;
			const name = p.desk ?? p.coin;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => p.desk && select(p.desk),
					className: "w-full text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", long ? "bg-up/15 text-up" : "bg-down/15 text-down"),
							children: long ? t("side.long") : t("side.short")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm font-medium",
							children: name
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `mt-1 font-mono text-xs tabular-nums ${signedClass(p.pnl)}`,
						children: money(p.pnl)
					})]
				})
			}, `${p.coin}-${p.desk ?? ""}`);
		})
	})] });
	const positions = demoPositions;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-baseline justify-between px-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("opened.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-2xs text-subtle tabular-nums",
				children: positions.length
			})]
		}),
		positions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
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
						className: "flex flex-wrap items-start gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => select(p.symbol),
							className: "min-w-0 flex-1 basis-40 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide", long ? "bg-up/15 text-up" : "bg-down/15 text-down"),
										children: long ? t("side.long") : t("side.short")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono text-sm font-medium",
										children: assetLabel(p.symbol)
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
								}),
								p.stopLoss || p.takeProfit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-0.5 font-mono text-2xs text-muted tabular-nums",
									children: [
										p.stopLoss ? `SL ${compactPrice(p.stopLoss)}` : "",
										p.stopLoss && p.takeProfit ? " · " : "",
										p.takeProfit ? `TP ${compactPrice(p.takeProfit)}` : ""
									]
								}) : null
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamLockButton, { position: p }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									className: "h-11 shrink-0 px-3",
									onClick: () => setStopping(p),
									children: t("opened.stops")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									className: "h-11 shrink-0 px-3",
									onClick: () => setClosing(p),
									"aria-label": t("opened.closeAria", { symbol: p.symbol }),
									children: t("ticket.close")
								})
							]
						})]
					})
				}, p.symbol);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseTradeDialog, {
			position: closing,
			open: !!closing,
			onOpenChange: (v) => !v && setClosing(null)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopsDialog, {
			position: stopping,
			open: !!stopping,
			onOpenChange: (v) => !v && setStopping(null)
		})
	] });
}
function OpenedStrip() {
	const mode = useTradingMode((s) => s.mode);
	const demoPositions = useDesk((s) => s.positions);
	const livePositions = useLiveWallet((s) => s.positions);
	const select = useDesk((s) => s.select);
	const t = useT();
	if (mode === "live") {
		if (livePositions.length === 0) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0 border-b border-border px-3 py-1.5 sm:px-4 sm:py-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "desk-scroll-x flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("opened.title")
				}), livePositions.map((p) => {
					const long = p.qty >= 0;
					const name = p.desk ?? p.coin;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-11 shrink-0 items-center gap-2 rounded-lg bg-surface px-2.5 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => p.desk && select(p.desk),
							className: "flex items-center gap-2 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("font-mono text-sm font-medium", long ? "text-up" : "text-down"),
									children: name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-2xs font-medium tracking-wide text-muted",
									children: long ? t("side.long") : t("side.short")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-2xs text-muted tabular-nums",
									children: compactMoney(Math.abs(p.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-mono text-2xs tabular-nums ${signedClass(p.pnl)}`,
									children: money(p.pnl)
								})
							]
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
			className: "desk-scroll-x flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("opened.title")
			}), positions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenedChip, {
				position: p,
				onSelect: select
			}, p.symbol))]
		})
	});
}
function OpenedChip({ position: p, onSelect }) {
	const t = useT();
	const fallback = useDesk((s) => s.assets[p.symbol]?.price ?? p.avg);
	const px = useMark(p.symbol) || fallback;
	const pnl = (px - p.avg) * p.qty;
	const long = p.qty >= 0;
	const [open, setOpen] = (0, import_react.useState)(false);
	const [stops, setStopsOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-surface px-2 shadow-[var(--shadow-border)] sm:px-2.5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onSelect(p.symbol),
				className: "flex items-center gap-2 text-left",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("font-mono text-sm font-medium", long ? "text-up" : "text-down"),
						children: assetLabel(p.symbol)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs font-medium tracking-wide text-muted",
						children: long ? t("side.long") : t("side.short")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-2xs text-muted tabular-nums",
						children: compactMoney(Math.abs(p.qty * px))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `font-mono text-2xs tabular-nums ${signedClass(pnl)}`,
						children: money(pnl)
					}),
					p.stopLoss || p.takeProfit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-mono text-2xs text-subtle tabular-nums",
						children: [
							p.stopLoss ? `SL ${compactPrice(p.stopLoss)}` : "",
							p.stopLoss && p.takeProfit ? " " : "",
							p.takeProfit ? `TP ${compactPrice(p.takeProfit)}` : ""
						]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamLockButton, { position: p }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setStopsOpen(true),
				className: "flex h-11 items-center rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg",
				children: t("opened.stops")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setOpen(true),
				className: "flex h-11 items-center rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg",
				"aria-label": t("opened.closeAria", { symbol: p.symbol }),
				children: t("ticket.close")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseTradeDialog, {
				position: p,
				open,
				onOpenChange: setOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopsDialog, {
				position: p,
				open: stops,
				onOpenChange: setStopsOpen
			})
		]
	});
}
var UNIT_KEY = "zw-ticket-unit";
function readUnit() {
	try {
		return window.localStorage.getItem(UNIT_KEY) === "usd" ? "usd" : "qty";
	} catch {
		return "qty";
	}
}
function writeUnit(unit) {
	try {
		window.localStorage.setItem(UNIT_KEY, unit);
	} catch {}
}
function asShares(raw, unit, mark) {
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0) return 0;
	if (unit === "usd") return mark > 0 ? n / mark : 0;
	return n;
}
function convertRaw(raw, from, to, mark, lot) {
	if (from === to) return raw;
	const n = Number(raw);
	if (!Number.isFinite(n) || n <= 0 || !(mark > 0)) return raw;
	return to === "usd" ? (n * mark).toFixed(2) : qtyFmt(n / mark, lot);
}
function UnitWheel({ id, unit, onUnit, qtyLabel }) {
	const t = useT();
	const ref = (0, import_react.useRef)(null);
	const lock = (0, import_react.useRef)(false);
	(0, import_react.useLayoutEffect)(() => {
		const el = ref.current;
		if (!el) return;
		lock.current = true;
		el.scrollTop = unit === "usd" ? el.clientHeight : 0;
		requestAnimationFrame(() => {
			lock.current = false;
		});
	}, [unit]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref,
		role: "listbox",
		"aria-label": t("ticket.unitAria"),
		"aria-activedescendant": `${id}-${unit}`,
		onScroll: () => {
			const el = ref.current;
			if (!el || lock.current) return;
			const next = el.scrollTop >= el.clientHeight / 2 ? "usd" : "qty";
			if (next !== unit) onUnit(next);
		},
		className: "unit-wheel h-11 rounded-md bg-surface text-xs font-medium text-muted shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: `${id}-qty`,
			className: "flex h-11 shrink-0 snap-start items-center justify-center",
			children: qtyLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			id: `${id}-usd`,
			className: "flex h-11 shrink-0 snap-start items-center justify-center",
			children: t("ticket.unitUsd")
		})]
	});
}
function SizeRow({ id, raw, unit, onRaw, onUnit, lot }) {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-2 gap-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				htmlFor: id,
				className: "sr-only",
				children: t("ticket.qtyAria")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				id,
				inputMode: "decimal",
				value: raw,
				placeholder: "",
				onChange: (e) => onRaw(e.target.value),
				className: "h-11 min-w-0 bg-surface font-mono tabular-nums"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnitWheel, {
				id,
				unit,
				onUnit,
				qtyLabel: lot ? t("ticket.unitLot") : t("ticket.unitShares")
			})
		]
	});
}
var OrderTicket = (0, import_react.memo)(function OrderTicket() {
	const selected = useDesk((s) => s.selected);
	const assets = useAssets();
	const asset = assets[selected];
	const cash = useDesk((s) => s.cash);
	const positions = useDesk((s) => s.positions);
	const placeOrder = useDesk((s) => s.placeOrder);
	const id = (0, import_react.useId)();
	const [side, setSide] = (0, import_react.useState)("buy");
	const [raw, setRaw] = (0, import_react.useState)("");
	const [unit, setUnit] = (0, import_react.useState)(readUnit);
	const [closing, setClosing] = (0, import_react.useState)(false);
	const [placing, setPlacing] = (0, import_react.useState)(false);
	const [sl, setSl] = (0, import_react.useState)("");
	const [tp, setTp] = (0, import_react.useState)("");
	const t$1 = useT();
	const mode = useTradingMode((s) => s.mode);
	const lot = isLot(selected);
	const pos = positions.find((p) => p.symbol === selected);
	const equity = bookEquity(cash, positions, assets);
	const mark = asset ? asset.livePx && asset.livePx > 0 ? asset.livePx : asset.price : 0;
	(0, import_react.useEffect)(() => {
		setRaw("");
		setPlacing(false);
		if (pos?.stopLoss) setSl(String(pos.stopLoss));
		else setSl("");
		if (pos?.takeProfit) setTp(String(pos.takeProfit));
		else setTp("");
	}, [selected]);
	const qty = asShares(raw, unit, mark);
	const notional = qty > 0 && mark > 0 ? qty * mark : 0;
	const openFee = qty > 0 && mark > 0 ? hlFeeUsd(qty, mark, "taker") : 0;
	const presets = (0, import_react.useMemo)(() => {
		if (!asset || !mark) return [];
		return [
			{
				label: "1%",
				pct: .01
			},
			{
				label: "5%",
				pct: .05
			},
			{
				label: "10%",
				pct: .1
			}
		].map((p) => ({
			...p,
			qty: lot ? equity * p.pct / mark : Math.max(1, Math.round(equity * p.pct / mark))
		}));
	}, [
		asset,
		equity,
		lot,
		mark
	]);
	if (!asset) return null;
	const liveBlocked = mode === "live";
	function pickUnit(next) {
		setRaw((prev) => convertRaw(prev, unit, next, mark, lot));
		setUnit(next);
		writeUnit(next);
	}
	function applyPreset(shares) {
		setRaw(unit === "usd" ? (shares * mark).toFixed(2) : qtyFmt(shares, lot));
	}
	function openPlace() {
		if (liveBlocked) {
			toast.error(t$1("ticket.liveBlocked"));
			return;
		}
		setPlacing(true);
	}
	function confirmPlace() {
		if (!(qty > 0)) {
			toast.error(t$1("ticket.needSize"));
			return;
		}
		const slN = sl.trim() ? parseStop(sl) : null;
		const tpN = tp.trim() ? parseStop(tp) : null;
		const err = stopSideError(side === "buy", mark, slN, tpN);
		if (err) {
			toast.error(t$1(err === "sl" ? "ticket.badSl" : "ticket.badTp"));
			return;
		}
		const res = placeOrder({
			symbol: selected,
			side,
			qty,
			source: "manual",
			stopLoss: sl.trim() ? slN : null,
			takeProfit: tp.trim() ? tpN : null
		});
		if (!res.ok) {
			toast.error(txError(res.error));
			return;
		}
		const fee = res.fill.fee ?? openFee;
		toast.success(t("ticket.filledFee", {
			side: t$1(side === "buy" ? "ticket.buyCap" : "ticket.sellCap"),
			symbol: selected,
			fee: money(fee)
		}));
		setPlacing(false);
		setRaw("");
	}
	const action = side === "buy" ? t$1("ticket.buyCap") : pos && pos.qty > 0 ? t$1("ticket.sellCap") : t$1("ticket.shortCap");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-elevated p-2 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1",
				children: ["buy", "sell"].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSide(s),
					className: cn("h-11 flex-1 rounded-md text-sm font-medium capitalize sm:h-9", side === s ? s === "buy" ? "bg-up/20 text-up" : "bg-down/20 text-down" : "bg-surface text-muted"),
					children: t$1(s === "buy" ? "ticket.buy" : "ticket.sell")
				}, s))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SizeRow, {
					id,
					raw,
					unit,
					onRaw: setRaw,
					onUnit: pickUnit,
					lot
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1.5 flex gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: side === "buy" ? "buy" : "sell",
					className: "h-11 min-w-0 flex-1 px-2 text-xs sm:h-9 sm:text-sm",
					onClick: openPlace,
					disabled: !asset.price || liveBlocked,
					children: [
						action,
						" ",
						assetLabel(asset.symbol)
					]
				}), pos ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "h-11 px-3 sm:h-9",
					onClick: () => setClosing(true),
					disabled: !asset.price || liveBlocked,
					children: t$1("ticket.close")
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1.5 grid grid-cols-3 gap-1",
				children: presets.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => applyPreset(p.qty),
					className: "h-11 rounded-md bg-surface text-xs font-medium text-muted sm:h-9",
					children: p.label
				}, p.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 font-mono text-2xs text-muted tabular-nums",
				children: [liveBlocked ? t$1("ticket.liveBlocked") : pos ? t$1(pos.qty >= 0 ? "ticket.heldLong" : "ticket.heldShort", {
					qty: signedQty(pos.qty, lot),
					avg: compactPrice(pos.avg)
				}) : side === "sell" ? t$1("ticket.sellOpens") : t$1("ticket.noPos"), !liveBlocked && notional > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [" · ", money(notional)] }) : null]
			}),
			!liveBlocked && openFee > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-2xs text-muted tabular-nums",
				children: t$1("ticket.fee", { usd: money(openFee) })
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: placing,
				onOpenChange: setPlacing,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t$1("ticket.placeTitle", {
						side: action,
						symbol: assetLabel(asset.symbol)
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t$1("ticket.placeBody") })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SizeRow, {
							id: `${id}-place`,
							raw,
							unit,
							onRaw: setRaw,
							onUnit: pickUnit,
							lot
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-mono text-sm tabular-nums",
						children: qty > 0 ? `${qtyFmt(qty, lot)} · ${money(notional)}` : t$1("ticket.needSize")
					}),
					openFee > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-2xs text-muted tabular-nums",
						children: t$1("ticket.fee", { usd: money(openFee) })
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StopsFields, {
							long: side === "buy",
							mark,
							sl,
							tp,
							onSl: setSl,
							onTp: setTp
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						className: "mt-4 h-11 w-full",
						variant: side === "buy" ? "buy" : "sell",
						onClick: confirmPlace,
						disabled: !(qty > 0),
						children: [
							t$1("ticket.confirm"),
							" ",
							action,
							" ",
							assetLabel(asset.symbol)
						]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloseTradeDialog, {
				position: pos ?? null,
				open: closing,
				onOpenChange: setClosing
			})
		]
	});
});
var Sparkline = (0, import_react.memo)(function Sparkline({ data, up, className }) {
	const pts = data.length === 1 ? [data[0], data[0]] : data;
	if (pts.length < 2) return null;
	const min = Math.min(...pts);
	const span = Math.max(...pts) - min || 1;
	const w = 72;
	const h = 22;
	const d = pts.map((v, i) => {
		const x = i / (pts.length - 1) * w;
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
var W = 240;
var H = 88;
var PLOT_PX = 168;
var UP = "#3d9a7a";
var DOWN = "#c45c5c";
function sameBars(a, b) {
	if (a === b) return true;
	if (a.length !== b.length) return false;
	const la = a.at(-1);
	const lb = b.at(-1);
	const fa = a[0];
	const fb = b[0];
	return la?.t === lb?.t && la?.px === lb?.px && fa?.t === fb?.t && fa?.px === fb?.px;
}
/** Inline SVG with a pixel height — flex/%/canvas all collapsed to 0 on iPhone. */
var PriceArea = (0, import_react.memo)(function PriceArea({ bars, up, onScrub, fill, resetKey, emptyLabel }) {
	const [hover, setHover] = (0, import_react.useState)(null);
	const domain = (0, import_react.useRef)({
		min: 0,
		max: 1,
		key: ""
	});
	const pts = bars.filter((b) => Number.isFinite(b.px));
	const box = fill ? {
		height: "100%",
		minHeight: 110
	} : {
		height: PLOT_PX,
		minHeight: PLOT_PX
	};
	if (pts.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex w-full items-center justify-center text-sm text-muted",
		style: box,
		children: emptyLabel ?? "…"
	});
	const values = pts.map((b) => b.px);
	const rawMin = Math.min(...values);
	const rawMax = Math.max(...values);
	const key = resetKey ?? "";
	if (domain.current.key !== key) domain.current = {
		min: rawMin,
		max: rawMax,
		key
	};
	else {
		if (rawMin < domain.current.min) domain.current.min = rawMin;
		if (rawMax > domain.current.max) domain.current.max = rawMax;
	}
	const min = domain.current.min;
	const span = domain.current.max - min || 1;
	const padY = 6;
	const coords = values.map((v, i) => {
		return {
			x: i / (values.length - 1) * W,
			y: padY + (1 - (v - min) / span) * 76
		};
	});
	const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(2)} ${c.y.toFixed(2)}`).join(" ");
	const area = `${line} L${W} ${H} L0 ${H} Z`;
	const i = hover != null ? Math.min(Math.max(hover, 0), coords.length - 1) : null;
	const pin = i != null ? coords[i] : null;
	const color = up ? UP : DOWN;
	function atPointer(e) {
		const rect = e.currentTarget.getBoundingClientRect();
		if (!rect.width) return;
		const x = (e.clientX - rect.left) / rect.width;
		const next = Math.min(Math.max(Math.round(x * (pts.length - 1)), 0), pts.length - 1);
		setHover(next);
		onScrub?.(pts[next] ?? null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${W} ${H}`,
		width: "100%",
		height: fill ? "100%" : PLOT_PX,
		preserveAspectRatio: "none",
		style: fill ? {
			display: "block",
			width: "100%",
			height: "100%",
			position: "absolute",
			inset: 0
		} : {
			display: "block",
			width: "100%",
			height: PLOT_PX,
			minHeight: PLOT_PX
		},
		className: "touch-none",
		role: "img",
		"aria-label": "Price",
		onPointerDown: atPointer,
		onPointerMove: atPointer,
		onPointerLeave: () => {
			setHover(null);
			onScrub?.(null);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: area,
				fill: color,
				opacity: .22
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: line,
				fill: "none",
				stroke: color,
				strokeWidth: "1.8",
				strokeLinejoin: "round",
				strokeLinecap: "round",
				vectorEffect: "non-scaling-stroke"
			}),
			pin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
				x1: pin.x,
				x2: pin.x,
				y1: "0",
				y2: H,
				stroke: color,
				strokeWidth: "1",
				opacity: .45,
				vectorEffect: "non-scaling-stroke"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: pin.x,
				cy: pin.y,
				r: "2.4",
				fill: color
			})] }) : null
		]
	});
}, (a, b) => a.up === b.up && a.fill === b.fill && a.resetKey === b.resetKey && sameBars(a.bars, b.bars));
var TZ_DEFAULT = "Europe/Warsaw";
var KEY = "zw-tz";
var TIMEZONES = [
	{
		id: "Europe/Warsaw",
		en: "Warsaw",
		pl: "Warszawa"
	},
	{
		id: "Europe/London",
		en: "London",
		pl: "Londyn"
	},
	{
		id: "UTC",
		en: "UTC",
		pl: "UTC"
	},
	{
		id: "America/New_York",
		en: "New York",
		pl: "Nowy Jork"
	},
	{
		id: "America/Chicago",
		en: "Chicago",
		pl: "Chicago"
	},
	{
		id: "America/Los_Angeles",
		en: "Los Angeles",
		pl: "Los Angeles"
	},
	{
		id: "Asia/Tokyo",
		en: "Tokyo",
		pl: "Tokio"
	},
	{
		id: "Asia/Singapore",
		en: "Singapore",
		pl: "Singapur"
	},
	{
		id: "Asia/Dubai",
		en: "Dubai",
		pl: "Dubaj"
	},
	{
		id: "Australia/Sydney",
		en: "Sydney",
		pl: "Sydney"
	}
];
var IDS = new Set(TIMEZONES.map((z) => z.id));
var listeners = /* @__PURE__ */ new Set();
var current = null;
function emit() {
	for (const fn of listeners) fn();
}
function valid(id) {
	return Boolean(id && IDS.has(id));
}
function readStored() {
	if (typeof window === "undefined") return null;
	try {
		const v = window.localStorage.getItem(KEY);
		return valid(v) ? v : null;
	} catch {
		return null;
	}
}
function writeStored(id) {
	try {
		window.localStorage.setItem(KEY, id);
	} catch {}
}
function getTz() {
	if (current && valid(current)) return current;
	current = readStored() ?? "Europe/Warsaw";
	return current;
}
function setTz(next) {
	const id = valid(next) ? next : TZ_DEFAULT;
	current = id;
	writeStored(id);
	emit();
}
function hydrateTz() {
	const next = readStored() ?? "Europe/Warsaw";
	if (current !== next) {
		current = next;
		emit();
	}
	return getTz();
}
function subscribeTz(cb) {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
}
function useTz() {
	const tz = (0, import_react.useSyncExternalStore)(subscribeTz, getTz, getTz);
	(0, import_react.useLayoutEffect)(() => {
		hydrateTz();
	}, []);
	return tz;
}
function wallMinutes(ts, zone) {
	const parts = new Intl.DateTimeFormat("en-GB", {
		timeZone: zone,
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(new Date(ts));
	const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
	const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
	return h * 60 + m;
}
/** Epochs in [from, to] where `zone` wall-clock equals hour:minute. */
function timesAtClock(from, to, zone, hour, minute) {
	if (!(to > from)) return [];
	const maxSpan = 1728e5;
	if (to - from > maxSpan) from = to - maxSpan;
	const want = hour * 60 + minute;
	const first = nextAtClock(from, zone, want);
	if (first == null || first > to) return [];
	const out = [];
	let t = first;
	let guard = 0;
	while (t <= to && guard++ < 8) {
		out.push(t);
		const next = nextAtClock(t + 6e4, zone, want);
		if (next == null || next <= t) break;
		t = next;
	}
	return out;
}
function nextAtClock(from, zone, want) {
	let delta = want - wallMinutes(from, zone);
	if (delta < 0) delta += 1440;
	let t = from + delta * 6e4;
	for (let i = 0; i < 8; i++) {
		const got = wallMinutes(t, zone);
		if (got === want) return t;
		let adj = want - got;
		if (adj > 720) adj -= 1440;
		if (adj < -720) adj += 1440;
		if (adj === 0) return t;
		t += adj * 6e4;
	}
	return null;
}
function formatTzTime(ts, zone) {
	try {
		return new Intl.DateTimeFormat("en-GB", {
			timeZone: zone,
			hour: "2-digit",
			minute: "2-digit",
			hourCycle: "h23"
		}).format(new Date(ts));
	} catch {
		return "";
	}
}
var TF_KEY = "zw-chart-tf";
var TFS = [
	[
		"1m",
		"chart.tf1",
		"chart.win1"
	],
	[
		"5m",
		"chart.tf5",
		"chart.win5"
	],
	[
		"15m",
		"chart.tf15",
		"chart.win15"
	]
];
function readTf() {
	try {
		const v = window.localStorage.getItem(TF_KEY);
		if (v === "5m" || v === "15m") return v;
	} catch {}
	return "1m";
}
function writeTf(tf) {
	try {
		window.localStorage.setItem(TF_KEY, tf);
	} catch {}
}
var SESSIONS = [
	{
		zone: "",
		h: 0,
		m: 0,
		key: "chart.sess.utc"
	},
	{
		zone: "Europe/London",
		h: 8,
		m: 0,
		key: "chart.sess.london"
	},
	{
		zone: "America/New_York",
		h: 9,
		m: 30,
		key: "chart.sess.ny"
	},
	{
		zone: "Asia/Tokyo",
		h: 9,
		m: 0,
		key: "chart.sess.tokyo"
	}
];
function sessionMarks(bars, tz, label) {
	if (bars.length < 2) return [];
	const from = bars[0].t;
	const to = bars.at(-1).t;
	if (!(to > from)) return [];
	const out = [];
	for (const s of SESSIONS) {
		const zone = s.zone || tz;
		for (const ts of timesAtClock(from, to, zone, s.h, s.m)) out.push({
			t: ts,
			label: label(s.key)
		});
	}
	return out;
}
function xOfTime(t, bars) {
	const n = bars.length;
	if (n < 2) return null;
	const first = bars[0].t;
	const last = bars[n - 1].t;
	if (t <= first) return 0;
	if (t >= last) return 100;
	for (let i = 1; i < n; i++) {
		const b = bars[i].t;
		if (t <= b) {
			const a = bars[i - 1].t;
			const f = b === a ? 0 : (t - a) / (b - a);
			return (i - 1 + f) / (n - 1) * 100;
		}
	}
	return null;
}
/** Chart + ticket. Ticket is the last row (`auto`) so buy/sell cannot be clipped. */
function MarketDesk() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPanel, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OrderTicket, {})
		})]
	});
}
function nativeBars(asset, tf) {
	if (!asset) return void 0;
	if (tf === "15m") return asset.htf?.m15;
	if (tf === "5m") return asset.chart5;
	return asset.series;
}
var chartPulls = /* @__PURE__ */ new Map();
var plotCache = /* @__PURE__ */ new Map();
/** Pull one coin/interval only when the desk does not already have native bars. */
function warmSymbolChart(symbol, tf) {
	const k = `${symbol}:${tf}`;
	const pending = chartPulls.get(k);
	if (pending) return pending;
	const asset = useDesk.getState().assets[symbol];
	const native = nativeBars(asset, tf);
	if (native && native.length >= 8) return Promise.resolve();
	const p = fetchSymbolChart({ data: {
		symbol,
		tf
	} }).then((res) => {
		if (res.ok) useDesk.getState().applySymbolChart(res.symbol, res.tf, res.bars);
	}).catch(() => void 0).finally(() => {
		chartPulls.delete(k);
	});
	chartPulls.set(k, p);
	return p;
}
function stubBars(asset) {
	const px = (asset.livePx && asset.livePx > 0 ? asset.livePx : 0) || asset.price;
	const open = asset.open > 0 ? asset.open : px;
	if (!(px > 0)) return [];
	const now = Date.now();
	return [{
		t: now - 6e4,
		px: open,
		o: open,
		h: Math.max(open, px),
		l: Math.min(open, px)
	}, {
		t: now,
		px,
		o: open,
		h: Math.max(open, px),
		l: Math.min(open, px)
	}];
}
function resample(bars, stepMs) {
	if (bars.length < 2 || !(stepMs > 0)) return bars;
	const out = [];
	for (const b of bars) {
		const bucket = Math.floor(b.t / stepMs) * stepMs;
		const last = out.at(-1);
		if (!last || last.t !== bucket) out.push({
			t: bucket,
			px: b.px,
			o: b.o ?? b.px,
			h: b.h ?? b.px,
			l: b.l ?? b.px,
			v: b.v
		});
		else {
			last.px = b.px;
			last.h = Math.max(last.h ?? last.px, b.h ?? b.px);
			last.l = Math.min(last.l ?? last.px, b.l ?? b.px);
			if (b.v) last.v = (last.v ?? 0) + b.v;
		}
	}
	return out;
}
function barsForTf(asset, tf) {
	if (tf === "15m") {
		const m15 = asset.htf?.m15;
		if (m15 && m15.length >= 2) return m15.slice(-96);
		if (asset.chart5 && asset.chart5.length >= 2) return resample(asset.chart5, 9e5).slice(-96);
		if (asset.series.length >= 2) return resample(asset.series, 9e5).slice(-96);
	} else if (tf === "5m") {
		if (asset.chart5 && asset.chart5.length >= 2) return asset.chart5.slice(-90);
		if (asset.series.length >= 2) return resample(asset.series, 3e5).slice(-90);
	} else if (asset.series.length >= 2) return asset.series.slice(-90);
	const cached = plotCache.get(`${asset.symbol}:${tf}`);
	if (cached && cached.length >= 2) return cached;
	return stubBars(asset);
}
function ChartPanel() {
	const asset = useSelectedTape();
	const selected = useDesk((s) => s.selected);
	const t = useT();
	const [tf, setTf] = (0, import_react.useState)(readTf);
	const [scrub, setScrub] = (0, import_react.useState)(null);
	function pick(next) {
		setTf(next);
		writeTf(next);
		setScrub(null);
	}
	(0, import_react.useEffect)(() => {
		setScrub(null);
	}, [selected]);
	(0, import_react.useEffect)(() => {
		if (!selected) return;
		let live = true;
		const rest = [
			"1m",
			"5m",
			"15m"
		].filter((x) => x !== tf);
		const assetNow = useDesk.getState().assets[selected];
		const canDraw = assetNow ? barsForTf(assetNow, tf).length >= 2 : false;
		warmSymbolChart(selected, tf).then(() => {
			if (!live || canDraw) return;
			for (const other of rest) warmSymbolChart(selected, other);
		});
		if (canDraw) for (const other of rest) warmSymbolChart(selected, other);
		return () => {
			live = false;
		};
	}, [selected, tf]);
	if (!asset) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-full items-center justify-center text-sm text-muted",
		children: t("chart.select")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChartHead, {
			asset,
			tf,
			onTf: pick,
			scrub
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePlot, {
			asset,
			selected,
			tf,
			onScrub: setScrub
		})]
	});
}
function barTime(t, tz) {
	return formatTzTime(t, tz);
}
function LiveChartHead({ asset, tf, onTf, scrub }) {
	const t = useT();
	const tz = useTz();
	const live = useMark(asset.symbol) || asset.livePx || asset.price;
	const chg = changePct(live, asset.open);
	const title = assetLabel(asset.symbol);
	const sub = assetName(asset.symbol);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex shrink-0 flex-wrap items-end justify-between gap-2 pb-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					"data-chart-symbol": asset.symbol,
					className: "text-base font-semibold tracking-tight sm:text-lg",
					children: title
				}), sub !== title ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-xs text-muted sm:text-sm",
					children: sub
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-0.5 flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-mono text-xl tabular-nums tracking-tight sm:text-2xl",
					children: live ? compactPrice(live) : "—"
				}), live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-mono text-sm tabular-nums ${signedClass(chg)}`,
					children: pct(chg)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-sm text-subtle",
					children: t("chart.connecting")
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-col items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "group",
				"aria-label": t("chart.tf"),
				className: "grid grid-cols-3 gap-0.5 rounded-lg bg-elevated p-0.5",
				children: TFS.map(([id, label, win]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onTf(id),
					"aria-pressed": tf === id,
					"data-chart-tf": id,
					className: cn("flex h-11 min-w-[2.6rem] flex-col items-center justify-center rounded-md px-1 leading-none sm:h-8", tf === id ? "bg-surface text-fg" : "text-muted"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs font-medium",
						children: t(label)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-3xs text-subtle",
						children: t(win)
					})]
				}, id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"data-chart-scrub": scrub ? "1" : "0",
				className: "mt-0.5 h-4 font-mono text-2xs tabular-nums text-subtle",
				children: scrub ? `${barTime(scrub.t, tz)} ${compactPrice(scrub.px)}` : "\xA0"
			})]
		})]
	});
}
function SessionOverlay({ bars }) {
	const t = useT();
	const tz = useTz();
	const from = bars[0]?.t ?? 0;
	const to = bars.at(-1)?.t ?? 0;
	const marks = (0, import_react.useMemo)(() => sessionMarks(bars, tz, t), [
		from,
		to,
		bars.length,
		tz,
		t
	]);
	if (marks.length === 0 || bars.length < 2) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute inset-0 z-[1]",
		children: marks.map((m) => {
			const left = xOfTime(m.t, bars);
			if (left == null || left < 0 || left > 100) return null;
			const flip = left > 88;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-0 bottom-0",
				style: { left: `${left}%` },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-px bg-fg/20" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("absolute top-0.5 whitespace-nowrap text-3xs tracking-wide text-subtle/80", flip ? "right-1" : "left-1"),
					children: m.label
				})]
			}, `${m.t}-${m.label}`);
		})
	});
}
function LivePlot({ asset, selected, tf, onScrub }) {
	const live = useMark(asset.symbol) || asset.livePx || asset.price;
	const up = changePct(live, asset.open) >= 0;
	const bars = barsForTf(asset, tf);
	if (bars.length >= 2) plotCache.set(`${selected}:${tf}`, bars);
	const t = useT();
	if (bars.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-chart-ready": "0",
		className: "flex min-h-0 flex-1 items-center justify-center text-sm text-muted",
		children: t("chart.wait")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-chart-ready": "1",
		className: "relative min-h-0 flex-1 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionOverlay, { bars }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PriceArea, {
			bars,
			up,
			onScrub,
			fill: true,
			resetKey: `${selected}-${tf}`
		})]
	});
}
function visibleOnLane(item, mode) {
	const lane = item.lane ?? (item.kind === "news" ? "market" : "demo");
	return lane === "market" || lane === mode;
}
function TapePanel() {
	const tape = useDesk((s) => s.tape);
	const clock = useDesk((s) => s.clock);
	const mode = useTradingMode((s) => s.mode);
	const t = useT();
	const rows = tape.filter((item) => visibleOnLane(item, mode));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("tape.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "min-h-0 flex-1 space-y-1 overflow-y-auto pr-1",
			children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "px-1 text-sm text-muted",
				children: t("tape.wait")
			}) : rows.map((item) => {
				const who = item.kind === "agent" && item.agentId ? agentShort(item.agentId) : item.kind === "fill" ? t("tape.fill") : item.kind === "news" ? t("tape.wire") : null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2 rounded-lg px-1 py-1.5 text-xs leading-relaxed",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-12 shrink-0 font-mono text-2xs text-subtle tabular-nums",
						children: timeAgo(item.ts, clock)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("min-w-0 flex-1 text-muted", (item.kind === "fill" || item.kind === "agent") && "text-fg"),
						children: [who ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-subtle",
							children: [who, " · "]
						}) : null, item.text]
					})]
				}, item.id);
			})
		})]
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
var SKIP_KEY = "zw-skip-autopilot-warn";
function skipWarn() {
	try {
		return window.localStorage.getItem(SKIP_KEY) === "1";
	} catch {
		return false;
	}
}
function rememberSkip() {
	try {
		window.localStorage.setItem(SKIP_KEY, "1");
	} catch {}
}
function AutopilotSwitch({ className, showLabel = true }) {
	const t = useT();
	const autopilot = useDesk((s) => s.autopilot);
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const mode = useTradingMode((s) => s.mode);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [skip, setSkip] = (0, import_react.useState)(false);
	function request(on) {
		if (!on) {
			setAutopilot(false);
			return;
		}
		if (skipWarn()) {
			setAutopilot(true);
			return;
		}
		setSkip(false);
		setOpen(true);
	}
	function confirm() {
		if (skip) rememberSkip();
		setOpen(false);
		setAutopilot(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: cn("flex items-center gap-2", className),
		children: [showLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-2xs font-medium text-muted lg:hidden xl:inline",
			children: autopilot ? t("floor.autopilotLive") : t("header.autopilot")
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked: autopilot,
			onCheckedChange: request,
			disabled: mode === "live",
			"aria-label": t("header.autopilot")
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("auto.warnTitle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("auto.warnBody") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex items-center gap-2 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "size-4 rounded border-border",
					checked: skip,
					onChange: (e) => setSkip(e.target.checked)
				}), t("auto.warnSkip")]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					className: "flex-1",
					onClick: () => setOpen(false),
					children: t("auto.warnCancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "flex-1",
					onClick: confirm,
					children: t("auto.warnConfirm")
				})]
			})
		] })
	})] });
}
/** Autopilot, then manual convene on its right. */
function FloorControls({ onConvene, className }) {
	const t = useT();
	const convening = useDesk((s) => s.convening);
	const mode = useTradingMode((s) => s.mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("min-w-0 shrink-0 flex-wrap items-center gap-2", className),
		children: [mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AutopilotSwitch, {}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				size: "sm",
				className: "h-11 shrink-0 px-2.5 text-2xs lg:h-9",
				onClick: onConvene,
				disabled: convening,
				children: convening ? t("header.inSession") : t("header.convene")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t("header.conveneTip") })] })]
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
function CouncilPanel({ onConvene }) {
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "agents",
					className: "text-2xs sm:text-sm",
					children: t("floor.agents")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: "tape",
					className: "text-2xs sm:text-sm",
					children: t("floor.tape")
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-hidden",
				children: pane === "agents" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentsPane, { onConvene }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapePanel, {})
			})]
		})
	});
}
function AgentsPane({ onConvene }) {
	const agents = useDesk((s) => s.agents);
	const lastCouncil = useDesk((s) => s.lastCouncil);
	const agentCalls = useDesk((s) => s.agentCalls);
	const proposal = liveProposal(useDesk((s) => s.proposal));
	const working = useDesk((s) => s.working);
	const executeProposal = useDesk((s) => s.executeProposal);
	const dismissProposal = useDesk((s) => s.dismissProposal);
	const mode = useTradingMode((s) => s.mode);
	const recs = recordsFrom(agentCalls ?? []);
	const t = useT();
	function fill() {
		const res = executeProposal();
		if (!res.ok) toast.error(txError(res.error));
		else toast.success(t("floor.filled"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 flex-wrap items-center justify-between gap-2 pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 flex-wrap items-baseline gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: t("floor.council")
					}),
					lastCouncil?.status?.mode === "online" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "up",
						children: t("floor.aiOnline")
					}) : lastCouncil?.status?.mode === "degraded" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "default",
						children: t("floor.aiDegraded")
					}) : null,
					lastCouncil ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: lastCouncil.mood === "risk-off" ? "down" : lastCouncil.mood === "risk-on" ? "up" : "default",
						children: t(`mood.${lastCouncil.mood}`)
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs text-subtle",
						children: t("floor.idle")
					})
				]
			}), onConvene ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorControls, {
				onConvene,
				className: "flex lg:hidden"
			}) : null]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1",
			children: [
				lastCouncil?.agreement?.level === "low" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-surface px-3 py-2 text-xs text-muted shadow-[var(--shadow-border)]",
					children: [
						t("floor.disagree"),
						lastCouncil.finalScore != null ? ` · ${t("floor.score", { n: lastCouncil.finalScore.toFixed(0) })}` : "",
						lastCouncil.band ? ` · ${t(`floor.band.${lastCouncil.band}`)}` : ""
					]
				}) : lastCouncil?.finalScore != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "px-0.5 text-2xs text-subtle",
					children: [t("floor.score", { n: lastCouncil.finalScore.toFixed(0) }), lastCouncil.band ? ` · ${t(`floor.band.${lastCouncil.band}`)}` : ""]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DamianCard, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-0.5 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("floor.specialists")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: AGENTS.filter((p) => p.id === "vesper" || p.id === "ash" || p.id === "kai").map((persona) => {
						const speech = agents.find((a) => a.id === persona.id);
						const reading = speech?.status === "reading";
						const rec = recs.find((r) => r.id === persona.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-lg bg-elevated p-3.5 shadow-[var(--shadow-border)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex size-9 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-sm font-medium text-accent",
									children: persona.mark
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-sm font-medium",
											children: persona.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs text-subtle",
											children: [
												t(`role.${persona.id}`),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, { id: persona.id }),
												rec ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "ml-1.5 text-muted",
													children: [rec.closed >= 2 ? t("floor.hits", {
														wins: rec.wins,
														closed: rec.closed
													}) : t("floor.hitsSoon"), !rec.trusted ? ` · ${t("floor.cold")}` : ""]
												}) : null
											]
										})] }), speech ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteChip, {
											vote: speech.vote,
											symbol: speech.symbol
										}) : null]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: cn("mt-1.5 text-sm leading-relaxed text-muted", reading && "shimmer-text"),
										children: reading ? t("floor.reading") : lastCouncil ? speech?.thesis ?? t(`mandate.${persona.id}`) : t(`mandate.${persona.id}`)
									})]
								})]
							})
						}, persona.id);
					})
				}),
				(() => {
					const persona = AGENTS.find((p) => p.id === "iris");
					const speech = agents.find((a) => a.id === "iris");
					const reading = speech?.status === "reading";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-lg bg-elevated p-3.5 shadow-[var(--shadow-border)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-9 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-sm font-medium text-accent",
								children: persona.mark
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-medium",
										children: persona.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-subtle",
										children: [t("role.iris"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, { id: "iris" })]
									})] }), speech ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoteChip, {
										vote: speech.vote,
										symbol: speech.symbol
									}) : null]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: cn("mt-1.5 text-sm leading-relaxed text-muted", reading && "shimmer-text"),
									children: reading ? t("floor.reading") : lastCouncil ? speech?.thesis ?? t("mandate.iris") : t("mandate.iris")
								})]
							})]
						})
					});
				})(),
				proposal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
								assetLabel(proposal.symbol),
								proposal.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(proposal.limitPx) })}` : ""
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
								disabled: mode === "live",
								children: t("floor.place")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "flex-1",
								size: "sm",
								variant: "ghost",
								onClick: dismissProposal,
								children: t("floor.dismiss")
							})]
						}),
						mode === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xs leading-relaxed text-muted",
							children: t("floor.liveNoPlace")
						}) : null
					]
				}) : null,
				working ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-surface p-3 shadow-[var(--shadow-border)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xs font-medium tracking-wide text-subtle uppercase",
							children: t("floor.working")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 font-mono text-sm tabular-nums",
							children: [
								working.side.toUpperCase(),
								" ",
								qtyFmt(working.qty, isLot(working.symbol)),
								" ",
								assetLabel(working.symbol),
								working.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(working.limitPx) })}` : ""
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs leading-relaxed text-muted",
							children: working.rationale
						})
					]
				}) : null
			]
		})]
	});
}
function ChatPane({ onAsk }) {
	const asking = useDesk((s) => s.asking);
	const pendingAsk = useDesk((s) => s.pendingAsk);
	const convening = useDesk((s) => s.convening);
	const lastAsk = useDesk((s) => s.lastAsk);
	const selected = useDesk((s) => s.selected);
	const positions = useDesk((s) => s.positions);
	const [q, setQ] = (0, import_react.useState)("");
	const scroller = (0, import_react.useRef)(null);
	const t = useT();
	const thread = (lastAsk?.log?.length ? lastAsk.log : lastAsk ? [{
		question: lastAsk.question,
		speaker: lastAsk.speaker,
		text: lastAsk.text,
		ts: lastAsk.ts
	}] : []).filter((turn) => typeof turn.ts === "number" && Date.now() - turn.ts < 864e5);
	const lastQ = thread[thread.length - 1]?.question;
	const waiting = Boolean(asking && pendingAsk && pendingAsk !== lastQ);
	(0, import_react.useEffect)(() => {
		const el = scroller.current;
		if (!el) return;
		el.scrollTop = el.scrollHeight;
	}, [
		thread.length,
		waiting,
		lastAsk?.text
	]);
	const chips = [
		t("floor.chipTell", { symbol: assetLabel(selected) }),
		positions[0] ? t("floor.chipClose", { symbol: assetLabel(positions[0].symbol) }) : t("floor.chipProbe", { symbol: assetLabel(selected) }),
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
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain px-0.5 pr-1",
			children: thread.length === 0 && !waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 pt-3 text-sm leading-relaxed text-muted",
				children: t("floor.askEmpty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 pb-3 pt-1",
				children: [thread.map((turn, i) => {
					const paras = turn.text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-[88%] rounded-2xl rounded-br-md bg-accent/15 px-3.5 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xs font-medium tracking-wide text-subtle uppercase",
									children: t("floor.you")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm leading-relaxed text-fg",
									children: turn.question
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-xs font-medium text-accent",
								children: AGENT_BY_ID[turn.speaker]?.mark ?? "?"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "max-w-[88%] rounded-2xl rounded-bl-md bg-elevated px-3.5 py-2.5 shadow-[var(--shadow-border)]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xs font-medium tracking-wide text-subtle uppercase",
									children: AGENT_BY_ID[turn.speaker]?.name ?? turn.speaker
								}), paras.map((p, j) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1.5 text-sm leading-relaxed text-fg",
									children: p
								}, j))]
							})]
						})]
					}, `${turn.question}-${i}`);
				}), waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-[88%] rounded-2xl rounded-br-md bg-accent/15 px-3.5 py-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xs font-medium tracking-wide text-subtle uppercase",
								children: t("floor.you")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm leading-relaxed text-fg",
								children: pendingAsk
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-1 size-8 shrink-0 rounded-md bg-surface" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl rounded-bl-md bg-elevated px-3.5 py-2.5 text-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "typing-dots",
								"aria-hidden": true,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {})
								]
							})
						})]
					})]
				}) : null]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "shrink-0 space-y-2 border-t border-border bg-bg pt-3 pb-[max(0.25rem,env(safe-area-inset-bottom,0px))] lg:pb-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-wrap gap-1.5",
				children: chips.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void onAsk(c),
					disabled: asking || convening,
					className: "min-h-9 rounded-md bg-surface px-3 py-1.5 text-2xs text-muted hover:text-fg disabled:opacity-50",
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
						className: "h-11 shrink-0 px-4",
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
function DamianCard() {
	const t = useT();
	const lastCouncil = useDesk((s) => s.lastCouncil);
	const agents = useDesk((s) => s.agents);
	const macro = useDesk((s) => s.macro);
	const speech = agents.find((a) => a.id === "damian");
	const reading = speech?.status === "reading";
	const report = lastCouncil?.sentiment;
	const sectors = report?.sectors ?? [];
	const thesis = report?.summary ?? speech?.thesis ?? t("mandate.damian");
	const bias = sentimentBias(sectors);
	const fill = Math.min(100, Math.max(0, (bias + 1) * 50));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-xl bg-elevated p-3.5 shadow-[var(--shadow-border)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-9 shrink-0 items-center justify-center rounded-md bg-surface font-mono text-sm font-medium text-accent",
				children: "D"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: "Damian Kaczmarski"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-subtle",
						children: [t("floor.sentiment"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SourceChip, { id: "damian" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("mt-1.5 text-sm leading-relaxed text-muted", reading && "shimmer-text"),
						children: reading ? t("floor.reading") : thesis
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mt-3 h-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full sentiment-track" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute top-1/2 size-3.5 rounded-full bg-elevated shadow-[var(--shadow-border)] ring-2 ring-fg",
							style: {
								left: `clamp(0px, calc(${fill}% - 7px), calc(100% - 14px))`,
								transform: "translateY(-50%)"
							}
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 flex justify-between text-2xs text-subtle",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center gap-0.5 text-down",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownRight, { className: "size-3" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center gap-0.5 text-up",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "size-3" })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-2 grid grid-cols-2 gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-surface px-2 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-2xs text-subtle",
								children: t("sector.dollar")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono text-xs tabular-nums",
								children: [macro?.dxy != null ? macro.dxy.toFixed(2) : "—", macro?.dxyChg != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: macro.dxyChg >= 0 ? " text-up" : " text-down",
									children: [
										" ",
										macro.dxyChg >= 0 ? "+" : "",
										macro.dxyChg.toFixed(2),
										"%"
									]
								}) : null]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md bg-surface px-2 py-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-2xs text-subtle",
								children: t("sector.vol")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono text-xs tabular-nums",
								children: [macro?.vix != null ? macro.vix.toFixed(1) : "—", macro?.vixChg != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: macro.vixChg >= 0 ? " text-down" : " text-up",
									children: [
										" ",
										macro.vixChg >= 0 ? "+" : "",
										macro.vixChg.toFixed(2),
										"%"
									]
								}) : null]
							})]
						})]
					}),
					sectors.filter((row) => row.id !== "dollar" && row.id !== "vol").length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1",
						children: sectors.filter((row) => row.id !== "dollar" && row.id !== "vol").map((row) => {
							const Icon = row.stance === "bullish" ? ArrowUpRight : row.stance === "bearish" ? ArrowDownRight : Minus;
							const tone = row.stance === "bullish" ? "text-up" : row.stance === "bearish" ? "text-down" : "text-subtle";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-2 rounded-md bg-surface px-2 py-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-fg",
									children: t(`sector.${row.id}`)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: cn("size-3.5 shrink-0", tone),
									"aria-hidden": true
								})]
							}, row.id);
						})
					}) : null
				]
			})]
		})
	});
}
function SourceChip({ id }) {
	const lastCouncil = useDesk((s) => s.lastCouncil);
	const t = useT();
	const src = lastCouncil?.status?.sources?.[id];
	if (!src || src === "llm") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "ml-1.5 font-mono text-2xs uppercase tracking-wide text-subtle",
		children: src === "rules" ? t("floor.sourceRules") : t("floor.sourceLocal")
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
			symbol ? ` ${assetLabel(symbol)}` : ""
		]
	});
}
var getPushPublicKey = createServerFn({ method: "GET" }).handler(createSsrRpc("95fcd8f79dd8754227ad02b43e9237b62a286d94d18c2bbc4c2d56acaaa19276"));
var savePushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("11dcb0543b2739f8307b9fabfe4ff2c13d11fd5e0464f717908c2456bf5e2e27"));
var dropPushSubscription = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ebf9a024314c19b45a067453fa6b269b5bf70177db374a41c0324456e6b8027a"));
var SEEN_KEY = "zw-alerts-seen";
var READ_KEY = "zw-alerts-read";
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
	const n = Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
	return Number.isFinite(n) ? n : 0;
}
function writeSeen(ts) {
	try {
		window.localStorage.setItem(SEEN_KEY, String(ts));
	} catch {}
}
function readIds() {
	if (typeof window === "undefined") return /* @__PURE__ */ new Set();
	try {
		const raw = window.localStorage.getItem(READ_KEY);
		if (!raw) return /* @__PURE__ */ new Set();
		const arr = JSON.parse(raw);
		return Array.isArray(arr) ? new Set(arr.filter((x) => typeof x === "string")) : /* @__PURE__ */ new Set();
	} catch {
		return /* @__PURE__ */ new Set();
	}
}
function writeIds(ids) {
	try {
		window.localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-240)));
	} catch {}
}
function placeInbox(anchor) {
	const pad = 12;
	const width = Math.min(380, window.innerWidth - 24);
	const left = Math.min(Math.max(pad, anchor.right - width), window.innerWidth - width - pad);
	return {
		top: Math.min(anchor.bottom + 8, window.innerHeight - pad),
		left,
		width
	};
}
function dayBucket(ts, now) {
	const start = new Date(now);
	start.setHours(0, 0, 0, 0);
	if (ts >= start.getTime()) return "today";
	if (ts >= start.getTime() - 864e5) return "yesterday";
	return "earlier";
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
	const mode = useTradingMode((s) => s.mode);
	const allFills = useDesk((s) => s.fills);
	const fills = mode === "live" ? [] : allFills;
	const closed = useDesk((s) => s.closedTrades);
	const proposal = useDesk((s) => s.proposal);
	const clock = useDesk((s) => s.clock);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [seen, setSeen] = (0, import_react.useState)(0);
	const [read, setRead] = (0, import_react.useState)(() => /* @__PURE__ */ new Set());
	const [pos, setPos] = (0, import_react.useState)(null);
	const root = (0, import_react.useRef)(null);
	const panel = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setSeen(readSeen());
		setRead(readIds());
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
			const node = e.target;
			if (root.current?.contains(node) || panel.current?.contains(node)) return;
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
	const closedById = new Map(closed.map((c) => [c.id, c]));
	const items = [];
	if (proposal && mode !== "live") items.push({
		id: `proposal-${proposal.symbol}-${proposal.proposedAt ?? 0}`,
		ts: proposal.proposedAt ?? clock,
		kind: "proposal",
		title: tt("alerts.waiting"),
		body: `${fillSideLabel(proposal.side)} ${qtyFmt(proposal.qty, isLot(proposal.symbol))} ${assetLabel(proposal.symbol)}`
	});
	for (const f of fills.slice(0, 24)) {
		const row = closedById.get(f.id);
		const isClose = Boolean(row);
		items.push({
			id: f.id,
			ts: f.ts,
			kind: isClose ? "close" : "open",
			title: `${fillSideLabel(f.side)} ${qtyFmt(f.qty, isLot(f.symbol))} ${assetLabel(f.symbol)}`,
			body: isClose ? fillNoteLabel(row?.closeNote ?? f.note, f.source) : `@${f.price.toFixed(2)} · ${fillNoteLabel(f.note, f.source)}`,
			pnl: row?.pnl
		});
	}
	items.sort((a, b) => b.ts - a.ts);
	function isUnread(id, ts) {
		if (read.has(id)) return false;
		return ts > seen;
	}
	const unread = items.filter((x) => isUnread(x.id, x.ts)).length;
	function toggle() {
		setOpen((v) => !v);
	}
	function markAll() {
		const ts = Math.max(Date.now(), items[0]?.ts ?? 0);
		writeSeen(ts);
		setSeen(ts);
		const next = new Set(read);
		for (const x of items) next.add(x.id);
		writeIds(next);
		setRead(next);
	}
	function markOne(id) {
		const next = new Set(read);
		next.add(id);
		writeIds(next);
		setRead(next);
	}
	const groups = [];
	for (const bucket of [
		"today",
		"yesterday",
		"earlier"
	]) {
		const rows = items.filter((x) => dayBucket(x.ts, clock) === bucket);
		if (rows.length) groups.push({
			id: bucket,
			items: rows
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: root,
		className: cn("relative", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "ghost",
			size: "icon-sm",
			"aria-label": tt("alerts.aria"),
			"aria-expanded": open,
			className: "relative size-11",
			onClick: toggle,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: cn("size-4", unread > 0 ? "text-fg" : "text-muted") }), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-3xs tabular-nums text-accent-fg",
				children: unread > 9 ? "9+" : unread
			}) : null]
		}), open && pos && typeof document !== "undefined" ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: panel,
			role: "dialog",
			"aria-label": tt("alerts.title"),
			className: "inbox-pop overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]",
			style: {
				position: "fixed",
				top: pos.top,
				left: pos.left,
				width: pos.width,
				zIndex: 80
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 border-b border-border px-3.5 pt-3 pb-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium tracking-tight text-fg",
						children: tt("alerts.title")
					}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-0.5 text-2xs text-muted",
						children: tt("alerts.unreadCount", { n: unread })
					}) : null]
				}), unread > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: markAll,
					className: "inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "size-3.5" }), tt("alerts.markAll")]
				}) : null]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[min(28rem,70dvh)] overflow-y-auto pb-2",
				children: items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center px-6 py-10 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex size-11 items-center justify-center rounded-xl bg-elevated text-subtle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium text-fg",
							children: tt("alerts.emptyTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 max-w-[16rem] text-2xs leading-relaxed text-muted",
							children: mode === "live" ? tt("alerts.liveEmpty") : tt("alerts.emptyBody")
						})
					]
				}) : groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "pt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "sticky top-0 z-10 bg-surface/95 px-3.5 py-1.5 text-2xs font-medium tracking-wide text-subtle uppercase",
						children: tt(`alerts.${group.id}`)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "px-2 pb-1",
						children: group.items.map((row) => {
							const unreadRow = isUnread(row.id, row.ts);
							const Icon = row.kind === "close" ? ArrowDownRight : row.kind === "proposal" ? CircleDot : ArrowUpRight;
							const iconTone = row.kind === "proposal" ? "bg-elevated text-fg" : row.kind === "close" ? row.pnl != null && row.pnl < 0 ? "bg-down/10 text-down" : "bg-up/10 text-up" : "bg-up/10 text-up";
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									markOne(row.id);
									if (row.kind === "proposal") setOpen(false);
								},
								className: cn("flex w-full items-start gap-2.5 rounded-xl px-2 py-2.5 text-left", unreadRow ? "bg-elevated/80" : "hover:bg-elevated/50"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", iconTone),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-baseline justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate text-xs font-medium text-fg",
													children: row.title
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "shrink-0 font-mono text-2xs text-subtle tabular-nums",
													children: timeAgo(row.ts, clock)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-0.5 block truncate text-2xs leading-relaxed text-muted",
												children: row.body
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-1 flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-2xs text-subtle",
													children: tt(`alerts.kind.${row.kind}`)
												}), row.pnl != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("font-mono text-2xs tabular-nums", signedClass(row.pnl)),
													children: tt("alerts.pnl", { value: `${row.pnl >= 0 ? "+" : ""}${money(row.pnl)}` })
												}) : null]
											})
										]
									}),
									unreadRow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0 rounded-full bg-accent" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-2 size-1.5 shrink-0" })
								]
							}) }, row.id);
						})
					})]
				}, group.id))
			})]
		}), document.body) : null]
	});
}
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
						label: t("wallet.usdc"),
						value: money(usdcWallet)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
						label: t("wallet.perpsEquity"),
						value: equity == null ? "—" : money(equity)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$2, {
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
			] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-3 w-full",
					disabled: busy,
					onClick: () => void connectMetaMask(),
					children: busy ? t("wallet.connecting") : t("wallet.connect")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 text-2xs leading-relaxed text-subtle",
					children: t("wallet.connectHint")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
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
				})
			] }),
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
function Stat$2({ label, value }) {
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
function PasswordCard() {
	const t = useT();
	const [hasPassword, setHasPassword] = (0, import_react.useState)(null);
	const [hasRecovery, setHasRecovery] = (0, import_react.useState)(false);
	const [current, setCurrent] = (0, import_react.useState)("");
	const [next, setNext] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [code, setCode] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [issuing, setIssuing] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let live = true;
		passwordStatus().then((res) => {
			if (!live) return;
			setHasPassword(res.hasPassword);
			setHasRecovery(res.hasRecovery);
		}).catch(() => {
			if (live) setHasPassword(false);
		});
		return () => {
			live = false;
		};
	}, []);
	async function onSave(e) {
		e.preventDefault();
		if (next.length < 8 || next.length > 128) {
			setError(t("login.needCreds"));
			return;
		}
		if (next !== confirm) {
			setError(t("login.mismatch"));
			return;
		}
		setBusy(true);
		setError(null);
		try {
			const res = await changeDeskPassword({ data: {
				current: hasPassword ? current : void 0,
				next
			} });
			if (!res.ok) {
				setError(res.error === "current" ? t("settings.passwordBad") : t("login.needCreds"));
				return;
			}
			setCurrent("");
			setNext("");
			setConfirm("");
			setHasPassword(true);
			toast.success(t("settings.passwordSaved"));
		} catch {
			setError(t("settings.passwordBad"));
		} finally {
			setBusy(false);
		}
	}
	async function onIssue() {
		setIssuing(true);
		setCopied(false);
		try {
			const res = await issueRecoveryCode();
			if (res.ok) {
				setCode(res.code);
				setHasRecovery(true);
			}
		} finally {
			setIssuing(false);
		}
	}
	async function copyCode(value) {
		try {
			await navigator.clipboard.writeText(value);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: hasPassword === false ? t("settings.passwordSet") : t("settings.password")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-2xs leading-relaxed text-muted",
				children: hasPassword === false ? t("settings.passwordSetBody") : t("settings.passwordBody")
			}),
			hasPassword === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-11 rounded-md bg-surface" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onSave,
				className: "mt-3 space-y-2",
				children: [
					hasPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretField, {
						autoComplete: "current-password",
						placeholder: t("settings.currentPassword"),
						value: current,
						onChange: (e) => setCurrent(e.target.value)
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretField, {
						autoComplete: "new-password",
						placeholder: t("login.newPassword"),
						value: next,
						onChange: (e) => setNext(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretField, {
						autoComplete: "new-password",
						placeholder: t("login.confirmPassword"),
						value: confirm,
						onChange: (e) => setConfirm(e.target.value)
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs leading-relaxed text-down",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "secondary",
						className: "w-full",
						disabled: busy || next.length < 8,
						children: busy ? "…" : t("settings.passwordSave")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 border-t border-border pt-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.recovery")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: hasRecovery ? t("settings.recoveryHas") : t("settings.recoveryBody")
					}),
					code ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-sm tracking-wide tabular-nums",
								children: code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-2xs leading-relaxed text-muted",
								children: t("settings.recoveryOnce")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								className: "mt-2 w-full",
								onClick: () => void copyCode(code),
								children: copied ? t("login.recoveryCopied") : t("login.copyCode")
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						className: "mt-3 w-full",
						disabled: issuing,
						onClick: () => void onIssue(),
						children: issuing ? "…" : hasRecovery ? t("settings.recoveryAgain") : t("settings.recoveryMake")
					})
				]
			})
		]
	});
}
var subscribeToNothing = () => () => {};
var noGateOnServer = () => false;
function SettingsPanel() {
	const t = useT();
	const { appearance, setAppearance } = useAppearance();
	const reset = useDesk((s) => s.reset);
	const mode = useTradingMode((s) => s.mode);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col overflow-y-auto pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "px-1 pb-3 text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("settings.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandleCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordCard, {}),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TzCard, {}),
			mode === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WalletCard, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PushCard, {}),
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SignOutCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FaqCard, {}),
			mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
			}) : null
		]
	});
}
function TzCard() {
	const t = useT();
	const locale = useLocale();
	const tz = useTz();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: t("settings.tz")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-2xs leading-relaxed text-muted",
				children: t("settings.tzBody")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid grid-cols-2 gap-1 rounded-lg bg-surface p-1",
				children: TIMEZONES.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setTz(z.id),
					"aria-pressed": tz === z.id,
					className: cn("flex h-11 items-center justify-center rounded-md px-1 text-center text-2xs font-medium", tz === z.id ? "bg-elevated text-fg" : "text-muted"),
					children: locale === "pl" ? z.pl : z.en
				}, z.id))
			})
		]
	});
}
function PushCard() {
	const t = useT();
	const push = usePushAlerts();
	const prefs = useDesk((s) => s.alertPrefs);
	const setAlertPrefs = useDesk((s) => s.setAlertPrefs);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-medium",
						children: t("settings.push")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: t("settings.pushBody")
					}),
					push.blocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xs leading-relaxed text-muted",
						children: t("alerts.blocked")
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
				checked: push.on,
				disabled: push.blocked || push.busy,
				onCheckedChange: (on) => {
					if (on) push.subscribe(true);
					else push.unsubscribe();
				},
				"aria-label": t("alerts.awayAria")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 border-t border-border pt-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: t("alerts.prefs")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-2xs leading-relaxed text-muted",
					children: t("alerts.prefsBody")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: [
						"open",
						"close",
						"proposal"
					].map((kind) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-fg",
							children: t(`alerts.kind.${kind}`)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: prefs?.[kind] !== false,
							onCheckedChange: (on) => setAlertPrefs({
								...prefs ?? {
									open: true,
									close: true,
									proposal: true
								},
								[kind]: on
							}),
							"aria-label": t(`alerts.kind.${kind}`)
						})]
					}, kind))
				})
			]
		})]
	});
}
function FaqCard() {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-sm font-medium",
			children: t("settings.faq")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 divide-y divide-border",
			children: [
				["faq.q1", "faq.a1"],
				["faq.q2", "faq.a2"],
				["faq.q3", "faq.a3"],
				["faq.q4", "faq.a4"],
				["faq.q5", "faq.a5"]
			].map(([q, a]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
				className: "group py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
					className: "cursor-pointer list-none text-sm leading-relaxed text-fg [&::-webkit-details-marker]:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 text-muted group-open:hidden",
							children: "+"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 hidden text-muted group-open:inline",
							children: "–"
						}),
						t(q)
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1.5 pl-4 text-2xs leading-relaxed text-muted",
					children: t(a)
				})]
			}, q))
		})]
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
function DeskHeader({ focusChat = false, onConvene }) {
	const setAutopilot = useDesk((s) => s.setAutopilot);
	const feed = useFeed();
	const mode = useTradingMode((s) => s.mode);
	const t = useT();
	const [settings, setSettings] = (0, import_react.useState)(false);
	const setMode = useTradingMode((s) => s.setMode);
	const address = useLiveWallet((s) => s.address);
	const source = useLiveWallet((s) => s.source);
	const refresh = useLiveWallet((s) => s.refresh);
	function requestLive() {
		setAutopilot(false);
		setMode("live");
		if (address && source === "metamask") refresh();
		toast.success(t("mode.liveOn"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "shrink-0 border-b border-border",
		"data-mode": mode,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-14 min-w-0 items-center gap-1.5 px-2.5 sm:gap-3 sm:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 shrink items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaneMark, { className: "size-8 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "hidden truncate text-xs font-semibold tracking-tight min-[24rem]:block sm:text-sm",
									children: APP_NAME
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-flex items-center gap-1.5 text-2xs font-medium text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 shrink-0 rounded-full ${feed === "live" ? "live-dot bg-up" : feed === "stale" ? "bg-down" : "bg-subtle"}` })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeKicker, { mode })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModeSwitch, { onRequestLive: requestLive }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex min-w-0 items-center gap-1 sm:gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStats, { className: cn("hidden xl:flex xl:items-center xl:gap-3", focusChat && "xl:hidden") }),
							onConvene ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FloorControls, {
								onConvene,
								className: "hidden lg:flex"
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertsButton, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveWalletChip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "size-11",
									"aria-label": t("nav.settings"),
									onClick: () => setSettings(true),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-4" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipContent, { children: t("nav.settings") })] })
						]
					})
				]
			}),
			focusChat ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-11 grid-cols-3 items-center gap-2 border-t border-border px-3 xl:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveStats, { mobile: true })
			}),
			focusChat ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex min-h-9 items-center gap-2 border-t border-border px-3 py-1.5 sm:px-4", mode === "live" ? "bg-down/5" : "bg-transparent"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1.5 shrink-0 rounded-full", mode === "live" ? "bg-down" : "bg-subtle") }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "min-w-0 flex-1 text-2xs leading-snug text-muted",
						children: mode === "live" ? address ? t("mode.banner") : t("mode.liveNoWallet") : t("mode.demoBanner")
					}),
					mode === "demo" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						className: "h-9 shrink-0 px-2.5 text-2xs",
						onClick: requestLive,
						children: t("mode.goLive")
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: settings,
				onOpenChange: setSettings,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[min(85dvh,calc(100dvh-2rem))] w-[min(28rem,calc(100vw-1.5rem))] overflow-y-auto",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("nav.settings") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPanel, {})]
				})
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
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: goDemo,
			"aria-label": t("mode.demo"),
			"aria-pressed": mode === "demo",
			className: cn("flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1.5 text-2xs font-medium sm:min-w-[3.25rem] sm:px-3 sm:text-xs", mode === "demo" ? "bg-elevated text-fg" : "text-muted"),
			children: t("mode.demo")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: onRequestLive,
			"aria-label": t("mode.live"),
			"aria-pressed": mode === "live",
			className: cn("flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1.5 text-2xs font-medium sm:min-w-[3.25rem] sm:px-3 sm:text-xs", mode === "live" ? "bg-elevated text-fg" : "text-muted"),
			children: t("mode.live")
		})]
	});
}
function LiveWalletChip() {
	const mode = useTradingMode((s) => s.mode);
	const address = useLiveWallet((s) => s.address);
	const equity = useLiveWallet((s) => s.equity);
	const wallet = useLiveWallet((s) => s.wallet);
	if (mode !== "live" || !address) return null;
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
	const equityLabel = mode === "live" ? t("header.equityHl") : t("header.equity");
	const cashLabel = mode === "live" ? t("header.cashHl") : t("header.cash");
	if (mobile) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase truncate",
			children: equityLabel
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm tabular-nums",
			children: money(equity)
		})] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase truncate",
			children: cashLabel
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
				label: equityLabel,
				value: money(equity)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
				label: t("header.pnl"),
				value: mode === "live" ? money(pnl) : pct(pnlPct),
				tone: signedClass(pnl)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat$1, {
				label: cashLabel,
				value: money(cashShown),
				muted: true,
				className: "hidden xl:block"
			})
		]
	});
}
function Stat$1({ label, value, tone, muted, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-2xs font-medium tracking-wide text-subtle uppercase truncate",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `font-mono text-sm tabular-nums ${tone ?? (muted ? "text-muted" : "text-fg")}`,
			children: value
		})]
	});
}
function dayKey(ts) {
	const d = new Date(ts);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function stamp(ts, locale) {
	return new Date(ts).toLocaleString(locale === "pl" ? "pl-PL" : "en-US", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function held(openedAt, closedAt, locale) {
	if (!openedAt || closedAt <= openedAt) return null;
	const ms = closedAt - openedAt;
	const min = Math.round(ms / 6e4);
	if (min < 60) return locale === "pl" ? `${min} min` : `${min} min`;
	const h = Math.floor(min / 60);
	const r = min % 60;
	if (h < 48) return locale === "pl" ? `${h} godz. ${r} min` : `${h}h ${r}m`;
	const d = Math.floor(h / 24);
	const rh = h % 24;
	return locale === "pl" ? `${d} d ${rh} godz.` : `${d}d ${rh}h`;
}
function dayLabel(ts, locale) {
	return new Date(ts).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-US", {
		weekday: "short",
		day: "numeric",
		month: "short",
		year: "numeric"
	});
}
function HistoryPanel() {
	const mode = useTradingMode((s) => s.mode);
	const demoClosed = useDesk((s) => s.closedTrades);
	const liveClosed = useLiveWallet((s) => s.closed);
	const liveAddr = useLiveWallet((s) => s.address);
	const closed = mode === "live" ? liveClosed ?? [] : demoClosed;
	const t = useT();
	const locale = useLocale();
	const [openDays, setOpenDays] = (0, import_react.useState)({});
	const [openTrades, setOpenTrades] = (0, import_react.useState)({});
	const days = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const row of closed) {
			const k = dayKey(row.ts);
			const cur = map.get(k) ?? {
				ts: row.ts,
				trades: [],
				pnl: 0
			};
			cur.trades.push(row);
			cur.pnl += row.pnl;
			map.set(k, cur);
		}
		return [...map.entries()].sort((a, b) => b[1].ts - a[1].ts);
	}, [closed]);
	if (!closed.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "shrink-0 px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("hist.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-1 text-sm leading-relaxed text-muted",
			children: mode === "live" ? liveAddr ? t("hist.liveEmpty") : t("hist.liveNeedWallet") : t("hist.empty")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "shrink-0 px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
			children: t("hist.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1",
			children: days.map(([key, day]) => {
				const open = openDays[key] ?? false;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl bg-elevated shadow-[var(--shadow-border)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setOpenDays((s) => ({
							...s,
							[key]: !open
						})),
						className: "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: dayLabel(day.ts, locale)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-2xs text-muted",
								children: t(day.trades.length === 1 ? "hist.one" : "hist.n", { n: day.trades.length })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-mono text-sm tabular-nums ${signedClass(day.pnl)}`,
								children: money(day.pnl)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 text-muted transition-transform", open && "rotate-180") })]
						})]
					}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-1 border-t border-border px-2 py-2",
						children: day.trades.map((row) => {
							const shown = openTrades[row.id] ?? false;
							const side = row.side === "short" ? t("port.short") : t("port.long");
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg bg-surface",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setOpenTrades((s) => ({
										...s,
										[row.id]: !shown
									})),
									className: "flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-mono text-sm font-medium",
											children: assetLabel(row.symbol)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block text-2xs text-muted capitalize",
											children: [side, held(row.openedAt, row.ts, locale) ? ` · ${held(row.openedAt, row.ts, locale)}` : ""]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `font-mono text-sm tabular-nums ${signedClass(row.pnl)}`,
											children: [money(row.pnl), row.pnlPct != null ? ` ${pct(row.pnlPct)}` : ""]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 text-muted transition-transform", shown && "rotate-180") })]
									})]
								}), shown ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TradeBody, { row }) : null]
							}, row.id);
						})
					}) : null]
				}, key);
			})
		})]
	});
}
function TradeBody({ row }) {
	const t = useT();
	const locale = useLocale();
	const analysis = (row.analysis && !looksLikeReflection(row.analysis) ? row.analysis : "") || explainTrade(row, locale) || t("hist.none");
	const reflections = reflectClosed(row, null, locale);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2 border-t border-border px-2.5 py-2 text-sm leading-relaxed",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-2xs text-muted tabular-nums",
				children: [
					row.qty != null ? `${row.qty} · ` : "",
					row.entry ? `${t("hist.entry")} ${compactPrice(row.entry)}` : "",
					row.exit ? ` → ${t("hist.exit")} ${compactPrice(row.exit)}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-2xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: t("hist.opened")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums text-fg",
						children: row.openedAt ? stamp(row.openedAt, locale) : t("hist.none")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: t("hist.closedAt")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums text-fg",
						children: stamp(row.ts, locale)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: t("hist.held")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums text-fg",
						children: held(row.openedAt, row.ts, locale) ?? t("hist.none")
					}),
					row.fees != null && row.fees > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-subtle",
						children: t("hist.fees")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
						className: "font-mono tabular-nums text-fg",
						children: money(row.fees)
					})] }) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: t("hist.analysis"),
				body: analysis
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: t("hist.whyIn"),
				body: humanEntryNote(row.entryNote, locale)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				label: t("hist.whyOut"),
				body: humanCloseNote(row, locale)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-2xs font-medium tracking-wide text-subtle uppercase",
				children: t("hist.agents")
			}), reflections.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-1 space-y-1.5",
				children: reflections.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-elevated px-2 py-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-2xs font-medium",
						children: [AGENT_BY_ID[a.id]?.name ?? a.id, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-1.5 font-mono font-normal text-muted",
							children: t(a.vote === "buy" ? "vote.buy" : a.vote === "sell" ? "vote.sell" : "vote.hold")
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-xs leading-relaxed text-muted",
						children: a.thesis
					})]
				}, a.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xs text-muted",
				children: t("hist.none")
			})] })
		]
	});
}
function Block({ label, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-2xs font-medium tracking-wide text-subtle uppercase",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-fg",
		children: body
	})] });
}
function clock(ms) {
	const s = Math.max(0, Math.ceil(ms / 1e3));
	const m = Math.floor(s / 60);
	const r = s % 60;
	return `${m}:${String(r).padStart(2, "0")}`;
}
function ProposalBanner() {
	const raw = useDesk((s) => s.proposal);
	const executeProposal = useDesk((s) => s.executeProposal);
	const dismissProposal = useDesk((s) => s.dismissProposal);
	const mode = useTradingMode((s) => s.mode);
	const t = useT();
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	const proposal = liveProposal(raw, now);
	const left = proposal ? proposalMsLeft(proposal, now) : 0;
	(0, import_react.useEffect)(() => {
		if (!raw) return;
		const id = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(id);
	}, [raw]);
	(0, import_react.useEffect)(() => {
		if (raw && !proposal) dismissProposal();
	}, [
		raw,
		proposal,
		dismissProposal
	]);
	if (!proposal) return null;
	function fill() {
		const res = executeProposal();
		if (!res.ok) toast.error(txError(res.error));
		else toast.success(t("floor.filled"));
	}
	const mins = Math.round(PROPOSAL_TTL_MS / 6e4);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "shrink-0 border-b border-up/30 bg-up/10 px-3 py-2.5 sm:px-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs font-medium tracking-wide text-subtle uppercase",
						children: t("floor.proposed")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-0.5 font-mono text-sm tabular-nums text-fg",
						children: [
							proposal.side.toUpperCase(),
							" ",
							qtyFmt(proposal.qty, isLot(proposal.symbol)),
							" ",
							assetLabel(proposal.symbol),
							proposal.limitPx ? ` · ${t("floor.limitAt", { px: compactPrice(proposal.limitPx) })}` : ""
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-0.5 text-2xs leading-relaxed text-muted",
						children: proposal.rationale
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-2xs tabular-nums text-subtle",
						children: t("floor.ticketTtl", {
							m: mins,
							left: clock(left)
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex shrink-0 gap-1.5 sm:flex-col",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11 flex-1 sm:h-9 sm:flex-none",
					size: "sm",
					onClick: fill,
					disabled: mode === "live",
					children: t("floor.place")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "h-11 flex-1 sm:h-9 sm:flex-none",
					size: "sm",
					variant: "ghost",
					onClick: dismissProposal,
					children: t("floor.dismiss")
				})]
			})]
		}), mode === "live" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-2xs leading-relaxed text-muted",
			children: t("floor.ticketDemoOnly")
		}) : null]
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
	const mode = useTradingMode((s) => s.mode);
	const cash = useDesk((s) => s.cash);
	const positions = useDesk((s) => s.positions);
	const assets = useMarkedAssets();
	const closed = useDesk((s) => s.closedTrades);
	const anchors = useDesk((s) => s.periodAnchors);
	const starting = useDesk((s) => s.startingEquity);
	const fills = useDesk((s) => s.fills);
	const liveEq = useLiveWallet((s) => s.equity);
	const liveSpot = useLiveWallet((s) => s.hlSpotUsdc);
	const livePos = useLiveWallet((s) => s.positions);
	const t = useT();
	const live = mode === "live";
	const stats = live ? null : portfolioStats(cash, positions, assets, closed, anchors, starting);
	const liveSlices = live ? [{
		kind: "cash",
		name: "cash",
		value: liveSpot ?? 0,
		pct: (liveEq ?? 0) > 0 ? (liveSpot ?? 0) / (liveEq ?? 1) * 100 : 0,
		fill: sliceColor("cash", 0)
	}, ...livePos.map((p, i) => {
		const kind = p.qty >= 0 ? "long" : "short";
		const value = Math.abs(p.value);
		return {
			kind,
			name: p.desk ?? p.coin,
			value,
			pct: (liveEq ?? 0) > 0 ? value / (liveEq ?? 1) * 100 : 0,
			fill: sliceColor(kind, i)
		};
	})].filter((s) => s.value > .5) : [];
	let longI = 0;
	const colored = live ? liveSlices : (stats?.slices ?? []).map((s) => {
		const i = s.kind === "long" ? longI++ : 0;
		return {
			...s,
			fill: sliceColor(s.kind, i)
		};
	});
	const equityShown = live ? liveEq ?? 0 : stats?.equity ?? 0;
	const floating = live ? livePos.reduce((sum, p) => sum + p.pnl, 0) : stats?.floating ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase",
					children: t("port.alloc")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative size-40 shrink-0",
						children: colored.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AllocRing, { slices: colored }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute inset-0 flex flex-col items-center justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-mono text-2xs tabular-nums tracking-tight",
								children: money(equityShown, 0)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xs text-subtle",
								children: live ? t("port.equityHl") : t("port.equity")
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
											s.kind === "cash" ? live ? t("port.cashHl") : t("port.cash") : assetName(s.name),
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
				live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-2xs leading-relaxed text-muted",
					children: t("port.liveNote")
				}) : stats && stats.longMv + stats.shortMv > .5 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("port.winrate"),
						value: live ? "—" : `${(stats?.winrate ?? 0).toFixed(0)}%`,
						sub: live ? t("mode.live") : stats?.trades ? `${stats.wins}W / ${stats.trades} · ${money(stats.realized)}` : t("port.noClosed")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("port.floating"),
						value: money(floating),
						tone: signedClass(floating),
						sub: t("port.openMarks")
					}),
					!live && stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.total"),
							value: money(stats.total),
							sub: pct(stats.totalPct),
							tone: signedClass(stats.total)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.day"),
							value: money(stats.day),
							sub: pct(stats.dayPct),
							tone: signedClass(stats.day)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.week"),
							value: money(stats.week),
							sub: pct(stats.weekPct),
							tone: signedClass(stats.week)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.month"),
							value: money(stats.month),
							sub: pct(stats.monthPct),
							tone: signedClass(stats.month)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.year"),
							value: money(stats.year),
							sub: pct(stats.yearPct),
							tone: signedClass(stats.year)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: t("port.openedN"),
							value: String(stats.openCount),
							sub: stats.openCount === 1 ? t("port.oneTrade") : t("port.nTrades", { n: stats.openCount })
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t("port.openedN"),
						value: String(livePos.length),
						sub: livePos.length === 1 ? t("port.oneTrade") : t("port.nTrades", { n: livePos.length })
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
			}), live ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "px-1 text-sm leading-relaxed text-muted",
				children: t("port.liveFills")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1",
				children: fills.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-1 text-sm text-muted",
					children: t("port.noPrints")
				}) : fills.slice(0, 10).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-mono text-2xs tabular-nums",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn(f.side === "buy" ? "text-up" : "text-down"),
						children: [
							fillSideLabel(f.side),
							" ",
							qtyFmt(f.qty, isLot(f.symbol)),
							" ",
							assetName(f.symbol)
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted",
						children: [compactPrice(f.price), ` · ${fillNoteLabel(f.note, f.source)}`]
					})]
				}, f.id))
			})] })
		]
	});
}
function Stat({ label, value, sub, tone }) {
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
function Glyph({ symbol }) {
	if (symbol === "GOLD") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 16 16",
		className: "size-[62%]",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "8",
			cy: "8",
			r: "6",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "8",
			cy: "8",
			r: "2.3",
			fill: "currentColor"
		})]
	});
	if (symbol === "SILVER") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 16 16",
		className: "size-[62%]",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M9.6 2.5A6.1 6.1 0 1 0 13.4 10.2 4.9 4.9 0 0 1 9.6 2.5Z"
		})
	});
	if (symbol === "BTC") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 16 16",
		className: "size-[62%]",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M8 1.8 9.7 5.6 13.8 6 10.8 8.8 11.6 12.8 8 10.8 4.4 12.8 5.2 8.8 2.2 6 6.3 5.6Z"
		})
	});
	if (symbol === "ETH") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 16 16",
		className: "size-[62%]",
		"aria-hidden": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M8 1.5 13.4 8.1 8 10.8Zm0 10.2 5.4-2.7L8 14.6 2.6 8Z"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			opacity: "0.7",
			d: "M8 1.5 2.6 8.1 8 10.8Z"
		})]
	});
	if (symbol === "SPY") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 16 16",
		className: "size-[62%]",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M2.2 11.8 6 7.2 8.7 9.5 13.8 3.8",
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "1.5",
			strokeLinejoin: "round",
			strokeLinecap: "round"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-3xs font-semibold tracking-tight",
		children: symbol.slice(0, 1)
	});
}
function TickerMark({ symbol, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("ticker-mark inline-flex shrink-0 items-center justify-center rounded-full", className),
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { symbol })
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
					name: assetName(u.symbol),
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
	const series = (asset.series.length ? asset.series : [{
		t: 0,
		px: asset.livePx || asset.price
	}]).slice(-28).map((b) => b.px);
	const px = (asset.livePx && asset.livePx > 0 ? asset.livePx : 0) || asset.price;
	const chg = changePct(px, asset.open);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-symbol": asset.symbol,
		onClick: () => onSelect(asset.symbol),
		className: cn("flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]", active ? "bg-elevated" : "hover:bg-elevated/60"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerMark, {
				symbol: asset.symbol,
				className: "size-7"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-sm font-medium tabular-nums",
						children: assetLabel(asset.symbol)
					}), held ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("rounded-full px-1.5 py-px text-2xs font-medium", held.qty >= 0 ? "bg-up/15 text-up" : "bg-down/15 text-down"),
						children: held.qty >= 0 ? t("side.long") : t("side.short")
					}) : null]
				}), name !== assetLabel(asset.symbol) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate text-2xs text-subtle",
					children: name
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
				data: series,
				up: chg >= 0,
				className: "hidden xl:block"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LivePx, {
				symbol: asset.symbol,
				open: asset.open,
				fallback: px,
				livePx: asset.livePx
			})
		]
	}) });
}, (a, b) => a.asset.symbol === b.asset.symbol && a.asset.livePx === b.asset.livePx && a.asset.price === b.asset.price && a.asset.open === b.asset.open && a.active === b.active && a.held === b.held && a.name === b.name);
function LivePx({ symbol, open, fallback, livePx }) {
	const t = useT();
	const px = useMark(symbol) || livePx || fallback;
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
		className: "desk-scroll-x shrink-0 -mx-3 px-3",
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
	useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"data-symbol": asset.symbol,
			onClick: () => onSelect(asset.symbol),
			className: cn("flex h-14 w-[7.25rem] items-center gap-2 rounded-xl px-2.5 text-left shadow-[var(--shadow-border)] sm:h-16 sm:w-32", active ? "bg-elevated" : "bg-surface"),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerMark, {
				symbol: asset.symbol,
				className: "size-8"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 flex-1 flex-col justify-center gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-2xs font-medium tracking-wide",
					children: assetLabel(asset.symbol)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChipPx, {
					symbol: asset.symbol,
					open: asset.open,
					fallback: asset.livePx || asset.price,
					livePx: asset.livePx
				})]
			})]
		})
	});
});
function LiveChipPx({ symbol, open, fallback, livePx }) {
	const px = useMark(symbol) || livePx || fallback;
	const chg = changePct(px, open);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "truncate font-mono text-2xs tabular-nums",
		children: px ? chipPrice(px) : "—"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `font-mono text-3xs tabular-nums ${px ? signedClass(chg) : "text-subtle"}`,
		children: px ? pct(chg) : "—"
	})] });
}
var loadDeskBook = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("fe8bb7b7a1cf2d937bc09dfe6254c5720783c76a41ac7b95d1367a7c2a461951"));
var saveDeskBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("c5fd351cdb85b1f38396c6648973f61e8af17062402a3f2cda864a006ff4da33"));
var leaveDeskBook = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("49963a16a27b3dfccf18cc186ff9e37d59eb8f97e8b968c644599faf113c871d"));
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
	const applyLiveMids = useDesk((s) => s.applyLiveMids);
	const applyHeadlines = useDesk((s) => s.applyHeadlines);
	const applyMacro = useDesk((s) => s.applyMacro);
	const setFeed = useDesk((s) => s.setFeed);
	const snapshot = useDesk((s) => s.snapshot);
	const setConvening = useDesk((s) => s.setConvening);
	const setAsking = useDesk((s) => s.setAsking);
	const applyCouncil = useDesk((s) => s.applyCouncil);
	const answerAsk = useDesk((s) => s.answerAsk);
	const setAgentStatus = useDesk((s) => s.setAgentStatus);
	const unveilAgent = useDesk((s) => s.unveilAgent);
	const convening = useDesk((s) => s.convening);
	const autopilot = useDesk((s) => s.autopilot);
	const selected = useDesk((s) => s.selected);
	const feed = useFeed();
	const user = useCurrentUser();
	const t = useT();
	const locale = useLocale();
	const mode = useTradingMode((s) => s.mode);
	const [tab, setTab] = (0, import_react.useState)("market");
	const [side, setSide] = (0, import_react.useState)("floor");
	const [bootHold, setBootHold] = (0, import_react.useState)(true);
	const [modeFlash, setModeFlash] = (0, import_react.useState)(null);
	const prevMode = (0, import_react.useRef)(mode);
	const desktop = useDesktop();
	const synced = (0, import_react.useRef)(false);
	const saving = (0, import_react.useRef)(false);
	const syncing = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		const device = getDeviceToken();
		if (!device) return;
		trustThisDevice({ data: { device } }).catch(() => {});
	}, [user]);
	(0, import_react.useEffect)(() => {
		markBootSplash();
		const pulse = window.setInterval(() => {
			const s = useDesk.getState();
			setBootHold(bootSplashHolding(s.hydrated, s.feed));
		}, 250);
		return () => window.clearInterval(pulse);
	}, []);
	(0, import_react.useEffect)(() => {
		if (prevMode.current === mode) return;
		prevMode.current = mode;
		setModeFlash(mode);
		const id = window.setTimeout(() => setModeFlash(null), 1550);
		return () => window.clearTimeout(id);
	}, [mode]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		try {
			if (new URLSearchParams(window.location.search).get("decide") === "1") {
				setTab("floor");
				setSide("floor");
				if (useTradingMode.getState().mode !== "demo") useTradingMode.getState().setMode("demo");
				const url = new URL(window.location.href);
				url.searchParams.delete("decide");
				window.history.replaceState({}, "", url.pathname + url.search + url.hash);
			}
		} catch {}
	}, []);
	(0, import_react.useEffect)(() => {
		if (mode !== "live") return;
		useDesk.getState().setAutopilot(false);
	}, [mode]);
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
			bindTradingMode(user.id);
			bootPromise = Promise.resolve().then(() => Promise.all([useDesk.persist.rehydrate(), useTradingMode.persist.rehydrate()])).then(() => void 0).catch(() => void 0);
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
			useDesk.getState().touchTick();
			saveDeskBook({ data: toDeskBook(useDesk.getState()) }).catch(() => void 0);
		}, 2e4);
		const markAway = () => {
			if (!synced.current) return;
			leaveDeskBook().catch(() => void 0);
		};
		const onVis = () => {
			if (document.visibilityState === "visible") syncBook(true);
			else markAway();
		};
		const onHide = () => markAway();
		document.addEventListener("visibilitychange", onVis);
		window.addEventListener("pagehide", onHide);
		return () => {
			window.clearInterval(beat);
			document.removeEventListener("visibilitychange", onVis);
			window.removeEventListener("pagehide", onHide);
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
		pull();
		const id = window.setInterval(() => void pull(), 12e3);
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
		async function pullMids() {
			if (inFlight || document.hidden) return;
			inFlight = true;
			try {
				const res = await fetchLiveMids();
				if (!live) return;
				if (res.ok) applyLiveMids(res.mids);
			} catch {} finally {
				inFlight = false;
			}
		}
		pullMids();
		const id = window.setInterval(() => void pullMids(), 800);
		return () => {
			live = false;
			window.clearInterval(id);
		};
	}, [hydrated, applyLiveMids]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		let live = true;
		let inFlight = false;
		async function pullWire() {
			if (inFlight || document.hidden) return;
			inFlight = true;
			try {
				const [news, macro] = await Promise.all([fetchLiveNews(), fetchLiveMacro()]);
				if (!live) return;
				if (news.ok) applyHeadlines(news.headlines);
				if (macro.ok) applyMacro(macro.macro);
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
	}, [
		hydrated,
		applyHeadlines,
		applyMacro
	]);
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
		const selected = useDesk.getState().selected;
		let result;
		let source = "ai";
		try {
			const res = await conveneCouncil({ data: {
				snap,
				selected,
				locale
			} });
			if (res.ok) result = res.result;
			else {
				result = runLocalV2({
					snap,
					selected,
					locale
				});
				source = "local";
			}
		} catch {
			result = runLocalV2({
				snap,
				selected,
				locale
			});
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
			if (result.order) toast.success(t("toast.councilClosed"));
			else toast.message(t("toast.councilLocal"));
		} catch {
			setConvening(false);
			toast.error(t("toast.councilStalled"));
		}
	}
	const conveneRef = (0, import_react.useRef)(convene);
	conveneRef.current = convene;
	(0, import_react.useEffect)(() => {
		if (!hydrated || !autopilot) return;
		let live = true;
		const kick = () => {
			const s = useDesk.getState();
			if (!live || !s.autopilot || s.paused || s.convening) return;
			if (useTradingMode.getState().mode === "live") return;
			if (Date.now() - s.lastAutoAt < 9e4 && s.lastCouncil) return;
			conveneRef.current();
		};
		const soon = window.setTimeout(kick, 1200);
		const id = window.setInterval(kick, 2e4);
		return () => {
			live = false;
			window.clearTimeout(soon);
			window.clearInterval(id);
		};
	}, [hydrated, autopilot]);
	async function ask(question) {
		if (useDesk.getState().asking) return;
		setAsking(true, question);
		const snap = snapshot();
		const state = useDesk.getState();
		const recentFills = state.fills.slice(0, 6).map((f) => ({
			symbol: f.symbol,
			side: f.side,
			qty: f.qty,
			price: f.price,
			note: f.note,
			source: f.source
		}));
		try {
			const res = await Promise.race([askFloor({ data: {
				question,
				snap,
				selected: state.selected,
				lastCouncil: state.lastCouncil,
				lastAsk: state.lastAsk,
				recentFills,
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
			const fallback = localAsk(question, snap, locale, {
				lastCouncil: state.lastCouncil,
				recentFills
			});
			answerAsk(question, fallback, "local");
			toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
		} catch {
			const fallback = localAsk(question, snap, locale, {
				lastCouncil: state.lastCouncil,
				recentFills
			});
			answerAsk(question, fallback, "local");
			toast.message(t("toast.localDesk", { name: AGENT_BY_ID[fallback.speaker].name }));
		} finally {
			setAsking(false);
		}
	}
	const showSplash = bootHold || !hydrated || feed === "idle";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-selected": selected,
		"data-mode": mode,
		className: "desk-wash relative flex h-dvh flex-col overflow-hidden",
		children: [
			showSplash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeoffSplash, {
				overlay: true,
				cycle: true
			}) : null,
			!showSplash && modeFlash ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeoffSplash, {
				overlay: true,
				kind: modeFlash === "live" ? "takeoff" : "landing",
				mode: modeFlash,
				caption: modeFlash === "live" ? t("mode.liveOn") : t("mode.demoOn")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskTour, {
				ready: !showSplash,
				userId: user?.id,
				onOpenSettings: () => {}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskHeader, {
				focusChat: tab === "chat",
				onConvene: convene
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalBanner, {}),
			tab === "chat" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OpenedStrip, {}),
			desktop ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid min-h-0 flex-1 grid-cols-[minmax(11.5rem,14rem)_minmax(0,1fr)_minmax(17rem,20rem)] grid-rows-[minmax(0,1fr)_minmax(9rem,12rem)] gap-2 overflow-hidden p-2 xl:grid-cols-[16.5rem_minmax(0,1fr)_22rem] xl:grid-rows-[minmax(0,1fr)_12rem] xl:gap-3 xl:p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "row-span-2 min-h-0 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Watchlist, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketDesk, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "row-span-2 min-h-0 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
							value: side,
							onValueChange: (v) => setSide(v),
							className: "flex h-full min-h-0 flex-col gap-2 xl:gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "w-full shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "floor",
										className: "min-w-0 px-1 text-2xs leading-tight sm:text-xs",
										children: t("nav.floor")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "portfolio",
										className: "min-w-0 px-1 text-2xs leading-tight sm:text-xs",
										children: t("nav.portfolio")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "history",
										className: "min-w-0 px-1 text-2xs leading-tight sm:text-xs",
										children: t("nav.history")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "chat",
										className: "min-w-0 px-1 text-2xs leading-tight sm:text-xs",
										children: t("floor.chat")
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-h-0 flex-1 overflow-hidden",
								children: side === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouncilPanel, { onConvene: convene }) : side === "portfolio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPanel, {}) : side === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPane, { onAsk: ask })
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TapePanel, {})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-3 pt-2 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))]",
				children: [
					tab === "market" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-h-0 flex-1 flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TickerStrip, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
							className: "flex min-h-0 flex-1 flex-col overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketDesk, {})
						})]
					}) : null,
					tab === "portfolio" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PortfolioPanel, {})
					}) : null,
					tab === "history" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPanel, {})
					}) : null,
					tab === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouncilPanel, { onConvene: convene })
					}) : null,
					tab === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "min-h-0 flex-1 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPane, { onAsk: ask })
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom,0px)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid grid-cols-5",
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
							"history",
							t("nav.history"),
							History
						],
						[
							"floor",
							t("nav.floor"),
							Users
						],
						[
							"chat",
							t("floor.chat"),
							MessageSquare
						]
					].map(([id, label, Icon]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setTab(id),
						className: cn("flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 py-2 text-center text-2xs font-medium leading-tight", tab === id ? "text-fg" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-full",
							children: label
						})]
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
	const boot = Route.useLoaderData();
	const { user, isPending } = useCurrentUserState();
	if (isPending) {
		markBootSplash();
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TakeoffSplash, { cycle: true });
	}
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskApp, { boot });
}
//#endregion
export { Home as component };
