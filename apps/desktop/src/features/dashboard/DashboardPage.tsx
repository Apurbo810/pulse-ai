import {Cpu,HardDrive, MemoryStick, Monitor, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

import StatCard from "./components/StatCard";
import type {CpuInfo, MemoryInfo, GpuInfo, StorageSummary, NetworkInfo } from "@/types/system";
import { getSystemSnapshot } from "@/lib/monitor";
export default function DashboardPage() {


  const [cpu, setCpu] = useState<CpuInfo>({usage: 0, user: 0, system: 0,idle: 0 });
  const [memory, setMemory] = useState<MemoryInfo>({total: 0, used: 0,free: 0 });
  const [gpu, setGpu] = useState<GpuInfo>({ model: "", vendor: "", vram: 0, utilization: 0, });
  const [storage, setStorage] = useState<StorageSummary>({size: 0, used: 0, available: 0, use: 0 });
  const [network, setNetwork] = useState<NetworkInfo>({
    name: "",
    connected: false,
    speed: 0,
    ip4: "",
    download: 0,
    upload: 0,
  });
useEffect(() => {
  let cancelled = false;

  async function loadLoop() {
    if (cancelled) return;

    const start = performance.now();

    try {
      const snapshot = await getSystemSnapshot();

      if (cancelled) return;

    setCpu(snapshot.cpu);
    setMemory(snapshot.memory);
    setGpu(snapshot.gpu);
    setStorage(snapshot.storage);
    setNetwork(snapshot.network);
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
        <StatCard title="CPU" value={`${cpu.usage}%`} icon={Cpu}/>
        <StatCard title="RAM" value={`${formatGB(memory.used)} / ${formatGB(memory.total)} GB`} icon={MemoryStick} />
        <StatCard title="GPU" value={`${gpu.utilization}%`} subtitle={gpu.model} icon={Monitor} />
        <StatCard
          title="Storage"
          value={`${storage.use}%`}
          subtitle={`${formatGB(storage.used)} / ${formatGB(storage.size)} GB`}
          icon={HardDrive}
        />     
          <StatCard
            title="Network"
            value={`↓ ${formatSpeed(network.download)}`}
            subtitle={`↑ ${formatSpeed(network.upload)}`}
            icon={Wifi}
          />   
      </div>
    </div>
  );
}