// apps/desktop/src/features/processes/analysis/shared.ts

import type { ProcessInfo } from "@/types/system";
import type { AnalysisSeverity } from "./types";

export type Thresholds = {
  medium: number;
  high: number;
  critical: number;
};

export const SEVERITY_ORDER: AnalysisSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

export function classify(
  value: number,
  t: Thresholds
): AnalysisSeverity | null {
  if (!Number.isFinite(value)) return null;
  if (value >= t.critical) return "critical";
  if (value >= t.high) return "high";
  if (value >= t.medium) return "medium";
  return null;
}

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function isIgnored(p: ProcessInfo): boolean {
  return (
    p.pid === 0 ||
    p.pid === 4 ||
    IGNORED_PROCESSES.has(p.name.trim().toLowerCase())
  );
}