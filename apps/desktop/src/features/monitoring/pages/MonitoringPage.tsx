import { useEffect, useState } from "react";

import { getSystemSnapshot } from "@/lib/monitor";
import type { SystemSnapshot } from "@/lib/monitor";

import CpuCard from "../components/CpuCard";
import MemoryCard from "../components/MemoryCard";
import GpuCard from "../components/GpuCard";
import StorageCard from "../components/StorageCard";
import NetworkCard from "../components/NetworkCard";

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
        <CpuCard cpu={snapshot.cpu} />
        <MemoryCard memory={snapshot.memory} />
        <GpuCard gpu={snapshot.gpu} />
        <StorageCard storage={snapshot.storage} />
        <NetworkCard network={snapshot.network} />
      </div>

    </div>

  );
}