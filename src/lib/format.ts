export function money(n: number, digits = 2) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  return `${sign}$${abs.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function compactMoney(n: number) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1000).toFixed(1)}k`;
  return money(n, 0);
}

export function compactPrice(n: number) {
  if (n >= 1000) {
    return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
}

export function pct(n: number, digits = 2) {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
}

export function qtyFmt(n: number, crypto: boolean) {
  const abs = Math.abs(n);
  if (crypto) return abs.toFixed(abs >= 1 ? 3 : 4);
  if (abs >= 100) return abs.toFixed(0);
  return abs.toFixed(2);
}

export function signedQty(n: number, crypto: boolean) {
  if (n > 0) return `+${qtyFmt(n, crypto)}`;
  if (n < 0) return `-${qtyFmt(n, crypto)}`;
  return qtyFmt(n, crypto);
}

export function signedClass(n: number) {
  if (n > 0.0000001) return "text-up";
  if (n < -0.0000001) return "text-down";
  return "text-muted";
}

export function timeAgo(ts: number, now = Date.now()) {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 5) return "now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h`;
}
