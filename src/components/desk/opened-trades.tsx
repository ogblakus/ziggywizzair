import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { compactMoney, compactPrice, money, pct, signedClass, signedQty } from "@/lib/format";
import { bookEquity, useDesk, useMarkedAssets } from "@/lib/desk-store";
import { useMark } from "@/lib/marks-store";
import { isLot } from "@/lib/market/universe";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useT, txError, t as tt } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { useLiveWallet } from "@/lib/wallet/live-store";

function runClose(symbol: string, qty: number, closePosition: (s: string, q?: number) => { ok: boolean; error?: string }) {
  const res = closePosition(symbol, qty);
  if (!res.ok) {
    toast.error(txError(res.error ?? "Could not close"));
    return;
  }
  toast.success(tt("ticket.closed", { symbol }));
}

function CloseTradeDialog({
  position: p,
  open,
  onOpenChange,
}: {
  position: Position | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const t = useT();
  const closePosition = useDesk((s) => s.closePosition);
  const fallback = useDesk((s) => (p ? (s.assets[p.symbol]?.price ?? p.avg) : 0));
  const mark = useMark(p?.symbol ?? "");
  const [scale, setScale] = useState<"pct" | "usd">("pct");
  const [frac, setFrac] = useState(100);

  useEffect(() => {
    if (open) {
      setFrac(100);
      setScale("pct");
    }
  }, [open, p?.symbol]);

  if (!p) return null;
  const pos = p;
  const px = mark || fallback || pos.avg;
  const crypto = isLot(pos.symbol);
  const full = Math.abs(pos.qty);
  const notional = full * px;
  const closeQty = Number(((full * frac) / 100).toFixed(crypto ? 4 : 2));
  const closeNotional = closeQty * px;

  function confirm() {
    if (!(closeQty > 0)) return;
    runClose(pos.symbol, closeQty, closePosition);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("close.title", { symbol: pos.symbol })}</DialogTitle>
          <DialogDescription>{t("close.body")}</DialogDescription>
        </DialogHeader>
        <div className="mt-3 flex gap-1">
          {(["pct", "usd"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={cn(
                "h-9 flex-1 rounded-md text-sm font-medium",
                scale === s ? "bg-elevated text-fg" : "bg-surface text-muted",
              )}
            >
              {t(s === "pct" ? "close.pct" : "close.usd")}
            </button>
          ))}
        </div>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={frac}
          onChange={(e) => setFrac(Number(e.target.value))}
          className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-elevated accent-[var(--color-up)]"
        />
        <p className="mt-2 font-mono text-sm tabular-nums">
          {scale === "pct"
            ? `${frac}% · ${signedQty(closeQty * Math.sign(pos.qty), crypto)} · ${money(closeNotional)}`
            : `${money(closeNotional)} · ${frac}% · ${signedQty(closeQty * Math.sign(pos.qty), crypto)}`}
        </p>
        <p className="font-mono text-2xs text-muted tabular-nums">
          {t("opened.title")} {signedQty(pos.qty, crypto)} · {compactPrice(px)} · {money(notional)}
        </p>
        <Button className="mt-4 h-11 w-full" variant="sell" onClick={confirm}>
          {t("close.confirm")} {pos.symbol}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function OpenedTrades() {
  const mode = useTradingMode((s) => s.mode);
  const demoPositions = useDesk((s) => s.positions);
  const livePositions = useLiveWallet((s) => s.positions);
  const assets = useMarkedAssets();
  const cash = useDesk((s) => s.cash);
  const select = useDesk((s) => s.select);
  const equity = bookEquity(cash, demoPositions, assets);
  const t = useT();
  const [closing, setClosing] = useState<Position | null>(null);

  if (mode === "live") {
    return (
      <section>
        <div className="flex items-baseline justify-between px-1">
          <h2 className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("opened.title")}</h2>
          <span className="font-mono text-2xs text-subtle tabular-nums">{livePositions.length}</span>
        </div>
        {livePositions.length === 0 ? (
          <p className="mt-2 px-1 text-sm leading-relaxed text-muted">{t("opened.liveEmpty")}</p>
        ) : (
          <ul className="mt-2 space-y-1.5">
            {livePositions.map((p) => {
              const long = p.qty >= 0;
              const name = p.desk ?? p.coin;
              return (
                <li
                  key={`${p.coin}-${p.desk ?? ""}`}
                  className="rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]"
                >
                  <button
                    type="button"
                    onClick={() => p.desk && select(p.desk)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide",
                          long ? "bg-up/15 text-up" : "bg-down/15 text-down",
                        )}
                      >
                        {long ? t("side.long") : t("side.short")}
                      </span>
                      <span className="font-mono text-sm font-medium">{name}</span>
                    </div>
                    <div className={`mt-1 font-mono text-xs tabular-nums ${signedClass(p.pnl)}`}>
                      {money(p.pnl)}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }

  const positions = demoPositions;

  return (
    <section>
      <div className="flex items-baseline justify-between px-1">
        <h2 className="text-2xs font-medium tracking-wide text-subtle uppercase">{t("opened.title")}</h2>
        <span className="font-mono text-2xs text-subtle tabular-nums">{positions.length}</span>
      </div>
      {positions.length === 0 ? (
        <p className="mt-2 px-1 text-sm leading-relaxed text-muted">
          {t("opened.empty")}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {positions.map((p) => {
            const crypto = isLot(p.symbol);
            const px = assets[p.symbol]?.price ?? p.avg;
            const pnl = (px - p.avg) * p.qty;
            const pnlPct = p.avg ? ((px - p.avg) / p.avg) * 100 * Math.sign(p.qty || 1) : 0;
            const weight = equity ? (Math.abs(p.qty * px) / equity) * 100 : 0;
            const long = p.qty >= 0;
            return (
              <li
                key={p.symbol}
                className="rounded-lg bg-elevated px-3 py-2.5 shadow-[var(--shadow-border)]"
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => select(p.symbol)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-2xs font-medium tracking-wide",
                          long ? "bg-up/15 text-up" : "bg-down/15 text-down",
                        )}
                      >
                        {long ? t("side.long") : t("side.short")}
                      </span>
                      <span className="font-mono text-sm font-medium">{p.symbol}</span>
                    </div>
                    <div className="mt-1 font-mono text-2xs text-muted tabular-nums">
                      {signedQty(p.qty, crypto)} @ {compactPrice(p.avg)} → {compactPrice(px)} ·{" "}
                      {weight.toFixed(1)}%
                    </div>
                    <div className={`mt-0.5 font-mono text-xs tabular-nums ${signedClass(pnl)}`}>
                      {money(pnl)} · {pct(pnlPct)}
                    </div>
                  </button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-11 shrink-0 px-3"
                    onClick={() => setClosing(p)}
                    aria-label={t("opened.closeAria", { symbol: p.symbol })}
                  >
                    {t("ticket.close")}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <CloseTradeDialog position={closing} open={!!closing} onOpenChange={(v) => !v && setClosing(null)} />
    </section>
  );
}

export function OpenedStrip() {
  const mode = useTradingMode((s) => s.mode);
  const demoPositions = useDesk((s) => s.positions);
  const livePositions = useLiveWallet((s) => s.positions);
  const select = useDesk((s) => s.select);
  const t = useT();

  if (mode === "live") {
    if (livePositions.length === 0) return null;
    return (
      <div className="shrink-0 border-b border-border px-3 py-1.5 sm:px-4 sm:py-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase">
            {t("opened.title")}
          </span>
          {livePositions.map((p) => {
            const long = p.qty >= 0;
            const name = p.desk ?? p.coin;
            return (
              <div
                key={`${p.coin}-${p.desk ?? ""}`}
                className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-surface px-2 shadow-[var(--shadow-border)] sm:h-11 sm:rounded-lg sm:px-2.5"
              >
                <button
                  type="button"
                  onClick={() => p.desk && select(p.desk)}
                  className="flex items-center gap-2 text-left"
                >
                  <span className={cn("font-mono text-sm font-medium", long ? "text-up" : "text-down")}>
                    {name}
                  </span>
                  <span className="text-2xs font-medium tracking-wide text-muted">
                    {long ? t("side.long") : t("side.short")}
                  </span>
                  <span className="font-mono text-2xs text-muted tabular-nums">{compactMoney(Math.abs(p.value))}</span>
                  <span className={`font-mono text-2xs tabular-nums ${signedClass(p.pnl)}`}>{money(p.pnl)}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const positions = demoPositions;
  if (positions.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-border px-3 py-1.5 sm:px-4 sm:py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-2xs font-medium tracking-wide text-subtle uppercase">
          {t("opened.title")}
        </span>
        {positions.map((p) => (
          <OpenedChip
            key={p.symbol}
            position={p}
            onSelect={select}
          />
        ))}
      </div>
    </div>
  );
}

function OpenedChip({
  position: p,
  onSelect,
}: {
  position: Position;
  onSelect: (symbol: string) => void;
}) {
  const t = useT();
  const fallback = useDesk((s) => s.assets[p.symbol]?.price ?? p.avg);
  const mark = useMark(p.symbol);
  const px = mark || fallback;
  const pnl = (px - p.avg) * p.qty;
  const long = p.qty >= 0;
  const [open, setOpen] = useState(false);
  return (
    <div className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-surface px-2 shadow-[var(--shadow-border)] sm:h-11 sm:rounded-lg sm:px-2.5">
      <button type="button" onClick={() => onSelect(p.symbol)} className="flex items-center gap-2 text-left">
        <span className={cn("font-mono text-sm font-medium", long ? "text-up" : "text-down")}>
          {p.symbol}
        </span>
        <span className="text-2xs font-medium tracking-wide text-muted">
          {long ? t("side.long") : t("side.short")}
        </span>
        <span className="font-mono text-2xs text-muted tabular-nums">{compactMoney(Math.abs(p.qty * px))}</span>
        <span className={`font-mono text-2xs tabular-nums ${signedClass(pnl)}`}>{money(pnl)}</span>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-9 rounded-md px-2 text-2xs font-medium text-muted hover:bg-elevated hover:text-fg"
        aria-label={t("opened.closeAria", { symbol: p.symbol })}
      >
        {t("ticket.close")}
      </button>
      <CloseTradeDialog position={p} open={open} onOpenChange={setOpen} />
    </div>
  );
}
