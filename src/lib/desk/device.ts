const KEY = "zw.device";

/** Stable per-browser token. Hashed server-side and bound to the account on sign-in. */
export function getDeviceToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const cur = window.localStorage.getItem(KEY);
    if (cur && /^[a-f0-9]{64}$/.test(cur)) return cur;
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const next = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(KEY, next);
    return next;
  } catch {
    return "";
  }
}
