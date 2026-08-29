"use client";

import { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Point = { latitude: number; longitude: number };
type Signal = Point & { id: string; name: string };

const DEMO_SIGNALS: Signal[] = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098 },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122 },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148 },
];

const ROUTE: Point[] = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0470, longitude: 80.2092 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0490, longitude: 80.2113 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0514, longitude: 80.2138 },
  { latitude: 13.0527, longitude: 80.2153 },
];

function Recenter({ position }: { position: Point }) {
  const map = useMap();
  useEffect(() => {
    map.setView([position.latitude, position.longitude], 15, { animate: true });
  }, [map, position.latitude, position.longitude]);
  return null;
}

export default function MapView() {
  const [index, setIndex] = useState(0);
  const position = ROUTE[index];
  const signal = DEMO_SIGNALS[Math.min(Math.floor(index / 2), DEMO_SIGNALS.length - 1)];
  const line = ROUTE.map((point) => [point.latitude, point.longitude] as [number, number]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((value) => (value + 1) % ROUTE.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="map-frame" aria-label="Neram simulation map">
      <MapContainer
        center={[position.latitude, position.longitude]}
        zoom={15}
        scrollWheelZoom
        zoomControl={false}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter position={position} />
        <Polyline positions={line} pathOptions={{ color: "#1f6fff", weight: 5, opacity: 0.8 }} />
        {DEMO_SIGNALS.map((item) => (
          <CircleMarker
            key={item.id}
            center={[item.latitude, item.longitude]}
            radius={8}
            pathOptions={{ color: item.id === signal.id ? "#ff4d5f" : "#7d8798", fillOpacity: 0.95, weight: 2 }}
          >
            <Tooltip direction="top">{item.name}</Tooltip>
          </CircleMarker>
        ))}
        <CircleMarker
          center={[position.latitude, position.longitude]}
          radius={11}
          pathOptions={{ color: "#ffffff", fillColor: "#ff4d5f", fillOpacity: 1, weight: 3 }}
        >
          <Tooltip direction="top" permanent>AMB-DEMO-01</Tooltip>
        </CircleMarker>
      </MapContainer>
      <div className="map-legend">
        <span><i className="legend-dot ambulance" /> Ambulance</span>
        <span><i className="legend-dot signal" /> Signal</span>
        <span><i className="legend-line" /> Route</span>
      </div>
      <div className="map-disclaimer">Training simulation · Demo geometry only</div>
    </div>
  );
}
