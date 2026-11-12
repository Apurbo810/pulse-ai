// apps/desktop/src/features/analysis/hooks/useAnalysis.ts

import { useCallback, useEffect, useRef, useState } from "react";

import { analyzeProcesses } from "@/features/processes/analysis/analysisEngine";
import type { ProcessAnalysis } from "@/features/processes/analysis/types";

export function useAnalysis(intervalMs = 3000) {
  const [analyses, setAnalyses] = useState<ProcessAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const busy = useRef(false);

  const refresh = useCallback(async () => {
    if (busy.current) return; // skip overlapping requests
    busy.current = true;

    try {
      const [processes, memory] = await Promise.all([
        window.system.getProcesses(),
        window.system.getMemory(),
      ]);

      setAnalyses(
        analyzeProcesses(processes, {
          totalMemoryMB: memory.total / 1024 / 1024,
          memoryUsagePercent:
            memory.total > 0 ? (memory.used / memory.total) * 100 : 0,
        })
      );
      setLastUpdated(Date.now());
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (intervalMs <= 0) return; // 0 = manual refresh only

    void refresh();

    const timer = setInterval(() => {
      if (!document.hidden) void refresh(); // pause while window is hidden
    }, intervalMs);

    return () => clearInterval(timer);
  }, [refresh, intervalMs]);

  return { analyses, loading, lastUpdated, refresh };
}