import { NextResponse } from "next/server";

const DEMO_ACTIVE_AMBULANCES = [
  {
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
  },
];

export async function GET() {
  return NextResponse.json({
    mode: "simulation",
    generatedAt: new Date().toISOString(),
    ambulances: DEMO_ACTIVE_AMBULANCES,
  });
}
