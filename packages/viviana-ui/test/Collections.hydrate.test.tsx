/**
 * Hydration regression for the collection components (client half).
 *
 * Hydrates Tabs and ListView over their own SSR markup and asserts Solid reports no
 * "Hydration Mismatch". A mismatch here is not cosmetic: Solid aborts hydration for the entire
 * tree on the first one, so a single off-by-one in a collection's node count ships a whole route
 * with dead event handlers. See Collections.ssr.test.tsx for the mechanism.
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { waitFor } from "@solidjs/testing-library";
import { render } from "@solidjs/web";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createSignal, For, flush } from "solid-js";
import { ListView, ListViewItem, Provider, Text } from "../src";
import {
  TabsFixture,
  TabsPlainFixture,
  TabsCompFixture,
  TabsFocusablePanelFixture,
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
  let disposeClientMount: (() => void) | undefined;
  afterEach(() => {
    const dispose = disposeClientMount;
    disposeClientMount = undefined;
    try {
      dispose?.();
    } finally {
      document.body.innerHTML = "";
    }
  });

  it("Tabs hydrates with no mismatch", async () => {
    const container = await hydrateOverSsr(readSsr("tabs-ssr.html"), () => <TabsFixture />);
    // The selected tab keeps its indicator through hydration.
    expect(container.querySelectorAll('[data-rsp-slot="selection-indicator"]').length).toBe(1);
  });

  it("Tabs with a raw span hydrates with no mismatch", async () => {
    await hydrateOverSsr(readSsr("tabs-plain-ssr.html"), () => <TabsPlainFixture />);
  });

  it("Tabs with a trivial local component child hydrates with no mismatch", async () => {
    await hydrateOverSsr(readSsr("tabs-comp-ssr.html"), () => <TabsCompFixture />);
  });

  it("Tabs settles focus order after hydrating a panel with a tabbable child", async () => {
    const container = await hydrateOverSsr(readSsr("tabs-focusable-panel-ssr.html"), () => (
      <TabsFocusablePanelFixture />
    ));
    flush();

    const panel = container.querySelector<HTMLElement>('[role="tabpanel"]');
    const before = container.querySelector<HTMLButtonElement>("button");
    const tabs = container.querySelectorAll<HTMLElement>('[role="tab"]');
    const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
    const reviewControl = container.querySelector<HTMLButtonElement>(
      '[data-testid="review-control"]',
    );
    const reviewPanel = reviewControl?.parentElement;
    expect(panel).not.toBeNull();
    expect(before).not.toBeNull();
    expect(tabs).toHaveLength(2);
    expect(textarea).not.toBeNull();
    expect(reviewControl).not.toBeNull();
    expect(reviewPanel).toHaveAttribute("data-inert", "true");

    await waitFor(() => expect(panel).not.toHaveAttribute("tabindex"));

    const user = setupUser();
    before!.focus();
    await user.tab();
    expect(document.activeElement).toBe(tabs[0]);
    await user.tab();
    expect(document.activeElement).toBe(textarea);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(tabs[0]);

    // Changing selection after hydration re-runs the check on the panel that just
    // became active: it holds a tabbable control, so it must leave sequential focus
    // order rather than keep the tabindex="0" it was force-mounted with.
    await user.click(tabs[1]);
    flush();
    await waitFor(() => {
      expect(reviewPanel).not.toHaveAttribute("data-inert");
      expect(reviewPanel).not.toHaveAttribute("tabindex");
    });
  });

  it("Tabs with a mixed string + element (badge) child hydrates with no mismatch", async () => {
    const container = await hydrateOverSsr(readSsr("tabs-badge-ssr.html"), () => (
      <TabsBadgeFixture />
    ));
    // The badge element survives hydration rather than being dropped for an empty <span>.
    expect(container.textContent).toContain("4");
  });

  it("Tabs with an element-first (icon) child hydrates with no mismatch", async () => {
    const container = await hydrateOverSsr(readSsr("tabs-icon-ssr.html"), () => (
      <TabsIconFixture />
    ));
    expect(container.textContent).toContain("Home");
  });

  it("ListView hydrates with no mismatch", async () => {
    const container = await hydrateOverSsr(readSsr("listview-ssr.html"), () => <ListViewFixture />);
    expect(container.querySelectorAll('[role="row"]').length).toBe(2);
  });

  it("ListView rows respond to interaction after hydration (focus + selection)", async () => {
    const container = await hydrateOverSsr(readSsr("listview-interactive-ssr.html"), () => (
      <ListViewInteractiveFixture />
    ));
    flush();

    const rowA = container.querySelector<HTMLElement>('[role="row"][data-key="row-a"]');
    expect(rowA).not.toBeNull();
    expect(rowA).toHaveAttribute("aria-selected", "false");

    const user = setupUser();
    await user.click(rowA!);
    flush();

    // A real click on a hydrated row must both move DOM focus onto it and
    // toggle selection — proof the row's press/selection handlers are wired
    // up post-hydration, not merely that the server markup looks right.
    expect(container.ownerDocument.activeElement).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");

    await user.click(rowA!);
    flush();
    expect(rowA).toHaveAttribute("aria-selected", "false");
  });

  it("ListView with static <ListViewItem> children hydrates and rows respond to interaction", async () => {
    const container = await hydrateOverSsr(readSsr("listview-static-interactive-ssr.html"), () => (
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

  it("ListView with label + description + actions slots hydrates with no mismatch", async () => {
    const container = await hydrateOverSsr(readSsr("listview-slotted-ssr.html"), () => (
      <ListViewSlottedFixture />
    ));
    expect(container.querySelectorAll('[role="row"]').length).toBe(2);
    // The actions-slot Badge survives hydration.
    expect(container.textContent).toContain("READ");
  });

  it("keeps static registration reactive after client mount (complementary to hydration)", async () => {
    const [keys, setKeys] = createSignal(["a", "b"]);
    const [disabled, setDisabled] = createSignal(false);
    const onSelectionChange = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    disposeClientMount = render(
      () => (
        <Provider background="base" colorScheme="dark">
          <ListView
            aria-label="Mutable static rows"
            selectionMode="multiple"
            onSelectionChange={onSelectionChange}
          >
            <For each={keys()}>
              {(key) => (
                <ListViewItem id={key} textValue={key} isDisabled={key === "a" && disabled()}>
                  <Text slot="label">{key}</Text>
                </ListViewItem>
              )}
            </For>
          </ListView>
        </Provider>
      ),
      container,
    );
    const rows = () =>
      Array.from(container.querySelectorAll<HTMLElement>('[role="row"][data-key]'));
    const rowA = rows()[0];
    expect(rows().map((row) => row.dataset.key)).toEqual(["a", "b"]);
    const user = setupUser();
    await user.click(rowA);
    flush();
    expect(rowA).toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["a"]));

    setKeys(["a", "b", "c"]);
    flush();
    await waitFor(() => expect(rows().map((row) => row.dataset.key)).toEqual(["a", "b", "c"]));
    expect(rows()[0]).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");

    setDisabled(true);
    flush();
    await waitFor(() => expect(rowA).toHaveAttribute("aria-disabled", "true"));
    // Disabled rows intentionally omit aria-selected. Check the event contract
    // here and the retained selection after re-enabling below.
    expect(rowA).not.toHaveAttribute("aria-selected");
    const selectionEvents = onSelectionChange.mock.calls.length;
    await user.click(rowA);
    flush();
    expect(onSelectionChange).toHaveBeenCalledTimes(selectionEvents);

    setKeys(["a", "c"]);
    setDisabled(false);
    flush();
    await waitFor(() => {
      expect(rows().map((row) => row.dataset.key)).toEqual(["a", "c"]);
      expect(rowA).not.toHaveAttribute("aria-disabled");
    });
    expect(rows()[0]).toBe(rowA);
    expect(rowA).toHaveAttribute("aria-selected", "true");
    await user.click(rowA);
    flush();
    expect(rowA).toHaveAttribute("aria-selected", "false");
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set());
  });
});
