// apps/desktop/src/features/analysis/insights/explanations.ts

import type { ProcessAnalysis } from "@/features/processes/analysis/types";

function formatMemory(memoryMB: number): string {
  if (memoryMB >= 1024) return `${(memoryMB / 1024).toFixed(1)} GB`;
  return `${memoryMB.toFixed(0)} MB`;
}

function explainSuspicious(a: ProcessAnalysis): string {
  const name = a.process.name;

  if (a.title.includes("Impersonation")) {
    return `${name} uses the name of a core Windows component, but it is running from a different folder than the real one. Malware sometimes copies these names to hide in plain sight. This is the most serious kind of warning Pulse AI gives.`;
  }
  if (a.title.includes("Temporary")) {
    return `${name} is running from a temporary folder. Installers use these folders for a short time, but malware often runs from them too.`;
  }
  if (a.title.includes("Downloads")) {
    return `${name} is running straight from your Downloads folder. This is often a portable app or an installer you have not finished with, but only run programs you trust.`;
  }
  if (a.title.includes("Unusual")) {
    return `${name} has a long or random-looking file name. Legitimate programs usually have readable names, so it is worth checking where it came from.`;
  }
  if (a.title.includes("Missing")) {
    return `Windows did not report where ${name} is stored. This is common for protected system components, so it is a low-risk notice unless you do not recognise the program.`;
  }

  return `${name} was flagged because it looks unusual. Check where it is stored and whether you recognise it.`;
}

export function explainAnalysis(a: ProcessAnalysis): string {
  const p = a.process;

  switch (a.category) {
    case "cpu":
      return `${p.name} is keeping your processor busy (${p.cpu.toFixed(
        1
      )}%). When one program uses this much CPU for a long time, everything else can feel slower, fans may spin up, and a laptop battery drains faster.`;

    case "memory":
      return `${p.name} is holding ${formatMemory(
        p.memory
      )} of your RAM while the system is running low on memory. When RAM runs out, Windows moves data to the disk, which makes apps stutter and open slowly.`;

    case "gpu":
      return `${p.name} is using ${(p.gpu ?? 0).toFixed(
        1
      )}% of your graphics card. That is normal in a game or video editor, but if you are not using it for that, it takes power away from games and can raise temperatures.`;

    case "disk": {
      const mb = (p.disk ?? 0) / 1024 / 1024;
      return `${p.name} is reading or writing about ${mb.toFixed(
        1
      )} MB/s. Heavy disk activity can make the whole PC feel slow, especially on a hard drive.`;
    }

    case "suspicious":
      return explainSuspicious(a);
  }
}