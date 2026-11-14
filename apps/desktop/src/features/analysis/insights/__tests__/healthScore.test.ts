import { describe, expect, it } from "vitest";
import { makeProcessAnalysis } from "@/test/helpers";
import { calculateHealthScore } from "../healthScore";

function issues(
  severity: "critical" | "high" | "medium" | "low",
  count: number,
) {
  return Array.from({ length: count }, (_, index) =>
    makeProcessAnalysis({
      id: `${severity}-${index}`,
      severity,
    }),
  );
}

describe("calculateHealthScore", () => {
  it("returns 100 and Excellent with no issues", () => {
    expect(calculateHealthScore([])).toMatchObject({
      score: 100,
      label: "Excellent",
    });
  });

  it("scores three medium issues as 88 and Good", () => {
    expect(calculateHealthScore(issues("medium", 3))).toMatchObject({
      score: 88,
      label: "Good",
    });
  });

  it("caps the penalty for low issues at five points", () => {
    expect(calculateHealthScore(issues("low", 123)).score).toBe(95);
  });

  it("caps the critical penalty at fifty points", () => {
    expect(calculateHealthScore(issues("critical", 123))).toMatchObject({
      score: 50,
      label: "Needs attention",
    });
  });

  it.each([
    [90, "Excellent", [["high", 1]]],
    [89, "Good", [["high", 1], ["low", 1]]],
    [75, "Good", [["high", 1], ["medium", 5]]],
    [74, "Needs attention", [["high", 1], ["medium", 5], ["low", 1]]],
    [50, "Needs attention", [["critical", 3]]],
    [49, "Poor", [["critical", 3], ["low", 1]]],
    [25, "Poor", [["critical", 3], ["high", 2], ["medium", 1], ["low", 1]]],
    [24, "Critical", [["critical", 3], ["high", 2], ["medium", 1], ["low", 2]]],
  ] as const)("uses the expected label at score %i", (score, label, groups) => {
    const analyses = groups.flatMap(([severity, count]) =>
      issues(severity, count),
    );

    expect(calculateHealthScore(analyses)).toMatchObject({ score, label });
  });

  it("never drops below zero when all severity penalties reach their caps", () => {
    const analyses = [
      ...issues("critical", 10),
      ...issues("high", 10),
      ...issues("medium", 10),
      ...issues("low", 10),
    ];

    expect(calculateHealthScore(analyses).score).toBe(0);
  });

  it("mentions critical and high counts and uses singular for one issue", () => {
    expect(
      calculateHealthScore([
        makeProcessAnalysis({
          id: "critical",
          severity: "critical",
        }),
        makeProcessAnalysis({ id: "high", severity: "high" }),
        makeProcessAnalysis({ id: "low", severity: "low" }),
      ]).summary,
    ).toBe("3 issues found, 1 critical, 1 high.");

    expect(calculateHealthScore(issues("low", 1)).summary).toBe("1 issue found.");
  });
});
