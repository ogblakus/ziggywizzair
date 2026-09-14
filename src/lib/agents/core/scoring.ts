export type ScoreBand = "reject" | "wait" | "small" | "normal" | "high";
export type Agreement = {
  direction: "buy" | "sell" | "hold";
  level: "high" | "medium" | "low";
  score: number;
};

export const WEIGHTS = {
  vesper: 0.25,
  ash: 0.15,
  kai: 0.3,
  damian: 0.15,
  historical: 0.15,
} as const;

export const HARD = {
  MAX_OPEN_LEGS: 2,
  MAX_RESTING_LIMITS: 1,
  MAX_ADDS_PER_DAY: 2,
  MAX_ROUND_TRIP_FEES: 0.05,
  MIN_SCOUT_SCORE: 60,
  MIN_RR: 1.5,
  MULT_MIN: 0.5,
  MULT_MAX: 1.25,
  SAMPLE_FOR_WEIGHT: 30,
} as const;

export function bandOf(score: number, prev: ScoreBand | null = null): ScoreBand {
  const enter = (() => {
    if (score < 45) return "reject" as const;
    if (score < 60) return "wait" as const;
    if (score < 75) return "small" as const;
    if (score < 85) return "normal" as const;
    return "high" as const;
  })();
  const held = prev === "small" || prev === "normal" || prev === "high";
  if (!held) return enter;
  if (score < 45) return "reject";
  if (score < 57) return "wait";
  if (score < 60) return "small";
  return enter;
}

/** Signed contributions are already in the candidate's direction frame. 0 / |n|<40 is NO_SIGNAL, not agreement. */
export function disagreement(vesper: number, ash: number, kai: number): Agreement {
  const SIGNAL = 40;
  const norm = (n: number) => (Math.abs(n) < SIGNAL ? 0 : n);
  const signed = [norm(vesper), norm(ash), norm(kai)].filter((n) => n !== 0);
  if (signed.length < 2) {
    const dir = vesper >= ash ? (vesper >= 0 ? "buy" : "sell") : ash >= 0 ? "buy" : "sell";
    return { direction: Math.abs(vesper) < 40 && Math.abs(ash) < 40 ? "hold" : dir, level: "medium", score: 0.6 };
  }
  const pos = signed.filter((n) => n > 0).length;
  const neg = signed.filter((n) => n < 0).length;
  const mag = signed.reduce((s, n) => s + Math.abs(n), 0) || 1;
  const agreeMag = signed.filter((n) => (pos >= neg ? n > 0 : n < 0)).reduce((s, n) => s + Math.abs(n), 0);
  const score = agreeMag / mag;
  const conflict = (vesper >= 60 && ash <= -60) || (vesper <= -60 && ash >= 60);
  let level: Agreement["level"] = conflict ? "low" : score >= 0.75 ? "high" : score >= 0.55 ? "medium" : "low";
  if (signed.length < 3 && level === "high") level = "medium";
  if (pos > 0 && neg > 0 && level === "high") level = "medium";
  const direction = pos === neg ? "hold" : pos > neg ? "buy" : "sell";
  return { direction, level, score: Number(score.toFixed(2)) };
}
