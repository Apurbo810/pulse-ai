// apps/desktop/electron/services/diagnostics/sensors.ts

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import si from "systeminformation";

import type { HardwareSummary } from "../../../src/types/diagnostics";
import {
  parseActiveScheme,
  parseNvidiaCsv,
  parsePhysicalDisks,
  pickPrimaryNetwork,
  type NvidiaReading,
  type PrimaryNetwork,
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

// ---------- Network ----------

const DEFAULT_IFACE_TTL_MS = 60_000;

let defaultIface: string | null = null;
let defaultIfaceAt = 0; // 0 = never resolved
let defaultIfaceInFlight: Promise<void> | null = null;

async function refreshDefaultIface(): Promise<void> {
  try {
    const name = await si.networkInterfaceDefault();
    defaultIface = name && name.trim() ? name.trim() : null;
  } catch {
    defaultIface = null;
  } finally {
    defaultIfaceAt = Date.now();
  }
}

/**
 * The adapter Windows uses for its default route. Resolved once (the first
 * sample waits for it), then refreshed in the background every minute.
 */
async function getDefaultIface(): Promise<string | null> {
  const stale = Date.now() - defaultIfaceAt > DEFAULT_IFACE_TTL_MS;

  if (stale && !defaultIfaceInFlight) {
    defaultIfaceInFlight = refreshDefaultIface().finally(() => {
      defaultIfaceInFlight = null;
    });
  }
  if (defaultIfaceAt === 0 && defaultIfaceInFlight) {
    await defaultIfaceInFlight;
  }

  return defaultIface;
}

/** Speed of the main network adapter, and which adapter it was. */
export async function readNetwork(): Promise<PrimaryNetwork> {
  const [stats, preferred] = await Promise.all([
    si.networkStats("*"),
    getDefaultIface(),
  ]);
  return pickPrimaryNetwork(stats, preferred);
}

// ---------- System ----------

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