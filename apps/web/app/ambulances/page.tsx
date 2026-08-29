"use client";

import { useMemo, useState } from "react";

const DEMO_AMBULANCES = [
  { id: "AMB-DEMO-01", call: "Emergency trip", area: "Chennai Central", eta: 42, signal: "Demo Signal A", gps: "Good", state: "ACTIVE" },
  { id: "AMB-DEMO-02", call: "Emergency trip", area: "Guindy", eta: 71, signal: "Demo Signal B", gps: "Good", state: "ACTIVE" },
  { id: "AMB-DEMO-03", call: "Emergency trip", area: "Adyar", eta: 96, signal: "Demo Signal C", gps: "Degraded", state: "ACTIVE" },
];

export default function AmbulancesPage() {
  const [selectedId, setSelectedId] = useState(DEMO_AMBULANCES[0].id);
  const selected = useMemo(() => DEMO_AMBULANCES.find((item) => item.id === selectedId) ?? DEMO_AMBULANCES[0], [selectedId]);

  return (
    <main style={{ minHeight: "100vh", background: "#070a10", color: "#f5f7fa", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #202a38", paddingBottom: 18 }}>
          <div><strong style={{ fontSize: 22 }}>Neram</strong><div style={{ fontSize: 10, color: "#718096", letterSpacing: 1.5, marginTop: 4 }}>ACTIVE AMBULANCES · CHENNAI</div></div>
          <div style={{ fontSize: 10, color: "#43d19e", fontWeight: 800, letterSpacing: 1 }}>● TRAINING MODE</div>
        </header>

        <section style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, padding: "36px 0 24px" }}>
          <div><div style={{ fontSize: 10, color: "#718096", letterSpacing: 1.5, fontWeight: 800 }}>CITY OVERVIEW</div><h1 style={{ margin: "8px 0 6px", fontSize: 36 }}>Active ambulances</h1><p style={{ margin: 0, color: "#8d99aa", fontSize: 13 }}>Only ongoing emergency trips are shown here.</p></div>
          <div style={{ padding: "12px 16px", border: "1px solid #202a38", borderRadius: 12, background: "#0d121b" }}><span style={{ display: "block", color: "#718096", fontSize: 9, letterSpacing: 1.2 }}>CURRENTLY ACTIVE</span><strong style={{ display: "block", marginTop: 4, fontSize: 26 }}>{DEMO_AMBULANCES.length}</strong></div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 16 }}>
          <section style={{ display: "grid", gap: 10 }}>
            {DEMO_AMBULANCES.map((ambulance) => {
              const selectedState = selectedId === ambulance.id;
              return (
                <button key={ambulance.id} type="button" onClick={() => setSelectedId(ambulance.id)} style={{ textAlign: "left", padding: 18, borderRadius: 14, border: selectedState ? "1px solid rgba(255,91,91,.55)" : "1px solid #202a38", background: selectedState ? "rgba(255,91,91,.08)" : "#0d121b", color: "inherit", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><div><div style={{ fontSize: 9, color: "#718096", letterSpacing: 1.3 }}>{ambulance.state}</div><strong style={{ display: "block", marginTop: 5, fontSize: 18 }}>{ambulance.id}</strong><span style={{ color: "#8d99aa", fontSize: 12 }}>{ambulance.area} · {ambulance.call}</span></div><div style={{ textAlign: "right" }}><strong style={{ fontSize: 28 }}>{ambulance.eta}s</strong><span style={{ display: "block", fontSize: 9, color: "#718096" }}>TO {ambulance.signal.toUpperCase()}</span></div></div>
                  <div style={{ display: "flex", gap: 18, marginTop: 16, paddingTop: 12, borderTop: "1px solid #202a38", fontSize: 10, color: "#7d8a9c" }}><span>GPS <b style={{ color: ambulance.gps === "Good" ? "#43d19e" : "#f4c85e" }}>{ambulance.gps}</b></span><span>Emergency trip active</span></div>
                </button>
              );
            })}
          </section>

          <aside style={{ padding: 20, borderRadius: 14, border: "1px solid #202a38", background: "#0d121b" }}>
            <div style={{ fontSize: 9, color: "#718096", fontWeight: 800, letterSpacing: 1.4 }}>SELECTED AMBULANCE</div>
            <h2 style={{ margin: "8px 0 4px", fontSize: 23 }}>{selected.id}</h2>
            <p style={{ margin: 0, color: "#8d99aa", fontSize: 12 }}>Approaching {selected.signal} from {selected.area}.</p>
            <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
              {[['ETA', `${selected.eta} seconds`], ['GPS quality', selected.gps], ['Trip state', 'Active'], ['Control', 'Police advisory only']].map(([label, value]) => <div key={label} style={{ padding: 12, borderRadius: 10, background: "#090e16" }}><span style={{ display: "block", fontSize: 9, color: "#667487" }}>{label}</span><strong style={{ display: "block", marginTop: 4, fontSize: 12 }}>{value}</strong></div>)}
            </div>
            <a href="/map" style={{ display: "block", marginTop: 14, textAlign: "center", padding: "12px 14px", borderRadius: 10, background: "#f3f5f8", color: "#0a0d13", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>Open on map</a>
          </aside>
        </div>

        <p style={{ marginTop: 18, color: "#566477", fontSize: 10 }}>Training data only · completed trips are intentionally excluded from this active view.</p>
      </div>
    </main>
  );
}
