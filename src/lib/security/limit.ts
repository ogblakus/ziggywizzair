/** In-process sliding window. Good enough for a single Node instance. */
const buckets = new Map<string, { n: number; reset: number }>();

const MAX_KEYS = 8_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_KEYS) {
    let dropped = 0;
    for (const [k, row] of buckets) {
      if (now >= row.reset || dropped < 1_000) {
        buckets.delete(k);
        dropped += 1;
        if (dropped >= 2_000) break;
      }
    }
  }
  const row = buckets.get(key);
  if (!row || now >= row.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (row.n >= limit) return false;
  row.n += 1;
  return true;
}

/** IP the reverse proxy assigned — not the first X-Forwarded-For hop (spoofable). */
export async function clientIp(): Promise<string> {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    const h = getRequest()?.headers;
    if (!h) return "anon";
    if (h.get("cf-ray")) {
      const cf = h.get("cf-connecting-ip")?.trim();
      if (cf) return cf.slice(0, 80);
    }
    const vercel = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
    if (vercel) return vercel.slice(0, 80);
    const real = h.get("x-real-ip")?.trim();
    if (real && real.length < 80) return real;
    const xff = h.get("x-forwarded-for");
    if (xff) {
      const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
      const last = hops[hops.length - 1];
      if (last) return last.slice(0, 80);
    }
    return "anon";
  } catch {
    return "anon";
  }
}

export async function limitOrThrow(key: string, limit: number, windowMs: number) {
  if (rateLimit(key, limit, windowMs)) return;
  const err = new Error("Slow down.");
  (err as Error & { status?: number }).status = 429;
  throw err;
}
