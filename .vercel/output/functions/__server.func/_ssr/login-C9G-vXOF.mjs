import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { _ as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { i as signIn, r as persistBearer, t as authClient } from "./client-r2HS9zuU.mjs";
import { a as usernameError, r as normalizeUsername } from "./profile-server-RnW0amzK.mjs";
import { looksLikeEmail, signInHandle, signUpHandle } from "./login-handle-CKSdUz3G.mjs";
import { a as resetDeskPassword, n as issueRecoveryCode, o as trustThisDevice } from "./password-kIhJB4kA.mjs";
import { i as getDeviceToken, n as Input, o as useCurrentUserState, r as SecretField, t as Button } from "./device-BP6aaMIH.mjs";
import { o as GROK_PROVIDERS } from "./server-B2mxShfj.mjs";
import { C as LanguageSwitch, S as APP_NAME, T as PlaneMark, j as useT } from "./router-fKdFkJkx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-C9G-vXOF.js
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
function captureSessionToken(ctx, stay) {
	const token = ctx.response?.headers.get("set-auth-token") || ctx.data?.token;
	if (token) persistBearer(token, stay);
}
function LoginForm() {
	const t = useT();
	const [email, setEmail] = (0, import_react.useState)(readLastEmail);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [recovery, setRecovery] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("in");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [terms, setTerms] = (0, import_react.useState)(false);
	const [stay, setStay] = (0, import_react.useState)(true);
	const [freshCode, setFreshCode] = (0, import_react.useState)(null);
	const [copied, setCopied] = (0, import_react.useState)(false);
	async function afterAuth(token) {
		if (token) persistBearer(token, stay);
		try {
			await trustThisDevice({ data: { device: getDeviceToken() } });
		} catch {}
	}
	async function maybeShowRecovery() {
		try {
			const rec = await issueRecoveryCode();
			if (rec.ok) {
				setFreshCode(rec.code);
				setBusy(false);
				return true;
			}
		} catch {}
		return false;
	}
	async function onEmail(e) {
		e.preventDefault();
		const handle = email.trim();
		if (mode === "forgot") {
			if (!handle || password.length < 8 || password.length > 128) {
				setError(t("login.needCreds"));
				return;
			}
			if (password !== confirm) {
				setError(t("login.mismatch"));
				return;
			}
			setBusy(true);
			setError(null);
			rememberEmail(handle);
			try {
				if (!(await resetDeskPassword({ data: {
					handle,
					password,
					device: getDeviceToken(),
					recovery: recovery.trim() || void 0
				} })).ok) throw new Error(t("login.forgotFail"));
				const res = await signInHandle({ data: {
					handle,
					password,
					remember: stay,
					device: getDeviceToken()
				} });
				if (!res.ok) throw new Error(t("login.forgotFail"));
				await afterAuth(res.token);
				try {
					await authClient.getSession();
				} catch {}
				window.location.href = "/";
			} catch (err) {
				const raw = err instanceof Error ? err.message : "";
				setError(raw || t("login.forgotFail"));
				setBusy(false);
			}
			return;
		}
		if (!handle || password.length < 8 || password.length > 128) {
			setError(t("login.needCreds"));
			return;
		}
		setBusy(true);
		setError(null);
		rememberEmail(handle);
		persistBearer(null, false);
		const fetchOptions = {
			onSuccess: (ctx) => {
				captureSessionToken(ctx, stay);
			},
			onResponse: (ctx) => {
				captureSessionToken(ctx, stay);
			}
		};
		try {
			if (mode === "up") {
				if (!terms) {
					setError(t("login.needTerms"));
					setBusy(false);
					return;
				}
				if (!looksLikeEmail(handle)) {
					const nick = normalizeUsername(handle);
					if (usernameError(nick)) throw new Error(t("login.badNick"));
					const res = await signUpHandle({ data: {
						username: nick,
						password,
						device: getDeviceToken()
					} });
					if (!res.ok) {
						if (res.error === "taken") throw new Error(t("login.nickTaken"));
						if (res.error === "invalid") throw new Error(t("login.badNick"));
						throw new Error(t("login.createFail"));
					}
					await afterAuth(res.token);
				} else {
					const mail = handle.toLowerCase();
					const name = mail.split("@")[0] ?? "Desk";
					const { data, error: err } = await authClient.signUp.email({
						email: mail,
						password,
						name,
						fetchOptions
					});
					if (err) {
						if ((err.code ?? "").includes("ALREADY") || /already exists/i.test(err.message ?? "")) {
							setMode("in");
							throw new Error(t("login.exists"));
						}
						throw new Error(err.message ?? t("login.createFail"));
					}
					await afterAuth((data && "token" in data ? data.token : void 0) ?? null);
				}
				if (await maybeShowRecovery()) return;
			} else {
				const res = await signInHandle({ data: {
					handle,
					password,
					remember: stay,
					device: getDeviceToken()
				} });
				if (!res.ok) throw new Error(t("login.badCreds"));
				await afterAuth(res.token);
			}
			try {
				await authClient.getSession();
			} catch {}
			window.location.href = "/";
		} catch (err) {
			const raw = err instanceof Error ? err.message : "";
			const leak = /file descriptor|seek to end|PGLite|EMFILE|base\/\d/i.test(raw);
			setError(leak || !raw ? t("login.deskBusy") : raw);
			setBusy(false);
		}
	}
	if (freshCode) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-medium",
					children: t("login.saveRecovery")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-2xs leading-relaxed text-muted",
					children: t("login.saveRecoveryBody")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 rounded-lg bg-surface px-3 py-2.5 font-mono text-sm tracking-wide tabular-nums",
					children: freshCode
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					variant: "outline",
					className: "mt-3 w-full",
					onClick: () => {
						navigator.clipboard.writeText(freshCode).then(() => setCopied(true), () => setCopied(false));
					},
					children: copied ? t("login.recoveryCopied") : t("login.copyCode")
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			type: "button",
			className: "w-full",
			onClick: () => window.location.href = "/",
			children: t("login.enterDesk")
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			mode !== "forgot" ? GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "secondary",
				className: "w-full",
				onClick: () => {
					if (mode === "up" && !terms) {
						setError(t("login.needTerms"));
						return;
					}
					signIn(p.providerId, { callbackURL: "/" });
				},
				children: t("login.continueWith", { label: p.label })
			}, p.providerId)) : null,
			mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 py-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-2xs tracking-wide text-subtle uppercase",
						children: t("login.orEmail")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm font-medium",
				children: t("login.forgotTitle")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-2xs leading-relaxed text-muted",
				children: t("login.forgotBody")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: onEmail,
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "login-handle",
						name: "username",
						type: "text",
						autoComplete: "username",
						inputMode: "email",
						autoCapitalize: "none",
						autoCorrect: "off",
						spellCheck: false,
						placeholder: t("login.handlePh"),
						value: email,
						onChange: (e) => setEmail(e.target.value),
						onKeyDown: (e) => {
							if (e.key !== "Enter") return;
							e.preventDefault();
							const next = document.getElementById("login-password");
							if (next instanceof HTMLInputElement) next.focus();
						},
						className: "h-11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretField, {
						id: "login-password",
						name: "password",
						autoComplete: mode === "in" ? "current-password" : "new-password",
						placeholder: mode === "forgot" ? t("login.newPassword") : t("login.password"),
						value: password,
						onChange: (e) => setPassword(e.target.value)
					}),
					mode === "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecretField, {
							autoComplete: "new-password",
							placeholder: t("login.confirmPassword"),
							value: confirm,
							onChange: (e) => setConfirm(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							autoComplete: "off",
							spellCheck: false,
							placeholder: t("login.recoveryCode"),
							"aria-label": t("login.recoveryCode"),
							value: recovery,
							onChange: (e) => setRecovery(e.target.value),
							className: "h-11 font-mono tracking-wide"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-0.5 text-2xs leading-relaxed text-subtle",
							children: t("login.recoveryPh")
						})
					] }) : null,
					mode !== "forgot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 cursor-pointer items-center gap-2.5 text-sm leading-relaxed",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: stay,
							onChange: (e) => setStay(e.target.checked),
							className: "size-4 shrink-0 accent-current"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("login.stay") })]
					}) : null,
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xs font-medium tracking-wide text-subtle uppercase",
								children: t("login.termsTitle")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 whitespace-pre-line text-2xs leading-relaxed text-muted",
								children: t("login.termsBody", { app: APP_NAME })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-3 flex cursor-pointer items-start gap-2 text-2xs leading-relaxed",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									className: "mt-0.5 size-4 shrink-0 accent-current",
									checked: terms,
									onChange: (e) => setTerms(e.target.checked)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("login.termsCheck") })]
							})
						]
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xs leading-relaxed text-down",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						className: "w-full",
						disabled: busy,
						children: busy ? "…" : mode === "up" ? t("login.createDesk") : mode === "forgot" ? t("login.forgotGo") : t("login.signIn")
					})
				]
			}),
			mode === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-center text-2xs text-muted hover:text-fg",
				onClick: () => {
					setMode("forgot");
					setError(null);
					setPassword("");
					setConfirm("");
				},
				children: t("login.forgot")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-center text-2xs text-muted hover:text-fg",
				onClick: () => {
					setMode(mode === "up" || mode === "forgot" ? "in" : "up");
					setError(null);
					setConfirm("");
					setRecovery("");
				},
				children: mode === "up" ? t("login.haveDesk") : mode === "forgot" ? t("login.forgotBack") : t("login.newHere")
			})
		] })
	});
}
//#endregion
export { Login as component };
