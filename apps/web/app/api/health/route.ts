import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "neram-web",
    mode: "training",
    tracking: "simulation",
    routing: "valhalla",
    signals: "reference",
    database: "not_connected",
    generatedAt: new Date().toISOString(),
  });
}
