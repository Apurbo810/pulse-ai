import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

import type {
  DevicesInfo,
  KeyboardDevice,
  MouseDevice,
} from "../../src/types/system";

async function runPowerShell(command: string): Promise<string> {
  const { stdout } = await execAsync(
    `powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "${command}"`
  );

  return stdout.trim();
}

function parseArray<T>(json: string): T[] {
  if (!json || json === "null") return [];

  const parsed = JSON.parse(json);

  if (parsed == null) return [];

  return Array.isArray(parsed) ? parsed : [parsed];
}

async function getKeyboards(): Promise<KeyboardDevice[]> {
    const output = await runPowerShell(
    "Get-PnpDevice -Class Keyboard | Where-Object {$_.Status -eq 'OK'} | Select-Object FriendlyName, Manufacturer | ConvertTo-Json"
    );

  const devices = parseArray<{
    FriendlyName: string;
    Manufacturer: string | null;
  }>(output);

  const unique = new Map<string, KeyboardDevice>();

  for (const d of devices) {
    const name = d.FriendlyName?.trim();

    if (!name) continue;

    if (!unique.has(name)) {
      unique.set(name, {
        name,
        manufacturer: d.Manufacturer ?? "Unknown",
      });
    }
  }

  return [...unique.values()];
}

async function getMice(): Promise<MouseDevice[]> {
    const output = await runPowerShell(
    "Get-PnpDevice -Class Mouse | Where-Object {$_.Status -eq 'OK'} | Select-Object FriendlyName, Manufacturer | ConvertTo-Json"
    );

  const devices = parseArray<{
    FriendlyName: string;
    Manufacturer: string | null;
  }>(output);

  const unique = new Map<string, MouseDevice>();

  for (const d of devices) {
    const name = d.FriendlyName?.trim();

    if (!name) continue;

    if (!unique.has(name)) {
      unique.set(name, {
        name,
        manufacturer: d.Manufacturer ?? "Unknown",
      });
    }
  }

  return [...unique.values()];
}

export async function getDevices(): Promise<DevicesInfo> {
  const [keyboards, mice] = await Promise.all([
    getKeyboards(),
    getMice(),
  ]);

  return {
    keyboards,
    mice,
  };
}