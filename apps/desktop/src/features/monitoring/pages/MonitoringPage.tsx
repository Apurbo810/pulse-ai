import { useEffect, useState } from "react";

import {
  getLiveSnapshot,
  getStorageSnapshot,
  getHardwareSnapshot,
} from "@/lib/monitor";

import type { StorageSummary } from "@/types/system";

import CpuCard from "../components/CpuCard";
import MemoryCard from "../components/MemoryCard";
import GpuCard from "../components/GpuCard";
import StorageCard from "../components/StorageCard";
import NetworkCard from "../components/NetworkCard";
import DiskUsageCard from "../components/DiskUsageCard";
import DisplayCard from "../components/DisplayCard";
import DevicesCard from "../components/DevicesCard";

export default function MonitoringPage() {
  const [live, setLive] = useState<
    Awaited<ReturnType<typeof getLiveSnapshot>> | null
  >(null);

  const [storage, setStorage] = useState<StorageSummary | null>(null);

  const [hardware, setHardware] = useState<
    Awaited<ReturnType<typeof getHardwareSnapshot>> | null
  >(null);

  // -------------------------
  // Load Hardware Once
  // -------------------------
  useEffect(() => {
    async function loadHardware() {
      try {
        const data = await getHardwareSnapshot();
        setHardware(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadHardware();
  }, []);

  // -------------------------
  // Live Monitoring (2s)
  // -------------------------
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      try {
        const data = await getLiveSnapshot();

        if (!cancelled) {
          setLive(data);
        }
      } catch (err) {
        console.error(err);
      }

      if (!cancelled) {
        setTimeout(poll, 2000);
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  // -------------------------
  // Storage Monitoring (15s)
  // -------------------------
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      if (cancelled) return;

      try {
        const data = await getStorageSnapshot();

        if (!cancelled) {
          setStorage(data);
        }
      } catch (err) {
        console.error(err);
      }

      if (!cancelled) {
        setTimeout(poll, 15000);
      }
    }

    poll();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!live || !storage || !hardware) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Performance</h2>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {/* Performance */}
          <CpuCard cpu={live.cpu} />
          <MemoryCard memory={live.memory} />
          <GpuCard gpu={live.gpu} />
          <DiskUsageCard storage={storage} />

          {/* Hardware */}
          <NetworkCard network={live.network} />
          <StorageCard storage={storage} />
          <DisplayCard displays={hardware.displays} />
          <DevicesCard devices={hardware.devices} />
        </div>
      </section>
    </div>
  );
}