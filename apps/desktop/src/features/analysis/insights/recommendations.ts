// apps/desktop/src/features/analysis/insights/recommendations.ts

import type { ProcessAnalysis } from "@/features/processes/analysis/types";
import type { InsightAction, Recommendation } from "./types";

// App-specific performance tips, keyed by lowercase process name
const APP_TIPS: Record<string, string> = {
  "chrome.exe":
    "Close unused tabs, and press Shift+Esc in Chrome to find the heavy tab or extension.",
  "msedge.exe":
    "Turn on Sleeping Tabs in Edge settings and close tabs you do not need.",
  "firefox.exe":
    "Open about:processes in Firefox to find the heavy tab, and disable extensions you do not use.",
  "discord.exe":
    "In Discord, try turning off Hardware Acceleration (Settings > Advanced).",
  "code.exe":
    "Disable extensions you do not need and close large folders or terminals in VS Code.",
  "obs64.exe":
    "Lower the output resolution or FPS, or use a hardware encoder (NVENC or AMF) instead of x264.",
  "steam.exe":
    "Close the Steam window when you are not using it, since it keeps running in the tray.",
  "steamwebhelper.exe":
    "This is Steam's built-in browser. Turning off GPU accelerated rendering in web views (Steam > Settings > Interface) can reduce usage.",
};

// Background apps that compete with games. There is no game detection yet
// (Roadmap Week 5), so gaming tips are based on this list.
const GAMING_BACKGROUND_APPS = new Set([
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
]);

function securityRecommendations(a: ProcessAnalysis): Recommendation[] {
  const scan =
    "Right-click the file, choose Scan with Microsoft Defender, or run a full scan in Windows Security.";

  if (a.title.includes("Impersonation")) {
    return [
      { type: "security", text: scan },
      {
        type: "security",
        text: "Use Open File Location to see where it is stored. If you do not recognise it, end the task and delete the file.",
      },
    ];
  }
  if (a.title.includes("Temporary")) {
    return [
      {
        type: "security",
        text: "If you just started an installer, let it finish. Otherwise scan the file before trusting it.",
      },
      { type: "security", text: scan },
    ];
  }
  if (a.title.includes("Downloads")) {
    return [
      {
        type: "security",
        text: "If you trust it, move it to a permanent folder such as Program Files. If you do not, delete it.",
      },
    ];
  }
  if (a.title.includes("Unusual")) {
    return [
      {
        type: "security",
        text: "Search the file name online to see if it is known, then scan it.",
      },
      { type: "security", text: scan },
    ];
  }
  if (a.title.includes("Missing")) {
    return [
      {
        type: "security",
        text: "If you do not recognise this process, search its name online. Running Pulse AI as administrator can reveal paths that Windows hides from normal apps.",
      },
    ];
  }

  return [{ type: "security", text: scan }];
}

function performanceRecommendations(a: ProcessAnalysis): Recommendation[] {
  const name = a.process.name;
  const list: Recommendation[] = [];

  const appTip = APP_TIPS[name.toLowerCase()];
  if (appTip) list.push({ type: "performance", text: appTip });

  switch (a.category) {
    case "cpu":
      list.push({
        type: "performance",
        text: `If you are not using ${name}, close it. If it keeps using high CPU, restart it or check for an update.`,
      });
      break;
    case "memory":
      list.push({
        type: "performance",
        text: `Restarting ${name} usually releases the memory it has built up. Also close programs and browser tabs you no longer need.`,
      });
      break;
    case "gpu":
      list.push({
        type: "performance",
        text: `If you are not gaming or rendering, close ${name}. Check the app's settings for hardware acceleration, which can be turned off.`,
      });
      break;
    case "disk":
      list.push({
        type: "performance",
        text: `Heavy disk use is often an update, backup or indexing job. Let it finish if you can, or pause it in ${name}'s settings.`,
      });
      break;
    default:
      break;
  }

  return list;
}

function gamingRecommendations(a: ProcessAnalysis): Recommendation[] {
  if (a.category === "suspicious") return [];
  if (!GAMING_BACKGROUND_APPS.has(a.process.name.toLowerCase())) return [];

  return [
    {
      type: "gaming",
      text: `Close ${a.process.name} before you start a game so its CPU, GPU and memory are free for the game.`,
    },
  ];
}

export function buildRecommendations(a: ProcessAnalysis): Recommendation[] {
  if (a.category === "suspicious") return securityRecommendations(a);

  return [...performanceRecommendations(a), ...gamingRecommendations(a)];
}

export function buildActions(a: ProcessAnalysis): InsightAction[] {
  const actions: InsightAction[] = [];

  if (a.process.executablePath) {
    actions.push({ kind: "openLocation", label: "Open File Location" });
  }
  if (!a.process.isCritical) {
    actions.push({ kind: "endTask", label: "End Task" });
  }

  return actions;
}