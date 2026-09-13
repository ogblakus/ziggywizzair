import { o as __toESM } from "../_runtime.mjs";
import { i as isLot } from "./universe-BHNCzOwL.mjs";
import { C as t, a as assetName, d as money, l as fillNoteLabel, n as alertKindAllowed, p as qtyFmt, u as fillSideLabel } from "./alert-prefs-BDQeOj_T.mjs";
import { i as getSql } from "./db-By3YCc4B.mjs";
import { join } from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/push.server-BWkb1GjS.js
function alertForFill(fill, closed, locale = "en") {
	const qty = qtyFmt(fill.qty, isLot(fill.symbol));
	const px = fill.price >= 100 ? fill.price.toFixed(2) : fill.price.toFixed(4);
	const name = assetName(fill.symbol, locale);
	const note = fillNoteLabel(fill.note, fill.source, locale);
	if (closed) {
		const pnl = closed.pnl >= 0 ? `+${money(closed.pnl)}` : money(closed.pnl);
		return {
			title: t("fill.closedName", { name }, locale),
			body: `P&L ${pnl} · ${note}`,
			tag: `close-${fill.symbol}`
		};
	}
	return {
		title: t(fill.side === "buy" ? "fill.openedLong" : "fill.openedShort", { name }, locale),
		body: `${fillSideLabel(fill.side, locale)} ${qty} @ ${px} · ${note}`,
		tag: `open-${fill.symbol}`
	};
}
function alertForProposal(order, locale) {
	const side = fillSideLabel(order.side, locale);
	const qty = qtyFmt(order.qty, isLot(order.symbol));
	const name = assetName(order.symbol, locale);
	if (locale === "pl") return {
		title: "ZiggyWizzAir · rada czeka na Ciebie",
		body: `Iris proponuje ${side} ${name} (${qty}). Otwórz apkę: złóż zlecenie albo odrzuć.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
		tag: `proposal-${order.symbol}`,
		url: "/?decide=1"
	};
	return {
		title: "ZiggyWizzAir · the floor is waiting",
		body: `Iris wants to ${side} ${name} (${qty}). Open the app to place or pass.${order.rationale ? ` ${order.rationale.slice(0, 120)}` : ""}`,
		tag: `proposal-${order.symbol}`,
		url: "/?decide=1"
	};
}
function alertsForFills(fills, closed, locale = "en", prefs) {
	const byId = new Map(closed.map((c) => [c.id, c]));
	return fills.map((f) => {
		const row = byId.get(f.id) ?? null;
		if (!alertKindAllowed(row ? "close" : "open", prefs)) return null;
		return alertForFill(f, row, locale);
	}).filter((a) => Boolean(a));
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
	if (!sub.endpoint.startsWith("https://") || sub.endpoint.length > 2048) return { ok: false };
	if (!sub.keys?.p256dh || !sub.keys?.auth) return { ok: false };
	if (sub.keys.p256dh.length > 256 || sub.keys.auth.length > 256) return { ok: false };
	const store = await loadStore();
	const rest = store.subs.filter((s) => s.endpoint !== sub.endpoint);
	const mine = sub.userId ? rest.filter((s) => s.userId === sub.userId) : [];
	const others = sub.userId ? rest.filter((s) => s.userId !== sub.userId) : rest;
	const keptMine = mine.slice(-3);
	store.subs = [
		...others,
		...keptMine,
		sub
	].slice(-200);
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
async function pushAlerts(alerts, userId) {
	if (!alerts.length) return;
	const store = await loadStore();
	const subs = userId ? store.subs.filter((s) => s.userId === userId) : [];
	if (!subs.length) return;
	const wp = await webPush();
	wp.setVapidDetails("mailto:desk@quorum.app", store.vapidPublic, store.vapidPrivate);
	const payload = alerts.length === 1 ? alerts[0] : {
		title: `ZiggyWizzAir · ${alerts.length}`,
		body: alerts.map((a) => a.title.replace(/^ZiggyWizzAir[ ·]*/, "")).join(" · "),
		tag: "quorum-digest",
		url: alerts[0]?.url ?? "/"
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
async function notifyFills(fills, closed, userId, locale = "en", prefs) {
	if (!fills.length) return;
	await pushAlerts(alertsForFills(fills, closed, locale, prefs), userId);
}
async function notifyProposal(order, locale, userId, prefs) {
	if (!alertKindAllowed("proposal", prefs)) return;
	await pushAlerts([alertForProposal(order, locale)], userId);
}
//#endregion
export { dropSubscription, getVapidPublicKey, notifyFills, notifyProposal, saveSubscription };
