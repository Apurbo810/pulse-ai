import si from "systeminformation";
import { StorageDevice } from "../../src/types/system";

export async function getCpuInfo() {
  const load = await si.currentLoad();

  console.log(load.currentLoad);
  console.log(load.currentLoadUser);
  console.log(load.currentLoadSystem);

  return {
    usage: Math.round(load.currentLoad),
    user: Math.round(load.currentLoadUser),
    system: Math.round(load.currentLoadSystem),
    idle: Math.round(load.currentLoadIdle),
  };
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
  const graphics = await si.graphics();

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