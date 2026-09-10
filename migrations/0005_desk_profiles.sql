create table if not exists desk_profiles (
  user_id    text primary key,
  username   text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists desk_profiles_username_idx
  on desk_profiles (lower(username));
