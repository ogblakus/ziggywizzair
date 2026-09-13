//#region node_modules/.nitro/vite/services/ssr/assets/limit-2GEJY2rU.js
/** In-process sliding window. Good enough for a single Node instance. */
var buckets = /* @__PURE__ */ new Map();
var MAX_KEYS = 8e3;
function rateLimit(key, limit, windowMs) {
	const now = Date.now();
	if (buckets.size > MAX_KEYS) {
		let dropped = 0;
		for (const [k, row] of buckets) if (now >= row.reset || dropped < 1e3) {
			buckets.delete(k);
			dropped += 1;
			if (dropped >= 2e3) break;
		}
	}
	const row = buckets.get(key);
	if (!row || now >= row.reset) {
		buckets.set(key, {
			n: 1,
			reset: now + windowMs
		});
		return true;
	}
	if (row.n >= limit) return false;
	row.n += 1;
	return true;
}
/** IP the reverse proxy assigned — not the first X-Forwarded-For hop (spoofable). */
async function clientIp() {
	try {
		const { getRequest } = await import("./server-BxuBBDLK.mjs").then((n) => n.i).then((n) => n.t);
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
//#endregion
export { rateLimit as n, clientIp as t };
