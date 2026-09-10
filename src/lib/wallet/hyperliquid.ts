import { createServerFn } from "@tanstack/react-start";
import { clientIp, rateLimit } from "@/lib/security/limit";
import type { ClosedTrade } from "@/lib/types";

export type PerpRoute = { coin: string; dex: "" | "xyz"; scale?: number };

export const DESK_TO_PERP: Record<string, PerpRoute> = {
  BTC: { coin: "BTC", dex: "" },
  ETH: { coin: "ETH", dex: "" },
  NVDA: { coin: "xyz:NVDA", dex: "xyz" },
  AAPL: { coin: "xyz:AAPL", dex: "xyz" },
  TSLA: { coin: "xyz:TSLA", dex: "xyz" },
  MSFT: { coin: "xyz:MSFT", dex: "xyz" },
  AMZN: { coin: "xyz:AMZN", dex: "xyz" },
  META: { coin: "xyz:META", dex: "xyz" },
  /** xyz:SP500 is the index (~10× the ETF). livePx = mid / 10. */
  SPY: { coin: "xyz:SP500", dex: "xyz", scale: 10 },
  GOLD: { coin: "xyz:GOLD", dex: "xyz" },
  SILVER: { coin: "xyz:SILVER", dex: "xyz" },
};

export function deskFromHlMid(symbol: string, rawMid: number): number {
  const scale = DESK_TO_PERP[symbol]?.scale ?? 1;
  return rawMid / scale;
}

/** HL contract size for a desk qty (SPY ETF share → SPX perp units). */
export function hlQtyFromDesk(symbol: string, deskQty: number): number {
  const scale = DESK_TO_PERP[symbol]?.scale ?? 1;
  return deskQty * scale;
}

const MIDS_MS = 400;
let midsCache: { at: number; mids: Record<string, { mid: number; coin: string }> } | null = null;
let midsInflight: Promise<Record<string, { mid: number; coin: string }>> | null = null;

export async function loadDeskMids(): Promise<Record<string, { mid: number; coin: string }>> {
  const now = Date.now();
  if (midsCache && now - midsCache.at < MIDS_MS) return midsCache.mids;
  if (midsInflight) return midsInflight;
  midsInflight = (async () => {
    const out: Record<string, { mid: number; coin: string }> = {};
    try {
      const [core, xyz] = await Promise.all([
        hlInfo({ type: "allMids" }),
        hlInfo({ type: "allMids", dex: "xyz" }),
      ]);
      const coreBook = (core ?? {}) as Record<string, string>;
      const xyzBook = (xyz ?? {}) as Record<string, string>;
      for (const [desk, row] of Object.entries(DESK_TO_PERP)) {
        const raw = Number((row.dex === "xyz" ? xyzBook : coreBook)[row.coin]);
        if (!Number.isFinite(raw) || raw <= 0) continue;
        out[desk] = { mid: deskFromHlMid(desk, raw), coin: row.coin };
      }
    } catch {
      /* tape still runs on Yahoo */
    }
    midsCache = { at: Date.now(), mids: Object.keys(out).length ? out : (midsCache?.mids ?? out) };
    return midsCache.mids;
  })().finally(() => {
    midsInflight = null;
  });
  return midsInflight;
}

export async function loadHlCandles(
  hours = 3,
): Promise<Record<string, Array<{ t: number; px: number; v?: number }>>> {
  const now = Date.now();
  const startTime = now - hours * 60 * 60 * 1000;
  const out: Record<string, Array<{ t: number; px: number; v?: number }>> = {};
  await Promise.all(
    Object.entries(DESK_TO_PERP).map(async ([desk, row]) => {
      try {
        const raw = await hlInfo({
          type: "candleSnapshot",
          req: { coin: row.coin, interval: "1m", startTime, endTime: now },
        });
        if (!Array.isArray(raw)) return;
        const scale = row.scale ?? 1;
        const series: Array<{ t: number; px: number; v?: number; o?: number; h?: number; l?: number }> = [];
        for (const bar of raw) {
          const r = bar as {
            t?: number;
            c?: string | number;
            o?: string | number;
            h?: string | number;
            l?: string | number;
            v?: string | number;
          };
          const t = Number(r.t);
          const px = Number(r.c) / scale;
          const v = Number(r.v);
          const o = Number(r.o) / scale;
          const h = Number(r.h) / scale;
          const l = Number(r.l) / scale;
          if (Number.isFinite(t) && Number.isFinite(px) && px > 0) {
            const row: { t: number; px: number; v?: number; o?: number; h?: number; l?: number } = { t, px };
            if (Number.isFinite(v) && v > 0) row.v = v;
            if (Number.isFinite(o) && o > 0) row.o = o;
            if (Number.isFinite(h) && h > 0) row.h = h;
            if (Number.isFinite(l) && l > 0) row.l = l;
            series.push(row);
          }
        }
        if (series.length >= 12) out[desk] = series.slice(-90);
      } catch {
        /* Yahoo still fills the chart */
      }
    }),
  );
  return out;
}

export type LivePerp = {
  coin: string;
  desk?: string;
  qty: number;
  pnl: number;
  value: number;
  leverage: number | null;
};

export type LiveWalletTokens = {
  eth: number;
  arbEth: number;
  usdcEth: number;
  usdcArb: number;
  usdcArbE: number;
  wbtc: number;
};

export type LivePerpsAccount = {
  address: string;
  equity: number;
  withdrawable: number;
  hlSpotUsdc: number;
  depositGasEth: number;
  wallet: LiveWalletTokens;
  positions: LivePerp[];
  closed: ClosedTrade[];
};

type Clearinghouse = {
  marginSummary?: { accountValue?: string };
  withdrawable?: string;
  assetPositions?: Array<{
    position?: {
      coin?: string;
      szi?: string;
      unrealizedPnl?: string;
      positionValue?: string;
      leverage?: { value?: number } | number;
    };
  }>;
};

const HL = "https://api.hyperliquid.xyz/info";
const ETH_RPC = "https://ethereum.publicnode.com";
const ARB_RPC = "https://arb1.arbitrum.io/rpc";
const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const USDC_ARB = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
const USDC_ARB_E = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";
const WBTC_ETH = "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599";

async function hlInfo(body: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(HL, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`Hyperliquid ${res.status}`);
  return res.json();
}

async function rpc(url: string, method: string, params: unknown[]): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) throw new Error(`rpc ${res.status}`);
  const body = (await res.json()) as { result?: string; error?: { message?: string } };
  if (!body.result) throw new Error(body.error?.message ?? "rpc empty");
  return body.result;
}

function num(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fromWei(hex: string, decimals: number) {
  try {
    return Number(BigInt(hex)) / 10 ** decimals;
  } catch {
    return 0;
  }
}

function padAddr(addr: string) {
  return addr.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}

async function erc20(url: string, token: string, user: string, decimals: number) {
  return fromWei(
    await rpc(url, "eth_call", [{ to: token, data: `0x70a08231${padAddr(user)}` }, "latest"]),
    decimals,
  );
}

async function native(url: string, user: string) {
  return fromWei(await rpc(url, "eth_getBalance", [user, "latest"]), 18);
}

function parseBook(raw: unknown, deskByCoin: Map<string, string>) {
  const o = (raw ?? {}) as Clearinghouse;
  const positions: LivePerp[] = [];
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
      leverage: typeof lev === "number" ? lev : typeof lev?.value === "number" ? lev.value : null,
    });
  }
  return {
    equity: num(o.marginSummary?.accountValue),
    withdrawable: num(o.withdrawable),
    positions,
  };
}

function hlSpotUsdc(raw: unknown) {
  const balances = (raw as { balances?: Array<{ coin?: string; total?: string }> } | null)?.balances ?? [];
  return num(balances.find((r) => r.coin === "USDC")?.total);
}

function closedFromFills(raw: unknown, deskByCoin: Map<string, string>): ClosedTrade[] {
  if (!Array.isArray(raw)) return [];
  const rows = [...raw].sort((a, b) => num((a as { time?: number }).time) - num((b as { time?: number }).time));
  const lastOpen = new Map<string, { ts: number; px: number }>();
  const out: ClosedTrade[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const r = row as {
      coin?: string;
      px?: string | number;
      sz?: string | number;
      closedPnl?: string | number;
      dir?: string;
      time?: number;
      tid?: number | string;
      hash?: string;
    };
    const coin = String(r.coin ?? "");
    const dir = String(r.dir ?? "");
    const ts = Number(r.time) || 0;
    const rawPx = num(r.px);
    if (/open/i.test(dir) && rawPx > 0) {
      lastOpen.set(coin, { ts, px: rawPx });
      continue;
    }
    const pnl = num(r.closedPnl);
    if (!pnl || !/close/i.test(dir)) continue;
    const desk = deskByCoin.get(coin) ?? coin.replace(/^xyz:/i, "") ?? coin;
    const scale = DESK_TO_PERP[desk]?.scale ?? 1;
    const open = lastOpen.get(coin);
    const id = `hl-${String(r.tid ?? r.hash ?? `${coin}-${ts}`)}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      ts,
      symbol: desk,
      pnl,
      side: /short/i.test(dir) ? "short" : "long",
      qty: num(r.sz) / scale || undefined,
      entry: open ? open.px / scale : undefined,
      exit: rawPx / scale || undefined,
      openedAt: open?.ts || undefined,
      closeNote: "close.hyperliquid",
    });
    lastOpen.delete(coin);
  }
  return out.sort((a, b) => b.ts - a.ts).slice(0, 120);
}

export const loadPerpsAccount = createServerFn({ method: "POST" })
  .validator((input: { address: string }) => input)
  .handler(async ({ data }): Promise<{ ok: true; account: LivePerpsAccount } | { ok: false; error: string }> => {
    const address = data.address.trim().toLowerCase();
    if (!/^0x[a-f0-9]{40}$/.test(address)) return { ok: false, error: "Need a 0x address." };
    const ip = await clientIp();
    if (!rateLimit(`hl:${ip}`, 20, 60_000)) return { ok: false, error: "Slow down." };
    const g = globalThis as typeof globalThis & {
      __zwHlCache?: Map<string, { at: number; account: LivePerpsAccount }>;
    };
    g.__zwHlCache ??= new Map();
    const hit = g.__zwHlCache.get(address);
    if (hit && Date.now() - hit.at < 20_000) return { ok: true, account: hit.account };
    try {
      const deskByCoin = new Map(Object.entries(DESK_TO_PERP).map(([desk, row]) => [row.coin, desk]));
      const startTime = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const settled = await Promise.allSettled([
        hlInfo({ type: "clearinghouseState", user: address }),
        hlInfo({ type: "clearinghouseState", user: address, dex: "xyz" }),
        hlInfo({ type: "spotClearinghouseState", user: address }),
        native(ETH_RPC, address),
        erc20(ETH_RPC, USDC_ETH, address, 6),
        erc20(ETH_RPC, WBTC_ETH, address, 8),
        native(ARB_RPC, address),
        erc20(ARB_RPC, USDC_ARB, address, 6),
        erc20(ARB_RPC, USDC_ARB_E, address, 6),
        rpc(ARB_RPC, "eth_gasPrice", []),
        hlInfo({ type: "userFillsByTime", user: address, startTime }),
        hlInfo({ type: "userFillsByTime", user: address, startTime, dex: "xyz" }),
      ]);
      const val = <T>(i: number, fallback: T): T =>
        settled[i]?.status === "fulfilled" ? (settled[i] as PromiseFulfilledResult<T>).value : fallback;
      const a = parseBook(val(0, {}), deskByCoin);
      const b = parseBook(val(1, {}), deskByCoin);
      const eth = val(3, 0);
      const usdcEth = val(4, 0);
      const gasHex = val(9, "0x0");
      let depositGasEth = 2e-5;
      try {
        depositGasEth = Number(BigInt(gasHex)) * 8e4 / 1e18;
      } catch {
        /* keep pad */
      }
      const fillsCore = val<unknown>(10, []);
      const fillsXyz = val<unknown>(11, []);
      const account = {
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
            wbtc: val(5, 0),
          },
          positions: [...a.positions, ...b.positions],
          closed: closedFromFills(
            [...(Array.isArray(fillsCore) ? fillsCore : []), ...(Array.isArray(fillsXyz) ? fillsXyz : [])],
            deskByCoin,
          ),
        };
      g.__zwHlCache.set(address, { at: Date.now(), account });
      return { ok: true, account };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Hyperliquid quiet" };
    }
  });
