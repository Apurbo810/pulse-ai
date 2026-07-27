export const CRITICAL_PROCESSES = new Set([
  "system",
  "registry",
  "smss.exe",
  "csrss.exe",
  "wininit.exe",
  "winlogon.exe",
  "services.exe",
  "lsass.exe",
  "fontdrvhost.exe",
  "dwm.exe",
  "memory compression",
  "secure system",
]);

export function isCriticalProcess(name: string): boolean {
  return CRITICAL_PROCESSES.has(name.toLowerCase());
}