export default function Home() {
  return <main className="home-shell">
    <nav className="home-nav" aria-label="Primary navigation">
      <a className="ops-brand home-brand-link" href="/" aria-label="Neram home">
        <span className="brand-mark">N</span>
        <span>Neram</span>
        <small>CHENNAI EMERGENCY NETWORK</small>
      </a>

      <div className="home-links home-links-desktop">
        <a href="/police">Police console</a>
        <a href="/police-live">Live alert</a>
        <a href="/ambulances">Active ambulances</a>
        <a href="/ambulance">Ambulance mode</a>
        <a href="/map">Live map</a>
      </div>

      <details className="home-mobile-menu">
        <summary aria-label="Open navigation menu"><span /> <span /> <span /></summary>
        <div className="home-mobile-menu-panel">
          <a href="/police-live">Live alert <span>→</span></a>
          <a href="/ambulance">Ambulance mode <span>→</span></a>
          <a href="/map">Live map <span>→</span></a>
          <a href="/ambulances">Active ambulances <span>→</span></a>
          <a href="/police">Police console <span>→</span></a>
        </div>
      </details>
    </nav>

    <section className="home-hero">
      <div className="eyebrow">CHENNAI · EMERGENCY RESPONSE</div>
      <h1>Give traffic police<br /><em>time to act.</em></h1>
      <p>Neram alerts the right traffic-police unit when an active ambulance is approaching their signal.</p>
      <div className="home-actions">
        <a className="home-primary" href="/police-live">Open live alert console <span>→</span></a>
        <a className="home-secondary" href="/ambulance">Open ambulance mode</a>
      </div>
      <div className="home-note"><span className="live-dot" /> TRAINING ENVIRONMENT · NO SIGNAL CONTROL</div>
    </section>

    <section className="home-principles">
      <div><span>01</span><strong>Detect</strong><p>Verified ambulance sends live location during an active emergency trip.</p></div>
      <div><span>02</span><strong>Predict</strong><p>Neram identifies the next relevant signal on the projected road route.</p></div>
      <div><span>03</span><strong>Inform</strong><p>The assigned officer receives an early warning and decides what to do.</p></div>
    </section>
  </main>;
}
