import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush, sharedConfig } from "solid-js";
import { afterEach, expect, it, vi } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
import {
  StreamingFixture,
  deliverStreamingTail,
  runStreamingScripts,
  type StreamingProbe,
} from "./fixtures/utilsStreaming";

const { shell, tail } = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../../../output/utils-streaming-ssr.json"), "utf8"),
) as { shell: string; tail: string };
const pending = () =>
  (sharedConfig as unknown as { isHydrationInProgress(): boolean }).isHydrationInProgress();
const globalNames = [
  "_$HY",
  "$R",
  "$df",
  "$dfr",
  "$dfl",
  "$dflj",
  "$dfd",
  "$dfs",
  "$dfg",
  "$dfc",
  "$dfj",
];
const descriptors = () =>
  globalNames.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));

function isolatePriorState() {
  const original = descriptors();
  const configNames = ["events", "registry", "boundaryScopes", "verifyHydration"];
  const originalConfig = configNames.map((name) =>
    Object.getOwnPropertyDescriptor(sharedConfig, name),
  );
  const registry = new Map([["prior", document.createElement("aside")]]);
  const scopes = new Map([["prior", { prior: true }]]);
  const configGetter = vi.fn(() => "must not read config");
  const configSetter = vi.fn();
  Object.defineProperty(sharedConfig, "events", {
    get: configGetter,
    set: configSetter,
    configurable: true,
    enumerable: false,
  });
  Object.defineProperty(sharedConfig, "registry", {
    value: registry,
    configurable: true,
    writable: false,
  });
  Object.defineProperty(sharedConfig, "boundaryScopes", {
    value: scopes,
    configurable: true,
    writable: false,
  });
  const expectedConfig = configNames.map((name) =>
    Object.getOwnPropertyDescriptor(sharedConfig, name),
  );
  const warn = Object.getOwnPropertyDescriptor(console, "warn");
  const error = Object.getOwnPropertyDescriptor(console, "error");
  const sentinel = { prior: true };
  const records = { prior: "records" };
  const getter = vi.fn(() => "must not read");
  const setter = vi.fn();
  Object.defineProperty(globalThis, "_$HY", {
    value: sentinel,
    configurable: true,
    writable: false,
  });
  Object.defineProperty(globalThis, "$R", { value: records, configurable: true, writable: false });
  Object.defineProperty(globalThis, "$df", {
    get: getter,
    set: setter,
    configurable: true,
    enumerable: false,
  });
  Reflect.deleteProperty(globalThis, "$dfj");
  const expected = descriptors();
  return {
    async check() {
      for (let index = 0; index < 2; index++) {
        expect(descriptors()).toEqual(expected);
        expect(Object.getOwnPropertyDescriptor(console, "warn")).toEqual(warn);
        expect(Object.getOwnPropertyDescriptor(console, "error")).toEqual(error);
        expect(sentinel).toEqual({ prior: true });
        expect(records).toEqual({ prior: "records" });
        expect(getter).not.toHaveBeenCalled();
        expect(setter).not.toHaveBeenCalled();
        expect(
          configNames.map((name) => Object.getOwnPropertyDescriptor(sharedConfig, name)),
        ).toEqual(expectedConfig);
        expect(configGetter).not.toHaveBeenCalled();
        expect(configSetter).not.toHaveBeenCalled();
        expect([...registry.keys()]).toEqual(["prior"]);
        expect([...scopes.entries()]).toEqual([["prior", { prior: true }]]);
        await Promise.resolve();
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      }
    },
    restore() {
      configNames.forEach((name, index) => {
        const descriptor = originalConfig[index];
        if (descriptor) Object.defineProperty(sharedConfig, name, descriptor);
        else Reflect.deleteProperty(sharedConfig, name);
      });
      globalNames.forEach((name, index) => {
        const descriptor = original[index];
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else Reflect.deleteProperty(globalThis, name);
      });
    },
  };
}

afterEach(() => {
  try {
    cleanupHydrationRoots();
  } finally {
    document.body.innerHTML = "";
  }
});

async function hydrateStream(probe: Omit<StreamingProbe, "load"> = {}) {
  let root!: Element;
  let fallback!: Element;
  let following!: Element;
  let resolved!: Element;
  let followingId = "";
  let resolvedId = "";
  const container = await hydrateOverSsr(
    shell,
    () => <StreamingFixture {...probe} load={() => Promise.resolve("client-only-value")} />,
    {
      beforeHydrate(container) {
        root = container.querySelector("[data-stream-root]")!;
        fallback = container.querySelector('[data-stream="fallback"]')!;
        following = container.querySelector('[data-stream="following"]')!;
        expect(root).not.toBeNull();
        expect(fallback).not.toBeNull();
        expect(following).not.toBeNull();
        followingId = following.id;
        expect(followingId).not.toBe("");
        runStreamingScripts(container);
      },
      afterHydrate(container) {
        expect(pending()).toBe(true);
        expect(container.querySelector('[data-stream="fallback"]')).toBe(fallback);
        expect(container.querySelector('[data-stream="following"]')).toBe(following);
        expect(container.querySelector('[data-stream="resolved"]')).toBeNull();
        deliverStreamingTail(container, tail, (fragment) => {
          resolved = fragment
            .querySelector("template")!
            .content.querySelector('[data-stream="resolved"]')!;
          expect(resolved).not.toBeNull();
          resolvedId = resolved.id;
          expect(resolvedId).not.toBe("");
        });
      },
    },
  );
  expect(pending()).toBe(false);
  expect(container.querySelector("[data-stream-root]")).toBe(root);
  expect(container.querySelector('[data-stream="following"]')).toBe(following);
  expect(container.querySelector('[data-stream="resolved"]')).toBe(resolved);
  expect(following.id).toBe(followingId);
  expect(resolved.id).toBe(resolvedId);
  expect(resolved).toHaveTextContent("stream-context:server-value:first");
  expect(fallback.isConnected).toBe(false);
  return { container, following, resolved, followingId, resolvedId };
}

it("adopts a late streamed render prop with context, updates and balanced conditional disposal", async () => {
  let controls!: Parameters<NonNullable<StreamingProbe["controls"]>>[0];
  const created: Array<{ kind: string; token: symbol; id: string }> = [];
  const disposed: symbol[] = [];
  const refs = new Map<string, HTMLSpanElement>();
  const { container, following, resolved, followingId, resolvedId } = await hydrateStream({
    controls(value) {
      controls = value;
    },
    constructed(kind, token, id) {
      created.push({ kind, token, id });
    },
    disposed(token) {
      disposed.push(token);
    },
    ref(kind, element) {
      refs.set(kind, element);
    },
  });
  expect(refs.get("following")).toBe(following);
  expect(refs.get("resolved")).toBe(resolved);
  expect(created.find((entry) => entry.kind === "following")?.id).toBe(followingId);
  expect(created.find((entry) => entry.kind === "resolved")?.id).toBe(resolvedId);
  expect(disposed).toEqual(
    created.filter((entry) => entry.kind === "fallback").map((entry) => entry.token),
  );
  controls.update();
  flush();
  expect(container.querySelector('[data-stream="resolved"]')).toBe(resolved);
  expect(resolved).toHaveTextContent("stream-context:server-value:second");
  expect(following).toHaveTextContent("stream-context:second");
  controls.reveal(false);
  flush();
  expect(resolved.isConnected).toBe(false);
  expect(disposed).toContain(created.find((entry) => entry.kind === "resolved")!.token);
  controls.reveal(true);
  flush();
  const replacement = container.querySelector('[data-stream="resolved"]');
  expect(replacement).not.toBeNull();
  expect(replacement).not.toBe(resolved);
  expect(replacement).toHaveTextContent("stream-context:server-value:second");
  expect(container.querySelector('[data-stream="following"]')).toBe(following);
  cleanupHydrationRoots();
  expect(disposed).toHaveLength(created.length);
  expect(new Set(disposed)).toEqual(new Set(created.map((entry) => entry.token)));
  const createdBeforeWrite = [...created];
  const disposedBeforeWrite = [...disposed];
  controls.update();
  controls.reveal(false);
  flush();
  expect(created).toEqual(createdBeforeWrite);
  expect(disposed).toEqual(disposedBeforeWrite);
});

it("times out a missing tail, disposes the pending boundary, and recovers the same fragment ID", async () => {
  const prior = isolatePriorState();
  let failed!: HTMLElement;
  let cleanupCount = 0;
  try {
    await expect(
      hydrateOverSsr(
        shell,
        () => <StreamingFixture load={() => Promise.resolve("client-only-value")} />,
        {
          hydrationTimeoutMs: 50,
          beforeHydrate(container) {
            failed = container;
            runStreamingScripts(container);
          },
          afterHydrate() {
            expect(pending()).toBe(true);
          },
          cleanupHydration(dispose) {
            expect(typeof dispose).toBe("function");
            dispose!();
            cleanupCount++;
          },
        },
      ),
    ).rejects.toThrow("Hydration did not complete within 50ms");
    expect(cleanupCount).toBe(1);
    expect(failed.isConnected).toBe(false);
    expect(pending()).toBe(false);
    await prior.check();
    await hydrateStream();
    await prior.check();
  } finally {
    prior.restore();
  }
});

it("rejects a real late tag mismatch and recovers exact adoption on the next stream", async () => {
  const prior = isolatePriorState();
  let failed!: HTMLElement;
  let lateKey = "";
  let lateNode: HTMLElement | undefined;
  let diagnostic: unknown;
  try {
    try {
      await hydrateOverSsr(
        shell,
        () => <StreamingFixture load={() => Promise.resolve("client-only-value")} />,
        {
          beforeHydrate(container) {
            failed = container;
            runStreamingScripts(container);
          },
          afterHydrate(container) {
            expect(pending()).toBe(true);
            deliverStreamingTail(container, tail, (fragment) => {
              const node = fragment
                .querySelector("template")!
                .content.querySelector('[data-stream="resolved"]')!;
              expect(node).not.toBeNull();
              lateKey = node.getAttribute("_hk")!;
              const wrong = document.createElement("em");
              lateNode = wrong;
              for (const attribute of node.attributes)
                wrong.setAttribute(attribute.name, attribute.value);
              wrong.append(...node.childNodes);
              node.replaceWith(wrong);
            });
          },
        },
      );
    } catch (error) {
      diagnostic = error;
    }
    expect(lateKey).not.toBe("");
    expect(diagnostic).toBeInstanceOf(Error);
    expect((diagnostic as Error).message).toMatch(
      new RegExp(`Hydration tag mismatch.*${lateKey}`, "i"),
    );
    expect((diagnostic as Error).message).toContain("expected <span>");
    expect(lateNode?.tagName).toBe("EM");
    expect(lateNode?.getAttribute("_hk")).toBe(lateKey);
    expect(failed.isConnected).toBe(false);
    expect(pending()).toBe(false);
    await prior.check();
    await hydrateStream();
    await prior.check();
  } finally {
    prior.restore();
  }
});

it.each([undefined, null, false, 0, ""])(
  "preserves exact falsy pending seam failure %s over cleanup and recovers",
  async (primary) => {
    const prior = isolatePriorState();
    let failed!: HTMLElement;
    let rejected = false;
    let error: unknown = Symbol("not rejected");
    let cleanupCount = 0;
    try {
      try {
        await hydrateOverSsr(
          shell,
          () => <StreamingFixture load={() => Promise.resolve("client-only-value")} />,
          {
            beforeHydrate(container) {
              failed = container;
              runStreamingScripts(container);
            },
            afterHydrate() {
              expect(pending()).toBe(true);
              throw primary;
            },
            cleanupHydration(dispose) {
              expect(typeof dispose).toBe("function");
              dispose!();
              cleanupCount++;
              throw new Error("secondary cleanup failure");
            },
          },
        );
      } catch (caught) {
        rejected = true;
        error = caught;
      }
      expect(rejected).toBe(true);
      expect(error).toBe(primary);
      expect(cleanupCount).toBe(1);
      expect(failed.isConnected).toBe(false);
      expect(pending()).toBe(false);
      await prior.check();
      await hydrateStream();
      await prior.check();
    } finally {
      prior.restore();
    }
  },
);
