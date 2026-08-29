"use client";

import { useMemo, useState } from "react";

const DEMO_ALERTS = [
  { id: "A-204", ambulance: "AMB-DEMO-01", signal: "Demo Signal B", eta: 32, distance: 410, status: "PENDING", direction: "South-east", confidence: 96 },
  { id: "A-203", ambulance: "AMB-DEMO-02", signal: "Demo Signal A", eta: 71, distance: 820, status: "ACKNOWLEDGED", direction: "North-east", confidence: 91 },
];

export default function DashboardPage() {
  const [selected, setSelected] = useState(DEMO_ALERTS[0]);
  const [acknowledged, setAcknowledged] = useState(false);
  const active = useMemo(() => DEMO_ALERTS.filter((alert) => alert.status === "PENDING").length - (acknowledged ? 1 : 0), [acknowledged]);

  return (
    <main className="ops-shell">
      <header className="ops-topbar">
        <div className="ops-brand"><span className="ops-mark">N</span><span>Neram</span><span className="ops-city">CHENNAI</span></div>
        <div className="ops-live"><span /> ALL SYSTEMS NOMINAL</div>
      </header>

      <div className="ops-layout">
        <aside className="ops-sidebar">
          <div className="sidebar-label">TRAFFIC OPERATIONS</div>
          <nav>
            <a className="nav-item active" href="/dashboard"><span>◉</span> Signal watch</a>
            <a className="nav-item" href="/map"><span>⌁</span> Live map</a>
          </nav>
          <div className="sidebar-footer">
            <div className="mini-label">STATION</div>
            <strong>Chennai Central</strong>
            <span>Training environment</span>
          </div>
        </aside>

        <section className="ops-main">
          <div className="ops-heading">
            <div>
              <div className="eyebrow">SIGNAL WATCH / TRAINING</div>
              <h1>Approaching ambulances</h1>
              <p>Warnings are advisory. Traffic control remains with the officer at the signal.</p>
            </div>
            <a className="map-link" href="/map">Open live map <span>↗</span></a>
          </div>

          <div className="ops-stats">
            <div><span>ACTIVE WARNINGS</span><strong>{Math.max(active, 0)}</strong></div>
            <div><span>MONITORED SIGNALS</span><strong>3</strong></div>
            <div><span>LAST LOCATION</span><strong>7s ago</strong></div>
          </div>

          <div className="alert-stack">
            {DEMO_ALERTS.map((alert) => {
              const isSelected = selected.id === alert.id;
              const isPending = alert.status === "PENDING" && !(acknowledged && alert.id === selected.id);
              return (
                <button key={alert.id} className={`ops-alert ${isSelected ? "selected" : ""}`} onClick={() => { setSelected(alert); if (alert.id !== selected.id) setAcknowledged(false); }}>
                  <div className={`alert-severity ${isPending ? "urgent" : "normal"}`}>{isPending ? "!" : "✓"}</div>
                  <div className="alert-main">
                    <div className="alert-row"><span className="alert-id">#{alert.id}</span><span className={`status ${isPending ? "pending" : "ack"}`}>{isPending ? "ACTION NEEDED" : "ACKNOWLEDGED"}</span></div>
                    <strong>{alert.signal}</strong>
                    <span>{alert.ambulance} · {alert.direction}</span>
                  </div>
                  <div className="alert-eta"><strong>{alert.eta}s</strong><span>ETA</span></div>
                  <div className="alert-distance"><strong>{alert.distance}m</strong><span>distance</span></div>
                  <div className="chevron">›</div>
                </button>
              );
            })}
          </div>

          <section className="detail-card">
            <div className="detail-head">
              <div><span className="eyebrow">SELECTED WARNING</span><h2>{selected.signal}</h2><p>{selected.ambulance} · approaching from {selected.direction.toLowerCase()}</p></div>
              <div className={`big-status ${acknowledged && selected.id === DEMO_ALERTS[0].id ? "acknowledged" : "warning"}`}>{acknowledged && selected.id === DEMO_ALERTS[0].id ? "ACKNOWLEDGED" : "ACTION NEEDED"}</div>
            </div>
            <div className="detail-metrics">
              <div><span>ETA</span><strong>{acknowledged && selected.id === DEMO_ALERTS[0].id ? "31s" : `${selected.eta}s`}</strong></div>
              <div><span>DISTANCE</span><strong>{selected.distance} m</strong></div>
              <div><span>ROUTE CONFIDENCE</span><strong>{selected.confidence}%</strong></div>
            </div>
            <div className="detail-note"><span className="note-icon">i</span><p>Neram is notifying the assigned officer. Take the appropriate traffic-control action when safe. Neram does not control the signal.</p></div>
            <div className="detail-actions">
              <button className="ack-button" onClick={() => setAcknowledged(true)} disabled={!(!acknowledged && selected.id === DEMO_ALERTS[0].id)}>Acknowledge warning</button>
              <a className="secondary-button" href="/map">View on map</a>
            </div>
          </section>

          <div className="event-strip"><span><i className="event-dot" /> Location received 7s ago</span><span>GPS accuracy ±12m</span><span>Training data</span></div>
        </section>
      </div>
    </main>
  );
}
