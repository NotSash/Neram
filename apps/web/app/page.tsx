export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <section style={{ maxWidth: 720 }}>
        <p style={{ letterSpacing: 3, fontSize: 12, opacity: 0.7 }}>CHENNAI EMERGENCY RESPONSE</p>
        <h1 style={{ fontSize: 56, margin: '12px 0' }}>Neram</h1>
        <p style={{ fontSize: 20, lineHeight: 1.5, opacity: 0.8 }}>
          Giving traffic police time to prepare when an active ambulance approaches their signal.
        </p>
        <p style={{ marginTop: 28, opacity: 0.55 }}>Foundation build is ready.</p>
      </section>
    </main>
  );
}
