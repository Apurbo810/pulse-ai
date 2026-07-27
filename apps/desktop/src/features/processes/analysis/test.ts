import { analyzeCpu } from "./cpuAnalyzer";
import type { ProcessInfo } from "@/types/system";

const processes: ProcessInfo[] = [
  {
    pid: 1234,
    name: "chrome.exe",
    cpu: 72.5,
    memory: 1200,
    executablePath: null,
    isCritical: false,
  },
  {
    pid: 1235,
    name: "Discord.exe",
    cpu: 12,
    memory: 800,
    executablePath: null,
    isCritical: false,
  },
  {
    pid: 0,
    name: "System Idle Process",
    cpu: 99,
    memory: 0,
    executablePath: null,
    isCritical: true,
  },
  {
    pid: 555,
    name: "obs64.exe",
    cpu: 85,
    memory: 900,
    executablePath: null,
    isCritical: false,
  },
];

for (const process of processes) {
  console.log(process.name);
  console.log(analyzeCpu(process));
  console.log("----------------");
}