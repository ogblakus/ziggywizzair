export type AssetClass = "equity" | "index" | "crypto" | "metal";

export type UniverseTicker = {
  symbol: string;
  name: string;
  cls: AssetClass;
  yahoo: string;
  vol: number;
  beta: number;
};

export const UNIVERSE: UniverseTicker[] = [
  { symbol: "BTC", name: "Bitcoin", cls: "crypto", yahoo: "BTC-USD", vol: 0.028, beta: 1.7 },
  { symbol: "ETH", name: "Ether", cls: "crypto", yahoo: "ETH-USD", vol: 0.032, beta: 1.85 },
  { symbol: "GOLD", name: "Gold", cls: "metal", yahoo: "GC=F", vol: 0.009, beta: 0.25 },
  { symbol: "SILVER", name: "Silver", cls: "metal", yahoo: "SI=F", vol: 0.016, beta: 0.45 },
  { symbol: "SPY", name: "S&P 500", cls: "index", yahoo: "SPY", vol: 0.007, beta: 1 },
  { symbol: "NVDA", name: "NVIDIA", cls: "equity", yahoo: "NVDA", vol: 0.018, beta: 1.45 },
  { symbol: "AAPL", name: "Apple", cls: "equity", yahoo: "AAPL", vol: 0.011, beta: 1.05 },
  { symbol: "TSLA", name: "Tesla", cls: "equity", yahoo: "TSLA", vol: 0.024, beta: 1.55 },
  { symbol: "MSFT", name: "Microsoft", cls: "equity", yahoo: "MSFT", vol: 0.01, beta: 0.95 },
  { symbol: "AMZN", name: "Amazon", cls: "equity", yahoo: "AMZN", vol: 0.013, beta: 1.15 },
  { symbol: "META", name: "Meta", cls: "equity", yahoo: "META", vol: 0.016, beta: 1.25 },
];

export const STARTING_CASH = 100_000;

export function isCrypto(symbol: string) {
  return UNIVERSE.find((t) => t.symbol === symbol)?.cls === "crypto";
}

export function isLot(symbol: string) {
  const cls = UNIVERSE.find((t) => t.symbol === symbol)?.cls;
  return cls === "crypto" || cls === "metal";
}

const YAHOO_ALIAS: Record<string, string> = {
  "GC=F": "GOLD",
  GLD: "GOLD",
  "XAUUSD=X": "GOLD",
  XAU: "GOLD",
  "SI=F": "SILVER",
  SLV: "SILVER",
  "XAGUSD=X": "SILVER",
  XAG: "SILVER",
  "BTC-USD": "BTC",
  "ETH-USD": "ETH",
};

export function deskSymbol(raw: string | undefined | null): string | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  if (UNIVERSE.some((u) => u.symbol === upper)) return upper;
  return YAHOO_ALIAS[upper];
}
