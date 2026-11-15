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
export function pickTopProcesses(
  list: RawProcess[],
  cpuCount = 5,
  memoryCount = 3
): TopProcessSample[] {
  const usable = list.filter((p) => p.pid > 0 && p.name);

  const byCpu = [...usable]
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, cpuCount);
  const byMemory = [...usable]
    .sort((a, b) => (b.memRss || 0) - (a.memRss || 0))
    .slice(0, memoryCount);

  const seen = new Set<number>();
  const picked: TopProcessSample[] = [];

  for (const p of [...byCpu, ...byMemory]) {
    if (seen.has(p.pid)) continue;
    seen.add(p.pid);
    picked.push({
      pid: p.pid,
      name: p.name,
      cpu: Number.isFinite(p.cpu) ? Number(p.cpu.toFixed(1)) : 0,
      memoryMB: Math.round((p.memRss || 0) / 1024),
      gpu: 0, // per-process GPU and disk are added later
      diskMBps: 0,
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