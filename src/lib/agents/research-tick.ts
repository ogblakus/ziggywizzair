/**
 * Auth + run path for GET /api/research-tick.
 * Does not import Decision Engine, Kai, Iris, sizing, or DeskBook.
 */
import { timingSafeEqual } from "node:crypto";
import {
  recordClosedResearch,
  type ResearchDiagnostics,
  type ResearchStore,
  type ResearchTrigger,
} from "@/lib/agents/research-recorder";
import type { LiveQuote } from "@/lib/market/quotes";

export function cronAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || !header) return false;
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function runResearchTick(args: {
  store: ResearchStore;
  trigger: ResearchTrigger;
  now?: number;
  quotes?: LiveQuote[];
  marketError?: string | null;
}): Promise<ResearchDiagnostics> {
  if (args.marketError) {
    const diag: ResearchDiagnostics = {
      count: await args.store.count().catch(() => 0),
      lastBarT: await args.store.lastBarT().catch(() => null),
      lastInserted: 0,
      lastDuplicate: 0,
      lastError: args.marketError,
      missingSymbols: [],
      gaps: [],
      lastTrigger: args.trigger,
      lastRunAt: Date.now(),
    };
    try {
      await args.store.writeStatus({
        lastBarT: diag.lastBarT,
        lastInserted: 0,
        lastDuplicate: 0,
        lastError: diag.lastError,
        missingSymbols: [],
        gaps: [],
        lastTrigger: args.trigger,
        lastRunAt: diag.lastRunAt,
      });
    } catch {
      /* status best-effort */
    }
    return diag;
  }
  return recordClosedResearch(args.quotes ?? [], args.now ?? Date.now(), args.store, {
    trigger: args.trigger,
  });
}

export function tickJson(diag: ResearchDiagnostics) {
  return {
    ok: diag.lastError == null,
    count: diag.count,
    lastBarT: diag.lastBarT,
    lastInserted: diag.lastInserted,
    lastDuplicate: diag.lastDuplicate,
    lastError: diag.lastError,
    missingSymbols: diag.missingSymbols,
    gaps: diag.gaps,
    lastTrigger: diag.lastTrigger,
    lastRunAt: diag.lastRunAt,
  };
}

export type TickDispatch = {
  status: number;
  body: ReturnType<typeof tickJson> | string;
};

/**
 * Fail-closed dispatcher. 401 never loads market or store, never writes.
 */
export async function dispatchResearchTick(args: {
  authorization: string | null;
  secret: string | undefined;
  trigger: ResearchTrigger;
  now?: number;
  getStore: () => ResearchStore | Promise<ResearchStore>;
  loadMarket: () => Promise<{ quotes: LiveQuote[]; error: string | null }>;
}): Promise<TickDispatch> {
  if (!cronAuthorized(args.authorization, args.secret)) {
    return { status: 401, body: "unauthorized" };
  }
  try {
    const store = await args.getStore();
    const market = await args.loadMarket();
    const diag = await runResearchTick({
      store,
      trigger: args.trigger,
      now: args.now,
      quotes: market.quotes,
      marketError: market.error,
    });
    const body = tickJson(diag);
    return { status: body.ok ? 200 : 503, body };
  } catch {
    return {
      status: 503,
      body: tickJson({
        count: 0,
        lastBarT: null,
        lastInserted: 0,
        lastDuplicate: 0,
        lastError: "tick failed",
        missingSymbols: [],
        gaps: [],
        lastTrigger: args.trigger,
        lastRunAt: Date.now(),
      }),
    };
  }
}
