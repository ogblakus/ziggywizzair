-- Universe-wide Phase 3 research prints. Not per-user. Not DeskBook.
-- Unique on closed 15m open-time + symbol so tickDesk / restarts cannot duplicate.

create table if not exists research_prints (
  bar_t               bigint not null,
  symbol              text not null,
  version             text not null,
  recorded_at         timestamptz not null default now(),
  open_px             double precision,
  high_px             double precision,
  low_px              double precision,
  close_px            double precision,
  volume              double precision,
  session_open        double precision,
  change_pct          double precision,
  rsi                 double precision,
  vs_sma              double precision,
  rvol                double precision,
  atr                 double precision,
  atr_pct             double precision,
  signed_move         double precision,
  normalized_move     double precision,
  vesper_lean         double precision,
  ash_lean            double precision,
  xs_z                double precision,
  xs_median           double precision,
  xs_mad              double precision,
  xs_n                integer,
  xs_sufficient       boolean not null default false,
  market_factor       double precision,
  market_beta         double precision,
  market_alpha        double precision,
  market_fitted       double precision,
  market_residual     double precision,
  sector              text,
  sector_factor       double precision,
  sector_beta         double precision,
  sector_fitted       double precision,
  sector_residual     double precision,
  residual            double precision,
  observation_count   integer not null default 0,
  factors_sufficient  boolean not null default false,
  bar_complete        boolean not null default false,
  missing             jsonb not null default '[]'::jsonb,
  payload             jsonb not null,
  primary key (bar_t, symbol)
);

create index if not exists research_prints_symbol_bar_idx
  on research_prints (symbol, bar_t desc);

create table if not exists research_recorder_status (
  id               text primary key,
  updated_at       timestamptz not null default now(),
  last_bar_t       bigint,
  last_inserted    integer not null default 0,
  last_duplicate   integer not null default 0,
  last_error       text,
  missing_symbols  jsonb not null default '[]'::jsonb,
  gaps             jsonb not null default '[]'::jsonb
);
