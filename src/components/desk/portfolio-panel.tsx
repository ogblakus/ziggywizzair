import { OpenedTrades } from "@/components/desk/opened-trades";
import { compactPrice, money, pct, qtyFmt, signedClass } from "@/lib/format";
import { portfolioStats, type AllocationKind, type AllocationSlice } from "@/lib/portfolio";
import { useDesk, useMarkedAssets } from "@/lib/desk-store";
import { isLot } from "@/lib/market/universe";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { useLiveWallet } from "@/lib/wallet/live-store";

const SLICE_FILL: Record<AllocationKind, string> = {
  cash: "color-mix(in oklab, var(--color-fg) 55%, transparent)",
  long: "var(--color-up)",
  short: "var(--color-down)",
};

const EXTRA = [
  "var(--color-accent)",
  "color-mix(in oklab, var(--color-up) 55%, var(--color-fg))",
  "color-mix(in oklab, var(--color-fg) 32%, transparent)",
];

function sliceColor(kind: AllocationKind, index: number) {
  if (kind === "cash") return SLICE_FILL.cash;
  if (kind === "short") return SLICE_FILL.short;
  return index === 0 ? SLICE_FILL.long : EXTRA[index % EXTRA.length]!;
}

function AllocRing({
  slices,
}: {
  slices: (AllocationSlice & { fill: string })[];
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = 58;
  const c = 2 * Math.PI * r;
  const gap = 2.5;
  let acc = 0;
  return (
    <svg viewBox="0 0 160 160" className="size-40" aria-hidden>
      <circle
        cx="80"
        cy="80"
        r={r}
        fill="none"
        stroke="color-mix(in oklab, var(--color-fg) 10%, transparent)"
        strokeWidth="14"
      />
      {slices.map((s) => {
        const frac = s.value / total;
        const len = Math.max(0, frac * c - gap);
        const el = (
          <circle
            key={`${s.kind}-${s.name}`}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={s.fill}
            strokeWidth="14"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-acc}
            transform="rotate(-90 80 80)"
          />
        );
        acc += frac * c;
        return el;
      })}
    </svg>
  );
}

export function PortfolioPanel() {
  const mode = useTradingMode((s) => s.mode);
  const cash = useDesk((s) => s.cash);
  const positions = useDesk((s) => s.positions);
  const assets = useMarkedAssets();
  const closed = useDesk((s) => s.closedTrades);
  const anchors = useDesk((s) => s.periodAnchors);
  const starting = useDesk((s) => s.startingEquity);
  const fills = useDesk((s) => s.fills);
  const liveEq = useLiveWallet((s) => s.equity);
  const liveSpot = useLiveWallet((s) => s.hlSpotUsdc);
  const livePos = useLiveWallet((s) => s.positions);
  const t = useT();

  const live = mode === "live";
  const stats = live
    ? null
    : portfolioStats(cash, positions, assets, closed, anchors, starting);

  const liveSlices: (AllocationSlice & { fill: string })[] = live
    ? [
        {
          kind: "cash" as const,
          name: "cash",
          value: liveSpot ?? 0,
          pct: (liveEq ?? 0) > 0 ? ((liveSpot ?? 0) / (liveEq ?? 1)) * 100 : 0,
          fill: sliceColor("cash", 0),
        },
        ...livePos.map((p, i) => {
          const kind: AllocationKind = p.qty >= 0 ? "long" : "short";
          const value = Math.abs(p.value);
          return {
            kind,
            name: p.desk ?? p.coin,
            value,
            pct: (liveEq ?? 0) > 0 ? (value / (liveEq ?? 1)) * 100 : 0,
            fill: sliceColor(kind, i),
          };
        }),
      ].filter((s) => s.value > 0.5)
    : [];

  let longI = 0;
  const colored = live
    ? liveSlices
    : (stats?.slices ?? []).map((s) => {
        const i = s.kind === "long" ? longI++ : 0;
        return { ...s, fill: sliceColor(s.kind, i) };
      });
  const equityShown = live ? (liveEq ?? 0) : stats?.equity ?? 0;
  const floating = live ? livePos.reduce((sum, p) => sum + p.pnl, 0) : stats?.floating ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pr-1">
      <section>
        <h2 className="px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase">
          {t("port.alloc")}
        </h2>
        <div className="flex items-center gap-3">
          <div className="relative size-40 shrink-0">
            {colored.length ? (
              <>
                <AllocRing slices={colored} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <div className="font-mono text-2xs tabular-nums tracking-tight">
                    {money(equityShown, 0)}
                  </div>
                  <div className="text-2xs text-subtle">{t("port.equity")}</div>
                </div>
              </>
            ) : (
              <div className="flex size-full items-center justify-center text-2xs text-subtle">
                —
              </div>
            )}
          </div>
          <ul className="min-w-0 flex-1 space-y-2" data-allocation>
            {colored.map((s) => (
              <li key={`${s.kind}-${s.name}`} className="flex items-start justify-between gap-2">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="mt-1 size-1.5 shrink-0 rounded-full"
                    style={{ background: s.fill }}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium">
                      {s.kind === "cash" ? t("port.cash") : s.name}
                      {s.kind === "short" ? <span className="text-down"> {t("port.short")}</span> : null}
                      {s.kind === "long" ? <span className="text-up"> {t("port.long")}</span> : null}
                    </span>
                    <span className="block font-mono text-2xs text-muted tabular-nums">
                      {money(s.value)}
                    </span>
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums" data-alloc-pct>
                  {s.pct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        {live ? (
          <p className="mt-3 text-2xs leading-relaxed text-muted">{t("port.liveNote")}</p>
        ) : stats && stats.longMv + stats.shortMv > 0.5 ? (
          <p className="mt-3 font-mono text-2xs leading-relaxed text-muted tabular-nums">
            {money(stats.cash)} {t("port.cash")}
            {stats.longMv > 0.5 ? ` + ${money(stats.longMv)} ${t("port.long")}` : ""}
            {stats.shortMv > 0.5 ? ` + ${money(stats.shortMv)} ${t("port.short")}` : ""}
            {" = "}
            {money(stats.cash + stats.longMv + stats.shortMv)} {t("port.deployed")}
          </p>
        ) : null}
      </section>

      <dl className="grid shrink-0 grid-cols-2 gap-2">
        <Stat
          label={t("port.winrate")}
          value={live ? "—" : `${(stats?.winrate ?? 0).toFixed(0)}%`}
          sub={
            live
              ? t("mode.live")
              : stats?.trades
                ? `${stats.wins}W / ${stats.trades} · ${money(stats.realized)}`
                : t("port.noClosed")
          }
        />
        <Stat
          label={t("port.floating")}
          value={money(floating)}
          tone={signedClass(floating)}
          sub={t("port.openMarks")}
        />
        {!live && stats ? (
          <>
            <Stat
              label={t("port.total")}
              value={money(stats.total)}
              sub={pct(stats.totalPct)}
              tone={signedClass(stats.total)}
            />
            <Stat
              label={t("port.day")}
              value={money(stats.day)}
              sub={pct(stats.dayPct)}
              tone={signedClass(stats.day)}
            />
            <Stat
              label={t("port.week")}
              value={money(stats.week)}
              sub={pct(stats.weekPct)}
              tone={signedClass(stats.week)}
            />
            <Stat
              label={t("port.month")}
              value={money(stats.month)}
              sub={pct(stats.monthPct)}
              tone={signedClass(stats.month)}
            />
            <Stat
              label={t("port.year")}
              value={money(stats.year)}
              sub={pct(stats.yearPct)}
              tone={signedClass(stats.year)}
            />
            <Stat
              label={t("port.openedN")}
              value={String(stats.openCount)}
              sub={stats.openCount === 1 ? t("port.oneTrade") : t("port.nTrades", { n: stats.openCount })}
            />
          </>
        ) : (
          <Stat
            label={t("port.openedN")}
            value={String(livePos.length)}
            sub={livePos.length === 1 ? t("port.oneTrade") : t("port.nTrades", { n: livePos.length })}
          />
        )}
      </dl>

      <div className="border-t border-border pt-4">
        <OpenedTrades />
      </div>

      <section>
        <h2 className="px-1 pb-2 text-2xs font-medium tracking-wide text-subtle uppercase">
          {t("port.fills")}
        </h2>
        {live ? (
          <p className="px-1 text-sm leading-relaxed text-muted">{t("port.liveFills")}</p>
        ) : (
          <ul className="space-y-1">
            {fills.length === 0 ? (
              <li className="px-1 text-sm text-muted">{t("port.noPrints")}</li>
            ) : (
              fills.slice(0, 10).map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-mono text-2xs tabular-nums"
                >
                  <span className={cn(f.side === "buy" ? "text-up" : "text-down")}>
                    {f.side.toUpperCase()} {qtyFmt(f.qty, isLot(f.symbol))} {f.symbol}
                  </span>
                  <span className="text-muted">
                    {compactPrice(f.price)}
                    {f.note === "Close" ? ` · ${t("port.closeNote")}` : ""}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]">
      <dt className="text-2xs font-medium tracking-wide text-subtle uppercase">{label}</dt>
      <dd className={`mt-0.5 font-mono text-sm tabular-nums ${tone ?? "text-fg"}`}>{value}</dd>
      {sub ? (
        <dd className={`font-mono text-2xs tabular-nums ${tone ?? "text-muted"}`}>{sub}</dd>
      ) : null}
    </div>
  );
}
