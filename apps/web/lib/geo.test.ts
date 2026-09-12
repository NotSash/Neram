import assert from "node:assert/strict";
import test from "node:test";
// Node's built-in test runner executes this TypeScript file directly with --experimental-strip-types.
// @ts-ignore TS5097 is specific to the test runner import and does not affect the production bundle.
import { evaluateSignalAlert, findUpcomingSignal } from "./geo.ts";

const route = [
  { latitude: 13.0458, longitude: 80.2079 },
  { latitude: 13.0466, longitude: 80.2087 },
  { latitude: 13.0472, longitude: 80.2094 },
  { latitude: 13.0479, longitude: 80.2103 },
  { latitude: 13.0486, longitude: 80.2110 },
  { latitude: 13.0494, longitude: 80.2118 },
  { latitude: 13.0503, longitude: 80.2127 },
  { latitude: 13.0511, longitude: 80.2134 },
  { latitude: 13.0520, longitude: 80.2145 },
  { latitude: 13.0527, longitude: 80.2153 },
] as const;

const signals = [
  { id: "signal-a", name: "Demo Signal A", latitude: 13.0474, longitude: 80.2098 },
  { id: "signal-b", name: "Demo Signal B", latitude: 13.0498, longitude: 80.2122 },
  { id: "signal-c", name: "Demo Signal C", latitude: 13.0522, longitude: 80.2148 },
] as const;

test("findUpcomingSignal selects the forward signal on the route", () => {
  const result = findUpcomingSignal(route, route[1], signals, 160);
  assert.equal(result?.signal.id, "signal-a");
  assert.ok((result?.distanceAheadMeters ?? 0) > 0);
});

test("findUpcomingSignal ignores signals behind the ambulance", () => {
  const result = findUpcomingSignal(route, route[6], signals, 160);
  assert.equal(result?.signal.id, "signal-c");
});

test("off-route signals are rejected", () => {
  const result = findUpcomingSignal(route, route[2], [
    { id: "far", name: "Far", latitude: 13.0474, longitude: 80.2200 },
  ], 160);
  assert.equal(result, null);
});

test("alert opens only inside the configured ETA window", () => {
  const beforeWindow = evaluateSignalAlert(route, route[0], signals, 13.9, 50);
  assert.equal(beforeWindow.shouldAlert, false);

  const insideWindow = evaluateSignalAlert(route, route[1], signals, 13.9, 500);
  assert.equal(insideWindow.shouldAlert, true);
  assert.equal(insideWindow.signal?.id, "signal-a");
  assert.ok((insideWindow.estimatedEtaSeconds ?? 0) > 0);
});

test("stopped ambulance has no false ETA", () => {
  const result = evaluateSignalAlert(route, route[1], signals, 0, 500);
  assert.equal(result.shouldAlert, true);
  assert.equal(result.estimatedEtaSeconds, null);
});
