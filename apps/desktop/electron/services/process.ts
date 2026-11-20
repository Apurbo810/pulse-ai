// apps/desktop/electron/services/process.ts  

import { app } from "electron";
import si from "systeminformation";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ProcessInfo } from "../../src/types/system";
import { isCriticalProcess } from "./processes/criticalProcesses";

const execFileAsync = promisify(execFile);

/**
 * Windows exposes GPU activity as one counter per engine. Aggregate those
 * counters by process ID so the Processes page can show a useful value.
 */
export async function getGpuUsageByProcess(): Promise<Map<number, number>> {
  if (process.platform !== "win32") {
    return new Map();
  }

  const command = [
    "$samples = (Get-Counter -Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction Stop).CounterSamples",
    "$samples | ForEach-Object {",
    "  if ($_.InstanceName -match '^pid_(\\d+)_') {",
    "    [PSCustomObject]@{ pid = [int]$matches[1]; usage = [math]::Max(0, $_.CookedValue) }",
    "  }",
    "} | ConvertTo-Json -Compress",
  ].join("; ");

  try {
    const { stdout } = await execFileAsync("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      command,
    ], { timeout: 5_000, windowsHide: true, maxBuffer: 1024 * 1024 });

    if (!stdout.trim()) {
      return new Map();
    }

    const samples = JSON.parse(stdout) as { pid: number; usage: number } | { pid: number; usage: number }[];
    const usageByProcess = new Map<number, number>();

    for (const sample of Array.isArray(samples) ? samples : [samples]) {
      if (!Number.isFinite(sample.pid) || !Number.isFinite(sample.usage)) {
        continue;
      }

      usageByProcess.set(sample.pid, (usageByProcess.get(sample.pid) ?? 0) + sample.usage);
    }

    for (const [pid, usage] of usageByProcess) {
      usageByProcess.set(pid, Math.min(100, usage));
    }

    return usageByProcess;
  } catch {
    // GPU performance counters are not available on every Windows install.
    return new Map();
  }
}

/** Returns combined read/write disk activity in bytes per second for each process. */
export async function getDiskUsageByProcess(): Promise<Map<number, number>> {
  if (process.platform !== "win32") {
    return new Map();
  }

  const command = [
    "$samples = (Get-Counter -Counter '\\Process(*)\\IO Read Bytes/sec','\\Process(*)\\IO Write Bytes/sec','\\Process(*)\\ID Process' -ErrorAction SilentlyContinue).CounterSamples | Where-Object { $_.Status -eq 0 }",
    "$samples | Group-Object InstanceName | ForEach-Object {",
    "  $processIdSample = $_.Group | Where-Object { $_.Path -match '\\\\id process$' } | Select-Object -First 1",
    "  $read = $_.Group | Where-Object { $_.Path -match '\\\\io read bytes/sec$' } | Select-Object -First 1",
    "  $write = $_.Group | Where-Object { $_.Path -match '\\\\io write bytes/sec$' } | Select-Object -First 1",
    "  if ($null -ne $processIdSample) { [PSCustomObject]@{ pid = [int]$processIdSample.CookedValue; usage = [math]::Max(0, $read.CookedValue + $write.CookedValue) } }",
    "} | ConvertTo-Json -Compress",
  ].join("; ");

  try {
    const { stdout } = await execFileAsync("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      command,
    ], { timeout: 5_000, windowsHide: true, maxBuffer: 1024 * 1024 });

    if (!stdout.trim()) {
      return new Map();
    }

    const samples = JSON.parse(stdout) as { pid: number; usage: number } | { pid: number; usage: number }[];
    return new Map(
      (Array.isArray(samples) ? samples : [samples])
        .filter((sample) => Number.isFinite(sample.pid) && Number.isFinite(sample.usage))
        .map((sample) => [sample.pid, sample.usage]),
    );
  } catch {
    return new Map();
  }
}

export async function getProcesses(): Promise<ProcessInfo[]> {
  const [processes, gpuUsageByProcess, diskUsageByProcess] = await Promise.all([
    si.processes(),
    getGpuUsageByProcess(),
    getDiskUsageByProcess(),
  ]);

  return processes.list.map((proc) => ({
    pid: proc.pid,
    name: proc.name,

    cpu: Number.isFinite(proc.cpu) ? proc.cpu : 0,
    gpu: gpuUsageByProcess.get(proc.pid) ?? 0,
    disk: diskUsageByProcess.get(proc.pid) ?? 0,
    memory: Number((proc.memRss / 1024).toFixed(2)),

    executablePath: proc.path,

    startTime: proc.started ?? null,
    owner: proc.user || null,
    priority: proc.priority,
    commandLine: [proc.command, proc.params]
      .filter(Boolean)
      .join(" ")
      .trim(),

    status: proc.state?.includes("suspended") ? "Suspended" : "Running",

    isCritical: isCriticalProcess(proc.name, proc.path),
  }));
}

export async function endProcess(pid: number): Promise<void> {
  try {
    if (!Number.isInteger(pid) || pid <= 4) {
      throw new Error("Invalid process ID.");
    }

    // Never end Pulse AI itself (main, renderer and helper processes)
    const ownPids = new Set<number>([
      process.pid,
      ...app.getAppMetrics().map((metric) => metric.pid),
    ]);
    if (ownPids.has(pid)) {
      throw new Error("Pulse AI cannot end its own processes.");
    }

    const processes = await si.processes();
    const proc = processes.list.find((p) => p.pid === pid);

    if (!proc) {
      throw new Error(`Process ${pid} not found.`);
    }

    if (isCriticalProcess(proc.name, proc.path)) {
      throw new Error(
        `"${proc.name}" is a protected Windows process and cannot be terminated.`
      );
    }

    await execFileAsync("taskkill", ["/PID", String(pid), "/F"], {
      windowsHide: true,
    });
  } catch (error) {
    console.error(`Failed to terminate process ${pid}:`, error);
    throw error;
  }
}