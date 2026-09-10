import type { MarketSnapshot } from "@/lib/types";
import { useLiveWallet } from "@/lib/wallet/live-store";

export function liveSnapshotBook(): MarketSnapshot["book"] | null {
  const w = useLiveWallet.getState();
  if (!w.address) return null;
  const equity = w.equity ?? 0;
  const cash = w.hlSpotUsdc ?? 0;
  const floating = w.positions.reduce((sum, p) => sum + p.pnl, 0);
  return {
    cash,
    equity,
    dayPnlPct: equity > 0 ? (floating / equity) * 100 : 0,
    positions: w.positions
      .filter((p): p is typeof p & { desk: string } => Boolean(p.desk))
      .map((p) => {
        const notional = Math.abs(p.value) || 0;
        const avg =
          p.qty !== 0 && notional
            ? Math.abs((notional - p.pnl) / p.qty)
            : 0;
        return {
          symbol: p.desk,
          qty: p.qty,
          avg,
          pnlPct: notional ? (p.pnl / notional) * 100 : 0,
        };
      }),
  };
}
