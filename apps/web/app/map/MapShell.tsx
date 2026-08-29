"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => <div className="map-loading">Loading live map…</div> });

export default function MapShell() {
  return <MapView />;
}
