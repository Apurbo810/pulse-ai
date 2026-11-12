// apps/desktop/src/features/analysis/insights/priority.ts

import type { ProcessAnalysis } from "@/features/processes/analysis/types";
import type { AnalysisSeverity } from "@/features/processes/analysis/types";

const SEVERITY_WEIGHT: Record<AnalysisSeverity, number> = {
  critical: 100,
  high: 60,
  medium: 30,
  low: 10,
};

/**
 * Higher score = fix first.
 * Severity matters most, then how long the issue has lasted (up to 10 minutes
 * of bonus), and security issues get a small boost.
 */
export function priorityScore(a: ProcessAnalysis, now: number): number {
  const minutes = Math.max(0, (now - a.detectedAt) / 60_000);
  const durationBonus = Math.min(minutes, 10);
  const securityBonus = a.category === "suspicious" ? 15 : 0;

  return SEVERITY_WEIGHT[a.severity] + durationBonus + securityBonus;
}