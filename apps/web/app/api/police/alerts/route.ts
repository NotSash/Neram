import { NextResponse } from "next/server";
import { DEMO_ALERT } from "../../../../lib/demo-data";

export async function GET() {
  return NextResponse.json({
    mode: "simulation",
    generatedAt: new Date().toISOString(),
    alerts: [DEMO_ALERT],
  });
}
