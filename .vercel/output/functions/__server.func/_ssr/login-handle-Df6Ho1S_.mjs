import { n as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
import { n as rateLimit, t as clientIp } from "./limit-2GEJY2rU.mjs";
import { a as usernameError, r as normalizeUsername } from "./profile-server-RnW0amzK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-handle-Df6Ho1S_.js
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
async function attachDevice(email, device) {
	if (!device) return;
	try {
		const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
		const userId = (await (await getSql())`
      select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
    `)[0]?.id;
		if (!userId) return;
		const { rememberDevice } = await import("./password-kIhJB4kA.mjs").then((n) => n.i);
		await rememberDevice(userId, device);
	} catch {}
}
var handleAvailable_createServerFn_handler = createServerRpc({
	id: "32e36b36ecc17a975db08f35b036957adf84e8d617a2a9bf6c19ce0ff0acb1f6",
	name: "handleAvailable",
	filename: "src/lib/desk/login-handle.ts"
}, (opts) => handleAvailable.__executeServer(opts));
var handleAvailable = createServerFn({ method: "POST" }).validator((input) => input).handler(handleAvailable_createServerFn_handler, async ({ data }) => {
	const ip = await clientIp();
	if (!rateLimit(`nick:${ip}`, 40, 6e4)) return {
		ok: false,
		error: "invalid"
	};
	const username = normalizeUsername(data.username ?? "");
	if (usernameError(username)) return {
		ok: false,
		error: "invalid"
	};
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	if ((await sql`
      select 1 as n from desk_profiles where lower(username) = ${username} limit 1
    `).length) return {
		ok: true,
		free: false
	};
	return {
		ok: true,
		free: (await sql`
      select 1 as n from "user" where lower(email) = ${handleEmail(username)} limit 1
    `).length === 0
	};
});
var signInHandle_createServerFn_handler = createServerRpc({
	id: "4af98acf66f6edb344df534f768c2dd21696c8520af729fda827923163603237",
	name: "signInHandle",
	filename: "src/lib/desk/login-handle.ts"
}, (opts) => signInHandle.__executeServer(opts));
var signInHandle = createServerFn({ method: "POST" }).validator((input) => input).handler(signInHandle_createServerFn_handler, async ({ data }) => {
	const password = data.password;
	if (password.length < 8 || password.length > 128) return {
		ok: false,
		error: "bad"
	};
	const ip = await clientIp();
	const handle = (data.handle ?? "").trim().toLowerCase().slice(0, 80);
	if (!rateLimit(`signin:${ip}:${handle}`, 8, 9e5)) return {
		ok: false,
		error: "bad"
	};
	const email = await emailForHandle(data.handle);
	if (!email) return {
		ok: false,
		error: "bad"
	};
	try {
		const { auth } = await import("./server-B2mxShfj.mjs").then((n) => n.r);
		let headers;
		try {
			const { getRequest } = await import("./server-BxuBBDLK.mjs").then((n) => n.i).then((n) => n.t);
			headers = getRequest().headers;
		} catch {
			headers = void 0;
		}
		const result = await auth.api.signInEmail({
			body: {
				email,
				password,
				rememberMe: data.remember !== false
			},
			...headers ? { headers } : {}
		});
		const token = result && typeof result === "object" && "token" in result ? result.token ?? null : null;
		await attachDevice(email, data.device);
		return {
			ok: true,
			token
		};
	} catch {
		return {
			ok: false,
			error: "bad"
		};
	}
});
async function requestHeaders() {
	try {
		const { getRequest } = await import("./server-BxuBBDLK.mjs").then((n) => n.i).then((n) => n.t);
		return getRequest().headers;
	} catch {
		return;
	}
}
var signUpHandle_createServerFn_handler = createServerRpc({
	id: "37964fdc4054e372bbb0202c0bfc11baeae88e49585603258aee1f2bcc5c1d47",
	name: "signUpHandle",
	filename: "src/lib/desk/login-handle.ts"
}, (opts) => signUpHandle.__executeServer(opts));
var signUpHandle = createServerFn({ method: "POST" }).validator((input) => input).handler(signUpHandle_createServerFn_handler, async ({ data }) => {
	const username = normalizeUsername(data.username ?? "");
	if (usernameError(username)) return {
		ok: false,
		error: "invalid"
	};
	const password = data.password;
	if (password.length < 8 || password.length > 128) return {
		ok: false,
		error: "bad"
	};
	const ip = await clientIp();
	if (!rateLimit(`signup:${ip}`, 6, 9e5)) return {
		ok: false,
		error: "bad"
	};
	const mail = handleEmail(username);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	if ((await sql`
      select 1 as n from desk_profiles where lower(username) = ${username}
      union all
      select 1 as n from "user" where lower(email) = ${mail}
      limit 1
    `).length) return {
		ok: false,
		error: "taken"
	};
	try {
		const { auth } = await import("./server-B2mxShfj.mjs").then((n) => n.r);
		const headers = await requestHeaders();
		const result = await auth.api.signUpEmail({
			body: {
				email: mail,
				password,
				name: username
			},
			...headers ? { headers } : {}
		});
		const userId = result && typeof result === "object" && "user" in result ? result.user?.id : void 0;
		if (userId) {
			try {
				await sql`
            insert into desk_profiles (user_id, username)
            values (${userId}, ${username})
          `;
			} catch {}
			try {
				const { snapshotVault } = await import("./vault.server-DeQoDthf.mjs");
				await snapshotVault(sql);
			} catch {}
			if (data.device) try {
				const { rememberDevice } = await import("./password-kIhJB4kA.mjs").then((n) => n.i);
				await rememberDevice(userId, data.device);
			} catch {}
		}
		return {
			ok: true,
			token: result && typeof result === "object" && "token" in result ? result.token ?? null : null
		};
	} catch (err) {
		const msg = err instanceof Error ? err.message : "";
		if (/already/i.test(msg)) return {
			ok: false,
			error: "taken"
		};
		return {
			ok: false,
			error: "bad"
		};
	}
});
//#endregion
export { handleAvailable_createServerFn_handler, signInHandle_createServerFn_handler, signUpHandle_createServerFn_handler };
