import { HardDrive } from "lucide-react";

import type { StorageSummary } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StorageCardProps {
  storage: StorageSummary;
}

function formatGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}

export default function StorageCard({ storage }: StorageCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Storage</CardTitle>
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
      </CardContent>
    </Card>
  );
}