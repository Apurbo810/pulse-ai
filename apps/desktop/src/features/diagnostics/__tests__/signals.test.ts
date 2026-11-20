// apps/desktop/src/features/diagnostics/__tests__/signals.test.ts

import { describe, expect, it } from "vitest";

import type { Sample } from "@/types/diagnostics";
import {
  decodeGpuThrottle,
  detectCpuThrottling,
  isPerformanceLimiting,
  summarizeGpuLimits,
} from "../signals";

function makeSample(opts: {
  cpu?: number | null;
  clock?: number | null;
  gpu?: number | null;
  mask?: number | null;
}): Sample {
  return {
    t: 0,
    cpu: {
      usage: opts.cpu ?? null,
      perCore: [],
      performancePercent: opts.clock ?? null,
      temperatureC: null,
      voltageV: null,
    },
    memory: { usedPercent: null, usedMB: null, pageFileUsedPercent: null },
    gpu: {
      usage: opts.gpu ?? null,
      temperatureC: null,
      powerW: null,
      coreClockMHz: null,
      memoryUsedMB: null,
      throttleReasons: opts.mask ?? null,
    },
    disk: { activePercent: null, queueLength: null },
    network: { downBytesPerSec: null, upBytesPerSec: null },
    topProcesses: [],
  };
}

function repeat(count: number, sample: Sample): Sample[] {
  return Array.from({ length: count }, () => sample);
}

describe("decodeGpuThrottle", () => {
  it("reads the idle flag your GTX 1650 reports", () => {
    expect(decodeGpuThrottle(1)).toEqual(["idle"]);
  });

  it("returns nothing for 0, null or unknown values", () => {
    expect(decodeGpuThrottle(0)).toEqual([]);
    expect(decodeGpuThrottle(null)).toEqual([]);
    expect(decodeGpuThrottle(NaN)).toEqual([]);
  });

  it("merges flags and removes duplicates", () => {
    expect(decodeGpuThrottle(0x4 | 0x20 | 0x40)).toEqual([
      "power-cap",
      "thermal",
    ]);
  });

  it("treats heat and power limits as limiting, but not idle", () => {
    expect(isPerformanceLimiting(["idle"])).toBe(false);
    expect(isPerformanceLimiting(["other"])).toBe(false);
    expect(isPerformanceLimiting([])).toBe(false);
    expect(isPerformanceLimiting(["thermal"])).toBe(true);
    expect(isPerformanceLimiting(["idle", "power-cap"])).toBe(true);
  });
});

describe("summarizeGpuLimits", () => {
  it("counts causes only while the GPU is loaded", () => {
    const summary = summarizeGpuLimits([
      makeSample({ gpu: 90, mask: 0x20 }),
      makeSample({ gpu: 90, mask: 0 }),
      makeSample({ gpu: 10, mask: 0x20 }), // idle, so it is ignored
    ]);
    expect(summary).toEqual({ loadedSamples: 2, share: { thermal: 0.5 } });
  });

  it("returns an empty summary when the GPU was never loaded", () => {
    expect(summarizeGpuLimits(repeat(3, makeSample({ gpu: 5, mask: 0x20 })))).toEqual({
      loadedSamples: 0,
      share: {},
    });
  });
});

describe("detectCpuThrottling", () => {
  it("needs enough loaded samples before it says anything", () => {
    const result = detectCpuThrottling(repeat(4, makeSample({ cpu: 90, clock: 50 })));
    expect(result.status).toBe("insufficient-data");
    expect(result.loadedSamples).toBe(4);
  });

  it("is ok when the clock stays at or above base under load", () => {
    const result = detectCpuThrottling(repeat(6, makeSample({ cpu: 80, clock: 105 })));
    expect(result.status).toBe("ok");
    expect(result.lowClockSamples).toBe(0);
    expect(result.averageClockPercent).toBe(105);
  });

  it("suspects throttling when the clock stays low under load", () => {
    const result = detectCpuThrottling(repeat(6, makeSample({ cpu: 80, clock: 70 })));
    expect(result.status).toBe("suspected");
    expect(result.lowClockSamples).toBe(6);
    expect(result.averageClockPercent).toBe(70);
  });

  it("ignores low-load samples and samples without a clock reading", () => {
    const result = detectCpuThrottling([
      ...repeat(10, makeSample({ cpu: 10, clock: 40 })), // low clock at idle is normal
      ...repeat(3, makeSample({ cpu: 90, clock: null })), // no reading
      ...repeat(6, makeSample({ cpu: 90, clock: 100 })),
    ]);
    expect(result.status).toBe("ok");
    expect(result.loadedSamples).toBe(6);
  });
});