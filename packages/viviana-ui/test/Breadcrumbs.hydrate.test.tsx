/**
 * Hydration regression for Breadcrumbs (client half).
 *
 * Hydrates the overflowing-items fixture over its own SSR markup and asserts Solid reports no
 * "Hydration Mismatch". A mismatch here is not cosmetic: Solid aborts hydration for the entire
 * tree on the first one, so a divergence in Breadcrumbs' collapse decision would ship a whole
 * route with dead event handlers. See Breadcrumbs.ssr.test.tsx for the mechanism and
 * Collections.hydrate.test.tsx for the general harness pattern this mirrors.
 */
import { hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { BreadcrumbsOverflowFixture } from "./fixtures/breadcrumbs";

function installHydrationGlobals(): void {
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
  // Solid reports hydration mismatches through console.warn, and throws separately; capture
  // both so a silent warn can never pass as success.
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

describe("Breadcrumbs hydrates over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates the overflowing item list with no mismatch", () => {
    const r = hydrateOverSsr("breadcrumbs-overflow-ssr.html", BreadcrumbsOverflowFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    // Collapsed shape survives hydration: root item, overflow menu trigger, fallback tail.
    expect(r.container.querySelector("[data-rsp-breadcrumb-menu]")).not.toBeNull();
    expect(r.container.textContent).toContain("Home");
    expect(r.container.textContent).toContain("Annual report");
  });
});
