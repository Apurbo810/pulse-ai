// features/processes/analysis/gpuAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const GPU_THRESHOLDS = {
  medium: 30,
  high: 60,
  critical: 90,
} as const;

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function analyzeGpu(
  process: ProcessInfo
): ProcessAnalysis | null {
  const normalizedName = process.name
    .trim()
    .toLowerCase();

  if (
    process.pid === 0 ||
    IGNORED_PROCESSES.has(normalizedName)
  ) {
    return null;
  }

    const gpu = process.gpu;

    if (
    gpu === undefined ||
    !Number.isFinite(gpu) ||
    gpu <= 0
    ) {
    return null;
    }

  if (gpu < GPU_THRESHOLDS.medium) {
    return null;
  }

  let severity: ProcessAnalysis["severity"];

  if (gpu >= GPU_THRESHOLDS.critical) {
    severity = "critical";
  } else if (gpu >= GPU_THRESHOLDS.high) {
    severity = "high";
  } else {
    severity = "medium";
  }

  return {
    process,

    severity,

    title: "High GPU Usage",

    reason: `${process.name} is currently using ${gpu.toFixed(
      1
    )}% of GPU resources.`,
  };
}