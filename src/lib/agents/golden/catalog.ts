import type { CouncilResult, MarketSnapshot } from "@/lib/types";
import {
  justAtBand60,
  justBelowBand60,
  longPullback,
  quietTicker,
  riskOnMacro,
  scoutTrustedScorecard,
  shortPullback,
  snap,
  stretchedLong,
  strongCryptoMacro,
  thinPullback,
  flatMacro,
} from "./fixtures.ts";

export type GoldenCoverage = "covered" | "partial" | "missing";

export type GoldenExpect = {
  order: "present" | "absent";
  side?: "buy" | "sell";
  symbol?: string;
  qty?: number;
  qtyPositive?: boolean;
  notSymbol?: string;
  band?: CouncilResult["band"] | Array<NonNullable<CouncilResult["band"]>>;
  minScore?: number;
  maxScore?: number;
  agreement?: NonNullable<CouncilResult["agreement"]>["level"];
  mode?: "degraded";
  agents?: number;
  irisVote?: "buy" | "sell" | "hold";
  irisSizePct?: number;
  vesperVote?: "buy" | "sell" | "hold";
  ashVote?: "buy" | "sell" | "hold";
  kaiVote?: "buy" | "sell" | "hold";
  sources?: Partial<NonNullable<CouncilResult["status"]>["sources"]>;
};

export type GoldenScenario = {
  id: string;
  name: string;
  group: string;
  ready: boolean;
  snap?: () => MarketSnapshot;
  expect?: GoldenExpect;
  coverage?: GoldenCoverage;
  coveredIn?: string;
};

const BTC_LONG = () => longPullback("BTC");
const ETH_SHORT = () => shortPullback("ETH");
const GOLD_LONG = () => longPullback("GOLD");
const SPY_FLAT = () => quietTicker("SPY", { price: 560, changePct: 0.1 });

const LOCAL_FIVE = {
  vesper: "local",
  ash: "local",
  kai: "local",
  damian: "local",
  iris: "rules",
} as const;

/**
 * Golden scenarios 01–37.
 * 01–20: original V2 path (expects strengthened).
 * 21–30: reserved contract/fallback cases — not run here; see `coverage`.
 * 31–37: wait-band, 59/60 boundary, exact risk thresholds.
 */
export const GOLDEN: GoldenScenario[] = [
  {
    id: "01",
    name: "clean aligned BTC long — 4h FVG pullback",
    group: "happy",
    ready: true,
    snap: () => snap([BTC_LONG()]),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      mode: "degraded",
      agents: 5,
    },
  },
  {
    id: "02",
    name: "clean aligned ETH short — 4h FVG pullback",
    group: "happy",
    ready: true,
    snap: () => snap([ETH_SHORT()]),
    expect: {
      order: "present",
      side: "sell",
      symbol: "ETH",
      qtyPositive: true,
      band: "small",
      mode: "degraded",
      agents: 5,
    },
  },
  {
    id: "03",
    name: "scout below lean — no candidate",
    group: "gates",
    ready: true,
    snap: () => snap([quietTicker("BTC")]),
    expect: { order: "absent", agents: 5, mode: "degraded", band: "reject", vesperVote: "hold" },
  },
  {
    id: "04",
    name: "Kai chase blocks new risk",
    group: "gates",
    ready: true,
    snap: () => snap([longPullback("BTC", { buySetup: "chase" })]),
    expect: { order: "absent", agents: 5, kaiVote: "hold", vesperVote: "buy" },
  },
  {
    id: "05",
    name: "Kai thin tape blocks new risk",
    group: "gates",
    ready: true,
    snap: () => snap([thinPullback("BTC")], {}, { macro: strongCryptoMacro() }),
    expect: { order: "absent", agents: 5, kaiVote: "hold", vesperVote: "buy", ashVote: "hold" },
  },
  {
    id: "06",
    name: "existing resting limit blocks a second ticket",
    group: "portfolio",
    ready: true,
    snap: () =>
      snap([BTC_LONG()], {
        working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 3400 },
      }),
    expect: { order: "absent", agents: 5, band: "wait", minScore: 60, vesperVote: "buy", kaiVote: "buy" },
  },
  {
    id: "07",
    name: "stalled long is cut while a resting limit is working",
    group: "portfolio",
    ready: true,
    snap: () =>
      snap(
        [
          longPullback("BTC", {
            changePct: -1.3,
            vsSma: -0.6,
            rsi: 38,
            buySetup: "none",
            buyWick: false,
            sellSetup: "pullback",
            sellLimit: 99_400,
            sellRetrace: 40,
            sellFvg: { low: 99_600, high: 100_200 },
            sellTf: "1h",
            rvol: 1.1,
          }),
        ],
        {
          cash: 50_000,
          positions: [{ symbol: "BTC", qty: 0.4, avg: 110_000, pnlPct: -1.2 }],
          working: { side: "buy", symbol: "ETH", qty: 1, limitPx: 3400 },
        },
      ),
    expect: { order: "present", side: "sell", symbol: "BTC", qty: 0.4, band: "normal" },
  },
  {
    id: "08",
    name: "two open legs block a third name",
    group: "portfolio",
    ready: true,
    snap: () =>
      snap([BTC_LONG(), quietTicker("ETH"), quietTicker("NVDA")], {
        cash: 40_000,
        positions: [
          { symbol: "ETH", qty: 2, avg: 2000, pnlPct: 1 },
          { symbol: "NVDA", qty: 10, avg: 200, pnlPct: 0.4 },
        ],
      }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
  {
    id: "09",
    name: "teamLock blocks new risk on that name",
    group: "portfolio",
    ready: true,
    snap: () =>
      snap([BTC_LONG()], {
        positions: [{ symbol: "BTC", qty: 0.2, avg: 90_000, pnlPct: 1, teamLock: true }],
      }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
  {
    id: "10",
    name: "day drawdown blocks new risk",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { dayPnlPct: -3.1 }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
  {
    id: "11",
    name: "cash below 18% of equity blocks new risk",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { cash: 10_000, equity: 100_000 }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
  {
    id: "12",
    name: "high disagreement — Vesper long vs Ash fade — no ticket",
    group: "gates",
    ready: true,
    snap: () => snap([stretchedLong("BTC")], {}, { scorecard: scoutTrustedScorecard() }),
    expect: {
      order: "absent",
      band: "wait",
      minScore: 60,
      agreement: "low",
      vesperVote: "buy",
      ashVote: "sell",
      kaiVote: "buy",
      irisSizePct: 0,
      agents: 5,
    },
  },
  {
    id: "13",
    name: "Damian bearish crypto does not silence a GOLD pullback",
    group: "sectors",
    ready: true,
    snap: () =>
      snap(
        [
          quietTicker("BTC", { changePct: -2.2, vsSma: -0.5, rsi: 42, rvol: 0.45 }),
          GOLD_LONG(),
          SPY_FLAT(),
        ],
        {},
        {
          macro: riskOnMacro({
            cryptoMcapPct: -3.4,
            dxyChg: -0.5,
            equityPct: 0.05,
          }),
        },
      ),
    expect: {
      order: "present",
      symbol: "GOLD",
      side: "buy",
      notSymbol: "BTC",
      qtyPositive: true,
      band: "small",
    },
  },
  {
    id: "14",
    name: "Kai wait (no pullback, not chase) still cannot invent a ready FVG",
    group: "gates",
    ready: true,
    snap: () =>
      snap([
        longPullback("BTC", {
          buySetup: "none",
          buyLimit: undefined,
          buyFvg: null,
          buyRetrace: null,
          buyTf: "15m",
          buyWick: false,
        }),
      ]),
    expect: { order: "absent", band: "wait" },
  },
  {
    id: "15",
    name: "stalled long is flattened when no resting limit is working",
    group: "cuts",
    ready: true,
    snap: () =>
      snap(
        [
          longPullback("BTC", {
            changePct: -1.4,
            vsSma: -0.7,
            rsi: 36,
            buySetup: "none",
            buyWick: false,
            sellSetup: "pullback",
            sellLimit: 99_400,
            sellRetrace: 38,
            sellFvg: { low: 99_500, high: 100_100 },
            sellTf: "1h",
            rvol: 1.15,
          }),
        ],
        {
          cash: 50_000,
          positions: [{ symbol: "BTC", qty: 0.35, avg: 108_000, pnlPct: -1.1 }],
        },
      ),
    expect: { order: "present", side: "sell", symbol: "BTC", qty: 0.35, band: "normal" },
  },
  {
    id: "16",
    name: "short cover — stalled short is bought back",
    group: "cuts",
    ready: true,
    snap: () =>
      snap(
        [
          shortPullback("BTC", {
            changePct: 1.3,
            vsSma: 0.7,
            rsi: 62,
            sellSetup: "none",
            sellWick: false,
            buySetup: "pullback",
            rvol: 1.1,
          }),
        ],
        {
          cash: 50_000,
          positions: [{ symbol: "BTC", qty: -0.35, avg: 90_000, pnlPct: -1.1 }],
        },
      ),
    expect: { order: "present", side: "buy", symbol: "BTC", qty: 0.35, band: "normal" },
  },
  {
    id: "17",
    name: "adding on an existing BTC long is still one name, not a third leg",
    group: "portfolio",
    ready: true,
    snap: () =>
      snap([BTC_LONG(), quietTicker("ETH")], {
        cash: 70_000,
        positions: [{ symbol: "BTC", qty: 0.2, avg: 95_000, pnlPct: 2.1 }],
      }),
    expect: { order: "present", side: "buy", symbol: "BTC", qtyPositive: true, band: "small" },
  },
  {
    id: "18",
    name: "Local V2 always stamps a five-agent degraded council",
    group: "fallback",
    ready: true,
    snap: () => snap([BTC_LONG()]),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      mode: "degraded",
      agents: 5,
      sources: LOCAL_FIVE,
    },
  },
  {
    id: "19",
    name: "empty tape — five agents, no ticket, no lastCouncil",
    group: "fallback",
    ready: true,
    snap: () => snap([]),
    expect: {
      order: "absent",
      mode: "degraded",
      agents: 5,
      band: "reject",
      sources: LOCAL_FIVE,
    },
  },
  {
    id: "20",
    name: "Iris vote matches the ticket side on a clean long",
    group: "happy",
    ready: true,
    snap: () => snap([BTC_LONG()]),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      irisVote: "buy",
    },
  },

  {
    id: "21",
    name: "Iris cannot raise size above the engine",
    group: "contracts",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 1. Iris cannot raise size",
  },
  {
    id: "22",
    name: "Iris cannot approve an engine reject",
    group: "contracts",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 2. Iris cannot approve an engine reject",
  },
  {
    id: "23",
    name: "LLM does not set quantity",
    group: "contracts",
    ready: false,
    coverage: "partial",
    coveredIn: "contracts.test.ts — 3. qty computed from sizePct (no LLM involved)",
  },
  {
    id: "24",
    name: "Kai Validate cannot flip Decision Engine side",
    group: "contracts",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 9. Kai Validate cannot change the side",
  },
  {
    id: "25",
    name: "unknown symbols are dropped",
    group: "contracts",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 10. unknown symbols are dropped",
  },
  {
    id: "26",
    name: "missing XAI → Local V2",
    group: "fallback",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 12. missing XAI (runOrchestrator, not runLocalV2)",
  },
  {
    id: "27",
    name: "malformed JSON falls back per-agent",
    group: "fallback",
    ready: false,
    coverage: "partial",
    coveredIn: "contracts.test.ts — 13. Vesper only, not Ash/Kai/Damian/Iris",
  },
  {
    id: "28",
    name: "timeout does not kill the council",
    group: "fallback",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 14. timeout / fetch abort",
  },
  {
    id: "29",
    name: "single agent failure → degraded, five agents",
    group: "fallback",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — 11. single agent failure",
  },
  {
    id: "30",
    name: "zero finalSizePct yields no order",
    group: "contracts",
    ready: false,
    coverage: "covered",
    coveredIn: "contracts.test.ts — Iris approve + finalSizePct 0",
  },

  {
    id: "31",
    name: "aligned BTC long, flat Damian — score ~54 wait, zero size, no order",
    group: "bands",
    ready: true,
    snap: () => snap([BTC_LONG()], {}, { macro: flatMacro({ cryptoMcapPct: -0.5 }) }),
    expect: {
      order: "absent",
      band: "wait",
      minScore: 45,
      maxScore: 59,
      agreement: "high",
      vesperVote: "buy",
      kaiVote: "buy",
      ashVote: "hold",
      irisSizePct: 0,
      irisVote: "hold",
      agents: 5,
      mode: "degraded",
    },
  },
  {
    id: "32",
    name: "aligned tape just below 60 — wait, zero size, no order",
    group: "bands",
    ready: true,
    snap: () => snap([justBelowBand60("BTC")]),
    expect: {
      order: "absent",
      band: "wait",
      minScore: 59,
      maxScore: 59.99,
      agreement: "high",
      vesperVote: "buy",
      kaiVote: "buy",
      irisSizePct: 0,
    },
  },
  {
    id: "33",
    name: "aligned tape just at 60 — small, ticket prints",
    group: "bands",
    ready: true,
    snap: () => snap([justAtBand60("BTC")]),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      minScore: 60,
      maxScore: 74.99,
      agreement: "high",
      vesperVote: "buy",
      kaiVote: "buy",
    },
  },
  {
    id: "34",
    name: "day drawdown exactly -2.4% is not blocked (strict <)",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { dayPnlPct: -2.4 }),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      minScore: 60,
    },
  },
  {
    id: "35",
    name: "day drawdown -2.41% blocks new risk",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { dayPnlPct: -2.41 }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
  {
    id: "36",
    name: "cash exactly 18% of equity is not blocked (strict <)",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { cash: 18_000, equity: 100_000 }),
    expect: {
      order: "present",
      side: "buy",
      symbol: "BTC",
      qtyPositive: true,
      band: "small",
      minScore: 60,
    },
  },
  {
    id: "37",
    name: "cash just under 18% of equity blocks new risk",
    group: "portfolio",
    ready: true,
    snap: () => snap([BTC_LONG()], { cash: 17_999, equity: 100_000 }),
    expect: { order: "absent", band: "wait", minScore: 60 },
  },
];

export function readyGoldens(): GoldenScenario[] {
  return GOLDEN.filter((s) => s.ready);
}
