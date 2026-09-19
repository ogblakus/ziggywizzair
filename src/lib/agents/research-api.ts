import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

export type { ResearchLabPayload } from "@/lib/agents/research-recorder";

export const loadResearchLab = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { symbol?: string | null } | undefined) => input ?? {})
  .handler(async ({ data }) => {
    const { loadLabFromStore } = await import("./research-store.server");
    return loadLabFromStore(data?.symbol ?? null);
  });
