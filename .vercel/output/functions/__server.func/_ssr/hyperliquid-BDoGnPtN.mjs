import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hyperliquid-BDoGnPtN.js
var DESK_TO_PERP = {
	BTC: {
		coin: "BTC",
		dex: ""
	},
	ETH: {
		coin: "ETH",
		dex: ""
	},
	NVDA: {
		coin: "xyz:NVDA",
		dex: "xyz"
	},
	AAPL: {
		coin: "xyz:AAPL",
		dex: "xyz"
	},
	TSLA: {
		coin: "xyz:TSLA",
		dex: "xyz"
	},
	MSFT: {
		coin: "xyz:MSFT",
		dex: "xyz"
	},
	AMZN: {
		coin: "xyz:AMZN",
		dex: "xyz"
	},
	META: {
		coin: "xyz:META",
		dex: "xyz"
	},
	/** xyz:SP500 is the index (~10× the ETF). livePx = mid / 10. */
	SPY: {
		coin: "xyz:SP500",
		dex: "xyz",
		scale: 10
	},
	GOLD: {
		coin: "xyz:GOLD",
		dex: "xyz"
	},
	SILVER: {
		coin: "xyz:SILVER",
		dex: "xyz"
	}
};
var HL = "https://api.hyperliquid.xyz/info";
var ETH_RPC = "https://ethereum.publicnode.com";
var ARB_RPC = "https://arb1.arbitrum.io/rpc";
var USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
var USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
var USDC_ARB_E = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
var WBTC_ETH = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";
async function hlInfo(body) {
	const res = await fetch(HL, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error(`Hyperliquid ${res.status}`);
	return res.json();
}
async function rpc(url, method, params) {
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			jsonrpc: "2.0",
			id: 1,
			method,
			params
		}),
		signal: AbortSignal.timeout(8e3)
	});
	if (!res.ok) throw new Error(`rpc ${res.status}`);
	const body = await res.json();
	if (!body.result) throw new Error(body.error?.message ?? "rpc empty");
	return body.result;
}
function num(v) {
	const n = typeof v === "number" ? v : Number(v);
	return Number.isFinite(n) ? n : 0;
}
function fromWei(hex, decimals) {
	try {
		return Number(BigInt(hex)) / 10 ** decimals;
	} catch {
		return 0;
	}
}
function padAddr(addr) {
	return addr.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}
async function erc20(url, token, user, decimals) {
	return fromWei(await rpc(url, "eth_call", [{
		to: token,
		data: `0x70a08231${padAddr(user)}`
	}, "latest"]), decimals);
}
async function native(url, user) {
	return fromWei(await rpc(url, "eth_getBalance", [user, "latest"]), 18);
}
function parseBook(raw, deskByCoin) {
	const o = raw ?? {};
	const positions = [];
	for (const row of o.assetPositions ?? []) {
		const p = row.position;
		if (!p?.coin) continue;
		const qty = num(p.szi);
		if (!qty) continue;
		const lev = p.leverage;
		positions.push({
			coin: p.coin,
			desk: deskByCoin.get(p.coin),
			qty,
			pnl: num(p.unrealizedPnl),
			value: num(p.positionValue),
			leverage: typeof lev === "number" ? lev : typeof lev?.value === "number" ? lev.value : null
		});
	}
	return {
		equity: num(o.marginSummary?.accountValue),
		withdrawable: num(o.withdrawable),
		positions
	};
}
function hlSpotUsdc(raw) {
	return num((raw?.balances ?? []).find((r) => r.coin === "USDC")?.total);
}
var loadPerpsAccount_createServerFn_handler = createServerRpc({
	id: "a83e9bb6d0e06e1153b552bd181a1f80edfd03abae9934fe7770ae473ebe348b",
	name: "loadPerpsAccount",
	filename: "src/lib/wallet/hyperliquid.ts"
}, (opts) => loadPerpsAccount.__executeServer(opts));
var loadPerpsAccount = createServerFn({ method: "POST" }).validator((input) => input).handler(loadPerpsAccount_createServerFn_handler, async ({ data }) => {
	const address = data.address.trim().toLowerCase();
	if (!/^0x[a-f0-9]{40}$/.test(address)) return {
		ok: false,
		error: "Need a 0x address."
	};
	try {
		const deskByCoin = new Map(Object.entries(DESK_TO_PERP).map(([desk, row]) => [row.coin, desk]));
		const settled = await Promise.allSettled([
			hlInfo({
				type: "clearinghouseState",
				user: address
			}),
			hlInfo({
				type: "clearinghouseState",
				user: address,
				dex: "xyz"
			}),
			hlInfo({
				type: "spotClearinghouseState",
				user: address
			}),
			native(ETH_RPC, address),
			erc20(ETH_RPC, USDC_ETH, address, 6),
			erc20(ETH_RPC, WBTC_ETH, address, 8),
			native(ARB_RPC, address),
			erc20(ARB_RPC, USDC_ARB, address, 6),
			erc20(ARB_RPC, USDC_ARB_E, address, 6),
			rpc(ARB_RPC, "eth_gasPrice", [])
		]);
		const val = (i, fallback) => settled[i]?.status === "fulfilled" ? settled[i].value : fallback;
		const a = parseBook(val(0, {}), deskByCoin);
		const b = parseBook(val(1, {}), deskByCoin);
		const eth = val(3, 0);
		const usdcEth = val(4, 0);
		const gasHex = val(9, "0x0");
		let depositGasEth = 2e-5;
		try {
			depositGasEth = Number(BigInt(gasHex)) * 8e4 / 0xde0b6b3a7640000;
		} catch {}
		return {
			ok: true,
			account: {
				address,
				equity: a.equity + b.equity,
				withdrawable: a.withdrawable + b.withdrawable,
				hlSpotUsdc: hlSpotUsdc(val(2, {})),
				depositGasEth,
				wallet: {
					eth,
					arbEth: val(6, 0),
					usdcEth,
					usdcArb: val(7, 0),
					usdcArbE: val(8, 0),
					wbtc: val(5, 0)
				},
				positions: [...a.positions, ...b.positions]
			}
		};
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Hyperliquid quiet"
		};
	}
});
//#endregion
export { loadPerpsAccount_createServerFn_handler };
