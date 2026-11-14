// apps/desktop/electron/services/diagnostics/__tests__/storage.test.ts

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { JsonlSessionStore } from "../storage";
import type { Sample, SessionMeta } from "../../../../src/types/diagnostics";

// The store never looks inside these objects, so partial test data is enough.
function makeMeta(id: string, startedAt = Date.now()): SessionMeta {
  return {
    id,
    reason: "manual",
    startedAt,
    endedAt: null,
    intervalMs: 1000,
    sampleCount: 0,
    isAdmin: false,
    appVersion: "test",
    hardware: {} as SessionMeta["hardware"],
    sensors: {} as SessionMeta["sensors"],
  };
}

function makeSample(t: number): Sample {
  return { t, topProcesses: [] } as unknown as Sample;
}

describe("JsonlSessionStore", () => {
  let dir: string;
  let store: JsonlSessionStore;

  beforeEach(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "pulse-store-"));
    store = new JsonlSessionStore(dir);
  });

  afterEach(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  it("round-trips samples", async () => {
    await store.create(makeMeta("s1"));
    await store.append("s1", [makeSample(1), makeSample(2)]);
    await store.append("s1", [makeSample(3)]);

    const samples = await store.readSamples("s1");
    expect(samples.map((s) => s.t)).toEqual([1, 2, 3]);
  });

  it("skips a line cut off by a crash", async () => {
    await store.create(makeMeta("s1"));
    await store.append("s1", [makeSample(1)]);
    await fs.appendFile(path.join(dir, "s1.samples.jsonl"), '{"t": 2, "top');

    const samples = await store.readSamples("s1");
    expect(samples.map((s) => s.t)).toEqual([1]);
  });

  it("rejects ids that could escape the folder", async () => {
    await expect(store.getMeta("../secret")).rejects.toThrow();
    await expect(store.create(makeMeta("a/b"))).rejects.toThrow();
    await expect(store.readSamples("..\\x")).rejects.toThrow();
  });

  it("refuses to create the same session twice", async () => {
    await store.create(makeMeta("s1"));
    await expect(store.create(makeMeta("s1"))).rejects.toThrow();
  });

  it("lists newest first", async () => {
    await store.create(makeMeta("old", 1000));
    await store.create(makeMeta("new", 3000));
    await store.create(makeMeta("mid", 2000));

    const ids = (await store.list()).map((m) => m.id);
    expect(ids).toEqual(["new", "mid", "old"]);
  });

  it("returns an empty list when nothing was recorded yet", async () => {
    const empty = new JsonlSessionStore(path.join(dir, "missing"));
    expect(await empty.list()).toEqual([]);
  });

  it("finish merges changes and keeps the id", async () => {
    await store.create(makeMeta("s1"));
    await store.finish("s1", { endedAt: 5000, sampleCount: 42, id: "hacked" });

    const meta = await store.getMeta("s1");
    expect(meta?.id).toBe("s1");
    expect(meta?.endedAt).toBe(5000);
    expect(meta?.sampleCount).toBe(42);
  });

  it("prunes sessions beyond the limit and removes both files", async () => {
    const day = 86_400_000;
    const now = Date.now();
    for (let i = 0; i < 4; i += 1) {
      const meta = makeMeta(`s${i}`, now - i * 1000);
      meta.endedAt = meta.startedAt + 500;
      await store.create(meta);
      await store.append(meta.id, [makeSample(i)]);
    }

    const removed = await store.prune({ maxSessions: 2, maxAgeDays: day });
    expect(removed).toBe(2);

    const remaining = (await store.list()).map((m) => m.id);
    expect(remaining).toEqual(["s0", "s1"]);
    await expect(
      fs.access(path.join(dir, "s3.samples.jsonl"))
    ).rejects.toThrow();
  });

  it("does not prune a session that may still be recording", async () => {
    await store.create(makeMeta("live", Date.now() - 1000));
    const removed = await store.prune({ maxSessions: 0, maxAgeDays: 0 });
    expect(removed).toBe(0);
    expect(await store.getMeta("live")).not.toBeNull();
  });
});