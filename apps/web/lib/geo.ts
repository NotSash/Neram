export type GeoPoint = { latitude: number; longitude: number };
export type RoutedSignal = GeoPoint & { id: string; name: string };

const EARTH_RADIUS_METERS = 6_371_000;
const toRad = (value: number) => (value * Math.PI) / 180;

function distance(a: GeoPoint, b: GeoPoint) {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

function project(point: GeoPoint, start: GeoPoint, end: GeoPoint, startProgress: number) {
  const referenceLat = (start.latitude + end.latitude + point.latitude) / 3;
  const metersLat = 111_320;
  const metersLon = 111_320 * Math.cos(toRad(referenceLat));
  const px = (point.longitude - start.longitude) * metersLon;
  const py = (point.latitude - start.latitude) * metersLat;
  const sx = (end.longitude - start.longitude) * metersLon;
  const sy = (end.latitude - start.latitude) * metersLat;
  const len = Math.hypot(sx, sy);
  if (!len) return { offset: distance(point, start), progress: startProgress };
  const t = Math.max(0, Math.min(1, (px * sx + py * sy) / (len * len)));
  const closest = {
    latitude: start.latitude + (end.latitude - start.latitude) * t,
    longitude: start.longitude + (end.longitude - start.longitude) * t,
  };
  return { offset: distance(point, closest), progress: startProgress + len * t };
}

function cumulative(route: readonly GeoPoint[]) {
  const out = [0];
  for (let i = 1; i < route.length; i += 1) out.push(out[i - 1] + distance(route[i - 1], route[i]));
  return out;
}

function onRoute(point: GeoPoint, route: readonly GeoPoint[], distances: number[]) {
  let best: { offset: number; progress: number } | null = null;
  for (let i = 1; i < route.length; i += 1) {
    const candidate = project(point, route[i - 1], route[i], distances[i - 1]);
    if (!best || candidate.offset < best.offset) best = candidate;
  }
  return best;
}

export function findUpcomingSignal(
  route: readonly GeoPoint[],
  position: GeoPoint,
  signals: readonly RoutedSignal[],
  maxOffsetMeters = 160,
) {
  if (route.length < 2 || !signals.length) return null;
  const distances = cumulative(route);
  const ambulance = onRoute(position, route, distances);
  if (!ambulance) return null;
  return signals
    .map((signal) => {
      const projected = onRoute(signal, route, distances);
      if (!projected) return null;
      return {
        signal,
        routeOffsetMeters: projected.offset,
        distanceAheadMeters: projected.progress - ambulance.progress,
      };
    })
    .filter((value): value is NonNullable<typeof value> => Boolean(value))
    .filter((value) => value.routeOffsetMeters <= maxOffsetMeters && value.distanceAheadMeters > 0)
    .sort((a, b) => a.distanceAheadMeters - b.distanceAheadMeters)[0] ?? null;
}

export function evaluateSignalAlert(
  route: readonly GeoPoint[],
  position: GeoPoint,
  signals: readonly RoutedSignal[],
  speedMps: number | null,
  triggerDistanceMeters = 500,
) {
  const candidate = findUpcomingSignal(route, position, signals);
  if (!candidate) {
    return {
      shouldAlert: false,
      reason: "no_signal" as const,
      signal: null,
      distanceToSignalMeters: null,
      estimatedEtaSeconds: null,
    };
  }

  const distanceAhead = Math.max(0, candidate.distanceAheadMeters);
  const shouldAlert = distanceAhead <= triggerDistanceMeters;
  return {
    shouldAlert,
    reason: shouldAlert ? ("approaching" as const) : ("too_far" as const),
    signal: candidate.signal,
    distanceToSignalMeters: Math.round(distanceAhead),
    estimatedEtaSeconds: speedMps && speedMps > 1 ? Math.round(distanceAhead / speedMps) : null,
  };
}
