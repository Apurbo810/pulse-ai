// apps/desktop/electron/services/diagnostics/index.ts

import { app, ipcMain } from "electron";
import path from "node:path";
import os from "node:os";
import si from "systeminformation";

import type { StartOptions } from "../../../src/types/diagnostics";
import { CounterStream } from "./counters";
import { pickTopProcesses } from "./parsers";
import { Recorder, type SamplerDeps } from "./recorder";
import { recoverInterruptedSessions } from "./recovery";
import {
  readHardwareSummary,
  readIsAdmin,
  readNetwork,
  readNvidia,
} from "./sensors";
import { JsonlSessionStore, isValidSessionId } from "./storage";
import { getCpuInfo, getCpuPerCore, getGpuInfo } from "../system";
import { getDiskUsageByProcess, getGpuUsageByProcess } from "../process";

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

    // os.totalmem/freemem are instant and start no process, unlike si.mem()
    readMemory: async () => {
      const total = os.totalmem();
      const used = total - os.freemem();
      return {
        usedPercent: total > 0 ? (used / total) * 100 : null,
        usedMB: Math.round(used / 1024 / 1024),
      };
    },

    readCounters: () => counters.read(),
    readGpu: readNvidia,
    readNetwork,

    readTopProcesses: async () => {
      // GPU and disk per process come from Windows counters, so read them
      // together with the process list
      const [processes, gpu, disk] = await Promise.all([
        si.processes(),
        getGpuUsageByProcess(),
        getDiskUsageByProcess(),
      ]);
      return pickTopProcesses(processes.list, 5, 3, { gpu, disk });
    },

    readHardware: async () => {
      const gpu = await getGpuInfo().catch(() => null);
      const name = gpu && gpu.model !== "Unknown GPU" ? gpu.model : null;
      return readHardwareSummary(name);
    },

    readIsAdmin,
  };

  const recorder = new Recorder(store, deps, app.getVersion());

  // At startup nothing can be recording, so any unfinished session was cut
  // short. Repair those first, then remove old ones.
  // Keep the last 50 sessions, for at most 30 days.
  const ready = recoverInterruptedSessions(store)
    .then((repaired) => {
      if (repaired > 0) console.log(`Diagnostics: repaired ${repaired} interrupted session(s).`);
      return store.prune({ maxSessions: 50, maxAgeDays: 30 });
    })
    .then(() => undefined)
    .catch((error) => console.error("Diagnostics startup cleanup failed:", error));

  ipcMain.handle("diagnostics:start", async (_event, options: unknown) => {
    await ready; // recovery must not mistake a new recording for an old one
    return recorder.start(sanitizeOptions(options));
  });
  ipcMain.handle("diagnostics:stop", () => recorder.stop());
  ipcMain.handle("diagnostics:status", () => recorder.status());

  ipcMain.handle("diagnostics:list", async () => {
    await ready;
    const sessions = await store.list();
    const live = recorder.status().session;
    // The file on disk lags behind a recording in progress, so show live numbers
    return live ? sessions.map((s) => (s.id === live.id ? live : s)) : sessions;
  });

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