import { NextRequest, NextResponse } from "next/server";
import { evaluateSignalAlert } from "../../../../lib/server-alert";
import { allowRequest } from "../../../../lib/rate-limit";
import { getOperationalMode } from "../../../../lib/operational-mode";

const DEMO_ROUTE = [
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
];

const DEMO_SIGNALS = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098 },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122 },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148 },
];

function isChennaiCoordinate(latitude: number, longitude: number) {
  return latitude >= 12.7 && latitude <= 13.35 && longitude >= 79.95 && longitude <= 80.45;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`ambulance-update:${ip}`)) {
    return NextResponse.json({ error: "Too many updates. Try again shortly." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      speedMps?: number | null;
    };

    if (
      typeof body.latitude !== "number" ||
      typeof body.longitude !== "number" ||
      !Number.isFinite(body.latitude) ||
      !Number.isFinite(body.longitude) ||
      !isChennaiCoordinate(body.latitude, body.longitude)
    ) {
      return NextResponse.json({ error: "Valid Chennai latitude and longitude are required" }, { status: 400 });
    }

    const speedMps = typeof body.speedMps === "number" && Number.isFinite(body.speedMps)
      ? Math.max(0, Math.min(body.speedMps, 80))
      : 13.9;

    const decision = evaluateSignalAlert(
      DEMO_ROUTE,
      { latitude: body.latitude, longitude: body.longitude },
      DEMO_SIGNALS,
      speedMps,
      500,
    );

    return NextResponse.json({
      ambulanceId: "AMB-DEMO-01",
      decision,
      mode: getOperationalMode(),
      receivedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Neram ambulance update error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to process update" },
      { status: 400 },
    );
  }
}
