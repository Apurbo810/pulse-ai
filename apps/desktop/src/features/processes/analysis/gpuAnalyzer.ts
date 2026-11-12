// apps/desktop/src/features/processes/analysis/gpuAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { Finding } from "./types";
import { classify, isIgnored } from "./shared";

const GPU_THRESHOLDS = { medium: 30, high: 60, critical: 90 } as const;

export function analyzeGpu(p: ProcessInfo): Finding | null {
  if (isIgnored(p)) return null;

  const gpu = p.gpu ?? 0;
  const severity = classify(gpu, GPU_THRESHOLDS);
  if (!severity) return null;

  return {
    process: p,
    severity,
    category: "gpu",
    title: "High GPU Usage",
    reason: `${p.name} is using ${gpu.toFixed(1)}% of GPU resources.`,
  };
}