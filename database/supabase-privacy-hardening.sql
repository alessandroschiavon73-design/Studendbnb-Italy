-- CasaStudent Italy / shared EU database
-- Protect contact fields: anonymous users browse safe public views;
-- authenticated users can read contacts of published records.

begin;

-- Public safe view for housing listings (no contact fields, no publisher user id).
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

-- Public safe view for student requests (no contacts, no user id).
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

-- Anonymous visitors must not be able to query the underlying tables directly.
revoke select on public.listings from anon;
revoke select on public.student_requests from anon;

grant select on public.public_listings to anon, authenticated;
grant select on public.public_student_requests to anon, authenticated;

-- Replace the broad public table policies with authenticated-only read policies.
drop policy if exists "Public published listings" on public.listings;
drop policy if exists "Public student requests" on public.student_requests;

create policy "Authenticated published listings"
on public.listings
for select
to authenticated
using (
  status = 'published'
  or publisher_user_id = auth.uid()
);

create policy "Authenticated student requests"
on public.student_requests
for select
to authenticated
using (
  status = 'published'
  or user_id = auth.uid()
);

commit;
