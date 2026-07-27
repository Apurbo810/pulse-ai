//features/processes/components/ProcessOverview.tsx

import ApplicationIcon from "@/components/shared/ApplicationIcon";
import { Badge } from "@/components/ui/badge";

import type { ProcessInfo } from "@/types/system";

interface ProcessOverviewProps {
  process: ProcessInfo;
}

export default function ProcessOverview({
  process,
}: ProcessOverviewProps) {
  const statusVariant =
    process.status === "Running"
      ? "default"
      : process.status === "Suspended"
      ? "secondary"
      : "destructive";

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4">
      <ApplicationIcon
        executablePath={process.executablePath}
        size={56}
      />

      <div className="flex-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {process.name}
        </h2>

        <p className="text-sm text-muted-foreground">
          PID: {process.pid}
        </p>
      </div>

      <Badge variant={statusVariant}>
        {process.status ?? "Unknown"}
      </Badge>
    </div>
  );
}