// apps/desktop/electron/services/diagnostics/index.ts

import { app, ipcMain } from "electron";
import path from "node:path";
import si from "systeminformation";

import type { StartOptions } from "../../../src/types/diagnostics";
import { CounterStream } from "./counters";
import { pickTopProcesses } from "./parsers";
import { Recorder, type SamplerDeps } from "./recorder";
import {
  readHardwareSummary,
  readIsAdmin,
  readNetwork,
  readNvidia,
} from "./sensors";
import { JsonlSessionStore, isValidSessionId } from "./storage";
import {
  getCpuInfo,
  getCpuPerCore,
  getGpuInfo,
  getMemoryInfo,
} from "../system";

// The renderer can send anything, so only accept plain numbers.
// Recordings started from the UI are always "manual".
function sanitizeOptions(input: unknown): StartOptions {
  const raw = (input ?? {}) as Record<string, unknown>;
  const options: StartOptions = { reason: "manual" };
  if (typeof raw.intervalMs === "number") options.intervalMs = raw.intervalMs;
  if (typeof raw.maxDurationMs === "number") options.maxDurationMs = raw.maxDurationMs;
  return options;
}

export function createDiagnostics() {
  const store = new JsonlSessionStore(
    path.join(app.getPath("userData"), "diagnostics")
  );
  const counters = new CounterStream(2);

  const deps: SamplerDeps = {
    begin: () => counters.start(),
    end: () => counters.stop(),

    readCpu: () => ({ usage: getCpuInfo().usage, perCore: getCpuPerCore() }),

    readMemory: async () => {
      const memory = await getMemoryInfo();
      return {
        usedPercent: memory.total > 0 ? (memory.used / memory.total) * 100 : null,
        usedMB: Math.round(memory.used / 1024 / 1024),
      };
    },

    readCounters: () => counters.read(),
    readGpu: readNvidia,
    readNetwork,

    readTopProcesses: async () => pickTopProcesses((await si.processes()).list),

    readHardware: async () => {
      const gpu = await getGpuInfo().catch(() => null);
      const name = gpu && gpu.model !== "Unknown GPU" ? gpu.model : null;
      return readHardwareSummary(name);
    },

    readIsAdmin,
  };

  const recorder = new Recorder(store, deps, app.getVersion());

  // Keep the last 50 sessions, for at most 30 days
  void store
    .prune({ maxSessions: 50, maxAgeDays: 30 })
    .catch((error) => console.error("Diagnostics prune failed:", error));

  ipcMain.handle("diagnostics:start", (_event, options: unknown) =>
    recorder.start(sanitizeOptions(options))
  );
  ipcMain.handle("diagnostics:stop", () => recorder.stop());
  ipcMain.handle("diagnostics:status", () => recorder.status());
  ipcMain.handle("diagnostics:list", () => store.list());

  ipcMain.handle("diagnostics:getSamples", (_event, id: unknown) => {
    if (!isValidSessionId(id)) throw new Error("Invalid session id.");
    return store.readSamples(id);
  });

  ipcMain.handle("diagnostics:remove", async (_event, id: unknown) => {
    if (!isValidSessionId(id)) throw new Error("Invalid session id.");
    if (recorder.status().session?.id === id) {
      throw new Error("Stop the recording before deleting it.");
    }
    await store.delete(id);
  });

  return {
    isRecording: () => recorder.isRecording(),
    stop: () => recorder.stop(),
  };
}