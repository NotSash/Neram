import { NextRequest, NextResponse } from "next/server";
import { getDrivingRoute } from "../../../../lib/valhalla";

type Body = {
  locations?: Array<{ lat?: number; lon?: number }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const locations = body.locations?.map((point) => ({ lat: point.lat, lon: point.lon }));

    if (
      !locations ||
      locations.length < 2 ||
      locations.some(
        (point) =>
          typeof point.lat !== "number" ||
          typeof point.lon !== "number" ||
          !Number.isFinite(point.lat) ||
          !Number.isFinite(point.lon),
      )
    ) {
      return NextResponse.json({ error: "Provide at least two valid map locations" }, { status: 400 });
    }

    const route = await getDrivingRoute(
      locations as Array<{ lat: number; lon: number }>,
    );
    return NextResponse.json(route, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Neram routing error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Routing service unavailable" },
      { status: 502 },
    );
  }
}
