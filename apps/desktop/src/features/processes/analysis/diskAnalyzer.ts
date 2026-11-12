// apps/desktop/src/features/processes/analysis/diskAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { Finding } from "./types";
import { classify, isIgnored } from "./shared";

// Thresholds in MB/s
const DISK_THRESHOLDS = { medium: 10, high: 50, critical: 100 } as const;

export function analyzeDisk(p: ProcessInfo): Finding | null {
  if (isIgnored(p)) return null;

  // process.disk is in bytes per second
  const mbPerSec = (p.disk ?? 0) / 1024 / 1024;
  const severity = classify(mbPerSec, DISK_THRESHOLDS);
  if (!severity) return null;

  return {
    process: p,
    severity,
    category: "disk",
    title: "High Disk Activity",
    reason: `${p.name} is reading or writing ${mbPerSec.toFixed(1)} MB/s.`,
  };
}