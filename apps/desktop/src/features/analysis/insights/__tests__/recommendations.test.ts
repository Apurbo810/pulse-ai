import { describe, expect, it } from "vitest";
import { makeProcessAnalysis, makeProcessInfo } from "@/test/helpers";
import {
  buildActions,
  buildRecommendations,
} from "../recommendations";

describe("buildRecommendations", () => {
  it.each([
    "chrome.exe",
    "msedge.exe",
    "firefox.exe",
    "discord.exe",
    "obs64.exe",
    "steam.exe",
    "steamwebhelper.exe",
    "epicgameslauncher.exe",
    "onedrive.exe",
    "spotify.exe",
  ])("adds one gaming recommendation for %s", (name) => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({ process: makeProcessInfo({ name }) }),
    );

    expect(recommendations.filter(({ type }) => type === "gaming")).toHaveLength(
      1,
    );
  });

  it("matches gaming app names case-insensitively", () => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({
        process: makeProcessInfo({ name: "Chrome.EXE" }),
      }),
    );

    expect(recommendations.filter(({ type }) => type === "gaming")).toHaveLength(
      1,
    );
  });

  it("gives a generic performance recommendation but no gaming recommendation to other apps", () => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({
        process: makeProcessInfo({ name: "notepad.exe" }),
      }),
    );

    expect(recommendations.some(({ type }) => type === "gaming")).toBe(false);
    expect(recommendations.some(({ type }) => type === "performance")).toBe(
      true,
    );
  });

  it("returns only security recommendations for suspicious findings", () => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({
        category: "suspicious",
        title: "Running From Downloads",
      }),
    );

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations.every(({ type }) => type === "security")).toBe(true);
  });

  it("combines app-specific, generic CPU, and gaming recommendations", () => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({
        process: makeProcessInfo({ name: "chrome.exe" }),
      }),
    );

    expect(recommendations.filter(({ type }) => type === "performance")).toHaveLength(
      2,
    );
    expect(recommendations.filter(({ type }) => type === "gaming")).toHaveLength(
      1,
    );
  });

  it.each([
    "Possible Process Impersonation",
    "Running From Temporary Folder",
    "Running From Downloads",
    "Unusual Executable Name",
    "Missing Executable Path",
  ])("provides security guidance for %s", (title) => {
    const recommendations = buildRecommendations(
      makeProcessAnalysis({ category: "suspicious", title }),
    );

    expect(recommendations.some(({ type }) => type === "security")).toBe(true);
  });
});

describe("buildActions", () => {
  it("offers openLocation when the process has an executable path", () => {
    const actions = buildActions(makeProcessAnalysis());

    expect(actions.some(({ kind }) => kind === "openLocation")).toBe(true);
  });

  it("does not offer openLocation when the executable path is null", () => {
    const actions = buildActions(
      makeProcessAnalysis({
        process: makeProcessInfo({ executablePath: null }),
      }),
    );

    expect(actions.some(({ kind }) => kind === "openLocation")).toBe(false);
  });

  it("does not offer endTask for critical processes", () => {
    const actions = buildActions(
      makeProcessAnalysis({
        process: makeProcessInfo({ isCritical: true }),
      }),
    );

    expect(actions.some(({ kind }) => kind === "endTask")).toBe(false);
  });

  it("offers endTask for non-critical processes", () => {
    const actions = buildActions(makeProcessAnalysis());

    expect(actions.some(({ kind }) => kind === "endTask")).toBe(true);
  });
});
