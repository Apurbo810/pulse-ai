import type { ProcessInfo } from "@/types/system";
import type {
  AnalysisCategory,
  AnalysisSeverity,
  ProcessAnalysis,
} from "@/features/processes/analysis/types";

export function makeProcessInfo(
  overrides: Partial<ProcessInfo> = {},
): ProcessInfo {
  return {
    pid: 1000,
    name: "app.exe",
    cpu: 0,
    gpu: 0,
    disk: 0,
    memory: 100,
    executablePath: "C:\\Program Files\\App\\app.exe",
    isCritical: false,
    ...overrides,
  };
}

export function makeProcessAnalysis(
  overrides: Partial<ProcessAnalysis> = {},
): ProcessAnalysis {
  return {
    id: "cpu:High CPU Usage:1000",
    category: "cpu" as AnalysisCategory,
    process: makeProcessInfo(),
    severity: "medium" as AnalysisSeverity,
    title: "High CPU Usage",
    reason: "The process is using significant CPU.",
    detectedAt: 0,
    ...overrides,
  };
}
