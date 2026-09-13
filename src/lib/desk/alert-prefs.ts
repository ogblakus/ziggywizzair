export type AlertKind = "open" | "close" | "proposal";

export type AlertPrefs = {
  open: boolean;
  close: boolean;
  proposal: boolean;
};

export const DEFAULT_ALERT_PREFS: AlertPrefs = { open: true, close: true, proposal: true };

export function normalizeAlertPrefs(raw: unknown): AlertPrefs {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ALERT_PREFS };
  const o = raw as Record<string, unknown>;
  return {
    open: o.open !== false,
    close: o.close !== false,
    proposal: o.proposal !== false,
  };
}

export function alertKindAllowed(kind: AlertKind, prefs?: AlertPrefs | null) {
  const p = normalizeAlertPrefs(prefs);
  return p[kind] !== false;
}
