import si from "systeminformation";

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

    const usage = (totalUsed / totalSize) * 100;

    return {
      size: totalSize,
      used: totalUsed,
      available: totalAvailable,
      use: Number(usage.toFixed(1)),
    };
  }

  export async function getNetworkInfo() {
  const stats = await si.networkStats();

  const network = stats[0];

  return {
    rx_sec: network.rx_sec,
    tx_sec: network.tx_sec,
  };
}