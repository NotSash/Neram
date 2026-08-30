import { NextResponse } from "next/server";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const QUERY = `
[out:json][timeout:60];
area["name"="Chennai"]["boundary"="administrative"]->.chennai;
(
  nwr["highway"="traffic_signals"](area.chennai);
);
out center tags;
`;

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(QUERY)}`, {
      headers: { "user-agent": "Neram-Chennai/0.1 (+https://neram-chennai.vercel.app)" },
      next: { revalidate: 3600 },
      signal: controller.signal,
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Signal source returned ${response.status}` }, { status: 502 });
    }

    const data = (await response.json()) as { elements?: OverpassElement[] };
    const signals = (data.elements ?? [])
      .map((element) => {
        const latitude = element.lat ?? element.center?.lat;
        const longitude = element.lon ?? element.center?.lon;
        if (typeof latitude !== "number" || typeof longitude !== "number") return null;
        return {
          source: "openstreetmap",
          sourceRef: `${element.type}/${element.id}`,
          verificationStatus: "unverified",
          latitude,
          longitude,
          name: element.tags?.name ?? `OSM signal ${element.id}`,
          tags: element.tags ?? {},
        };
      })
      .filter(Boolean);

    return NextResponse.json(
      { count: signals.length, signals },
      { headers: { "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch (error) {
    console.error("Neram signal candidate error", error);
    return NextResponse.json({ error: "Signal candidate source unavailable" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}
