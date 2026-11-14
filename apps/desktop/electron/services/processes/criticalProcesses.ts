// apps/desktop/electron/services/processes/criticalProcesses.ts

export const CRITICAL_PROCESSES = new Set([
  "system",
  "system idle process",
  "registry",
  "memory compression",
  "secure system",
  "smss.exe",
  "csrss.exe",
  "wininit.exe",
  "winlogon.exe",
  "services.exe",
  "lsass.exe",
  "lsaiso.exe",
  "fontdrvhost.exe",
  "dwm.exe",
  "svchost.exe",
  "sgrmbroker.exe",
  "securityhealthservice.exe",
  "audiodg.exe",
]);

const WINDOWS_DIR = (process.env.SystemRoot ?? "C:\\Windows").toLowerCase();

/**
 * A process is protected when its name is on the list AND it is running from
 * the Windows folder. If the path is unknown (Windows hides it without admin
 * rights) it stays protected. A process that uses one of these names but runs
 * from somewhere else, such as a Temp folder, is an impersonator and can be
 * ended.
 */
export function isCriticalProcess(
  name: string,
  executablePath?: string | null
): boolean {
  if (!CRITICAL_PROCESSES.has(name.trim().toLowerCase())) return false;

  const path = executablePath?.trim().toLowerCase();
  if (path && !path.startsWith(`${WINDOWS_DIR}\\`)) return false;

  return true;
}