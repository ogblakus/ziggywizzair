import { useCallback, useMemo, useRef, useState } from "react";
import { OrderTicket } from "@/components/desk/order-ticket";
import { PriceArea } from "@/components/desk/sparkline";
import { compactPrice, pct, signedClass } from "@/lib/format";
import { changePct } from "@/lib/market/engine";
import { useDesk, useSelectedTape } from "@/lib/desk-store";
import { useMark } from "@/lib/marks-store";
import type { MarketAsset, TickBar } from "@/lib/types";
import { useT, type MsgKey } from "@/lib/i18n";
import { assetName, assetLabel } from "@/lib/i18n/labels";
import { formatTzTime, timesAtClock, useTz } from "@/lib/tz";
import { cn } from "@/lib/utils";

type ChartTf = "1m" | "5m" | "15m";
const TF_KEY = "zw-chart-tf";
const TFS: Array<[ChartTf, MsgKey, MsgKey]> = [
  ["1m", "chart.tf1", "chart.win1"],
  ["5m", "chart.tf5", "chart.win5"],
  ["15m", "chart.tf15", "chart.win15"],
];

function readTf(): ChartTf {
  try {
    const v = window.localStorage.getItem(TF_KEY);
    if (v === "5m" || v === "15m") return v;
  } catch {
    /* private mode */
  }
  return "1m";
}

function writeTf(tf: ChartTf) {
  try {
    window.localStorage.setItem(TF_KEY, tf);
  } catch {
    /* private mode */
  }
}

const SESSIONS: Array<{ zone: string; h: number; m: number; key: MsgKey }> = [
  { zone: "", h: 0, m: 0, key: "chart.sess.utc" },
  { zone: "Europe/London", h: 8, m: 0, key: "chart.sess.london" },
  { zone: "America/New_York", h: 9, m: 30, key: "chart.sess.ny" },
  { zone: "Asia/Tokyo", h: 9, m: 0, key: "chart.sess.tokyo" },
];

function sessionMarks(bars: TickBar[], tz: string, label: (key: MsgKey) => string) {
  if (bars.length < 2) return [];
  const from = bars[0]!.t;
  const to = bars.at(-1)!.t;
  if (!(to > from)) return [];
  const out: Array<{ t: number; label: string }> = [];
  for (const s of SESSIONS) {
    const zone = s.zone || tz;
    for (const ts of timesAtClock(from, to, zone, s.h, s.m)) {
      out.push({ t: ts, label: label(s.key) });
    }
  }
  return out;
}

function xOfTime(t: number, bars: TickBar[]) {
  const n = bars.length;
  if (n < 2) return null;
  const first = bars[0]!.t;
  const last = bars[n - 1]!.t;
  if (t <= first) return 0;
  if (t >= last) return 100;
  for (let i = 1; i < n; i++) {
    const b = bars[i]!.t;
    if (t <= b) {
      const a = bars[i - 1]!.t;
      const f = b === a ? 0 : (t - a) / (b - a);
      return ((i - 1 + f) / (n - 1)) * 100;
    }
  }
  return null;
}

/** Chart + ticket. Ticket is the last row (`auto`) so buy/sell cannot be clipped. */
export function MarketDesk() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="min-h-[72px] flex-1 overflow-hidden">
        <ChartPanel />
      </div>
      <div className="shrink-0">
        <OrderTicket />
      </div>
    </div>
  );
}

export function ChartPanel() {
  const asset = useSelectedTape();
  const selected = useDesk((s) => s.selected);
  const t = useT();
  const [tf, setTf] = useState<ChartTf>(readTf);

  function pick(next: ChartTf) {
    setTf(next);
    writeTf(next);
  }

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        {t("chart.select")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <LiveChartHead asset={asset} tf={tf} onTf={pick} />
      <LivePlot asset={asset} selected={selected} tf={tf} />
    </div>
  );
}

function barTime(t: number, tz: string) {
  return formatTzTime(t, tz);
}

function LiveChartHead({
  asset,
  tf,
  onTf,
}: {
  asset: MarketAsset;
  tf: ChartTf;
  onTf: (tf: ChartTf) => void;
}) {
  const t = useT();
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const chg = changePct(live, asset.open);
  const title = assetLabel(asset.symbol);
  const sub = assetName(asset.symbol);
  return (
    <div className="flex shrink-0 items-end justify-between gap-2 pb-1.5">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h2 data-chart-symbol={asset.symbol} className="text-base font-semibold tracking-tight sm:text-lg">
            {title}
          </h2>
          {sub !== title ? (
            <span className="truncate text-xs text-muted sm:text-sm">{sub}</span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="font-mono text-xl tabular-nums tracking-tight sm:text-2xl">
            {live ? compactPrice(live) : "—"}
          </span>
          {live ? (
            <span className={`font-mono text-sm tabular-nums ${signedClass(chg)}`}>{pct(chg)}</span>
          ) : (
            <span className="text-sm text-subtle">{t("chart.connecting")}</span>
          )}
        </div>
      </div>
      <div
        role="group"
        aria-label={t("chart.tf")}
        className="grid shrink-0 grid-cols-3 gap-0.5 rounded-lg bg-elevated p-0.5"
      >
        {TFS.map(([id, label, win]) => (
          <button
            key={id}
            type="button"
            onClick={() => onTf(id)}
            aria-pressed={tf === id}
            className={cn(
              "flex h-8 min-w-[2.6rem] flex-col items-center justify-center rounded-md px-1 leading-none",
              tf === id ? "bg-surface text-fg" : "text-muted",
            )}
          >
            <span className="text-2xs font-medium">{t(label)}</span>
            <span className="text-3xs text-subtle">{t(win)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function resample(bars: TickBar[], stepMs: number): TickBar[] {
  if (bars.length < 2 || !(stepMs > 0)) return bars;
  const out: TickBar[] = [];
  for (const b of bars) {
    const bucket = Math.floor(b.t / stepMs) * stepMs;
    const last = out.at(-1);
    if (!last || last.t !== bucket) {
      out.push({ t: bucket, px: b.px, o: b.o ?? b.px, h: b.h ?? b.px, l: b.l ?? b.px, v: b.v });
    } else {
      last.px = b.px;
      last.h = Math.max(last.h ?? last.px, b.h ?? b.px);
      last.l = Math.min(last.l ?? last.px, b.l ?? b.px);
      if (b.v) last.v = (last.v ?? 0) + b.v;
    }
  }
  return out;
}

function barsForTf(asset: MarketAsset, tf: ChartTf): TickBar[] {
  if (tf === "15m") {
    const m15 = asset.htf?.m15;
    if (m15 && m15.length >= 12) return m15.slice(-96);
    return [];
  }
  if (tf === "5m") {
    if (asset.chart5 && asset.chart5.length >= 12) return asset.chart5.slice(-90);
    if (asset.series.length >= 12) return resample(asset.series, 5 * 60_000).slice(-90);
    return [];
  }
  return asset.series.length >= 2 ? asset.series.slice(-90) : [];
}

function SessionOverlay({ bars }: { bars: TickBar[] }) {
  const t = useT();
  const tz = useTz();
  const marks = useMemo(() => sessionMarks(bars, tz, t), [bars, tz, t]);
  if (marks.length === 0 || bars.length < 2) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {marks.map((m) => {
        const left = xOfTime(m.t, bars);
        if (left == null || left < 0 || left > 100) return null;
        const flip = left > 88;
        return (
          <div key={`${m.t}-${m.label}`} className="absolute top-0 bottom-0" style={{ left: `${left}%` }}>
            <div className="h-full w-px bg-fg/20" />
            <span
              className={cn(
                "absolute top-0.5 whitespace-nowrap text-3xs tracking-wide text-subtle/80",
                flip ? "right-1" : "left-1",
              )}
            >
              {m.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LivePlot({ asset, selected, tf }: { asset: MarketAsset; selected: string; tf: ChartTf }) {
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const [scrub, setScrub] = useState<TickBar | null>(null);
  const up = changePct(live, asset.open) >= 0;
  const raw = barsForTf(asset, tf);
  const held = useRef<TickBar[]>([]);
  const prev = held.current;
  const same =
    prev.length === raw.length &&
    prev.at(-1)?.t === raw.at(-1)?.t &&
    prev.at(-1)?.px === raw.at(-1)?.px &&
    prev[0]?.t === raw[0]?.t;
  if (!same) held.current = raw;
  const bars = held.current;
  const onScrub = useCallback((bar: TickBar | null) => setScrub(bar), []);
  const resetKey = `${selected}-${tf}-${bars[0]?.t ?? 0}-${bars.length}`;
  const t = useT();
  const tz = useTz();
  if (bars.length < 2) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted">
        {t("chart.wait")}
      </div>
    );
  }
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {scrub ? (
        <span className="pointer-events-none absolute top-1 left-1 z-10 font-mono text-2xs tabular-nums text-subtle">
          {barTime(scrub.t, tz)} {compactPrice(scrub.px)}
        </span>
      ) : null}
      <SessionOverlay bars={bars} />
      <PriceArea key={`${selected}-${tf}`} bars={bars} up={up} onScrub={onScrub} fill resetKey={resetKey} />
    </div>
  );
}
