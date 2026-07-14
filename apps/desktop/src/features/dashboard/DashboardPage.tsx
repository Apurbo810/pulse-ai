import {
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import StatCard from "./components/StatCard";


export default function DashboardPage() {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(0);
  useEffect(() => {
    async function loadSystemInfo() {
      const cpu = await window.system.getCpu();
      const memory = await window.system.getMemory();

      setCpuUsage(cpu.usage);

      setMemoryUsed(memory.used);
      setMemoryTotal(memory.total);
    }

    loadSystemInfo();

  // Refresh every second
  const interval = setInterval(loadSystemInfo, 1000);

  // Cleanup when component unmounts
  return () => clearInterval(interval);
  }, []);
function formatGB(bytes: number) {
  return (bytes / 1024 / 1024 / 1024).toFixed(1);
}
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-muted-foreground">
          System overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="CPU" value={`${cpuUsage}%`} icon={Cpu}/>
        <StatCard title="RAM" value={`${formatGB(memoryUsed)} / ${formatGB(memoryTotal)} GB`} icon={MemoryStick} />
        <StatCard title="GPU" value="0%" icon={Monitor} />
        <StatCard title="Storage" value="0 GB" icon={HardDrive} />
        <StatCard title="Network" value="0 Mbps" icon={Wifi} />
      </div>
    </div>
  );
}