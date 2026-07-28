// src/lib/monitor.ts
import type { ProcessInfo } from "@/types/system";

import type {
  CpuInfo,
  MemoryInfo,
  GpuInfo,
  StorageSummary,
  NetworkInfo,
  DisplayInfo,
  DevicesInfo,
} from "@/types/system";

export interface SystemSnapshot {
  cpu: CpuInfo;
  memory: MemoryInfo;
  gpu: GpuInfo;
  storage: StorageSummary;
  network: NetworkInfo;
  displays: DisplayInfo[];
  devices: DevicesInfo;

  processes: ProcessInfo[];
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const [cpu, memory, gpu, storage, network, displays, devices, processes] = await Promise.all([
    window.system.getCpu(),
    window.system.getMemory(),
    window.system.getGpu(),
    window.system.getStorage(),
    window.system.getNetwork(),
    window.system.getDisplayInfo(),
    window.system.getDevices(),
    window.system.getProcesses(),
  ]);

  return {
    cpu,
    memory,
    gpu,
    storage,
    network,
    displays,
    devices,
    processes,
  };
}

// ----------------------
// Monitoring State
// ----------------------

let currentSnapshot: SystemSnapshot | null = null;

let monitoring = false;

const listeners = new Set<(snapshot: SystemSnapshot) => void>();

// ----------------------
// Monitoring Engine
// ----------------------

export function startMonitoring(interval = 2000) {
  if (monitoring) return;

  monitoring = true;

  async function poll() {
    if (!monitoring) return;

    try {
      currentSnapshot = await getSystemSnapshot();

      listeners.forEach((listener) => {
        listener(currentSnapshot!);
      });
    } catch (err) {
      console.error("Monitoring error:", err);
    }

    if (monitoring) {
      setTimeout(poll, interval);
    }
  }

  poll();
}



export async function getLiveSnapshot() {
  const [cpu, memory, gpu, network] =
    await Promise.all([
      window.system.getCpu(),
      window.system.getMemory(),
      window.system.getGpu(),
      window.system.getNetwork(),
    ]);

  return {
    cpu,
    memory,
    gpu,
    network,
  };
}


export async function getStorageSnapshot() {
  return window.system.getStorage();
}

export async function getHardwareSnapshot() {
  const [displays, devices] =
    await Promise.all([
      window.system.getDisplayInfo(),
      window.system.getDevices(),
    ]);

  return {
    displays,
    devices,
  };
}


export function subscribeMonitoring(
  listener: (snapshot: SystemSnapshot) => void
) {
  listeners.add(listener);

  if (currentSnapshot) {
    listener(currentSnapshot);
  }

  return () => {
    listeners.delete(listener);
  };
}

export function getCurrentSnapshot() {
  return currentSnapshot;
}