"use client";

import { useEffect, useRef, useState } from "react";

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
  const [feedError, setFeedError] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPermission | "unsupported">("default");
  const previousAlertId = useRef<string | null>(null);

  const enableNotifications = async () => {
    if (!("Notification" in window)) return setNotifications("unsupported");
    const permission = await Notification.requestPermission();
    setNotifications(permission);
  };

  useEffect(() => {
    if ("Notification" in window) setNotifications(Notification.permission);

    const load = async () => {
      try {
        const response = await fetch("/api/police/alerts", { cache: "no-store" });
        if (!response.ok) throw new Error("feed unavailable");
        const data = (await response.json()) as { alerts?: Alert[]; generatedAt?: string };
        const nextAlert = data.alerts?.[0] ?? null;
        setAlert(nextAlert);
        setUpdatedAt(data.generatedAt ?? null);
        setFeedError(false);

        if (nextAlert && previousAlertId.current && previousAlertId.current !== nextAlert.id && "Notification" in window && Notification.permission === "granted") {
          new Notification("Neram: ambulance approaching", {
            body: `${nextAlert.ambulanceId} is approaching ${nextAlert.signalName}. ETA ${nextAlert.etaSeconds}s.`,
          });
        }
        previousAlertId.current = nextAlert?.id ?? null;
      } catch {
        setFeedError(true);
      }
    };

    void load();
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const ageSeconds = updatedAt ? Math.max(0, Math.floor((Date.now() - new Date(updatedAt).getTime()) / 1000)) : null;
  const fresh = ageSeconds !== null && ageSeconds <= 8;

  return (
    <main style={{ minHeight: "100vh", background: "#070a10", color: "#f5f7fa", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, paddingBottom: 20, borderBottom: "1px solid #202a38" }}>
          <div><strong style={{ fontSize: 21 }}>Neram</strong><div style={{ fontSize: 10, letterSpacing: 1.5, color: "#718096", marginTop: 4 }}>POLICE SIGNAL WATCH</div></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={enableNotifications} disabled={notifications === "granted" || notifications === "unsupported"} style={{ padding: "8px 10px", borderRadius: 9, border: "1px solid #2a3546", background: "#0d121b", color: notifications === "granted" ? "#43d19e" : "#aab4c2", fontSize: 9, fontWeight: 800, cursor: notifications === "granted" || notifications === "unsupported" ? "default" : "pointer" }}>{notifications === "granted" ? "DESKTOP ALERTS ON" : notifications === "denied" ? "ALERTS BLOCKED" : "ENABLE DESKTOP ALERTS"}</button>
            <div style={{ fontSize: 10, letterSpacing: 1.1, color: feedError || !fresh ? "#f4c85e" : "#43d19e", fontWeight: 800 }}>● {feedError ? "FEED DEGRADED" : !fresh ? "STALE FEED" : "CONNECTED · TRAINING"}</div>
          </div>
        </header>

        {!alert ? (
          <section style={{ marginTop: 28, padding: 28, border: `1px solid ${feedError ? "rgba(244,200,94,.25)" : "#202a38"}`, borderRadius: 16, background: "#0d121b" }}>
            <strong>{feedError ? "Alert feed unavailable" : "No active ambulance alerts"}</strong>
            <p style={{ color: "#8290a3" }}>{feedError ? "Neram will retry automatically." : "Neram is monitoring your assigned signals."}</p>
          </section>
        ) : (
          <>
            <section style={{ marginTop: 28, padding: 24, border: "1px solid rgba(255,91,91,.4)", borderRadius: 16, background: "rgba(255,91,91,.08)" }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: "#ff5b5b", fontWeight: 900 }}>AMBULANCE APPROACHING</div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 20, marginTop: 8, alignItems: "end", flexWrap: "wrap" }}>
                <div><h1 style={{ margin: 0, fontSize: 34 }}>{alert.signalName}</h1><p style={{ margin: "8px 0 0", color: "#9ba7b8" }}>{alert.ambulanceId} · approaching {alert.approach}</p></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 42, fontWeight: 800 }}>{alert.etaSeconds}s</div><div style={{ fontSize: 10, color: "#8d99aa" }}>estimated arrival</div></div>
              </div>
            </section>

            <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginTop: 14 }}>
              {[['Distance ahead', `${alert.distanceMeters} m`], ['Approach', alert.approach], ['GPS quality', alert.gpsQuality.toUpperCase()]].map(([label, value]) => (
                <div key={label} style={{ padding: 18, background: "#0d121b", border: "1px solid #202a38", borderRadius: 14 }}><div style={{ fontSize: 10, color: "#718096" }}>{label}</div><strong style={{ display: "block", marginTop: 7 }}>{value}</strong></div>
              ))}
            </section>

            <section style={{ marginTop: 14, padding: 20, background: "#0d121b", border: "1px solid #202a38", borderRadius: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><div><div style={{ fontSize: 9, color: "#718096", letterSpacing: 1.4, fontWeight: 800 }}>OFFICER RESPONSE</div><h2 style={{ margin: "7px 0 4px", fontSize: 22 }}>{acknowledged ? "Monitoring" : "Action needed"}</h2><p style={{ margin: 0, color: "#8491a3", fontSize: 12 }}>Use this information and follow existing traffic-control procedure.</p></div><button type="button" onClick={() => setAcknowledged((value) => !value)} style={{ padding: "12px 16px", borderRadius: 10, border: acknowledged ? "1px solid #2b8f6a" : 0, background: acknowledged ? "rgba(67,209,158,.1)" : "#f3f5f8", color: acknowledged ? "#43d19e" : "#0a0d13", fontWeight: 800 }}>{acknowledged ? "Acknowledged" : "Acknowledge alert"}</button></div>
              <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #202a38", fontSize: 10, color: "#617083" }}>Neram never changes traffic signals automatically.</div>
            </section>
          </>
        )}

        <footer style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", fontSize: 10, color: "#566477" }}>
          <span>Training event feed · refresh interval 5s</span>
          <span>{updatedAt ? `Last refresh ${new Date(updatedAt).toLocaleTimeString()} · ${ageSeconds}s ago` : "Waiting for feed"}</span>
        </footer>
      </div>
    </main>
  );
}
