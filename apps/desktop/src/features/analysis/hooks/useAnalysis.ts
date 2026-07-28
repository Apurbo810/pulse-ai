import { useEffect, useState } from "react";

import {
  startMonitoring,
  subscribeMonitoring,
} from "@/lib/monitor";

import { analyzeProcesses } from "@/features/processes/analysis/analysisEngine";
import type { ProcessAnalysis } from "@/features/processes/analysis/types";

export function useAnalysis() {
  const [analyses, setAnalyses] = useState<ProcessAnalysis[]>([]);

  useEffect(() => {
    startMonitoring();

    const unsubscribe = subscribeMonitoring((snapshot) => {
      const memoryUsage =
        (snapshot.memory.used / snapshot.memory.total) * 100;

      const result = analyzeProcesses(
        snapshot.processes,
        memoryUsage
      );

      setAnalyses(result);
    });

    return unsubscribe;
  }, []);

  return analyses;
}