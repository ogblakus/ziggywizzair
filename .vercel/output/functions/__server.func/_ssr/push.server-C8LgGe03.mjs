import { o as __toESM } from "../_runtime.mjs";
import { i as isLot } from "./universe-8y-43p2g.mjs";
import { i as getSql } from "./db-CS8H5U8C.mjs";
import { a as qtyFmt, r as money } from "./format-oJrLrLck.mjs";
import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/push.server-C8LgGe03.js
function alertForFill(fill, closed) {
	const qty = qtyFmt(fill.qty, isLot(fill.symbol));
	const px = fill.price >= 100 ? fill.price.toFixed(2) : fill.price.toFixed(4);
	if (closed) {
		const pnl = closed.pnl >= 0 ? `+${money(closed.pnl)}` : money(closed.pnl);
		return {
			title: `ZiggyWizzAir closed ${fill.symbol}`,
			body: `P&L ${pnl}${fill.note ? ` · ${fill.note}` : ""}`,
			tag: `close-${fill.symbol}`
		};
	}
	const opened = fill.side === "buy" ? "long" : "short";
	return {
		title: `ZiggyWizzAir opened ${fill.symbol} ${opened}`,
		body: `${fill.side.toUpperCase()} ${qty} @ ${px}${fill.note ? ` · ${fill.note}` : ""}`,
		tag: `open-${fill.symbol}`
	};
}
function alertsForFills(fills, closed) {
	const byId = new Map(closed.map((c) => [c.id, c]));
	return fills.map((f) => alertForFill(f, byId.get(f.id) ?? null));
}
var FILE = join(process.cwd(), "data", "push.json");
var ROW = "push";
async function webPush() {
	const mod = await import("../_libs/web-push.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()));
	return mod.default ?? mod;
}
async function readFileStore() {
	try {
		return JSON.parse(await readFile(FILE, "utf8"));
	} catch {
		return null;
	}
}
async function writeFileStore(store) {
	try {
		await mkdir(join(process.cwd(), "data"), { recursive: true });
		await writeFile(FILE, JSON.stringify(store), "utf8");
	} catch {}
}
async function readSqlStore() {
	try {
		const payload = (await (await getSql())`select payload from desk_push where id = ${ROW} limit 1`)[0]?.payload;
		if (!payload) return null;
		return typeof payload === "string" ? JSON.parse(payload) : payload;
	} catch {
		return null;
	}
}
async function writeSqlStore(store) {
	try {
		const sql = await getSql();
		const payload = JSON.stringify(store);
		await sql.query(`insert into desk_push (id, payload, updated_at) values ($1, $2::jsonb, now())
       on conflict (id) do update set payload = excluded.payload, updated_at = now()`, [ROW, payload]);
	} catch {}
}
function asStore(raw) {
	if (!raw || typeof raw.vapidPublic !== "string" || typeof raw.vapidPrivate !== "string") return null;
	return {
		vapidPublic: raw.vapidPublic,
		vapidPrivate: raw.vapidPrivate,
		subs: Array.isArray(raw.subs) ? raw.subs.filter((s) => s && typeof s.endpoint === "string") : []
	};
}
async function persistStore(store) {
	await writeFileStore(store);
	await writeSqlStore(store);
}
async function loadStore() {
	const sql = asStore(await readSqlStore());
	const file = asStore(await readFileStore());
	if (sql && file) {
		const seen = new Set(sql.subs.map((s) => s.endpoint));
		const merged = [...sql.subs, ...file.subs.filter((s) => !seen.has(s.endpoint))];
		return {
			vapidPublic: sql.vapidPublic,
			vapidPrivate: sql.vapidPrivate,
			subs: merged
		};
	}
	if (sql) return sql;
	if (file) return file;
	const keys = (await webPush()).generateVAPIDKeys();
	const store = {
		vapidPublic: keys.publicKey,
		vapidPrivate: keys.privateKey,
		subs: []
	};
	await persistStore(store);
	return store;
}
async function getVapidPublicKey() {
	return (await loadStore()).vapidPublic;
}
async function saveSubscription(sub) {
	if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
	const store = await loadStore();
	store.subs = [...store.subs.filter((s) => s.endpoint !== sub.endpoint), sub].slice(-24);
	await persistStore(store);
	return { ok: true };
}
async function dropSubscription(endpoint, userId) {
	const store = await loadStore();
	store.subs = store.subs.filter((s) => {
		if (s.endpoint !== endpoint) return true;
		if (userId && s.userId && s.userId !== userId) return true;
		return false;
	});
	await persistStore(store);
}
async function notifyFills(fills, closed, userId) {
	if (!fills.length) return;
	const alerts = alertsForFills(fills, closed);
	if (!alerts.length) return;
	const store = await loadStore();
	const subs = userId ? store.subs.filter((s) => s.userId === userId) : [];
	if (!subs.length) return;
	const wp = await webPush();
	wp.setVapidDetails("mailto:desk@quorum.app", store.vapidPublic, store.vapidPrivate);
	const payload = alerts.length === 1 ? alerts[0] : {
		title: `ZiggyWizzAir · ${alerts.length} fills while you were away`,
		body: alerts.map((a) => a.title.replace(/^ZiggyWizzAir /, "")).join(" · "),
		tag: "quorum-digest"
	};
	const body = JSON.stringify(payload);
	const stale = [];
	await Promise.all(subs.map(async (sub) => {
		try {
			await wp.sendNotification(sub, body, {
				TTL: 3600,
				urgency: "high"
			});
		} catch (err) {
			const status = err.statusCode;
			if (status === 404 || status === 410) stale.push(sub.endpoint);
		}
	}));
	if (stale.length) {
		store.subs = store.subs.filter((s) => !stale.includes(s.endpoint));
		await persistStore(store);
	}
}
//#endregion
export { dropSubscription, getVapidPublicKey, notifyFills, saveSubscription };
