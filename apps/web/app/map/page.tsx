import "../premium-ops.css";
import "../interface-polish.css";
import "../ops-nav.css";
import "../map-polish.css";
import "./map-elite.css";
import OpsNav from "../OpsNav";
import MapShell from './MapShell';

export default function MapPage(){return <main className="map-page"><OpsNav section="LIVE RESPONSE MAP" status="TRAINING"/><div className="map-page-inner"><header className="map-header"><div><div className="eyebrow">NERAM / CHENNAI</div><h1>Live response map</h1><p>The active emergency route, next signal, and officer warning window in one view.</p></div><div className="map-status"><span/> TRAINING FEED</div></header><section className="map-card"><MapShell/></section></div></main>}
