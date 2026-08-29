"use client";

import { useEffect, useMemo, useState } from "react";
import { evaluateSignalAlert, findUpcomingSignal } from "@neram/geo";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";

type Point = { latitude: number; longitude: number };
type Signal = Point & { id: string; name: string; status: "next" | "upcoming" | "passed" };
type RouteResponse = { distanceMeters: number; durationSeconds: number; shape: Array<{ lat: number; lon: number }> };
type SignalRecord = { id: string; name: string; latitude: number; longitude: number };

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
  const [signalsBase, setSignalsBase] = useState<SignalRecord[]>(DEMO_SIGNALS);
  const [signalsSource, setSignalsSource] = useState<"demo" | "verified">("demo");
  const [routeStatus, setRouteStatus] = useState<"routing" | "live" | "fallback">("routing");

  const position = route[Math.min(index, route.length - 1)];
  const line = route.map((point) => [point.latitude, point.longitude] as [number, number]);
  const progress = route.length > 1 ? (index / (route.length - 1)) * 100 : 0;
  const speedMps = 13.9;

  const upcoming = findUpcomingSignal(route, position, signalsBase, 160);
  const alertDecision = evaluateSignalAlert(route, position, signalsBase, speedMps, 500);

  const signals = useMemo(() => {
    const nextId = upcoming?.signal.id;
    const ambulancePassedProgress = upcoming?.distanceAheadMeters;
    return signalsBase.map((signal) => ({
      ...signal,
      status: signal.id === nextId ? "next" : ambulancePassedProgress !== undefined && signal.id !== nextId ? "upcoming" : "upcoming",
    } as Signal));
  }, [signalsBase, upcoming?.signal.id, upcoming?.distanceAheadMeters]);

  const nextSignal = signals.find((signal) => signal.status === "next") ?? signals[0];
  const distanceToSignal = alertDecision.distanceToSignalMeters ?? upcoming?.distanceAheadMeters ?? null;
  const etaSeconds = alertDecision.estimatedEtaSeconds ?? (distanceToSignal ? Math.round(distanceToSignal / speedMps) : 0);
  const atFinal = index >= route.length - 1;

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
    let active = true;
    const loadVerifiedSignals = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data, error } = await supabase.rpc("find_nearby_verified_signals", {
          latitude: position.latitude,
          longitude: position.longitude,
          radius_meters: 2500,
        });
        if (error || !active || !data?.length) return;
        setSignalsBase(data.map((signal: SignalRecord) => ({
          id: signal.id,
          name: signal.name,
          latitude: signal.latitude,
          longitude: signal.longitude,
        })));
        setSignalsSource("verified");
      } catch {
        // Missing Vercel Supabase configuration keeps the simulator on safe demo data.
      }
    };
    void loadVerifiedSignals();
    return () => {
      active = false;
    };
  }, [position.latitude, position.longitude]);

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
              color: item.status === "next" ? "#ff4d5f" : "#6f7d91",
              fillColor: item.status === "next" ? "#ff4d5f" : "#6f7d91",
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
          <span>{routeStatus === "live" ? "OSM / Valhalla route" : routeStatus === "routing" ? "Calculating road route…" : "Demo fallback route"} · {signalsSource === "verified" ? "Verified signals" : "Demo signals"}</span>
        </div>
        <div className="map-kpi"><strong>{etaSeconds}s</strong><span>ETA to {alertDecision.signal?.name ?? nextSignal?.name ?? "next signal"}</span></div>
      </div>

      {alertDecision.shouldAlert && (
        <div className="map-alert-banner" role="status">
          <span className="alert-pulse" /> <strong>POLICE ALERT WINDOW OPEN</strong>
          <span>{alertDecision.signal?.name} · {alertDecision.estimatedEtaSeconds ?? "—"}s away</span>
        </div>
      )}

      <div className="map-overlay map-overlay-bottom">
        <div className="map-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="map-bottom-row">
          <div><b>Next signal</b><span>{nextSignal?.name ?? "Route complete"}</span></div>
          <div><b>{distanceToSignal ?? "—"} m</b><span>route distance ahead</span></div>
          <button type="button" className="map-control" onClick={() => {
            if (atFinal) setIndex(0);
            setRunning((value) => !value || atFinal);
          }}>{running ? "Pause" : atFinal ? "Replay" : "Resume"}</button>
        </div>
      </div>

      <div className="map-legend">
        <span><i className="legend-dot ambulance" /> Ambulance</span>
        <span><i className="legend-dot signal" /> Next signal</span>
        <span><i className="legend-dot passed" /> Other signal</span>
        <span><i className="legend-line" /> Route</span>
      </div>
      <div className="map-disclaimer">Training simulation · {signalsSource === "verified" ? "Verified signal data" : "Demo geometry only"} · Police alert is advisory</div>
    </div>
  );
}
