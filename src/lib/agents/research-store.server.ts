/**
 * Neon (DATABASE_URL) / PGLite (preview) handle for research prints.
 * Rows are universe-wide and unowned — not DeskBook, not per-user.
 */
import { ALPHA_RESEARCH_VERSION } from "@/lib/agents/research";
import { emptyFactorResearch } from "@/lib/agents/factors";
import {
  type ResearchDiagnostics,
  type ResearchLabPayload,
  type ResearchPrint,
  printToLabRow,
} from "@/lib/agents/research-recorder";
import { SqlResearchStore, asResearchPrint } from "@/lib/agents/research-store";
import { getSql } from "@/lib/db";

export { SqlResearchStore } from "@/lib/agents/research-store";
export type { ResearchLabPayload } from "@/lib/agents/research-recorder";

let sqlStore: SqlResearchStore | null = null;

export function sqlResearchStore(): SqlResearchStore {
  sqlStore ??= new SqlResearchStore(getSql);
  return sqlStore;
}

type PrintRow = {
  bar_t: number;
  symbol: string;
  payload: ResearchPrint | string;
};

export async function loadLabFromStore(symbol?: string | null): Promise<ResearchLabPayload> {
  const store = sqlResearchStore();
  const emptyFactors = emptyFactorResearch();
  const diagnostics: ResearchDiagnostics = {
    count: await store.count().catch(() => 0),
    lastBarT: await store.lastBarT().catch(() => null),
    lastInserted: 0,
    lastDuplicate: 0,
    lastError: null,
    missingSymbols: [],
    gaps: [],
  };
  const status = await store.readStatus().catch(() => null);
  if (status) {
    diagnostics.lastInserted = status.lastInserted;
    diagnostics.lastDuplicate = status.lastDuplicate;
    diagnostics.lastError = status.lastError;
    diagnostics.missingSymbols = status.missingSymbols;
    diagnostics.gaps = status.gaps ?? [];
    if (diagnostics.lastBarT == null) diagnostics.lastBarT = status.lastBarT;
  }
  if (!diagnostics.count || diagnostics.lastBarT == null) {
    return { version: ALPHA_RESEARCH_VERSION, stored: false, barT: null, rows: [], diagnostics };
  }
  const sql = await getSql();
  let barT = diagnostics.lastBarT;
  if (symbol) {
    const hit = await sql<{ bar_t: number }>`
      select bar_t from research_prints where symbol = ${symbol} order by bar_t desc limit 1
    `;
    if (hit[0]) barT = Number(hit[0].bar_t);
  }
  const rows = await sql<PrintRow>`
    select bar_t, symbol, payload from research_prints where bar_t = ${barT} order by symbol
  `;
  const prints = rows.map((r) => asResearchPrint(r.payload)).filter((p): p is ResearchPrint => p != null);
  return {
    version: ALPHA_RESEARCH_VERSION,
    stored: prints.length > 0,
    barT,
    rows: prints.map(
      (p) =>
        printToLabRow(p) ?? {
          symbol: p.symbol,
          raw: p.raw,
          atr: p.atr,
          atrPct: p.atrPct,
          normalizedMove: p.normalizedMove,
          signedMove: p.signedMove,
          vesperLean: p.vesperLean,
          ashLean: p.ashLean,
          xs: p.xs,
          sufficient: p.xsSufficient,
          factors: p.factors ?? emptyFactors,
        },
    ),
    diagnostics,
  };
}
