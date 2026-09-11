import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellRing } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dropPushSubscription, getPushPublicKey, savePushSubscription } from "@/lib/desk/push-api";
import { useDesk } from "@/lib/desk-store";
import { isLot } from "@/lib/market/universe";
import { qtyFmt, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { assetLabel, fillNoteLabel, fillSideLabel } from "@/lib/i18n/labels";
import { t, useT } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";

type AlertState = "off" | "on" | "blocked" | "busy";
const SEEN_KEY = "zw-alerts-seen";

function withTimeout<T>(p: Promise<T>, ms: number) {
  return Promise.race([
    p,
    new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error("timeout")), ms);
    }),
  ]);
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function permissionOf(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function readSeen() {
  if (typeof window === "undefined") return 0;
  const n = Number(window.localStorage.getItem(SEEN_KEY) ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function writeSeen(ts: number) {
  try {
    window.localStorage.setItem(SEEN_KEY, String(ts));
  } catch {
    /* ignore */
  }
}

function placeInbox(anchor: DOMRect) {
  const pad = 12;
  const width = Math.min(328, window.innerWidth - pad * 2);
  const left = Math.min(Math.max(pad, anchor.right - width), window.innerWidth - width - pad);
  const top = Math.min(anchor.bottom + 8, window.innerHeight - pad);
  return { top, left, width };
}

export function usePushAlerts() {
  const [state, setState] = useState<AlertState>("off");

  useEffect(() => {
    const perm = permissionOf();
    if (perm === "granted") {
      setState("on");
      void subscribe(false);
    } else if (perm === "denied" || perm === "unsupported") {
      setState("blocked");
    }
  }, []);

  async function subscribe(prompt: boolean) {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      if (prompt) toast.message(t("alerts.needApp"));
      setState("blocked");
      return false;
    }
    setState("busy");
    try {
      const perm = prompt ? await Notification.requestPermission() : Notification.permission;
      if (perm !== "granted") {
        setState(perm === "denied" ? "blocked" : "off");
        if (prompt) toast.message(t("alerts.blockedToast"));
        return false;
      }
      const reg = await withTimeout(
        navigator.serviceWorker.register("/desk-sw.js", { scope: "/" }),
        3_000,
      );
      await withTimeout(navigator.serviceWorker.ready, 3_000);
      const { publicKey } = await withTimeout(getPushPublicKey(), 4_000);
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }
      const json = sub.toJSON();
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!json.endpoint || !p256dh || !auth) throw new Error("bad sub");
      await savePushSubscription({
        data: { endpoint: json.endpoint, keys: { p256dh, auth } },
      });
      setState("on");
      if (prompt) {
        await reg.showNotification(t("alerts.onTitle"), {
          body: t("alerts.onBody"),
          tag: "quorum-ready",
          icon: "/__grok/icon-180.png",
        });
        toast.success(t("alerts.onToast"));
      }
      return true;
    } catch {
      setState("blocked");
      if (prompt) toast.message(t("alerts.needStandalone"));
      return false;
    }
  }

  async function unsubscribe() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await dropPushSubscription({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
    } catch {
      /* still mark off */
    }
    setState("off");
    toast.message(t("alerts.offToast"));
  }

  return {
    state,
    on: state === "on",
    blocked: state === "blocked",
    busy: state === "busy",
    subscribe,
    unsubscribe,
  };
}

export function AlertsButton({ className }: { className?: string }) {
  const tt = useT();
  const mode = useTradingMode((s) => s.mode);
  const allFills = useDesk((s) => s.fills);
  const fills = mode === "live" ? [] : allFills;
  const clock = useDesk((s) => s.clock);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeen(readSeen());
  }, []);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const box = root.current?.getBoundingClientRect();
      if (box) setPos(placeInbox(box));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || panel.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const latest = fills[0]?.ts ?? 0;
  const unread = fills.filter((f) => f.ts > seen).length;
  const Icon = unread > 0 ? BellRing : Bell;

  function toggle() {
    setOpen((v) => !v);
  }

  function markAll() {
    const ts = Math.max(Date.now(), latest);
    writeSeen(ts);
    setSeen(ts);
  }

  return (
    <div ref={root} className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tt("alerts.aria")}
        aria-expanded={open}
        className={cn("relative", className)}
        onClick={toggle}
      >
        <Icon className="size-4 text-fg" />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />
        ) : null}
      </Button>

      {open && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panel}
              role="dialog"
              aria-label={tt("alerts.title")}
              className="overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-border)]"
              style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 80 }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                <div className="text-2xs font-medium tracking-wide text-subtle uppercase">{tt("alerts.title")}</div>
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={markAll}
                    className="text-2xs font-medium text-fg"
                  >
                    {tt("alerts.markAll")}
                  </button>
                ) : (
                  <span className="font-mono text-2xs text-subtle tabular-nums">{fills.length}</span>
                )}
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {fills.length === 0 ? (
                  <li className="px-3 py-6 text-sm leading-relaxed text-muted">
                    {mode === "live" ? tt("port.liveFills") : tt("alerts.emptyBody")}
                  </li>
                ) : (
                  fills.slice(0, 24).map((f) => (
                    <li
                      key={f.id}
                      className={cn(
                        "border-b border-border px-3 py-2.5 last:border-b-0",
                        f.ts > seen ? "bg-accent/10" : "",
                      )}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "font-mono text-xs font-medium tabular-nums",
                            f.side === "buy" ? "text-up" : "text-down",
                          )}
                        >
                          {fillSideLabel(f.side)} {qtyFmt(f.qty, isLot(f.symbol))} {assetLabel(f.symbol)}
                        </span>
                        <span className="font-mono text-2xs text-subtle tabular-nums">
                          {timeAgo(f.ts, clock)}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono text-2xs text-muted tabular-nums">
                        @{f.price.toFixed(2)} · {fillNoteLabel(f.note, f.source)}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
