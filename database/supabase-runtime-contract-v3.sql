-- CasaStudent runtime contract v3
-- Aligns the repository schema with the fields used by assets/js/supabase-integration.js.
-- Safe to run after schema.sql; statements are designed to be idempotent where possible.

begin;

-- Normalize historical column names to the runtime names used by the frontend.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='type'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='listings' and column_name='listing_type'
  ) then
    execute 'alter table public.listings rename column type to listing_type';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='student_requests' and column_name='type'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='student_requests' and column_name='accommodation_type'
  ) then
    execute 'alter table public.student_requests rename column type to accommodation_type';
  end if;
end $$;

alter table public.listings
  add column if not exists listing_type text,
  add column if not exists address text,
  add column if not exists latitude numeric(9,6),
  add column if not exists longitude numeric(9,6),
  add column if not exists contact_name text,
  add column if not exists contact_whatsapp text,
  add column if not exists contact_telegram text,
  add column if not exists featured boolean not null default false,
  add column if not exists views bigint not null default 0;

alter table public.student_requests
  add column if not exists accommodation_type text,
  add column if not exists contact_phone text,
  add column if not exists contact_email citext,
  add column if not exists contact_whatsapp text,
  add column if not exists contact_telegram text;

-- Favorites are already used by the frontend and must exist in a fresh deployment.
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;
revoke all on table public.favorites from anon;
grant select, insert, update, delete on table public.favorites to authenticated;

drop policy if exists "casastudent favorites own" on public.favorites;
create policy "casastudent favorites own"
on public.favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "casastudent favorites insert own" on public.favorites;
create policy "casastudent favorites insert own"
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "casastudent favorites update own" on public.favorites;
create policy "casastudent favorites update own"
on public.favorites
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "casastudent favorites delete own" on public.favorites;
create policy "casastudent favorites delete own"
on public.favorites
for delete
to authenticated
using (user_id = auth.uid());

-- Supabase Auth creates auth.users records, but listings reference public.users.
-- Keep the application profile table automatically synchronized with Auth.
create or replace function public.casastudent_sync_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null then
    return new;
  end if;

  insert into public.users (id, email, email_verified_at, display_name)
  values (
    new.id,
    new.email,
    new.email_confirmed_at,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    email_verified_at = coalesce(excluded.email_verified_at, public.users.email_verified_at),
    display_name = coalesce(public.users.display_name, excluded.display_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists casastudent_auth_user_sync on auth.users;
create trigger casastudent_auth_user_sync
after insert or update of email, email_confirmed_at on auth.users
for each row execute function public.casastudent_sync_auth_user();

-- Backfill users who authenticated before this trigger existed.
insert into public.users (id, email, email_verified_at, display_name)
select
  id,
  email,
  email_confirmed_at,
  coalesce(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
from auth.users
where email is not null
on conflict (id) do update set
  email = excluded.email,
  email_verified_at = coalesce(excluded.email_verified_at, public.users.email_verified_at),
  display_name = coalesce(public.users.display_name, excluded.display_name),
  updated_at = now();

-- Rebuild privacy-safe public views using the runtime column names.
create or replace view public.public_listings as
select
  id,
  country_code,
  city_id,
  district_id,
  title,
  description,
  listing_type,
  arrangement,
  price,
  currency,
  expenses_included,
  expenses_amount,
  deposit,
  agency_fee,
  available_from,
  available_to,
  minimum_stay_months,
  square_meters,
  furnished,
  wifi_included,
  address,
  latitude,
  longitude,
  status,
  featured,
  views,
  published_at,
  expires_at,
  created_at,
  updated_at
from public.listings
where status = 'published';

create or replace view public.public_student_requests as
select
  id,
  country_code,
  city_id,
  district_id,
  title,
  description,
  accommodation_type,
  budget_max,
  currency,
  available_from,
  available_to,
  minimum_stay_months,
  status,
  published_at,
  expires_at,
  created_at,
  updated_at
from public.student_requests
where status = 'published';

grant select on public.public_listings to anon, authenticated;
grant select on public.public_student_requests to anon, authenticated;

commit;
