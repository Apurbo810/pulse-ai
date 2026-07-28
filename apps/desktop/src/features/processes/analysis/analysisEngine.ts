import type { ProcessInfo } from "@/types/system";

import { analyzeCpu } from "./cpuAnalyzer";
import { analyzeMemory } from "./memoryAnalyzer";
import { analyzeGpu } from "./gpuAnalyzer";
import { analyzeDisk } from "./diskAnalyzer";
import { analyzeSuspicious } from "./suspiciousAnalyzer";

import type { ProcessAnalysis } from "./types";

export function analyzeProcesses(
  processes: ProcessInfo[],
  systemMemoryUsage: number
): ProcessAnalysis[] {
  const analyses: ProcessAnalysis[] = [];

  for (const process of processes) {
    const results = [
      analyzeCpu(process),
      analyzeMemory(process, systemMemoryUsage),
      analyzeGpu(process),
      analyzeDisk(process),
      analyzeSuspicious(process),
    ];

    analyses.push(
      ...results.filter(
        (result): result is ProcessAnalysis => result !== null
      )
    );
  }

  return analyses;
}