// apps/desktop/src/features/analysis/insights/priority.ts

import type {
  AnalysisSeverity,
  ProcessAnalysis,
} from "@/features/processes/analysis/types";

const SEVERITY_WEIGHT: Record<AnalysisSeverity, number> = {
  critical: 100,
  high: 60,
  medium: 30,
  low: 10,
};

// The largest gap between two severity weights is 20 (medium vs low).
// The bonuses below add up to 15 at most, so severity always wins and the
// bonuses only break ties between issues of the same severity.
const MAX_DURATION_BONUS = 5;
const SECURITY_BONUS = 10;

/**
 * Higher score = fix first.
 * Severity decides the order. Within the same severity, issues that have lasted
 * longer (up to 10 minutes) and security issues come first.
 */
export function priorityScore(a: ProcessAnalysis, now: number): number {
  const minutes = Math.max(0, (now - a.detectedAt) / 60_000);
  const durationBonus = Math.min(minutes / 2, MAX_DURATION_BONUS);
  const securityBonus = a.category === "suspicious" ? SECURITY_BONUS : 0;

  return SEVERITY_WEIGHT[a.severity] + durationBonus + securityBonus;
}