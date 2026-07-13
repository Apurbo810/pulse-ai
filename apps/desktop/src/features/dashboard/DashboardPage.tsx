import {
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Wifi,
} from "lucide-react";

import StatCard from "./components/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-muted-foreground">
          System overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="CPU" value="0%" icon={Cpu} />
        <StatCard title="RAM" value="0 GB" icon={MemoryStick} />
        <StatCard title="GPU" value="0%" icon={Monitor} />
        <StatCard title="Storage" value="0 GB" icon={HardDrive} />
        <StatCard title="Network" value="0 Mbps" icon={Wifi} />
      </div>
    </div>
  );
}