import { create } from "zustand";
import type { MarketAsset } from "@/lib/types";

type MarksState = {
  marks: Record<string, number>;
  tick: (assets: Record<string, MarketAsset>) => void;
};

let reduced: boolean | null = null;

function prefersReduced() {
  if (typeof window === "undefined") return false;
  if (reduced === null) {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced = mq.matches;
    mq.addEventListener("change", () => {
      reduced = mq.matches;
    });
  }
  return reduced;
}

export const useMarks = create<MarksState>((set, get) => ({
  marks: {},
  tick: (assets) => {
    const prev = get().marks;
    const quiet = prefersReduced();
    const next: Record<string, number> = {};
    for (const a of Object.values(assets)) {
      const print = (a.livePx && a.livePx > 0 ? a.livePx : a.price) || 0;
      if (!print) continue;
      if (quiet) {
        next[a.symbol] = print;
        continue;
      }
      const last = prev[a.symbol] ?? print;
      const step = last + (print - last) * 0.55;
      const jitter = quiet ? 0 : print * a.vol * 0.006 * (Math.random() * 2 - 1);
      const raw = step + jitter;
      const lo = print * 0.9994;
      const hi = print * 1.0006;
      next[a.symbol] = Math.min(hi, Math.max(lo, raw));
    }
    set({ marks: next });
  },
}));

export function useMark(symbol: string) {
  return useMarks((s) => s.marks[symbol] ?? 0);
}
