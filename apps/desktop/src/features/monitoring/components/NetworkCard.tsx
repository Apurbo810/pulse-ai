import { Wifi } from "lucide-react";

import type { NetworkInfo } from "@/types/system";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NetworkCardProps {
  network: NetworkInfo;
}

function formatSpeed(bytes: number) {
  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB/s`;
  }

  return `${(kb / 1024).toFixed(1)} MB/s`;
}

export default function NetworkCard({ network }: NetworkCardProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Network</CardTitle>
        <Wifi className="h-5 w-5" />
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex justify-between">
          <span>Adapter</span>
          <span>{network.name}</span>
        </div>

        <div className="flex justify-between">
          <span>Status</span>
          <span>
            {network.connected ? "Connected" : "Disconnected"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Speed</span>
          <span>{network.speed} Mbps</span>
        </div>

        <div className="flex justify-between">
          <span>IPv4</span>
          <span>{network.ip4 || "-"}</span>
        </div>

        <div className="flex justify-between">
          <span>Download</span>
          <span>{formatSpeed(network.download)}</span>
        </div>

        <div className="flex justify-between">
          <span>Upload</span>
          <span>{formatSpeed(network.upload)}</span>
        </div>
      </CardContent>
    </Card>
  );
}