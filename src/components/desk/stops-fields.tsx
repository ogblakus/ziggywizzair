import { Input } from "@/components/ui/input";
import { compactPrice } from "@/lib/format";
import { parseStop, stopSideError } from "@/lib/desk/stops";
import { useT } from "@/lib/i18n";

export function StopsFields({
  long,
  mark,
  sl,
  tp,
  onSl,
  onTp,
}: {
  long: boolean;
  mark: number;
  sl: string;
  tp: string;
  onSl: (v: string) => void;
  onTp: (v: string) => void;
}) {
  const t = useT();
  const slN = parseStop(sl);
  const tpN = parseStop(tp);
  const slBad = sl.trim() !== "" && stopSideError(long, mark, slN, null) === "sl";
  const tpBad = tp.trim() !== "" && stopSideError(long, mark, null, tpN) === "tp";
  const err = slBad ? "sl" : tpBad ? "tp" : null;
  return (
    <div>
      <div className="grid grid-cols-2 gap-1">
        <label className="min-w-0">
          <span className="mb-1 block text-2xs font-medium tracking-wide text-subtle uppercase">{t("ticket.sl")}</span>
          <Input
            inputMode="decimal"
            value={sl}
            placeholder={mark > 0 ? compactPrice(mark) : t("ticket.slPh")}
            onChange={(e) => onSl(e.target.value)}
            className={`h-11 bg-surface font-mono tabular-nums ${slBad ? "text-down" : ""}`}
          />
        </label>
        <label className="min-w-0">
          <span className="mb-1 block text-2xs font-medium tracking-wide text-subtle uppercase">{t("ticket.tp")}</span>
          <Input
            inputMode="decimal"
            value={tp}
            placeholder={mark > 0 ? compactPrice(mark) : t("ticket.tpPh")}
            onChange={(e) => onTp(e.target.value)}
            className={`h-11 bg-surface font-mono tabular-nums ${tpBad ? "text-down" : ""}`}
          />
        </label>
      </div>
      <p className="mt-1 text-2xs leading-snug text-muted">
        {err === "sl" ? t("ticket.badSl") : err === "tp" ? t("ticket.badTp") : t("ticket.stopsHint")}
      </p>
    </div>
  );
}
