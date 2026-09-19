/**
 * Optional external ping / future Vercel Cron target.
 * Fail-closed: 401 unless Authorization: Bearer $CRON_SECRET.
 * Does not import Decision Engine, Kai, Iris, or sizing.
 * Not registered as a Vercel cron — collection is still request-driven
 * until a plan with a protected cron is confirmed.
 */
import { createFileRoute } from "@tanstack/react-router";

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export const Route = createFileRoute("/api/research-tick")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!cronAuthorized(request)) {
          return new Response("unauthorized", { status: 401 });
        }
        const { loadLiveMarket } = await import("@/lib/market/quotes");
        const { recordClosedResearch } = await import("@/lib/agents/research-recorder");
        const { sqlResearchStore } = await import("@/lib/agents/research-store.server");
        const market = await loadLiveMarket();
        const quotes = market.ok ? market.quotes : [];
        const diag = await recordClosedResearch(quotes, Date.now(), sqlResearchStore());
        return Response.json({
          ok: true,
          count: diag.count,
          lastBarT: diag.lastBarT,
          lastInserted: diag.lastInserted,
          lastDuplicate: diag.lastDuplicate,
          lastError: diag.lastError,
          missingSymbols: diag.missingSymbols,
          gaps: diag.gaps,
        });
      },
    },
  },
});
