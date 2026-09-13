import type { Position } from "@/lib/types";

export function parseStop(raw: string): number | null {
  const n = Number(String(raw).replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function hitStop(pos: Position, px: number): "sl" | "tp" | null {
  if (!(px > 0)) return null;
  const long = pos.qty > 0;
  const sl = pos.stopLoss;
  const tp = pos.takeProfit;
  if (long) {
    if (sl != null && px <= sl) return "sl";
    if (tp != null && px >= tp) return "tp";
  } else {
    if (sl != null && px >= sl) return "sl";
    if (tp != null && px <= tp) return "tp";
  }
  return null;
}

export function stopSideError(long: boolean, mark: number, sl: number | null, tp: number | null): "sl" | "tp" | null {
  if (!(mark > 0)) return null;
  if (sl != null) {
    if (long && sl >= mark) return "sl";
    if (!long && sl <= mark) return "sl";
  }
  if (tp != null) {
    if (long && tp <= mark) return "tp";
    if (!long && tp >= mark) return "tp";
  }
  return null;
}
