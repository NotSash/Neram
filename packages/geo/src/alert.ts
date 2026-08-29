import { haversineDistanceMeters } from './distance';
import type { DemoSignal, GeoPoint } from './simulation';

export type AlertDecision = {
  shouldAlert: boolean;
  distanceMeters: number;
  etaSeconds: number | null;
  reason: string;
};

export function routeDistanceMeters(route: GeoPoint[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i += 1) {
    total += haversineDistanceMeters(route[i - 1], route[i]);
  }
  return total;
}

function nearestPointIndex(signal: DemoSignal, route: GeoPoint[]): number {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  route.forEach((point, index) => {
    const distance = haversineDistanceMeters(point, signal);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

export function decideSignalAlert(
  current: GeoPoint,
  signal: DemoSignal,
  routeAhead: GeoPoint[],
  speedMps: number | null,
  triggerEtaSeconds = 60,
  triggerDistanceMeters = 500,
): AlertDecision {
  const distanceMeters = haversineDistanceMeters(current, signal);
  if (distanceMeters > 2000) {
    return { shouldAlert: false, distanceMeters, etaSeconds: null, reason: 'signal_outside_lookahead' };
  }

  const route = [current, ...routeAhead];
  const signalIndex = nearestPointIndex(signal, route);
  const routeToSignal = route.slice(0, signalIndex + 1);
  if (routeToSignal.length === 0) {
    return { shouldAlert: false, distanceMeters, etaSeconds: null, reason: 'signal_not_on_route' };
  }

  const routeDistance = routeDistanceMeters(routeToSignal);
  const etaSeconds = speedMps && speedMps > 0 ? routeDistance / speedMps : null;
  const shouldAlert = distanceMeters <= triggerDistanceMeters || (etaSeconds !== null && etaSeconds <= triggerEtaSeconds);

  return {
    shouldAlert,
    distanceMeters,
    etaSeconds: etaSeconds === null ? null : Math.round(etaSeconds),
    reason: shouldAlert ? 'approaching_signal' : 'not_yet_in_alert_window',
  };
}
