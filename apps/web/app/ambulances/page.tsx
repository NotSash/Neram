"use client";

import { useEffect, useMemo, useState } from "react";

type Ambulance = {
  id: string;
  tripId: string;
  status: "active";
  gpsState: "good" | "degraded";
  lastSeenSecondsAgo: number;
  latitude: number;
  longitude: number;
  speedMps: number;
  nextSignal: string;
  etaSeconds: number;
};

export default function AmbulancesPage() {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/operations/ambulances", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load active ambulances");
        const data = (await response.json()) as { ambulances: Ambulance[] };
        if (cancelled) return;
        setAmbulances(data.ambulances);
        setSelectedId((current) => current && data.ambulances.some((item) => item.id === current) ? current : data.ambulances[0]?.id ?? null);
        setLastRefresh(Date.now());
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load active ambulances");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const selected = useMemo(
    () => ambulances.find((item) => item.id === selectedId) ?? ambulances[0] ?? null,
    [ambulances, selectedId],
  );

  const isFeedStale = lastRefresh !== null && Date.now() - lastRefresh > 12000;

  return (
    <main style={{ minHeight: "100vh", background: "#070a10", color: "#f5f7fa", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #202a38", paddingBottom: 18 }}>
          <div><strong style={{ fontSize: 22 }}>Neram</strong><div style={{ fontSize: 10, color: "#718096", letterSpacing: 1.5, marginTop: 4 }}>ACTIVE AMBULANCES · CHENNAI</div></div>
          <div style={{ fontSize: 10, color: isFeedStale || error ? "#f4c85e" : "#43d19e", fontWeight: 800, letterSpacing: 1 }}>{isFeedStale || error ? "● DATA DEGRADED" : "● FEED LIVE · TRAINING"}</div>
        </header>

        <section style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, padding: "36px 0 24px" }}>
          <div><div style={{ fontSize: 10, color: "#718096", letterSpacing: 1.5, fontWeight: 800 }}>CITY OVERVIEW</div><h1 style={{ margin: "8px 0 6px", fontSize: 36 }}>Active ambulances</h1><p style={{ margin: 0, color: "#8d99aa", fontSize: 13 }}>Only ongoing emergency trips are shown here.</p></div>
          <div style={{ padding: "12px 16px", border: "1px solid #202a38", borderRadius: 12, background: "#0d121b" }}><span style={{ display: "block", color: "#718096", fontSize: 9, letterSpacing: 1.2 }}>CURRENTLY ACTIVE</span><strong style={{ display: "block", marginTop: 4, fontSize: 26 }}>{ambulances.length}</strong></div>
        </section>

        {error && <div role="alert" style={{ marginBottom: 14, padding: 12, borderRadius: 10, border: "1px solid rgba(244,200,94,.35)", background: "rgba(244,200,94,.07)", color: "#d9c17a", fontSize: 11 }}>{error} · Retrying automatically.</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 16 }}>
          <section style={{ display: "grid", gap: 10 }}>
            {loading && <div style={{ padding: 20, borderRadius: 14, border: "1px solid #202a38", background: "#0d121b", color: "#718096", fontSize: 12 }}>Loading active ambulance feed…</div>}
            {!loading && ambulances.length === 0 && <div style={{ padding: 24, borderRadius: 14, border: "1px solid #202a38", background: "#0d121b" }}><strong style={{ fontSize: 15 }}>No active ambulances</strong><p style={{ color: "#8d99aa", fontSize: 12, marginBottom: 0 }}>Completed trips are intentionally excluded.</p></div>}
            {ambulances.map((ambulance) => {
              const selectedState = selectedId === ambulance.id;
              const fresh = ambulance.lastSeenSecondsAgo <= 10;
              return (
                <button key={ambulance.id} type="button" onClick={() => setSelectedId(ambulance.id)} style={{ textAlign: "left", padding: 18, borderRadius: 14, border: selectedState ? "1px solid rgba(255,91,91,.55)" : "1px solid #202a38", background: selectedState ? "rgba(255,91,91,.08)" : "#0d121b", color: "inherit", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><div><div style={{ fontSize: 9, color: "#718096", letterSpacing: 1.3 }}>ACTIVE</div><strong style={{ display: "block", marginTop: 5, fontSize: 18 }}>{ambulance.id}</strong><span style={{ color: "#8d99aa", fontSize: 12 }}>Emergency trip · {ambulance.nextSignal}</span></div><div style={{ textAlign: "right" }}><strong style={{ fontSize: 28 }}>{ambulance.etaSeconds}s</strong><span style={{ display: "block", fontSize: 9, color: "#718096" }}>TO NEXT SIGNAL</span></div></div>
                  <div style={{ display: "flex", gap: 18, marginTop: 16, paddingTop: 12, borderTop: "1px solid #202a38", fontSize: 10, color: "#7d8a9c" }}><span>GPS <b style={{ color: ambulance.gpsState === "good" ? "#43d19e" : "#f4c85e" }}>{ambulance.gpsState === "good" ? "Good" : "Degraded"}</b></span><span>Last seen {ambulance.lastSeenSecondsAgo}s ago</span><span style={{ color: fresh ? "#43d19e" : "#f4c85e" }}>{fresh ? "Fresh" : "Check tracking"}</span></div>
                </button>
              );
            })}
          </section>

          <aside style={{ padding: 20, borderRadius: 14, border: "1px solid #202a38", background: "#0d121b" }}>
            <div style={{ fontSize: 9, color: "#718096", fontWeight: 800, letterSpacing: 1.4 }}>SELECTED AMBULANCE</div>
            {selected ? <>
              <h2 style={{ margin: "8px 0 4px", fontSize: 23 }}>{selected.id}</h2>
              <p style={{ margin: 0, color: "#8d99aa", fontSize: 12 }}>Approaching {selected.nextSignal}.</p>
              <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
                {[['ETA', `${selected.etaSeconds} seconds`], ['GPS quality', selected.gpsState === "good" ? "Good" : "Degraded"], ['Trip state', 'Active'], ['Speed', `${Math.round(selected.speedMps * 3.6)} km/h`], ['Control', 'Police advisory only']].map(([label, value]) => <div key={label} style={{ padding: 12, borderRadius: 10, background: "#090e16" }}><span style={{ display: "block", fontSize: 9, color: "#667487" }}>{label}</span><strong style={{ display: "block", marginTop: 4, fontSize: 12 }}>{value}</strong></div>)}
              </div>
              <a href="/map" style={{ display: "block", marginTop: 14, textAlign: "center", padding: "12px 14px", borderRadius: 10, background: "#f3f5f8", color: "#0a0d13", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Open on map</a>
            </> : <p style={{ color: "#8d99aa", fontSize: 12, marginTop: 12 }}>Select an active ambulance to see its latest operational state.</p>}
          </aside>
        </div>

        <p style={{ marginTop: 18, color: "#566477", fontSize: 10 }}>Training data only · feed refreshes every 5 seconds · no signal control.</p>
      </div>
    </main>
  );
}
