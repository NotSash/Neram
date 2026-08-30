import "../premium-ops.css";
import "../interface-polish.css";
import "../map-polish.css";
import MapShell from './MapShell';

export default function MapPage() {
  return (
    <main className="map-page">
      <header className="map-header">
        <div><div className="eyebrow">NERAM / CHENNAI</div><h1>Live response map</h1><p>Training simulation using demo ambulance and signal geometry.</p></div>
        <div className="map-status"><span /> SYSTEM ONLINE</div>
      </header>
      <section className="map-card"><MapShell /></section>
    </main>
  );
}
