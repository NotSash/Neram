"use client";

import { useEffect, useState } from "react";

type Alert = {
  id: string;
  ambulanceId: string;
  signalName: string;
  status: string;
  etaSeconds: number;
  distanceMeters: number;
  approach: string;
  gpsQuality: string;
};

export default function PoliceLivePage() {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await fetch("/api/police/alerts", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { alerts?: Alert[]; generatedAt?: string };
      setAlert(data.alerts?.[0] ?? null);
      setUpdatedAt(data.generatedAt ?? null);
    };

    void load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#070a10", color: "#f5f7fa", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: "1px solid #202a38" }}>
          <div><strong style={{ fontSize: 21 }}>Neram</strong><div style={{ fontSize: 10, letterSpacing: 1.5, color: "#718096", marginTop: 4 }}>POLICE SIGNAL WATCH</div></div>
          <div style={{ fontSize: 10, letterSpacing: 1.1, color: "#43d19e", fontWeight: 800 }}>● CONNECTED · TRAINING</div>
        </header>

        {!alert ? (
          <section style={{ marginTop: 28, padding: 28, border: "1px solid #202a38", borderRadius: 16, background: "#0d121b" }}>
            <strong>No active ambulance alerts</strong>
            <p style={{ color: "#8290a3" }}>Neram is monitoring your assigned signals.</p>
          </section>
        ) : (
          <>
            <section style={{ marginTop: 28, padding: 24, border: "1px solid rgba(255,91,91,.4)", borderRadius: 16, background: "rgba(255,91,91,.08)" }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#ff5b5b", fontWeight: 900 }}>AMBULANCE APPROACHING</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 8, alignItems: "end" }}>
                <div><h1 style={{ margin: 0, fontSize: 34 }}>{alert.signalName}</h1><p style={{ margin: "8px 0 0", color: "#9ba7b8" }}>{alert.ambulanceId} · approaching {alert.approach}</p></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 42, fontWeight: 800 }}>{acknowledged ? Math.max(0, alert.etaSeconds - 5) : alert.etaSeconds}s</div><div style={{ fontSize: 10, color: "#8d99aa" }}>estimated arrival</div></div>
              </div>
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 }}>
              {[['Distance ahead', `${alert.distanceMeters} m`], ['Approach', alert.approach], ['GPS quality', alert.gpsQuality.toUpperCase()]].map(([label, value]) => (
                <div key={label} style={{ padding: 18, background: "#0d121b", border: "1px solid #202a38", borderRadius: 14 }}><div style={{ fontSize: 10, color: "#718096" }}>{label}</div><strong style={{ display: "block", marginTop: 7 }}>{value}</strong></div>
              ))}
            </section>

            <section style={{ marginTop: 14, padding: 20, background: "#0d121b", border: "1px solid #202a38", borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><div style={{ fontSize: 9, color: "#718096", letterSpacing: 1.4, fontWeight: 800 }}>OFFICER RESPONSE</div><h2 style={{ margin: "7px 0 4px", fontSize: 22 }}>{acknowledged ? "Monitoring" : "Action needed"}</h2><p style={{ margin: 0, color: "#8491a3", fontSize: 12 }}>Use this information and follow existing traffic-control procedure.</p></div><button type="button" onClick={() => setAcknowledged((value) => !value)} style={{ padding: "12px 16px", borderRadius: 10, border: acknowledged ? "1px solid #2b8f6a" : 0, background: acknowledged ? "rgba(67,209,158,.1)" : "#f3f5f8", color: acknowledged ? "#43d19e" : "#0a0d13", fontWeight: 800 }}>{acknowledged ? "Acknowledged" : "Acknowledge alert"}</button></div>
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #202a38", fontSize: 10, color: "#617083" }}>Neram never changes traffic signals automatically.</div>
            </section>
          </>
        )}

        <footer style={{ marginTop: 16, fontSize: 10, color: "#566477" }}>Training event feed · Last refresh {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}</footer>
      </div>
    </main>
  );
}
