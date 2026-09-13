import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { a as usernameError, r as normalizeUsername } from "./profile-server-RnW0amzK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-handle-CKSdUz3G.js
var HANDLE_EMAIL_DOMAIN = "handle.ziggywizzair.app";
function looksLikeEmail(raw) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}
function handleEmail(nick) {
	return `${normalizeUsername(nick)}@${HANDLE_EMAIL_DOMAIN}`;
}
async function emailForHandle(raw) {
	const handle = raw.trim().toLowerCase();
	if (!handle) return null;
	if (looksLikeEmail(handle)) return handle;
	if (usernameError(handle)) return null;
	try {
		const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
		return (await (await getSql())`
      select u.email as email
      from desk_profiles p
      join "user" u on u.id = p.user_id
      where lower(p.username) = ${handle}
      limit 1
    `)[0]?.email ?? handleEmail(handle);
	} catch {
		return handleEmail(handle);
	}
}
createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("32e36b36ecc17a975db08f35b036957adf84e8d617a2a9bf6c19ce0ff0acb1f6"));
var signInHandle = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("4af98acf66f6edb344df534f768c2dd21696c8520af729fda827923163603237"));
var signUpHandle = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("37964fdc4054e372bbb0202c0bfc11baeae88e49585603258aee1f2bcc5c1d47"));
//#endregion
export { HANDLE_EMAIL_DOMAIN, emailForHandle, looksLikeEmail, signInHandle, signUpHandle };
