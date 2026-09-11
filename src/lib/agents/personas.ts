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
    mandate: "Ride expansion vs 20-SMA / RSI. Cut stalls.",
    mark: "V",
  },
  {
    id: "ash",
    name: "Ash",
    role: "Mean reversion",
    mandate: "Fade vs 20-SMA / RSI extremes. One clip.",
    mark: "A",
  },
  {
    id: "kai",
    name: "Kai",
    role: "Setup",
    mandate: "15m/1h/4h: highest-TF FVG the price tags, or a 15m pullback. 1m is noise.",
    mark: "K",
  },
  {
    id: "damian",
    name: "Damian Kaczmarski",
    role: "Sentiment",
    mandate: "Sector bias only — stocks, crypto, metals, dollar, vol. No RSI, no ticker vote.",
    mark: "D",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Risk chair",
    mandate: "Sizes 2–6% from Damian's weather. Fees ≤ 5% round-trip.",
    mark: "I",
  },
];

export const AGENT_BY_ID: Record<AgentId, AgentPersona> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, AgentPersona>;

export function agentShort(id: AgentId) {
  return AGENT_BY_ID[id].name.split(" ")[0] ?? AGENT_BY_ID[id].name;
}
