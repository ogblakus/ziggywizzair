import type { CouncilResult } from "@/lib/types";

export function asDegradedLocal(result: CouncilResult): CouncilResult {
  if (result.status) return result;
  return {
    ...result,
    status: {
      mode: "degraded",
      sources: {
        vesper: "local",
        ash: "local",
        kai: "local",
        damian: "local",
        iris: "rules",
      },
    },
  };
}
