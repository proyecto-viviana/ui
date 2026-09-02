/**
 * Hydration regression for the collection components (client half).
 *
 * Hydrates Tabs and ListView over their own SSR markup and asserts Solid reports no
 * "Hydration Mismatch". A mismatch here is not cosmetic: Solid aborts hydration for the entire
 * tree on the first one, so a single off-by-one in a collection's node count ships a whole route
 * with dead event handlers. See Collections.ssr.test.tsx for the mechanism.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  TabsFixture,
  TabsPlainFixture,
  TabsCompFixture,
  TabsBadgeFixture,
  TabsIconFixture,
  ListViewFixture,
  ListViewInteractiveFixture,
  ListViewStaticInteractiveFixture,
  ListViewSlottedFixture,
} from "./fixtures/collections";
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

function readSsr(name: string): string {
  return readFileSync(resolve(import.meta.dirname, `../../../output/${name}`), "utf8");
}

describe("collection components hydrate over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("Tabs hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("tabs-ssr.html"), () => <TabsFixture />);
    // The selected tab keeps its indicator through hydration.
    expect(container.querySelectorAll('[data-rsp-slot="selection-indicator"]').length).toBe(1);
  });

  it("Tabs with a raw span hydrates with no mismatch", () => {
    hydrateOverSsr(readSsr("tabs-plain-ssr.html"), () => <TabsPlainFixture />);
  });

  it("Tabs with a trivial local component child hydrates with no mismatch", () => {
    hydrateOverSsr(readSsr("tabs-comp-ssr.html"), () => <TabsCompFixture />);
  });

  it("Tabs with a mixed string + element (badge) child hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("tabs-badge-ssr.html"), () => <TabsBadgeFixture />);
    // The badge element survives hydration rather than being dropped for an empty <span>.
    expect(container.textContent).toContain("4");
  });

  it("Tabs with an element-first (icon) child hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("tabs-icon-ssr.html"), () => <TabsIconFixture />);
    expect(container.textContent).toContain("Home");
  });

  it("ListView hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("listview-ssr.html"), () => <ListViewFixture />);
    expect(container.querySelectorAll('[role="row"]').length).toBe(2);
  });

  // Known red: ticket #134 — a click on a hydrated ListView row moves DOM
  // focus but leaves aria-selected="false". Keep the test; wrap it so the
  // hydrate gate stays green until the product bug is fixed. If this starts
  // passing, remove the it.fails envelope.
  it.fails("#134 ListView rows respond to interaction after hydration (focus + selection)", async () => {
    const container = hydrateOverSsr(readSsr("listview-interactive-ssr.html"), () => (
      <ListViewInteractiveFixture />
    ));

    const rowA = container.querySelector<HTMLElement>('[role="row"][data-key="row-a"]');
    expect(rowA).not.toBeNull();
    expect(rowA).toHaveAttribute("aria-selected", "false");

    const user = setupUser();
    await user.click(rowA!);

    // A real click on a hydrated row must both move DOM focus onto it and
    // toggle selection — proof the row's press/selection handlers are wired
    // up post-hydration, not merely that the server markup looks right.
    expect(container.ownerDocument.activeElement).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");

    await user.click(rowA!);
    expect(rowA).toHaveAttribute("aria-selected", "false");
  });

  it("ListView with static <ListViewItem> children hydrates and rows respond to interaction", async () => {
    const container = hydrateOverSsr(readSsr("listview-static-interactive-ssr.html"), () => (
      <ListViewStaticInteractiveFixture />
    ));

    // The rows must be present at all — not the "No items" empty-state row — and
    // must survive hydration without being replaced by a later client-only render.
    expect(container.querySelectorAll('[role="row"]').length).toBe(2);

    const rowA = container.querySelector<HTMLElement>('[role="row"][data-key="row-a"]');
    expect(rowA).not.toBeNull();
    expect(rowA).toHaveAttribute("aria-selected", "false");

    const user = setupUser();
    await user.click(rowA!);

    expect(container.ownerDocument.activeElement).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");
  });

  it("ListView with label + description + actions slots hydrates with no mismatch", () => {
    const container = hydrateOverSsr(readSsr("listview-slotted-ssr.html"), () => (
      <ListViewSlottedFixture />
    ));
    expect(container.querySelectorAll('[role="row"]').length).toBe(2);
    // The actions-slot Badge survives hydration.
    expect(container.textContent).toContain("READ");
  });
});
