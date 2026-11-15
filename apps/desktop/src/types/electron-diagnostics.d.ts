// apps/desktop/src/types/electron-diagnostics.d.ts

import type {
  RecorderStatus,
  Sample,
  SessionMeta,
  StartOptions,
} from "./diagnostics";

export {};

declare global {
  interface Window {
    diagnostics: {
      start: (options?: StartOptions) => Promise<SessionMeta>;
      stop: () => Promise<SessionMeta | null>;
      status: () => Promise<RecorderStatus>;
      list: () => Promise<SessionMeta[]>;
      getSamples: (id: string) => Promise<Sample[]>;
      remove: (id: string) => Promise<void>;
    };
  }
}