import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    mode: "simulation",
    generatedAt: new Date().toISOString(),
    alerts: [
      {
        id: "alert-demo-01",
        tripId: "trip-demo-01",
        ambulanceId: "AMB-DEMO-01",
        signalId: "signal-a",
        signalName: "Demo Signal A",
        status: "pending",
        etaSeconds: 42,
        distanceMeters: 310,
        approach: "West → East",
        gpsQuality: "good",
      },
    ],
  });
}
