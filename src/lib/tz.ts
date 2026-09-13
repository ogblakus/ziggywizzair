import { useLayoutEffect, useSyncExternalStore } from "react";

export const TZ_DEFAULT = "Europe/Warsaw";
const KEY = "zw-tz";

export const TIMEZONES: Array<{ id: string; en: string; pl: string }> = [
  { id: "Europe/Warsaw", en: "Warsaw", pl: "Warszawa" },
  { id: "Europe/London", en: "London", pl: "Londyn" },
  { id: "UTC", en: "UTC", pl: "UTC" },
  { id: "America/New_York", en: "New York", pl: "Nowy Jork" },
  { id: "America/Chicago", en: "Chicago", pl: "Chicago" },
  { id: "America/Los_Angeles", en: "Los Angeles", pl: "Los Angeles" },
  { id: "Asia/Tokyo", en: "Tokyo", pl: "Tokio" },
  { id: "Asia/Singapore", en: "Singapore", pl: "Singapur" },
  { id: "Asia/Dubai", en: "Dubai", pl: "Dubaj" },
  { id: "Australia/Sydney", en: "Sydney", pl: "Sydney" },
];

const IDS = new Set(TIMEZONES.map((z) => z.id));
const listeners = new Set<() => void>();
let current: string | null = null;

function emit() {
  for (const fn of listeners) fn();
}

function valid(id: string | null | undefined): id is string {
  return Boolean(id && IDS.has(id));
}

function readStored(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return valid(v) ? v : null;
  } catch {
    return null;
  }
}

function writeStored(id: string) {
  try {
    window.localStorage.setItem(KEY, id);
  } catch {
    /* private mode */
  }
}

export function getTz(): string {
  if (current && valid(current)) return current;
  current = readStored() ?? TZ_DEFAULT;
  return current;
}

export function setTz(next: string) {
  const id = valid(next) ? next : TZ_DEFAULT;
  current = id;
  writeStored(id);
  emit();
}

export function hydrateTz() {
  const next = readStored() ?? TZ_DEFAULT;
  if (current !== next) {
    current = next;
    emit();
  }
  return getTz();
}

export function subscribeTz(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useTz(): string {
  const tz = useSyncExternalStore(subscribeTz, getTz, getTz);
  useLayoutEffect(() => {
    hydrateTz();
  }, []);
  return tz;
}

function wallMinutes(ts: number, zone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ts));
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return h * 60 + m;
}

/** Epochs in [from, to] where `zone` wall-clock equals hour:minute. */
export function timesAtClock(from: number, to: number, zone: string, hour: number, minute: number) {
  if (!(to > from)) return [];
  const maxSpan = 48 * 60 * 60 * 1000;
  if (to - from > maxSpan) from = to - maxSpan;
  const want = hour * 60 + minute;
  const first = nextAtClock(from, zone, want);
  if (first == null || first > to) return [];
  const out: number[] = [];
  let t = first;
  let guard = 0;
  while (t <= to && guard++ < 8) {
    out.push(t);
    const next = nextAtClock(t + 60_000, zone, want);
    if (next == null || next <= t) break;
    t = next;
  }
  return out;
}

function nextAtClock(from: number, zone: string, want: number) {
  const nowM = wallMinutes(from, zone);
  let delta = want - nowM;
  if (delta < 0) delta += 24 * 60;
  let t = from + delta * 60_000;
  for (let i = 0; i < 8; i++) {
    const got = wallMinutes(t, zone);
    if (got === want) return t;
    let adj = want - got;
    if (adj > 12 * 60) adj -= 24 * 60;
    if (adj < -12 * 60) adj += 24 * 60;
    if (adj === 0) return t;
    t += adj * 60_000;
  }
  return null;
}

export function formatTzTime(ts: number, zone: string) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(ts));
  } catch {
    return "";
  }
}
