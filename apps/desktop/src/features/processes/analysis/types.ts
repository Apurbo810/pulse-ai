// features/processes/analysis/types.ts

import type { ProcessInfo } from "@/types/system";

export type AnalysisSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface ProcessAnalysis {
  process: ProcessInfo;

  severity: AnalysisSeverity;

  title: string;

  reason: string;

  recommendation: string;
}