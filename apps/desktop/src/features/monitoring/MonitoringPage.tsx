import {
  Cpu,
  MemoryStick,
  Monitor,
  HardDrive,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getSystemSnapshot } from "@/lib/monitor";
import type { SystemSnapshot } from "@/lib/monitor";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function MonitoringPage() {
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLoop() {
      if (cancelled) return;

      try {
        const data = await getSystemSnapshot();

        if (!cancelled) {
          setSnapshot(data);
        }
      } catch (err) {
        console.error(err);
      }

      if (!cancelled) {
        setTimeout(loadLoop, 2000);
      }
    }

    loadLoop();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!snapshot) {
    return <p>Loading...</p>;
  }

  function formatGB(bytes: number) {
    return (bytes / 1024 / 1024 / 1024).toFixed(1);
  }

  function formatSpeed(bytes: number) {
    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB/s`;
    }

    return `${(kb / 1024).toFixed(1)} MB/s`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Monitoring</h1>

        <p className="text-muted-foreground">
          Detailed system information
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* CPU */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CPU</CardTitle>
            <Cpu className="h-5 w-5" />
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Usage</span>
              <span>{snapshot.cpu.usage}%</span>
            </div>

            <div className="flex justify-between">
              <span>User</span>
              <span>{snapshot.cpu.user}%</span>
            </div>

            <div className="flex justify-between">
              <span>System</span>
              <span>{snapshot.cpu.system}%</span>
            </div>

            <div className="flex justify-between">
              <span>Idle</span>
              <span>{snapshot.cpu.idle}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Memory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Memory</CardTitle>
            <MemoryStick className="h-5 w-5" />
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatGB(snapshot.memory.total)} GB</span>
            </div>

            <div className="flex justify-between">
              <span>Used</span>
              <span>{formatGB(snapshot.memory.used)} GB</span>
            </div>

            <div className="flex justify-between">
              <span>Free</span>
              <span>{formatGB(snapshot.memory.free)} GB</span>
            </div>
          </CardContent>
        </Card>

        {/* GPU */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>GPU</CardTitle>
            <Monitor className="h-5 w-5" />
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Model</span>
              <span>{snapshot.gpu.model}</span>
            </div>

            <div className="flex justify-between">
              <span>Vendor</span>
              <span>{snapshot.gpu.vendor}</span>
            </div>

            <div className="flex justify-between">
              <span>VRAM</span>
              <span>{snapshot.gpu.vram} MB</span>
            </div>

            <div className="flex justify-between">
              <span>Usage</span>
              <span>{snapshot.gpu.utilization}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Storage</CardTitle>
            <HardDrive className="h-5 w-5" />
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total</span>
              <span>{formatGB(snapshot.storage.size)} GB</span>
            </div>

            <div className="flex justify-between">
              <span>Used</span>
              <span>{formatGB(snapshot.storage.used)} GB</span>
            </div>

            <div className="flex justify-between">
              <span>Available</span>
              <span>{formatGB(snapshot.storage.available)} GB</span>
            </div>

            <div className="flex justify-between">
              <span>Usage</span>
              <span>{snapshot.storage.use}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Network</CardTitle>
            <Wifi className="h-5 w-5" />
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Download</span>
              <span>{formatSpeed(snapshot.network.rx_sec)}</span>
            </div>

            <div className="flex justify-between">
              <span>Upload</span>
              <span>{formatSpeed(snapshot.network.tx_sec)}</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}