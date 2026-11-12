// apps/desktop/src/features/analysis/components/AnalysisCard.tsx

import {
  AlertCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type {
  AnalysisCategory,
  ProcessAnalysis,
} from "@/features/processes/analysis/types";
import SeverityBadge from "../SeverityBadge";

interface AnalysisCardProps {
  analysis: ProcessAnalysis;
  onSelect: (analysis: ProcessAnalysis) => void;
}

const categoryIcons: Record<AnalysisCategory, typeof AlertCircle> = {
  cpu: Cpu,
  memory: MemoryStick,
  gpu: Monitor,
  disk: HardDrive,
  suspicious: ShieldAlert,
};

export default function AnalysisCard({
  analysis,
  onSelect,
}: AnalysisCardProps) {
  const Icon = categoryIcons[analysis.category] ?? AlertCircle;

  return (
    <Card
      className="cursor-pointer transition hover:border-primary/40"
      onClick={() => onSelect(analysis)}
    >
      <CardContent className="flex gap-4 p-5">
        <div className="mt-1">
          <Icon className="size-6 text-primary" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{analysis.title}</h3>

              <p className="text-sm text-muted-foreground">
                {analysis.process.name} · since{" "}
                {new Date(analysis.detectedAt).toLocaleTimeString()}
              </p>
            </div>

            <SeverityBadge severity={analysis.severity} />
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}