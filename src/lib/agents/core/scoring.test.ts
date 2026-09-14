import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HARD, WEIGHTS, bandOf, disagreement } from "./scoring.ts";

describe("V2 scoring", () => {
  it("reproduces the spec weighted example", () => {
    const final =
      82 * WEIGHTS.vesper * 1.1 +
      35 * WEIGHTS.ash * 0.92 +
      91 * WEIGHTS.kai * 1.17 +
      -61 * WEIGHTS.damian +
      12 * WEIGHTS.historical;
    assert.ok(Math.abs(final - 51.98) < 0.05);
    assert.equal(bandOf(final), "wait");
  });

  it("maps final-score bands as specified", () => {
    assert.equal(bandOf(44), "reject");
    assert.equal(bandOf(45), "wait");
    assert.equal(bandOf(59), "wait");
    assert.equal(bandOf(60), "small");
    assert.equal(bandOf(74), "small");
    assert.equal(bandOf(75), "normal");
    assert.equal(bandOf(84), "normal");
    assert.equal(bandOf(85), "high");
  });

  it("holds a tradable band down to 57 (hysteresis) and still cliffs on a fresh entry", () => {
    assert.equal(bandOf(59, "small"), "small");
    assert.equal(bandOf(57, "normal"), "small");
    assert.equal(bandOf(56, "small"), "wait");
    assert.equal(bandOf(59, "wait"), "wait");
    assert.equal(bandOf(59, null), "wait");
  });

  it("flags high disagreement when Vesper and Ash oppose at high score", () => {
    const agree = disagreement(89, -82, 91);
    assert.equal(agree.level, "low");
  });

  it("does not treat NO_SIGNAL as high agreement", () => {
    const two = disagreement(90, 0, 90);
    assert.equal(two.level, "medium");
    const one = disagreement(90, 0, 0);
    assert.equal(one.level, "medium");
    const weak = disagreement(90, 19, 90);
    assert.equal(weak.level, "medium");
  });

  it("mixed signed votes cannot be high — conflict bar stays at ±60", () => {
    const mixed = disagreement(90, -53, 90);
    assert.equal(mixed.level, "medium");
    const conflict = disagreement(89, -82, 91);
    assert.equal(conflict.level, "low");
    const aligned = disagreement(90, 50, 90);
    assert.equal(aligned.level, "high");
  });

  it("keeps the hard gates from the spec", () => {
    assert.equal(HARD.MIN_SCOUT_SCORE, 60);
    assert.equal(HARD.MIN_RR, 1.5);
    assert.equal(HARD.MAX_OPEN_LEGS, 2);
    assert.equal(HARD.MAX_RESTING_LIMITS, 1);
    assert.equal(HARD.MAX_ADDS_PER_DAY, 2);
    assert.equal(HARD.MAX_ROUND_TRIP_FEES, 0.05);
    assert.equal(WEIGHTS.vesper, 0.25);
    assert.equal(WEIGHTS.kai, 0.3);
  });
});
