// apps/desktop/electron/services/diagnostics/storage.ts

import { promises as fs } from "node:fs";
import path from "node:path";
import type { Sample, SessionMeta } from "../../../src/types/diagnostics";

export interface PruneOptions {
  maxSessions: number;
  maxAgeDays: number;
}

export interface SessionStore {
  create(meta: SessionMeta): Promise<void>;
  append(id: string, samples: Sample[]): Promise<void>;
  finish(id: string, patch: Partial<SessionMeta>): Promise<void>;
  getMeta(id: string): Promise<SessionMeta | null>;
  list(): Promise<SessionMeta[]>; // newest first
  readSamples(id: string): Promise<Sample[]>;
  delete(id: string): Promise<void>;
  prune(options: PruneOptions): Promise<number>; // returns how many were removed
}

const ID_PATTERN = /^[A-Za-z0-9_-]{1,80}$/;
const DAY_MS = 86_400_000;
const META_SUFFIX = ".meta.json";

// Ids may come from the renderer later, so they must never contain path parts.
export function isValidSessionId(id: unknown): id is string {
  return typeof id === "string" && ID_PATTERN.test(id);
}

function isNotFound(error: unknown): boolean {
  return (error as NodeJS.ErrnoException)?.code === "ENOENT";
}

export class JsonlSessionStore implements SessionStore {
  constructor(private readonly rootDir: string) {}

  private file(id: string, kind: "meta" | "samples"): string {
    if (!isValidSessionId(id)) throw new Error("Invalid session id.");
    return path.join(
      this.rootDir,
      kind === "meta" ? `${id}${META_SUFFIX}` : `${id}.samples.jsonl`
    );
  }

  // Write to a temp file, then rename, so a crash never leaves half a file.
  // On Windows the rename can fail for a moment when antivirus or another
  // reader has the file open, so retry a few times.
  private async writeMeta(meta: SessionMeta): Promise<void> {
    const target = this.file(meta.id, "meta");
    const temp = `${target}.tmp`;
    await fs.writeFile(temp, JSON.stringify(meta, null, 2), "utf8");

    for (let attempt = 1; ; attempt += 1) {
      try {
        await fs.rename(temp, target);
        return;
      } catch (error) {
        const code = (error as NodeJS.ErrnoException)?.code;
        const retryable =
          code === "EPERM" || code === "EBUSY" || code === "EACCES";
        if (!retryable || attempt >= 5) throw error;
        await new Promise((resolve) => setTimeout(resolve, 40 * attempt));
      }
    }
  }

  async create(meta: SessionMeta): Promise<void> {
    await fs.mkdir(this.rootDir, { recursive: true });
    // "wx" fails if the session already exists
    await fs.writeFile(this.file(meta.id, "samples"), "", { flag: "wx" });
    await this.writeMeta(meta);
  }

  async append(id: string, samples: Sample[]): Promise<void> {
    if (samples.length === 0) return;
    const lines = samples.map((s) => JSON.stringify(s)).join("\n") + "\n";
    await fs.appendFile(this.file(id, "samples"), lines, "utf8");
  }

  async getMeta(id: string): Promise<SessionMeta | null> {
    try {
      const text = await fs.readFile(this.file(id, "meta"), "utf8");
      return JSON.parse(text) as SessionMeta;
    } catch (error) {
      if (isNotFound(error) || error instanceof SyntaxError) return null;
      throw error;
    }
  }

  async finish(id: string, patch: Partial<SessionMeta>): Promise<void> {
    const current = await this.getMeta(id);
    if (!current) throw new Error(`Session ${id} not found.`);
    await this.writeMeta({ ...current, ...patch, id: current.id });
  }

  async list(): Promise<SessionMeta[]> {
    let names: string[];
    try {
      names = await fs.readdir(this.rootDir);
    } catch (error) {
      if (isNotFound(error)) return [];
      throw error;
    }

    const ids = names
      .filter((name) => name.endsWith(META_SUFFIX))
      .map((name) => name.slice(0, -META_SUFFIX.length))
      .filter(isValidSessionId);

    const metas = await Promise.all(ids.map((id) => this.getMeta(id)));

    return metas
      .filter((meta): meta is SessionMeta => meta !== null)
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  async readSamples(id: string): Promise<Sample[]> {
    let text: string;
    try {
      text = await fs.readFile(this.file(id, "samples"), "utf8");
    } catch (error) {
      if (isNotFound(error)) return [];
      throw error;
    }

    const samples: Sample[] = [];
    for (const line of text.split("\n")) {
      if (!line.trim()) continue;
      try {
        samples.push(JSON.parse(line) as Sample);
      } catch {
        // A line cut off by a crash. Skip it and keep the rest.
      }
    }
    return samples;
  }

  async delete(id: string): Promise<void> {
    await fs.rm(this.file(id, "meta"), { force: true });
    await fs.rm(this.file(id, "samples"), { force: true });
  }

  async prune({ maxSessions, maxAgeDays }: PruneOptions): Promise<number> {
    const now = Date.now();
    const sessions = await this.list();
    let removed = 0;

    for (let index = 0; index < sessions.length; index += 1) {
      const session = sessions[index];

      // Do not delete a session that may still be recording
      if (session.endedAt === null && now - session.startedAt < DAY_MS) continue;

      const tooMany = index >= maxSessions;
      const tooOld = now - session.startedAt > maxAgeDays * DAY_MS;

      if (tooMany || tooOld) {
        await this.delete(session.id);
        removed += 1;
      }
    }

    return removed;
  }
}