// apps/desktop/electron/services/diagnostics/__tests__/recorder.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Sample, SessionMeta } from "../../../../src/types/diagnostics";
import { Recorder, type SamplerDeps } from "../recorder";
import type { SessionStore } from "../storage";

class MemoryStore implements SessionStore {
  metas = new Map<string, SessionMeta>();
  samples = new Map<string, Sample[]>();

  async create(meta: SessionMeta) {
    this.metas.set(meta.id, meta);
    this.samples.set(meta.id, []);
  }
  async append(id: string, batch: Sample[]) {
    this.samples.get(id)!.push(...batch);
  }
  async finish(id: string, patch: Partial<SessionMeta>) {
    this.metas.set(id, { ...this.metas.get(id)!, ...patch, id });
  }
  async getMeta(id: string) {
    return this.metas.get(id) ?? null;
  }
  async list() {
    return [...this.metas.values()];
  }
  async readSamples(id: string) {
    return this.samples.get(id) ?? [];
  }
  async delete(id: string) {
    this.metas.delete(id);
    this.samples.delete(id);
  }
  async prune() {
    return 0;
  }
}

function makeDeps(overrides: Partial<SamplerDeps> = {}) {
  const calls = { begin: 0, end: 0 };

  const deps: SamplerDeps = {
    begin: () => {
      calls.begin += 1;
    },
    end: () => {
      calls.end += 1;
    },
    readCpu: () => ({ usage: 12, perCore: [10, 14] }),
    readMemory: async () => ({ usedPercent: 40, usedMB: 6000 }),
    readCounters: () => ({
      performancePercent: 105,
      pageFileUsedPercent: 4,
      diskQueue: 0.1,
      diskActivePercent: 2,
    }),
    readGpu: async () => ({
      temperatureC: 50,
      usage: 0,
      powerW: 8,
      coreClockMHz: 300,
      memoryUsedMB: 1200,
      throttleReasons: 1,
    }),
    readNetwork: async () => ({ down: 1000, up: 500 }),
    readTopProcesses: async () => [],
    readHardware: async () => ({
      cpuName: "Test CPU",
      cpuCores: 6,
      cpuBaseGHz: 3.6,
      ramTotalMB: 16000,
      gpuName: "Test GPU",
      disks: [],
      powerPlan: "Balanced",
    }),
    readIsAdmin: async () => false,
    ...overrides,
  };

  return { deps, calls };
}

describe("Recorder", () => {
  let store: MemoryStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemoryStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("records samples on an interval and saves them on stop", async () => {
    const { deps, calls } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(3000);
    const finished = await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(samples.length).toBeGreaterThanOrEqual(3);
    expect(finished?.sampleCount).toBe(samples.length);
    expect(finished?.endedAt).not.toBeNull();
    expect(calls).toEqual({ begin: 1, end: 1 });
  });

  it("records which sensors worked and which did not", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);
    const finished = await recorder.stop();

    expect(finished?.sensors.cpuUsage).toBe(true);
    expect(finished?.sensors.gpuUsage).toBe(true); // 0 % still counts
    expect(finished?.sensors.cpuTemperature).toBe(false);
    expect(finished?.sensors.cpuVoltage).toBe(false);
  });

  it("refuses to start a second recording", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    await recorder.start();
    await expect(recorder.start()).rejects.toThrow();
    await recorder.stop();
  });

  it("stops by itself after the maximum duration", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 10_000 });
    await vi.advanceTimersByTimeAsync(13_000);

    expect(recorder.isRecording()).toBe(false);
    expect((await store.getMeta(meta.id))?.endedAt).not.toBeNull();
  });

  it("keeps recording when a sensor fails", async () => {
    const { deps } = makeDeps({
      readGpu: async () => {
        throw new Error("nvidia-smi crashed");
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);
    const finished = await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(samples.length).toBeGreaterThanOrEqual(2);
    expect(samples[0].gpu.usage).toBeNull();
    expect(samples[0].cpu.usage).toBe(12);
    expect(finished?.sensors.gpuUsage).toBe(false);
  });

  it("exposes live status while recording", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);

    const status = recorder.status();
    expect(status.recording).toBe(true);
    expect(status.lastSample?.cpu.usage).toBe(12);
    await recorder.stop();
    expect(recorder.status().recording).toBe(false);
  });

  it("does nothing when stopped while idle", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");
    expect(await recorder.stop()).toBeNull();
  });
});