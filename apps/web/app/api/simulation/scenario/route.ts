import { NextResponse } from "next/server";
import { evaluateSignalAlert } from "../../../../../lib/alert-engine";

const ROUTE = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0466, longitude: 80.2087 },
  { latitude: 13.0472, longitude: 80.2094 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0486, longitude: 80.2110 },
  { latitude: 13.0494, longitude: 80.2118 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0511, longitude: 80.2134 },
  { latitude: 13.0520, longitude: 80.2145 },
  { latitude: 13.0527, longitude: 80.2153 },
];

const SIGNALS = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098 },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122 },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148 },
];

export async function GET() {
  const samples = ROUTE.map((position, index) => ({
    sequence: index + 1,
    position,
    decision: evaluateSignalAlert(ROUTE, position, SIGNALS, 13.9, 500, "good"),
  }));

  return NextResponse.json({
    mode: "simulation",
    ambulanceId: "AMB-DEMO-01",
    samples,
  });
}
