import type { StoragePartition } from "@/types/system";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatBytes,
  formatUsage,
} from "../utils/storageFormat";
import { getUsageStatus } from "@/features/shared/utils/status";

interface PartitionCardProps {
  partition: StoragePartition;
}

export default function PartitionCard({
  partition,
}: PartitionCardProps) {

const status = getUsageStatus(partition.usage);
  return (
    <Card className="shadow-none">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold">
            {partition.letter}
          </span>

          <span className="text-sm font-medium">
            {formatUsage(partition.usage)}
          </span>
        </div>

        <Progress
            value={partition.usage}
            indicatorClassName={status.color}
            />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Total
            </span>

            <span>{formatBytes(partition.size)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Used
            </span>

            <span>{formatBytes(partition.used)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Free
            </span>

            <span>{formatBytes(partition.available)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}