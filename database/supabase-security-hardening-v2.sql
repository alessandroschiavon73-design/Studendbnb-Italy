-- CasaStudent security hardening v2
-- Apply to the shared Supabase database before opening public publishing at scale.
-- Goal: the publishable browser key remains safe because authorization is enforced by RLS.

begin;

-- RLS must always be active on user-controlled/sensitive tables.
alter table if exists public.users enable row level security;
alter table if exists public.listings enable row level security;
alter table if exists public.student_requests enable row level security;
alter table if exists public.listing_images enable row level security;
alter table if exists public.consent_records enable row level security;
alter table if exists public.reports enable row level security;
alter table if exists public.analytics_events enable row level security;

-- Anonymous users must never read the base tables containing contact data.
revoke all on table public.listings from anon;
revoke all on table public.student_requests from anon;

-- Public browsing goes only through privacy-safe views.
grant select on public.public_listings to anon, authenticated;
grant select on public.public_student_requests to anon, authenticated;

-- Remove every known historical broad policy name (policy names are case-sensitive).
drop policy if exists "public published listings" on public.listings;
drop policy if exists "Public published listings" on public.listings;
drop policy if exists "Authenticated published listings" on public.listings;
drop policy if exists "owner listings" on public.listings;

drop policy if exists "public published requests" on public.student_requests;
drop policy if exists "Public published requests" on public.student_requests;
drop policy if exists "Public student requests" on public.student_requests;
drop policy if exists "Authenticated student requests" on public.student_requests;
drop policy if exists "owner requests" on public.student_requests;

-- Authenticated users can read published records and their own unpublished records.
create policy "casastudent listings read"
on public.listings
for select
to authenticated
using (status = 'published' or publisher_user_id = auth.uid());

create policy "casastudent requests read"
on public.student_requests
for select
to authenticated
using (status = 'published' or user_id = auth.uid());

-- Writes are strictly bound to the authenticated user.
create policy "casastudent listings insert own"
on public.listings
for insert
to authenticated
with check (publisher_user_id = auth.uid());

create policy "casastudent listings update own"
on public.listings
for update
to authenticated
using (publisher_user_id = auth.uid())
with check (publisher_user_id = auth.uid());

create policy "casastudent listings delete own"
on public.listings
for delete
to authenticated
using (publisher_user_id = auth.uid());

create policy "casastudent requests insert own"
on public.student_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "casastudent requests update own"
on public.student_requests
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "casastudent requests delete own"
on public.student_requests
for delete
to authenticated
using (user_id = auth.uid());

-- Explicit grants for authenticated CRUD; RLS remains the authorization boundary.
grant select, insert, update, delete on table public.listings to authenticated;
grant select, insert, update, delete on table public.student_requests to authenticated;

-- Do not expose a direct anonymous write endpoint that can be abused to inflate DB/costs.
-- Analytics should later pass through a rate-limited server/Edge Function.
revoke insert, update, delete on table public.analytics_events from anon;

-- Reporting stays authenticated. Anonymous abuse reports can be accepted later through
-- a rate-limited server/Edge Function rather than a direct table insert.
revoke insert, update, delete on table public.reports from anon;

drop policy if exists "authenticated reports" on public.reports;
create policy "casastudent authenticated reports"
on public.reports
for insert
to authenticated
with check (reporter_user_id = auth.uid());

commit;

-- Operational requirements outside PostgreSQL:
-- 1. Keep the Supabase service-role key server-side only. Never place it in GitHub Pages.
-- 2. Enable Supabase Auth rate limits / CAPTCHA when public traffic grows.
-- 3. Put uploads behind Storage RLS and validate MIME type, size and ownership server-side.
-- 4. Add API/Edge Function rate limiting for publish, contact reveal, reports and analytics.
-- 5. Log moderation/admin actions separately from user-generated content.
