import {
  AlertCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  ShieldAlert,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { ProcessAnalysis } from "@/features/processes/analysis/types";
import SeverityBadge from "../SeverityBadge";

interface AnalysisCardProps {
  analysis: ProcessAnalysis;
}

function getIcon(title: string) {
  if (title.includes("CPU")) {
    return Cpu;
  }

  if (title.includes("Memory")) {
    return MemoryStick;
  }

  if (title.includes("Disk")) {
    return HardDrive;
  }

  if (
    title.includes("Suspicious") ||
    title.includes("Impersonation")
  ) {
    return ShieldAlert;
  }

  return AlertCircle;
}

export default function AnalysisCard({
  analysis,
}: AnalysisCardProps) {
  const Icon = getIcon(analysis.title);

  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <div className="mt-1">
          <Icon className="size-6 text-primary" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">
                {analysis.title}
              </h3>

              <p className="text-sm text-muted-foreground">
                {analysis.process.name}
              </p>
            </div>

            <SeverityBadge
              severity={analysis.severity}
            />
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}