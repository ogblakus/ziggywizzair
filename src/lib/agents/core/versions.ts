export const DECISION_ENGINE_VERSION = "2.4";
export const STRATEGY_VERSION = 3;
export const SCHEMA_VERSION = "2.4";

export const PROMPT_VERSION = {
  vesper: "2.1",
  ash: "2.1",
  kai: "2.1",
  damian: "2.1",
  iris: "2.1",
} as const;

export const KNOWLEDGE_VERSION = {
  vesper: "1.4",
  ash: "1.4",
  kai: "1.4",
  damian: "1.4",
  iris: "1.4",
} as const;

type VersionedAgent = keyof typeof PROMPT_VERSION;

/** Stamp prompt/knowledge/schema versions onto an agent envelope. Idempotent. */
export function stampAgentMeta<T extends { agent: VersionedAgent }>(
  out: T,
): T & { promptVersion: string; knowledgeVersion: string; schemaVersion: string } {
  return {
    ...out,
    promptVersion: PROMPT_VERSION[out.agent],
    knowledgeVersion: KNOWLEDGE_VERSION[out.agent],
    schemaVersion: SCHEMA_VERSION,
  };
}
