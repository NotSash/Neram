"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Point = { latitude: number; longitude: number };
type Signal = Point & { id: string; name: string; status: "next" | "upcoming" | "passed" };
type RouteResponse = { distanceMeters: number; durationSeconds: number; shape: Array<{ lat: number; lon: number }> };

const DEMO_SIGNALS: Signal[] = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098, status: "next" },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122, status: "upcoming" },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148, status: "upcoming" },
];

const DEMO_ROUTE: Point[] = [
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
  const [route, setRoute] = useState<Point[]>(DEMO_ROUTE);
  const [routeStatus, setRouteStatus] = useState<"routing" | "live" | "fallback">("routing");

  const position = route[Math.min(index, route.length - 1)];
  const progress = route.length > 1 ? (index / (route.length - 1)) * 100 : 0;
  const distanceRemaining = Math.max(0, Math.round(((route.length - 1 - index) / Math.max(route.length - 1, 1)) * 840));
  const etaSeconds = Math.max(0, Math.round((route.length - 1 - index) * 18));
  const currentSignalIndex = Math.min(Math.floor(index / Math.max(1, Math.ceil(route.length / DEMO_SIGNALS.length))), DEMO_SIGNALS.length - 1);

  const signals = useMemo(
    () => DEMO_SIGNALS.map((signal, signalIndex) => ({
      ...signal,
      status: signalIndex < currentSignalIndex ? "passed" : signalIndex === currentSignalIndex ? "next" : "upcoming",
    } as Signal)),
    [currentSignalIndex],
  );

  const currentSignal = signals.find((signal) => signal.status === "next") ?? signals.at(-1)!;
  const line = route.map((point) => [point.latitude, point.longitude] as [number, number]);

  useEffect(() => {
    let active = true;
    const loadRoute = async () => {
      try {
        const response = await fetch("/api/route", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            locations: [
              { lat: DEMO_ROUTE[0].latitude, lon: DEMO_ROUTE[0].longitude },
              { lat: DEMO_ROUTE.at(-1)!.latitude, lon: DEMO_ROUTE.at(-1)!.longitude },
            ],
          }),
        });
        if (!response.ok) throw new Error("Routing service unavailable");
        const data = (await response.json()) as RouteResponse;
        if (!data.shape?.length) throw new Error("Routing service returned no geometry");
        if (!active) return;
        setRoute(data.shape.map(({ lat, lon }) => ({ latitude: lat, longitude: lon })));
        setIndex(0);
        setRouteStatus("live");
      } catch {
        if (!active) return;
        setRoute(DEMO_ROUTE);
        setRouteStatus("fallback");
      }
    };
    void loadRoute();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setIndex((value) => {
        if (value >= route.length - 1) {
          setRunning(false);
          return value;
        }
        return value + 1;
      });
    }, 1400);
    return () => window.clearInterval(timer);
  }, [running, route.length]);

  return (
    <div className="map-frame" aria-label="Neram training simulation map">
      <MapContainer center={[position.latitude, position.longitude]} zoom={15} scrollWheelZoom zoomControl className="leaflet-map">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController position={position} />
        <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 6, opacity: 0.8 }} />
        {signals.map((item) => (
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
          <span>{routeStatus === "live" ? "OSM / Valhalla route" : routeStatus === "routing" ? "Calculating road route…" : "Demo fallback route"}</span>
        </div>
        <div className="map-kpi"><strong>{etaSeconds}s</strong><span>ETA to next signal</span></div>
      </div>

      <div className="map-overlay map-overlay-bottom">
        <div className="map-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="map-bottom-row">
          <div><b>Next signal</b><span>{currentSignal.name}</span></div>
          <div><b>{distanceRemaining} m</b><span>estimated remaining</span></div>
          <button type="button" className="map-control" onClick={() => { if (index >= route.length - 1) setIndex(0); setRunning((value) => !value); }}>{running ? "Pause" : index >= route.length - 1 ? "Replay" : "Resume"}</button>
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
