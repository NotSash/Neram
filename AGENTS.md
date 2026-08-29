# Neram engineering playbook

This file is the persistent build context for AI coding agents working on Neram. Read it before changing architecture or core logic.

## Product contract

Neram is a Chennai emergency ambulance coordination system. It tracks **verified, active emergency ambulances** and informs the traffic-police unit assigned to an upcoming signal when the ambulance is approaching. The police officer decides what traffic action to take.

Neram must NEVER directly control traffic signals in the MVP. Do not build APIs, UI, permissions, or integrations that imply Neram can operate signal hardware.

## Core architecture

- Web dashboard: Next.js App Router + TypeScript
- Mobile ambulance application: React Native / Expo
- Backend: Supabase PostgreSQL
- Geospatial database: PostGIS
- Realtime: Supabase Realtime
- Server logic: Supabase Edge Functions / database functions where appropriate
- Web deployment: Vercel
- Mapping/routing: provider abstraction; Mapbox is a likely implementation
- Road data: use verified/licensed sources; never invent production Chennai coordinates

## Domain model

Core entities include:
- profiles: authenticated people and role
- ambulances: verified emergency vehicles/devices
- emergency_trips: active/completed/cancelled emergency journeys
- ambulance_locations: timestamped live GPS observations
- traffic_signals: geolocated signal/intersection records
- police_units: traffic personnel/unit identities
- signal_assignments: which police unit is responsible for a signal
- alerts: ambulance-to-signal notifications and their lifecycle

## Geospatial rules

1. Never select the next traffic signal using straight-line distance alone.
2. The next signal must be on the ambulance's projected forward road route.
3. GPS observations are noisy. Account for accuracy, heading, stale timestamps, and jumps.
4. Use road-aware map matching/routing when moving beyond the controlled simulator.
5. Prefer ETA to raw distance for alert timing; distance can supplement ETA.
6. Alert only the relevant police unit(s), not every police user in Chennai.
7. Alerts must be idempotent and should transition through explicit states.
8. Once an ambulance has passed a signal, the alert should be marked cleared and should not re-trigger for that same trip/signal.
9. Do not use demo fixtures as production Chennai signal data.

## Alert safety/reliability

A false or stale emergency alert is dangerous. Implement:
- minimum GPS quality checks
- stale-location timeout
- route-confidence checks
- duplicate suppression
- wrong-turn/re-route handling
- alert expiry
- clear audit/event timestamps
- explicit active-trip state
- device/authentication verification

The server is the source of truth for alert decisions. The UI displays decisions; it should not invent them.

## Security rules

- Every exposed table must have appropriate RLS.
- Ambulance location writes must require a verified ambulance identity/device and active trip.
- Police users may only read/acknowledge alerts assigned to their unit.
- Admin operations must be explicitly protected.
- Never expose Supabase service-role credentials in browser/mobile code.
- Authorization data belongs in trusted server-side claims/data, not user-editable metadata.
- Minimize personal and sensitive data collected or retained.

## Realtime rules

Realtime updates must tolerate disconnects and reconnects. Treat the database as authoritative rather than trusting an in-memory client state. Avoid broadcasting unnecessary city-wide data to every police client.

## UI/UX quality bar

UI/UX is a first-class requirement, not a finishing step.

### General
- The product should feel like a serious emergency-response tool, not a generic CRUD dashboard.
- Prioritize clarity, speed, calmness, hierarchy, and trust.
- Use a coherent design system: typography, spacing, radius, iconography, component states, and semantic colors.
- Avoid unnecessary gradients, decorative cards, excessive glassmorphism, tiny text, and visual noise.
- Every screen needs a clear primary action and obvious status hierarchy.
- Responsive behavior must be intentional for desktop, tablet, and mobile widths.
- Accessibility is mandatory: keyboard navigation, focus states, sufficient contrast, semantic controls, reduced-motion considerations, and screen-reader labels.

### Police dashboard
The police workflow is the highest-priority interface.
- An approaching ambulance alert must be visible immediately.
- Show the information an officer needs at a glance: ambulance identifier, signal, ETA, approach direction, distance when useful, and alert status.
- Do not bury active emergency alerts under charts or maps.
- Use progressive disclosure for secondary information.
- Make acknowledgement a fast, unmistakable action.
- Clearly distinguish active, acknowledged, cleared, stale, and expired states.
- The map is supportive context; the alert itself is primary.

### Ambulance app
- Driver interaction must be minimal.
- Emergency-trip status must be visually unmistakable.
- Avoid requiring typing or complex navigation while the vehicle is moving.
- Show GPS/system health without overwhelming the user.
- Important emergency actions need large touch targets and strong confirmation where accidental activation could matter.

### Visual design
- Chennai/Tamil identity may inform the brand, but do not turn the operational UI into a novelty/local-theme interface.
- Use Tamil sparingly and intentionally where it improves local usability.
- Create polished empty/loading/error/offline states.
- Avoid placeholder-looking UI in anything meant for demonstration.
- Animations should communicate change, not decorate it. Emergency alerts may use subtle motion, but never flashing or distracting effects.

## Engineering workflow

1. Inspect current repository state before editing.
2. Make small coherent changes.
3. Keep domain logic testable outside React components.
4. Do not hardcode secrets.
5. Prefer typed APIs and shared domain types.
6. Add tests around geospatial and alert decisions before optimizing.
7. Run lint/type/build checks before declaring a milestone complete.
8. Verify realtime/security changes against Supabase advisors.
9. Never silently break existing behavior to add a feature.
10. Document important architectural decisions in `docs/`.

## Current milestone sequence

1. Foundation and schema
2. Controlled simulator
3. Road-aware routing/matching
4. Signal dataset ingestion and validation
5. Police dashboard
6. Realtime targeted alerts
7. Real ambulance GPS app
8. Security/reliability hardening
9. Pilot readiness

## Current data rule

Production Chennai traffic-signal records require verified source data and provenance. Until that exists, use clearly named demo fixtures only.
