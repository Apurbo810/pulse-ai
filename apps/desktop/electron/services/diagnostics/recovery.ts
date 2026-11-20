// apps/desktop/electron/services/diagnostics/recovery.ts

import { emptyAvailability, updateAvailability } from "./parsers";
import type { SessionStore } from "./storage";

/**
 * A session that never got its final save (the app closed, crashed, or was
 * restarted during recording) still has its samples on disk. This rebuilds its
 * metadata from them. Run it at startup, when nothing can be recording.
 * Returns how many sessions were repaired.
 */
export async function recoverInterruptedSessions(
  store: SessionStore,
  skipId?: string
): Promise<number> {
  const sessions = await store.list();
  let repaired = 0;

  for (const session of sessions) {
    if (session.id === skipId) continue;
    if (session.endedAt !== null) continue; // finished normally

    try {
      const samples = await store.readSamples(session.id);

      const sensors = emptyAvailability();
      for (const sample of samples) updateAvailability(sensors, sample);

      const last = samples[samples.length - 1];

      await store.finish(session.id, {
        endedAt: last ? last.t : session.startedAt,
        state: "interrupted",
        sampleCount: samples.length,
        sensors,
      });
      repaired += 1;
    } catch (error) {
      // One damaged session must not stop the others
      console.error(`Could not recover session ${session.id}:`, error);
    }
  }

  return repaired;
}