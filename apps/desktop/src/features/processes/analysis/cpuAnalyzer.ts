// apps/desktop/src/features/processes/analysis/cpuAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { Finding } from "./types";
import { classify, isIgnored } from "./shared";

const CPU_THRESHOLDS = { medium: 20, high: 50, critical: 80 } as const;

export function analyzeCpu(p: ProcessInfo): Finding | null {
  if (isIgnored(p)) return null;

  const severity = classify(p.cpu, CPU_THRESHOLDS);
  if (!severity) return null;

  return {
    process: p,
    severity,
    category: "cpu",
    title: "High CPU Usage",
    reason: `${p.name} is using ${p.cpu.toFixed(1)}% of CPU.`,
  };
}