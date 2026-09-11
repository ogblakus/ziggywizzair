import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getSql } from "@/lib/db";
import { alertForProposal, alertsForFills, type FillAlert } from "@/lib/desk/alerts";
import type { ClosedTrade, Fill, ProposedOrder } from "@/lib/types";

const FILE = join(process.cwd(), "data", "push.json");
const ROW = "push";

export type PushSub = {
  userId?: string;
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

type PushStore = {
  vapidPublic: string;
  vapidPrivate: string;
  subs: PushSub[];
};

type PushRow = { payload: PushStore | string };

async function webPush() {
  const mod = await import("web-push");
  return mod.default ?? mod;
}

async function readFileStore(): Promise<PushStore | null> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as PushStore;
  } catch {
    return null;
  }
}

async function writeFileStore(store: PushStore) {
  try {
    await mkdir(join(process.cwd(), "data"), { recursive: true });
    await writeFile(FILE, JSON.stringify(store), "utf8");
  } catch {
    /* Vercel read-only fs */
  }
}

async function readSqlStore(): Promise<PushStore | null> {
  try {
    const sql = await getSql();
    const rows = await sql<PushRow>`select payload from desk_push where id = ${ROW} limit 1`;
    const payload = rows[0]?.payload;
    if (!payload) return null;
    return (typeof payload === "string" ? JSON.parse(payload) : payload) as PushStore;
  } catch {
    return null;
  }
}

async function writeSqlStore(store: PushStore) {
  try {
    const sql = await getSql();
    const payload = JSON.stringify(store);
    await sql.query(
      `insert into desk_push (id, payload, updated_at) values ($1, $2::jsonb, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`,
      [ROW, payload],
    );
  } catch {
    /* file backup still written */
  }
}

function asStore(raw: PushStore | null): PushStore | null {
  if (!raw || typeof raw.vapidPublic !== "string" || typeof raw.vapidPrivate !== "string") return null;
  return {
    vapidPublic: raw.vapidPublic,
    vapidPrivate: raw.vapidPrivate,
  subs: Array.isArray(raw.subs)
    ? raw.subs.filter((s) => s && typeof s.endpoint === "string")
    : [],
  };
}

async function persistStore(store: PushStore) {
  await writeFileStore(store);
  await writeSqlStore(store);
}

async function loadStore(): Promise<PushStore> {
  const sql = asStore(await readSqlStore());
  const file = asStore(await readFileStore());
  if (sql && file) {
    const seen = new Set(sql.subs.map((s) => s.endpoint));
    const merged = [...sql.subs, ...file.subs.filter((s) => !seen.has(s.endpoint))];
    return { vapidPublic: sql.vapidPublic, vapidPrivate: sql.vapidPrivate, subs: merged };
  }
  if (sql) return sql;
  if (file) return file;
  const wp = await webPush();
  const keys = wp.generateVAPIDKeys();
  const store: PushStore = { vapidPublic: keys.publicKey, vapidPrivate: keys.privateKey, subs: [] };
  await persistStore(store);
  return store;
}

export async function getVapidPublicKey(): Promise<string> {
  return (await loadStore()).vapidPublic;
}

export async function saveSubscription(sub: PushSub) {
  if (!sub.endpoint.startsWith("https://") || sub.endpoint.length > 2048) return { ok: false as const };
  if (!sub.keys?.p256dh || !sub.keys?.auth) return { ok: false as const };
  if (sub.keys.p256dh.length > 256 || sub.keys.auth.length > 256) return { ok: false as const };
  const store = await loadStore();
  const rest = store.subs.filter((s) => s.endpoint !== sub.endpoint);
  const mine = sub.userId ? rest.filter((s) => s.userId === sub.userId) : [];
  const others = sub.userId ? rest.filter((s) => s.userId !== sub.userId) : rest;
  const keptMine = mine.slice(-3);
  store.subs = [...others, ...keptMine, sub].slice(-200);
  await persistStore(store);
  return { ok: true as const };
}

export async function dropSubscription(endpoint: string, userId?: string) {
  const store = await loadStore();
  store.subs = store.subs.filter((s) => {
    if (s.endpoint !== endpoint) return true;
    if (userId && s.userId && s.userId !== userId) return true;
    return false;
  });
  await persistStore(store);
}

async function pushAlerts(alerts: FillAlert[], userId?: string) {
  if (!alerts.length) return;
  const store = await loadStore();
  const subs = userId ? store.subs.filter((s) => s.userId === userId) : [];
  if (!subs.length) return;
  const wp = await webPush();
  wp.setVapidDetails("mailto:desk@quorum.app", store.vapidPublic, store.vapidPrivate);
  const payload =
    alerts.length === 1
      ? alerts[0]!
      : {
          title: `ZiggyWizzAir · ${alerts.length}`,
          body: alerts.map((a) => a.title.replace(/^ZiggyWizzAir[ ·]*/, "")).join(" · "),
          tag: "quorum-digest",
          url: alerts[0]?.url ?? "/",
        };
  const body = JSON.stringify(payload);
  const stale: string[] = [];
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await wp.sendNotification(sub, body, { TTL: 3600, urgency: "high" });
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) stale.push(sub.endpoint);
      }
    }),
  );
  if (stale.length) {
    store.subs = store.subs.filter((s) => !stale.includes(s.endpoint));
    await persistStore(store);
  }
}

export async function notifyFills(fills: Fill[], closed: ClosedTrade[], userId?: string, locale: "en" | "pl" = "en") {
  if (!fills.length) return;
  await pushAlerts(alertsForFills(fills, closed, locale), userId);
}

export async function notifyProposal(order: ProposedOrder, locale: "en" | "pl", userId?: string) {
  await pushAlerts([alertForProposal(order, locale)], userId);
}
