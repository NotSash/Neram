import { findUpcomingSignal, type GeoPoint, type RoutedSignal } from "./upcoming-signal";

export type AlertDecision = {
  shouldAlert: boolean;
  reason: "no_signal" | "too_far" | "approaching" | "gps_stale" | "gps_invalid";
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
  gpsQuality: "good" | "degraded" | "stale" | "invalid" = "good",
): AlertDecision {
  if (gpsQuality === "stale" || gpsQuality === "invalid") {
    return {
      shouldAlert: false,
      reason: gpsQuality === "stale" ? "gps_stale" : "gps_invalid",
      signal: null,
      distanceToSignalMeters: null,
      estimatedEtaSeconds: null,
    };
  }

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

  const distance = candidate.distanceAheadMeters;
  const shouldAlert = distance <= triggerDistanceMeters;
  const eta = speedMps && speedMps > 1 ? Math.round(distance / speedMps) : null;

  return {
    shouldAlert,
    reason: shouldAlert ? "approaching" : "too_far",
    signal: candidate.signal,
    distanceToSignalMeters: Math.max(0, Math.round(distance)),
    estimatedEtaSeconds: eta,
  };
}
