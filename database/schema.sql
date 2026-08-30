-- StudentBnB EU database schema
-- Target: Supabase / PostgreSQL 15+
-- Version: 1.0 (2026-08-24)

create extension if not exists pgcrypto;
create extension if not exists citext;

create table if not exists public.countries (
  code char(2) primary key,
  name text not null,
  locale text not null,
  currency char(3) not null,
  domain text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null references public.countries(code) on update cascade,
  slug text not null,
  name text not null,
  region text,
  hero_image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(country_code, slug)
);

create table if not exists public.districts (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  slug text not null,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(city_id, slug)
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null,
  email_verified_at timestamptz,
  display_name text,
  phone text,
  country_code char(2) references public.countries(code),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  token_hash text not null unique,
  intent text not null check (intent in ('login','publish_listing','publish_request')),
  pending_record jsonb,
  expires_at timestamptz not null,
  confirmed_at timestamptz,
  country_code char(2) not null references public.countries(code),
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null references public.countries(code),
  city_id uuid not null references public.cities(id),
  district_id uuid references public.districts(id),
  publisher_user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  type text not null,
  arrangement text,
  price numeric(10,2) not null check (price >= 0),
  currency char(3) not null,
  expenses_included boolean not null default false,
  expenses_amount numeric(10,2) check (expenses_amount is null or expenses_amount >= 0),
  deposit numeric(10,2) check (deposit is null or deposit >= 0),
  agency_fee numeric(10,2) check (agency_fee is null or agency_fee >= 0),
  available_from date,
  available_to date,
  minimum_stay_months integer check (minimum_stay_months is null or minimum_stay_months >= 0),
  maximum_stay_months integer check (maximum_stay_months is null or maximum_stay_months >= minimum_stay_months),
  notice_period_days integer check (notice_period_days is null or notice_period_days >= 0),
  square_meters numeric(8,2) check (square_meters is null or square_meters > 0),
  room_count numeric(4,1) check (room_count is null or room_count > 0),
  furnished boolean,
  wifi_included boolean,
  contact_phone text,
  contact_email citext,
  status text not null default 'draft' check (status in ('draft','email_pending','pending_review','published','suspended','expired')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.student_requests (
  id uuid primary key default gen_random_uuid(),
  country_code char(2) not null references public.countries(code),
  city_id uuid not null references public.cities(id),
  district_id uuid references public.districts(id),
  user_id uuid not null references public.users(id) on delete cascade,
  title text,
  description text,
  type text,
  budget_max numeric(10,2) check (budget_max is null or budget_max >= 0),
  currency char(3) not null,
  available_from date,
  available_to date,
  minimum_stay_months integer check (minimum_stay_months is null or minimum_stay_months >= 0),
  status text not null default 'draft' check (status in ('draft','email_pending','pending_review','published','suspended','expired')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  country_code char(2) not null references public.countries(code),
  document_key text not null,
  document_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references public.users(id) on delete set null,
  entity_type text not null check (entity_type in ('listing','student_request','user')),
  entity_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  country_code char(2) references public.countries(code),
  event_name text not null,
  path text,
  anonymous_session_id text,
  properties_json jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists idx_cities_country_active on public.cities(country_code, active);
create index if not exists idx_districts_city_active on public.districts(city_id, active);
create index if not exists idx_listings_market on public.listings(country_code, city_id, status, created_at desc);
create index if not exists idx_listings_publisher on public.listings(publisher_user_id, status);
create index if not exists idx_requests_market on public.student_requests(country_code, city_id, status, created_at desc);
create index if not exists idx_requests_user on public.student_requests(user_id, status);
create index if not exists idx_analytics_country_time on public.analytics_events(country_code, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists trg_listings_updated_at on public.listings;
create trigger trg_listings_updated_at before update on public.listings for each row execute function public.set_updated_at();

drop trigger if exists trg_requests_updated_at on public.student_requests;
create trigger trg_requests_updated_at before update on public.student_requests for each row execute function public.set_updated_at();

alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.districts enable row level security;
alter table public.users enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.student_requests enable row level security;
alter table public.consent_records enable row level security;
alter table public.reports enable row level security;
alter table public.analytics_events enable row level security;

drop policy if exists "public countries" on public.countries;
create policy "public countries" on public.countries for select using (active = true);
drop policy if exists "public cities" on public.cities;
create policy "public cities" on public.cities for select using (active = true);
drop policy if exists "public districts" on public.districts;
create policy "public districts" on public.districts for select using (active = true);
drop policy if exists "public published listings" on public.listings;
create policy "public published listings" on public.listings for select using (status = 'published');
drop policy if exists "owner listings" on public.listings;
create policy "owner listings" on public.listings for all using (publisher_user_id = auth.uid()) with check (publisher_user_id = auth.uid());
drop policy if exists "public listing images" on public.listing_images;
create policy "public listing images" on public.listing_images for select using (exists (select 1 from public.listings l where l.id = listing_id and (l.status = 'published' or l.publisher_user_id = auth.uid())));
drop policy if exists "owner listing images" on public.listing_images;
create policy "owner listing images" on public.listing_images for all using (exists (select 1 from public.listings l where l.id = listing_id and l.publisher_user_id = auth.uid())) with check (exists (select 1 from public.listings l where l.id = listing_id and l.publisher_user_id = auth.uid()));
drop policy if exists "public published requests" on public.student_requests;
create policy "public published requests" on public.student_requests for select using (status = 'published');
drop policy if exists "owner requests" on public.student_requests;
create policy "owner requests" on public.student_requests for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "own profile" on public.users;
create policy "own profile" on public.users for all using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists "own consents" on public.consent_records;
create policy "own consents" on public.consent_records for all using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "authenticated reports" on public.reports;
create policy "authenticated reports" on public.reports for insert to authenticated with check (reporter_user_id = auth.uid() or reporter_user_id is null);
drop policy if exists "anonymous analytics" on public.analytics_events;
create policy "anonymous analytics" on public.analytics_events for insert to anon, authenticated with check (true);
