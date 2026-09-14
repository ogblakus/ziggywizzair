Jesteś głównym inżynierem odpowiedzialnym za refaktoryzację repozytorium ZiggyWizzAir.

Twoim zadaniem jest przeprowadzić bezpieczną migrację obecnej architektury `council.ts` do architektury opartej na:

- `orchestrator.ts`
- 5 niezależnych agentach:
  - Vesper
  - Ash
  - Kai
  - Damian
  - Iris
- deterministycznym `decision-engine.ts`
- deterministycznych validatorach
- izolowanych promptach, kontekstach i narzędziach agentów
- walidacji Zod
- shadow mode umożliwiającym porównanie starego i nowego councila

## 1. NAJWAŻNIEJSZA ZASADA

NIE wykonuj big-bang rewrite.

Nie usuwaj obecnego `council.ts`, dopóki nowa architektura nie działa i nie została porównana ze starą.

Migracja ma być wykonywana etapami i po każdym większym kroku aplikacja musi pozostać kompilowalna.

Obecna aplikacja jest PAPER TRADING APP.

Nie dodawaj żadnego realnego brokera, realnego execution ani możliwości wysyłania prawdziwych zleceń.

## 2. NAJPIERW ZBADAJ REPO

Przed zmianami dokładnie przeanalizuj:

- `src/lib/agents/personas.ts`
- `src/lib/agents/pipeline.ts`
- `src/lib/agents/quorum.ts`
- `src/lib/agents/local-council.ts`
- `src/lib/agents/reflect.ts`
- `src/lib/agents/scorecard.ts`
- `src/lib/ai/council.ts`
- wszystkie miejsca importujące `council.ts`
- wszystkie miejsca korzystające z `CouncilResult`
- wszystkie miejsca tworzące/wykonujące orders
- istniejące typy market snapshot / portfolio / positions
- istniejące testy
- `package.json`
- `AGENTS.md`

Nie zakładaj nazw typów ani funkcji. Najpierw znajdź ich rzeczywistą implementację.

Nie twórz duplikatów istniejących typów bez potrzeby.

## 3. DOCELOWA ARCHITEKTURA

Utwórz:

```text
src/lib/agents/
  core/
    types.ts
    schemas.ts
    agent-runner.ts
    context.ts
    validator.ts
    telemetry.ts

  vesper/
    agent.ts
    prompt.ts
    knowledge.ts
    tools.ts

  ash/
    agent.ts
    prompt.ts
    knowledge.ts
    tools.ts

  kai/
    agent.ts
    prompt.ts
    knowledge.ts
    tools.ts

  damian/
    agent.ts
    prompt.ts
    knowledge.ts
    tools.ts

  iris/
    agent.ts
    prompt.ts
    knowledge.ts
    tools.ts

  decision-engine.ts
  orchestrator.ts
  attribution.ts
```

Nie musisz tworzyć plików, których zawartość nie jest jeszcze potrzebna. Zachowaj prostotę.

## 4. WSPÓLNY MODEL AGENTA

Każdy agent musi posiadać:

1. własny system prompt
2. własny kontekst wejściowy
3. własny schema outputu
4. własny zestaw dozwolonych narzędzi
5. własną odpowiedzialność
6. własną pamięć/performance context w przyszłości
7. własny telemetry/audit information

Agent nie może udawać pozostałych agentów.

Nie wysyłaj jednego promptu do Groka zawierającego instrukcje:

"jesteś Vesperem, Ashem, Kaiem, Damianem i Iris".

Każdy agent ma być osobnym wywołaniem modelu.

## 5. MODEL CALLS

Na tym etapie możesz korzystać z tego samego modelu xAI/Grok dla wszystkich agentów.

Nie wymagamy pięciu różnych modeli.

Ważniejsze jest rozdzielenie:

```text
agent identity
prompt
context
tools
output schema
```

niż używanie różnych modeli.

Wywołania Vesper/Ash/Kai/Damian powinny być wykonywane równolegle, jeżeli nie istnieje zależność między nimi.

Użyj `Promise.all` lub równoważnego mechanizmu.

Iris ma być uruchamiana dopiero po Decision Engine.

## 6. CORE — AGENT RUNNER

Utwórz wspólny runner:

```text
src/lib/agents/core/agent-runner.ts
```

Powinien odpowiadać za:

```text
system prompt
      ↓
model call
      ↓
JSON extraction / structured output
      ↓
Zod validation
      ↓
semantic validation
      ↓
typed AgentOutput
```

Nie umieszczaj logiki konkretnego agenta w runnerze.

Runner ma być infrastrukturą.

Jeżeli obecne `chat()` z `src/lib/ai/council.ts` może zostać bezpiecznie wykorzystane, zrefaktoryzuj je zamiast duplikować logikę HTTP.

Zachowaj server-only access do `XAI_API_KEY`.

Nie ujawniaj klucza klientowi.

## 7. ZOD

Repo już korzysta z Zod.

Każdy agent musi mieć własny schema.

Przykładowo:

```text
VesperOutputSchema
AshOutputSchema
KaiOutputSchema
DamianOutputSchema
IrisOutputSchema
```

Model output nie może być używany bez walidacji.

Jeżeli model zwróci:

- niepoprawny JSON
- nieznany symbol
- niepoprawny side
- score poza zakresem
- niepoprawny status

wynik ma zostać odrzucony albo bezpiecznie znormalizowany.

Nigdy nie ufaj `qty` zwróconemu przez LLM.

## 8. VESPER

Vesper jest:

```text
Momentum & Trend Specialist
```

Odpowiada wyłącznie za identyfikowanie momentum/trend opportunities.

Uwzględnia:

- price expansion
- relative volume
- market structure
- SMA relationship
- RSI
- higher timeframe alignment
- breakout
- failed breakout
- volatility expansion
- relative strength

Nie zarządza:

- portfolio
- sizingiem
- fees
- final order
- risk limits

Maksymalnie 3 idee.

Output powinien zawierać m.in.:

```json
{
  "agent": "vesper",
  "ideas": [
    {
      "symbol": "BTC",
      "side": "buy",
      "score": 0,
      "conviction": 0,
      "setup": "...",
      "evidence": [],
      "invalidation": "...",
      "thesis": "..."
    }
  ]
}
```

Zachowaj istniejącą deterministyczną logikę Vespera z `pipeline.ts`.

Nie usuwaj jej.

Jeżeli obecne funkcje:

```text
vesperLongScore
vesperShortScore
vesperRank
```

są użyteczne, przenieś je do warstwy tools/deterministic calculations.

LLM powinien interpretować dane, a kod powinien nadal wykonywać obliczenia, które powinny być deterministyczne.

## 9. ASH

Ash jest:

```text
Mean Reversion Specialist
```

Odpowiada za:

- overextension
- RSI extremes
- VWAP/Bollinger, jeżeli dane są dostępne
- failed breakouts
- liquidity sweeps
- exhaustion
- range conditions
- mean reversion

Nie ma automatycznie przeciwstawiać się Vesperowi.

Jeżeli Vesper mówi BUY, Ash może również powiedzieć BUY.

Jeżeli nie ma setupu mean-reversion, może zwrócić HOLD/brak idei.

Zachowaj istniejące:

```text
ashBuyScore
ashSellScore
ashRank
```

jako deterministic logic.

## 10. KAI

Kai jest:

```text
Setup & Entry Specialist
```

Kai ma dwa tryby:

```text
SCAN
VALIDATE
```

### SCAN

Samodzielnie wyszukuje setupy.

### VALIDATE

Sprawdza kierunek zaproponowany przez Vespera/Asha.

Kai analizuje:

- 15m
- 1h
- 4h
- FVG
- pullback
- liquidity
- session behavior
- retracement
- wick behavior
- chase detection
- entry
- invalidation
- RR

15m jest głównym timeframe.

Nie używaj 1m jako podstawy decyzji.

Kai zwraca:

```text
ready
wait
blocked
```

Kai NIE jest finalnym risk managerem.

Kai nie może sam zmienić:

```text
BUY → SELL
```

tylko dlatego, że wejście jest złe.

Może powiedzieć:

```text
BUY + READY
BUY + WAIT
BUY + BLOCKED
```

## 11. DAMIAN

Damian jest:

```text
Macro & Market Regime Specialist
```

Nie głosuje na konkretny ticker.

Nie zwraca:

```text
BTC BUY
NVDA SELL
```

Zamiast tego klasyfikuje reżim:

```text
equities
crypto
metals
dollar
volatility
```

Uwzględnia, jeżeli dane są dostępne:

- VIX
- DXY
- US10Y
- SPX
- NDX
- BTC
- ETH
- gold
- oil
- crypto market cap
- breadth
- news
- economic calendar

Output powinien mówić:

```text
bullish
neutral
bearish
```

dla odpowiednich klas aktywów.

Zachowaj istniejącą logikę `sectorBoard()` jako deterministic baseline/tool.

## 12. DECISION ENGINE

Utwórz:

```text
src/lib/agents/decision-engine.ts
```

To ma być DETERMINISTIC CODE.

Nie używaj tutaj LLM.

Decision Engine otrzymuje:

```text
Vesper output
Ash output
Kai output
Damian output
historical/performance data
portfolio state
```

i tworzy kandydatów.

Początkowe wagi:

```text
Vesper       25%
Ash          15%
Kai          30%
Damian       15%
Historical   15%
```

Nie traktuj tych wag jako świętych. Umieść je w jednym konfigurowalnym miejscu.

Przykład:

```ts
score =
  vesper * 0.25 +
  ash * 0.15 +
  kai * 0.30 +
  damian * 0.15 +
  historical * 0.15
```

## 13. HARD GATES

Score sam nie może wystarczyć.

Kandydat musi przejść:

```text
directional score >= 60
Kai != blocked
Kai direction matches candidate
RR >= 1.5
portfolio risk OK
fees <= 5% round trip
```

Dodatkowo zachowaj istniejące ograniczenia:

```text
MAX_OPEN_LEGS = 2
MAX_SCOUT_NAMES = 3
```

oraz:

```text
teamLock
```

Nie pozwalaj na modyfikację pozycji objętej teamLock.

## 14. THRESHOLDS

Na start:

```text
<45       REJECT
45–59     WAIT
60–74     SMALL
75–84     NORMAL
85+       HIGH QUALITY
```

HIGH QUALITY nie oznacza automatycznie dużego sizingu.

Sizing należy do Iris.

## 15. QUORUM

Istniejący `quorum.ts` jest ważnym elementem bezpieczeństwa.

Nie usuwaj go.

Zachowaj podstawową zasadę:

dla nowego ryzyka musi istnieć:

```text
Vesper lub Ash
        +
Kai
```

po tej samej stronie dla tego samego symbolu.

Redukcja pozycji może być zatwierdzona przez:

```text
scout
lub Kai
```

teamLock zawsze blokuje zmianę.

Możesz przenieść walidację do:

```text
core/validator.ts
```

ale zachowaj kompatybilność z istniejącym systemem.

## 16. IRIS

Iris jest:

```text
Portfolio Risk Manager
```

Nie jest traderem.

Nie szuka własnych setupów.

Nie wybiera tickerów na podstawie własnej analizy technicznej.

Dostaje:

```text
candidate decisions
Damian regime
portfolio
positions
open legs
working orders
fees
drawdown
performance
locks
```

Iris decyduje:

```text
approve
reject
reduce
```

oraz proponuje:

```text
sizePct
```

Początkowe bazowe sizing:

```text
friendly regime = 5.2%
neutral         = 3.2%
hostile         = 2.2%
```

następnie redukuj w zależności od:

- istniejącej ekspozycji
- drawdown
- korelacji
- liquidity
- performance
- setup quality
- number of open legs

Iris nie może przekroczyć:

```text
MAX_OPEN_LEGS = 2
MAX_RESTING_LIMITS = 1
MAX_ADDS_PER_DAY = 2
```

Fees round-trip muszą być <=5%.

Nawet jeśli Iris zwróci złą wartość, kod ma ją ograniczyć.

LLM nie jest źródłem prawdy dla risk limits.

## 17. ORDER CREATION

Finalny order musi być tworzony przez kod.

Nie przez LLM.

LLM może powiedzieć:

```text
approve
sizePct = 3.2
```

ale kod wylicza:

```text
equity
risk capital
price
qty
fees
limits
```

i tworzy finalny paper order.

Nigdy nie ufaj `qty` z modelu.

## 18. ORCHESTRATOR

Utwórz:

```text
src/lib/agents/orchestrator.ts
```

Schemat:

```text
buildContexts()
      ↓
Promise.all(
  Vesper
  Ash
  Kai
  Damian
)
      ↓
Decision Engine
      ↓
candidate validation
      ↓
Iris
      ↓
final deterministic validation
      ↓
paper order
```

Pseudo-kod:

```ts
const [vesper, ash, kai, damian] = await Promise.all([
  runVesper(context.vesper),
  runAsh(context.ash),
  runKai(context.kai),
  runDamian(context.damian),
]);

const candidates = buildCandidates({
  vesper,
  ash,
  kai,
  damian,
  snapshot,
});

const eligible = candidates.filter(validateCandidate);

const iris = await runIris({
  candidates: eligible,
  portfolio,
  regime: damian,
});

const order = buildPaperOrder({
  iris,
  candidates: eligible,
  snapshot,
});

return validateFinalOrder(order);
```

Nie kopiuj tego bezmyślnie. Dopasuj do istniejących typów repo.

## 19. CONTEXT ISOLATION

To bardzo ważne.

Nie wysyłaj wszystkim agentom całego `compactSnap()`.

Stwórz osobne context builders.

Przykład:

```text
buildVesperContext()
buildAshContext()
buildKaiContext()
buildDamianContext()
buildIrisContext()
```

Każdy agent powinien otrzymywać minimalny wymagany kontekst.

Dzięki temu:

- zmniejszamy token usage
- zmniejszamy anchoring
- zwiększamy niezależność
- ograniczamy przypadkowe wpływanie jednego agenta na drugiego

## 20. INDEPENDENCE

Vesper, Ash, Kai i Damian nie powinny znać odpowiedzi pozostałych agentów podczas pierwszego skanu.

Czyli NIE:

```text
Vesper → Ash → Kai
```

tylko:

```text
Vesper ─┐
Ash ────┤
Kai ────┼──> Decision Engine
Damian ─┘
```

Dopiero później można użyć Kai w trybie VALIDATE na już wygenerowanych kandydatach, jeśli okaże się to korzystne.

Nie twórz circular dependency.

## 21. COUNCIL.TS MIGRATION

Obecne API/UI może nadal oczekiwać:

```text
runCouncilSession()
```

Nie zmieniaj całego frontendu tylko po to, żeby zmienić nazwę funkcji.

Na początku:

```ts
runCouncilSession(...)
```

powinno delegować do:

```ts
runOrchestrator(...)
```

Czyli:

```text
UI
 ↓
council.ts
 ↓
orchestrator.ts
```

Dzięki temu migracja jest kompatybilna wstecz.

Dopiero gdy wszystko działa, można usunąć starą implementację.

## 22. LOCAL COUNCIL

Nie usuwaj:

```text
local-council.ts
```

Na początku ma pełnić rolę deterministic fallback.

Jeżeli xAI API jest niedostępne:

```text
xAI unavailable
       ↓
deterministic fallback
```

Nie może dojść do sytuacji, w której brak API powoduje crash aplikacji.

## 23. SHADOW MODE

Dodaj możliwość uruchomienia:

```text
OLD COUNCIL
+
NEW ORCHESTRATOR
```

równolegle.

Nowy system nie wykonuje drugiego orderu.

Tylko porównujemy:

```text
oldResult
newResult
```

Zapisuj:

```text
timestamp
snapshot hash
old decision
new decision
direction agreement
symbol agreement
score difference
Kai status
Iris decision
```

Dodaj feature flag, np.:

```text
AGENTS_ORCHESTRATOR_MODE
```

z trybami:

```text
legacy
shadow
new
```

Jeżeli istnieje już podobny mechanizm konfiguracji, użyj istniejącego zamiast tworzyć drugi.

## 24. TELEMETRY / AUDIT

Każda sesja powinna mieć:

```text
decisionId
timestamp
marketSnapshotHash
agent output hashes
decisionEngineVersion
promptVersion
strategyVersion
irisOutput
finalOrder
```

Nie zapisuj chain-of-thought.

Zapisuj tylko:

```text
evidence
decision
confidence
invalidation
thesis
outcome
```

## 25. SCORECARD

Obecnego:

```text
scorecard.ts
```

nie usuwaj.

Na początku zachowaj kompatybilność.

Później rozszerz attribution.

Nie przypisuj całego wyniku jednej osobie, jeżeli kilku agentów faktycznie przyczyniło się do decyzji.

Przykład:

```text
Vesper → direction
Kai → entry
Damian → regime
Iris → risk
```

Każdy dostaje odpowiednią attribution.

Jeżeli agent nie przyczynił się do decyzji, nie przypisuj mu wyniku.

## 26. REFLECTION / MEMORY

Nie implementuj pełnego systemu memory w pierwszym kroku migracji.

Najpierw doprowadź do stabilnego działania:

```text
5 agents
↓
decision engine
↓
Iris
↓
paper order
```

Potem można rozbudować:

```text
episodic memory
statistical memory
semantic memory
```

Pamięć nie może nadpisywać danych historycznych.

## 27. ERROR HANDLING

Jeżeli jeden agent nie odpowie:

```text
Vesper failure
```

nie powinno to automatycznie oznaczać crash całego systemu.

Zwróć typed failure:

```text
agent unavailable
```

i pozwól Decision Engine zastosować bezpieczną politykę.

Przy braku wymaganych danych dla decyzji wysokiego ryzyka:

```text
WAIT / REJECT
```

a nie zgadywanie.

Nigdy nie inventuj:

- price
- quantity
- symbol
- RR
- market data
- indicator values

## 28. PROMPTS

Każdy prompt musi być oddzielnym plikiem:

```text
vesper/prompt.ts
ash/prompt.ts
kai/prompt.ts
damian/prompt.ts
iris/prompt.ts
```

Prompt powinien jasno definiować:

```text
IDENTITY
MISSION
WHAT YOU KNOW
WHAT YOU MUST NOT DO
INPUT CONTRACT
OUTPUT CONTRACT
DECISION RULES
FAILURE BEHAVIOR
```

Nie powtarzaj niepotrzebnie całego kontekstu aplikacji.

Prompt ma być możliwie krótki i precyzyjny.

## 29. PROMPT VERSIONING

Dodaj:

```text
promptVersion
strategyVersion
decisionEngineVersion
```

do output/audit.

Przykład:

```text
vesper.prompt.v1
strategy.v2
decision-engine.v1
```

Nie hardcode'uj wersji w wielu miejscach.

## 30. TESTY

Po implementacji dodaj testy dla:

### schemas

Niepoprawny output agenta musi zostać odrzucony.

### decision engine

Sprawdź:

```text
score <45 → reject
45–59 → wait
60+ → candidate
Kai blocked → reject
RR <1.5 → reject
```

### quorum

Sprawdź:

```text
Vesper BUY + Kai BUY → allowed
Ash BUY + Kai BUY → allowed
Vesper BUY + Kai SELL → rejected
Vesper BUY + Kai blocked → rejected
teamLock → rejected
```

### Iris

Sprawdź:

```text
open legs = 2 → no new risk
fees >5% → reject
```

### quantity

Sprawdź, że qty jest liczone przez kod, a nie przyjmowane z LLM.

## 31. TYPECHECK / LINT

Po każdym etapie uruchom istniejące:

```text
npm run typecheck
npm run lint
```

oraz istniejące testy.

Nie zmieniaj konfiguracji TypeScript/ESLint tylko po to, żeby ukryć błędy migracji.

Nie używaj:

```ts
as any
```

jako sposobu na obejście problemów typów.

Jeżeli istniejący kod wymaga kompatybilności, napraw ją właściwie.

## 32. NIE RÓB TEGO

Nie:

- usuwaj `council.ts` na początku
- usuwaj `pipeline.ts`
- usuwaj `quorum.ts`
- usuwaj `scorecard.ts`
- usuwaj `local-council.ts`
- zmieniaj UI bez potrzeby
- dodawaj real broker execution
- ufaj qty z LLM
- pozwalaj Irisowi samodzielnie generować order
- pozwalaj Damianowi głosować ticker BUY/SELL
- pozwalaj Kaiowi zmieniać kierunek tylko dlatego, że setup jest słaby
- wysyłaj pełnego snapshotu każdemu agentowi
- używaj jednego LLM call do symulowania pięciu agentów
- przechowuj chain-of-thought
- wyłączaj walidacji Zod
- obchodź limity risk przez prompt

## 33. KOLEJNOŚĆ IMPLEMENTACJI

Wykonaj migrację w tej kolejności:

### Etap 1

Analiza repo i zależności.

### Etap 2

```text
core/types.ts
core/schemas.ts
core/agent-runner.ts
core/context.ts
```

### Etap 3

Vesper.

### Etap 4

Ash.

### Etap 5

Kai.

### Etap 6

Damian.

### Etap 7

Decision Engine.

### Etap 8

Validator / quorum integration.

### Etap 9

Iris.

### Etap 10

Orchestrator.

### Etap 11

Adapter `council.ts → orchestrator.ts`.

### Etap 12

Shadow mode.

### Etap 13

Testy porównawcze.

### Etap 14

Przełączenie na `new`.

### Etap 15

Dopiero po potwierdzeniu stabilności usunięcie martwej starej logiki.

## 34. KRYTERIA GOTOWOŚCI

Migrację uznaj za zakończoną dopiero, gdy:

```text
[ ] każdy agent jest osobnym model call
[ ] każdy agent ma osobny prompt
[ ] każdy agent ma osobny context
[ ] każdy output przechodzi Zod
[ ] Vesper/Ash/Kai/Damian działają równolegle
[ ] Decision Engine jest deterministyczny
[ ] Iris działa jako risk manager
[ ] final order tworzony jest przez kod
[ ] qty nie pochodzi z LLM
[ ] quorum działa
[ ] teamLock działa
[ ] max 2 legs działa
[ ] max 1 resting limit działa
[ ] fees <=5% działa
[ ] local fallback działa
[ ] shadow mode działa
[ ] legacy council nadal jest dostępny
[ ] typecheck przechodzi
[ ] lint przechodzi
[ ] istniejące testy przechodzą
```

## 35. SPOSÓB PRACY

Pracuj jak przy produkcyjnej migracji.

Przed każdą zmianą sprawdź istniejące implementacje.

Nie wymyślaj API, jeżeli odpowiednik już istnieje.

Preferuj małe, odwracalne zmiany.

Po każdym etapie:

1. pokaż jakie pliki zostały zmienione
2. pokaż jakie funkcje zostały przeniesione
3. uruchom typecheck
4. uruchom lint
5. uruchom testy
6. opisz ewentualne regresje
7. dopiero potem przejdź dalej

Jeżeli napotkasz konflikt między istniejącym kodem a tą specyfikacją, zachowaj istniejącą funkcjonalność i zaproponuj najmniejszą zmianę potrzebną do osiągnięcia docelowej architektury.

NIE zatrzymuj się po samym planie.

Twoim zadaniem jest IMPLEMENTACJA migracji w repozytorium.

Na końcu przedstaw:

```text
1. Zmienione pliki
2. Usunięte/przeniesione funkcje
3. Nową architekturę
4. Sposób przepływu danych
5. Wyniki typecheck/lint/test
6. Czy działa shadow mode
7. Jak przełączyć legacy → new
8. Pozostałe TODO
```

Najważniejszy cel:

```text
ONE LLM ROLEPLAYING 5 AGENTS
            ↓
      NIEPOŻĄDANE

5 INDEPENDENT AGENTS
            ↓
DETERMINISTIC DECISION ENGINE
            ↓
          IRIS
            ↓
DETERMINISTIC VALIDATOR
            ↓
       PAPER ORDER
            ↓
      AUDIT / SCORECARD
```

Zachowaj istniejącą funkcjonalność ZiggyWizzAir, ale rozdziel odpowiedzialności tak, aby system był rzeczywiście wieloagentowy, testowalny, audytowalny i bezpieczny.