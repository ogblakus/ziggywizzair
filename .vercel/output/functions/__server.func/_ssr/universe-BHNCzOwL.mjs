//#region node_modules/.nitro/vite/services/ssr/assets/universe-BHNCzOwL.js
var UNIVERSE = [
	{
		symbol: "BTC",
		name: "Bitcoin",
		cls: "crypto",
		yahoo: "BTC-USD",
		vol: .028,
		beta: 1.7
	},
	{
		symbol: "ETH",
		name: "Ether",
		cls: "crypto",
		yahoo: "ETH-USD",
		vol: .032,
		beta: 1.85
	},
	{
		symbol: "GOLD",
		name: "Gold",
		cls: "metal",
		yahoo: "GC=F",
		vol: .009,
		beta: .25
	},
	{
		symbol: "SILVER",
		name: "Silver",
		cls: "metal",
		yahoo: "SI=F",
		vol: .016,
		beta: .45
	},
	{
		symbol: "SPY",
		name: "S&P 500",
		cls: "index",
		yahoo: "SPY",
		vol: .007,
		beta: 1
	},
	{
		symbol: "NVDA",
		name: "NVIDIA",
		cls: "equity",
		yahoo: "NVDA",
		vol: .018,
		beta: 1.45
	},
	{
		symbol: "AAPL",
		name: "Apple",
		cls: "equity",
		yahoo: "AAPL",
		vol: .011,
		beta: 1.05
	},
	{
		symbol: "TSLA",
		name: "Tesla",
		cls: "equity",
		yahoo: "TSLA",
		vol: .024,
		beta: 1.55
	},
	{
		symbol: "MSFT",
		name: "Microsoft",
		cls: "equity",
		yahoo: "MSFT",
		vol: .01,
		beta: .95
	},
	{
		symbol: "AMZN",
		name: "Amazon",
		cls: "equity",
		yahoo: "AMZN",
		vol: .013,
		beta: 1.15
	},
	{
		symbol: "META",
		name: "Meta",
		cls: "equity",
		yahoo: "META",
		vol: .016,
		beta: 1.25
	}
];
var STARTING_CASH = 1e5;
function sectorOf(symbol) {
	const cls = UNIVERSE.find((t) => t.symbol === symbol)?.cls;
	if (cls === "crypto") return "crypto";
	if (cls === "metal") return "metals";
	return "equities";
}
function isLot(symbol) {
	const cls = UNIVERSE.find((t) => t.symbol === symbol)?.cls;
	return cls === "crypto" || cls === "metal";
}
var YAHOO_ALIAS = {
	"GC=F": "GOLD",
	GLD: "GOLD",
	"XAUUSD=X": "GOLD",
	XAU: "GOLD",
	"SI=F": "SILVER",
	SLV: "SILVER",
	"XAGUSD=X": "SILVER",
	XAG: "SILVER",
	"BTC-USD": "BTC",
	"ETH-USD": "ETH"
};
function deskSymbol(raw) {
	if (!raw) return void 0;
	const upper = raw.toUpperCase();
	if (UNIVERSE.some((u) => u.symbol === upper)) return upper;
	return YAHOO_ALIAS[upper];
}
//#endregion
export { sectorOf as a, isLot as i, UNIVERSE as n, deskSymbol as r, STARTING_CASH as t };
