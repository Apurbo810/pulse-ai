// apps/desktop/src/features/analysis/insights/buildInsights.ts

import type { ProcessAnalysis } from "@/features/processes/analysis/types";

import { explainAnalysis } from "./explanations";
import { buildActions, buildRecommendations } from "./recommendations";
import { priorityScore } from "./priority";
import { calculateHealthScore } from "./healthScore";
import type { HealthScore, Insight } from "./types";

export function buildInsights(analyses: ProcessAnalysis[]): {
  insights: Insight[];
  health: HealthScore;
} {
  const now = Date.now();

  const insights: Insight[] = analyses
    .map((analysis) => ({
      id: analysis.id,
      analysis,
      explanation: explainAnalysis(analysis),
      recommendations: buildRecommendations(analysis),
      actions: buildActions(analysis),
      priority: priorityScore(analysis, now),
    }))
    .sort((a, b) => b.priority - a.priority);

  return { insights, health: calculateHealthScore(analyses) };
}