/**
 * Optional external ping / GitHub Actions target.
 * Fail-closed: 401 unless Authorization: Bearer $CRON_SECRET.
 * Secret is never logged, never returned, never placed in the URL.
 * Vercel Cron every 15 minutes is not registered here: a Hobby plan
 * rejects sub-daily crons and would fail the whole deploy.
 */
import { createFileRoute } from "@tanstack/react-router";
import { dispatchResearchTick } from "@/lib/agents/research-tick";

export const Route = createFileRoute("/api/research-tick")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const result = await dispatchResearchTick({
          authorization: request.headers.get("authorization"),
          secret: process.env.CRON_SECRET,
          trigger: "cron",
          getStore: async () => {
            const { sqlResearchStore } = await import("@/lib/agents/research-store.server");
            return sqlResearchStore();
          },
          loadMarket: async () => {
            const { loadLiveMarket } = await import("@/lib/market/quotes");
            const market = await loadLiveMarket();
            return market.ok
              ? { quotes: market.quotes, error: null }
              : { quotes: [], error: market.error };
          },
        });
        if (typeof result.body === "string") {
          return new Response(result.body, { status: result.status });
        }
        return Response.json(result.body, { status: result.status });
      },
    },
  },
});
