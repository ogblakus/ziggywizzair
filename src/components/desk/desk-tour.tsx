import { useEffect, useState, useSyncExternalStore } from "react";
import { APP_NAME, PlaneMark } from "@/components/desk/brand";
import { Button } from "@/components/ui/button";
import { dismissTour, requestTour, subscribeTour, tourSnapshot } from "@/lib/desk/tour";
import { useT, type MsgKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEP_KEYS = [
  { kicker: "tour.1.kicker", title: "tour.1.title", body: "tour.1.body" },
  { kicker: "tour.2.kicker", title: "tour.2.title", body: "tour.2.body" },
  { kicker: "tour.3.kicker", title: "tour.3.title", body: "tour.3.body" },
  { kicker: "tour.4.kicker", title: "tour.4.title", body: "tour.4.body" },
  { kicker: "tour.5.kicker", title: "tour.5.title", body: "tour.5.body" },
  { kicker: "tour.6.kicker", title: "tour.6.title", body: "tour.6.body" },
] as const satisfies Array<{ kicker: MsgKey; title: MsgKey; body: MsgKey }>;

export function DeskTour({
  ready,
  userId,
  onOpenSettings,
}: {
  ready: boolean;
  userId: string | null | undefined;
  onOpenSettings: () => void;
}) {
  const t = useT();
  const open = useSyncExternalStore(
    subscribeTour,
    () => tourSnapshot(userId),
    () => false,
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!ready || !open || !userId) return null;

  const last = step === STEP_KEYS.length - 1;
  const row = STEP_KEYS[step]!;

  function finish() {
    dismissTour(userId!);
  }

  return (
    <div
      className="absolute inset-0 z-[60] flex items-end justify-center bg-bg/80 p-3 sm:items-center"
      data-desk-tour="open"
    >
      <div className="flex max-h-[min(36rem,calc(100dvh-1.5rem))] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-elevated p-4 shadow-[var(--shadow-border)]">
        <div className="flex items-center gap-2">
          <PlaneMark className="size-8" />
          <div className="min-w-0">
            <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{t(row.kicker)}</div>
            <div className="text-sm font-medium">{APP_NAME}</div>
          </div>
          <div className="ml-auto font-mono text-2xs tabular-nums text-muted">
            {step + 1}/{STEP_KEYS.length}
          </div>
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight">{t(row.title)}</h2>
        <p className="mt-2 min-h-0 flex-1 overflow-y-auto text-sm leading-relaxed text-muted">
          {t(row.body, { app: APP_NAME })}
        </p>

        <div className="mt-4 flex justify-center gap-1.5">
          {STEP_KEYS.map((s, i) => (
            <span
              key={s.kicker}
              className={cn("h-1.5 rounded-full", i === step ? "w-4 bg-accent" : "w-1.5 bg-surface")}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            {step === 0 ? (
              <Button variant="ghost" className="flex-1" onClick={finish}>
                {t("tour.skip")}
              </Button>
            ) : (
              <Button variant="ghost" className="flex-1" onClick={() => setStep((n) => n - 1)}>
                {t("tour.back")}
              </Button>
            )}
            {last ? (
              <Button className="flex-1" onClick={finish}>
                {t("tour.gotIt")}
              </Button>
            ) : (
              <Button className="flex-1" onClick={() => setStep((n) => n + 1)}>
                {t("tour.next")}
              </Button>
            )}
          </div>
          {last ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                onOpenSettings();
                finish();
              }}
            >
              {t("tour.openSettings")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function replayDeskTour() {
  requestTour();
}
