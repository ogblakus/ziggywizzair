import { isLot } from "@/lib/market/universe";

export function clipSizePct(pct: number) {
  if (pct === 0) return 0;
  if (!Number.isFinite(pct)) return 3;
  return Math.min(6, Math.max(0.5, pct));
}

/** Qty for a % of equity at the fill mark — same price the ticket will print. */
export function qtyForClip(equity: number, pct: number, px: number, symbol: string) {
  if (!(equity > 0) || !(px > 0) || !(pct > 0)) return 0;
  const notional = equity * clipSizePct(pct) * 0.01;
  if (!(notional > 0)) return 0;
  const raw = notional / px;
  const qty = Number(raw.toFixed(isLot(symbol) ? 4 : 2));
  if (qty > 0) return qty;
  if (raw <= 0) return 0;
  return isLot(symbol) ? 0.0001 : 1;
}

export function clipPctOf(qty: number, px: number, equity: number) {
  if (!(equity > 0) || !(px > 0)) return 0;
  return (Math.abs(qty * px) / equity) * 100;
}

export function markOf(t: { livePx?: number | null; price: number }) {
  return t.livePx && t.livePx > 0 ? t.livePx : t.price;
}
