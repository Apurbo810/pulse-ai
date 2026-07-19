import type {
    CpuInfo,
    MemoryInfo,
    GpuInfo,
    StorageSummary,
    StorageDevice,
    NetworkInfo,
    DisplayInfo,
    DevicesInfo,
    ProcessInfo,
  } from "../types/system";



  export {};

  declare global {
    interface Window {
      system: {
        getCpu: () => Promise<CpuInfo>;

        getMemory: () => Promise<MemoryInfo>;

        getGpu: () => Promise<GpuInfo>;

        getStorage: () => Promise<StorageSummary>;

        getStorageDevices: () => Promise<StorageDevice[]>;

        getNetwork: () => Promise<NetworkInfo>;


        getDisplayInfo: () => Promise<DisplayInfo[]>;

        getDevices: () => Promise<DevicesInfo>;

        getProcesses: () => Promise<ProcessInfo[]>;
      };
    }
  }