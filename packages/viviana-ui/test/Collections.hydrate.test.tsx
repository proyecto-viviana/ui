/**
 * Hydration regression for the collection components (client half).
 *
 * Hydrates Tabs and ListView over their own SSR markup and asserts Solid reports no
 * "Hydration Mismatch". A mismatch here is not cosmetic: Solid aborts hydration for the entire
 * tree on the first one, so a single off-by-one in a collection's node count ships a whole route
 * with dead event handlers. See Collections.ssr.test.tsx for the mechanism.
 */
import { hydrate } from "solid-js/web";
import type { JSX } from "solid-js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  TabsFixture,
  TabsPlainFixture,
  TabsCompFixture,
  ListViewFixture,
  ListViewInteractiveFixture,
  ListViewStaticInteractiveFixture,
} from "./fixtures/collections";
import { setupUser } from "../src/test-utils";

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

describe("collection components hydrate over SSR markup", () => {
  beforeEach(() => installHydrationGlobals());
  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("Tabs hydrates with no mismatch", () => {
    const r = hydrateOverSsr("tabs-ssr.html", TabsFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    // The selected tab keeps its indicator through hydration.
    expect(r.container.querySelectorAll('[data-rsp-slot="selection-indicator"]').length).toBe(1);
  });

  it("Tabs with a raw span hydrates with no mismatch", () => {
    const r = hydrateOverSsr("tabs-plain-ssr.html", TabsPlainFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
  });

  it("Tabs with a trivial local component child hydrates with no mismatch", () => {
    const r = hydrateOverSsr("tabs-comp-ssr.html", TabsCompFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
  });

  it("ListView hydrates with no mismatch", () => {
    const r = hydrateOverSsr("listview-ssr.html", ListViewFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(2);
  });

  it("ListView rows respond to interaction after hydration (focus + selection)", async () => {
    const r = hydrateOverSsr("listview-interactive-ssr.html", ListViewInteractiveFixture);
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();

    const rowA = r.container.querySelector<HTMLElement>('[role="row"][data-key="row-a"]');
    expect(rowA).not.toBeNull();
    expect(rowA).toHaveAttribute("aria-selected", "false");

    const user = setupUser();
    await user.click(rowA!);

    // A real click on a hydrated row must both move DOM focus onto it and
    // toggle selection — proof the row's press/selection handlers are wired
    // up post-hydration, not merely that the server markup looks right.
    expect(r.container.ownerDocument.activeElement).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");

    await user.click(rowA!);
    expect(rowA).toHaveAttribute("aria-selected", "false");
  });

  it("ListView with static <ListViewItem> children hydrates and rows respond to interaction", async () => {
    const r = hydrateOverSsr(
      "listview-static-interactive-ssr.html",
      ListViewStaticInteractiveFixture,
    );
    expect(r.mismatches).toEqual([]);
    expect(r.thrown).toBeUndefined();

    // The rows must be present at all — not the "No items" empty-state row — and
    // must survive hydration without being replaced by a later client-only render.
    expect(r.container.querySelectorAll('[role="row"]').length).toBe(2);

    const rowA = r.container.querySelector<HTMLElement>('[role="row"][data-key="row-a"]');
    expect(rowA).not.toBeNull();
    expect(rowA).toHaveAttribute("aria-selected", "false");

    const user = setupUser();
    await user.click(rowA!);

    expect(r.container.ownerDocument.activeElement).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");
  });
});
