import { marketStateHash } from "@/lib/agents/core/hash";
import type { Locale } from "@/lib/agents/core/types";
import { applyRestingLimitGate, decisionEngine, irisChecks, stalledCut } from "@/lib/agents/decision-engine";
import { validateAndFinalize } from "@/lib/agents/finalize";
import {
  ashFallback,
  damianFallback,
  irisRules,
  kaiFallback,
  kaiValidate,
  vesperFallback,
} from "@/lib/agents/local-models";
import type { CouncilResult, MarketSnapshot } from "@/lib/types";

/** Spec §65 — deterministic V2 path when Grok is down. No lastCouncil. */
export function runLocalV2(input: {
  snap: MarketSnapshot;
  selected?: string | null;
  locale?: Locale;
}): CouncilResult {
  const locale: Locale = input.locale === "pl" ? "pl" : "en";
  const snap = input.snap;
  const hash = marketStateHash({
    t: snap.tickers.map((x) => [x.symbol, x.price, x.changePct, x.rsi, x.vsSma, x.rvol]),
    b: snap.book,
    m: snap.macro,
  });
  const vesper = vesperFallback(snap, locale, hash);
  const ash = ashFallback(snap, locale, hash);
  const kaiScanOut = kaiFallback(snap, locale, hash);
  const damian = damianFallback(snap, locale, hash);
  const cut = stalledCut(snap);
  let decision = decisionEngine({ vesper, ash, kai: kaiScanOut, damian, snap, locale, cut });

  let kai = kaiScanOut;
  if (decision.symbol && decision.side) {
    const validated = kaiValidate(snap, decision.symbol, decision.side, locale);
    if (validated) {
      const scan = [validated, ...kai.scan.filter((s) => s.symbol !== validated.symbol)].slice(0, 3);
      kai = {
        ...kai,
        scan,
        primary: validated,
        recommendation: {
          direction: validated.status === "blocked" ? "hold" : validated.side,
          strength: validated.qualityScore,
          confidence: validated.status === "ready" ? 0.72 : validated.status === "wait" ? 0.55 : 0.35,
        },
      };
      decision = decisionEngine({ vesper, ash, kai, damian, snap, locale, validated, cut });
    }
  }

  const checks = applyRestingLimitGate(irisChecks(snap, decision, kai.primary), snap, kai.primary, decision.cut);
  const iris = irisRules({ locale, decision, checks });
  return validateAndFinalize({ snap, locale, vesper, ash, kai, damian, iris, decision });
}
