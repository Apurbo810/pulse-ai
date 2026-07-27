// features/processes/analysis/cpuAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const CPU_THRESHOLDS = {
  medium: 20,
  high: 50,
  critical: 80,
} as const;

const IGNORED_PROCESSES = new Set([
  "system idle process",
  "system",
  "registry",
  "memory compression",
  "secure system",
]);

export function analyzeCpu(
  process: ProcessInfo
): ProcessAnalysis | null {
  const normalizedName = process.name.trim().toLowerCase();

  // Ignore Windows internal processes
  if (
    process.pid === 0 ||
    IGNORED_PROCESSES.has(normalizedName)
  ) {
    return null;
  }

  const cpu = process.cpu;

  // Ignore invalid values
  if (!Number.isFinite(cpu) || cpu <= 0) {
    return null;
  }

  // Ignore healthy processes
  if (cpu < CPU_THRESHOLDS.medium) {
    return null;
  }

  let severity: ProcessAnalysis["severity"];

  if (cpu >= CPU_THRESHOLDS.critical) {
    severity = "critical";
  } else if (cpu >= CPU_THRESHOLDS.high) {
    severity = "high";
  } else {
    severity = "medium";
  }

  return {
    process,

    severity,

    title: "High CPU Usage",

    reason: `${process.name} is consuming ${cpu.toFixed(
      1
    )}% of CPU resources.`,

    recommendation: getRecommendation(normalizedName),
  };
}

function getRecommendation(
  processName: string
): string {
  if (
    processName === "chrome.exe" ||
    processName.includes("chrome")
  ) {
    return "Close unused tabs or disable resource-intensive extensions.";
  }

  if (
    processName === "msedge.exe" ||
    processName.includes("edge")
  ) {
    return "Close unused tabs or enable Sleeping Tabs to reduce CPU usage.";
  }

  if (
    processName === "firefox.exe" ||
    processName.includes("firefox")
  ) {
    return "Close unused tabs or check for extensions consuming excessive CPU.";
  }

  if (
    processName === "discord.exe" ||
    processName.includes("discord")
  ) {
    return "Restart Discord or disable overlays if CPU usage remains high.";
  }

  if (
    processName === "code.exe" ||
    processName.includes("visual studio code")
  ) {
    return "Check for busy extensions, language servers, or background tasks.";
  }

  if (
    processName === "obs64.exe" ||
    processName.includes("obs")
  ) {
    return "High CPU usage is expected while recording or streaming. Consider lowering the encoder preset or output resolution if performance becomes an issue.";
  }

  if (
    processName === "steam.exe" ||
    processName.includes("steam")
  ) {
    return "Steam may be downloading updates or verifying game files.";
  }

  return "If this application is not needed, close it. If CPU usage remains unusually high, investigate the process for potential issues.";
}