"use client";

import { useEffect, useState } from "react";

export default function AmbulancePage() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return (
    <main className="ambulance-shell">
      <header className="ambulance-header">
        <div className="ops-brand"><span className="brand-mark">N</span><span>Neram</span><small>AMBULANCE MODE</small></div>
        <span className={`ambulance-status ${active ? "is-live" : ""}`}><i /> {active ? "EMERGENCY ACTIVE" : "READY"}</span>
      </header>

      <section className="ambulance-card ambulance-hero">
        <div className="map-overline">AUTHORIZED AMBULANCE · TRAINING</div>
        <h1>{active ? "Location sharing is on." : "Start an emergency trip."}</h1>
        <p>{active ? "Neram is preparing advance information for traffic police along your route." : "When activated, Neram shares your live position during this emergency trip. It never controls traffic signals."}</p>

        <div className="ambulance-meta-grid">
          <div><span>AMBULANCE</span><strong>AMB-DEMO-01</strong></div>
          <div><span>TRIP TIME</span><strong>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</strong></div>
        </div>

        <button type="button" className={active ? "ambulance-stop" : "ambulance-start"} onClick={() => { setActive((value) => !value); if (active) { setShared(false); setSeconds(0); } }}>
          <span>{active ? "End emergency trip" : "Start emergency trip"}</span>
          <span>{active ? "■" : "→"}</span>
        </button>

        {active && (
          <div className="ambulance-sharing" role="status">
            <span className={`sharing-indicator ${shared ? "is-shared" : ""}`} />
            <div><strong>{shared ? "Location shared" : "Preparing location sharing"}</strong><p>{shared ? "GPS updates will be sent while this trip is active." : "Allow location access on the device to begin live updates."}</p></div>
            <button type="button" onClick={() => setShared(true)}>{shared ? "Active" : "Enable"}</button>
          </div>
        )}
      </section>

      <section className="ambulance-card">
        <div className="map-overline">TRIP DETAILS</div>
        <div className="ambulance-fields">
          <label>Destination <input placeholder="Hospital or destination" /></label>
          <label>Priority <select defaultValue="emergency"><option value="emergency">Emergency</option><option value="critical">Critical</option></select></label>
        </div>
        <p className="ambulance-note">Training mode. Destination and GPS are not sent to a real traffic-police network yet.</p>
      </section>
    </main>
  );
}
