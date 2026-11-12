// apps/desktop/src/features/processes/analysis/types.ts

import type { ProcessInfo } from "@/types/system";

export type AnalysisSeverity = "low" | "medium" | "high" | "critical";

export type AnalysisCategory =
  | "cpu"
  | "memory"
  | "gpu"
  | "disk"
  | "suspicious";

export interface ProcessAnalysis {
  id: string; // stable key: category:title:pid
  category: AnalysisCategory;
  process: ProcessInfo;
  severity: AnalysisSeverity;
  title: string;
  reason: string;
  detectedAt: number; // when this issue first appeared (ms)
}

// What an analyzer returns. The engine adds `id` and `detectedAt`.
export type Finding = Omit<ProcessAnalysis, "id" | "detectedAt">;

export interface AnalysisContext {
  totalMemoryMB: number;
  memoryUsagePercent: number;
}