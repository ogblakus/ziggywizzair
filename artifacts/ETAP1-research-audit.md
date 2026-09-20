# ETAP 1 — Audyt Phase 3 Research (bez zmian w kodzie)

**Desk:** ZiggyWizzAir V2.4  
**Research contract:** Alpha Research v1.2  
**Data audytu:** 2026-09-19  
**Zakres:** tylko odczyt. V2.4, Decision Engine, progi, tickety, finalScore, Kai, Iris — nietknięte.

---

## Werdykt

Research **nigdy nie zapisywał historii**. Lab liczy wynik z bieżącego snapshotu i go wyrzuca.

Nie ma tabeli, pliku, ring-buffera ani `FactorPanel` w persistence. Kilka dni działania biurka **nie zostawiło obserwacji Phase 1–3**. Tego z książek / bazy **nie da się odzyskać**.

Test izolacji to potwierdza: bez panelu `sufficient = false`, `residual = null`, nigdy `β = 1`.

---

## 1. Gdzie Research jest wywoływany

| Miejsce | Funkcja | Co robi | Zapis? |
|---|---|---|---|
| `src/lib/market/setup.ts` | `analysisSnapshot` | `vol = volatilityFeatures(15m)` na tickerze | Nie. `TickerSnapshot.vol` żyje w RAM |
| `src/lib/market/volatility.ts` | `volatilityFeatures`, `wilderAtr` | Wilder ATR-14, `signedMove = Δclose/ATR` | Nie |
| `src/lib/agents/research.ts` | `researchTape` | Phase 1 + Vesper/Ash lean; `xs: null`; `factors: emptyFactorResearch()` | Nie |
| `src/lib/agents/research.ts` | `researchDebugBook` | xs z bieżących `signedMove`; OLS tylko gdy podany `panel` | W produkcji panel **nigdy** nie jest podany |
| `src/lib/agents/cross-section.ts` | `robustCrossSection` / `signedMoveCrossSection` | robust-z, min n=3 | Nie |
| `src/lib/agents/factors.ts` | `estimateFactors` | OLS okno 20, min 5 obs | Nie — brak historii |
| `src/lib/desk-store.ts` | `snapshot()` | Składa tickery z `a.htf` + `analysisSnapshot` | `partialize` **nie** trzyma `assets` / `htf` / `vol` |
| `src/lib/desk/away-council.ts` | `snapshotFromBook` | To samo przy away council | Do książki idzie `CouncilResult`, nie taśma research |
| `src/components/desk/research-lab.tsx` | `ResearchLab` | `researchDebugBook(snap.tickers)` **bez panelu** | Tylko UI. Factors zawsze „INSUFFICIENT HISTORY” |
| `src/lib/agents/runners.ts` | `vesperSnapshot` / `ashSnapshot` | LLM dostaje `research: { atr, signedMove, … }` | Request ephemeral |
| `src/lib/ai/council.ts` | `compactSnap` | **Wycina** `vol` z payloadu do LLM | — |
| Decision Engine / `runLocalV2` / `finalize` / Iris / Kai | — | **Zero** importów research | — |

Kod Phase 1–3 wszedł w commicie `717d779` (2026-09-14 23:27 UTC). `volatilityFeatures` podpięte w `setup.ts` w tym samym commicie.

Pętla serwera **niezależna od UI już istnieje** i research z niej nie korzysta:

- `src/lib/desk/persist.server.ts` → `ensureDeskLoop` → `setInterval(tickDesk, 60_000)` → `loadLiveMarket`

---

## 2. Źródła danych, które faktycznie istnieją

Przeszukane tokeny: `signedMove`, `atrPct`, `normalizedMove`, `vesperLean`, `marketResidual`, `ALPHA_RESEARCH`, `FactorPanel`.

**Wynik: zero trafień** w JSON-ach książek/vault oraz w 845 plikach PGLite.

### Książki paper — `data/books/`

- 9 unikalnych userId (+ klony `quorum-desk-…` z buga prefiksu).
- Schema `DeskBook`: cash, fills, tape, lastCouncil, positions, agentCalls.
- Brak `htf`, `series`, `vol`, jakichkolwiek pól research.

### Vault — `data/vault.json`

- 16 userów, 92 kopie książek.
- Mtime pliku: 2026-09-19 07:55 UTC (checkout/rebase — **nie** czas ostatniego ticka).
- Treść: `lastCouncilAt` wyłącznie **2026-09-15 10:51–11:01 UTC**.

### PGLite — `data/pglite/`

Tabele ze schematu migracji (brak research):

- `0001_auth.sql` — `user`, `session`, `account`, …
- `0002_desk.sql` — `desk_book`
- `0003_push.sql` — `desk_push`
- `0004_desk_books.sql` — `desk_books`
- `0005_desk_profiles.sql` — `desk_profiles`
- `_migrations`

### In-memory (ginie z procesem)

- Cache quote: 8 s (`src/lib/market/quotes.ts`).
- `candleMemo` 15m/1h/4h (`src/lib/wallet/hyperliquid.ts`). Nie dumpowane.

### localStorage `zw-desk`

Ten sam `DeskBook` co plik (bez świec). W sandboxie dumpów przeglądarki nie ma.

### Git

HEAD nie trackuje `data/`. Stare commity miały PGLite, ale bez tokenów research.

---

## 3. Zakres dat i liczby rekordów

mtime wielu plików = 2026-09-19 07:55. To operacja gita, **nie** czas treści. Poniżej daty z pól JSON.

| Źródło | Zakres | Rekordy |
|---|---|---|
| Konta (`vault.users.createdAt`) | 2026-09-09 19:42 → 2026-09-13 13:33 UTC | 16 |
| Fille (najbogatsza książka `OpDmksLm…`) | **2026-09-10 10:27 → 2026-09-12 12:16 UTC** | 37 filli, 19 closed |
| Taśma tekstowa (ring 80–120) | **2026-09-15 09:03 → 11:01 UTC** | 1040 łącznie: agent 855 / system 175 / news 10 |
| `lastCouncil` / `lastTickAt` | **2026-09-15 ~10:51–11:01 UTC** | 1 ostatni council na usera, nie seria |
| Kod Phase 1–3 w repo | od 2026-09-14 23:27 UTC | — |

Biurko działało ok. 9–15 września. Research w kodzie był tylko **ostatnie ~12 h** (15 wrz rano) i i tak nie był zapisywany. Starsza taśma z 10–12 wrz wypadła z ring-buffera.

---

## 4. Które metryki da się odzyskać

### Da się (to **nie** są metryki Research)

- Ostatni print V2.4 na usera: `finalScore`, band, agreement, Kai status.
- Vesper `evidence` z ostatniego councilu: `changePct`, `rsi`, `rvol` — **jeden tick**.
- Fille: `ts, symbol, side, price, qty` (10–12 wrz).
- Tezy agentów ze stringiem typu „ETH +0.14%, RSI 56” — anegdota, nie ATR.

### Nie da się odzyskać z naszych store’ów

- szereg `signedMove` / ATR / ATR% / `normalizedMove`
- robust-z (`xs`), median/MAD przekroju
- `marketBeta`, residual, sector residual, `observationCount`
- 15m OHLC z dni działania (nigdy nie persistowane)
- `FactorPanel`

### Vendor (to nie jest nasz log)

Kontrakt świec w `src/lib/wallet/hyperliquid.ts` `INTERVAL_SPEC`:

- 15m: 26 h / 96 barów
- 1h: 96 h / 80 barów
- 4h: 240 h / 60 barów

Okno 10–15 wrz z **15m** już z vendora wypadło. 1h/4h to **inna seria** niż kontrakt research (Wilder ATR-14 na 15m). Nie wolno tego podawać jako odzyskanych printów Labu.

---

## 5. Trwałość

| Warstwa | Trwała? |
|---|---|
| Phase 1 `vol` na tickerze | chwilowa (snapshot RAM) |
| Phase 2 xs w Labie | chwilowa (recompute przy renderze) |
| Phase 3 factors w Labie | zawsze puste — brak panelu |
| `lastCouncil` | trwały, ale V2.4, 1 rekord |
| 15m bars | RAM + vendor, nie nasz dysk |

---

## 6. Testy diagnostyczne (read-only)

Uruchomione, bez zapisu danych:

`research.test.ts`, `factors.test.ts`, `cross-section.test.ts`, `desk-view.test.ts`

**44 pass / 0 fail.**

Lock: *„snapshot-only debug book does not fabricate beta”* — `researchDebugBook` bez panelu → `sufficient false`, residual null.

Golden 01 nietknięty: `finalScore = 63.66`, ticket BTC, band small, `engineVersion = 2.4`.

---

## 7. Fakty vs przypuszczenia

**Fakty z kodu i plików**

- Brak zapisu research w persistence i migracjach.
- Lab woła `researchDebugBook(tickers)` bez `FactorPanel`.
- Tokeny research nie występują w `data/books`, `data/vault.json`, PGLite.
- Daty treści książek kończą się 15 wrz ~11:01 UTC.
- Test izolacji zabrania fabrykowania β.

**Przypuszczenia (nie używać jako odzysku)**

- Vendor 1h/4h może jeszcze mieć okolice 15 wrz; to i tak nie jest seria 15m Labu.
- localStorage użytkownika w przeglądarce ma ten sam `DeskBook` — bez świec, bez research.

---

## 8. Minimalny plan: Research Recorder

Cel: zbierać niezależnie od UI i od V2.4. Hook już jest: `tickDesk` → `loadLiveMarket` (ma `q.htf.m15`).

1. Nowy moduł `src/lib/agents/research-recorder.ts` — tylko `analysisSnapshot` + `researchDebugBook` + `estimateFactors`. Zero importów silnika / Kai / Iris / size.
2. Store append-only, gitignored: `data/research/prints.jsonl` (ew. tabela `research_prints` w nowej migracji). **Nie** wsadzać tego do `DeskBook`.
3. Rekord na zamkniętą świecę 15m (`t = floor(now / 15m)`), dedupe po `(t, symbol)`:
   - `t`, `symbol`
   - raw: `price, open, high, low, changePct, rsi, vsSma, rvol`
   - `atr, atrPct, signedMove, normalizedMove`
   - `vesperLean, ashLean` (research leans, nie ticket)
   - xs: `z, median, mad, n, sufficient`
   - factors: β/residual tylko gdy w pliku jest ≥5 wcześniejszych printów; inaczej null
4. Wywołanie z `tickDesk` **po** `loadLiveMarket`, raz na proces, nie per-user (uniwersum jest wspólne). UI nie jest wymagane.
5. Lab czyta recorder, nie odwrotnie. V2.4 bez zmian.
6. Testy: dwa ticki tej samej świecy → 1 linia; brak ATR → null, nie wymyślone liczby; golden 01 nietknięty.

To zamyka lukę na przyszłość: 20 printów ≈ 5 h 15m, potem Phase 3 przestaje pokazywać „insufficient”. **Wstecz nic nie wróci.**

---

*Koniec ETAP 1. Implementacja recordera — dopiero na wyraźne polecenie.*
