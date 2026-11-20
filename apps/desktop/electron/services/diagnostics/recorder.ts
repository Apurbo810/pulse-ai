// apps/desktop/electron/services/diagnostics/recorder.ts

import crypto from "node:crypto";

import type {
  HardwareSummary,
  Reading,
  RecorderStatus,
  Sample,
  SensorAvailability,
  SensorTiming,
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
  readNetwork(): Promise<{
    down: Reading;
    up: Reading;
    adapter?: string | null;
  }>;
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
const TOP_PROCESS_EVERY = 3; // the process list is read once per this many intervals
const MAX_PENDING = 500; // memory cap if the disk keeps failing
const WARMUP_MAX_MS = 1_500; // the first sample waits this long for first readings
const MIN_STALE_MS = 5_000; // readings older than this (or 3 intervals) count as missing

interface MemoryReading {
  usedPercent: Reading;
  usedMB: Reading;
}

interface NetworkReading {
  down: Reading;
  up: Reading;
  adapter?: string | null;
}

/**
 * Runs one slow sensor read in a loop of its own, never two at the same time,
 * and keeps the latest result. A sampling tick only copies the latest value,
 * so a slow sensor can never delay a sample.
 */
class Poller<T> {
  readonly firstRun: Promise<void>;

  private resolveFirst: () => void = () => {};
  private value: T | null = null;
  private finishedAt = 0;
  private version = 0;
  private takenVersion = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private stopped = true;
  private runs = 0;
  private totalMs = 0;
  private maxMs = 0;
  private failures = 0;

  constructor(
    private readonly read: () => Promise<T>,
    private readonly everyMs: number
  ) {
    this.firstRun = new Promise<void>((resolve) => {
      this.resolveFirst = resolve;
    });
  }

  start(): void {
    this.stopped = false;
    void this.loop();
  }

  stop(): void {
    this.stopped = true;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** The latest value, or null when there is none or it is too old. */
  fresh(maxAgeMs: number): T | null {
    if (this.value === null) return null;
    return Date.now() - this.finishedAt <= maxAgeMs ? this.value : null;
  }

  /** The latest value once, then null until a newer read has finished. */
  take(): T | null {
    if (this.version === this.takenVersion) return null;
    this.takenVersion = this.version;
    return this.value;
  }

  summary(): SensorTiming | null {
    if (this.runs === 0) return null;
    return {
      runs: this.runs,
      avgMs: Math.round(this.totalMs / this.runs),
      maxMs: this.maxMs,
      failures: this.failures,
    };
  }

  private async loop(): Promise<void> {
    if (this.stopped) return;

    const began = Date.now();
    try {
      const result = await this.read();
      if (this.stopped) return;
      this.value = result;
      this.finishedAt = Date.now();
      this.version += 1;
      this.note(Date.now() - began, false);
    } catch {
      if (this.stopped) return;
      this.note(Date.now() - began, true);
    }

    this.resolveFirst();
    if (this.stopped) return;

    // Start-to-start spacing. If a read took longer than that, start again at once.
    const wait = Math.max(0, this.everyMs - (Date.now() - began));
    this.timer = setTimeout(() => void this.loop(), wait);
  }

  private note(ms: number, failed: boolean): void {
    this.runs += 1;
    this.totalMs += ms;
    this.maxMs = Math.max(this.maxMs, ms);
    if (failed) this.failures += 1;
  }
}

interface Pollers {
  memory: Poller<MemoryReading>;
  gpu: Poller<NvidiaReading | null>;
  network: Poller<NetworkReading>;
  top: Poller<TopProcessSample[]>;
}

interface ActiveSession {
  meta: SessionMeta;
  maxDurationMs: number;
  availability: SensorAvailability;
  pending: Sample[]; // collected, not yet on disk
  collected: number; // samples taken
  written: number; // samples safely on disk
  warmedUp: boolean;
  nextDueAt: number; // fixed schedule, so slow reads cannot cause drift
  skipped: number; // slots lost because the app was stalled
  maxLagMs: number;
  lastSample: Sample | null;
  timer: ReturnType<typeof setTimeout> | null;
  staleAfterMs: number;
  pollers: Pollers;
  writeChain: Promise<void>; // keeps disk writes in order
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
        state: "recording",
        intervalMs,
        sampleCount: 0,
        isAdmin,
        hardware,
        sensors: emptyAvailability(),
        appVersion: this.appVersion,
      };

      await this.store.create(meta);

      const pollers: Pollers = {
        memory: new Poller(() => this.deps.readMemory(), intervalMs),
        gpu: new Poller(() => this.deps.readGpu(), intervalMs),
        network: new Poller(() => this.deps.readNetwork(), intervalMs),
        top: new Poller(
          () => this.deps.readTopProcesses(),
          intervalMs * TOP_PROCESS_EVERY
        ),
      };

      const active: ActiveSession = {
        meta,
        maxDurationMs,
        availability: emptyAvailability(),
        pending: [],
        collected: 0,
        written: 0,
        warmedUp: false,
        nextDueAt: meta.startedAt,
        skipped: 0,
        maxLagMs: 0,
        lastSample: null,
        timer: null,
        staleAfterMs: Math.max(intervalMs * 3, MIN_STALE_MS),
        pollers,
        writeChain: Promise.resolve(),
      };

      this.active = active;
      this.deps.begin();
      pollers.memory.start();
      pollers.gpu.start();
      pollers.network.start();
      pollers.top.start();
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
    this.stopPollers(active);

    await this.flush(active);

    const patch = {
      endedAt: Date.now(),
      state: "completed" as const,
      sampleCount: active.written, // only what really reached the disk
      sensors: { ...active.availability },
      ...this.diagnosticsOf(active),
    };

    try {
      await this.store.finish(active.meta.id, patch);
      return (await this.store.getMeta(active.meta.id)) ?? { ...active.meta, ...patch };
    } catch (error) {
      // The recording itself is saved. The next start repairs the metadata.
      console.error("Diagnostics final save failed:", error);
      return { ...active.meta, ...patch };
    }
  }

  status(): RecorderStatus {
    const active = this.active;

    return {
      recording: active !== null,
      session: active
        ? {
            ...active.meta,
            state: "recording",
            sampleCount: active.collected,
            sensors: { ...active.availability },
            ...this.diagnosticsOf(active),
          }
        : null,
      elapsedMs: active ? Date.now() - active.meta.startedAt : 0,
      sampleCount: active?.collected ?? 0,
      lastSample: active?.lastSample ?? null,
    };
  }

  private stopPollers(active: ActiveSession): void {
    active.pollers.memory.stop();
    active.pollers.gpu.stop();
    active.pollers.network.stop();
    active.pollers.top.stop();
  }

  /** Timing facts for the session file, so a slow sensor can be identified. */
  private diagnosticsOf(active: ActiveSession) {
    const sensorTiming: Record<string, SensorTiming> = {};
    const add = (name: string, timing: SensorTiming | null) => {
      if (timing) sensorTiming[name] = timing;
    };
    add("memory", active.pollers.memory.summary());
    add("gpu", active.pollers.gpu.summary());
    add("network", active.pollers.network.summary());
    add("processes", active.pollers.top.summary());

    return {
      sensorTiming,
      skippedSlots: active.skipped,
      maxLagMs: active.maxLagMs,
    };
  }

  private async tick(active: ActiveSession): Promise<void> {
    if (this.active !== active) return;

    const slot = active.nextDueAt;
    const lagMs = Math.max(0, Date.now() - slot);
    active.maxLagMs = Math.max(active.maxLagMs, lagMs);

    // Only the first sample waits (briefly) so it is not empty
    if (!active.warmedUp) await this.warmUp(active);
    if (this.active !== active) return; // stopped while waiting

    try {
      const sample = this.buildSample(active, slot, lagMs);
      active.collected += 1;
      active.lastSample = sample;
      updateAvailability(active.availability, sample);
      active.pending.push(sample);

      // Not awaited: the next tick must not wait for the disk
      if (active.pending.length >= FLUSH_EVERY) void this.flush(active);
    } catch (error) {
      console.error("Diagnostics sample failed:", error);
    }

    if (this.active !== active) return;

    if (Date.now() - active.meta.startedAt >= active.maxDurationMs) {
      try {
        await this.stop();
      } catch (error) {
        console.error("Diagnostics auto-stop failed:", error);
      }
      return;
    }

    this.scheduleNext(active);
  }

  private async warmUp(active: ActiveSession): Promise<void> {
    active.warmedUp = true;

    const wait = Math.min(WARMUP_MAX_MS, active.meta.intervalMs);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>((resolve) => {
      timer = setTimeout(resolve, wait);
    });

    await Promise.race([
      Promise.all([
        active.pollers.memory.firstRun,
        active.pollers.gpu.firstRun,
        active.pollers.network.firstRun,
      ]),
      timeout,
    ]);

    if (timer) clearTimeout(timer);
  }

  private scheduleNext(active: ActiveSession): void {
    const interval = active.meta.intervalMs;
    const now = Date.now();

    active.nextDueAt += interval;
    // If the app was stalled, skip the missed slots (and count them)
    // instead of taking several samples in a row
    while (active.nextDueAt < now) {
      active.nextDueAt += interval;
      active.skipped += 1;
    }

    active.timer = setTimeout(
      () => void this.tick(active),
      active.nextDueAt - now
    );
  }

  /**
   * Builds a sample from the latest readings. Nothing here waits for a sensor.
   * `t` is the scheduled slot time, so samples are evenly spaced. How late the
   * tick really fired is stored in `lagMs`.
   */
  private buildSample(active: ActiveSession, t: number, lagMs: number): Sample {
    const { pollers, staleAfterMs } = active;

    const memory = pollers.memory.fresh(staleAfterMs);
    const gpu = pollers.gpu.fresh(staleAfterMs);
    const network = pollers.network.fresh(staleAfterMs);

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
      t,
      lagMs,
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
        adapter: network?.adapter ?? null,
      },
      // Each finished process-list read is attached to exactly one sample
      topProcesses: pollers.top.take() ?? [],
    };
  }

  /**
   * Writes happen one at a time, in order. After each successful write the
   * session metadata is updated too, so a crash or restart still leaves an
   * accurate sample count behind.
   */
  private flush(active: ActiveSession): Promise<void> {
    const run = async (): Promise<void> => {
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
        return;
      }

      active.written += batch.length;

      try {
        await this.store.finish(active.meta.id, {
          sampleCount: active.written,
          sensors: { ...active.availability },
          ...this.diagnosticsOf(active),
        });
      } catch (error) {
        console.error("Diagnostics progress save failed:", error);
      }
    };

    // run() never rejects, so the chain can never get stuck
    active.writeChain = active.writeChain.then(run);
    return active.writeChain;
  }
}