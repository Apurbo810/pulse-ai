//electron/services/system.ts

import si from "systeminformation";
import { CpuInfo, StorageDevice } from "../../src/types/system";

const CPU_SAMPLE_INTERVAL_MS = 2_000;
const GPU_CACHE_TTL_MS = 10_000;

let cpuMonitoringStarted = false;
let cpuSampling = false;
let cpuTimer: ReturnType<typeof setInterval> | undefined;
let latestCpu: CpuInfo = {
  usage: 0,
  user: 0,
  system: 0,
  idle: 100,
};

type GraphicsInfo = Awaited<ReturnType<typeof si.graphics>>;

let cachedGraphics: GraphicsInfo | null = null;
let graphicsFetchedAt = 0;
let graphicsInFlight: Promise<GraphicsInfo> | null = null;


export interface InputDevice {
  type: "Keyboard" | "Mouse" | "Gamepad" | "Unknown";
  manufacturer: string;
  product: string;
}



async function sampleCpu(): Promise<void> {
  if (cpuSampling) return;

  cpuSampling = true;
  try {
    const load = await si.currentLoad();
    latestCpu = {
    usage: Math.round(load.currentLoad),
    user: Math.round(load.currentLoadUser),
    system: Math.round(load.currentLoadSystem),
    idle: Math.round(load.currentLoadIdle),
    };
  } finally {
    cpuSampling = false;
  }
}

/**
 * Own the systeminformation CPU baseline in one place. currentLoad() keeps
 * module-level state, so calling it from IPC handlers can shorten or overlap
 * its sample window when multiple renderer consumers request CPU data.
 */
export async function startCpuMonitoring(): Promise<void> {
  if (cpuMonitoringStarted) return;

  cpuMonitoringStarted = true;
  await si.currentLoad();
  await new Promise<void>((resolve) => setTimeout(resolve, 1_000));
  await sampleCpu();

  cpuTimer = setInterval(() => {
    void sampleCpu();
  }, CPU_SAMPLE_INTERVAL_MS);
}

export function stopCpuMonitoring(): void {
  if (cpuTimer) clearInterval(cpuTimer);
  cpuTimer = undefined;
  cpuMonitoringStarted = false;
}

/** Returns the latest centrally sampled CPU value without advancing the baseline. */
export function getCpuInfo(): CpuInfo {
  return latestCpu;
}

async function getCachedGraphics(): Promise<GraphicsInfo> {
  const now = Date.now();
  if (cachedGraphics && now - graphicsFetchedAt < GPU_CACHE_TTL_MS) {
    return cachedGraphics;
  }

  if (!graphicsInFlight) {
    graphicsInFlight = si.graphics().then((graphics) => {
      cachedGraphics = graphics;
      graphicsFetchedAt = Date.now();
      return graphics;
    }).finally(() => {
      graphicsInFlight = null;
    });
  }

  return graphicsInFlight;
}

export async function getMemoryInfo() {
  const memory = await si.mem();

  return {
    total: memory.total,
    used: memory.used,
    free: memory.free,
  };
}

export async function getGpuInfo() {
  const graphics = await getCachedGraphics();

  const controller = graphics.controllers[0];

  return {
    model: controller?.model ?? "Unknown GPU",
    vendor: controller?.vendor ?? "Unknown",
    vram: controller?.vram ?? 0,
    utilization: controller?.utilizationGpu ?? 0,
  };

}

  export async function getStorageInfo() {
    const disks = await si.fsSize();

    const totalSize = disks.reduce((sum, disk) => sum + disk.size, 0);
    const totalUsed = disks.reduce((sum, disk) => sum + disk.used, 0);
    const totalAvailable = disks.reduce(
      (sum, disk) => sum + disk.available,
      0
    );

    return {
      size: totalSize,
      used: totalUsed,
      available: totalAvailable,
      use: (totalUsed / totalSize) * 100,
    };
  }

export async function getStorageDevices(): Promise<StorageDevice[]> {
  const partitions = await si.fsSize();
  const disks = await si.diskLayout();
  const blockDevices = await si.blockDevices();

  const diskMap = new Map<string, (typeof disks)[number]>();

  for (const disk of disks) {
    diskMap.set(disk.device, disk);
  }

  const storageMap = new Map<string, StorageDevice>();

  for (const partition of partitions) {
    const block = blockDevices.find(
      (b) => b.name === partition.fs
    );

    if (!block || !block.device) continue;

    const device = block.device;

    const disk = diskMap.get(device);

    if (!disk) continue;

    if (!storageMap.has(disk.device)) {
      storageMap.set(disk.device, {
        device: disk.device,
        model: disk.name,
        type: disk.type,
        interfaceType: disk.interfaceType,
        size: disk.size,
        partitions: [],
      });
    }

    storageMap.get(disk.device)!.partitions.push({
      letter: partition.fs,
      size: partition.size,
      used: partition.used,
      available: partition.size - partition.used,
      usage: partition.use,
    });
  }

  return [...storageMap.values()];
}

  export async function getNetworkInfo() {
    const stats = await si.networkStats();
    const interfaces = await si.networkInterfaces();

    const network = stats[0];

    if (!network) {
      return {
        name: "Unknown",
        connected: false,
        speed: 0,
        ip4: "",
        upload: 0,
        download: 0,
      };
    }

    const adapter = interfaces.find(i => i.iface === network.iface);

    return {
      name: adapter?.iface ?? "Unknown",
      connected: adapter?.operstate === "up",
      speed: adapter?.speed ?? 0,
      ip4: adapter?.ip4 ?? "",
      upload: network.tx_sec,
      download: network.rx_sec,
    };
  }

  export async function getDisplayInfo() {
    const graphics = await getCachedGraphics();

    return graphics.displays.map((display) => ({
      model: display.model,
      vendor: display.vendor,
      main: display.main,
      resolution: `${display.currentResX} × ${display.currentResY}`,
      refreshRate: display.currentRefreshRate,
    }));
  }

