// apps/desktop/src/features/processes/analysis/suspiciousAnalyzer.ts

import type { ProcessInfo } from "@/types/system";
import type { Finding } from "./types";

// Where each well-known Windows process is expected to live
const EXPECTED_DIRECTORIES: Record<string, string[]> = {
  "svchost.exe": ["c:\\windows\\system32", "c:\\windows\\syswow64"],
  "lsass.exe": ["c:\\windows\\system32"],
  "services.exe": ["c:\\windows\\system32"],
  "csrss.exe": ["c:\\windows\\system32"],
  "wininit.exe": ["c:\\windows\\system32"],
  "smss.exe": ["c:\\windows\\system32"],
  "winlogon.exe": ["c:\\windows\\system32"],
  "explorer.exe": ["c:\\windows", "c:\\windows\\syswow64"],
};

const SYSTEM_OWNERS = ["system", "local service", "network service"];

function normalize(path: string | null): string {
  return path?.trim().toLowerCase() ?? "";
}

function isTrustedLocation(path: string): boolean {
  return (
    path.startsWith("c:\\windows\\") ||
    path.startsWith("c:\\program files\\") ||
    path.startsWith("c:\\program files (x86)\\")
  );
}

function looksRandom(baseName: string): boolean {
  if (baseName.length < 12) return false;

  const digits = (baseName.match(/\d/g) ?? []).length;
  const vowels = (baseName.match(/[aeiou]/g) ?? []).length;

  return digits / baseName.length > 0.3 || vowels / baseName.length < 0.2;
}

export function analyzeSuspicious(p: ProcessInfo): Finding | null {
  if (p.pid === 0 || p.pid === 4) return null;

  const path = normalize(p.executablePath);
  const name = p.name.trim().toLowerCase();
  const owner = (p.owner ?? "").toLowerCase();

  // Missing executable path (common for protected system processes)
  if (!path) {
    if (p.isCritical) return null;
    // No owner either means Windows hid the details from us (we are not
    // running as administrator), so this is not a real finding.
    if (!owner) return null;
    if (SYSTEM_OWNERS.some((o) => owner.includes(o))) return null;

    return {
      process: p,
      severity: "low",
      category: "suspicious",
      title: "Missing Executable Path",
      reason: `${p.name} has no executable path available.`,
    };
  }

  // Windows process running from an unexpected folder
  const expected = EXPECTED_DIRECTORIES[name];
  if (expected && !expected.some((dir) => path === `${dir}\\${name}`)) {
    return {
      process: p,
      severity: "critical",
      category: "suspicious",
      title: "Possible Process Impersonation",
      reason: `${p.name} is not running from its expected Windows folder.`,
    };
  }

  // Temporary folder
  if (path.includes("\\appdata\\local\\temp\\")) {
    return {
      process: p,
      severity: "high",
      category: "suspicious",
      title: "Running From Temporary Folder",
      reason: `${p.name} is running from a temporary directory.`,
    };
  }

  // Downloads folder
  if (path.includes("\\downloads\\")) {
    return {
      process: p,
      severity: "medium",
      category: "suspicious",
      title: "Running From Downloads",
      reason: `${p.name} is running from the Downloads folder.`,
    };
  }

  // Random-looking name (skip trusted install locations)
  const baseName = name.replace(/\.exe$/, "");
  if (!isTrustedLocation(path) && looksRandom(baseName)) {
    return {
      process: p,
      severity: "medium",
      category: "suspicious",
      title: "Unusual Executable Name",
      reason: `${p.name} has an unusually long or random-looking name.`,
    };
  }

  return null;
}