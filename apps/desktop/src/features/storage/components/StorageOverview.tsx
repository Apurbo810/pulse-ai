import type { StorageSummary } from "@/types/system";

import { HardDrive } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {formatBytes , formatUsage } from "../utils/storageFormat";

interface StorageOverviewProps {summary: StorageSummary }

export default function StorageOverview({
  summary,
}: StorageOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Storage Overview</CardTitle>

        <HardDrive className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Total Capacity
          </span>

          <span>{formatBytes(summary.size)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Used
          </span>

          <span>{formatBytes(summary.used)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Available
          </span>

          <span>{formatBytes(summary.available)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Usage
          </span>

          <span>{formatUsage(summary.use)}</span>
        </div>
      </CardContent>
    </Card>
  );
}