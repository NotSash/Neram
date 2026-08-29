# Neram geospatial data sources

## Verified city road source

Greater Chennai Corporation exposes the `GCCDepts/EDPMobile2025/FeatureServer` GIS service. Its `EDP_Roads_2025` layer is a polyline feature layer with GeoJSON support and road metadata including road name, locality, address, latitude and longitude.

Source:
https://gisgcc.chennaicorporation.gov.in/server/rest/services/GCCDepts/EDPMobile2025/FeatureServer/0

Use this as a first-party Chennai road-data source where licensing/usage permits.

## Traffic-signal reference source

OpenStreetMap can provide `highway=traffic_signals` nodes through Overpass. Treat these as **reference data only** until each signal is validated against an authoritative source or field verification.

Never represent unverified OSM records as operationally authoritative in the police UI.

## Provenance requirements

Every imported signal should retain:

- source
- source_id
- imported_at
- verification_status
- verification_notes

Recommended verification states:

- `reference`
- `verified`
- `retired`

Production alerting should only use signals with an approved verification status.
