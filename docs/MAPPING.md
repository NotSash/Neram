# Neram mapping stack

## Development mapping stack

- **Map renderer:** Leaflet
- **Base map:** OpenStreetMap tiles, with attribution required by the tile provider's policy
- **Routing / road graph:** Valhalla using OpenStreetMap-derived data
- **Spatial database:** Supabase Postgres + PostGIS

## Provider policy

Neram does not require a Mapbox account or payment method for the MVP. The application talks to Valhalla through the server-side `/api/route` endpoint rather than exposing a routing service directly to the browser.

The current Valhalla public endpoint is a development dependency only. Its operator documents fair-use/rate-limit expectations and asks public applications to identify themselves with an `X-Client-Id` header. For production scale, deploy a dedicated Valhalla instance and point `VALHALLA_BASE_URL` at it.

## Signal data

Traffic-signal records must carry provenance and verification metadata. Candidate signals discovered from OpenStreetMap are reference data until they are verified for operational use. Unverified records must not trigger live police alerts.

## Design rule

Keep the mapping provider behind an application-level adapter. UI components should consume Neram's normalized route/signal model and must not depend directly on a vendor API response shape.
