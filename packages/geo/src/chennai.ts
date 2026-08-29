import { CHENNAI_GCC_ROADS_URL, type ReferenceSignal } from './data-sources';

export type GccRoadFeature = {
  type: 'Feature';
  properties: {
    road_id: string | null;
    road_name: string | null;
    locality: string | null;
    area_name: string | null;
    address: string | null;
    latitude: string | null;
    longitude: string | null;
  };
  geometry: {
    type: 'LineString' | 'MultiLineString';
    coordinates: number[][] | number[][][];
  };
};

export type GccRoadResponse = {
  type: 'FeatureCollection';
  features: GccRoadFeature[];
};

export function buildGccRoadsUrl(limit = 1000) {
  const params = new URLSearchParams({
    where: '1=1',
    outFields: 'road_id,road_name,locality,area_name,address,latitude,longitude',
    returnGeometry: 'true',
    outSR: '4326',
    resultRecordCount: String(limit),
    f: 'geojson',
  });

  return `${CHENNAI_GCC_ROADS_URL}?${params.toString()}`;
}

export function mapReferenceSignal(sourceId: string, name: string, latitude: number, longitude: number, importedAt = new Date().toISOString()): ReferenceSignal {
  return {
    sourceId,
    name,
    latitude,
    longitude,
    provenance: {
      source: 'osm',
      sourceId,
      importedAt,
      verificationStatus: 'reference',
    },
  };
}
