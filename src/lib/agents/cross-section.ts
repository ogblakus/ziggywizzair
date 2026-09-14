/**
 * Cross-sectional research primitive.
 * Operates on a same-timestamp bag of { symbol, value } only — no bars, no agent verdicts, no future.
 */

export const XS_MIN_N = 3;
/** Converts MAD to a σ-equivalent scale under a Gaussian assumption. */
export const MAD_TO_SIGMA = 1.4826;

export type CrossSectionalRow = {
  symbol: string;
  value: number | null;
  z: number | null;
  sufficient: boolean;
};

export type CrossSectionalSnapshot = {
  method: "robust-z";
  feature: string;
  n: number;
  median: number | null;
  mad: number | null;
  rows: CrossSectionalRow[];
};

function median(xs: number[]): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  // Even n: arithmetic mean of the two central values (numpy / scipy).
  // Not the low-median convention. For |dev| of [1,2,3,100] that is MAD = 1, not 0.5.
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function finiteValue(v: number | null | undefined): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Robust z-score: (x − median) / (1.4826 × MAD).
 * Nulls ignored. n < 3 → insufficient, every z is null.
 * MAD = 0 (identical finite values) → z = 0, no division.
 */
export function robustCrossSection(
  rows: Array<{ symbol: string; value: number | null | undefined }>,
  feature = "signedMove",
): CrossSectionalSnapshot {
  const values = rows.map((r) => r.value).filter(finiteValue);
  const n = values.length;
  const sufficient = n >= XS_MIN_N;
  const med = sufficient ? median(values) : null;
  const mad = med == null ? null : median(values.map((v) => Math.abs(v - med)));
  const scale = mad != null && mad > 0 ? MAD_TO_SIGMA * mad : null;

  return {
    method: "robust-z",
    feature,
    n,
    median: sufficient ? med : null,
    mad: sufficient ? mad : null,
    rows: rows.map((r) => {
      const value = finiteValue(r.value) ? r.value : null;
      let z: number | null = null;
      if (sufficient && value != null && med != null) {
        z = scale == null ? 0 : (value - med) / scale;
        if (!Number.isFinite(z)) z = null;
      }
      return { symbol: r.symbol, value, z, sufficient };
    }),
  };
}
