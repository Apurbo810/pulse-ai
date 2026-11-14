import { afterEach, describe, expect, it, vi } from "vitest";
import { makeProcessInfo } from "@/test/helpers";
import type { AnalysisContext } from "../types";
import { analyzeProcesses } from "../analysisEngine";

const noMemoryPressure: AnalysisContext = {
  totalMemoryMB: 16_000,
  memoryUsagePercent: 0,
};

let nextPid = 20_000;
const newPid = () => nextPid++;

describe("analyzeProcesses", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reports CPU findings only after the third consecutive sample", () => {
    vi.useFakeTimers();
    const process = makeProcessInfo({ pid: newPid(), cpu: 50 });

    expect(analyzeProcesses([process], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([process], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([process], noMemoryPressure)).toHaveLength(1);
  });

  it("reports memory on sample two and suspicious findings on sample one", () => {
    vi.useFakeTimers();
    const memoryContext = { totalMemoryMB: 8_000, memoryUsagePercent: 80 };
    const memoryProcess = makeProcessInfo({
      pid: newPid(),
      memory: 2_000,
    });
    const suspiciousProcess = makeProcessInfo({
      pid: newPid(),
      executablePath: "C:\\Users\\john\\Downloads\\app.exe",
    });

    expect(
      analyzeProcesses([memoryProcess], memoryContext).some(
        ({ category }) => category === "memory",
      ),
    ).toBe(false);
    expect(
      analyzeProcesses([memoryProcess], memoryContext).some(
        ({ category }) => category === "memory",
      ),
    ).toBe(true);
    expect(
      analyzeProcesses([suspiciousProcess], noMemoryPressure).some(
        ({ category }) => category === "suspicious",
      ),
    ).toBe(true);
  });

  it("keeps detectedAt at the first sample in a streak", () => {
    vi.useFakeTimers();
    const firstSample = new Date("2025-01-01T00:00:00.000Z");
    vi.setSystemTime(firstSample);
    const process = makeProcessInfo({ pid: newPid(), cpu: 50 });

    analyzeProcesses([process], noMemoryPressure);
    vi.setSystemTime(new Date(firstSample.getTime() + 1_000));
    analyzeProcesses([process], noMemoryPressure);
    vi.setSystemTime(new Date(firstSample.getTime() + 2_000));
    const result = analyzeProcesses([process], noMemoryPressure);

    expect(result[0].detectedAt).toBe(firstSample.getTime());
  });

  it("resets a streak after a sample with no finding", () => {
    vi.useFakeTimers();
    const process = makeProcessInfo({ pid: newPid(), cpu: 50 });
    const absent = { ...process, cpu: 0 };

    expect(analyzeProcesses([process], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([absent], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([process], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([process], noMemoryPressure)).toEqual([]);
    expect(analyzeProcesses([process], noMemoryPressure)).toHaveLength(1);
  });

  it("sorts by critical, high, medium, then low severity", () => {
    vi.useFakeTimers();
    const lowSuspicious = makeProcessInfo({
      pid: newPid(),
      executablePath: null,
      owner: "john",
    });
    const medium = makeProcessInfo({ pid: newPid(), cpu: 20 });
    const high = makeProcessInfo({ pid: newPid(), cpu: 50 });
    const critical = makeProcessInfo({ pid: newPid(), cpu: 80 });
    const processes = [lowSuspicious, medium, high, critical];

    analyzeProcesses(processes, noMemoryPressure);
    analyzeProcesses(processes, noMemoryPressure);
    const results = analyzeProcesses(processes, noMemoryPressure);

    expect(results.map(({ severity }) => severity)).toEqual([
      "critical",
      "high",
      "medium",
      "low",
    ]);
  });

  it("uses stable category-title-pid IDs across samples", () => {
    vi.useFakeTimers();
    const process = makeProcessInfo({ pid: newPid(), cpu: 80 });

    analyzeProcesses([process], noMemoryPressure);
    analyzeProcesses([process], noMemoryPressure);
    const firstReportedId = analyzeProcesses([process], noMemoryPressure)[0].id;
    const nextReportedId = analyzeProcesses([process], noMemoryPressure)[0].id;

    expect(firstReportedId).toBe(`cpu:High CPU Usage:${process.pid}`);
    expect(nextReportedId).toBe(firstReportedId);
  });
});
