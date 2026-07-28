import { Badge } from "@/components/ui/badge";

import type { AnalysisSeverity } from "@/features/processes/analysis/types";

interface SeverityBadgeProps {
  severity: AnalysisSeverity;
}

const severityConfig: Record<
  AnalysisSeverity,
  {
    label: string;
    className: string;
  }
> = {
  critical: {
    label: "Critical",
    className:
      "bg-red-500/10 text-red-500 border-red-500/20",
  },

  high: {
    label: "High",
    className:
      "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },

  medium: {
    label: "Medium",
    className:
      "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },

  low: {
    label: "Low",
    className:
      "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
};

export default function SeverityBadge({
  severity,
}: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <Badge
      variant="outline"
      className={config.className}
    >
      {config.label}
    </Badge>
  );
}   
