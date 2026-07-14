import si from "systeminformation";

export async function getCpuInfo() {
  const load = await si.currentLoad();

  return {
    usage: Math.round(load.currentLoad),
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