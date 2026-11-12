// apps/desktop/src/features/processes/analysis/analysisEngine.ts

import type { ProcessInfo } from "@/types/system";

import { analyzeCpu } from "./cpuAnalyzer";
import { analyzeMemory } from "./memoryAnalyzer";
import { analyzeGpu } from "./gpuAnalyzer";
import { analyzeDisk } from "./diskAnalyzer";
import { analyzeSuspicious } from "./suspiciousAnalyzer";
import { SEVERITY_ORDER } from "./shared";

import type {
  AnalysisCategory,
  AnalysisContext,
  Finding,
  ProcessAnalysis,
} from "./types";

// Consecutive samples an issue must persist before it is reported
const SUSTAIN: Record<AnalysisCategory, number> = {
  cpu: 3,
  gpu: 3,
  disk: 3,
  memory: 2,
  suspicious: 1,
};

const streaks = new Map<string, { count: number; since: number }>();

export function analyzeProcesses(
  processes: ProcessInfo[],
  ctx: AnalysisContext
): ProcessAnalysis[] {
  const now = Date.now();
  const seen = new Set<string>();
  const results: ProcessAnalysis[] = [];

  for (const proc of processes) {
    const findings = [
      analyzeCpu(proc),
      analyzeMemory(proc, ctx),
      analyzeGpu(proc),
      analyzeDisk(proc),
      analyzeSuspicious(proc),
    ].filter((f): f is Finding => f !== null);

    for (const finding of findings) {
      const id = `${finding.category}:${finding.title}:${proc.pid}`;
      seen.add(id);

      const streak = streaks.get(id) ?? { count: 0, since: now };
      streak.count += 1;
      streaks.set(id, streak);

      if (streak.count >= SUSTAIN[finding.category]) {
        results.push({ ...finding, id, detectedAt: streak.since });
      }
    }
  }

  // Forget issues that are no longer present
  for (const id of [...streaks.keys()]) {
    if (!seen.has(id)) streaks.delete(id);
  }

  return results.sort(
    (a, b) =>
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );
}