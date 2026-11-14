// apps/desktop/scripts/probe-sensors.mjs

import si from "systeminformation";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFileSync } from "node:fs";

const execFileAsync = promisify(execFile);

const results = [];

async function run(file, args) {
  const { stdout } = await execFileAsync(file, args, {
    timeout: 20_000,
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  return stdout.trim();
}

const ps = (command) =>
  run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command]);

// Each probe returns { ok, value }. ok = false means "not available".
async function probe(name, fn) {
  try {
    const { ok, value } = await fn();
    results.push({ name, ok, value });
  } catch (error) {
    results.push({ name, ok: false, value: `error: ${String(error.message).split("\n")[0]}` });
  }
}

const has = (v) => v !== null && v !== undefined && v !== "" && !Number.isNaN(v);

// ---------- Environment ----------
await probe("Running as administrator", async () => {
  try {
    await run("fltmc", []);
    return { ok: true, value: "yes" };
  } catch {
    return { ok: false, value: "no (some sensors need admin)" };
  }
});

// ---------- CPU ----------
await probe("CPU info", async () => {
  const c = await si.cpu();
  return {
    ok: true,
    value: `${c.brand}, ${c.physicalCores} cores / ${c.cores} threads, base ${c.speed} GHz, max ${c.speedMax} GHz`,
  };
});

await probe("CPU clock speed (live)", async () => {
  const s = await si.cpuCurrentSpeed();
  return { ok: has(s.avg) && s.avg > 0, value: `avg ${s.avg} GHz, min ${s.min}, max ${s.max}` };
});

await probe("CPU temperature (systeminformation)", async () => {
  const t = await si.cpuTemperature();
  return { ok: has(t.main), value: `main ${t.main}, max ${t.max}, cores ${JSON.stringify(t.cores)}` };
});

await probe("CPU load per core", async () => {
  const l = await si.currentLoad();
  return { ok: l.cpus?.length > 0, value: `${l.cpus?.length} cores reported` };
});

await probe("CPU voltage (Win32_Processor)", async () => {
  const out = await ps(
    "Get-CimInstance Win32_Processor | Select-Object CurrentVoltage, CurrentClockSpeed, MaxClockSpeed, LoadPercentage | ConvertTo-Json -Compress"
  );
  return { ok: out.includes("CurrentVoltage"), value: out };
});

await probe("CPU performance counter (% of base clock)", async () => {
  const out = await ps(
    "(Get-Counter '\\Processor Information(_Total)\\% Processor Performance' -ErrorAction Stop).CounterSamples | ForEach-Object { [math]::Round($_.CookedValue,1) }"
  );
  return { ok: out.length > 0, value: out };
});

await probe("ACPI thermal zone (needs admin)", async () => {
  const out = await ps(
    "Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop | ForEach-Object { [math]::Round(($_.CurrentTemperature / 10) - 273.15, 1) }"
  );
  return { ok: out.length > 0, value: out ? `${out.replace(/\s+/g, ", ")} C` : "" };
});

// ---------- Memory ----------
await probe("Memory and page file", async () => {
  const m = await si.mem();
  return {
    ok: has(m.total),
    value: `total ${(m.total / 1e9).toFixed(1)} GB, swap total ${(m.swaptotal / 1e9).toFixed(1)} GB, swap used ${(m.swapused / 1e9).toFixed(1)} GB`,
  };
});

await probe("Page file usage counter", async () => {
  const out = await ps(
    "(Get-Counter '\\Paging File(_Total)\\% Usage' -ErrorAction Stop).CounterSamples | ForEach-Object { [math]::Round($_.CookedValue,2) }"
  );
  return { ok: out.length > 0, value: `${out} %` };
});

// ---------- GPU ----------
await probe("GPU (systeminformation)", async () => {
  const g = await si.graphics();
  const list = g.controllers.map((c) => ({
    model: c.model,
    vram: c.vram,
    util: c.utilizationGpu ?? null,
    temp: c.temperatureGpu ?? null,
    power: c.powerDraw ?? null,
    clock: c.clockCore ?? null,
    vramUsed: c.memoryUsed ?? null,
  }));
  const ok = g.controllers.some((c) => has(c.utilizationGpu) || has(c.temperatureGpu));
  return { ok, value: JSON.stringify(list) };
});

await probe("NVIDIA GPU (nvidia-smi)", async () => {
  const out = await run("nvidia-smi", [
    "--query-gpu=name,temperature.gpu,utilization.gpu,power.draw,clocks.gr,clocks.mem,memory.used,clocks_throttle_reasons.active",
    "--format=csv,noheader",
  ]);
  return { ok: out.length > 0, value: out };
});

// ---------- Disk ----------
await probe("Disk queue length counter", async () => {
  const out = await ps(
    "(Get-Counter '\\PhysicalDisk(_Total)\\Avg. Disk Queue Length' -ErrorAction Stop).CounterSamples | ForEach-Object { [math]::Round($_.CookedValue,3) }"
  );
  return { ok: out.length > 0, value: out };
});

await probe("Disk activity time counter", async () => {
  const out = await ps(
    "(Get-Counter '\\PhysicalDisk(_Total)\\% Disk Time' -ErrorAction Stop).CounterSamples | ForEach-Object { [math]::Round($_.CookedValue,1) }"
  );
  return { ok: out.length > 0, value: `${out} %` };
});

await probe("Disk throughput (systeminformation)", async () => {
  await si.disksIO();
  await new Promise((r) => setTimeout(r, 1000));
  const d = await si.disksIO();
  return { ok: has(d?.rIO_sec) || has(d?.wIO_sec), value: JSON.stringify({ r: d?.rIO_sec, w: d?.wIO_sec }) };
});

await probe("Disk health (SMART)", async () => {
  const out = await ps(
    "Get-PhysicalDisk | Select-Object FriendlyName, HealthStatus, OperationalStatus, MediaType | ConvertTo-Json -Compress"
  );
  return { ok: out.length > 0, value: out };
});

// ---------- Network ----------
await probe("Network throughput", async () => {
  await si.networkStats();
  await new Promise((r) => setTimeout(r, 1000));
  const n = await si.networkStats();
  return { ok: n.length > 0, value: `${n.length} adapter(s), first: ${n[0]?.iface}` };
});

// ---------- Power, fans, battery ----------
await probe("Battery", async () => {
  const b = await si.battery();
  return { ok: b.hasBattery === true, value: b.hasBattery ? `${b.percent}%, charging ${b.isCharging}` : "no battery (desktop)" };
});

await probe("Fans (Win32_Fan)", async () => {
  const out = await ps("Get-CimInstance Win32_Fan -ErrorAction Stop | Select-Object Name, Status | ConvertTo-Json -Compress");
  return { ok: out.length > 0, value: out || "none reported" };
});

await probe("Power plan", async () => {
  const out = await run("powercfg", ["/getactivescheme"]);
  return { ok: out.length > 0, value: out };
});

// ---------- Windows Event Log (crash history), last 30 days ----------
const eventCount = (filter) =>
  ps(`(Get-WinEvent -FilterHashtable ${filter} -ErrorAction SilentlyContinue | Measure-Object).Count`);

await probe("Unexpected shutdowns / kernel power (System 41, 6008)", async () => {
  const n = await eventCount("@{LogName='System';Id=41,6008;StartTime=(Get-Date).AddDays(-30)}");
  return { ok: true, value: `${n} event(s)` };
});

await probe("Application crashes (Application 1000)", async () => {
  const n = await eventCount("@{LogName='Application';Id=1000;StartTime=(Get-Date).AddDays(-30)}");
  return { ok: true, value: `${n} event(s)` };
});

await probe("Hardware errors (WHEA-Logger)", async () => {
  const n = await eventCount(
    "@{LogName='System';ProviderName='Microsoft-Windows-WHEA-Logger';StartTime=(Get-Date).AddDays(-30)}"
  );
  return { ok: true, value: `${n} event(s)` };
});

// ---------- Output ----------
console.log("\nSensor probe results\n");
console.table(
  results.map((r) => ({
    Sensor: r.name,
    Available: r.ok ? "YES" : "no",
    Value: String(r.value).slice(0, 90),
  }))
);

const outFile = new URL("./probe-result.json", import.meta.url);
writeFileSync(outFile, JSON.stringify(results, null, 2));
console.log(`\nFull results saved to scripts/probe-result.json`);