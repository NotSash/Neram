export const CHENNAI_GCC_ROADS_URL =
  'https://gisgcc.chennaicorporation.gov.in/server/rest/services/GCCDepts/EDPMobile2025/FeatureServer/0/query';

export const OSM_CHENNAI_SIGNALS_QUERY = `
[out:json][timeout:60];
(
  node[highway=traffic_signals](12.80,80.05,13.30,80.40);
);
out body;
`;

export type SignalVerificationStatus = 'reference' | 'verified' | 'retired';

export type SignalProvenance = {
  source: 'osm' | 'gcc' | 'manual';
  sourceId: string;
  importedAt: string;
  verificationStatus: SignalVerificationStatus;
  verificationNotes?: string;
};

export type ReferenceSignal = {
  sourceId: string;
  latitude: number;
  longitude: number;
  name: string;
  provenance: SignalProvenance;
};

export function buildGccRoadQuery(limit = 1000) {
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

export function buildOsmOverpassUrl() {
  return `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(OSM_CHENNAI_SIGNALS_QUERY)}`;
}
