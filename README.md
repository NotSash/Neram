# Neram

Chennai emergency ambulance coordination platform.

Neram helps authorized traffic police know when an active ambulance is approaching their assigned signal, so officers can take appropriate action. Neram does **not** automatically control traffic lights.

## Initial MVP

- Chennai-only pilot
- Active ambulance tracking
- Signal proximity detection
- Realtime police alerts
- Police acknowledgement and incident status
- Simulated ambulance movement before real GPS integration

## Stack

- Next.js / React
- Supabase + PostgreSQL + PostGIS
- Supabase Realtime
- Vercel
- Mapping/routing provider to be integrated after the core event pipeline is proven

## Safety principle

Neram is an information and coordination system. It does not directly operate traffic signals. Any traffic-control action remains with authorized traffic personnel.
