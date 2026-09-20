import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { runLocalV2 } from "./local-v2.ts";
import { GOLDEN } from "./golden/catalog.ts";
import { MemoryResearchStore, RESEARCH_BAR_MS } from "./research-recorder.ts";
import { cronAuthorized, dispatchResearchTick, runResearchTick } from "./research-tick.ts";
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

describe("research-tick auth and run", () => {
  it("missing or wrong secret is unauthorized", () => {
    assert.equal(cronAuthorized(null, "secret"), false);
    assert.equal(cronAuthorized("Bearer secret", undefined), false);
    assert.equal(cronAuthorized("Bearer secret", ""), false);
    assert.equal(cronAuthorized("Bearer other", "secret"), false);
    assert.equal(cronAuthorized("secret", "secret"), false);
    assert.equal(cronAuthorized("Bearer secret", "secret"), true);
  });

  it("401 without or with wrong secret never writes and never loads market", async () => {
    const store = new MemoryResearchStore();
    let loaded = 0;
    let stored = 0;
    const loadMarket = async () => {
      loaded += 1;
      return { quotes: [] as LiveQuote[], error: null };
    };
    const getStore = () => {
      stored += 1;
      return store;
    };
    const missing = await dispatchResearchTick({
      authorization: null,
      secret: "secret",
      trigger: "cron",
      getStore,
      loadMarket,
    });
    assert.equal(missing.status, 401);
    const wrong = await dispatchResearchTick({
      authorization: "Bearer other",
      secret: "secret",
      trigger: "cron",
      getStore,
      loadMarket,
    });
    assert.equal(wrong.status, 401);
    const emptySecret = await dispatchResearchTick({
      authorization: "Bearer secret",
      secret: undefined,
      trigger: "cron",
      getStore,
      loadMarket,
    });
    assert.equal(emptySecret.status, 401);
    assert.equal(loaded, 0);
    assert.equal(stored, 0);
    assert.equal(await store.count(), 0);
  });

  it("authorized run with closed bars can insert; repeat is duplicate", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + RESEARCH_BAR_MS + 1;
    const store = new MemoryResearchStore();
    const quotes = [quote("BTC", m15)];
    const a = await dispatchResearchTick({
      authorization: "Bearer secret",
      secret: "secret",
      trigger: "cron",
      now,
      getStore: () => store,
      loadMarket: async () => ({ quotes, error: null }),
    });
    assert.equal(a.status, 200);
    assert.ok(typeof a.body !== "string");
    assert.equal(a.body.lastInserted, 20);
    assert.equal(a.body.lastTrigger, "cron");
    assert.ok(a.body.lastRunAt);
    const b = await dispatchResearchTick({
      authorization: "Bearer secret",
      secret: "secret",
      trigger: "cron",
      now,
      getStore: () => store,
      loadMarket: async () => ({ quotes, error: null }),
    });
    assert.equal(b.status, 200);
    assert.ok(typeof b.body !== "string");
    assert.equal(b.body.lastInserted, 0);
    assert.equal(b.body.lastDuplicate, 20);
    assert.equal(await store.count(), 20);
  });

  it("forming bar is not written", async () => {
    const start = 1_700_000_000_000;
    const m15 = series(20, start);
    const now = m15.at(-1)!.t + 1;
    const store = new MemoryResearchStore();
    await runResearchTick({ store, trigger: "cron", quotes: [quote("BTC", m15)], now });
    const forming = Math.floor(m15.at(-1)!.t / RESEARCH_BAR_MS) * RESEARCH_BAR_MS;
    assert.equal([...store.rows.values()].some((r) => r.barT === forming), false);
  });

  it("vendor failure records lastError and inserts nothing", async () => {
    const store = new MemoryResearchStore();
    const diag = await dispatchResearchTick({
      authorization: "Bearer secret",
      secret: "secret",
      trigger: "cron",
      getStore: () => store,
      loadMarket: async () => ({ quotes: [], error: "vendor timeout" }),
    });
    assert.equal(diag.status, 503);
    assert.ok(typeof diag.body !== "string");
    assert.equal(diag.body.lastError, "vendor timeout");
    assert.equal(diag.body.lastInserted, 0);
    assert.equal(await store.count(), 0);
    assert.equal(store.status?.lastTrigger, "cron");
    assert.equal(store.status?.lastError, "vendor timeout");
  });
});

describe("research-tick isolation", () => {
  it("does not import V2.4 engine, Kai, Iris, or sizing", () => {
    const src = readFileSync(new URL("./research-tick.ts", import.meta.url), "utf8");
    assert.equal(/from ["'][^"']*decision-engine/.test(src), false);
    assert.equal(/kaiValidate/.test(src), false);
    assert.equal(/irisRules/.test(src), false);
    assert.equal(/from ["']@\/lib\/desk\/size/.test(src), false);
    const route = readFileSync(new URL("../../routes/api/research-tick.ts", import.meta.url), "utf8");
    assert.equal(/from ["'][^"']*decision-engine/.test(route), false);
    assert.equal(/kaiValidate/.test(route), false);
  });

  it("golden 01 is unchanged", () => {
    const g = GOLDEN.find((row) => row.id === "01");
    assert.ok(g?.snap);
    const r = runLocalV2({ snap: g.snap(), locale: "en" });
    assert.equal(r.finalScore, 63.66);
    assert.equal(r.engineVersion, "2.4");
  });
});
