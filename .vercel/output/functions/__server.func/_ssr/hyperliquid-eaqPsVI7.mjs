import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hyperliquid-eaqPsVI7.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
function deskFromHlMid(symbol, rawMid) {
	return rawMid / (DESK_TO_PERP[symbol]?.scale ?? 1);
}
async function loadDeskMids() {
	const out = {};
	try {
		const [core, xyz] = await Promise.all([hlInfo({ type: "allMids" }), hlInfo({
			type: "allMids",
			dex: "xyz"
		})]);
		const coreBook = core ?? {};
		const xyzBook = xyz ?? {};
		for (const [desk, row] of Object.entries(DESK_TO_PERP)) {
			const raw = Number((row.dex === "xyz" ? xyzBook : coreBook)[row.coin]);
			if (!Number.isFinite(raw) || raw <= 0) continue;
			out[desk] = {
				mid: deskFromHlMid(desk, raw),
				coin: row.coin
			};
		}
	} catch {}
	return out;
}
var HL = "https://api.hyperliquid.xyz/info";
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
var loadPerpsAccount = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("a83e9bb6d0e06e1153b552bd181a1f80edfd03abae9934fe7770ae473ebe348b"));
//#endregion
export { loadPerpsAccount as i, createSsrRpc as n, loadDeskMids as r, DESK_TO_PERP as t };
