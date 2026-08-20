/**
 * Hydration-reactivity guard for the S2 Button.
 *
 * The comparison D12 (SSR/hydration) work drives the Button through a
 * createMemo-recreation pattern: a control event swaps demoProps, the memo
 * rebuilds the whole Button subtree. This suite hydrates each SSR fixture over
 * its server markup and then flips the signal, asserting:
 *  - RECREATION re-binds after hydration (the property the fixture relies on).
 *  - FINE-GRAINED reactive text passed directly as Button children does NOT
 *    re-bind — Button.ResolvedContent resolves children in a once-evaluated
 *    ternary, so a multi-node dynamic child never re-tracks (a general Button
 *    limitation, not hydration-specific). This is why the fixture wraps its
 *    label in a span and recreates the Button instead of interpolating. If a
 *    future Button change makes fine-grained children reactive, this assertion
 *    fails loudly and should be updated to expect the improved behavior.
 * Both shapes must hydrate with no throw and no console.error (no mismatch).
 */
import { hydrate } from "solid-js/web";
import { createMemo, createSignal, type JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Provider } from "../src/provider";
import { Button } from "../src/button";

function installHydrationGlobals(): void {
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

function FineGrainedFixture(props: { count: () => number }) {
  return (
    <Provider background="base" colorScheme="dark">
      <Button variant="accent">count: {props.count()}</Button>
    </Provider>
  );
}

function RecreationFixture(props: { count: () => number }) {
  const rendered = createMemo(() => (
    <Button variant="accent">
      <span data-rsp-slot="text">count: {props.count()}</span>
    </Button>
  ));
  return (
    <Provider background="base" colorScheme="dark">
      {rendered()}
    </Provider>
  );
}

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

function hydrateAndFlip(
  ssrFile: string,
  Fixture: (props: { count: () => number }) => JSX.Element,
): { before?: string; after?: string; thrown: unknown; errors: unknown[][] } {
  const errors: unknown[][] = [];
  const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
    errors.push(args);
  });

  const container = document.createElement("div");
  container.innerHTML = readSsr(ssrFile);
  document.body.appendChild(container);

  const [count, setCount] = createSignal(0);
  let thrown: unknown;
  try {
    hydrate(() => <Fixture count={count} />, container);
  } catch (err) {
    thrown = err;
  }

  const before = container.querySelector("button")?.textContent?.trim();
  setCount(1);
  const after = container.querySelector("button")?.textContent?.trim();

  errorSpy.mockRestore();
  return { before, after, thrown, errors };
}

describe("Button hydration reactivity", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("recreation pattern re-binds after hydration (comparison fixture shape)", () => {
    const r = hydrateAndFlip("button-recreate-ssr.html", RecreationFixture);
    expect(r.thrown).toBeUndefined();
    expect(r.errors).toEqual([]);
    expect(r.before).toContain("count: 0");
    expect(r.after).toContain("count: 1");
  });

  it("documents: fine-grained children do NOT re-bind (fixture uses recreation)", () => {
    const r = hydrateAndFlip("button-finegrained-ssr.html", FineGrainedFixture);
    expect(r.thrown).toBeUndefined();
    expect(r.errors).toEqual([]);
    expect(r.before).toContain("count: 0");
    // Known limitation — see the file header. If this flips to "count: 1", the
    // Button gained reactive multi-node children; update this expectation.
    expect(r.after).toContain("count: 0");
  });
});
