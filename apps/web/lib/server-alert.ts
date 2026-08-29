import { evaluateSignalAlert as evaluate } from "./geo";

export function evaluateSignalAlert(
  route: Parameters<typeof evaluate>[0],
  position: Parameters<typeof evaluate>[1],
  signals: Parameters<typeof evaluate>[2],
  speedMps: Parameters<typeof evaluate>[3],
  triggerDistanceMeters = 500,
) {
  return evaluate(route, position, signals, speedMps, triggerDistanceMeters);
}
