import { describe, expect, it } from "vitest";
import { makeProcessAnalysis } from "@/test/helpers";
import { buildInsights } from "../buildInsights";

describe("buildInsights", () => {
  it("sorts insights by descending priority and preserves IDs with explanations", () => {
    const analyses = [
      makeProcessAnalysis({
        id: "low",
        severity: "low",
        detectedAt: Date.now(),
      }),
      makeProcessAnalysis({
        id: "critical",
        severity: "critical",
        detectedAt: Date.now(),
      }),
      makeProcessAnalysis({
        id: "medium",
        severity: "medium",
        detectedAt: Date.now(),
      }),
    ];

    const { insights } = buildInsights(analyses);

    expect(insights.map(({ id }) => id)).toEqual(["critical", "medium", "low"]);
    for (const insight of insights) {
      expect(insight.id).toBe(insight.analysis.id);
      expect(insight.explanation.trim().length).toBeGreaterThan(0);
    }
  });

  it("returns no insights and a perfect health score for empty input", () => {
    expect(buildInsights([])).toMatchObject({
      insights: [],
      health: { score: 100 },
    });
  });
});
