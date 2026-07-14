export {};

declare global {
  interface Window {
    system: {
      getCpu: () => Promise<{
        usage: number;
      }>;

      getMemory: () => Promise<{
        total: number;
        used: number;
        free: number;
      }>;
    };
  }
}