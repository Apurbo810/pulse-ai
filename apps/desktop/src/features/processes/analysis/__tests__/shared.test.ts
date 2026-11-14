import { describe, expect, it } from "vitest";
import { makeProcessInfo } from "@/test/helpers";
import { classify, isIgnored } from "../shared";

const thresholds = { medium: 20, high: 50, critical: 80 };

describe("classify", () => {
  it("returns null below medium and for NaN", () => {
    expect(classify(19.99, thresholds)).toBeNull();
    expect(classify(Number.NaN, thresholds)).toBeNull();
  });

  it.each([
    [20, "medium"],
    [50, "high"],
    [80, "critical"],
  ] as const)("classifies the threshold boundary %i", (value, severity) => {
    expect(classify(value, thresholds)).toBe(severity);
  });
});

describe("isIgnored", () => {
  it.each([
    makeProcessInfo({ pid: 0 }),
    makeProcessInfo({ pid: 4 }),
    makeProcessInfo({ name: "System Idle Process" }),
    makeProcessInfo({ name: "sYsTeM iDlE pRoCeSs" }),
  ])("ignores protected or idle processes", (process) => {
    expect(isIgnored(process)).toBe(true);
  });
});
