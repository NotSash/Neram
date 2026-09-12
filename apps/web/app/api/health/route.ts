import { NextResponse } from "next/server";
import { getOperationalMode } from "../../../lib/operational-mode";

export const dynamic = "force-dynamic";

export async function GET() {
  const databaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return NextResponse.json(
    {
      service: "neram-web",
      mode: getOperationalMode(),
      tracking: "simulation",
      routing: "valhalla",
      signals: "reference",
      database: databaseConfigured ? "configured" : "not_configured",
      generatedAt: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
