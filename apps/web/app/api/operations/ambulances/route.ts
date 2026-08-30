import { NextResponse } from "next/server";
import { DEMO_ACTIVE_AMBULANCE } from "../../../../lib/demo-data";

export async function GET() {
  return NextResponse.json({
    mode: "simulation",
    generatedAt: new Date().toISOString(),
    ambulances: [DEMO_ACTIVE_AMBULANCE],
  });
}
