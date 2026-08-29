import { NextRequest, NextResponse } from "next/server";
import { mapMatchTrace } from "../../../lib/valhalla-match";

type Body = {
  points?: Array<{ lat?: number; lon?: number }>;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const points = body.points;

    if (
      !points ||
      points.length < 2 ||
      points.some(
        (point) =>
          typeof point.lat !== "number" ||
          typeof point.lon !== "number" ||
          !Number.isFinite(point.lat) ||
          !Number.isFinite(point.lon),
      )
    ) {
      return NextResponse.json({ error: "Provide at least two valid GPS points" }, { status: 400 });
    }

    const matched = await mapMatchTrace(points as Array<{ lat: number; lon: number }>);
    return NextResponse.json(matched, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("Neram map matching error", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Map matching service unavailable" },
      { status: 502 },
    );
  }
}
