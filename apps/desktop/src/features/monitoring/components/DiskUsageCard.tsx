import { HardDrive } from "lucide-react";

import HistoryChart from "./HistoryChart";
import { useHistory } from "../hooks/useHistory";

import type { StorageSummary } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DiskUsageCardProps {
  storage: StorageSummary;
}

function formatGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export default function DiskUsageCard({
  storage,
}: DiskUsageCardProps) {
  const diskHistory = useHistory(storage.use);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Disk</CardTitle>
        <HardDrive className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Total</span>
          <span>{formatGB(storage.size)} GB</span>
        </div>

        <div className="flex justify-between">
          <span>Used</span>
          <span>{formatGB(storage.used)} GB</span>
        </div>

        <div className="flex justify-between">
          <span>Available</span>
          <span>{formatGB(storage.available)} GB</span>
        </div>

        <div className="flex justify-between">
          <span>Usage</span>
          <span>{storage.use.toFixed(1)}%</span>
        </div>

        <HistoryChart
          title="Disk Usage"
          data={diskHistory}
          unit="%"
          color="#7c3aed"
        />
      </CardContent>
    </Card>
  );
}