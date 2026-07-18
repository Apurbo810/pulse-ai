import { useEffect, useState } from "react";

import { getSystemSnapshot } from "@/lib/monitor";
import type { SystemSnapshot } from "@/lib/monitor";

import CpuCard from "../components/CpuCard";
import MemoryCard from "../components/MemoryCard";
import GpuCard from "../components/GpuCard";
import StorageCard from "../components/StorageCard";
import NetworkCard from "../components/NetworkCard";
import DiskUsageCard from "../components/DiskUsageCard"
import DisplayCard from "../components/DisplayCard";
import DevicesCard from "../components/DevicesCard";

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

<div className="space-y-8">
  {/* Header */}

  {/* Performance */}
  <section className="space-y-4">
    <h2 className="text-xl font-semibold">Performance</h2>

  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {/* Performance */}
      <CpuCard cpu={snapshot.cpu} />
      <MemoryCard memory={snapshot.memory} />
      <GpuCard gpu={snapshot.gpu} />
      <DiskUsageCard storage={snapshot.storage} />

      {/* Hardware */}
      <NetworkCard network={snapshot.network} />
      <StorageCard storage={snapshot.storage} />
      <DisplayCard displays={snapshot.displays} />
      <DevicesCard devices={snapshot.devices} />
    </div>
  </section>
</div>

  );
}