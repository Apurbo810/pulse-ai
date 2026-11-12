// apps/desktop/src/features/processes/analysis/memoryAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { AnalysisContext, Finding } from "./types";
import { classify, isIgnored } from "./shared";

// Share of total RAM used by a single process (%)
const MEMORY_SHARE_THRESHOLDS = {
  medium: 10,
  high: 20,
  critical: 35,
} as const;

// Only report when the whole system is under memory pressure
const SYSTEM_MEMORY_GATE = 75;

function formatMemory(memoryMB: number): string {
  if (memoryMB >= 1024) return `${(memoryMB / 1024).toFixed(1)} GB`;
  return `${memoryMB.toFixed(0)} MB`;
}

export function analyzeMemory(
  p: ProcessInfo,
  ctx: AnalysisContext
): Finding | null {
  if (isIgnored(p)) return null;
  if (ctx.totalMemoryMB <= 0) return null;
  if (ctx.memoryUsagePercent < SYSTEM_MEMORY_GATE) return null;

  const share = (p.memory / ctx.totalMemoryMB) * 100;
  const severity = classify(share, MEMORY_SHARE_THRESHOLDS);
  if (!severity) return null;

  return {
    process: p,
    severity,
    category: "memory",
    title: "High Memory Usage",
    reason: `${p.name} is using ${formatMemory(p.memory)} (${share.toFixed(
      1
    )}% of RAM) while system memory is at ${ctx.memoryUsagePercent.toFixed(
      0
    )}%.`,
  };
}