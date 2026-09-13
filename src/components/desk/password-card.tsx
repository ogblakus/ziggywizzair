import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SecretField } from "@/components/desk/secret-field";
import { changeDeskPassword, issueRecoveryCode, passwordStatus } from "@/lib/desk/password";
import { useT } from "@/lib/i18n";

export function PasswordCard() {
  const t = useT();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    let live = true;
    void passwordStatus()
      .then((res) => {
        if (!live) return;
        setHasPassword(res.hasPassword);
        setHasRecovery(res.hasRecovery);
      })
      .catch(() => {
        if (live) setHasPassword(false);
      });
    return () => {
      live = false;
    };
  }, []);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (next.length < 8 || next.length > 128) {
      setError(t("login.needCreds"));
      return;
    }
    if (next !== confirm) {
      setError(t("login.mismatch"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await changeDeskPassword({
        data: { current: hasPassword ? current : undefined, next },
      });
      if (!res.ok) {
        setError(res.error === "current" ? t("settings.passwordBad") : t("login.needCreds"));
        return;
      }
      setCurrent("");
      setNext("");
      setConfirm("");
      setHasPassword(true);
      toast.success(t("settings.passwordSaved"));
    } catch {
      setError(t("settings.passwordBad"));
    } finally {
      setBusy(false);
    }
  }

  async function onIssue() {
    setIssuing(true);
    setCopied(false);
    try {
      const res = await issueRecoveryCode();
      if (res.ok) {
        setCode(res.code);
        setHasRecovery(true);
      }
    } finally {
      setIssuing(false);
    }
  }

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">
        {hasPassword === false ? t("settings.passwordSet") : t("settings.password")}
      </div>
      <p className="mt-0.5 text-2xs leading-relaxed text-muted">
        {hasPassword === false ? t("settings.passwordSetBody") : t("settings.passwordBody")}
      </p>

      {hasPassword === null ? (
        <div className="mt-3 h-11 rounded-md bg-surface" />
      ) : (
        <form onSubmit={onSave} className="mt-3 space-y-2">
          {hasPassword ? (
            <SecretField
              autoComplete="current-password"
              placeholder={t("settings.currentPassword")}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          ) : null}
          <SecretField
            autoComplete="new-password"
            placeholder={t("login.newPassword")}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <SecretField
            autoComplete="new-password"
            placeholder={t("login.confirmPassword")}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error ? <p className="text-2xs leading-relaxed text-down">{error}</p> : null}
          <Button type="submit" variant="secondary" className="w-full" disabled={busy || next.length < 8}>
            {busy ? "…" : t("settings.passwordSave")}
          </Button>
        </form>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <div className="text-sm font-medium">{t("settings.recovery")}</div>
        <p className="mt-0.5 text-2xs leading-relaxed text-muted">
          {hasRecovery ? t("settings.recoveryHas") : t("settings.recoveryBody")}
        </p>
        {code ? (
          <div className="mt-3 rounded-lg bg-surface px-3 py-2.5 shadow-[var(--shadow-border)]">
            <div className="font-mono text-sm tracking-wide tabular-nums">{code}</div>
            <p className="mt-1.5 text-2xs leading-relaxed text-muted">{t("settings.recoveryOnce")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => void copyCode(code)}
            >
              {copied ? t("login.recoveryCopied") : t("login.copyCode")}
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            disabled={issuing}
            onClick={() => void onIssue()}
          >
            {issuing ? "…" : hasRecovery ? t("settings.recoveryAgain") : t("settings.recoveryMake")}
          </Button>
        )}
      </div>
    </section>
  );
}
