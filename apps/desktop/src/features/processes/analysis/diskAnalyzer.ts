// features/processes/analysis/diskAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const DISK_THRESHOLDS = {
  medium: 10,
  high: 50,
  critical: 100,
} as const;

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function analyzeDisk(
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

    const disk = process.disk;

    if (
    disk === undefined ||
    !Number.isFinite(disk) ||
    disk <= 0
    ) {
    return null;
    }

  if (disk < DISK_THRESHOLDS.medium) {
    return null;
  }

  let severity: ProcessAnalysis["severity"];

  if (disk >= DISK_THRESHOLDS.critical) {
    severity = "critical";
  } else if (disk >= DISK_THRESHOLDS.high) {
    severity = "high";
  } else {
    severity = "medium";
  }

  return {
    process,

    severity,

    title: "High Disk Activity",

    reason: `${process.name} is currently reading or writing ${disk.toFixed(
      1
    )} MB/s of disk activity.`,
  };
}