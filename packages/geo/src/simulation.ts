import { haversineDistanceMeters } from './distance';

export type GeoPoint = { latitude: number; longitude: number };
export type DemoSignal = GeoPoint & { id: string; name: string; address: string };

// Demo fixtures only. Do not treat these coordinates as verified Chennai signal data.
export const DEMO_SIGNALS: DemoSignal[] = [
  { id: 'demo-signal-1', name: 'Demo Signal A', address: 'Simulation corridor', latitude: 13.0474, longitude: 80.2098 },
  { id: 'demo-signal-2', name: 'Demo Signal B', address: 'Simulation corridor', latitude: 13.0498, longitude: 80.2122 },
  { id: 'demo-signal-3', name: 'Demo Signal C', address: 'Simulation corridor', latitude: 13.0522, longitude: 80.2148 },
];

export const DEMO_AMBULANCE_ROUTE: GeoPoint[] = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0470, longitude: 80.2092 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0490, longitude: 80.2113 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0514, longitude: 80.2138 },
  { latitude: 13.0527, longitude: 80.2153 },
];

export function getNextSignal(current: GeoPoint, remainingRoute: GeoPoint[], signals: DemoSignal[], lookAheadMeters = 2000) {
  const candidates = signals
    .map((signal) => {
      const distanceFromCurrent = haversineDistanceMeters(current, signal);
      const nearestRouteDistance = Math.min(
        ...remainingRoute.map((point) => haversineDistanceMeters(point, signal)),
      );
      return { signal, distanceFromCurrent, nearestRouteDistance };
    })
    .filter((candidate) => candidate.distanceFromCurrent <= lookAheadMeters)
    .sort((a, b) => a.distanceFromCurrent - b.distanceFromCurrent);

  return candidates[0] ?? null;
}
