// apps/desktop/src/features/analysis/insights/types.ts

import type { ProcessAnalysis } from "@/features/processes/analysis/types";

export type RecommendationType = "performance" | "security" | "gaming";
export type ActionKind = "openLocation" | "endTask";

export interface Recommendation {
  type: RecommendationType;
  text: string;
}

export interface InsightAction {
  kind: ActionKind;
  label: string;
}

export interface Insight {
  id: string; // same as analysis.id
  analysis: ProcessAnalysis;
  explanation: string;
  recommendations: Recommendation[];
  actions: InsightAction[];
  priority: number; // higher = fix first
}

export type HealthLabel =
  | "Excellent"
  | "Good"
  | "Needs attention"
  | "Poor"
  | "Critical";

export interface HealthScore {
  score: number; // 0-100
  label: HealthLabel;
  summary: string;
}