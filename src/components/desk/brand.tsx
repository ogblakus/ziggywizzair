import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { t, useLocale, type MsgKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const APP_NAME = "ZiggyWizzAir";

const BOOT_LINES: MsgKey[] = [
  "splash.line1",
  "splash.line2",
  "splash.line3",
  "splash.line4",
  "splash.line5",
  "splash.line6",
  "splash.line7",
  "splash.line8",
];

const BOOT_MIN_MS = 3_200;

let bootShownAt = 0;

export function markBootSplash() {
  if (!bootShownAt) bootShownAt = Date.now();
}

export function bootSplashHolding(hydrated: boolean, feed: string) {
  if (!hydrated || feed === "idle") return true;
  const start = bootShownAt || Date.now();
  return Date.now() - start < BOOT_MIN_MS;
}

export function PlaneMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-accent text-accent-fg",
        className,
      )}
    >
      <Plane className="size-[58%] -rotate-45" strokeWidth={2.25} aria-hidden />
    </div>
  );
}

export function ModeKicker({ mode, className }: { mode: "demo" | "live"; className?: string }) {
  return (
    <p
      key={mode}
      className={cn(
        "mode-kicker text-3xs font-medium tracking-[0.22em] uppercase",
        mode === "live" ? "text-down" : "text-muted",
        className,
      )}
    >
      {mode}
    </p>
  );
}

export function TakeoffSplash({
  overlay,
  caption,
  kind = "takeoff",
  mode,
  cycle,
}: {
  overlay?: boolean;
  caption?: string;
  kind?: "takeoff" | "landing";
  mode?: "demo" | "live";
  cycle?: boolean;
}) {
  const locale = useLocale();
  const takeoff = kind === "takeoff";
  const [line, setLine] = useState(0);
  if (cycle) markBootSplash();

  useEffect(() => {
    if (!cycle) return;
    markBootSplash();
    const id = window.setInterval(() => setLine((n) => n + 1), 2_000);
    return () => window.clearInterval(id);
  }, [cycle]);

  const phrase = cycle ? t(BOOT_LINES[line % BOOT_LINES.length]!, undefined, locale) : caption;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center overflow-hidden bg-bg",
        overlay ? "absolute inset-0 z-50" : "h-dvh",
      )}
    >
      <div className="takeoff-stage relative flex h-40 w-full items-center justify-center">
        <span
          className={cn(takeoff ? "takeoff-contrail" : "landing-contrail", cycle && "takeoff-loop")}
          aria-hidden
        />
        <Plane
          className={cn(
            "size-14 text-fg",
            takeoff ? "takeoff-plane" : "landing-plane",
            cycle && "takeoff-loop",
          )}
          strokeWidth={1.75}
          aria-hidden
        />
      </div>
      <div className={cn("mt-2 text-center", !cycle && "takeoff-title")}>
        <p className="text-sm font-semibold tracking-tight">{APP_NAME}</p>
        {mode ? <ModeKicker mode={mode} className="mt-1.5" /> : null}
        {phrase ? (
          <p
            key={cycle ? `${locale}-${line}` : phrase}
            className={cn("mt-1.5 px-6 text-2xs tracking-wide text-muted", cycle && "splash-now")}
          >
            {phrase}
          </p>
        ) : null}
      </div>
    </div>
  );
}