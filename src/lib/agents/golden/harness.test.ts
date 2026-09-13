import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GOLDEN, readyGoldens } from "./catalog.ts";
import { checkExpect, play } from "./harness.ts";

describe("Golden Scenario Harness 01–37", () => {
  it("catalog lists 37 scenarios, 27 ready, 10 reserved", () => {
    assert.equal(GOLDEN.length, 37);
    assert.equal(readyGoldens().length, 27);
    assert.equal(GOLDEN.filter((s) => !s.ready).length, 10);
    assert.deepEqual(
      GOLDEN.map((s) => s.id),
      Array.from({ length: 37 }, (_, i) => String(i + 1).padStart(2, "0")),
    );
  });

  it("reserved 21–30 declare honest coverage (no false 'already covered')", () => {
    const reserved = GOLDEN.filter((s) => Number(s.id) >= 21 && Number(s.id) <= 30);
    assert.equal(reserved.length, 10);
    for (const s of reserved) {
      assert.equal(s.ready, false, `${s.id} should not be ready`);
      assert.ok(s.coverage === "covered" || s.coverage === "partial" || s.coverage === "missing", `${s.id} coverage`);
      assert.ok(s.coveredIn, `${s.id} needs coveredIn`);
    }
    assert.equal(reserved.find((s) => s.id === "23")?.coverage, "partial");
    assert.equal(reserved.find((s) => s.id === "27")?.coverage, "partial");
  });

  for (const scenario of readyGoldens()) {
    it(`${scenario.id} ${scenario.name}`, () => {
      assert.ok(scenario.snap, "ready scenario needs a snapshot");
      assert.ok(scenario.expect, "ready scenario needs an expect");
      const { verdict } = play(scenario);
      const fail = checkExpect(verdict, scenario.expect!);
      assert.equal(
        fail.length,
        0,
        [
          `${scenario.id} ${scenario.name}`,
          ...fail,
          `order=${verdict.order ? `${verdict.order.side} ${verdict.order.symbol} x${verdict.order.qty}` : "null"}`,
          `band=${verdict.band} score=${verdict.finalScore} agree=${verdict.agreement?.level} mode=${verdict.mode} iris=${verdict.irisVote} size=${verdict.irisSizePct}`,
          `votes v=${verdict.vesperVote} a=${verdict.ashVote} k=${verdict.kaiVote}`,
        ].join(" | "),
      );
    });
  }

  for (const scenario of GOLDEN.filter((s) => !s.ready)) {
    it.todo(`${scenario.id} ${scenario.name} [${scenario.coverage}] ${scenario.coveredIn ?? ""}`.trim());
  }
});
