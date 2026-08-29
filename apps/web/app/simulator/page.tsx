"use client";

import { useEffect, useMemo, useState } from 'react';
import { DEMO_AMBULANCE_ROUTE, DEMO_SIGNALS, getNextSignal } from '../../../../packages/geo/src/simulation';
import { initialBearingDegrees } from '../../../../packages/geo/src/bearing';

const fmtEta = (seconds: number) => seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

export default function SimulatorPage() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const current = DEMO_AMBULANCE_ROUTE[index];
  const nextPoint = DEMO_AMBULANCE_ROUTE[Math.min(index + 1, DEMO_AMBULANCE_ROUTE.length - 1)];
  const bearing = useMemo(() => initialBearingDegrees(current, nextPoint), [current, nextPoint]);
  const nextSignal = getNextSignal(current, DEMO_AMBULANCE_ROUTE.slice(index + 1), DEMO_SIGNALS);
  const demoSpeedMps = 11;
  const eta = nextSignal ? Math.max(1, Math.round(nextSignal.distanceFromCurrent / demoSpeedMps)) : null;
  const urgent = eta !== null && eta <= 45;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setIndex((value) => {
        if (value >= DEMO_AMBULANCE_ROUTE.length - 1) { setRunning(false); return value; }
        return value + 1;
      });
    }, 1500);
    return () => window.clearInterval(timer);
  }, [running]);

  const start = () => { setIndex(0); setRunning(true); };

  return (
    <main className="sim-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">N</span><span>Neram</span></div>
        <div className="top-status"><span className="live-dot" /> SIMULATION · CHENNAI</div>
      </header>

      <section className="content">
        <div className="eyebrow">TRAFFIC POLICE · TRAINING MODE</div>
        <div className="title-row">
          <div><h1>Emergency approach</h1><p>See how Neram turns a live ambulance position into a signal alert.</p></div>
          <button className="start-button" onClick={start}>{running ? 'Restart simulation' : 'Start simulation'}</button>
        </div>

        <div className="alert-card" data-urgent={urgent}>
          <div className="alert-icon">!</div>
          <div className="alert-copy">
            <div className="alert-kicker">{urgent ? 'ACTION WINDOW' : 'UPCOMING AMBULANCE'}</div>
            <h2>AMB-DEMO-01 approaching</h2>
            <p>{nextSignal?.signal.name ?? 'No upcoming signal detected'}</p>
          </div>
          <div className="eta"><strong>{eta !== null ? fmtEta(eta) : '—'}</strong><span>estimated arrival</span></div>
          <div className="alert-state">{urgent ? 'PREPARE' : 'MONITORING'}</div>
        </div>

        <div className="grid">
          <article className="panel route-panel">
            <div className="panel-head"><div><span className="label">LIVE ROUTE</span><h3>Ambulance movement</h3></div><span className="active-pill">● ACTIVE</span></div>
            <div className="route-visual">
              <div className="road-line" />
              {DEMO_SIGNALS.map((signal, i) => <div className={`signal-node ${i === index ? 'passed' : ''}`} key={signal.id} style={{ left: `${18 + i * 31}%` }}><span>✦</span><small>{signal.name}</small></div>)}
              <div className="ambulance-marker" style={{ left: `${8 + (index / (DEMO_AMBULANCE_ROUTE.length - 1)) * 82}%` }}>🚑</div>
            </div>
            <div className="route-meta"><span>Heading <b>{Math.round(bearing)}°</b></span><span>GPS sample <b>{index + 1}/{DEMO_AMBULANCE_ROUTE.length}</b></span><span>Tracking <b>Healthy</b></span></div>
          </article>

          <article className="panel signal-panel">
            <div className="panel-head"><div><span className="label">NEXT SIGNAL</span><h3>{nextSignal?.signal.name ?? 'None'}</h3></div></div>
            {nextSignal ? <>
              <div className="metric"><span>Distance</span><strong>{Math.round(nextSignal.distanceFromCurrent)} m</strong></div>
              <div className="metric"><span>Estimated arrival</span><strong>{eta !== null ? fmtEta(eta) : '—'}</strong></div>
              <div className="metric"><span>Approach</span><strong>{Math.round(bearing)}° · forward</strong></div>
              <div className="confidence"><span>Route confidence</span><strong>96%</strong><div><i style={{ width: '96%' }} /></div></div>
            </> : <p className="empty">The simulation has no signal ahead.</p>}
          </article>
        </div>

        <div className="pipeline"><span>GPS</span><b>→</b><span>Route</span><b>→</b><span>Next signal</span><b>→</b><strong>Police alert</strong></div>
        <p className="demo-note">Demo coordinates only. No real Chennai signal or police assignment data is used here.</p>
      </section>
    </main>
  );
}
