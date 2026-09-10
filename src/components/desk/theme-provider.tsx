import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyAppearance,
  readAppearance,
  resolveAppearance,
  type Appearance,
} from "@/lib/theme";

type ThemeCtx = {
  appearance: Appearance;
  resolved: "dark" | "light";
  setAppearance: (mode: Appearance) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>("dark");
  const [resolved, setResolved] = useState<"dark" | "light">("dark");

  useLayoutEffect(() => {
    const mode = readAppearance();
    setAppearanceState(mode);
    setResolved(resolveAppearance(mode));
    applyAppearance(mode);
  }, []);

  useEffect(() => {
    if (appearance !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      setResolved(resolveAppearance("system"));
      applyAppearance("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [appearance]);

  const value = useMemo<ThemeCtx>(
    () => ({
      appearance,
      resolved,
      setAppearance: (mode) => {
        setAppearanceState(mode);
        setResolved(resolveAppearance(mode));
        applyAppearance(mode);
      },
    }),
    [appearance, resolved],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppearance() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppearance needs ThemeProvider");
  return ctx;
}
