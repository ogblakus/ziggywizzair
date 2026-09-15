ZiggyWizzAir

Multi-agent paper-trading research desk for systematic market analysis.

ZiggyWizzAir is a research-oriented trading system built around specialized analytical agents, a deterministic decision engine, risk controls, and a separate quantitative research layer.

Current canonical engine: V2.4
Current research layer: Phase 3 (research-only)
Execution mode: paper trading / simulation only

⚠️ Status and scope

This project is not a live trading system and does not place real broker orders.

The current architecture deliberately separates:

research and signal generation,

setup construction,

deterministic decision gates,

risk and position sizing,

quantitative factor research.

Phase 3 research outputs are currently not connected to the V2.4 ticket decision path. This is intentional: new quantitative research must be validated before it is allowed to influence trading decisions.

Architecture

                         MARKET DATA
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       VESPER                ASH                 KAI
      Momentum            Mean Reversion      Setup Quality
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                           DAMIAN
                       Regime / Macro
                              │
                              ▼
                    V2.4 DECISION ENGINE
                              │
                              ▼
                            IRIS
                       Risk / Position Size
                              │
                              ▼
                            TICKET

             ─────────────────────────────────
                     RESEARCH-ONLY PATH
             ─────────────────────────────────
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
       Vesper              Ash              signedMove
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
                       Normalization
                              │
                       Factor Research
                              │
                 Market / Sector Residuals
                              │
                              ▼
                       Phase 3 outputs
                              │
                         [NO TICKET]

The research path is intentionally isolated from the canonical V2.4 decision engine.

The five agents

Vesper — Momentum

Vesper evaluates directional momentum using market/tape information such as price movement, relative volume, SMA relationship and RSI.

Vesper does not use Kai's setup labels to manufacture momentum conviction. This preserves separation between momentum analysis and setup quality.

Ash — Mean Reversion

Ash looks for mean-reversion conditions and can explicitly return HOLD when it has no independent idea.

Silence/HOLD is not treated as a bullish vote. This prevents missing information from artificially increasing council agreement.

Kai — Setup Quality

Kai is responsible for the trade geometry and setup state:

READY

WAIT

CHASE

BLOCKED

Kai is the source of setup geometry such as entry/limit, stop and target when the market structure supports them.

A WAIT result does not become READY merely because an LLM suggests otherwise. The mathematical gate remains authoritative.

Kai also does not invent a synthetic limit price when no valid entry geometry exists.

Damian — Regime / Macro

Damian provides regime and macro context. His information can act as a required tailwind/gate for new risk rather than being treated as another interchangeable directional signal.

Iris — Risk Chair

Iris controls risk and sizing after a candidate survives the decision gates.

Iris does not rescue an invalid setup by inventing missing trade geometry. In particular, missing or inadequate SL/TP geometry should result in no trade rather than fabricated risk parameters.

V2.4 decision philosophy

The canonical decision path is deliberately conservative:

Agent analysis
      ↓
Kai setup validation
      ↓
Quorum / agreement
      ↓
Score + macro + risk gates
      ↓
V2.4 Decision Engine
      ↓
Iris sizing
      ↓
Paper-trading ticket

Important properties include:

Kai WAIT does not qualify as READY.

CHASE, THIN, invalid geometry and extension conditions can prevent new risk.

Missing volume data is handled conservatively.

Hysteresis is scoped by symbol + side and only uses a matching previously printed ticket.

A ticket from another symbol cannot influence the current symbol's band.

A previous short ticket cannot provide hysteresis for a new long ticket.

Mixed bullish/bearish votes are not automatically classified as HIGH agreement.

Strong direct Vesper/Ash conflict can still produce LOW agreement.

New positions and adds are subject to separate constraints.

Kai and TP/SL ownership

The intended responsibility split is:

Kai
 ├─ setup state
 ├─ entry / limit geometry
 ├─ stop-loss geometry
 ├─ take-profit geometry
 └─ RR
       ↓
Decision Engine
 ├─ validates the setup
 ├─ applies minimum-quality gates
 └─ decides whether a ticket is allowed
       ↓
Iris
 └─ risk / position sizing

Iris should not invent an SL/TP simply to make a trade pass a minimum-RR rule.

Phase 3 — Alpha Research

Phase 3 is research-only. It does not change finalScore, ticket generation, V2.4 weights, or the canonical engine.

Current research contract:

research.raw
research.vol
research.alpha
research.xs
research.factors

Core research quantities

The research layer uses:

R = signedMove = Δclose / ATR

rather than treating Vesper's score as a factor return.

Robust normalization

The current robust-z convention is:

z = (x - median(x)) / (1.4826 × MAD(x))

For an even-sized sample, the implementation uses the arithmetic mean of the two middle observations as the median.

The convention is explicitly tested to prevent accidental changes in statistical semantics.

Market factor

The market factor is a leave-one-out equally weighted mean:

R_m,i,t = mean(R_j,t), j ≠ i

The universe is not reduced to BTC as a proxy for the market. It can contain crypto, metals and equities.

Factor regression

For each asset:

R_i,t = α_i + β_i R_m,i,t + ε_i,t

with:

ε_i,t = R_i,t - (α_i + β_i R_m,i,t)

Current research constraints:

last 20 paired observations,

minimum 5 observations,

missing pairs are dropped rather than imputed,

zero market variance produces null beta/residual,

insufficient history produces null values,

research beta is not the same thing as the static UNIVERSE[].beta field.

A sector-level residual layer is also supported for the existing sectors (crypto, metals, equities). If there are no peers, the sector fields remain null and the market residual is retained.

No fabricated history

The live V2.4 snapshot does not contain a full historical signedMove panel. Therefore, live factor research can legitimately return:

sufficient = false

until a real historical panel is supplied.

The system does not silently substitute fake history, β = 1, or raw return as a residual.

Phase gates

The project uses explicit phase gates to prevent research work from silently changing the canonical trading engine.

Current state

Phase

Status

Purpose

Phase 1

✅ Complete

Agent architecture and core harness

Phase 2 / V2.4

🔒 Canonical / locked

Decision, quorum, setup and risk controls

Phase 3

✅ Research-only

Alpha, normalization and factor research

Phase 4

⏸️ Not started

Alpha combination

Phase 4 must not bypass the V2.4 decision/risk gates.

Testing

The project uses automated tests for agent behavior, mathematical research logic and golden scenarios.

Current reported V2.4 + Phase 3 checkpoint:

typecheck — PASS

test:agents — 117 pass / 10 todo / 0 fail

Golden scenarios 01–37 — unchanged

Ticket changes from Phase 3 — 0

finalScore changes from Phase 3 — 0

Canonical engine — V2.4

Golden scenarios are treated as a regression contract for the canonical decision engine.

Repository structure

The exact implementation may evolve, but the major responsibilities are organized around:

src/
├── lib/
│   ├── agents/
│   │   ├── personas.ts
│   │   ├── pipeline.ts
│   │   ├── quorum.ts
│   │   ├── scorecard.ts
│   │   ├── reflect.ts
│   │   └── local-council.ts
│   │
│   ├── market/
│   ├── desk/
│   └── ...
│
├── routes/
└── ...

The agent layer is intentionally kept separate from the application/UI layer so that decision logic can be tested independently.

Development

Install dependencies:

npm install

Start the development server:

npm run dev

Typecheck:

npm run typecheck

Run the test suite:

npm test

Run agent/research tests where available in the current workspace:

npm run test:agents

Lint:

npm run lint

Format:

npm run format

Build:

npm run build

Note: available scripts can change with the application workspace. Use npm run to inspect the current script list.

Research roadmap

The intended research progression is:

Phase 3
  │
  ├─ raw market features
  ├─ volatility normalization
  ├─ robust normalization
  ├─ Vesper alpha
  ├─ Ash alpha
  ├─ market factor
  ├─ sector factor
  └─ residuals
       │
       ▼
Paper observations / attribution
       │
       ▼
Incremental information testing
       │
       ▼
Phase 4 — Alpha Combination
       │
       ├─ Vesper
       ├─ Ash
       └─ factor residual
       │
       ▼
Combined alpha
       │
       ▼
V2.4 decision gates
       │
       ▼
Iris risk control

Phase 4 should only be introduced after establishing that the component signals contain useful and sufficiently independent information.

Design principles

1. No fake independence

Agents should not receive another agent's derived score or setup labels when doing so would make apparent agreement circular.

2. No forced trades

The system must be allowed to say WAIT / HOLD / NO TRADE.

A trading system that always produces a ticket is not necessarily a better system.

3. Research cannot silently change execution logic

New research fields remain inert until an explicit phase gate authorizes their use.

4. Null is better than fabricated data

Missing history, missing volume or insufficient factor observations should remain explicit rather than being replaced with convenient defaults.

5. Risk is a separate responsibility

Signal quality, setup geometry, decision permission and position sizing are different problems and should remain separate.

6. Test behavior, not just implementation

Golden scenarios and mathematical invariants are part of the system contract.

7. No look-ahead bias

Research calculations must respect the information available at the decision timestamp. Historical panels and factor calculations must not leak future observations into past decisions.

Non-goals

ZiggyWizzAir is currently not intended to:

execute real broker orders,

guarantee profitability,

replace professional investment/risk management,

allow an LLM to freely override deterministic safety gates,

fabricate missing market history,

optimize itself directly against a small golden-test suite.

License

No license has been specified for this project yet.
