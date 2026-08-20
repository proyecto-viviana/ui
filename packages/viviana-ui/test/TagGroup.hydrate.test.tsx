/**
 * Hydration regression for TagGroup's `isRenderedTag()` helper (client half).
 *
 * Hydrates over TagGroup's own SSR markup and asserts Solid reports no "Hydration Mismatch".
 * On the client `HTMLElement` DOES exist, so `isRenderedTag` takes the real `instanceof` branch;
 * if the server and client ever disagreed on whether an item was "already a Tag", the wrap/no-wrap
 * decision would differ between renders and desync every hydration key after it. See
 * TagGroup.ssr.test.tsx for the mechanism.
 */
import { hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TagGroupFixture, TagGroupPrebuiltTagFixture } from "./fixtures/tag-group";

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

describe("TagGroup hydrates over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("plain string tag content hydrates with no mismatch", () => {
    const r = hydrateOverSsr("tag-group-ssr.html", TagGroupFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(3);
  });

  it("prebuilt <Tag> render-prop content hydrates with no mismatch", () => {
    const r = hydrateOverSsr("tag-group-prebuilt-ssr.html", TagGroupPrebuiltTagFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(3);
  });
});
