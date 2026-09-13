import { useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, persistBearer, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { APP_NAME, PlaneMark } from "@/components/desk/brand";
import { SecretField } from "@/components/desk/secret-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitch, useT } from "@/lib/i18n";
import { normalizeUsername, usernameError } from "@/lib/desk/profile-server";
import { looksLikeEmail, signInHandle, signUpHandle } from "@/lib/desk/login-handle";
import { getDeviceToken } from "@/lib/desk/device";
import { issueRecoveryCode, resetDeskPassword, trustThisDevice } from "@/lib/desk/password";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <LoginShell />;
  if (user) return <Navigate to="/" />;
  return (
    <LoginShell>
      <LoginForm />
    </LoginShell>
  );
}

function LoginShell({ children }: { children?: ReactNode }) {
  const t = useT();
  return (
    <div className="desk-wash flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <PlaneMark className="size-12 rounded-lg" />
      <h1 className="mt-4 text-xl font-semibold tracking-tight">{APP_NAME}</h1>
      <p className="mt-1 max-w-sm text-center text-sm leading-relaxed text-muted">{t("login.tagline")}</p>
      <div className="mt-5">
        <p className="mb-1.5 text-center text-2xs tracking-wide text-subtle uppercase">{t("login.language")}</p>
        <LanguageSwitch compact />
      </div>
      <div className="mt-8 w-full max-w-sm">{children}</div>
    </div>
  );
}

const LAST_EMAIL_KEY = "zw.login.email";

function readLastEmail(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(LAST_EMAIL_KEY) ?? "";
  } catch {
    return "";
  }
}

function rememberEmail(email: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch {
    /* partitioned storage can throw */
  }
}

function captureSessionToken(ctx: { response?: Response; data?: { token?: string | null } }, stay: boolean) {
  const header = ctx.response?.headers.get("set-auth-token");
  const token = header || ctx.data?.token;
  if (token) persistBearer(token, stay);
}

function LoginForm() {
  const t = useT();
  const [email, setEmail] = useState(readLastEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState("");
  const [mode, setMode] = useState<"in" | "up" | "forgot">("in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [terms, setTerms] = useState(false);
  const [stay, setStay] = useState(true);
  const [freshCode, setFreshCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function afterAuth(token: string | null) {
    if (token) persistBearer(token, stay);
    try {
      await trustThisDevice({ data: { device: getDeviceToken() } });
    } catch {
      /* device trust is best-effort */
    }
  }

  async function maybeShowRecovery() {
    try {
      const rec = await issueRecoveryCode();
      if (rec.ok) {
        setFreshCode(rec.code);
        setBusy(false);
        return true;
      }
    } catch {
      /* continue into the desk */
    }
    return false;
  }

  async function onEmail(e: FormEvent) {
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
        const reset = await resetDeskPassword({
          data: {
            handle,
            password,
            device: getDeviceToken(),
            recovery: recovery.trim() || undefined,
          },
        });
        if (!reset.ok) throw new Error(t("login.forgotFail"));
        const res = await signInHandle({
          data: { handle, password, remember: stay, device: getDeviceToken() },
        });
        if (!res.ok) throw new Error(t("login.forgotFail"));
        await afterAuth(res.token);
        try {
          await authClient.getSession();
        } catch {
          /* session store recovers on next fetch */
        }
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
      onSuccess: (ctx: { response?: Response; data?: { token?: string | null } }) => {
        captureSessionToken(ctx, stay);
      },
      onResponse: (ctx: { response: Response }) => {
        captureSessionToken(ctx, stay);
      },
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
          const invalid = usernameError(nick);
          if (invalid) throw new Error(t("login.badNick"));
          const res = await signUpHandle({ data: { username: nick, password, device: getDeviceToken() } });
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
            fetchOptions,
          });
          if (err) {
            const code = (err as { code?: string }).code ?? "";
            if (code.includes("ALREADY") || /already exists/i.test(err.message ?? "")) {
              setMode("in");
              throw new Error(t("login.exists"));
            }
            throw new Error(err.message ?? t("login.createFail"));
          }
          const token = data && "token" in data ? (data as { token?: string }).token : undefined;
          await afterAuth(token ?? null);
        }
        if (await maybeShowRecovery()) return;
      } else {
        const res = await signInHandle({
          data: { handle, password, remember: stay, device: getDeviceToken() },
        });
        if (!res.ok) throw new Error(t("login.badCreds"));
        await afterAuth(res.token);
      }
      try {
        await authClient.getSession();
      } catch {
        /* session store recovers on next fetch */
      }
      window.location.href = "/";
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const leak = /file descriptor|seek to end|PGLite|EMFILE|base\/\d/i.test(raw);
      setError(leak || !raw ? t("login.deskBusy") : raw);
      setBusy(false);
    }
  }

  if (freshCode) {
    return (
      <div className="space-y-3">
        <div className="rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]">
          <div className="text-sm font-medium">{t("login.saveRecovery")}</div>
          <p className="mt-1 text-2xs leading-relaxed text-muted">{t("login.saveRecoveryBody")}</p>
          <div className="mt-3 rounded-lg bg-surface px-3 py-2.5 font-mono text-sm tracking-wide tabular-nums">
            {freshCode}
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            onClick={() => {
              void navigator.clipboard.writeText(freshCode).then(
                () => setCopied(true),
                () => setCopied(false),
              );
            }}
          >
            {copied ? t("login.recoveryCopied") : t("login.copyCode")}
          </Button>
        </div>
        <Button type="button" className="w-full" onClick={() => (window.location.href = "/")}>
          {t("login.enterDesk")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {authEnabled ? (
        <>
          {mode !== "forgot"
            ? GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (mode === "up" && !terms) {
                      setError(t("login.needTerms"));
                      return;
                    }
                    void signIn(p.providerId, { callbackURL: "/" });
                  }}
                >
                  {t("login.continueWith", { label: p.label })}
                </Button>
              ))
            : null}

          {mode !== "forgot" ? (
            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="text-2xs tracking-wide text-subtle uppercase">{t("login.orEmail")}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium">{t("login.forgotTitle")}</div>
              <p className="mt-1 text-2xs leading-relaxed text-muted">{t("login.forgotBody")}</p>
            </div>
          )}

          <form onSubmit={onEmail} className="space-y-2">
            <Input
              id="login-handle"
              name="username"
              type="text"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder={t("login.handlePh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const next = document.getElementById("login-password");
                if (next instanceof HTMLInputElement) next.focus();
              }}
              className="h-11"
            />
            <SecretField
              id="login-password"
              name="password"
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              placeholder={mode === "forgot" ? t("login.newPassword") : t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {mode === "forgot" ? (
              <>
                <SecretField
                  autoComplete="new-password"
                  placeholder={t("login.confirmPassword")}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <Input
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={t("login.recoveryCode")}
                  aria-label={t("login.recoveryCode")}
                  value={recovery}
                  onChange={(e) => setRecovery(e.target.value)}
                  className="h-11 font-mono tracking-wide"
                />
                <p className="px-0.5 text-2xs leading-relaxed text-subtle">{t("login.recoveryPh")}</p>
              </>
            ) : null}
            {mode !== "forgot" ? (
              <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm leading-relaxed">
                <input
                  type="checkbox"
                  checked={stay}
                  onChange={(e) => setStay(e.target.checked)}
                  className="size-4 shrink-0 accent-current"
                />
                <span>{t("login.stay")}</span>
              </label>
            ) : null}
            {mode === "up" ? (
              <div className="rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
                <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("login.termsTitle")}</div>
                <p className="mt-1.5 whitespace-pre-line text-2xs leading-relaxed text-muted">
                  {t("login.termsBody", { app: APP_NAME })}
                </p>
                <label className="mt-3 flex cursor-pointer items-start gap-2 text-2xs leading-relaxed">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 accent-current"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  <span>{t("login.termsCheck")}</span>
                </label>
              </div>
            ) : null}
            {error ? <p className="text-2xs leading-relaxed text-down">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "…" : mode === "up" ? t("login.createDesk") : mode === "forgot" ? t("login.forgotGo") : t("login.signIn")}
            </Button>
          </form>
          {mode === "in" ? (
            <button
              type="button"
              className="w-full text-center text-2xs text-muted hover:text-fg"
              onClick={() => {
                setMode("forgot");
                setError(null);
                setPassword("");
                setConfirm("");
              }}
            >
              {t("login.forgot")}
            </button>
          ) : null}
          <button
            type="button"
            className="w-full text-center text-2xs text-muted hover:text-fg"
            onClick={() => {
              setMode(mode === "up" || mode === "forgot" ? "in" : "up");
              setError(null);
              setConfirm("");
              setRecovery("");
            }}
          >
            {mode === "up" ? t("login.haveDesk") : mode === "forgot" ? t("login.forgotBack") : t("login.newHere")}
          </button>
        </>
      ) : (
        <p className="text-sm text-muted">{t("login.disabled")}</p>
      )}
    </div>
  );
}
