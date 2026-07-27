// features/processes/components/ProcessMetrics.tsx

import type { ProcessInfo } from "@/types/system";

interface ProcessMetricsProps {
  process: ProcessInfo;
}

function formatMemory(memory: number) {
  if (memory >= 1024) {
    return `${(memory / 1024).toFixed(2)} GB`;
  }

  return `${memory.toFixed(2)} MB`;
}

function formatDisk(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
  }

  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(2)} KB/s`;
  }

  return `${bytes.toFixed(0)} B/s`;
}

export default function ProcessMetrics({
  process,
}: ProcessMetricsProps) {
  const metrics = [
    {
      label: "CPU",
      value: `${process.cpu.toFixed(1)}%`,
    },
    {
      label: "GPU",
      value: `${(process.gpu ?? 0).toFixed(1)}%`,
    },
    {
      label: "Memory",
      value: formatMemory(process.memory),
    },
    {
      label: "Disk",
      value: formatDisk(process.disk ?? 0),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border bg-background p-4"
        >
          <p className="text-sm text-muted-foreground">
            {metric.label}
          </p>

          <p className="mt-2 text-xl font-semibold">
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}