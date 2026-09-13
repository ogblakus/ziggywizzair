import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowDownRight, ArrowUpRight, Bell, CheckCheck, CircleDot } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dropPushSubscription, getPushPublicKey, savePushSubscription } from "@/lib/desk/push-api";
import { useDesk } from "@/lib/desk-store";
import { isLot } from "@/lib/market/universe";
import { money, qtyFmt, signedClass, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { assetLabel, fillNoteLabel, fillSideLabel } from "@/lib/i18n/labels";
import { t, useT, type MsgKey } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import type { ClosedTrade } from "@/lib/types";

type AlertState = "off" | "on" | "blocked" | "busy";
const SEEN_KEY = "zw-alerts-seen";
const READ_KEY = "zw-alerts-read";

type InboxItem = {
  id: string;
  ts: number;
  kind: "open" | "close" | "proposal";
  title: string;
  body: string;
  pnl?: number;
};

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

function readIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? new Set(arr.filter((x) => typeof x === "string")) : new Set();
  } catch {
    return new Set();
  }
}

function writeIds(ids: Set<string>) {
  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify([...ids].slice(-240)));
  } catch {
    /* ignore */
  }
}

function placeInbox(anchor: DOMRect) {
  const pad = 12;
  const width = Math.min(380, window.innerWidth - pad * 2);
  const left = Math.min(Math.max(pad, anchor.right - width), window.innerWidth - width - pad);
  const top = Math.min(anchor.bottom + 8, window.innerHeight - pad);
  return { top, left, width };
}

function dayBucket(ts: number, now: number): "today" | "yesterday" | "earlier" {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (ts >= start.getTime()) return "today";
  if (ts >= start.getTime() - 86_400_000) return "yesterday";
  return "earlier";
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
  const closed = useDesk((s) => s.closedTrades);
  const proposal = useDesk((s) => s.proposal);
  const clock = useDesk((s) => s.clock);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(0);
  const [read, setRead] = useState<Set<string>>(() => new Set());
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSeen(readSeen());
    setRead(readIds());
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
      const node = e.target as Node;
      if (root.current?.contains(node) || panel.current?.contains(node)) return;
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

  const closedById = new Map<string, ClosedTrade>(closed.map((c) => [c.id, c]));
  const items: InboxItem[] = [];
  if (proposal && mode !== "live") {
    items.push({
      id: `proposal-${proposal.symbol}-${proposal.proposedAt ?? 0}`,
      ts: proposal.proposedAt ?? clock,
      kind: "proposal",
      title: tt("alerts.waiting"),
      body: `${fillSideLabel(proposal.side)} ${qtyFmt(proposal.qty, isLot(proposal.symbol))} ${assetLabel(proposal.symbol)}`,
    });
  }
  for (const f of fills.slice(0, 24)) {
    const row = closedById.get(f.id);
    const isClose = Boolean(row);
    items.push({
      id: f.id,
      ts: f.ts,
      kind: isClose ? "close" : "open",
      title: `${fillSideLabel(f.side)} ${qtyFmt(f.qty, isLot(f.symbol))} ${assetLabel(f.symbol)}`,
      body: isClose
        ? fillNoteLabel(row?.closeNote ?? f.note, f.source)
        : `@${f.price.toFixed(2)} · ${fillNoteLabel(f.note, f.source)}`,
      pnl: row?.pnl,
    });
  }
  items.sort((a, b) => b.ts - a.ts);

  function isUnread(id: string, ts: number) {
    if (read.has(id)) return false;
    return ts > seen;
  }

  const unread = items.filter((x) => isUnread(x.id, x.ts)).length;

  function toggle() {
    setOpen((v) => !v);
  }

  function markAll() {
    const ts = Math.max(Date.now(), items[0]?.ts ?? 0);
    writeSeen(ts);
    setSeen(ts);
    const next = new Set(read);
    for (const x of items) next.add(x.id);
    writeIds(next);
    setRead(next);
  }

  function markOne(id: string) {
    const next = new Set(read);
    next.add(id);
    writeIds(next);
    setRead(next);
  }

  const groups: Array<{ id: "today" | "yesterday" | "earlier"; items: InboxItem[] }> = [];
  for (const bucket of ["today", "yesterday", "earlier"] as const) {
    const rows = items.filter((x) => dayBucket(x.ts, clock) === bucket);
    if (rows.length) groups.push({ id: bucket, items: rows });
  }

  return (
    <div ref={root} className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tt("alerts.aria")}
        aria-expanded={open}
        className="relative size-11"
        onClick={toggle}
      >
        <Bell className={cn("size-4", unread > 0 ? "text-fg" : "text-muted")} />
        {unread > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-3xs tabular-nums text-accent-fg">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </Button>

      {open && pos && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panel}
              role="dialog"
              aria-label={tt("alerts.title")}
              className="inbox-pop overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]"
              style={{ position: "fixed", top: pos.top, left: pos.left, width: pos.width, zIndex: 80 }}
            >
              <div className="flex items-center gap-2 border-b border-border px-3.5 pt-3 pb-2.5">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium tracking-tight text-fg">{tt("alerts.title")}</div>
                  {unread > 0 ? (
                    <div className="mt-0.5 text-2xs text-muted">{tt("alerts.unreadCount", { n: unread })}</div>
                  ) : null}
                </div>
                {unread > 0 ? (
                  <button
                    type="button"
                    onClick={markAll}
                    className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg"
                  >
                    <CheckCheck className="size-3.5" />
                    {tt("alerts.markAll")}
                  </button>
                ) : null}
              </div>

              <div className="max-h-[min(28rem,70dvh)] overflow-y-auto pb-2">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-elevated text-subtle">
                      <Bell className="size-4" />
                    </span>
                    <p className="mt-3 text-sm font-medium text-fg">{tt("alerts.emptyTitle")}</p>
                    <p className="mt-1 max-w-[16rem] text-2xs leading-relaxed text-muted">
                      {mode === "live" ? tt("alerts.liveEmpty") : tt("alerts.emptyBody")}
                    </p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <section key={group.id} className="pt-1">
                      <h3 className="sticky top-0 z-10 bg-surface/95 px-3.5 py-1.5 text-2xs font-medium tracking-wide text-subtle uppercase">
                        {tt(`alerts.${group.id}` as MsgKey)}
                      </h3>
                      <ul className="px-2 pb-1">
                        {group.items.map((row) => {
                          const unreadRow = isUnread(row.id, row.ts);
                          const Icon =
                            row.kind === "close"
                              ? ArrowDownRight
                              : row.kind === "proposal"
                                ? CircleDot
                                : ArrowUpRight;
                          const iconTone =
                            row.kind === "proposal"
                              ? "bg-elevated text-fg"
                              : row.kind === "close"
                                ? row.pnl != null && row.pnl < 0
                                  ? "bg-down/10 text-down"
                                  : "bg-up/10 text-up"
                                : "bg-up/10 text-up";
                          return (
                            <li key={row.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  markOne(row.id);
                                  if (row.kind === "proposal") setOpen(false);
                                }}
                                className={cn(
                                  "flex w-full items-start gap-2.5 rounded-xl px-2 py-2.5 text-left",
                                  unreadRow ? "bg-elevated/80" : "hover:bg-elevated/50",
                                )}
                              >
                                <span
                                  className={cn(
                                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                                    iconTone,
                                  )}
                                >
                                  <Icon className="size-3.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-baseline justify-between gap-2">
                                    <span className="truncate text-xs font-medium text-fg">{row.title}</span>
                                    <span className="shrink-0 font-mono text-2xs text-subtle tabular-nums">
                                      {timeAgo(row.ts, clock)}
                                    </span>
                                  </span>
                                  <span className="mt-0.5 block truncate text-2xs leading-relaxed text-muted">
                                    {row.body}
                                  </span>
                                  <span className="mt-1 flex items-center gap-2">
                                    <span className="text-2xs text-subtle">
                                      {tt(`alerts.kind.${row.kind}` as MsgKey)}
                                    </span>
                                    {row.pnl != null ? (
                                      <span
                                        className={cn(
                                          "font-mono text-2xs tabular-nums",
                                          signedClass(row.pnl),
                                        )}
                                      >
                                        {tt("alerts.pnl", {
                                          value: `${row.pnl >= 0 ? "+" : ""}${money(row.pnl)}`,
                                        })}
                                      </span>
                                    ) : null}
                                  </span>
                                </span>
                                {unreadRow ? (
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                                ) : (
                                  <span className="mt-2 size-1.5 shrink-0" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
