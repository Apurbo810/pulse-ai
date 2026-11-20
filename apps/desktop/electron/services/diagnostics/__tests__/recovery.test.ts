// apps/desktop/electron/services/diagnostics/__tests__/recovery.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import type { Sample, SessionMeta } from "../../../../src/types/diagnostics";
import { recoverInterruptedSessions } from "../recovery";
import { JsonlSessionStore } from "../storage";

function makeMeta(
  id: string,
  startedAt: number,
  endedAt: number | null = null
): SessionMeta {
  return {
    id,
    reason: "manual",
    startedAt,
    endedAt,
    state: endedAt === null ? "recording" : "completed",
    intervalMs: 1000,
    sampleCount: 0,
    isAdmin: false,
    appVersion: "test",
    hardware: {} as SessionMeta["hardware"],
    sensors: {} as SessionMeta["sensors"],
  };
}

function fullSample(t: number, cpuUsage: number | null): Sample {
  return {
    t,
    cpu: { usage: cpuUsage, perCore: [], performancePercent: null, temperatureC: null, voltageV: null },
    memory: { usedPercent: null, usedMB: null, pageFileUsedPercent: null },
    gpu: { usage: null, temperatureC: null, powerW: null, coreClockMHz: null, memoryUsedMB: null, throttleReasons: null },
    disk: { activePercent: null, queueLength: null },
    network: { downBytesPerSec: null, upBytesPerSec: null },
    topProcesses: [],
  };
}

describe("recoverInterruptedSessions", () => {
  let dir: string;
  let store: JsonlSessionStore;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-recovery-"));
    store = new JsonlSessionStore(dir);
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("rebuilds the metadata of a session that never finished", async () => {
    await store.create(makeMeta("cut", 1000));
    await store.append("cut", [
      fullSample(2000, 10),
      fullSample(3000, 20),
      fullSample(4000, 30),
    ]);

    expect(await recoverInterruptedSessions(store)).toBe(1);

    const meta = await store.getMeta("cut");
    expect(meta?.endedAt).toBe(4000);
    expect(meta?.state).toBe("interrupted");
    expect(meta?.sampleCount).toBe(3);
    expect(meta?.sensors.cpuUsage).toBe(true);
    expect(meta?.sensors.cpuTemperature).toBe(false);
  });

  it("leaves sessions that finished normally alone", async () => {
    const done = { ...makeMeta("done", 1000, 5000), sampleCount: 9 };
    await store.create(done);

    expect(await recoverInterruptedSessions(store)).toBe(0);

    const meta = await store.getMeta("done");
    expect(meta?.sampleCount).toBe(9);
    expect(meta?.state).toBe("completed");
  });

  it("handles a session that was cut off before any sample was saved", async () => {
    await store.create(makeMeta("empty", 1000));

    await recoverInterruptedSessions(store);

    const meta = await store.getMeta("empty");
    expect(meta?.sampleCount).toBe(0);
    expect(meta?.endedAt).toBe(1000);
    expect(meta?.state).toBe("interrupted");
  });

  it("does not touch the session that is recording right now", async () => {
    await store.create(makeMeta("live", 1000));

    expect(await recoverInterruptedSessions(store, "live")).toBe(0);
    expect((await store.getMeta("live"))?.endedAt).toBeNull();
  });
  
});