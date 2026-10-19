-- Oak & Key: accounts, saved listings and photo storage.
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to re-run.

-- One row per agent: the details that repeat on every listing.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  agent_name text not null default '',
  company_name text not null default '',
  social_link text not null default '',
  phone text not null default '',
  email text not null default '',
  -- Storage paths in the `media` bucket (not URLs).
  logo_path text,
  photo_path text,
  qr_path text,
  updated_at timestamptz not null default now()
);

-- A saved listing. `form` holds the text fields; `images` is
-- [{ "name": "kitchen.jpg", "path": "<user id>/<listing id>/<file>" }].
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '',
  form jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_user_updated_idx
  on public.listings (user_id, updated_at desc);

-- Row level security: every agent can only touch their own rows.
alter table public.profiles enable row level security;
alter table public.listings enable row level security;

drop policy if exists "profiles: own row" on public.profiles;
create policy "profiles: own row" on public.profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "listings: own rows" on public.listings;
create policy "listings: own rows" on public.listings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Photo storage. The bucket is public-read (flyers are marketing material and
-- the export needs to fetch the images) but objects can only be written into
-- the signed-in user's own folder: <user id>/...
-- Files are limited to 2 MB; the app resizes photos well below that.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: upload to own folder" on storage.objects;
create policy "media: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Deleting needs to be able to *see* the rows too (Postgres applies the select
-- rule to DELETE ... WHERE name = ...). Without this, removing a listing's
-- photos silently deletes nothing. Scoped to the user's own folder, so nobody
-- can list other people's files; public image URLs work without it.
drop policy if exists "media: read own files" on storage.objects;
create policy "media: read own files" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "media: delete own files" on storage.objects;
create policy "media: delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
