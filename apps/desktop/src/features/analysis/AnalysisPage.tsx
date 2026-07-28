import { useEffect, useState } from "react";

import AnalysisCard from "./components/AnalysisCard";
import EmptyState from "./components/EmptyState";

import { analyzeProcesses } from "@/features/processes/analysis/analysisEngine";
import type { ProcessAnalysis } from "@/features/processes/analysis/types";
import { getSystemSnapshot } from "@/lib/monitor";

export default function AnalysisPage() {
  const [analyses, setAnalyses] = useState<ProcessAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAnalysis() {
    try {
      const snapshot = await getSystemSnapshot();

      const memoryUsage =
        snapshot.memory.total > 0
          ? (snapshot.memory.used / snapshot.memory.total) * 100
          : 0;

      const results = analyzeProcesses(
        snapshot.processes,
        memoryUsage
      );

      setAnalyses(results);
    } catch (error) {
      console.error("Failed to load analysis:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis();

    const interval = setInterval(loadAnalysis, 5000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <p className="text-muted-foreground">
          Loading system analysis...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          System Analysis
        </h1>

        <p className="text-muted-foreground">
          Performance and security issues detected by Pulse AI.
        </p>
      </div>

      {analyses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <AnalysisCard
              key={`${analysis.process.pid}-${analysis.title}`}
              analysis={analysis}
            />
          ))}
        </div>
      )}
    </div>
  );
}