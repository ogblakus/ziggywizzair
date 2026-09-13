import { useEffect, useMemo, useState } from "react";
import { OrderTicket } from "@/components/desk/order-ticket";
import { PriceArea } from "@/components/desk/sparkline";
import { compactPrice, pct, signedClass } from "@/lib/format";
import { changePct } from "@/lib/market/engine";
import { fetchSymbolChart, type ChartTf } from "@/lib/market/quotes";
import { useDesk, useSelectedTape } from "@/lib/desk-store";
import { useMark } from "@/lib/marks-store";
import type { MarketAsset, TickBar } from "@/lib/types";
import { useT, type MsgKey } from "@/lib/i18n";
import { assetName, assetLabel } from "@/lib/i18n/labels";
import { formatTzTime, timesAtClock, useTz } from "@/lib/tz";
import { cn } from "@/lib/utils";

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
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChartPanel />
      </div>
      <div className="shrink-0">
        <OrderTicket />
      </div>
    </div>
  );
}

function nativeBars(asset: MarketAsset | undefined, tf: ChartTf): TickBar[] | undefined {
  if (!asset) return undefined;
  if (tf === "15m") return asset.htf?.m15;
  if (tf === "5m") return asset.chart5;
  return asset.series;
}

const chartPulls = new Map<string, Promise<void>>();
const plotCache = new Map<string, TickBar[]>();

/** Pull one coin/interval only when the desk does not already have native bars. */
export function warmSymbolChart(symbol: string, tf: ChartTf) {
  const k = `${symbol}:${tf}`;
  const pending = chartPulls.get(k);
  if (pending) return pending;
  const asset = useDesk.getState().assets[symbol];
  const native = nativeBars(asset, tf);
  if (native && native.length >= 8) return Promise.resolve();
  const p = fetchSymbolChart({ data: { symbol, tf } })
    .then((res) => {
      if (res.ok) useDesk.getState().applySymbolChart(res.symbol, res.tf, res.bars);
    })
    .catch(() => undefined)
    .finally(() => {
      chartPulls.delete(k);
    });
  chartPulls.set(k, p);
  return p;
}

function stubBars(asset: MarketAsset): TickBar[] {
  const px = (asset.livePx && asset.livePx > 0 ? asset.livePx : 0) || asset.price;
  const open = asset.open > 0 ? asset.open : px;
  if (!(px > 0)) return [];
  const now = Date.now();
  return [
    { t: now - 60_000, px: open, o: open, h: Math.max(open, px), l: Math.min(open, px) },
    { t: now, px, o: open, h: Math.max(open, px), l: Math.min(open, px) },
  ];
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
    if (m15 && m15.length >= 2) return m15.slice(-96);
    if (asset.chart5 && asset.chart5.length >= 2) return resample(asset.chart5, 15 * 60_000).slice(-96);
    if (asset.series.length >= 2) return resample(asset.series, 15 * 60_000).slice(-96);
  } else if (tf === "5m") {
    if (asset.chart5 && asset.chart5.length >= 2) return asset.chart5.slice(-90);
    if (asset.series.length >= 2) return resample(asset.series, 5 * 60_000).slice(-90);
  } else if (asset.series.length >= 2) {
    return asset.series.slice(-90);
  }
  const cached = plotCache.get(`${asset.symbol}:${tf}`);
  if (cached && cached.length >= 2) return cached;
  return stubBars(asset);
}

export function ChartPanel() {
  const asset = useSelectedTape();
  const selected = useDesk((s) => s.selected);
  const t = useT();
  const [tf, setTf] = useState<ChartTf>(readTf);
  const [scrub, setScrub] = useState<TickBar | null>(null);

  function pick(next: ChartTf) {
    setTf(next);
    writeTf(next);
    setScrub(null);
  }

  useEffect(() => {
    setScrub(null);
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    let live = true;
    const rest = (["1m", "5m", "15m"] as const).filter((x) => x !== tf);
    const assetNow = useDesk.getState().assets[selected];
    const canDraw = assetNow ? barsForTf(assetNow, tf).length >= 2 : false;
    void warmSymbolChart(selected, tf).then(() => {
      if (!live || canDraw) return;
      for (const other of rest) void warmSymbolChart(selected, other);
    });
    if (canDraw) {
      for (const other of rest) void warmSymbolChart(selected, other);
    }
    return () => {
      live = false;
    };
  }, [selected, tf]);

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        {t("chart.select")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <LiveChartHead asset={asset} tf={tf} onTf={pick} scrub={scrub} />
      <LivePlot asset={asset} selected={selected} tf={tf} onScrub={setScrub} />
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
  scrub,
}: {
  asset: MarketAsset;
  tf: ChartTf;
  onTf: (tf: ChartTf) => void;
  scrub: TickBar | null;
}) {
  const t = useT();
  const tz = useTz();
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const chg = changePct(live, asset.open);
  const title = assetLabel(asset.symbol);
  const sub = assetName(asset.symbol);
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-2 pb-1.5">
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
      <div className="flex shrink-0 flex-col items-end">
        <div
          role="group"
          aria-label={t("chart.tf")}
          className="grid grid-cols-3 gap-0.5 rounded-lg bg-elevated p-0.5"
        >
          {TFS.map(([id, label, win]) => (
            <button
              key={id}
              type="button"
              onClick={() => onTf(id)}
              aria-pressed={tf === id}
              data-chart-tf={id}
              className={cn(
                "flex h-11 min-w-[2.6rem] flex-col items-center justify-center rounded-md px-1 leading-none sm:h-8",
                tf === id ? "bg-surface text-fg" : "text-muted",
              )}
            >
              <span className="text-2xs font-medium">{t(label)}</span>
              <span className="text-3xs text-subtle">{t(win)}</span>
            </button>
          ))}
        </div>
        <span
          data-chart-scrub={scrub ? "1" : "0"}
          className="mt-0.5 h-4 font-mono text-2xs tabular-nums text-subtle"
        >
          {scrub ? `${barTime(scrub.t, tz)} ${compactPrice(scrub.px)}` : "\u00a0"}
        </span>
      </div>
    </div>
  );
}

function SessionOverlay({ bars }: { bars: TickBar[] }) {
  const t = useT();
  const tz = useTz();
  const from = bars[0]?.t ?? 0;
  const to = bars.at(-1)?.t ?? 0;
  const marks = useMemo(() => sessionMarks(bars, tz, t), [from, to, bars.length, tz, t]);
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

function LivePlot({
  asset,
  selected,
  tf,
  onScrub,
}: {
  asset: MarketAsset;
  selected: string;
  tf: ChartTf;
  onScrub: (bar: TickBar | null) => void;
}) {
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const up = changePct(live, asset.open) >= 0;
  const bars = barsForTf(asset, tf);
  if (bars.length >= 2) plotCache.set(`${selected}:${tf}`, bars);
  const t = useT();
  if (bars.length < 2) {
    return (
      <div data-chart-ready="0" className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted">
        {t("chart.wait")}
      </div>
    );
  }
  return (
    <div data-chart-ready="1" className="relative min-h-0 flex-1 overflow-hidden">
      <SessionOverlay bars={bars} />
      <PriceArea bars={bars} up={up} onScrub={onScrub} fill resetKey={`${selected}-${tf}`} />
    </div>
  );
}
