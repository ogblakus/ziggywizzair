-- Trusted devices + one-time recovery codes for password reset
-- (no email sending — reset from a known device, or the recovery code).

create table if not exists desk_devices (
  id          text primary key,
  user_id     text not null,
  token_hash  text not null unique,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now()
);

create index if not exists desk_devices_user_idx on desk_devices (user_id);

create table if not exists desk_recovery (
  user_id     text primary key,
  code_hash   text not null,
  created_at  timestamptz not null default now()
);
