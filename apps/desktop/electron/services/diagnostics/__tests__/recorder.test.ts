// apps/desktop/electron/services/diagnostics/__tests__/recorder.test.ts

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Sample, SessionMeta } from "../../../../src/types/diagnostics";
import { Recorder, type SamplerDeps } from "../recorder";
import type { SessionStore } from "../storage";

class MemoryStore implements SessionStore {
  metas = new Map<string, SessionMeta>();
  samples = new Map<string, Sample[]>();

  async create(meta: SessionMeta) {
    this.metas.set(meta.id, { ...meta });
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

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const GPU_READING = {
  temperatureC: 50,
  usage: 10,
  powerW: 8,
  coreClockMHz: 300,
  memoryUsedMB: 1200,
  throttleReasons: 1,
};

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
    readGpu: async () => ({ ...GPU_READING, usage: 0 }),
    readNetwork: async () => ({ down: 1000, up: 500, adapter: "Ethernet" }),
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

function gapsOf(samples: Sample[]): number[] {
  return samples.slice(1).map((s, i) => s.t - samples[i].t);
}

describe("Recorder", () => {
  let store: MemoryStore;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new MemoryStore();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
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
    expect(finished?.state).toBe("completed");
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
    const saved = await store.getMeta(meta.id);
    expect(saved?.endedAt).not.toBeNull();
    expect(saved?.state).toBe("completed");
  });

  it("keeps recording when a sensor fails, and counts the failures", async () => {
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
    expect(finished?.sensorTiming?.gpu.failures).toBeGreaterThanOrEqual(1);
  });

  it("exposes live status while recording", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);

    const status = recorder.status();
    expect(status.recording).toBe(true);
    expect(status.session?.state).toBe("recording");
    expect(status.lastSample?.cpu.usage).toBe(12);
    await recorder.stop();
    expect(recorder.status().recording).toBe(false);
  });

  it("does nothing when stopped while idle", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");
    expect(await recorder.stop()).toBeNull();
  });

  // ---------- Day 3 reliability ----------

  it("takes samples on a fixed schedule even when every sensor is slow", async () => {
    const { deps } = makeDeps({
      readMemory: async () => {
        await sleep(800);
        return { usedPercent: 40, usedMB: 6000 };
      },
      readGpu: async () => {
        await sleep(300);
        return GPU_READING;
      },
      readNetwork: async () => {
        await sleep(1200);
        return { down: 1000, up: 500, adapter: "Ethernet" };
      },
      readTopProcesses: async () => {
        await sleep(1500);
        return [];
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 2000, maxDurationMs: 120_000 });
    await vi.advanceTimersByTimeAsync(20_000);
    const finished = await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(samples.length).toBeGreaterThanOrEqual(10);
    expect(new Set(gapsOf(samples))).toEqual(new Set([2000]));
    expect(finished?.skippedSlots).toBe(0);
    expect(finished?.maxLagMs).toBe(0);
  });

  it("does not wait for a slow sensor, and fills it in once it answers", async () => {
    const { deps } = makeDeps({
      readGpu: async () => {
        await sleep(3500); // far longer than the 1000 ms interval
        return GPU_READING;
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(10_000);
    await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(new Set(gapsOf(samples))).toEqual(new Set([1000]));
    expect(samples[0].gpu.usage).toBeNull(); // not answered yet
    expect(samples[samples.length - 1].gpu.usage).toBe(10);
  });

  it("stores old readings as missing instead of repeating them", async () => {
    let calls = 0;
    const { deps } = makeDeps({
      readGpu: async () => {
        calls += 1;
        if (calls > 1) return new Promise<never>(() => {}); // never answers again
        return GPU_READING;
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(12_000);
    await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(samples[1].gpu.usage).toBe(10); // still fresh
    expect(samples[samples.length - 1].gpu.usage).toBeNull(); // too old now
  });

  it("skips missed slots and counts them after a stall", async () => {
    let calls = 0;
    const { deps } = makeDeps({
      readCpu: () => {
        calls += 1;
        // Simulate the app being frozen for 4.5 seconds during the third tick
        if (calls === 3) vi.setSystemTime(Date.now() + 4500);
        return { usage: 12, perCore: [10, 14] };
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 120_000 });
    await vi.advanceTimersByTimeAsync(2500);
    await vi.advanceTimersByTimeAsync(3000);
    const finished = await recorder.stop();

    const samples = await store.readSamples(meta.id);
    const gaps = gapsOf(samples);
    expect(finished?.skippedSlots).toBeGreaterThanOrEqual(3);
    expect(gaps.every((gap) => gap % 1000 === 0)).toBe(true);
    expect(Math.max(...gaps)).toBeGreaterThanOrEqual(4000);
  });

  it("records how long each sensor took", async () => {
    const { deps } = makeDeps({
      readGpu: async () => {
        await sleep(100);
        return GPU_READING;
      },
      readTopProcesses: async () => {
        await sleep(400);
        return [];
      },
    });
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(7000);
    const finished = await recorder.stop();

    expect(finished?.sensorTiming?.gpu.maxMs).toBeGreaterThanOrEqual(100);
    expect(finished?.sensorTiming?.processes.runs).toBeGreaterThanOrEqual(1);
    expect(finished?.sensorTiming?.processes.maxMs).toBeGreaterThanOrEqual(400);
  });

  it("never runs two top-process reads at the same time", async () => {
    let running = 0;
    let maxRunning = 0;
    let calls = 0;

    const { deps } = makeDeps({
      readTopProcesses: async () => {
        calls += 1;
        running += 1;
        maxRunning = Math.max(maxRunning, running);
        await sleep(5000);
        running -= 1;
        return [];
      },
    });
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(12_000);
    await recorder.stop();

    expect(calls).toBeGreaterThanOrEqual(2);
    expect(maxRunning).toBe(1);
  });

  it("attaches each finished process-list read to exactly one sample", async () => {
    const { deps } = makeDeps({
      readTopProcesses: async () => {
        await sleep(500);
        return [
          { pid: 7, name: "game.exe", cpu: 5, memoryMB: 900, gpu: 80, diskMBps: 0 },
        ];
      },
    });
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(8000);
    await recorder.stop();

    const samples = await store.readSamples(meta.id);
    const withTop = samples.filter((s) => s.topProcesses.length > 0);
    expect(withTop.length).toBeGreaterThanOrEqual(2);
    expect(withTop.length).toBeLessThan(samples.length);
    expect(withTop[0].topProcesses[0].gpu).toBe(80);
  });

  it("saves progress while recording, so the metadata is never stuck at 0", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(6000);

    const midway = await store.getMeta(meta.id);
    expect(midway?.sampleCount).toBeGreaterThanOrEqual(5);
    expect(midway?.endedAt).toBeNull();
    expect(midway?.state).toBe("recording");
    expect(midway?.sensors.cpuUsage).toBe(true);
    expect(midway?.skippedSlots).toBe(0);

    const finished = await recorder.stop();
    const samples = await store.readSamples(meta.id);
    expect(finished?.sampleCount).toBe(samples.length);
    expect(finished?.state).toBe("completed");
  });

  it("only counts samples that really reached the disk", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    store.append = async () => {
      throw new Error("disk full");
    };
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(6000);
    const finished = await recorder.stop();

    expect(finished?.sampleCount).toBe(0);
    expect(await store.readSamples(meta.id)).toHaveLength(0);
  });

  it("records which network adapter the speeds came from", async () => {
    const { deps } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    const meta = await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);
    await recorder.stop();

    const samples = await store.readSamples(meta.id);
    expect(samples[0].network.adapter).toBe("Ethernet");
  });

  it("still stops cleanly when the final metadata save fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    store.finish = async () => {
      throw new Error("locked");
    };
    const { deps, calls } = makeDeps();
    const recorder = new Recorder(store, deps, "test");

    await recorder.start({ intervalMs: 1000, maxDurationMs: 60_000 });
    await vi.advanceTimersByTimeAsync(2000);
    const result = await recorder.stop();

    expect(result?.endedAt).not.toBeNull();
    expect(recorder.isRecording()).toBe(false);
    expect(calls.end).toBe(1);
  });
});