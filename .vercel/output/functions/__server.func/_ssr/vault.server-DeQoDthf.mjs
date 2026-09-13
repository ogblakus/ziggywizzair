import { join } from "node:path";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
//#region node_modules/.nitro/vite/services/ssr/assets/vault.server-DeQoDthf.js
var DATA = "/workspace/data";
var VAULT = join(DATA, "vault.json");
var BOOKS = join(DATA, "books");
function iso(v) {
	if (v instanceof Date) return v.toISOString();
	if (typeof v === "string" && v.trim()) return v;
	return (/* @__PURE__ */ new Date()).toISOString();
}
function bool(v) {
	return v === true || v === "t" || v === "true";
}
function mergeBy(key, incoming, older) {
	const map = /* @__PURE__ */ new Map();
	for (const row of older ?? []) {
		const k = key(row);
		if (k) map.set(k, row);
	}
	for (const row of incoming) {
		const k = key(row);
		if (k) map.set(k, row);
	}
	return [...map.values()];
}
async function writeAtomic(path, body) {
	await mkdir(DATA, { recursive: true });
	const tmp = `${path}.${process.pid}.tmp`;
	await writeFile(tmp, body, "utf8");
	try {
		await rename(tmp, path);
	} catch {
		await writeFile(path, body, "utf8");
		await writeFile(tmp, "", "utf8").catch(() => void 0);
	}
}
async function readVault() {
	try {
		const raw = JSON.parse(await readFile(VAULT, "utf8"));
		if (!raw || raw.version !== 1 || !Array.isArray(raw.users)) return null;
		return raw;
	} catch {
		return null;
	}
}
async function snapshotVault(sql) {
	try {
		const users = await sql`select * from "user"`;
		const accounts = await sql`select * from "account"`;
		const profiles = await sql`select user_id, username, created_at from desk_profiles`;
		const books = await sql`select user_id, payload from desk_books`;
		const prev = await readVault();
		const vault = {
			version: 1,
			at: Date.now(),
			users: mergeBy((u) => u.id, users.map((u) => ({
				id: String(u.id),
				name: String(u.name ?? ""),
				email: String(u.email ?? ""),
				emailVerified: bool(u.emailVerified),
				image: typeof u.image === "string" ? u.image : null,
				createdAt: iso(u.createdAt),
				updatedAt: iso(u.updatedAt)
			})), prev?.users),
			accounts: mergeBy((a) => a.id, accounts.map((a) => ({
				id: String(a.id),
				accountId: String(a.accountId ?? ""),
				providerId: String(a.providerId ?? ""),
				userId: String(a.userId ?? ""),
				password: typeof a.password === "string" ? a.password : null,
				accessToken: typeof a.accessToken === "string" ? a.accessToken : null,
				refreshToken: typeof a.refreshToken === "string" ? a.refreshToken : null,
				idToken: typeof a.idToken === "string" ? a.idToken : null,
				accessTokenExpiresAt: a.accessTokenExpiresAt ? iso(a.accessTokenExpiresAt) : null,
				refreshTokenExpiresAt: a.refreshTokenExpiresAt ? iso(a.refreshTokenExpiresAt) : null,
				scope: typeof a.scope === "string" ? a.scope : null,
				createdAt: iso(a.createdAt),
				updatedAt: iso(a.updatedAt)
			})), prev?.accounts),
			profiles: mergeBy((p) => p.user_id, profiles.map((p) => ({
				user_id: String(p.user_id),
				username: String(p.username ?? ""),
				created_at: iso(p.created_at)
			})), prev?.profiles),
			books: mergeBy((b) => b.user_id, books.map((b) => ({
				user_id: String(b.user_id),
				payload: b.payload
			})), prev?.books)
		};
		await writeAtomic(VAULT, JSON.stringify(vault));
		await mkdir(BOOKS, { recursive: true });
		for (const row of vault.books) {
			const body = typeof row.payload === "string" ? row.payload : JSON.stringify(row.payload);
			await writeAtomic(join(BOOKS, `${row.user_id.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)}.json`), body);
		}
	} catch (err) {
		console.error("[vault] snapshot failed", err);
	}
}
async function restoreVault(sql) {
	const vault = await readVault();
	if (!vault?.users.length) return false;
	try {
		await sql`select 1 as n from "user" limit 1`;
	} catch {
		return false;
	}
	console.info(`[vault] restoring ${vault.users.length} account(s) from durable copy`);
	for (const u of vault.users) try {
		await sql.query(`insert into "user" (id, name, email, "emailVerified", image, "createdAt", "updatedAt")
         values ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz)
         on conflict (id) do nothing`, [
			u.id,
			u.name,
			u.email,
			u.emailVerified,
			u.image,
			u.createdAt,
			u.updatedAt
		]);
	} catch {}
	for (const a of vault.accounts) try {
		await sql.query(`insert into "account" (id, "accountId", "providerId", "userId", password, "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, "createdAt", "updatedAt")
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9::timestamptz,$10::timestamptz,$11,$12::timestamptz,$13::timestamptz)
         on conflict (id) do nothing`, [
			a.id,
			a.accountId,
			a.providerId,
			a.userId,
			a.password,
			a.accessToken,
			a.refreshToken,
			a.idToken,
			a.accessTokenExpiresAt,
			a.refreshTokenExpiresAt,
			a.scope,
			a.createdAt,
			a.updatedAt
		]);
	} catch {}
	for (const p of vault.profiles) try {
		await sql.query(`insert into desk_profiles (user_id, username, created_at)
         values ($1, $2, $3::timestamptz)
         on conflict (user_id) do nothing`, [
			p.user_id,
			p.username,
			p.created_at
		]);
	} catch {}
	for (const b of vault.books) try {
		const payload = typeof b.payload === "string" ? b.payload : JSON.stringify(b.payload ?? {});
		await sql.query(`insert into desk_books (user_id, payload, updated_at) values ($1, $2::jsonb, now())
         on conflict (user_id) do update set payload = excluded.payload, updated_at = now()`, [b.user_id, payload]);
	} catch {}
	return true;
}
var snapTimer = null;
function snapshotSoon(sql) {
	if (snapTimer) return;
	snapTimer = setTimeout(() => {
		snapTimer = null;
		snapshotVault(sql);
	}, 2e3);
	if (typeof snapTimer.unref === "function") snapTimer.unref();
}
async function listFileBooks() {
	const out = [];
	try {
		await mkdir(BOOKS, { recursive: true });
		const names = await readdir(BOOKS);
		for (const name of names) {
			if (!name.endsWith(".json")) continue;
			try {
				const raw = await readFile(join(BOOKS, name), "utf8");
				out.push({
					userId: name.replace(/\.json$/, ""),
					raw
				});
			} catch {}
		}
	} catch {}
	return out;
}
var BOOKS_DIR = BOOKS;
//#endregion
export { BOOKS_DIR, listFileBooks, restoreVault, snapshotSoon, snapshotVault };
