import { n as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
import { n as rateLimit, t as clientIp } from "./limit-2GEJY2rU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-BZhf8xbM.js
var CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function normalizeDevice(raw) {
	const s = raw.trim().toLowerCase();
	return /^[a-f0-9]{64}$/.test(s) ? s : null;
}
function mintRecoveryCode(bytes) {
	let body = "";
	for (let i = 0; i < 12; i++) {
		body += CODE_ALPHABET[bytes[i] % 32];
		if (i === 3 || i === 7) body += "-";
	}
	return body;
}
function normalizeRecovery(raw) {
	return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
async function cryptoBits() {
	const { randomBytes, createHash } = await import("node:crypto");
	const { hashPassword, verifyPassword } = await import("./crypto-45IVpPEN.mjs").then((n) => n.t).then((n) => n.t);
	const digest = (raw) => createHash("sha256").update(raw).digest("hex");
	return {
		randomBytes,
		digest,
		hashPassword,
		verifyPassword
	};
}
async function userIdForHandle(handle) {
	const { emailForHandle } = await import("./login-handle-CKSdUz3G.mjs");
	const email = await emailForHandle(handle);
	if (!email) return null;
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	return (await (await getSql())`
    select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
  `)[0]?.id ?? null;
}
async function writePassword(userId, password) {
	const { randomBytes, hashPassword } = await cryptoBits();
	const hashed = await hashPassword(password);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const rows = await sql`
    select id from account
    where "userId" = ${userId} and "providerId" = 'credential'
    limit 1
  `;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	if (rows[0]?.id) await sql`
      update account
      set password = ${hashed}, "updatedAt" = ${now}
      where id = ${rows[0].id}
    `;
	else await sql`
      insert into account (
        id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
      ) values (
        ${randomBytes(16).toString("hex")}, ${userId}, 'credential', ${userId}, ${hashed}, ${now}, ${now}
      )
    `;
	try {
		const { snapshotVault } = await import("./vault.server-DeQoDthf.mjs");
		await snapshotVault(sql);
	} catch {}
}
async function rememberDevice(userId, device) {
	const token = normalizeDevice(device);
	if (!token) return;
	const { randomBytes, digest } = await cryptoBits();
	const tokenHash = digest(token);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const id = randomBytes(12).toString("hex");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
    insert into desk_devices (id, user_id, token_hash, created_at, last_seen)
    values (${id}, ${userId}, ${tokenHash}, ${now}, ${now})
    on conflict (token_hash) do update
      set user_id = excluded.user_id, last_seen = excluded.last_seen
  `;
	const extra = await sql`
    select id from desk_devices
    where user_id = ${userId}
    order by last_seen desc
    offset 8
  `;
	for (const row of extra) await sql`delete from desk_devices where id = ${row.id}`;
}
async function deviceOwns(userId, device) {
	const token = normalizeDevice(device);
	if (!token) return false;
	const { digest } = await cryptoBits();
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	return (await (await getSql())`
    select 1 as n from desk_devices
    where user_id = ${userId} and token_hash = ${digest(token)}
    limit 1
  `).length > 0;
}
async function recoveryMatches(userId, code) {
	const normalized = normalizeRecovery(code);
	if (normalized.length < 8) return false;
	const { verifyPassword } = await cryptoBits();
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const hash = (await (await getSql())`
    select code_hash from desk_recovery where user_id = ${userId} limit 1
  `)[0]?.code_hash;
	if (!hash) return false;
	try {
		return await verifyPassword({
			hash,
			password: normalized
		});
	} catch {
		return false;
	}
}
var passwordStatus_createServerFn_handler = createServerRpc({
	id: "2a3091a566c61ce473376ed9c00b037d761971050b560431530df41fbc0f9157",
	name: "passwordStatus",
	filename: "src/lib/desk/password.ts"
}, (opts) => passwordStatus.__executeServer(opts));
var passwordStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(passwordStatus_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const cred = await sql`
      select 1 as n from account
      where "userId" = ${context.userId}
        and "providerId" = 'credential'
        and password is not null
      limit 1
    `;
	const rec = await sql`
      select 1 as n from desk_recovery where user_id = ${context.userId} limit 1
    `;
	return {
		hasPassword: cred.length > 0,
		hasRecovery: rec.length > 0
	};
});
var changeDeskPassword_createServerFn_handler = createServerRpc({
	id: "6a4a4be81fa478839980c3972fe14853184bcd04ffffe943fe200fadd610cc75",
	name: "changeDeskPassword",
	filename: "src/lib/desk/password.ts"
}, (opts) => changeDeskPassword.__executeServer(opts));
var changeDeskPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(changeDeskPassword_createServerFn_handler, async ({ context, data }) => {
	const next = data.next ?? "";
	if (next.length < 8 || next.length > 128) return {
		ok: false,
		error: "short"
	};
	const ip = await clientIp();
	if (!rateLimit(`pwchange:${ip}:${context.userId}`, 8, 9e5)) return {
		ok: false,
		error: "bad"
	};
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const existing = (await (await getSql())`
        select password from account
        where "userId" = ${context.userId} and "providerId" = 'credential'
        limit 1
      `)[0]?.password;
	if (existing) {
		const current = data.current ?? "";
		const { verifyPassword } = await cryptoBits();
		let ok = false;
		try {
			ok = await verifyPassword({
				hash: existing,
				password: current
			});
		} catch {
			ok = false;
		}
		if (!ok) return {
			ok: false,
			error: "current"
		};
	}
	await writePassword(context.userId, next);
	return { ok: true };
});
var issueRecoveryCode_createServerFn_handler = createServerRpc({
	id: "21fb5eb799598aaa1ec5accb798625660afad9ca9d6e402cf7e674731f1fd5a1",
	name: "issueRecoveryCode",
	filename: "src/lib/desk/password.ts"
}, (opts) => issueRecoveryCode.__executeServer(opts));
var issueRecoveryCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(issueRecoveryCode_createServerFn_handler, async ({ context }) => {
	const ip = await clientIp();
	if (!rateLimit(`pwrec:${ip}:${context.userId}`, 6, 36e5)) return { ok: false };
	const { randomBytes, hashPassword } = await cryptoBits();
	const code = mintRecoveryCode(randomBytes(12));
	const hashed = await hashPassword(normalizeRecovery(code));
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
      insert into desk_recovery (user_id, code_hash, created_at)
      values (${context.userId}, ${hashed}, ${now})
      on conflict (user_id) do update set code_hash = excluded.code_hash, created_at = excluded.created_at
    `;
	return {
		ok: true,
		code
	};
});
var trustThisDevice_createServerFn_handler = createServerRpc({
	id: "8f9c0d17bd03cc4d4d5cf8611fbc1d181cb209735a5d495bac4c18d8c8c2e5f4",
	name: "trustThisDevice",
	filename: "src/lib/desk/password.ts"
}, (opts) => trustThisDevice.__executeServer(opts));
var trustThisDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(trustThisDevice_createServerFn_handler, async ({ context, data }) => {
	await rememberDevice(context.userId, data.device);
	return { ok: true };
});
var resetDeskPassword_createServerFn_handler = createServerRpc({
	id: "ed99fbba3f6ed2e81eda1eb787bbd9084efade79fe1dbb4d48ec01de7ac316b0",
	name: "resetDeskPassword",
	filename: "src/lib/desk/password.ts"
}, (opts) => resetDeskPassword.__executeServer(opts));
var resetDeskPassword = createServerFn({ method: "POST" }).validator((input) => input).handler(resetDeskPassword_createServerFn_handler, async ({ data }) => {
	const password = data.password ?? "";
	if (password.length < 8 || password.length > 128) return {
		ok: false,
		error: "short"
	};
	const ip = await clientIp();
	const handle = (data.handle ?? "").trim().toLowerCase().slice(0, 80);
	if (!handle) return {
		ok: false,
		error: "bad"
	};
	if (!rateLimit(`pwreset:${ip}:${handle}`, 6, 9e5)) return {
		ok: false,
		error: "bad"
	};
	const userId = await userIdForHandle(data.handle);
	if (!userId) {
		const { hashPassword } = await cryptoBits();
		await hashPassword("timing-pad-password");
		return {
			ok: false,
			error: "bad"
		};
	}
	const viaDevice = data.device ? await deviceOwns(userId, data.device) : false;
	const viaRecovery = data.recovery ? await recoveryMatches(userId, data.recovery) : false;
	if (!viaDevice && !viaRecovery) return {
		ok: false,
		error: "bad"
	};
	await writePassword(userId, password);
	if (data.device) await rememberDevice(userId, data.device);
	return { ok: true };
});
//#endregion
export { changeDeskPassword_createServerFn_handler, issueRecoveryCode_createServerFn_handler, passwordStatus_createServerFn_handler, resetDeskPassword_createServerFn_handler, trustThisDevice_createServerFn_handler };
