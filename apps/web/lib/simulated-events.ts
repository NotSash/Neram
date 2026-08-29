export type AmbulanceEvent = {
  tripId: string;
  ambulanceId: string;
  latitude: number;
  longitude: number;
  speedMps: number;
  headingDegrees: number;
  recordedAt: string;
};

export type SignalAlertEvent = {
  type: "signal.alert";
  tripId: string;
  ambulanceId: string;
  signalId: string;
  signalName: string;
  distanceMeters: number;
  etaSeconds: number | null;
  emittedAt: string;
};

export const DEMO_TRIP = {
  tripId: "trip-demo-01",
  ambulanceId: "AMB-DEMO-01",
};

export function makeSignalAlertEvent(input: Omit<SignalAlertEvent, "type" | "emittedAt">): SignalAlertEvent {
  return { ...input, type: "signal.alert", emittedAt: new Date().toISOString() };
}
