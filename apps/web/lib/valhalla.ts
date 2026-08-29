export type RoutePoint = { lat: number; lon: number };

export type ValhallaRoute = {
  distanceMeters: number;
  durationSeconds: number;
  shape: RoutePoint[];
};

const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de";

type ValhallaGeoJson = {
  type?: "LineString";
  coordinates?: Array<[number, number]>;
};

function decodePolyline6(encoded: string): RoutePoint[] {
  const points: RoutePoint[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      if (index >= encoded.length) throw new Error("Invalid Valhalla polyline");
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      if (index >= encoded.length) throw new Error("Invalid Valhalla polyline");
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLon = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;
    lon += deltaLon;
    points.push({ lat: lat / 1e6, lon: lon / 1e6 });
  }

  return points;
}

function extractLegShape(shape: unknown): RoutePoint[] {
  if (typeof shape === "string") return decodePolyline6(shape);

  const geojson = shape as ValhallaGeoJson | null;
  if (geojson?.type === "LineString" && Array.isArray(geojson.coordinates)) {
    return geojson.coordinates
      .filter((coordinate): coordinate is [number, number] => Array.isArray(coordinate) && coordinate.length >= 2)
      .map(([lon, lat]) => ({ lat, lon }));
  }

  return [];
}

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
      shape_format: "polyline6",
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

  const shape = (data.trip?.legs ?? []).flatMap((leg) => extractLegShape(leg.shape));

  return {
    distanceMeters: summary.length * 1000,
    durationSeconds: summary.time,
    shape,
  };
}
