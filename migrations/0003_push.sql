create table if not exists desk_push (
  id         text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);
