/** Hyperliquid perps, base tier (no volume discount). Market fills take. Limits make. */
export const HL_TAKER_PCT = 0.045;
export const HL_MAKER_PCT = 0.015;

export type FeeKind = "taker" | "maker";

export function hlFeeUsd(qty: number, price: number, kind: FeeKind = "taker") {
  const notional = Math.abs(qty * price);
  if (!(notional > 0)) return 0;
  const pct = kind === "maker" ? HL_MAKER_PCT : HL_TAKER_PCT;
  return Math.round(notional * (pct / 100) * 100) / 100;
}

export function hlRoundTripPct() {
  return HL_TAKER_PCT * 2;
}

export function hlFeeLabel(kind: FeeKind, locale: "en" | "pl") {
  const pct = kind === "maker" ? HL_MAKER_PCT : HL_TAKER_PCT;
  const n = locale === "pl" ? pct.toString().replace(".", ",") : pct.toFixed(3);
  return `HL ${kind} ${n}%`;
}
