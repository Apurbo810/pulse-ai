export {};

declare global {
  interface Window {
    system: {
      getCpu: () => Promise<{
        usage: number;
        user: number;
        system: number;
        idle: number;
      }>;

      getMemory: () => Promise<{
        total: number;
        used: number;
        free: number;
      }>;

      getGpu: () => Promise<{
        model: string;
        vendor: string;
        vram: number;
        utilization: number;
      }>;

      getStorage: () => Promise<{

        size: number;
        used: number;
        available: number;
        use: number;
      }>;

    getNetwork: () => Promise<{
      rx_sec: number;
      tx_sec: number;
    }>;

    
    };
  }
}