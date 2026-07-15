import {
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import StatCard from "./components/StatCard";

interface CpuInfo {
  usage: number;
}

interface MemoryInfo {
  total: number;
  used: number;
  free: number;
}

interface GpuInfo {
  model: string;
  vendor: string;
  vram: number;
  utilization: number;
}

interface StorageInfo {
  size: number;
  used: number;
  available: number;
  use: number;
}

interface NetworkInfo {
  rx_sec: number;
  tx_sec: number;
}

export default function DashboardPage() {


  const [cpuUsage, setCpuUsage] = useState(0);
  const [memoryUsed, setMemoryUsed] = useState(0);
  const [memoryTotal, setMemoryTotal] = useState(0);
  const [gpu, setGpu] = useState<GpuInfo>({ model: "", vendor: "", vram: 0, utilization: 0, });
  const [storage, setStorage] = useState<StorageInfo>({
  size: 0,
  used: 0,
  available: 0,
  use: 0,
});
  const [network, setNetwork] = useState<NetworkInfo>({rx_sec: 0,tx_sec: 0, });
  
useEffect(() => {
  let cancelled = false;

  async function loadLoop() {
    if (cancelled) return;

    const start = performance.now();

    try {
      const [cpu, memory, gpuInfo, storageInfo, networkInfo] =
        await Promise.all([
          window.system.getCpu(),
          window.system.getMemory(),
          window.system.getGpu(),
          window.system.getStorage(),
          window.system.getNetwork(),
        ]);

      if (cancelled) return;

      setCpuUsage(cpu.usage);
      setMemoryUsed(memory.used);
      setMemoryTotal(memory.total);
      setGpu(gpuInfo);
      setStorage(storageInfo);
      setNetwork(networkInfo);
    } catch (err) {
      console.error(err);
    }

    const elapsed = performance.now() - start;
    console.log(`System Info: ${elapsed.toFixed(0)} ms`);

    if (!cancelled) {
      setTimeout(loadLoop, 2000);
    }
  }

  loadLoop();

  return () => {
    cancelled = true;
  };
}, []);

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
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-muted-foreground">
          System overview
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="CPU" value={`${cpuUsage}%`} icon={Cpu}/>
        <StatCard title="RAM" value={`${formatGB(memoryUsed)} / ${formatGB(memoryTotal)} GB`} icon={MemoryStick} />
        <StatCard title="GPU" value={`${gpu.utilization}%`} subtitle={gpu.model} icon={Monitor} />
        <StatCard
          title="Storage"
          value={`${storage.use}%`}
          subtitle={`${formatGB(storage.used)} / ${formatGB(storage.size)} GB`}
          icon={HardDrive}
        />     
        <StatCard title="Network" value={`↓ ${formatSpeed(network.rx_sec)}`} subtitle={`↑ ${formatSpeed(network.tx_sec)}`} icon={Wifi} />
      </div>
    </div>
  );
}