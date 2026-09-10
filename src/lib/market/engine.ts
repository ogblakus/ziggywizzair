export function sma(series: number[], n: number) {
  if (series.length === 0) return 0;
  const slice = series.slice(-n);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function rsi(series: number[], n = 14) {
  if (series.length < n + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = series.length - n; i < series.length; i++) {
    const d = series[i]! - series[i - 1]!;
    if (d >= 0) gains += d;
    else losses -= d;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

export function changePct(price: number, open: number) {
  if (!open) return 0;
  return ((price - open) / open) * 100;
}
