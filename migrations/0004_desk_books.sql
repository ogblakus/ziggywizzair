create table if not exists desk_books (
  user_id    text primary key,
  payload    jsonb not null,
  updated_at timestamptz not null default now()
);
