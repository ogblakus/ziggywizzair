/**
 * SQL adapter for research prints. Inject getSql() in production (Neon / PGLite).
 * Tests pass a client. No engine, no paper book, no db module import.
 */
import { FACTOR_WINDOW } from "@/lib/agents/factors";
import {
  type ResearchDiagnostics,
  type ResearchPrint,
  type ResearchStore,
} from "@/lib/agents/research-recorder";

export type ResearchSql = {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

type PrintRow = {
  bar_t: number;
  symbol: string;
  payload: ResearchPrint | string;
};

export function asResearchPrint(raw: unknown): ResearchPrint | null {
  const p = typeof raw === "string" ? (JSON.parse(raw) as ResearchPrint) : (raw as ResearchPrint);
  if (!p || typeof p.barT !== "number" || typeof p.symbol !== "string") return null;
  return p;
}

export class SqlResearchStore implements ResearchStore {
  private readonly client: () => Promise<ResearchSql>;

  constructor(client: () => Promise<ResearchSql>) {
    this.client = client;
  }

  async upsert(row: ResearchPrint): Promise<"inserted" | "duplicate"> {
    const sql = await this.client();
    const f = row.factors;
    const returned = await sql.query<{ bar_t: number }>(
      `insert into research_prints (
        bar_t, symbol, version,
        open_px, high_px, low_px, close_px, volume,
        session_open, change_pct, rsi, vs_sma, rvol,
        atr, atr_pct, signed_move, normalized_move,
        vesper_lean, ash_lean,
        xs_z, xs_median, xs_mad, xs_n, xs_sufficient,
        market_factor, market_beta, market_alpha, market_fitted, market_residual,
        sector, sector_factor, sector_beta, sector_fitted, sector_residual,
        residual, observation_count, factors_sufficient,
        bar_complete, missing, payload
      ) values (
        $1,$2,$3,
        $4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,
        $14,$15,$16,$17,
        $18,$19,
        $20,$21,$22,$23,$24,
        $25,$26,$27,$28,$29,
        $30,$31,$32,$33,$34,
        $35,$36,$37,
        $38,$39::jsonb,$40::jsonb
      ) on conflict (bar_t, symbol) do nothing
      returning bar_t`,
      [
        row.barT,
        row.symbol,
        row.version,
        row.ohlcv.open,
        row.ohlcv.high,
        row.ohlcv.low,
        row.ohlcv.close,
        row.ohlcv.volume,
        row.raw.open,
        row.raw.changePct,
        row.raw.rsi,
        row.raw.vsSma,
        row.raw.rvol,
        row.atr,
        row.atrPct,
        row.signedMove,
        row.normalizedMove,
        row.vesperLean,
        row.ashLean,
        row.xs,
        row.xsMedian,
        row.xsMad,
        row.xsN,
        row.xsSufficient,
        f.marketFactor,
        f.marketBeta,
        f.marketAlpha,
        f.marketFitted,
        f.marketResidual,
        f.sector,
        f.sectorFactor,
        f.sectorBeta,
        f.sectorFitted,
        f.sectorResidual,
        f.residual,
        f.observationCount,
        f.sufficient,
        row.barComplete,
        JSON.stringify(row.missing),
        JSON.stringify(row),
      ],
    );
    return returned.length ? "inserted" : "duplicate";
  }

  async loadHistory(limitBars = FACTOR_WINDOW + 2): Promise<ResearchPrint[]> {
    const sql = await this.client();
    const times = await sql<{ bar_t: number }>`
      select distinct bar_t from research_prints order by bar_t desc limit ${limitBars}
    `;
    if (!times.length) return [];
    const minT = Math.min(...times.map((r) => Number(r.bar_t)));
    const rows = await sql<PrintRow>`
      select bar_t, symbol, payload from research_prints where bar_t >= ${minT} order by bar_t asc, symbol asc
    `;
    return rows.map((r) => asResearchPrint(r.payload)).filter((p): p is ResearchPrint => p != null);
  }

  async count() {
    const sql = await this.client();
    const rows = await sql<{ n: number }>`select count(*)::int as n from research_prints`;
    return Number(rows[0]?.n ?? 0);
  }

  async lastBarT() {
    const sql = await this.client();
    const rows = await sql<{ bar_t: number | null }>`select max(bar_t) as bar_t from research_prints`;
    const v = rows[0]?.bar_t;
    return v == null ? null : Number(v);
  }

  async lastBarBySymbol() {
    const sql = await this.client();
    const rows = await sql<{ symbol: string; bar_t: number }>`
      select symbol, max(bar_t) as bar_t from research_prints group by symbol
    `;
    const out = new Map<string, number>();
    for (const r of rows) out.set(r.symbol, Number(r.bar_t));
    return out;
  }

  async writeStatus(diag: Omit<ResearchDiagnostics, "count">) {
    const sql = await this.client();
    await sql.query(
      `insert into research_recorder_status (id, updated_at, last_bar_t, last_inserted, last_duplicate, last_error, missing_symbols, gaps)
       values ('default', now(), $1, $2, $3, $4, $5::jsonb, $6::jsonb)
       on conflict (id) do update set
         updated_at = now(),
         last_bar_t = excluded.last_bar_t,
         last_inserted = excluded.last_inserted,
         last_duplicate = excluded.last_duplicate,
         last_error = excluded.last_error,
         missing_symbols = excluded.missing_symbols,
         gaps = excluded.gaps`,
      [
        diag.lastBarT,
        diag.lastInserted,
        diag.lastDuplicate,
        diag.lastError,
        JSON.stringify(diag.missingSymbols),
        JSON.stringify(diag.gaps ?? []),
      ],
    );
  }

  async readStatus() {
    const sql = await this.client();
    const rows = await sql<{
      last_bar_t: number | null;
      last_inserted: number;
      last_duplicate: number;
      last_error: string | null;
      missing_symbols: unknown;
      gaps: unknown;
    }>`
      select last_bar_t, last_inserted, last_duplicate, last_error, missing_symbols, gaps
      from research_recorder_status where id = 'default' limit 1
    `;
    const r = rows[0];
    if (!r) return null;
    const missing = Array.isArray(r.missing_symbols)
      ? (r.missing_symbols as string[])
      : typeof r.missing_symbols === "string"
        ? (JSON.parse(r.missing_symbols) as string[])
        : [];
    const gaps = Array.isArray(r.gaps)
      ? (r.gaps as ResearchDiagnostics["gaps"])
      : typeof r.gaps === "string"
        ? (JSON.parse(r.gaps) as ResearchDiagnostics["gaps"])
        : [];
    return {
      lastBarT: r.last_bar_t == null ? null : Number(r.last_bar_t),
      lastInserted: Number(r.last_inserted ?? 0),
      lastDuplicate: Number(r.last_duplicate ?? 0),
      lastError: r.last_error ?? null,
      missingSymbols: missing,
      gaps,
    };
  }
}
