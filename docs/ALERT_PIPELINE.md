# Neram alert pipeline

## Intended production flow

1. An authenticated ambulance starts an emergency trip.
2. The ambulance sends timestamped GPS samples.
3. Neram validates coordinates, timestamp, speed and GPS accuracy.
4. A map-matching layer snaps the trace to the road network.
5. The routing layer identifies the ambulance's forward route.
6. PostGIS finds nearby **verified** traffic signals assigned to police units.
7. The alert engine checks route position, distance-ahead, ETA, GPS quality and confidence.
8. For an approaching signal, Neram performs an idempotent alert upsert for the `(trip, signal)` pair.
9. The assigned police console receives the alert through Supabase Realtime.
10. The officer acknowledges and later clears the alert.

## Safety constraints

- Neram never changes traffic signals automatically.
- Unverified signals must never be used for operational alerts.
- Stale or invalid GPS samples must never create an alert.
- Duplicate ambulance updates must not create duplicate alerts for the same trip/signal pair.
- A missing route, weak GPS match or unavailable data source must degrade to a clear non-operational state rather than inventing certainty.
- Training/demo data must remain visibly distinct from operational data.
