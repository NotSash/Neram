import { NextResponse } from 'next/server';
import { buildOsmOverpassUrl } from '../../../../../../packages/geo/src/data-sources';

export type OsmSignal = {
  id: string;
  latitude: number;
  longitude: number;
  provenance: {
    source: 'osm';
    verificationStatus: 'reference';
  };
};

export async function GET() {
  try {
    const response = await fetch(buildOsmOverpassUrl(), { next: { revalidate: 1800 } });
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: 'OpenStreetMap signal reference source unavailable' }, { status: 502 });
    }

    const data = await response.json() as { elements?: Array<{ id: number; lat?: number; lon?: number }> };
    const signals: OsmSignal[] = (data.elements ?? [])
      .filter((element) => typeof element.lat === 'number' && typeof element.lon === 'number')
      .map((element) => ({
        id: `osm-${element.id}`,
        latitude: element.lat as number,
        longitude: element.lon as number,
        provenance: { source: 'osm', verificationStatus: 'reference' },
      }));

    return NextResponse.json({
      ok: true,
      source: 'OpenStreetMap / Overpass',
      verificationRequired: true,
      count: signals.length,
      signals,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unable to load signal reference data' }, { status: 502 });
  }
}
