import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { DEMO_ALERT } from "../../../../lib/demo-data";

function supabaseFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization");
  if (!url || !key || !authorization?.startsWith("Bearer ")) return null;
  return createClient(url, key, { global: { headers: { Authorization: authorization } } });
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("mode") === "demo") {
    return NextResponse.json({ mode: "simulation", generatedAt: new Date().toISOString(), alerts: [DEMO_ALERT] });
  }

  const supabase = supabaseFromRequest(request);
  if (!supabase) return NextResponse.json({ error: "Authenticated operator access required" }, { status: 401 });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Authenticated operator access required" }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profileError || profile?.role !== "police") return NextResponse.json({ error: "Police operator role required" }, { status: 403 });

  const { data: rows, error } = await supabase
    .from("alerts")
    .select("id,status,eta_seconds,distance_meters,confidence,triggered_at,signal_id,ambulance_id:trip_id,police_unit_id")
    .in("status", ["pending", "acknowledged"])
    .order("triggered_at", { ascending: false })
    .limit(10);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const signalIds = Array.from(new Set((rows ?? []).map((row) => row.signal_id).filter(Boolean)));
  const tripIds = Array.from(new Set((rows ?? []).map((row) => row.ambulance_id).filter(Boolean)));
  const { data: signals } = signalIds.length ? await supabase.from("traffic_signals").select("id,name").in("id", signalIds) : { data: [] as Array<{id:string;name:string}> };
  const { data: trips } = tripIds.length ? await supabase.from("emergency_trips").select("id,ambulance_id").in("id", tripIds) : { data: [] as Array<{id:string;ambulance_id:string}> };
  const ambulanceIds = Array.from(new Set((trips ?? []).map((trip) => trip.ambulance_id).filter(Boolean)));
  const { data: ambulances } = ambulanceIds.length ? await supabase.from("ambulances").select("id,code").in("id", ambulanceIds) : { data: [] as Array<{id:string;code:string}> };

  const signalMap = new Map((signals ?? []).map((signal) => [signal.id, signal.name]));
  const tripMap = new Map((trips ?? []).map((trip) => [trip.id, trip.ambulance_id]));
  const ambulanceMap = new Map((ambulances ?? []).map((ambulance) => [ambulance.id, ambulance.code]));
  const alerts = (rows ?? []).map((row) => ({
    id: row.id,
    ambulanceId: row.ambulance_id ? (ambulanceMap.get(tripMap.get(row.ambulance_id) ?? "") ?? "Unknown ambulance") : "Unknown ambulance",
    signalName: signalMap.get(row.signal_id) ?? "Assigned signal",
    status: row.status,
    etaSeconds: row.eta_seconds ?? 0,
    distanceMeters: Math.round(row.distance_meters ?? 0),
    approach: "Assigned route",
    gpsQuality: (row.confidence ?? 0) >= 0.8 ? "good" : "degraded",
  }));

  return NextResponse.json({ mode: "verified", generatedAt: new Date().toISOString(), alerts });
}

export async function PATCH(request: NextRequest) {
  const supabase = supabaseFromRequest(request);
  if (!supabase) return NextResponse.json({ error: "Authenticated operator access required" }, { status: 401 });
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Authenticated operator access required" }, { status: 401 });
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "police") return NextResponse.json({ error: "Police operator role required" }, { status: 403 });

  const body = (await request.json()) as { id?: string; action?: "acknowledge" | "clear" };
  if (!body.id || !body.action) return NextResponse.json({ error: "Alert id and action are required" }, { status: 400 });
  const nextStatus = body.action === "acknowledge" ? "acknowledged" : "cleared";
  const patch = body.action === "acknowledge"
    ? { status: nextStatus, acknowledged_at: new Date().toISOString() }
    : { status: nextStatus, cleared_at: new Date().toISOString() };

  const { data, error } = await supabase.from("alerts").update(patch).eq("id", body.id).select("id,status,acknowledged_at,cleared_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ alert: data });
}
