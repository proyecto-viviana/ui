/**
 * Shared client-half helper for `*.hydrate.test.tsx`.
 *
 * A mid-hydration throw leaves Solid's module-global `sharedConfig` dirty
 * (`context` still set). The next `hydrate()` then silently client-renders
 * instead of claiming server nodes, so later assertions pass without testing
 * hydration. This helper always resets `context` / `done` / `registry` /
 * `effects` in `finally`.
 */

import { sharedConfig, type JSX } from "solid-js";
import { hydrate } from "solid-js/web";

const MISMATCH = /Hydration Mismatch|template is not a function/i;

function resetSharedConfig(): void {
  const cfg = sharedConfig as unknown as Record<string, unknown>;
  cfg.context = undefined;
  cfg.done = false;
  cfg.registry = undefined;
  cfg.effects = undefined;
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
export function hydrateOverSsr(html: string, fixture: () => JSX.Element): HTMLElement {
  resetSharedConfig();
  installHydrationGlobals();

  const messages: string[] = [];
  const capture = (...args: unknown[]) => {
    messages.push(args.map(String).join(" "));
  };
  const origWarn = console.warn;
  const origError = console.error;
  console.warn = capture;
  console.error = capture;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  let thrown: unknown;
  try {
    hydrate(fixture, container);
  } catch (err) {
    thrown = err;
  } finally {
    console.warn = origWarn;
    console.error = origError;
    resetSharedConfig();
  }

  if (thrown) throw thrown;
  const mismatches = messages.filter((m) => MISMATCH.test(m));
  if (mismatches.length > 0) {
    throw new Error(mismatches.join("\n"));
  }
  return container;
}
