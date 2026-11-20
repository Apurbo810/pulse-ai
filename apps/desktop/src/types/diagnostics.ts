// apps/desktop/src/types/diagnostics.ts

/**
 * A sensor reading. null means "this PC does not report it".
 * Never use 0 for "unknown", because 0 is a real value (an idle GPU is 0%).
 */
export type Reading = number | null;

export type SessionReason = "manual" | "ai" | "background";
export type SessionState = "recording" | "completed" | "interrupted";

export type SensorKey =
  | "cpuUsage"
  | "cpuPerformance"
  | "cpuTemperature"
  | "cpuVoltage"
  | "memory"
  | "pageFile"
  | "gpuUsage"
  | "gpuTemperature"
  | "gpuPower"
  | "gpuClock"
  | "diskActivity"
  | "diskQueue"
  | "network";

/** Which sensors worked during a session, so reports never guess. */
export type SensorAvailability = Record<SensorKey, boolean>;

export interface DiskSummary {
  name: string;
  type: "SSD" | "HDD" | "Unknown";
  health: string;
}

export interface HardwareSummary {
  cpuName: string;
  cpuCores: number;
  cpuBaseGHz: number;
  ramTotalMB: number;
  gpuName: string | null;
  disks: DiskSummary[];
  powerPlan: string | null;
}

export interface SessionMeta {
  id: string;
  reason: SessionReason;
  startedAt: number; // ms since epoch
  endedAt: number | null; // null only while recording
  state?: SessionState;  // null while recording, or if the app crashed
  intervalMs: number;
  sampleCount: number;
  isAdmin: boolean;
  hardware: HardwareSummary;
  sensors: SensorAvailability;
  sensorTiming?: Record<string, SensorTiming>; // how long each sensor read took
  skippedSlots?: number; // sampling slots lost because the app was stalled
  maxLagMs?: number; 
  appVersion: string;
  
}

export interface TopProcessSample {
  pid: number;
  name: string;
  cpu: number; // % of total CPU
  memoryMB: number;
  gpu: number; // %
  diskMBps: number;
}

export interface Sample {
  t: number; // ms since epoch
  lagMs?: number; // how late this tick fired, compared with its scheduled time
  cpu: {
    usage: Reading; // %
    perCore: number[]; // % per core
    performancePercent: Reading; // % of base clock; above 100 means boosting
    temperatureC: Reading; // empty on most PCs for now
    voltageV: Reading; // empty on most PCs for now
  };
  memory: {
    usedPercent: Reading;
    usedMB: Reading;
    pageFileUsedPercent: Reading;
  };
  gpu: {
    usage: Reading; // %
    temperatureC: Reading;
    powerW: Reading;
    coreClockMHz: Reading;
    memoryUsedMB: Reading;
    throttleReasons: number | null; // NVIDIA bitmask, 1 = idle only
  };
  disk: {
    activePercent: Reading; // % disk time
    queueLength: Reading;
  };

  network: {
    downBytesPerSec: Reading;
    upBytesPerSec: Reading;
    adapter?: string | null; // which adapter the speeds came from
  };
  topProcesses: TopProcessSample[];
}

export type DiagnosisSeverity = "low" | "medium" | "high" | "critical";
export type Confidence = "low" | "medium" | "high";

export interface DiagnosisFinding {
  id: string; // for example "cpu-bound-process"
  title: string;
  summary: string; // plain language
  severity: DiagnosisSeverity;
  confidence: Confidence;
  evidence: string[]; // for example "Code.exe averaged 42% CPU over 5 minutes"
  actions: string[];
}

export interface DiagnosisReport {
  sessionId: string;
  generatedAt: number;
  durationSec: number;
  summary: string;
  findings: DiagnosisFinding[]; // most likely cause first
  unavailableSensors: SensorKey[]; // so the report says what it could not see
}

export interface StartOptions {
  reason?: SessionReason;
  intervalMs?: number; // 1000 to 10000, default 2000
  maxDurationMs?: number; // 10 s to 30 min, default 5 min
}

export interface RecorderStatus {
  recording: boolean;
  session: SessionMeta | null;
  elapsedMs: number;
  sampleCount: number;
  lastSample: Sample | null;
}

export interface SensorTiming {
  runs: number;
  avgMs: number;
  maxMs: number;
  failures: number;
}