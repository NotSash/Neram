export type OperationalMode = "training" | "operational";

export function getOperationalMode(): OperationalMode {
  return process.env.NERAM_OPERATIONAL_MODE === "operational" ? "operational" : "training";
}

export function isOperationalMode() {
  return getOperationalMode() === "operational";
}
