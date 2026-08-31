/**
 * @vitest-environment jsdom
 *
 * Regression tests for the comparison-app controlled-tabs desync (zombie DOM).
 *
 * `solid-js/h` defers component creation into one-shot thunks that
 * dom-expressions unwraps inside a shared array insert effect, so the effect
 * that CREATES sibling components is the same tracked scope that READS their
 * returned reactive accessors (TabPanel's root is a `Show` whose memo flips
 * DIV↔undefined on selection). When one accessor flips, the effect re-runs,
 * disposes every sibling it owns, and `h`'s one-shot thunks hand back the same
 * dead nodes — connected DOM whose reactivity is permanently disposed. The
 * comparison app's `hc` wrapper fixes this by mirroring compiled-JSX creation
 * semantics; the bare-h wiring is kept here as `it.fails` documentation of the
 * upstream limitation.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { createComponent, createMemo, createSignal, Show, type JSX } from "solid-js";
import h from "solid-js/h";
import { hc } from "../../../apps/comparison/src/components/solid/solid-h";
import { Provider } from "../src/provider";
import { Tabs, TabList, Tab, TabPanel } from "../src/tabs";

if (typeof PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    width = 1;
    height = 1;
    constructor(type: string, init: MouseEventInit & { pointerId?: number; pointerType?: string }) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  (globalThis as Record<string, unknown>).PointerEvent = PointerEventPolyfill;
}

function pressWithMouse(target: HTMLElement) {
  target.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    }),
  );
  target.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: "mouse",
      button: 0,
    }),
  );
  target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
}

const items = [
  { id: "overview", label: "Overview" },
  { id: "parity", label: "Parity" },
];

function controlledProps() {
  const [selectedKey, setSelectedKey] = createSignal("overview");
  const onSelectionChange = vi.fn((key: unknown) => setSelectedKey(String(key)));

  const tabsProps = createMemo(() => {
    const next: Record<string, unknown> = {
      "aria-label": "Repro tabs",
      onSelectionChange,
    };
    Object.defineProperty(next, "selectedKey", {
      enumerable: true,
      get: () => selectedKey(),
    });
    return next;
  });

  return { tabsProps, onSelectionChange, selectedKey };
}

/** The comparison fixture wiring, built with bare `solid-js/h`. */
function bareHFixture() {
  const { tabsProps, onSelectionChange, selectedKey } = controlledProps();

  const tree = h(Provider, { colorScheme: "light", background: "base" }, [
    createComponent(Show, {
      when: "static-render-key",
      keyed: true,
      children: ((_key: unknown) =>
        h(Tabs, tabsProps(), [
          () => [
            h(
              TabList,
              {},
              items.map((item) => h(Tab, { id: item.id }, [item.label])),
            ),
            ...items.map((item) => h(TabPanel, { id: item.id }, [`Content ${item.label}`])),
          ],
        ])) as unknown as JSX.Element,
    }),
  ]) as unknown as JSX.Element;

  return { tree, onSelectionChange, selectedKey };
}

/** The comparison fixture wiring, built with the app's `hc` wrapper. */
function hcFixture() {
  const { tabsProps, onSelectionChange, selectedKey } = controlledProps();

  const tree = hc(Provider, { colorScheme: "light", background: "base" }, [
    createComponent(Show, {
      when: "static-render-key",
      keyed: true,
      children: ((_key: unknown) =>
        hc(Tabs, tabsProps(), [
          () => [
            hc(
              TabList,
              {},
              items.map((item) => hc(Tab, { id: item.id }, [item.label])),
            ),
            ...items.map((item) => hc(TabPanel, { id: item.id }, [`Content ${item.label}`])),
          ],
        ])) as unknown as JSX.Element,
    }),
  ]) as unknown as JSX.Element;

  return { tree, onSelectionChange, selectedKey };
}

async function pressParityAndAssert(fixture: {
  tree: JSX.Element;
  onSelectionChange: ReturnType<typeof vi.fn>;
  selectedKey: () => string;
}) {
  render(() => fixture.tree);
  const parity = screen.getByRole("tab", { name: "Parity" });
  const overview = screen.getByRole("tab", { name: "Overview" });
  expect(overview).toHaveAttribute("aria-selected", "true");

  pressWithMouse(parity);
  await Promise.resolve();

  expect(fixture.onSelectionChange).toHaveBeenCalledWith("parity");
  expect(fixture.selectedKey()).toBe("parity");
  // The DOM must follow the controlled round trip.
  expect(parity).toHaveAttribute("aria-selected", "true");
  expect(overview).toHaveAttribute("aria-selected", "false");
}

describe("controlled tabs round trip (comparison fixture wiring)", () => {
  it("hc fixture wiring: provider + keyed Show + memo props via comparison hc", async () => {
    await pressParityAndAssert(hcFixture());
  });

  // Upstream limitation, not ours: bare `solid-js/h` one-shot component thunks
  // zombie the TabList when the shared array insert effect re-runs on the
  // TabPanel Show flip. If this starts passing, solid-js/h changed its
  // component-thunk semantics and `hc` can likely be simplified.
  it.fails("bare solid-js/h fixture wiring zombies the tab DOM", async () => {
    await pressParityAndAssert(bareHFixture());
  });

  it("compiled outer Tabs + h-built inner children", async () => {
    const [selectedKey, setSelectedKey] = createSignal("overview");
    const onSelectionChange = vi.fn((key: unknown) => setSelectedKey(String(key)));
    render(() => (
      <Tabs
        aria-label="Mixed tabs A"
        selectedKey={selectedKey()}
        onSelectionChange={onSelectionChange}
      >
        {
          h(
            TabList,
            {},
            items.map((item) => h(Tab, { id: item.id }, [item.label])),
          ) as unknown as JSX.Element
        }
        {items.map((item) => h(TabPanel, { id: item.id }, [`Content ${item.label}`]))}
      </Tabs>
    ));
    const parity = screen.getByRole("tab", { name: "Parity" });
    pressWithMouse(parity);
    await Promise.resolve();
    expect(onSelectionChange).toHaveBeenCalledWith("parity");
    expect(parity).toHaveAttribute("aria-selected", "true");
  });

  it("h outer Tabs + compiled inner children", async () => {
    const [selectedKey, setSelectedKey] = createSignal("overview");
    const onSelectionChange = vi.fn((key: unknown) => setSelectedKey(String(key)));
    const next: Record<string, unknown> = { "aria-label": "Mixed tabs B", onSelectionChange };
    Object.defineProperty(next, "selectedKey", {
      enumerable: true,
      get: () => selectedKey(),
    });
    const tree = h(Tabs, next, [
      () => (
        <>
          <TabList>
            <Tab id="overview">Overview</Tab>
            <Tab id="parity">Parity</Tab>
          </TabList>
          <TabPanel id="overview">Content Overview</TabPanel>
          <TabPanel id="parity">Content Parity</TabPanel>
        </>
      ),
    ]) as unknown as JSX.Element;
    render(() => tree);
    const parity = screen.getByRole("tab", { name: "Parity" });
    pressWithMouse(parity);
    await Promise.resolve();
    expect(onSelectionChange).toHaveBeenCalledWith("parity");
    expect(parity).toHaveAttribute("aria-selected", "true");
  });

  it("compiled JSX controlled + real pointerdown (baseline)", async () => {
    const [selectedKey, setSelectedKey] = createSignal("overview");
    const onSelectionChange = vi.fn((key: unknown) => setSelectedKey(String(key)));
    render(() => (
      <Tabs
        aria-label="Baseline tabs"
        selectedKey={selectedKey()}
        onSelectionChange={onSelectionChange}
      >
        <TabList>
          <Tab id="overview">Overview</Tab>
          <Tab id="parity">Parity</Tab>
        </TabList>
        <TabPanel id="overview">Content Overview</TabPanel>
        <TabPanel id="parity">Content Parity</TabPanel>
      </Tabs>
    ));

    const parity = screen.getByRole("tab", { name: "Parity" });
    pressWithMouse(parity);
    await Promise.resolve();

    expect(onSelectionChange).toHaveBeenCalledWith("parity");
    expect(parity).toHaveAttribute("aria-selected", "true");
  });
});
