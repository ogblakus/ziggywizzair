import { t as __exportAll } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-kIhJB4kA.js
var password_exports = /* @__PURE__ */ __exportAll({
	changeDeskPassword: () => changeDeskPassword,
	issueRecoveryCode: () => issueRecoveryCode,
	passwordStatus: () => passwordStatus,
	rememberDevice: () => rememberDevice,
	resetDeskPassword: () => resetDeskPassword,
	trustThisDevice: () => trustThisDevice
});
function normalizeDevice(raw) {
	const s = raw.trim().toLowerCase();
	return /^[a-f0-9]{64}$/.test(s) ? s : null;
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
var passwordStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2a3091a566c61ce473376ed9c00b037d761971050b560431530df41fbc0f9157"));
var changeDeskPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6a4a4be81fa478839980c3972fe14853184bcd04ffffe943fe200fadd610cc75"));
var issueRecoveryCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("21fb5eb799598aaa1ec5accb798625660afad9ca9d6e402cf7e674731f1fd5a1"));
var trustThisDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8f9c0d17bd03cc4d4d5cf8611fbc1d181cb209735a5d495bac4c18d8c8c2e5f4"));
var resetDeskPassword = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ed99fbba3f6ed2e81eda1eb787bbd9084efade79fe1dbb4d48ec01de7ac316b0"));
//#endregion
export { resetDeskPassword as a, password_exports as i, issueRecoveryCode as n, trustThisDevice as o, passwordStatus as r, changeDeskPassword as t };
