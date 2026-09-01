# CasaStudent EU Database

This directory is the shared database definition for the European CasaStudent network.

## Scope
Active markets currently seeded:
- IT — casastudent.it
- ES — casastudent.es
- FR — casastudent.fr
- DE — casastudent.de
- PL — casastudent.pl

Reserved but inactive:
- PT — Portugal (domain and launch intentionally pending)

The core seed contains the university cities already present in the country frontends. Portuguese records remain inactive until a future launch decision. District/neighbourhood data remains in each active country frontend snapshot and can be imported without changing the core model.

## Recommended runtime
Supabase (PostgreSQL) is the recommended first deployment because it provides:
- PostgreSQL
- Auth / magic-link email verification
- Row Level Security
- Storage for listing photos
- REST API generated from the schema

## Install / upgrade order
For a fresh Supabase project, run the SQL files in this order:

1. `schema.sql` — creates the base tables and initial RLS.
2. `seed.sql` — inserts countries and cities.
3. `supabase-runtime-contract-v3.sql` — aligns the database with the current frontend fields, creates favorites and synchronizes `auth.users` with `public.users`.
4. `supabase-privacy-hardening.sql` — exposes privacy-safe public views without contact data.
5. `supabase-security-hardening-v2.sql` — applies the stricter authenticated write/read policies and closes direct anonymous write paths.

After that:
- create the listing-image Storage bucket with Storage RLS;
- configure Auth redirect URLs for every active CasaStudent domain;
- keep only the Supabase publishable key in frontend code;
- keep the service-role key server-side only;
- enable Auth rate limits / CAPTCHA before public traffic grows.

## Important runtime contract
The current browser integration uses:
- `listings.listing_type`;
- `student_requests.accommodation_type`;
- contact fields including WhatsApp/Telegram;
- `favorites`;
- public safe views `public_listings` and `public_student_requests`.

Do not deploy using only the historical `schema.sql`: always apply `supabase-runtime-contract-v3.sql` before enabling public publishing.

## Country isolation
Every market entity carries `country_code` directly or inherits it through `city_id`. Queries, moderation and analytics must always filter by market. The database is shared; the country websites remain localized frontends.

## Core tables
`countries`, `cities`, `districts`, `users`, `email_verifications`, `listings`, `listing_images`, `student_requests`, `favorites`, `consent_records`, `reports`, `analytics_events`.

## Status flows
Listings and student requests:
`draft → email_pending → pending_review → published → suspended/expired`

## Next migration
Import the existing district snapshots from the active country packages and add university entities/SEO landing data. This can be done without changing the city-level frontend routing.
