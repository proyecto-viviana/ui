import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStream } from "@solidjs/web";
import { expect, it } from "vite-plus/test";
import { StreamingFixture } from "./fixtures/utilsStreaming";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function bounded(promise: Promise<void>, stage: string): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Streaming ${stage} timed out`)), 1000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

it("writes an unresolved shell before its independently delivered resolved fragment", async () => {
  const gate = deferred<string>();
  const firstWrite = deferred<void>();
  const complete = deferred<void>();
  const chunks: string[] = [];
  const errors: unknown[] = [];
  const stream = renderToStream(() => <StreamingFixture load={() => gate.promise} />, {
    onError(error) {
      errors.push(error);
    },
  });
  stream.pipe({
    write(chunk: string) {
      chunks.push(chunk);
      firstWrite.resolve();
    },
    end() {
      complete.resolve();
    },
  });
  let failed = false;
  let failure: unknown;
  try {
    await bounded(firstWrite.promise, "shell");
    const shellCount = chunks.length;
    const shell = chunks.join("");
    expect(shell).toContain('data-stream="fallback"');
    expect(shell).toContain('data-stream="following"');
    expect(shell).not.toContain('data-stream="resolved"');
    expect(shell).toMatch(/\s_hk=/);
    expect(shell).toContain('id="pl-');
    expect(errors).toEqual([]);
    gate.resolve("server-value");
    await bounded(complete.promise, "tail");
    const tail = chunks.slice(shellCount).join("");
    expect(tail).toMatch(/<template[^>]*id="/);
    expect(tail).toContain('data-stream="resolved"');
    expect(tail.replace(/<!--[\s\S]*?-->/g, "")).toContain("stream-context:server-value:first");
    expect(tail).toContain("$df(");
    expect(errors).toEqual([]);
    const output = resolve(import.meta.dirname, "../../../output");
    mkdirSync(output, { recursive: true });
    writeFileSync(
      resolve(output, "utils-streaming-ssr.json"),
      JSON.stringify({ shell, tail }),
      "utf8",
    );
  } catch (error) {
    failed = true;
    failure = error;
  } finally {
    gate.resolve("server-value");
    try {
      await bounded(complete.promise, "cleanup");
    } catch (error) {
      if (!failed) {
        failed = true;
        failure = error;
      } else console.error("Streaming cleanup also failed", error);
    }
  }
  if (failed) throw failure;
});
