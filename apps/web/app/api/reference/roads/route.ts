import { NextResponse } from 'next/server';
import { buildGccRoadsUrl, type GccRoadResponse } from '../../../../../../packages/geo/src/chennai';

export async function GET() {
  try {
    const response = await fetch(buildGccRoadsUrl(500), { next: { revalidate: 3600 } });
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: 'Chennai road source unavailable' }, { status: 502 });
    }

    const data = (await response.json()) as GccRoadResponse;
    return NextResponse.json({
      ok: true,
      source: 'Greater Chennai Corporation EDP_Roads_2025',
      data,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Unable to load Chennai road data' }, { status: 502 });
  }
}
