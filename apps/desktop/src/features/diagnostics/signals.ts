// apps/desktop/src/features/diagnostics/signals.ts

import type { Sample } from "@/types/diagnostics";

// ---------- GPU throttling ----------

export type GpuLimit =
  | "idle"
  | "power-cap"
  | "thermal"
  | "hardware-slowdown"
  | "power-brake"
  | "other";

// NVIDIA "clocks_throttle_reasons" bit flags
const GPU_FLAGS: Array<[number, GpuLimit]> = [
  [0x1, "idle"], // GPU is idle (normal)
  [0x2, "other"], // application clocks setting
  [0x4, "power-cap"], // software power cap
  [0x8, "hardware-slowdown"], // hardware slowdown (heat or power)
  [0x10, "other"], // sync boost
  [0x20, "thermal"], // software thermal slowdown
  [0x40, "thermal"], // hardware thermal slowdown
  [0x80, "power-brake"], // hardware power brake
  [0x100, "other"], // display clock setting
];

export function decodeGpuThrottle(mask: number | null): GpuLimit[] {
  if (mask === null || !Number.isFinite(mask) || mask <= 0) return [];

  const causes = new Set<GpuLimit>();
  for (const [bit, cause] of GPU_FLAGS) {
    if ((mask & bit) !== 0) causes.add(cause);
  }
  return [...causes];
}

/** True when the GPU is being held back from its full speed. */
export function isPerformanceLimiting(causes: GpuLimit[]): boolean {
  return causes.some(
    (cause) =>
      cause === "power-cap" ||
      cause === "thermal" ||
      cause === "hardware-slowdown" ||
      cause === "power-brake"
  );
}

export interface GpuLimitSummary {
  loadedSamples: number;
  share: Partial<Record<GpuLimit, number>>; // 0 to 1, share of loaded samples
}

const GPU_LOADED = 50; // % usage that counts as "under load"

/** How often each limit was active while the GPU was busy. */
export function summarizeGpuLimits(samples: Sample[]): GpuLimitSummary {
  const loaded = samples.filter(
    (s) => s.gpu.usage !== null && s.gpu.usage >= GPU_LOADED
  );

  const counts = new Map<GpuLimit, number>();
  for (const sample of loaded) {
    for (const cause of decodeGpuThrottle(sample.gpu.throttleReasons)) {
      counts.set(cause, (counts.get(cause) ?? 0) + 1);
    }
  }

  const share: Partial<Record<GpuLimit, number>> = {};
  for (const [cause, count] of counts) share[cause] = count / loaded.length;

  return { loadedSamples: loaded.length, share };
}

// ---------- CPU throttling ----------

export interface CpuThrottleSignal {
  status: "ok" | "suspected" | "insufficient-data";
  loadedSamples: number;
  lowClockSamples: number;
  averageClockPercent: number | null;
}

const CPU_HIGH_LOAD = 60; // % usage that counts as "under load"
const CPU_LOW_CLOCK = 90; // % of base clock; boosting CPUs read 100 or more
const CPU_MIN_LOADED_SAMPLES = 5;
const CPU_SUSPECT_SHARE = 0.5;

/**
 * Under heavy load the clock should be at or above base speed. If it stays
 * below, the CPU is probably limited by heat, power or the power plan.
 */
export function detectCpuThrottling(samples: Sample[]): CpuThrottleSignal {
  const loaded = samples.filter(
    (s) =>
      s.cpu.usage !== null &&
      s.cpu.usage >= CPU_HIGH_LOAD &&
      s.cpu.performancePercent !== null
  );

  if (loaded.length < CPU_MIN_LOADED_SAMPLES) {
    return {
      status: "insufficient-data",
      loadedSamples: loaded.length,
      lowClockSamples: 0,
      averageClockPercent: null,
    };
  }

  const clocks = loaded.map((s) => s.cpu.performancePercent as number);
  const lowClockSamples = clocks.filter((c) => c < CPU_LOW_CLOCK).length;
  const average = clocks.reduce((sum, c) => sum + c, 0) / clocks.length;

  return {
    status:
      lowClockSamples / loaded.length >= CPU_SUSPECT_SHARE ? "suspected" : "ok",
    loadedSamples: loaded.length,
    lowClockSamples,
    averageClockPercent: Math.round(average * 10) / 10,
  };
}