import { useCallback, useState } from "react";
import { OrderTicket } from "@/components/desk/order-ticket";
import { PriceArea } from "@/components/desk/sparkline";
import { compactPrice, pct, signedClass } from "@/lib/format";
import { changePct } from "@/lib/market/engine";
import { useDesk, useSelectedTape } from "@/lib/desk-store";
import { useMark } from "@/lib/marks-store";
import type { MarketAsset, TickBar } from "@/lib/types";
import { useT } from "@/lib/i18n";

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

  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        {t("chart.select")}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <LiveChartHead asset={asset} />
      <LivePlot asset={asset} selected={selected} />
    </div>
  );
}

function barTime(t: number) {
  const d = new Date(t);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function LiveChartHead({ asset }: { asset: MarketAsset }) {
  const t = useT();
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const chg = changePct(live, asset.open);
  return (
    <div className="flex shrink-0 items-end justify-between gap-2 pb-1.5">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h2 data-chart-symbol={asset.symbol} className="text-base font-semibold tracking-tight sm:text-lg">
            {asset.symbol}
          </h2>
          <span className="truncate text-xs text-muted sm:text-sm">{asset.name}</span>
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
    </div>
  );
}

function LivePlot({ asset, selected }: { asset: MarketAsset; selected: string }) {
  const mark = useMark(asset.symbol);
  const live = mark || asset.livePx || asset.price;
  const [scrub, setScrub] = useState<TickBar | null>(null);
  const up = changePct(live, asset.open) >= 0;
  const bars =
    asset.series.length >= 2
      ? asset.series.slice(-90)
      : live
        ? [
            { t: Date.now() - 60_000, px: live },
            { t: Date.now(), px: live },
          ]
        : [];
  const onScrub = useCallback((bar: TickBar | null) => setScrub(bar), []);
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {scrub ? (
        <span className="pointer-events-none absolute top-1 left-1 z-10 font-mono text-2xs tabular-nums text-subtle">
          {barTime(scrub.t)} {compactPrice(scrub.px)}
        </span>
      ) : null}
      <PriceArea key={selected} bars={bars} up={up} onScrub={onScrub} fill />
    </div>
  );
}
