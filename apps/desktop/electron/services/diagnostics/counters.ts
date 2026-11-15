// apps/desktop/electron/services/diagnostics/counters.ts

import { spawn, type ChildProcess } from "node:child_process";
import {
  EMPTY_COUNTERS,
  parseCounterLine,
  type CounterValues,
} from "./parsers";

// These names are English. On a non-English Windows the stream produces nothing
// and every counter reads as null (the recording still works).
const COUNTERS = [
  "\\Processor Information(_Total)\\% Processor Performance",
  "\\Paging File(_Total)\\% Usage",
  "\\PhysicalDisk(_Total)\\Avg. Disk Queue Length",
  "\\PhysicalDisk(_Total)\\% Disk Time",
];

function buildCommand(intervalSec: number): string {
  const list = COUNTERS.map((c) => `'${c}'`).join(",");

  return [
    `Get-Counter -Counter ${list} -SampleInterval ${intervalSec} -Continuous -ErrorAction Stop`,
    "ForEach-Object { $o = [ordered]@{}; foreach ($s in $_.CounterSamples) { $o[$s.Path] = [math]::Round($s.CookedValue, 3) }; $o | ConvertTo-Json -Compress }",
  ].join(" | ");
}

/**
 * One long-running PowerShell process that prints a JSON line per sample.
 * This is much cheaper than starting PowerShell for every sample.
 */
export class CounterStream {
  private child: ChildProcess | null = null;
  private buffer = "";
  private latest: CounterValues = EMPTY_COUNTERS;
  private latestAt = 0;

  constructor(private readonly intervalSec = 2) {}

  start(): void {
    if (this.child || process.platform !== "win32") return;

    this.buffer = "";
    this.latest = EMPTY_COUNTERS;
    this.latestAt = 0;

    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-Command", buildCommand(this.intervalSec)],
      { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }
    );

    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (chunk: string) => this.onData(chunk));
    child.on("error", () => {
      if (this.child === child) this.child = null;
    });
    child.on("exit", () => {
      if (this.child === child) this.child = null;
    });

    this.child = child;
  }

  stop(): void {
    const child = this.child;
    this.child = null;
    if (child && !child.killed) child.kill();
  }

  /** Latest values, or all-null if nothing arrived recently. */
  read(): CounterValues {
    const maxAgeMs = this.intervalSec * 1000 * 3;
    if (Date.now() - this.latestAt > maxAgeMs) return EMPTY_COUNTERS;
    return this.latest;
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      const values = parseCounterLine(line.trim());
      if (values) {
        this.latest = values;
        this.latestAt = Date.now();
      }
    }
  }
}