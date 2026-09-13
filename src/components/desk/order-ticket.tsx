import { memo, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { CloseTradeDialog } from "@/components/desk/opened-trades";
import { StopsFields } from "@/components/desk/stops-fields";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { compactPrice, money, qtyFmt, signedQty } from "@/lib/format";
import { hlFeeUsd } from "@/lib/desk/fees";
import { bookEquity, useAssets, useDesk } from "@/lib/desk-store";
import { isLot } from "@/lib/market/universe";
import { cn } from "@/lib/utils";
import { useT, txError, t as tt } from "@/lib/i18n";
import { useTradingMode } from "@/lib/trading-mode";
import { assetLabel } from "@/lib/i18n/labels";
import { parseStop, stopSideError } from "@/lib/desk/stops";

type SizeUnit = "qty" | "usd";
const UNIT_KEY = "zw-ticket-unit";

function readUnit(): SizeUnit {
  try {
    return window.localStorage.getItem(UNIT_KEY) === "usd" ? "usd" : "qty";
  } catch {
    return "qty";
  }
}

function writeUnit(unit: SizeUnit) {
  try {
    window.localStorage.setItem(UNIT_KEY, unit);
  } catch {
    /* private mode */
  }
}

function asShares(raw: string, unit: SizeUnit, mark: number) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return 0;
  if (unit === "usd") return mark > 0 ? n / mark : 0;
  return n;
}

function convertRaw(raw: string, from: SizeUnit, to: SizeUnit, mark: number, lot: boolean) {
  if (from === to) return raw;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0 || !(mark > 0)) return raw;
  return to === "usd" ? (n * mark).toFixed(2) : qtyFmt(n / mark, lot);
}

function UnitWheel({
  id,
  unit,
  onUnit,
  qtyLabel,
}: {
  id: string;
  unit: SizeUnit;
  onUnit: (unit: SizeUnit) => void;
  qtyLabel: string;
}) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const lock = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    lock.current = true;
    el.scrollTop = unit === "usd" ? el.clientHeight : 0;
    requestAnimationFrame(() => {
      lock.current = false;
    });
  }, [unit]);

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={t("ticket.unitAria")}
      aria-activedescendant={`${id}-${unit}`}
      onScroll={() => {
        const el = ref.current;
        if (!el || lock.current) return;
        const next: SizeUnit = el.scrollTop >= el.clientHeight / 2 ? "usd" : "qty";
        if (next !== unit) onUnit(next);
      }}
      className="unit-wheel h-11 rounded-md bg-surface text-xs font-medium text-muted shadow-[var(--shadow-border)]"
    >
      <div id={`${id}-qty`} className="flex h-11 shrink-0 snap-start items-center justify-center">
        {qtyLabel}
      </div>
      <div id={`${id}-usd`} className="flex h-11 shrink-0 snap-start items-center justify-center">
        {t("ticket.unitUsd")}
      </div>
    </div>
  );
}

function SizeRow({
  id,
  raw,
  unit,
  onRaw,
  onUnit,
  lot,
}: {
  id: string;
  raw: string;
  unit: SizeUnit;
  onRaw: (v: string) => void;
  onUnit: (u: SizeUnit) => void;
  lot: boolean;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-2 gap-1">
      <label htmlFor={id} className="sr-only">
        {t("ticket.qtyAria")}
      </label>
      <Input
        id={id}
        inputMode="decimal"
        value={raw}
        placeholder=""
        onChange={(e) => onRaw(e.target.value)}
        className="h-11 min-w-0 bg-surface font-mono tabular-nums"
      />
      <UnitWheel id={id} unit={unit} onUnit={onUnit} qtyLabel={lot ? t("ticket.unitLot") : t("ticket.unitShares")} />
    </div>
  );
}

export const OrderTicket = memo(function OrderTicket() {
  const selected = useDesk((s) => s.selected);
  const assets = useAssets();
  const asset = assets[selected];
  const cash = useDesk((s) => s.cash);
  const positions = useDesk((s) => s.positions);
  const placeOrder = useDesk((s) => s.placeOrder);
  const id = useId();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [raw, setRaw] = useState("");
  const [unit, setUnit] = useState<SizeUnit>(readUnit);
  const [closing, setClosing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const t = useT();
  const mode = useTradingMode((s) => s.mode);

  const lot = isLot(selected);
  const pos = positions.find((p) => p.symbol === selected);
  const equity = bookEquity(cash, positions, assets);
  const mark = asset ? (asset.livePx && asset.livePx > 0 ? asset.livePx : asset.price) : 0;

  useEffect(() => {
    setRaw("");
    setPlacing(false);
    if (pos?.stopLoss) setSl(String(pos.stopLoss));
    else setSl("");
    if (pos?.takeProfit) setTp(String(pos.takeProfit));
    else setTp("");
  }, [selected]);

  const qty = asShares(raw, unit, mark);
  const notional = qty > 0 && mark > 0 ? qty * mark : 0;
  const openFee = qty > 0 && mark > 0 ? hlFeeUsd(qty, mark, "taker") : 0;

  const presets = useMemo(() => {
    if (!asset || !mark) return [];
    return [
      { label: "1%", pct: 0.01 },
      { label: "5%", pct: 0.05 },
      { label: "10%", pct: 0.1 },
    ].map((p) => ({
      ...p,
      qty: lot ? (equity * p.pct) / mark : Math.max(1, Math.round((equity * p.pct) / mark)),
    }));
  }, [asset, equity, lot, mark]);

  if (!asset) return null;

  const liveBlocked = mode === "live";

  function pickUnit(next: SizeUnit) {
    setRaw((prev) => convertRaw(prev, unit, next, mark, lot));
    setUnit(next);
    writeUnit(next);
  }

  function applyPreset(shares: number) {
    setRaw(unit === "usd" ? (shares * mark).toFixed(2) : qtyFmt(shares, lot));
  }

  function openPlace() {
    if (liveBlocked) {
      toast.error(t("ticket.liveBlocked"));
      return;
    }
    setPlacing(true);
  }

  function confirmPlace() {
    if (!(qty > 0)) {
      toast.error(t("ticket.needSize"));
      return;
    }
    const slN = sl.trim() ? parseStop(sl) : null;
    const tpN = tp.trim() ? parseStop(tp) : null;
    const openingLong = side === "buy";
    const err = stopSideError(openingLong, mark, slN, tpN);
    if (err) {
      toast.error(t(err === "sl" ? "ticket.badSl" : "ticket.badTp"));
      return;
    }
    const res = placeOrder({
      symbol: selected,
      side,
      qty,
      source: "manual",
      stopLoss: sl.trim() ? slN : null,
      takeProfit: tp.trim() ? tpN : null,
    });
    if (!res.ok) {
      toast.error(txError(res.error));
      return;
    }
    const fee = res.fill.fee ?? openFee;
    toast.success(
      tt("ticket.filledFee", {
        side: t(side === "buy" ? "ticket.buyCap" : "ticket.sellCap"),
        symbol: selected,
        fee: money(fee),
      }),
    );
    setPlacing(false);
    setRaw("");
  }

  const action =
    side === "buy" ? t("ticket.buyCap") : pos && pos.qty > 0 ? t("ticket.sellCap") : t("ticket.shortCap");

  return (
    <div className="rounded-xl bg-elevated p-2 shadow-[var(--shadow-border)]">
      <div className="flex gap-1">
        {(["buy", "sell"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={cn(
              "h-11 flex-1 rounded-md text-sm font-medium capitalize sm:h-9",
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
      <div className="mt-1.5">
        <SizeRow
          id={id}
          raw={raw}
          unit={unit}
          onRaw={setRaw}
          onUnit={pickUnit}
          lot={lot}
        />
      </div>
      <div className="mt-1.5 flex gap-1">
        <Button
          variant={side === "buy" ? "buy" : "sell"}
          className="h-11 min-w-0 flex-1 px-2 text-xs sm:h-9 sm:text-sm"
          onClick={openPlace}
          disabled={!asset.price || liveBlocked}
        >
          {action} {assetLabel(asset.symbol)}
        </Button>
        {pos ? (
          <Button
            type="button"
            variant="outline"
            className="h-11 px-3 sm:h-9"
            onClick={() => setClosing(true)}
            disabled={!asset.price || liveBlocked}
          >
            {t("ticket.close")}
          </Button>
        ) : null}
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => applyPreset(p.qty)}
            className="h-11 rounded-md bg-surface text-xs font-medium text-muted sm:h-9"
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
        {!liveBlocked && notional > 0 ? <span> · {money(notional)}</span> : null}
      </p>
      {!liveBlocked && openFee > 0 ? (
        <p className="font-mono text-2xs text-muted tabular-nums">{t("ticket.fee", { usd: money(openFee) })}</p>
      ) : null}

      <Dialog open={placing} onOpenChange={setPlacing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ticket.placeTitle", { side: action, symbol: assetLabel(asset.symbol) })}</DialogTitle>
            <DialogDescription>{t("ticket.placeBody")}</DialogDescription>
          </DialogHeader>
          <div className="mt-3">
            <SizeRow
              id={`${id}-place`}
              raw={raw}
              unit={unit}
              onRaw={setRaw}
              onUnit={pickUnit}
              lot={lot}
            />
          </div>
          <p className="mt-3 font-mono text-sm tabular-nums">
            {qty > 0
              ? `${qtyFmt(qty, lot)} · ${money(notional)}`
              : t("ticket.needSize")}
          </p>
          {openFee > 0 ? (
            <p className="font-mono text-2xs text-muted tabular-nums">{t("ticket.fee", { usd: money(openFee) })}</p>
          ) : null}
          <div className="mt-3">
            <StopsFields long={side === "buy"} mark={mark} sl={sl} tp={tp} onSl={setSl} onTp={setTp} />
          </div>
          <Button
            className="mt-4 h-11 w-full"
            variant={side === "buy" ? "buy" : "sell"}
            onClick={confirmPlace}
            disabled={!(qty > 0)}
          >
            {t("ticket.confirm")} {action} {assetLabel(asset.symbol)}
          </Button>
        </DialogContent>
      </Dialog>

      <CloseTradeDialog position={pos ?? null} open={closing} onOpenChange={setClosing} />
    </div>
  );
});
