/**
 * Hydration regression for the styled Tree (client half).
 *
 * Guards two distinct regressions:
 *  1. Eager-JSX-double-use theft: the styled Tree used to construct both
 *     return branches eagerly, so building the unused detached `framed` div
 *     MOVED the server nodes the returned `collection` had just claimed, and
 *     the live page hydrated an empty subtree. The failure is SILENT — no
 *     Hydration Mismatch warning, no throw — so the load-bearing assertion is
 *     that the rows still exist in the DOM after hydrate() returns, not merely
 *     that nothing complained. See fixtures/tree.tsx for the mechanism.
 *  2. Repeated `local.children` reads (ResolvedItemContent/TreeItemContent):
 *     each read of a static-JSX children getter re-instantiates the subtree,
 *     so the server's first, discarded instantiation consumed a hydration tick
 *     and the emitted copy carried shifted keys — the client threw "Hydration
 *     Mismatch. Unable to find DOM nodes for hydration key". Fixed by the
 *     read-once pattern (see gridlist's ResolvedItemContent).
 */
import { hydrate } from "solid-js/web";
import { sharedConfig, type JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TreeFixture, TreeLabeledFixture } from "./fixtures/tree";

function installHydrationGlobals(): void {
  // A mid-hydration throw in an earlier test leaves solid's module-global
  // sharedConfig dirty, and the next hydrate() then silently client-renders
  // instead of claiming server nodes — every assertion passes without testing
  // hydration at all. Reset it so each test starts from a clean claim state.
  const cfg = sharedConfig as unknown as Record<string, unknown>;
  cfg.context = undefined;
  cfg.done = false;
  cfg.registry = undefined;
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

function hydrateOverSsr(
  ssrFile: string,
  Fixture: () => JSX.Element,
): { thrown: unknown; mismatches: string[]; container: HTMLElement } {
  const messages: string[] = [];
  const capture = (...args: unknown[]) => {
    messages.push(args.map(String).join(" "));
  };
  const warnSpy = vi.spyOn(console, "warn").mockImplementation(capture);
  const errorSpy = vi.spyOn(console, "error").mockImplementation(capture);

  const container = document.createElement("div");
  container.innerHTML = readFileSync(
    resolve(import.meta.dirname, `../../../output/${ssrFile}`),
    "utf8",
  );
  document.body.appendChild(container);

  let thrown: unknown;
  try {
    hydrate(() => <Fixture />, container);
  } catch (err) {
    thrown = err;
  }

  warnSpy.mockRestore();
  errorSpy.mockRestore();
  return {
    thrown,
    mismatches: messages.filter((m) => /Hydration Mismatch/.test(m)),
    container,
  };
}

describe("Tree hydrates over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("bare Tree keeps its rows after hydration", () => {
    const r = hydrateOverSsr("tree-ssr.html", TreeFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    // THE regression assertion: the theft left the live DOM with only
    // hydration markers here while both checks above still passed.
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(4);
    expect(r.container.textContent).toContain("Projects");
  });

  it("labeled (framed) Tree keeps its rows after hydration", () => {
    const r = hydrateOverSsr("tree-labeled-ssr.html", TreeLabeledFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(4);
    expect(r.container.textContent).toContain("Projects");
  });
});
