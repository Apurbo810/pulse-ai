import type { ProcessInfo } from "@/types/system";
import type { ProcessAnalysis } from "./types";

const WINDOWS_SYSTEM_PATH = "c:\\windows\\system32";

const WINDOWS_PROCESS_NAMES = new Set([
  "svchost.exe",
  "lsass.exe",
  "services.exe",
  "csrss.exe",
  "wininit.exe",
  "smss.exe",
  "winlogon.exe",
  "explorer.exe",
]);

function normalize(path: string | null): string {
  return path?.trim().toLowerCase() ?? "";
}

export function analyzeSuspicious(
  process: ProcessInfo
): ProcessAnalysis | null {
  const path = normalize(process.executablePath);
  const name = process.name.toLowerCase();

if (process.pid === 0) {
  return null;
}
  // Missing executable path
    if (!path && !process.isCritical) {
    return {
        process,
        severity: "medium",
        title: "Missing Executable Path",
        reason: `${process.name} has no executable path available.`,
    };
    }

  // Running from Temp folder
  if (
    path.includes("\\temp\\") ||
    path.includes("\\appdata\\local\\temp\\")
  ) {
    return {
      process,
      severity: "high",
      title: "Running From Temporary Folder",
      reason: `${process.name} is running from a temporary directory.`,
    };
  }

  // Running from Downloads
  if (path.includes("\\downloads\\")) {
    return {
      process,
      severity: "high",
      title: "Running From Downloads",
      reason: `${process.name} is running from the Downloads folder.`,
    };
  }

  // Windows process outside System32
  if (
    WINDOWS_PROCESS_NAMES.has(name) &&
    !path.startsWith(WINDOWS_SYSTEM_PATH)
  ) {
    return {
      process,
      severity: "critical",
      title: "Possible Process Impersonation",
      reason: `${process.name} is not running from the expected Windows System32 directory.`,
    };
  }

  // Random executable names
  const baseName = name.replace(".exe", "");

  if (/^[a-z0-9]{12,}$/i.test(baseName)) {
    return {
      process,
      severity: "medium",
      title: "Unusual Executable Name",
      reason: `${process.name} has an unusually long or random executable name.`,
    };
  }


  

  return null;
}