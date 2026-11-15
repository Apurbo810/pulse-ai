// apps/desktop/electron/services/diagnostics/recorder.ts

import crypto from "node:crypto";

import type {
  HardwareSummary,
  Reading,
  RecorderStatus,
  Sample,
  SensorAvailability,
  SessionMeta,
  StartOptions,
  TopProcessSample,
} from "../../../src/types/diagnostics";
import type { SessionStore } from "./storage";
import {
  EMPTY_COUNTERS,
  emptyAvailability,
  updateAvailability,
  type CounterValues,
  type NvidiaReading,
} from "./parsers";

/** Everything the recorder reads. Tests replace this with fakes. */
export interface SamplerDeps {
  begin(): void;
  end(): void;
  readCpu(): { usage: Reading; perCore: number[] };
  readMemory(): Promise<{ usedPercent: Reading; usedMB: Reading }>;
  readCounters(): CounterValues;
  readGpu(): Promise<NvidiaReading | null>;
  readNetwork(): Promise<{ down: Reading; up: Reading }>;
  readTopProcesses(): Promise<TopProcessSample[]>;
  readHardware(): Promise<HardwareSummary>;
  readIsAdmin(): Promise<boolean>;
}

const DEFAULT_INTERVAL_MS = 2_000;
const MIN_INTERVAL_MS = 1_000;
const MAX_INTERVAL_MS = 10_000;
const DEFAULT_DURATION_MS = 5 * 60_000;
const MIN_DURATION_MS = 10_000;
const MAX_DURATION_MS = 30 * 60_000;

const FLUSH_EVERY = 5; // samples per disk write
const TOP_PROCESS_EVERY = 3; // reading all processes is expensive
const MAX_PENDING = 500; // memory cap if the disk keeps failing

interface ActiveSession {
  meta: SessionMeta;
  maxDurationMs: number;
  availability: SensorAvailability;
  pending: Sample[];
  count: number;
  ticks: number;
  lastSample: Sample | null;
  timer: ReturnType<typeof setTimeout> | null;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export class Recorder {
  private active: ActiveSession | null = null;
  private starting = false;

  constructor(
    private readonly store: SessionStore,
    private readonly deps: SamplerDeps,
    private readonly appVersion: string
  ) {}

  isRecording(): boolean {
    return this.active !== null;
  }

  async start(options: StartOptions = {}): Promise<SessionMeta> {
    if (this.active || this.starting) {
      throw new Error("A recording is already running.");
    }
    this.starting = true;

    try {
      const intervalMs = clamp(
        options.intervalMs ?? DEFAULT_INTERVAL_MS,
        MIN_INTERVAL_MS,
        MAX_INTERVAL_MS
      );
      const maxDurationMs = clamp(
        options.maxDurationMs ?? DEFAULT_DURATION_MS,
        MIN_DURATION_MS,
        MAX_DURATION_MS
      );

      const [hardware, isAdmin] = await Promise.all([
        this.deps.readHardware(),
        this.deps.readIsAdmin(),
      ]);

      const meta: SessionMeta = {
        id: `s-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
        reason: options.reason ?? "manual",
        startedAt: Date.now(),
        endedAt: null,
        intervalMs,
        sampleCount: 0,
        isAdmin,
        hardware,
        sensors: emptyAvailability(),
        appVersion: this.appVersion,
      };

      await this.store.create(meta);

      const active: ActiveSession = {
        meta,
        maxDurationMs,
        availability: emptyAvailability(),
        pending: [],
        count: 0,
        ticks: 0,
        lastSample: null,
        timer: null,
      };

      this.active = active;
      this.deps.begin();
      void this.tick(active);

      return meta;
    } finally {
      this.starting = false;
    }
  }

  async stop(): Promise<SessionMeta | null> {
    const active = this.active;
    if (!active) return null;

    this.active = null;
    if (active.timer) clearTimeout(active.timer);
    this.deps.end();

    await this.flush(active);
    await this.store.finish(active.meta.id, {
      endedAt: Date.now(),
      sampleCount: active.count,
      sensors: active.availability,
    });

    return this.store.getMeta(active.meta.id);
  }

  status(): RecorderStatus {
    const active = this.active;

    return {
      recording: active !== null,
      session: active
        ? {
            ...active.meta,
            sampleCount: active.count,
            sensors: active.availability,
          }
        : null,
      elapsedMs: active ? Date.now() - active.meta.startedAt : 0,
      sampleCount: active?.count ?? 0,
      lastSample: active?.lastSample ?? null,
    };
  }

  private async tick(active: ActiveSession): Promise<void> {
    if (this.active !== active) return;

    try {
      const sample = await this.collect(active);
      if (this.active !== active) return; // stopped while reading

      active.ticks += 1;
      active.count += 1;
      active.lastSample = sample;
      updateAvailability(active.availability, sample);
      active.pending.push(sample);

      if (active.pending.length >= FLUSH_EVERY) await this.flush(active);
    } catch (error) {
      console.error("Diagnostics sample failed:", error);
    }

    if (this.active !== active) return;

    if (Date.now() - active.meta.startedAt >= active.maxDurationMs) {
      await this.stop();
      return;
    }

    active.timer = setTimeout(() => void this.tick(active), active.meta.intervalMs);
  }

  /** Reads every sensor. A sensor that fails gives null, never an error. */
  private async collect(active: ActiveSession): Promise<Sample> {
    const readTop = active.ticks % TOP_PROCESS_EVERY === 0;

    const [memory, gpu, network, top] = await Promise.all([
      this.deps.readMemory().catch(() => null),
      this.deps.readGpu().catch(() => null),
      this.deps.readNetwork().catch(() => null),
      readTop
        ? this.deps.readTopProcesses().catch((): TopProcessSample[] => [])
        : Promise.resolve<TopProcessSample[]>([]),
    ]);

    let cpu: { usage: Reading; perCore: number[] } = { usage: null, perCore: [] };
    try {
      cpu = this.deps.readCpu();
    } catch {
      // keep the empty reading
    }

    let counters: CounterValues = EMPTY_COUNTERS;
    try {
      counters = this.deps.readCounters();
    } catch {
      // keep the empty reading
    }

    return {
      t: Date.now(),
      cpu: {
        usage: cpu.usage,
        perCore: cpu.perCore,
        performancePercent: counters.performancePercent,
        temperatureC: null, // not available on most PCs yet
        voltageV: null,
      },
      memory: {
        usedPercent: memory?.usedPercent ?? null,
        usedMB: memory?.usedMB ?? null,
        pageFileUsedPercent: counters.pageFileUsedPercent,
      },
      gpu: {
        usage: gpu?.usage ?? null,
        temperatureC: gpu?.temperatureC ?? null,
        powerW: gpu?.powerW ?? null,
        coreClockMHz: gpu?.coreClockMHz ?? null,
        memoryUsedMB: gpu?.memoryUsedMB ?? null,
        throttleReasons: gpu?.throttleReasons ?? null,
      },
      disk: {
        activePercent: counters.diskActivePercent,
        queueLength: counters.diskQueue,
      },
      network: {
        downBytesPerSec: network?.down ?? null,
        upBytesPerSec: network?.up ?? null,
      },
      topProcesses: top,
    };
  }

  private async flush(active: ActiveSession): Promise<void> {
    if (active.pending.length === 0) return;

    const batch = active.pending.splice(0, active.pending.length);
    try {
      await this.store.append(active.meta.id, batch);
    } catch (error) {
      console.error("Diagnostics write failed:", error);
      // Keep the samples and retry on the next flush, up to a limit
      active.pending.unshift(...batch);
      if (active.pending.length > MAX_PENDING) {
        active.pending.splice(0, active.pending.length - MAX_PENDING);
      }
    }
  }
}