import type { AgentId, Vote } from "@/lib/agents/personas";

export type Side = "buy" | "sell";

export type TickBar = {
  t: number;
  px: number;
  o?: number;
  h?: number;
  l?: number;
  v?: number;
};

export type SetupTf = "15m" | "1h" | "4h";

export type SessionName = "lon" | "ny" | "tyo" | "utc";
export type SessionPrint = {
  name: SessionName;
  kind: "grab-down" | "grab-up";
  pct: number;
};

export type HtfPack = {
  m15: TickBar[];
  h1: TickBar[];
  h4: TickBar[];
};

export type MarketAsset = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  series: TickBar[];
  /** Chart-only 5m bars (90 × 5m = 450 min). Agents ignore this. */
  chart5?: TickBar[];
  /** Higher-TF candles for agents. Charts keep `series` (1m). */
  htf?: HtfPack;
  vol: number;
  beta: number;
  /** Desk mark: Hyperliquid mid when the tape is live, else Yahoo. */
  livePx: number | null;
  liveCoin: string | null;
  /** Yahoo last print — basis vs HL (bps). */
  spotPx: number | null;
  tape: "hl" | "yahoo";
};

export type Position = {
  symbol: string;
  qty: number;
  avg: number;
  openedAt?: number;
  entryNote?: string;
  /** When true, the team cannot close or add. Manual opens default to locked. */
  teamLock?: boolean;
  /** Cumulative Hyperliquid-style fees paid while this name is open. */
  fees?: number;
  /** Absolute stop-loss price. */
  stopLoss?: number | null;
  /** Absolute take-profit price. */
  takeProfit?: number | null;
};

export type AgentCall = {
  id: string;
  ts: number;
  agentId: Exclude<AgentId, "iris">;
  symbol: string;
  side: Side;
  entry: number;
  qty: number;
  fillId: string;
  open: boolean;
  mark1h?: number;
  pnl1h?: number;
  closedAt?: number;
  exit?: number;
  pnlPct?: number;
};

export type AgentRecord = {
  id: Exclude<AgentId, "iris">;
  calls: number;
  closed: number;
  wins: number;
  hitRate: number | null;
  avgPnl: number | null;
  last5: Array<{ symbol: string; side: Side; pnlPct: number }>;
  sizeMult: number;
  trusted: boolean;
};

export type Fill = {
  id: string;
  ts: number;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  source: "manual" | "council" | "autopilot";
  note?: string;
  fee?: number;
  feeKind?: "taker" | "maker";
};

export type Headline = {
  id: string;
  ts: number;
  text: string;
  symbol?: string;
  shock: number;
};

export type TapeKind = "news" | "fill" | "agent" | "system";
export type TapeLane = "demo" | "live" | "market";

export type TapeItem = {
  id: string;
  ts: number;
  kind: TapeKind;
  text: string;
  agentId?: AgentId;
  symbol?: string;
  /** demo = paper book, live = real wallet, market = shared news/prices. Legacy rows = demo. */
  lane?: TapeLane;
};

export type AgentSpeech = {
  id: AgentId;
  status: "idle" | "reading" | "spoken";
  thesis: string;
  vote: Vote;
  symbol: string | null;
  conviction: number;
};

export type ProposedOrder = {
  side: Side;
  symbol: string;
  qty: number;
  rationale: string;
  limitPx?: number;
  proposedAt?: number;
};

export type Stance = "bullish" | "bearish" | "neutral";
export type SectorId = "equities" | "crypto" | "metals" | "dollar" | "vol";
export type SectorCall = { id: SectorId; stance: Stance; why: string };
export type SentimentReport = {
  summary: string;
  sectors: SectorCall[];
};

export type CouncilResult = {
  mood: "risk-on" | "cautious" | "risk-off";
  summary: string;
  agents: Array<{
    id: AgentId;
    thesis: string;
    vote: Vote;
    symbol: string | null;
    conviction: number;
    sizePct: number;
  }>;
  order: ProposedOrder | null;
  sentiment?: SentimentReport | null;
  agreement?: {
    direction: "buy" | "sell" | "hold";
    level: "high" | "medium" | "low";
    score: number;
  } | null;
  finalScore?: number | null;
  band?: "reject" | "wait" | "small" | "normal" | "high" | null;
  decisionId?: string;
  engineVersion?: string;
  status?: {
    mode: "online" | "degraded";
    sources: Record<AgentId, "llm" | "local" | "rules">;
  };
};

export type TickerSnapshot = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  changePct: number;
  high: number;
  low: number;
  rsi: number;
  vsSma: number;
  livePx: number | null;
  liveBps: number | null;
  buySetup?: "pullback" | "chase" | "none";
  buyLimit?: number;
  sellSetup?: "pullback" | "chase" | "none";
  sellLimit?: number;
  buyRetrace?: number | null;
  sellRetrace?: number | null;
  buyFvg?: { low: number; high: number } | null;
  sellFvg?: { low: number; high: number } | null;
  buyWick?: boolean;
  sellWick?: boolean;
  buyTf?: SetupTf | null;
  sellTf?: SetupTf | null;
  /** Last bar volume vs prior average. Null when the tape has no size. */
  rvol?: number | null;
  /** Sharp print around Lon/NY/Tyo open on 15m, if any. */
  session?: SessionPrint | null;
  /**
   * Phase-1 Alpha Research: Wilder ATR-14 on 15m plus |Δclose|/ATR.
   * Null/omitted when the 15m series is too short. Decision Engine ignores this.
   */
  vol?: {
    method: "wilder";
    period: number;
    tf: "15m";
    atr: number | null;
    atrPct: number | null;
    normalizedMove: number | null;
    signedMove?: number | null;
  } | null;
};

export type MacroTape = {
  vix: number | null;
  vixChg: number | null;
  dxy: number | null;
  dxyChg: number | null;
  cryptoMcap: number | null;
  cryptoMcapPct: number | null;
  equityPct: number | null;
  at: number;
};

export type MarketSnapshot = {
  tickers: TickerSnapshot[];
  headlines: Array<{ text: string; symbol?: string; shock?: number }>;
  book: {
    cash: number;
    equity: number;
    dayPnlPct: number;
    positions: Array<{
      symbol: string;
      qty: number;
      avg: number;
      pnlPct: number;
      teamLock?: boolean;
    }>;
    working?: { side: Side; symbol: string; qty: number; limitPx?: number } | null;
  };
  macro?: MacroTape | null;
  scorecard?: Array<{
    id: AgentId;
    closed: number;
    wins: number;
    hitPct: number | null;
    sizePct: number;
    trusted: boolean;
    last5: Array<{ s: string; pnl: number }>;
    open: Array<{ s: string; side: string; ageMin: number; pnl1h: number | null }>;
  }>;
};

export type AskResult = {
  speaker: AgentId;
  text: string;
};

export type AskTurn = {
  question: string;
  speaker: AgentId;
  text: string;
  ts?: number;
};

export type LastAsk = AskTurn & {
  log?: AskTurn[];
};

export type ClosedTrade = {
  id: string;
  ts: number;
  symbol: string;
  pnl: number;
  side?: "long" | "short";
  qty?: number;
  entry?: number;
  exit?: number;
  openedAt?: number;
  pnlPct?: number;
  source?: Fill["source"];
  entryNote?: string;
  closeNote?: string;
  fees?: number;
  analysis?: string;
  agents?: Array<{ id: AgentId; vote: Vote; thesis: string }>;
};

export type PeriodAnchor = {
  key: string;
  equity: number;
};

export type PeriodAnchors = {
  day: PeriodAnchor;
  week: PeriodAnchor;
  month: PeriodAnchor;
  year: PeriodAnchor;
};
