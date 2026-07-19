export interface CpuInfo {
  usage: number;
  user: number;
  system: number;
  idle: number;
}

export interface MemoryInfo {
  total: number;
  used: number;
  free: number;
}

export interface GpuInfo {
  model: string;
  vendor: string;
  vram: number;
  utilization: number;
}

export interface StorageSummary {
  size: number;
  used: number;
  available: number;
  use: number;
}

export interface NetworkInfo {
  name: string;
  connected: boolean;
  speed: number;
  ip4: string;
  upload: number;
  download: number;
}

export interface StoragePartition {
  letter: string;

  size: number;

  used: number;

  available: number;

  usage: number;
}

export interface StorageDevice {
  device: string;

  model: string;

  type: string;

  interfaceType: string;

  size: number;

  partitions: StoragePartition[];
}


export interface DisplayInfo {
  model: string;
  vendor: string;
  main: boolean;
  resolution: string;
  refreshRate: number;
}

export interface KeyboardDevice {
  name: string;
  manufacturer: string;
}

export interface MouseDevice {
  name: string;
  manufacturer: string;
}

export interface DevicesInfo {
  keyboards: KeyboardDevice[];
  mice: MouseDevice[];
}


export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  executablePath: string | null;

  gpu?: number;
  disk?: number;
  status?: "Running" | "Suspended" | "Not Responding";
}