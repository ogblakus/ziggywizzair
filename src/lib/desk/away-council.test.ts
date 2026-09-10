import { describe, expect, it } from "vitest";
import { emptyBook, scrubGhostAutopilot } from "@/lib/desk/engine";
import { shouldAwayCouncil, AWAY_COUNCIL_MS } from "@/lib/desk/away-council";

describe("shouldAwayCouncil", () => {
  it("does not convene while the client is still here", () => {
    const now = 1_000_000;
    const book = { ...emptyBook(now), clientUntil: now + 10_000, lastTickAt: now };
    expect(shouldAwayCouncil(book, now)).toBe(false);
  });

  it("does not convene in live", () => {
    const now = 1_000_000;
    const book = { ...emptyBook(now), mode: "live" as const, clientUntil: 0, lastTickAt: now - 120_000 };
    expect(shouldAwayCouncil(book, now)).toBe(false);
  });

  it("waits while a ticket is already on the rail", () => {
    const now = 1_000_000;
    const book = {
      ...emptyBook(now),
      clientUntil: 0,
      lastTickAt: now - 120_000,
      proposal: { side: "buy" as const, symbol: "META", qty: 10, rationale: "test" },
    };
    expect(shouldAwayCouncil(book, now)).toBe(false);
  });

  it("convenes after the client leaves and no recent session", () => {
    const now = 1_000_000;
    const book = { ...emptyBook(now), clientUntil: now - 60_000, lastTickAt: now - 120_000, lastCouncilAt: 0 };
    expect(shouldAwayCouncil(book, now)).toBe(true);
  });

  it("respects the 5 minute cooldown after a session", () => {
    const now = 1_000_000;
    const book = {
      ...emptyBook(now),
      clientUntil: 0,
      lastTickAt: now - 120_000,
      lastCouncilAt: now - (AWAY_COUNCIL_MS - 1_000),
    };
    expect(shouldAwayCouncil(book, now)).toBe(false);
    expect(shouldAwayCouncil({ ...book, lastCouncilAt: now - AWAY_COUNCIL_MS - 1 }, now)).toBe(true);
  });
});

describe("scrubGhostAutopilot", () => {
  it("unwinds leftover META probe and restores cash", () => {
    const now = 1;
    const book: ReturnType<typeof emptyBook> = {
      ...emptyBook(now),
      cash: 96_730.73,
      positions: [{ symbol: "META", qty: 5, avg: 653.85 }],
      fills: [
        {
          id: "f-ghost",
          ts: now,
          symbol: "META",
          side: "buy",
          qty: 5,
          price: 653.85,
          source: "autopilot",
          note: "Autopilot · desk stayed live",
        },
      ],
      tape: [
        { id: "t1", ts: now, kind: "fill", symbol: "META", text: "BUY 5.00 META @ 653.85 · Autopilot · desk stayed live" },
        { id: "t2", ts: now, kind: "agent", text: "Ta pozycja na META to stary, samodzielny fill autopilota (KUP 5 po 653.85)." },
        { id: "t3", ts: now, kind: "system", text: "Autopilot on." },
      ],
    };
    const clean = scrubGhostAutopilot(book);
    expect(clean.fills).toEqual([]);
    expect(clean.positions).toEqual([]);
    expect(clean.cash).toBeCloseTo(96_730.73 + 5 * 653.85, 4);
    expect(clean.tape.map((t) => t.id)).toEqual(["t3"]);
  });
});
