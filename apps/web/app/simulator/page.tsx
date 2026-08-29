"use client";

import { useEffect, useMemo, useState } from 'react';
import { DEMO_AMBULANCE_ROUTE, DEMO_SIGNALS, getNextSignal } from '../../../../packages/geo/src/simulation';
import { initialBearingDegrees } from '../../../../packages/geo/src/bearing';

export default function SimulatorPage() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const current = DEMO_AMBULANCE_ROUTE[index];
  const nextPoint = DEMO_AMBULANCE_ROUTE[Math.min(index + 1, DEMO_AMBULANCE_ROUTE.length - 1)];
  const bearing = useMemo(() => initialBearingDegrees(current, nextPoint), [current, nextPoint]);
  const nextSignal = getNextSignal(current, DEMO_AMBULANCE_ROUTE.slice(index + 1), DEMO_SIGNALS);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setIndex((value) => {
        if (value >= DEMO_AMBULANCE_ROUTE.length - 1) {
          setRunning(false);
          return value;
        }
        return value + 1;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <main style={{ minHeight: '100vh', padding: 32 }}>
      <section style={{ maxWidth: 900, margin: '0 auto' }}>
        <p style={{ fontSize: 12, letterSpacing: 2, opacity: 0.65 }}>NERAM / SIMULATION</p>
        <h1 style={{ margin: '8px 0 4px' }}>Ambulance alert pipeline</h1>
        <p style={{ opacity: 0.7 }}>Demo fixtures only. Signal coordinates are not production Chennai data.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
          <article style={{ border: '1px solid #26324f', borderRadius: 16, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>AMB-DEMO-01</h2>
            <p><strong>Status:</strong> ACTIVE</p>
            <p><strong>GPS sample:</strong> {index + 1} / {DEMO_AMBULANCE_ROUTE.length}</p>
            <p><strong>Heading:</strong> {Math.round(bearing)}°</p>
            <p><strong>Location:</strong> {current.latitude.toFixed(5)}, {current.longitude.toFixed(5)}</p>
            <button onClick={() => { setIndex(0); setRunning(true); }} style={{ marginTop: 12, padding: '10px 14px' }}>
              Start simulation
            </button>
          </article>

          <article style={{ border: '1px solid #26324f', borderRadius: 16, padding: 20 }}>
            <h2 style={{ marginTop: 0 }}>Next signal</h2>
            {nextSignal ? (
              <>
                <p style={{ fontSize: 24, marginBottom: 8 }}>{nextSignal.signal.name}</p>
                <p>Distance: <strong>{Math.round(nextSignal.distanceFromCurrent)} m</strong></p>
                <p>Route proximity: <strong>{Math.round(nextSignal.nearestRouteDistance)} m</strong></p>
                <p style={{ marginBottom: 0 }}>Police alert: <strong>{nextSignal.distanceFromCurrent < 500 ? 'READY TO TRIGGER' : 'NOT YET'}</strong></p>
              </>
            ) : <p>No upcoming signal.</p>}
          </article>
        </div>

        <div style={{ marginTop: 24, border: '1px solid #26324f', borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>Pipeline</h2>
          <p>Ambulance GPS → route candidate → upcoming signal → police alert</p>
          <p style={{ opacity: 0.65 }}>The next iteration will replace the fixture route with proper road-aware matching and ETA.</p>
        </div>
      </section>
    </main>
  );
}
