# StudentBnB EU Database

This directory is the single database definition for the European StudentBnB network.

## Scope
Active markets currently seeded:
- IT — casastudent.it
- ES — casastudent.es
- FR — casastudent.fr
- DE — casastudent.de
- PL — casastudent.pl

Reserved but inactive:
- PT — Portugal (domain and launch intentionally pending)

The core seed contains the university cities already present in the country frontends. Portuguese records remain inactive and are excluded from public queries until a future domain and launch decision. District/neighbourhood data remains in each active country frontend snapshot and can be imported in a second migration without changing the schema.

## Recommended runtime
Supabase (PostgreSQL) is the recommended first deployment because it provides:
- PostgreSQL
- Auth / magic-link email verification
- Row Level Security
- Storage for listing photos
- REST API generated from the schema

## Install
1. Create a Supabase project.
2. Open SQL Editor.
3. Run `schema.sql`.
4. Run `seed.sql`.
5. Create a public Storage bucket for listing images (or a private bucket with signed URLs).
6. Put the project URL and anon key in each country frontend.
7. Only then set `apiEnabled: true` in `assets/js/config.js`.

Do not enable `apiEnabled` before a live backend exists: the current frontend deliberately keeps its localStorage demo fallback.

## Country isolation
Every market entity carries `country_code` directly or inherits it through `city_id`. Queries, moderation and analytics must always filter by market. The database is shared; the country websites remain localized frontends.

## Core tables
`countries`, `cities`, `districts`, `users`, `email_verifications`, `listings`, `listing_images`, `student_requests`, `consent_records`, `reports`, `analytics_events`.

## Status flows
Listings and student requests:
`draft → email_pending → pending_review → published → suspended/expired`

## Next migration
Import the existing district snapshots from the five active country packages. Germany currently contains 1,531 named subdivisions and Poland 1,693, together with the current Italy, Spain and France snapshots.

This can be done without schema changes because `districts(city_id, slug, name)` is already defined.
