import { NextResponse } from "next/server";
import { evaluateSignalAlert } from "../../../../lib/alert-engine";
import { DEMO_ROUTE, DEMO_SIGNALS } from "../../../../lib/demo-data";

export async function GET() {
  const samples = DEMO_ROUTE.map((position, index) => ({
    sequence: index + 1,
    position,
    decision: evaluateSignalAlert(DEMO_ROUTE, position, DEMO_SIGNALS, 13.9, 500, "good"),
  }));

  return NextResponse.json({
    mode: "simulation",
    ambulanceId: "AMB-DEMO-01",
    samples,
  });
}
