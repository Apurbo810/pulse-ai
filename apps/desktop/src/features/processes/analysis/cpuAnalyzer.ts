// features/processes/analysis/cpuAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const CPU_THRESHOLDS = {
  medium: 20,
  high: 50,
  critical: 80,
} as const;

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function analyzeCpu(
  process: ProcessInfo
): ProcessAnalysis | null {
  const normalizedName = process.name
    .trim()
    .toLowerCase();

  // Ignore Windows internal processes
  if (
    process.pid === 0 ||
    IGNORED_PROCESSES.has(normalizedName)
  ) {
    return null;
  }

  const cpu = process.cpu;

  // Ignore invalid values
  if (!Number.isFinite(cpu) || cpu <= 0) {
    return null;
  }

  // Ignore healthy processes
  if (cpu < CPU_THRESHOLDS.medium) {
    return null;
  }

  let severity: ProcessAnalysis["severity"];

  if (cpu >= CPU_THRESHOLDS.critical) {
    severity = "critical";
  } else if (cpu >= CPU_THRESHOLDS.high) {
    severity = "high";
  } else {
    severity = "medium";
  }

  return {
    process,

    severity,

    title: "High CPU Usage",

    reason: [
      `${process.name} is currently consuming ${cpu.toFixed(1)}% of CPU resources.`,
      `This exceeds the ${CPU_THRESHOLDS.medium}% analysis threshold.`,
    ].join(" "),
  };
}