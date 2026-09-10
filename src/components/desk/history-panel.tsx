import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AGENT_BY_ID } from "@/lib/agents/personas";
import { compactPrice, money, pct, signedClass } from "@/lib/format";
import { explainTrade, humanCloseNote } from "@/lib/portfolio";
import { useDesk } from "@/lib/desk-store";
import { useLocale, useT, type Locale } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { useLiveWallet } from "@/lib/wallet/live-store";
import { cn } from "@/lib/utils";
import type { ClosedTrade } from "@/lib/types";

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function stamp(ts: number, locale: Locale) {
  return new Date(ts).toLocaleString(locale === "pl" ? "pl-PL" : "en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function held(openedAt: number | undefined, closedAt: number, locale: Locale) {
  if (!openedAt || closedAt <= openedAt) return null;
  const ms = closedAt - openedAt;
  const min = Math.round(ms / 60_000);
  if (min < 60) return locale === "pl" ? `${min} min` : `${min} min`;
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (h < 48) return locale === "pl" ? `${h} godz. ${r} min` : `${h}h ${r}m`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return locale === "pl" ? `${d} d ${rh} godz.` : `${d}d ${rh}h`;
}

function dayLabel(ts: number, locale: Locale) {
  return new Date(ts).toLocaleDateString(locale === "pl" ? "pl-PL" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function HistoryPanel() {
  const mode = useTradingMode((s) => s.mode);
  const demoClosed = useDesk((s) => s.closedTrades);
  const liveClosed = useLiveWallet((s) => s.closed);
  const liveAddr = useLiveWallet((s) => s.address);
  const closed = mode === "live" ? (liveClosed ?? []) : demoClosed;
  const t = useT();
  const locale = useLocale();
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({});
  const [openTrades, setOpenTrades] = useState<Record<string, boolean>>({});

  const days = useMemo(() => {
    const map = new Map<string, { ts: number; trades: ClosedTrade[]; pnl: number }>();
    for (const row of closed) {
      const k = dayKey(row.ts);
      const cur = map.get(k) ?? { ts: row.ts, trades: [], pnl: 0 };
      cur.trades.push(row);
      cur.pnl += row.pnl;
      map.set(k, cur);
    }
    return [...map.entries()].sort((a, b) => b[1].ts - a[1].ts);
  }, [closed]);

  if (!closed.length) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <h2 className="shrink-0 px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase">
          {t("hist.title")}
        </h2>
        <p className="px-1 text-sm leading-relaxed text-muted">
          {mode === "live"
            ? liveAddr
              ? t("hist.liveEmpty")
              : t("hist.liveNeedWallet")
            : t("hist.empty")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="shrink-0 px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase">
        {t("hist.title")}
      </h2>
      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
        {days.map(([key, day]) => {
          const open = openDays[key] ?? false;
          return (
            <li key={key} className="rounded-xl bg-elevated shadow-[var(--shadow-border)]">
              <button
                type="button"
                onClick={() => setOpenDays((s) => ({ ...s, [key]: !open }))}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{dayLabel(day.ts, locale)}</span>
                  <span className="block text-2xs text-muted">
                    {t(day.trades.length === 1 ? "hist.one" : "hist.n", { n: day.trades.length })}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={`font-mono text-sm tabular-nums ${signedClass(day.pnl)}`}>{money(day.pnl)}</span>
                  <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
                </span>
              </button>
              {open ? (
                <ul className="space-y-1 border-t border-border px-2 py-2">
                  {day.trades.map((row) => {
                    const shown = openTrades[row.id] ?? false;
                    const side = row.side === "short" ? t("port.short") : t("port.long");
                    return (
                      <li key={row.id} className="rounded-lg bg-surface">
                        <button
                          type="button"
                          onClick={() => setOpenTrades((s) => ({ ...s, [row.id]: !shown }))}
                          className="flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left"
                        >
                          <span className="min-w-0">
                            <span className="block font-mono text-sm font-medium">{row.symbol}</span>
                            <span className="block text-2xs text-muted capitalize">
                              {side}
                              {held(row.openedAt, row.ts, locale) ? ` · ${held(row.openedAt, row.ts, locale)}` : ""}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            <span className={`font-mono text-sm tabular-nums ${signedClass(row.pnl)}`}>
                              {money(row.pnl)}
                              {row.pnlPct != null ? ` ${pct(row.pnlPct)}` : ""}
                            </span>
                            <ChevronDown className={cn("size-4 text-muted transition-transform", shown && "rotate-180")} />
                          </span>
                        </button>
                        {shown ? <TradeBody row={row} /> : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TradeBody({ row }: { row: ClosedTrade }) {
  const t = useT();
  const locale = useLocale();
  const analysis = explainTrade(row, locale) || row.analysis || t("hist.none");
  return (
    <div className="space-y-2 border-t border-border px-2.5 py-2 text-sm leading-relaxed">
      <p className="font-mono text-2xs text-muted tabular-nums">
        {row.qty != null ? `${row.qty} · ` : ""}
        {row.entry ? `${t("hist.entry")} ${compactPrice(row.entry)}` : ""}
        {row.exit ? ` → ${t("hist.exit")} ${compactPrice(row.exit)}` : ""}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-2xs">
        <dt className="text-subtle">{t("hist.opened")}</dt>
        <dd className="font-mono tabular-nums text-fg">
          {row.openedAt ? stamp(row.openedAt, locale) : t("hist.none")}
        </dd>
        <dt className="text-subtle">{t("hist.closedAt")}</dt>
        <dd className="font-mono tabular-nums text-fg">{stamp(row.ts, locale)}</dd>
        <dt className="text-subtle">{t("hist.held")}</dt>
        <dd className="font-mono tabular-nums text-fg">{held(row.openedAt, row.ts, locale) ?? t("hist.none")}</dd>
      </dl>
      <Block label={t("hist.analysis")} body={analysis} />
      <Block label={t("hist.whyIn")} body={row.entryNote || t("hist.none")} />
      <Block label={t("hist.whyOut")} body={humanCloseNote(row, locale)} />
      <div>
        <p className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("hist.agents")}</p>
        {row.agents?.length ? (
          <ul className="mt-1 space-y-1.5">
            {row.agents.map((a) => (
              <li key={a.id} className="rounded-md bg-elevated px-2 py-1.5">
                <p className="text-2xs font-medium">
                  {AGENT_BY_ID[a.id]?.name ?? a.id}
                  <span className="ml-1.5 font-mono font-normal text-muted uppercase">{a.vote}</span>
                </p>
                <p className="mt-0.5 text-2xs leading-relaxed text-muted">{a.thesis}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-2xs text-muted">{t("hist.none")}</p>
        )}
      </div>
    </div>
  );
}

function Block({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <p className="text-2xs font-medium tracking-wide text-subtle uppercase">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-xs leading-relaxed text-fg">{body}</p>
    </div>
  );
}
