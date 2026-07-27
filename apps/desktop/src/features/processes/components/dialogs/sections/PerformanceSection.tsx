import type { ProcessInfo } from "@/types/system";

interface PerformanceSectionProps {
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

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({
  label,
  value,
}: MetricRowProps) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="font-medium">
        {value}
      </span>
    </div>
  );
}

export default function PerformanceSection({
  process,
}: PerformanceSectionProps) {
  return (
    <div className="rounded-lg border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold">
        Performance
      </h3>

      <div className="space-y-1">
        <MetricRow
          label="CPU"
          value={`${process.cpu.toFixed(1)}%`}
        />

        <MetricRow
          label="GPU"
          value={`${(process.gpu ?? 0).toFixed(1)}%`}
        />

        <MetricRow
          label="Memory"
          value={formatMemory(process.memory)}
        />

        <MetricRow
          label="Disk"
          value={formatDisk(process.disk ?? 0)}
        />
      </div>
    </div>
  );
}