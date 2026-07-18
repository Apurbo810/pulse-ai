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
}

export async function getSystemSnapshot(): Promise<SystemSnapshot> {
  const [cpu, memory, gpu, storage, network, displays, devices,] = await Promise.all([
    window.system.getCpu(),
    window.system.getMemory(),
    window.system.getGpu(),
    window.system.getStorage(),
    window.system.getNetwork(),
    window.system.getDisplayInfo(),
    window.system.getDevices(),

  ]);
const snapshot = {
  cpu,
  memory,
  gpu,
  storage,
  network,
  displays,
  devices,
};

console.log(snapshot);

return snapshot;
  return {
    cpu,
    memory,
    gpu,
    storage,
    network,
    displays,
    devices
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