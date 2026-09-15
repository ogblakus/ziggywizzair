Phase 3 weszło jako research-only. Silnik V2.4 nietknięty.

---

## PHASE GATE: **PASS**

---

### A. Sanity check Phase 2 robust-z — `[1, 2, 3, 100]`

**Werdykt: B.** Implementacja jest spójna z własnym wzorem. Raport ≈66 był **poprawny**. 131.3 wynika z **innej konwencji mediany parzystej**, nie z buga.

| | |
|---|---|
| Wzór w kodzie | `z = (x − median) / (1.4826 × MAD)` |
| Mediana parzysta | średnia dwóch środkowych (numpy/scipy), **nie** low-median |
| MAD w kodzie | `median(\|x − 2.5\|)` = median `[0.5, 0.5, 1.5, 97.5]` = **(0.5+1.5)/2 = 1** |
| Output live | **z(100) = 65.76284904896804** |
| Gdyby MAD=0.5 (low-median) | z ≈ 131.53 |

Implementacji **nie zmieniałem**. Dodałem pin: `median=2.5`, `mad=1`, `z=65.76284904896804`.

---

### B–J. Model czynnikowy

**R** = `signedMove` (Δclose/ATR), nie raw return, nie score Vespera.

**Market factor (leave-one-out EW):**
`R_m,i,t = mean_{j≠i}(signedMove_j,t)`

Nie BTC-as-market: uniwersum miesza crypto / metale / equity / SPY. Nie ma cap-weight. EW LOO jest jedynym simultanicznym, audytowalnym czynnikiem z panelu.

**Regresja:** OLS z interceptem  
`R_i,t = α_i + β_i R_m,i,t + ε_i,t`  
`ε_i,t = R_i,t − (α_i + β_i R_m,i,t)`  *(in-sample, okno kończy się na T)*

| | |
|---|---|
| Okno | ostatnie **20** sparowanych obs. z `t ≤ T` |
| Min | **5** |
| Braki | para dropowana, nie imputowana |
| Var(R_m)=0 | β=null, residual=null, `sufficient=false` |
| Za mało historii | null — **nigdy β=1, nigdy residual=raw** |

**Sektor: zaimplementowany**, bo `sectorOf()` już jest (`crypto` / `metals` / `equities`).  
Sekwencyjnie: `ε_m,t = α_s + β_s R_s,i,t + ε_s,t`, `R_s` = LOO EW tego samego sektora.  
Brak peerów (BTC bez ETH) → pola sector = **null**, residual zostaje rynkowy.

**Snapshot V2.4 nie ma panelu historycznego** → `research.factors` na live tick to szczere null. Helper przyjmuje jawny `FactorPanel`. Nie zmyślam historii.

---

### K. Contract v1.2

```
research.raw
research.vol      // + signedMove
research.alpha    // vesperLean, ashLean, signedMove
research.xs
research.factors  // market/sector beta, fitted, residual, n, sufficient
```

`researchDebugBook(tickers, panel?, at?)` — bez UI.

---

### L–Q. Testy / lock

A–I matematyczne (tracker β=2 ε≈0, unrelated, constant market, n&lt;5, nulls, T+1 nie rusza T, ETH tylko przez factor, sector peer, brak peerów).  
J/K/L/M: robust-z, ATR, Vesper≠Kai, golden 01.

| | |
|---|---|
| typecheck | pass |
| test:agents | **117 pass / 10 todo / 0 fail** |
| golden 01–37 | bez zmian |
| ticket changes | **0** |
| finalScore changes | **0** |
| engine | **2.4 canonical** |

---

### R. V2.4

Decision Engine, Iris, wagi, 60/57, Kai READY/WAIT/chase, scoring Vesper/Ash — **nie ruszane**. Research nie wchodzi do ticketu.

---

**FOLLOW-UP** (poza Phase 3, nie ruszane):

1. `TickerSnapshot` nie niesie historii `signedMove` — live desk ma `factors.sufficient=false`, dopóki ktoś nie poda panelu z 15m (np. z `htf.m15`). To uczciwy null, nie bug.
2. `UNIVERSE[].beta` to statyczny dekor stołu, **nie** research beta. Nie używać zamiennie.

Phase 4 (nie teraz): składanie Vesper + Ash + residual w jeden alpha.
