// apps/desktop/src/features/analysis/components/PriorityList.tsx

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProcessAnalysis } from "@/features/processes/analysis/types";

import SeverityBadge from "../SeverityBadge";
import type { Insight } from "../insights/types";

interface PriorityListProps {
  insights: Insight[];
  onSelect: (analysis: ProcessAnalysis) => void;
  limit?: number;
}

export default function PriorityList({
  insights,
  onSelect,
  limit = 5,
}: PriorityListProps) {
  const top = insights.slice(0, limit);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Fix these first</CardTitle>
      </CardHeader>

      <CardContent>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing to fix right now.
          </p>
        ) : (
          <ol className="space-y-2">
            {top.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.analysis)}
                  className="flex w-full items-center gap-3 rounded-md border p-3 text-left transition hover:border-primary/40"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.analysis.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.analysis.process.name}
                    </p>
                  </div>

                  <SeverityBadge severity={item.analysis.severity} />
                </button>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}