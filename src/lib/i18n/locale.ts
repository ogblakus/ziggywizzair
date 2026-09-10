import { catalog, type Locale, type MsgKey } from "@/lib/i18n/catalog";

const KEY = "zw-locale";
const COOKIE = "zw-locale";
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function readRaw(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "en" || v === "pl") return v;
  } catch {
    /* private mode */
  }
  return null;
}

function readCookie(): Locale | null {
  const raw =
    typeof document !== "undefined"
      ? document.cookie
      : typeof window === "undefined"
        ? ""
        : "";
  if (!raw) return null;
  const m = raw.match(/(?:^|; )zw-locale=(pl|en)(?:;|$)/);
  return m ? (m[1] as Locale) : null;
}

function writeCookie(next: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function detect(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.language || "en").toLowerCase();
  return lang.startsWith("pl") ? "pl" : "en";
}

let current: Locale | null = null;

export function hydrateLocale(): Locale {
  const next = readRaw() ?? readCookie() ?? detect();
  const changed = current !== next;
  current = next;
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.documentElement.setAttribute("data-locale", next);
    writeCookie(next);
  }
  if (changed) emit();
  return next;
}

export function getLocale(): Locale {
  if (current) return current;
  if (typeof window !== "undefined") return hydrateLocale();
  current = readCookie() ?? detect();
  return current;
}

export function setLocale(next: Locale) {
  current = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* ignore */
  }
  writeCookie(next);
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
    document.documentElement.setAttribute("data-locale", next);
  }
  emit();
}

export function subscribeLocale(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function t(key: MsgKey, vars?: Record<string, string | number>, locale = getLocale()): string {
  let s = catalog[key]?.[locale] ?? catalog[key]?.en ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function txError(message: string, locale = getLocale()): string {
  const map: Record<string, MsgKey> = {
    "Iris veto — size or concentration.": "err.irisSize",
    "Iris veto — not enough cash.": "err.irisCash",
    "Waiting on the live tape.": "err.tape",
    "Size the ticket.": "err.size",
    "No open trade.": "err.noTrade",
    "No ticket on the rail.": "err.noTicket",
    "Live orders from this desk are not signed yet. Switch to Demo to practice.": "err.livePlace",
    "Reset clears the demo book. Switch to Demo first.": "err.liveReset",
    "Iris veto — two adds today.": "err.irisAdds",
  };
  const key = map[message];
  return key ? t(key, undefined, locale) : message;
}

export type { Locale, MsgKey };
