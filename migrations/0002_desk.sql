create table if not exists desk_book (
  id         text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);
