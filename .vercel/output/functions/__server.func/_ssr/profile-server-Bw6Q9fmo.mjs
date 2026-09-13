import { n as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-server-Bw6Q9fmo.js
var USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;
var RESERVED = /* @__PURE__ */ new Set([
	"ziggy",
	"ziggywizzair",
	"wizzair",
	"admin",
	"system",
	"desk",
	"tape",
	"floor",
	"iris",
	"vesper",
	"ash",
	"kai",
	"damian",
	"kaczmarski"
]);
function normalizeUsername(raw) {
	return raw.trim().toLowerCase();
}
function usernameError(raw) {
	const name = normalizeUsername(raw);
	if (!USERNAME_RE.test(name)) return "3–20 characters. Start with a letter. Only a–z, 0–9, underscore.";
	if (RESERVED.has(name)) return "That handle is reserved.";
	return null;
}
var loadProfile_createServerFn_handler = createServerRpc({
	id: "3c41b1876898df8f5fcb2bd28184782e6d0ca416c908c5b17d80f5b2beffd8e3",
	name: "loadProfile",
	filename: "src/lib/desk/profile-server.ts"
}, (opts) => loadProfile.__executeServer(opts));
var loadProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadProfile_createServerFn_handler, async ({ context }) => {
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	return { username: (await (await getSql())`
      select username from desk_profiles where user_id = ${context.userId} limit 1
    `)[0]?.username ?? null };
});
var claimUsername_createServerFn_handler = createServerRpc({
	id: "5fd1ce1e69f9d1258fb698f3f930de53b4dce082cdc1e22cc2087f5cd37e8dbe",
	name: "claimUsername",
	filename: "src/lib/desk/profile-server.ts"
}, (opts) => claimUsername.__executeServer(opts));
var claimUsername = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(claimUsername_createServerFn_handler, async ({ context, data }) => {
	const username = normalizeUsername(data.username ?? "");
	const invalid = usernameError(username);
	if (invalid) return {
		ok: false,
		error: invalid,
		username: null
	};
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	try {
		const mine = await sql`
        select username from desk_profiles where user_id = ${context.userId} limit 1
      `;
		if (mine[0]?.username) return {
			ok: true,
			username: mine[0].username,
			locked: true
		};
		await sql`
        insert into desk_profiles (user_id, username)
        values (${context.userId}, ${username})
      `;
		try {
			const { snapshotVault } = await import("./vault.server-DeQoDthf.mjs");
			await snapshotVault(sql);
		} catch {}
		return {
			ok: true,
			username,
			locked: true
		};
	} catch {
		return {
			ok: false,
			error: "That handle is taken.",
			username: null
		};
	}
});
//#endregion
export { claimUsername_createServerFn_handler, loadProfile_createServerFn_handler };
