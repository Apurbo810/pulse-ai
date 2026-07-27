import type { ProcessInfo } from "@/types/system";

interface ProcessDetailsSectionProps {
  process: ProcessInfo;
}

function formatPriority(priority?: number) {
  switch (priority) {
    case 4:
      return "Idle";
    case 6:
      return "Below Normal";
    case 8:
      return "Normal";
    case 10:
      return "Above Normal";
    case 13:
      return "High";
    case 24:
      return "Realtime";
    default:
      return priority?.toString() ?? "Unknown";
  }
}

function formatStartTime(startTime?: string | null) {
  if (!startTime) return "Unknown";

  const date = new Date(startTime);

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function ProcessDetailsSection({
  process,
}: ProcessDetailsSectionProps) {
  const rows = [
    {
      label: "Owner",
      value: process.owner || "System",
    },
    {
      label: "Priority",
      value: `${formatPriority(process.priority)} (${process.priority ?? "-"})`,
    },
    {
      label: "Started",
      value: formatStartTime(process.startTime),
    },
  ];

  return (
    <div className="rounded-lg border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Details
      </h3>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b pb-2 last:border-0"
          >
            <span className="text-sm text-muted-foreground">
              {row.label}
            </span>

            <span className="text-sm font-medium">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}