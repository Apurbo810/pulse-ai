// features/processes/analysis/memoryAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const MEMORY_THRESHOLDS = {
  medium: 75,
  high: 85,
  critical: 90,
} as const;

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function analyzeMemory(
  process: ProcessInfo,
  systemMemoryUsage: number
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

  // Ignore invalid values
  if (
    !Number.isFinite(systemMemoryUsage) ||
    systemMemoryUsage <= 0
  ) {
    return null;
  }

  // Ignore healthy memory usage
  if (
    systemMemoryUsage < MEMORY_THRESHOLDS.medium
  ) {
    return null;
  }

  let severity: ProcessAnalysis["severity"];

  if (
    systemMemoryUsage >= MEMORY_THRESHOLDS.critical
  ) {
    severity = "critical";
  } else if (
    systemMemoryUsage >= MEMORY_THRESHOLDS.high
  ) {
    severity = "high";
  } else {
    severity = "medium";
  }

  return {
    process,

    severity,

    title: "High Memory Usage",

    reason: [
      `System memory usage is ${systemMemoryUsage.toFixed(
        1
      )}%.`,
      `${process.name} is currently using ${formatMemory(
        process.memory
      )} of memory.`,
    ].join(" "),
  };
}

function formatMemory(
  memoryMB: number
): string {
  if (memoryMB >= 1024) {
    return `${(memoryMB / 1024).toFixed(1)} GB`;
  }

  return `${memoryMB.toFixed(0)} MB`;
}