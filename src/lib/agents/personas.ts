export type AgentId = "vesper" | "ash" | "kai" | "damian" | "iris";
export type Vote = "buy" | "sell" | "hold";

export type AgentPersona = {
  id: AgentId;
  name: string;
  role: string;
  mandate: string;
  mark: string;
};

export const AGENTS: AgentPersona[] = [
  {
    id: "vesper",
    name: "Vesper",
    role: "Momentum",
    mandate: "Independent momentum specialist. 15m expansion score. Does not see the others.",
    mark: "V",
  },
  {
    id: "ash",
    name: "Ash",
    role: "Mean reversion",
    mandate: "Independent mean-reversion specialist. HOLD is valid. Does not oppose Vesper.",
    mark: "A",
  },
  {
    id: "kai",
    name: "Kai",
    role: "Setup",
    mandate: "Entry quality only. Ready / wait / blocked. Never flips direction.",
    mark: "K",
  },
  {
    id: "damian",
    name: "Damian Kaczmarski",
    role: "Sentiment",
    mandate: "Macro regime only. Never votes a ticker. Headwind, not a veto.",
    mark: "D",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Risk chair",
    mandate: "Risk control: APPROVE / REDUCE / WAIT / REJECT. Does not invent direction.",
    mark: "I",
  },
];

export const AGENT_BY_ID: Record<AgentId, AgentPersona> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, AgentPersona>;

export function agentShort(id: AgentId) {
  return AGENT_BY_ID[id].name.split(" ")[0] ?? AGENT_BY_ID[id].name;
}
