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

  const routeToSignal = [current, ...routeAhead];
  const etaSeconds = speedMps && speedMps > 0 ? routeDistanceMeters(routeToSignal) / speedMps : null;
  const shouldAlert = distanceMeters <= triggerDistanceMeters || (etaSeconds !== null && etaSeconds <= triggerEtaSeconds);

  return {
    shouldAlert,
    distanceMeters,
    etaSeconds: etaSeconds === null ? null : Math.round(etaSeconds),
    reason: shouldAlert ? 'approaching_signal' : 'not_yet_in_alert_window',
  };
}
