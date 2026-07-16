export interface CpuInfo {
  usage: number;
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

export interface StorageInfo {
  size: number;
  used: number;
  available: number;
  use: number;
}

export interface NetworkInfo {
  rx_sec: number;
  tx_sec: number;
}