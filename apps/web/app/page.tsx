function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10h11M10.5 5.5 15 10l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8.4 7.2a4 4 0 0 0 0 9.6M15.6 7.2a4 4 0 0 1 0 9.6M10.8 9.6a2.2 2.2 0 0 0 0 4.8M13.2 9.6a2.2 2.2 0 0 1 0 4.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 3.6 18 6v5.2c0 4.1-2.4 7.2-6 9.2-3.6-2-6-5.1-6-9.2V6l6-2.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m9.1 12 1.9 1.9 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="8" y="4" width="8" height="16" rx="2.4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="8" r="1.7" fill="currentColor" />
      <circle cx="12" cy="12" r="1.7" fill="currentColor" opacity=".34" />
      <circle cx="12" cy="16" r="1.7" fill="currentColor" opacity=".34" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="home-shell home-redesign">
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

      <section className="home-hero home-hero-redesign">
        <div className="home-hero-copy">
          <div className="home-kicker">
            <span className="home-kicker-dot" />
            CHENNAI · EMERGENCY RESPONSE
          </div>
          <div className="home-live-chip"><span /> TRAINING FEED LIVE</div>

          <h1>Give traffic police <em>time to act.</em></h1>
          <p className="home-lede">Neram gives the right traffic-police unit an early warning when an active ambulance is closing on their signal.</p>

          <div className="home-actions home-actions-redesign">
            <a className="home-primary home-primary-redesign" href="/police-live">
              <span>Open live alert console</span>
              <span className="home-arrow"><ArrowIcon /></span>
            </a>
            <a className="home-secondary home-secondary-redesign" href="/ambulance">
              <span>Open ambulance mode</span>
              <span className="home-secondary-arrow"><ArrowIcon /></span>
            </a>
          </div>

          <div className="home-trust-row">
            <span><ShieldIcon /> Advisory only</span>
            <span><SignalIcon /> No signal control</span>
            <span><LiveIcon /> 5s feed refresh</span>
          </div>
        </div>

        <div className="home-response-card" aria-label="Neram response preview">
          <div className="home-response-top">
            <div>
              <span className="home-mini-label">LIVE RESPONSE PREVIEW</span>
              <strong>One signal ahead.</strong>
            </div>
            <span className="home-response-status"><i /> TRAINING</span>
          </div>

          <div className="home-route">
            <div className="home-route-step home-route-step-active">
              <div className="home-route-node"><LiveIcon /></div>
              <div>
                <span className="home-route-label">01 · ACTIVE TRIP</span>
                <strong>AMB-DEMO-01</strong>
                <p>Live location sharing</p>
              </div>
            </div>

            <div className="home-route-line"><span /></div>

            <div className="home-route-step home-route-step-alert">
              <div className="home-route-node"><MapPinIcon /></div>
              <div>
                <span className="home-route-label">02 · NEXT SIGNAL</span>
                <strong>Anna Salai · Gemini</strong>
                <p><b>38s</b> estimated arrival · alert window open</p>
              </div>
            </div>

            <div className="home-route-line"><span /></div>

            <div className="home-route-step">
              <div className="home-route-node"><SignalIcon /></div>
              <div>
                <span className="home-route-label">03 · OFFICER</span>
                <strong>Assigned unit notified</strong>
                <p>Officer decides how to respond.</p>
              </div>
            </div>
          </div>

          <div className="home-response-footer">
            <span className="home-response-pulse" />
            EARLY WARNING · NOT AUTOMATED CONTROL
          </div>
        </div>
      </section>

      <section className="home-proof-strip" aria-label="Neram product principles">
        <div><span>01</span><strong>Detect</strong><p>Verify the active emergency trip.</p></div>
        <div><span>02</span><strong>Predict</strong><p>Identify the next relevant signal.</p></div>
        <div><span>03</span><strong>Inform</strong><p>Give the assigned officer time to act.</p></div>
      </section>

      <section className="home-explainer">
        <div className="home-section-kicker">WHY NERAM EXISTS</div>
        <div className="home-explainer-grid">
          <h2>The ambulance should not be the first thing the junction sees.</h2>
          <div>
            <p>Neram moves the warning upstream. The ambulance shares its live position, the system identifies the next relevant signal, and the officer gets the information before the emergency reaches the junction.</p>
            <a href="/police-live">See the response flow <ArrowIcon /></a>
          </div>
        </div>
      </section>

      <section className="home-bottom-cta">
        <div>
          <span className="home-section-kicker">READY TO RUN THE DEMO?</span>
          <h2>Start with the live alert console.</h2>
          <p>Everything here runs in a controlled training environment.</p>
        </div>
        <a className="home-primary home-bottom-button" href="/police-live"><span>Open live alert console</span><ArrowIcon /></a>
      </section>
    </main>
  );
}
