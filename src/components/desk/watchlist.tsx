import { memo } from "react";
import { Sparkline } from "@/components/desk/sparkline";
import { TickerMark } from "@/components/desk/ticker-mark";
import { chipPrice, compactPrice, pct, signedClass } from "@/lib/format";
import { changePct } from "@/lib/market/engine";
import { UNIVERSE } from "@/lib/market/universe";
import { useAssets, useDesk } from "@/lib/desk-store";
import { useMark } from "@/lib/marks-store";
import type { MarketAsset, Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { assetName, assetLabel } from "@/lib/i18n/labels";

export function Watchlist() {
  const assets = useAssets();
  const selected = useDesk((s) => s.selected);
  const select = useDesk((s) => s.select);
  const positions = useDesk((s) => s.positions);
  const t = useT();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-baseline justify-between px-1 pb-2">
        <h2 className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("board.title")}</h2>
        <span className="font-mono text-2xs text-subtle tabular-nums">{UNIVERSE.length}</span>
      </div>
      <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-1">
        {UNIVERSE.map((u) => {
          const a = assets[u.symbol];
          if (!a) return null;
          const held = positions.find((p) => p.symbol === u.symbol);
          return (
            <WatchlistRow
              key={u.symbol}
              asset={a}
              name={assetName(u.symbol)}
              active={selected === u.symbol}
              held={held}
              onSelect={select}
            />
          );
        })}
      </ul>
    </div>
  );
}

const WatchlistRow = memo(function WatchlistRow({
  asset,
  name,
  active,
  held,
  onSelect,
}: {
  asset: MarketAsset;
  name: string;
  active: boolean;
  held?: Position;
  onSelect: (symbol: string) => void;
}) {
  const t = useT();
  const series = (asset.series.length ? asset.series : [{ t: 0, px: asset.livePx || asset.price }])
    .slice(-28)
    .map((b) => b.px);
  const px = (asset.livePx && asset.livePx > 0 ? asset.livePx : 0) || asset.price;
  const chg = changePct(px, asset.open);
  return (
    <li>
      <button
        type="button"
        data-symbol={asset.symbol}
        onClick={() => onSelect(asset.symbol)}
        className={cn(
          "flex min-h-11 w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-[background-color] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
          active ? "bg-elevated" : "hover:bg-elevated/60",
        )}
      >
        <TickerMark symbol={asset.symbol} className="size-7" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-medium tabular-nums">{assetLabel(asset.symbol)}</span>
            {held ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-2xs font-medium",
                  held.qty >= 0 ? "bg-up/15 text-up" : "bg-down/15 text-down",
                )}
              >
                {held.qty >= 0 ? t("side.long") : t("side.short")}
              </span>
            ) : null}
          </div>
          {name !== assetLabel(asset.symbol) ? (
            <div className="truncate text-2xs text-subtle">{name}</div>
          ) : null}
        </div>
        <Sparkline data={series} up={chg >= 0} className="hidden xl:block" />
        <LivePx symbol={asset.symbol} open={asset.open} fallback={px} livePx={asset.livePx} />
      </button>
    </li>
  );
}, (a, b) =>
  a.asset.symbol === b.asset.symbol &&
  a.asset.livePx === b.asset.livePx &&
  a.asset.price === b.asset.price &&
  a.asset.open === b.asset.open &&
  a.active === b.active &&
  a.held === b.held &&
  a.name === b.name,
);

function LivePx({
  symbol,
  open,
  fallback,
  livePx,
}: {
  symbol: string;
  open: number;
  fallback: number;
  livePx: number | null;
}) {
  const t = useT();
  const mark = useMark(symbol);
  const px = mark || livePx || fallback;
  const chg = changePct(px, open);
  return (
    <div className="text-right">
      <div className="font-mono text-sm tabular-nums">{px ? compactPrice(px) : "—"}</div>
      <div className={`font-mono text-2xs tabular-nums ${px ? signedClass(chg) : "text-subtle"}`}>
        {px ? pct(chg) : t("board.tape")}
      </div>
    </div>
  );
}

export function TickerStrip() {
  const assets = useAssets();
  const selected = useDesk((s) => s.selected);
  const select = useDesk((s) => s.select);

  return (
    <div className="desk-scroll-x shrink-0 -mx-3 px-3">
      <ul className="flex gap-1.5">
        {UNIVERSE.map((u) => {
          const a = assets[u.symbol];
          if (!a) return null;
          return (
            <TickerChip
              key={u.symbol}
              asset={a}
              active={selected === u.symbol}
              onSelect={select}
            />
          );
        })}
      </ul>
    </div>
  );
}

const TickerChip = memo(function TickerChip({
  asset,
  active,
  onSelect,
}: {
  asset: MarketAsset;
  active: boolean;
  onSelect: (symbol: string) => void;
}) {
  const t = useT();
  return (
    <li className="shrink-0">
      <button
        type="button"
        data-symbol={asset.symbol}
        onClick={() => onSelect(asset.symbol)}
        className={cn(
          "flex h-14 w-[7.25rem] items-center gap-2 rounded-xl px-2.5 text-left shadow-[var(--shadow-border)] sm:h-16 sm:w-32",
          active ? "bg-elevated" : "bg-surface",
        )}
      >
        <TickerMark symbol={asset.symbol} className="size-8" />
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
          <span className="truncate text-2xs font-medium tracking-wide">{assetLabel(asset.symbol)}</span>
          <LiveChipPx symbol={asset.symbol} open={asset.open} fallback={asset.livePx || asset.price} livePx={asset.livePx} />
        </span>
      </button>
    </li>
  );
});

function LiveChipPx({
  symbol,
  open,
  fallback,
  livePx,
}: {
  symbol: string;
  open: number;
  fallback: number;
  livePx: number | null;
}) {
  const mark = useMark(symbol);
  const px = mark || livePx || fallback;
  const chg = changePct(px, open);
  return (
    <>
      <span className="truncate font-mono text-2xs tabular-nums">{px ? chipPrice(px) : "—"}</span>
      <span className={`font-mono text-3xs tabular-nums ${px ? signedClass(chg) : "text-subtle"}`}>
        {px ? pct(chg) : "—"}
      </span>
    </>
  );
}
