-- =====================================================================
-- Playlists library schema
-- Run this once in the Supabase dashboard → SQL Editor → New query.
-- It is safe to run more than once, and it upgrades an existing
-- `playlists` table in place (it only ADDS missing columns).
-- =====================================================================

-- 1) Playlists ---------------------------------------------------------
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'My Playlist',
  created_at  timestamptz not null default now()
);

alter table public.playlists add column if not exists user_id     uuid references auth.users (id) on delete cascade default auth.uid();
alter table public.playlists add column if not exists description text;
alter table public.playlists add column if not exists cover_url   text;
alter table public.playlists add column if not exists is_public   boolean not null default true;
alter table public.playlists add column if not exists created_at  timestamptz not null default now();
alter table public.playlists add column if not exists updated_at  timestamptz not null default now();

create index if not exists playlists_user_id_idx on public.playlists (user_id);

-- 2) Songs inside a playlist ------------------------------------------
-- Song details are copied onto the row so the library works without a
-- separate songs catalog. `playlist_id` is created with the same type as
-- playlists.id (uuid or bigint), whichever your table already uses.
do $$
declare
  id_type text;
begin
  select format_type(a.atttypid, a.atttypmod)
    into id_type
    from pg_attribute a
   where a.attrelid = 'public.playlists'::regclass
     and a.attname = 'id';

  execute format($f$
    create table if not exists public.playlist_tracks (
      id           uuid primary key default gen_random_uuid(),
      playlist_id  %s not null references public.playlists (id) on delete cascade,
      track_id     text not null,              -- id from the music source
      title        text not null,
      artist       text not null default '',
      album        text not null default '',
      artwork_url  text,
      preview_url  text,                       -- 30s preview audio (may be null)
      duration_ms  integer not null default 0,
      explicit     boolean not null default false,
      position     integer not null default 0, -- custom order in the playlist
      added_at     timestamptz not null default now(),
      unique (playlist_id, track_id)
    )
  $f$, id_type);
end $$;

create index if not exists playlist_tracks_playlist_idx on public.playlist_tracks (playlist_id, position);

-- 3) Keep playlists.updated_at fresh (drives the "Recents" sort) -------
create or replace function public.touch_playlist() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'playlists' then
    new.updated_at := now();
    return new;
  end if;
  update public.playlists set updated_at = now()
   where id = coalesce(new.playlist_id, old.playlist_id);
  return coalesce(new, old);
end $$;

drop trigger if exists playlists_touch on public.playlists;
create trigger playlists_touch before update on public.playlists
  for each row execute function public.touch_playlist();

drop trigger if exists playlist_tracks_touch on public.playlist_tracks;
create trigger playlist_tracks_touch after insert or update or delete on public.playlist_tracks
  for each row execute function public.touch_playlist();

-- 4) Row Level Security: users only see and change their own data -----
alter table public.playlists       enable row level security;
alter table public.playlist_tracks enable row level security;

drop policy if exists "playlists: owner select" on public.playlists;
drop policy if exists "playlists: owner insert" on public.playlists;
drop policy if exists "playlists: owner update" on public.playlists;
drop policy if exists "playlists: owner delete" on public.playlists;

create policy "playlists: owner select" on public.playlists for select using (auth.uid() = user_id);
create policy "playlists: owner insert" on public.playlists for insert with check (auth.uid() = user_id);
create policy "playlists: owner update" on public.playlists for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "playlists: owner delete" on public.playlists for delete using (auth.uid() = user_id);

drop policy if exists "tracks: owner all" on public.playlist_tracks;
create policy "tracks: owner all" on public.playlist_tracks for all
  using      (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.playlists p where p.id = playlist_id and p.user_id = auth.uid()));

-- NOTE: rows created before this migration have user_id = NULL and will be
-- hidden by the policies above. To claim them for your account, run:
--   update public.playlists set user_id = '<your auth user id>' where user_id is null;

-- 5) Make the Supabase API see the new tables/columns right away
--    (fixes "Could not find ... in the schema cache" errors).
notify pgrst, 'reload schema';