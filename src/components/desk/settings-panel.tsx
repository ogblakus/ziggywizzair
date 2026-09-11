import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";
import { useAppearance } from "@/components/desk/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authEnabled, signOut } from "@/lib/auth/client";
import { hasGateSessionMarker } from "@/lib/auth/gate-session-marker";
import { claimUsername, loadProfile } from "@/lib/desk/profile-server";
import { useDesk } from "@/lib/desk-store";
import { WalletCard } from "@/components/desk/wallet-card";
import { replayDeskTour } from "@/components/desk/desk-tour";
import type { Appearance } from "@/lib/theme";
import { LanguageSwitch, useLocale, useT, type MsgKey } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { usePushAlerts } from "@/components/desk/alerts-button";
import { TIMEZONES, setTz, useTz } from "@/lib/tz";

const subscribeToNothing = () => () => {};
const noGateOnServer = () => false;

export function SettingsPanel() {
  const t = useT();
  const { appearance, setAppearance } = useAppearance();
  const reset = useDesk((s) => s.reset);
  const mode = useTradingMode((s) => s.mode);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto pr-1">
      <h2 className="px-1 pb-3 text-2xs font-medium tracking-wide text-subtle uppercase">
        {t("settings.title")}
      </h2>

      <HandleCard />

      <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
        <div className="text-sm font-medium">{t("settings.language")}</div>
        <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.languageBody")}</p>
        <div className="mt-3">
          <LanguageSwitch />
        </div>
      </section>

      <TzCard />

      {mode === "live" ? <WalletCard /> : null}

      <PushCard />

      <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
        <div className="text-sm font-medium">{t("settings.tour")}</div>
        <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.tourBody")}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={() => replayDeskTour()}>
          {t("settings.replayTour")}
        </Button>
      </section>

      <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
        <div className="text-sm font-medium">{t("settings.appearance")}</div>
        <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.appearanceBody")}</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-surface p-1">
          {(["dark", "light", "system"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setAppearance(id)}
              className={cn(
                "flex h-11 flex-col items-center justify-center rounded-md px-1 text-center",
                appearance === id ? "bg-elevated text-fg" : "text-muted",
              )}
            >
              <span className="text-2xs font-medium">{t(`settings.${id}` as MsgKey)}</span>
            </button>
          ))}
        </div>
      </section>

      <SignOutCard />

      <FaqCard />

      {mode === "demo" ? (
        <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
          <div className="text-sm font-medium">{t("settings.reset")}</div>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.resetBody")}</p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="sell" className="mt-3 w-full">
                {t("header.resetBook")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("settings.reset")}</DialogTitle>
                <DialogDescription>{t("header.resetDeskBody")}</DialogDescription>
              </DialogHeader>
              <Button variant="sell" className="mt-4 w-full" onClick={reset}>
                {t("header.resetBook")}
              </Button>
            </DialogContent>
          </Dialog>
        </section>
      ) : null}
    </div>
  );
}

function TzCard() {
  const t = useT();
  const locale = useLocale();
  const tz = useTz();
  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">{t("settings.tz")}</div>
      <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.tzBody")}</p>
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-surface p-1">
        {TIMEZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => setTz(z.id)}
            aria-pressed={tz === z.id}
            className={cn(
              "flex h-10 items-center justify-center rounded-md px-1 text-center text-2xs font-medium",
              tz === z.id ? "bg-elevated text-fg" : "text-muted",
            )}
          >
            {locale === "pl" ? z.pl : z.en}
          </button>
        ))}
      </div>
    </section>
  );
}

function PushCard() {
  const t = useT();
  const push = usePushAlerts();
  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{t("settings.push")}</div>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.pushBody")}</p>
          {push.blocked ? (
            <p className="mt-1 text-2xs leading-relaxed text-muted">{t("alerts.blocked")}</p>
          ) : null}
        </div>
        <Switch
          checked={push.on}
          disabled={push.blocked || push.busy}
          onCheckedChange={(on) => {
            if (on) void push.subscribe(true);
            else void push.unsubscribe();
          }}
          aria-label={t("alerts.awayAria")}
        />
      </div>
    </section>
  );
}

function FaqCard() {
  const t = useT();
  const items = [
    ["faq.q1", "faq.a1"],
    ["faq.q2", "faq.a2"],
    ["faq.q3", "faq.a3"],
    ["faq.q4", "faq.a4"],
    ["faq.q5", "faq.a5"],
  ] as const;
  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">{t("settings.faq")}</div>
      <div className="mt-2 divide-y divide-border">
        {items.map(([q, a]) => (
          <details key={q} className="group py-2">
            <summary className="cursor-pointer list-none text-sm leading-relaxed text-fg [&::-webkit-details-marker]:hidden">
              <span className="mr-2 text-muted group-open:hidden">+</span>
              <span className="mr-2 hidden text-muted group-open:inline">–</span>
              {t(q)}
            </summary>
            <p className="mt-1.5 pl-4 text-2xs leading-relaxed text-muted">{t(a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function HandleCard() {
  const t = useT();
  const [username, setUsername] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let live = true;
    void loadProfile()
      .then((res) => {
        if (!live) return;
        setUsername(res.username);
        setLoaded(true);
      })
      .catch(() => {
        if (live) setLoaded(true);
      });
    return () => {
      live = false;
    };
  }, []);

  async function onClaim(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await claimUsername({ data: { username: draft } });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setUsername(res.username);
      setDraft("");
    } catch {
      setError(t("settings.handleFail"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">{t("settings.handle")}</div>
      {username ? (
        <>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.handleLocked")}</p>
          <div className="mt-3 rounded-md bg-surface px-3 py-2 font-mono text-sm tabular-nums">
            @{username}
          </div>
        </>
      ) : (
        <>
          <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.handlePick")}</p>
          {loaded ? (
            <form onSubmit={onClaim} className="mt-3 flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="your_name"
                autoComplete="off"
                spellCheck={false}
                className="h-11"
              />
              <Button type="submit" variant="secondary" disabled={busy || !draft.trim()} className="shrink-0 px-4">
                {busy ? "…" : t("settings.lock")}
              </Button>
            </form>
          ) : (
            <div className="mt-3 h-11 rounded-md bg-surface" />
          )}
          {error ? <p className="mt-2 text-2xs leading-relaxed text-down">{error}</p> : null}
        </>
      )}
    </section>
  );
}

function SignOutCard() {
  const t = useT();
  const [signingOut, setSigningOut] = useState(false);
  const gateSession = useSyncExternalStore(
    subscribeToNothing,
    hasGateSessionMarker,
    noGateOnServer,
  );
  if (!authEnabled || gateSession) return null;

  return (
    <section className="mt-3 rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]">
      <div className="text-sm font-medium">{t("settings.signOut")}</div>
      <p className="mt-0.5 text-2xs leading-relaxed text-muted">{t("settings.signOutBody")}</p>
      <Button
        variant="outline"
        className="mt-3 w-full"
        disabled={signingOut}
        onClick={() => {
          setSigningOut(true);
          void signOut("/login").catch(() => setSigningOut(false));
        }}
      >
        {signingOut ? t("settings.signingOut") : t("settings.signOut")}
      </Button>
    </section>
  );
}
