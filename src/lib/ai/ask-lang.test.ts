import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isEnglishLeak, isWhyOpenedQuestion, looksPolish, missedWhyOpened, replyLocale } from "./ask-lang.ts";

describe("ask-lang", () => {
  it("treats the META screenshot question as Polish why-opened", () => {
    const q = "na jakiej podstawie otworzyłeś trade'a na META?";
    assert.equal(looksPolish(q), true);
    assert.equal(isWhyOpenedQuestion(q), true);
    assert.equal(replyLocale("en", q), "pl");
    assert.equal(replyLocale("pl", q), "pl");
  });

  it("honors the settings locale when the question is English", () => {
    assert.equal(replyLocale("pl", "Should I close META?"), "pl");
    assert.equal(replyLocale("en", "Should I close META?"), "en");
  });

  it("flags the English slogan dump as a leak", () => {
    const dump =
      "Hold the thesis, not the hope. Book is long 5.00 META from 653.85, now -0.02%. I add on dips, not on squeezes — if it rips, I do not chase.";
    assert.equal(isEnglishLeak(dump, "pl"), true);
    assert.equal(isEnglishLeak(dump, "en"), false);
    assert.equal(
      isEnglishLeak("Podstawa: głos Vesper — KUP META. Transakcja KUP 5 po 653.85.", "pl"),
      false,
    );
  });

  it("flags an RSI dump as missing the why", () => {
    const q = "na jakiej podstawie otworzyłeś trade'a na META?";
    assert.equal(
      missedWhyOpened(
        q,
        "Hold the thesis, not the hope. Book is long 5.00 META. META +6.55 · RSI 52 · vs20 +0.01%.",
      ),
      true,
    );
    assert.equal(
      missedWhyOpened(q, "Podstawa: głos Vesper — KUP META. Rada otworzyła 5 po 653.85."),
      false,
    );
  });
});
