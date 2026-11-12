// apps/desktop/src/features/analysis/hooks/useInsights.ts

import { useMemo } from "react";

import type { ProcessAnalysis } from "@/features/processes/analysis/types";
import { buildInsights } from "../insights/buildInsights";
import type { Insight } from "../insights/types";

export function useInsights(analyses: ProcessAnalysis[]) {
  return useMemo(() => {
    const { insights, health } = buildInsights(analyses);
    const byId = new Map<string, Insight>(insights.map((i) => [i.id, i]));

    return { insights, health, byId };
  }, [analyses]);
}