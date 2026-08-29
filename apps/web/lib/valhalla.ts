export type RoutePoint = { lat: number; lon: number };

export type ValhallaRoute = {
  distanceMeters: number;
  durationSeconds: number;
  shape: RoutePoint[];
};

const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de";

export async function getDrivingRoute(locations: RoutePoint[]): Promise<ValhallaRoute> {
  if (locations.length < 2) {
    throw new Error("A route requires at least two locations");
  }

  const baseUrl = process.env.VALHALLA_BASE_URL || DEFAULT_VALHALLA_URL;
  const response = await fetch(`${baseUrl}/route`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-client-id": "neram-chennai.vercel.app",
    },
    body: JSON.stringify({
      locations: locations.map(({ lat, lon }) => ({ lat, lon, type: "break" })),
      costing: "auto",
      units: "kilometers",
      shape_format: "geojson",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Valhalla returned ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = (await response.json()) as {
    trip?: {
      summary?: { length?: number; time?: number };
      legs?: Array<{ shape?: unknown }>;
    };
  };

  const summary = data.trip?.summary;
  if (!summary || typeof summary.length !== "number" || typeof summary.time !== "number") {
    throw new Error("Valhalla returned an incomplete route");
  }

  return {
    distanceMeters: summary.length * 1000,
    durationSeconds: summary.time,
    shape: [],
  };
}
