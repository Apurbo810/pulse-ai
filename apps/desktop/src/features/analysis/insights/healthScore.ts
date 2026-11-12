// apps/desktop/src/features/analysis/insights/healthScore.ts

import type {
  AnalysisSeverity,
  ProcessAnalysis,
} from "@/features/processes/analysis/types";
import type { HealthLabel, HealthScore } from "./types";

// Points removed per issue, and the most each severity can remove in total.
// The caps stop a long list of minor notices from zeroing the score.
const RULES: Record<AnalysisSeverity, { perIssue: number; max: number }> = {
  critical: { perIssue: 20, max: 50 },
  high: { perIssue: 10, max: 30 },
  medium: { perIssue: 4, max: 15 },
  low: { perIssue: 1, max: 5 },
};

function labelFor(score: number): HealthLabel {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs attention";
  if (score >= 25) return "Poor";
  return "Critical";
}

export function calculateHealthScore(analyses: ProcessAnalysis[]): HealthScore {
  const counts: Record<AnalysisSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  analyses.forEach((a) => {
    counts[a.severity] += 1;
  });

  let penalty = 0;
  (Object.keys(RULES) as AnalysisSeverity[]).forEach((s) => {
    penalty += Math.min(counts[s] * RULES[s].perIssue, RULES[s].max);
  });

  const score = Math.max(0, 100 - penalty);

  if (analyses.length === 0) {
    return {
      score,
      label: labelFor(score),
      summary: "No performance or security issues detected.",
    };
  }

  const parts = [
    `${analyses.length} issue${analyses.length === 1 ? "" : "s"} found`,
  ];
  if (counts.critical > 0) parts.push(`${counts.critical} critical`);
  if (counts.high > 0) parts.push(`${counts.high} high`);

  return { score, label: labelFor(score), summary: `${parts.join(", ")}.` };
}