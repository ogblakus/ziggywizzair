import { t as __exportAll } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profile-server-RnW0amzK.js
var profile_server_exports = /* @__PURE__ */ __exportAll({
	claimUsername: () => claimUsername,
	loadProfile: () => loadProfile,
	normalizeUsername: () => normalizeUsername,
	usernameError: () => usernameError
});
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
var loadProfile = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("3c41b1876898df8f5fcb2bd28184782e6d0ca416c908c5b17d80f5b2beffd8e3"));
var claimUsername = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("5fd1ce1e69f9d1258fb698f3f930de53b4dce082cdc1e22cc2087f5cd37e8dbe"));
//#endregion
export { usernameError as a, profile_server_exports as i, loadProfile as n, normalizeUsername as r, claimUsername as t };
