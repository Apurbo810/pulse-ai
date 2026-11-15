// apps/desktop/electron/services/diagnostics/sensors.ts

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import si from "systeminformation";

import type {
  HardwareSummary,
  Reading,
} from "../../../src/types/diagnostics";
import {
  parseActiveScheme,
  parseNvidiaCsv,
  parsePhysicalDisks,
  toReading,
  type NvidiaReading,
} from "./parsers";

const execFileAsync = promisify(execFile);

let nvidiaMissing = false;

/** NVIDIA GPU readings, or null (no NVIDIA card, or the call failed this time). */
export async function readNvidia(): Promise<NvidiaReading | null> {
  if (nvidiaMissing) return null;

  try {
    const { stdout } = await execFileAsync(
      "nvidia-smi",
      [
        "--query-gpu=temperature.gpu,utilization.gpu,power.draw,clocks.gr,memory.used,clocks_throttle_reasons.active",
        "--format=csv,noheader,nounits",
      ],
      { timeout: 4_000, windowsHide: true }
    );
    return parseNvidiaCsv(stdout);
  } catch (error) {
    // "Not found" will not fix itself, so stop trying
    if ((error as NodeJS.ErrnoException).code === "ENOENT") nvidiaMissing = true;
    return null;
  }
}

/** Network speed summed over all adapters, so a VPN adapter cannot hide real traffic. */
export async function readNetwork(): Promise<{ down: Reading; up: Reading }> {
  const stats = await si.networkStats("*");

  let down = 0;
  let up = 0;
  let seen = false;

  for (const adapter of stats) {
    const rx = toReading(adapter.rx_sec);
    const tx = toReading(adapter.tx_sec);
    if (rx === null && tx === null) continue;
    seen = true;
    down += rx ?? 0;
    up += tx ?? 0;
  }

  return seen ? { down, up } : { down: null, up: null };
}

export async function readIsAdmin(): Promise<boolean> {
  try {
    await execFileAsync("fltmc", [], { windowsHide: true, timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

async function readDisks() {
  try {
    const { stdout } = await execFileAsync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, MediaType | ConvertTo-Json -Compress",
      ],
      { timeout: 10_000, windowsHide: true }
    );
    return parsePhysicalDisks(stdout);
  } catch {
    return [];
  }
}

async function readPowerPlan(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("powercfg", ["/getactivescheme"], {
      timeout: 5_000,
      windowsHide: true,
    });
    return parseActiveScheme(stdout);
  } catch {
    return null;
  }
}

export async function readHardwareSummary(
  gpuName: string | null
): Promise<HardwareSummary> {
  const [cpu, mem, disks, powerPlan] = await Promise.all([
    si.cpu().catch(() => null),
    si.mem().catch(() => null),
    readDisks(),
    readPowerPlan(),
  ]);

  return {
    cpuName: cpu?.brand?.trim() || "Unknown CPU",
    cpuCores: cpu?.physicalCores ?? 0,
    cpuBaseGHz: cpu?.speed ?? 0,
    ramTotalMB: mem ? Math.round(mem.total / 1024 / 1024) : 0,
    gpuName,
    disks,
    powerPlan,
  };
}