export const DEMO_ROUTE = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0466, longitude: 80.2087 },
  { latitude: 13.0472, longitude: 80.2094 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0486, longitude: 80.211 },
  { latitude: 13.0494, longitude: 80.2118 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0511, longitude: 80.2134 },
  { latitude: 13.052, longitude: 80.2145 },
  { latitude: 13.0527, longitude: 80.2153 },
] as const;

export const DEMO_SIGNALS = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098 },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122 },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148 },
] as const;

export const DEMO_ACTIVE_AMBULANCE = {
  id: "AMB-DEMO-01",
  tripId: "trip-demo-01",
  status: "active" as const,
  gpsState: "good" as const,
  lastSeenSecondsAgo: 4,
  latitude: 13.0494,
  longitude: 80.2118,
  speedMps: 13.9,
  nextSignal: "Demo Signal B",
  etaSeconds: 18,
};

export const DEMO_ALERT = {
  id: "alert-demo-01",
  tripId: "trip-demo-01",
  ambulanceId: "AMB-DEMO-01",
  signalId: "signal-a",
  signalName: "Demo Signal A",
  status: "pending" as const,
  etaSeconds: 42,
  distanceMeters: 310,
  approach: "West → East",
  gpsQuality: "good" as const,
};
