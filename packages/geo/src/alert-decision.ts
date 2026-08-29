import { findUpcomingSignal, type GeoPoint, type RoutedSignal } from "./upcoming-signal";

export type AlertDecision = {
  shouldAlert: boolean;
  reason: "no_signal" | "too_far" | "approaching" | "already_reached";
  signal: RoutedSignal | null;
  distanceToSignalMeters: number | null;
  estimatedEtaSeconds: number | null;
};

export function evaluateSignalAlert(
  route: GeoPoint[],
  ambulancePosition: GeoPoint,
  signals: RoutedSignal[],
  speedMps: number | null,
  triggerDistanceMeters = 500,
): AlertDecision {
  const candidate = findUpcomingSignal(route, ambulancePosition, signals, 120);

  if (!candidate) {
    return {
      shouldAlert: false,
      reason: "no_signal",
      signal: null,
      distanceToSignalMeters: null,
      estimatedEtaSeconds: null,
    };
  }

  const distance = candidate.routeProgressMeters;
  if (distance <= 0) {
    return {
      shouldAlert: false,
      reason: "already_reached",
      signal: candidate.signal,
      distanceToSignalMeters: 0,
      estimatedEtaSeconds: 0,
    };
  }

  const eta = speedMps && speedMps > 1 ? Math.round(distance / speedMps) : null;
  return {
    shouldAlert: distance <= triggerDistanceMeters,
    reason: distance <= triggerDistanceMeters ? "approaching" : "too_far",
    signal: candidate.signal,
    distanceToSignalMeters: Math.round(distance),
    estimatedEtaSeconds: eta,
  };
}
