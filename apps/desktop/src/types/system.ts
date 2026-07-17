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