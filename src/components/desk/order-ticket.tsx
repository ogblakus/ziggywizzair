import { memo, useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compactPrice, qtyFmt, signedQty } from "@/lib/format";
import { bookEquity, useAssets, useDesk } from "@/lib/desk-store";
import { isLot } from "@/lib/market/universe";
import { cn } from "@/lib/utils";
import { useT, txError, t as tt } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";

export const OrderTicket = memo(function OrderTicket() {
  const selected = useDesk((s) => s.selected);
  const assets = useAssets();
  const asset = assets[selected];
  const cash = useDesk((s) => s.cash);
  const positions = useDesk((s) => s.positions);
  const placeOrder = useDesk((s) => s.placeOrder);
  const closePosition = useDesk((s) => s.closePosition);
  const id = useId();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("10");
  const t = useT();
  const mode = useTradingMode((s) => s.mode);

  const lot = isLot(selected);
  const pos = positions.find((p) => p.symbol === selected);
  const equity = bookEquity(cash, positions, assets);
  const mark = asset ? (asset.livePx && asset.livePx > 0 ? asset.livePx : asset.price) : 0;

  const parsed = Number(qty);
  const notional = asset && Number.isFinite(parsed) ? parsed * mark : 0;

  const presets = useMemo(() => {
    if (!asset || !mark) return [];
    return [
      { label: "10%", pct: 0.1 },
      { label: "25%", pct: 0.25 },
      { label: "50%", pct: 0.5 },
    ].map((p) => ({
      ...p,
      qty: lot ? (equity * p.pct) / mark : Math.max(1, Math.round((equity * p.pct) / mark)),
    }));
  }, [asset, equity, lot, mark]);

  if (!asset) return null;

  const liveBlocked = mode === "live";

  function submit() {
    if (liveBlocked) {
      toast.error(t("ticket.liveBlocked"));
      return;
    }
    const n = Number(qty);
    const res = placeOrder({ symbol: selected, side, qty: n, source: "manual" });
    if (!res.ok) {
      toast.error(txError(res.error));
      return;
    }
    toast.success(
      tt("ticket.filled", {
        side: t(side === "buy" ? "ticket.buyCap" : "ticket.sellCap"),
        symbol: selected,
      }),
    );
  }

  function close() {
    if (liveBlocked) {
      toast.error(t("ticket.liveBlocked"));
      return;
    }
    const res = closePosition(selected);
    if (!res.ok) {
      toast.error(txError(res.error));
      return;
    }
    toast.success(tt("ticket.closed", { symbol: selected }));
  }

  return (
    <div className="rounded-xl bg-elevated p-2 shadow-[var(--shadow-border)]">
      <div className="flex gap-1">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              "h-9 flex-1 rounded-md text-sm font-medium capitalize",
              side === s
                ? s === "buy"
                  ? "bg-up/20 text-up"
                  : "bg-down/20 text-down"
                : "bg-surface text-muted",
            )}
          >
            {t(s === "buy" ? "ticket.buy" : "ticket.sell")}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1">
        <label htmlFor={id} className="sr-only">
          {t("ticket.qtyAria")}
        </label>
        <Input
          id={id}
          inputMode="decimal"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="h-9 min-w-0 flex-1 font-mono tabular-nums"
        />
        <Button
          variant={side === "buy" ? "buy" : "sell"}
          className="h-9 min-w-0 flex-[1.2] px-2 text-xs sm:text-sm"
          onClick={submit}
          disabled={!asset.price || liveBlocked}
        >
          {side === "buy" ? t("ticket.buyCap") : pos && pos.qty > 0 ? t("ticket.sellCap") : t("ticket.shortCap")} {asset.symbol}
        </Button>
        {pos ? (
          <Button type="button" variant="outline" className="h-9 px-3" onClick={close} disabled={!asset.price || liveBlocked}>
            {t("ticket.close")}
          </Button>
        ) : null}
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setQty(qtyFmt(p.qty, lot))}
            className="h-8 rounded-md bg-surface text-xs font-medium text-muted"
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="mt-1 font-mono text-2xs text-muted tabular-nums">
        {liveBlocked
          ? t("ticket.liveBlocked")
          : pos
            ? t(pos.qty >= 0 ? "ticket.heldLong" : "ticket.heldShort", {
                qty: signedQty(pos.qty, lot),
                avg: compactPrice(pos.avg),
              })
            : side === "sell"
              ? t("ticket.sellOpens")
              : t("ticket.noPos")}
        {!liveBlocked ? <span> · {compactPrice(notional)}</span> : null}
      </p>
    </div>
  );
});
