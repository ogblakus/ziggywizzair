import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { r as signIn, t as authClient } from "./client-CVqXY6bk.mjs";
import { t as GROK_PROVIDERS } from "./server-DOdXph7E.mjs";
import { i as useCurrentUserState, n as Input, t as Button } from "./use-current-user-BAl_fqJd.mjs";
import { c as LanguageSwitch, h as useT, l as PlaneMark, s as APP_NAME } from "./router-61qQF9sn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-B2e4KHc2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginShell, {});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoginForm, {}) });
}
function LoginShell({ children }) {
	const t = useT();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "desk-wash flex min-h-dvh flex-col items-center justify-center px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlaneMark, { className: "size-12 rounded-lg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-4 text-xl font-semibold tracking-tight",
				children: APP_NAME
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 max-w-sm text-center text-sm leading-relaxed text-muted",
				children: t("login.tagline")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-1.5 text-center text-2xs tracking-wide text-subtle uppercase",
					children: t("login.language")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LanguageSwitch, { compact: true })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 w-full max-w-sm",
				children
			})
		]
	});
}
var BEARER_KEY = "grok-auth.bearer-token";
var LAST_EMAIL_KEY = "zw.login.email";
function readLastEmail() {
	if (typeof window === "undefined") return "";
	try {
		return window.localStorage.getItem(LAST_EMAIL_KEY) ?? "";
	} catch {
		return "";
	}
}
function rememberEmail(email) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(LAST_EMAIL_KEY, email);
	} catch {}
}
function clearStaleBearer() {
	if (typeof window === "undefined") return;
	try {
		window.sessionStorage.removeItem(BEARER_KEY);
	} catch {}
}
function storeBearer(token) {
	if (!token || typeof window === "undefined") return;
	try {
		window.sessionStorage.setItem(BEARER_KEY, token);
	} catch {}
}
function captureSessionToken(ctx) {
	const header = ctx.response?.headers.get("set-auth-token");
	storeBearer(header || ctx.data?.token);
}
function LoginForm() {
	const t = useT();
	const [email, setEmail] = (0, import_react.useState)(readLastEmail);
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("in");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function onEmail(e) {
		e.preventDefault();
		const mail = email.trim().toLowerCase();
		if (!mail || password.length < 8) {
			setError(t("login.needCreds"));
			return;
		}
		setBusy(true);
		setError(null);
		rememberEmail(mail);
		clearStaleBearer();
		const fetchOptions = {
			onSuccess: captureSessionToken,
			onResponse: (ctx) => {
				captureSessionToken(ctx);
			}
		};
		try {
			if (mode === "up") {
				const { data, error: err } = await authClient.signUp.email({
					email: mail,
					password,
					name: mail.split("@")[0] ?? "Desk",
					fetchOptions
				});
				if (err) {
					if ((err.code ?? "").includes("ALREADY") || /already exists/i.test(err.message ?? "")) {
						setMode("in");
						throw new Error(t("login.exists"));
					}
					throw new Error(err.message ?? t("login.createFail"));
				}
				storeBearer(data && "token" in data ? data.token : void 0);
			} else {
				const { data, error: err } = await authClient.signIn.email({
					email: mail,
					password,
					fetchOptions
				});
				if (err) {
					if ((err.code ?? "") === "INVALID_EMAIL_OR_PASSWORD") throw new Error(t("login.badCreds"));
					throw new Error(err.message ?? t("login.inFail"));
				}
				storeBearer(data && "token" in data ? data.token : void 0);
			}
			try {
				await authClient.getSession();
			} catch {}
			window.location.href = "/";
		} catch (err) {
			setError(err instanceof Error ? err.message : t("login.failed"));
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				className: "w-full",
				onClick: () => void signIn(p.providerId, { callbackURL: "/" }),
				children: t("login.continueWith", { label: p.label })
			}, p.providerId)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs tracking-wide text-subtle uppercase",
						children: t("login.orEmail")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onEmail,
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "login-email",
						name: "email",
						type: "email",
						autoComplete: "email",
						placeholder: t("login.email"),
						value: email,
						onChange: (e) => setEmail(e.target.value),
						className: "h-11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "login-password",
						name: "password",
						type: "password",
						autoComplete: mode === "up" ? "new-password" : "current-password",
						placeholder: t("login.password"),
						value: password,
						onChange: (e) => setPassword(e.target.value),
						className: "h-11"
					}),
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs leading-relaxed text-down",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "…" : mode === "up" ? t("login.createDesk") : t("login.signIn")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-center text-2xs text-muted hover:text-fg",
				onClick: () => {
					setMode(mode === "up" ? "in" : "up");
					setError(null);
				},
				children: mode === "up" ? t("login.haveDesk") : t("login.newHere")
			})
		] })
	});
}
//#endregion
export { Login as component };
