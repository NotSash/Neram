export type GpsSample = {
  recordedAt: string | Date;
  accuracyMeters?: number | null;
  speedMps?: number | null;
};

export type GpsQuality = "good" | "degraded" | "stale" | "invalid";

export function classifyGpsSample(
  sample: GpsSample,
  now = Date.now(),
  staleAfterMs = 10_000,
): GpsQuality {
  const recordedAt = new Date(sample.recordedAt).getTime();
  if (!Number.isFinite(recordedAt) || recordedAt > now + 5_000) return "invalid";

  const age = now - recordedAt;
  if (age > staleAfterMs) return "stale";

  const accuracy = sample.accuracyMeters;
  if (accuracy !== null && accuracy !== undefined && (!Number.isFinite(accuracy) || accuracy < 0)) return "invalid";
  if (accuracy !== null && accuracy !== undefined && accuracy > 80) return "degraded";

  return "good";
}
