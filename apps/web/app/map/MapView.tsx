"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Point = { latitude: number; longitude: number };
type Signal = Point & { id: string; name: string; status: "next" | "upcoming" | "passed" };

const DEMO_SIGNALS: Signal[] = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098, status: "next" },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122, status: "upcoming" },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148, status: "upcoming" },
];

const ROUTE: Point[] = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0466, longitude: 80.2087 },
  { latitude: 13.0472, longitude: 80.2094 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0486, longitude: 80.2110 },
  { latitude: 13.0494, longitude: 80.2118 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0511, longitude: 80.2134 },
  { latitude: 13.0520, longitude: 80.2145 },
  { latitude: 13.0527, longitude: 80.2153 },
];

function MapController({ position }: { position: Point }) {
  const map = useMap();
  useEffect(() => {
    const center = map.getCenter();
    const distance = Math.hypot(center.lat - position.latitude, center.lng - position.longitude);
    if (distance > 0.0012) {
      map.panTo([position.latitude, position.longitude], { animate: true, duration: 0.45 });
    }
  }, [map, position.latitude, position.longitude]);
  return null;
}

export default function MapView() {
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(true);
  const position = ROUTE[index];

  const signalProgress = useMemo(() => {
    const thresholds = [2, 6, 9];
    return thresholds.map((threshold, signalIndex) => ({ threshold, signalIndex }));
  }, []);

  const currentSignalIndex = useMemo(() => {
    const next = signalProgress.find(({ threshold }) => index < threshold);
    return next?.signalIndex ?? DEMO_SIGNALS.length - 1;
  }, [index, signalProgress]);

  const remainingSignals = DEMO_SIGNALS.map((item, signalIndex) => ({
    ...item,
    status: signalIndex < currentSignalIndex ? "passed" : signalIndex === currentSignalIndex ? "next" : "upcoming",
  } as Signal));

  const nextSignal = remainingSignals[currentSignalIndex];
  const line = ROUTE.map((point) => [point.latitude, point.longitude] as [number, number]);
  const progress = (index / (ROUTE.length - 1)) * 100;
  const distanceRemaining = Math.max(0, Math.round(((ROUTE.length - 1 - index) / (ROUTE.length - 1)) * 840));
  const etaSeconds = Math.max(0, Math.round((ROUTE.length - 1 - index) * 18));
  const atFinal = index >= ROUTE.length - 1;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setIndex((value) => {
        if (value >= ROUTE.length - 1) {
          setRunning(false);
          return value;
        }
        return value + 1;
      });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [running]);

  return (
    <div className="map-frame" aria-label="Neram training simulation map">
      <MapContainer center={[position.latitude, position.longitude]} zoom={15} scrollWheelZoom zoomControl className="leaflet-map">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController position={position} />
        <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 6, opacity: 0.8 }} />
        {remainingSignals.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={item.status === "next" ? 10 : 7}
            pathOptions={{
              color: item.status === "passed" ? "#43d19e" : item.status === "next" ? "#ff4d5f" : "#6f7d91",
              fillColor: item.status === "passed" ? "#43d19e" : item.status === "next" ? "#ff4d5f" : "#6f7d91",
              fillOpacity: 0.95,
              weight: 2,
            }}
          >
            <Tooltip direction="top">{item.name} · {item.status.toUpperCase()}</Tooltip>
          </CircleMarker>
        ))}
        <CircleMarker center={[position.latitude, position.longitude]} radius={11} pathOptions={{ color: "#ffffff", fillColor: "#111827", fillOpacity: 1, weight: 3 }}>
          <Tooltip direction="top" permanent>AMB-DEMO-01</Tooltip>
        </CircleMarker>
      </MapContainer>

      <div className="map-overlay map-overlay-top">
        <div>
          <span className="map-overline">ACTIVE EMERGENCY · TRAINING</span>
          <strong>AMB-DEMO-01</strong>
          <span>{running ? "Route simulation in progress" : atFinal ? "Simulation complete" : "Simulation paused"}</span>
        </div>
        <div className="map-kpi"><strong>{etaSeconds}s</strong><span>ETA to next signal</span></div>
      </div>

      <div className="map-overlay map-overlay-bottom">
        <div className="map-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="map-bottom-row">
          <div><b>Next signal</b><span>{nextSignal?.name ?? "Route complete"}</span></div>
          <div><b>{distanceRemaining} m</b><span>estimated remaining</span></div>
          <button type="button" className="map-control" onClick={() => {
            if (atFinal) setIndex(0);
            setRunning((value) => !value || atFinal);
          }}>{running ? "Pause" : atFinal ? "Replay" : "Resume"}</button>
        </div>
      </div>

      <div className="map-legend">
        <span><i className="legend-dot ambulance" /> Ambulance</span>
        <span><i className="legend-dot signal" /> Next signal</span>
        <span><i className="legend-dot passed" /> Passed</span>
        <span><i className="legend-line" /> Route</span>
      </div>
      <div className="map-disclaimer">Training simulation · Demo geometry only</div>
    </div>
  );
}
