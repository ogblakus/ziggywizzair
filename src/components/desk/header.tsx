import { useState } from "react";
import { Settings, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AlertsButton } from "@/components/desk/alerts-button";
import { FloorControls } from "@/components/desk/autopilot-switch";
import { APP_NAME, PlaneMark } from "@/components/desk/brand";
import { SettingsPanel } from "@/components/desk/settings-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { money, pct, signedClass } from "@/lib/format";
import { bookEquity, useDesk, useFeed, useMarkedAssets } from "@/lib/desk-store";
import { shortAddress } from "@/lib/wallet/ethereum";
import { useLiveWallet } from "@/lib/wallet/live-store";
import { useTradingMode } from "@/lib/trading-mode";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function DeskHeader({
  focusChat = false,
  onConvene,
}: {
  focusChat?: boolean;
  onConvene?: () => void;
}) {
  const setAutopilot = useDesk((s) => s.setAutopilot);
  const feed = useFeed();
  const mode = useTradingMode((s) => s.mode);
  const t = useT();
  const [settings, setSettings] = useState(false);
  const setMode = useTradingMode((s) => s.setMode);
  const address = useLiveWallet((s) => s.address);
  const source = useLiveWallet((s) => s.source);
  const refresh = useLiveWallet((s) => s.refresh);

  function requestLive() {
    setAutopilot(false);
    setMode("live");
    if (address && source === "metamask") void refresh();
    toast.success(t("mode.liveOn"));
  }

  return (
    <header className="shrink-0 border-b border-border" data-mode={mode}>
      <div className="flex h-14 min-w-0 items-center gap-1.5 px-2.5 sm:gap-3 sm:px-4">
        <div className="flex min-w-0 shrink items-center gap-2">
          <PlaneMark className="size-8 shrink-0" />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <h1 className="hidden truncate text-xs font-semibold tracking-tight min-[24rem]:block sm:text-sm">
                {APP_NAME}
              </h1>
              <span className="inline-flex items-center gap-1.5 text-2xs font-medium text-muted">
                <span
                  className={`size-1.5 shrink-0 rounded-full ${feed === "live" ? "live-dot bg-up" : feed === "stale" ? "bg-down" : "bg-subtle"}`}
                />
              </span>
            </div>
            <p className="text-3xs font-medium tracking-[0.18em] text-subtle uppercase">
              {mode === "demo" ? t("desk.engineChip") : t("desk.engineLive")}
            </p>
          </div>
        </div>

        <ModeSwitch onRequestLive={requestLive} />

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-3">
          <LiveStats className={cn("hidden xl:flex xl:items-center xl:gap-3", focusChat && "xl:hidden")} />

          {onConvene ? <FloorControls onConvene={onConvene} className="hidden lg:flex" /> : null}

          <AlertsButton />

          <LiveWalletChip />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={t("nav.settings")}
                onClick={() => setSettings(true)}
              >
                <Settings className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("nav.settings")}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {focusChat ? null : (
        <div className="grid h-11 grid-cols-3 items-center gap-2 border-t border-border px-3 xl:hidden">
          <LiveStats mobile />
        </div>
      )}
      {focusChat ? null : (
      <div
        className={cn(
          "flex min-h-9 items-center gap-2 border-t border-border px-3 py-1.5 sm:px-4",
          mode === "live" ? "bg-down/5" : "bg-transparent",
        )}
      >
        <span
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            mode === "live" ? "bg-down" : "bg-subtle",
          )}
        />
        <p className="min-w-0 flex-1 text-2xs leading-snug text-muted">
          {mode === "live"
            ? address
              ? t("mode.banner")
              : t("mode.liveNoWallet")
            : t("mode.demoBanner")}
        </p>
        {mode === "demo" ? (
          <Button variant="secondary" size="sm" className="h-9 shrink-0 px-2.5 text-2xs" onClick={requestLive}>
            {t("mode.goLive")}
          </Button>
        ) : null}
      </div>
      )}
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent className="max-h-[min(85dvh,calc(100dvh-2rem))] w-[min(28rem,calc(100vw-1.5rem))] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("nav.settings")}</DialogTitle>
          </DialogHeader>
          <SettingsPanel />
        </DialogContent>
      </Dialog>
    </header>
  );
}

function ModeSwitch({ onRequestLive }: { onRequestLive: () => void }) {
  const t = useT();
  const mode = useTradingMode((s) => s.mode);
  const setMode = useTradingMode((s) => s.setMode);

  function goDemo() {
    setMode("demo");
    toast.message(t("mode.demoOn"));
  }

  return (
    <div
      role="group"
      aria-label={t("settings.mode")}
      className="grid shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-surface p-0.5"
    >
      <button
        type="button"
        onClick={goDemo}
        aria-label={t("mode.demo")}
        aria-pressed={mode === "demo"}
        className={cn(
          "flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1.5 text-2xs font-medium sm:min-w-[3.25rem] sm:px-3 sm:text-xs",
          mode === "demo" ? "bg-elevated text-fg" : "text-muted",
        )}
      >
        {t("mode.demo")}
      </button>
      <button
        type="button"
        onClick={onRequestLive}
        aria-label={t("mode.live")}
        aria-pressed={mode === "live"}
        className={cn(
          "flex h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md px-1.5 text-2xs font-medium sm:min-w-[3.25rem] sm:px-3 sm:text-xs",
          mode === "live" ? "bg-elevated text-fg" : "text-muted",
        )}
      >
        {t("mode.live")}
      </button>
    </div>
  );
}

function LiveWalletChip() {
  const mode = useTradingMode((s) => s.mode);
  const address = useLiveWallet((s) => s.address);
  const equity = useLiveWallet((s) => s.equity);
  const wallet = useLiveWallet((s) => s.wallet);
  if (mode !== "live" || !address) return null;
  const usdc = (wallet?.usdcEth ?? 0) + (wallet?.usdcArb ?? 0);
  const shown = (equity ?? 0) > 0.5 ? equity : usdc;
  return (
    <div
      className="hidden items-center gap-1.5 rounded-md bg-surface px-2 py-1 sm:flex"
      title={address}
    >
      <Wallet className="size-3.5 text-accent" />
      <span className="font-mono text-2xs tabular-nums text-muted">
        {shortAddress(address)}
        {shown ? ` · ${money(shown)}` : ""}
      </span>
    </div>
  );
}

function LiveStats({ mobile, className }: { mobile?: boolean; className?: string }) {
  const t = useT();
  const mode = useTradingMode((s) => s.mode);
  const cash = useDesk((s) => s.cash);
  const positions = useDesk((s) => s.positions);
  const assets = useMarkedAssets();
  const starting = useDesk((s) => s.startingEquity);
  const liveEq = useLiveWallet((s) => s.equity);
  const liveSpot = useLiveWallet((s) => s.hlSpotUsdc);
  const livePos = useLiveWallet((s) => s.positions);
  const demoEq = bookEquity(cash, positions, assets);
  const equity = mode === "live" ? (liveEq ?? 0) : demoEq;
  const cashShown = mode === "live" ? (liveSpot ?? 0) : cash;
  const pnl =
    mode === "live"
      ? livePos.reduce((sum, p) => sum + p.pnl, 0)
      : demoEq - starting;
  const pnlPct = mode === "live" ? 0 : starting ? (pnl / starting) * 100 : 0;
  const equityLabel = mode === "live" ? t("header.equityHl") : t("header.equity");
  const cashLabel = mode === "live" ? t("header.cashHl") : t("header.cash");

  if (mobile) {
    return (
      <>
        <div>
          <div className="text-2xs font-medium tracking-wide text-subtle uppercase truncate">{equityLabel}</div>
          <div className="font-mono text-sm tabular-nums">{money(equity)}</div>
        </div>
        <div>
          <div className="text-2xs font-medium tracking-wide text-subtle uppercase truncate">{cashLabel}</div>
          <div className="font-mono text-sm tabular-nums text-muted">{money(cashShown)}</div>
        </div>
        <div className="text-right">
          <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("header.pnl")}</div>
          <div className={`font-mono text-sm tabular-nums ${signedClass(pnl)}`}>{money(pnl)}</div>
        </div>
      </>
    );
  }

  return (
    <div className={className}>
      <Stat label={equityLabel} value={money(equity)} />
      <Stat
        label={t("header.pnl")}
        value={mode === "live" ? money(pnl) : pct(pnlPct)}
        tone={signedClass(pnl)}
      />
      <Stat label={cashLabel} value={money(cashShown)} muted className="hidden xl:block" />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  muted,
  className,
}: {
  label: string;
  value: string;
  tone?: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="text-2xs font-medium tracking-wide text-subtle uppercase truncate">{label}</div>
      <div className={`font-mono text-sm tabular-nums ${tone ?? (muted ? "text-muted" : "text-fg")}`}>
        {value}
      </div>
    </div>
  );
}
