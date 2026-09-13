/** Browser-safe snapshot fingerprint. Server audit can still SHA later. */
export function marketStateHash(payload: unknown): string {
  try {
    const s = JSON.stringify(payload);
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16).padStart(8, "0");
  } catch {
    return "00000000";
  }
}

export function outputHash(payload: unknown): string {
  return marketStateHash(payload);
}

export function newRunId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
