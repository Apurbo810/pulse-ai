import { describe, expect, it } from "vitest";
import { makeProcessInfo } from "@/test/helpers";
import { analyzeCpu } from "../cpuAnalyzer";
import { analyzeDisk } from "../diskAnalyzer";
import { analyzeGpu } from "../gpuAnalyzer";
import { analyzeMemory } from "../memoryAnalyzer";
import { analyzeSuspicious } from "../suspiciousAnalyzer";

describe("analyzeCpu", () => {
  it.each([
    [19.9, null],
    [20, "medium"],
    [50, "high"],
    [80, "critical"],
  ] as const)("classifies CPU usage at %s percent", (cpu, severity) => {
    expect(analyzeCpu(makeProcessInfo({ cpu }))?.severity ?? null).toBe(severity);
  });

  it.todo(
    "recognizes games so cs2.exe using 40% CPU does not produce High CPU Usage",
    // Game detection is planned for a later phase.
  );
});

describe("analyzeGpu", () => {
  it.each([
    [29.9, null],
    [30, "medium"],
    [60, "high"],
    [90, "critical"],
  ] as const)("classifies GPU usage at %s percent", (gpu, severity) => {
    expect(analyzeGpu(makeProcessInfo({ gpu }))?.severity ?? null).toBe(severity);
  });
});

describe("analyzeDisk", () => {
  it("interprets disk throughput as bytes per second", () => {
    const finding = (mbPerSecond: number) =>
      analyzeDisk(makeProcessInfo({ disk: mbPerSecond * 1024 * 1024 }));

    expect(finding(5)).toBeNull();
    expect(finding(10)?.severity).toBe("medium");
    expect(finding(100)?.severity).toBe("critical");
  });
});

describe("analyzeMemory", () => {
  const context = { totalMemoryMB: 16_000, memoryUsagePercent: 80 };

  it("does not report process memory usage when system usage is below 75 percent", () => {
    expect(
      analyzeMemory(
        makeProcessInfo({ memory: 15_000 }),
        { ...context, memoryUsagePercent: 74.99 },
      ),
    ).toBeNull();
  });

  it("classifies a process using 25 percent of RAM as high under system pressure", () => {
    expect(
      analyzeMemory(makeProcessInfo({ memory: 4_000 }), context)?.severity,
    ).toBe("high");
  });

  it("does not report a process using only 4 MB of RAM", () => {
    expect(analyzeMemory(makeProcessInfo({ memory: 4 }), context)).toBeNull();
  });
});

describe("analyzeSuspicious", () => {
  it("does not flag explorer.exe in its expected Windows directory", () => {
    expect(
      analyzeSuspicious(
        makeProcessInfo({
          name: "explorer.exe",
          executablePath: "C:\\Windows\\explorer.exe",
        }),
      ),
    ).toBeNull();
  });

  it("flags svchost.exe outside Windows as critical impersonation", () => {
    expect(
      analyzeSuspicious(
        makeProcessInfo({
          name: "svchost.exe",
          executablePath: "C:\\Users\\a\\AppData\\svchost.exe",
        }),
      ),
    ).toMatchObject({
      severity: "critical",
      title: "Possible Process Impersonation",
    });
  });

  it("does not flag svchost.exe from System32", () => {
    expect(
      analyzeSuspicious(
        makeProcessInfo({
          name: "svchost.exe",
          executablePath: "C:\\Windows\\System32\\svchost.exe",
        }),
      ),
    ).toBeNull();
  });

  it.each(["", "SYSTEM"])(
    "does not flag missing paths with hidden or system-owned details",
    (owner) => {
      expect(
        analyzeSuspicious(
          makeProcessInfo({ executablePath: null, owner }),
        ),
      ).toBeNull();
    },
  );

  it("reports missing paths as low severity for a non-system owner", () => {
    expect(
      analyzeSuspicious(
        makeProcessInfo({
          executablePath: null,
          owner: "john",
          isCritical: false,
        }),
      ),
    ).toMatchObject({ severity: "low", title: "Missing Executable Path" });
  });

  it.each(["runtimebroker.exe", "securityhealthservice.exe"])(
    "does not classify %s in System32 as a random executable",
    (name) => {
      expect(
        analyzeSuspicious(
          makeProcessInfo({
            name,
            executablePath: `C:\\Windows\\System32\\${name}`,
          }),
        ),
      ).toBeNull();
    },
  );
});
