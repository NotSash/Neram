export type MatchPoint = { lat: number; lon: number };

const DEFAULT_VALHALLA_URL = "https://valhalla1.openstreetmap.de";

export type MatchedRoute = {
  shape: MatchPoint[];
  confidence: number | null;
};

type MatchResponse = {
  matchings?: Array<{
    confidence?: number;
    shape?: string;
  }>;
};

function decodePolyline6(encoded: string): MatchPoint[] {
  const points: MatchPoint[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;
    do {
      if (index >= encoded.length) throw new Error("Invalid map-match polyline");
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      if (index >= encoded.length) throw new Error("Invalid map-match polyline");
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    lon += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e6, lon: lon / 1e6 });
  }

  return points;
}

export async function mapMatchTrace(trace: MatchPoint[]): Promise<MatchedRoute> {
  if (trace.length < 2) throw new Error("A trace requires at least two points");

  const baseUrl = process.env.VALHALLA_BASE_URL || DEFAULT_VALHALLA_URL;
  const response = await fetch(`${baseUrl}/trace_route`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      shape: trace.map(({ lat, lon }) => ({ lat, lon })),
      costing: "auto",
      shape_match: "map_snap",
      units: "kilometers",
      linear_references: true,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Valhalla map matching returned ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = (await response.json()) as MatchResponse;
  const first = data.matchings?.[0];
  if (!first?.shape) throw new Error("Valhalla returned no matched geometry");

  return {
    shape: decodePolyline6(first.shape),
    confidence: typeof first.confidence === "number" ? first.confidence : null,
  };
}
