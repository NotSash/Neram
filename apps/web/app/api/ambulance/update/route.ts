import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { evaluateSignalAlert } from "../../../../lib/server-alert";
import { allowRequest } from "../../../../lib/rate-limit";
import { getOperationalMode } from "../../../../lib/operational-mode";
import { DEMO_ROUTE, DEMO_SIGNALS } from "../../../../lib/demo-data";

function isChennaiCoordinate(latitude: number, longitude: number) {
  return latitude >= 12.7 && latitude <= 13.35 && longitude >= 79.95 && longitude <= 80.45;
}

function supabaseFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization");
  if (!url || !key || !authorization?.startsWith("Bearer ")) return null;
  return createClient(url, key, { global: { headers: { Authorization: authorization } } });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!allowRequest(`ambulance-update:${ip}`)) return NextResponse.json({ error: "Too many updates. Try again shortly." }, { status: 429 });

  try {
    const body = (await request.json()) as { latitude?: number; longitude?: number; speedMps?: number | null; headingDegrees?: number | null; gpsQuality?: string | null };
    if (typeof body.latitude !== "number" || typeof body.longitude !== "number" || !Number.isFinite(body.latitude) || !Number.isFinite(body.longitude) || !isChennaiCoordinate(body.latitude, body.longitude)) {
      return NextResponse.json({ error: "Valid Chennai latitude and longitude are required" }, { status: 400 });
    }
    const speedMps = typeof body.speedMps === "number" && Number.isFinite(body.speedMps) ? Math.max(0, Math.min(body.speedMps, 80)) : 13.9;
    const mode = request.nextUrl.searchParams.get("mode");

    if (mode === "demo") {
      const decision = evaluateSignalAlert(DEMO_ROUTE, { latitude: body.latitude, longitude: body.longitude }, DEMO_SIGNALS, speedMps, 500);
      return NextResponse.json({ ambulanceId: "AMB-DEMO-01", decision, mode: getOperationalMode(), receivedAt: new Date().toISOString() });
    }

    const supabase = supabaseFromRequest(request);
    if (!supabase) return NextResponse.json({ error: "Authenticated ambulance access required" }, { status: 401 });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Authenticated ambulance access required" }, { status: 401 });
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "ambulance") return NextResponse.json({ error: "Ambulance operator role required" }, { status: 403 });
    const { data: ambulance } = await supabase.from("ambulances").select("id,code,is_verified").eq("user_id", user.id).maybeSingle();
    if (!ambulance) return NextResponse.json({ error: "No ambulance is assigned to this account" }, { status: 409 });
    if (!ambulance.is_verified) return NextResponse.json({ error: "This ambulance is not verified for operational use" }, { status: 403 });
    const { data: trip } = await supabase.from("emergency_trips").select("id").eq("ambulance_id", ambulance.id).eq("status", "active").maybeSingle();
    if (!trip) return NextResponse.json({ error: "No active emergency trip" }, { status: 409 });

    const { error: insertError } = await supabase.from("ambulance_locations").insert({ trip_id: trip.id, ambulance_id: ambulance.id, location: `SRID=4326;POINT(${body.longitude} ${body.latitude})`, heading_degrees: typeof body.headingDegrees === "number" ? body.headingDegrees : null, speed_mps: speedMps, accuracy_meters: typeof body.gpsQuality === "string" && body.gpsQuality === "good" ? 20 : 60 });
    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

    return NextResponse.json({ ambulanceId: ambulance.code, tripId: trip.id, decision: null, mode: "verified", receivedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Neram ambulance update error", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to process update" }, { status: 400 });
  }
}
