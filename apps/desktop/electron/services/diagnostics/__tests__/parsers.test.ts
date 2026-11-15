// apps/desktop/electron/services/diagnostics/__tests__/parsers.test.ts

import { describe, expect, it } from "vitest";

import type { Sample } from "../../../../src/types/diagnostics";
import {
  emptyAvailability,
  parseActiveScheme,
  parseCounterLine,
  parseNvidiaCsv,
  parsePhysicalDisks,
  pickTopProcesses,
  toReading,
  updateAvailability,
} from "../parsers";

describe("toReading", () => {
  it("keeps real numbers, including 0", () => {
    expect(toReading(0)).toBe(0);
    expect(toReading("12.5")).toBe(12.5);
  });

  it("turns missing values into null, never 0", () => {
    expect(toReading("")).toBeNull();
    expect(toReading("[N/A]")).toBeNull();
    expect(toReading("[Not Supported]")).toBeNull();
    expect(toReading(NaN)).toBeNull();
    expect(toReading(undefined)).toBeNull();
  });
});

describe("parseNvidiaCsv", () => {
  it("parses the line your GTX 1650 returned", () => {
    const result = parseNvidiaCsv("49.80, 0, 8.47, 300, 1262, 0x0000000000000001\n");
    expect(result).toEqual({
      temperatureC: 49.8,
      usage: 0, // an idle GPU is 0, not unknown
      powerW: 8.47,
      coreClockMHz: 300,
      memoryUsedMB: 1262,
      throttleReasons: 1,
    });
  });

  it("uses null for unsupported fields", () => {
    const result = parseNvidiaCsv("50, 10, [N/A], 300, 100, [Not Supported]");
    expect(result?.powerW).toBeNull();
    expect(result?.throttleReasons).toBeNull();
    expect(result?.usage).toBe(10);
  });

  it("returns null for an error message", () => {
    expect(parseNvidiaCsv("NVIDIA-SMI has failed")).toBeNull();
    expect(parseNvidiaCsv("")).toBeNull();
  });
});

describe("parseCounterLine", () => {
  it("matches counters by name, ignoring the machine prefix", () => {
    const line = JSON.stringify({
      "\\\\DESKTOP-X\\processor information(_total)\\% processor performance": 106,
      "\\\\DESKTOP-X\\paging file(_total)\\% usage": 4.64,
      "\\\\DESKTOP-X\\physicaldisk(_total)\\avg. disk queue length": 0.002,
      "\\\\DESKTOP-X\\physicaldisk(_total)\\% disk time": 0.1,
    });

    expect(parseCounterLine(line)).toEqual({
      performancePercent: 106,
      pageFileUsedPercent: 4.64,
      diskQueue: 0.002,
      diskActivePercent: 0.1,
    });
  });

  it("returns null for broken lines", () => {
    expect(parseCounterLine("not json")).toBeNull();
    expect(parseCounterLine("")).toBeNull();
  });
});

describe("pickTopProcesses", () => {
  const list = [
    { pid: 0, name: "System Idle Process", cpu: 90, memRss: 0 },
    { pid: 1, name: "a.exe", cpu: 40, memRss: 100_000 },
    { pid: 2, name: "b.exe", cpu: 30, memRss: 900_000 },
    { pid: 3, name: "c.exe", cpu: 1, memRss: 800_000 },
  ];

  it("skips the idle process and does not repeat a process", () => {
    const result = pickTopProcesses(list, 2, 2);
    expect(result.map((p) => p.pid)).toEqual([1, 2, 3]);
  });

  it("converts memory from KB to MB", () => {
    const result = pickTopProcesses(list, 1, 0);
    expect(result[0].memoryMB).toBe(Math.round(100_000 / 1024));
  });
});

describe("hardware helpers", () => {
  it("reads the power plan name", () => {
    expect(
      parseActiveScheme(
        "Power Scheme GUID: 9897998c-92de-4669-853f-b7cd3ecb2790  (AMD RyzenT Balanced)"
      )
    ).toBe("AMD RyzenT Balanced");
  });

  it("reads one disk or many", () => {
    const json = JSON.stringify([
      { FriendlyName: "ETOPSO SSD 256GB", HealthStatus: "Healthy", MediaType: "SSD" },
      { FriendlyName: "WDC WD10EZEX", HealthStatus: "Healthy", MediaType: "HDD" },
    ]);
    expect(parsePhysicalDisks(json).map((d) => d.type)).toEqual(["SSD", "HDD"]);
    expect(parsePhysicalDisks(JSON.stringify({ FriendlyName: "X" }))).toHaveLength(1);
    expect(parsePhysicalDisks("")).toEqual([]);
  });
});

describe("updateAvailability", () => {
  const sample = {
    cpu: { usage: 10, perCore: [], performancePercent: 100, temperatureC: null, voltageV: null },
    memory: { usedPercent: 50, usedMB: 1000, pageFileUsedPercent: null },
    gpu: { usage: 0, temperatureC: 50, powerW: null, coreClockMHz: null, memoryUsedMB: null, throttleReasons: null },
    disk: { activePercent: null, queueLength: null },
    network: { downBytesPerSec: null, upBytesPerSec: null },
    topProcesses: [],
    t: 1,
  } as Sample;

  it("marks a sensor available once it reports a value, including 0", () => {
    const availability = emptyAvailability();
    updateAvailability(availability, sample);

    expect(availability.cpuUsage).toBe(true);
    expect(availability.gpuUsage).toBe(true); // 0 is a real reading
    expect(availability.gpuTemperature).toBe(true);
  });

  it("leaves sensors that only returned null as unavailable", () => {
    const availability = emptyAvailability();
    updateAvailability(availability, sample);

    expect(availability.cpuTemperature).toBe(false);
    expect(availability.pageFile).toBe(false);
    expect(availability.network).toBe(false);
  });
});