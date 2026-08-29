# Neram Build Roadmap

## Product north star

Neram is a Chennai emergency ambulance coordination system. While an ambulance is on an authorized active emergency trip, the system determines which traffic signal it is approaching and gives the responsible traffic police unit timely, actionable information. Neram never directly controls traffic signals.

## Build order

1. Foundation: monorepo structure, environment configuration, Supabase schema, roles, RLS.
2. Geospatial core: verified signal dataset, coordinate handling, route representation, route progress, signal approach detection.
3. Simulation: deterministic ambulance movement through a known route and reproducible alert scenarios.
4. Police experience: live alert dashboard optimized for glanceability and rapid acknowledgement.
5. Ambulance experience: minimal-touch trip activation and robust background location collection.
6. Realtime: live location updates, targeted alerts, stale-device handling, retry behavior.
7. Production hardening: authentication, device verification, audit events, observability, load/failure testing.

## Geospatial rules

- Never choose an upcoming signal using raw Euclidean/geographic distance alone.
- Prefer road-aware route order and route position.
- Treat GPS as noisy input. Record accuracy and timestamps.
- Do not create a police alert unless the signal is plausibly ahead on the ambulance route.
- ETA is generally more useful than straight-line distance for alert timing.
- Alert generation must be idempotent for a trip/signal pair.
- The system must cope with wrong turns, route changes, stale GPS, duplicate updates, and network loss.
- Keep demo coordinates clearly marked and never present them as verified operational data.

## Safety rules

- Only verified ambulance accounts/devices may create active emergency trips.
- Police alerts are informational; the officer decides the appropriate traffic action.
- Never expose service-role credentials to clients.
- Every exposed Supabase table must have appropriate RLS policies.
- Avoid storing more location history than is justified by the product and testing requirements.
- Keep an audit trail for important state transitions and alert acknowledgements.

## Engineering rules

- TypeScript strict mode.
- Keep domain logic out of UI components.
- Prefer small pure functions for geospatial calculations and alert decisions.
- Test geospatial edge cases and failure states, not only happy paths.
- Do not silently change architecture or replace providers without documenting the tradeoff.
- Do not fabricate production data. Use explicit fixtures until real sources are verified.
- Before claiming a feature works, verify it against the repository/database/deployment state when the tooling allows it.

## Definition of done for a feature

- Correct behavior demonstrated with a deterministic test or simulation.
- Failure/edge cases considered.
- Security implications considered.
- UI states for loading, empty, success, error, stale/offline, and acknowledged/cleared are defined where applicable.
- Documentation updated when architecture or operational behavior changes.
