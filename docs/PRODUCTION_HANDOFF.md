# Neram production handoff

## Already built

- Chennai-focused emergency-trip data model
- PostGIS signal geometry
- verified vs unverified signal provenance
- active-trip protection
- idempotent alert upsert primitive
- GPS freshness/quality rules
- route-aware signal detection
- Leaflet + OpenStreetMap map UI
- Valhalla routing adapter
- ambulance training flow
- police alert feed and console
- explicit training/operational mode
- RLS and database security hardening

## Deferred account-level work

1. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Vercel.
2. Enable authenticated Supabase sessions for ambulance and police roles.
3. Load verified Chennai signal records into `traffic_signals`.
4. Assign each operational signal to the correct police unit.
5. Replace training-only APIs with authenticated Supabase-backed writes.
6. Replace development routing dependency with a self-hosted/managed Valhalla deployment when traffic requires it.

## Operational rule

Neram provides information to authorized traffic personnel. It never directly changes traffic-signal state.

## Go-live gate

The app must remain in training mode until signal data, police assignments, authentication, GPS freshness handling, and alert delivery have been validated end-to-end by the deployment owner.
