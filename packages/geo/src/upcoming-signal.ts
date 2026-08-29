import { haversineDistanceMeters } from "./distance";

export type GeoPoint = { latitude: number; longitude: number };
export type RoutedSignal = GeoPoint & { id: string; name: string };

type Projection = { distanceMeters: number; progressMeters: number };

function projectPointToSegmentMeters(point: GeoPoint, start: GeoPoint, end: GeoPoint, segmentStartMeters: number): Projection {
  const referenceLat = (start.latitude + end.latitude + point.latitude) / 3;
  const metersPerDegreeLat = 111_320;
  const metersPerDegreeLon = 111_320 * Math.cos((referenceLat * Math.PI) / 180);

  const px = (point.longitude - start.longitude) * metersPerDegreeLon;
  const py = (point.latitude - start.latitude) * metersPerDegreeLat;
  const sx = (end.longitude - start.longitude) * metersPerDegreeLon;
  const sy = (end.latitude - start.latitude) * metersPerDegreeLat;
  const segmentLength = Math.hypot(sx, sy);

  if (segmentLength === 0) {
    return { distanceMeters: haversineDistanceMeters(point, start), progressMeters: segmentStartMeters };
  }

  const t = Math.max(0, Math.min(1, (px * sx + py * sy) / (segmentLength * segmentLength)));
  const closest = {
    latitude: start.latitude + (end.latitude - start.latitude) * t,
    longitude: start.longitude + (end.longitude - start.longitude) * t,
  };

  return {
    distanceMeters: haversineDistanceMeters(point, closest),
    progressMeters: segmentStartMeters + segmentLength * t,
  };
}

function cumulativeRouteDistances(route: GeoPoint[]) {
  const cumulative = [0];
  for (let index = 1; index < route.length; index += 1) {
    cumulative.push(cumulative[index - 1] + haversineDistanceMeters(route[index - 1], route[index]));
  }
  return cumulative;
}

function projectOntoRoute(point: GeoPoint, route: GeoPoint[], cumulative: number[]) {
  let best: Projection | null = null;
  for (let index = 1; index < route.length; index += 1) {
    const projection = projectPointToSegmentMeters(point, route[index - 1], route[index], cumulative[index - 1]);
    if (!best || projection.distanceMeters < best.distanceMeters) best = projection;
  }
  return best;
}

export function findUpcomingSignal(
  route: GeoPoint[],
  ambulancePosition: GeoPoint,
  signals: RoutedSignal[],
  maxOffsetMeters = 120,
) {
  if (route.length < 2 || signals.length === 0) return null;

  const cumulative = cumulativeRouteDistances(route);
  const ambulanceProjection = projectOntoRoute(ambulancePosition, route, cumulative);
  if (!ambulanceProjection) return null;

  const candidates = signals
    .map((signal) => {
      const projection = projectOntoRoute(signal, route, cumulative);
      if (!projection) return null;
      return {
        signal,
        routeOffsetMeters: projection.distanceMeters,
        routeProgressMeters: projection.progressMeters,
      };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .filter(({ routeOffsetMeters, routeProgressMeters }) =>
      routeOffsetMeters <= maxOffsetMeters && routeProgressMeters > ambulanceProjection.progressMeters,
    )
    .sort((a, b) => a.routeProgressMeters - b.routeProgressMeters);

  return candidates[0] ?? null;
}
