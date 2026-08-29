import { haversineDistanceMeters } from "./distance";

export type GeoPoint = { latitude: number; longitude: number };
export type RoutedSignal = GeoPoint & { id: string; name: string };

function distancePointToSegmentMeters(point: GeoPoint, start: GeoPoint, end: GeoPoint) {
  const referenceLat = (start.latitude + end.latitude + point.latitude) / 3;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon = 111_320 * Math.cos((referenceLat * Math.PI) / 180);

  const px = (point.longitude - start.longitude) * metersPerDegreeLon;
  const py = (point.latitude - start.latitude) * metersPerDegreeLat;
  const sx = (end.longitude - start.longitude) * metersPerDegreeLon;
  const sy = (end.latitude - start.latitude) * metersPerDegreeLat;
  const segmentSquared = sx * sx + sy * sy;

  if (segmentSquared === 0) return haversineDistanceMeters(point, start);

  const t = Math.max(0, Math.min(1, (px * sx + py * sy) / segmentSquared));
  const closest = {
    latitude: start.latitude + (end.latitude - start.latitude) * t,
    longitude: start.longitude + (end.longitude - start.longitude) * t,
  };

  return haversineDistanceMeters(point, closest);
}

function routeDistanceMeters(route: GeoPoint[]) {
  let total = 0;
  const cumulative = [0];
  for (let index = 1; index < route.length; index += 1) {
    total += haversineDistanceMeters(route[index - 1], route[index]);
    cumulative.push(total);
  }
  return cumulative;
}

export function findUpcomingSignal(
  route: GeoPoint[],
  ambulancePosition: GeoPoint,
  signals: RoutedSignal[],
  maxOffsetMeters = 120,
) {
  if (route.length < 2 || signals.length === 0) return null;

  const cumulative = routeDistanceMeters(route);
  let ambulanceSegment = 0;
  let ambulanceOffset = Number.POSITIVE_INFINITY;

  for (let index = 1; index < route.length; index += 1) {
    const distance = distancePointToSegmentMeters(ambulancePosition, route[index - 1], route[index]);
    if (distance < ambulanceOffset) {
      ambulanceOffset = distance;
      ambulanceSegment = index - 1;
    }
  }

  const ambulanceProgress = cumulative[ambulanceSegment] + Math.max(0, ambulanceOffset);

  const candidates = signals
    .map((signal) => {
      let bestDistance = Number.POSITIVE_INFINITY;
      let bestProgress = Number.POSITIVE_INFINITY;

      for (let index = 1; index < route.length; index += 1) {
        const distance = distancePointToSegmentMeters(signal, route[index - 1], route[index]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestProgress = cumulative[index - 1];
        }
      }

      return { signal, routeOffsetMeters: bestDistance, routeProgressMeters: bestProgress };
    })
    .filter(({ routeOffsetMeters, routeProgressMeters }) =>
      routeOffsetMeters <= maxOffsetMeters && routeProgressMeters > ambulanceProgress,
    )
    .sort((a, b) => a.routeProgressMeters - b.routeProgressMeters);

  return candidates[0] ?? null;
}
