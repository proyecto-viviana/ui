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
}

interface HydrateOverSsrOptions {
  beforeHydrate?: (container: HTMLElement) => void;
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

function installHydrationGlobals(): void {
  // Mirrors solid's generateHydrationScript() init so `hydrate` finds the
  // hydration registry instead of crashing on `_$HY.done`.
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

/**
 * Render `html` into a container, hydrate `fixture` over it, and return the
 * container. Throws if hydrate throws or if a hydration mismatch was logged.
 *
 * `fixture` is the same function you would pass to `hydrate` or
 * `renderToString` — typically `() => <Fixture />`, so the extra
 * `createComponent` tick matches the SSR writer.
 */
export async function hydrateOverSsr(
  html: string,
  fixture: () => JSX.Element,
  options: HydrateOverSsrOptions = {},
): Promise<HTMLElement> {
  const hydrationGlobal = globalThis as unknown as { _$HY?: unknown };
  const hadHydrationGlobal = Object.prototype.hasOwnProperty.call(hydrationGlobal, "_$HY");
  const previousHydrationGlobal = hydrationGlobal._$HY;
  const messages: string[] = [];
  const origWarn = console.warn;
  const origError = console.error;
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
  let cleanupError: unknown;
  let dispose: (() => void) | undefined;
  let hydrationAttempted = false;
  const retainPrimaryError = (error: unknown) => {
    if (!didThrow) {
      didThrow = true;
      thrown = error;
    }
  };
  try {
    installHydrationGlobals();
    console.warn = capture(origWarn);
    console.error = capture(origError);
    container.innerHTML = html;
    document.body.appendChild(container);
    options.beforeHydrate?.(container);

    try {
      hydrationAttempted = true;
      dispose = hydrate(fixture, container);
    } catch (err) {
      retainPrimaryError(err);
    }

    if (hydrationAttempted) {
      try {
        // Solid's event replay cleanup is queued during hydration and still
        // reads `_$HY`. Keep the temporary bootstrap global installed until
        // that bounded work has run, while diagnostics are still captured.
        await Promise.resolve();

        // The pinned development runtime performs its own verification and
        // writes `_$HY.done` from a zero-delay timer even when hydrate throws.
        // Its timer was registered during hydrate, so this later timer is the
        // bounded lifecycle barrier.
        await new Promise<void>((resolve) => setTimeout(resolve, 0));
      } catch (err) {
        retainPrimaryError(err);
      }
    }

    if (!didThrow) {
      try {
        if (typeof dispose !== "function") {
          throw new Error(
            "Solid 2 hydrate returned no disposer; this harness cannot manage the hydrated root",
          );
        }

        options.beforeVerify?.();
        const verifyHydration = (sharedConfig as unknown as SolidHydrationConfig).verifyHydration;
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
    console.warn = origWarn;
    console.error = origError;
    if (hadHydrationGlobal) hydrationGlobal._$HY = previousHydrationGlobal;
    else delete hydrationGlobal._$HY;

    if (didThrow || messages.length > 0) {
      try {
        if (options.cleanupHydration) options.cleanupHydration(dispose);
        else dispose?.();
      } catch (err) {
        cleanupError ??= err;
      }
      try {
        container.remove();
      } catch (err) {
        cleanupError ??= err;
      }
    }
  }

  if (didThrow) throw thrown;
  if (messages.length > 0) throw new Error(messages.join("\n"));
  if (cleanupError) throw cleanupError;
  registerHydrationDisposer(dispose);
  return container;
}
