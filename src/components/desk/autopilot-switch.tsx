import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDesk } from "@/lib/desk-store";
import { useTradingMode } from "@/lib/trading-mode";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SKIP_KEY = "zw-skip-autopilot-warn";

function skipWarn() {
  try {
    return window.localStorage.getItem(SKIP_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberSkip() {
  try {
    window.localStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* private mode */
  }
}

export function AutopilotSwitch({
  className,
  showLabel = true,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const t = useT();
  const autopilot = useDesk((s) => s.autopilot);
  const setAutopilot = useDesk((s) => s.setAutopilot);
  const mode = useTradingMode((s) => s.mode);
  const [open, setOpen] = useState(false);
  const [skip, setSkip] = useState(false);

  function request(on: boolean) {
    if (!on) {
      setAutopilot(false);
      return;
    }
    if (skipWarn()) {
      setAutopilot(true);
      return;
    }
    setSkip(false);
    setOpen(true);
  }

  function confirm() {
    if (skip) rememberSkip();
    setOpen(false);
    setAutopilot(true);
  }

  return (
    <>
      <label className={cn("flex items-center gap-2", className)}>
        {showLabel ? (
          <span className="text-2xs font-medium text-muted">
            {autopilot ? t("floor.autopilotLive") : t("header.autopilot")}
          </span>
        ) : null}
        <Switch
          checked={autopilot}
          onCheckedChange={request}
          disabled={mode === "live"}
          aria-label={t("header.autopilot")}
        />
      </label>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("auto.warnTitle")}</DialogTitle>
            <DialogDescription>{t("auto.warnBody")}</DialogDescription>
          </DialogHeader>
          <label className="mt-4 flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={skip}
              onChange={(e) => setSkip(e.target.checked)}
            />
            {t("auto.warnSkip")}
          </label>
          <div className="mt-4 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setOpen(false)}>
              {t("auto.warnCancel")}
            </Button>
            <Button className="flex-1" onClick={confirm}>
              {t("auto.warnConfirm")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Autopilot, then manual convene on its right. */
export function FloorControls({
  onConvene,
  className,
}: {
  onConvene: () => void;
  className?: string;
}) {
  const t = useT();
  const convening = useDesk((s) => s.convening);
  const mode = useTradingMode((s) => s.mode);
  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)}>
      {mode === "demo" ? <AutopilotSwitch /> : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 shrink-0 px-2.5 text-2xs"
            onClick={onConvene}
            disabled={convening}
          >
            {convening ? t("header.inSession") : t("header.convene")}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("header.conveneTip")}</TooltipContent>
      </Tooltip>
    </div>
  );
}
