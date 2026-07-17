import { Monitor } from "lucide-react";

import type { GpuInfo } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GpuCardProps {
  gpu: GpuInfo;
}

export default function GpuCard({ gpu }: GpuCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>GPU</CardTitle>
        <Monitor className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Model</span>
          <span>{gpu.model}</span>
        </div>

        <div className="flex justify-between">
          <span>Vendor</span>
          <span>{gpu.vendor}</span>
        </div>

        <div className="flex justify-between">
          <span>VRAM</span>
          <span>{gpu.vram} MB</span>
        </div>

        <div className="flex justify-between">
          <span>Usage</span>
          <span>{gpu.utilization}%</span>
        </div>
      </CardContent>
    </Card>
  );
}