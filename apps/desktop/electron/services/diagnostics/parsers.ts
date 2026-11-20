// apps/desktop/electron/services/diagnostics/parsers.ts

import type {
  DiskSummary,
  Reading,
  Sample,
  SensorAvailability,
  SensorKey,
  TopProcessSample,
} from "../../../src/types/diagnostics";

/** Converts a value to a number, or null if it is missing or not a number. */
export function toReading(value: unknown): Reading {
  if (typeof value === "string") {
    if (value.trim() === "") return null;
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// ---------- NVIDIA ----------

export interface NvidiaReading {
  temperatureC: Reading;
  usage: Reading;
  powerW: Reading;
  coreClockMHz: Reading;
  memoryUsedMB: Reading;
  throttleReasons: number | null;
}

/**
 * Parses one line of:
 * nvidia-smi --query-gpu=temperature.gpu,utilization.gpu,power.draw,clocks.gr,
 *   memory.used,clocks_throttle_reasons.active --format=csv,noheader,nounits
 */
export function parseNvidiaCsv(output: string): NvidiaReading | null {
  const line = output.trim().split(/\r?\n/)[0];
  if (!line) return null;

  const parts = line.split(",").map((part) => part.trim());
  if (parts.length < 6) return null;

  const reasons = /^0x[0-9a-f]+$/i.test(parts[5])
    ? parseInt(parts[5], 16)
    : null;

  return {
    temperatureC: toReading(parts[0]),
    usage: toReading(parts[1]),
    powerW: toReading(parts[2]),
    coreClockMHz: toReading(parts[3]),
    memoryUsedMB: toReading(parts[4]),
    throttleReasons:
      reasons !== null && Number.isFinite(reasons) ? reasons : null,
  };
}

// ---------- Windows performance counters ----------

export interface CounterValues {
  performancePercent: Reading;
  pageFileUsedPercent: Reading;
  diskQueue: Reading;
  diskActivePercent: Reading;
}

export const EMPTY_COUNTERS: CounterValues = {
  performancePercent: null,
  pageFileUsedPercent: null,
  diskQueue: null,
  diskActivePercent: null,
};

/** Parses one JSON line of { "<counter path>": value } from the PowerShell stream. */
export function parseCounterLine(line: string): CounterValues | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const result: CounterValues = { ...EMPTY_COUNTERS };

  for (const [path, value] of Object.entries(parsed as Record<string, unknown>)) {
    const key = path.toLowerCase();
    const reading = toReading(value);

    if (key.endsWith("\\% processor performance")) {
      result.performancePercent = reading;
    } else if (key.endsWith("\\paging file(_total)\\% usage")) {
      result.pageFileUsedPercent = reading;
    } else if (key.endsWith("\\avg. disk queue length")) {
      result.diskQueue = reading;
    } else if (key.endsWith("\\% disk time")) {
      result.diskActivePercent = reading;
    }
  }

  return result;
}

// ---------- Processes ----------

export interface RawProcess {
  pid: number;
  name: string;
  cpu: number;
  memRss: number; // KB, as reported by systeminformation
}

/** Top processes by CPU, plus the top memory users, without duplicates. */
// apps/desktop/electron/services/diagnostics/parsers.ts  (replaces pickTopProcesses)

export interface TopProcessExtras {
  gpu?: Map<number, number>; // % per process id
  disk?: Map<number, number>; // bytes per second per process id
  gpuCount?: number;
  diskCount?: number;
}

/**
 * Top processes by CPU and memory, plus the top GPU and disk users, so a game
 * using the GPU with low CPU still shows up. No process appears twice.
 */
export function pickTopProcesses(
  list: RawProcess[],
  cpuCount = 5,
  memoryCount = 3,
  extras: TopProcessExtras = {}
): TopProcessSample[] {
  const usable = list.filter((p) => p.pid > 0 && p.name);
  const gpuOf = (pid: number) => extras.gpu?.get(pid) ?? 0;
  const diskOf = (pid: number) => extras.disk?.get(pid) ?? 0;

  const byCpu = [...usable]
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, cpuCount);
  const byMemory = [...usable]
    .sort((a, b) => (b.memRss || 0) - (a.memRss || 0))
    .slice(0, memoryCount);
  const byGpu = usable
    .filter((p) => gpuOf(p.pid) > 0)
    .sort((a, b) => gpuOf(b.pid) - gpuOf(a.pid))
    .slice(0, extras.gpuCount ?? 3);
  const byDisk = usable
    .filter((p) => diskOf(p.pid) > 0)
    .sort((a, b) => diskOf(b.pid) - diskOf(a.pid))
    .slice(0, extras.diskCount ?? 3);

  const seen = new Set<number>();
  const picked: TopProcessSample[] = [];

  for (const p of [...byCpu, ...byMemory, ...byGpu, ...byDisk]) {
    if (seen.has(p.pid)) continue;
    seen.add(p.pid);
    picked.push({
      pid: p.pid,
      name: p.name,
      cpu: Number.isFinite(p.cpu) ? Number(p.cpu.toFixed(1)) : 0,
      memoryMB: Math.round((p.memRss || 0) / 1024),
      gpu: Number(gpuOf(p.pid).toFixed(1)),
      diskMBps: Number((diskOf(p.pid) / 1024 / 1024).toFixed(2)),
    });
  }

  return picked;
}




// ---------- Hardware summary ----------

/** "Power Scheme GUID: abc  (Balanced)" gives "Balanced". */
export function parseActiveScheme(output: string): string | null {
  const match = output.trim().match(/\(([^()]*)\)\s*$/);
  return match ? match[1].trim() : null;
}

export function parsePhysicalDisks(json: string): DiskSummary[] {
  if (!json.trim()) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return [];
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];

  return list
    .filter((d): d is Record<string, unknown> => !!d && typeof d === "object")
    .map((d) => ({
      name: String(d.FriendlyName ?? "Unknown"),
      type: d.MediaType === "SSD" ? "SSD" : d.MediaType === "HDD" ? "HDD" : "Unknown",
      health: String(d.HealthStatus ?? "Unknown"),
    }));
}

// ---------- Sensor availability ----------

export const SENSOR_KEYS: SensorKey[] = [
  "cpuUsage",
  "cpuPerformance",
  "cpuTemperature",
  "cpuVoltage",
  "memory",
  "pageFile",
  "gpuUsage",
  "gpuTemperature",
  "gpuPower",
  "gpuClock",
  "diskActivity",
  "diskQueue",
  "network",
];

export function emptyAvailability(): SensorAvailability {
  return Object.fromEntries(
    SENSOR_KEYS.map((key) => [key, false])
  ) as SensorAvailability;
}

/** A sensor counts as available once it has produced at least one real value. */
export function updateAvailability(a: SensorAvailability, s: Sample): void {
  const has = (value: Reading) => value !== null;

  if (has(s.cpu.usage)) a.cpuUsage = true;
  if (has(s.cpu.performancePercent)) a.cpuPerformance = true;
  if (has(s.cpu.temperatureC)) a.cpuTemperature = true;
  if (has(s.cpu.voltageV)) a.cpuVoltage = true;
  if (has(s.memory.usedPercent)) a.memory = true;
  if (has(s.memory.pageFileUsedPercent)) a.pageFile = true;
  if (has(s.gpu.usage)) a.gpuUsage = true;
  if (has(s.gpu.temperatureC)) a.gpuTemperature = true;
  if (has(s.gpu.powerW)) a.gpuPower = true;
  if (has(s.gpu.coreClockMHz)) a.gpuClock = true;
  if (has(s.disk.activePercent)) a.diskActivity = true;
  if (has(s.disk.queueLength)) a.diskQueue = true;
  if (has(s.network.downBytesPerSec)) a.network = true;
}

// apps/desktop/electron/services/diagnostics/parsers.ts  (replaces the Network section at the end)

// ---------- Network ----------

export interface RawNetworkStat {
  iface: string;
  operstate?: string;
  rx_sec?: number | null;
  tx_sec?: number | null;
}

export interface PrimaryNetwork {
  down: Reading;
  up: Reading;
  adapter: string | null;
}

const VIRTUAL_ADAPTER =
  /vpn|virtual|vmware|vethernet|hyper-v|loopback|\btap\b|\btun\b|tailscale|zerotier|bluetooth|radmin|wsl|docker|npcap/i;

/**
 * Picks one network adapter, so VPN traffic is not counted twice (once inside
 * the VPN adapter, once on the real card).
 * 1. The adapter Windows uses for its default route (preferredIface), if it
 *    is up and has been measured.
 * 2. Otherwise the busiest adapter that does not look virtual.
 * 3. A virtual adapter only when nothing else is available.
 */
export function pickPrimaryNetwork(
  stats: RawNetworkStat[],
  preferredIface?: string | null
): PrimaryNetwork {
  const total = (s: RawNetworkStat) =>
    (toReading(s.rx_sec) ?? 0) + (toReading(s.tx_sec) ?? 0);

  const result = (s: RawNetworkStat): PrimaryNetwork => ({
    down: toReading(s.rx_sec),
    up: toReading(s.tx_sec),
    adapter: s.iface ?? null,
  });

  const measured = stats.filter(
    (s) => toReading(s.rx_sec) !== null || toReading(s.tx_sec) !== null
  );
  if (measured.length === 0) return { down: null, up: null, adapter: null };

  const wanted = preferredIface?.trim().toLowerCase();
  if (wanted) {
    const preferred = measured.find(
      (s) =>
        s.operstate !== "down" &&
        (s.iface ?? "").trim().toLowerCase() === wanted
    );
    if (preferred) return result(preferred);
  }

  const active = measured.filter((s) => s.operstate !== "down");
  const pool = active.length > 0 ? active : measured;
  const physical = pool.filter((s) => !VIRTUAL_ADAPTER.test(s.iface ?? ""));
  const candidates = physical.length > 0 ? physical : pool;

  const busiest = [...candidates].sort((a, b) => total(b) - total(a))[0];
  return result(busiest);
}