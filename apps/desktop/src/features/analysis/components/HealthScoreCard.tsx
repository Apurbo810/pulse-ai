// apps/desktop/src/features/analysis/components/HealthScoreCard.tsx

import { Card, CardContent } from "@/components/ui/card";
import type { HealthLabel, HealthScore } from "../insights/types";

const styles: Record<HealthLabel, { text: string; bar: string }> = {
  Excellent: { text: "text-green-500", bar: "bg-green-500" },
  Good: { text: "text-emerald-500", bar: "bg-emerald-500" },
  "Needs attention": { text: "text-yellow-500", bar: "bg-yellow-500" },
  Poor: { text: "text-orange-500", bar: "bg-orange-500" },
  Critical: { text: "text-red-500", bar: "bg-red-500" },
};

export default function HealthScoreCard({ health }: { health: HealthScore }) {
  const s = styles[health.label];

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          System health
        </p>

        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-bold ${s.text}`}>{health.score}</span>
          <span className="text-muted-foreground">/ 100</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full ${s.bar}`}
            style={{ width: `${health.score}%` }}
          />
        </div>

        <p className={`text-sm font-semibold ${s.text}`}>{health.label}</p>
        <p className="text-sm text-muted-foreground">{health.summary}</p>
      </CardContent>
    </Card>
  );
}