import { describe, expect, it } from "vitest";
import { makeProcessAnalysis } from "@/test/helpers";
import { priorityScore } from "../priority";

const now = Date.UTC(2025, 0, 1, 12);

describe("priorityScore", () => {
  it("orders equal-duration issues by severity", () => {
    const score = (severity: "critical" | "high" | "medium" | "low") =>
      priorityScore(makeProcessAnalysis({ severity, detectedAt: now }), now);

    expect(score("critical")).toBeGreaterThan(score("high"));
    expect(score("high")).toBeGreaterThan(score("medium"));
    expect(score("medium")).toBeGreaterThan(score("low"));
    expect(score("critical")).toBe(100);
    expect(score("high")).toBe(60);
    expect(score("medium")).toBe(30);
    expect(score("low")).toBe(10);
  });

  it("adds a duration bonus capped at ten points", () => {
    const at = now - 60_000;
    const oneMinute = priorityScore(
      makeProcessAnalysis({ severity: "medium", detectedAt: at }),
      now,
    );
    const tenMinutes = priorityScore(
      makeProcessAnalysis({ severity: "medium", detectedAt: now - 10 * 60_000 }),
      now,
    );
    const sixtyMinutes = priorityScore(
      makeProcessAnalysis({ severity: "medium", detectedAt: now - 60 * 60_000 }),
      now,
    );

    expect(oneMinute).toBe(31);
    expect(tenMinutes).toBe(40);
    expect(sixtyMinutes).toBe(tenMinutes);
  });

  it("adds fifteen points for suspicious findings", () => {
    const common = { severity: "high" as const, detectedAt: now };

    expect(
      priorityScore(
        makeProcessAnalysis({ ...common, category: "suspicious" }),
        now,
      ) -
        priorityScore(makeProcessAnalysis({ ...common, category: "cpu" }), now),
    ).toBe(15);
  });

  it("does not apply a negative duration bonus to future findings", () => {
    expect(
      priorityScore(
        makeProcessAnalysis({ severity: "medium", detectedAt: now + 60_000 }),
        now,
      ),
    ).toBe(30);
  });

  it("allows a long-running low suspicious finding to outrank a new medium finding", () => {
    const longRunningLow = priorityScore(
      makeProcessAnalysis({
        severity: "low",
        category: "suspicious",
        detectedAt: now - 60 * 60_000,
      }),
      now,
    );
    const newMedium = priorityScore(
      makeProcessAnalysis({
        severity: "medium",
        category: "cpu",
        detectedAt: now,
      }),
      now,
    );

    expect(longRunningLow).toBe(35);
    expect(newMedium).toBe(30);
    expect(longRunningLow).toBeGreaterThan(newMedium);
  });
});
