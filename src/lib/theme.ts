export type Appearance = "dark" | "light" | "system";

const KEY = "quorum-appearance";

export function readAppearance(): Appearance {
  if (typeof window === "undefined") return "dark";
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    /* private mode */
  }
  return "dark";
}

export function resolveAppearance(mode: Appearance): "dark" | "light" {
  if (mode !== "system") return mode;
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyAppearance(mode: Appearance) {
  if (typeof document === "undefined") return;
  const resolved = resolveAppearance(mode);
  const root = document.documentElement;
  root.classList.toggle("light", resolved === "light");
  root.classList.toggle("dark", resolved === "dark");
  root.style.colorScheme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#f4f4f5" : "#09090b");
  try {
    window.localStorage.setItem(KEY, mode);
  } catch {
    /* ignore */
  }
}
