import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function supabaseFromRequest(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const authorization = request.headers.get("authorization");
  if (!url || !key || !authorization?.startsWith("Bearer ")) return null;
  return createClient(url, key, { global: { headers: { Authorization: authorization } } });
}

async function getVerifiedAmbulance(request: NextRequest) {
  const supabase = supabaseFromRequest(request);
  if (!supabase) return { supabase: null, user: null, ambulance: null, error: NextResponse.json({ error: "Authenticated ambulance access required" }, { status: 401 }) };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { supabase, user: null, ambulance: null, error: NextResponse.json({ error: "Authenticated ambulance access required" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "ambulance") return { supabase, user, ambulance: null, error: NextResponse.json({ error: "Ambulance operator role required" }, { status: 403 }) };
  const { data: ambulance, error: ambulanceError } = await supabase.from("ambulances").select("id,code,is_verified").eq("user_id", user.id).maybeSingle();
  if (ambulanceError || !ambulance) return { supabase, user, ambulance: null, error: NextResponse.json({ error: "No ambulance is assigned to this account" }, { status: 409 }) };
  if (!ambulance.is_verified) return { supabase, user, ambulance: null, error: NextResponse.json({ error: "This ambulance is not verified for operational use" }, { status: 403 }) };
  return { supabase, user, ambulance, error: null };
}

export async function POST(request: NextRequest) {
  const { supabase, ambulance, error } = await getVerifiedAmbulance(request);
  if (error || !supabase || !ambulance) return error ?? NextResponse.json({ error: "Unable to start trip" }, { status: 500 });
  const body = (await request.json().catch(() => ({}))) as { destinationName?: string };
  const { data: existing } = await supabase.from("emergency_trips").select("id,status,destination_name,started_at").eq("ambulance_id", ambulance.id).eq("status", "active").maybeSingle();
  if (existing) return NextResponse.json({ trip: existing, reused: true, ambulanceCode: ambulance.code });
  const { data: trip, error: insertError } = await supabase.from("emergency_trips").insert({ ambulance_id: ambulance.id, destination_name: body.destinationName?.trim() || null, status: "active" }).select("id,status,destination_name,started_at").single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });
  return NextResponse.json({ trip, reused: false, ambulanceCode: ambulance.code });
}

export async function PATCH(request: NextRequest) {
  const { supabase, ambulance, error } = await getVerifiedAmbulance(request);
  if (error || !supabase || !ambulance) return error ?? NextResponse.json({ error: "Unable to end trip" }, { status: 500 });
  const { data: trip, error: updateError } = await supabase.from("emergency_trips").update({ status: "completed", ended_at: new Date().toISOString() }).eq("ambulance_id", ambulance.id).eq("status", "active").select("id,status,ended_at").single();
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ trip });
}
