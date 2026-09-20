/**
 * Shared client-half helper for `*.hydrate.test.tsx`.
 *
 * Solid 2 owns its hydration registry and lifecycle. This helper installs the
 * browser bootstrap global, captures hydration diagnostics through Solid's
 * bounded deferred verification, and restores its own globals on every path.
 */

import { sharedConfig } from "solid-js";
import type { JSX } from "@solidjs/web";
import { hydrate } from "@solidjs/web";

const MISMATCH =
  /Hydration Mismatch|Hydration key miss|Hydration tag mismatch|Hydration structure mismatch|Hydration completed with \d+ unclaimed server-rendered node/i;

interface SolidHydrationConfig {
  verifyHydration?: () => void;
  isHydrationInProgress?: () => boolean;
  onHydrationEnd?: (callback: () => void) => void;
}

interface HydrateOverSsrOptions {
  beforeHydrate?: (container: HTMLElement) => void;
  /** Synchronous shell inspection/tail delivery, after hydrate returns its disposer. */
  afterHydrate?: (container: HTMLElement) => void;
  /** Bounds unresolved streaming boundaries; must fit within the runner timeout. */
  hydrationTimeoutMs?: number;
  /** Test seam for proving the pinned Solid verifier is required. */
  beforeVerify?: () => void;
  /** Test seam for proving cleanup failures cannot mask hydration failures. */
  cleanupHydration?: (dispose: (() => void) | undefined) => void;
}

const HYDRATION_DISPOSERS = Symbol.for("proyecto-viviana.test.hydration-disposers");

function registerHydrationDisposer(dispose: (() => void) | undefined): void {
  if (!dispose) return;
  const hydrationGlobal = globalThis as unknown as {
    [HYDRATION_DISPOSERS]?: Set<() => void>;
  };
  (hydrationGlobal[HYDRATION_DISPOSERS] ??= new Set()).add(dispose);
}

/** Internal test teardown; deliberately not exported from the package barrel. */
export function cleanupHydrationRoots(): void {
  const hydrationGlobal = globalThis as unknown as {
    [HYDRATION_DISPOSERS]?: Set<() => void>;
  };
  const disposers = hydrationGlobal[HYDRATION_DISPOSERS];
  hydrationGlobal[HYDRATION_DISPOSERS] = undefined;
  let didThrow = false;
  let thrown: unknown;
  for (const dispose of disposers ?? []) {
    try {
      dispose();
    } catch (error) {
      if (!didThrow) {
        didThrow = true;
        thrown = error;
      }
    }
  }
  if (didThrow) throw thrown;
}

const STREAM_GLOBALS = [
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
const HYDRATION_FIELDS = [
  "completed",
  "events",
  "load",
  "has",
  "gather",
  "loadModuleAssets",
  "cleanupFragment",
  "registry",
  "boundaryScopes",
  "captureBoundaryScope",
  "verifyHydration",
];
let hydrationActive = false;

function snapshotProperties(target: object, names: string[]) {
  return names.map((name) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, name);
    if (descriptor && !descriptor.configurable) {
      throw new Error(`Hydration harness cannot isolate non-configurable property ${name}`);
    }
    return { target, name, descriptor };
  });
}

function replaceProperty(target: object, name: string, value: unknown): void {
  Object.defineProperty(target, name, {
    value,
    configurable: true,
    writable: true,
    enumerable: true,
  });
}

function restoreProperty(
  target: object,
  name: string,
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) Object.defineProperty(target, name, descriptor);
  else if (!Reflect.deleteProperty(target, name)) {
    throw new Error(`Hydration harness could not restore absent property ${name}`);
  }
}

async function drainHydrationTimer(): Promise<void> {
  await Promise.resolve();
  // Completion callbacks run before rc.9 schedules its verifier/_$HY.done timer.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function waitForHydration(config: SolidHydrationConfig, timeoutMs: number) {
  if (
    typeof config.isHydrationInProgress !== "function" ||
    typeof config.onHydrationEnd !== "function"
  ) {
    throw new Error(
      "Solid 2 hydration completion APIs unavailable; this harness cannot certify hydration",
    );
  }
  let settled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let finish!: (error?: Error) => void;
  // Resolve with a result instead of rejecting: a synchronous seam failure must
  // not leave an unobserved rejection while the root is being disposed.
  const promise = new Promise<Error | undefined>((resolve) => {
    finish = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(error);
    };
    timer = setTimeout(
      () => finish(new Error(`Hydration did not complete within ${timeoutMs}ms`)),
      timeoutMs,
    );
    config.onHydrationEnd!(() => finish());
  });
  return { promise, cancel: () => finish() };
}

/**
 * Render `html` into a container, hydrate `fixture` over it, and return the
 * container. Throws if hydrate throws or if a hydration mismatch was logged.
 *
 * `fixture` is the same function you would pass to `hydrate` or
 * `renderToString` — typically `() => <Fixture />`, preserving the SSR writer's
 * authored owner structure. Calls must be serialized. Inline streaming scripts
 * may use the isolated globals above; document/head and module scripts are not supported.
 */
export async function hydrateOverSsr(
  html: string,
  fixture: () => JSX.Element,
  options: HydrateOverSsrOptions = {},
): Promise<HTMLElement> {
  const timeoutMs = options.hydrationTimeoutMs ?? 1000;
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0)
    throw new Error("hydrationTimeoutMs must be positive and finite");
  if (hydrationActive) throw new Error("hydrateOverSsr calls must be serialized");
  // Preflight every descriptor before changing any state. Never invoke a prior
  // bootstrap accessor merely to save its value.
  const snapshots = [
    ...snapshotProperties(globalThis, STREAM_GLOBALS),
    ...snapshotProperties(sharedConfig, HYDRATION_FIELDS),
    ...snapshotProperties(console, ["warn", "error"]),
  ];
  const config = sharedConfig as unknown as SolidHydrationConfig;
  const messages: string[] = [];
  const origWarn = snapshots.find((entry) => entry.target === console && entry.name === "warn")
    ?.descriptor?.value;
  const origError = snapshots.find((entry) => entry.target === console && entry.name === "error")
    ?.descriptor?.value;
  if (typeof origWarn !== "function" || typeof origError !== "function") {
    throw new Error(
      "Hydration harness requires console warn/error data methods for safe isolation",
    );
  }
  const capture =
    (original: (...args: unknown[]) => void) =>
    (...args: unknown[]) => {
      const message = args.map(String).join(" ");
      if (MISMATCH.test(message)) messages.push(message);
      else Reflect.apply(original, console, args);
    };

  const container = document.createElement("div");
  let didThrow = false;
  let thrown: unknown;
  let cleanupThrew = false;
  let cleanupError: unknown;
  let dispose: (() => void) | undefined;
  let hydrationAttempted = false;
  let wait: ReturnType<typeof waitForHydration> | undefined;
  let disposed = false;
  const retainPrimaryError = (error: unknown) => {
    if (!didThrow) {
      didThrow = true;
      thrown = error;
    }
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    try {
      if (options.cleanupHydration) options.cleanupHydration(dispose);
      else dispose?.();
    } catch (error) {
      if (!cleanupThrew) {
        cleanupThrew = true;
        cleanupError = error;
      }
    }
  };
  hydrationActive = true;
  try {
    for (const name of STREAM_GLOBALS) replaceProperty(globalThis, name, undefined);
    for (const name of HYDRATION_FIELDS) replaceProperty(sharedConfig, name, undefined);
    replaceProperty(globalThis, "_$HY", { events: [], completed: new WeakSet(), r: {}, fe() {} });
    replaceProperty(sharedConfig, "boundaryScopes", new Map());
    replaceProperty(console, "warn", capture(origWarn));
    replaceProperty(console, "error", capture(origError));
    container.innerHTML = html;
    document.body.appendChild(container);
    options.beforeHydrate?.(container);

    try {
      hydrationAttempted = true;
      dispose = hydrate(fixture, container);
    } catch (err) {
      retainPrimaryError(err);
    }

    if (!didThrow) {
      try {
        if (typeof dispose !== "function") {
          throw new Error(
            "Solid 2 hydrate returned no disposer; this harness cannot manage the hydrated root",
          );
        }
        wait = waitForHydration(config, timeoutMs);
        const result: unknown = options.afterHydrate?.(container);
        if (
          result != null &&
          (typeof result === "object" || typeof result === "function") &&
          "then" in result
        ) {
          // Reject the unsupported async seam without leaking its rejection.
          void Promise.resolve(result).catch(() => {});
          throw new Error(
            "afterHydrate must be synchronous; deliver or schedule a bounded tail without returning a Promise",
          );
        }
        const completionError = await wait.promise;
        if (completionError) throw completionError;
        if (config.isHydrationInProgress!())
          throw new Error("Solid reported hydration completion with a boundary still pending");
        await drainHydrationTimer();
        options.beforeVerify?.();
        const verifyHydration = config.verifyHydration;
        if (typeof verifyHydration !== "function") {
          throw new Error(
            "Solid 2 hydration verifier unavailable after hydrate; this harness cannot certify hydration",
          );
        }
        verifyHydration();
      } catch (err) {
        retainPrimaryError(err);
      }
    }
  } catch (err) {
    retainPrimaryError(err);
  } finally {
    wait?.cancel();
    // Disposing a pending boundary can itself trigger completion and its timer.
    // Keep this attempt's callbacks, bootstrap globals and diagnostics in place.
    if (didThrow || messages.length > 0) {
      cleanup();
    }
    if (hydrationAttempted) {
      try {
        await drainHydrationTimer();
      } catch (error) {
        retainPrimaryError(error);
      }
    }
    if (didThrow || messages.length > 0 || cleanupThrew) {
      cleanup();
      try {
        container.remove();
      } catch (error) {
        if (!cleanupThrew) {
          cleanupThrew = true;
          cleanupError = error;
        }
      }
    }
    for (const { target, name, descriptor } of snapshots.reverse()) {
      try {
        restoreProperty(target, name, descriptor);
      } catch (error) {
        if (!cleanupThrew) {
          cleanupThrew = true;
          cleanupError = error;
        }
        // Even an exceptional restoration failure must not orphan a root that
        // otherwise hydrated successfully. Completion has already drained here.
        cleanup();
        try {
          container.remove();
        } catch {
          /* Preserve the first restoration/cleanup failure. */
        }
      }
    }
    hydrationActive = false;
  }

  if (didThrow) throw thrown;
  if (messages.length > 0) throw new Error(messages.join("\n"));
  if (cleanupThrew) throw cleanupError;
  registerHydrationDisposer(dispose);
  return container;
}
