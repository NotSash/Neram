"use client";

import { useEffect, useRef, useState } from "react";

const DEMO_POINTS = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0466, longitude: 80.2087 },
  { latitude: 13.0472, longitude: 80.2094 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0486, longitude: 80.211 },
  { latitude: 13.0494, longitude: 80.2118 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0511, longitude: 80.2134 },
  { latitude: 13.052, longitude: 80.2145 },
  { latitude: 13.0527, longitude: 80.2153 },
];

type Decision = {
  shouldAlert: boolean;
  reason: string;
  signal: { id: string; name: string } | null;
  distanceToSignalMeters: number | null;
  estimatedEtaSeconds: number | null;
};

type GpsState = "simulation" | "device" | "denied" | "unavailable";

export default function AmbulancePage() {
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [shared, setShared] = useState(false);
  const [pointIndex, setPointIndex] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [gpsState, setGpsState] = useState<GpsState>("simulation");
  const [accuracyMeters, setAccuracyMeters] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (!active || !shared || gpsState !== "simulation") return;
    const timer = window.setInterval(() => {
      setPointIndex((value) => (value >= DEMO_POINTS.length - 1 ? 0 : value + 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, [active, shared, gpsState]);

  useEffect(() => {
    if (!active || !shared || gpsState !== "device") return;
    if (!navigator.geolocation) {
      setGpsState("unavailable");
      setGpsError("This device does not expose browser location services.");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const point = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setAccuracyMeters(Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null);
        setGpsError(null);
        setSending(true);
        fetch("/api/ambulance/update", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            ...point,
            speedMps: Number.isFinite(position.coords.speed) && position.coords.speed !== null
              ? Math.max(0, position.coords.speed)
              : 13.9,
            gpsQuality: position.coords.accuracy <= 30 ? "good" : "degraded",
          }),
        })
          .then(async (response) => {
            if (!response.ok) throw new Error("GPS update rejected");
            return response.json() as Promise<{ decision: Decision }>;
          })
          .then((data) => {
            setDecision(data.decision);
            setLastUpdate(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
          })
          .catch(() => setGpsError("Neram could not process the latest GPS update."))
          .finally(() => setSending(false));
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsState("denied");
          setGpsError("Location permission was denied. Simulation remains available.");
        } else {
          setGpsError("Unable to obtain a fresh GPS position.");
        }
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    watchId.current = id;
    return () => {
      navigator.geolocation.clearWatch(id);
      watchId.current = null;
    };
  }, [active, shared, gpsState]);

  useEffect(() => {
    if (!active || !shared || gpsState !== "simulation") return;
    const point = DEMO_POINTS[pointIndex];
    setSending(true);
    fetch("/api/ambulance/update", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...point, speedMps: 13.9, gpsQuality: "good" }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Update failed");
        return response.json() as Promise<{ decision: Decision }>;
      })
      .then((data) => {
        setDecision(data.decision);
        setLastUpdate(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      })
      .catch(() => setLastUpdate(null))
      .finally(() => setSending(false));
  }, [active, shared, pointIndex, gpsState]);

  const resetTrip = () => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setActive(false);
    setShared(false);
    setSeconds(0);
    setPointIndex(0);
    setDecision(null);
    setLastUpdate(null);
    setGpsState("simulation");
    setAccuracyMeters(null);
    setGpsError(null);
  };

  const enableDeviceGps = () => {
    setGpsError(null);
    setGpsState("device");
    setShared(true);
  };

  return (
    <main className="ambulance-shell">
      <header className="ambulance-header">
        <a className="ops-brand" href="/" aria-label="Back to Neram home"><span className="brand-mark">N</span><span>Neram</span><small>AMBULANCE MODE</small></a>
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

        <button type="button" className={active ? "ambulance-stop" : "ambulance-start"} onClick={() => active ? resetTrip() : setActive(true)}>
          <span>{active ? "End emergency trip" : "Start emergency trip"}</span>
          <span>{active ? "■" : "→"}</span>
        </button>

        {active && (
          <div className="ambulance-sharing" role="status">
            <span className={`sharing-indicator ${shared ? "is-shared" : ""}`} />
            <div>
              <strong>{shared ? (gpsState === "device" ? "Device GPS active" : "Simulation GPS active") : "Location not shared"}</strong>
              <p>
                {!shared
                  ? "Enable training location sharing to exercise the alert pipeline."
                  : gpsState === "device"
                    ? `${accuracyMeters ? `Accuracy ±${Math.round(accuracyMeters)}m` : "Waiting for GPS accuracy"} · ${sending ? "Sending update…" : lastUpdate ? `Last update ${lastUpdate}` : "Waiting for first GPS update."}`
                    : sending ? "Sending simulated GPS update…" : lastUpdate ? `Last update ${lastUpdate}` : "Waiting for first simulated GPS update."}
              </p>
            </div>
            {!shared ? (
              <button type="button" onClick={() => setShared(true)}>Simulate GPS</button>
            ) : gpsState === "device" ? (
              <button type="button" onClick={() => { setGpsState("simulation"); setAccuracyMeters(null); setGpsError(null); }}>Simulation</button>
            ) : (
              <button type="button" onClick={enableDeviceGps}>Use device GPS</button>
            )}
          </div>
        )}

        {gpsError && <p className="ambulance-note" role="alert">{gpsError}</p>}

        {decision?.shouldAlert && (
          <div className="ambulance-alert-preview" role="status">
            <div><span>ALERT WINDOW OPEN</span><strong>{decision.signal?.name}</strong></div>
            <div><strong>{decision.estimatedEtaSeconds ?? "—"}s</strong><small>ETA</small></div>
          </div>
        )}
      </section>

      <section className="ambulance-card">
        <div className="map-overline">TRIP DETAILS</div>
        <div className="ambulance-fields">
          <label>Destination <input placeholder="Hospital or destination" /></label>
          <label>Priority <select defaultValue="emergency"><option value="emergency">Emergency</option><option value="critical">Critical</option></select></label>
        </div>
        <p className="ambulance-note">Training mode. Device GPS can be exercised in-browser, but no live police network or Supabase persistence is enabled yet.</p>
      </section>
    </main>
  );
}
