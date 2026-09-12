import { NextRequest, NextResponse } from "next/server";
import { getDrivingRoute } from "../../../lib/valhalla";
import { allowRequest } from "../../../lib/rate-limit";

type Body = {
  locations?: Array<{ lat?: number; lon?: number }>;
};

function isChennaiCoordinate(latitude: number, longitude: number) {
  return latitude >= 12.7 && latitude <= 13.35 && longitude >= 79.95 && longitude <= 80.45;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`route:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many routing requests. Try again shortly." }, { status: 429 });
  }

  try {
    const body = (await request.json()) as Body;
    const locations = body.locations?.map((point) => ({ lat: point.lat, lon: point.lon }));

    if (
      !locations ||
      locations.length < 2 ||
      locations.length > 5 ||
      locations.some(
        (point) =>
          typeof point.lat !== "number" ||
          typeof point.lon !== "number" ||
          !Number.isFinite(point.lat) ||
          !Number.isFinite(point.lon) ||
          !isChennaiCoordinate(point.lat, point.lon),
      )
    ) {
      return NextResponse.json(
        { error: "Provide 2–5 valid Chennai map locations" },
        { status: 400 },
      );
    }

    const route = await getDrivingRoute(
      locations as Array<{ lat: number; lon: number }>,
    );
    return NextResponse.json(route, {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    console.error("Neram routing error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Routing service unavailable" },
      { status: 502 },
    );
  }
}
