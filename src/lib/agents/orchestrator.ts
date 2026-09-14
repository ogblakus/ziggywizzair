import { marketStateHash } from "@/lib/agents/core/hash";
import type {
  AshOutput,
  DamianOutput,
  DecisionDraft,
  IrisOutput,
  KaiOutput,
  Locale,
  VesperOutput,
} from "@/lib/agents/core/types";
import { applyRestingLimitGate, decisionEngine, hysteresisOf, irisChecks, stalledCut } from "@/lib/agents/decision-engine";
import { validateAndFinalize } from "@/lib/agents/finalize";
import { kaiValidate } from "@/lib/agents/local-models";
import { runAsh, runDamian, runIris, runKai, runVesper } from "@/lib/agents/runners";
import type { CouncilResult, MarketSnapshot } from "@/lib/types";

export type V2Session = {
  result: CouncilResult;
  vesper: VesperOutput;
  ash: AshOutput;
  kai: KaiOutput;
  damian: DamianOutput;
  iris: IrisOutput;
  decision: DecisionDraft;
};

export async function runOrchestrator(input: {
  snap: MarketSnapshot;
  selected?: string | null;
  locale?: Locale;
  last?: CouncilResult | null;
}): Promise<V2Session> {
  const locale: Locale = input.locale === "pl" ? "pl" : "en";
  const snap = input.snap;
  const lookingAt = input.selected ?? null;
  const hash = marketStateHash({
    t: snap.tickers.map((x) => [x.symbol, x.price, x.changePct, x.rsi, x.vsSma, x.rvol]),
    b: snap.book,
    m: snap.macro,
  });
  const [vesper, ash, kaiScanOut, damian] = await Promise.all([
    runVesper(snap, lookingAt, locale, hash),
    runAsh(snap, lookingAt, locale, hash),
    runKai(snap, lookingAt, locale, hash),
    runDamian(snap, locale, hash),
  ]);

  const cut = stalledCut(snap);
  const lastHysteresis = hysteresisOf(input.last);
  let decision = decisionEngine({ vesper, ash, kai: kaiScanOut, damian, snap, locale, cut, lastHysteresis });

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
      decision = decisionEngine({ vesper, ash, kai, damian, snap, locale, validated, cut, lastHysteresis });
    }
  }

  const checks = applyRestingLimitGate(irisChecks(snap, decision, kai.primary), snap, kai.primary, decision);
  const iris = await runIris({ snap, locale, decision, checks, vesper, ash, kai, damian });
  const result = validateAndFinalize({ snap, locale, vesper, ash, kai, damian, iris, decision });
  return { result, vesper, ash, kai, damian, iris, decision };
}

export { asDegradedLocal } from "@/lib/agents/core/status";
export { newRunId } from "@/lib/agents/core/hash";
export { validateAndFinalize };
