/** Stable fingerprint so the same headline is not spoken twice. */
export function newsKey(text: string): string {
  let s = text.toLowerCase().trim();
  s = s.replace(
    /^(wire|on the wire|wiadomo[sś][cć](?:i)?|w wiadomo[sś]ciach|nagł[oó]wek)\s*[:.·–-]\s*/i,
    "",
  );
  s = s.replace(/^[a-z0-9.]{1,8}\s*[·•:]\s*/, "");
  s = s.replace(/\s+[—–-]\s+[a-z0-9 .&]{2,32}$/i, "");
  s = s.replace(/—.*$/, "");
  s = s.replace(/[-–].{0,24}$/, "");
  s = s.replace(/[^a-z0-9\u00c0-\u024f]+/g, " ").trim();
  return s.slice(0, 96);
}

export function newsKeysFrom(text: string): string[] {
  const parts = text.split(/\s*[·|]\s+/);
  const keys = [newsKey(text), ...parts.map(newsKey)].filter((k) => k.length >= 16);
  return [...new Set(keys)];
}

export function newsOverlap(a: string, b: string): boolean {
  const ka = newsKeysFrom(a);
  const kb = newsKeysFrom(b);
  for (const x of ka) {
    for (const y of kb) {
      if (x === y) return true;
      if (x.length >= 20 && y.length >= 20 && (x.includes(y) || y.includes(x))) return true;
    }
  }
  return false;
}

export function isQuietNews(text: string) {
  return /quiet tape|cisza na ta[sś]mie|no shock|bez wstrz[aą]su/i.test(text);
}
