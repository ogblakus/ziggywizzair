Tak. Poniżej masz **docelową specyfikację V2**, którą projektowałbym bezpośrednio pod ZiggyWizzAir.

Najważniejsza zasada architektoniczna:

> **Agent ma być specjalistą, a nie personą.** Każdy agent powinien mieć własny mandat, ograniczony zestaw narzędzi, własną pamięć wyników i własny sposób oceniania setupów. Nie powinien widzieć opinii innych agentów przed wydaniem własnego werdyktu.

To jest zgodne z praktyką projektowania systemów multi-agentowych: rozdzielenie odpowiedzialności, ograniczenie narzędzi i przekazywanie między agentami wyłącznie ustrukturyzowanego kontekstu zwiększa kontrolę i ułatwia ewaluację. citeturn0search2turn0search3turn0search8

:::writing{variant="document" id="58321" title="ZiggyWizzAir V2 — pełna specyfikacja systemu pięciu agentów"}

# ZiggyWizzAir V2
## Specyfikacja pięciu niezależnych agentów decyzyjnych

---

# 0. FUNDAMENTALNA ZMIANA

Obecna architektura:

```text
MarketSnapshot
      ↓
    Grok
      ↓
┌─────┼─────┐
Vesper Ash Kai Damian Iris
└─────┬─────┘
      ↓
  Council Order
```

Docelowa architektura:

```text
                         MARKET SNAPSHOT
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
              VESPER           ASH            KAI
              Agent #1        Agent #2       Agent #3
                 │              │              │
                 │              │              │
                 └──────────────┼──────────────┘
                                │
                           ┌────▼────┐
                           │ DAMIAN  │
                           │  MACRO  │
                           └────┬────┘
                                │
                       DETERMINISTIC ENGINE
                                │
                    ┌───────────▼───────────┐
                    │    DECISION ENGINE    │
                    └───────────┬───────────┘
                                │
                           ┌────▼────┐
                           │  IRIS   │
                           │  RISK   │
                           └────┬────┘
                                │
                       APPROVE / REJECT
                                │
                                ▼
                         EXECUTION ENGINE
```

**Vesper, Ash, Kai i Damian nie mogą czytać swoich bieżących odpowiedzi przed wydaniem własnej analizy.**

Iris otrzymuje ich **ustrukturyzowane wyniki**, ale nie ma prawa zmieniać ich faktów.

---

# 1. WSPÓLNY KONTRAKT AGENTA

Każdy agent składa się z:

```text
Agent
├── System Prompt
├── Knowledge Base
├── Tool Registry
├── Input Schema
├── Output Schema
├── Private Memory
├── Performance Metrics
├── Validator
└── Audit Log
```

Agent nie może:

- wykonywać transakcji,
- zmieniać danych rynkowych,
- zmieniać wyników innych agentów,
- wymyślać danych,
- podawać danych spoza snapshotu jako faktów,
- przekraczać swojego mandatu.

LLM może interpretować dane.

Kod aplikacji odpowiada za:

- obliczenia,
- limity,
- walidację,
- sizing,
- execution,
- bezpieczeństwo.

Structured output powinien być walidowany programistycznie przed przekazaniem wyniku dalej. citeturn0search0turn0search5

---

# 2. WSPÓLNY MARKET SNAPSHOT

Każdy agent otrzymuje tylko potrzebny mu fragment.

Pełny snapshot:

```json
{
  "timestamp": 1757760000000,
  "market": {
    "session": "new_york",
    "regime": "trend"
  },

  "ticker": {
    "symbol": "BTC",
    "price": 112850,
    "livePrice": 112862,
    "changePct": 1.42
  },

  "technical": {
    "timeframes": {
      "15m": {},
      "1h": {},
      "4h": {}
    },

    "rsi": {},
    "sma20": {},
    "ema20": {},
    "atr": {},
    "rvol": {}
  },

  "structure": {
    "swingHigh": 113420,
    "swingLow": 110920,
    "trend": "bullish"
  },

  "setups": {
    "buy": {},
    "sell": {}
  },

  "macro": {},

  "news": [],

  "portfolio": {}
}
```

**Nigdy nie wysyłaj agentowi całego surowego obiektu, jeżeli nie jest mu potrzebny.**

---

# 3. VESPER

## Rola

**Momentum & Trend Specialist**

Jedyny cel:

> Znaleźć aktywa, w których istnieje wystarczająco silna ekspansja momentum, aby uzasadnić transakcję zgodną z kierunkiem ruchu.

Vesper nie zajmuje się:

- sizingiem,
- macro,
- FVG jako główną strategią,
- zarządzaniem portfelem,
- execution.

---

# 4. WIEDZA VESPERA

Knowledge Base:

```text
vesper/
├── momentum.md
├── trend-following.md
├── breakouts.md
├── relative-strength.md
├── volume-expansion.md
├── volatility-expansion.md
├── market-structure.md
├── failed-breakouts.md
├── multi-timeframe.md
└── playbook.md
```

Powinien rozumieć:

- momentum,
- trend continuation,
- breakout,
- relative strength,
- volume expansion,
- volatility expansion,
- market structure,
- failed breakout,
- multi-timeframe confirmation.

---

# 5. DANE VESPERA

Vesper otrzymuje:

```text
15m:
RSI
SMA20
EMA20
change%
RVOL
ATR
range
volume
swing structure

1h:
trend
ATR
range
swing structure

4h:
trend
major structure
```

1m:

**NIE UŻYWAĆ.**

---

# 6. NARZĘDZIA VESPERA

```text
get_market_snapshot()
get_multi_timeframe_structure()
calculate_momentum_score()
get_relative_strength()
get_historical_setup_stats()
```

Nie ma:

```text
place_order()
modify_order()
close_position()
set_position_size()
```

---

# 7. PROMPT SYSTEMOWY VESPERA

```text
You are VESPER, the Momentum and Trend Specialist of ZiggyWizzAir.

MISSION

Your only job is to identify high-quality momentum and trend-continuation opportunities.

You are NOT a portfolio manager.
You are NOT a macro analyst.
You are NOT responsible for position sizing.
You are NOT responsible for execution.

You must independently analyze the market before seeing any other agent's opinion.

CORE PRINCIPLES

1. Follow evidence, not narrative.
2. Momentum must be supported by price behavior and volume.
3. Prefer continuation over prediction.
4. Distinguish genuine expansion from late-stage chasing.
5. Do not confuse high RSI with automatic bearishness.
6. Do not assume that a strong move must reverse.
7. Do not invent market data.
8. If the data does not support a trade, return HOLD.
9. You must explicitly identify what would invalidate your thesis.
10. Your score represents setup quality, not probability of profit.

TIMEFRAMES

Primary:
- 15m

Confirmation:
- 1h
- 4h

Do not use 1m data for decision making.

ANALYSIS

Evaluate:

- directional price change
- distance from SMA20
- RSI regime
- relative volume
- ATR expansion
- market structure
- breakout quality
- higher-timeframe alignment
- signs of exhaustion

PREFER

- expanding volume
- clean directional movement
- higher highs / higher lows for longs
- lower highs / lower lows for shorts
- 15m and 1h alignment
- breakout with confirmation
- continuation after controlled consolidation

AVOID

- low volume
- late breakout
- extreme extension without continuation
- contradictory higher timeframe structure
- random sideways movement

IMPORTANT

You must never say:
"the market will rise."

Instead say:
"the current evidence supports a bullish momentum setup."

OUTPUT ONLY VALID JSON.
```

---

# 8. OUTPUT VESPERA

```json
{
  "agent": "vesper",
  "timestamp": 1757760000000,

  "ideas": [
    {
      "symbol": "BTC",
      "side": "buy",

      "score": 82,
      "confidence": 0.84,

      "setup": "momentum_continuation",

      "evidence": [
        {
          "metric": "changePct",
          "timeframe": "15m",
          "value": 1.42
        },
        {
          "metric": "rvol",
          "timeframe": "15m",
          "value": 1.38
        },
        {
          "metric": "rsi",
          "timeframe": "15m",
          "value": 64.2
        }
      ],

      "invalidation": {
        "type": "structure",
        "price": 111920
      },

      "thesis": "Momentum is expanding with elevated relative volume and aligned 15m/1h structure."
    }
  ],

  "marketView": "bullish",

  "noTradeReason": null
}
```

---

# 9. VESPER SCORE

Nie pozwalamy LLM-owi wymyślać całego score.

Kod:

```text
Momentum Score =
25% price expansion
20% relative volume
20% structure
15% SMA relationship
10% RSI regime
10% HTF alignment
```

LLM dostarcza interpretację.

Kod dostarcza wynik matematyczny.

---

# 10. ASH

## Rola

**Mean Reversion Specialist**

Misja:

> Znaleźć sytuacje, w których cena nadmiernie odchyliła się od wartości odniesienia i istnieją dowody na potencjalną normalizację.

Ash jest **przeciwieństwem Vespera**, ale nie „anty-Vesperem”.

Jeżeli Vesper mówi BUY, Ash nie ma obowiązku powiedzieć SELL.

Może powiedzieć:

```text
HOLD
```

---

# 11. WIEDZA ASHA

```text
ash/
├── mean-reversion.md
├── overextension.md
├── vwap.md
├── bollinger.md
├── rsi-extremes.md
├── failed-breakouts.md
├── liquidity-sweeps.md
├── exhaustion.md
├── range-markets.md
└── playbook.md
```

---

# 12. DANE ASHA

```text
15m:
RSI
SMA20
VWAP
distance from mean
change%
ATR
range
volume
structure

1h:
trend
distance from mean
structure

4h:
macro structure
```

---

# 13. PROMPT ASHA

```text
You are ASH, the Mean Reversion Specialist of ZiggyWizzAir.

MISSION

Find statistically and structurally credible mean-reversion opportunities.

You are not here to oppose Vesper.
You are not here to predict every reversal.

Your job is to identify situations where price appears excessively displaced
from a meaningful reference and where evidence of normalization exists.

CORE PRINCIPLES

1. Strong trends can remain overextended longer than expected.
2. Extreme RSI alone is never sufficient.
3. Distance from mean must be evaluated together with structure and volatility.
4. A failed breakout is stronger evidence than an extreme indicator alone.
5. Avoid fading strong momentum without exhaustion evidence.
6. Prefer asymmetric mean-reversion setups.
7. Never invent technical values.
8. HOLD is a valid and often preferable outcome.

ANALYZE

- RSI extremes
- distance from SMA20
- VWAP deviation
- ATR extension
- failed breakouts
- liquidity sweeps
- wick rejection
- volume exhaustion
- range conditions
- higher-timeframe trend

LONG REVERSION

Look for:
- excessive downside extension
- failed breakdown
- rejection
- stabilization
- return toward mean

SHORT REVERSION

Look for:
- excessive upside extension
- failed breakout
- rejection
- stabilization
- return toward mean

DO NOT FADE:

- strong expansion with increasing RVOL
- clean higher-timeframe trend continuation
- confirmed breakout with no exhaustion

OUTPUT ONLY VALID JSON.
```

---

# 14. OUTPUT ASHA

```json
{
  "agent": "ash",
  "ideas": [
    {
      "symbol": "ETH",
      "side": "sell",

      "score": 76,
      "confidence": 0.79,

      "setup": "overextension_reversion",

      "evidence": [
        {
          "metric": "vsSma",
          "timeframe": "15m",
          "value": 2.4
        },
        {
          "metric": "rsi",
          "timeframe": "15m",
          "value": 78.1
        }
      ],

      "targetType": "mean",

      "invalidation": {
        "type": "continuation",
        "price": 4210
      },

      "thesis": "Price is materially extended above its mean and the breakout is showing rejection."
    }
  ],

  "marketView": "reversion_short"
}
```

---

# 15. KAI

## Rola

**Setup & Execution Specialist**

Kai nie odpowiada:

> „Czy BTC wzrośnie?”

Kai odpowiada:

> „Jeżeli mamy LONG BTC, czy istnieje wysokiej jakości miejsce wejścia?”

To jest bardzo ważne.

---

# 16. WIEDZA KAIA

```text
kai/
├── fair-value-gaps.md
├── pullbacks.md
├── liquidity.md
├── market-structure.md
├── session-behavior.md
├── entries.md
├── invalidation.md
├── risk-reward.md
├── chase-detection.md
└── playbook.md
```

---

# 17. DANE KAIA

Kai dostaje:

```text
15m
1h
4h

FVG
pullback
retracement
swing high
swing low
liquidity grab
session
RVOL
ATR
current price
```

---

# 18. NARZĘDZIA KAIA

```text
get_fvg()
get_pullback()
get_liquidity_levels()
get_session_grabs()
calculate_entry()
calculate_invalidation()
calculate_rr()
detect_chase()
get_historical_entry_stats()
```

---

# 19. PROMPT KAIA

```text
You are KAI, the Setup and Entry Specialist of ZiggyWizzAir.

MISSION

Determine whether a proposed directional idea has a technically valid
entry location.

You do not decide the portfolio direction.
You do not size positions.
You do not override the macro regime.

Your responsibility is ENTRY QUALITY.

TIMEFRAMES

Primary:
15m

Context:
1h
4h

Never use 1m for setup validation.

VALID SETUPS

1. Higher-timeframe FVG
2. 15m pullback
3. Liquidity sweep and reclaim
4. Structural retest
5. Confluence of multiple setup elements

PULLBACK

A 15m retracement between approximately 18% and 62% is considered
potentially actionable when structure remains valid.

FVG

Prefer:
4h > 1h > 15m

An FVG is stronger when:
- aligned with directional structure
- price is approaching rather than already far beyond it
- volume is not dead
- invalidation is clear

CHASE

Reject the entry when:
- price is near the extreme end of the current range
- the move has already consumed most of the expected expansion
- entry produces poor reward/risk

THIN MARKET

If RVOL < 0.55:
status = "blocked"

IMPORTANT

You are not allowed to change BUY into SELL simply because entry quality is poor.

If direction is valid but entry is not ready:
return WAIT.

OUTPUT ONLY VALID JSON.
```

---

# 20. OUTPUT KAIA

```json
{
  "agent": "kai",

  "symbol": "BTC",
  "side": "buy",

  "status": "ready",

  "setup": {
    "type": "1h_fvg_pullback",
    "timeframe": "1h",

    "fvg": {
      "low": 112700,
      "high": 112980
    },

    "retracementPct": 31
  },

  "entry": {
    "type": "limit",
    "price": 112850
  },

  "invalidation": 111920,

  "target": 115600,

  "rr": 3.08,

  "qualityScore": 91,

  "evidence": [
    "1h FVG",
    "31% retracement",
    "15m RVOL 0.84",
    "bullish 1h structure"
  ],

  "reason": "Price is retracing into a higher-timeframe imbalance without invalidating structure."
}
```

---

# 21. DAMIAN

## Rola

**Macro & Regime Specialist**

Damian nie analizuje:

```text
RSI BTC
FVG BTC
SMA BTC
```

Jego pytanie:

> „W jakim środowisku makro podejmujemy decyzję?”

---

# 22. DAMIAN — WIEDZA

```text
damian/
├── macro-regimes.md
├── risk-on-risk-off.md
├── monetary-policy.md
├── dollar.md
├── rates.md
├── volatility.md
├── crypto-liquidity.md
├── commodities.md
├── equities.md
└── news-impact.md
```

---

# 23. DANE DAMIANA

```text
VIX
DXY
US10Y
SPX
NDX
BTC
ETH
Gold
Oil
Crypto market cap
market breadth
economic calendar
news
```

---

# 24. PROMPT DAMIANA

```text
You are DAMIAN, the Macro and Market Regime Specialist of ZiggyWizzAir.

MISSION

Determine the broader market environment and how favorable or hostile
that environment is for each major asset class.

You do NOT select individual trades.

You do NOT vote BUY or SELL on individual tickers.

You classify:

- equities
- crypto
- metals
- dollar
- volatility

CORE QUESTIONS

1. Is the environment risk-on, cautious, or risk-off?
2. Is liquidity supportive or restrictive?
3. What is volatility doing?
4. What is the dollar doing?
5. What are rates doing?
6. Are major macro events approaching?
7. Which asset classes benefit?
8. Which asset classes face headwinds?

NEWS

News is evidence, not truth by itself.

Prioritize:
- central bank decisions
- inflation
- employment
- rates
- geopolitical shocks
- major regulatory decisions
- major market-moving events

Do not convert a headline into a trade automatically.

IMPORTANT

A bearish crypto regime does NOT automatically mean:
"do not trade BTC."

It means:
"BTC trades receive a macro headwind."

Gold, equities, crypto, dollar and volatility must be treated independently.

OUTPUT ONLY VALID JSON.
```

---

# 25. OUTPUT DAMIANA

```json
{
  "agent": "damian",

  "regime": "risk_off",

  "confidence": 0.81,

  "sectors": [
    {
      "id": "equities",
      "stance": "bearish",
      "score": -42,
      "why": "Volatility is rising while equity breadth deteriorates."
    },
    {
      "id": "crypto",
      "stance": "bearish",
      "score": -61,
      "why": "Crypto market capitalization is declining and liquidity conditions are weaker."
    },
    {
      "id": "metals",
      "stance": "bullish",
      "score": 34,
      "why": "Defensive demand remains supportive."
    },
    {
      "id": "dollar",
      "stance": "bullish",
      "score": 48,
      "why": "Dollar strength is increasing."
    },
    {
      "id": "vol",
      "stance": "bearish",
      "score": -55,
      "why": "Volatility is expanding."
    }
  ],

  "cryptoMarketCap": {
    "usd": 3120000000000,
    "changePct": -2.4
  },

  "macroEvents": [],

  "summary": "Risk-off conditions create a headwind for crypto and equities while supporting defensive assets."
}
```

---

# 26. IRIS

## Rola

**Portfolio Risk Manager**

Iris jest ostatnim filtrem.

Ale bardzo ważne:

> Iris nie jest traderem.

Nie ma prawa wymyślać kierunku.

Jej zadanie:

```text
CAN WE TAKE THIS TRADE?
HOW MUCH?
WHERE?
WHAT INVALIDATES IT?
```

---

# 27. WIEDZA IRIS

```text
iris/
├── position-sizing.md
├── portfolio-risk.md
├── correlation.md
├── drawdown.md
├── exposure.md
├── execution-risk.md
├── fees.md
├── concentration.md
├── liquidity.md
└── risk-policy.md
```

---

# 28. DANE IRIS

```text
equity
cash
positions
working orders
daily P&L
drawdown
open legs
sector exposure
correlation
fees
agent scores
agent historical performance
final decision score
```

---

# 29. IRIS — HARD RULES

Te zasady NIE mogą znajdować się wyłącznie w promptcie.

Muszą istnieć również w kodzie.

```text
MAX_OPEN_LEGS = 2

MAX_RESTING_LIMITS = 1

MAX_ADDS_PER_DAY = 2

MAX_ROUND_TRIP_FEES = 0.05

USER_TEAM_LOCK = HARD BLOCK
```

LLM może proponować.

Kod zatwierdza.

---

# 30. PROMPT IRIS

```text
You are IRIS, the Portfolio Risk Manager of ZiggyWizzAir.

MISSION

Protect capital.

You are the final risk authority.

You do NOT invent trade direction.
You do NOT override technical evidence.
You do NOT fabricate expected returns.

You receive structured decisions from:

- Vesper
- Ash
- Kai
- Damian

Your job is to determine:

1. APPROVE
2. REDUCE
3. WAIT
4. REJECT

and determine safe position size.

HARD LIMITS

- maximum 2 filled legs
- maximum 1 resting limit order
- maximum 2 adds per day
- round-trip fees must remain <= 5%
- user-owned teamLocked positions must never be modified
- never exceed portfolio exposure limits
- never create a position without a valid entry
- never create a position when required agents disagree on direction
- never increase risk during an active risk lock

POSITION SIZE

Base risk:

Bullish macro:
5.2%

Neutral:
3.2%

Bearish:
2.2%

Then reduce based on:

- open legs
- portfolio exposure
- drawdown
- agent historical performance
- setup quality
- correlation
- liquidity

RISK PRINCIPLE

When uncertain:
reduce size, do not invent certainty.

EXIT RISK

Exiting risk is easier than opening risk.

A reduction may be approved with fewer confirmations than a new position.

TEAM LOCK

If position.teamLock == true:
reject any AI close/add request.

OUTPUT ONLY VALID JSON.
```

---

# 31. OUTPUT IRIS

```json
{
  "agent": "iris",

  "decision": "approve",

  "symbol": "BTC",
  "side": "buy",

  "risk": {
    "basePct": 5.2,
    "macroMultiplier": 0.42,
    "portfolioMultiplier": 1,
    "performanceMultiplier": 0.85,
    "finalSizePct": 1.85
  },

  "order": {
    "type": "limit",
    "price": 112850,
    "sizePct": 1.85
  },

  "riskReward": {
    "stop": 111920,
    "target": 115600,
    "rr": 3.08
  },

  "checks": {
    "openLegLimit": true,
    "restingOrderLimit": true,
    "feeLimit": true,
    "teamLock": true,
    "liquidity": true,
    "drawdown": true
  },

  "reason": "The setup is approved but reduced because macro conditions create a crypto headwind."
}
```

---

# 32. KLUCZOWA ZMIANA — AGENTY NIE POWINNY ZWRACAĆ `vote`

Obecne:

```json
{
  "vote": "buy"
}
```

jest zbyt prymitywne.

Nowe:

```json
{
  "recommendation": {
    "direction": "buy",
    "strength": 82,
    "confidence": 0.84
  }
}
```

Dzięki temu możemy odróżnić:

```text
BUY 82 / confidence 0.84
```

od:

```text
BUY 52 / confidence 0.91
```

---

# 33. WSPÓLNY FORMAT AGENTA

Każdy agent powinien zwracać:

```json
{
  "agent": "vesper",

  "runId": "uuid",

  "timestamp": 1757760000000,

  "marketStateHash": "sha256...",

  "recommendation": {},

  "evidence": [],

  "invalidation": {},

  "confidence": 0.84,

  "knowledgeUsed": [],

  "historicalContext": {},

  "uncertainty": [],

  "reasoningSummary": "short explanation"
}
```

---

# 34. NIE PRZECHOWUJ „CHAIN OF THOUGHT”

Nie potrzebujemy zapisywać wewnętrznego toku rozumowania modelu.

Przechowujemy:

```text
evidence
decision
confidence
invalidation
knowledge used
result
```

To wystarczy do audytu.

---

# 35. PAMIĘĆ AGENTÓW

Każdy agent ma trzy warstwy pamięci.

## A. Episodic Memory

Pamięć pojedynczych decyzji.

```json
{
  "agent": "vesper",
  "symbol": "BTC",
  "side": "buy",
  "setup": "momentum_continuation",

  "features": {
    "rsi": 64.2,
    "rvol": 1.38,
    "vsSma": 1.8
  },

  "score": 82,

  "entry": 112850,

  "resultR": 2.1,

  "pnlPct": 2.4,

  "durationMin": 143
}
```

---

# 36. B. Statistical Memory

Nie pytamy LLM:

> „Czy Vesper jest dobry?”

Liczymy.

```text
BTC momentum continuation
n = 84

win rate = 58.3%
avg R = +0.47
median R = +0.31
profit factor = 1.62
max losing streak = 5
```

---

# 37. C. Semantic Memory

Tutaj mogą znajdować się obserwacje:

```text
"Momentum setups with RVOL > 1.5 perform better
during risk-on regimes."
```

Ale każda taka obserwacja musi mieć:

```text
source
sample size
confidence
createdAt
lastValidatedAt
```

Przykład:

```json
{
  "statement": "BTC breakouts with RVOL > 1.5 perform better in risk-on regimes.",
  "sampleSize": 137,
  "confidence": 0.81,
  "source": "empirical",
  "lastValidatedAt": 1757760000000
}
```

---

# 38. PAMIĘĆ NIE MOŻE ZMIENIAĆ HISTORII

Nigdy:

```text
Agent:
"zapamiętam, że BTC jest bullish."
```

Tylko:

```text
Data
→ observation
→ trade
→ result
→ statistics
→ validated knowledge
```

---

# 39. DECISION ENGINE

To jest serce V2.

Nie LLM.

Kod.

---

# 40. KROK 1 — AGENT SCORING

Przykładowo:

```text
Vesper:
BUY 82

Ash:
BUY 35

Kai:
READY 91

Damian:
Crypto -61

Historical Edge:
+12
```

---

# 41. KROK 2 — NORMALIZACJA

Każdy sygnał:

```text
-100 → +100
```

np.:

```text
Vesper +82
Ash    +35
Kai    +91
Damian -61
```

---

# 42. KROK 3 — WAGI

Początkowo:

```text
Vesper       25%
Ash          15%
Kai          30%
Damian       15%
Historical   15%
```

Ale **wagi nie powinny być wieczne**.

Po zebraniu odpowiedniej próbki możemy przejść do dynamicznych wag.

---

# 43. KROK 4 — QUALITY ADJUSTMENT

Każdy agent dostaje:

```text
historicalMultiplier
```

np.:

```text
Vesper = 1.10
Ash    = 0.92
Kai    = 1.17
Damian = 1.00
```

Ale:

**minimum 0.5, maksimum 1.25.**

Nie pozwalamy, żeby system po 5 transakcjach uznał agenta za geniusza.

---

# 44. KROK 5 — FINAL SCORE

Przykład:

```text
Vesper:
82 × .25 × 1.10 = 22.55

Ash:
35 × .15 × .92 = 4.83

Kai:
91 × .30 × 1.17 = 31.95

Damian:
-61 × .15 = -9.15

Historical:
+12 × .15 = 1.80
```

Razem:

```text
51.98
```

---

# 45. ALE NIE WOLNO ROBIĆ SAMEJ ŚREDNIEJ

Potrzebujemy HARD GATES.

## Entry Gate

```text
Vesper/Ash directional score >= 60

AND

Kai status != blocked

AND

Kai direction == proposed direction

AND

RR >= 1.5

AND

portfolio risk OK
```

Dopiero wtedy:

```text
FINAL SCORE
```

---

# 46. PROGI

```text
FINAL SCORE < 45
→ REJECT

45–59
→ WAIT

60–74
→ SMALL

75–84
→ NORMAL

85+
→ HIGH QUALITY
```

Ale:

**HIGH QUALITY ≠ duża pozycja.**

Iris nadal może ją zmniejszyć.

---

# 47. DISAGREEMENT ENGINE

To jest obowiązkowe.

Przykład:

```text
Vesper  BUY 89
Ash     SELL 82
Kai     BUY 91
Damian  bearish
```

System oblicza:

```text
directionConflict = HIGH
```

i:

```text
decision = WAIT
```

albo:

```text
size *= 0.5
```

zależnie od zasad.

---

# 48. KONFLIKT NIE POWINIEN BYĆ BŁĘDEM

Powinien być osobnym sygnałem:

```json
{
  "agreement": {
    "direction": "buy",
    "level": "low",
    "score": 0.54
  }
}
```

Dashboard:

```text
⚠ HIGH DISAGREEMENT
```

---

# 49. DWIE FAZY DECYZJI

## Faza A — Independent Research

Równolegle:

```text
Vesper ─┐
Ash ────┤
Kai ────┤
Damian ─┘
```

Każdy nie widzi innych.

## Faza B — Risk Decision

```text
Agent outputs
     ↓
Decision Engine
     ↓
Iris
```

To pozwala zachować niezależność.

Równoległe uruchamianie niezależnych agentów jest również naturalnym wzorcem orkiestracji, szczególnie gdy ich zadania nie zależą od siebie. citeturn0search8

---

# 50. CZY IRIS MA BYĆ LLM?

Tak, ale:

```text
CODE = hard risk rules
LLM = interpretation
```

Przykład:

Kod mówi:

```text
openLegs = 2
MAX_OPEN_LEGS = 2
```

Wynik:

```text
REJECT
```

Iris nie może powiedzieć:

> „Ale ten setup jest wyjątkowo dobry.”

---

# 51. WALIDATOR

Każdy output przechodzi:

```text
LLM
 ↓
JSON Schema
 ↓
Semantic Validator
 ↓
Business Rules
 ↓
Decision Engine
```

Przykład:

```text
AI:
qty = 999999999

JSON valid

↓
Risk validator

REJECT
```

Sama poprawność JSON nie gwarantuje poprawności referencji ani parametrów, więc wartości trzeba dodatkowo sprawdzać względem rzeczywistego stanu systemu. citeturn0search0

---

# 52. WALIDACJA AGENTA

Vesper:

```text
symbol exists?
price exists?
timeframe valid?
score 0–100?
```

Kai:

```text
limit exists?
limit near market?
RR valid?
FVG exists?
```

Damian:

```text
macro data timestamp valid?
news timestamp valid?
sector IDs valid?
```

Iris:

```text
size <= max?
cash sufficient?
legs <= max?
fees <= max?
teamLock?
```

---

# 53. TOOL PERMISSIONS

Vesper:

```text
READ:
market
technical
history

WRITE:
agent_memory
```

Ash:

```text
READ:
market
technical
history

WRITE:
agent_memory
```

Kai:

```text
READ:
market
technical
setups
history

WRITE:
agent_memory
```

Damian:

```text
READ:
macro
news
market

WRITE:
agent_memory
```

Iris:

```text
READ:
all validated agent outputs
portfolio
risk

WRITE:
risk decision
```

**Żaden agent nie powinien mieć dostępu do wszystkich narzędzi.** Ograniczenie narzędzi do niezbędnego minimum jest jednym z kluczowych wzorców bezpiecznej architektury agentowej. citeturn0search3turn0search4

---

# 54. ORCHESTRATOR

Nowy:

```text
src/lib/agents/orchestrator.ts
```

Pseudo-kod:

```ts
const [vesper, ash, kai, damian] = await Promise.all([
  runVesper(context),
  runAsh(context),
  runKai(context),
  runDamian(context),
]);

const decision = decisionEngine({
  vesper,
  ash,
  kai,
  damian,
  portfolio,
});

const iris = await runIris(decision);

return validateAndFinalize({
  decision,
  iris,
});
```

---

# 55. WAŻNA UWAGA O KAIU

Kai jest problematyczny, jeśli uruchomimy go całkowicie niezależnie od Vespera/Asha.

Dlatego dałbym mu dwa tryby:

```text
KAI SCAN
```

samodzielnie szuka setupów.

oraz:

```text
KAI VALIDATE
```

sprawdza konkretne kierunki.

Czyli:

```text
Kai Scan:
BTC → BUY setup 91
ETH → SELL setup 74
```

a potem:

```text
Vesper:
BTC BUY

Ash:
BTC HOLD

→ Kai Validate BTC BUY
```

---

# 56. DAMIAN TEŻ POWINIEN DZIAŁAĆ PRZED SCOUTAMI

W idealnej architekturze:

```text
                MARKET
                   │
            ┌──────▼──────┐
            │   DAMIAN    │
            └──────┬──────┘
                   │
          macro context snapshot
                   │
          ┌────────┼────────┐
          ▼        ▼        ▼
       VESPER     ASH       KAI
```

ALE:

Vesper/Ash dostają Damian context dopiero jako **macro filter**, a nie jako jego opinię.

Jeszcze lepiej:

```text
Raw market
→ Vesper/Ash/Kai independent
+
Damian independent
→ Decision Engine
```

To maksymalizuje niezależność.

---

# 57. NIE POKAZUJ AGENTOM „LAST COUNCIL”

Obecny system przekazuje poprzednią sesję.

W V2 powinno być:

```text
Agent private memory
```

zamiast:

```text
lastCouncil
```

W przeciwnym razie agent zaczyna kotwiczyć się na wcześniejszym werdykcie.

---

# 58. MEMORY RETRIEVAL

Agent nie dostaje 10 000 poprzednich transakcji.

Dostaje np.:

```text
Top 5 similar historical setups
+
current performance
+
relevant learned rules
```

Przykład:

```text
BTC
momentum
RVOL 1.4
risk-on
15m breakout
```

→ pobierz podobne historyczne przypadki.

---

# 59. AGENT EXPERIENCE

Każdy agent:

```json
{
  "agent": "vesper",

  "experience": {
    "totalCalls": 412,
    "closedTrades": 287,

    "winRate": 0.57,
    "expectancyR": 0.41,
    "profitFactor": 1.48,

    "bySymbol": {},
    "bySetup": {},
    "byRegime": {},

    "maxDrawdownR": -7.2
  }
}
```

---

# 60. SCORECARD — ZMIANA WZGLĘDEM OBECNEJ WERSJI

Nie:

```text
win rate = najważniejsze
```

Tylko:

```text
Expectancy        30%
Profit Factor     20%
Average R         20%
Drawdown           10%
Win Rate           10%
Sample Size        10%
```

Minimum:

```text
30 closed trades
```

zanim performance zacznie mocno wpływać na wagę agenta.

---

# 61. UCZENIE

Po każdej zamkniętej transakcji:

```text
TRADE CLOSED
     ↓
FEATURE EXTRACTION
     ↓
AGENT ATTRIBUTION
     ↓
PERFORMANCE UPDATE
     ↓
MEMORY UPDATE
```

Przykład:

```text
BTC LONG
Vesper BUY
Ash HOLD
Kai READY
Damian bearish
```

Po wyniku:

```text
+2.4R
```

system zapisuje:

```text
Vesper:
correct directional call

Kai:
correct entry

Damian:
macro headwind but trade worked

Ash:
no call
```

---

# 62. NIE DAWAĆ CREDIT WSZYSTKIM

To bardzo ważne.

Jeżeli Vesper powiedział:

```text
BUY BTC
```

a Kai:

```text
WAIT
```

i użytkownik sam kupił BTC:

```text
→ Kai nie dostaje win/loss.
```

Jeżeli transakcja powstała dzięki:

```text
Vesper + Kai
```

obaj mogą dostać attribution.

---

# 63. FINAL ORDER OBJECT

Nowy standard:

```json
{
  "decisionId": "uuid",

  "symbol": "BTC",
  "side": "buy",

  "decision": "approve",

  "finalScore": 76,

  "agreement": {
    "level": "medium",
    "score": 0.74
  },

  "contributors": {
    "vesper": 82,
    "ash": 35,
    "kai": 91,
    "damian": -61
  },

  "entry": {
    "type": "limit",
    "price": 112850
  },

  "risk": {
    "sizePct": 2.1,
    "stop": 111920,
    "target": 115600,
    "rr": 3.08
  },

  "status": "approved"
}
```

---

# 64. EXECUTION

Execution Engine otrzymuje wyłącznie:

```json
{
  "decision": "approve",
  "symbol": "BTC",
  "side": "buy",
  "qty": 0.018,
  "limitPx": 112850
}
```

Nie dostaje:

```text
thesis
prompt
agent memory
LLM output
```

Execution ma być głupi.

To zaleta.

---

# 65. FALLBACK

Jeżeli Grok/API nie działa:

```text
Vesper LLM
   ↓
fallback Vesper mathematical model

Ash LLM
   ↓
fallback Ash mathematical model

Kai LLM
   ↓
fallback Kai deterministic setup engine

Damian LLM
   ↓
fallback macro scoring

Iris LLM
   ↓
deterministic risk engine
```

System nadal działa.

---

# 66. TRYB „AI OFF”

W dashboardzie:

```text
AI COUNCIL
● ONLINE
```

lub:

```text
AI COUNCIL
● DEGRADED

Vesper: LOCAL
Ash: LOCAL
Kai: LOCAL
Damian: LOCAL
Iris: RULE ENGINE
```

To jest bardzo ważne dla przejrzystości.

---

# 67. AUDIT LOG

Każda decyzja powinna mieć:

```text
decisionId
timestamp
marketSnapshotHash

vesperOutputHash
ashOutputHash
kaiOutputHash
damianOutputHash

decisionEngineVersion
promptVersion
knowledgeVersion

irisOutput
finalOrder
executionResult
```

Dzięki temu możesz po miesiącu odpowiedzieć:

> „Dlaczego Ziggy kupił BTC 13 września o 14:37?”

i odtworzyć cały proces.

---

# 68. VERSIONING

Każdy agent:

```text
vesper:
promptVersion = 2.1
knowledgeVersion = 1.4
strategyVersion = 3
```

Jeżeli poprawisz prompt:

```text
Vesper 2.1 → 2.2
```

statystyki później możesz porównać:

```text
V2.1 expectancy = +0.24R
V2.2 expectancy = +0.47R
```

---

# 69. EVALUATION

Przed użyciem live:

```text
1000+
historical decision cases
```

Każdy agent oceniany osobno.

Vesper:

```text
direction accuracy
expectancy
false breakout rate
```

Ash:

```text
reversion expectancy
continuation trap rate
```

Kai:

```text
entry efficiency
MAE
MFE
R:R realization
```

Damian:

```text
regime classification accuracy
```

Iris:

```text
drawdown reduction
risk-adjusted return
```

---

# 70. NAJWAŻNIEJSZY TEST

Nie pytamy:

> „Czy AI mówi sensownie?”

Pytamy:

> „Czy decyzje agenta poprawiają wynik systemu względem baseline?”

Baseline:

```text
BUY when Vesper > 62
```

vs.

```text
Vesper + Ash + Kai + Damian + Iris
```

Jeżeli multi-agent nie przebija prostego baseline:

**nie ma sensu utrzymywać multi-agentowego systemu.**

---

# 71. OSTATECZNY MÓZG

Finalnie Ziggy powinien działać tak:

```text
                       MARKET
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       VESPER            ASH              KAI
       Momentum       Reversion          Setup
          │               │                │
          └───────────────┼────────────────┘
                          │
                       DAMIAN
                         Macro
                          │
                          ▼
                ┌───────────────────┐
                │ DECISION ENGINE   │
                │                   │
                │ scores            │
                │ agreement         │
                │ historical edge   │
                │ regime            │
                │ hard gates        │
                └─────────┬─────────┘
                          │
                          ▼
                        IRIS
                          │
                    Risk approval
                          │
                 ┌────────┴────────┐
                 │                 │
              APPROVE            REJECT
                 │
                 ▼
             EXECUTION
                 │
                 ▼
                FILL
                 │
                 ▼
              OUTCOME
                 │
                 ▼
          AGENT SCORECARD
                 │
                 ▼
           AGENT MEMORY
                 │
                 └──────────→ NEXT DECISION
```

---

# 72. NAJWAŻNIEJSZA ZASADA CAŁEGO SYSTEMU

Podziel odpowiedzialność:

```text
LLM:
INTERPRET

CODE:
CALCULATE

DECISION ENGINE:
AGGREGATE

IRIS:
CONTROL RISK

EXECUTION:
EXECUTE

MEMORY:
MEASURE
```

Nie:

```text
LLM:
calculate + decide + size + execute
```

---

# 73. PRIORYTET IMPLEMENTACJI

## V2.0

Najpierw:

```text
1. Agent interface
2. Separate LLM calls
3. Zod schemas
4. Validators
5. Parallel orchestration
```

## V2.1

```text
6. Independent knowledge bases
7. Private agent context
8. Remove lastCouncil anchoring
```

## V2.2

```text
9. Decision Engine
10. Disagreement Engine
11. Hard gates
```

## V2.3

```text
12. Agent memory
13. Statistical performance
14. Attribution
```

## V2.4

```text
15. Historical replay
16. Backtesting
17. Evals
```

## V2.5

```text
18. Adaptive weights
19. Regime-specific performance
20. Agent skill profiles
```

---

# 74. KOŃCOWY MODEL

Wtedy Vesper nie będzie:

> „AI, które udaje tradera momentum.”

Będzie:

> **wyspecjalizowanym modelem momentum, którego decyzje można mierzyć, porównywać i rozwijać.**

Ash będzie miał własną przewagę.

Kai własną.

Damian własną.

Iris nie będzie kolejnym „głosem w radzie”, tylko **warstwą kontroli ryzyka**.

A najważniejsze:

```text
Agent mówi:
"uważam X"

System odpowiada:
"OK. Pokaż dane."

Dane mówią:
"X."

Decision Engine mówi:
"Zgodne z regułami."

Iris mówi:
"Możemy podjąć 2.1% ryzyka."

Execution mówi:
"Zlecenie wykonane."

Outcome mówi:
"Agent miał rację / nie miał racji."

Memory mówi:
"Co z tego wynika dla następnego przypadku?"
```

To jest architektura, w której **AI faktycznie staje się zespołem specjalistów**, zamiast pięcioma nazwami w jednym promptcie.
:::

### Jedna rzecz, którą zrobiłbym inaczej niż w obecnym repo

**Nie przepisywałbym od razu całego `council.ts`.** Najpierw stworzyłbym nowy kontrakt:

```text
src/lib/agents/core/
```

i dopiero potem przepinał obecne Vesper/Ash/Kai/Damian/Iris na nowy orchestrator.

Obecny system już ma sporą część deterministycznego fundamentu — scoring Vespera/Asha, Kai setup logic, sektorowy filtr Damiana, sizing Iris i quorum. Problemem jest głównie to, że te elementy są obecnie **opakowane w jeden LLM council**, zamiast funkcjonować jako pięć odseparowanych specjalizacji.

I jeszcze jedna ważna rzecz: **nie robiłbym od razu pięciu różnych modeli AI**. Jeden mocny model wywołany pięć razy z całkowicie oddzielnym kontekstem jest na początek wystarczający. Dopiero benchmark pokaże, czy np. Damianowi warto dać inny model niż Vesperowi. Rozdzielenie agentów ma wynikać z odpowiedzialności, narzędzi i kontekstu, nie z samej liczby modeli. citeturn0search2turn0search10

**Następny krok, który ma największy sens:** mogę teraz przełożyć tę specyfikację **bezpośrednio na strukturę Twojego repo** i przygotować konkretny plan migracji `council.ts → orchestrator.ts → 5 agentów`, z nazwami plików, interfejsami TypeScript/Zod i kolejnością zmian, tak żeby Grok mógł to wdrażać etapami bez rozwalenia obecnej aplikacji.",{"_1376":1377},"real_author","tool:web",{"_249":828,"_256":1381,"_54":1382,"_260":1383,"_262":263,"_264":14,"_265":266,"_267":1384,"_269":270},"1422d0be-8feb-4a41-ab8c-34496bc202ce",[814],{"_582":583,"_267":1389},1789302710.813341,{"_577":603,"_260":1388},{"_592":593,"_594":1385,"_596":1386,"_598":1387,"_600":601,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1379,"_300":844,"_602":34,"_302":10},13,1789302697.101978,1789302710.7913005,"Przetwarzano przez 13s",{},{"_249":1379,"_256":1393,"_54":1394,"_260":1395,"_262":263,"_264":14,"_265":266,"_267":1396,"_269":270},"766decd7-64c1-4f1e-95e5-9e474cdf2ba7",[828],{"_582":583,"_267":1408},1789302710.808246,{"_577":625,"_625":1403,"_627":1404},{"_613":1397,"_592":615,"_616":617,"_618":1398,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1399,"_300":844,"_602":34,"_302":10},{"_621":1400},[620],"01962817-fac2-405c-8e2a-67041459c17e",[1401,1402],"bf39adbb-277d-408c-9194-254ec83cdbc0","f93faa4a-5775-4f3f-8e98-ccddb6502ebd",[1405],"21378114-2726-4bf9-90d7-919a68eec3f6",{"_630":1406,"_260":632,"_633":1407,"_635":34},"Przeanalizowano archiwum ZIP, pliki agentów AI i prompt rest council",[],{},{"_249":1391,"_256":1412,"_54":1413,"_260":1414,"_262":263,"_265":266,"_267":1415,"_269":270},"5bc938aa-1d2f-4b3e-99cd-b00a1511ea7c",[1379],{"_582":648,"_649":650,"_267":1418},1789302709.2026067,{"_577":578,"_579":1417},{"_287":288,"_294":843,"_296":843,"_299":1416,"_592":615,"_596":1386,"_302":10,"_645":34},"7179023b-d43b-433e-9f5d-c6c322117b1a",[647],{},{"_249":1410,"_256":1422,"_54":1423,"_260":1424,"_262":263,"_264":14,"_265":266,"_267":1425,"_269":650},"69a2814f-22c3-4c89-92b7-dff66b230b3a",[1391],{"_582":583,"_267":1433},1789302707.235334,{"_577":620,"_667":668,"_578":1432},{"_273":1426,"_275":34,"_276":1427,"_278":1428,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1429,"_300":844,"_592":615,"_618":1430,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":1431},[],[],"73f6b576-175a-4139-82cd-af8ed759463c",[620],[666],"bash -lc cd /tmp/ziggy/ziggywizzair-main && sed -n '260,620p' src/lib/ai/council.ts && printf '\
--- personas ---\
' && cat src/lib/agents/personas.ts && printf '\
--- local council ---\
' && sed -n '1,340p' src/lib/agents/local-council.ts && printf '\
--- reflect ---\
' && cat src/lib/agents/reflect.ts && printf '\
--- scorecard ---\
' && sed -n '1,340p' src/lib/agents/scorecard.ts",{},{"_249":1420,"_256":1437,"_54":1438,"_260":1439,"_262":263,"_265":266,"_267":1440,"_269":270},"a7a7246c-c423-4065-830b-4a5e08197730",[1410],{"_582":648,"_649":650,"_267":1443},1789302707.2359385,{"_577":578,"_579":1442},{"_287":288,"_294":843,"_296":843,"_299":1441,"_592":615,"_596":1386,"_302":10,"_645":34},"aaa79dda-5756-4017-9d26-a69d88a40a5f",[647],{},{"_249":1435,"_256":1446,"_54":1447,"_260":1448,"_262":263,"_264":14,"_265":266,"_267":1449,"_269":650},[1420],{"_582":583,"_267":1457},1789302705.369762,{"_577":620,"_667":668,"_578":1456},{"_273":1450,"_275":34,"_276":1451,"_278":1452,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1453,"_300":844,"_592":615,"_618":1454,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":1455},[],[],"b8d123bf-9f60-4b33-9e0b-fec210c70ec0",[620],[666],"bash -lc cd /tmp/ziggy/ziggywizzair-main && find src -type f | grep -E 'agent|council|ai|market|position|order' | sort && printf '\
--- pipeline ---\
' && sed -n '1,260p' src/lib/agents/pipeline.ts && printf '\
--- council ---\
' && sed -n '1,280p' src/lib/ai/council.ts && printf '\
--- quorum ---\
' && sed -n '1,260p' src/lib/agents/quorum.ts",{},{"_249":1402,"_256":1460,"_54":1461,"_260":1462,"_262":263,"_265":266,"_267":1463,"_269":270},[1435],{"_582":648,"_649":650,"_267":1466},1789302705.3705134,{"_577":578,"_579":1465},{"_287":288,"_294":843,"_296":843,"_299":1464,"_702":-5,"_703":-5,"_592":615,"_596":1386,"_302":10,"_645":34},"e17a59de-f853-439e-bdd7-467748997fdb",[647],{},{"_249":1401,"_256":1470,"_54":1471,"_260":1472,"_262":263,"_264":14,"_265":266,"_267":1473,"_269":650},"35b61821-019e-429c-850e-dfd3f701b5a6",[1402],{"_582":583,"_267":1481},1789302702.410428,{"_577":620,"_667":668,"_578":1480},{"_273":1474,"_275":34,"_276":1475,"_278":1476,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1468,"_300":844,"_702":1477,"_703":717,"_592":615,"_618":1478,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":1479},[],[],[717],[620],[666],"bash -lc unzip -l /mnt/data/ziggywizzair-main.zip | head -40 && unzip -q /mnt/data/ziggywizzair-main.zip -d /tmp/ziggy && find /tmp/ziggy -maxdepth 3 -type f | head -80",{},{"_249":1468,"_256":1485,"_54":1486,"_260":1487,"_262":263,"_264":14,"_265":266,"_267":1488,"_269":270},"2be521c0-e1b0-453d-971e-8582ceae5acd",[1401],{"_582":583,"_267":1499},1789302703.250904,{"_577":625,"_625":1494,"_627":1495},{"_613":1489,"_592":615,"_616":730,"_618":1490,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1491,"_300":844,"_602":34,"_302":10},{"_621":1492},[733],"8dd0c89f-7e82-4860-a101-1249f4282523",[1493],"928b2f7c-bd22-46e6-a045-4e0789d11605",[1496],"59642089-a8d6-4552-a336-ec181dfb63bf",{"_630":1497,"_260":632,"_633":1498,"_635":34},"Przejrzano repozytorium pod kątem specyfikacji",[],{},{"_249":1483,"_256":1503,"_54":1504,"_56":1505,"_260":1506,"_262":263,"_265":266,"_267":1507,"_269":270,"_271":749},"8b2c6029-818b-4b6c-b9c3-363c943ec519",[1468],{"_582":648,"_649":752,"_267":1511},1789302702.4261944,1789302764.340545,{"_577":578,"_579":1510},{"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1509,"_302":10,"_645":34},"Przeglądanie repozytorium pod kątem specyfikacji","58e9e4f4-8b84-4088-8c29-9386fc2ad3d4",[647],{},{"_249":1501,"_256":1514,"_54":1515,"_56":1516,"_260":1517,"_262":263,"_265":266,"_267":1518,"_269":270,"_271":749},[1483],{"_582":648,"_649":752,"_267":1520},1789302702.411578,1789302764.339182,{"_577":578,"_579":1519},{"_771":34,"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1493,"_302":10,"_645":34},[647],{},{"_249":1493,"_256":1524,"_54":1525,"_260":1526,"_262":263,"_264":14,"_265":266,"_267":1527,"_269":752},"8cdfb186-f170-47da-9ce7-2ea9af2cb7c9",[1501],{"_582":583,"_267":1530},1789302700.049262,{"_577":578,"_579":1529},{"_702":1528,"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1522,"_302":10,"_645":34},[1508],[647],{},{"_249":1522,"_256":1534,"_54":1535,"_260":1536,"_262":263,"_264":14,"_265":266,"_267":1537,"_269":270},"1b49c41d-2be6-4cf2-b886-be00ea261030",[1493],{"_582":583,"_267":1558},1789302700.608883,{"_577":625,"_625":1553,"_627":1554},{"_613":1538,"_592":615,"_616":1539,"_618":1540,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1532,"_300":844,"_602":34,"_302":10},{"_621":1550},"web",[1541,1542,1543,1544,1545,1546,1547,1548,1549],"https://www.google.com/s2/favicons?domain=multiagentsystems.sites.markushanses.de&sz=128","https://www.google.com/s2/favicons?domain=cdn.openai.com&sz=128","https://www.google.com/s2/favicons?domain=openai.com&sz=128","https://www.google.com/s2/favicons?domain=www.solutelabs.com&sz=128","https://www.google.com/s2/favicons?domain=learn.microsoft.com&sz=128","https://www.google.com/s2/favicons?domain=openai.github.io&sz=128","https://www.google.com/s2/favicons?domain=docs.aws.amazon.com&sz=128","https://www.google.com/s2/favicons?domain=www.refontelearning.com&sz=128","https://www.google.com/s2/favicons?domain=www.ai.se&sz=128",[1551,1552],"c04eda68-808b-4c75-bffe-c25e72467fb6","43687a0b-a539-4e29-ba76-d3dd486ee2bf",[1555],"ea7447e9-99e3-46ac-8785-4d067f04dbea",{"_630":1556,"_260":632,"_633":1557,"_635":34},"Przeszukiwanie witryn: 9",[],{},{"_249":1532,"_256":1562,"_54":1563,"_260":1564,"_262":263,"_265":266,"_267":1565,"_269":270,"_271":749},"8f7fc98c-ac47-4325-bca9-e7c3b3f72432",[1522],{"_582":773,"_267":1567},1789302700.0686028,{"_577":578,"_579":1566},{"_282":109,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1560,"_300":844,"_302":10,"_771":34,"_298":14},[632],{},{"_249":1560,"_256":1571,"_54":1572,"_260":1573,"_262":263,"_265":266,"_267":1574,"_269":270,"_271":749},"e3310839-f0d3-4ac1-a5be-76007348161a",[1532],{"_582":648,"_649":733,"_267":1576},1789302700.0511522,{"_577":578,"_579":1575},{"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1569,"_302":10,"_645":34},[647],{},{"_249":1569,"_256":1580,"_54":1581,"_260":1582,"_262":263,"_264":14,"_265":266,"_267":1583,"_269":791,"_271":749},"a690d45f-53a0-4323-bdbe-170576793862",[1560],{"_582":583,"_267":1590},1789302699.045771,{"_577":620,"_667":800,"_578":1589},{"_273":1584,"_275":34,"_278":1585,"_280":1586,"_276":1587,"_282":109,"_795":796,"_797":796,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1578,"_300":844,"_302":10,"_298":14},{"_50":573,"_574":1588},[],[],[],[666],"{"paths":["files"],"query":"read"}",{},{"_249":1578,"_256":1594,"_54":1595,"_260":1596,"_262":263,"_265":266,"_267":1597,"_269":270},"b896291e-a6ae-4b50-9c75-5b24f99e9e99",[1569],{"_582":773,"_267":1602},1789302699.8546767,{"_577":578,"_579":1601},{"_771":34,"_1598":1599,"_282":109,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1600,"_300":844,"_302":10,"_298":14},"debug_sonic_thread_id","thread_6aa697aaa1d883248c86f4aecdb12999","fab89577-eb2b-4fe3-ac24-4f2029305599",[632],{},{"_249":1592,"_256":1605,"_54":1606,"_260":1607,"_262":263,"_265":266,"_267":1608,"_269":270},[1578],{"_582":648,"_649":1613,"_267":1614},1789302698.616446,{"_577":578,"_579":1612},{"_287":288,"_294":843,"_296":843,"_299":1609,"_1610":1611,"_592":615,"_596":1386,"_302":10,"_645":34},"9761849f-a0de-4d9b-9a79-31f92b0f410c","reasoning_title_content_transition","numeric",[647],"web.run",{"_1376":1615},"tool:web.run",{"_249":1552,"_256":1619,"_54":1620,"_260":1621,"_262":263,"_265":266,"_267":1622,"_269":270},"bd212507-797f-44ba-a7e2-55ea8fe389af",[1592],{"_582":648,"_649":1613,"_267":1626},1789302698.622695,{"_577":578,"_579":1625},{"_702":1623,"_703":1624,"_592":615,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1617,"_302":10,"_645":34},[1624],"Wyszukiwanie multi agent systems independent agents structured outputs tool calling best practices",[647],{"_1376":1615},{"_249":1617,"_256":1629,"_54":1630,"_260":1631,"_262":263,"_264":14,"_265":266,"_267":1632,"_269":1613},[1552],{"_582":583,"_267":1641},1789302697.143017,{"_577":578,"_579":1640},{"_273":1633,"_275":34,"_276":1634,"_278":1635,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1636,"_300":844,"_592":615,"_618":1637,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":1639},[],[],"48c2719d-cc30-4e83-8297-4b8771300fd0",[1638],"globe",[666],[632],{},{"_249":1551,"_256":1645,"_54":1646,"_260":1647,"_262":263,"_265":266,"_267":1648,"_269":1539},"7b774139-0b12-4609-868c-b9c919f55e93",[1617],{"_582":583,"_267":1656},1789302697.0832052,{"_577":578,"_579":1655},{"_276":1649,"_278":1650,"_282":109,"_702":1651,"_703":1652,"_592":615,"_618":1653,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1654,"_300":844,"_302":10,"_298":14},[],[],[1652],"Przeszukiwanie Internetu",[1638],"1c5647d3-b45d-4519-8e1c-7cdd6e1928dd",[632],{},{"_249":1643,"_256":1660,"_54":1661,"_260":1662,"_262":263,"_265":266,"_267":1663,"_269":583},"06d7665f-10bc-4dde-936b-96d1c93ee44c",[1551],{"_582":773,"_267":1668},1789302697.1054323,{"_577":578,"_579":1667},{"_771":34,"_276":1664,"_278":1665,"_280":1666,"_282":109,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1658,"_300":844,"_302":10,"_298":14},[],[],[],[632],{},{"_249":1658,"_256":1672,"_54":1673,"_260":1674,"_262":263,"_265":266,"_267":1675,"_269":270},"f0379331-a38f-47f6-8d63-2d326b22dc25",[1643],{"_582":583,"_267":1678},1789302697.0854073,{"_577":1676,"_1677":632},{"_287":288,"_294":843,"_296":843,"_299":1670,"_302":10,"_645":34},"model_editable_context","model_set_context",{},{"_249":1670,"_256":1682,"_54":1683,"_260":1684,"_262":263,"_265":266,"_267":1685,"_269":270},"408901fc-bf95-4791-ae16-2dc451013286",[1658],{"_582":773,"_267":1688},1789302696.7507582,{"_577":578,"_579":1687},{"_771":34,"_300":1686,"_282":109,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1680,"_302":10,"_298":14},"7b55a76e-e916-4323-ae90-86b1c3f5eb9c",[632],{},{"_249":1680,"_256":1692,"_54":1693,"_56":1694,"_260":1695,"_262":263,"_265":266,"_267":1696,"_269":270},"6f4fbc3c-cab1-414d-b78d-0d7f9a324dc7",[1670],{"_582":825,"_267":1699},1789302695.718,1789302765.191016,{"_577":578,"_579":1697},{"_821":34,"_290":842,"_822":-5,"_294":843,"_296":843,"_300":1686,"_302":10,"_298":14},[1698],"Rozpisz pełną specyfikację Vespera, Asha, Kaia, Damiana i Iris wraz z konkretnymi promptami systemowymi, strukturą JSON, narzędziami każdego agenta, zasadami pamięci oraz algorytmem końcowej decyzji",{},{"_249":1690,"_256":1703,"_54":1704,"_56":1705,"_260":1706,"_262":263,"_264":34,"_265":266,"_267":1707,"_269":270,"_271":272},"5fef699d-1e4e-4cc4-8462-b09c8836c669",[1680],{"_582":583,"_267":1878},1789302228.671678,1789302276.44153,{"_577":578,"_579":1876},{"_273":1708,"_275":34,"_276":1709,"_278":1710,"_280":1711,"_282":109,"_283":1712,"_285":1713,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_298":34,"_299":1701,"_300":1716,"_302":10},{"_50":573,"_574":1875},[],[1871],[],{"_303":1717,"_305":1718,"_307":1719,"_309":1720,"_311":1721,"_313":1722,"_315":1723,"_317":1724,"_319":1725,"_321":1726,"_323":1727,"_325":1728,"_327":1729,"_329":1730,"_331":1731,"_333":1732,"_335":1733,"_337":1734,"_339":1735,"_341":1736,"_343":1737,"_345":1738,"_347":1739,"_349":1740,"_351":1741,"_353":1742,"_355":1743,"_357":1744,"_359":1745,"_361":1746,"_363":1747,"_365":1748,"_367":1749,"_369":1750,"_371":1751,"_373":1752,"_375":1753,"_377":1754,"_379":1755,"_381":1756,"_383":1757,"_385":1758,"_387":1759,"_389":1760,"_391":1761,"_393":1762,"_395":1763,"_397":1764,"_399":1765,"_401":1766,"_403":1767,"_405":1768,"_407":1769,"_409":1770,"_411":1771,"_413":1772,"_415":1773,"_417":1774,"_419":1775,"_421":1776,"_423":1777,"_425":1778,"_427":1779,"_429":1780,"_431":1781,"_433":1782,"_435":1783,"_437":1784,"_439":1785,"_441":1786,"_443":1787,"_445":1788,"_447":1789,"_449":1790,"_451":1791,"_453":1792,"_455":1793},[],"7674a4fd-99cd-4a4a-a78c-26827afcda27","a678e626-463c-4607-9a08-b35cccaa53f2","8fbc8171-3ab2-46b7-9682-7abecdef8af3",{"_249":1870,"_482":14,"_483":14,"_484":-5},{"_249":1869,"_482":14,"_483":14,"_484":-5},{"_249":1868,"_482":14,"_483":14,"_484":-5},{"_249":1867,"_482":14,"_483":14,"_484":-5},{"_249":1866,"_482":14,"_483":14,"_484":-5},{"_249":1865,"_482":14,"_483":14,"_484":-5},{"_249":1864,"_482":14,"_483":14,"_484":-5},{"_249":1863,"_482":14,"_483":14,"_484":-5},{"_249":1862,"_482":14,"_483":14,"_484":-5},{"_249":1861,"_482":14,"_483":14,"_484":-5},{"_249":1860,"_482":14,"_483":14,"_484":-5},{"_249":1859,"_482":14,"_483":14,"_484":-5},{"_249":1858,"_482":14,"_483":14,"_484":-5},{"_249":1857,"_482":14,"_483":14,"_484":-5},{"_249":1856,"_482":14,"_483":14,"_484":-5},{"_249":1855,"_482":14,"_483":14,"_484":-5},{"_249":1854,"_482":14,"_483":14,"_484":-5},{"_249":1853,"_482":14,"_483":14,"_484":-5},{"_249":1852,"_482":14,"_483":14,"_484":-5},{"_249":1851,"_482":14,"_483":14,"_484":-5},{"_249":1850,"_482":14,"_483":14,"_484":-5},{"_249":1849,"_482":14,"_483":14,"_484":-5},{"_249":1848,"_482":14,"_483":14,"_484":-5},{"_249":1847,"_482":14,"_483":14,"_484":-5},{"_249":1846,"_482":14,"_483":14,"_484":-5},{"_249":1845,"_482":14,"_483":14,"_484":-5},{"_249":1844,"_482":14,"_483":14,"_484":-5},{"_249":1843,"_482":14,"_483":14,"_484":-5},{"_249":1842,"_482":14,"_483":14,"_484":-5},{"_249":1841,"_482":14,"_483":14,"_484":-5},{"_249":1840,"_482":14,"_483":14,"_484":-5},{"_249":1839,"_482":14,"_483":14,"_484":-5},{"_249":1838,"_482":14,"_483":14,"_484":-5},{"_249":1837,"_482":14,"_483":14,"_484":-5},{"_249":1836,"_482":14,"_483":14,"_484":-5},{"_249":1835,"_482":14,"_483":14,"_484":-5},{"_249":1834,"_482":14,"_483":14,"_484":-5},{"_249":1833,"_482":14,"_483":14,"_484":-5},{"_249":1832,"_482":14,"_483":14,"_484":-5},{"_249":1831,"_482":14,"_483":14,"_484":-5},{"_249":1830,"_482":14,"_483":14,"_484":-5},{"_249":1829,"_482":14,"_483":14,"_484":-5},{"_249":1828,"_482":14,"_483":14,"_484":-5},{"_249":1827,"_482":14,"_483":14,"_484":-5},{"_249":1826,"_482":14,"_483":14,"_484":-5},{"_249":1825,"_482":14,"_483":14,"_484":-5},{"_249":1824,"_482":14,"_483":14,"_484":-5},{"_249":1823,"_482":14,"_483":14,"_484":-5},{"_249":1822,"_482":14,"_483":14,"_484":-5},{"_249":1821,"_482":14,"_483":14,"_484":-5},{"_249":1820,"_482":14,"_483":14,"_484":-5},{"_249":1819,"_482":14,"_483":14,"_484":-5},{"_249":1818,"_482":14,"_483":14,"_484":-5},{"_249":1817,"_482":14,"_483":14,"_484":-5},{"_249":1816,"_482":14,"_483":14,"_484":-5},{"_249":1815,"_482":14,"_483":14,"_484":-5},{"_249":1814,"_482":14,"_483":14,"_484":-5},{"_249":1813,"_482":14,"_483":14,"_484":-5},{"_249":1812,"_482":14,"_483":14,"_484":-5},{"_249":1811,"_482":14,"_483":14,"_484":-5},{"_249":1810,"_482":14,"_483":14,"_484":-5},{"_249":1809,"_482":14,"_483":14,"_484":-5},{"_249":1808,"_482":14,"_483":14,"_484":-5},{"_249":1807,"_482":14,"_483":14,"_484":-5},{"_249":1806,"_482":14,"_483":14,"_484":-5},{"_249":1805,"_482":14,"_483":14,"_484":-5},{"_249":1804,"_482":14,"_483":14,"_484":-5},{"_249":1803,"_482":14,"_483":14,"_484":-5},{"_249":1802,"_482":14,"_483":14,"_484":-5},{"_249":1801,"_482":14,"_483":14,"_484":-5},{"_249":1800,"_482":14,"_483":14,"_484":-5},{"_249":1799,"_482":14,"_483":14,"_484":-5},{"_249":1798,"_482":14,"_483":14,"_484":-5},{"_249":1797,"_482":14,"_483":14,"_484":-5},{"_249":1796,"_482":14,"_483":14,"_484":-5},{"_249":1795,"_482":14,"_483":14,"_484":-5},{"_249":1794,"_482":14,"_483":14,"_484":-5},"w0fkik","4zr1sl","3xz88q","78zzwx","74t3qo","8saptr","rcgfuh","e5uqn7","0e239q","cbgjb5","7za35t","lyhf8t","9vukx5","1v1kwx","41nlur","od4g62","xgwkv9","irrt0a","12d2yo","ot29ia","163rir","wt23ay","3chrq2","dt8hd5","sq2dtp","efeufh","dbchir","aseb8z","mx04ez","j979pg","6irfps","6jdw8s","35xm5k","q0gl4f","pdjyx7","v75orl","t4n3zu","5r4vvf","oha6z5","k96jsi","juzmqz","3z54x4","mx0lz9","2qz620","49jfwh","1dv0ih","2hejmu","uo7rz8","7n99xa","yaisfr","mlzc9i","qcj8y3","3txj67","pjmy77","x1gf7z","7n85es","53g9rn","tt96kq","qxno5u","lsvpyv","ly7k45","2rcsu1","nnlvx0","nwg96d","7sion7","50dkfo","suv7f8","ft0o96","1gkooa","oqc9aa","u8dswi","zrxkd0","fcga6u","4ew222","jvwv11","4v24jl","z0pax5",{"_50":1247,"_1248":1872,"_1250":1873,"_1252":1874,"_47":1872,"_1254":1698},"rozpisać **pełną specyfikację Vespera, Asha, Kaia, Damiana i Iris — wraz z konkretnymi promptami systemowymi, strukturą JSON, narzędziami każdego agenta, zasadami pamięci oraz algorytmem końcowej decyzji**",15143,15348,[576],[1877],"Tak. I teraz, po obejrzeniu faktycznej implementacji, zrobiłbym to **trochę inaczej niż „odpalmy 5 razy Groka”**.

Chodzi o to, żeby Vesper, Ash, Kai, Damian i Iris byli **rzeczywiście różnymi specjalistami**, mieli własną wiedzę, własne narzędzia, własną pamięć wyników i przede wszystkim **nie mogli wzajemnie sugerować sobie odpowiedzi**.

## 1. Najważniejsza zmiana: pięć niezależnych agentów

Obecnie masz:

```text
              GROK
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
  Vesper       Ash        Kai
     │          │          │
     └──────────┼──────────┘
                ▼
             Damian
                ▼
              Iris
```

To jest de facto **jedno rozumowanie LLM z pięcioma personami**.

Chcemy:

```text
                     MARKET STATE
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       VESPER            ASH              KAI
       Agent A           Agent B          Agent C
       niezależny        niezależny       niezależny
          │               │                │
          │               │                │
          ▼               ▼                ▼
      MOMENTUM        REVERSION          SETUPS
          │               │                │
          └───────────────┼────────────────┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                 DAMIAN       META/IRIS
                 MACRO        RISK CHAIR
                    │           │
                    └─────┬─────┘
                          ▼
                    FINAL DECISION
```

Ale nawet to można zrobić lepiej.

---

# 2. Agent nie powinien być tylko promptem

To jest klucz.

**„Agent” powinien mieć 5 rzeczy:**

```text
1. Persona
2. Mandat
3. Wiedzę
4. Narzędzia
5. Pamięć
```

Czyli Vesper nie dostaje tylko:

> „Jesteś traderem momentum.”

Dostaje własny **playbook**.

---

# 3. VESPER — specjalista od momentum

Vesper powinien mieć wyłącznie jeden cel:

> **Znajdować aktywa, które zaczynają ekspansję ruchu.**

### Jego wiedza

```text
Trend following
Momentum
Relative strength
Breakout
Volume expansion
Market structure
Volatility expansion
Multi-timeframe confirmation
```

### Jego dane

```text
1m   → prawie ignoruje
5m
15m  → główny
1h   → potwierdzenie
4h   → kontekst
```

oraz:

```text
RSI
SMA20
EMA
ATR
RVOL
volume
high/low
range
market structure
```

### Jego zadanie

Nie:

> „Czy kupić BTC?”

tylko:

```text
Znajdź najlepsze 3 momentum setups.
```

I zwraca np.:

```json
{
  "agent": "vesper",
  "ideas": [
    {
      "symbol": "BTC",
      "side": "buy",
      "score": 81,
      "confidence": 0.83,
      "setup": "momentum_expansion",
      "invalidation": 112430
    }
  ]
}
```

---

# 4. ASH — specjalista od mean reversion

Ash **nie powinien nawet wiedzieć**, co Vesper uważa.

To bardzo ważne.

Dostaje dokładnie te same dane rynkowe, ale inną misję:

> „Znajdź sytuacje, w których rynek przesadził i prawdopodobnie wróci do wartości średniej.”

### Wiedza

```text
Mean reversion
RSI extremes
Bollinger Bands
VWAP
Distance from mean
ATR exhaustion
Liquidity sweeps
Overextension
Failed breakouts
```

I np.:

```json
{
  "agent": "ash",
  "ideas": [
    {
      "symbol": "ETH",
      "side": "sell",
      "score": 76,
      "confidence": 0.79,
      "setup": "overextension"
    }
  ]
}
```

---

# 5. KAI — i tutaj zrobiłbym największą zmianę

Obecny Kai jest dobrym pomysłem, ale zrobiłbym z niego **prawdziwego execution/setup specialist**.

Kai nie powinien odpowiadać:

> „BTC jest bullish.”

To nie jego robota.

Jego pytanie:

> **„Jeżeli chcemy wejść LONG BTC, gdzie, kiedy i pod jakimi warunkami?”**

Dostaje:

```text
15m
1h
4h
FVG
liquidity
swing highs/lows
pullbacks
ATR
volume
sessions
```

I produkuje:

```json
{
  "symbol": "BTC",
  "side": "buy",
  "setupQuality": 87,
  "entry": {
    "type": "limit",
    "price": 112850
  },
  "invalidation": 111920,
  "target": 115600,
  "rr": 3.0,
  "status": "READY"
}
```

Czyli Kai jest **handlarzem wejścia**, nie kierunku.

---

# 6. DAMIAN — zrobiłbym z niego prawdziwego macro agenta

Obecnie jest już blisko.

Ale dałbym mu własny zestaw narzędzi:

```text
VIX
DXY
US10Y
SPX
NDX
BTC
ETH
Gold
Oil
Crypto market cap
Fed
CPI
PPI
NFP
FOMC
```

oraz **news tool**.

Damian nie powinien dostać:

> „BTC BUY/SELL”.

Dostaje:

```text
Co dzieje się globalnie?
```

i produkuje:

```json
{
  "regime": "risk_off",
  "sectors": {
    "equities": -0.6,
    "crypto": -0.8,
    "metals": 0.4,
    "dollar": 0.7
  },
  "events": [
    {
      "event": "FOMC",
      "impact": "high",
      "direction": "bearish_equities"
    }
  ]
}
```

---

# 7. IRIS — tutaj absolutnie NIE dawałbym jej wolnej ręki

Iris powinna być **risk managerem, nie traderem**.

To bardzo ważna różnica.

Iris dostaje:

```text
Vesper output
Ash output
Kai output
Damian output
portfolio
equity
drawdown
open positions
daily loss
correlation
fees
```

i odpowiada:

```text
APPROVE
REDUCE
WAIT
REJECT
```

oraz:

```text
position size
```

### Ale:

**Iris nie może wymyślić sobie:**

> „Uważam, że BTC pójdzie w górę.”

Jeżeli chce kierunku, musi go dostać od innych agentów.

---

# 8. Najważniejsze: wspólna pamięć ≠ wspólna opinia

Każdy agent powinien mieć:

```text
agent_memory/
    vesper/
    ash/
    kai/
    damian/
    iris/
```

Ale pamięć powinna składać się z **wyników własnych decyzji**.

Przykład Vesper:

```text
BTC
setup = momentum breakout
entry = 104000
confidence = 0.82
result = +2.4R
```

Po 100 takich transakcjach Vesper może dowiedzieć się:

```text
BTC momentum:
win rate 57%
expectancy +0.42R

Gold momentum:
win rate 48%
expectancy +0.08R

NVDA momentum:
win rate 64%
expectancy +0.71R
```

To jest **prawdziwa wiedza zdobywana przez agenta**.

---

# 9. Ale NIE pozwalałbym LLM-owi samemu „uczyć się”

To bardzo ważne.

Nie robimy:

```text
Grok:
"Zapamiętaj, że breakouty BTC są dobre."
```

Bo po 200 decyzjach będziesz miał piękny chaos.

Robimy:

```text
TRADE
 ↓
OUTCOME
 ↓
FEATURES
 ↓
STATISTICS
 ↓
AGENT MEMORY
```

Czyli:

```text
setup_type
market_regime
symbol
timeframe
entry
exit
R
MFE
MAE
duration
volume
ATR
RSI
```

I z tego liczymy statystyki.

---

# 10. Wtedy powstaje naprawdę ciekawa rzecz

Vesper może odkryć:

```text
BREAKOUT + RVOL > 1.5
→ expectancy +0.72R
```

ale:

```text
BREAKOUT + RVOL < 0.8
→ expectancy -0.31R
```

Ash:

```text
RSI < 25 + price below VWAP
→ +0.41R
```

Kai:

```text
FVG + 1h trend alignment
→ +0.63R
```

Damian:

```text
risk-off + crypto
→ wszystkie long setups -18%
```

Iris:

```text
drawdown > 5%
→ redukuj wszystkie clipy o 35%
```

**To już jest system.**

---

# 11. A teraz najważniejszy element: META-DECISION

Nie pozwoliłbym Iris po prostu „przeczytać opinii agentów i zdecydować”.

Zbudowałbym **deterministyczny Decision Engine**.

Przykład:

### Vesper

```text
BTC LONG
score 82
confidence 0.84
```

### Ash

```text
BTC LONG
score 35
confidence 0.41
```

### Kai

```text
BTC LONG
setup 91
RR 3.1
READY
```

### Damian

```text
crypto
-0.3
```

### Iris

```text
risk capacity = 4.1%
```

---

# 12. Decision Engine

Liczymy:

```text
                 SCORE
Vesper           +82
Ash              +35
Kai              +91
Damian           -30
──────────────────────
Composite         63
```

Ale to nie musi być zwykła średnia.

Możemy zrobić:

```text
Momentum          30%
Reversion         15%
Setup             30%
Macro             15%
Historical edge   10%
```

czyli:

```text
82 × .30
35 × .15
91 × .30
70 × .15
Historical × .10
```

I dostajemy np.:

```text
FINAL SCORE = 75
```

---

# 13. I dopiero wtedy Iris

```text
FINAL SCORE
     ↓
Risk checks
     ↓
Position sizing
     ↓
ORDER
```

Iris może powiedzieć:

```text
APPROVE
2.8% equity
limit 112850
SL 111920
```

ale **nie może zmienić wyniku Vespera, Asha ani Kaia**.

---

# 14. Chciałbym też wprowadzić „disagreement”

To może być jedna z najlepszych funkcji aplikacji.

Jeżeli:

```text
VESPER       BUY 89
ASH          SELL 77
KAI          BUY 91
DAMIAN       BEARISH
```

system nie powinien udawać:

> „Consensus BUY.”

Powinien pokazać:

```text
⚠ HIGH DISAGREEMENT
```

I nawet:

```text
Vesper → trend continuation
Ash    → overextended
Kai    → good entry
Damian → macro headwind
```

To jest **znacznie bardziej wartościowe** niż pięć zielonych „BUY”.

---

# 15. Jeszcze lepsza rzecz — agent challenge

Po pierwszej rundzie można zrobić:

```text
ROUND 1

Vesper → BUY
Ash → SELL
Kai → BUY
Damian → bearish
```

Następnie **druga runda**:

```text
Vesper dostaje tylko:
"Jaki jest najmocniejszy argument przeciwko Twojemu BUY?"

Ash:
"Jaki jest najmocniejszy argument przeciwko Twojemu SELL?"

Kai:
"Co unieważnia setup?"
```

Ale nadal **nie pokazujesz im odpowiedzi pozostałych agentów**, jeżeli zależy nam na niezależności.

---

# 16. Dopiero potem można zrobić „Council”

I tu już możesz mieć:

```text
                 ┌─────────┐
                 │ VESPER  │
                 └────┬────┘
                      │
                 ┌────▼────┐
                 │   ASH   │
                 └────┬────┘
                      │
                 ┌────▼────┐
                 │   KAI   │
                 └────┬────┘
                      │
                 ┌────▼────┐
                 │ DAMIAN  │
                 └────┬────┘
                      │
              ┌───────▼────────┐
              │ DECISION ENGINE │
              └───────┬────────┘
                      │
                 ┌────▼────┐
                 │  IRIS   │
                 └────┬────┘
                      │
                      ▼
                    ORDER
```

---

# 17. Co ważne: nie musisz robić 5 różnych modeli

To jest częsty błąd.

Nie potrzebujesz:

```text
Vesper → Grok
Ash → Claude
Kai → GPT
Damian → Gemini
Iris → coś
```

Możesz mieć:

```text
        Grok API
           │
    ┌──────┼──────┐
    ▼      ▼      ▼
 Vesper   Ash    Kai
```

**Pięć agentów = pięć niezależnych kontekstów i procesów decyzyjnych**, niekoniecznie pięć różnych modeli.

Możesz nawet używać tego samego modelu.

---

# 18. Ale wywołania muszą być osobne

Obecnie:

```text
1 request
↓
5 agentów
```

Chcemy:

```text
request 1 → Vesper
request 2 → Ash
request 3 → Kai
request 4 → Damian
request 5 → Iris
```

A jeszcze lepiej:

```text
parallel:

Vesper ─┐
Ash ────┤
Kai ────┼→ Decision Engine → Iris
Damian ─┘
```

Czyli Vesper nie czeka na Asha.

---

# 19. I tutaj pojawia się koszt

Obecnie:

```text
1 × Grok
```

Docelowo:

```text
4 × Grok
+
1 × Iris
```

lub:

```text
4 równoległe
+
1 final
```

Koszt będzie większy.

Dlatego zrobiłbym **hybrydę**.

### Matematyka najpierw

```text
RSI
ATR
RVOL
FVG
SMA
structure
```

liczone lokalnie.

### LLM dopiero wtedy, kiedy trzeba

```text
"Zinterpretuj setup."
```

Wtedy nie płacisz modelowi za obliczenie:

> RSI = 53.7

bo JavaScript zrobi to lepiej, taniej i zawsze tak samo.

---

# 20. Właściwa architektura V2

Ja bym Ci stworzył następującą strukturę:

```text
src/lib/agents/

├── core/
│   ├── agent.ts
│   ├── context.ts
│   ├── memory.ts
│   ├── tools.ts
│   └── validator.ts
│
├── vesper/
│   ├── agent.ts
│   ├── knowledge.ts
│   ├── tools.ts
│   ├── scoring.ts
│   └── memory.ts
│
├── ash/
│   ├── agent.ts
│   ├── knowledge.ts
│   ├── tools.ts
│   ├── scoring.ts
│   └── memory.ts
│
├── kai/
│   ├── agent.ts
│   ├── knowledge.ts
│   ├── tools.ts
│   ├── setup.ts
│   └── memory.ts
│
├── damian/
│   ├── agent.ts
│   ├── knowledge.ts
│   ├── tools.ts
│   └── memory.ts
│
├── iris/
│   ├── agent.ts
│   ├── risk.ts
│   ├── sizing.ts
│   └── memory.ts
│
├── decision/
│   ├── engine.ts
│   ├── scoring.ts
│   ├── disagreement.ts
│   └── validator.ts
│
└── council/
    ├── orchestrator.ts
    └── types.ts
```

---

# 21. „Wiedza” agentów

Nie wrzucałbym całego internetu do prompta.

Każdy agent miałby **Knowledge Base**.

Na przykład:

```text
Vesper Knowledge Base

01_momentum.md
02_breakouts.md
03_volume.md
04_market_structure.md
05_failed_breakouts.md
06_risk.md
07_playbook.md
```

Ash:

```text
01_mean_reversion.md
02_extremes.md
03_vwap.md
04_exhaustion.md
05_liquidity_sweeps.md
```

Kai:

```text
01_fvg.md
02_pullbacks.md
03_market_structure.md
04_entries.md
05_liquidity.md
06_sessions.md
```

itd.

Agent dostaje z tego **tylko odpowiednie fragmenty**.

---

# 22. Jeszcze lepiej: „skill level”

Każdy agent może mieć:

```text
Knowledge
```

oraz:

```text
Experience
```

Czyli:

```text
Vesper

theoretical knowledge:
92/100

empirical experience:
68/100

BTC:
84/100

ETH:
71/100

Gold:
42/100
```

To zaczyna tworzyć coś naprawdę interesującego.

---

# 23. Agent może mieć własne „preferencje”

Np. Vesper:

```text
Prefer:
RVOL > 1.2
ATR expansion
trend alignment

Avoid:
low liquidity
range markets
late breakouts
```

Ash:

```text
Prefer:
extreme RSI
large deviation
failed breakout

Avoid:
strong trend
high momentum
news event
```

Kai:

```text
Prefer:
FVG
18–62% retracement
HTF alignment

Avoid:
chase
thin volume
bad R:R
```

To są **umiejętności**, a nie tylko osobowości.

---

# 24. I wtedy dashboard może być zajebisty

Zamiast obecnego:

```text
Vesper
BUY BTC
81

Ash
BUY BTC
72

Kai
BUY BTC
91
```

pokazujesz:

```text
┌─────────────────────────────────────┐
│ BTC / LONG                          │
│                                     │
│ VESPER        82  ████████░░  BUY   │
│ ASH           35  ███░░░░░░░  HOLD  │
│ KAI           91  █████████░  READY │
│ DAMIAN        -30 ███░░░░░░░  HEADWIND│
│                                     │
│ FINAL SCORE: 74                     │
│                                     │
│ IRIS: APPROVED                      │
│ SIZE: 2.8%                          │
│ ENTRY: 112,850                      │
│ R:R: 3.1                            │
└─────────────────────────────────────┘
```

I obok:

```text
WHY?

Vesper:
momentum expansion

Ash:
price not sufficiently oversold

Kai:
1h FVG + 31% retracement

Damian:
crypto macro headwind

Iris:
risk budget allows 2.8%
```

**To już wygląda jak prawdziwy trading desk.**

---

# 25. I najważniejsze — możemy to zrobić etapami

Nie przepisywałbym całego repo od zera.

### V2.1

Najpierw:

```text
1 Grok
↓
5 niezależnych API calls
```

Już wtedy rozwiązujemy największy problem.

### V2.2

Potem:

```text
Agent Knowledge Base
```

### V2.3

Potem:

```text
Agent Memory
```

### V2.4

Potem:

```text
Decision Engine
```

### V2.5

Potem:

```text
Backtesting
```

### V2.6

Na końcu:

```text
Experience / adaptive weighting
```

---

## I jest jedna rzecz, którą zrobiłbym **przed wszystkim**

**Nie zaczynałbym jeszcze od pisania kodu.**

Najpierw trzeba stworzyć **kontrakt każdego agenta**:

```text
Vesper
├── Cel
├── Wiedza
├── Dane wejściowe
├── Narzędzia
├── Co może zrobić
├── Czego nie może zrobić
├── Output schema
├── Metoda scoringu
├── Warunki veto
├── Pamięć
└── Metryki skuteczności
```

I analogicznie dla Asha, Kaia, Damiana i Iris.

Dopiero z tych pięciu kontraktów budujemy orchestrator.

**To jest moim zdaniem właściwy następny krok dla Twojego repo.** Mogę Ci w kolejnym kroku rozpisać **pełną specyfikację Vespera, Asha, Kaia, Damiana i Iris — wraz z konkretnymi promptami systemowymi, strukturą JSON, narzędziami każdego agenta, zasadami pamięci oraz algorytmem końcowej decyzji**, tak żeby można ją było praktycznie wkleić Grokowi i przebudować aplikację.",{},{"_249":1701,"_256":1882,"_54":1883,"_260":1884,"_262":263,"_264":14,"_265":266,"_267":1885,"_269":270},"7558c920-5826-4d89-829d-819241799035",[1690],{"_582":583,"_267":1890},1789302229.63606,{"_577":603,"_260":1889},{"_592":593,"_594":1886,"_596":1887,"_598":1888,"_600":601,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1880,"_300":1716,"_602":34,"_302":10},33,1789302196.3690248,1789302229.5345285,"Przetwarzano przez 33s",{},{"_249":1880,"_256":1894,"_54":1895,"_260":1896,"_262":263,"_264":14,"_265":266,"_267":1897,"_269":270},"bd3efb5a-a8e7-4c8c-881d-76448820c879",[1701],{"_582":583,"_267":1908},1789302229.605705,{"_577":625,"_625":1903,"_627":1904},{"_613":1898,"_592":615,"_616":617,"_618":1899,"_596":1887,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1892,"_300":1716,"_602":34,"_302":10},{"_621":1900},[620],[1901,1902],"024179c5-6bd1-423c-a9c7-87d238961134","0d005cbb-2769-46a4-a199-8f1861383660",[1905],"da0fdba5-d279-46b2-861d-5b2d5e89f936",{"_630":1906,"_260":632,"_633":1907,"_635":34},"Analizowanie person i lokalnej rady",[],{},{"_249":1892,"_256":1912,"_54":1913,"_260":1914,"_262":263,"_265":266,"_267":1915,"_269":270},"0cd796a1-d20d-4f0f-9036-2e67bb3a0e18",[1880],{"_582":648,"_649":650,"_267":1918},1789302228.6818852,{"_577":578,"_579":1917},{"_287":288,"_294":1715,"_296":1715,"_299":1916,"_592":615,"_596":1887,"_302":10,"_645":34},"fa86346e-1e28-4845-9439-de445955b964",[647],{},{"_249":1910,"_256":1922,"_54":1923,"_260":1924,"_262":263,"_264":14,"_265":266,"_267":1925,"_269":650},"2b689e84-0195-4ecf-8652-53a3ed30548b",[1892],{"_582":583,"_267":1933},1789302225.355898,{"_577":620,"_667":668,"_578":1932},{"_273":1926,"_275":34,"_276":1927,"_278":1928,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1929,"_300":1716,"_592":615,"_618":1930,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":1931},[],[],"43017db9-8e71-46a4-8240-6810af0d0b37",[620],[666],"bash -lc cat /tmp/zig/ziggywizzair-main/src/lib/agents/personas.ts; echo '---'; sed -n '1,320p' /tmp/zig/ziggywizzair-main/src/lib/agents/local-council.ts; echo '--- quorum'; sed -n '1,260p' /tmp/zig/ziggywizzair-main/src/lib/agents/quorum.ts",{},{"_249":1920,"_256":1937,"_54":1938,"_260":1939,"_262":263,"_265":266,"_267":1940,"_269":270},"93e7d79a-9d33-47ea-b5a4-0a8b32125c22",[1910],{"_582":648,"_649":650,"_267":1943},1789302225.3687928,{"_577":578,"_579":1942},{"_287":288,"_294":1715,"_296":1715,"_299":1941,"_592":615,"_596":1887,"_302":10,"_645":34},"fd742a20-c60a-434e-b905-1a890eff55d1",[647],{},{"_249":1935,"_256":1946,"_54":1947,"_260":1948,"_262":263,"_264":14,"_265":266,"_267":1949,"_269":650},[1920],{"_582":583,"_267":1957},1789302208.41377,{"_577":620,"_667":668,"_578":1956},{"_273":1950,"_275":34,"_276":1951,"_278":1952,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1953,"_300":1716,"_592":615,"_618":1954,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":1955},[],[],"f95b5eb4-6cc8-4681-8c32-f4a8ee685031",[620],[666],"bash -lc find /tmp/zig/ziggywizzair-main/src -type f | sort | grep -E '(agent|ai|lib)' | head -100 && echo '--- council ---' && sed -n '1,260p' /tmp/zig/ziggywizzair-main/src/lib/ai/council.ts && echo '--- pipeline ---' && sed -n '1,320p' /tmp/zig/ziggywizzair-main/src/lib/agents/pipeline.ts",{},{"_249":1902,"_256":1961,"_54":1962,"_260":1963,"_262":263,"_265":266,"_267":1964,"_269":270},"66205090-a484-43e3-aa5f-51f3fdc14a2f",[1935],{"_582":648,"_649":650,"_267":1967},1789302208.4205475,{"_577":578,"_579":1966},{"_287":288,"_294":1715,"_296":1715,"_299":1965,"_702":-5,"_703":-5,"_592":615,"_596":1887,"_302":10,"_645":34},"78fd7bce-0422-4966-9612-d9a686a7a969",[647],{},{"_249":1959,"_256":1970,"_54":1971,"_260":1972,"_262":1973,"_264":14,"_265":266,"_267":1974,"_269":270},[1902],{"_582":583,"_267":1979},1789302201.963438,{"_577":625,"_625":1975,"_627":1976},"in_progress",{"_592":615,"_596":1887,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_299":1901,"_300":1716,"_302":10,"_298":14},[1977],"91a4288d-29eb-4bfe-91f5-6073ac529b9b",{"_630":632,"_260":632,"_633":1978,"_635":34},[],{},{"_249":1901,"_256":1983,"_54":1984,"_260":1985,"_262":263,"_264":14,"_265":266,"_267":1986,"_269":650},"760f84ee-9732-485d-a17b-61b769b50d6c",[1959],{"_582":583,"_267":1996},1789302196.348137,{"_577":620,"_667":668,"_578":1995},{"_273":1987,"_275":34,"_276":1988,"_278":1989,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1990,"_300":1716,"_702":1991,"_703":1992,"_592":615,"_618":1993,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":1994},[],[],"23e2c3ac-8ebb-4160-b088-9479117d7ab5",[1992],"Inspekcja plików archiwum ZIP audytu",[620],[666],"bash -lc rm -rf /tmp/zig && mkdir /tmp/zig && unzip -q /mnt/data/ziggywizzair-main.zip -d /tmp/zig && find /tmp/zig -maxdepth 3 -type f | sed 's#/tmp/zig/##' | head -100",{},{"_249":1981,"_256":2000,"_54":2001,"_260":2002,"_262":263,"_265":266,"_267":2003,"_269":270},"9e5afc65-250d-4455-8699-f187d30c7bae",[1901],{"_582":583,"_267":2004},1789302196.357392,{"_577":1676,"_1677":632},{"_287":288,"_294":1715,"_296":1715,"_299":1998,"_302":10,"_645":34},{},{"_249":1998,"_256":2008,"_54":2009,"_260":2010,"_262":263,"_265":266,"_267":2011,"_269":270},"b3ac9d9c-1cc8-4d49-b34a-ee160621263e",[1981],{"_582":773,"_267":2014},1789302196.1101418,{"_577":578,"_579":2013},{"_771":34,"_300":2012,"_282":109,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":2006,"_302":10,"_298":14},"7189cd6f-d13f-49bd-8d68-c83ca6f843cf",[632],{},{"_249":2006,"_256":2018,"_54":2019,"_260":2020,"_262":263,"_265":266,"_267":2021,"_269":270},"849cd04f-6e88-4869-9ded-f9936947d51f",[1998],{"_582":773,"_267":2023},1789302196.109265,{"_577":578,"_579":2022},{"_771":34,"_300":2012,"_282":109,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":2016,"_302":10,"_298":14},[632],{},{"_249":2016,"_256":2027,"_54":2028,"_56":2029,"_260":2030,"_262":263,"_265":266,"_267":2031,"_269":270},"94e4aae3-e30c-48bc-b748-763d9bcc326d",[2006],{"_582":825,"_267":2038},1789302195.391,1789302276.881762,{"_577":578,"_579":2036},{"_2032":2033,"_290":1714,"_822":-5,"_294":1715,"_296":1715,"_300":2012,"_302":10,"_298":14},"serialization_metadata",{"_2034":2035},"custom_symbol_offsets",[],[2037],"no właśnie, jak zrobić to aby to faktycznie było 5 agentów i to takich z wiedzą i umiejętnościami w tej aplikacji?",{},{"_249":2025,"_256":2042,"_54":2043,"_56":2044,"_260":2045,"_262":263,"_264":34,"_265":266,"_267":2046,"_269":270,"_271":272},"33831d35-b84f-4266-bd3c-60a74137532a",[2016],{"_582":583,"_267":2281},1789296980.306544,1789297038.185867,{"_577":578,"_579":2279},{"_273":2047,"_275":34,"_276":2048,"_278":2049,"_280":2050,"_282":109,"_283":2051,"_285":2052,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_298":34,"_299":2040,"_300":2055,"_2056":2057,"_302":10},{"_50":573,"_574":2278},[],[2273],[],{"_303":2065,"_305":2066,"_307":2067,"_309":2068,"_311":2069,"_313":2070,"_315":2071,"_317":2072,"_319":2073,"_321":2074,"_323":2075,"_325":2076,"_327":2077,"_329":2078,"_331":2079,"_333":2080,"_335":2081,"_337":2082,"_339":2083,"_341":2084,"_343":2085,"_345":2086,"_347":2087,"_349":2088,"_351":2089,"_353":2090,"_355":2091,"_357":2092,"_359":2093,"_361":2094,"_363":2095,"_365":2096,"_367":2097,"_369":2098,"_371":2099,"_373":2100,"_375":2101,"_377":2102,"_379":2103,"_381":2104,"_383":2105,"_385":2106,"_387":2107,"_389":2108,"_391":2109,"_393":2110,"_395":2111,"_397":2112,"_399":2113,"_401":2114,"_403":2115,"_405":2116,"_407":2117,"_409":2118,"_411":2119,"_413":2120,"_415":2121,"_417":2122,"_419":2123,"_421":2124,"_423":2125,"_425":2126,"_427":2127,"_429":2128,"_431":2129,"_433":2130,"_435":2131,"_437":2132,"_439":2133,"_441":2134,"_443":2135,"_445":2136,"_447":2137,"_449":2138,"_451":2139,"_453":2140,"_455":2141,"_457":2142,"_459":2143,"_461":2144,"_463":2145,"_465":2146,"_467":2147,"_469":2148,"_471":2149,"_473":2150,"_475":2151,"_477":2152,"_479":2153,"_934":2154,"_936":2155,"_938":2156,"_940":2157,"_942":2158,"_944":2159,"_946":2160,"_948":2161,"_950":2162,"_952":2163,"_954":2164,"_956":2165,"_958":2166,"_960":2167,"_962":2168},[],"5b16a7f6-aa6e-470e-97d4-df0d21f7edfb","20d03ce2-47fa-403b-b76f-5c080eb04856","8a033ec7-4d54-4861-85dc-bcec39486a6f","notification_trigger_checkpoint",{"_2058":2059,"_2060":2061,"_2062":-5,"_2063":2064},"notification_id","6aa6818bf9cc8191a9c8288e5253fcaf","source","responses","source_id","triggered_at","2026-09-13T10:57:17.299116+00:00",{"_249":2272,"_482":14,"_483":14,"_484":-5},{"_249":2271,"_482":14,"_483":14,"_484":-5},{"_249":2270,"_482":14,"_483":14,"_484":-5},{"_249":2269,"_482":14,"_483":14,"_484":-5},{"_249":2268,"_482":14,"_483":14,"_484":-5},{"_249":2267,"_482":14,"_483":14,"_484":-5},{"_249":2266,"_482":14,"_483":14,"_484":-5},{"_249":2265,"_482":14,"_483":14,"_484":-5},{"_249":2264,"_482":14,"_483":14,"_484":-5},{"_249":2263,"_482":14,"_483":14,"_484":-5},{"_249":2262,"_482":14,"_483":14,"_484":-5},{"_249":2261,"_482":14,"_483":14,"_484":-5},{"_249":2260,"_482":14,"_483":14,"_484":-5},{"_249":2259,"_482":14,"_483":14,"_484":-5},{"_249":2258,"_482":14,"_483":14,"_484":-5},{"_249":2257,"_482":14,"_483":14,"_484":-5},{"_249":2256,"_482":14,"_483":14,"_484":-5},{"_249":2255,"_482":14,"_483":14,"_484":-5},{"_249":2254,"_482":14,"_483":14,"_484":-5},{"_249":2253,"_482":14,"_483":14,"_484":-5},{"_249":2252,"_482":14,"_483":14,"_484":-5},{"_249":2251,"_482":14,"_483":14,"_484":-5},{"_249":2250,"_482":14,"_483":14,"_484":-5},{"_249":2249,"_482":14,"_483":14,"_484":-5},{"_249":2248,"_482":14,"_483":14,"_484":-5},{"_249":2247,"_482":14,"_483":14,"_484":-5},{"_249":2246,"_482":14,"_483":14,"_484":-5},{"_249":2245,"_482":14,"_483":14,"_484":-5},{"_249":2244,"_482":14,"_483":14,"_484":-5},{"_249":2243,"_482":14,"_483":14,"_484":-5},{"_249":2242,"_482":14,"_483":14,"_484":-5},{"_249":2241,"_482":14,"_483":14,"_484":-5},{"_249":2240,"_482":14,"_483":14,"_484":-5},{"_249":2239,"_482":14,"_483":14,"_484":-5},{"_249":2238,"_482":14,"_483":14,"_484":-5},{"_249":2237,"_482":14,"_483":14,"_484":-5},{"_249":2236,"_482":14,"_483":14,"_484":-5},{"_249":2235,"_482":14,"_483":14,"_484":-5},{"_249":2234,"_482":14,"_483":14,"_484":-5},{"_249":2233,"_482":14,"_483":14,"_484":-5},{"_249":2232,"_482":14,"_483":14,"_484":-5},{"_249":2231,"_482":14,"_483":14,"_484":-5},{"_249":2230,"_482":14,"_483":14,"_484":-5},{"_249":2229,"_482":14,"_483":14,"_484":-5},{"_249":2228,"_482":14,"_483":14,"_484":-5},{"_249":2227,"_482":14,"_483":14,"_484":-5},{"_249":2226,"_482":14,"_483":14,"_484":-5},{"_249":2225,"_482":14,"_483":14,"_484":-5},{"_249":2224,"_482":14,"_483":14,"_484":-5},{"_249":2223,"_482":14,"_483":14,"_484":-5},{"_249":2222,"_482":14,"_483":14,"_484":-5},{"_249":2221,"_482":14,"_483":14,"_484":-5},{"_249":2220,"_482":14,"_483":14,"_484":-5},{"_249":2219,"_482":14,"_483":14,"_484":-5},{"_249":2218,"_482":14,"_483":14,"_484":-5},{"_249":2217,"_482":14,"_483":14,"_484":-5},{"_249":2216,"_482":14,"_483":14,"_484":-5},{"_249":2215,"_482":14,"_483":14,"_484":-5},{"_249":2214,"_482":14,"_483":14,"_484":-5},{"_249":2213,"_482":14,"_483":14,"_484":-5},{"_249":2212,"_482":14,"_483":14,"_484":-5},{"_249":2211,"_482":14,"_483":14,"_484":-5},{"_249":2210,"_482":14,"_483":14,"_484":-5},{"_249":2209,"_482":14,"_483":14,"_484":-5},{"_249":2208,"_482":14,"_483":14,"_484":-5},{"_249":2207,"_482":14,"_483":14,"_484":-5},{"_249":2206,"_482":14,"_483":14,"_484":-5},{"_249":2205,"_482":14,"_483":14,"_484":-5},{"_249":2204,"_482":14,"_483":14,"_484":-5},{"_249":2203,"_482":14,"_483":14,"_484":-5},{"_249":2202,"_482":14,"_483":14,"_484":-5},{"_249":2201,"_482":14,"_483":14,"_484":-5},{"_249":2200,"_482":14,"_483":14,"_484":-5},{"_249":2199,"_482":14,"_483":14,"_484":-5},{"_249":2198,"_482":14,"_483":14,"_484":-5},{"_249":2197,"_482":14,"_483":14,"_484":-5},{"_249":2196,"_482":14,"_483":14,"_484":-5},{"_249":2195,"_482":14,"_483":14,"_484":-5},{"_249":2194,"_482":14,"_483":14,"_484":-5},{"_249":2193,"_482":14,"_483":14,"_484":-5},{"_249":2192,"_482":14,"_483":14,"_484":-5},{"_249":2191,"_482":14,"_483":14,"_484":-5},{"_249":2190,"_482":14,"_483":14,"_484":-5},{"_249":2189,"_482":14,"_483":14,"_484":-5},{"_249":2188,"_482":14,"_483":14,"_484":-5},{"_249":2187,"_482":14,"_483":14,"_484":-5},{"_249":2186,"_482":14,"_483":14,"_484":-5},{"_249":2185,"_482":14,"_483":14,"_484":-5},{"_249":2184,"_482":14,"_483":14,"_484":-5},{"_249":2183,"_482":14,"_483":14,"_484":-5},{"_249":2182,"_482":14,"_483":14,"_484":-5},{"_249":2181,"_482":14,"_483":14,"_484":-5},{"_249":2180,"_482":14,"_483":14,"_484":-5},{"_249":2179,"_482":14,"_483":14,"_484":-5},{"_249":2178,"_482":14,"_483":14,"_484":-5},{"_249":2177,"_482":14,"_483":14,"_484":-5},{"_249":2176,"_482":14,"_483":14,"_484":-5},{"_249":2175,"_482":14,"_483":14,"_484":-5},{"_249":2174,"_482":14,"_483":14,"_484":-5},{"_249":2173,"_482":14,"_483":14,"_484":-5},{"_249":2172,"_482":14,"_483":14,"_484":-5},{"_249":2171,"_482":14,"_483":14,"_484":-5},{"_249":2170,"_482":14,"_483":14,"_484":-5},{"_249":2169,"_482":14,"_483":14,"_484":-5},"ihmc9x","skybjy","okpp4i","zhj31o","4u93oo","k49uul","7auyxq","tg63ss","f5ojks","ql9adx","v3d0qm","5vhaqa","llmebu","frjtza","g40wok","af2oer","38fn6q","pkx4hh","452p8s","gh078q","p7txox","khqnco","3r7owp","m2didn","kfw2z2","j8jxjv","mch7k3","6udmrb","ic60s6","hwkftj","tonuvu","ypgwr0","2cshi0","s3so5s","3mctax","gl5vlo","lxncr7","1y0n8g","8l9lm0","hk7wl3","txwt25","lvnzwm","kytr5z","9y3xsz","7r9ppy","iupoxz","la877a","0t8n13","wwo7fv","z6fvqs","jxn6j0","2ddo8a","jy2x65","ft30qq","7be8zw","3g8hao","yj0tq7","l500g3","0abkaz","kulh1u","86gwmt","t01p30","brgamn","g1nzt7","2h9kqc","vc05bl","6gdicp","rhnsng","1cswc6","u4oh5d","c10d0a","tn0a5t","pbs63k","dd5c1f","apf25i","kv8y3s","0whjpj","vngrln","12njha","pt3p2d","zuihtx","n4ptn2","fc45b0","7fqkl3","ico8cy","b41dpn","yf919d","3cbai4","1abck6","pi1p5x","w5ba2t","k61va7","jfjqad","y2b7vc","2sfbws","irg0ny","ob0cd9","81wzn2","owo8vm","a223ea","2equ4h","uxdhtb","bmh6fs","74nlfs",{"_50":1247,"_1248":2274,"_1250":2275,"_1252":2276,"_47":2274,"_1254":2277},"rozebrać ten projekt plik po pliku i zaprojektować Ci V2 — dokładnie które pliki zmienić, jakie funkcje dodać i jak powinien wyglądać nowy algorytm decyzyjny",21694,21851,"Rozbierz ten projekt plik po pliku i zaprojektuj mi V2 — dokładnie które pliki zmienić, jakie funkcje dodać i jak powinien wyglądać nowy algorytm decyzyjny",[576],[2280],"Tak. Przeanalizowałem **cały ZIP repozytorium**, ze szczególnym naciskiem na mechanizm agentów, podejmowanie decyzji, risk management, przepływ danych i bezpieczeństwo.

I od razu najważniejszy wniosek:

> **To nie jest system 5 niezależnych agentów AI.**  
> To jest **hybrydowy system decyzyjny**, w którym jedna instancja Groka dostaje prompt opisujący pięć ról i ma zwrócić pięć opinii w jednym JSON-ie. Gdy AI nie odpowie, aplikacja przełącza się na **deterministyczny lokalny silnik**, który faktycznie implementuje dużą część „mózgu” agentów.

To jest bardzo istotne, bo na podstawie samego UI można odnieść wrażenie, że działa tam pięciu niezależnych analityków.

---

# 🧠 MAPA MÓZGU ZIGGYWIZZAIR

Cały system można sprowadzić do:

```text
                    ┌─────────────────────┐
                    │   LIVE MARKET DATA  │
                    │                     │
                    │ Hyperliquid         │
                    │ Yahoo               │
                    │ CoinGecko           │
                    │ News                │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ MarketSnapshot      │
                    │                     │
                    │ price               │
                    │ changePct           │
                    │ RSI                 │
                    │ vs SMA20            │
                    │ RVOL                │
                    │ FVG                 │
                    │ retracement         │
                    │ session grab        │
                    │ macro                │
                    │ positions           │
                    └──────────┬──────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌────────────────┐          ┌──────────────────┐
       │   AI COUNCIL   │          │  LOCAL COUNCIL   │
       │    Grok 4.5    │          │ deterministic    │
       │                │          │ fallback         │
       └───────┬────────┘          └────────┬─────────┘
               │                            │
               └────────────┬───────────────┘
                            ▼
                 ┌─────────────────────┐
                 │     5 AGENT ROLES    │
                 │                     │
                 │ VESPER              │
                 │ ASH                 │
                 │ KAI                 │
                 │ DAMIAN              │
                 │ IRIS                │
                 └──────────┬──────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │  ORDER GATE       │
                  │                   │
                  │ scout + Kai       │
                  │ team lock         │
                  │ positions         │
                  │ direction         │
                  └─────────┬─────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │       IRIS          │
                 │   position sizing   │
                 │                     │
                 │ 2–6% equity         │
                 │ max 2 legs          │
                 │ max 1 limit         │
                 │ fees ≤ 5%           │
                 └──────────┬──────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │ ProposedOrder    │
                  │ BUY / SELL       │
                  │ symbol           │
                  │ qty              │
                  │ limitPx          │
                  └────────┬─────────┘
                           │
                  ┌────────┴─────────┐
                  │                  │
                  ▼                  ▼
             MANUAL EXECUTION     AUTOPILOT
                  │                  │
                  └────────┬─────────┘
                           ▼
                    ┌─────────────┐
                    │ PAPER BOOK  │
                    │             │
                    │ positions   │
                    │ fills       │
                    │ P&L         │
                    │ scorecard   │
                    └─────────────┘
```

---

# 1. VESPER — MOMENTUM

Plik:

`src/lib/agents/pipeline.ts`

Vesper jest w rzeczywistości **matematycznym scoringiem momentum**, a nie klasycznym agentem AI.

## Long score

Maksymalnie około:

```text
changePct       38 pkt
vsSma           24 pkt
RSI             22 pkt
RVOL            16 pkt
--------------------
~100 pkt
```

Konkretnie:

```text
changePct / 0.7
vsSma / 0.5
RSI
RVOL
```

z odpowiednimi clampami.

### Progi

```text
< 42     → brak sensownego pomysłu

42–61    → lean

62+      → act
```

Czyli:

> **62/100 jest punktem, od którego Vesper uważa ruch za wystarczająco mocny do działania.**

Vesper analizuje zarówno long, jak i short.

---

# 2. ASH — MEAN REVERSION

Ash działa niemal analogicznie, ale w przeciwnym kierunku.

Patrzy na:

```text
odchylenie od SMA
RSI
zmianę ceny
RVOL
```

### Long

Szuka:

```text
cena poniżej SMA
RSI nisko
ujemna zmiana
```

### Short

Szuka:

```text
cena powyżej SMA
RSI wysoko
dodatnia zmiana
```

Czyli:

```text
VESPER
"ruch się rozpędza"

        vs

ASH
"ruch za bardzo odjechał"
```

To jest bardzo sensowny podział.

---

# 3. DAMIAN — MACRO / SENTIMENT

Damian **nie podejmuje decyzji na konkretnym tickerze**.

Jego świat to:

```text
equities
crypto
metals
dollar
volatility
```

Dane:

- VIX → Yahoo
- DXY → Yahoo
- crypto market cap → CoinGecko
- SPY
- BTC
- GOLD

Następnie powstaje:

```text
SentimentReport
```

np.:

```text
equities → bullish
crypto   → bearish
metals   → bullish
dollar   → bearish
vol      → neutral
```

To jest później przekształcane w **weather bias**.

---

# 4. NAJWAŻNIEJSZY ELEMENT DAMIANA

Waga sektora:

```text
bullish → 1.00
neutral → 0.85
bearish → 0.42
```

Czyli Damian **nie mówi**:

> „Nie kupuj BTC.”

Tylko:

> „BTC dostaje znacznie gorsze warunki.”

I to jest architektonicznie bardzo dobre.

Przykład:

```text
Damian:
crypto bearish

BTC:
Vesper BUY 80
Ash HOLD
Kai BUY
```

BTC nadal może zostać kupiony.

Ale:

```text
Vesper 80 × 0.42
= 33.6
```

czyli pomysł zostaje mocno osłabiony.

Co ważne, kod ma komentarz:

> `Bearish crypto does not silence gold.`

Czyli sektorowy filtr jest celowo lokalny.

---

# 5. KAI — NAJWAŻNIEJSZY FILTR TECHNICZNY

Kai jest moim zdaniem **najciekawszym elementem systemu**.

Nie ma odpowiadać:

> BUY / SELL?

On odpowiada:

> **Czy można to teraz wykonać?**

Czyta:

```text
15m
1h
4h
```

i **nie używa 1m do analizy decyzyjnej**.

---

## Kai ma pięć stanów

```text
READY
WAIT
THIN
CHASE
NONE
```

### READY

Jest pullback:

```text
18–62%
```

albo cena dotyka FVG.

→ można ustawić limit.

---

### WAIT

Kierunek jest dobry, ale nie ma jeszcze odpowiedniego miejsca.

→ ustawiamy oczekujący limit.

---

### THIN

```text
RVOL < 0.55
```

→ hard veto.

---

### CHASE

Cena jest zbyt blisko ekstremum:

```text
ostatnie 12 świec
```

i:

```text
retrace < 12%
```

→ nie gonimy rynku.

---

# 6. FVG

Kod faktycznie szuka:

> niezasypanych 3-bar FVG

i wybiera przede wszystkim:

```text
4h
↓
1h
↓
15m
```

Jeżeli znajdzie FVG na wyższym TF i cena je testuje, preferuje ten setup.

To jest całkiem sensowna hierarchia.

---

# 7. SESJE

System dodatkowo szuka liquidity grabów podczas:

```text
00:00 UTC
08:00 UTC
13:30 UTC
15:00 UTC
```

czyli:

```text
UTC
London
New York
Tokyo
```

Sprawdza 3 kolejne świece 15m.

Szuka:

```text
dużego ruchu
+
odrzucenia
+
powrotu
```

i klasyfikuje:

```text
grab-down
grab-up
```

To jest następnie przekazywane Kaiowi.

---

# 8. IRIS — PRAWDZIWY RISK MANAGER

Iris jest „chairmanem”.

Nie jest kolejnym traderem.

Jej zadanie:

```text
CZY WOLNO?
ILE?
CZY JUŻ MAMY ZA DUŻO RYZYKA?
```

---

## Wielkość pozycji

Bazowo:

```text
Damian bullish → 5.2%
neutral        → 3.2%
bearish        → 2.2%
```

Następnie zmniejsza to wraz z liczbą otwartych pozycji:

```text
0 pozycji → 100%
1 pozycja → 78%
2 pozycje → 55%
```

Czyli przykładowo:

```text
bullish + 0 pozycji
5.2%

bullish + 1 pozycja
4.06%

bullish + 2 pozycje
2.86%
```

To jest bardzo konkretna ekspozycja.

---

# 9. LIMIT 2 POZYCJI

System ma:

```text
MAX_OPEN_LEGS = 2
```

Czyli:

```text
0 → można otworzyć
1 → można otworzyć mniejszą
2 → nie otwieramy trzeciej
```

Dodatkowo:

```text
MAX 1 resting limit
```

oraz:

```text
MAX 2 adds/day
```

na istniejącej pozycji.

---

# 10. TEAM LOCK

To jest bardzo dobry mechanizm.

Jeżeli pozycja ma:

```text
teamLock = true
```

to:

```text
Vesper ❌
Ash ❌
Kai ❌
Iris ❌
Autopilot ❌
```

nie mogą jej zamknąć ani zwiększyć.

Czyli:

> **pozycja użytkownika ≠ pozycja zespołu AI.**

To jest poprawne rozdzielenie odpowiedzialności.

---

# 11. OSTATECZNY GATE

To jest prawdziwy „sąd najwyższy”:

`src/lib/agents/quorum.ts`

Dla **nowej pozycji**:

```text
SCOUT
+
KAI
=
permission
```

Scout to:

```text
Vesper
lub
Ash
```

Czyli:

```text
Vesper BUY BTC
Kai BUY BTC
       ↓
     PASS
```

ale:

```text
Vesper BUY BTC
Kai HOLD
       ↓
     FAIL
```

I:

```text
Vesper BUY BTC
Kai BUY ETH
       ↓
     FAIL
```

To bardzo ważne:

> **Kai musi zgodzić się zarówno co do instrumentu, jak i kierunku.**

---

# 12. REDUKCJA POZYCJI

Tutaj system jest bardziej liberalny.

Dla zamknięcia:

```text
jeden scout
LUB
Kai
```

wystarczy.

Czyli:

```text
Vesper SELL BTC
+
mamy LONG BTC

→ można zamknąć
```

Nawet jeśli Ash/Kai nie popierają tego ruchu.

To jest rozsądne, ponieważ **wyjście z ryzyka powinno być łatwiejsze niż wejście**.

---

# 13. AI — I TU JEST NAJWIĘKSZA RÓŻNICA

W `src/lib/ai/council.ts` masz:

```text
model: "grok-4.5"
```

i:

```text
JEDNO wywołanie API
```

Prompt mówi Grokowi:

```text
You chair ZiggyWizzAir, a five-agent paper desk.
```

a następnie opisuje:

```text
vesper
ash
kai
damian
iris
```

Grok zwraca:

```json
{
  "agents": [
    {...vesper...},
    {...ash...},
    {...kai...},
    {...damian...},
    {...iris...}
  ],
  "sentiment": {...},
  "order": {...}
}
```

### Czyli:

```text
          GROK
           │
           ├── Vesper
           ├── Ash
           ├── Kai
           ├── Damian
           └── Iris
```

a nie:

```text
Grok → Vesper
Grok → Ash
Grok → Kai
Grok → Damian
Grok → Iris
```

To jest **jedna inferencja symulująca pięć person**.

---

# 14. CO DZIEJE SIĘ, GDY GROK NIE DZIAŁA?

I tutaj jest bardzo fajna rzecz.

Aplikacja przełącza się na:

```text
localCouncil()
```

czyli:

> **całkowicie deterministyczny system.**

Nie jest to „pusta wersja offline”.

Local council ma zaimplementowane:

- Vesper
- Ash
- Kai
- Damian
- Iris
- scoring
- sizing
- gate
- position limits
- team locks
- FVG
- pullback
- RVOL
- macro

Czyli system może działać **bez LLM**.

---

# 15. W PRAKTYCE MASZ WIĘC DWA MÓZGI

```text
                 MARKET
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
       GROK AI             LOCAL ENGINE
          │                   │
          │                   │
          └─────────┬─────────┘
                    │
                    ▼
               ORDER GATE
                    │
                    ▼
                  IRIS
```

I to jest moim zdaniem **najlepszy element całej architektury**.

Bo AI nie jest jedynym zabezpieczeniem.

---

# 16. ALE JEST POWAŻNY PROBLEM

Największa wada:

## AI może powiedzieć coś, co nie wynika z danych.

Przykład Grok może wygenerować:

```json
{
  "id": "vesper",
  "vote": "buy",
  "symbol": "BTC",
  "conviction": 0.91
}
```

nawet jeśli jego opis jest kompletnie bezsensowny.

System robi pewne sanity checks:

```text
symbol musi istnieć
conviction 0–1
sizePct 0–12
```

ale **nie weryfikuje merytorycznie tezy AI**.

To znaczy:

```text
AI:
"BTC has RSI 73"

rzeczywiste dane:
RSI 41
```

i parser tego nie wykryje.

---

# 17. JESZCZE WAŻNIEJSZE

AI dostaje:

```text
rsi
vsSma
rvol
FVG
retrace
```

ale **ostateczna decyzja nie jest liczona z tych wartości**.

AI samo decyduje.

Czyli:

```text
DATA
 ↓
PROMPT
 ↓
LLM OPINION
 ↓
GATE
```

a nie:

```text
DATA
 ↓
MATEMATYCZNY MODEL
 ↓
SCORE
 ↓
LLM KOMENTARZ
 ↓
GATE
```

To drugie byłoby znacznie bardziej profesjonalne.

---

# 18. LOCAL ENGINE JEST POD TYM WZGLĘDEM LEPSZY

Local:

```text
RSI
+
SMA
+
change
+
RVOL
↓
SCORE
```

jest powtarzalny.

AI:

```text
RSI
+
SMA
+
change
+
RVOL
↓
"wydaje mi się..."
```

jest stochastyczny.

---

# 19. SCORECARD

System zapamiętuje wyniki:

```text
Vesper
Ash
Kai
```

Damian i Iris nie są oceniani jako traderzy.

Dla każdego:

```text
calls
closed
wins
hitRate
avgPnl
last5
sizeMult
trusted
```

### Adaptacja wielkości

```text
hitRate >= 60%
→ ×1.15

45–59%
→ ×1

35–44%
→ ×0.75

<35%
→ ×0.55
```

oraz:

```text
4+ zamknięte
+
hitRate <35%

→ trusted = false
```

To jest **mechanizm uczenia się z wyników**, ale bardzo prosty.

Nie jest to machine learning.

---

# 20. BARDZO WAŻNY BUG / PROBLEM KONCEPCYJNY

W `recordsFrom()`:

```text
hitRate = wins / closed
```

czyli oceniasz agenta głównie po:

> **liczbie zwycięskich transakcji.**

Nie po:

```text
expectancy
profit factor
Sharpe
średnim R
max drawdown
średniej stracie
średnim zysku
```

Może więc istnieć:

```text
Agent A
60% win rate
średnia strata -3%
średni profit +0.5%
```

i:

```text
Agent B
40% win rate
średnia strata -0.5%
średni profit +3%
```

System preferuje:

```text
Agent A
```

mimo że Agent B jest znacznie lepszym traderem.

**To zdecydowanie poprawiłbym.**

---

# 21. DRUGI POWAŻNY PROBLEM — „5 AGENTÓW”

Jeżeli Twoim celem jest naprawdę:

> „multi-agent trading system”

to obecna implementacja tego **nie realizuje w pełni**.

Masz:

```text
ONE LLM
FIVE PERSONAS
```

a nie:

```text
FIVE INDEPENDENT AGENTS
```

To oznacza, że Vesper może być „zainfekowany” opinią Kai/Damiana w tej samej inferencji.

Prawdziwy system powinien wyglądać:

```text
                SNAPSHOT
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
    VESPER       ASH          KAI
     LLM         LLM          LLM
       │           │           │
       └──────┬────┴────┬──────┘
              │         │
              ▼         ▼
           DAMIAN     SCORECARD
              │
              ▼
            IRIS
              │
              ▼
          FINAL GATE
```

Wtedy rzeczywiście masz **niezależne opinie**.

---

# 22. JESZCZE LEPSZA WERSJA

Ja zrobiłbym:

```text
Vesper
   ↓
Momentum score

Ash
   ↓
Mean-reversion score

Damian
   ↓
Macro score

Kai
   ↓
Setup quality

       ↓

     META
     AGENT

       ↓

  Iris / Risk
       ↓
 FINAL DECISION
```

I **LLM nie powinien mieć prawa samemu wymyślać końcowej decyzji**.

---

# 23. IDEALNY PRZEPŁYW DECYZJI

Docelowo:

```text
BTC
│
├── Vesper
│     score = 74
│     BUY
│
├── Ash
│     score = 31
│     HOLD
│
├── Damian
│     crypto = bearish
│     weight = 0.42
│
├── Kai
│     1h FVG
│     pullback = 31%
│     RVOL = 0.84
│     READY
│
└── Iris
      base = 5.2%
      Damian = bearish
      → 2.2%
      open legs = 0
      → 2.2%
```

Potem:

```text
Vesper BUY
+
Kai BUY
+
Kai READY
+
fees OK
+
concentration OK
+
not team locked
+
< 2 legs
        ↓
      BUY
```

To jest **deterministyczne**.

LLM może wtedy powiedzieć:

> „Dlaczego?”

ale nie może zmienić matematyki.

---

# 24. AUTOPILOT

Autopilot działa co około:

```text
55 sekund
```

i bierze:

```text
proposal
lub
lastCouncil.order
```

Jeżeli warunki są spełnione → wykonuje.

Limit może zostać wypełniony po osiągnięciu:

```text
BUY:
price <= limit

SELL:
price >= limit
```

i fill dostaje:

```text
maker fee
```

---

# 25. RISK MANAGEMENT

Masz kilka niezależnych warstw:

### Pozycja

max około:

```text
50% equity / instrument
```

### Portfolio

notional positions:

```text
≤ 2.2 × equity
```

### Fees

```text
round trip ≤ 5%
```

### Legs

```text
max 2
```

### Adds

```text
max 2/day
```

### Cash

musi pozostać wystarczające.

### Team lock

AI nie dotyka ręcznych pozycji.

### Stop Loss / Take Profit

są obsługiwane niezależnie od rady.

To jest całkiem solidna warstwa ochronna.

---

# 26. NEWS

News nie jest prawdziwym „agentem newsowym”.

To osobna warstwa danych.

System:

```text
news
 ↓
headline
 ↓
macro/sentiment
 ↓
Damian
```

Damian może wykorzystać informacje o rynku, ale nie ma osobnego:

```text
NEWS AGENT
```

który analizowałby:

```text
headline
→ impact
→ affected assets
→ direction
→ confidence
```

To byłby dobry kandydat na kolejnego agenta.

---

# 27. DANE RYNKOWE

System rozdziela:

### Trader chart

```text
Hyperliquid 1m
```

### Agents

```text
15m
1h
4h
```

To jest **bardzo dobre rozwiązanie**.

Zapobiega sytuacji:

```text
BTC spadł 0.15% na 1m
→ agent panikuje
```

---

# 28. CO MI SIĘ PODOBA

Ocena architektury:

| Element | Ocena |
|---|---:|
| Podział ról | **9/10** |
| Risk management | **8.5/10** |
| Kai/setup logic | **9/10** |
| FVG/pullback | **8/10** |
| Macro | **8/10** |
| Fallback local | **9/10** |
| Autopilot safeguards | **8/10** |
| Scorecard | **6/10** |
| Niezależność agentów | **4/10** |
| Weryfikacja odpowiedzi AI | **4/10** |
| Backtesting | **2/10** |
| ML/adaptive learning | **2/10** |

---

# 29. NAJWIĘKSZE PROBLEMY, KTÓRE BYM NAPRAWIŁ

### 🔴 P0 — AI nie jest niezależne

Obecnie:

```text
1 Grok → 5 agentów
```

Docelowo:

```text
5 agentów → meta decision
```

---

### 🔴 P0 — LLM może kłamać o danych

Powinien istnieć validator:

```text
AI claim:
RSI = 73

real:
RSI = 41

→ INVALID
```

Agent powinien mieć dostęp tylko do **ustrukturyzowanych danych**, a nie możliwość swobodnego wymyślania liczb.

---

### 🔴 P1 — scorecard oparty głównie o hit rate

Powinien być:

```text
Expectancy
Profit Factor
Average R
Drawdown
Win Rate
Sample Size
```

---

### 🔴 P1 — brak prawdziwego backtestu

To jest największa luka, jeżeli aplikacja ma być kiedyś czymś więcej niż efektownym terminalem.

Potrzebujesz:

```text
historical data
      ↓
replay
      ↓
agents
      ↓
decision
      ↓
fill simulation
      ↓
P&L
```

i możliwość porównania:

```text
Vesper
Ash
Kai
Damian
Iris
```

na tysiącach przypadków.

---

# 30. 🔐 BARDZO WAŻNY PROBLEM BEZPIECZEŃSTWA

Znalazłem w repo:

```text
data/vault.json
```

i to nie jest pusty plik.

Zawiera m.in.:

```text
users
accounts
profiles
books
```

a `accounts` zawierają **zahashowane hasła**.

Są też dane użytkowników/testowych kont.

To jest coś, czego **nie powinno być w publicznym repozytorium GitHub**, nawet jeśli hasła są zahashowane.

Dodatkowo repo zawiera:

```text
.vercel/output/
data/pglite/
data/pglite.broken/
```

czyli **artefakty builda i lokalną bazę danych**.

To zdecydowanie powinno zostać usunięte z repo i z historii Git, nie tylko skasowane w najnowszym commicie.

Jeżeli repo było publiczne, potraktowałbym zawartość `vault.json` jako **wyciek danych testowych** i zresetowałbym dane/hasła związane z tym środowiskiem.

---

# 31. JESZCZE JEDNA RZECZ

Repo ma **ponad 2,700 plików**, ale większość to dane / artefakty:

```text
data       ~2100 plików
src        ~137
.vercel    ~129
.grok      ~91
screenshots ~83
```

Szczególnie rzuca się w oczy:

```text
data/pglite/
data/pglite.broken/
```

oraz mnóstwo:

```text
quorum-desk-...
quorum-desk-quorum-desk-...
```

plików.

To wygląda jak efekt wielokrotnego snapshotowania / generowania danych.

**Repozytorium jest znacznie bardziej zaśmiecone niż powinno.**

Kod aplikacji jest relatywnie mały. Dane i artefakty stanowią ogromną część projektu.

---

# 32. MÓJ WERDYKT

Najważniejsze:

### To nie jest zły projekt.

Wręcz przeciwnie.

**Rdzeń pomysłu jest naprawdę ciekawy.**

Najlepsza rzecz w nim to nie „AI”, tylko architektura:

```text
Momentum
+
Mean Reversion
+
Setup
+
Macro
+
Risk
```

a następnie:

```text
Scout
+
Kai
+
Risk Gate
```

To jest logiczny model podejmowania decyzji.

Natomiast obecnie masz trochę:

> **„bardzo fajnie zaprojektowany trading desk, któremu dołożono Groka”**

zamiast:

> **„prawdziwy multi-agent trading engine”.**

I to jest dokładnie kierunek, który bym teraz rozwijał.

---

# 🚀 Jak ja bym przebudował ZiggyWizzAir

Docelowa architektura:

```text
                 MARKET DATA
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
     Technical      Macro          News
        │             │             │
        ▼             ▼             ▼
     VESPER          DAMIAN        NEWS
        │             │             │
        ▼             │             │
       ASH             │             │
        │              │             │
        └──────┬───────┴──────┬──────┘
               ▼              ▼
             KAI          META-AGENT
               │              │
               └──────┬───────┘
                      ▼
                    IRIS
                      │
              ┌───────┴────────┐
              ▼                ▼
           APPROVE           REJECT
              │
              ▼
         EXECUTION ENGINE
              │
              ▼
            FILL
              │
              ▼
          SCORECARD
              │
              ▼
         AGENT LEARNING
              │
              └──────────→ next decision
```

I najważniejsze:

**LLM powinien być warstwą rozumowania, a nie warstwą kontroli ryzyka.**

Matematyka powinna mieć ostatnie słowo.

---

Jeżeli chcesz, w następnym kroku mogę zrobić coś jeszcze bardziej praktycznego: **rozebrać ten projekt plik po pliku i zaprojektować Ci V2 — dokładnie które pliki zmienić, jakie funkcje dodać i jak powinien wyglądać nowy algorytm decyzyjny**, tak żeby ZiggyWizzAir faktycznie stał się niezależnym multi-agentowym systemem tradingowym, a nie pięcioma personami w jednym promptcie.",{},{"_249":2040,"_256":2285,"_54":2286,"_260":2287,"_262":263,"_264":14,"_265":266,"_267":2288,"_269":270},"ef869620-f553-4457-acf1-5c22f40e6a9b",[2025],{"_582":583,"_267":2293},1789296980.976145,{"_577":603,"_260":2292},{"_592":593,"_594":2289,"_596":2290,"_598":2291,"_600":601,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2283,"_300":2055,"_602":34,"_302":10},79,1789296901.4177883,1789296980.955113,"Przetwarzano przez 1m 19s",{},{"_249":2283,"_256":2297,"_54":2298,"_260":2299,"_262":263,"_264":14,"_265":266,"_267":2300,"_269":270},"782233cb-0b77-4fc8-a244-cc68719588bc",[2040],{"_582":583,"_267":2312},1789296980.971931,{"_577":625,"_625":2307,"_627":2308},{"_613":2301,"_592":615,"_616":2302,"_618":2303,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2295,"_300":2055,"_602":34,"_302":10},{"_621":2304},"python",[620],[2305,2306],"fd8eccfc-d08b-49d5-bcb5-26ca813cd9eb","408cc567-0748-467b-9882-d176e0a21414",[2309],"07068945-e07e-4972-a4c0-653fb4287c64",{"_630":2310,"_260":632,"_633":2311,"_635":34},"Analizowanie kluczy i liczności danych w skarbcu",[],{},{"_249":2295,"_256":2316,"_54":2317,"_56":2318,"_260":2319,"_262":263,"_265":266,"_267":2320,"_269":270},"107b5752-18c5-4693-8b32-ce60285c4b35",[2283],{"_582":648,"_649":2302,"_267":2365},1789296978.7797556,1789296980.034041,{"_577":2364,"_578":2332},{"_275":34,"_2321":2322,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2323,"_300":2055,"_592":615,"_618":2324,"_596":2290,"_302":10,"_298":14},"aggregate_result",{"_262":2325,"_2326":2327,"_2328":2317,"_56":2318,"_620":2329,"_2330":2318,"_2331":2332,"_2333":-5,"_2334":-5,"_2335":2336,"_2337":2338,"_2339":-5},"d00d4e0f-1d66-4f1a-934f-80b43dd581cb",[620],"success","run_id","5093af46-fa32-4cb5-a926-b18f793f719b","start_time","obj=json.loads(v)
obj.keys(), {k:len(val) if isinstance(val,list) else type(val).__name__ for k,val in obj.items()}
","end_time","final_expression_output","(dict_keys(['version', 'at', 'users', 'accounts', 'profiles', 'books']),
 {'version': 'int',
  'at': 'int',
  'users': 15,
  'accounts': 15,
  'profiles': 3,
  'books': 64})","in_kernel_exception","system_exception","messages",[],"jupyter_messages",[2340,2341,2342,2343],"timeout_triggered",{"_2344":262,"_2345":2361,"_260":2362},{"_2344":2359,"_2345":2360},{"_2345":2354,"_2344":2355,"_260":2356},{"_2344":262,"_2345":2346,"_260":2347},"msg_type","parent_header",{"_2350":2351,"_2352":2353},{"_2348":2349},"execution_state","idle","msg_id","f2784d97-30f9ba7a2af0eb80a91a0460_223_24","version","5.3",{"_2350":2351,"_2352":2353},"execute_result",{"_51":2357},{"_2358":2332},"text/plain","execute_input",{"_2350":2351,"_2352":2353},{"_2350":2351,"_2352":2353},{"_2348":2363},"busy","execution_output",{},{"_249":2314,"_256":2369,"_54":2370,"_260":2371,"_262":263,"_264":14,"_265":266,"_267":2372,"_269":2302},"6175f87e-3b39-4593-9fd1-1aa1def5afb6",[2295],{"_582":583,"_267":2379},1789296976.944754,{"_577":620,"_667":668,"_578":2329},{"_273":2373,"_275":34,"_276":2374,"_278":2375,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2376,"_300":2055,"_592":615,"_618":2377,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2378},[],[],"63bc2b5d-4623-4276-92d3-4ec13d41755e",[620],[666],{},{"_249":2367,"_256":2383,"_54":2384,"_56":2385,"_260":2386,"_262":263,"_265":266,"_267":2387,"_269":270},"3d86205d-baa0-491d-a06b-cc3699026c9f",[2314],{"_582":648,"_649":2302,"_267":2416},1789296975.2410724,1789296976.6515276,{"_577":2364,"_578":2406},{"_275":34,"_2321":2388,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2389,"_300":2055,"_592":615,"_618":2390,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2391,"_2328":2384,"_56":2385,"_620":2392,"_2330":2385,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2393,"_2337":2394,"_2339":-5},"ab24de58-0255-456b-bbda-3df77d6fee4a",[620],"36aeec48-54ed-410d-9b81-8c7d4501434f","v=text.get('ziggywizzair-main/data/vault.json')
print(v[:5000] if v else "no")
",[2410],[2395,2396,2397,2398],{"_2344":262,"_2345":2408,"_260":2409},{"_2344":2359,"_2345":2407},{"_2344":2402,"_2345":2403,"_260":2404},{"_2344":262,"_2345":2399,"_260":2400},{"_2350":2401,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_23","stream",{"_2350":2401,"_2352":2353},{"_649":2405,"_578":2406},"stdout","{"version":1,"at":1789296353557,"users":[{"id":"OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd","name":"ogpablo","email":"ogpablo@handle.ziggywizzair.app","emailVerified":false,"image":null,"createdAt":"2026-09-10T08:33:36.522Z","updatedAt":"2026-09-10T08:33:36.522Z"},{"id":"jS5OK5hJ4BFAw0V3swavJmbD63eMZw8C","name":"keep1788982923153","email":"keep1788982923153@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T19:42:05.321Z","updatedAt":"2026-09-09T19:42:05.321Z"},{"id":"hvWsDmLEXidGqc8rNYq5d024S4RY3uuD","name":"i18n1788990625","email":"i18n1788990625@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-09T21:50:28.874Z","updatedAt":"2026-09-09T21:50:28.874Z"},{"id":"WW4cjwNYCwFpDFxm9ZHnhGGf0lcdN597","name":"fixlogin","email":"fixlogin1789220455@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-12T13:40:56.114Z","updatedAt":"2026-09-12T13:40:56.114Z"},{"id":"PT8Ikmqgsn1aE0GJXmwBmapqv07AIBHB","name":"fixlogin","email":"fixlogin1789220487@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-12T13:41:28.144Z","updatedAt":"2026-09-12T13:41:28.144Z"},{"id":"pkWiAUfTySGAW7sNy2nUIvX5TobILAmn","name":"liveqa","email":"liveqa1789220595@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-12T13:43:15.865Z","updatedAt":"2026-09-12T13:43:15.865Z"},{"id":"XA2sNm1DbNRvYozVUIRwyr3fkfxAZCGu","name":"deskok1789220607868","email":"deskok1789220607868@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-12T13:43:31.020Z","updatedAt":"2026-09-12T13:43:31.020Z"},{"id":"FzCkGqhVrxQWdG2nJGmeXwS2umzhOIOD","name":"qaenter1789241206579","email":"qaenter1789241206579@zw.test","emailVerified":false,"image":null,"createdAt":"2026-09-12T19:26:46.956Z","updatedAt":"2026-09-12T19:26:46.956Z"},{"id":"eOLbRv1ihT5XutDbMVYjyjNnCTwCgvfG","name":"qadesk99","email":"qadesk99@handle.ziggywizzair.app","emailVerified":false,"image":null,"createdAt":"2026-09-12T20:11:40.656Z","updatedAt":"2026-09-12T20:11:40.656Z"},{"id":"6mVsdoZBY1LWpUbZTioyEowgzS8DS41x","name":"1zajetanazwa2","email":"1zajetanazwa2@gmail.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T20:34:38.733Z","updatedAt":"2026-09-09T20:34:38.733Z"},{"id":"slSEgUsyt63LK2aqQH80KKw2aek1zbw2","name":"metals1788986839650","email":"metals1788986839650@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T20:47:21.027Z","updatedAt":"2026-09-09T20:47:21.027Z"},{"id":"lIXYig36DHbJbv6bpS4i9bjQufUkEOSQ","name":"hl1788987402156","email":"hl1788987402156@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T20:56:43.348Z","updatedAt":"2026-09-09T20:56:43.348Z"},{"id":"5PTeD1eNKUuOEK3Sm6ykqNQLgHoaNoH5","name":"dep1788988206440","email":"dep1788988206440@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T21:10:07.563Z","updatedAt":"2026-09-09T21:10:07.563Z"},{"id":"mLFD5UItOHs8MxDKh0Nh53RDyaQg36IT","name":"tour1788989252868","email":"tour1788989252868@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T21:27:34.005Z","updatedAt":"2026-09-09T21:27:34.005Z"},{"id":"rk6R3jXAqusmFWl47YzTA8nEJUGjaF7D","name":"hlmid1788989593174","email":"hlmid1788989593174@example.com","emailVerified":false,"image":null,"createdAt":"2026-09-09T21:33:14.428Z","updatedAt":"2026-09-09T21:33:14.428Z"}],"accounts":[{"id":"Wwfw9JbkEciOKUjTBMOTBr30nS8nDCNR","accountId":"OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd","providerId":"credential","userId":"OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd","password":"d037de2001bec88cfca440fdb88fb998:e3eafde98f40bbcb03a0671c8cf9387722ce1fbf6849069657b5a4e15feb1302ecf983dc95e7f9eb353a86d060e9a5e34b3f36aeb438b7e887064f6faa9e28e2","accessToken":null,"refreshToken":null,"idToken":null,"accessTokenExpiresAt":null,"refreshTokenExpiresAt":null,"scope":null,"createdAt":"2026-09-10T08:33:36.571Z","updatedAt":"2026-09-10T08:33:36.571Z"},{"id":"SVgalx52kKoKA9AACmxu0WJCvP1EUwWt","accountId":"jS5OK5hJ4BFAw0V3swavJmbD63eMZw8C","providerId":"credential","userId":"jS5OK5hJ4BFAw0V3swavJmbD63eMZw8C","password":"ae10522c3af58f713fd23c712ed41d90:c7222fc7a1d092b9d000532b7026390ff372828ac4dd5214a53b0ddb38da7369daeea4072f2ed8829d02a27ce50d33cb8b420e615864885c4c927a55b1cf7a1e","accessToken":null,"refreshToken":null,"idToken":null,"accessTokenExpiresAt":null,"refreshTokenExpiresAt":null,"scope":null,"createdAt":"2026-09-09T19:42:05.328Z","updatedAt":"2026-09-09T19:42:05.328Z"},{"id":"lsg4oVTtKsB0r8wrhNoeMA0DxXn9LdwJ","accountId":"hvWsDmLEXidGqc8rNYq5d024S4RY3uuD","providerId":"credential","userId":"hvWsDmLEXidGqc8rNYq5d024S4RY3uuD","password":"244a24ed7f94be04c566285724a5e8c9:eba0e05c9f4d4f02c6b3883a33361b6735371d9e747c973d1124809fb2bfd01f8790cef2e8a70debb6c94c4bc32bd08d0b7662b744c31c760c1a49ba79804e3a","accessToken":null,"refreshToken":null,"idToken":null,"accessTokenExpiresAt":null,"refreshTokenExpiresAt":null,"scope":null,"createdAt":"2026-09-09T21:50:28.884Z","updatedAt":"2026-09-09T21:50:28.884Z"},{"id":"4oefVU4R419XvusErvyWMRZeqblpazHw","accountId":"WW4cjwNYCwFpDFxm9ZHnhGGf0l
",{"_2350":2401,"_2352":2353},{"_2350":2401,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2412,"_2413":2405,"_2414":2415,"_578":2406},"time",1789296976.4316447,"stream_name","sender","server",{},{"_249":2381,"_256":2420,"_54":2421,"_260":2422,"_262":263,"_264":14,"_265":266,"_267":2423,"_269":2302},"d22f9932-877d-4825-b4a0-a7796cd69c59",[2367],{"_582":583,"_267":2430},1789296972.416733,{"_577":620,"_667":668,"_578":2392},{"_273":2424,"_275":34,"_276":2425,"_278":2426,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2427,"_300":2055,"_592":615,"_618":2428,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2429},[],[],"3697ab97-cc5e-424a-987c-753ee8340516",[620],[666],{},{"_249":2418,"_256":2434,"_54":2435,"_56":2436,"_260":2437,"_262":263,"_265":266,"_267":2438,"_269":270},"fdbb7d54-8bca-4c8a-a750-ed139e3113f7",[2381],{"_582":648,"_649":2302,"_267":2460},1789296971.251317,1789296972.1712205,{"_577":2364,"_578":2444},{"_275":34,"_2321":2439,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2440,"_300":2055,"_592":615,"_618":2441,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2442,"_2328":2435,"_56":2436,"_620":2443,"_2330":2436,"_2331":2444,"_2333":-5,"_2334":-5,"_2335":2445,"_2337":2446,"_2339":-5},"3bbe7b22-3f71-4e89-9432-2795a3479d37",[620],"cf8fcc5d-0672-4b30-bc24-fe365156a517","# top dirs and file sizes
from collections import Counter
sizes=[]
with zipfile.ZipFile(zip_path) as z:
 for i in z.infolist():
  if not i.is_dir():
   sizes.append((i.filename,i.file_size))
Counter(n.split('/')[1] if len(n.split('/'))>1 else n for n,s in sizes).most_common(15), sorted(sizes,key=lambda x:x[1], reverse=True)[:15]
","([('data', 2109),
  ('src', 137),
  ('.vercel', 129),
  ('.grok', 91),
  ('screenshots', 83),
  ('scripts', 28),
  ('public', 14),
  ('attachments', 9),
  ('artifacts', 7),
  ('migrations', 7),
  ('server', 3),
  ('.gitignore', 1),
  ('.node_modules.lock', 1),
  ('.prettierrc', 1),
  ('AGENTS.md', 1)],
 [('ziggywizzair-main/data/pglite.broken/pg_wal/000000010000000000000001',
   16777216),
  ('ziggywizzair-main/data/pglite/pg_wal/000000010000000000000001', 16777216),
  ('ziggywizzair-main/.vercel/output/static/assets/pglite-DgipwPsY.wasm',
   10088161),
  ('ziggywizzair-main/.vercel/output/static/assets/pglite-n8RDJ3Sw.data',
   6295316),
  ('ziggywizzair-main/attachments/Video.mp4', 4584064),
  ('ziggywizzair-main/data/pglite/base/5/16498', 2220032),
  ('ziggywizzair-main/data/vault.json', 1454542),
  ('ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@metamask/sdk.mjs',
   1299728),
  ('ziggywizzair-main/data/pglite.broken/base/1/1255', 835584),
  ('ziggywizzair-main/data/pglite.broken/base/4/1255', 835584),
  ('ziggywizzair-main/data/pglite.broken/base/5/1255', 835584),
  ('ziggywizzair-main/data/pglite/base/1/1255', 835584),
  ('ziggywizzair-main/data/pglite/base/4/1255', 835584),
  ('ziggywizzair-main/data/pglite/base/5/1255', 835584),
  ('ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@better-auth/core+[...].mjs',
   801466)])",[],[2447,2448,2449,2450],{"_2344":262,"_2345":2458,"_260":2459},{"_2344":2359,"_2345":2457},{"_2345":2454,"_2344":2355,"_260":2455},{"_2344":262,"_2345":2451,"_260":2452},{"_2350":2453,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_22",{"_2350":2453,"_2352":2353},{"_51":2456},{"_2358":2444},{"_2350":2453,"_2352":2353},{"_2350":2453,"_2352":2353},{"_2348":2363},{},{"_249":2432,"_256":2463,"_54":2464,"_260":2465,"_262":263,"_264":14,"_265":266,"_267":2466,"_269":2302},[2418],{"_582":583,"_267":2473},1789296968.744115,{"_577":620,"_667":668,"_578":2443},{"_273":2467,"_275":34,"_276":2468,"_278":2469,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2470,"_300":2055,"_592":615,"_618":2471,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2472},[],[],"27353757-311c-48f4-994c-a1c49bde72e3",[620],[666],{},{"_249":2306,"_256":2476,"_54":2477,"_56":2478,"_260":2479,"_262":263,"_265":266,"_267":2480,"_269":270},[2432],{"_582":648,"_649":2302,"_267":2500},1789296967.4593596,1789296968.5317972,{"_577":2364,"_578":2499},{"_275":34,"_2321":2481,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2482,"_300":2055,"_702":-5,"_703":-5,"_592":615,"_618":2483,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2484,"_2328":2477,"_56":2478,"_620":2485,"_2330":2478,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2486,"_2337":2487,"_2339":-5},"1de6e09e-272b-466f-bc55-f22d47fe7228",[620],"f900bb24-461a-4228-96af-db9f18ef6e43","for n in files:
 if any(x in n.lower() for x in ['.env','secret','password']) and ('node_modules' not in n):
  if n.endswith(('.ts','.mjs','.json','.env','.example')):
   s=text.get(n,'')
   if re.search(r'(API_KEY|SECRET|PASSWORD|TOKEN)',s,re.I):
    print(n, s[:3000])
",[2497],[2488,2489,2490],{"_2344":262,"_2345":2495,"_260":2496},{"_2344":2359,"_2345":2494},{"_2344":262,"_2345":2491,"_260":2492},{"_2350":2493,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_21",{"_2350":2493,"_2352":2353},{"_2350":2493,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2498,"_2413":2405,"_2414":2415,"_578":2499},1789296968.3472123,"ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/password-BZhf8xbM.mjs import { n as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
import { t as createServerRpc } from "./createServerRpc-CN-evIEF.mjs";
import { n as rateLimit, t as clientIp } from "./limit-2GEJY2rU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-BZhf8xbM.js
var CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function normalizeDevice(raw) {
	const s = raw.trim().toLowerCase();
	return /^[a-f0-9]{64}$/.test(s) ? s : null;
}
function mintRecoveryCode(bytes) {
	let body = "";
	for (let i = 0; i < 12; i++) {
		body += CODE_ALPHABET[bytes[i] % 32];
		if (i === 3 || i === 7) body += "-";
	}
	return body;
}
function normalizeRecovery(raw) {
	return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
async function cryptoBits() {
	const { randomBytes, createHash } = await import("node:crypto");
	const { hashPassword, verifyPassword } = await import("./crypto-45IVpPEN.mjs").then((n) => n.t).then((n) => n.t);
	const digest = (raw) => createHash("sha256").update(raw).digest("hex");
	return {
		randomBytes,
		digest,
		hashPassword,
		verifyPassword
	};
}
async function userIdForHandle(handle) {
	const { emailForHandle } = await import("./login-handle-CKSdUz3G.mjs");
	const email = await emailForHandle(handle);
	if (!email) return null;
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	return (await (await getSql())`
    select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
  `)[0]?.id ?? null;
}
async function writePassword(userId, password) {
	const { randomBytes, hashPassword } = await cryptoBits();
	const hashed = await hashPassword(password);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const rows = await sql`
    select id from account
    where "userId" = ${userId} and "providerId" = 'credential'
    limit 1
  `;
	const now = (/* @__PURE__ */ new Date()).toISOString();
	if (rows[0]?.id) await sql`
      update account
      set password = ${hashed}, "updatedAt" = ${now}
      where id = ${rows[0].id}
    `;
	else await sql`
      insert into account (
        id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
      ) values (
        ${randomBytes(16).toString("hex")}, ${userId}, 'credential', ${userId}, ${hashed}, ${now}, ${now}
      )
    `;
	try {
		const { snapshotVault } = await import("./vault.server-DeQoDthf.mjs");
		await snapshotVault(sql);
	} catch {}
}
async function rememberDevice(userId, device) {
	const token = normalizeDevice(device);
	if (!token) return;
	const { randomBytes, digest } = await cryptoBits();
	const tokenHash = digest(token);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const id = randomBytes(12).toString("hex");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
    insert into desk_devices (id, u
ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/password-kIhJB4kA.mjs import { t as __exportAll } from "./rolldown-runtime-BBjsoOtd.mjs";
import { n as createServerFn } from "./ssr.mjs";
import { t as createSsrRpc } from "./createSsrRpc-D75-wYbG.mjs";
import { t as authMiddleware } from "./middleware-Nk1Kc5zC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-kIhJB4kA.js
var password_exports = /* @__PURE__ */ __exportAll({
	changeDeskPassword: () => changeDeskPassword,
	issueRecoveryCode: () => issueRecoveryCode,
	passwordStatus: () => passwordStatus,
	rememberDevice: () => rememberDevice,
	resetDeskPassword: () => resetDeskPassword,
	trustThisDevice: () => trustThisDevice
});
function normalizeDevice(raw) {
	const s = raw.trim().toLowerCase();
	return /^[a-f0-9]{64}$/.test(s) ? s : null;
}
async function cryptoBits() {
	const { randomBytes, createHash } = await import("node:crypto");
	const { hashPassword, verifyPassword } = await import("./crypto-45IVpPEN.mjs").then((n) => n.t).then((n) => n.t);
	const digest = (raw) => createHash("sha256").update(raw).digest("hex");
	return {
		randomBytes,
		digest,
		hashPassword,
		verifyPassword
	};
}
async function rememberDevice(userId, device) {
	const token = normalizeDevice(device);
	if (!token) return;
	const { randomBytes, digest } = await cryptoBits();
	const tokenHash = digest(token);
	const { getSql } = await import("./db-By3YCc4B.mjs").then((n) => n.t).then((n) => n.t);
	const sql = await getSql();
	const id = randomBytes(12).toString("hex");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	await sql`
    insert into desk_devices (id, user_id, token_hash, created_at, last_seen)
    values (${id}, ${userId}, ${tokenHash}, ${now}, ${now})
    on conflict (token_hash) do update
      set user_id = excluded.user_id, last_seen = excluded.last_seen
  `;
	const extra = await sql`
    select id from desk_devices
    where user_id = ${userId}
    order by last_seen desc
    offset 8
  `;
	for (const row of extra) await sql`delete from desk_devices where id = ${row.id}`;
}
var passwordStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2a3091a566c61ce473376ed9c00b037d761971050b560431530df41fbc0f9157"));
var changeDeskPassword = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("6a4a4be81fa478839980c3972fe14853184bcd04ffffe943fe200fadd610cc75"));
var issueRecoveryCode = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("21fb5eb799598aaa1ec5accb798625660afad9ca9d6e402cf7e674731f1fd5a1"));
var trustThisDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("8f9c0d17bd03cc4d4d5cf8611fbc1d181cb209735a5d495bac4c18d8c8c2e5f4"));
var resetDeskPassword = createServerFn({ method: "POST" }).validator((input) => input).handler(createSsrRpc("ed99fbba3f6ed2e81eda1eb787bbd9084efade79fe1dbb4d48ec01de7ac316b0"));
//#endregion
export { resetDeskPassword as a, p
ziggywizzair-main/src/lib/auth/email-password.ts /**
 * Local email/password sign-in (this app's Better Auth DB — not the broker).
 *
 * Off by default. To enable: set `emailAndPasswordEnabled` to `true` below,
 * then build sign-up / sign-in forms with `authClient.signUp.email` /
 * `authClient.signIn.email` from `@/lib/auth/client` (see the auth skill).
 *
 * Do NOT edit `server.ts` for this — that file is frozen pre-wired config.
 */
export const emailAndPasswordEnabled = true;

ziggywizzair-main/src/lib/desk/password.ts import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { clientIp, rateLimit } from "@/lib/security/limit";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function normalizeDevice(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  return /^[a-f0-9]{64}$/.test(s) ? s : null;
}

function mintRecoveryCode(bytes: Uint8Array) {
  let body = "";
  for (let i = 0; i < 12; i++) {
    body += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
    if (i === 3 || i === 7) body += "-";
  }
  return body;
}

function normalizeRecovery(raw: string) {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

async function cryptoBits() {
  const { randomBytes, createHash } = await import("node:crypto");
  const { hashPassword, verifyPassword } = await import("better-auth/crypto");
  const digest = (raw: string) => createHash("sha256").update(raw).digest("hex");
  return { randomBytes, digest, hashPassword, verifyPassword };
}

async function userIdForHandle(handle: string): Promise<string | null> {
  const { emailForHandle } = await import("@/lib/desk/login-handle");
  const email = await emailForHandle(handle);
  if (!email) return null;
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from "user" where lower(email) = ${email.toLowerCase()} limit 1
  `;
  return rows[0]?.id ?? null;
}

async function writePassword(userId: string, password: string) {
  const { randomBytes, hashPassword } = await cryptoBits();
  const hashed = await hashPassword(password);
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    select id from account
    where "userId" = ${userId} and "providerId" = 'credential'
    limit 1
  `;
  const now = new Date().toISOString();
  if (rows[0]?.id) {
    await sql`
      update account
      set password = ${hashed}, "updatedAt" = ${now}
      where id = ${rows[0].id}
    `;
  } else {
    const id = randomBytes(16).toString("hex");
    await sql`
      insert into account (
        id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt"
      ) values (
        ${id}, ${userId}, 'credential', ${userId}, ${hashed}, ${now}, ${now}
      )
    `;
  }
  try {
    const { snapshotVault } = await import("@/lib/desk/vault.server");
    await snapshotVault(sql);
  } catch {
    /* vault is best-effort */
  }
}

export async function rememberDevice(userId: string, device: string) {
  const token = normalizeDevice(device);
  if (!token) return;
  const { randomBytes, digest } = await cryptoBits();
  const tokenHash = digest(token);
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const id = randomBytes(12).toString("hex");
  const now = new Date().toISOString();
  await sql`
    insert into desk_devices (id, user_id, token_hash, created_at, last_seen)
  
",{},{"_249":2305,"_256":2504,"_54":2505,"_260":2506,"_262":263,"_264":14,"_265":266,"_267":2507,"_269":2302},"487f4caf-8984-4495-939c-86e6a24ce539",[2306],{"_582":583,"_267":2515},1789296965.263627,{"_577":620,"_667":668,"_578":2485},{"_273":2508,"_275":34,"_276":2509,"_278":2510,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2502,"_300":2055,"_702":2511,"_703":2512,"_592":615,"_618":2513,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2514},[],[],[2512],"Wykrywanie sekretów i podatności w konfiguracji",[620],[666],{},{"_249":2502,"_256":2519,"_54":2520,"_260":2521,"_262":263,"_264":14,"_265":266,"_267":2522,"_269":270},"a835b760-134d-4d94-aec5-f11ca027e693",[2305],{"_582":583,"_267":2533},1789296967.135772,{"_577":625,"_625":2528,"_627":2529},{"_613":2523,"_592":615,"_616":617,"_618":2524,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2525,"_300":2055,"_602":34,"_302":10},{"_621":2526},[620],"97b8c92f-a6d2-4fea-80d0-c9c2e0b387a8",[2527,2517],"2ea62853-1a9a-463d-9f44-6268a989bf01",[2530],"0ea867d8-92a5-446e-b680-bf9c17e9e69d",{"_630":2531,"_260":632,"_633":2532,"_635":34},"Sprawdzono istniejące node_modules",[],{},{"_249":2517,"_256":2536,"_54":2537,"_260":2538,"_262":263,"_265":266,"_267":2539,"_269":270},[2502],{"_582":648,"_649":650,"_267":2542},1789296965.266553,{"_577":578,"_579":2541},{"_287":288,"_294":2054,"_296":2054,"_299":2540,"_702":-5,"_703":-5,"_592":615,"_596":2290,"_302":10,"_645":34},"205c5338-ef5b-4efe-9aab-71c5acbdf496",[647],{},{"_249":2527,"_256":2546,"_54":2547,"_260":2548,"_262":263,"_264":14,"_265":266,"_267":2549,"_269":650},"be005d93-10b1-44f2-a281-86b4aed849d6",[2517],{"_582":583,"_267":2558},1789296953.609213,{"_577":620,"_667":668,"_578":2557},{"_273":2550,"_275":34,"_276":2551,"_278":2552,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2544,"_300":2055,"_702":2553,"_703":2554,"_592":615,"_618":2555,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2556},[],[],[2554],"Sprawdzanie istniejących node_modules",[620],[666],"bash -lc rm -rf /tmp/zw && mkdir /tmp/zw && unzip -q /mnt/data/ziggywizzair-main.zip -d /tmp/zw && cd /tmp/zw/ziggywizzair-main && test -d node_modules && echo has_node_modules || echo no_node_modules && ls scripts | head",{},{"_249":2544,"_256":2562,"_54":2563,"_260":2564,"_262":263,"_264":14,"_265":266,"_267":2565,"_269":270},"f15c4975-d071-467a-b1d7-3c85e7d2737a",[2527],{"_582":583,"_267":2577},1789296955.18902,{"_577":625,"_625":2572,"_627":2573},{"_613":2566,"_592":615,"_616":2302,"_618":2567,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2568,"_300":2055,"_602":34,"_302":10},{"_621":2569},[620],"750b5118-5a5e-496a-bde4-97d0ecde3e6c",[2570,2571],"e81a1dae-8167-4865-ba94-0cf43420bdbc","044d4ca8-c929-4e73-bc27-8b41968aa033",[2574],"680c1c5d-ec53-4ded-9911-a8fdf44fe31c",{"_630":2575,"_260":632,"_633":2576,"_635":34},"Przeanalizowano archiwum, agentów, konfigurację rynku oraz błędy testów",[],{},{"_249":2560,"_256":2581,"_54":2582,"_56":2583,"_260":2584,"_262":263,"_265":266,"_267":2585,"_269":270},"c825f94a-ce5a-4f28-a0c1-82f704a59da3",[2544],{"_582":648,"_649":2302,"_267":2608},1789296952.4279585,1789296953.3906696,{"_577":2364,"_578":2602},{"_275":34,"_2321":2586,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2587,"_300":2055,"_592":615,"_618":2588,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2589,"_2328":2582,"_56":2583,"_620":2590,"_2330":2583,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2591,"_2337":2592,"_2339":-5},"bfb51ba5-15af-479f-994a-c4d21057bb9c",[620],"ac36ccc4-6cec-47aa-a080-d60b52c2ad1e","print(text['ziggywizzair-main/package.json'])
",[2606],[2593,2594,2595,2596],{"_2344":262,"_2345":2604,"_260":2605},{"_2344":2359,"_2345":2603},{"_2344":2402,"_2345":2600,"_260":2601},{"_2344":262,"_2345":2597,"_260":2598},{"_2350":2599,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_20",{"_2350":2599,"_2352":2353},{"_649":2405,"_578":2602},"{
  "name": "app-builder-workspace",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "overrides": {
    "nf3": "0.3.17"
  },
  "scripts": {
    "dev": "node scripts/with-app-env.mjs vite dev --host 0.0.0.0 --port 8080",
    "build": "node scripts/with-app-env.mjs vite build && npm run db:migrate",
    "db:migrate": "node scripts/migrate.mjs",
    "build:dev": "node scripts/with-app-env.mjs vite build --mode development",
    "preview": "node scripts/with-app-env.mjs vite preview",
    "preview:restart": "node scripts/preview.mjs restart",
    "preview:stop": "node scripts/preview.mjs stop",
    "typecheck": "tsc --noEmit",
    "check:auth": "node scripts/check-auth-invariant.mjs",
    "test": "node --test 'scripts/**/*.test.mjs' && node --experimental-strip-types --test src/lib/app-data/app-data.test.ts src/lib/app-data/readiness-schedule.test.ts src/lib/auth/gate-identity.test.ts src/lib/auth/sign-in-gate.test.ts",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@electric-sql/pglite": "^0.5.4",
    "@hookform/resolvers": "^5.7.0",
    "@metamask/sdk": "^0.34.0",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-avatar": "^1.1.11",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-label": "^2.1.8",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.8",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.8",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/vite": "^4.3.0",
    "@tanstack/react-query": "^5.101.0",
    "@tanstack/react-router": "^1.170.0",
    "@tanstack/react-start": "^1.168.0",
    "@tanstack/react-table": "^8.21.0",
    "@tanstack/router-plugin": "^1.168.0",
    "better-auth": "~1.6.30",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^4.0.0",
    "jose": "6.2.9",
    "kysely": "^0.28.5",
    "lucide-react": "^0.510.0",
    "pg": "^8.16.3",
    "react": "^19.2.0",
    "react-day-picker": "^9.14.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.54.0",
    "react-resizable-panels": "^4.6.5",
    "recharts": "^2.13.0",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.5.0",
    "tailwindcss": "^4.3.0",
    "tw-animate-css": "^1.3.4",
    "vaul": "^1.1.2",
    "web-push": "^3.6.7",
    "zod": "^4.4.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.20.0",
    "@types/node": "^22.16.5",
    "@types/pg": "^8.11.10",
    "@types/react": "^19.2.0",
    "@types/react-dom": "^19.2.0",
    "@vitejs/plugin-react": "^5.2.0",
    "eslint": "^9.20.0",
    "eslint-config-prettier": "^10.1.1",
    "eslint-plugin-prettier": "^5.2.6",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "lightningcss": "^1.28.0",
    "nitro": "3.0.260610-beta",
    "playwright": "^1.62.0",
    "prettier": "^3.4.0",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.56.1",
    "vite": "^8.2.0"
  }
}

",{"_2350":2599,"_2352":2353},{"_2350":2599,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2607,"_2413":2405,"_2414":2415,"_578":2602},1789296953.207676,{},{"_249":2579,"_256":2612,"_54":2613,"_260":2614,"_262":263,"_264":14,"_265":266,"_267":2615,"_269":2302},"7fc720e7-fe56-4814-bc72-66dc7c60052f",[2560],{"_582":583,"_267":2622},1789296950.985269,{"_577":620,"_667":668,"_578":2590},{"_273":2616,"_275":34,"_276":2617,"_278":2618,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2619,"_300":2055,"_592":615,"_618":2620,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2621},[],[],"879306c8-15e4-47cd-9b82-99f0799b5fbb",[620],[666],{},{"_249":2610,"_256":2626,"_54":2627,"_56":2628,"_260":2629,"_262":263,"_265":266,"_267":2630,"_269":270},"a5a1e9ae-5239-4e28-8a71-2c38fc44ea79",[2579],{"_582":648,"_649":2302,"_267":2653},1789296949.7025855,1789296950.7768245,{"_577":2364,"_578":2647},{"_275":34,"_2321":2631,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2632,"_300":2055,"_592":615,"_618":2633,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2634,"_2328":2627,"_56":2628,"_620":2635,"_2330":2628,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2636,"_2337":2637,"_2339":-5},"3ed2844e-86eb-4268-807f-ceba0c922515",[620],"96136699-47ae-4ba0-9128-adfb910dfe79","print(text['ziggywizzair-main/src/components/desk/desk-app.tsx'][10500:14500])
print("\
AWAY\
", text['ziggywizzair-main/src/lib/desk/away-council.ts'][4500:7000])
",[2651],[2638,2639,2640,2641],{"_2344":262,"_2345":2649,"_260":2650},{"_2344":2359,"_2345":2648},{"_2344":2402,"_2345":2645,"_260":2646},{"_2344":262,"_2345":2642,"_260":2643},{"_2350":2644,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_19",{"_2350":2644,"_2352":2353},{"_649":2405,"_578":2647},"veEventListener("visibilitychange", onVis);
    };
  }, [hydrated, applyLiveQuotes, setFeed]);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    let inFlight = false;
    async function pullMids() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const res = await fetchLiveMids();
        if (!live) return;
        if (res.ok) applyLiveMids(res.mids);
      } catch {
        /* last mid still on the board */
      } finally {
        inFlight = false;
      }
    }
    void pullMids();
    const id = window.setInterval(() => void pullMids(), 800);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [hydrated, applyLiveMids]);

  useEffect(() => {
    if (!hydrated) return;
    let live = true;
    let inFlight = false;
    async function pullWire() {
      if (inFlight || document.hidden) return;
      inFlight = true;
      try {
        const [news, macro] = await Promise.all([fetchLiveNews(), fetchLiveMacro()]);
        if (!live) return;
        if (news.ok) applyHeadlines(news.headlines);
        if (macro.ok) applyMacro(macro.macro);
      } catch {
        /* tape still has last wire */
      } finally {
        inFlight = false;
      }
    }
    void pullWire();
    const id = window.setInterval(() => void pullWire(), 60_000);
    return () => {
      live = false;
      window.clearInterval(id);
    };
  }, [hydrated, applyHeadlines, applyMacro]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.hidden) return;
      if (useDesk.getState().paused) return;
      useMarks.getState().tick(liveAssets());
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  async function convene() {
    if (convening) return;
    setConvening(true);
    for (const a of AGENTS) setAgentStatus(a.id, "reading");
    const snap = snapshot();
    const last = useDesk.getState().lastCouncil;
    const selected = useDesk.getState().selected;
    let result;
    let source: "ai" | "local" = "ai";
    const lastDamian = last?.agents.find((a) => a.id === "damian")?.thesis;
    const seenNews = [
      ...useDesk
        .getState()
        .tape.filter((row) => row.kind === "news" || row.agentId === "damian")
        .map((row) => row.text),
      ...(lastDamian ? [lastDamian] : []),
    ];
    try {
      const res = await conveneCouncil({ data: { snap, last, selected, locale } });
      if (res.ok) {
        result = res.result;
      } else {
        result = localCouncil(snap, last, locale, seenNews);
        source = "local";
      }
    } catch {
      result = localCouncil(snap, last, locale, seenNews);
      source = "local";
    }
    try {
      const speak = useDesk.getState().speak;
      for (const row of result.agents) {
        await new Promise((r) => window.setTimeout(r, 220));
        unveilAgent(row);
        if (row.id === "damian") {
          const dup = useDesk.getState().tape.some((item) => {
            if (item.kind !== "news" && item.agentId !== "damian") return false;
            return newsOverlap(item.text, row.thesis);
          });
          if (dup) continue;
        }
        speak({
          kind: "agent",
          agentId: row.id,
          symbol: row.symbol ?? undefined,
          text: row.thesis,
        });
      }
      applyCouncil(result, source, { spoken: true });
      if (result.order) toast.success(t("toast.councilClosed"));
      else toast.message(t("toast.councilLocal"));
    } catch {
      setConvening(false);
      toast.error(t("toast.councilStalled"));
    }
  }

  const conveneRef = useRef(convene);
  conveneRef.current = convene;

  useEffect(() => {
    if (!hydrated || !autopilot) return;
    let live = true;
    const kick = () => {
      const s = useDesk.getState();
      if (!live || !s.autopilot || s.paused || s.convening) return;
      if (useTradingMode.getState().mode === "live") return;
      if (Date.now() - s.lastAutoAt < 90_000 && s

AWAY
 der = result.order && teamBlocks(book.positions, result.order.symbol) ? null : result.order;
  let next: DeskBook = {
    ...book,
    lastCouncil: { ...result, order },
    lastCouncilAt: now,
    proposal: book.mode === "live" ? null : stampProposal(order, now),
    agents,
    lastTickAt: now,
  };
  next = speak(next, {
    kind: "system",
    ts: now,
    text: t(source === "ai" ? "tape.councilAi" : "tape.councilLocal", { summary: result.summary }, locale),
  });
  for (const a of result.agents) {
    next = speak(next, {
      kind: "agent",
      ts: now,
      agentId: a.id,
      symbol: a.symbol ?? undefined,
      text: a.thesis,
    });
  }
  return next;
}

export async function conveneAway(
  book: DeskBook,
  quotes: LiveQuote[],
  headlines: Headline[],
  macro: MacroTape | null,
  now: number,
): Promise<{ book: DeskBook; proposal: ProposedOrder | null; notified: boolean }> {
  const snap = snapshotFromBook(book, quotes, headlines, macro);
  if (!snap) return { book: { ...book, lastTickAt: now }, proposal: null, notified: false };
  const locale = bookLocale(book);
  const seenNews = book.tape
    .filter((row) => row.kind === "news" || row.agentId === "damian")
    .map((row) => row.text);
  let source: "ai" | "local" = "ai";
  let result: CouncilResult;
  try {
    const { runCouncilSession } = await import("@/lib/ai/council");
    const res = await runCouncilSession({
      snap,
      last: book.lastCouncil,
      selected: book.selected,
      locale,
    });
    if (res.ok) result = res.result;
    else {
      result = localCouncil(snap, book.lastCouncil, locale, seenNews);
      source = "local";
    }
  } catch {
    result = localCouncil(snap, book.lastCouncil, locale, seenNews);
    source = "local";
  }
  const next = applyCouncilBook(book, result, now, source);
  const proposal = next.proposal && !book.autopilot ? next.proposal : null;
  return { book: next, proposal, notified: Boolean(proposal) };
}

",{"_2350":2644,"_2352":2353},{"_2350":2644,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2652,"_2413":2405,"_2414":2415,"_578":2647},1789296950.5942948,{},{"_249":2624,"_256":2657,"_54":2658,"_260":2659,"_262":263,"_264":14,"_265":266,"_267":2660,"_269":2302},"b481b824-764e-4e88-9f58-afa23effc2df",[2610],{"_582":583,"_267":2667},1789296948.328522,{"_577":620,"_667":668,"_578":2635},{"_273":2661,"_275":34,"_276":2662,"_278":2663,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2664,"_300":2055,"_592":615,"_618":2665,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2666},[],[],"ee3b94ee-4a84-4b07-a9dd-98d38742a8b6",[620],[666],{},{"_249":2655,"_256":2671,"_54":2672,"_56":2673,"_260":2674,"_262":263,"_265":266,"_267":2675,"_269":270},"b82128de-a6d6-40e0-aaba-d2e6cd75cdab",[2624],{"_582":648,"_649":2302,"_267":2698},1789296947.1213746,1789296948.1012115,{"_577":2364,"_578":2692},{"_275":34,"_2321":2676,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2677,"_300":2055,"_592":615,"_618":2678,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2679,"_2328":2672,"_56":2673,"_620":2680,"_2330":2673,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2681,"_2337":2682,"_2339":-5},"eb5a4df6-9a08-41e0-a876-e63054174ff2",[620],"d9ca6860-ec1f-46e7-87d5-b6294d5965d7","for pat in ['conveneCouncil','localCouncil(','runCouncilSession','autopilotOnce','applyCouncil(']:
 print("\
PAT",pat)
 for n,tv in text.items():
  if n.startswith('ziggywizzair-main/src/') and pat in tv:
   print(n, [m.start() for m in re.finditer(re.escape(pat),tv)][:10])
",[2696],[2683,2684,2685,2686],{"_2344":262,"_2345":2694,"_260":2695},{"_2344":2359,"_2345":2693},{"_2344":2402,"_2345":2690,"_260":2691},{"_2344":262,"_2345":2687,"_260":2688},{"_2350":2689,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_18",{"_2350":2689,"_2352":2353},{"_649":2405,"_578":2692},"
PAT conveneCouncil
ziggywizzair-main/src/components/desk/desk-app.tsx [1136, 12888]
ziggywizzair-main/src/lib/ai/council.ts [14451]

PAT localCouncil(
ziggywizzair-main/src/components/desk/desk-app.tsx [13029, 13136]
ziggywizzair-main/src/lib/agents/local-council.ts [6362]
ziggywizzair-main/src/lib/desk/away-council.ts [6069, 6180]

PAT runCouncilSession
ziggywizzair-main/src/lib/ai/council.ts [10370, 14997]
ziggywizzair-main/src/lib/desk/away-council.ts [5813, 5891]

PAT autopilotOnce
ziggywizzair-main/src/lib/desk/engine.ts [14553, 16849, 16959, 17498]

PAT applyCouncil(
ziggywizzair-main/src/components/desk/desk-app.tsx [13846]
",{"_2350":2689,"_2352":2353},{"_2350":2689,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2697,"_2413":2405,"_2414":2415,"_578":2692},1789296947.906388,{},{"_249":2669,"_256":2702,"_54":2703,"_260":2704,"_262":263,"_264":14,"_265":266,"_267":2705,"_269":2302},"6254d245-39a0-4e47-9f18-b7a6b75cfe76",[2655],{"_582":583,"_267":2712},1789296944.294364,{"_577":620,"_667":668,"_578":2680},{"_273":2706,"_275":34,"_276":2707,"_278":2708,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2709,"_300":2055,"_592":615,"_618":2710,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2711},[],[],"9164a389-b339-4dac-94c1-8a8b337be60b",[620],[666],{},{"_249":2700,"_256":2716,"_54":2717,"_56":2718,"_260":2719,"_262":263,"_265":266,"_267":2720,"_269":270},"dc5a5a61-96ac-4071-808b-e47735f8cc62",[2669],{"_582":648,"_649":2302,"_267":2740},1789296942.8883593,1789296944.0684578,{"_577":2364,"_578":2739},{"_275":34,"_2321":2721,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2722,"_300":2055,"_592":615,"_618":2723,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2724,"_2328":2717,"_56":2718,"_620":2725,"_2330":2718,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2726,"_2337":2727,"_2339":-5},"72f2c4c6-1687-4993-b5e1-e872fc96253c",[620],"e780b278-ec43-4aef-865d-09b00bb73107","for n in ['ziggywizzair-main/src/lib/market/setup.ts','ziggywizzair-main/src/lib/market/macro.ts']:
 print("\
",n)
 print(text[n][:16000])
",[2737],[2728,2729,2730],{"_2344":262,"_2345":2735,"_260":2736},{"_2344":2359,"_2345":2734},{"_2344":262,"_2345":2731,"_260":2732},{"_2350":2733,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_17",{"_2350":2733,"_2352":2353},{"_2350":2733,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2738,"_2413":2405,"_2414":2415,"_578":2739},1789296943.8735073,"vg: null, wick: false, tf: null };

/**
 * Last 12 bars on one HTF (15m / 1h / 4h). Never 1m — that's chart noise.
 * Chase = sitting on the extreme (no entry).
 * Pullback = 18–62% off that extreme, or price tagging an unfilled 3-bar FVG.
 */
export function candleSetup(series: TickBar[], mark: number, side: "buy" | "sell", tf: SetupTf | null = null): CandleSetup {
  const bars = series.slice(-12);
  if (bars.length < 6 || !(mark > 0)) return { ...EMPTY, tf };
  const his = bars.map(hi);
  const los = bars.map(lo);
  const rangeHi = Math.max(...his);
  const rangeLo = Math.min(...los);
  const range = rangeHi - rangeLo;
  if (!(range > 0)) return { ...EMPTY, tf };
  const last = bars[bars.length - 1]!;
  const prev = bars[bars.length - 2]!;
  const wick = lastWick(bars, side);

  const gaps = fvgs(bars).filter((g) => !filled(g, bars));
  const want = side === "buy" ? "bull" : "bear";
  const liveGap = gaps.filter((g) => g.kind === want && tagging(g, mark)).at(-1) ?? null;
  const fvg = liveGap ? { low: liveGap.low, high: liveGap.high } : null;

  if (side === "buy") {
    const retrace = (rangeHi - mark) / range;
    if (retrace < 0.12 && last.px >= prev.px) return { kind: "chase", px: null, retrace, fvg, wick, tf };
    const pull = retrace >= 0.18 && retrace <= 0.62 && mark > rangeLo + range * 0.2;
    if (pull || fvg) {
      const px = Number((fvg ? Math.min(mark, (fvg.low + fvg.high) / 2) : Math.min(mark, last.px) * 0.999).toFixed(4));
      return { kind: "pullback", px, retrace, fvg, wick, tf };
    }
    return { kind: "none", px: null, retrace, fvg, wick, tf };
  }

  const retrace = (mark - rangeLo) / range;
  if (retrace < 0.12 && last.px <= prev.px) return { kind: "chase", px: null, retrace, fvg, wick, tf };
  const pull = retrace >= 0.18 && retrace <= 0.62 && mark < rangeHi - range * 0.2;
  if (pull || fvg) {
    const px = Number((fvg ? Math.max(mark, (fvg.low + fvg.high) / 2) : Math.max(mark, last.px) * 1.001).toFixed(4));
    return { kind: "pullback", px, retrace, fvg, wick, tf };
  }
  return { kind: "none", px: null, retrace, fvg, wick, tf };
}

function pickSetup(htf: HtfPack | undefined, mark: number, side: "buy" | "sell"): CandleSetup {
  if (!htf) return EMPTY;
  const ranked: Array<{ tf: SetupTf; bars: TickBar[] }> = [
    { tf: "4h", bars: htf.h4 },
    { tf: "1h", bars: htf.h1 },
    { tf: "15m", bars: htf.m15 },
  ];
  for (const row of ranked) {
    if (row.bars.length < 6) continue;
    const s = candleSetup(row.bars, mark, side, row.tf);
    if (s.fvg && s.kind === "pullback") return s;
  }
  if (htf.m15.length >= 6) return candleSetup(htf.m15, mark, side, "15m");
  if (htf.h1.length >= 6) return candleSetup(htf.h1, mark, side, "1h");
  if (htf.h4.length >= 6) return candleSetup(htf.h4, mark, side, "4h");
  return EMPTY;
}

function packFields(s: CandleSetup, prefix: "buy" | "sell") {
  if (prefix === "buy") {
    return {
      buySetup: s.kind,
      buyLimit: s.px ?? undefined,
      buyRetrace: s.retrace != null ? Math.round(s.retrace * 100) : null,
      buyFvg: s.fvg,
      buyWick: s.wick,
      buyTf: s.tf,
    };
  }
  return {
    sellSetup: s.kind,
    sellLimit: s.px ?? undefined,
    sellRetrace: s.retrace != null ? Math.round(s.retrace * 100) : null,
    sellFvg: s.fvg,
    sellWick: s.wick,
    sellTf: s.tf,
  };
}

/** Agent fields from 15m / 1h / 4h only. Charts still use 1m `series`. */
export function analysisSnapshot(htf: HtfPack | undefined, mark: number) {
  const pack = htf ?? { m15: [], h1: [], h4: [] };
  const bars = pack.m15.length >= 16 ? pack.m15 : pack.h1.length >= 16 ? pack.h1 : pack.h4;
  const closes = bars.map((b) => b.px);
  const mean = sma(closes, 20);
  const buy = pickSetup(pack, mark, "buy");
  const sell = pickSetup(pack, mark, "sell");
  return {
    rsi: closes.length >= 15 ? rsi(closes) : 50,
    vsSma: mean && mark > 0 ? ((mark - mean) / mean) * 100 : 0,
    rvol: relativeVolume(pack.m15.length >= 8 ? pack.m15 : bars),
    session: notableSession(pack.m15),
    ...packFields(buy, "buy"),
    ...packFields(sell, "sell"),
  };
}

const SESSION_MARKS: Array<{ name: SessionPrint["name"]; h: number; m: number }> = [
  { name: "utc", h: 0, m: 0 },
  { name: "lon", h: 8, m: 0 },
  { name: "ny", h: 13, m: 30 },
  { name: "tyo", h: 15, m: 0 },
];

function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

function nearestBar(bars: TickBar[], ts: number) {
  let best = 0;
  let dist = Infinity;
  for (let i = 0; i < bars.length; i++) {
    const d = Math.abs(bars[i]!.t - ts);
    if (d < dist) {
      dist = d;
      best = i;
    }
  }
  return dist <= 20 * 60_000 ? best : -1;
}

/** Biggest Lon/NY/Tyo liquidity grab on 15m in this window. */
export function notableSession(bars: TickBar[]): SessionPrint | null {
  if (bars.length < 12) return null;
  const from = bars[0]!.t;
  const to = bars.at(-1)!.t;
  const typical = median(bars.map((b) => hi(b) - lo(b)).filter((r) => r > 0));
  if (!(typical > 0) || !(to > from)) return null;

  let best: (SessionPrint & { score: number }) | null = null;
  const start = Date.UTC(
    new Date(from).getUTCFullYear(),
    new Date(from).getUTCMonth(),
    new Date(from).getUTCDate() - 1,
  );
  for (let day = start; day <= to + 36e5; day += 86_400_000) {
    const d = new Date(day);
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth();
    const da = d.getUTCDate();
    for (const s of SESSION_MARKS) {
      const ts = Date.UTC(y, mo, da, s.h, s.m);
      if (ts < from || ts > to) continue;
      const i = nearestBar(bars, ts);
      if (i < 0) continue;
      const window = bars.slice(i, Math.min(i + 3, bars.length));
      if (window.length < 2) continue;
      const hiW = Math.max(...window.map(hi));
      const loW = Math.min(...window.map(lo));
      const range = hiW - loW;
      const open0 = op(window[0]!);
      if (!(open0 > 0) || range / typical < 1.45) continue;
      const dump = ((open0 - loW) / open0) * 100;
      const pump = ((hiW - open0) / open0) * 100;
      const closeN = window.at(-1)!.px;
      const down = dump >= pump;
      const recovered = down ? closeN > loW + (open0 - loW) * 0.28 : closeN < hiW - (hiW - open0) * 0.28;
      if (!recovered && range / typical < 1.8) continue;
      const pct = down ? dump : pump;
      if (pct < 0.12) continue;
      const hoursAgo = Math.max(0, (to - ts) / 36e5);
      const score = (range / typical) * pct * (s.name === "ny" ? 1.3 : s.name === "lon" ? 1.1 : 1) / (1 + hoursAgo * 0.04);
      if (!best || score > best.score) {
        best = { name: s.name, kind: down ? "grab-down" : "grab-up", pct, score };
      }
    }
  }
  return best ? { name: best.name, kind: best.kind, pct: best.pct } : null;
}


 ziggywizzair-main/src/lib/market/macro.ts
import { createServerFn } from "@tanstack/react-start";
import type { MacroTape, SectorCall, SentimentReport, Stance, TickerSnapshot } from "@/lib/types";

export type { MacroTape };

export function sentimentBias(sectors: SectorCall[] | undefined): number {
  if (!sectors?.length) return 0;
  let score = 0;
  for (const row of sectors) {
    const sign = row.stance === "bullish" ? 1 : row.stance === "bearish" ? -1 : 0;
    score += row.id === "dollar" ? -sign : sign;
  }
  return score / 5;
}

export type MacroPulse = {
  vol: "calm" | "elevated" | "hot" | "unknown";
  dollar: "soft" | "firm" | "flat" | "unknown";
  crypto: "in" | "out" | "flat" | "unknown";
  equity: "up" | "down" | "flat" | "unknown";
};

export type LiveMacroResult =
  | { ok: true; macro: MacroTape }
  | { ok: false; error: string };

const CACHE_MS = 60_000;
let cache: MacroTape | null = null;
let inflight: Promise<LiveMacroResult> | null = null;

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number; previousClose?: number; chartPreviousClose?: number };
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

function lastNum(xs: Array<number | null | undefined> | undefined) {
  if (!xs) return undefined;
  for (let i = xs.length - 1; i >= 0; i--) {
    const v = xs[i];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return undefined;
}

async function yahooLast(yahoo: string): Promise<{ px: number; chg: number } | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahoo)}?interval=1d&range=5d`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as YahooChart;
  const result = body.chart?.result?.[0];
  if (!result) return null;
  const px = result.meta?.regularMarketPrice ?? lastNum(result.indicators?.quote?.[0]?.close);
  const prev = result.meta?.previousClose ?? result.meta?.chartPreviousClose;
  if (!px || !Number.isFinite(px)) return null;
  const base = prev && Number.isFinite(prev) && prev !== 0 ? prev : px;
  return { px, chg: ((px - base) / base) * 100 };
}

async function firstYahoo(symbols: string[]): Promise<{ px: number; chg: number } | null> {
  const settled = await Promise.allSettled(symbols.map(yahooLast));
  for (const row of settled) {
    if (row.status === "fulfilled" && row.value) return row.value;
  }
  return null;
}

async function cryptoGlobal(): Promise<{ mcap: number; pct: number } | null> {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: {
        total_market_cap?: { usd?: number };
        market_cap_change_percentage_24h_usd?: number;
      };
    };
    const mcap = body.data?.total_market_cap?.usd;
    const pct = body.data?.market_cap_change_percentage_24h_usd;
    if (typeof mcap !== "number" || !Number.isFinite(mcap)) return null;
    return { mcap, pct: typeof pct === "number" && Number.isFinite(pct) ? pct : 0 };
  } catch {
    return null;
  }
}

export function emptyMacro(at = Date.now()): MacroTape {
  return {
    vix: null,
    vixChg: null,
    dxy: null,
    dxyChg: null,
    cryptoMcap: null,
    cryptoMcapPct: null,
    equityPct: null,
    at,
  };
}

export function classifyMacro(m: MacroTape | null | undefined): MacroPulse {
  if (!m) {
    return { vol: "unknown", dollar: "unknown", crypto: "unknown", equity: "unknown" };
  }
  const vol: MacroPulse["vol"] =
    m.vix == null
      ? "unknown"
      : m.vix >= 22 || (m.vixChg != null && m.vixChg >= 8)
        ? "hot"
        : m.vix <= 14 && (m.vixChg == null || m.vixChg < 4)
          ? "calm"
          : "elevated";
  const dollar: MacroPulse["dollar"] =
    m.dxyChg == null ? "unknown" : m.dxyChg >= 0.35 ? "firm" : m.dxyChg <= -0.35 ? "soft" : "flat";
  const crypto: MacroPulse["crypto"] =
    m.cryptoMcapPct == null
      ? "unknown"
      : m.cryptoMcapPct >= 1.5
        ? "in"
        : m.cryptoMcapPct <= -1.5
          ? "out"
          : "flat";
  const equity: MacroPulse["equity"] =
    m.equityPct == null ? "unknown" : m.equityPct >= 0.35 ? "up" : m.equityPct <= -0.35 ? "down" : "flat";
  return { vol, dollar, crypto, equity };
}

export function withEquityPct(m: MacroTape | null | undefined, spyChg: number | null): MacroTape | null {
  if (!m && spyChg == null) return null;
  return {
    ...(m ?? emptyMacro()),
    equityPct: spyChg,
  };
}

function n(v: number, d = 1) {
  return v.toFixed(d);
}

export function cryptoCapTalk(m: MacroTape | null | undefined, locale: "en" | "pl"): string {
  const pl = locale === "pl";
  const cap = m?.cryptoMcap;
  const pct = m?.cryptoMcapPct;
  const capStr =
    cap != null && cap > 0
      ? cap >= 1e12
        ? `$${(cap / 1e12).toFixed(2)}T`
        : cap >= 1e9
          ? `$${(cap / 1e9).toFixed(0)}B`
          : `$${cap.toFixed(0)}`
      : null;
  const pctStr =
    pct != null && Number.isFinite(pct) ? `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%` : null;
  if (capStr && pctStr) {
    return pl ? `kapitalizacja krypto ${capStr}, ${pctStr} na dobę` : `crypto market cap ${capStr}, ${pctStr} on the day`;
  }
  if (pctStr) {
    return pl ? `kapitalizacja krypto ${pctStr} na dobę` : `crypto market cap ${pctStr} on the day`;
  }
  if (capStr) {
    return pl ? `kapitalizacja krypto ${capStr}` : `crypto market cap ${capStr}`;
  }
  return "";
}

/** One-line pulse Damian can speak. Skips unknown fields. No ticker dump. */
export function macroHint(m: MacroTape | null | undefined, locale: "en" | "pl"): string {
  const p = classifyMacro(m);
  const bits: string[] = [];
  const pl = locale === "pl";
  const cap = cryptoCapTalk(m, locale);
  if (cap) bits.unshift(cap);
  if (p.vol === "hot") bits.push(pl ? "zmienność skoczyła" : "vol jumped");
  else if (p.vol === "calm") bits.push(pl ? "zmienność spokojna" : "vol is calm");
  else if (p.vol === "elevated") bits.push(pl ? "zmienność podwyższona" : "vol is elevated");
  if (p.dollar === "firm") {
    bits.push(
      pl
        ? `dolar mocniejszy${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — presja na BTC i metale`
        : `dollar firmer${m?.dxyChg != null ? ` (+${n(m.dxyChg)}%)` : ""} — headwind for BTC and metals`,
    );
  } else if (p.dollar === "soft") {
    bits.push(
      pl
        ? `dolar słabszy${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — wiatr w plecy dla BTC i metali`
        : `dollar softer${m?.dxyChg != null ? ` (${n(m.dxyChg)}%)` : ""} — tailwind for BTC and metals`,
    );
  }
  if (p.equity === "up" && m?.equityPct != null) {
    bits.push(pl ? `szeroki rynek akcji +${n(m.equityPct)}%` : `broad stocks +${n(m.equityPct)}%`);
  } else if (p.equity === "down" && m?.equityPct != null) {
    bits.push(pl ? `szeroki rynek akcji ${n(m.equityPct)}%` : `broad stocks ${n(m.equityPct)}%`);
  }
  return bits.slice(0, 3).join(". ");
}

function asStance(up: boolean, down: boolean): Stance {
  if (down) return "bearish";
  if (up) return "bullish";
  return "neutral";
}

/** Damian's board — sector bias, not a ticker vote. */
export function sectorBoard(
  m: MacroTape | null | undefined,
  tickers: TickerSnapshot[],
  locale: "en" | "pl",
): SentimentReport {
  const p = classifyMacro(m);
  const pl = locale === "pl";
  const spy = tickers.find((t) => t.symbol === "SPY");
  const btc = tickers.find((t) => t.symbol === "BTC");
  const gold = tickers.find((t) => t.symbol === "GOLD");
  const eqChg = m?.equityPct ?? spy?.changePct ?? null;
  const btcChg = btc?.changePct ?? null;
  const goldChg = gold?.changePct ?? null;

  const equities = asStance(
    p.equity === "up" || (eqChg != null && eqChg >= 0.35),
    p.equity === "down" || p.vol === "hot" || (eqChg != null && eqChg <= -0.35),
  );
  const crypto = asStance(
    p.crypto === "in" || p.dollar === "soft" || (btcChg != null && btcChg >= 0.8),
    p.crypto === "out" || p.dollar === "firm" || (btcChg != null && btcChg <= -0.8),
  );
  const metals = asStance(
    p.dollar === "soft" || (goldChg != null && goldChg >= 0.4),
    p.dollar === "firm" || (goldChg != null && goldChg <= -0.4),
  );
  const dollar = asStance(p.dollar === "firm", p.dollar === "soft");
  const vol = asStance(p.vol === "calm", p.vol === "hot");

  const why = (id: SectorCall["id"], stance: Stance): string => {
    if (id === "equities") {
      if (stance === "bullish") return pl ? "szeroki rynek w górę, zmienność nie przeszkadza" : "broad stocks up, vol not in the way";
      if (stance === "bearish") return pl ? "akcje słabe albo skok zmienności" : "stocks weak or vol jumped";
      return pl ? "akcje bez kierunku" : "stocks have no one-way read";
    }
    if (id === "crypto") {
      const cap = cryptoCapTalk(m, locale);
      if (stance === "bullish") {
        return cap
          ? pl
            ? `${cap} — dolar nie dusi`
            : `${cap} — dollar not squeezing`
          : pl
            ? "kapitalizacja krypto / BTC w górę, dolar nie dusi"
            : "crypto cap / BTC bid, dollar not squeezing";
      }
      if (stance === "bearish") {
        return cap
          ? pl
            ? `${cap} — presja dolara albo odpływ`
            : `${cap} — firm dollar or outflows`
          : pl
            ? "krypto pod presją dolara albo odpływu"
            : "crypto under a firm dollar or outflows";
      }
      return cap
        ? pl
          ? `${cap} — krypto w dwie strony`
          : `${cap} — crypto two-way`
        : pl
          ? "krypto w dwie strony"
          : "crypto two-way";
    }
    if (id === "metals") {
      if (stance === "bullish") return pl ? "słabszy dolar sprzyja złotu i srebru" : "softer dollar helps gold and silver";
      if (stance === "bearish") return pl ? "mocniejszy dolar waży na metalach" : "firmer dollar weighs on metals";
      return pl ? "metale bez impulsu" : "metals have no impulse";
    }
    if (id === "dollar") {
      if (stance === "bullish") return pl ? "dolar się umacnia" : "the dollar is firming";
      if (stance === "bearish") return pl ? "dolar słabnie" : "the dollar is softening";
      return pl ? "dolar płaski" : "dollar is flat";
    }
    if (stance === "bullish") return pl ? "zmienność spokojna — ryzyko można brać" : "vol is calm — risk is allowed";
    if (stance === "bearish") return pl ? "zmienność gorąca — ostrożnie z akcjami" : "vol is hot — be careful with stocks";
    return pl ? "zmienność zwyczajna" : "vol is ordinary";
  };

  const sectors: SectorCall[] = [
    { id: "equities", stance: equities, why: why("equities", equities) },
    { id: "crypto", stance: crypto, why: why("crypto", crypto) },
    { id: "metals", stance: metals, why: why("metals", metals) },
    { id: "dollar", stance: dollar, why: why("dollar", dollar) },
    { id: "vol", stance: vol, why: why("vol", vol) },
  ];
  const leaned = sectors.filter((s) => s.stance !== "neutral");
  const summary = leaned.length
    ? leaned
        .slice(0, 3)
        .map((s) => {
          const name =
            s.id === "equities"
              ? pl ? "akcje" : "stocks"
              : s.id === "crypto"
                ? pl ? "krypto" : "crypto"
                : s.id === "metals"
                  ? pl ? "metale" : "metals"
                  : s.id === "dollar"
                    ? pl ? "dolar" : "dollar"
                    : pl ? "zmienność" : "vol";
          const dir = s.stance === "bullish" ? (pl ? "byczo" : "bullish") : pl ? "niedźwiedzio" : "bearish";
          return `${name} ${dir}`;
        })
        .join(" · ")
    : pl
      ? "Sentyment mieszany — bez jednostronnego rynku."
      : "Mixed tape — no one-way market.";
  return { summary, sectors };
}

async function pull(): Promise<LiveMacroResult> {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) return { ok: true, macro: cache };
  const [vix, dxy, cg] = await Promise.all([
    firstYahoo(["^VIX"]),
    firstYahoo(["DX-Y.NYB", "DX=F", "UUP"]),
    cryptoGlobal(),
  ]);
  const macro: MacroTape = {
    vix: vix?.px ?? null,
    vixChg: vix?.chg ?? null,
    dxy: dxy?.px ?? null,
    dxyChg: dxy?.chg ?? null,
    cryptoMcap: cg?.mcap ?? null,
    cryptoMcapPct: cg?.pct ?? null,
    equityPct: cache?.equityPct ?? null,
    at: now,
  };
  const any =
    macro.vix != null || macro.dxy != null || macro.cryptoMcapPct != null;
  if (!any) {
    if (cache) return { ok: true, macro: cache };
    return { ok: false, error: "macro quiet" };
  }
  cache = macro;
  return { ok: true, macro };
}

export async function loadLiveMacro(): Promise<LiveMacroResult> {
  if (inflight) return inflight;
  inflight = pull().finally(() => {
    inflight = null;
  });
  return inflight;
}

export const fetchLiveMacro = createServerFn({ method: "POST" }).handler(async (): Promise<LiveMacroResult> => {
  return loadLiveMacro();
});

",{},{"_249":2714,"_256":2744,"_54":2745,"_260":2746,"_262":263,"_264":14,"_265":266,"_267":2747,"_269":2302},"c5f3e2e7-5524-492f-a517-e3a8cc1a3b3f",[2700],{"_582":583,"_267":2754},1789296941.54839,{"_577":620,"_667":668,"_578":2725},{"_273":2748,"_275":34,"_276":2749,"_278":2750,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2751,"_300":2055,"_592":615,"_618":2752,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2753},[],[],"8e13fe48-ec84-4c42-83c4-8e69d13566f0",[620],[666],{},{"_249":2742,"_256":2758,"_54":2759,"_56":2760,"_260":2761,"_262":263,"_265":266,"_267":2762,"_269":270},"60351e91-843a-4c00-bcf9-52392ab0e4bb",[2714],{"_582":648,"_649":2302,"_267":2782},1789296940.2579315,1789296941.336186,{"_577":2364,"_578":2781},{"_275":34,"_2321":2763,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2764,"_300":2055,"_592":615,"_618":2765,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2766,"_2328":2759,"_56":2760,"_620":2767,"_2330":2760,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2768,"_2337":2769,"_2339":-5},"708a29e2-474c-4e96-9851-165c65c2a4cd",[620],"149174fc-3d3b-4763-a8ca-40af5a423c90","print(t[18000:30000])
",[2779],[2770,2771,2772],{"_2344":262,"_2345":2777,"_260":2778},{"_2344":2359,"_2345":2776},{"_2344":262,"_2345":2773,"_260":2774},{"_2350":2775,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_16",{"_2350":2775,"_2352":2353},{"_2350":2775,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2780,"_2413":2405,"_2414":2415,"_578":2781},1789296941.1392267,"ć");
    const who = scouts
      .filter((a) => a.symbol === symbol && a.vote === side)
      .map((a) => (a.id === "vesper" ? "Vesper" : "Ash"))
      .join(" + ");
    const adding = isAddOn(
      snap.book.positions.map((p) => ({ symbol: p.symbol, qty: p.qty, avg: p.avg })),
      symbol,
      side,
    );
    const tk = tickers.find((x) => x.symbol === symbol);
    const kind = tk ? kaiKind(tk, side) : "none";
    const alreadyWorking = Boolean(snap.book.working);
    const held = snap.book.positions.find((p) => p.symbol === symbol);
    const flattening = Boolean(
      held && ((held.qty > 0 && side === "sell") || (held.qty < 0 && side === "buy")),
    );
    if (repeat) {
      iris.thesis = L(
        locale,
        `We already called ${side.toUpperCase()} ${symbol}. I will not print the same ticket again.`,
        `Już zagłosowaliśmy ${side === "buy" ? "KUP" : "SPRZEDAJ"} ${symbol}. Nie składam tego samego zlecenia drugi raz.`,
      );
    } else if (teamBlocks(snap.book.positions, symbol)) {
      iris.thesis = L(
        locale,
        `${symbol} is locked — you own this trade. I will not add or close.`,
        `${symbol} jest zablokowane — to Twoja pozycja. Nie dokładam i nie zamykam.`,
      );
    } else if (flattening && held) {
      order = {
        side,
        symbol,
        qty: Math.abs(held.qty),
        rationale: L(
          locale,
          `Iris flattens ${symbol} — the move stalled.`,
          `Iris zdejmuje ${symbol} — ruch stanął.`,
        ),
      };
      iris.vote = side;
      iris.symbol = symbol;
      iris.sizePct = 0;
      iris.thesis = order.rationale;
    } else if (!adding && openCount >= MAX_OPEN_LEGS) {
      iris.thesis = L(
        locale,
        `Two legs already on. I will not open a third — only a cut or an add on a pullback.`,
        `Dwie nogi już są. Trzeciej nie otwieram — tylko zejście albo dokładka na korekcie.`,
      );
    } else if (!adding && alreadyWorking && kind !== "ready") {
      iris.thesis = L(
        locale,
        `A limit is already resting. I keep that queue — no second wait-limit.`,
        `Limit już czeka. Zostawiam tę kolejkę — bez drugiego czekającego limitu.`,
      );
    } else if (adding && tk && !pullbackInTrend(side, tk.vsSma, tk.rsi, tk.changePct)) {
      iris.thesis = L(
        locale,
        `${symbol} is not at the end of a pullback. I add only there — not into extension.`,
        `${symbol} nie jest na końcu korekty. Dokładam tylko tam, nie w wyciągnięcie.`,
      );
    } else if (tk) {
      const pctWanted = irisClipPct(weather.bias, openCount, adding);
      const px = markOf(tk);
      const qty = sizeQty(snap.book.equity, pctWanted, tk);
      const pct = clipPctOf(qty, px, snap.book.equity);
      const limit = kaiPick?.idea.symbol === symbol ? kaiPick.limit : kaiLimit(tk, side);
      if (qty > 0) {
        order = {
          side,
          symbol,
          qty,
          limitPx: limit && limit > 0 ? Number(limit.toFixed(4)) : undefined,
          rationale: L(
            locale,
            `${who ? `${who} on direction. ` : ""}Iris ${pct.toFixed(1)}% of equity. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`,
            `${who ? `${who} dał kierunek. ` : ""}Iris ${pct.toFixed(1)}% kapitału. ${L(locale, weather.en, weather.pl)}. ${kai.thesis} ${hits}.`,
          ),
        };
        iris.vote = side;
        iris.symbol = symbol;
        iris.sizePct = pct;
        iris.thesis = `${order.rationale} ${nums(tk, locale)}.`;
      }
    }
  } else if (mood !== "risk-off" && cut?.symbol) {
    const tk = tickers.find((x) => x.symbol === cut.symbol);
    const pos = snap.book.positions.find((p) => p.symbol === cut.symbol);
    if (tk && pos) {
      order = {
        side: cut.vote as "buy" | "sell",
        symbol: cut.symbol,
        qty: Math.abs(pos.qty),
        rationale: L(
          locale,
          `Iris cuts ${cut.symbol} after ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`,
          `Iris zdejmuje ${cut.symbol} po sygnale ${cut.id === "vesper" ? "Vesper" : "Ash"}: ${cut.thesis}`,
        ),
      };
      iris.vote = cut.vote;
      iris.symbol = cut.symbol;
      iris.thesis = order.rationale;
    }
  } else if (scouts.length) {
    iris.thesis = L(
      locale,
      `Vesper/Ash have a name, but Kai vetoed chase or dead tape. Waiting.`,
      `Vesper/Ash mają spółkę, ale Kai zablokował pogoń albo martwy obrót. Czekamy.`,
    );
  }

  order = gateCouncilOrder(order, agents, snap);
  if (!order) {
    iris.thesis = `${L(locale, weather.en, weather.pl)}. ${iris.thesis}`;
  }

  const summary =
    mood === "risk-off"
      ? L(locale, "Chair keeps the book light. No new risk this round.", "Iris trzyma portfel lekki. Bez nowego ryzyka w tej rundzie.")
      : order
        ? L(
            locale,
            `${order.limitPx ? "Limit" : "Ticket"} on ${order.side.toUpperCase()} ${order.symbol}. Iris sized from Damian's weather.`,
            `${order.limitPx ? "Limit" : "Zlecenie"} ${order.side === "buy" ? "KUP" : "SPRZEDAJ"} ${order.symbol}. Iris dała wielkość od pogody Damiana.`,
          )
        : L(locale, "No ticket this round. Stay in cash.", "Brak biletu w tej rundzie. Zostajemy w gotówce.");

  return { mood, summary, agents, order, sentiment };
}

export type AskFill = {
  symbol: string;
  side: string;
  qty: number;
  price: number;
  note?: string;
  source?: string;
};

export type AskContext = {
  lastCouncil?: CouncilResult | null;
  recentFills?: AskFill[];
};

const AGENT_NAME: Record<AgentId, string> = {
  vesper: "Vesper",
  ash: "Ash",
  kai: "Kai",
  damian: "Damian",
  iris: "Iris",
};

function pnlTalk(p: number, locale: Locale) {
  if (!Number.isFinite(p) || Math.abs(p) < 0.25) {
    return L(locale, "basically unchanged", "praktycznie na zero");
  }
  if (p > 0) return L(locale, `up about ${p.toFixed(1)}%`, `mniej więcej +${p.toFixed(1)}%`);
  return L(locale, `down about ${Math.abs(p).toFixed(1)}%`, `mniej więcej −${Math.abs(p).toFixed(1)}%`);
}

function holdTalk(
  pos: MarketSnapshot["book"]["positions"][number] | undefined,
  symbol: string,
  locale: Locale,
) {
  if (!pos) return L(locale, `We don't have ${symbol} on.`, `Nie mamy otwartego ${symbol}.`);
  const dir = pos.qty > 0 ? L(locale, "long", "długo") : L(locale, "short", "krótko");
  return L(
    locale,
    `We're ${dir} ${symbol}, ${pnlTalk(pos.pnlPct, locale)}.`,
    `Siedzimy ${dir} na ${symbol}, ${pnlTalk(pos.pnlPct, locale)}.`,
  );
}

function readName(t: TickerSnapshot, question: string, locale: Locale) {
  const q = question.toLowerCase();
  const chg = t.changePct;
  const thinksDown = /spad|zjazd|zjechał|zjechal|leci|dump|drop|down|przecen|wash|runę|runel|manipul/.test(q);
  const thinksUp = /uros|wzros|skoczył|skoczyl|rally|ripp|wybi/.test(q);
  const sess = sessionTalk(t, locale);

  let body: string;
  if (thinksDown && t.session?.kind === "grab-down") {
    body = sess;
  } else if (thinksUp && t.session?.kind === "grab-up") {
    body = sess;
  } else if (thinksDown && (!Number.isFinite(chg) || chg > -0.35)) {
    body = L(
      locale,
      `I get why ${t.symbol} looks heavy on a short chart, but from the open it has barely given anything back — this is a drift, not a washout.`,
      `Rozumiem, czemu ${t.symbol} wygląda na zjazd na krótkim wykresie, ale od otwarcia prawie nic nie oddał. To dryf, nie przecena.`,
    );
  } else if (thinksUp && (!Number.isFinite(chg) || chg < 0.35)) {
    body = L(
      locale,
      `${t.symbol} hasn't really expanded from the open. If it felt loud, the session print doesn't confirm a breakout yet.`,
      `${t.symbol} od otwarcia prawie nie uciekł. Jeśli hałasuje na wykresie, sesja jeszcze nie potwierdza wybicia.`,
    );
  } else if (!Number.isFinite(chg) || Math.abs(chg) < 0.25) {
    body = L(
      locale,
      `${t.symbol} is quiet from the open — no trend, no washout, just a tight range.`,
      `${t.symbol} od otwarcia jest cichy: ani trendu, ani przeceny, tylko wąski zakres.`,
    );
  } else if (chg >= 1.2) {
    body = L(
      locale,
      `${t.symbol} has pushed hard from the open. That's momentum, not a dip to fade.`,
      `${t.symbol} ostro poszedł od otwarcia. To momentum, nie dołek do odbicia.`,
    );
  } else if (chg >= 0.35) {
    body = L(
      locale,
      `${t.symbol} is grinding higher from the open, without looking stretched yet.`,
      `${t.symbol} od otwarcia idzie w górę, jeszcze bez euforii.`,
    );
  } else if (chg <= -1.2) {
    body = L(
      locale,
      `${t.symbol} is genuinely offered from the open. This is the kind of move that can be a real washout.`,
      `${t.symbol} od otwarcia naprawdę spada. To już może być przecena, nie szum.`,
    );
  } else {
    body = L(
      locale,
      `${t.symbol} is easing from the open, still orderly.`,
      `${t.symbol} od otwarcia się zsuwa, ale spokojnie, bez paniki.`,
    );
  }
  if (sess && body !== sess) return `${body} ${sess}`;
  return body;
}

function ashNext(t: TickerSnapshot, locale: Locale) {
  const stretched = t.rsi <= 32 || t.vsSma < -0.8 || t.changePct <= -1;
  if (stretched) {
    return L(
      locale,
      `This is the stretch I actually fade: one small ticket the other way, and I will not add if it keeps going against us.`,
      `Przy takiej przecenie siadam: jedna mała noga w drugą stronę i bez dokładania, jeśli pójdzie dalej przeciwko nam.`,
    );
  }
  return L(
    locale,
    `I'm not fading a quiet name. When a real washout shows up I'll take one small ticket — not two, and I don't average down.`,
    `Cichej spółki nie odbijam. Jak pojawi się prawdziwa przecena, wezmę jedną małą nogę — nie dwie i nie uśredniam.`,
  );
}

function vesperNext(t: TickerSnapshot, locale: Locale) {
  if (t.changePct > 0.3 && t.rsi < 72) {
    return L(
      locale,
      `If it keeps expanding I'll keep a small long. If it stalls, I flatten. I'm not here to fade this.`,
      `Jeśli dalej się rozszerza, zostawiam małą długą. Jak stanie — zdejmuję. Tego nie gram w drugą stronę.`,
    );
  }
  return L(
    locale,
    `There's no expansion to ride. I'll wait for the name to actually start moving.`,
    `Nie ma tu momentum do jazdy. Poczekam, aż spółka naprawdę ruszy.`,
  );
}

function kaiNext(_t: TickerSnapshot, locale: Locale) {
  return L(
    locale,
    `I wouldn't chase the print. I want a pullback that actually comes to us, then a resting limit — not a market order into whatever is on the screen.`,
    `Nie goniłbym tej ceny. Chcę cofnięcia, które naprawdę do nas dojdzie, i limitu — nie rynku w to, co widać na ekranie.`,
  );
}

function mentionsName(snap: MarketSnapshot, question: string): TickerSnapshot | null {
  const upper = question.toUpperCase();
  const aliases: Record<string, string> = {
    BITCOIN: "BTC",
    ETHER: "ETH",
    ETHEREUM: "ETH",
    ZŁOTO: "GOLD",
    ZLOTO: "GOLD",
    SREBRO: "SILVER",
  };
  for (const t of snap.tickers) {
    if (upper.includes(t.symbol)) return t;
    if (t.name && upper.includes(t.name.toUpperCase())) return t;
  }
  for (const [word, sym] of Object.entries(aliases)) {
    if (upper.includes(word)) return snap.tickers.find((t) => t.symbol === sym) ?? null;
  }
  return null;
}

function isDamianQuestion(q: string) {
  return /sentyment|sentiment|sektor|dollar|dolar|vol\\b|zmienn|rynek|market|krypto|crypto|bitcoin|\\bbtc\\b|\\beth\\b|kapitaliz|mcap|market.?cap|złot|zlot|srebr|gold|silver|metal|dxy|wiadomo|news|nagłów|naglów|pogod|weather|fear|greed|bull|bear/.test(
    q,
  );
}

function isIrisQuestion(q: string) {
  return /iris|ryzyk|risk|cash|gotów|gotow|zamkn|close|size|wielko[sś][cć]|ile kapita|ile mam/.test(q);
}

function isKaiQuestion(q: string) {
  return /manipul|spoof|stop.?hunt|płynno|plynno|sesj|\\bny\\b|londyn|tokio|liquidity|fvg|limit|setup|cofni[eę]/.test(q);
}

function capUsd(n: number | null | undefined) {
  if (n == null || !(n > 0)) return null;
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if 
",{},{"_249":2756,"_256":2786,"_54":2787,"_260":2788,"_262":263,"_264":14,"_265":266,"_267":2789,"_269":2302},"8f1c8084-e218-4e05-991a-dfb310899062",[2742],{"_582":583,"_267":2796},1789296938.96969,{"_577":620,"_667":668,"_578":2767},{"_273":2790,"_275":34,"_276":2791,"_278":2792,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2793,"_300":2055,"_592":615,"_618":2794,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2795},[],[],"68799420-dc96-4bfa-ba05-07e19f1b12c6",[620],[666],{},{"_249":2784,"_256":2800,"_54":2801,"_56":2802,"_260":2803,"_262":263,"_265":266,"_267":2804,"_269":270},"2659b6dd-ca18-4a38-90c9-02cc44dfb07d",[2756],{"_582":648,"_649":2302,"_267":2824},1789296937.3316355,1789296938.4739687,{"_577":2364,"_578":2823},{"_275":34,"_2321":2805,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2806,"_300":2055,"_592":615,"_618":2807,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2808,"_2328":2801,"_56":2802,"_620":2809,"_2330":2802,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2810,"_2337":2811,"_2339":-5},"5219ec74-1ca5-41d4-8f9d-1eac2f090260",[620],"166c4310-72af-4b5a-b2cb-aa47823e27f2","t=text['ziggywizzair-main/src/lib/agents/local-council.ts']
print(t[:18000])
",[2821],[2812,2813,2814],{"_2344":262,"_2345":2819,"_260":2820},{"_2344":2359,"_2345":2818},{"_2344":262,"_2345":2815,"_260":2816},{"_2350":2817,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_15",{"_2350":2817,"_2352":2353},{"_2350":2817,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2822,"_2413":2405,"_2414":2415,"_578":2823},1789296938.2743077,"import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { gateCouncilOrder } from "@/lib/agents/quorum";
import {
  ashRank,
  irisClipPct,
  kaiKind,
  kaiLimit,
  LEAN_SCORE,
  MAX_OPEN_LEGS,
  rankKai,
  vesperRank,
  ACT_SCORE,
  type Idea,
} from "@/lib/agents/pipeline";
import { isWhyOpenedQuestion, replyLocale } from "@/lib/ai/ask-lang";
import { isAddOn, pullbackInTrend, teamBlocks } from "@/lib/desk/holds";
import { clipPctOf, markOf, qtyForClip } from "@/lib/desk/size";
import type { Locale } from "@/lib/i18n/catalog";
import { macroHint, sectorBoard, sentimentBias } from "@/lib/market/macro";
import type { CouncilResult, MacroTape, MarketSnapshot, ProposedOrder, SentimentReport, TickerSnapshot } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

function damianReport(
  locale: Locale,
  opts?: { macro?: MacroTape | null; tickers?: TickerSnapshot[] },
): {
  thesis: string;
  vote: "hold";
  symbol: null;
  conviction: number;
  sizePct: number;
  sentiment: SentimentReport;
} {
  const board = sectorBoard(opts?.macro, opts?.tickers ?? [], locale);
  const hint = macroHint(opts?.macro, locale);
  const thesis = hint ? `${hint}. ${board.summary}` : board.summary;
  return {
    thesis: thesis.slice(0, 340),
    vote: "hold",
    symbol: null,
    conviction: 0.55,
    sizePct: 0,
    sentiment: board,
  };
}

function sessionLabel(name: NonNullable<TickerSnapshot["session"]>["name"], locale: Locale) {
  if (name === "ny") return "NY";
  if (name === "lon") return locale === "pl" ? "Londyn" : "London";
  if (name === "tyo") return locale === "pl" ? "Tokio" : "Tokyo";
  return "00:00 UTC";
}

function sessionTalk(t: TickerSnapshot, locale: Locale) {
  const s = t.session;
  if (!s) return "";
  const who = sessionLabel(s.name, locale);
  const pct = s.pct.toFixed(1);
  if (s.kind === "grab-down") {
    return L(
      locale,
      `On the 15m, ${who} printed a fast dump (~${pct}%) and a bounce — that looks like a liquidity grab, not a new trend.`,
      `Na 15m przy ${who} była szybka zrzutka (ok. ${pct}%) i odbicie — to wygląda na zbieranie płynności, nie na nowy trend.`,
    );
  }
  return L(
    locale,
    `On the 15m, ${who} spiked (~${pct}%) and sold off — liquidity grab to the upside, not a clean breakout.`,
    `Na 15m przy ${who} był szybki strzał w górę (ok. ${pct}%) i zejście — zbieranie płynności od góry, nie czyste wybicie.`,
  );
}

function nums(t: TickerSnapshot, locale: Locale) {
  const chg = `${t.changePct >= 0 ? "+" : ""}${t.changePct.toFixed(2)}%`;
  const sma = `${t.vsSma >= 0 ? "+" : ""}${t.vsSma.toFixed(2)}%`;
  const rvol = t.rvol != null ? `rvol ${t.rvol.toFixed(2)}` : locale === "pl" ? "brak rvol" : "no rvol";
  return locale === "pl"
    ? `${t.symbol}: ${chg} od otwarcia, RSI 15m ${t.rsi.toFixed(0)}, vs SMA20 (15m) ${sma}, ${rvol}`
    : `${t.symbol}: ${chg} from the open, RSI 15m ${t.rsi.toFixed(0)}, vs 20-SMA (15m) ${sma}, ${rvol}`;
}

function kaiLine(tk: TickerSnapshot, side: "buy" | "sell", locale: Locale) {
  const retrace = side === "buy" ? tk.buyRetrace : tk.sellRetrace;
  const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
  const wick = side === "buy" ? tk.buyWick : tk.sellWick;
  const kind = side === "buy" ? tk.buySetup : tk.sellSetup;
  const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
  const tf = (side === "buy" ? tk.buyTf : tk.sellTf) ?? "15m";
  const rvol = tk.rvol != null ? `rvol ${tk.rvol.toFixed(2)} (15m)` : locale === "pl" ? "brak rvol 15m" : "no 15m rvol";
  const extreme = side === "buy" ? L(locale, `the 12-bar ${tf} high`, `szczytu 12 świec ${tf}`) : L(locale, `the 12-bar ${tf} low`, `dołka 12 świec ${tf}`);
  const dir = side === "buy" ? L(locale, "long", "kupno") : L(locale, "short", "sprzedaż");
  const bits: string[] = [
    L(locale, `${tk.symbol} ${dir} on ${tf} HL candles (not 1m).`, `${tk.symbol} ${dir} — świece ${tf} z Hyperliquid (nie 1m).`),
  ];
  if (kind === "chase") {
    bits.push(
      L(
        locale,
        `Price sits in the last ${retrace ?? 0}% off ${extreme} and the last bar still prints that way — chase, no limit.`,
        `Cena siedzi ${retrace ?? 0}% od ${extreme} i ostatnia świeca dalej to potwierdza — pogoń, bez limitu.`,
      ),
    );
  } else if (retrace != null) {
    bits.push(
      L(
        locale,
        `Retrace ${retrace}% from ${extreme}${kind === "pullback" ? " (in the 18–62% entry band)" : ""}.`,
        `Cofnięcie ${retrace}% od ${extreme}${kind === "pullback" ? " (pasmo wejścia 18–62%)" : ""}.`,
      ),
    );
  }
  if (fvg) {
    bits.push(
      L(
        locale,
        `${side === "buy" ? "Bullish" : "Bearish"} FVG ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — price is tagging the gap.`,
        `FVG ${side === "buy" ? "wzrostowa" : "spadkowa"} ${fvg.low.toFixed(2)}–${fvg.high.toFixed(2)} — cena testuje lukę.`,
      ),
    );
  } else {
    bits.push(L(locale, "No unfilled 3-bar FVG in this window.", "W tym oknie nie ma niezasypanego FVG (3 świece)."));
  }
  if (wick) {
    bits.push(
      L(
        locale,
        `Last bar has a ${side === "buy" ? "lower" : "upper"} rejection wick.`,
        `Ostatnia świeca ma knot ${side === "buy" ? "dolny" : "górny"} (odrzucenie).`,
      ),
    );
  }
  bits.push(rvol + (limit && kind === "pullback" ? L(locale, `. Limit ${limit.toFixed(2)}.`, `. Limit ${limit.toFixed(2)}.`) : "."));
  if (tk.session) {
    bits.push(sessionTalk(tk, locale));
  }
  return bits.join(" ");
}

function weatherFromSentiment(s: SentimentReport | undefined): { bias: number; en: string; pl: string } {
  const bias = sentimentBias(s?.sectors);
  if (!s?.sectors?.length) {
    return { bias: 0, en: "Damian has no read yet", pl: "Damian jeszcze nic nie powiedział" };
  }
  if (bias >= 0.35) {
    return { bias, en: "Damian: weather is friendly — clip a bit larger", pl: "Damian: pogoda sprzyja — clip trochę większy" };
  }
  if (bias <= -0.35) {
    return { bias, en: "Damian: weather is hostile — clip smaller", pl: "Damian: pogoda nie sprzyja — mniejszy clip" };
  }
  return { bias, en: "Damian: mixed weather — standard clip", pl: "Damian: pogoda mieszana — zwykły clip" };
}

function sizeQty(equity: number, sizePct: number, t: TickerSnapshot) {
  return qtyForClip(equity, sizePct, markOf(t), t.symbol);
}

export function localCouncil(
  snap: MarketSnapshot,
  last?: CouncilResult | null,
  locale: Locale = "en",
  _seenNews: string[] = [],
): CouncilResult {
  const tickers = snap.tickers.filter((t) => t.price > 0);

  if (!tickers.length) {
    return {
      mood: "cautious",
      summary: L(locale, "Board is empty. Waiting on live prices.", "Rynek pusty. Czekam na ceny."),
      agents: AGENTS.map((p) => ({
        id: p.id,
        thesis: L(locale, "No prints yet. Nothing to vote.", "Jeszcze nic nie widać. Nie mam głosu."),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.2,
        sizePct: 0,
      })),
      order: null,
      sentiment: sectorBoard(snap.macro, tickers, locale),
    };
  }

  const of = (sym: string) => tickers.find((t) => t.symbol === sym);
  const damian = damianReport(locale, { macro: snap.macro, tickers });
  const sentiment = damian.sentiment;
  const weather = weatherFromSentiment(sentiment);
  const vesperIdeas = vesperRank(tickers, sentiment);
  const ashIdeas = ashRank(tickers, sentiment);

  const openPos = snap.book.positions.filter((p) => Math.abs(p.qty) > 1e-8);
  const stalled = openPos.find((p) => {
    if (p.teamLock) return false;
    const tk = of(p.symbol);
    if (!tk) return false;
    if (p.qty > 0) return tk.changePct < -0.9 || (p.pnlPct < -0.8 && tk.vsSma < 0);
    return tk.changePct > 0.9 || (p.pnlPct < -0.8 && tk.vsSma > 0);
  });
  const stalledTape = stalled ? of(stalled.symbol) : undefined;
  const cutIdea: Idea | null =
    stalled && stalledTape
      ? {
          scout: "vesper",
          symbol: stalled.symbol,
          side: stalled.qty < 0 ? "buy" : "sell",
          score: 88,
          cut: true,
        }
      : null;

  const vesperLead = cutIdea ?? vesperIdeas[0] ?? null;
  const ashLead = ashIdeas[0] ?? null;
  const allIdeas = [...(cutIdea ? [cutIdea] : []), ...vesperIdeas, ...ashIdeas];
  const kaiRows = rankKai(allIdeas, of);
  const kaiPick = kaiRows.find((r) => r.kind === "ready" || r.kind === "wait") ?? kaiRows[0] ?? null;
  const vesperVote =
    (kaiPick && vesperIdeas.find((i) => i.symbol === kaiPick.idea.symbol && i.side === kaiPick.idea.side)) ??
    vesperLead;
  const ashVote =
    (kaiPick && ashIdeas.find((i) => i.symbol === kaiPick.idea.symbol && i.side === kaiPick.idea.side)) ?? ashLead;

  function listTalk(ideas: Idea[]) {
    if (!ideas.length) return "";
    return ideas
      .map((i) => `${i.symbol} ${i.side === "buy" ? L(locale, "long", "długa") : L(locale, "short", "krótka")} ${i.score.toFixed(0)}`)
      .join(" · ");
  }

  const agents: CouncilResult["agents"] = AGENTS.map((p) => {
    if (p.id === "vesper") {
      if (cutIdea && stalled && stalledTape) {
        const cover = stalled.qty < 0;
        return {
          id: p.id,
          thesis: L(
            locale,
            `${stalled.symbol} stalled. ${nums(stalledTape, locale)}. I'd rather be flat than hopeful.`,
            `${stalled.symbol} stanęło. ${nums(stalledTape, locale)}. Wolałabym nic nie trzymać, niż liczyć na cud.`,
          ),
          vote: (cover ? "buy" : "sell") as "buy" | "sell",
          symbol: stalled.symbol,
          conviction: 0.62,
          sizePct: 0,
        };
      }
      if (vesperVote && !cutIdea) {
        const tk = of(vesperVote.symbol)!;
        const more = listTalk(vesperIdeas.filter((i) => i.symbol !== vesperVote.symbol));
        return {
          id: p.id,
          thesis: L(
            locale,
            `${nums(tk, locale)}. Score ${vesperVote.score.toFixed(0)}${vesperVote.score >= ACT_SCORE ? " — expansion I will ride" : " — lean, not a full run"}${more ? `. Also watching ${more}` : ""}.`,
            `${nums(tk, locale)}. Wynik ${vesperVote.score.toFixed(0)}${vesperVote.score >= ACT_SCORE ? " — ekspansja, którą chcę jechać" : " — nachylenie, nie pełny bieg"}${more ? `. Na oku też ${more}` : ""}.`,
          ),
          vote: vesperVote.side,
          symbol: vesperVote.symbol,
          conviction: Math.min(0.9, 0.4 + vesperVote.score / 140),
          sizePct: vesperVote.score >= ACT_SCORE ? 5 : 3,
        };
      }
      const hot = [...tickers].sort((a, b) => b.changePct - a.changePct)[0];
      return {
        id: p.id,
        thesis: L(
          locale,
          `Nothing clearing ${LEAN_SCORE} after Damian's weather. Hottest print is ${hot ? nums(hot, locale) : "—"}.`,
          `Nic nie przebija ${LEAN_SCORE} po pogodzie Damiana. Najmocniejszy ruch: ${hot ? nums(hot, locale) : "—"}.`,
        ),
        vote: "hold" as const,
        symbol: hot?.symbol ?? null,
        conviction: 0.38,
        sizePct: 0,
      };
    }
    if (p.id === "ash") {
      if (ashVote) {
        const tk = of(ashVote.symbol)!;
        const more = listTalk(ashIdeas.filter((i) => i.symbol !== ashVote.symbol));
        const fade = ashVote.side === "buy";
        return {
          id: p.id,
          thesis: L(
            locale,
            `${nums(tk, locale)}. Score ${ashVote.score.toFixed(0)} — ${fade ? "wash, one clip" : "stretch, I sell strength"}${more ? `. Also ${more}` : ""}.`,
            `${nums(tk, locale)}. Wynik ${ashVote.score.toFixed(0)} — ${fade ? "przecena, jeden clip" : "wyciągnięcie, sprzedaję siłę"}${more ? `. Też ${more}` : ""}.`,
          ),
          vote: ashVote.side,
          symbol: ashVote.symbol,
          conviction: Math.min(0.88, 0.4 + ashVote.score / 140),
          sizePct: 4,
        };
      }
      const low = [...tickers].sort((a, b) => a.rsi - b.rsi)[0];
      const high = [...tickers].sort((a, b) => b.rsi - a.rsi)[0];
      return {
        id: p.id,
        thesis: L(
          locale,
          `Extremes: ${low ? nums(low, locale) : "—"} vs ${high ? nums(high, locale) : "—"}. Nothing I will fade yet.`,
          `Skrajności: ${low ? nums(low, locale) : "—"} vs ${high ? nums(high, locale) : "—"}. Jeszcze nic do fade.`,
        ),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.34,
        sizePct: 0,
      };
    }
    if (p.id === "kai") {
      if (cutIdea && stalled && stalledTape) {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${stalled.symbol} is done. Flatten now — I don't wait for a limit to get out.`,
            `${stalled.symbol} się skończyło. Zdejmuję teraz — z zejścia nie czekam na limit.`,
          ),
          vote: cutIdea.side,
          symbol: stalled.symbol,
          conviction: 0.6,
          sizePct: 0,
        };
      }
      if (kaiPick && (kaiPick.kind === "ready" || kaiPick.kind === "wait")) {
        const extra =
          kaiPick.kind === "wait"
            ? L(
                locale,
                " No tagging FVG yet — I rest a limit and wait, I don't veto the direction.",
                " Jeszcze nie ma FVG pod ceną — kładę limit i czekam, kierunku nie kasuję.",
              )
            : "";
        return {
          id: p.id,
          thesis: kaiLine(kaiPick.tk, kaiPick.idea.side, locale) + extra,
          vote: kaiPick.idea.side,
          symbol: kaiPick.idea.symbol,
          conviction: kaiPick.kind === "ready" ? 0.7 : 0.55,
          sizePct: 3,
        };
      }
      if (kaiPick?.kind === "thin") {
        return {
          id: p.id,
          thesis: L(
            locale,
            `${kaiPick.idea.symbol}: rvol ${kaiPick.tk.rvol?.toFixed(2)} (need ≥ 0.55). Dead tape — hard veto.`,
            `${kaiPick.idea.symbol}: rvol ${kaiPick.tk.rvol?.toFixed(2)} (chcę ≥ 0,55). Martwy obrót — twardy veto.`,
          ),
          vote: "hold" as const,
          symbol: kaiPick.idea.symbol,
          conviction: 0.5,
          sizePct: 0,
        };
      }
      if (kaiPick?.kind === "chase") {
        return {
          id: p.id,
          thesis: kaiLine(kaiPick.tk, kaiPick.idea.side, locale),
          vote: "hold" as const,
          symbol: kaiPick.idea.symbol,
          conviction: 0.55,
          sizePct: 0,
        };
      }
      return {
        id: p.id,
        thesis: L(
          locale,
          `No name this round. I read 15m / 1h / 4h. Ready limit, rest a wait-limit, or veto chase/thin tape. 1m is noise.`,
          `Nikt nie wskazał spółki. Czytam 15m / 1h / 4h. Limit gotowy, limit czekający, albo veto na pogoń/martwy obrót. 1m to szum.`,
        ),
        vote: "hold" as const,
        symbol: null,
        conviction: 0.3,
        sizePct: 0,
      };
    }
    if (p.id === "damian") {
      return {
        id: p.id,
        thesis: damian.thesis,
        vote: "hold" as const,
        symbol: null,
        conviction: damian.conviction,
        sizePct: 0,
      };
    }
    const cashPct = (100 * snap.book.cash) / Math.max(snap.book.equity, 1);
    const riskOff = snap.book.dayPnlPct < -2.4 || cashPct < 18;
    const names = snap.book.positions.map((p) => p.symbol).join(", ");
    return {
      id: p.id,
      thesis: riskOff
        ? L(
            locale,
            `Book is ${snap.book.dayPnlPct.toFixed(2)}% on the day, cash ${cashPct.toFixed(0)}%. No new risk until things calm. Fees stay ≤ 5% round-trip.`,
            `Portfel ${snap.book.dayPnlPct.toFixed(2)}% w ciągu dnia, gotówka ${cashPct.toFixed(0)}%. Bez nowego ryzyka, dopóki się nie uspokoi. Opłaty ≤ 5% za otwarcie i zamknięcie.`,
          )
        : names
          ? L(
              locale,
              `Cash ${cashPct.toFixed(0)}% · open ${names}. I size 2–6% from Damian's weather. Max two legs plus one resting limit. Adds only on a pullback, max two a day.`,
              `Gotówka ${cashPct.toFixed(0)}% · otwarte: ${names}. Wielkość 2–6% od pogody Damiana. Max dwie nogi plus jeden limit w kolejce. Dokładki tylko na korekcie, max dwie dziennie.`,
            )
          : L(
              locale,
              `Cash is ${cashPct.toFixed(0)}% of equity. I size 2–6% from Damian's weather. Two legs + one wait-limit. Fees ≤ 5% round-trip.`,
              `Gotówka to ${cashPct.toFixed(0)}% kapitału. Wielkość 2–6% od pogody Damiana. Dwie nogi + jeden limit czekający. Opłaty ≤ 5%.`,
            ),
      vote: "hold" as const,
      symbol: null,
      conviction: 0.7,
      sizePct: 0,
    };
  });

  const iris = agents.find((a) => a.id === "iris")!;
  const kai = agents.find((a) => a.id === "kai")!;
  const scouts = agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
  const kaiReady = kai.vote !== "hold" && kai.symbol && (kai.vote === "buy" || kai.vote === "sell");
  const openCount = openPos.filter((p) => !p.teamLock).length;
  const bookRiskOff =
    iris.thesis.includes("No new risk") || iris.thesis.includes("Bez nowego ryzyka");

  const mood: CouncilResult["mood"] = bookRiskOff ? "risk-off" : kaiReady ? "risk-on" : "cautious";

  let order: ProposedOrder | null = null;
  const cut = scouts.find((a) => {
    const pos = snap.book.positions.find((p) => p.symbol === a.symbol);
    if (!pos || pos.teamLock) return false;
    return (pos.qty > 0 && a.vote === "sell") || (pos.qty < 0 && a.vote === "buy");
  });

  if (mood !== "risk-off" && kaiReady) {
    const side = kai.vote as "buy" | "sell";
    const symbol = kai.symbol!;
    const lead = scouts.find((a) => a.symbol === symbol && a.vote === side) ?? kai;
    const repeat = last?.order && last.order.symbol === symbol && last.order.side === side;
    const card = snap.scorecard?.find((r) => r.id === lead.id);
    const hits =
      card && card.closed >= 2
        ? L(locale, `${card.wins}/${card.closed} recent hits`, `${card.wins}/${card.closed} ostatnich trafień`)
        : L(locale, "too few closed calls to score", "za mało zamkniętych, żeby oceni
",{},{"_249":2798,"_256":2828,"_54":2829,"_260":2830,"_262":263,"_264":14,"_265":266,"_267":2831,"_269":2302},"9668baff-8369-4892-b154-16e2bdee247a",[2784],{"_582":583,"_267":2838},1789296935.907776,{"_577":620,"_667":668,"_578":2809},{"_273":2832,"_275":34,"_276":2833,"_278":2834,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2835,"_300":2055,"_592":615,"_618":2836,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2837},[],[],"e9f020fd-b015-4184-90e2-71137ff999b5",[620],[666],{},{"_249":2826,"_256":2842,"_54":2843,"_56":2844,"_260":2845,"_262":263,"_265":266,"_267":2846,"_269":270},"2d19f687-fe8c-404a-b258-d64e8c40fa88",[2798],{"_582":648,"_649":2302,"_267":2866},1789296934.3261783,1789296935.684314,{"_577":2364,"_578":2865},{"_275":34,"_2321":2847,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2848,"_300":2055,"_592":615,"_618":2849,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2850,"_2328":2843,"_56":2844,"_620":2851,"_2330":2844,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2852,"_2337":2853,"_2339":-5},"6839053c-9fae-4f32-9588-02bb7b46e23a",[620],"fe567c19-cbb9-432a-bb3e-beba18ac75f2","for n in ['ziggywizzair-main/src/lib/agents/local-council.ts','ziggywizzair-main/src/lib/market/setup.ts','ziggywizzair-main/src/lib/market/macro.ts','ziggywizzair-main/src/lib/desk/engine.ts']:
 print("\
###",n)
 print(text[n][:25000])
",[2863],[2854,2855,2856],{"_2344":262,"_2345":2861,"_260":2862},{"_2344":2359,"_2345":2860},{"_2344":262,"_2345":2857,"_260":2858},{"_2350":2859,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_14",{"_2350":2859,"_2352":2353},{"_2350":2859,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2864,"_2413":2405,"_2414":2415,"_578":2865},1789296935.4842215,"lientUntil: number;
  deskEpoch: number;
  agentCalls: AgentCall[];
  lastCouncilAt: number;
  locale: "en" | "pl";
  mode: "demo" | "live";
  alertPrefs: AlertPrefs;
};

export function idleAgents(): AgentSpeech[] {
  return AGENTS.map((a) => ({
    id: a.id,
    status: "idle" as const,
    thesis: a.mandate,
    vote: "hold" as const,
    symbol: null,
    conviction: 0,
  }));
}

export function emptyBook(now = Date.now()): DeskBook {
  return {
    cash: STARTING_CASH,
    positions: [],
    fills: [],
    closedTrades: [],
    autopilot: false,
    lastCouncil: null,
    lastAsk: null,
    agents: idleAgents(),
    startingEquity: STARTING_CASH,
    periodAnchors: defaultAnchors(STARTING_CASH),
    tape: [
      {
        id: "sys-open",
        ts: now,
        kind: "system",
        text: "Demo open. $100,000 virtual. Waiting on live prices.",
      },
    ],
    proposal: null,
    working: null,
    selected: "BTC",
    lastAutoAt: 0,
    lastTickAt: 0,
    fillSeq: 0,
    clientUntil: 0,
    deskEpoch: 0,
    agentCalls: [],
    lastCouncilAt: 0,
    locale: "en",
    mode: "demo",
    alertPrefs: { ...DEFAULT_ALERT_PREFS },
  };
}

export function applyFill(
  cash: number,
  positions: Position[],
  fill: Fill,
): { cash: number; positions: Position[] } {
  const signed = fill.side === "buy" ? fill.qty : -fill.qty;
  const fee = fill.fee ?? 0;
  const existing = positions.find((p) => p.symbol === fill.symbol);

  if (!existing || Math.abs(existing.qty) < 1e-8) {
    const rest = positions.filter((p) => p.symbol !== fill.symbol);
    return {
      cash: cash - Math.abs(signed) * fill.price - fee,
      positions: [...rest, { symbol: fill.symbol, qty: signed, avg: fill.price, fees: fee }],
    };
  }

  const oldQty = existing.qty;
  const newQty = oldQty + signed;

  if (Math.sign(oldQty) === Math.sign(signed)) {
    const absOld = Math.abs(oldQty);
    const absAdd = Math.abs(signed);
    const avg =
      absOld + absAdd === 0
        ? fill.price
        : (absOld * existing.avg + absAdd * fill.price) / (absOld + absAdd);
    return {
      cash: cash - absAdd * fill.price - fee,
      positions: positions.map((p) =>
        p.symbol === fill.symbol ? { ...p, qty: newQty, avg, fees: (p.fees ?? 0) + fee } : p,
      ),
    };
  }

  const closedQty = Math.min(Math.abs(oldQty), Math.abs(signed));
  const realized = (fill.price - existing.avg) * closedQty * Math.sign(oldQty);
  const share = closedQty / Math.abs(oldQty);
  const remainFees = (existing.fees ?? 0) * (1 - share);
  let nextCash = cash + closedQty * existing.avg + realized - fee;
  if (Math.abs(newQty) < 1e-8) {
    return {
      cash: nextCash,
      positions: positions.filter((p) => p.symbol !== fill.symbol),
    };
  }
  if (Math.sign(newQty) === Math.sign(oldQty)) {
    return {
      cash: nextCash,
      positions: positions.map((p) =>
        p.symbol === fill.symbol ? { ...p, qty: newQty, fees: remainFees } : p,
      ),
    };
  }
  nextCash -= Math.abs(newQty) * fill.price;
  return {
    cash: nextCash,
    positions: positions.map((p) =>
      p.symbol === fill.symbol
        ? { symbol: p.symbol, qty: newQty, avg: fill.price, fees: fee }
        : p,
    ),
  };
}

export function estimatedRoundTripFeePct(_symbol?: string, _live = false) {
  return hlRoundTripPct();
}

export function feeCapOk(symbol: string, qty: number, price: number, live = false) {
  if (!(Math.abs(qty * price) > 0)) return false;
  return estimatedRoundTripFeePct(symbol, live) <= 5.000000001;
}

export function notionalOk(
  cash: number,
  positions: Position[],
  assets: Record<string, MarketAsset>,
  symbol: string,
  side: "buy" | "sell",
  qty: number,
  price: number,
) {
  const eq = equityOf(cash, positions, assets);
  const nextQty = (positions.find((p) => p.symbol === symbol)?.qty ?? 0) + (side === "buy" ? qty : -qty);
  const nameNotional = Math.abs(nextQty * price);
  if (eq > 0 && nameNotional > eq * 0.5) return false;
  if (
    positions.filter((p) => p.symbol !== symbol).reduce((s, p) => s + Math.abs(p.qty * (assets[p.symbol]?.price || p.avg)), 0) +
      nameNotional >
    Math.max(eq, 1) * 2.2
  ) {
    return false;
  }
  if (!feeCapOk(symbol, qty, price)) return false;
  const fee = hlFeeUsd(qty, price, "taker");
  return (
    applyFill(cash, positions, {
      id: "probe",
      ts: 0,
      symbol,
      side,
      qty,
      price,
      source: "manual",
      fee,
      feeKind: "taker",
    }).cash >= -0.5
  );
}

function speak(book: DeskBook, item: Omit<TapeItem, "id" | "ts"> & { ts?: number }): DeskBook {
  const row: TapeItem = {
    id: `t-${(item.ts ?? Date.now()).toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    ts: item.ts ?? Date.now(),
    kind: item.kind,
    text: item.text,
    agentId: item.agentId,
    symbol: item.symbol,
  };
  return { ...book, tape: [row, ...book.tape].slice(0, 120) };
}

export function commitFill(
  book: DeskBook,
  input: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    price: number;
    source: Fill["source"];
    note?: string;
    skipRisk?: boolean;
    feeKind?: FeeKind;
    ts: number;
    assets: Record<string, MarketAsset>;
  },
): { ok: true; book: DeskBook; fill: Fill } | { ok: false; error: string } {
  const sized = isLot(input.symbol) || input.skipRisk ? input.qty : Math.round(input.qty);
  if (!Number.isFinite(sized) || sized <= 0) return { ok: false, error: "Size the ticket." };
  if (
    (input.source === "council" || input.source === "autopilot") &&
    teamBlocks(book.positions, input.symbol)
  ) {
    return { ok: false, error: "Team locked out of this trade." };
  }
  const adding = isAddOn(book.positions, input.symbol, input.side);
  if (!input.skipRisk && adding && addCountToday(book.fills, input.ts) >= MAX_ADDS_PER_DAY) {
    return { ok: false, error: "Iris veto — two adds today." };
  }
  if (
    !input.skipRisk &&
    !notionalOk(book.cash, book.positions, input.assets, input.symbol, input.side, sized, input.price)
  ) {
    return { ok: false, error: "Iris veto — size or concentration." };
  }
  const fill: Fill = {
    id: `f-${input.ts.toString(36)}-${(book.fillSeq + 1).toString(36)}`,
    ts: input.ts,
    symbol: input.symbol,
    side: input.side,
    qty: sized,
    price: input.price,
    source: input.source,
    note: input.note,
    feeKind: input.feeKind ?? "taker",
    fee: hlFeeUsd(sized, input.price, input.feeKind ?? "taker"),
  };
  const next = applyFill(book.cash, book.positions, fill);
  const stamped = stampOpened(
    book.positions.find((p) => p.symbol === input.symbol),
    next.positions,
    fill,
  );
  if (!input.skipRisk && next.cash < -0.5) return { ok: false, error: "Iris veto — not enough cash." };
  const closed = closedFromFill(
    book.positions.find((p) => p.symbol === input.symbol),
    fill,
  );
  const decorated = closed ? decorateClosed(closed, book.lastCouncil, fill, book.fills, book.locale) : null;
  const closedTrades = decorated ? [decorated, ...book.closedTrades].slice(0, 200) : book.closedTrades;
  const eq = equityOf(next.cash, stamped, input.assets);
  const stillOpen = Math.abs(stamped.find((p) => p.symbol === input.symbol)?.qty ?? 0) > 1e-8;
  let out: DeskBook = {
    ...book,
    cash: next.cash,
    positions: stamped,
    fills: [fill, ...book.fills].slice(0, 80),
    closedTrades,
    fillSeq: book.fillSeq + 1,
    periodAnchors: rollAnchors(book.periodAnchors, eq),
    agentCalls: closeCallsFor(book.agentCalls ?? [], input.symbol, input.price, input.ts, stillOpen),
    proposal:
      book.proposal && book.proposal.symbol === input.symbol && book.proposal.side === input.side
        ? null
        : book.proposal,
  };
  out = speak(out, {
    kind: "fill",
    symbol: input.symbol,
    ts: input.ts,
    text: tapeFillText(fill, book.locale),
  });
  return { ok: true, book: out, fill };
}

export function expireHolds(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  if (!book.positions.length) return book;
  const assets: Record<string, MarketAsset> = {};
  const views = viewsAt(quotes, now);
  const bySym = new Map(views.map((v) => [v.symbol, v]));
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    assets[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: now, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: v.price,
      liveCoin: null,
      spotPx: null,
      tape: "hl",
    };
  }
  let next = book;
  for (const pos of book.positions) {
    const v = bySym.get(pos.symbol);
    if (!v) continue;
    if (pos.teamLock) continue;
    if (!holdExpired(pos, now, v.price, v.vsSma, v.changePct)) continue;
    const side = pos.qty > 0 ? "sell" : "buy";
    const note = promisingHold(pos, v.price, v.vsSma, v.changePct)
      ? "close.timePromising"
      : "close.timeSession";
    const filled = commitFill(next, {
      symbol: pos.symbol,
      side,
      qty: Math.abs(pos.qty),
      price: v.price,
      source: "council",
      note,
      skipRisk: true,
      ts: now,
      assets,
    });
    if (filled.ok) next = filled.book;
  }
  return next;
}

export function expireStops(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  if (!book.positions.length) return book;
  const views = viewsAt(quotes, now);
  const bySym = new Map(views.map((v) => [v.symbol, v]));
  const assets: Record<string, MarketAsset> = {};
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    assets[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: now, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: v.price,
      liveCoin: null,
      spotPx: null,
      tape: "hl",
    };
  }
  let next = book;
  for (const pos of [...next.positions]) {
    const v = bySym.get(pos.symbol);
    if (!v) continue;
    const hit = hitStop(pos, v.price);
    if (!hit) continue;
    const filled = commitFill(next, {
      symbol: pos.symbol,
      side: pos.qty > 0 ? "sell" : "buy",
      qty: Math.abs(pos.qty),
      price: v.price,
      source: "manual",
      note: hit === "sl" ? "close.stopLoss" : "close.takeProfit",
      skipRisk: true,
      ts: now,
      assets,
    });
    if (filled.ok) next = filled.book;
  }
  return next;
}

export function fillWorking(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  const w = book.working;
  if (!w?.limitPx) return book;
  const q = quotes.find((x) => x.symbol === w.symbol);
  const px = q?.livePx && q.livePx > 0 ? q.livePx : q?.price;
  if (!(px && px > 0)) return book;
  const hit = w.side === "buy" ? px <= w.limitPx : px >= w.limitPx;
  if (!hit) return book;
  const u = UNIVERSE.find((x) => x.symbol === w.symbol);
  const assets: Record<string, MarketAsset> = u
    ? {
        [w.symbol]: {
          symbol: w.symbol,
          name: u.name,
          price: px,
          open: px,
          high: px,
          low: px,
          series: [{ t: now, px }],
          vol: u.vol,
          beta: u.beta,
          livePx: px,
          liveCoin: null,
          spotPx: null,
          tape: "hl",
        },
      }
    : {};
  const filled = commitFill(book, {
    symbol: w.symbol,
    side: w.side,
    qty: w.qty,
    price: px,
    source: "council",
    note: w.rationale,
    feeKind: "maker",
    skipRisk: false,
    ts: now,
    assets,
  });
  if (!filled.ok) return book;
  return { ...filled.book, working: null };
}

type TickerView = {
  symbol: string;
  price: number;
  changePct: number;
  vsSma: number;
  vol: number;
};

function viewsAt(quotes: LiveQuote[], t: number): TickerView[] {
  return quotes.flatMap((q) => {
    const u = UNIVERSE.find((x) => x.symbol === q.symbol);
    if (!u) return [];
    const series = q.series.filter((b) => b.t <= t);
    const price = series.at(-1)?.px ?? q.price;
    if (!price) return [];
    const mean = sma(
      series.map((b) => b.px),
      20,
    );
    return [
      {
        symbol: q.symbol,
        price,
        changePct: changePct(price, q.prevClose || q.open || price),
        vsSma: mean ? ((price - mean) / mean) * 100 : 0,
        vol: u.vol,
      },
    ];
  });
}

function assetsFromViews(views: TickerView[]): Record<string, MarketAsset> {
  const out: Record<string, MarketAsset> = {};
  for (const v of views) {
    const u = UNIVERSE.find((x) => x.symbol === v.symbol);
    if (!u) continue;
    out[v.symbol] = {
      symbol: v.symbol,
      name: u.name,
      price: v.price,
      open: v.price,
      high: v.price,
      low: v.price,
      series: [{ t: 1, px: v.price }],
      vol: u.vol,
      beta: u.beta,
      livePx: null,
      liveCoin: null,
      spotPx: null,
      tape: "yahoo",
    };
  }
  return out;
}

export function autopilotOnce(book: DeskBook, views: TickerView[], now: number): DeskBook {
  if (!book.autopilot) return { ...book, lastTickAt: now };
  if (now - book.lastAutoAt < 55_000) return { ...book, lastTickAt: now };
  const ticket = book.proposal ?? book.lastCouncil?.order ?? null;
  if (!ticket) return { ...book, lastTickAt: now };
  const row = views.find((t) => t.symbol === ticket.symbol);
  if (!row || !(row.price > 0)) return { ...book, lastTickAt: now };
  const existing = book.positions.find((p) => p.symbol === ticket.symbol);
  const open = existing && Math.abs(existing.qty) > 1e-8;
  if (open && existing.teamLock) return { ...book, lastAutoAt: now, lastTickAt: now };
  const reducing =
    open && ((existing.qty > 0 && ticket.side === "sell") || (existing.qty < 0 && ticket.side === "buy"));
  if (open && !reducing) return { ...book, lastAutoAt: now, lastTickAt: now };
  const note = reducing ? "close.contrary" : ticket.rationale;
  const assets = assetsFromViews(views);
  const price = row.price;
  const filled = commitFill(
    { ...book, lastAutoAt: now, lastTickAt: now },
    {
      symbol: ticket.symbol,
      side: ticket.side,
      qty: ticket.qty,
      price,
      source: "council",
      note,
      ts: now,
      assets,
    },
  );
  if (!filled.ok) return { ...book, lastAutoAt: now, lastTickAt: now };
  const who = proposerFrom(book.lastCouncil, ticket.symbol, ticket.side);
  if (!who) return filled.book;
  return {
    ...filled.book,
    agentCalls: [
      openCall({
        id: `c-${now.toString(36)}-${filled.book.fillSeq.toString(36)}`,
        ts: now,
        agentId: who,
        symbol: ticket.symbol,
        side: ticket.side,
        entry: price,
        qty: ticket.qty,
        fillId: filled.fill.id,
      }),
      ...(filled.book.agentCalls ?? []),
    ].slice(0, 80),
  };
}

export function catchUpBook(book: DeskBook, quotes: LiveQuote[], now: number): DeskBook {
  book = withLiveProposal(book, now);
  if (!quotes.length) return { ...book, lastTickAt: now };
  book = expireStops(book, quotes, now);
  book = expireHolds(book, quotes, now);
  book = fillWorking(book, quotes, now);
  if (!book.autopilot) return { ...book, lastTickAt: now };
  const since = Math.max(book.lastTickAt, book.lastAutoAt, 0);
  if (!since) return autopilotOnce(book, viewsAt(quotes, now), now);
  const elapsed = now - since;
  if (elapsed < 55_000) return autopilotOnce(book, viewsAt(quotes, now), now);

  const stamps = new Set<number>();
  for (const q of quotes) for (const b of q.series) if (b.t > since && b.t <= now) stamps.add(b.t);
  const times = [...stamps].sort((a, b) => a - b);
  const maxSteps = 16;
  const step = Math.max(1, Math.ceil(times.length / maxSteps));
  const picked = times.filter((_, i) => i % step === 0).slice(0, maxSteps);
  if (!picked.length) picked.push(now);

  let next = book;
  const beforeFills = book.fills.length;
  for (const t of picked) {
    next = autopilotOnce(next, viewsAt(quotes, t), t);
  }
  next = { ...next, lastTickAt: now };
  const away = elapsed >= 180_000;
  if (!away) return next;
  const added = next.fills.length - beforeFills;
  if (added > 0) {
    next = speak(next, {
      kind: "system",
      ts: now,
      text: t("tape.awayFills", { n: added }, book.locale),
    });
  } else {
    next = speak(next, {
      kind: "system",
      ts: now,
      text: t("tape.awayQuiet", undefined, book.locale),
    });
  }
  return next;
}

export function bookLooksLive(book: DeskBook | null | undefined) {
  if (!book) return false;
  return (
    book.fills.length > 0 ||
    book.positions.length > 0 ||
    Boolean(book.lastCouncil) ||
    Boolean(book.lastAsk)
  );
}

/** True when `a` should replace `b`. Empty never beats a live book. Reset wins via deskEpoch. */
export function preferBook(a: DeskBook, b: DeskBook) {
  const ae = a.deskEpoch ?? 0;
  const be = b.deskEpoch ?? 0;
  if (ae !== be) return ae > be;
  const aLive = bookLooksLive(a);
  const bLive = bookLooksLive(b);
  if (aLive && !bLive) return true;
  if (!aLive && bLive) return false;
  if (a.fills.length !== b.fills.length) return a.fills.length > b.fills.length;
  if (a.positions.length !== b.positions.length) return a.positions.length > b.positions.length;
  if (a.fillSeq !== b.fillSeq) return a.fillSeq > b.fillSeq;
  const aCouncil = a.lastCouncilAt ?? 0;
  const bCouncil = b.lastCouncilAt ?? 0;
  if (aCouncil !== bCouncil) return aCouncil > bCouncil;
  if (Boolean(a.proposal) !== Boolean(b.proposal)) return Boolean(a.proposal);
  return a.lastTickAt >= b.lastTickAt;
}

export function pickBook(a: DeskBook | null, b: DeskBook | null): DeskBook | null {
  if (!a) return b;
  if (!b) return a;
  return preferBook(a, b) ? a : b;
}

export function bookSame(a: DeskBook, b: DeskBook) {
  if (a.cash !== b.cash || a.autopilot !== b.autopilot || a.deskEpoch !== b.deskEpoch) return false;
  if (a.positions.length !== b.positions.length || a.fills.length !== b.fills.length) return false;
  if (a.fillSeq !== b.fillSeq) return false;
  if ((a.lastCouncilAt ?? 0) !== (b.lastCouncilAt ?? 0)) return false;
  if ((a.proposal?.symbol ?? "") !== (b.proposal?.symbol ?? "")) return false;
  if ((a.proposal?.side ?? "") !== (b.proposal?.side ?? "")) return false;
  for (let i = 0; i < a.positions.length; i++) {
    const x = a.positions[i]!;
    const y = b.positions[i]!;
    if (x.symbol !== y.symbol || x.qty !== y.qty || x.avg !== y.avg) return false;
  }
  return true;
}

export function isGhostAutopilotFill(fill: Fill): boolean {
  if (fill.source !== "autopilot") return false;
  const note = fill.note ?? "";
  return /one probe, no add|desk stayed live/i.test(note);
}

/** Drop leftover independent-autopilot probes (pre-council) and unwind cash/qty. */
export function scrubGhostAutopilot(book: DeskBook): DeskBook {
  const ghosts = book.fills.filter(isGhostAutopilotFill);
  if (!ghosts.length) return book;
  let cash = book.cash;
  let positions = book.positions.map((p) => ({ ...p }));
  for (const fill of ghosts) {
    const signed = fill.side === "buy" ? fill.qty : -fill.qty;
    cash += Math.abs(signed) * fill.price;
    const i = positions.findIndex((p) => p.symbol === fill.symbol);
    if (i < 0) continue;
    const pos = positions[i]!;
    const qty = pos.qty - signed;
    if (Math.abs(qty) < 1e-6) positions = positions.filter((_, j) => j !== i);
    else positions[i] = { ...pos, qty };
  }
  const ghostSym = new Set(ghosts.map((g) => g.symbol));
  const tape = book.tape.filter((row) => {
    if (row.kind === "fill" && row.symbol && ghostSym.has(row.symbol) && /Autopilot/i.test(row.text)) {
      return false;
    }
    if (/stary, samodzielny fill autopilota|leftover independent autopilot/i.test(row.text)) return false;
    if (/Autopilot · (one probe, no add|desk stayed live)/i.test(row.text)) return false;
    return true;
  });
  return { ...book, cash, positions, fills: book.fills.filter((f) => !isGhostAutopilotFill(f)), tape };
}

",{},{"_249":2840,"_256":2870,"_54":2871,"_260":2872,"_262":263,"_264":14,"_265":266,"_267":2873,"_269":2302},"cd2418c6-dc34-4e37-b286-31ec016d5a75",[2826],{"_582":583,"_267":2880},1789296932.672681,{"_577":620,"_667":668,"_578":2851},{"_273":2874,"_275":34,"_276":2875,"_278":2876,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2877,"_300":2055,"_592":615,"_618":2878,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2879},[],[],"2719116f-e458-44c7-8749-392cb5b3c1aa",[620],[666],{},{"_249":2868,"_256":2884,"_54":2885,"_56":2886,"_260":2887,"_262":263,"_265":266,"_267":2888,"_269":270},"e5d00c18-e3e0-438c-80c9-3ca325732569",[2840],{"_582":648,"_649":2302,"_267":2907},1789296931.2046258,1789296932.4457452,{"_577":2364,"_578":2906},{"_275":34,"_2321":2889,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2882,"_300":2055,"_592":615,"_618":2890,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2891,"_2328":2885,"_56":2886,"_620":2892,"_2330":2886,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2893,"_2337":2894,"_2339":-5},[620],"f53f2277-d2ae-4091-bc8b-ce2fe69a8187","for n in ['ziggywizzair-main/src/lib/agents/personas.ts','ziggywizzair-main/src/lib/agents/pipeline.ts','ziggywizzair-main/src/lib/agents/quorum.ts','ziggywizzair-main/src/lib/agents/reflect.ts','ziggywizzair-main/src/lib/agents/scorecard.ts']:
 print("\
###",n,"\
",text[n])
",[2904],[2895,2896,2897],{"_2344":262,"_2345":2902,"_260":2903},{"_2344":2359,"_2345":2901},{"_2344":262,"_2345":2898,"_260":2899},{"_2350":2900,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_13",{"_2350":2900,"_2352":2353},{"_2350":2900,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2905,"_2413":2405,"_2414":2415,"_578":2906},1789296932.251283,"
### ziggywizzair-main/src/lib/agents/personas.ts 
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
    mandate: "Rank 1–3 names on 15m expansion. Soft score, not a hard AND.",
    mark: "V",
  },
  {
    id: "ash",
    name: "Ash",
    role: "Mean reversion",
    mandate: "Rank 1–3 fades on 15m extremes. Soft score.",
    mark: "A",
  },
  {
    id: "kai",
    name: "Kai",
    role: "Setup",
    mandate: "15m/1h/4h: ready limit, wait-limit, or veto chase/thin. Does not veto direction.",
    mark: "K",
  },
  {
    id: "damian",
    name: "Damian Kaczmarski",
    role: "Sentiment",
    mandate: "Sector bias only — stocks, crypto, metals, dollar, vol. Daily crypto market cap. No RSI, no ticker vote.",
    mark: "D",
  },
  {
    id: "iris",
    name: "Iris",
    role: "Risk chair",
    mandate: "Sizes 2–6% from Damian's weather. Two legs + one wait-limit. Fees ≤ 5% round-trip.",
    mark: "I",
  },
];

export const AGENT_BY_ID: Record<AgentId, AgentPersona> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a]),
) as Record<AgentId, AgentPersona>;

export function agentShort(id: AgentId) {
  return AGENT_BY_ID[id].name.split(" ")[0] ?? AGENT_BY_ID[id].name;
}


### ziggywizzair-main/src/lib/agents/pipeline.ts 
 import type { SentimentReport, TickerSnapshot } from "@/lib/types";
import { sectorOf, type DeskSector } from "@/lib/market/universe";
import { markOf } from "@/lib/desk/size";

export const LEAN_SCORE = 42;
export const ACT_SCORE = 62;
export const MAX_OPEN_LEGS = 2;
export const MAX_SCOUT_NAMES = 3;

export type ScoutId = "vesper" | "ash";
export type KaiKind = "ready" | "wait" | "thin" | "chase" | "none";

export type Idea = {
  scout: ScoutId;
  symbol: string;
  side: "buy" | "sell";
  score: number;
  cut?: boolean;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Damian filters a class, not the whole tape. Bearish crypto does not silence gold. */
export function sectorWeight(sentiment: SentimentReport | undefined, symbol: string): number {
  const id: DeskSector = sectorOf(symbol);
  const row = sentiment?.sectors.find((s) => s.id === id);
  if (!row) return 0.85;
  if (row.stance === "bullish") return 1;
  if (row.stance === "bearish") return 0.42;
  return 0.85;
}

function rvolBoost(t: TickerSnapshot): number {
  if (t.rvol == null) return 4;
  if (t.rvol >= 0.9) return 16;
  if (t.rvol >= 0.7) return 12;
  if (t.rvol >= 0.55) return 7;
  return 0;
}

export function vesperLongScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(t.changePct / 0.7, 0, 1) * 38;
  s += clamp(t.vsSma / 0.5, 0, 1) * 24;
  if (t.rsi >= 48 && t.rsi < 78) s += 22;
  else if (t.rsi >= 44 && t.rsi < 82) s += 10;
  s += rvolBoost(t);
  return s;
}

export function vesperShortScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(-t.changePct / 0.7, 0, 1) * 38;
  s += clamp(-t.vsSma / 0.5, 0, 1) * 24;
  if (t.rsi <= 52 && t.rsi > 22) s += 22;
  else if (t.rsi <= 56 && t.rsi > 18) s += 10;
  s += rvolBoost(t);
  return s;
}

export function ashBuyScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(-t.vsSma / 1.0, 0, 1) * 40;
  s += clamp((48 - t.rsi) / 18, 0, 1) * 28;
  if (t.changePct < -0.15) s += 14;
  s += rvolBoost(t) * 0.6;
  return s;
}

export function ashSellScore(t: TickerSnapshot): number {
  let s = 0;
  s += clamp(t.vsSma / 1.0, 0, 1) * 40;
  s += clamp((t.rsi - 55) / 18, 0, 1) * 28;
  if (t.changePct > 0.15) s += 14;
  s += rvolBoost(t) * 0.6;
  return s;
}

function uniqueTop(ideas: Idea[], n: number): Idea[] {
  const seen = new Set<string>();
  const out: Idea[] = [];
  for (const idea of ideas.sort((a, b) => b.score - a.score)) {
    if (idea.score < LEAN_SCORE) continue;
    if (seen.has(idea.symbol)) continue;
    seen.add(idea.symbol);
    out.push(idea);
    if (out.length >= n) break;
  }
  return out;
}

export function vesperRank(tickers: TickerSnapshot[], sentiment: SentimentReport | undefined): Idea[] {
  const ideas: Idea[] = [];
  for (const t of tickers) {
    const w = sectorWeight(sentiment, t.symbol);
    const long = vesperLongScore(t) * w;
    const short = vesperShortScore(t) * w;
    if (long >= short && long >= LEAN_SCORE) {
      ideas.push({ scout: "vesper", symbol: t.symbol, side: "buy", score: long });
    } else if (short >= LEAN_SCORE) {
      ideas.push({ scout: "vesper", symbol: t.symbol, side: "sell", score: short });
    }
  }
  return uniqueTop(ideas, MAX_SCOUT_NAMES);
}

export function ashRank(tickers: TickerSnapshot[], sentiment: SentimentReport | undefined): Idea[] {
  const ideas: Idea[] = [];
  for (const t of tickers) {
    const w = sectorWeight(sentiment, t.symbol);
    const buy = ashBuyScore(t) * w;
    const sell = ashSellScore(t) * w;
    if (buy >= sell && buy >= LEAN_SCORE) {
      ideas.push({ scout: "ash", symbol: t.symbol, side: "buy", score: buy });
    } else if (sell >= LEAN_SCORE) {
      ideas.push({ scout: "ash", symbol: t.symbol, side: "sell", score: sell });
    }
  }
  return uniqueTop(ideas, MAX_SCOUT_NAMES);
}

export function kaiKind(tk: TickerSnapshot, side: "buy" | "sell"): KaiKind {
  if (tk.rvol != null && tk.rvol < 0.55) return "thin";
  const setup = side === "buy" ? tk.buySetup : tk.sellSetup;
  if (setup === "chase") return "chase";
  const limit = side === "buy" ? tk.buyLimit : tk.sellLimit;
  if (setup === "pullback" && limit && limit > 0) return "ready";
  return "wait";
}

export function kaiLimit(tk: TickerSnapshot, side: "buy" | "sell"): number | undefined {
  const ready = side === "buy" ? tk.buyLimit : tk.sellLimit;
  if (ready && ready > 0) return Number(ready.toFixed(4));
  const fvg = side === "buy" ? tk.buyFvg : tk.sellFvg;
  if (fvg) return Number(((fvg.low + fvg.high) / 2).toFixed(4));
  const px = markOf(tk);
  if (!(px > 0)) return undefined;
  return Number((side === "buy" ? px * 0.998 : px * 1.002).toFixed(4));
}

export function rankKai(ideas: Idea[], of: (sym: string) => TickerSnapshot | undefined): {
  idea: Idea;
  tk: TickerSnapshot;
  kind: KaiKind;
  limit?: number;
}[] {
  const seen = new Set<string>();
  const rows: { idea: Idea; tk: TickerSnapshot; kind: KaiKind; limit?: number }[] = [];
  for (const idea of ideas) {
    if (idea.cut) continue;
    if (seen.has(`${idea.symbol}:${idea.side}`)) continue;
    const tk = of(idea.symbol);
    if (!tk) continue;
    seen.add(`${idea.symbol}:${idea.side}`);
    const kind = kaiKind(tk, idea.side);
    rows.push({ idea, tk, kind, limit: kind === "thin" || kind === "chase" ? undefined : kaiLimit(tk, idea.side) });
  }
  const rank: Record<KaiKind, number> = { ready: 0, wait: 1, none: 2, thin: 3, chase: 4 };
  rows.sort((a, b) => rank[a.kind] - rank[b.kind] || b.idea.score - a.idea.score);
  return rows;
}

export function irisClipPct(weatherBias: number, openCount: number, adding: boolean): number {
  const base =
    weatherBias >= 0.35 ? 5.2 : weatherBias <= -0.35 ? 2.2 : 3.2;
  const legs = openCount <= 0 ? 1 : openCount === 1 ? 0.78 : 0.55;
  const pct = base * legs;
  if (adding) return Math.min(3, pct);
  return clamp(pct, 2, 6);
}


### ziggywizzair-main/src/lib/agents/quorum.ts 
 import type { CouncilResult, ProposedOrder } from "@/lib/types";
import type { MarketSnapshot } from "@/lib/types";

export function scoutVotes(agents: CouncilResult["agents"]) {
  return agents.filter((a) => (a.id === "vesper" || a.id === "ash") && a.vote !== "hold" && a.symbol);
}

export function kaiVote(agents: CouncilResult["agents"]) {
  return agents.find((a) => a.id === "kai") ?? null;
}

export function votesOn(
  agents: CouncilResult["agents"],
  symbol: string,
  side: "buy" | "sell",
) {
  return scoutVotes(agents).filter((a) => a.symbol === symbol && a.vote === side);
}

/**
 * Chain: Damian weather → Vesper/Ash rank names → Iris sizes → Kai stamps limit (ready or wait).
 * Kai does not veto direction — only chase and dead tape.
 * New risk needs a scout AND Kai on the same ticker/side. Cuts need one scout (or Kai).
 */
export function gateCouncilOrder(
  order: ProposedOrder | null,
  agents: CouncilResult["agents"],
  snap: MarketSnapshot,
): ProposedOrder | null {
  if (!order) return null;
  const scouts = votesOn(agents, order.symbol, order.side);
  const kai = kaiVote(agents);
  const kaiOk = kai?.symbol === order.symbol && kai.vote === order.side;
  const pos = snap.book.positions.find((p) => p.symbol === order.symbol);
  const open = pos && Math.abs(pos.qty) > 1e-8;
  if (open && pos.teamLock) return null;
  const reducing =
    open && ((pos.qty > 0 && order.side === "sell") || (pos.qty < 0 && order.side === "buy"));
  if (reducing) return scouts.length >= 1 || kaiOk ? order : null;
  return scouts.length >= 1 && kaiOk ? order : null;
}


### ziggywizzair-main/src/lib/agents/reflect.ts 
 import { AGENTS, type AgentId, type Vote } from "@/lib/agents/personas";
import type { Locale } from "@/lib/i18n/catalog";
import { assetLabel } from "@/lib/i18n/labels";
import type { ClosedTrade, CouncilResult } from "@/lib/types";

function L(locale: Locale, en: string, pl: string) {
  return locale === "pl" ? pl : en;
}

export function looksLikeReflection(thesis: string) {
  return /Wynik \\+|Result \\+|Nie moje odbicie|Wasn't my momentum|Nie stawiałem limitu|I didn't set a limit|To nie był mój ruch|Weather didn't fight|Pogoda nie biła|Wielkość od pogody|Size from Damian|I keep this 2–6|Zostaję przy 2/.test(
    thesis,
  );
}

/** Post-close notes — what each agent takes from this trade. Always in `locale`. */
export function reflectClosed(
  closed: ClosedTrade,
  lastCouncil: CouncilResult | null | undefined,
  locale: Locale,
): Array<{ id: AgentId; vote: Vote; thesis: string }> {
  const win = (closed.pnl ?? 0) > 0;
  const pnl =
    closed.pnlPct != null ? `${closed.pnlPct >= 0 ? "+" : ""}${closed.pnlPct.toFixed(2)}%` : "";
  const name = assetLabel(closed.symbol, locale);
  const long = closed.side !== "short";
  const fromRow = closed.agents ?? [];
  const out: Array<{ id: AgentId; vote: Vote; thesis: string }> = [];

  for (const p of AGENTS) {
    const prior =
      lastCouncil?.agents.find((a) => a.id === p.id) ?? fromRow.find((a) => a.id === p.id);
    const vote: Vote = prior?.vote ?? "hold";
    const priorSym = (prior as { symbol?: string | null } | undefined)?.symbol;
    const called = Boolean(prior && prior.vote !== "hold" && (!priorSym || priorSym === closed.symbol));
    const withUs =
      called &&
      ((long && prior!.vote === "buy") || (!long && prior!.vote === "sell"));

    if ((p.id === "vesper" || p.id === "ash" || p.id === "kai") && !called) continue;

    let thesis: string;
    if (p.id === "vesper") {
      thesis = withUs
        ? win
          ? L(locale, `${name} paid the trend. I keep riding names that still expand versus the 20-day average.`, `${name} zapłaciło za trend. Dalej jadę z tymi, które rosną względem 20-sesyjnej średniej.`)
          : L(locale, `${name} stalled on me. Next time I cut faster when the move rolls over versus the 20-day average.`, `${name} stanęło. Następnym razem szybciej zdejmę, gdy ruch się zawija względem 20-sesyjnej średniej.`)
        : L(locale, `I sat this one out — no expansion to ride.`, `Siedziałem — nie było momentum do jazdy.`);
    } else if (p.id === "ash") {
      thesis = withUs
        ? win
          ? L(locale, `The fade on ${name} worked. Extremes still mean-revert — one small ticket.`, `Odbicie na ${name} zadziałało. Skrajności wracają do średniej — jedna mała noga.`)
          : L(locale, `${name} kept going. That wasn't an extreme, it was trend. I sit out the next stretch.`, `${name} pojechało dalej. To nie była skrajność, tylko trend. Następne wyciągnięcie odpuszczam.`)
        : L(locale, `No washout to fade. I stayed out.`, `Nie było przeceny do odbicia. Zostałem z boku.`);
    } else if (p.id === "kai") {
      thesis = withUs
        ? win
          ? L(locale, `The 15m/1h/4h setup on ${name} held. An FVG on the higher timeframe or a 15m pullback plus volume was enough.`, `Setup 15m/1h/4h na ${name} się obronił. Luka FVG z wyższego interwału albo cofnięcie 15m plus wolumen wystarczyły.`)
          : L(locale, `The 15m/1h/4h setup on ${name} failed. Next time I want a cleaner higher-timeframe FVG or a deeper 15m retrace.`, `Setup 15m/1h/4h na ${name} padł. Następnym razem czystsze FVG z 1h/4h albo głębsze cofnięcie 15m.`)
        : L(locale, `No pullback and no FVG — sitting out was correct.`, `Nie było cofnięcia ani FVG — czekanie było w porządku.`);
    } else if (p.id === "damian") {
      const weather = lastCouncil?.sentiment?.summary;
      thesis = win
        ? L(locale, `${weather ? `${weather}. ` : ""}The weather didn't fight this trade.`, `${weather ? `${weather}. ` : ""}Pogoda nie biła się z tą nogą.`)
        : L(locale, `${weather ? `${weather}. ` : ""}I'll flag this sector more carefully next round.`, `${weather ? `${weather}. ` : ""}Ten sektor następnym razem oznaczę ostrożniej.`);
    } else {
      thesis = win
        ? L(locale, `Size from Damian's weather was fine. I keep this 2–6% band.`, `Wielkość od pogody Damiana była w porządku. Zostaję przy 2–6%.`)
        : L(locale, `I'll size smaller next time Damian is mixed.`, `Następnym razem mniejsza noga, gdy Damian jest mieszany.`);
    }
    out.push({ id: p.id, vote, thesis });
  }
  return out;
}

### ziggywizzair-main/src/lib/agents/scorecard.ts 
 import type { AgentId } from "@/lib/agents/personas";
import type { AgentCall, AgentRecord, CouncilResult, Side } from "@/lib/types";

export const SPECIALISTS: Array<Exclude<AgentId, "iris" | "damian">> = ["vesper", "ash", "kai"];

export function emptyRecords(): AgentRecord[] {
  return SPECIALISTS.map((id) => ({
    id,
    calls: 0,
    closed: 0,
    wins: 0,
    hitRate: null,
    avgPnl: null,
    last5: [],
    sizeMult: 1,
    trusted: true,
  }));
}

export function recordsFrom(calls: AgentCall[]): AgentRecord[] {
  const byId = new Map(emptyRecords().map((r) => [r.id, { ...r, last5: [] as AgentRecord["last5"] }]));
  for (const c of calls) {
    const row = byId.get(c.agentId);
    if (!row) continue;
    row.calls += 1;
    if (c.closedAt != null && c.pnlPct != null) {
      row.closed += 1;
      if (c.pnlPct > 0) row.wins += 1;
      row.last5.push({ symbol: c.symbol, side: c.side, pnlPct: c.pnlPct });
    }
  }
  return SPECIALISTS.map((id) => {
    const row = byId.get(id)!;
    const closedCalls = calls.filter((c) => c.agentId === id && c.pnlPct != null);
    const avgPnl =
      closedCalls.length > 0
        ? closedCalls.reduce((s, c) => s + (c.pnlPct ?? 0), 0) / closedCalls.length
        : null;
    const hitRate = row.closed >= 2 ? row.wins / row.closed : null;
    const sizeMult =
      hitRate == null ? 1 : hitRate >= 0.6 ? 1.15 : hitRate >= 0.45 ? 1 : hitRate >= 0.35 ? 0.75 : 0.55;
    return {
      ...row,
      last5: row.last5.slice(0, 5),
      avgPnl,
      hitRate,
      sizeMult,
      trusted: !(row.closed >= 4 && hitRate != null && hitRate < 0.35),
    };
  });
}

/** 3–5% clip, scaled by the specialist's recent hits. */
export function sizeFor(agentId: AgentId, recs: AgentRecord[], basePct = 3) {
  const rec = recs.find((r) => r.id === agentId);
  const mult = rec?.sizeMult ?? 1;
  return Math.max(1.5, Math.min(5, basePct * mult));
}

export function irisAllows(agentId: AgentId, recs: AgentRecord[], seconded: boolean) {
  if (seconded) return true;
  const rec = recs.find((r) => r.id === agentId);
  return rec ? rec.trusted : true;
}

export function proposerFrom(council: CouncilResult | null, symbol: string, side: Side): Exclude<AgentId, "iris"> | null {
  if (!council) return null;
  const want: "buy" | "sell" = side;
  const hit =
    council.agents.find((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote === want) ??
    council.agents
      .filter((a) => a.id !== "iris" && a.id !== "damian" && a.symbol === symbol && a.vote !== "hold")
      .sort((a, b) => b.conviction - a.conviction)[0];
  if (!hit || hit.id === "iris") return null;
  return hit.id as Exclude<AgentId, "iris">;
}

export function openCall(input: {
  id: string;
  ts: number;
  agentId: Exclude<AgentId, "iris">;
  symbol: string;
  side: Side;
  entry: number;
  qty: number;
  fillId: string;
}): AgentCall {
  return { ...input, open: true };
}

export function closeCallsFor(
  calls: AgentCall[],
  symbol: string,
  exit: number,
  now: number,
  stillOpen: boolean,
): AgentCall[] {
  if (stillOpen) return calls;
  return calls.map((c) => {
    if (!c.open || c.symbol !== symbol) return c;
    const dir = c.side === "buy" ? 1 : -1;
    const pnlPct = c.entry ? ((exit - c.entry) / c.entry) * 100 * dir : 0;
    return { ...c, open: false, closedAt: now, exit, pnlPct };
  });
}

export function markOpenCalls(
  calls: AgentCall[],
  prices: Record<string, number>,
  now: number,
): AgentCall[] {
  let changed = false;
  const next = calls.map((c) => {
    if (!c.open || c.mark1h != null) return c;
    if (now - c.ts < 60 * 60 * 1000) return c;
    const px = prices[c.symbol];
    if (!px) return c;
    changed = true;
    const dir = c.side === "buy" ? 1 : -1;
    const pnl1h = c.entry ? ((px - c.entry) / c.entry) * 100 * dir : 0;
    return { ...c, mark1h: px, pnl1h };
  });
  return changed ? next : calls;
}

export function compactScorecard(recs: AgentRecord[], calls: AgentCall[]) {
  return recs.map((r) => {
    const open = calls
      .filter((c) => c.agentId === r.id && c.open)
      .slice(0, 3)
      .map((c) => ({
        s: c.symbol,
        side: c.side,
        ageMin: Math.round((Date.now() - c.ts) / 60_000),
        pnl1h: c.pnl1h != null ? Number(c.pnl1h.toFixed(2)) : null,
      }));
    return {
      id: r.id,
      closed: r.closed,
      wins: r.wins,
      hitPct: r.hitRate != null ? Math.round(r.hitRate * 100) : null,
      sizePct: Number(sizeFor(r.id, recs).toFixed(1)),
      trusted: r.trusted,
      last5: r.last5.map((x) => ({ s: x.symbol, pnl: Number(x.pnlPct.toFixed(1)) })),
      open,
    };
  });
}

",{},{"_249":2882,"_256":2911,"_54":2912,"_260":2913,"_262":263,"_264":14,"_265":266,"_267":2914,"_269":2302},"879962a9-ee5b-4d59-a6ff-2b03f570fbd8",[2868],{"_582":583,"_267":2921},1789296929.181292,{"_577":620,"_667":668,"_578":2892},{"_273":2915,"_275":34,"_276":2916,"_278":2917,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2918,"_300":2055,"_592":615,"_618":2919,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2920},[],[],"c5b9643e-a2d8-4beb-8dd8-05e5785ccaa6",[620],[666],{},{"_249":2909,"_256":2925,"_54":2926,"_56":2927,"_260":2928,"_262":263,"_265":266,"_267":2929,"_269":270},"0999d5fa-f4ea-4dde-acbe-0015bab4a54c",[2882],{"_582":648,"_649":2302,"_267":2948},1789296927.6265275,1789296928.9469182,{"_577":2364,"_578":2947},{"_275":34,"_2321":2930,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2923,"_300":2055,"_592":615,"_618":2931,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2932,"_2328":2926,"_56":2927,"_620":2933,"_2330":2927,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2934,"_2337":2935,"_2339":-5},[620],"5b82c5fc-06b6-4ccb-8f3f-08d06ca2bbcb","for n in keynames[2:9]:
    print("\
###",n)
    print(text[n])
",[2945],[2936,2937,2938],{"_2344":262,"_2345":2943,"_260":2944},{"_2344":2359,"_2345":2942},{"_2344":262,"_2345":2939,"_260":2940},{"_2350":2941,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_12",{"_2350":2941,"_2352":2353},{"_2350":2941,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2946,"_2413":2405,"_2414":2415,"_578":2947},1789296928.7576172,"object") {
      const r = row as Record<string, unknown>;
      if (typeof r.id === "string") byId.set(r.id, r);
    }
  }
  const sectors: SectorCall[] = ids.map((id) => {
    const r = byId.get(id) ?? {};
    return {
      id,
      stance: asStance(r.stance),
      why: typeof r.why === "string" && r.why.trim() ? r.why.trim().slice(0, 80) : "—",
    };
  });
  const summary =
    typeof o.summary === "string" && o.summary.trim()
      ? o.summary.trim().slice(0, 220)
      : sectors
          .filter((s) => s.stance !== "neutral")
          .map((s) => `${s.id} ${s.stance}`)
          .join(" · ") || "Mixed.";
  return { summary, sectors };
}

function parseCouncil(raw: unknown, snap: MarketSnapshot): CouncilResult {
  const o = (raw ?? {}) as Record<string, unknown>;
  const session = (o.session ?? o) as Record<string, unknown>;
  const list = Array.isArray(o.agents) ? o.agents : [];
  const byId = new Map<string, Record<string, unknown>>();
  for (const row of list) {
    if (row && typeof row === "object") {
      const r = row as Record<string, unknown>;
      if (typeof r.id === "string") byId.set(r.id, r);
    }
  }
  const symbols = new Set(snap.tickers.map((t) => t.symbol));
  const sentiment = parseSentiment(o.sentiment) ?? parseSentiment(session.sentiment);
  const agents: CouncilResult["agents"] = AGENTS.map((id) => {
    const r = byId.get(id) ?? {};
    const symbol = typeof r.symbol === "string" && symbols.has(r.symbol) ? r.symbol : null;
    const conviction = Math.min(1, Math.max(0, Number(r.conviction) || 0));
    const sizePct = Math.min(12, Math.max(0, Number(r.sizePct) || 0));
    const thesis =
      typeof r.thesis === "string" && r.thesis.trim()
        ? r.thesis.trim().slice(0, 280)
        : id === "damian" && sentiment?.summary
          ? sentiment.summary
          : "No view this print.";
    return {
      id,
      thesis,
      vote: id === "damian" ? "hold" : asVote(r.vote),
      symbol: id === "damian" ? null : symbol,
      conviction,
      sizePct: id === "damian" ? 0 : sizePct,
    };
  });
  const orderRaw = o.order && typeof o.order === "object" ? (o.order as Record<string, unknown>) : null;
  let order: CouncilResult["order"] = null;
  if (orderRaw && (orderRaw.side === "buy" || orderRaw.side === "sell")) {
    const symbol = typeof orderRaw.symbol === "string" ? orderRaw.symbol : "";
    const t = snap.tickers.find((x) => x.symbol === symbol);
    const iris = agents.find((a) => a.id === "iris");
    const intended = iris && iris.sizePct > 0 ? iris.sizePct : Number(orderRaw.qty) > 0 ? 3 : 3;
    const px = t ? markOf(t) : 0;
    const qty = t ? qtyForClip(snap.book.equity, intended, px, symbol) : 0;
    if (t && qty > 0) {
      const actual = clipPctOf(qty, px, snap.book.equity);
      const raw =
        typeof orderRaw.rationale === "string" ? orderRaw.rationale.slice(0, 220) : "Chair synthesis.";
      const rationale = raw
        .replace(/(daje|sizes)\\s+\\d+(?:[.,]\\d+)?%/gi, `$1 ${actual.toFixed(1)}%`)
        .replace(/\\d+(?:[.,]\\d+)?%\\s+(na|on)\\s+/gi, `${actual.toFixed(1)}% $1 `);
      order = {
        side: orderRaw.side,
        symbol,
        qty,
        rationale,
        limitPx:
          Number(orderRaw.limitPx) > 0 ? Number(Number(orderRaw.limitPx).toFixed(4)) : undefined,
      };
    }
  }
  order = gateCouncilOrder(order, agents, snap);
  return {
    mood: asMood(session.mood ?? o.mood),
    summary:
      typeof session.summary === "string"
        ? session.summary.slice(0, 200)
        : typeof o.summary === "string"
          ? o.summary.slice(0, 200)
          : "Council closed without a single view.",
    agents,
    order,
    sentiment,
  };
}

async function chat(
  system: string,
  user: string,
  maxTokens: number,
  opts?: { timeoutMs?: number; json?: boolean; temperature?: number },
): Promise<string> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error("AI is not available in this environment");
  const json = opts?.json !== false;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(opts?.timeoutMs ?? 8_000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: opts?.temperature ?? (json ? 0.85 : 0.7),
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`xAI API error ${res.status}`);
  }
  const body = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return body.choices?.[0]?.message?.content ?? "";
}

function langBlock(locale: "en" | "pl", kind: "council" | "ask"): string {
  if (locale === "pl") {
    return kind === "council"
      ? "JĘZYK OBOWIĄZKOWY: session.summary, każda teza agenta, sentiment.summary i why sektorów pisz PO POLSKU, prostym językiem. Tickerów (META, BTC) nie tłumacz. Zakazany żargon: tape, wire, floor, probe, fills, heurystyki, quorum, lastCouncil, livePx, RSI, SMA20 — zamiast tego: notowania, wiadomości, rada, mała pozycja, transakcje, portfel, cena na żywo, średnia. Damian NIE głosuje na spółkę. Damian wypełnia sentiment (akcje, krypto, metale, dolar, zmienność): byczo/niedźwiedzio/brak kierunku + krótko czemu. BEZ cytowania nagłówka. Nie mów VIX/DXY — mów zmienność i dolar."
      : "JĘZYK OBOWIĄZKOWY: pole text w CAŁOŚCI PO POLSKU. Mów jak starszy kolega z biurka, nie jak terminal i nie jak czatbot. Dwa akapity, nie więcej. Żadnego zdania-hasła w osobnej linijce. Jeśli P&L koło zera: „praktycznie na zero”, nigdy „+0,0%”. Tickerów nie tłumacz. Zakazany żargon (tape, clip, rvol, RSI, SMA, livePx, quorum). Wolno jedną cenę albo jeden procent jako kolor. Zero angielskich sloganów.";
  }
  return "LANGUAGE: English. Keep ticker symbols as-is.";
}

function clipText(v: unknown, n: number) {
  return typeof v === "string" ? v.slice(0, n) : "";
}

function compactSnap(snap: MarketSnapshot) {
  return {
    tickers: (snap.tickers ?? []).slice(0, 12).map((t) => ({
      s: t.symbol,
      px: Number(t.price.toFixed(2)),
      livePx: t.livePx != null ? Number(t.livePx.toFixed(4)) : null,
      chg: Number(t.changePct.toFixed(2)),
      rsi: Number(t.rsi.toFixed(1)),
      vsSma: Number(t.vsSma.toFixed(2)),
      buySetup: t.buySetup ?? "none",
      buyLimit: t.buyLimit != null ? Number(t.buyLimit.toFixed(4)) : null,
      buyRetrace: t.buyRetrace ?? null,
      buyFvg: t.buyFvg ? [Number(t.buyFvg.low.toFixed(2)), Number(t.buyFvg.high.toFixed(2))] : null,
      buyWick: t.buyWick ?? false,
      buyTf: t.buyTf ?? null,
      sellSetup: t.sellSetup ?? "none",
      sellLimit: t.sellLimit != null ? Number(t.sellLimit.toFixed(4)) : null,
      sellRetrace: t.sellRetrace ?? null,
      sellFvg: t.sellFvg ? [Number(t.sellFvg.low.toFixed(2)), Number(t.sellFvg.high.toFixed(2))] : null,
      sellWick: t.sellWick ?? false,
      sellTf: t.sellTf ?? null,
      rvol: t.rvol != null ? Number(t.rvol.toFixed(2)) : null,
      session: t.session ?? null,
    })),
    book: {
      cash: Math.round(snap.book.cash),
      equity: Math.round(snap.book.equity),
      dayPnlPct: Number(snap.book.dayPnlPct.toFixed(2)),
      positions: (snap.book.positions ?? []).slice(0, 16).map((p) => ({
        s: p.symbol,
        qty: Number(p.qty.toFixed(4)),
        pnlPct: Number((p.pnlPct ?? 0).toFixed(2)),
        lock: Boolean(p.teamLock),
      })),
      working: snap.book.working
        ? { s: snap.book.working.symbol, side: snap.book.working.side, limitPx: snap.book.working.limitPx ?? null }
        : null,
    },
    wire: (snap.headlines ?? []).slice(0, 6).map((h) => ({
      t: clipText(h.text, 160),
      s: h.symbol ?? null,
    })),
    macro: snap.macro
      ? {
          vol: snap.macro.vix,
          volChg: snap.macro.vixChg,
          dollar: snap.macro.dxy,
          dollarChg: snap.macro.dxyChg,
          cryptoMcap: snap.macro.cryptoMcap,
          cryptoMcapPct: snap.macro.cryptoMcapPct,
          stocksPct: snap.macro.equityPct,
        }
      : null,
    scorecard: (snap.scorecard ?? []).slice(0, 12),
  };
}

function tooBig(payload: unknown) {
  try {
    return JSON.stringify(payload).length > 24_000;
  } catch {
    return true;
  }
}

export async function runCouncilSession(data: {
  snap: MarketSnapshot;
  last?: CouncilResult | null;
  selected?: string;
  locale?: "en" | "pl";
}): Promise<{ ok: true; result: CouncilResult } | { ok: false; error: string }> {
  try {
    const snap = data.snap;
    const last = data.last;
    const locale = data.locale === "pl" ? "pl" : "en";
    const compact = {
      lookingAt: data.selected ?? null,
      ...compactSnap(snap),
      lastSession: last
        ? {
            summary: clipText(last.summary, 240),
            mood: last.mood,
            order: last.order
              ? { side: last.order.side, symbol: last.order.symbol, rationale: clipText(last.order.rationale, 180) }
              : null,
            votes: (last.agents ?? []).slice(0, 6).map((a) => ({
              id: a.id,
              vote: a.vote,
              symbol: a.symbol,
            })),
            damianSaid: clipText(last.sentiment?.summary ?? last.agents.find((a) => a.id === "damian")?.thesis, 180) || null,
          }
        : null,
    };
    if (tooBig(compact)) return { ok: false, error: "Council payload too large." };
    const system = `${langBlock(locale, "council")}

You chair ZiggyWizzAir, a five-agent paper desk. The market tab chart is Hyperliquid 1m for the trader's eye. Agents NEVER analyse 1m — that is noise.
Agents (do NOT write job titles like scout, executor, chain, zwiadowca, egzekutor, pieczęć, last in the chain — those are fixed):
- vesper: momentum. Cite changePct, RSI 15m, vsSma 15m, rvol 15m. Rank 1–3 names with a 0–100 score (lean ≥42, act ≥62). No hard AND of thresholds. Cuts stalls.
- ash: mean reversion. Cite vsSma 15m, RSI 15m, changePct. Rank 1–3 fades (wash longs / stretch shorts) with the same score bands. They do not vote Vesper down.
- kai: setup on a name already picked. Reads 15m, 1h, 4h only. Ready = tagging FVG or 15m pullback 18–62% → set limitPx. If direction is good but no tag yet, WAIT-LIMIT (limit a tick into the gap / 0.2% from mark) — do NOT hold. Hard veto only: chase (last 12% of the TF range) or rvol 15m < 0.55. Cite TF, retrace%, FVG, rvol, limit.
- damian: NOT TA. Sector weather only (equities, crypto, metals, dollar, vol). Always cite daily crypto market cap in $ and % (cryptoMcap / cryptoMcapPct). No ticker vote. His weather FILTERS a class (bearish crypto does not silence gold).
- iris: PM. Sizes 2–6% from Damian's weather and open count (0 legs full, 1 leg ~¾, 2 legs no new). HARD RULE: round-trip fees ≤ 5%. Max TWO filled legs plus ONE resting limit. Max TWO adds/day on a pullback. New entries need Vesper or Ash on direction AND Kai ready-or-wait (not a veto). Cite size% and cash%. lock:true on a position = the user owns it — never close or add.
Rules:
- SIZE qty from livePx. Charts on screen are 1m; your numbers are 15m/1h/4h.
- thesis MUST cite TF + numbers (RSI 15m, vs SMA20 15m, rvol 15m, retrace on that TF, FVG high/low). Never role talk.
- Skip dead tape (rvol 15m < 0.55) as a Kai veto, not a silent hold on the whole desk.
- order.limitPx required for new entries (ready or wait). Cuts omit limitPx.
- Never claim a real broker fill.
Return JSON only:
{"session":{"mood":"risk-on"|"cautious"|"risk-off","summary":"one sentence"},
 "agents":[{"id":"vesper"|"ash"|"kai"|"damian"|"iris","thesis":"1-2 sentences","vote":"buy"|"sell"|"hold","symbol":"TICKER"|null,"conviction":0-1,"sizePct":0-10}],
 "sentiment":{"summary":"one sentence","sectors":[{"id":"equities"|"crypto"|"metals"|"dollar"|"vol","stance":"bullish"|"bearish"|"neutral","why":"short"}]},
 "order":null|{"side":"buy"|"sell","symbol":"TICKER","qty":number,"limitPx":number|null,"rationale":"one sentence"}}
qty is share/oz count sized to sizePct of equity at livePx. Include all five agents. Only Iris fills order. Damian never fills order.`;
    const raw = extractJson(await chat(system, JSON.stringify(compact), 900));
    return { ok: true, result: parseCouncil(raw, snap) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Council failed";
    return { ok: false, error: message };
  }
}

export const conveneCouncil = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      snap: MarketSnapshot;
      last?: CouncilResult | null;
      selected?: string;
      locale?: "en" | "pl";
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const ip = await clientIp();
    if (!rateLimit(`council:${context.userId}`, 8, 10 * 60_000) || !rateLimit(`council-ip:${ip}`, 20, 10 * 60_000)) {
      return { ok: false as const, error: "Council is busy. Try again in a minute." };
    }
    return runCouncilSession(data);
  });

export const askFloor = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      question: string;
      snap: MarketSnapshot;
      selected?: string;
      lastCouncil?: CouncilResult | null;
      lastAsk?: { question: string; speaker: string; text: string; log?: Array<{ question: string; speaker: string; text: string }> } | null;
      recentFills?: Array<{ symbol: string; side: string; qty: number; price: number; note?: string; source?: string }>;
      locale?: "en" | "pl";
    }) => input,
  )
  .handler(async ({ context, data }): Promise<{ ok: true; result: AskResult } | { ok: false; error: string }> => {
    const ip = await clientIp();
    if (!rateLimit(`ask:${context.userId}`, 20, 10 * 60_000) || !rateLimit(`ask-ip:${ip}`, 40, 10 * 60_000)) {
      return { ok: false, error: "Too many questions. Give the floor a minute." };
    }
    const question = data.question.trim().slice(0, 500);
    if (!question) return { ok: false, error: "Ask something first." };
    const locale = replyLocale(data.locale, question);
    try {
      const focusSym = (() => {
        const q = question.toUpperCase();
        const hit = data.snap.tickers.find(
          (t) => q.includes(t.symbol) || q.includes(t.name.toUpperCase()),
        );
        return hit?.symbol ?? data.selected ?? null;
      })();
      const focus = data.snap.tickers.find((t) => t.symbol === focusSym) ?? null;
      const held = data.snap.book.positions.find((p) => p.symbol === focusSym) ?? null;
      const prior = [
        ...(data.lastAsk?.log ?? []),
        data.lastAsk
          ? { question: data.lastAsk.question, speaker: data.lastAsk.speaker, text: data.lastAsk.text }
          : null,
      ]
        .filter(Boolean)
        .slice(-4) as Array<{ question: string; speaker: string; text: string }>;

      const compact = {
        q: question,
        lookingAt: data.selected ?? null,
        focus: focus
          ? {
              s: focus.symbol,
              name: focus.name,
              px: Number(focus.price.toFixed(4)),
              livePx: focus.livePx != null ? Number(focus.livePx.toFixed(4)) : null,
              liveBps: focus.liveBps != null ? Number(focus.liveBps.toFixed(1)) : null,
              open: Number(focus.open.toFixed(4)),
              high: Number(focus.high.toFixed(4)),
              low: Number(focus.low.toFixed(4)),
              chg: Number(focus.changePct.toFixed(2)),
              rsi: Number(focus.rsi.toFixed(1)),
              vsSma: Number(focus.vsSma.toFixed(2)),
              held: held
                ? { qty: Number(held.qty.toFixed(4)), avg: Number(held.avg.toFixed(4)), pnlPct: Number(held.pnlPct.toFixed(2)) }
                : null,
            }
          : null,
        tape: compactSnap(data.snap).tickers,
        book: {
          cash: Math.round(data.snap.book.cash),
          equity: Math.round(data.snap.book.equity),
          dayPnlPct: Number(data.snap.book.dayPnlPct.toFixed(2)),
          positions: (data.snap.book.positions ?? []).slice(0, 16).map((p) => ({
            s: p.symbol,
            qty: Number(p.qty.toFixed(4)),
            avg: Number(p.avg.toFixed(4)),
            pnlPct: Number(p.pnlPct.toFixed(2)),
          })),
        },
        lastCouncil: data.lastCouncil
          ? {
              mood: data.lastCouncil.mood,
              summary: clipText(data.lastCouncil.summary, 240),
              votes: (data.lastCouncil.agents ?? []).slice(0, 6).map((a) => ({
                id: a.id,
                vote: a.vote,
                symbol: a.symbol,
                thesis: clipText(a.thesis, 180),
              })),
              sentiment: data.lastCouncil.sentiment ?? null,
              order: data.lastCouncil.order
                ? {
                    side: data.lastCouncil.order.side,
                    symbol: data.lastCouncil.order.symbol,
                    qty: data.lastCouncil.order.qty,
                  }
                : null,
            }
          : null,
        recentAsks: prior.map((p) => ({
          q: clipText(p.question, 200),
          speaker: p.speaker,
          a: clipText(p.text, 280),
        })),
        recentFills: (data.recentFills ?? []).slice(0, 6),
        wire: compactSnap(data.snap).wire,
        whyOpened: isWhyOpenedQuestion(question),
      };
      if (tooBig(compact)) return { ok: false, error: "Question payload too large." };

      const raw = extractJson(
        await chat(
          `${langBlock(locale, "ask")}

You are one named agent on the ZiggyWizzAir paper desk. Answer like a senior colleague on a voice note — intelligent, calm, specific. Not a chatbot. Not a telegram.

Pick the speaker whose mandate fits THIS question — not the selected ticker:
- vesper — momentum, breakouts, leaders (only if they asked about a name)
- ash — dips, fades, mean reversion (only if they asked about a name)
- kai — 15m / 1h / 4h setup, FVG, session grabs (only if they asked about a name or a session)
- damian — sentiment, sectors, dollar, vol, crypto market cap, metals, news. NOT RSI. NOT a stock they didn't name.
- iris — size, cash, close, risk, "why did we open"

If the question is about crypto market cap / krypto / kapitalizacja / dollar / vol / sectors: speaker MUST be damian, and the first paragraph MUST answer that — never talk about the selected stock.
If they did not name a ticker, do not invent one.

If whyOpened is true: explain WHY the position exists using lastCouncil votes and recentFills, in plain language.

Voice:
- TWO paragraphs, max. Never one fact per line.
- First paragraph: answer the trader, including when their read is off (e.g. they say it dumped, the open-to-now print is flat — say so, politely).
- Second: what we hold and what you would actually do.
- If P&L is ~0, say "praktycznie na zero" / "basically unchanged". Never "+0.0%".
- One price or one percent as color is fine. No indicator dumps. No slogans.
- Paper only.

Return JSON only:
{"speaker":"vesper"|"ash"|"kai"|"damian"|"iris","text":"the answer"}`,
          JSON.stringify(compact),
          900,
          { timeoutMs: 22_000, json: true },
        ),
      ) as { speaker?: unknown; text?: unknown };
      const speaker = asAgent(raw.speaker);
      const text =
        typeof raw.text === "string" && raw.text.trim() ? raw.text.trim().slice(0, 1600) : "No view.";
      if (isEnglishLeak(text, locale) || missedWhyOpened(question, text)) {
        return {
          ok: true,
          result: localAsk(question, data.snap, locale, {
            lastCouncil: data.lastCouncil,
            recentFills: data.recentFills,
          }),
        };
      }
      return { ok: true, result: { speaker, text } };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Floor is quiet" };
    }
  });

",{},{"_249":2923,"_256":2952,"_54":2953,"_260":2954,"_262":263,"_264":14,"_265":266,"_267":2955,"_269":2302},"69d979b6-8008-4b53-a841-3fc332e44ac8",[2909],{"_582":583,"_267":2962},1789296926.121499,{"_577":620,"_667":668,"_578":2933},{"_273":2956,"_275":34,"_276":2957,"_278":2958,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2959,"_300":2055,"_592":615,"_618":2960,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":2961},[],[],"dfff07a5-ca8f-4b79-9291-712a813df508",[620],[666],{},{"_249":2950,"_256":2966,"_54":2967,"_56":2968,"_260":2969,"_262":263,"_265":266,"_267":2970,"_269":270},"1521b00b-f537-4bb0-b596-8a2ba70f9d70",[2923],{"_582":648,"_649":2302,"_267":2990},1789296924.5279324,1789296925.8953397,{"_577":2364,"_578":2989},{"_275":34,"_2321":2971,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2972,"_300":2055,"_592":615,"_618":2973,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2974,"_2328":2967,"_56":2968,"_620":2975,"_2330":2968,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":2976,"_2337":2977,"_2339":-5},"5d44b40a-fa73-42e6-b12d-6c26a1f366b1",[620],"c9164c6b-affe-46a7-a97d-26668c88204b","keynames=[
'ziggywizzair-main/package.json','ziggywizzair-main/AGENTS.md',
'ziggywizzair-main/src/lib/agents/personas.ts','ziggywizzair-main/src/lib/agents/pipeline.ts',
'ziggywizzair-main/src/lib/agents/quorum.ts','ziggywizzair-main/src/lib/agents/reflect.ts',
'ziggywizzair-main/src/lib/agents/scorecard.ts','ziggywizzair-main/src/lib/agents/local-council.ts',
'ziggywizzair-main/src/lib/ai/council.ts','ziggywizzair-main/src/lib/desk/engine.ts',
'ziggywizzair-main/src/lib/market/engine.ts','ziggywizzair-main/src/lib/market/macro.ts',
'ziggywizzair-main/src/lib/market/news.ts','ziggywizzair-main/src/lib/market/quotes.ts',
'ziggywizzair-main/src/lib/market/setup.ts','ziggywizzair-main/src/lib/desk-store.ts',
'ziggywizzair-main/src/lib/types.ts','ziggywizzair-main/src/routes/index.tsx']
for n in keynames:
    print("\
###",n, "###")
    t=text.get(n)
    if t is None:
        with zipfile.ZipFile(zip_path) as z: t=z.read(n).decode()
    print(t[:12000])
",[2987],[2978,2979,2980],{"_2344":262,"_2345":2985,"_260":2986},{"_2344":2359,"_2345":2984},{"_2344":262,"_2345":2981,"_260":2982},{"_2350":2983,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_11",{"_2350":2983,"_2352":2353},{"_2350":2983,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2988,"_2413":2405,"_2414":2415,"_578":2989},1789296925.7006278,"((open0 - loW) / open0) * 100;
      const pump = ((hiW - open0) / open0) * 100;
      const closeN = window.at(-1)!.px;
      const down = dump >= pump;
      const recovered = down ? closeN > loW + (open0 - loW) * 0.28 : closeN < hiW - (hiW - open0) * 0.28;
      if (!recovered && range / typical < 1.8) continue;
      const pct = down ? dump : pump;
      if (pct < 0.12) continue;
      const hoursAgo = Math.max(0, (to - ts) / 36e5);
      const score = (range / typical) * pct * (s.name === "ny" ? 1.3 : s.name === "lon" ? 1.1 : 1) / (1 + hoursAgo * 0.04);
      if (!best || score > best.score) {
        best = { name: s.name, kind: down ? "grab-down" : "grab-up", pct, score };
      }
    }
  }
  return best ? { name: best.name, kind: best.kind, pct: best.pct } : null;
}


### ziggywizzair-main/src/lib/desk-store.ts ###
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AGENTS, type AgentId } from "@/lib/agents/personas";
import { closeCallsFor, compactScorecard, markOpenCalls, openCall, proposerFrom, recordsFrom } from "@/lib/agents/scorecard";
import {
  applyFill,
  emptyBook,
  idleAgents,
  notionalOk,
  preferBook,
  scrubGhostAutopilot,
  type DeskBook,
} from "@/lib/desk/engine";
import { addCountToday, holdExpired, isAddOn, isReduce, MAX_ADDS_PER_DAY, promisingHold, stampOpened, teamBlocks, viewOf, withTeamLocks } from "@/lib/desk/holds";
import { hlFeeUsd, type FeeKind } from "@/lib/desk/fees";
import { DEFAULT_ALERT_PREFS, normalizeAlertPrefs, type AlertPrefs } from "@/lib/desk/alert-prefs";
import { hitStop } from "@/lib/desk/stops";
import { tapeFillText } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/locale";
import { liveProposal, stampProposal } from "@/lib/desk/proposal";
import { changePct } from "@/lib/market/engine";
import { analysisSnapshot } from "@/lib/market/setup";
import { withEquityPct } from "@/lib/market/macro";
import { isQuietNews, newsKeysFrom, newsKey, newsOverlap } from "@/lib/market/news-key";
import type { LiveQuote } from "@/lib/market/quotes";
import { isLot, UNIVERSE } from "@/lib/market/universe";
import { useMarks } from "@/lib/marks-store";
import { closedFromFill, decorateClosed, equityOf, rollAnchors } from "@/lib/portfolio";
import { useTradingMode } from "@/lib/trading-mode";
import type {
  AgentSpeech,
  CouncilResult,
  Fill,
  Headline,
  LastAsk,
  MacroTape,
  MarketAsset,
  MarketSnapshot,
  Position,
  TickBar,
} from "@/lib/types";

export type FeedStatusLocal = "live" | "stale" | "idle";

function bumpLast(bars: TickBar[] | undefined, mid: number, now: number, stepMs: number, keep: number) {
  if (!bars?.length) return bars;
  const bucket = Math.floor(now / stepMs) * stepMs;
  const last = bars.at(-1)!;
  if (now - last.t < stepMs) {
    return [
      ...bars.slice(0, -1),
      {
        t: last.t,
        px: mid,
        v: last.v,
        o: last.o ?? last.px,
        h: last.h != null ? Math.max(last.h, mid) : Math.max(last.px, mid),
        l: last.l != null ? Math.min(last.l, mid) : Math.min(last.px, mid),
      },
    ];
  }
  return [...bars.slice(-(keep - 1)), { t: bucket, px: mid, o: mid, h: mid, l: mid }];
}

type DeskState = DeskBook & {
  hydrated: boolean;
  assets: Record<string, MarketAsset>;
  headlines: Headline[];
  macro: MacroTape | null;
  convening: boolean;
  asking: boolean;
  pendingAsk: string | null;
  paused: boolean;
  feed: FeedStatusLocal;
  lastFeedAt: number;
  clock: number;
};

type DeskActions = {
  markHydrated: () => void;
  applyLiveQuotes: (quotes: LiveQuote[]) => void;
  applyLiveMids: (mids: Record<string, number>) => void;
  applySymbolChart: (symbol: string, tf: "1m" | "5m" | "15m", bars: TickBar[]) => void;
  applyHeadlines: (items: Headline[]) => void;
  applyMacro: (macro: MacroTape) => void;
  setFeed: (feed: FeedStatusLocal) => void;
  select: (symbol: string) => void;
  setPaused: (paused: boolean) => void;
  setAutopilot: (on: boolean) => void;
  setConvening: (on: boolean) => void;
  setAsking: (on: boolean, question?: string) => void;
  setAgentStatus: (id: AgentId, status: AgentSpeech["status"]) => void;
  placeOrder: (input: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    source: Fill["source"];
    note?: string;
    skipRisk?: boolean;
    feeKind?: FeeKind;
    stopLoss?: number | null;
    takeProfit?: number | null;
  }) => { ok: true; fill: Fill } | { ok: false; error: string };
  closePosition: (
    symbol: string,
    qty?: number,
  ) => { ok: true; fill: Fill } | { ok: false; error: string };
  setStops: (symbol: string, stops: { stopLoss: number | null; takeProfit: number | null }) => void;
  setAlertPrefs: (prefs: AlertPrefs) => void;
  toggleTeamLock: (symbol: string) => void;
  applyCouncil: (result: CouncilResult, source: "ai" | "local", opts?: { spoken?: boolean }) => void;
  answerAsk: (question: string, result: { speaker: AgentId; text: string }, source: "ai" | "local") => void;
  executeProposal: () => { ok: true } | { ok: false; error: string };
  dismissProposal: () => void;
  tryFillWorking: () => void;
  speak: (item: { kind: "news" | "fill" | "agent" | "system"; text: string; agentId?: AgentId; symbol?: string }) => void;
  unveilAgent: (row: CouncilResult["agents"][number]) => void;
  snapshot: () => MarketSnapshot;
  hydrateBook: (book: DeskBook) => void;
  touchTick: () => void;
  reset: () => void;
  applyTimeStops: () => void;
  applyPriceStops: () => void;
};

const empty = emptyBook();

const ASK_TTL_MS = 24 * 60 * 60 * 1000;

function pruneAsk(ask: LastAsk | null | undefined, now = Date.now()): LastAsk | null {
  if (!ask) return null;
  const rows = (ask.log?.length
    ? ask.log
    : [{ question: ask.question, speaker: ask.speaker, text: ask.text, ts: ask.ts }])
    .map((r) => ({ ...r, ts: r.ts ?? 0 }))
    .filter((r) => r.ts > now - ASK_TTL_MS);
  if (!rows.length) return null;
  const last = rows[rows.length - 1]!;
  return { question: last.question, speaker: last.speaker, text: last.text, ts: last.ts, log: rows };
}

function keepAsk(incoming: LastAsk | null | undefined, current: LastAsk | null | undefined): LastAsk | null {
  const now = Date.now();
  const a = pruneAsk(incoming, now);
  const b = pruneAsk(current, now);
  const aLen = a?.log?.length ?? (a ? 1 : 0);
  const bLen = b?.log?.length ?? (b ? 1 : 0);
  if (bLen > aLen) return b;
  if (aLen > bLen) return a;
  if (b && a && (b.text?.length ?? 0) > (a.text?.length ?? 0)) return b;
  return a ?? b;
}

function speechFromCouncil(result: CouncilResult): AgentSpeech[] {
  return AGENTS.map((p) => {
    const a = result.agents.find((row) => row.id === p.id);
    if (!a) {
      return {
        id: p.id,
        status: "idle" as const,
        thesis: p.mandate,
        vote: "hold" as const,
        symbol: null,
        conviction: 0,
      };
    }
    return {
      id: a.id,
      status: "spoken" as const,
      thesis: a.thesis,
      vote: a.vote,
      symbol: a.symbol,
      conviction: a.conviction,
    };
  });
}

function uniqueNewsTape(tape: DeskBook["tape"]) {
  const seen = new Set<string>();
  const out: DeskBook["tape"] = [];
  for (const row of tape) {
    if (row.kind === "news" || row.agentId === "damian") {
      const k = newsKey(row.text);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
    }
    out.push(row);
  }
  return out.slice(0, 120);
}

export function mergeAssets(assets: Record<string, MarketAsset>) {
  const out: Record<string, MarketAsset> = {};
  for (const [k, a] of Object.entries(assets)) {
    const px = a.livePx && a.livePx > 0 ? a.livePx : a.price;
    out[k] = { ...a, price: px || a.price };
  }
  return out;
}

export function bookEquity(cash: number, positions: Position[], assets: Record<string, MarketAsset>) {
  return equityOf(cash, positions, mergeAssets(assets));
}

export function liveAssets() {
  return mergeAssets(useDesk.getState().assets);
}

export function useAssets() {
  return useDesk((s) => s.assets);
}

export function useSelectedTape() {
  return useDesk((s) => s.assets[s.selected] ?? null);
}

export function useFeed() {
  return useDesk((s) => s.feed);
}

export function useMarkedAssets() {
  const assets = useDesk((s) => s.assets);
  const marks = useMarks((s) => s.marks);
  const out: Record<string, MarketAsset> = {};
  for (const [k, a] of Object.entries(assets)) {
    const mark = marks[k];
    const px = mark || a.livePx || a.price;
    out[k] = { ...a, price: px || a.price };
  }
  return out;
}

let bootQuotes: LiveQuote[] | null = null;

export function installBootQuotes(quotes: LiveQuote[]) {
  bootQuotes = quotes;
}

export function preferServerBook(server: DeskBook, local: DeskBook) {
  return preferBook(server, local);
}

export function toDeskBook(s: DeskState): DeskBook {
  return {
    cash: s.cash,
    positions: s.positions,
    fills: s.fills,
    closedTrades: s.closedTrades,
    autopilot: s.autopilot,
    lastCouncil: s.lastCouncil,
    lastAsk: pruneAsk(s.lastAsk),
    agents: s.agents,
    startingEquity: s.startingEquity,
    periodAnchors: s.periodAnchors,
    tape: s.tape,
    proposal: s.proposal,
    working: s.working,
    selected: s.selected,
    lastAutoAt: s.lastAutoAt,
    lastTickAt: s.lastTickAt,
    fillSeq: s.fillSeq,
    clientUntil: Date.now() + 45_000,
    deskEpoch: s.deskEpoch,
    agentCalls: s.agentCalls,
    lastCouncilAt: s.lastCouncilAt,
    locale: getLocale(),
    mode: useTradingMode.getState().mode,
    alertPrefs: s.alertPrefs ?? { ...DEFAULT_ALERT_PREFS },
  };
}

export function bindDeskStorage(userId: string) {
  useDesk.persist.setOptions({ name: `zw-desk-${userId.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)}` });
}

export const useDesk = create<DeskState & DeskActions>()(
  persist(
    (set, get) => ({
      ...empty,
      hydrated: false,
      assets: {},
      headlines: [],
      macro: null,
      convening: false,
      asking: false,
      pendingAsk: null,
      paused: false,
      feed: "idle",
      lastFeedAt: 0,
      clock: Date.now(),

      markHydrated: () => set({ hydrated: true }),
      applyLiveQuotes: (quotes) => {
        const s = get();
        const first = s.lastFeedAt <= 1;
        const assets = { ...s.assets };
        const now = Date.now();
        for (const q of quotes) {
          const prev = assets[q.symbol];
          const u = UNIVERSE.find((x) => x.symbol === q.symbol);
          if (!u) continue;
          assets[q.symbol] = {
            symbol: q.symbol,
            name: u.name,
            price: q.livePx ?? q.price,
            open: q.prevClose,
            high: q.high,
            low: q.low,
            series: (q.series.length ? q.series : prev?.series ?? [{ t: now, px: q.livePx ?? q.price }]).slice(-120),
            chart5: q.chart5 && q.chart5.length >= 2 ? q.chart5.slice(-90) : prev?.chart5,
            htf:
              q.htf && (q.htf.m15?.length ?? 0) >= (prev?.htf?.m15.length ?? 0)
                ? q.htf
                : q.htf && (q.htf.m15?.length ?? 0) >= 48
                  ? q.htf
                  : prev?.htf ?? q.htf,
            vol: u.vol,
            beta: u.beta,
            livePx: q.livePx ?? prev?.livePx ?? null,
            liveCoin: q.liveCoin ?? prev?.liveCoin ?? null,
            spotPx: q.spotPx ?? prev?.spotPx ?? q.price,
            tape: q.tape ?? prev?.tape ?? "yahoo",
          };
        }
        set({
          assets,
          clock: now,
          feed: "live",
          lastFeedAt: now,
          agentCalls: markOpenCalls(
            s.agentCalls ?? [],
            Object.fromEntries(Object.entries(assets).map(([k, a]) => [k, a?.price ?? 0])),
            now,
          ),
        });
        useMarks.getState().tick(mergeAssets(assets));
        if (first) {
          const already = s.tape.some(
            (row) => row.kind === "system" && (row.text.startsWith("Live tape on") || row.text.startsWith("Ceny na żywo")),
          );
          if (!already) get().speak({ kind: "system", text: t("tape.liveOn") });
        }
        get().applyPriceStops();
        get().applyTimeStops();
        get().tryFillWorking();
      },
      applyLiveMids: (mids) => {
        const s = get();
        const assets = { ...s.assets };
        let hit = false;
        const now = Date.now();
        const selected = s.selected;
        for (const [sym, mid] of Object.entries(mids)) {
          const prev = assets[sym];
          if (!prev || !(mid > 0)) continue;
          const lastPx = prev.livePx && prev.livePx > 0 ? prev.livePx : prev.price;
          if (Math.abs(lastPx - mid) / mid < 1e-8) continue;
          hit = true;
          const last = prev.series.at(-1);
          const bucket = Math.floor(now / 60_000) * 60_000;
      

### ziggywizzair-main/src/lib/types.ts ###
import type { AgentId, Vote } from "@/lib/agents/personas";

export type Side = "buy" | "sell";

export type TickBar = {
  t: number;
  px: number;
  o?: number;
  h?: number;
  l?: number;
  v?: number;
};

export type SetupTf = "15m" | "1h" | "4h";

export type SessionName = "lon" | "ny" | "tyo" | "utc";
export type SessionPrint = {
  name: SessionName;
  kind: "grab-down" | "grab-up";
  pct: number;
};

export type HtfPack = {
  m15: TickBar[];
  h1: TickBar[];
  h4: TickBar[];
};

export type MarketAsset = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  high: number;
  low: number;
  series: TickBar[];
  /** Chart-only 5m bars (90 × 5m = 450 min). Agents ignore this. */
  chart5?: TickBar[];
  /** Higher-TF candles for agents. Charts keep `series` (1m). */
  htf?: HtfPack;
  vol: number;
  beta: number;
  /** Desk mark: Hyperliquid mid when the tape is live, else Yahoo. */
  livePx: number | null;
  liveCoin: string | null;
  /** Yahoo last print — basis vs HL (bps). */
  spotPx: number | null;
  tape: "hl" | "yahoo";
};

export type Position = {
  symbol: string;
  qty: number;
  avg: number;
  openedAt?: number;
  entryNote?: string;
  /** When true, the team cannot close or add. Manual opens default to locked. */
  teamLock?: boolean;
  /** Cumulative Hyperliquid-style fees paid while this name is open. */
  fees?: number;
  /** Absolute stop-loss price. */
  stopLoss?: number | null;
  /** Absolute take-profit price. */
  takeProfit?: number | null;
};

export type AgentCall = {
  id: string;
  ts: number;
  agentId: Exclude<AgentId, "iris">;
  symbol: string;
  side: Side;
  entry: number;
  qty: number;
  fillId: string;
  open: boolean;
  mark1h?: number;
  pnl1h?: number;
  closedAt?: number;
  exit?: number;
  pnlPct?: number;
};

export type AgentRecord = {
  id: Exclude<AgentId, "iris">;
  calls: number;
  closed: number;
  wins: number;
  hitRate: number | null;
  avgPnl: number | null;
  last5: Array<{ symbol: string; side: Side; pnlPct: number }>;
  sizeMult: number;
  trusted: boolean;
};

export type Fill = {
  id: string;
  ts: number;
  symbol: string;
  side: Side;
  qty: number;
  price: number;
  source: "manual" | "council" | "autopilot";
  note?: string;
  fee?: number;
  feeKind?: "taker" | "maker";
};

export type Headline = {
  id: string;
  ts: number;
  text: string;
  symbol?: string;
  shock: number;
};

export type TapeKind = "news" | "fill" | "agent" | "system";
export type TapeLane = "demo" | "live" | "market";

export type TapeItem = {
  id: string;
  ts: number;
  kind: TapeKind;
  text: string;
  agentId?: AgentId;
  symbol?: string;
  /** demo = paper book, live = real wallet, market = shared news/prices. Legacy rows = demo. */
  lane?: TapeLane;
};

export type AgentSpeech = {
  id: AgentId;
  status: "idle" | "reading" | "spoken";
  thesis: string;
  vote: Vote;
  symbol: string | null;
  conviction: number;
};

export type ProposedOrder = {
  side: Side;
  symbol: string;
  qty: number;
  rationale: string;
  limitPx?: number;
  proposedAt?: number;
};

export type Stance = "bullish" | "bearish" | "neutral";
export type SectorId = "equities" | "crypto" | "metals" | "dollar" | "vol";
export type SectorCall = { id: SectorId; stance: Stance; why: string };
export type SentimentReport = {
  summary: string;
  sectors: SectorCall[];
};

export type CouncilResult = {
  mood: "risk-on" | "cautious" | "risk-off";
  summary: string;
  agents: Array<{
    id: AgentId;
    thesis: string;
    vote: Vote;
    symbol: string | null;
    conviction: number;
    sizePct: number;
  }>;
  order: ProposedOrder | null;
  sentiment?: SentimentReport | null;
};

export type TickerSnapshot = {
  symbol: string;
  name: string;
  price: number;
  open: number;
  changePct: number;
  high: number;
  low: number;
  rsi: number;
  vsSma: number;
  livePx: number | null;
  liveBps: number | null;
  buySetup?: "pullback" | "chase" | "none";
  buyLimit?: number;
  sellSetup?: "pullback" | "chase" | "none";
  sellLimit?: number;
  buyRetrace?: number | null;
  sellRetrace?: number | null;
  buyFvg?: { low: number; high: number } | null;
  sellFvg?: { low: number; high: number } | null;
  buyWick?: boolean;
  sellWick?: boolean;
  buyTf?: SetupTf | null;
  sellTf?: SetupTf | null;
  /** Last bar volume vs prior average. Null when the tape has no size. */
  rvol?: number | null;
  /** Sharp print around Lon/NY/Tyo open on 15m, if any. */
  session?: SessionPrint | null;
};

export type MacroTape = {
  vix: number | null;
  vixChg: number | null;
  dxy: number | null;
  dxyChg: number | null;
  cryptoMcap: number | null;
  cryptoMcapPct: number | null;
  equityPct: number | null;
  at: number;
};

export type MarketSnapshot = {
  tickers: TickerSnapshot[];
  headlines: Array<{ text: string; symbol?: string; shock?: number }>;
  book: {
    cash: number;
    equity: number;
    dayPnlPct: number;
    positions: Array<{
      symbol: string;
      qty: number;
      avg: number;
      pnlPct: number;
      teamLock?: boolean;
    }>;
    working?: { side: Side; symbol: string; qty: number; limitPx?: number } | null;
  };
  macro?: MacroTape | null;
  scorecard?: Array<{
    id: AgentId;
    closed: number;
    wins: number;
    hitPct: number | null;
    sizePct: number;
    trusted: boolean;
    last5: Array<{ s: string; pnl: number }>;
    open: Array<{ s: string; side: string; ageMin: number; pnl1h: number | null }>;
  }>;
};

export type AskResult = {
  speaker: AgentId;
  text: string;
};

export type AskTurn = {
  question: string;
  speaker: AgentId;
  text: string;
  ts?: number;
};

export type LastAsk = AskTurn & {
  log?: AskTurn[];
};

export type ClosedTrade = {
  id: string;
  ts: number;
  symbol: string;
  pnl: number;
  side?: "long" | "short";
  qty?: number;
  entry?: number;
  exit?: number;
  openedAt?: number;
  pnlPct?: number;
  source?: Fill["source"];
  entryNote?: string;
  closeNote?: string;
  fees?: number;
  analysis?: string;
  agents?: Array<{ id: AgentId; vote: Vote; thesis: string }>;
};

export type PeriodAnchor = {
  key: string;
  equity: number;
};

export type PeriodAnchors = {
  day: PeriodAnchor;
  week: PeriodAnchor;
  month: PeriodAnchor;
  year: PeriodAnchor;
};


### ziggywizzair-main/src/routes/index.tsx ###
import { createFileRoute } from "@tanstack/react-router";
import { markBootSplash, TakeoffSplash } from "@/components/desk/brand";
import { DeskApp } from "@/components/desk/desk-app";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import type { LiveMarketResult } from "@/lib/market/quotes";

export const Route = createFileRoute("/")({
  loader: (): LiveMarketResult => ({ ok: false, error: "boot" }),
  staleTime: Infinity,
  pendingMs: Infinity,
  component: Home,
});

function Home() {
  const boot = Route.useLoaderData();
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    markBootSplash();
    return <TakeoffSplash cycle />;
  }
  if (!user) return <RedirectToSignIn />;
  return <DeskApp boot={boot} />;
}
",{},{"_249":2964,"_256":2994,"_54":2995,"_260":2996,"_262":263,"_264":14,"_265":266,"_267":2997,"_269":2302},"4533c596-abe5-4bbb-8153-89e986184feb",[2950],{"_582":583,"_267":3004},1789296921.523132,{"_577":620,"_667":668,"_578":2975},{"_273":2998,"_275":34,"_276":2999,"_278":3000,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3001,"_300":2055,"_592":615,"_618":3002,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":3003},[],[],"7fe80ebb-e7c4-4e25-b88a-cea344452847",[620],[666],{},{"_249":2992,"_256":3008,"_54":3009,"_56":3010,"_260":3011,"_262":263,"_265":266,"_267":3012,"_269":270},"825943a7-2d48-4bd0-b742-95c5cd9c65bd",[2964],{"_582":648,"_649":2302,"_267":3034},1789296920.3662035,1789296921.3062253,{"_577":2364,"_578":3018},{"_275":34,"_2321":3013,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3014,"_300":2055,"_592":615,"_618":3015,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3016,"_2328":3009,"_56":3010,"_620":3017,"_2330":3010,"_2331":3018,"_2333":-5,"_2334":-5,"_2335":3019,"_2337":3020,"_2339":-5},"d34e3640-dc07-4c08-b294-cd246089c7f1",[620],"7c37ab6b-0d6d-4271-a4e8-d3a182caa5db","src=[n for n in files if n.startswith('ziggywizzair-main/src/')]
[(n, len(text.get(n,''))) for n in src if re.search(r'(council|agent|decision|signal|analysis|desk)',n,re.I)][:100]
","[('ziggywizzair-main/src/components/desk/alerts-button.tsx', 17038),
 ('ziggywizzair-main/src/components/desk/autopilot-switch.tsx', 3858),
 ('ziggywizzair-main/src/components/desk/brand.tsx', 3239),
 ('ziggywizzair-main/src/components/desk/chart-panel.tsx', 11592),
 ('ziggywizzair-main/src/components/desk/council-panel.tsx', 20350),
 ('ziggywizzair-main/src/components/desk/desk-app.tsx', 21946),
 ('ziggywizzair-main/src/components/desk/desk-tour.tsx', 3966),
 ('ziggywizzair-main/src/components/desk/header.tsx', 9667),
 ('ziggywizzair-main/src/components/desk/history-panel.tsx', 9566),
 ('ziggywizzair-main/src/components/desk/opened-trades.tsx', 19289),
 ('ziggywizzair-main/src/components/desk/order-ticket.tsx', 11209),
 ('ziggywizzair-main/src/components/desk/password-card.tsx', 5356),
 ('ziggywizzair-main/src/components/desk/portfolio-panel.tsx', 10965),
 ('ziggywizzair-main/src/components/desk/proposal-banner.tsx', 3072),
 ('ziggywizzair-main/src/components/desk/secret-field.tsx', 975),
 ('ziggywizzair-main/src/components/desk/settings-panel.tsx', 11707),
 ('ziggywizzair-main/src/components/desk/sparkline.tsx', 4911),
 ('ziggywizzair-main/src/components/desk/stops-fields.tsx', 1912),
 ('ziggywizzair-main/src/components/desk/tape-panel.tsx', 2183),
 ('ziggywizzair-main/src/components/desk/theme-provider.tsx', 1646),
 ('ziggywizzair-main/src/components/desk/ticker-mark.tsx', 1931),
 ('ziggywizzair-main/src/components/desk/wallet-card.tsx', 10271),
 ('ziggywizzair-main/src/components/desk/watchlist.tsx', 6591),
 ('ziggywizzair-main/src/components/desk/zoom-lock.tsx', 1121),
 ('ziggywizzair-main/src/lib/agents/local-council.ts', 38208),
 ('ziggywizzair-main/src/lib/agents/personas.ts', 1407),
 ('ziggywizzair-main/src/lib/agents/pipeline.ts', 5859),
 ('ziggywizzair-main/src/lib/agents/quorum.ts', 1586),
 ('ziggywizzair-main/src/lib/agents/reflect.ts', 4547),
 ('ziggywizzair-main/src/lib/agents/scorecard.ts', 4648),
 ('ziggywizzair-main/src/lib/ai/council.ts', 21889),
 ('ziggywizzair-main/src/lib/desk-store.ts', 34930),
 ('ziggywizzair-main/src/lib/desk/alert-prefs.ts', 680),
 ('ziggywizzair-main/src/lib/desk/alerts.ts', 2632),
 ('ziggywizzair-main/src/lib/desk/away-council.test.ts', 2920),
 ('ziggywizzair-main/src/lib/desk/away-council.ts', 6464),
 ('ziggywizzair-main/src/lib/desk/book-server.ts', 1488),
 ('ziggywizzair-main/src/lib/desk/device.ts', 568),
 ('ziggywizzair-main/src/lib/desk/engine.ts', 21529),
 ('ziggywizzair-main/src/lib/desk/fees.ts', 784),
 ('ziggywizzair-main/src/lib/desk/holds.ts', 4628),
 ('ziggywizzair-main/src/lib/desk/live-book.ts', 928),
 ('ziggywizzair-main/src/lib/desk/login-handle.ts', 6896),
 ('ziggywizzair-main/src/lib/desk/password.ts', 8880),
 ('ziggywizzair-main/src/lib/desk/persist.server.ts', 11701),
 ('ziggywizzair-main/src/lib/desk/profile-server.ts', 2397),
 ('ziggywizzair-main/src/lib/desk/proposal.ts', 1128),
 ('ziggywizzair-main/src/lib/desk/push-api.ts', 1056),
 ('ziggywizzair-main/src/lib/desk/push.server.ts', 5992),
 ('ziggywizzair-main/src/lib/desk/size.ts', 911),
 ('ziggywizzair-main/src/lib/desk/stops.ts', 1014),
 ('ziggywizzair-main/src/lib/desk/tour.ts', 1028),
 ('ziggywizzair-main/src/lib/desk/vault.server.ts', 8198)]",[],[3021,3022,3023,3024],{"_2344":262,"_2345":3032,"_260":3033},{"_2344":2359,"_2345":3031},{"_2345":3028,"_2344":2355,"_260":3029},{"_2344":262,"_2345":3025,"_260":3026},{"_2350":3027,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_10",{"_2350":3027,"_2352":2353},{"_51":3030},{"_2358":3018},{"_2350":3027,"_2352":2353},{"_2350":3027,"_2352":2353},{"_2348":2363},{},{"_249":3006,"_256":3038,"_54":3039,"_260":3040,"_262":263,"_264":14,"_265":266,"_267":3041,"_269":2302},"4eff69c5-d313-431e-a5b1-12c891b07bd4",[2992],{"_582":583,"_267":3048},1789296918.847733,{"_577":620,"_667":668,"_578":3017},{"_273":3042,"_275":34,"_276":3043,"_278":3044,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3045,"_300":2055,"_592":615,"_618":3046,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":3047},[],[],"97880b33-c396-4dd0-90c4-8a434def48c9",[620],[666],{},{"_249":3036,"_256":3052,"_54":3053,"_56":3054,"_260":3055,"_262":263,"_265":266,"_267":3056,"_269":270},"0829c647-56c9-4eee-a405-9e4a0dcd3dbb",[3006],{"_582":648,"_649":2302,"_267":3078},1789296917.5119104,1789296918.6282072,{"_577":2364,"_578":3062},{"_275":34,"_2321":3057,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3058,"_300":2055,"_592":615,"_618":3059,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3060,"_2328":3053,"_56":3054,"_620":3061,"_2330":3054,"_2331":3062,"_2333":-5,"_2334":-5,"_2335":3063,"_2337":3064,"_2339":-5},"8b82170b-ea8f-4a61-af85-d6b131741da3",[620],"529108f3-4d88-4685-b2f7-7e32baac9b48","with zipfile.ZipFile(zip_path) as z:
    text={}
    for n in files:
        if n.endswith(('.ts','.tsx','.json','.md','.sql','.js','.mjs')):
            try: text[n]=z.read(n).decode('utf-8',errors='ignore')
            except: pass
hits=[]
for n,t in text.items():
    if re.search(r'\\bagent\\b|agents|decision|signal|recommendation|confidence',t,re.I):
        hits.append(n)
len(hits), hits[:100]
","(179,
 ['ziggywizzair-main/.grok/references/browser-qa.md',
  'ziggywizzair-main/.grok/references/data-and-auth.md',
  'ziggywizzair-main/.grok/references/generated-art.md',
  'ziggywizzair-main/.grok/references/hibernate-revive.md',
  'ziggywizzair-main/.grok/references/scaffold.md',
  'ziggywizzair-main/.grok/skills/auth/SKILL.md',
  'ziggywizzair-main/.grok/skills/building-games/SKILL.md',
  'ziggywizzair-main/.grok/skills/building-games/references/ai-pathfinding.md',
  'ziggywizzair-main/.grok/skills/building-games/references/genres/tower-defense.md',
  'ziggywizzair-main/.grok/skills/building-games/references/phaser.md',
  'ziggywizzair-main/.grok/skills/building-games/references/save-persistence.md',
  'ziggywizzair-main/.grok/skills/controls/SKILL.md',
  'ziggywizzair-main/.grok/skills/design-ui/SKILL.md',
  'ziggywizzair-main/.grok/skills/design-ui/references/refined-ui.md',
  'ziggywizzair-main/.grok/skills/generate2dmap/SKILL.md',
  'ziggywizzair-main/.grok/skills/generate2dmap/SOURCE.md',
  'ziggywizzair-main/.grok/skills/generate2dmap/references/map-strategies.md',
  'ziggywizzair-main/.grok/skills/generate2dmap/references/pipeline.md',
  'ziggywizzair-main/.grok/skills/generate2dsprite/SKILL.md',
  'ziggywizzair-main/.grok/skills/generate2dsprite/SOURCE.md',
  'ziggywizzair-main/.grok/skills/generate2dsprite/references/modes.md',
  'ziggywizzair-main/.grok/skills/generate2dsprite/references/prompt-rules.md',
  'ziggywizzair-main/.grok/skills/multiplayer-p2p/SKILL.md',
  'ziggywizzair-main/.grok/skills/multiplayer-p2p/references/react-binding.md',
  'ziggywizzair-main/.grok/skills/multiplayer-p2p/references/signaling-relay.md',
  'ziggywizzair-main/.grok/skills/neon/SKILL.md',
  'ziggywizzair-main/.grok/skills/og/SKILL.md',
  'ziggywizzair-main/.grok/skills/og/references/og-type-contract.md',
  'ziggywizzair-main/.grok/skills/threejs/SKILL.md',
  'ziggywizzair-main/.grok/skills/video2dsprite/SKILL.md',
  'ziggywizzair-main/.grok/skills/video2dsprite/SOURCE.md',
  'ziggywizzair-main/.grok/skills/video2dsprite/references/pipeline.md',
  'ziggywizzair-main/.grok/skills/xai-api/SKILL.md',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@better-auth/core+[...].mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@floating-ui/react-dom+[...].mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@metamask/sdk.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@tanstack/react-router+[...].mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/@tanstack/router-core+[...].mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/agent-base.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/electric-sql__pglite.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/https-proxy-agent.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/sonner.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_libs/web-push.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/alert-prefs-BDQeOj_T.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/away-council-Buqpyo2z.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/client-r2HS9zuU.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/council-5D0nLGSM.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/council-DxQ8UIeG.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/engine-C1GaS4Le.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/holds-BpglsS1V.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/hyperliquid-BlTlKL5f.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/hyperliquid-CyQ1Swyx.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/local-council-BdVu5uQG.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/macro-DaPt4VNL.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/macro-DuI9oeuv.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/news-BCja-IdZ.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/news-k_cZ5MVF.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/persist.server-Y-5m4bn4.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/quotes-BfNKKZaD.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/quotes-C__OBKBT.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/router-C6_Lgo_k.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/routes-C6F_7nwi.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/server-B2mxShfj.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/setup-Dx2LqFQi.mjs',
  'ziggywizzair-main/.vercel/output/functions/__server.func/_ssr/ssr.mjs',
  'ziggywizzair-main/.vercel/output/static/assets/client-Wm2_IesN.js',
  'ziggywizzair-main/.vercel/output/static/assets/index-emxTZetE.js',
  'ziggywizzair-main/.vercel/output/static/assets/metamask-sdk-Bzw96_-d.js',
  'ziggywizzair-main/.vercel/output/static/assets/react-DK-MTtD8.js',
  'ziggywizzair-main/.vercel/output/static/assets/routes-aQNMM5sr.js',
  'ziggywizzair-main/AGENTS.md',
  'ziggywizzair-main/data/books/6mVsdoZBY1LWpUbZTioyEowgzS8DS41x.json',
  'ziggywizzair-main/data/books/FV3wAORzlbOFFR9A1rzNOdP8nMULK3Sl.json',
  'ziggywizzair-main/data/books/OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd.json',
  'ziggywizzair-main/data/books/UedBRCusgu3IP5wfeh7fu7ZDYwhgrKmN.json',
  'ziggywizzair-main/data/books/dEcfUuDTzudm0z5lERUhrYym5J69FcMW.json',
  'ziggywizzair-main/data/books/eOLbRv1ihT5XutDbMVYjyjNnCTwCgvfG.json',
  'ziggywizzair-main/data/books/hUYYDfbPWnda3Bbw93QkBURUCJj91GAz.json',
  'ziggywizzair-main/data/books/quorum-desk-6mVsdoZBY1LWpUbZTioyEowgzS8DS41x.json',
  'ziggywizzair-main/data/books/quorum-desk-FV3wAORzlbOFFR9A1rzNOdP8nMULK3Sl.json',
  'ziggywizzair-main/data/books/quorum-desk-OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd.json',
  'ziggywizzair-main/data/books/quorum-desk-UedBRCusgu3IP5wfeh7fu7ZDYwhgrKmN.json',
  'ziggywizzair-main/data/books/quorum-desk-dEcfUuDTzudm0z5lERUhrYym5J69FcMW.json',
  'ziggywizzair-main/data/books/quorum-desk-eOLbRv1ihT5XutDbMVYjyjNnCTwCgvfG.json',
  'ziggywizzair-main/data/books/quorum-desk-hUYYDfbPWnda3Bbw93QkBURUCJj91GAz.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-FV3wAORzlbOFFR9A1rzNOdP8nMULK3Sl.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-UedBRCusgu3IP5wfeh7fu7ZDYwhgrKmN.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-dEcfUuDTzudm0z5lERUhrYym5J69FcMW.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-hUYYDfbPWnda3Bbw93QkBURUCJj91GAz.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-FV3wAORzlbOFFR9A1rzNOdP8nMULK3Sl.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-UedBRCusgu3IP5wfeh7fu7ZDYwhgrKmN.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-dEcfUuDTzudm0z5lERUhrYym5J69FcMW.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-hUYYDfbPWnda3Bbw93QkBURUCJj91GAz.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-quorum-desk-FV3wAORzlbOFFR9A1rzNOdP8nMULK3Sl.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-quorum-desk-OpDmksLmU1d5Cahs30mEW2PUF8EtzUDd.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-quorum-desk-UedBRCusgu3IP5wfeh7fu7ZDYwhgrKmN.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-quorum-desk-dEcfUuDTzudm0z5lERUhrYym5J69FcMW.json',
  'ziggywizzair-main/data/books/quorum-desk-quorum-desk-quorum-desk-quorum-desk-hUYYDfbPWnda3Bbw93QkBURUCJj91GAz.json'])",[],[3065,3066,3067,3068],{"_2344":262,"_2345":3076,"_260":3077},{"_2344":2359,"_2345":3075},{"_2345":3072,"_2344":2355,"_260":3073},{"_2344":262,"_2345":3069,"_260":3070},{"_2350":3071,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_9",{"_2350":3071,"_2352":2353},{"_51":3074},{"_2358":3062},{"_2350":3071,"_2352":2353},{"_2350":3071,"_2352":2353},{"_2348":2363},{},{"_249":3050,"_256":3082,"_54":3083,"_260":3084,"_262":263,"_264":14,"_265":266,"_267":3085,"_269":2302},"e040635c-d685-4cac-a170-da03358ba4d2",[3036],{"_582":583,"_267":3092},1789296915.503332,{"_577":620,"_667":668,"_578":3061},{"_273":3086,"_275":34,"_276":3087,"_278":3088,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3089,"_300":2055,"_592":615,"_618":3090,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":3091},[],[],"16084a2c-b269-438f-9ecd-d14539cf3422",[620],[666],{},{"_249":3080,"_256":3096,"_54":3097,"_56":3098,"_260":3099,"_262":263,"_265":266,"_267":3100,"_269":270},"bcdca879-3c31-42f4-a601-88b6fd1e445e",[3050],{"_582":648,"_649":2302,"_267":3122},1789296914.362793,1789296915.279761,{"_577":2364,"_578":3106},{"_275":34,"_2321":3101,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3102,"_300":2055,"_592":615,"_618":3103,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3104,"_2328":3097,"_56":3098,"_620":3105,"_2330":3098,"_2331":3106,"_2333":-5,"_2334":-5,"_2335":3107,"_2337":3108,"_2339":-5},"81613392-f83a-49c1-aa25-1fb380e750d1",[620],"f9011149-00d7-4257-83e8-b86543ac99e2","files=[n for n in names if not n.endswith('/') and '/node_modules/' not in n and '/.git/' not in n]
len(files), files[-50:]
","(2627,
 ['ziggywizzair-main/src/lib/desk/proposal.ts',
  'ziggywizzair-main/src/lib/desk/push-api.ts',
  'ziggywizzair-main/src/lib/desk/push.server.ts',
  'ziggywizzair-main/src/lib/desk/size.ts',
  'ziggywizzair-main/src/lib/desk/stops.ts',
  'ziggywizzair-main/src/lib/desk/tour.ts',
  'ziggywizzair-main/src/lib/desk/vault.server.ts',
  'ziggywizzair-main/src/lib/env.server.ts',
  'ziggywizzair-main/src/lib/error-component.tsx',
  'ziggywizzair-main/src/lib/format.ts',
  'ziggywizzair-main/src/lib/i18n/catalog.ts',
  'ziggywizzair-main/src/lib/i18n/hydrator.tsx',
  'ziggywizzair-main/src/lib/i18n/index.tsx',
  'ziggywizzair-main/src/lib/i18n/labels.ts',
  'ziggywizzair-main/src/lib/i18n/locale.ts',
  'ziggywizzair-main/src/lib/market/engine.ts',
  'ziggywizzair-main/src/lib/market/macro.ts',
  'ziggywizzair-main/src/lib/market/news-key.ts',
  'ziggywizzair-main/src/lib/market/news.ts',
  'ziggywizzair-main/src/lib/market/quotes.ts',
  'ziggywizzair-main/src/lib/market/rng.ts',
  'ziggywizzair-main/src/lib/market/setup.ts',
  'ziggywizzair-main/src/lib/market/universe.ts',
  'ziggywizzair-main/src/lib/marks-store.ts',
  'ziggywizzair-main/src/lib/multiplayer/index.ts',
  'ziggywizzair-main/src/lib/multiplayer/p2p.ts',
  'ziggywizzair-main/src/lib/og/site.json',
  'ziggywizzair-main/src/lib/portfolio.ts',
  'ziggywizzair-main/src/lib/preview-embedder-origin.ts',
  'ziggywizzair-main/src/lib/preview-host-bridge.ts',
  'ziggywizzair-main/src/lib/security/limit.ts',
  'ziggywizzair-main/src/lib/theme.ts',
  'ziggywizzair-main/src/lib/trading-mode.ts',
  'ziggywizzair-main/src/lib/types.ts',
  'ziggywizzair-main/src/lib/tz.ts',
  'ziggywizzair-main/src/lib/utils.ts',
  'ziggywizzair-main/src/lib/wallet/ethereum.ts',
  'ziggywizzair-main/src/lib/wallet/hyperliquid.ts',
  'ziggywizzair-main/src/lib/wallet/live-store.ts',
  'ziggywizzair-main/src/routeTree.gen.ts',
  'ziggywizzair-main/src/router.tsx',
  'ziggywizzair-main/src/routes/__root.tsx',
  'ziggywizzair-main/src/routes/api/auth/$.ts',
  'ziggywizzair-main/src/routes/index.tsx',
  'ziggywizzair-main/src/routes/login.tsx',
  'ziggywizzair-main/src/styles.css',
  'ziggywizzair-main/src/web-push.d.ts',
  'ziggywizzair-main/startup.sh',
  'ziggywizzair-main/tsconfig.json',
  'ziggywizzair-main/vite.config.ts'])",[],[3109,3110,3111,3112],{"_2344":262,"_2345":3120,"_260":3121},{"_2344":2359,"_2345":3119},{"_2345":3116,"_2344":2355,"_260":3117},{"_2344":262,"_2345":3113,"_260":3114},{"_2350":3115,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_8",{"_2350":3115,"_2352":2353},{"_51":3118},{"_2358":3106},{"_2350":3115,"_2352":2353},{"_2350":3115,"_2352":2353},{"_2348":2363},{},{"_249":3094,"_256":3125,"_54":3126,"_260":3127,"_262":263,"_264":14,"_265":266,"_267":3128,"_269":2302},[3080],{"_582":583,"_267":3135},1789296912.9442,{"_577":620,"_667":668,"_578":3105},{"_273":3129,"_275":34,"_276":3130,"_278":3131,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3132,"_300":2055,"_592":615,"_618":3133,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":3134},[],[],"d6fb06ef-8cae-4cf8-9d1a-250575d18da6",[620],[666],{},{"_249":2571,"_256":3139,"_54":3140,"_56":3141,"_260":3142,"_262":263,"_265":266,"_267":3143,"_269":270},"27fecd9b-6bfc-4a78-a096-cb335dd4c08d",[3094],{"_582":648,"_649":2302,"_267":3165},1789296911.7731829,1789296912.7331436,{"_577":2364,"_578":3149},{"_275":34,"_2321":3144,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3145,"_300":2055,"_702":-5,"_703":-5,"_592":615,"_618":3146,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3147,"_2328":3140,"_56":3141,"_620":3148,"_2330":3141,"_2331":3149,"_2333":-5,"_2334":-5,"_2335":3150,"_2337":3151,"_2339":-5},"4be4861f-8d42-41d3-ab6a-7cb2825fb337",[620],"10608f15-e9c9-47a4-b0f4-7ff670737bcd","import zipfile, os, json, re, textwrap, pathlib, collections
zip_path="/mnt/data/ziggywizzair-main.zip"
with zipfile.ZipFile(zip_path) as z:
    names=z.namelist()
len(names), names[:30]
","(2741,
 ['ziggywizzair-main/',
  'ziggywizzair-main/.gitignore',
  'ziggywizzair-main/.grok/',
  'ziggywizzair-main/.grok/app-env.json',
  'ziggywizzair-main/.grok/preview.log',
  'ziggywizzair-main/.grok/references/',
  'ziggywizzair-main/.grok/references/browser-qa.md',
  'ziggywizzair-main/.grok/references/data-and-auth.md',
  'ziggywizzair-main/.grok/references/deploy-target.md',
  'ziggywizzair-main/.grok/references/generated-art.md',
  'ziggywizzair-main/.grok/references/hibernate-revive.md',
  'ziggywizzair-main/.grok/references/scaffold.md',
  'ziggywizzair-main/.grok/skills/',
  'ziggywizzair-main/.grok/skills/auth/',
  'ziggywizzair-main/.grok/skills/auth/SKILL.md',
  'ziggywizzair-main/.grok/skills/auth/references/',
  'ziggywizzair-main/.grok/skills/auth/references/grok-identity.md',
  'ziggywizzair-main/.grok/skills/auth/references/per-user-data.md',
  'ziggywizzair-main/.grok/skills/auth/references/prewired-and-env.md',
  'ziggywizzair-main/.grok/skills/auth/references/session-ui.md',
  'ziggywizzair-main/.grok/skills/auth/references/sign-in-methods.md',
  'ziggywizzair-main/.grok/skills/auth/references/wiring.md',
  'ziggywizzair-main/.grok/skills/building-games/',
  'ziggywizzair-main/.grok/skills/building-games/SKILL.md',
  'ziggywizzair-main/.grok/skills/building-games/references/',
  'ziggywizzair-main/.grok/skills/building-games/references/3d-libs.md',
  'ziggywizzair-main/.grok/skills/building-games/references/ai-pathfinding.md',
  'ziggywizzair-main/.grok/skills/building-games/references/audio.md',
  'ziggywizzair-main/.grok/skills/building-games/references/babylon.md',
  'ziggywizzair-main/.grok/skills/building-games/references/collision-physics.md'])",[],[3152,3153,3154,3155],{"_2344":262,"_2345":3163,"_260":3164},{"_2344":2359,"_2345":3162},{"_2345":3159,"_2344":2355,"_260":3160},{"_2344":262,"_2345":3156,"_260":3157},{"_2350":3158,"_2352":2353},{"_2348":2349},"f2784d97-30f9ba7a2af0eb80a91a0460_223_7",{"_2350":3158,"_2352":2353},{"_51":3161},{"_2358":3149},{"_2350":3158,"_2352":2353},{"_2350":3158,"_2352":2353},{"_2348":2363},{},{"_249":3137,"_256":3168,"_54":3169,"_260":3170,"_262":1973,"_264":14,"_265":266,"_267":3171,"_269":270},[2571],{"_582":583,"_267":3176},1789296907.194413,{"_577":625,"_625":3172,"_627":3173},{"_592":615,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_299":2570,"_300":2055,"_302":10,"_298":14},[3174],"6ef6dccd-68e3-4f58-8b7c-add34b8c18cb",{"_630":632,"_260":632,"_633":3175,"_635":34},[],{},{"_249":2570,"_256":3180,"_54":3181,"_260":3182,"_262":263,"_264":14,"_265":266,"_267":3183,"_269":2302},"a2b3a578-4be9-4ea0-b38a-5e13a95c51ac",[3137],{"_582":583,"_267":3192},1789296901.399329,{"_577":620,"_667":668,"_578":3148},{"_273":3184,"_275":34,"_276":3185,"_278":3186,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3187,"_300":2055,"_702":3188,"_703":3189,"_592":615,"_618":3190,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":3191},[],[],"4672078d-d505-4078-a793-45e67b9734d5",[3189],"Analizowanie zawartości archiwum ZIP",[620],[666],{},{"_249":3178,"_256":3196,"_54":3197,"_260":3198,"_262":263,"_265":266,"_267":3199,"_269":270},"7b1a4cd1-d0ce-46ae-b7c0-ada006ad97eb",[2570],{"_582":773,"_267":3202},1789296901.122709,{"_577":578,"_579":3201},{"_771":34,"_300":3200,"_282":109,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3194,"_302":10,"_298":14},"6553c282-edd7-4c56-b26f-57725bfe4287",[632],{},{"_249":3194,"_256":3206,"_54":3207,"_56":3208,"_260":3209,"_262":263,"_265":266,"_267":3210,"_269":270},"8a0c16df-3e01-4ae6-9c84-213dcbab11d5",[3178],{"_582":825,"_267":3228},1789296901.218,1789297038.186579,{"_577":578,"_579":3226},{"_3211":3212,"_2032":3213,"_290":2053,"_822":-5,"_294":2054,"_296":2054,"_300":3200,"_302":10,"_298":14},"attachments",[3215],{"_2034":3214},[],{"_249":3216,"_3217":3218,"_649":3219,"_3220":3221,"_2060":3222,"_3223":3224,"_3225":14},"file_0000000075dc8246a66a7663f4d57a9f","size",35274133,"ziggywizzair-main.zip","mime_type","application/zip","local","library_file_id","libfile_8c4de19213888191ae25f8df929007e7","is_big_paste",[3227],"wykonaj pełnyn audyt i mapę mózgu",{},{"_249":3204,"_256":3232,"_54":3233,"_56":3234,"_260":3235,"_262":263,"_264":34,"_265":266,"_267":3236,"_269":270,"_271":272},"f1f94ecf-2163-4f4b-a572-a869c212f0a1",[3194],{"_582":583,"_267":3567},1789296806.11751,1789296812.154344,{"_577":578,"_579":3565},{"_273":3237,"_275":34,"_278":3238,"_285":3239,"_62":3240,"_3241":3242,"_280":3243,"_276":3244,"_282":109,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_298":34,"_299":3230,"_300":3247,"_302":10},{"_50":573,"_574":3564},[3408,3409,3410,3411,3412,3413,3414,3415],[3268,3269,3270,3271],[3265,3266,3267],"view_state",{"_3248":3249},[],[],"463aa57d-f3fa-4aed-8ed1-268eb0c66fed","6e82859d-015b-474d-b490-4b7bfb66fd39","c82fbe25-6f5a-4128-9118-08abf118268a","widgets",{"_3250":3251},"8a0c16df-3e01-4ae6-9c84-213dcbab11d5:5",{"_3252":3253,"_3254":14,"_3255":3256,"_3257":3258,"_3259":3260,"_3261":3262,"_3263":3264},"kind","file","show_upload_cta","photo_label","Prześlij zdjęcie","video_label","Prześlij film","media_label","Prześlij zdjęcie lub film","camera_label","Zrób zdjęcie","file_label","Prześlij plik","https://github.com/ogblakus/ziggywizzair","https://github.com/ogblakus/ziggywizzair/blob/main/package.json","https://raw.githubusercontent.com/ogblakus/ziggywizzair/main/AGENTS.md",{"_50":1168,"_1169":3313,"_1171":3314},{"_50":1168,"_1169":3287,"_1171":3288},{"_50":1168,"_1169":3280,"_1171":3281},{"_50":1168,"_1169":3272,"_1171":3273},"apidog.com",[3274],{"_50":1174,"_41":3275,"_53":3276,"_1177":3277,"_1179":3278,"_1181":3279,"_1183":3272},"https://share.apidog.com/apidoc/docs-site/347364/api-3489519?utm_source=chatgpt.com","Get a tree - GitHub v3 REST API","GET A TREE  GET  /repos/{owner}/{repo}/git/trees/{tree_sha}  Run in Apidog  Returns a single tree using the SHA1 value for that tree.If `truncated` is `true` in the response then the number of items...",{"_1184":1230,"_1186":1187,"_1188":1198},1692057600,"deepwiki.com",[3282],{"_50":1174,"_41":3283,"_53":3284,"_1177":3285,"_1179":3286,"_1181":-5,"_1183":3280},"https://deepwiki.com/michaelliao/git-explorer/5.1-github-api?utm_source=chatgpt.com","GitHub API | michaelliao/git-explorer | DeepWiki","Index your code with Devin  DeepWiki  michaelliao/git-explorer  Edit Wiki Share  Last indexed: 28 April 2025 (fc22e9)  * Overview * Features and Capabilities * License and Usage Terms  GITHUB API  Rel...",{"_1184":1230,"_1186":1187,"_1188":1225},"stackoverflow.com",[3289,3290,3291,3292],{"_50":1174,"_41":3308,"_53":3309,"_1177":3310,"_1179":3311,"_1181":3312,"_1183":3287},{"_50":1174,"_41":3303,"_53":3304,"_1177":3305,"_1179":3306,"_1181":3307,"_1183":3287},{"_50":1174,"_41":3298,"_53":3299,"_1177":3300,"_1179":3301,"_1181":3302,"_1183":3287},{"_50":1174,"_41":3293,"_53":3294,"_1177":3295,"_1179":3296,"_1181":3297,"_1183":3287},"https://stackoverflow.com/questions/65676058/using-curl-to-list-github-repository-tree-github-api?utm_source=chatgpt.com","Using CURL to list github repository tree (github API) - Stack Overflow","USING CURL TO LIST GITHUB REPOSITORY TREE (GITHUB API)  Ask Question  Asked 5 years, 8 months ago  Modified 5 years, 8 months ago  Viewed 1k times  Using the github API, you can get a repository tree...",{"_1184":1230,"_1186":1187,"_1188":1189},1610323200,"https://stackoverflow.com/questions/25022016/get-all-file-names-from-a-github-repo-through-the-github-api?utm_source=chatgpt.com","Get all file names from a Github repo through the Github API - Stack Overflow","GET ALL FILE NAMES FROM A GITHUB REPO THROUGH THE GITHUB API  Ask Question  Asked 12 years, 1 month ago  Modified 2 years, 8 months ago  Viewed 75k times  [Input]  68  [Input]  Is it possible to get...",{"_1184":1230,"_1186":1187,"_1188":1230},1406592000,"https://stackoverflow.com/questions/7106012/download-a-single-folder-or-directory-from-a-github-repository/78218271?utm_source=chatgpt.com","git - Download a single folder or directory from a GitHub repository - Stack Overflow","A link to a GitHub webpage for a more complete example (work in progress)  ext-code.com: Download a directory from a GitHub repository  * * *  As per the documentation REST API endpoints for Git trees...",{"_1184":1230,"_1186":1187,"_1188":1315},1313625600,"https://stackoverflow.com/questions/58633877/getting-whole-repository-structure-from-github-api-using-one-request?utm_source=chatgpt.com","Getting whole repository structure from GitHub API using one request - Stack Overflow","GETTING WHOLE REPOSITORY STRUCTURE FROM GITHUB API USING ONE REQUEST  Ask Question  Asked 6 years, 10 months ago  Modified 5 years, 5 months ago  Viewed 3k times  Is it possible to somehow get inform...",{"_1184":1230,"_1186":1187,"_1188":266},1572393600,"github.com",[3315,3316,3317,3318,3319,3320,3321,3322,3323,3324,3325,3326,3327,3328,3329,3330,3331,3332],{"_50":1174,"_41":3404,"_53":3405,"_1177":3406,"_1179":3407,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3400,"_53":3401,"_1177":3402,"_1179":3403,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3396,"_53":3397,"_1177":3398,"_1179":3399,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3393,"_53":3361,"_1177":3394,"_1179":3395,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3389,"_53":3390,"_1177":3391,"_1179":3392,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3385,"_53":3386,"_1177":3387,"_1179":3388,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3380,"_53":3381,"_1177":3382,"_1179":3383,"_1181":3384,"_1183":3313},{"_50":1174,"_41":3376,"_53":3377,"_1177":3378,"_1179":3379,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3372,"_53":3373,"_1177":3374,"_1179":3375,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3368,"_53":3369,"_1177":3370,"_1179":3371,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3364,"_53":3365,"_1177":3366,"_1179":3367,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3360,"_53":3361,"_1177":3362,"_1179":3363,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3356,"_53":3357,"_1177":3358,"_1179":3359,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3352,"_53":3353,"_1177":3354,"_1179":3355,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3347,"_53":3348,"_1177":3349,"_1179":3350,"_1181":3351,"_1183":3313},{"_50":1174,"_41":3343,"_53":3344,"_1177":3345,"_1179":3346,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3338,"_53":3339,"_1177":3340,"_1179":3341,"_1181":3342,"_1183":3313},{"_50":1174,"_41":3333,"_53":3334,"_1177":3335,"_1179":3336,"_1181":3337,"_1183":3313},"https://gist.github.com/lukasbach/ae5ba67460cc7fbe3ed65536b08b2257?utm_source=chatgpt.com","Generate Github API Graphql Query for fetching all file contents in a repo · GitHub","LUKASBACH/CODE.JS  Created February 23, 2023 01:42  Generate Github API Graphql Query for fetching all file contents in a repo  Raw  code.js  | const owner = "lukasbach"; | const repo = "react-comple...",{"_1184":1230,"_1186":1187,"_1188":1211},1677110400,"https://github.com/gogs/docs-api/issues/29?utm_source=chatgpt.com","Git Trees API without path parameter! · Issue #29 · gogs/docs-api · GitHub","This repository was archived by the owner on Feb 7, 2026. It is now read-only.  gogs / docs-api Public archive  This repository was archived by the owner on Feb 7, 2026. It is now read-only.  GIT TRE...",{"_1184":1230,"_1186":1187,"_1188":1343},1627862400,"https://github.com/zhangyanxs/repo2skill/blob/main/repo2skill/SKILL.md?utm_source=chatgpt.com","repo2skill/repo2skill/SKILL.md at main · zhangyanxs/repo2skill · GitHub","STEP 2: MIRROR CONFIGURATION  Define mirror endpoints to try in order:  GITHUB API MIRRORS  1. `https://api.github.com` 2. `https://gh.api.888888888.xyz` 3. `https://gh-proxy.com/api/github` 4. `https...",{"_1184":1230,"_1186":1187,"_1188":1203},"https://gist.github.com/rmtbb/d55638e758ad656eb40741dd60a39e5f?utm_source=chatgpt.com","List Git Files - List raw GitHub URLs for files in a repo or subfolder, filtered by extensions · GitHub","| api_get() { | local url="$1" | if [[ -n "${GITHUB_TOKEN:-}" ]]; then | curl -fsSL -H "Authorization: Bearer $GITHUB_TOKEN" -H "Accept: application/vnd.github+json" "$url" | else | curl -fsSL -H "Acc...",{"_1184":1230,"_1186":1187,"_1188":1215},1756857600,"https://github.com/octokit/plugin-rest-endpoint-methods.js/blob/main/docs/git/getTree.md?utm_source=chatgpt.com","plugin-rest-endpoint-methods.js/docs/git/getTree.md at main · octokit/plugin-rest-endpoint-methods.js · GitHub","GETTREE.MD  Copy path  60 lines (44 loc) · 1.65 KB  Raw  Copy raw file  Download raw file   name  | Get a tree example  | octokit.rest.git.getTree({ owner, repo, tree_sha }) route  | GET /repos/{owne...",{"_1184":1230,"_1186":1187,"_1188":1300},"https://docs.github.com/en/rest/git/trees?utm_source=chatgpt.com","REST API endpoints for Git trees - GitHub Docs","The REST API is now versioned. For more information, see "About API versioning."  REST API ENDPOINTS FOR GIT TREES  Use the REST API to interact with tree objects in your Git database on GitHub.  ABO...",{"_1184":1230,"_1186":1187,"_1188":1185},"https://github.com/topics/zig-programming-language?utm_source=chatgpt.com","zig-programming-language · GitHub Topics · GitHub","ZIG-PROGRAMMING-LANGUAGE  Star  HERE ARE 20 PUBLIC REPOSITORIES MATCHING THIS TOPIC...  Language: All  Filter by language  All 20 Zig 18 Svelte 1  Sort: Most stars  Sort options  Most stars Fewest...",{"_1184":1185,"_1186":1187,"_1188":1189},"https://github.com/zigimg/zigimg?utm_source=chatgpt.com","GitHub - zigimg/zigimg: Zig library for reading and writing different image formats · GitHub","zigimg / zigimg Public  * Notifications You must be signed in to change notification settings * Fork 147 * Star  * Code * Issues 42 * Pull requests 6 * Actions * Projects * Security and quality 0 * I...",{"_1184":1185,"_1186":1187,"_1188":1211},"https://github.com/kristoff-it/ziggy/blob/main/build.zig.zon?utm_source=chatgpt.com","ziggy/build.zig.zon at main · kristoff-it/ziggy · GitHub","kristoff-it / ziggy Public  * Notifications You must be signed in to change notification settings * Fork 45 * Star  * Code * Issues 19  BUILD.ZIG.ZON  Copy path  [Input: Go to file]  Blame More file...",{"_1184":1185,"_1186":1187,"_1188":1198},"https://github.com/zig-gamedev/zig-gamedev?utm_source=chatgpt.com","GitHub - zig-gamedev/zig-gamedev: Dev repo for @zig-gamedev libs and sample applications · GitHub","FOLDERS AND FILES  Name  | Name  | Last commit message  | Last commit date --- | --- | --- | ---  LATEST COMMIT    HISTORY  4,878 Commits .github  | .github  |    | experiments  | experiments  |    |...",{"_1184":1185,"_1186":1187,"_1188":1343},"https://github.com/WizzAir-verifica/?utm_source=chatgpt.com","WizzAir-verifica · GitHub","Image: @WizzAir-verifica WizzAir-verifica Follow  Overview Repositories 1 Projects 0 Packages 0 Stars 0  More  WIZZAIR-VERIFICA  Follow  POPULAR REPOSITORIES LOADING  1. verifica-prenotazione verific...",{"_1184":1185,"_1186":1187,"_1188":1225},"https://github.com/topics/zig-language?utm_source=chatgpt.com","zig-language · GitHub Topics · GitHub","ZIG-LANGUAGE  Star  Image: zig logo  Zig is a general-purpose programming language and toolchain for maintaining robust, optimal, and reusable software. Focus on debugging your application rather t...",{"_1184":1185,"_1186":1187,"_1188":1203},1454889600,"https://github.com/david-vanderson/dvui?utm_source=chatgpt.com","GitHub - david-vanderson/dvui: Immediate Zig GUI for Apps and Games · GitHub","DVUI — IMMEDIATE ZIG GUI FOR APPS AND GAMES  Zig GUI toolkit for whole applications or debugging windows in existing apps/games.  Tested with Zig v0.16.0 (for Zig v0.15.2, use DVUI branch zig15 or ta...",{"_1184":1185,"_1186":1187,"_1188":1215},"https://github.com/topics/bindings?l=zig&utm_source=chatgpt.com","bindings · GitHub Topics · GitHub","BINDINGS  Star  HERE ARE 55 PUBLIC REPOSITORIES MATCHING THIS TOPIC...  Language: Zig  Filter by language  All 1,715 Rust 265 C# 198 C++ 154 C 124 Python 123 Go 121 Zig 54 TypeScript 53 JavaScript...",{"_1184":1185,"_1186":1187,"_1188":1230},"https://github.com/topics/zig-programming-language?o=desc&s=updated&utm_source=chatgpt.com","ZIG-PROGRAMMING-LANGUAGE  Star  HERE ARE 20 PUBLIC REPOSITORIES MATCHING THIS TOPIC...  Language: All  Filter by language  All 20 Zig 18 Svelte 1  Sort: Recently updated  Sort options  Most stars F...",{"_1184":1185,"_1186":1187,"_1188":1315},"https://github.com/zigtools?utm_source=chatgpt.com","zigtools · GitHub","Image: @zigtools  ZIGTOOLS  We make free and open-source tools for the @ziglang community.  * Verified  We've verified that the organization zigtools controls the domain:  * zigtools.org  Learn more...",{"_1184":1185,"_1186":1187,"_1188":1300},"https://github.com/ziglibs?utm_source=chatgpt.com","ZigLibs · GitHub","Image: @ziglibs  ZIGLIBS  Community-driven library development  *   * Overview * Repositories * Projects * Packages * People  More  PINNED LOADING  1. repository repository Public  A community-mainta...",{"_1184":1185,"_1186":1187,"_1188":266},"https://github.com/topics/ziggy?utm_source=chatgpt.com","ziggy · GitHub Topics · GitHub","ZIGGY  Star  HERE ARE 36 PUBLIC REPOSITORIES MATCHING THIS TOPIC...  Language: All  Filter by language  All 36 PHP 12 TypeScript 8 Vue 4 JavaScript 3 HTML 2 Python 2 CSS 1 Java 1 Shell 1 Swift 1  S...",{"_1184":1185,"_1186":1187,"_1188":1185},{"_1248":3550,"_1256":-5,"_1250":3551,"_1252":3552,"_62":3553,"_1259":3554,"_47":3555,"_1254":-5,"_50":41,"_53":3556,"_3557":3558,"_3559":-5,"_3560":-5},{"_1248":3499,"_1256":-5,"_1250":3540,"_1252":3541,"_62":3542,"_1259":3543,"_47":3504,"_1254":-5,"_50":1283,"_1284":3544,"_1286":3545,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3526,"_1256":-5,"_1250":3527,"_1252":3528,"_62":3529,"_1259":3530,"_47":3531,"_1254":-5,"_50":1283,"_1284":3532,"_1286":3533,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3514,"_1256":-5,"_1250":3515,"_1252":3516,"_62":3517,"_1259":3518,"_47":3519,"_1254":-5,"_50":1283,"_1284":3520,"_1286":3521,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3499,"_1256":-5,"_1250":3500,"_1252":3501,"_62":3502,"_1259":3503,"_47":3504,"_1254":-5,"_50":1283,"_1284":3505,"_1286":3506,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3428,"_1256":3429,"_1250":3430,"_1252":3431,"_62":-5,"_1259":3432,"_47":-5,"_1254":-5,"_50":3433,"_3433":3434,"_649":3435,"_3436":3437,"_3438":3439,"_3440":-5,"_3441":3442,"_3443":34,"_3444":3445},{"_1248":1255,"_1256":-5,"_1250":3420,"_1252":3420,"_62":3421,"_1259":3422,"_47":632,"_1254":-5,"_50":1261,"_1262":3423,"_1264":14},{"_50":1247,"_1248":3416,"_1250":3417,"_1252":3418,"_47":3416,"_1254":3419},"pełny audyt kodu",2154,2170,"Zrób pełny audyt kodu",2510,[],[],[3424,3425],{"_53":3427,"_41":3265,"_1183":3426},{"_53":632,"_41":3267,"_1183":3426},"GitHub","GitHub - ogblakus/ziggywizzair · GitHub","genui{"ask_user_files":{"kind":"file"}}","genui",2253,2295,[],"dil",{"_50":3446,"_3447":3448,"_3449":3450,"_3451":3452,"_254":3453},"ask_user_files","dil_url","https://cdn.platform.openai.com/deployments/widgets/index.html#eyJ3aWRnZXQiOnsidHlwZSI6IkJhc2ljIiwiYWxpZ24iOiJzdGFydCIsIiRvblZpc2libGVBY3Rpb24iOiJzdGF0ZS5zaG93X3VwbG9hZF9jdGEgPyB7XCJoYW5kbGVyXCI6IFwiY2xpZW50XCIsIFwidHlwZVwiOiBcImxvZ19ldmVudFwiLCBcInBheWxvYWRcIjoge1wiZXZlbnRfbmFtZVwiOiBcIkNoYXRncHRXZWJQaG90b1VwbG9hZEFjdGlvbkltcHJlc3Npb25cIiwgXCJzdGF0c2lnX2V2ZW50X25hbWVcIjogXCJjaGF0Z3B0X3dlYl9waG90b191cGxvYWRfYWN0aW9uX2ltcHJlc3Npb25cIiwgXCJldmVudF9kYXRhXCI6IHtcInJlcXVlc3RlZF9raW5kXCI6IHN0YXRlLmtpbmR9fX0gOiB7fSIsImluaXRpYWxTdGF0ZSI6eyJraW5kIjoiZmlsZSIsInNob3dfdXBsb2FkX2N0YSI6ZmFsc2UsInBob3RvX2xhYmVsIjoiUHJ6ZcWbbGlqIHpkasSZY2llIiwidmlkZW9fbGFiZWwiOiJQcnplxZtsaWogZmlsbSIsIm1lZGlhX2xhYmVsIjoiUHJ6ZcWbbGlqIHpkasSZY2llIGx1YiBmaWxtIiwiY2FtZXJhX2xhYmVsIjoiWnLDs2IgemRqxJljaWUiLCJmaWxlX2xhYmVsIjoiUHJ6ZcWbbGlqIHBsaWsifSwiY2hpbGRyZW4iOlt7InR5cGUiOiJTaG93IiwiJHdoZW4iOiJzdGF0ZS5zaG93X3VwbG9hZF9jdGEgJiYgc3RhdGUua2luZCAhPSBcImZpbGVcIiAmJiBzdXBwb3J0c0NsaWVudEFjdGlvbihcInJlcXVlc3RfY2FtZXJhX2NhcHR1cmVcIikiLCJjaGlsZHJlbiI6W3sidHlwZSI6IkJveCIsImFsaWduIjoic3RhcnQiLCIkb25WaXNpYmxlQWN0aW9uIjoie1wiaGFuZGxlclwiOiBcImNsaWVudFwiLCBcInR5cGVcIjogXCJsb2dfZXZlbnRcIiwgXCJwYXlsb2FkXCI6IHtcImV2ZW50X2RhdGFcIjoge1wicmVxdWVzdGVkX2tpbmRcIjogXCJjYW1lcmFcIiwgXCJlbGljaXRhdGlvbl9tZXRhZGF0YVwiOiB7XCJlbGljaXRhdGlvbl90eXBlXCI6IFwiZmlsZV91cGxvYWRcIiwgXCJzdGFnZVwiOiBcInNob3duXCJ9fX19IiwiY2hpbGRyZW4iOlt7InR5cGUiOiJCdXR0b24iLCIkbGFiZWwiOiJzdGF0ZS5jYW1lcmFfbGFiZWwiLCJpY29uU3RhcnQiOiJjYW1lcmEiLCJzaXplIjoibGciLCJ2YXJpYW50Ijoib3V0bGluZSIsImNvbG9yIjoicHJpbWFyeSIsIiRvbkNsaWNrQWN0aW9uIjoie1wiaGFuZGxlclwiOiBcImNsaWVudFwiLCBcInR5cGVcIjogXCJyZXF1ZXN0X2NhbWVyYV9jYXB0dXJlXCIsIFwicGF5bG9hZFwiOiB7XCJldmVudF9kYXRhXCI6IHtcInJlcXVlc3RlZF9raW5kXCI6IFwiY2FtZXJhXCIsIFwiZWxpY2l0YXRpb25fbWV0YWRhdGFcIjoge1wiZWxpY2l0YXRpb25fdHlwZVwiOiBcImZpbGVfdXBsb2FkXCIsIFwic3RhZ2VcIjogXCJpbnRlcmFjdGVkXCIsIFwiYWN0aW9uXCI6IFwiYWNjZXB0XCJ9fX19In1dfV19LHsidHlwZSI6IkJveCIsImFsaWduIjoic3RhcnQiLCIkb25WaXNpYmxlQWN0aW9uV2hlbiI6InN0YXRlLnNob3dfdXBsb2FkX2N0YSAmJiBzdXBwb3J0c0NsaWVudEFjdGlvbihzdGF0ZS5raW5kID09IFwiZmlsZVwiID8gXCJyZXF1ZXN0X2ZpbGVfdXBsb2FkXCIgOiBcInJlcXVlc3RfbWVkaWFfdXBsb2FkXCIpIiwiJG9uVmlzaWJsZUFjdGlvbiI6InN0YXRlLnNob3dfdXBsb2FkX2N0YSAmJiBzdXBwb3J0c0NsaWVudEFjdGlvbihzdGF0ZS5raW5kID09IFwiZmlsZVwiID8gXCJyZXF1ZXN0X2ZpbGVfdXBsb2FkXCIgOiBcInJlcXVlc3RfbWVkaWFfdXBsb2FkXCIpID8ge1wiaGFuZGxlclwiOiBcImNsaWVudFwiLCBcInR5cGVcIjogXCJsb2dfZXZlbnRcIiwgXCJwYXlsb2FkXCI6IHtcImV2ZW50X25hbWVcIjogXCJDaGF0Z3B0V2ViUGhvdG9VcGxvYWRBY3Rpb25FbmFibGVkSW1wcmVzc2lvblwiLCBcInN0YXRzaWdfZXZlbnRfbmFtZVwiOiBcImNoYXRncHRfd2ViX3Bob3RvX3VwbG9hZF9hY3Rpb25fZW5hYmxlZF9pbXByZXNzaW9uXCIsIFwiZXZlbnRfZGF0YVwiOiB7XCJyZXF1ZXN0ZWRfa2luZFwiOiBzdGF0ZS5raW5kLCBcImVsaWNpdGF0aW9uX21ldGFkYXRhXCI6IHtcImVsaWNpdGF0aW9uX3R5cGVcIjogXCJmaWxlX3VwbG9hZFwiLCBcInN0YWdlXCI6IFwic2hvd25cIn19fX0gOiB7fSIsImNoaWxkcmVuIjpbeyJ0eXBlIjoiU2hvdyIsIiR3aGVuIjoic3RhdGUuc2hvd191cGxvYWRfY3RhICYmIHN0YXRlLmtpbmQgIT0gXCJmaWxlXCIiLCJjaGlsZHJlbiI6W3sidHlwZSI6IkJ1dHRvbiIsIiRsYWJlbCI6InN0YXRlLmtpbmQgPT0gXCJ2aWRlb1wiID8gc3RhdGUudmlkZW9fbGFiZWwgOiBzdGF0ZS5raW5kID09IFwibWVkaWFcIiA_IHN0YXRlLm1lZGlhX2xhYmVsIDogc3RhdGUucGhvdG9fbGFiZWwiLCIkaWNvblN0YXJ0Ijoic3RhdGUua2luZCA9PSBcInZpZGVvXCIgPyBcInZpZGVvXCIgOiBcImltYWdlXCIiLCJzaXplIjoibGciLCJ2YXJpYW50Ijoib3V0bGluZSIsImNvbG9yIjoicHJpbWFyeSIsIiRkaXNhYmxlZCI6IiFzdXBwb3J0c0NsaWVudEFjdGlvbihcInJlcXVlc3RfbWVkaWFfdXBsb2FkXCIpIiwiJG9uQ2xpY2tBY3Rpb24iOiJ7XCJoYW5kbGVyXCI6IFwiY2xpZW50XCIsIFwidHlwZVwiOiBcInJlcXVlc3RfbWVkaWFfdXBsb2FkXCIsIFwicGF5bG9hZFwiOiB7XCJldmVudF9uYW1lXCI6IFwiQ2hhdGdwdFdlYlBob3RvVXBsb2FkQWN0aW9uQ2xpY2tlZFwiLCBcInN0YXRzaWdfZXZlbnRfbmFtZVwiOiBcImNoYXRncHRfd2ViX3Bob3RvX3VwbG9hZF9hY3Rpb25fY2xpY2tlZFwiLCBcImV2ZW50X2RhdGFcIjoge1wicmVxdWVzdGVkX2tpbmRcIjogc3RhdGUua2luZCwgXCJpbXByZXNzaW9uX2V2ZW50XCI6IFwiY2hhdGdwdF93ZWJfcGhvdG9fdXBsb2FkX2FjdGlvbl9lbmFibGVkX2ltcHJlc3Npb25cIiwgXCJlbGljaXRhdGlvbl9tZXRhZGF0YVwiOiB7XCJlbGljaXRhdGlvbl90eXBlXCI6IFwiZmlsZV91cGxvYWRcIiwgXCJzdGFnZVwiOiBcImludGVyYWN0ZWRcIiwgXCJhY3Rpb25cIjogXCJhY2NlcHRcIn19fX0ifV19LHsidHlwZSI6IlNob3ciLCIkd2hlbiI6InN0YXRlLnNob3dfdXBsb2FkX2N0YSAmJiBzdGF0ZS5raW5kID09IFwiZmlsZVwiIiwiY2hpbGRyZW4iOlt7InR5cGUiOiJCdXR0b24iLCIkbGFiZWwiOiJzdGF0ZS5maWxlX2xhYmVsIiwiaWNvblN0YXJ0IjoicGFwZXJjbGlwIiwic2l6ZSI6ImxnIiwidmFyaWFudCI6Im91dGxpbmUiLCJjb2xvciI6InByaW1hcnkiLCIkZGlzYWJsZWQiOiIhc3VwcG9ydHNDbGllbnRBY3Rpb24oXCJyZXF1ZXN0X2ZpbGVfdXBsb2FkXCIpIiwiJG9uQ2xpY2tBY3Rpb24iOiJ7XCJoYW5kbGVyXCI6IFwiY2xpZW50XCIsIFwidHlwZVwiOiBcInJlcXVlc3RfZmlsZV91cGxvYWRcIiwgXCJwYXlsb2FkXCI6IHtcImV2ZW50X25hbWVcIjogXCJDaGF0Z3B0V2ViUGhvdG9VcGxvYWRBY3Rpb25DbGlja2VkXCIsIFwic3RhdHNpZ19ldmVudF9uYW1lXCI6IFwiY2hhdGdwdF93ZWJfcGhvdG9fdXBsb2FkX2FjdGlvbl9jbGlja2VkXCIsIFwiZXZlbnRfZGF0YVwiOiB7XCJyZXF1ZXN0ZWRfa2luZFwiOiBzdGF0ZS5raW5kLCBcImltcHJlc3Npb25fZXZlbnRcIjogXCJjaGF0Z3B0X3dlYl9waG90b191cGxvYWRfYWN0aW9uX2VuYWJsZWRfaW1wcmVzc2lvblwiLCBcImVsaWNpdGF0aW9uX21ldGFkYXRhXCI6IHtcImVsaWNpdGF0aW9uX3R5cGVcIjogXCJmaWxlX3VwbG9hZFwiLCBcInN0YWdlXCI6IFwiaW50ZXJhY3RlZFwiLCBcImFjdGlvblwiOiBcImFjY2VwdFwifX19fSJ9XX1dfV19fQ","dil_version","2.0","estimated_heights","schema_hash","c17771ce1abc07deb7350a0865016abf6a2e70594697c8ebe58caf2c596a956b","hide_widget_feedback","placement_type","inline_run","Basic","align","start","$onVisibleAction","state.show_upload_cta ? {"handler": "client", "type": "log_event", "payload": {"event_name": "ChatgptWebPhotoUploadActionImpression", "statsig_event_name": "chatgpt_web_photo_upload_action_impression", "event_data": {"requested_kind": state.kind}}} : {}","initialState",{"_3252":3253,"_3254":14,"_3255":3256,"_3257":3258,"_3259":3260,"_3261":3262,"_3263":3264},[3454,3455],{"_50":3463,"_3464":3490,"_254":3491},{"_50":3456,"_3447":3448,"_3457":3458,"_3449":3459,"_254":3460},"Box","$onVisibleActionWhen","state.show_upload_cta && supportsClientAction(state.kind == "file" ? "request_file_upload" : "request_media_upload")","state.show_upload_cta && supportsClientAction(state.kind == "file" ? "request_file_upload" : "request_media_upload") ? {"handler": "client", "type": "log_event", "payload": {"event_name": "ChatgptWebPhotoUploadActionEnabledImpression", "statsig_event_name": "chatgpt_web_photo_upload_action_enabled_impression", "event_data": {"requested_kind": state.kind, "elicitation_metadata": {"elicitation_type": "file_upload", "stage": "shown"}}}} : {}",[3461,3462],{"_50":3463,"_3464":3482,"_254":3483},{"_50":3463,"_3464":3465,"_254":3466},"Show","$when","state.show_upload_cta && state.kind == "file"",[3467],{"_50":3468,"_3469":3470,"_3471":3472,"_3217":3473,"_3474":3475,"_3476":3477,"_3478":3479,"_3480":3481},"Button","$label","state.file_label","iconStart","paperclip","lg","variant","outline","color","primary","$disabled","!supportsClientAction("request_file_upload")","$onClickAction","{"handler": "client", "type": "request_file_upload", "payload": {"event_name": "ChatgptWebPhotoUploadActionClicked", "statsig_event_name": "chatgpt_web_photo_upload_action_clicked", "event_data": {"requested_kind": state.kind, "impression_event": "chatgpt_web_photo_upload_action_enabled_impression", "elicitation_metadata": {"elicitation_type": "file_upload", "stage": "interacted", "action": "accept"}}}}","state.show_upload_cta && state.kind != "file"",[3484],{"_50":3468,"_3469":3485,"_3486":3487,"_3217":3473,"_3474":3475,"_3476":3477,"_3478":3488,"_3480":3489},"state.kind == "video" ? state.video_label : state.kind == "media" ? state.media_label : state.photo_label","$iconStart","state.kind == "video" ? "video" : "image"","!supportsClientAction("request_media_upload")","{"handler": "client", "type": "request_media_upload", "payload": {"event_name": "ChatgptWebPhotoUploadActionClicked", "statsig_event_name": "chatgpt_web_photo_upload_action_clicked", "event_data": {"requested_kind": state.kind, "impression_event": "chatgpt_web_photo_upload_action_enabled_impression", "elicitation_metadata": {"elicitation_type": "file_upload", "stage": "interacted", "action": "accept"}}}}","state.show_upload_cta && state.kind != "file" && supportsClientAction("request_camera_capture")",[3492],{"_50":3456,"_3447":3448,"_3449":3493,"_254":3494},"{"handler": "client", "type": "log_event", "payload": {"event_data": {"requested_kind": "camera", "elicitation_metadata": {"elicitation_type": "file_upload", "stage": "shown"}}}}",[3495],{"_50":3468,"_3469":3496,"_3471":3497,"_3217":3473,"_3474":3475,"_3476":3477,"_3480":3498},"state.camera_label","camera","{"handler": "client", "type": "request_camera_capture", "payload": {"event_data": {"requested_kind": "camera", "elicitation_metadata": {"elicitation_type": "file_upload", "stage": "interacted", "action": "accept"}}}}","citeturn0view0",2234,2251,[3265],[],"([GitHub](https://github.com/ogblakus/ziggywizzair))",[3507],[],{"_53":3427,"_41":3265,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3509,"_1292":-5,"_1293":3510,"_1259":3511,"_1296":-5,"_1297":-5},"thumbnail_url","https://images.openai.com/static-rsc-1/WNqBJjWyzpm9e3z9uol4bZwlPX2pZPGyZ_8Y3rhNPtngDYVwTAfocwXBmWfmJ1D-sP9KT6D66BCly1BLsqC1Ftl_RtyzxwCMUVDttJFuy_sAMSrmM-dHMfnKXlkpr61u13saOfuX3TtnMd0bMXUKyHc8WhNcri2wmd4QA4XKJwQMc9vIxcjO5FWB-J3p87wA",[],[3512],{"_1184":1185,"_1186":3513,"_1188":1185},"view","citeturn2view1",606,623,[3267],[],"([GitHub](https://raw.githubusercontent.com/ogblakus/ziggywizzair/main/AGENTS.md))",[3522],[],{"_53":632,"_41":3267,"_1183":3426,"_1181":-5,"_1177":-5,"_1292":-5,"_1293":3523,"_1259":3524,"_1296":-5,"_1297":-5},[],[3525],{"_1184":1300,"_1186":3513,"_1188":266},"citeturn1view2",356,373,[3266],[],"([GitHub](https://github.com/ogblakus/ziggywizzair/blob/main/package.json))",[3534],[],{"_53":3535,"_41":3266,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3536,"_1292":-5,"_1293":3537,"_1259":3538,"_1296":-5,"_1297":-5},"ziggywizzair/package.json at main · ogblakus/ziggywizzair · GitHub","https://images.openai.com/static-rsc-1/g9PNVRj0yxj-VUDUVMQLdSUOB3C9UeZNKCRMOqTAN2XbZdd0ja6pGUBOieTLCIGY8BD683_ZYDtu5o4_5V1k-DK0oSYYG4YGXFIDYCV507iPIQ4AjgWXzbgu0ais9o4trrfFKdLMls6nRpqLzBsZbnUsizSYbN7b012tJ5FGvjKJqvxz8hujifF94aJPRsfL",[],[3539],{"_1184":266,"_1186":3513,"_1188":1300},152,169,[3265],[],[3546],[],{"_53":3427,"_41":3265,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3509,"_1292":-5,"_1293":3547,"_1259":3548,"_1296":-5,"_1297":-5},[],[3549],{"_1184":1185,"_1186":3513,"_1188":1185},"url`ogblakus/ziggywizzair` na GitHubiehttps://github.com/ogblakus/ziggywizzair",68,150,[],[],"[`ogblakus/ziggywizzair` na GitHubie](https://github.com/ogblakus/ziggywizzair?utm_source=chatgpt.com)","`ogblakus/ziggywizzair` na GitHubie","item",{"_53":3556,"_41":3561,"_1183":3313,"_1181":-5,"_1177":-5,"_1292":-5,"_1293":3562,"_1259":3563,"_1296":-5,"_1297":-5},"layout","logo","https://github.com/ogblakus/ziggywizzair?utm_source=chatgpt.com",[],[],[576],[3566],"Tak — **mogę przeanalizować to repozytorium**. Widzę publiczne repo url`ogblakus/ziggywizzair` na GitHubiehttps://github.com/ogblakus/ziggywizzair. citeturn0view0

Na pierwszy rzut oka jest to aplikacja oparta m.in. o **React 19 + TanStack Start/Router, Vite, Tailwind, Zustand, Zod oraz PostgreSQL/Kysely**, z przygotowaną warstwą auth i backendu. citeturn1view2

Co ważne, repo wygląda na projekt wygenerowany/rozwijany w środowisku **Grok App Builder** — `AGENTS.md` zawiera bardzo szczegółowy kontrakt tego środowiska, w tym architekturę aplikacji, zasady auth/database, routing i proces QA. citeturn2view1

### Mogę zrobić dla Ciebie konkretny audyt

Jeżeli chodzi Ci o tę aplikację, którą wcześniej mi pokazywałeś, mogę przejść przez repo i rozpisać:

1. **🏗️ Architekturę aplikacji**
   - frontend
   - backend/API
   - baza danych
   - przepływ danych
   - gdzie znajdują się agenci

2. **🤖 Logikę agentów**
   - co robi każdy agent
   - jakie dane dostaje
   - jak generuje swoją ocenę
   - jak oceny są agregowane
   - **jak dokładnie powstaje końcowa decyzja**

3. **🧠 Mechanizm decyzyjny**
   - scoring
   - wagi agentów
   - konflikty między agentami
   - veto / confidence / consensus
   - czy decyzja końcowa rzeczywiście wynika logicznie z analiz agentów

4. **🔐 Bezpieczeństwo**
   - API
   - klucze
   - autoryzacja
   - możliwość manipulowania wynikiem z frontendu
   - podatności związane z danymi wejściowymi

5. **💰 Koszt działania**
   - ile wywołań AI wykonuje jedna analiza
   - które agenty są najbardziej kosztowne
   - gdzie można ograniczyć liczbę requestów
   - potencjalne problemy z równoległym wykonywaniem agentów

6. **🐛 Błędy / problemy architektoniczne**
   - rzeczy, które obecnie mogą działać źle
   - rzeczy, które będą problemem przy większej liczbie użytkowników
   - miejsca, gdzie agent może „halucynować”
   - sytuacje, w których końcowa decyzja może być pozornie sensowna, ale matematycznie błędna.

**Jedno ograniczenie:** GitHub pozwala mi obecnie odczytać repo i część plików, ale narzędzie webowe blokuje mi bezpośrednie wejście w niektóre katalogi (`src`, `server`). Dlatego jeśli chcesz **pełny audyt kodu, a nie tylko pobieżny przegląd**, najlepiej podeślij ZIP repo. citeturn0view0

genui{"ask_user_files":{"kind":"file"}}

**Jeśli wrzucisz ZIP, mogę zrobić Ci wręcz „mapę mózgu” tej aplikacji:** `INPUT → AGENT 1/2/3/... → scoring → agregator → FINAL DECISION`, ze wskazaniem konkretnych plików i funkcji odpowiedzialnych za każdy etap.",{"_1376":1377},{"_249":3230,"_256":3571,"_54":3572,"_260":3573,"_262":263,"_264":14,"_265":266,"_267":3574,"_269":270},"8928961a-214d-411b-b373-6c76edd616eb",[3204],{"_582":583,"_267":3578},1789296806.40081,{"_577":603,"_260":3577},{"_592":593,"_594":1189,"_596":3575,"_598":3576,"_600":601,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3569,"_300":3247,"_602":34,"_302":10},1789296795.3741724,1789296806.3856716,"Przetwarzano przez 11s",{},{"_249":3569,"_256":3582,"_54":3583,"_260":3584,"_262":263,"_264":14,"_265":266,"_267":3585,"_269":270},"5aba24dd-60a0-4f2d-b968-6cc093b55d48",[3230],{"_582":583,"_267":3605},1789296806.397783,{"_577":625,"_625":3600,"_627":3601},{"_613":3586,"_592":615,"_616":1539,"_618":3587,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3588,"_300":3247,"_602":34,"_302":10},{"_285":3590,"_621":3591},[3589],"29f3c1a8-9c94-439b-80f2-043e3e746d94","https://www.google.com/s2/favicons?domain=raw.githubusercontent.com&sz=128",[3594],[3592,3593],"f4db463a-c4ab-404d-bcd8-f1b6d70cd190","72d2e1ab-9be6-4caa-81e9-8c7a59dc3507",{"_50":1168,"_1169":3595,"_1171":3596},"raw.githubusercontent.com",[3597],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":3599,"_1181":-5,"_1183":3595},"Total lines: 316
",{"_1184":1300,"_1186":3513,"_1188":266},[3602],"f756d20f-5c8c-4c65-b341-af2e446abf17",{"_630":3603,"_260":632,"_633":3604,"_635":34},"Przeszukano witryny: 1",[],{},{"_249":3580,"_256":3609,"_54":3610,"_260":3611,"_262":263,"_264":14,"_265":266,"_267":3612,"_269":1613},"63028b60-3873-4b03-a796-f04b4f82a6fe",[3569],{"_582":583,"_267":3626},1789296804.970377,{"_577":578,"_579":3625},{"_273":3613,"_275":34,"_276":3614,"_278":3615,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3616,"_300":3247,"_592":615,"_618":3617,"_613":3618,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3624},[],[],"a6b9e94b-2ad2-42ec-a35b-aa19dfa76341",[1638],{"_285":3619},[3620],{"_50":1168,"_1169":3595,"_1171":3621},[3622],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":3623,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3607,"_256":3630,"_54":3631,"_260":3632,"_262":263,"_265":266,"_267":3633,"_269":270},"aaa2c7c5-b2e7-4029-9406-1353dfd25689",[3580],{"_582":648,"_649":1613,"_267":3636},1789296804.5374665,{"_577":578,"_579":3635},{"_287":288,"_294":3246,"_296":3246,"_299":3634,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},"116eb105-8ed1-416b-9c48-b696bd3ebe2d",[647],{"_1376":1615},{"_249":3628,"_256":3640,"_54":3641,"_260":3642,"_262":263,"_264":14,"_265":266,"_267":3643,"_269":1613},"f97f3228-4b60-45b2-99a8-564b7c1a43c4",[3607],{"_582":583,"_267":3657},1789296803.861792,{"_577":578,"_579":3656},{"_273":3644,"_275":34,"_276":3645,"_278":3646,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3647,"_300":3247,"_592":615,"_618":3648,"_613":3649,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3655},[],[],"db6d9be8-931d-42c1-8757-84a11502fda2",[1638],{"_285":3650},[3651],{"_50":1168,"_1169":3595,"_1171":3652},[3653],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":3654,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3638,"_256":3660,"_54":3661,"_260":3662,"_262":263,"_264":14,"_265":266,"_267":3663,"_269":1613},[3628],{"_582":583,"_267":3677},1789296801.886468,{"_577":578,"_579":3676},{"_273":3664,"_275":34,"_276":3665,"_278":3666,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3667,"_300":3247,"_592":615,"_618":3668,"_613":3669,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3675},[],[],"0240bd53-ff76-4216-a436-b3f3f6c4d0b5",[1638],{"_285":3670},[3671],{"_50":1168,"_1169":3595,"_1171":3672},[3673],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":3674,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3593,"_256":3680,"_54":3681,"_260":3682,"_262":263,"_265":266,"_267":3683,"_269":270},[3638],{"_582":648,"_649":1613,"_267":3688},1789296801.039181,{"_577":578,"_579":3687},{"_287":288,"_294":3246,"_296":3246,"_299":3684,"_1610":1611,"_702":3685,"_703":3686,"_592":615,"_596":3575,"_302":10,"_645":34},"9620dd1f-eb20-4d4f-91fa-06c5015fa9aa",[3686],"Przeszukiwanie raw.githubusercontent.com",[647],{"_1376":1615},{"_249":3592,"_256":3692,"_54":3693,"_260":3694,"_262":263,"_264":14,"_265":266,"_267":3695,"_269":1613},"18a3a2d9-2612-4080-8dd2-543e3dd2bae1",[3593],{"_582":583,"_267":3703},1789296800.157442,{"_577":578,"_579":3702},{"_273":3696,"_275":34,"_276":3697,"_278":3698,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3690,"_300":3247,"_702":3699,"_703":1652,"_592":615,"_618":3700,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3701},[],[],[1652],[1638],[666],[632],{},{"_249":3690,"_256":3707,"_54":3708,"_260":3709,"_262":263,"_264":14,"_265":266,"_267":3710,"_269":270},"decf4d24-c3d7-4926-baf3-27884a090cd3",[3592],{"_582":583,"_267":3721},1789296801.146811,{"_577":625,"_625":3716,"_627":3717},{"_613":3711,"_592":615,"_616":617,"_618":3712,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3713,"_300":3247,"_602":34,"_302":10},{"_621":3714},[620],"5087c971-825a-47df-9ea0-6202d64ce435",[3715,3705],"0a255c70-4358-49ca-86db-fb78ccf711ec",[3718],"e5ba3db5-9c96-4745-8a08-5267ea51379b",{"_630":3719,"_260":632,"_633":3720,"_635":34},"Sklonowano repozytorium GitHub do kontenera",[],{},{"_249":3705,"_256":3724,"_54":3725,"_260":3726,"_262":263,"_265":266,"_267":3727,"_269":270},[3690],{"_582":648,"_649":650,"_267":3730},1789296800.1583235,{"_577":578,"_579":3729},{"_287":288,"_294":3246,"_296":3246,"_299":3728,"_702":-5,"_703":-5,"_592":615,"_596":3575,"_302":10,"_645":34},"93faa32f-ac16-493b-9a0e-ab5229478b5d",[647],{},{"_249":3715,"_256":3734,"_54":3735,"_260":3736,"_262":263,"_264":14,"_265":266,"_267":3737,"_269":650},"eb01766a-c5e3-4741-a5c4-e79b845d95d2",[3705],{"_582":583,"_267":3746},1789296797.929662,{"_577":620,"_667":668,"_578":3745},{"_273":3738,"_275":34,"_276":3739,"_278":3740,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3732,"_300":3247,"_702":3741,"_703":3742,"_592":615,"_618":3743,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3744},[],[],[3742],"Klonowanie repozytorium GitHub do kontenera",[620],[666],"git clone --depth 1 https://github.com/ogblakus/ziggywizzair.git /tmp/ziggywizzair",{},{"_249":3732,"_256":3750,"_54":3751,"_260":3752,"_262":263,"_264":14,"_265":266,"_267":3753,"_269":270},"e607fbce-e083-4968-97a7-6e3c4a475e51",[3715],{"_582":583,"_267":3766},1789296798.666756,{"_577":625,"_625":3761,"_627":3762},{"_613":3754,"_592":615,"_616":1539,"_618":3755,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3756,"_300":3247,"_602":34,"_302":10},{"_621":3758},[3757],"e8f7c5c0-2792-471f-8efd-6f960c74bc84","https://www.google.com/s2/favicons?domain=github.com&sz=128",[3759,3760],"259fc622-b744-4237-bb66-6d27781406b0","fdb8ea82-ef02-4c3f-aaf6-b77ce27662a1",[3763],"d34d7086-6ce9-4458-8b01-75e3285924e9",{"_630":3764,"_260":632,"_633":3765,"_635":34},"Przeszukiwanie github.com",[],{},{"_249":3748,"_256":3770,"_54":3771,"_260":3772,"_262":263,"_265":266,"_267":3773,"_269":270},"8d419418-6c9f-4fc4-8e88-f93156d92dbf",[3732],{"_582":648,"_649":1613,"_267":3776},1789296797.228653,{"_577":578,"_579":3775},{"_287":288,"_294":3246,"_296":3246,"_299":3774,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},"0f882036-ff55-49e9-b151-faa29d1fe4bc",[647],{"_1376":1615},{"_249":3768,"_256":3780,"_54":3781,"_260":3782,"_262":263,"_264":14,"_265":266,"_267":3783,"_269":1613},"c1eeec88-cd28-47f8-90ab-bee065cea490",[3748],{"_582":583,"_267":3791},1789296796.714503,{"_577":578,"_579":3790},{"_273":3784,"_275":34,"_276":3785,"_278":3786,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3787,"_300":3247,"_592":615,"_618":3788,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3789},[],[],"ef24b58f-f452-4743-844e-0395b189ce42",[1638],[666],[632],{},{"_249":3778,"_256":3794,"_54":3795,"_260":3796,"_262":263,"_265":266,"_267":3797,"_269":270},[3768],{"_582":648,"_649":1613,"_267":3800},1789296795.8793826,{"_577":578,"_579":3799},{"_287":288,"_294":3246,"_296":3246,"_299":3798,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},"dca528de-496e-42a2-ab79-5754a84cacbd",[647],{"_1376":1615},{"_249":3760,"_256":3804,"_54":3805,"_260":3806,"_262":263,"_265":266,"_267":3807,"_269":270},"b770eb7d-b3aa-4d78-bc9b-89337ca466c3",[3778],{"_582":648,"_649":1613,"_267":3810},1789296795.882249,{"_577":578,"_579":3809},{"_702":3808,"_703":1652,"_592":615,"_596":3575,"_287":288,"_294":3246,"_296":3246,"_299":3802,"_302":10,"_645":34},[1652],[647],{"_1376":1615},{"_249":3802,"_256":3813,"_54":3814,"_260":3815,"_262":263,"_264":14,"_265":266,"_267":3816,"_269":1613},[3760],{"_582":583,"_267":3824},1789296795.399049,{"_577":578,"_579":3823},{"_273":3817,"_275":34,"_276":3818,"_278":3819,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3820,"_300":3247,"_592":615,"_618":3821,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":3822},[],[],"c03feee9-2501-4d98-b55a-5aa7b2b3a6af",[1638],[666],[632],{},{"_249":3759,"_256":3828,"_54":3829,"_260":3830,"_262":263,"_265":266,"_267":3831,"_269":1539},"2a45b38b-6c78-4267-b806-ff98265c0b75",[3802],{"_582":583,"_267":3838},1789296795.3607721,{"_577":578,"_579":3837},{"_276":3832,"_278":3833,"_282":109,"_702":3834,"_703":1652,"_592":615,"_618":3835,"_596":3575,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3836,"_300":3247,"_302":10,"_298":14},[],[],[1652],[1638],"c4bacb96-76a4-489d-865d-c34133810f83",[632],{},{"_249":3826,"_256":3842,"_54":3843,"_260":3844,"_262":263,"_265":266,"_267":3845,"_269":583},"72c1b4db-1d95-4c96-a6e7-932e5c25cff6",[3759],{"_582":773,"_267":3850},1789296795.377112,{"_577":578,"_579":3849},{"_771":34,"_276":3846,"_278":3847,"_280":3848,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3840,"_300":3247,"_302":10,"_298":14},[],[],[],[632],{},{"_249":3840,"_256":3854,"_54":3855,"_260":3856,"_262":263,"_265":266,"_267":3857,"_269":270},"0edb5796-fec6-46d2-a653-acb3465d743e",[3826],{"_582":583,"_267":3858},1789296795.3622446,{"_577":1676,"_1677":632},{"_287":288,"_294":3246,"_296":3246,"_299":3852,"_302":10,"_645":34},{},{"_249":3852,"_256":3862,"_54":3863,"_260":3864,"_262":263,"_265":266,"_267":3865,"_269":270},"4762e486-5b3f-48c8-8cf0-3fbcd8c69659",[3840],{"_582":773,"_267":3868},1789296795.223981,{"_577":578,"_579":3867},{"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3860,"_302":10,"_298":14},"8c12fe3c-3690-4544-9c1f-c8dff4d2f81f",[632],{},{"_249":3860,"_256":3872,"_54":3873,"_260":3874,"_262":263,"_265":266,"_267":3875,"_269":270},"566a6a83-cee1-47a4-b02e-6344a0c02d1f",[3852],{"_582":773,"_267":3877},1789296795.223456,{"_577":578,"_579":3876},{"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3870,"_302":10,"_298":14},[632],{},{"_249":3870,"_256":3881,"_54":3882,"_260":3883,"_262":263,"_264":34,"_265":1185,"_267":3884,"_269":270},"7d913e21-716e-4819-9279-e2e02d83b06b",[3860],{"_582":773,"_267":3887},1789296796.141303,{"_577":578,"_579":3886},{"_3885":34,"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3879,"_302":10,"_298":14},"rebase_developer_message",[632],{},{"_249":3879,"_256":3891,"_54":3892,"_260":3893,"_262":263,"_264":34,"_265":1185,"_267":3894,"_269":270},"26b504b9-557f-419a-8cab-e10340d7f24a",[3870],{"_582":773,"_267":3897},1789296796.094716,{"_577":578,"_579":3896},{"_3895":34,"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3889,"_302":10,"_298":14},"rebase_system_message",[632],{},{"_249":3889,"_256":3901,"_54":3902,"_56":3903,"_260":3904,"_262":263,"_265":266,"_267":3905,"_269":270},"ab0174e6-03b3-4c96-8efd-e9abf6439ff0",[3879],{"_582":825,"_267":3918},1789296795.291,1789296812.435211,{"_577":578,"_579":3916},{"_2032":3906,"_290":3245,"_822":-5,"_294":3246,"_296":3246,"_300":3866,"_302":10,"_298":14},{"_2034":3907},[3908],{"_249":3265,"_3909":41,"_3910":3911,"_3912":3913,"_3914":3915},"inline_reference_type","symbol","resourceReference","startIndex",35,"endIndex",75,[3917],"możesz dla mnie sprawdzić to repo? https://github.com/ogblakus/ziggywizzair",{},{"_249":3899,"_256":3922,"_54":3923,"_260":3924,"_262":263,"_265":1185,"_267":3925,"_269":270},"client-created-root",[3889],{"_582":773,"_267":3927},1789296795.191007,{"_577":578,"_579":3926},{"_290":3245,"_822":-5,"_294":3246,"_296":3246,"_300":3866,"_302":10,"_771":34,"_298":14},[632],{},[3899],{"_249":3920,"_254":6154},{"_249":3899,"_250":6147,"_252":3920,"_254":6148},{"_249":3889,"_250":6137,"_252":3899,"_254":6138},{"_249":3879,"_250":6130,"_252":3889,"_254":6131},{"_249":3870,"_250":6123,"_252":3879,"_254":6124},{"_249":3860,"_250":6116,"_252":3870,"_254":6117},{"_249":3852,"_250":6109,"_252":3860,"_254":6110},{"_249":3840,"_250":6103,"_252":3852,"_254":6104},{"_249":3826,"_250":6093,"_252":3840,"_254":6094},{"_249":3759,"_250":6082,"_252":3826,"_254":6083},{"_249":3802,"_250":6070,"_252":3759,"_254":6071},{"_249":3760,"_250":6062,"_252":3802,"_254":6063},{"_249":3778,"_250":6055,"_252":3760,"_254":6056},{"_249":3768,"_250":6043,"_252":3778,"_254":6044},{"_249":3748,"_250":6036,"_252":3768,"_254":6037},{"_249":3732,"_250":6024,"_252":3748,"_254":6025},{"_249":3715,"_250":6012,"_252":3732,"_254":6013},{"_249":3705,"_250":6005,"_252":3715,"_254":6006},{"_249":3690,"_250":5993,"_252":3705,"_254":5994},{"_249":3592,"_250":5980,"_252":3690,"_254":5981},{"_249":3593,"_250":5972,"_252":3592,"_254":5973},{"_249":3638,"_250":5954,"_252":3593,"_254":5955},{"_249":3628,"_250":5936,"_252":3638,"_254":5937},{"_249":3607,"_250":5929,"_252":3628,"_254":5930},{"_249":3580,"_250":5911,"_252":3607,"_254":5912},{"_249":3569,"_250":5894,"_252":3580,"_254":5895},{"_249":3230,"_250":5888,"_252":3569,"_254":5889},{"_249":3204,"_250":5748,"_252":3230,"_254":5749},{"_249":3194,"_250":5737,"_252":3204,"_254":5738},{"_249":3178,"_250":5730,"_252":3194,"_254":5731},{"_249":2570,"_250":5718,"_252":3178,"_254":5719},{"_249":3137,"_250":5709,"_252":2570,"_254":5710},{"_249":2571,"_250":5687,"_252":3137,"_254":5688},{"_249":3094,"_250":5676,"_252":2571,"_254":5677},{"_249":3080,"_250":5654,"_252":3094,"_254":5655},{"_249":3050,"_250":5643,"_252":3080,"_254":5644},{"_249":3036,"_250":5621,"_252":3050,"_254":5622},{"_249":3006,"_250":5610,"_252":3036,"_254":5611},{"_249":2992,"_250":5588,"_252":3006,"_254":5589},{"_249":2964,"_250":5577,"_252":2992,"_254":5578},{"_249":2950,"_250":5558,"_252":2964,"_254":5559},{"_249":2923,"_250":5547,"_252":2950,"_254":5548},{"_249":2909,"_250":5528,"_252":2923,"_254":5529},{"_249":2882,"_250":5517,"_252":2909,"_254":5518},{"_249":2868,"_250":5498,"_252":2882,"_254":5499},{"_249":2840,"_250":5487,"_252":2868,"_254":5488},{"_249":2826,"_250":5468,"_252":2840,"_254":5469},{"_249":2798,"_250":5457,"_252":2826,"_254":5458},{"_249":2784,"_250":5438,"_252":2798,"_254":5439},{"_249":2756,"_250":5427,"_252":2784,"_254":5428},{"_249":2742,"_250":5408,"_252":2756,"_254":5409},{"_249":2714,"_250":5397,"_252":2742,"_254":5398},{"_249":2700,"_250":5378,"_252":2714,"_254":5379},{"_249":2669,"_250":5367,"_252":2700,"_254":5368},{"_249":2655,"_250":5345,"_252":2669,"_254":5346},{"_249":2624,"_250":5334,"_252":2655,"_254":5335},{"_249":2610,"_250":5312,"_252":2624,"_254":5313},{"_249":2579,"_250":5301,"_252":2610,"_254":5302},{"_249":2560,"_250":5279,"_252":2579,"_254":5280},{"_249":2544,"_250":5267,"_252":2560,"_254":5268},{"_249":2527,"_250":5255,"_252":2544,"_254":5256},{"_249":2517,"_250":5248,"_252":2527,"_254":5249},{"_249":2502,"_250":5236,"_252":2517,"_254":5237},{"_249":2305,"_250":5224,"_252":2502,"_254":5225},{"_249":2306,"_250":5205,"_252":2305,"_254":5206},{"_249":2432,"_250":5194,"_252":2306,"_254":5195},{"_249":2418,"_250":5172,"_252":2432,"_254":5173},{"_249":2381,"_250":5161,"_252":2418,"_254":5162},{"_249":2367,"_250":5139,"_252":2381,"_254":5140},{"_249":2314,"_250":5128,"_252":2367,"_254":5129},{"_249":2295,"_250":5106,"_252":2314,"_254":5107},{"_249":2283,"_250":5094,"_252":2295,"_254":5095},{"_249":2040,"_250":5088,"_252":2283,"_254":5089},{"_249":2025,"_250":4968,"_252":2040,"_254":4969},{"_249":2016,"_250":4959,"_252":2025,"_254":4960},{"_249":2006,"_250":4952,"_252":2016,"_254":4953},{"_249":1998,"_250":4945,"_252":2006,"_254":4946},{"_249":1981,"_250":4939,"_252":1998,"_254":4940},{"_249":1901,"_250":4927,"_252":1981,"_254":4928},{"_249":1959,"_250":4918,"_252":1901,"_254":4919},{"_249":1902,"_250":4911,"_252":1959,"_254":4912},{"_249":1935,"_250":4900,"_252":1902,"_254":4901},{"_249":1920,"_250":4893,"_252":1935,"_254":4894},{"_249":1910,"_250":4882,"_252":1920,"_254":4883},{"_249":1892,"_250":4875,"_252":1910,"_254":4876},{"_249":1880,"_250":4863,"_252":1892,"_254":4864},{"_249":1701,"_250":4857,"_252":1880,"_254":4858},{"_249":1690,"_250":4765,"_252":1701,"_254":4766},{"_249":1680,"_250":4758,"_252":1690,"_254":4759},{"_249":1670,"_250":4751,"_252":1680,"_254":4752},{"_249":1658,"_250":4745,"_252":1670,"_254":4746},{"_249":1643,"_250":4735,"_252":1658,"_254":4736},{"_249":1551,"_250":4724,"_252":1643,"_254":4725},{"_249":1617,"_250":4712,"_252":1551,"_254":4713},{"_249":1552,"_250":4704,"_252":1617,"_254":4705},{"_249":1592,"_250":4697,"_252":1552,"_254":4698},{"_249":1578,"_250":4690,"_252":1592,"_254":4691},{"_249":1569,"_250":4679,"_252":1578,"_254":4680},{"_249":1560,"_250":4672,"_252":1569,"_254":4673},{"_249":1532,"_250":4665,"_252":1560,"_254":4666},{"_249":1522,"_250":4653,"_252":1532,"_254":4654},{"_249":1493,"_250":4645,"_252":1522,"_254":4646},{"_249":1501,"_250":4638,"_252":1493,"_254":4639},{"_249":1483,"_250":4631,"_252":1501,"_254":4632},{"_249":1468,"_250":4619,"_252":1483,"_254":4620},{"_249":1401,"_250":4607,"_252":1468,"_254":4608},{"_249":1402,"_250":4600,"_252":1401,"_254":4601},{"_249":1435,"_250":4589,"_252":1402,"_254":4590},{"_249":1420,"_250":4582,"_252":1435,"_254":4583},{"_249":1410,"_250":4571,"_252":1420,"_254":4572},{"_249":1391,"_250":4564,"_252":1410,"_254":4565},{"_249":1379,"_250":4552,"_252":1391,"_254":4553},{"_249":828,"_250":4546,"_252":1379,"_254":4547},{"_249":814,"_250":4301,"_252":828,"_254":4302},{"_249":804,"_250":4294,"_252":814,"_254":4295},{"_249":785,"_250":4287,"_252":804,"_254":4288},{"_249":776,"_250":4277,"_252":785,"_254":4278},{"_249":765,"_250":4270,"_252":776,"_254":4271},{"_249":755,"_250":4263,"_252":765,"_254":4264},{"_249":735,"_250":4255,"_252":755,"_254":4256},{"_249":723,"_250":4248,"_252":735,"_254":4249},{"_249":707,"_250":4236,"_252":723,"_254":4237},{"_249":623,"_250":4224,"_252":707,"_254":4225},{"_249":624,"_250":4217,"_252":623,"_254":4218},{"_249":672,"_250":4206,"_252":624,"_254":4207},{"_249":653,"_250":4199,"_252":672,"_254":4200},{"_249":638,"_250":4188,"_252":653,"_254":4189},{"_249":607,"_250":4181,"_252":638,"_254":4182},{"_249":586,"_250":4169,"_252":607,"_254":4170},{"_249":253,"_250":4163,"_252":586,"_254":4164},{"_249":81,"_250":4060,"_252":253,"_254":4061},{"_249":81,"_256":4062,"_54":258,"_56":259,"_260":4063,"_262":263,"_264":34,"_265":266,"_267":4064,"_269":270,"_271":272},[],{"_582":583,"_267":4162},{"_577":578,"_579":4161},{"_273":4065,"_275":34,"_276":4066,"_278":4067,"_280":4068,"_282":109,"_283":4069,"_285":4070,"_287":288,"_289":34,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_298":34,"_299":253,"_300":301,"_302":10},{"_50":573,"_574":4160},[],[],[],{"_303":4071,"_305":4072,"_307":4073,"_309":4074,"_311":4075,"_313":4076,"_315":4077,"_317":4078,"_319":4079,"_321":4080,"_323":4081,"_325":4082,"_327":4083,"_329":4084,"_331":4085,"_333":4086,"_335":4087,"_337":4088,"_339":4089,"_341":4090,"_343":4091,"_345":4092,"_347":4093,"_349":4094,"_351":4095,"_353":4096,"_355":4097,"_357":4098,"_359":4099,"_361":4100,"_363":4101,"_365":4102,"_367":4103,"_369":4104,"_371":4105,"_373":4106,"_375":4107,"_377":4108,"_379":4109,"_381":4110,"_383":4111,"_385":4112,"_387":4113,"_389":4114,"_391":4115,"_393":4116,"_395":4117,"_397":4118,"_399":4119,"_401":4120,"_403":4121,"_405":4122,"_407":4123,"_409":4124,"_411":4125,"_413":4126,"_415":4127,"_417":4128,"_419":4129,"_421":4130,"_423":4131,"_425":4132,"_427":4133,"_429":4134,"_431":4135,"_433":4136,"_435":4137,"_437":4138,"_439":4139,"_441":4140,"_443":4141,"_445":4142,"_447":4143,"_449":4144,"_451":4145,"_453":4146,"_455":4147,"_457":4148,"_459":4149,"_461":4150,"_463":4151,"_465":4152,"_467":4153,"_469":4154,"_471":4155,"_473":4156,"_475":4157,"_477":4158,"_479":4159},[],{"_249":572,"_482":14,"_483":14,"_484":-5},{"_249":571,"_482":14,"_483":14,"_484":-5},{"_249":570,"_482":14,"_483":14,"_484":-5},{"_249":569,"_482":14,"_483":14,"_484":-5},{"_249":568,"_482":14,"_483":14,"_484":-5},{"_249":567,"_482":14,"_483":14,"_484":-5},{"_249":566,"_482":14,"_483":14,"_484":-5},{"_249":565,"_482":14,"_483":14,"_484":-5},{"_249":564,"_482":14,"_483":14,"_484":-5},{"_249":563,"_482":14,"_483":14,"_484":-5},{"_249":562,"_482":14,"_483":14,"_484":-5},{"_249":561,"_482":14,"_483":14,"_484":-5},{"_249":560,"_482":14,"_483":14,"_484":-5},{"_249":559,"_482":14,"_483":14,"_484":-5},{"_249":558,"_482":14,"_483":14,"_484":-5},{"_249":557,"_482":14,"_483":14,"_484":-5},{"_249":556,"_482":14,"_483":14,"_484":-5},{"_249":555,"_482":14,"_483":14,"_484":-5},{"_249":554,"_482":14,"_483":14,"_484":-5},{"_249":553,"_482":14,"_483":14,"_484":-5},{"_249":552,"_482":14,"_483":14,"_484":-5},{"_249":551,"_482":14,"_483":14,"_484":-5},{"_249":550,"_482":14,"_483":14,"_484":-5},{"_249":549,"_482":14,"_483":14,"_484":-5},{"_249":548,"_482":14,"_483":14,"_484":-5},{"_249":547,"_482":14,"_483":14,"_484":-5},{"_249":546,"_482":14,"_483":14,"_484":-5},{"_249":545,"_482":14,"_483":14,"_484":-5},{"_249":544,"_482":14,"_483":14,"_484":-5},{"_249":543,"_482":14,"_483":14,"_484":-5},{"_249":542,"_482":14,"_483":14,"_484":-5},{"_249":541,"_482":14,"_483":14,"_484":-5},{"_249":540,"_482":14,"_483":14,"_484":-5},{"_249":539,"_482":14,"_483":14,"_484":-5},{"_249":538,"_482":14,"_483":14,"_484":-5},{"_249":537,"_482":14,"_483":14,"_484":-5},{"_249":536,"_482":14,"_483":14,"_484":-5},{"_249":535,"_482":14,"_483":14,"_484":-5},{"_249":534,"_482":14,"_483":14,"_484":-5},{"_249":533,"_482":14,"_483":14,"_484":-5},{"_249":532,"_482":14,"_483":14,"_484":-5},{"_249":531,"_482":14,"_483":14,"_484":-5},{"_249":530,"_482":14,"_483":14,"_484":-5},{"_249":529,"_482":14,"_483":14,"_484":-5},{"_249":528,"_482":14,"_483":14,"_484":-5},{"_249":527,"_482":14,"_483":14,"_484":-5},{"_249":526,"_482":14,"_483":14,"_484":-5},{"_249":525,"_482":14,"_483":14,"_484":-5},{"_249":524,"_482":14,"_483":14,"_484":-5},{"_249":523,"_482":14,"_483":14,"_484":-5},{"_249":522,"_482":14,"_483":14,"_484":-5},{"_249":521,"_482":14,"_483":14,"_484":-5},{"_249":520,"_482":14,"_483":14,"_484":-5},{"_249":519,"_482":14,"_483":14,"_484":-5},{"_249":518,"_482":14,"_483":14,"_484":-5},{"_249":517,"_482":14,"_483":14,"_484":-5},{"_249":516,"_482":14,"_483":14,"_484":-5},{"_249":515,"_482":14,"_483":14,"_484":-5},{"_249":514,"_482":14,"_483":14,"_484":-5},{"_249":513,"_482":14,"_483":14,"_484":-5},{"_249":512,"_482":14,"_483":14,"_484":-5},{"_249":511,"_482":14,"_483":14,"_484":-5},{"_249":510,"_482":14,"_483":14,"_484":-5},{"_249":509,"_482":14,"_483":14,"_484":-5},{"_249":508,"_482":14,"_483":14,"_484":-5},{"_249":507,"_482":14,"_483":14,"_484":-5},{"_249":506,"_482":14,"_483":14,"_484":-5},{"_249":505,"_482":14,"_483":14,"_484":-5},{"_249":504,"_482":14,"_483":14,"_484":-5},{"_249":503,"_482":14,"_483":14,"_484":-5},{"_249":502,"_482":14,"_483":14,"_484":-5},{"_249":501,"_482":14,"_483":14,"_484":-5},{"_249":500,"_482":14,"_483":14,"_484":-5},{"_249":499,"_482":14,"_483":14,"_484":-5},{"_249":498,"_482":14,"_483":14,"_484":-5},{"_249":497,"_482":14,"_483":14,"_484":-5},{"_249":496,"_482":14,"_483":14,"_484":-5},{"_249":495,"_482":14,"_483":14,"_484":-5},{"_249":494,"_482":14,"_483":14,"_484":-5},{"_249":493,"_482":14,"_483":14,"_484":-5},{"_249":492,"_482":14,"_483":14,"_484":-5},{"_249":491,"_482":14,"_483":14,"_484":-5},{"_249":490,"_482":14,"_483":14,"_484":-5},{"_249":489,"_482":14,"_483":14,"_484":-5},{"_249":488,"_482":14,"_483":14,"_484":-5},{"_249":487,"_482":14,"_483":14,"_484":-5},{"_249":486,"_482":14,"_483":14,"_484":-5},{"_249":485,"_482":14,"_483":14,"_484":-5},{"_249":481,"_482":14,"_483":14,"_484":-5},[576],[581],{},{"_249":253,"_256":4165,"_54":589,"_260":4166,"_262":263,"_264":14,"_265":266,"_267":4167,"_269":270},[81],{"_582":583,"_267":4168},{"_577":603,"_260":604},{"_592":593,"_594":595,"_596":597,"_598":599,"_600":601,"_287":288,"_289":34,"_290":291,"_292":293,"_294":295,"_296":295,"_282":109,"_297":109,"_66":67,"_298":14,"_299":586,"_300":301,"_602":34,"_302":10},{},{"_249":586,"_256":4171,"_54":610,"_260":4172,"_262":263,"_264":14,"_265":266,"_267":4173,"_269":270},[253],{"_582":583,"_267":4180},{"_577":625,"_625":4177,"_627":628},{"_613":4174,"_592":615,"_616":617,"_618":4175,"_596":597,"_287":288,"_289":34,"_290":291,"_292":293,"_294":295,"_296":295,"_282":109,"_297":109,"_66":67,"_298":14,"_299":607,"_300":301,"_602":34,"_302":10},{"_621":4176},[620],[623,624],[4178],{"_630":631,"_260":632,"_633":4179,"_635":34},[],{},{"_249":607,"_256":4183,"_54":641,"_260":4184,"_262":263,"_265":266,"_267":4185,"_269":270},[586],{"_582":648,"_649":650,"_267":4187},{"_577":578,"_579":4186},{"_287":288,"_294":295,"_296":295,"_299":644,"_592":615,"_596":597,"_302":10,"_645":34},[647],{},{"_249":638,"_256":4190,"_54":656,"_260":4191,"_262":263,"_264":14,"_265":266,"_267":4192,"_269":650},[607],{"_582":583,"_267":4198},{"_577":620,"_667":668,"_578":669},{"_273":4193,"_275":34,"_276":4194,"_278":4195,"_282":109,"_602":34,"_662":34,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":663,"_300":301,"_592":615,"_618":4196,"_596":597,"_302":10,"_298":14},{"_50":573,"_574":4197},[],[],[620],[666],{},{"_249":653,"_256":4201,"_54":675,"_260":4202,"_262":263,"_265":266,"_267":4203,"_269":270},[638],{"_582":648,"_649":650,"_267":4205},{"_577":578,"_579":4204},{"_287":288,"_294":295,"_296":295,"_299":678,"_592":615,"_596":597,"_302":10,"_645":34},[647],{},{"_249":672,"_256":4208,"_54":684,"_260":4209,"_262":263,"_264":14,"_265":266,"_267":4210,"_269":650},[653],{"_582":583,"_267":4216},{"_577":620,"_667":668,"_578":693},{"_273":4211,"_275":34,"_276":4212,"_278":4213,"_282":109,"_602":34,"_662":34,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":690,"_300":301,"_592":615,"_618":4214,"_596":597,"_302":10,"_298":14},{"_50":573,"_574":4215},[],[],[620],[666],{},{"_249":624,"_256":4219,"_54":698,"_260":4220,"_262":263,"_265":266,"_267":4221,"_269":270},[672],{"_582":648,"_649":650,"_267":4223},{"_577":578,"_579":4222},{"_287":288,"_294":295,"_296":295,"_299":701,"_702":-5,"_703":-5,"_592":615,"_596":597,"_302":10,"_645":34},[647],{},{"_249":623,"_256":4226,"_54":710,"_260":4227,"_262":263,"_264":14,"_265":266,"_267":4228,"_269":650},[624],{"_582":583,"_267":4235},{"_577":620,"_667":668,"_578":720},{"_273":4229,"_275":34,"_276":4230,"_278":4231,"_282":109,"_602":34,"_662":34,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":707,"_300":301,"_702":4232,"_703":717,"_592":615,"_618":4233,"_596":597,"_302":10,"_298":14},{"_50":573,"_574":4234},[],[],[717],[620],[666],{},{"_249":707,"_256":4238,"_54":726,"_260":4239,"_262":263,"_264":14,"_265":266,"_267":4240,"_269":270},[623],{"_582":583,"_267":4247},{"_577":625,"_625":4244,"_627":737},{"_613":4241,"_592":615,"_616":730,"_618":4242,"_596":597,"_287":288,"_289":34,"_290":291,"_292":293,"_294":295,"_296":295,"_282":109,"_297":109,"_66":67,"_298":14,"_299":732,"_300":301,"_602":34,"_302":10},{"_621":4243},[733],[735],[4245],{"_630":739,"_260":632,"_633":4246,"_635":34},[],{},{"_249":723,"_256":4250,"_54":745,"_56":746,"_260":4251,"_262":263,"_265":266,"_267":4252,"_269":270,"_271":749},[707],{"_582":648,"_649":752,"_267":4254},{"_577":578,"_579":4253},{"_703":750,"_596":597,"_287":288,"_294":295,"_296":295,"_299":735,"_302":10,"_645":34},[647],{},{"_249":735,"_256":4257,"_54":758,"_260":4258,"_262":263,"_264":14,"_265":266,"_267":4259,"_269":752},[723],{"_582":583,"_267":4262},{"_577":578,"_579":4261},{"_702":4260,"_703":750,"_596":597,"_287":288,"_294":295,"_296":295,"_299":755,"_302":10,"_645":34},[750],[647],{},{"_249":755,"_256":4265,"_54":768,"_260":4266,"_262":263,"_265":266,"_267":4267,"_269":270,"_271":749},[735],{"_582":773,"_267":4269},{"_577":578,"_579":4268},{"_282":109,"_596":597,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":765,"_300":301,"_302":10,"_771":34,"_298":14},[632],{},{"_249":765,"_256":4272,"_54":779,"_260":4273,"_262":263,"_265":266,"_267":4274,"_269":270,"_271":749},[755],{"_582":648,"_649":733,"_267":4276},{"_577":578,"_579":4275},{"_596":597,"_287":288,"_294":295,"_296":295,"_299":776,"_302":10,"_645":34},[647],{},{"_249":776,"_256":4279,"_54":788,"_260":4280,"_262":263,"_264":14,"_265":266,"_267":4281,"_269":791,"_271":749},[765],{"_582":583,"_267":4286},{"_577":620,"_667":800,"_578":801},{"_273":4282,"_275":34,"_276":4283,"_278":4284,"_282":109,"_795":796,"_797":796,"_596":597,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":798,"_300":301,"_302":10,"_298":14},{"_50":573,"_574":4285},[],[],[666],{},{"_249":785,"_256":4289,"_54":807,"_260":4290,"_262":263,"_265":266,"_267":4291,"_269":270},[776],{"_582":773,"_267":4293},{"_577":578,"_579":4292},{"_771":34,"_300":810,"_282":109,"_287":288,"_290":291,"_292":293,"_294":295,"_296":295,"_297":109,"_66":67,"_299":804,"_302":10,"_298":14},[632],{},{"_249":804,"_256":4296,"_54":817,"_56":818,"_260":4297,"_262":263,"_265":266,"_267":4298,"_269":270},[785],{"_582":825,"_267":4300},{"_577":578,"_579":4299},{"_821":34,"_290":291,"_822":-5,"_294":295,"_296":295,"_300":810,"_302":10,"_298":14},[824],{},{"_249":814,"_256":4303,"_54":831,"_56":832,"_260":4304,"_262":263,"_264":34,"_265":266,"_267":4305,"_269":270,"_271":272},[804],{"_582":583,"_267":4545},{"_577":578,"_579":4544},{"_273":4306,"_275":34,"_278":4307,"_285":4308,"_62":4309,"_280":4310,"_276":4311,"_282":109,"_283":4312,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_298":34,"_299":828,"_300":844,"_302":10},{"_50":573,"_574":4543},[4470,4471,4472,4473,4474,4475,4476,4477],[4444,4445,4446,4447,4448],[1149,1150,1151,1152,1153,1154,1155,1156,1157,1158,1159,1160,1161,1162],[],[],{"_303":4313,"_305":4314,"_307":4315,"_309":4316,"_311":4317,"_313":4318,"_315":4319,"_317":4320,"_319":4321,"_321":4322,"_323":4323,"_325":4324,"_327":4325,"_329":4326,"_331":4327,"_333":4328,"_335":4329,"_337":4330,"_339":4331,"_341":4332,"_343":4333,"_345":4334,"_347":4335,"_349":4336,"_351":4337,"_353":4338,"_355":4339,"_357":4340,"_359":4341,"_361":4342,"_363":4343,"_365":4344,"_367":4345,"_369":4346,"_371":4347,"_373":4348,"_375":4349,"_377":4350,"_379":4351,"_381":4352,"_383":4353,"_385":4354,"_387":4355,"_389":4356,"_391":4357,"_393":4358,"_395":4359,"_397":4360,"_399":4361,"_401":4362,"_403":4363,"_405":4364,"_407":4365,"_409":4366,"_411":4367,"_413":4368,"_415":4369,"_417":4370,"_419":4371,"_421":4372,"_423":4373,"_425":4374,"_427":4375,"_429":4376,"_431":4377,"_433":4378,"_435":4379,"_437":4380,"_439":4381,"_441":4382,"_443":4383,"_445":4384,"_447":4385,"_449":4386,"_451":4387,"_453":4388,"_455":4389,"_457":4390,"_459":4391,"_461":4392,"_463":4393,"_465":4394,"_467":4395,"_469":4396,"_471":4397,"_473":4398,"_475":4399,"_477":4400,"_479":4401,"_934":4402,"_936":4403,"_938":4404,"_940":4405,"_942":4406,"_944":4407,"_946":4408,"_948":4409,"_950":4410,"_952":4411,"_954":4412,"_956":4413,"_958":4414,"_960":4415,"_962":4416,"_964":4417,"_966":4418,"_968":4419,"_970":4420,"_972":4421,"_974":4422,"_976":4423,"_978":4424,"_980":4425,"_982":4426,"_984":4427,"_986":4428,"_988":4429,"_990":4430,"_992":4431,"_994":4432,"_996":4433,"_998":4434,"_1000":4435,"_1002":4436,"_1004":4437,"_1006":4438,"_1008":4439,"_1010":4440,"_1012":4441,"_1014":4442,"_1016":4443},{"_249":1148,"_482":14,"_483":14,"_484":-5},{"_249":1147,"_482":14,"_483":14,"_484":-5},{"_249":1146,"_482":14,"_483":14,"_484":-5},{"_249":1145,"_482":14,"_483":14,"_484":-5},{"_249":1144,"_482":14,"_483":14,"_484":-5},{"_249":1143,"_482":14,"_483":14,"_484":-5},{"_249":1142,"_482":14,"_483":14,"_484":-5},{"_249":1141,"_482":14,"_483":14,"_484":-5},{"_249":1140,"_482":14,"_483":14,"_484":-5},{"_249":1139,"_482":14,"_483":14,"_484":-5},{"_249":1138,"_482":14,"_483":14,"_484":-5},{"_249":1137,"_482":14,"_483":14,"_484":-5},{"_249":1136,"_482":14,"_483":14,"_484":-5},{"_249":1135,"_482":14,"_483":14,"_484":-5},{"_249":1134,"_482":14,"_483":14,"_484":-5},{"_249":1133,"_482":14,"_483":14,"_484":-5},{"_249":1132,"_482":14,"_483":14,"_484":-5},{"_249":1131,"_482":14,"_483":14,"_484":-5},{"_249":1130,"_482":14,"_483":14,"_484":-5},{"_249":1129,"_482":14,"_483":14,"_484":-5},{"_249":1128,"_482":14,"_483":14,"_484":-5},{"_249":1127,"_482":14,"_483":14,"_484":-5},{"_249":1126,"_482":14,"_483":14,"_484":-5},{"_249":1125,"_482":14,"_483":14,"_484":-5},{"_249":1124,"_482":14,"_483":14,"_484":-5},{"_249":1123,"_482":14,"_483":14,"_484":-5},{"_249":1122,"_482":14,"_483":14,"_484":-5},{"_249":1121,"_482":14,"_483":14,"_484":-5},{"_249":1120,"_482":14,"_483":14,"_484":-5},{"_249":1119,"_482":14,"_483":14,"_484":-5},{"_249":1118,"_482":14,"_483":14,"_484":-5},{"_249":1117,"_482":14,"_483":14,"_484":-5},{"_249":1116,"_482":14,"_483":14,"_484":-5},{"_249":1115,"_482":14,"_483":14,"_484":-5},{"_249":1114,"_482":14,"_483":14,"_484":-5},{"_249":1113,"_482":14,"_483":14,"_484":-5},{"_249":1112,"_482":14,"_483":14,"_484":-5},{"_249":1111,"_482":14,"_483":14,"_484":-5},{"_249":1110,"_482":14,"_483":14,"_484":-5},{"_249":1109,"_482":14,"_483":14,"_484":-5},{"_249":1108,"_482":14,"_483":14,"_484":-5},{"_249":1107,"_482":14,"_483":14,"_484":-5},{"_249":1106,"_482":14,"_483":14,"_484":-5},{"_249":1105,"_482":14,"_483":14,"_484":-5},{"_249":1104,"_482":14,"_483":14,"_484":-5},{"_249":1103,"_482":14,"_483":14,"_484":-5},{"_249":1102,"_482":14,"_483":14,"_484":-5},{"_249":1101,"_482":14,"_483":14,"_484":-5},{"_249":1100,"_482":14,"_483":14,"_484":-5},{"_249":1099,"_482":14,"_483":14,"_484":-5},{"_249":1098,"_482":14,"_483":14,"_484":-5},{"_249":1097,"_482":14,"_483":14,"_484":-5},{"_249":1096,"_482":14,"_483":14,"_484":-5},{"_249":1095,"_482":14,"_483":14,"_484":-5},{"_249":1094,"_482":14,"_483":14,"_484":-5},{"_249":1093,"_482":14,"_483":14,"_484":-5},{"_249":1092,"_482":14,"_483":14,"_484":-5},{"_249":1091,"_482":14,"_483":14,"_484":-5},{"_249":1090,"_482":14,"_483":14,"_484":-5},{"_249":1089,"_482":14,"_483":14,"_484":-5},{"_249":1088,"_482":14,"_483":14,"_484":-5},{"_249":1087,"_482":14,"_483":14,"_484":-5},{"_249":1086,"_482":14,"_483":14,"_484":-5},{"_249":1085,"_482":14,"_483":14,"_484":-5},{"_249":1084,"_482":14,"_483":14,"_484":-5},{"_249":1083,"_482":14,"_483":14,"_484":-5},{"_249":1082,"_482":14,"_483":14,"_484":-5},{"_249":1081,"_482":14,"_483":14,"_484":-5},{"_249":1080,"_482":14,"_483":14,"_484":-5},{"_249":1079,"_482":14,"_483":14,"_484":-5},{"_249":1078,"_482":14,"_483":14,"_484":-5},{"_249":1077,"_482":14,"_483":14,"_484":-5},{"_249":1076,"_482":14,"_483":14,"_484":-5},{"_249":1075,"_482":14,"_483":14,"_484":-5},{"_249":1074,"_482":14,"_483":14,"_484":-5},{"_249":1073,"_482":14,"_483":14,"_484":-5},{"_249":1072,"_482":14,"_483":14,"_484":-5},{"_249":1071,"_482":14,"_483":14,"_484":-5},{"_249":1070,"_482":14,"_483":14,"_484":-5},{"_249":1069,"_482":14,"_483":14,"_484":-5},{"_249":1068,"_482":14,"_483":14,"_484":-5},{"_249":1067,"_482":14,"_483":14,"_484":-5},{"_249":1066,"_482":14,"_483":14,"_484":-5},{"_249":1065,"_482":14,"_483":14,"_484":-5},{"_249":1064,"_482":14,"_483":14,"_484":-5},{"_249":1063,"_482":14,"_483":14,"_484":-5},{"_249":1062,"_482":14,"_483":14,"_484":-5},{"_249":1061,"_482":14,"_483":14,"_484":-5},{"_249":1060,"_482":14,"_483":14,"_484":-5},{"_249":1059,"_482":14,"_483":14,"_484":-5},{"_249":1058,"_482":14,"_483":14,"_484":-5},{"_249":1057,"_482":14,"_483":14,"_484":-5},{"_249":1056,"_482":14,"_483":14,"_484":-5},{"_249":1055,"_482":14,"_483":14,"_484":-5},{"_249":1054,"_482":14,"_483":14,"_484":-5},{"_249":1053,"_482":14,"_483":14,"_484":-5},{"_249":1052,"_482":14,"_483":14,"_484":-5},{"_249":1051,"_482":14,"_483":14,"_484":-5},{"_249":1050,"_482":14,"_483":14,"_484":-5},{"_249":1049,"_482":14,"_483":14,"_484":-5},{"_249":1048,"_482":14,"_483":14,"_484":-5},{"_249":1047,"_482":14,"_483":14,"_484":-5},{"_249":1046,"_482":14,"_483":14,"_484":-5},{"_249":1045,"_482":14,"_483":14,"_484":-5},{"_249":1044,"_482":14,"_483":14,"_484":-5},{"_249":1043,"_482":14,"_483":14,"_484":-5},{"_249":1042,"_482":14,"_483":14,"_484":-5},{"_249":1041,"_482":14,"_483":14,"_484":-5},{"_249":1040,"_482":14,"_483":14,"_484":-5},{"_249":1039,"_482":14,"_483":14,"_484":-5},{"_249":1038,"_482":14,"_483":14,"_484":-5},{"_249":1037,"_482":14,"_483":14,"_484":-5},{"_249":1036,"_482":14,"_483":14,"_484":-5},{"_249":1035,"_482":14,"_483":14,"_484":-5},{"_249":1034,"_482":14,"_483":14,"_484":-5},{"_249":1033,"_482":14,"_483":14,"_484":-5},{"_249":1032,"_482":14,"_483":14,"_484":-5},{"_249":1031,"_482":14,"_483":14,"_484":-5},{"_249":1030,"_482":14,"_483":14,"_484":-5},{"_249":1029,"_482":14,"_483":14,"_484":-5},{"_249":1028,"_482":14,"_483":14,"_484":-5},{"_249":1027,"_482":14,"_483":14,"_484":-5},{"_249":1026,"_482":14,"_483":14,"_484":-5},{"_249":1025,"_482":14,"_483":14,"_484":-5},{"_249":1024,"_482":14,"_483":14,"_484":-5},{"_249":1023,"_482":14,"_483":14,"_484":-5},{"_249":1022,"_482":14,"_483":14,"_484":-5},{"_249":1021,"_482":14,"_483":14,"_484":-5},{"_249":1020,"_482":14,"_483":14,"_484":-5},{"_249":1019,"_482":14,"_483":14,"_484":-5},{"_249":1018,"_482":14,"_483":14,"_484":-5},{"_50":1168,"_1169":1231,"_1171":4467},{"_50":1168,"_1169":1216,"_1171":4462},{"_50":1168,"_1169":1204,"_1171":4457},{"_50":1168,"_1169":1190,"_1171":4452},{"_50":1168,"_1169":1170,"_1171":4449},[4450],{"_50":1174,"_41":1175,"_53":1176,"_1177":1178,"_1179":4451,"_1181":1182,"_1183":1170},{"_1184":1185,"_1186":1187,"_1188":1189},[4453,4454],{"_50":1174,"_41":1199,"_53":1200,"_1177":1201,"_1179":4456,"_1181":-5,"_1183":1190},{"_50":1174,"_41":1194,"_53":1195,"_1177":1196,"_1179":4455,"_1181":-5,"_1183":1190},{"_1184":1185,"_1186":1187,"_1188":1198},{"_1184":1185,"_1186":1187,"_1188":1203},[4458,4459],{"_50":1174,"_41":1158,"_53":1212,"_1177":1213,"_1179":4461,"_1181":-5,"_1183":1204},{"_50":1174,"_41":1156,"_53":1208,"_1177":1209,"_1179":4460,"_1181":-5,"_1183":1204},{"_1184":1185,"_1186":1187,"_1188":1211},{"_1184":1185,"_1186":1187,"_1188":1215},[4463,4464],{"_50":1174,"_41":1150,"_53":1226,"_1177":1227,"_1179":4466,"_1181":1229,"_1183":1216},{"_50":1174,"_41":1220,"_53":1221,"_1177":1222,"_1179":4465,"_1181":1224,"_1183":1216},{"_1184":1185,"_1186":1187,"_1188":1225},{"_1184":1185,"_1186":1187,"_1188":1230},[4468],{"_50":1174,"_41":1234,"_53":1235,"_1177":1236,"_1179":4469,"_1181":1238,"_1183":1231},{"_1184":1185,"_1186":1187,"_1188":266},{"_1248":1357,"_1256":-5,"_1250":1358,"_1252":1359,"_62":4531,"_1259":4532,"_47":1282,"_1254":-5,"_50":1283,"_1284":4533,"_1286":4534,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1344,"_1256":-5,"_1250":1345,"_1252":1346,"_62":4521,"_1259":4522,"_47":1323,"_1254":-5,"_50":1283,"_1284":4523,"_1286":4524,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1331,"_1256":-5,"_1250":1332,"_1252":1333,"_62":4513,"_1259":4514,"_47":1336,"_1254":-5,"_50":1283,"_1284":4515,"_1286":4516,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1318,"_1256":-5,"_1250":1319,"_1252":1320,"_62":4505,"_1259":4506,"_47":1323,"_1254":-5,"_50":1283,"_1284":4507,"_1286":4508,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1302,"_1256":-5,"_1250":1303,"_1252":1304,"_62":4495,"_1259":4496,"_47":1307,"_1254":-5,"_50":1283,"_1284":4497,"_1286":4498,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1277,"_1256":-5,"_1250":1278,"_1252":1279,"_62":4485,"_1259":4486,"_47":1282,"_1254":-5,"_50":1283,"_1284":4487,"_1286":4488,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":1255,"_1256":-5,"_1250":1257,"_1252":1257,"_62":4478,"_1259":4479,"_47":632,"_1254":-5,"_50":1261,"_1262":4480,"_1264":14},{"_50":1247,"_1248":1249,"_1250":1251,"_1252":1253,"_47":1249,"_1254":824},[],[],[4481,4482,4483,4484],{"_53":1275,"_41":1154,"_1183":1276},{"_53":1273,"_41":1152,"_1183":1274},{"_53":1271,"_41":1160,"_1183":1272},{"_53":1269,"_41":1162,"_1183":1270},[1153,1154,1155,1156],[],[4489],[],{"_53":1275,"_41":1154,"_1183":1276,"_1181":-5,"_1177":632,"_1292":-5,"_1293":4490,"_1259":4491,"_1296":-5,"_1297":-5},[4494],[4492,4493],{"_1184":1185,"_1186":1187,"_1188":1300},{"_1184":1185,"_1186":1187,"_1188":1211},{"_53":1208,"_41":1156,"_1181":-5,"_1177":632,"_1183":1272},[1149,1150,1161,1162],[],[4499],[],{"_53":1269,"_41":1162,"_1183":1270,"_1181":-5,"_1177":632,"_1292":-5,"_1293":4500,"_1259":4501,"_1296":-5,"_1297":-5},[4504],[4502,4503],{"_1184":1185,"_1186":1187,"_1188":1315},{"_1184":1185,"_1186":1187,"_1188":1230},{"_53":1226,"_41":1150,"_1181":-5,"_1177":632,"_1183":1317},[1151,1152],[],[4509],[],{"_53":1273,"_41":1152,"_1183":1274,"_1181":1327,"_1177":632,"_1292":-5,"_1293":4510,"_1259":4511,"_1296":-5,"_1297":-5},[],[4512],{"_1184":1185,"_1186":1187,"_1188":1185},[1159,1160],[],[4517],[],{"_53":1271,"_41":1160,"_1183":1272,"_1181":-5,"_1177":632,"_1292":-5,"_1293":4518,"_1259":4519,"_1296":-5,"_1297":-5},[],[4520],{"_1184":1185,"_1186":1187,"_1188":1343},[1151,1152,1157,1158],[],[4525],[],{"_53":1273,"_41":1152,"_1183":1274,"_1181":1327,"_1177":632,"_1292":-5,"_1293":4526,"_1259":4527,"_1296":-5,"_1297":-5},[4530],[4528,4529],{"_1184":1185,"_1186":1187,"_1188":1185},{"_1184":1185,"_1186":1187,"_1188":1215},{"_53":1212,"_41":1158,"_1181":-5,"_1177":632,"_1183":1272},[1153,1154,1159,1160,1161,1162],[],[4535],[],{"_53":1275,"_41":1154,"_1183":1276,"_1181":-5,"_1177":632,"_1292":-5,"_1293":4536,"_1259":4537,"_1296":-5,"_1297":-5},[4541,4542],[4538,4539,4540],{"_1184":1185,"_1186":1187,"_1188":1300},{"_1184":1185,"_1186":1187,"_1188":1315},{"_1184":1185,"_1186":1187,"_1188":1343},{"_53":1269,"_41":1162,"_1181":-5,"_1177":632,"_1183":1270},{"_53":1271,"_41":1160,"_1181":-5,"_1177":632,"_1183":1272},[576],[1374],{"_1376":1377},{"_249":828,"_256":4548,"_54":1382,"_260":4549,"_262":263,"_264":14,"_265":266,"_267":4550,"_269":270},[814],{"_582":583,"_267":4551},{"_577":603,"_260":1388},{"_592":593,"_594":1385,"_596":1386,"_598":1387,"_600":601,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1379,"_300":844,"_602":34,"_302":10},{},{"_249":1379,"_256":4554,"_54":1394,"_260":4555,"_262":263,"_264":14,"_265":266,"_267":4556,"_269":270},[828],{"_582":583,"_267":4563},{"_577":625,"_625":4560,"_627":1404},{"_613":4557,"_592":615,"_616":617,"_618":4558,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1399,"_300":844,"_602":34,"_302":10},{"_621":4559},[620],[1401,1402],[4561],{"_630":1406,"_260":632,"_633":4562,"_635":34},[],{},{"_249":1391,"_256":4566,"_54":1413,"_260":4567,"_262":263,"_265":266,"_267":4568,"_269":270},[1379],{"_582":648,"_649":650,"_267":4570},{"_577":578,"_579":4569},{"_287":288,"_294":843,"_296":843,"_299":1416,"_592":615,"_596":1386,"_302":10,"_645":34},[647],{},{"_249":1410,"_256":4573,"_54":1423,"_260":4574,"_262":263,"_264":14,"_265":266,"_267":4575,"_269":650},[1391],{"_582":583,"_267":4581},{"_577":620,"_667":668,"_578":1432},{"_273":4576,"_275":34,"_276":4577,"_278":4578,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1429,"_300":844,"_592":615,"_618":4579,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":4580},[],[],[620],[666],{},{"_249":1420,"_256":4584,"_54":1438,"_260":4585,"_262":263,"_265":266,"_267":4586,"_269":270},[1410],{"_582":648,"_649":650,"_267":4588},{"_577":578,"_579":4587},{"_287":288,"_294":843,"_296":843,"_299":1441,"_592":615,"_596":1386,"_302":10,"_645":34},[647],{},{"_249":1435,"_256":4591,"_54":1447,"_260":4592,"_262":263,"_264":14,"_265":266,"_267":4593,"_269":650},[1420],{"_582":583,"_267":4599},{"_577":620,"_667":668,"_578":1456},{"_273":4594,"_275":34,"_276":4595,"_278":4596,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1453,"_300":844,"_592":615,"_618":4597,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":4598},[],[],[620],[666],{},{"_249":1402,"_256":4602,"_54":1461,"_260":4603,"_262":263,"_265":266,"_267":4604,"_269":270},[1435],{"_582":648,"_649":650,"_267":4606},{"_577":578,"_579":4605},{"_287":288,"_294":843,"_296":843,"_299":1464,"_702":-5,"_703":-5,"_592":615,"_596":1386,"_302":10,"_645":34},[647],{},{"_249":1401,"_256":4609,"_54":1471,"_260":4610,"_262":263,"_264":14,"_265":266,"_267":4611,"_269":650},[1402],{"_582":583,"_267":4618},{"_577":620,"_667":668,"_578":1480},{"_273":4612,"_275":34,"_276":4613,"_278":4614,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1468,"_300":844,"_702":4615,"_703":717,"_592":615,"_618":4616,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":4617},[],[],[717],[620],[666],{},{"_249":1468,"_256":4621,"_54":1486,"_260":4622,"_262":263,"_264":14,"_265":266,"_267":4623,"_269":270},[1401],{"_582":583,"_267":4630},{"_577":625,"_625":4627,"_627":1495},{"_613":4624,"_592":615,"_616":730,"_618":4625,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1491,"_300":844,"_602":34,"_302":10},{"_621":4626},[733],[1493],[4628],{"_630":1497,"_260":632,"_633":4629,"_635":34},[],{},{"_249":1483,"_256":4633,"_54":1504,"_56":1505,"_260":4634,"_262":263,"_265":266,"_267":4635,"_269":270,"_271":749},[1468],{"_582":648,"_649":752,"_267":4637},{"_577":578,"_579":4636},{"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1509,"_302":10,"_645":34},[647],{},{"_249":1501,"_256":4640,"_54":1515,"_56":1516,"_260":4641,"_262":263,"_265":266,"_267":4642,"_269":270,"_271":749},[1483],{"_582":648,"_649":752,"_267":4644},{"_577":578,"_579":4643},{"_771":34,"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1493,"_302":10,"_645":34},[647],{},{"_249":1493,"_256":4647,"_54":1525,"_260":4648,"_262":263,"_264":14,"_265":266,"_267":4649,"_269":752},[1501],{"_582":583,"_267":4652},{"_577":578,"_579":4651},{"_702":4650,"_703":1508,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1522,"_302":10,"_645":34},[1508],[647],{},{"_249":1522,"_256":4655,"_54":1535,"_260":4656,"_262":263,"_264":14,"_265":266,"_267":4657,"_269":270},[1493],{"_582":583,"_267":4664},{"_577":625,"_625":4661,"_627":1554},{"_613":4658,"_592":615,"_616":1539,"_618":4659,"_596":1386,"_287":288,"_289":34,"_290":842,"_292":293,"_294":843,"_296":843,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1532,"_300":844,"_602":34,"_302":10},{"_621":4660},[1541,1542,1543,1544,1545,1546,1547,1548,1549],[1551,1552],[4662],{"_630":1556,"_260":632,"_633":4663,"_635":34},[],{},{"_249":1532,"_256":4667,"_54":1563,"_260":4668,"_262":263,"_265":266,"_267":4669,"_269":270,"_271":749},[1522],{"_582":773,"_267":4671},{"_577":578,"_579":4670},{"_282":109,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1560,"_300":844,"_302":10,"_771":34,"_298":14},[632],{},{"_249":1560,"_256":4674,"_54":1572,"_260":4675,"_262":263,"_265":266,"_267":4676,"_269":270,"_271":749},[1532],{"_582":648,"_649":733,"_267":4678},{"_577":578,"_579":4677},{"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1569,"_302":10,"_645":34},[647],{},{"_249":1569,"_256":4681,"_54":1581,"_260":4682,"_262":263,"_264":14,"_265":266,"_267":4683,"_269":791,"_271":749},[1560],{"_582":583,"_267":4689},{"_577":620,"_667":800,"_578":1589},{"_273":4684,"_275":34,"_278":4685,"_280":4686,"_276":4687,"_282":109,"_795":796,"_797":796,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1578,"_300":844,"_302":10,"_298":14},{"_50":573,"_574":4688},[],[],[],[666],{},{"_249":1578,"_256":4692,"_54":1595,"_260":4693,"_262":263,"_265":266,"_267":4694,"_269":270},[1569],{"_582":773,"_267":4696},{"_577":578,"_579":4695},{"_771":34,"_1598":1599,"_282":109,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1600,"_300":844,"_302":10,"_298":14},[632],{},{"_249":1592,"_256":4699,"_54":1606,"_260":4700,"_262":263,"_265":266,"_267":4701,"_269":270},[1578],{"_582":648,"_649":1613,"_267":4703},{"_577":578,"_579":4702},{"_287":288,"_294":843,"_296":843,"_299":1609,"_1610":1611,"_592":615,"_596":1386,"_302":10,"_645":34},[647],{"_1376":1615},{"_249":1552,"_256":4706,"_54":1620,"_260":4707,"_262":263,"_265":266,"_267":4708,"_269":270},[1592],{"_582":648,"_649":1613,"_267":4711},{"_577":578,"_579":4710},{"_702":4709,"_703":1624,"_592":615,"_596":1386,"_287":288,"_294":843,"_296":843,"_299":1617,"_302":10,"_645":34},[1624],[647],{"_1376":1615},{"_249":1617,"_256":4714,"_54":1630,"_260":4715,"_262":263,"_264":14,"_265":266,"_267":4716,"_269":1613},[1552],{"_582":583,"_267":4723},{"_577":578,"_579":4722},{"_273":4717,"_275":34,"_276":4718,"_278":4719,"_282":109,"_602":34,"_662":34,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1636,"_300":844,"_592":615,"_618":4720,"_596":1386,"_302":10,"_298":14},{"_50":573,"_574":4721},[],[],[1638],[666],[632],{},{"_249":1551,"_256":4726,"_54":1646,"_260":4727,"_262":263,"_265":266,"_267":4728,"_269":1539},[1617],{"_582":583,"_267":4734},{"_577":578,"_579":4733},{"_276":4729,"_278":4730,"_282":109,"_702":4731,"_703":1652,"_592":615,"_618":4732,"_596":1386,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1654,"_300":844,"_302":10,"_298":14},[],[],[1652],[1638],[632],{},{"_249":1643,"_256":4737,"_54":1661,"_260":4738,"_262":263,"_265":266,"_267":4739,"_269":583},[1551],{"_582":773,"_267":4744},{"_577":578,"_579":4743},{"_771":34,"_276":4740,"_278":4741,"_280":4742,"_282":109,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1658,"_300":844,"_302":10,"_298":14},[],[],[],[632],{},{"_249":1658,"_256":4747,"_54":1673,"_260":4748,"_262":263,"_265":266,"_267":4749,"_269":270},[1643],{"_582":583,"_267":4750},{"_577":1676,"_1677":632},{"_287":288,"_294":843,"_296":843,"_299":1670,"_302":10,"_645":34},{},{"_249":1670,"_256":4753,"_54":1683,"_260":4754,"_262":263,"_265":266,"_267":4755,"_269":270},[1658],{"_582":773,"_267":4757},{"_577":578,"_579":4756},{"_771":34,"_300":1686,"_282":109,"_287":288,"_290":842,"_292":293,"_294":843,"_296":843,"_297":109,"_66":67,"_299":1680,"_302":10,"_298":14},[632],{},{"_249":1680,"_256":4760,"_54":1693,"_56":1694,"_260":4761,"_262":263,"_265":266,"_267":4762,"_269":270},[1670],{"_582":825,"_267":4764},{"_577":578,"_579":4763},{"_821":34,"_290":842,"_822":-5,"_294":843,"_296":843,"_300":1686,"_302":10,"_298":14},[1698],{},{"_249":1690,"_256":4767,"_54":1704,"_56":1705,"_260":4768,"_262":263,"_264":34,"_265":266,"_267":4769,"_269":270,"_271":272},[1680],{"_582":583,"_267":4856},{"_577":578,"_579":4855},{"_273":4770,"_275":34,"_276":4771,"_278":4772,"_280":4773,"_282":109,"_283":4774,"_285":4775,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_298":34,"_299":1701,"_300":1716,"_302":10},{"_50":573,"_574":4854},[],[4853],[],{"_303":4776,"_305":4777,"_307":4778,"_309":4779,"_311":4780,"_313":4781,"_315":4782,"_317":4783,"_319":4784,"_321":4785,"_323":4786,"_325":4787,"_327":4788,"_329":4789,"_331":4790,"_333":4791,"_335":4792,"_337":4793,"_339":4794,"_341":4795,"_343":4796,"_345":4797,"_347":4798,"_349":4799,"_351":4800,"_353":4801,"_355":4802,"_357":4803,"_359":4804,"_361":4805,"_363":4806,"_365":4807,"_367":4808,"_369":4809,"_371":4810,"_373":4811,"_375":4812,"_377":4813,"_379":4814,"_381":4815,"_383":4816,"_385":4817,"_387":4818,"_389":4819,"_391":4820,"_393":4821,"_395":4822,"_397":4823,"_399":4824,"_401":4825,"_403":4826,"_405":4827,"_407":4828,"_409":4829,"_411":4830,"_413":4831,"_415":4832,"_417":4833,"_419":4834,"_421":4835,"_423":4836,"_425":4837,"_427":4838,"_429":4839,"_431":4840,"_433":4841,"_435":4842,"_437":4843,"_439":4844,"_441":4845,"_443":4846,"_445":4847,"_447":4848,"_449":4849,"_451":4850,"_453":4851,"_455":4852},[],{"_249":1870,"_482":14,"_483":14,"_484":-5},{"_249":1869,"_482":14,"_483":14,"_484":-5},{"_249":1868,"_482":14,"_483":14,"_484":-5},{"_249":1867,"_482":14,"_483":14,"_484":-5},{"_249":1866,"_482":14,"_483":14,"_484":-5},{"_249":1865,"_482":14,"_483":14,"_484":-5},{"_249":1864,"_482":14,"_483":14,"_484":-5},{"_249":1863,"_482":14,"_483":14,"_484":-5},{"_249":1862,"_482":14,"_483":14,"_484":-5},{"_249":1861,"_482":14,"_483":14,"_484":-5},{"_249":1860,"_482":14,"_483":14,"_484":-5},{"_249":1859,"_482":14,"_483":14,"_484":-5},{"_249":1858,"_482":14,"_483":14,"_484":-5},{"_249":1857,"_482":14,"_483":14,"_484":-5},{"_249":1856,"_482":14,"_483":14,"_484":-5},{"_249":1855,"_482":14,"_483":14,"_484":-5},{"_249":1854,"_482":14,"_483":14,"_484":-5},{"_249":1853,"_482":14,"_483":14,"_484":-5},{"_249":1852,"_482":14,"_483":14,"_484":-5},{"_249":1851,"_482":14,"_483":14,"_484":-5},{"_249":1850,"_482":14,"_483":14,"_484":-5},{"_249":1849,"_482":14,"_483":14,"_484":-5},{"_249":1848,"_482":14,"_483":14,"_484":-5},{"_249":1847,"_482":14,"_483":14,"_484":-5},{"_249":1846,"_482":14,"_483":14,"_484":-5},{"_249":1845,"_482":14,"_483":14,"_484":-5},{"_249":1844,"_482":14,"_483":14,"_484":-5},{"_249":1843,"_482":14,"_483":14,"_484":-5},{"_249":1842,"_482":14,"_483":14,"_484":-5},{"_249":1841,"_482":14,"_483":14,"_484":-5},{"_249":1840,"_482":14,"_483":14,"_484":-5},{"_249":1839,"_482":14,"_483":14,"_484":-5},{"_249":1838,"_482":14,"_483":14,"_484":-5},{"_249":1837,"_482":14,"_483":14,"_484":-5},{"_249":1836,"_482":14,"_483":14,"_484":-5},{"_249":1835,"_482":14,"_483":14,"_484":-5},{"_249":1834,"_482":14,"_483":14,"_484":-5},{"_249":1833,"_482":14,"_483":14,"_484":-5},{"_249":1832,"_482":14,"_483":14,"_484":-5},{"_249":1831,"_482":14,"_483":14,"_484":-5},{"_249":1830,"_482":14,"_483":14,"_484":-5},{"_249":1829,"_482":14,"_483":14,"_484":-5},{"_249":1828,"_482":14,"_483":14,"_484":-5},{"_249":1827,"_482":14,"_483":14,"_484":-5},{"_249":1826,"_482":14,"_483":14,"_484":-5},{"_249":1825,"_482":14,"_483":14,"_484":-5},{"_249":1824,"_482":14,"_483":14,"_484":-5},{"_249":1823,"_482":14,"_483":14,"_484":-5},{"_249":1822,"_482":14,"_483":14,"_484":-5},{"_249":1821,"_482":14,"_483":14,"_484":-5},{"_249":1820,"_482":14,"_483":14,"_484":-5},{"_249":1819,"_482":14,"_483":14,"_484":-5},{"_249":1818,"_482":14,"_483":14,"_484":-5},{"_249":1817,"_482":14,"_483":14,"_484":-5},{"_249":1816,"_482":14,"_483":14,"_484":-5},{"_249":1815,"_482":14,"_483":14,"_484":-5},{"_249":1814,"_482":14,"_483":14,"_484":-5},{"_249":1813,"_482":14,"_483":14,"_484":-5},{"_249":1812,"_482":14,"_483":14,"_484":-5},{"_249":1811,"_482":14,"_483":14,"_484":-5},{"_249":1810,"_482":14,"_483":14,"_484":-5},{"_249":1809,"_482":14,"_483":14,"_484":-5},{"_249":1808,"_482":14,"_483":14,"_484":-5},{"_249":1807,"_482":14,"_483":14,"_484":-5},{"_249":1806,"_482":14,"_483":14,"_484":-5},{"_249":1805,"_482":14,"_483":14,"_484":-5},{"_249":1804,"_482":14,"_483":14,"_484":-5},{"_249":1803,"_482":14,"_483":14,"_484":-5},{"_249":1802,"_482":14,"_483":14,"_484":-5},{"_249":1801,"_482":14,"_483":14,"_484":-5},{"_249":1800,"_482":14,"_483":14,"_484":-5},{"_249":1799,"_482":14,"_483":14,"_484":-5},{"_249":1798,"_482":14,"_483":14,"_484":-5},{"_249":1797,"_482":14,"_483":14,"_484":-5},{"_249":1796,"_482":14,"_483":14,"_484":-5},{"_249":1795,"_482":14,"_483":14,"_484":-5},{"_249":1794,"_482":14,"_483":14,"_484":-5},{"_50":1247,"_1248":1872,"_1250":1873,"_1252":1874,"_47":1872,"_1254":1698},[576],[1877],{},{"_249":1701,"_256":4859,"_54":1883,"_260":4860,"_262":263,"_264":14,"_265":266,"_267":4861,"_269":270},[1690],{"_582":583,"_267":4862},{"_577":603,"_260":1889},{"_592":593,"_594":1886,"_596":1887,"_598":1888,"_600":601,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1880,"_300":1716,"_602":34,"_302":10},{},{"_249":1880,"_256":4865,"_54":1895,"_260":4866,"_262":263,"_264":14,"_265":266,"_267":4867,"_269":270},[1701],{"_582":583,"_267":4874},{"_577":625,"_625":4871,"_627":1904},{"_613":4868,"_592":615,"_616":617,"_618":4869,"_596":1887,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_298":14,"_299":1892,"_300":1716,"_602":34,"_302":10},{"_621":4870},[620],[1901,1902],[4872],{"_630":1906,"_260":632,"_633":4873,"_635":34},[],{},{"_249":1892,"_256":4877,"_54":1913,"_260":4878,"_262":263,"_265":266,"_267":4879,"_269":270},[1880],{"_582":648,"_649":650,"_267":4881},{"_577":578,"_579":4880},{"_287":288,"_294":1715,"_296":1715,"_299":1916,"_592":615,"_596":1887,"_302":10,"_645":34},[647],{},{"_249":1910,"_256":4884,"_54":1923,"_260":4885,"_262":263,"_264":14,"_265":266,"_267":4886,"_269":650},[1892],{"_582":583,"_267":4892},{"_577":620,"_667":668,"_578":1932},{"_273":4887,"_275":34,"_276":4888,"_278":4889,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1929,"_300":1716,"_592":615,"_618":4890,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":4891},[],[],[620],[666],{},{"_249":1920,"_256":4895,"_54":1938,"_260":4896,"_262":263,"_265":266,"_267":4897,"_269":270},[1910],{"_582":648,"_649":650,"_267":4899},{"_577":578,"_579":4898},{"_287":288,"_294":1715,"_296":1715,"_299":1941,"_592":615,"_596":1887,"_302":10,"_645":34},[647],{},{"_249":1935,"_256":4902,"_54":1947,"_260":4903,"_262":263,"_264":14,"_265":266,"_267":4904,"_269":650},[1920],{"_582":583,"_267":4910},{"_577":620,"_667":668,"_578":1956},{"_273":4905,"_275":34,"_276":4906,"_278":4907,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1953,"_300":1716,"_592":615,"_618":4908,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":4909},[],[],[620],[666],{},{"_249":1902,"_256":4913,"_54":1962,"_260":4914,"_262":263,"_265":266,"_267":4915,"_269":270},[1935],{"_582":648,"_649":650,"_267":4917},{"_577":578,"_579":4916},{"_287":288,"_294":1715,"_296":1715,"_299":1965,"_702":-5,"_703":-5,"_592":615,"_596":1887,"_302":10,"_645":34},[647],{},{"_249":1959,"_256":4920,"_54":1971,"_260":4921,"_262":1973,"_264":14,"_265":266,"_267":4922,"_269":270},[1902],{"_582":583,"_267":4926},{"_577":625,"_625":4923,"_627":1976},{"_592":615,"_596":1887,"_287":288,"_289":34,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_282":109,"_297":109,"_66":67,"_299":1901,"_300":1716,"_302":10,"_298":14},[4924],{"_630":632,"_260":632,"_633":4925,"_635":34},[],{},{"_249":1901,"_256":4929,"_54":1984,"_260":4930,"_262":263,"_264":14,"_265":266,"_267":4931,"_269":650},[1959],{"_582":583,"_267":4938},{"_577":620,"_667":668,"_578":1995},{"_273":4932,"_275":34,"_276":4933,"_278":4934,"_282":109,"_602":34,"_662":34,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":1990,"_300":1716,"_702":4935,"_703":1992,"_592":615,"_618":4936,"_596":1887,"_302":10,"_298":14},{"_50":573,"_574":4937},[],[],[1992],[620],[666],{},{"_249":1981,"_256":4941,"_54":2001,"_260":4942,"_262":263,"_265":266,"_267":4943,"_269":270},[1901],{"_582":583,"_267":4944},{"_577":1676,"_1677":632},{"_287":288,"_294":1715,"_296":1715,"_299":1998,"_302":10,"_645":34},{},{"_249":1998,"_256":4947,"_54":2009,"_260":4948,"_262":263,"_265":266,"_267":4949,"_269":270},[1981],{"_582":773,"_267":4951},{"_577":578,"_579":4950},{"_771":34,"_300":2012,"_282":109,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":2006,"_302":10,"_298":14},[632],{},{"_249":2006,"_256":4954,"_54":2019,"_260":4955,"_262":263,"_265":266,"_267":4956,"_269":270},[1998],{"_582":773,"_267":4958},{"_577":578,"_579":4957},{"_771":34,"_300":2012,"_282":109,"_287":288,"_290":1714,"_292":293,"_294":1715,"_296":1715,"_297":109,"_66":67,"_299":2016,"_302":10,"_298":14},[632],{},{"_249":2016,"_256":4961,"_54":2028,"_56":2029,"_260":4962,"_262":263,"_265":266,"_267":4963,"_269":270},[2006],{"_582":825,"_267":4967},{"_577":578,"_579":4966},{"_2032":4964,"_290":1714,"_822":-5,"_294":1715,"_296":1715,"_300":2012,"_302":10,"_298":14},{"_2034":4965},[],[2037],{},{"_249":2025,"_256":4970,"_54":2043,"_56":2044,"_260":4971,"_262":263,"_264":34,"_265":266,"_267":4972,"_269":270,"_271":272},[2016],{"_582":583,"_267":5087},{"_577":578,"_579":5086},{"_273":4973,"_275":34,"_276":4974,"_278":4975,"_280":4976,"_282":109,"_283":4977,"_285":4978,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_298":34,"_299":2040,"_300":2055,"_2056":4979,"_302":10},{"_50":573,"_574":5085},[],[5084],[],{"_303":4980,"_305":4981,"_307":4982,"_309":4983,"_311":4984,"_313":4985,"_315":4986,"_317":4987,"_319":4988,"_321":4989,"_323":4990,"_325":4991,"_327":4992,"_329":4993,"_331":4994,"_333":4995,"_335":4996,"_337":4997,"_339":4998,"_341":4999,"_343":5000,"_345":5001,"_347":5002,"_349":5003,"_351":5004,"_353":5005,"_355":5006,"_357":5007,"_359":5008,"_361":5009,"_363":5010,"_365":5011,"_367":5012,"_369":5013,"_371":5014,"_373":5015,"_375":5016,"_377":5017,"_379":5018,"_381":5019,"_383":5020,"_385":5021,"_387":5022,"_389":5023,"_391":5024,"_393":5025,"_395":5026,"_397":5027,"_399":5028,"_401":5029,"_403":5030,"_405":5031,"_407":5032,"_409":5033,"_411":5034,"_413":5035,"_415":5036,"_417":5037,"_419":5038,"_421":5039,"_423":5040,"_425":5041,"_427":5042,"_429":5043,"_431":5044,"_433":5045,"_435":5046,"_437":5047,"_439":5048,"_441":5049,"_443":5050,"_445":5051,"_447":5052,"_449":5053,"_451":5054,"_453":5055,"_455":5056,"_457":5057,"_459":5058,"_461":5059,"_463":5060,"_465":5061,"_467":5062,"_469":5063,"_471":5064,"_473":5065,"_475":5066,"_477":5067,"_479":5068,"_934":5069,"_936":5070,"_938":5071,"_940":5072,"_942":5073,"_944":5074,"_946":5075,"_948":5076,"_950":5077,"_952":5078,"_954":5079,"_956":5080,"_958":5081,"_960":5082,"_962":5083},[],{"_2058":2059,"_2060":2061,"_2062":-5,"_2063":2064},{"_249":2272,"_482":14,"_483":14,"_484":-5},{"_249":2271,"_482":14,"_483":14,"_484":-5},{"_249":2270,"_482":14,"_483":14,"_484":-5},{"_249":2269,"_482":14,"_483":14,"_484":-5},{"_249":2268,"_482":14,"_483":14,"_484":-5},{"_249":2267,"_482":14,"_483":14,"_484":-5},{"_249":2266,"_482":14,"_483":14,"_484":-5},{"_249":2265,"_482":14,"_483":14,"_484":-5},{"_249":2264,"_482":14,"_483":14,"_484":-5},{"_249":2263,"_482":14,"_483":14,"_484":-5},{"_249":2262,"_482":14,"_483":14,"_484":-5},{"_249":2261,"_482":14,"_483":14,"_484":-5},{"_249":2260,"_482":14,"_483":14,"_484":-5},{"_249":2259,"_482":14,"_483":14,"_484":-5},{"_249":2258,"_482":14,"_483":14,"_484":-5},{"_249":2257,"_482":14,"_483":14,"_484":-5},{"_249":2256,"_482":14,"_483":14,"_484":-5},{"_249":2255,"_482":14,"_483":14,"_484":-5},{"_249":2254,"_482":14,"_483":14,"_484":-5},{"_249":2253,"_482":14,"_483":14,"_484":-5},{"_249":2252,"_482":14,"_483":14,"_484":-5},{"_249":2251,"_482":14,"_483":14,"_484":-5},{"_249":2250,"_482":14,"_483":14,"_484":-5},{"_249":2249,"_482":14,"_483":14,"_484":-5},{"_249":2248,"_482":14,"_483":14,"_484":-5},{"_249":2247,"_482":14,"_483":14,"_484":-5},{"_249":2246,"_482":14,"_483":14,"_484":-5},{"_249":2245,"_482":14,"_483":14,"_484":-5},{"_249":2244,"_482":14,"_483":14,"_484":-5},{"_249":2243,"_482":14,"_483":14,"_484":-5},{"_249":2242,"_482":14,"_483":14,"_484":-5},{"_249":2241,"_482":14,"_483":14,"_484":-5},{"_249":2240,"_482":14,"_483":14,"_484":-5},{"_249":2239,"_482":14,"_483":14,"_484":-5},{"_249":2238,"_482":14,"_483":14,"_484":-5},{"_249":2237,"_482":14,"_483":14,"_484":-5},{"_249":2236,"_482":14,"_483":14,"_484":-5},{"_249":2235,"_482":14,"_483":14,"_484":-5},{"_249":2234,"_482":14,"_483":14,"_484":-5},{"_249":2233,"_482":14,"_483":14,"_484":-5},{"_249":2232,"_482":14,"_483":14,"_484":-5},{"_249":2231,"_482":14,"_483":14,"_484":-5},{"_249":2230,"_482":14,"_483":14,"_484":-5},{"_249":2229,"_482":14,"_483":14,"_484":-5},{"_249":2228,"_482":14,"_483":14,"_484":-5},{"_249":2227,"_482":14,"_483":14,"_484":-5},{"_249":2226,"_482":14,"_483":14,"_484":-5},{"_249":2225,"_482":14,"_483":14,"_484":-5},{"_249":2224,"_482":14,"_483":14,"_484":-5},{"_249":2223,"_482":14,"_483":14,"_484":-5},{"_249":2222,"_482":14,"_483":14,"_484":-5},{"_249":2221,"_482":14,"_483":14,"_484":-5},{"_249":2220,"_482":14,"_483":14,"_484":-5},{"_249":2219,"_482":14,"_483":14,"_484":-5},{"_249":2218,"_482":14,"_483":14,"_484":-5},{"_249":2217,"_482":14,"_483":14,"_484":-5},{"_249":2216,"_482":14,"_483":14,"_484":-5},{"_249":2215,"_482":14,"_483":14,"_484":-5},{"_249":2214,"_482":14,"_483":14,"_484":-5},{"_249":2213,"_482":14,"_483":14,"_484":-5},{"_249":2212,"_482":14,"_483":14,"_484":-5},{"_249":2211,"_482":14,"_483":14,"_484":-5},{"_249":2210,"_482":14,"_483":14,"_484":-5},{"_249":2209,"_482":14,"_483":14,"_484":-5},{"_249":2208,"_482":14,"_483":14,"_484":-5},{"_249":2207,"_482":14,"_483":14,"_484":-5},{"_249":2206,"_482":14,"_483":14,"_484":-5},{"_249":2205,"_482":14,"_483":14,"_484":-5},{"_249":2204,"_482":14,"_483":14,"_484":-5},{"_249":2203,"_482":14,"_483":14,"_484":-5},{"_249":2202,"_482":14,"_483":14,"_484":-5},{"_249":2201,"_482":14,"_483":14,"_484":-5},{"_249":2200,"_482":14,"_483":14,"_484":-5},{"_249":2199,"_482":14,"_483":14,"_484":-5},{"_249":2198,"_482":14,"_483":14,"_484":-5},{"_249":2197,"_482":14,"_483":14,"_484":-5},{"_249":2196,"_482":14,"_483":14,"_484":-5},{"_249":2195,"_482":14,"_483":14,"_484":-5},{"_249":2194,"_482":14,"_483":14,"_484":-5},{"_249":2193,"_482":14,"_483":14,"_484":-5},{"_249":2192,"_482":14,"_483":14,"_484":-5},{"_249":2191,"_482":14,"_483":14,"_484":-5},{"_249":2190,"_482":14,"_483":14,"_484":-5},{"_249":2189,"_482":14,"_483":14,"_484":-5},{"_249":2188,"_482":14,"_483":14,"_484":-5},{"_249":2187,"_482":14,"_483":14,"_484":-5},{"_249":2186,"_482":14,"_483":14,"_484":-5},{"_249":2185,"_482":14,"_483":14,"_484":-5},{"_249":2184,"_482":14,"_483":14,"_484":-5},{"_249":2183,"_482":14,"_483":14,"_484":-5},{"_249":2182,"_482":14,"_483":14,"_484":-5},{"_249":2181,"_482":14,"_483":14,"_484":-5},{"_249":2180,"_482":14,"_483":14,"_484":-5},{"_249":2179,"_482":14,"_483":14,"_484":-5},{"_249":2178,"_482":14,"_483":14,"_484":-5},{"_249":2177,"_482":14,"_483":14,"_484":-5},{"_249":2176,"_482":14,"_483":14,"_484":-5},{"_249":2175,"_482":14,"_483":14,"_484":-5},{"_249":2174,"_482":14,"_483":14,"_484":-5},{"_249":2173,"_482":14,"_483":14,"_484":-5},{"_249":2172,"_482":14,"_483":14,"_484":-5},{"_249":2171,"_482":14,"_483":14,"_484":-5},{"_249":2170,"_482":14,"_483":14,"_484":-5},{"_249":2169,"_482":14,"_483":14,"_484":-5},{"_50":1247,"_1248":2274,"_1250":2275,"_1252":2276,"_47":2274,"_1254":2277},[576],[2280],{},{"_249":2040,"_256":5090,"_54":2286,"_260":5091,"_262":263,"_264":14,"_265":266,"_267":5092,"_269":270},[2025],{"_582":583,"_267":5093},{"_577":603,"_260":2292},{"_592":593,"_594":2289,"_596":2290,"_598":2291,"_600":601,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2283,"_300":2055,"_602":34,"_302":10},{},{"_249":2283,"_256":5096,"_54":2298,"_260":5097,"_262":263,"_264":14,"_265":266,"_267":5098,"_269":270},[2040],{"_582":583,"_267":5105},{"_577":625,"_625":5102,"_627":2308},{"_613":5099,"_592":615,"_616":2302,"_618":5100,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2295,"_300":2055,"_602":34,"_302":10},{"_621":5101},[620],[2305,2306],[5103],{"_630":2310,"_260":632,"_633":5104,"_635":34},[],{},{"_249":2295,"_256":5108,"_54":2317,"_56":2318,"_260":5109,"_262":263,"_265":266,"_267":5110,"_269":270},[2283],{"_582":648,"_649":2302,"_267":5127},{"_577":2364,"_578":2332},{"_275":34,"_2321":5111,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2323,"_300":2055,"_592":615,"_618":5112,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2327,"_2328":2317,"_56":2318,"_620":2329,"_2330":2318,"_2331":2332,"_2333":-5,"_2334":-5,"_2335":5113,"_2337":5114,"_2339":-5},[620],[],[5115,5116,5117,5118],{"_2344":262,"_2345":5125,"_260":5126},{"_2344":2359,"_2345":5124},{"_2345":5121,"_2344":2355,"_260":5122},{"_2344":262,"_2345":5119,"_260":5120},{"_2350":2351,"_2352":2353},{"_2348":2349},{"_2350":2351,"_2352":2353},{"_51":5123},{"_2358":2332},{"_2350":2351,"_2352":2353},{"_2350":2351,"_2352":2353},{"_2348":2363},{},{"_249":2314,"_256":5130,"_54":2370,"_260":5131,"_262":263,"_264":14,"_265":266,"_267":5132,"_269":2302},[2295],{"_582":583,"_267":5138},{"_577":620,"_667":668,"_578":2329},{"_273":5133,"_275":34,"_276":5134,"_278":5135,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2376,"_300":2055,"_592":615,"_618":5136,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5137},[],[],[620],[666],{},{"_249":2367,"_256":5141,"_54":2384,"_56":2385,"_260":5142,"_262":263,"_265":266,"_267":5143,"_269":270},[2314],{"_582":648,"_649":2302,"_267":5160},{"_577":2364,"_578":2406},{"_275":34,"_2321":5144,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2389,"_300":2055,"_592":615,"_618":5145,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2391,"_2328":2384,"_56":2385,"_620":2392,"_2330":2385,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5146,"_2337":5147,"_2339":-5},[620],[5159],[5148,5149,5150,5151],{"_2344":262,"_2345":5157,"_260":5158},{"_2344":2359,"_2345":5156},{"_2344":2402,"_2345":5154,"_260":5155},{"_2344":262,"_2345":5152,"_260":5153},{"_2350":2401,"_2352":2353},{"_2348":2349},{"_2350":2401,"_2352":2353},{"_649":2405,"_578":2406},{"_2350":2401,"_2352":2353},{"_2350":2401,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2412,"_2413":2405,"_2414":2415,"_578":2406},{},{"_249":2381,"_256":5163,"_54":2421,"_260":5164,"_262":263,"_264":14,"_265":266,"_267":5165,"_269":2302},[2367],{"_582":583,"_267":5171},{"_577":620,"_667":668,"_578":2392},{"_273":5166,"_275":34,"_276":5167,"_278":5168,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2427,"_300":2055,"_592":615,"_618":5169,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5170},[],[],[620],[666],{},{"_249":2418,"_256":5174,"_54":2435,"_56":2436,"_260":5175,"_262":263,"_265":266,"_267":5176,"_269":270},[2381],{"_582":648,"_649":2302,"_267":5193},{"_577":2364,"_578":2444},{"_275":34,"_2321":5177,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2440,"_300":2055,"_592":615,"_618":5178,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2442,"_2328":2435,"_56":2436,"_620":2443,"_2330":2436,"_2331":2444,"_2333":-5,"_2334":-5,"_2335":5179,"_2337":5180,"_2339":-5},[620],[],[5181,5182,5183,5184],{"_2344":262,"_2345":5191,"_260":5192},{"_2344":2359,"_2345":5190},{"_2345":5187,"_2344":2355,"_260":5188},{"_2344":262,"_2345":5185,"_260":5186},{"_2350":2453,"_2352":2353},{"_2348":2349},{"_2350":2453,"_2352":2353},{"_51":5189},{"_2358":2444},{"_2350":2453,"_2352":2353},{"_2350":2453,"_2352":2353},{"_2348":2363},{},{"_249":2432,"_256":5196,"_54":2464,"_260":5197,"_262":263,"_264":14,"_265":266,"_267":5198,"_269":2302},[2418],{"_582":583,"_267":5204},{"_577":620,"_667":668,"_578":2443},{"_273":5199,"_275":34,"_276":5200,"_278":5201,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2470,"_300":2055,"_592":615,"_618":5202,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5203},[],[],[620],[666],{},{"_249":2306,"_256":5207,"_54":2477,"_56":2478,"_260":5208,"_262":263,"_265":266,"_267":5209,"_269":270},[2432],{"_582":648,"_649":2302,"_267":5223},{"_577":2364,"_578":2499},{"_275":34,"_2321":5210,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2482,"_300":2055,"_702":-5,"_703":-5,"_592":615,"_618":5211,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2484,"_2328":2477,"_56":2478,"_620":2485,"_2330":2478,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5212,"_2337":5213,"_2339":-5},[620],[5222],[5214,5215,5216],{"_2344":262,"_2345":5220,"_260":5221},{"_2344":2359,"_2345":5219},{"_2344":262,"_2345":5217,"_260":5218},{"_2350":2493,"_2352":2353},{"_2348":2349},{"_2350":2493,"_2352":2353},{"_2350":2493,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2498,"_2413":2405,"_2414":2415,"_578":2499},{},{"_249":2305,"_256":5226,"_54":2505,"_260":5227,"_262":263,"_264":14,"_265":266,"_267":5228,"_269":2302},[2306],{"_582":583,"_267":5235},{"_577":620,"_667":668,"_578":2485},{"_273":5229,"_275":34,"_276":5230,"_278":5231,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2502,"_300":2055,"_702":5232,"_703":2512,"_592":615,"_618":5233,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5234},[],[],[2512],[620],[666],{},{"_249":2502,"_256":5238,"_54":2520,"_260":5239,"_262":263,"_264":14,"_265":266,"_267":5240,"_269":270},[2305],{"_582":583,"_267":5247},{"_577":625,"_625":5244,"_627":2529},{"_613":5241,"_592":615,"_616":617,"_618":5242,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2525,"_300":2055,"_602":34,"_302":10},{"_621":5243},[620],[2527,2517],[5245],{"_630":2531,"_260":632,"_633":5246,"_635":34},[],{},{"_249":2517,"_256":5250,"_54":2537,"_260":5251,"_262":263,"_265":266,"_267":5252,"_269":270},[2502],{"_582":648,"_649":650,"_267":5254},{"_577":578,"_579":5253},{"_287":288,"_294":2054,"_296":2054,"_299":2540,"_702":-5,"_703":-5,"_592":615,"_596":2290,"_302":10,"_645":34},[647],{},{"_249":2527,"_256":5257,"_54":2547,"_260":5258,"_262":263,"_264":14,"_265":266,"_267":5259,"_269":650},[2517],{"_582":583,"_267":5266},{"_577":620,"_667":668,"_578":2557},{"_273":5260,"_275":34,"_276":5261,"_278":5262,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2544,"_300":2055,"_702":5263,"_703":2554,"_592":615,"_618":5264,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5265},[],[],[2554],[620],[666],{},{"_249":2544,"_256":5269,"_54":2563,"_260":5270,"_262":263,"_264":14,"_265":266,"_267":5271,"_269":270},[2527],{"_582":583,"_267":5278},{"_577":625,"_625":5275,"_627":2573},{"_613":5272,"_592":615,"_616":2302,"_618":5273,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_298":14,"_299":2568,"_300":2055,"_602":34,"_302":10},{"_621":5274},[620],[2570,2571],[5276],{"_630":2575,"_260":632,"_633":5277,"_635":34},[],{},{"_249":2560,"_256":5281,"_54":2582,"_56":2583,"_260":5282,"_262":263,"_265":266,"_267":5283,"_269":270},[2544],{"_582":648,"_649":2302,"_267":5300},{"_577":2364,"_578":2602},{"_275":34,"_2321":5284,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2587,"_300":2055,"_592":615,"_618":5285,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2589,"_2328":2582,"_56":2583,"_620":2590,"_2330":2583,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5286,"_2337":5287,"_2339":-5},[620],[5299],[5288,5289,5290,5291],{"_2344":262,"_2345":5297,"_260":5298},{"_2344":2359,"_2345":5296},{"_2344":2402,"_2345":5294,"_260":5295},{"_2344":262,"_2345":5292,"_260":5293},{"_2350":2599,"_2352":2353},{"_2348":2349},{"_2350":2599,"_2352":2353},{"_649":2405,"_578":2602},{"_2350":2599,"_2352":2353},{"_2350":2599,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2607,"_2413":2405,"_2414":2415,"_578":2602},{},{"_249":2579,"_256":5303,"_54":2613,"_260":5304,"_262":263,"_264":14,"_265":266,"_267":5305,"_269":2302},[2560],{"_582":583,"_267":5311},{"_577":620,"_667":668,"_578":2590},{"_273":5306,"_275":34,"_276":5307,"_278":5308,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2619,"_300":2055,"_592":615,"_618":5309,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5310},[],[],[620],[666],{},{"_249":2610,"_256":5314,"_54":2627,"_56":2628,"_260":5315,"_262":263,"_265":266,"_267":5316,"_269":270},[2579],{"_582":648,"_649":2302,"_267":5333},{"_577":2364,"_578":2647},{"_275":34,"_2321":5317,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2632,"_300":2055,"_592":615,"_618":5318,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2634,"_2328":2627,"_56":2628,"_620":2635,"_2330":2628,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5319,"_2337":5320,"_2339":-5},[620],[5332],[5321,5322,5323,5324],{"_2344":262,"_2345":5330,"_260":5331},{"_2344":2359,"_2345":5329},{"_2344":2402,"_2345":5327,"_260":5328},{"_2344":262,"_2345":5325,"_260":5326},{"_2350":2644,"_2352":2353},{"_2348":2349},{"_2350":2644,"_2352":2353},{"_649":2405,"_578":2647},{"_2350":2644,"_2352":2353},{"_2350":2644,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2652,"_2413":2405,"_2414":2415,"_578":2647},{},{"_249":2624,"_256":5336,"_54":2658,"_260":5337,"_262":263,"_264":14,"_265":266,"_267":5338,"_269":2302},[2610],{"_582":583,"_267":5344},{"_577":620,"_667":668,"_578":2635},{"_273":5339,"_275":34,"_276":5340,"_278":5341,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2664,"_300":2055,"_592":615,"_618":5342,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5343},[],[],[620],[666],{},{"_249":2655,"_256":5347,"_54":2672,"_56":2673,"_260":5348,"_262":263,"_265":266,"_267":5349,"_269":270},[2624],{"_582":648,"_649":2302,"_267":5366},{"_577":2364,"_578":2692},{"_275":34,"_2321":5350,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2677,"_300":2055,"_592":615,"_618":5351,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2679,"_2328":2672,"_56":2673,"_620":2680,"_2330":2673,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5352,"_2337":5353,"_2339":-5},[620],[5365],[5354,5355,5356,5357],{"_2344":262,"_2345":5363,"_260":5364},{"_2344":2359,"_2345":5362},{"_2344":2402,"_2345":5360,"_260":5361},{"_2344":262,"_2345":5358,"_260":5359},{"_2350":2689,"_2352":2353},{"_2348":2349},{"_2350":2689,"_2352":2353},{"_649":2405,"_578":2692},{"_2350":2689,"_2352":2353},{"_2350":2689,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2697,"_2413":2405,"_2414":2415,"_578":2692},{},{"_249":2669,"_256":5369,"_54":2703,"_260":5370,"_262":263,"_264":14,"_265":266,"_267":5371,"_269":2302},[2655],{"_582":583,"_267":5377},{"_577":620,"_667":668,"_578":2680},{"_273":5372,"_275":34,"_276":5373,"_278":5374,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2709,"_300":2055,"_592":615,"_618":5375,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5376},[],[],[620],[666],{},{"_249":2700,"_256":5380,"_54":2717,"_56":2718,"_260":5381,"_262":263,"_265":266,"_267":5382,"_269":270},[2669],{"_582":648,"_649":2302,"_267":5396},{"_577":2364,"_578":2739},{"_275":34,"_2321":5383,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2722,"_300":2055,"_592":615,"_618":5384,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2724,"_2328":2717,"_56":2718,"_620":2725,"_2330":2718,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5385,"_2337":5386,"_2339":-5},[620],[5395],[5387,5388,5389],{"_2344":262,"_2345":5393,"_260":5394},{"_2344":2359,"_2345":5392},{"_2344":262,"_2345":5390,"_260":5391},{"_2350":2733,"_2352":2353},{"_2348":2349},{"_2350":2733,"_2352":2353},{"_2350":2733,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2738,"_2413":2405,"_2414":2415,"_578":2739},{},{"_249":2714,"_256":5399,"_54":2745,"_260":5400,"_262":263,"_264":14,"_265":266,"_267":5401,"_269":2302},[2700],{"_582":583,"_267":5407},{"_577":620,"_667":668,"_578":2725},{"_273":5402,"_275":34,"_276":5403,"_278":5404,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2751,"_300":2055,"_592":615,"_618":5405,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5406},[],[],[620],[666],{},{"_249":2742,"_256":5410,"_54":2759,"_56":2760,"_260":5411,"_262":263,"_265":266,"_267":5412,"_269":270},[2714],{"_582":648,"_649":2302,"_267":5426},{"_577":2364,"_578":2781},{"_275":34,"_2321":5413,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2764,"_300":2055,"_592":615,"_618":5414,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2766,"_2328":2759,"_56":2760,"_620":2767,"_2330":2760,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5415,"_2337":5416,"_2339":-5},[620],[5425],[5417,5418,5419],{"_2344":262,"_2345":5423,"_260":5424},{"_2344":2359,"_2345":5422},{"_2344":262,"_2345":5420,"_260":5421},{"_2350":2775,"_2352":2353},{"_2348":2349},{"_2350":2775,"_2352":2353},{"_2350":2775,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2780,"_2413":2405,"_2414":2415,"_578":2781},{},{"_249":2756,"_256":5429,"_54":2787,"_260":5430,"_262":263,"_264":14,"_265":266,"_267":5431,"_269":2302},[2742],{"_582":583,"_267":5437},{"_577":620,"_667":668,"_578":2767},{"_273":5432,"_275":34,"_276":5433,"_278":5434,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2793,"_300":2055,"_592":615,"_618":5435,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5436},[],[],[620],[666],{},{"_249":2784,"_256":5440,"_54":2801,"_56":2802,"_260":5441,"_262":263,"_265":266,"_267":5442,"_269":270},[2756],{"_582":648,"_649":2302,"_267":5456},{"_577":2364,"_578":2823},{"_275":34,"_2321":5443,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2806,"_300":2055,"_592":615,"_618":5444,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2808,"_2328":2801,"_56":2802,"_620":2809,"_2330":2802,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5445,"_2337":5446,"_2339":-5},[620],[5455],[5447,5448,5449],{"_2344":262,"_2345":5453,"_260":5454},{"_2344":2359,"_2345":5452},{"_2344":262,"_2345":5450,"_260":5451},{"_2350":2817,"_2352":2353},{"_2348":2349},{"_2350":2817,"_2352":2353},{"_2350":2817,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2822,"_2413":2405,"_2414":2415,"_578":2823},{},{"_249":2798,"_256":5459,"_54":2829,"_260":5460,"_262":263,"_264":14,"_265":266,"_267":5461,"_269":2302},[2784],{"_582":583,"_267":5467},{"_577":620,"_667":668,"_578":2809},{"_273":5462,"_275":34,"_276":5463,"_278":5464,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2835,"_300":2055,"_592":615,"_618":5465,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5466},[],[],[620],[666],{},{"_249":2826,"_256":5470,"_54":2843,"_56":2844,"_260":5471,"_262":263,"_265":266,"_267":5472,"_269":270},[2798],{"_582":648,"_649":2302,"_267":5486},{"_577":2364,"_578":2865},{"_275":34,"_2321":5473,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2848,"_300":2055,"_592":615,"_618":5474,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2850,"_2328":2843,"_56":2844,"_620":2851,"_2330":2844,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5475,"_2337":5476,"_2339":-5},[620],[5485],[5477,5478,5479],{"_2344":262,"_2345":5483,"_260":5484},{"_2344":2359,"_2345":5482},{"_2344":262,"_2345":5480,"_260":5481},{"_2350":2859,"_2352":2353},{"_2348":2349},{"_2350":2859,"_2352":2353},{"_2350":2859,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2864,"_2413":2405,"_2414":2415,"_578":2865},{},{"_249":2840,"_256":5489,"_54":2871,"_260":5490,"_262":263,"_264":14,"_265":266,"_267":5491,"_269":2302},[2826],{"_582":583,"_267":5497},{"_577":620,"_667":668,"_578":2851},{"_273":5492,"_275":34,"_276":5493,"_278":5494,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2877,"_300":2055,"_592":615,"_618":5495,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5496},[],[],[620],[666],{},{"_249":2868,"_256":5500,"_54":2885,"_56":2886,"_260":5501,"_262":263,"_265":266,"_267":5502,"_269":270},[2840],{"_582":648,"_649":2302,"_267":5516},{"_577":2364,"_578":2906},{"_275":34,"_2321":5503,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2882,"_300":2055,"_592":615,"_618":5504,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2891,"_2328":2885,"_56":2886,"_620":2892,"_2330":2886,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5505,"_2337":5506,"_2339":-5},[620],[5515],[5507,5508,5509],{"_2344":262,"_2345":5513,"_260":5514},{"_2344":2359,"_2345":5512},{"_2344":262,"_2345":5510,"_260":5511},{"_2350":2900,"_2352":2353},{"_2348":2349},{"_2350":2900,"_2352":2353},{"_2350":2900,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2905,"_2413":2405,"_2414":2415,"_578":2906},{},{"_249":2882,"_256":5519,"_54":2912,"_260":5520,"_262":263,"_264":14,"_265":266,"_267":5521,"_269":2302},[2868],{"_582":583,"_267":5527},{"_577":620,"_667":668,"_578":2892},{"_273":5522,"_275":34,"_276":5523,"_278":5524,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2918,"_300":2055,"_592":615,"_618":5525,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5526},[],[],[620],[666],{},{"_249":2909,"_256":5530,"_54":2926,"_56":2927,"_260":5531,"_262":263,"_265":266,"_267":5532,"_269":270},[2882],{"_582":648,"_649":2302,"_267":5546},{"_577":2364,"_578":2947},{"_275":34,"_2321":5533,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2923,"_300":2055,"_592":615,"_618":5534,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2932,"_2328":2926,"_56":2927,"_620":2933,"_2330":2927,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5535,"_2337":5536,"_2339":-5},[620],[5545],[5537,5538,5539],{"_2344":262,"_2345":5543,"_260":5544},{"_2344":2359,"_2345":5542},{"_2344":262,"_2345":5540,"_260":5541},{"_2350":2941,"_2352":2353},{"_2348":2349},{"_2350":2941,"_2352":2353},{"_2350":2941,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2946,"_2413":2405,"_2414":2415,"_578":2947},{},{"_249":2923,"_256":5549,"_54":2953,"_260":5550,"_262":263,"_264":14,"_265":266,"_267":5551,"_269":2302},[2909],{"_582":583,"_267":5557},{"_577":620,"_667":668,"_578":2933},{"_273":5552,"_275":34,"_276":5553,"_278":5554,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2959,"_300":2055,"_592":615,"_618":5555,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5556},[],[],[620],[666],{},{"_249":2950,"_256":5560,"_54":2967,"_56":2968,"_260":5561,"_262":263,"_265":266,"_267":5562,"_269":270},[2923],{"_582":648,"_649":2302,"_267":5576},{"_577":2364,"_578":2989},{"_275":34,"_2321":5563,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":2972,"_300":2055,"_592":615,"_618":5564,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":2974,"_2328":2967,"_56":2968,"_620":2975,"_2330":2968,"_2331":-5,"_2333":-5,"_2334":-5,"_2335":5565,"_2337":5566,"_2339":-5},[620],[5575],[5567,5568,5569],{"_2344":262,"_2345":5573,"_260":5574},{"_2344":2359,"_2345":5572},{"_2344":262,"_2345":5570,"_260":5571},{"_2350":2983,"_2352":2353},{"_2348":2349},{"_2350":2983,"_2352":2353},{"_2350":2983,"_2352":2353},{"_2348":2363},{"_292":2402,"_2411":2988,"_2413":2405,"_2414":2415,"_578":2989},{},{"_249":2964,"_256":5579,"_54":2995,"_260":5580,"_262":263,"_264":14,"_265":266,"_267":5581,"_269":2302},[2950],{"_582":583,"_267":5587},{"_577":620,"_667":668,"_578":2975},{"_273":5582,"_275":34,"_276":5583,"_278":5584,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3001,"_300":2055,"_592":615,"_618":5585,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5586},[],[],[620],[666],{},{"_249":2992,"_256":5590,"_54":3009,"_56":3010,"_260":5591,"_262":263,"_265":266,"_267":5592,"_269":270},[2964],{"_582":648,"_649":2302,"_267":5609},{"_577":2364,"_578":3018},{"_275":34,"_2321":5593,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3014,"_300":2055,"_592":615,"_618":5594,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3016,"_2328":3009,"_56":3010,"_620":3017,"_2330":3010,"_2331":3018,"_2333":-5,"_2334":-5,"_2335":5595,"_2337":5596,"_2339":-5},[620],[],[5597,5598,5599,5600],{"_2344":262,"_2345":5607,"_260":5608},{"_2344":2359,"_2345":5606},{"_2345":5603,"_2344":2355,"_260":5604},{"_2344":262,"_2345":5601,"_260":5602},{"_2350":3027,"_2352":2353},{"_2348":2349},{"_2350":3027,"_2352":2353},{"_51":5605},{"_2358":3018},{"_2350":3027,"_2352":2353},{"_2350":3027,"_2352":2353},{"_2348":2363},{},{"_249":3006,"_256":5612,"_54":3039,"_260":5613,"_262":263,"_264":14,"_265":266,"_267":5614,"_269":2302},[2992],{"_582":583,"_267":5620},{"_577":620,"_667":668,"_578":3017},{"_273":5615,"_275":34,"_276":5616,"_278":5617,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3045,"_300":2055,"_592":615,"_618":5618,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5619},[],[],[620],[666],{},{"_249":3036,"_256":5623,"_54":3053,"_56":3054,"_260":5624,"_262":263,"_265":266,"_267":5625,"_269":270},[3006],{"_582":648,"_649":2302,"_267":5642},{"_577":2364,"_578":3062},{"_275":34,"_2321":5626,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3058,"_300":2055,"_592":615,"_618":5627,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3060,"_2328":3053,"_56":3054,"_620":3061,"_2330":3054,"_2331":3062,"_2333":-5,"_2334":-5,"_2335":5628,"_2337":5629,"_2339":-5},[620],[],[5630,5631,5632,5633],{"_2344":262,"_2345":5640,"_260":5641},{"_2344":2359,"_2345":5639},{"_2345":5636,"_2344":2355,"_260":5637},{"_2344":262,"_2345":5634,"_260":5635},{"_2350":3071,"_2352":2353},{"_2348":2349},{"_2350":3071,"_2352":2353},{"_51":5638},{"_2358":3062},{"_2350":3071,"_2352":2353},{"_2350":3071,"_2352":2353},{"_2348":2363},{},{"_249":3050,"_256":5645,"_54":3083,"_260":5646,"_262":263,"_264":14,"_265":266,"_267":5647,"_269":2302},[3036],{"_582":583,"_267":5653},{"_577":620,"_667":668,"_578":3061},{"_273":5648,"_275":34,"_276":5649,"_278":5650,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3089,"_300":2055,"_592":615,"_618":5651,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5652},[],[],[620],[666],{},{"_249":3080,"_256":5656,"_54":3097,"_56":3098,"_260":5657,"_262":263,"_265":266,"_267":5658,"_269":270},[3050],{"_582":648,"_649":2302,"_267":5675},{"_577":2364,"_578":3106},{"_275":34,"_2321":5659,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3102,"_300":2055,"_592":615,"_618":5660,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3104,"_2328":3097,"_56":3098,"_620":3105,"_2330":3098,"_2331":3106,"_2333":-5,"_2334":-5,"_2335":5661,"_2337":5662,"_2339":-5},[620],[],[5663,5664,5665,5666],{"_2344":262,"_2345":5673,"_260":5674},{"_2344":2359,"_2345":5672},{"_2345":5669,"_2344":2355,"_260":5670},{"_2344":262,"_2345":5667,"_260":5668},{"_2350":3115,"_2352":2353},{"_2348":2349},{"_2350":3115,"_2352":2353},{"_51":5671},{"_2358":3106},{"_2350":3115,"_2352":2353},{"_2350":3115,"_2352":2353},{"_2348":2363},{},{"_249":3094,"_256":5678,"_54":3126,"_260":5679,"_262":263,"_264":14,"_265":266,"_267":5680,"_269":2302},[3080],{"_582":583,"_267":5686},{"_577":620,"_667":668,"_578":3105},{"_273":5681,"_275":34,"_276":5682,"_278":5683,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3132,"_300":2055,"_592":615,"_618":5684,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5685},[],[],[620],[666],{},{"_249":2571,"_256":5689,"_54":3140,"_56":3141,"_260":5690,"_262":263,"_265":266,"_267":5691,"_269":270},[3094],{"_582":648,"_649":2302,"_267":5708},{"_577":2364,"_578":3149},{"_275":34,"_2321":5692,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3145,"_300":2055,"_702":-5,"_703":-5,"_592":615,"_618":5693,"_596":2290,"_302":10,"_298":14},{"_262":2325,"_2326":3147,"_2328":3140,"_56":3141,"_620":3148,"_2330":3141,"_2331":3149,"_2333":-5,"_2334":-5,"_2335":5694,"_2337":5695,"_2339":-5},[620],[],[5696,5697,5698,5699],{"_2344":262,"_2345":5706,"_260":5707},{"_2344":2359,"_2345":5705},{"_2345":5702,"_2344":2355,"_260":5703},{"_2344":262,"_2345":5700,"_260":5701},{"_2350":3158,"_2352":2353},{"_2348":2349},{"_2350":3158,"_2352":2353},{"_51":5704},{"_2358":3149},{"_2350":3158,"_2352":2353},{"_2350":3158,"_2352":2353},{"_2348":2363},{},{"_249":3137,"_256":5711,"_54":3169,"_260":5712,"_262":1973,"_264":14,"_265":266,"_267":5713,"_269":270},[2571],{"_582":583,"_267":5717},{"_577":625,"_625":5714,"_627":3173},{"_592":615,"_596":2290,"_287":288,"_289":34,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_282":109,"_297":109,"_66":67,"_299":2570,"_300":2055,"_302":10,"_298":14},[5715],{"_630":632,"_260":632,"_633":5716,"_635":34},[],{},{"_249":2570,"_256":5720,"_54":3181,"_260":5721,"_262":263,"_264":14,"_265":266,"_267":5722,"_269":2302},[3137],{"_582":583,"_267":5729},{"_577":620,"_667":668,"_578":3148},{"_273":5723,"_275":34,"_276":5724,"_278":5725,"_282":109,"_602":34,"_662":34,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3187,"_300":2055,"_702":5726,"_703":3189,"_592":615,"_618":5727,"_596":2290,"_302":10,"_298":14},{"_50":573,"_574":5728},[],[],[3189],[620],[666],{},{"_249":3178,"_256":5732,"_54":3197,"_260":5733,"_262":263,"_265":266,"_267":5734,"_269":270},[2570],{"_582":773,"_267":5736},{"_577":578,"_579":5735},{"_771":34,"_300":3200,"_282":109,"_287":288,"_290":2053,"_292":293,"_294":2054,"_296":2054,"_297":109,"_66":67,"_299":3194,"_302":10,"_298":14},[632],{},{"_249":3194,"_256":5739,"_54":3207,"_56":3208,"_260":5740,"_262":263,"_265":266,"_267":5741,"_269":270},[3178],{"_582":825,"_267":5747},{"_577":578,"_579":5746},{"_3211":5742,"_2032":5743,"_290":2053,"_822":-5,"_294":2054,"_296":2054,"_300":3200,"_302":10,"_298":14},[5745],{"_2034":5744},[],{"_249":3216,"_3217":3218,"_649":3219,"_3220":3221,"_2060":3222,"_3223":3224,"_3225":14},[3227],{},{"_249":3204,"_256":5750,"_54":3233,"_56":3234,"_260":5751,"_262":263,"_264":34,"_265":266,"_267":5752,"_269":270,"_271":272},[3194],{"_582":583,"_267":5887},{"_577":578,"_579":5886},{"_273":5753,"_275":34,"_278":5754,"_285":5755,"_62":5756,"_3241":5757,"_280":5758,"_276":5759,"_282":109,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_298":34,"_299":3230,"_300":3247,"_302":10},{"_50":573,"_574":5885},[5818,5819,5820,5821,5822,5823,5824,5825],[5762,5763,5764,5765],[3265,3266,3267],{"_3248":5760},[],[],{"_3250":5761},{"_3252":3253,"_3254":14,"_3255":3256,"_3257":3258,"_3259":3260,"_3261":3262,"_3263":3264},{"_50":1168,"_1169":3313,"_1171":5781},{"_50":1168,"_1169":3287,"_1171":5772},{"_50":1168,"_1169":3280,"_1171":5769},{"_50":1168,"_1169":3272,"_1171":5766},[5767],{"_50":1174,"_41":3275,"_53":3276,"_1177":3277,"_1179":5768,"_1181":3279,"_1183":3272},{"_1184":1230,"_1186":1187,"_1188":1198},[5770],{"_50":1174,"_41":3283,"_53":3284,"_1177":3285,"_1179":5771,"_1181":-5,"_1183":3280},{"_1184":1230,"_1186":1187,"_1188":1225},[5773,5774,5775,5776],{"_50":1174,"_41":3308,"_53":3309,"_1177":3310,"_1179":5780,"_1181":3312,"_1183":3287},{"_50":1174,"_41":3303,"_53":3304,"_1177":3305,"_1179":5779,"_1181":3307,"_1183":3287},{"_50":1174,"_41":3298,"_53":3299,"_1177":3300,"_1179":5778,"_1181":3302,"_1183":3287},{"_50":1174,"_41":3293,"_53":3294,"_1177":3295,"_1179":5777,"_1181":3297,"_1183":3287},{"_1184":1230,"_1186":1187,"_1188":1189},{"_1184":1230,"_1186":1187,"_1188":1230},{"_1184":1230,"_1186":1187,"_1188":1315},{"_1184":1230,"_1186":1187,"_1188":266},[5782,5783,5784,5785,5786,5787,5788,5789,5790,5791,5792,5793,5794,5795,5796,5797,5798,5799],{"_50":1174,"_41":3404,"_53":3405,"_1177":3406,"_1179":5817,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3400,"_53":3401,"_1177":3402,"_1179":5816,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3396,"_53":3397,"_1177":3398,"_1179":5815,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3393,"_53":3361,"_1177":3394,"_1179":5814,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3389,"_53":3390,"_1177":3391,"_1179":5813,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3385,"_53":3386,"_1177":3387,"_1179":5812,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3380,"_53":3381,"_1177":3382,"_1179":5811,"_1181":3384,"_1183":3313},{"_50":1174,"_41":3376,"_53":3377,"_1177":3378,"_1179":5810,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3372,"_53":3373,"_1177":3374,"_1179":5809,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3368,"_53":3369,"_1177":3370,"_1179":5808,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3364,"_53":3365,"_1177":3366,"_1179":5807,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3360,"_53":3361,"_1177":3362,"_1179":5806,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3356,"_53":3357,"_1177":3358,"_1179":5805,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3352,"_53":3353,"_1177":3354,"_1179":5804,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3347,"_53":3348,"_1177":3349,"_1179":5803,"_1181":3351,"_1183":3313},{"_50":1174,"_41":3343,"_53":3344,"_1177":3345,"_1179":5802,"_1181":-5,"_1183":3313},{"_50":1174,"_41":3338,"_53":3339,"_1177":3340,"_1179":5801,"_1181":3342,"_1183":3313},{"_50":1174,"_41":3333,"_53":3334,"_1177":3335,"_1179":5800,"_1181":3337,"_1183":3313},{"_1184":1230,"_1186":1187,"_1188":1211},{"_1184":1230,"_1186":1187,"_1188":1343},{"_1184":1230,"_1186":1187,"_1188":1203},{"_1184":1230,"_1186":1187,"_1188":1215},{"_1184":1230,"_1186":1187,"_1188":1300},{"_1184":1230,"_1186":1187,"_1188":1185},{"_1184":1185,"_1186":1187,"_1188":1189},{"_1184":1185,"_1186":1187,"_1188":1211},{"_1184":1185,"_1186":1187,"_1188":1198},{"_1184":1185,"_1186":1187,"_1188":1343},{"_1184":1185,"_1186":1187,"_1188":1225},{"_1184":1185,"_1186":1187,"_1188":1203},{"_1184":1185,"_1186":1187,"_1188":1215},{"_1184":1185,"_1186":1187,"_1188":1230},{"_1184":1185,"_1186":1187,"_1188":1315},{"_1184":1185,"_1186":1187,"_1188":1300},{"_1184":1185,"_1186":1187,"_1188":266},{"_1184":1185,"_1186":1187,"_1188":1185},{"_1248":3550,"_1256":-5,"_1250":3551,"_1252":3552,"_62":5880,"_1259":5881,"_47":3555,"_1254":-5,"_50":41,"_53":3556,"_3557":5882,"_3559":-5,"_3560":-5},{"_1248":3499,"_1256":-5,"_1250":3540,"_1252":3541,"_62":5872,"_1259":5873,"_47":3504,"_1254":-5,"_50":1283,"_1284":5874,"_1286":5875,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3526,"_1256":-5,"_1250":3527,"_1252":3528,"_62":5864,"_1259":5865,"_47":3531,"_1254":-5,"_50":1283,"_1284":5866,"_1286":5867,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3514,"_1256":-5,"_1250":3515,"_1252":3516,"_62":5856,"_1259":5857,"_47":3519,"_1254":-5,"_50":1283,"_1284":5858,"_1286":5859,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3499,"_1256":-5,"_1250":3500,"_1252":3501,"_62":5848,"_1259":5849,"_47":3504,"_1254":-5,"_50":1283,"_1284":5850,"_1286":5851,"_262":1288,"_1289":-5,"_1290":-5},{"_1248":3428,"_1256":3429,"_1250":3430,"_1252":3431,"_62":-5,"_1259":5831,"_47":-5,"_1254":-5,"_50":3433,"_3433":5832,"_649":3435,"_3436":3437,"_3438":3439,"_3440":-5,"_3441":3442,"_3443":34,"_3444":3445},{"_1248":1255,"_1256":-5,"_1250":3420,"_1252":3420,"_62":5826,"_1259":5827,"_47":632,"_1254":-5,"_50":1261,"_1262":5828,"_1264":14},{"_50":1247,"_1248":3416,"_1250":3417,"_1252":3418,"_47":3416,"_1254":3419},[],[],[5829,5830],{"_53":3427,"_41":3265,"_1183":3426},{"_53":632,"_41":3267,"_1183":3426},[],{"_50":3446,"_3447":3448,"_3449":3450,"_3451":5833,"_254":5834},{"_3252":3253,"_3254":14,"_3255":3256,"_3257":3258,"_3259":3260,"_3261":3262,"_3263":3264},[5835,5836],{"_50":3463,"_3464":3490,"_254":5844},{"_50":3456,"_3447":3448,"_3457":3458,"_3449":3459,"_254":5837},[5838,5839],{"_50":3463,"_3464":3482,"_254":5842},{"_50":3463,"_3464":3465,"_254":5840},[5841],{"_50":3468,"_3469":3470,"_3471":3472,"_3217":3473,"_3474":3475,"_3476":3477,"_3478":3479,"_3480":3481},[5843],{"_50":3468,"_3469":3485,"_3486":3487,"_3217":3473,"_3474":3475,"_3476":3477,"_3478":3488,"_3480":3489},[5845],{"_50":3456,"_3447":3448,"_3449":3493,"_254":5846},[5847],{"_50":3468,"_3469":3496,"_3471":3497,"_3217":3473,"_3474":3475,"_3476":3477,"_3480":3498},[3265],[],[5852],[],{"_53":3427,"_41":3265,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3509,"_1292":-5,"_1293":5853,"_1259":5854,"_1296":-5,"_1297":-5},[],[5855],{"_1184":1185,"_1186":3513,"_1188":1185},[3267],[],[5860],[],{"_53":632,"_41":3267,"_1183":3426,"_1181":-5,"_1177":-5,"_1292":-5,"_1293":5861,"_1259":5862,"_1296":-5,"_1297":-5},[],[5863],{"_1184":1300,"_1186":3513,"_1188":266},[3266],[],[5868],[],{"_53":3535,"_41":3266,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3536,"_1292":-5,"_1293":5869,"_1259":5870,"_1296":-5,"_1297":-5},[],[5871],{"_1184":266,"_1186":3513,"_1188":1300},[3265],[],[5876],[],{"_53":3427,"_41":3265,"_1183":3426,"_1181":-5,"_1177":-5,"_3508":3509,"_1292":-5,"_1293":5877,"_1259":5878,"_1296":-5,"_1297":-5},[],[5879],{"_1184":1185,"_1186":3513,"_1188":1185},[],[],{"_53":3556,"_41":3561,"_1183":3313,"_1181":-5,"_1177":-5,"_1292":-5,"_1293":5883,"_1259":5884,"_1296":-5,"_1297":-5},[],[],[576],[3566],{"_1376":1377},{"_249":3230,"_256":5890,"_54":3572,"_260":5891,"_262":263,"_264":14,"_265":266,"_267":5892,"_269":270},[3204],{"_582":583,"_267":5893},{"_577":603,"_260":3577},{"_592":593,"_594":1189,"_596":3575,"_598":3576,"_600":601,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3569,"_300":3247,"_602":34,"_302":10},{},{"_249":3569,"_256":5896,"_54":3583,"_260":5897,"_262":263,"_264":14,"_265":266,"_267":5898,"_269":270},[3230],{"_582":583,"_267":5910},{"_577":625,"_625":5907,"_627":3601},{"_613":5899,"_592":615,"_616":1539,"_618":5900,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3588,"_300":3247,"_602":34,"_302":10},{"_285":5901,"_621":5902},[3589],[5903],[3592,3593],{"_50":1168,"_1169":3595,"_1171":5904},[5905],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":5906,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[5908],{"_630":3603,"_260":632,"_633":5909,"_635":34},[],{},{"_249":3580,"_256":5913,"_54":3610,"_260":5914,"_262":263,"_264":14,"_265":266,"_267":5915,"_269":1613},[3569],{"_582":583,"_267":5928},{"_577":578,"_579":5927},{"_273":5916,"_275":34,"_276":5917,"_278":5918,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3616,"_300":3247,"_592":615,"_618":5919,"_613":5920,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":5926},[],[],[1638],{"_285":5921},[5922],{"_50":1168,"_1169":3595,"_1171":5923},[5924],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":5925,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3607,"_256":5931,"_54":3631,"_260":5932,"_262":263,"_265":266,"_267":5933,"_269":270},[3580],{"_582":648,"_649":1613,"_267":5935},{"_577":578,"_579":5934},{"_287":288,"_294":3246,"_296":3246,"_299":3634,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},[647],{"_1376":1615},{"_249":3628,"_256":5938,"_54":3641,"_260":5939,"_262":263,"_264":14,"_265":266,"_267":5940,"_269":1613},[3607],{"_582":583,"_267":5953},{"_577":578,"_579":5952},{"_273":5941,"_275":34,"_276":5942,"_278":5943,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3647,"_300":3247,"_592":615,"_618":5944,"_613":5945,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":5951},[],[],[1638],{"_285":5946},[5947],{"_50":1168,"_1169":3595,"_1171":5948},[5949],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":5950,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3638,"_256":5956,"_54":3661,"_260":5957,"_262":263,"_264":14,"_265":266,"_267":5958,"_269":1613},[3628],{"_582":583,"_267":5971},{"_577":578,"_579":5970},{"_273":5959,"_275":34,"_276":5960,"_278":5961,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3667,"_300":3247,"_592":615,"_618":5962,"_613":5963,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":5969},[],[],[1638],{"_285":5964},[5965],{"_50":1168,"_1169":3595,"_1171":5966},[5967],{"_50":1174,"_41":3267,"_53":632,"_1177":3598,"_1179":5968,"_1181":-5,"_1183":3595},{"_1184":1300,"_1186":3513,"_1188":266},[666],[632],{},{"_249":3593,"_256":5974,"_54":3681,"_260":5975,"_262":263,"_265":266,"_267":5976,"_269":270},[3638],{"_582":648,"_649":1613,"_267":5979},{"_577":578,"_579":5978},{"_287":288,"_294":3246,"_296":3246,"_299":3684,"_1610":1611,"_702":5977,"_703":3686,"_592":615,"_596":3575,"_302":10,"_645":34},[3686],[647],{"_1376":1615},{"_249":3592,"_256":5982,"_54":3693,"_260":5983,"_262":263,"_264":14,"_265":266,"_267":5984,"_269":1613},[3593],{"_582":583,"_267":5992},{"_577":578,"_579":5991},{"_273":5985,"_275":34,"_276":5986,"_278":5987,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3690,"_300":3247,"_702":5988,"_703":1652,"_592":615,"_618":5989,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":5990},[],[],[1652],[1638],[666],[632],{},{"_249":3690,"_256":5995,"_54":3708,"_260":5996,"_262":263,"_264":14,"_265":266,"_267":5997,"_269":270},[3592],{"_582":583,"_267":6004},{"_577":625,"_625":6001,"_627":3717},{"_613":5998,"_592":615,"_616":617,"_618":5999,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3713,"_300":3247,"_602":34,"_302":10},{"_621":6000},[620],[3715,3705],[6002],{"_630":3719,"_260":632,"_633":6003,"_635":34},[],{},{"_249":3705,"_256":6007,"_54":3725,"_260":6008,"_262":263,"_265":266,"_267":6009,"_269":270},[3690],{"_582":648,"_649":650,"_267":6011},{"_577":578,"_579":6010},{"_287":288,"_294":3246,"_296":3246,"_299":3728,"_702":-5,"_703":-5,"_592":615,"_596":3575,"_302":10,"_645":34},[647],{},{"_249":3715,"_256":6014,"_54":3735,"_260":6015,"_262":263,"_264":14,"_265":266,"_267":6016,"_269":650},[3705],{"_582":583,"_267":6023},{"_577":620,"_667":668,"_578":3745},{"_273":6017,"_275":34,"_276":6018,"_278":6019,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3732,"_300":3247,"_702":6020,"_703":3742,"_592":615,"_618":6021,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":6022},[],[],[3742],[620],[666],{},{"_249":3732,"_256":6026,"_54":3751,"_260":6027,"_262":263,"_264":14,"_265":266,"_267":6028,"_269":270},[3715],{"_582":583,"_267":6035},{"_577":625,"_625":6032,"_627":3762},{"_613":6029,"_592":615,"_616":1539,"_618":6030,"_596":3575,"_287":288,"_289":34,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_282":109,"_297":109,"_66":67,"_298":14,"_299":3756,"_300":3247,"_602":34,"_302":10},{"_621":6031},[3757],[3759,3760],[6033],{"_630":3764,"_260":632,"_633":6034,"_635":34},[],{},{"_249":3748,"_256":6038,"_54":3771,"_260":6039,"_262":263,"_265":266,"_267":6040,"_269":270},[3732],{"_582":648,"_649":1613,"_267":6042},{"_577":578,"_579":6041},{"_287":288,"_294":3246,"_296":3246,"_299":3774,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},[647],{"_1376":1615},{"_249":3768,"_256":6045,"_54":3781,"_260":6046,"_262":263,"_264":14,"_265":266,"_267":6047,"_269":1613},[3748],{"_582":583,"_267":6054},{"_577":578,"_579":6053},{"_273":6048,"_275":34,"_276":6049,"_278":6050,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3787,"_300":3247,"_592":615,"_618":6051,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":6052},[],[],[1638],[666],[632],{},{"_249":3778,"_256":6057,"_54":3795,"_260":6058,"_262":263,"_265":266,"_267":6059,"_269":270},[3768],{"_582":648,"_649":1613,"_267":6061},{"_577":578,"_579":6060},{"_287":288,"_294":3246,"_296":3246,"_299":3798,"_1610":1611,"_592":615,"_596":3575,"_302":10,"_645":34},[647],{"_1376":1615},{"_249":3760,"_256":6064,"_54":3805,"_260":6065,"_262":263,"_265":266,"_267":6066,"_269":270},[3778],{"_582":648,"_649":1613,"_267":6069},{"_577":578,"_579":6068},{"_702":6067,"_703":1652,"_592":615,"_596":3575,"_287":288,"_294":3246,"_296":3246,"_299":3802,"_302":10,"_645":34},[1652],[647],{"_1376":1615},{"_249":3802,"_256":6072,"_54":3814,"_260":6073,"_262":263,"_264":14,"_265":266,"_267":6074,"_269":1613},[3760],{"_582":583,"_267":6081},{"_577":578,"_579":6080},{"_273":6075,"_275":34,"_276":6076,"_278":6077,"_282":109,"_602":34,"_662":34,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3820,"_300":3247,"_592":615,"_618":6078,"_596":3575,"_302":10,"_298":14},{"_50":573,"_574":6079},[],[],[1638],[666],[632],{},{"_249":3759,"_256":6084,"_54":3829,"_260":6085,"_262":263,"_265":266,"_267":6086,"_269":1539},[3802],{"_582":583,"_267":6092},{"_577":578,"_579":6091},{"_276":6087,"_278":6088,"_282":109,"_702":6089,"_703":1652,"_592":615,"_618":6090,"_596":3575,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3836,"_300":3247,"_302":10,"_298":14},[],[],[1652],[1638],[632],{},{"_249":3826,"_256":6095,"_54":3843,"_260":6096,"_262":263,"_265":266,"_267":6097,"_269":583},[3759],{"_582":773,"_267":6102},{"_577":578,"_579":6101},{"_771":34,"_276":6098,"_278":6099,"_280":6100,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3840,"_300":3247,"_302":10,"_298":14},[],[],[],[632],{},{"_249":3840,"_256":6105,"_54":3855,"_260":6106,"_262":263,"_265":266,"_267":6107,"_269":270},[3826],{"_582":583,"_267":6108},{"_577":1676,"_1677":632},{"_287":288,"_294":3246,"_296":3246,"_299":3852,"_302":10,"_645":34},{},{"_249":3852,"_256":6111,"_54":3863,"_260":6112,"_262":263,"_265":266,"_267":6113,"_269":270},[3840],{"_582":773,"_267":6115},{"_577":578,"_579":6114},{"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3860,"_302":10,"_298":14},[632],{},{"_249":3860,"_256":6118,"_54":3873,"_260":6119,"_262":263,"_265":266,"_267":6120,"_269":270},[3852],{"_582":773,"_267":6122},{"_577":578,"_579":6121},{"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3870,"_302":10,"_298":14},[632],{},{"_249":3870,"_256":6125,"_54":3882,"_260":6126,"_262":263,"_264":34,"_265":1185,"_267":6127,"_269":270},[3860],{"_582":773,"_267":6129},{"_577":578,"_579":6128},{"_3885":34,"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3879,"_302":10,"_298":14},[632],{},{"_249":3879,"_256":6132,"_54":3892,"_260":6133,"_262":263,"_264":34,"_265":1185,"_267":6134,"_269":270},[3870],{"_582":773,"_267":6136},{"_577":578,"_579":6135},{"_3895":34,"_771":34,"_300":3866,"_282":109,"_287":288,"_290":3245,"_292":293,"_294":3246,"_296":3246,"_297":109,"_66":67,"_299":3889,"_302":10,"_298":14},[632],{},{"_249":3889,"_256":6139,"_54":3902,"_56":3903,"_260":6140,"_262":263,"_265":266,"_267":6141,"_269":270},[3879],{"_582":825,"_267":6146},{"_577":578,"_579":6145},{"_2032":6142,"_290":3245,"_822":-5,"_294":3246,"_296":3246,"_300":3866,"_302":10,"_298":14},{"_2034":6143},[6144],{"_249":3265,"_3909":41,"_3910":3911,"_3912":3913,"_3914":3915},[3917],{},{"_249":3899,"_256":6149,"_54":3923,"_260":6150,"_262":263,"_265":1185,"_267":6151,"_269":270},[3889],{"_582":773,"_267":6153},{"_577":578,"_579":6152},{"_290":3245,"_822":-5,"_294":3246,"_296":3246,"_300":3866,"_302":10,"_771":34,"_298":14},[632],{},[3899],"GLOBAL","https://docs.google.com/document/d/","https://github.com/openclaw/openclaw","https://www.openai.com","https://www.apple.com/","https://www.progressive.com","https://www.statefarm.com","dd",{"_6176":6177,"_6178":6179},"disablePrefetch","shouldPrefetchAccount","shouldPrefetchUser","shouldPrefetchSystemHints","manageRootRouteStylesheet","mobileWebHandoffEnabled","promoteCss","disableSSR","stripModulepreloadImports","paidCampaignAppRedirect","statsigGateEvaluationsPromise",["P",6175],"traceId","16775168547178227490","traceTime",1789303062205]
