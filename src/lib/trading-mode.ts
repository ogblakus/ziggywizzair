import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TradingMode = "demo" | "live";

type ModeState = {
  mode: TradingMode;
  setMode: (mode: TradingMode) => void;
};

export const useTradingMode = create<ModeState>()(
  persist(
    (set) => ({
      mode: "demo",
      setMode: (mode) => set({ mode }),
    }),
    { name: "zw-trading-mode" },
  ),
);

export function getTradingMode(): TradingMode {
  return useTradingMode.getState().mode;
}

export function bindTradingMode(userId: string) {
  useTradingMode.persist.setOptions({ name: `zw-trading-mode-${userId}` });
}
