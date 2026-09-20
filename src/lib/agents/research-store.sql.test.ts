import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { SqlResearchStore, type ResearchSql } from "./research-store.ts";
import { RESEARCH_BAR_MS, recordClosedResearch } from "./research-recorder.ts";
import type { LiveQuote } from "../market/quotes.ts";
import type { TickBar } from "../types.ts";

function bar(t: number, px: number, extra: Partial<TickBar> = {}): TickBar {
  return { t, px, o: px, h: px + 1, l: px - 1, v: 10, ...extra };
}

function series(n: number, start: number, px0 = 100): TickBar[] {
  return Array.from({ length: n }, (_, i) => bar(start + i * RESEARCH_BAR_MS, px0 + i * 0.5));
}

function quote(symbol: string, m15: TickBar[]): LiveQuote {
  const last = m15.at(-1);
  const px = last?.px ?? 1;
  return {
    symbol,
    price: px,
    prevClose: m15[0]?.px ?? px,
    open: m15[0]?.px ?? px,
    high: Math.max(...m15.map((b) => b.h ?? b.px)),
    low: Math.min(...m15.map((b) => b.l ?? b.px)),
    series: m15,
    htf: { m15, h1: [], h4: [] },
    livePx: px,
    liveCoin: null,
    spotPx: px,
    tape: "hl",
  };
}

function wrapSql(pg: PGlite): ResearchSql {
  const run = async <T>(text: string, params: unknown[] = []): Promise<T[]> => {
    const result = await pg.query<T>(text, params);
    return result.rows;
  };
  const sql = (async <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: unknown[]) => {
    let text = strings[0] ?? "";
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1] ?? ""}`;
    return run<T>(text, values);
  }) as ResearchSql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) => run<T>(text, params);
  return sql;
}

describe("Research SQL store (in-memory PGlite)", { timeout: 30_000 }, () => {
  it("migration applies; same candle is unique; restart does not duplicate; SELECT reads the row", async () => {
    const pg = new PGlite();
    await pg.waitReady;
    const migration = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../migrations/0007_research_prints.sql"),
      "utf8",
    );
    await pg.exec(migration);
    const migration8 = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../../migrations/0008_research_recorder_trigger.sql"),
      "utf8",
    );
    await pg.exec(migration8);

    const sql = wrapSql(pg);
    const store = new SqlResearchStore(async () => sql);

    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const quotes = [quote("BTC", m15), quote("ETH", m15.map((b) => ({ ...b, px: b.px + 3 })))];

    const first = await recordClosedResearch(quotes, now, store);
    assert.equal(first.lastError, null);
    assert.equal(first.lastInserted, 40);
    assert.equal(first.lastDuplicate, 0);

    const proof1 = await sql<{ n: number; last_bar: number | null }>`
      select count(*)::int as n, max(bar_t) as last_bar from research_prints
    `;
    assert.equal(Number(proof1[0]?.n), 40);
    assert.ok(proof1[0]?.last_bar != null);

    const second = await recordClosedResearch(quotes, now, store);
    assert.equal(second.lastInserted, 0);
    assert.equal(second.lastDuplicate, 40);
    const proof2 = await sql<{ n: number }>`select count(*)::int as n from research_prints`;
    assert.equal(Number(proof2[0]?.n), 40);

    const reloaded = new SqlResearchStore(async () => sql);
    const again = await recordClosedResearch(quotes, now, reloaded);
    assert.equal(again.lastInserted, 0);
    assert.equal(again.lastDuplicate, 40);
    assert.equal(await reloaded.count(), 40);

    const roundtrip = await sql<{ symbol: string; atr: number | null; signed_move: number | null; payload: unknown }>`
      select symbol, atr, signed_move, payload from research_prints where bar_t = ${Number(proof1[0]?.last_bar)} order by symbol
    `;
    assert.equal(roundtrip.length, 2);
    assert.equal(roundtrip[0]?.symbol, "BTC");
    assert.ok(roundtrip[0]?.atr == null || typeof roundtrip[0].atr === "number");
    const payload = roundtrip[0]?.payload;
    assert.ok(payload && typeof payload === "object");

    const missingAtr = series(4, start);
    const shortNow = missingAtr.at(-1)!.t + RESEARCH_BAR_MS + 1;
    await recordClosedResearch([quote("SOL", missingAtr)], shortNow, store);
    const sol = await sql<{ atr: number | null; signed_move: number | null; missing: unknown }>`
      select atr, signed_move, missing from research_prints where symbol = 'SOL' limit 1
    `;
    assert.equal(sol[0]?.atr, null);
    assert.equal(sol[0]?.signed_move, null);

    const tagged = await recordClosedResearch(quotes, now, store, { trigger: "cron" });
    assert.equal(tagged.lastInserted, 0);
    assert.equal(tagged.lastTrigger, "cron");
    const status = await store.readStatus();
    assert.equal(status?.lastTrigger, "cron");
    assert.ok(status?.lastRunAt);

    await pg.close();
  });
});
