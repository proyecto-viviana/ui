/**
 * Tests for createTabs, createTab, createTabList, and createTabPanel hooks.
 * Based on @react-spectrum/tabs tests.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { render, fireEvent, screen } from "@solidjs/testing-library";
import { createRoot, createSignal, For, Show, type Accessor } from "solid-js";
import {
  createTabList,
  createTab,
  createTabPanel,
  type AriaTabListProps,
  type AriaTabProps,
  type AriaTabPanelProps,
  type TabListState,
} from "../src/tabs";
import { createTabListState, type TabListStateProps } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "../src/i18n";

// Default tab items for tests
const defaultItems = [
  { key: "tab1", label: "Tab 1", content: "Tab 1 body" },
  { key: "tab2", label: "Tab 2", content: "Tab 2 body" },
  { key: "tab3", label: "Tab 3", content: "Tab 3 body" },
];

// Test component that renders a complete tabs implementation
function TestTabs<T extends { key: string; label: string; content: string }>(props: {
  items?: T[];
  orientation?: "horizontal" | "vertical";
  keyboardActivation?: "automatic" | "manual";
  isDisabled?: boolean;
  disabledKeys?: string[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}) {
  const items = () => props.items ?? (defaultItems as T[]);

  const stateProps = (): TabListStateProps<T> => ({
    items: items(),
    getKey: (item) => item.key,
    getTextValue: (item) => item.label,
    disabledKeys: props.disabledKeys,
    selectedKey: props.selectedKey,
    defaultSelectedKey: props.defaultSelectedKey,
    onSelectionChange: props.onSelectionChange as ((key: string | number) => void) | undefined,
    isDisabled: props.isDisabled,
    keyboardActivation: props.keyboardActivation,
    orientation: props.orientation,
  });

  const state = createTabListState(stateProps);

  const tabListProps: AriaTabListProps = {
    orientation: props.orientation,
    keyboardActivation: props.keyboardActivation,
    isDisabled: props.isDisabled,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
  };

  const { tabListProps: listProps } = createTabList(tabListProps, state);

  return (
    <div>
      <div {...listProps} data-testid="tablist">
        <For each={items()}>
          {(item) => <TestTab key={item.key} state={state} label={item.label} />}
        </For>
      </div>
      <For each={items()}>
        {(item) => (
          <TestTabPanel id={item.key} state={state}>
            {item.content}
          </TestTabPanel>
        )}
      </For>
    </div>
  );
}

// Individual tab component
function TestTab<T>(props: { key: string; state: TabListState<T>; label: string }) {
  let tabRef: HTMLButtonElement | undefined;

  const tabProps: AriaTabProps = {
    key: props.key,
  };

  const {
    tabProps: ariaTabProps,
    isSelected,
    isDisabled,
  } = createTab(tabProps, props.state, () => tabRef ?? null);

  return (
    <button
      {...ariaTabProps}
      ref={tabRef}
      data-testid={`tab-${props.key}`}
      data-selected={isSelected()}
      data-disabled={isDisabled()}
    >
      {props.label}
    </button>
  );
}

// Tab panel component
function TestTabPanel<T>(props: { id: string; state: TabListState<T>; children: string }) {
  const panelProps: AriaTabPanelProps = {
    id: props.id,
  };

  const { tabPanelProps, isSelected } = createTabPanel(panelProps, props.state);

  return (
    <Show when={isSelected()}>
      <div {...tabPanelProps} data-testid={`panel-${props.id}`}>
        {props.children}
      </div>
    </Show>
  );
}

describe("createTabs", () => {
  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("renders properly", () => {
    it("renders tablist with correct role and orientation", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
      expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("renders tabs with correct roles and attributes", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);

      for (const tab of tabs) {
        expect(tab).toHaveAttribute("tabindex");
        expect(tab).toHaveAttribute("aria-selected");
      }
    });

    it("renders selected tab with aria-controls pointing to tabpanel", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      const selectedTab = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      expect(selectedTab).toBeTruthy();
      expect(selectedTab).toHaveAttribute("aria-controls");

      const panelId = selectedTab!.getAttribute("aria-controls");
      const panel = document.getElementById(panelId!);
      expect(panel).toBeTruthy();
      expect(panel).toHaveAttribute("role", "tabpanel");
      expect(panel).toHaveAttribute("aria-labelledby", selectedTab!.id);
    });

    it("renders tabpanel with correct content", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveTextContent("Tab 1 body");
    });

    it("supports vertical orientation", () => {
      render(() => <TestTabs aria-label="Test Tabs" orientation="vertical" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-orientation", "vertical");
    });

    it("supports aria-label", () => {
      render(() => <TestTabs aria-label="My Tabs" />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-label", "My Tabs");
    });

    it("supports aria-labelledby", () => {
      render(() => (
        <div>
          <h2 id="tabs-heading">Tabs Heading</h2>
          <TestTabs aria-labelledby="tabs-heading" />
        </div>
      ));

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-labelledby", "tabs-heading");
    });
  });

  describe("keyboard navigation - horizontal", () => {
    it("ArrowRight moves to next tab", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="horizontal"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("ArrowRight moves DOM focus to the next tab", () => {
      render(() => <TestTabs aria-label="Test Tabs" orientation="horizontal" />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(tabs[1]);
    });

    it("ArrowRight moves DOM focus even if tablist isFocused was cleared", () => {
      // Playwright `.focus()` can land DOM focus on a tab without the tablist
      // bubbling focusin setting isFocused. Keyboard nav must still move focus.
      let state: TabListState<(typeof defaultItems)[number]> | undefined;
      function Harness() {
        state = createTabListState({
          items: defaultItems,
          getKey: (item) => item.key,
          getTextValue: (item) => item.label,
        });
        const { tabListProps } = createTabList({ orientation: "horizontal" }, state);
        return (
          <div {...tabListProps} data-testid="tablist">
            <For each={defaultItems}>
              {(item) => <TestTab key={item.key} state={state!} label={item.label} />}
            </For>
          </div>
        );
      }

      render(() => <Harness />);
      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();
      expect(document.activeElement).toBe(tabs[0]);

      state!.setFocused(false);
      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(tabs[1]);
    });

    it("Arrow navigation emits one selection change in automatic mode", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("ArrowLeft moves to previous tab", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="horizontal"
          defaultSelectedKey="tab2"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      fireEvent.keyDown(tabs[1], { key: "ArrowLeft" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab1");
    });

    it("reverses ArrowLeft/ArrowRight behavior in RTL", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <I18nProvider locale="he-IL">
          <TestTabs
            aria-label="Test Tabs"
            orientation="horizontal"
            defaultSelectedKey="tab2"
            onSelectionChange={onSelectionChange}
          />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      fireEvent.keyDown(tabs[1], { key: "ArrowLeft" });
      expect(onSelectionChange).toHaveBeenCalledWith("tab3");

      fireEvent.keyDown(tabs[2], { key: "ArrowRight" });
      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("ArrowUp/ArrowDown do not change selection in horizontal mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="horizontal"
          defaultSelectedKey="tab2"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      // Clear any calls from initial selection
      onSelectionChange.mockClear();

      fireEvent.keyDown(tabs[1], { key: "ArrowUp" });
      fireEvent.keyDown(tabs[1], { key: "ArrowDown" });

      // Should not change selection (ArrowUp/Down ignored in horizontal)
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("wraps from last to first tab", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="horizontal"
          defaultSelectedKey="tab3"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[2].focus();

      fireEvent.keyDown(tabs[2], { key: "ArrowRight" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab1");
    });

    it("wraps from first to last tab", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="horizontal"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab3");
    });
  });

  describe("keyboard navigation - vertical", () => {
    it("ArrowDown moves to next tab in vertical mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="vertical"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowDown" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("ArrowUp moves to previous tab in vertical mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          orientation="vertical"
          defaultSelectedKey="tab2"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      fireEvent.keyDown(tabs[1], { key: "ArrowUp" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab1");
    });

    it("ArrowLeft and ArrowRight follow RTL in vertical orientation", () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs aria-label="Test Tabs" orientation="vertical" />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowDown" });
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(tabs[1], { key: "ArrowUp" });
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(tabs[0], { key: "ArrowLeft" });
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");

      fireEvent.keyDown(tabs[1], { key: "ArrowRight" });
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Home and End keys", () => {
    it("Home key selects first tab", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          defaultSelectedKey="tab3"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[2].focus();

      fireEvent.keyDown(tabs[2], { key: "Home" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab1");
    });

    it("End key selects last tab", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "End" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab3");
    });
  });

  describe("manual keyboard activation", () => {
    it("arrow keys move focus but do not select in manual mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          keyboardActivation="manual"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

      // Selection should not change until Enter/Space
      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("Enter key selects focused tab in manual mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          keyboardActivation="manual"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tablist = screen.getByRole("tablist");
      tablist.focus();

      // Move focus to second tab (which sets focusedKey)
      fireEvent.keyDown(tablist, { key: "ArrowRight" });

      // Now press Enter to select the focused tab
      fireEvent.keyDown(tablist, { key: "Enter" });

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("Space key selects focused tab in manual mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          keyboardActivation="manual"
          onSelectionChange={onSelectionChange}
        />
      ));

      const tablist = screen.getByRole("tablist");
      tablist.focus();

      // Move focus to second tab
      fireEvent.keyDown(tablist, { key: "ArrowRight" });

      // Now press Space to select
      fireEvent.keyDown(tablist, { key: " " });

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });
  });

  describe("mouse interactions", () => {
    it("clicking a tab selects it", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[1]);

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("clicking the already selected tab does not emit onSelectionChange", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tabs = screen.getAllByRole("tab");
      // First tab is already selected
      fireEvent.click(tabs[0]);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("updates tabpanel content when tab changes", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Tab 1 body");

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[1]);

      expect(screen.getByRole("tabpanel")).toHaveTextContent("Tab 2 body");
    });
  });

  describe("disabled state", () => {
    it("disabled tabs cannot be selected via click", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          disabledKeys={["tab2"]}
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      fireEvent.click(tabs[1]);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("disabled tabs are skipped during keyboard navigation", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs
          aria-label="Test Tabs"
          disabledKeys={["tab2"]}
          onSelectionChange={onSelectionChange}
        />
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });

      // Should skip tab2 and go to tab3
      expect(onSelectionChange).toHaveBeenCalledWith("tab3");
    });

    it("disabled tabs have aria-disabled attribute", () => {
      render(() => <TestTabs aria-label="Test Tabs" disabledKeys={["tab2"]} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).not.toHaveAttribute("aria-disabled");
      expect(tabs[1]).toHaveAttribute("aria-disabled", "true");
      expect(tabs[2]).not.toHaveAttribute("aria-disabled");
    });

    it("all tabs are disabled when isDisabled is true", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <TestTabs aria-label="Test Tabs" isDisabled onSelectionChange={onSelectionChange} />
      ));

      const tabs = screen.getAllByRole("tab");

      // Try clicking second tab
      fireEvent.click(tabs[1]);
      expect(onSelectionChange).not.toHaveBeenCalled();

      // Try keyboard navigation
      tabs[0].focus();
      fireEvent.keyDown(tabs[0], { key: "ArrowRight" });
      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe("selection", () => {
    it("selects first tab by default", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(tabs[1]).toHaveAttribute("aria-selected", "false");
      expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("supports defaultSelectedKey", () => {
      render(() => <TestTabs aria-label="Test Tabs" defaultSelectedKey="tab2" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
      expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("supports controlled selectedKey", () => {
      const onSelectionChange = vi.fn();

      render(() => (
        <TestTabs aria-label="Test Tabs" selectedKey="tab1" onSelectionChange={onSelectionChange} />
      ));

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      // Click second tab - should call onSelectionChange
      fireEvent.click(tabs[1]);

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("selects first non-disabled tab if default is disabled", () => {
      render(() => <TestTabs aria-label="Test Tabs" disabledKeys={["tab1"]} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "false");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("tabIndex management", () => {
    it("selected tab has tabIndex 0, others have tabIndex -1", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("tabindex", "0");
      expect(tabs[1]).toHaveAttribute("tabindex", "-1");
      expect(tabs[2]).toHaveAttribute("tabindex", "-1");
    });

    it("tabIndex is 0 for selected tab, -1 for others", () => {
      // Test that initial tabIndex values are correct
      render(() => <TestTabs aria-label="Test Tabs" defaultSelectedKey="tab2" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("tabindex", "-1");
      expect(tabs[1]).toHaveAttribute("tabindex", "0");
      expect(tabs[2]).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("unique IDs", () => {
    it("generates unique IDs for tabs and panels", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      const ids = tabs.map((t) => t.id);

      // All IDs should be unique
      expect(new Set(ids).size).toBe(ids.length);

      // All IDs should be non-empty
      for (const id of ids) {
        expect(id).toBeTruthy();
      }
    });

    it("tab and panel IDs are related", () => {
      render(() => <TestTabs aria-label="Test Tabs" />);

      const tabs = screen.getAllByRole("tab");
      const selectedTab = tabs[0];

      const panelId = selectedTab.getAttribute("aria-controls");
      const panel = document.getElementById(panelId!);

      expect(panel).toHaveAttribute("aria-labelledby", selectedTab.id);
    });
  });

  describe("focus behavior", () => {
    it("focuses selected tab when tabbing into tablist", () => {
      render(() => <TestTabs aria-label="Test Tabs" defaultSelectedKey="tab2" />);

      const tabs = screen.getAllByRole("tab");

      // Simulate tab into tablist by focusing the selected tab
      tabs[1].focus();
      expect(document.activeElement).toBe(tabs[1]);
    });

    it("arrow key navigation changes selection", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tablist = screen.getByRole("tablist");
      tablist.focus();

      fireEvent.keyDown(tablist, { key: "ArrowRight" });

      // Selection should change to next tab
      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
    });

    it("focusing the selected tab does not emit selection change", () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs aria-label="Test Tabs" onSelectionChange={onSelectionChange} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      expect(onSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe("dynamic updates", () => {
    it("handles adding tabs", () => {
      const [items, setItems] = createSignal(defaultItems.slice(0, 2));

      render(() => <TestTabs aria-label="Test Tabs" items={items()} />);

      expect(screen.getAllByRole("tab")).toHaveLength(2);

      setItems([...defaultItems]);

      expect(screen.getAllByRole("tab")).toHaveLength(3);
    });

    it("handles removing tabs", () => {
      const [items, setItems] = createSignal(defaultItems);

      render(() => <TestTabs aria-label="Test Tabs" items={items()} />);

      expect(screen.getAllByRole("tab")).toHaveLength(3);

      setItems(defaultItems.slice(0, 2));

      expect(screen.getAllByRole("tab")).toHaveLength(2);
    });

    it("maintains selection when non-selected tabs are removed", () => {
      const [items, setItems] = createSignal(defaultItems);

      render(() => <TestTabs aria-label="Test Tabs" items={items()} defaultSelectedKey="tab1" />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");

      // Remove the last tab (which was NOT selected)
      setItems(defaultItems.slice(0, 2));

      const remainingTabs = screen.getAllByRole("tab");
      expect(remainingTabs).toHaveLength(2);
      // First tab should still be selected
      expect(remainingTabs[0]).toHaveAttribute("aria-selected", "true");
    });

    it("reselects first enabled tab when the selected tab is removed", () => {
      const [items, setItems] = createSignal(defaultItems);

      render(() => <TestTabs aria-label="Test Tabs" items={items()} defaultSelectedKey="tab2" />);

      let tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");

      setItems(defaultItems.filter((item) => item.key !== "tab2"));

      tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Tab 1 body");
    });
  });
});

describe("createTabPanel", () => {
  it("renders with correct role", () => {
    render(() => <TestTabs aria-label="Test Tabs" />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("role", "tabpanel");
  });

  it("has tabIndex for keyboard accessibility", () => {
    render(() => <TestTabs aria-label="Test Tabs" />);

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("tabindex", "0");
  });

  it("is labeled by its associated tab", () => {
    render(() => <TestTabs aria-label="Test Tabs" />);

    const tabs = screen.getAllByRole("tab");
    const selectedTab = tabs[0];
    const panel = screen.getByRole("tabpanel");

    expect(panel).toHaveAttribute("aria-labelledby", selectedTab.id);
  });

  it("supports aria-label override", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: defaultItems,
        getKey: (item) => item.key,
      });

      const { tabPanelProps } = createTabPanel(
        { id: "tab1", "aria-label": "Custom Panel Label" },
        state,
      );

      expect(tabPanelProps["aria-label"]).toBe("Custom Panel Label");
      dispose();
    });
  });

  it("supports aria-describedby", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: defaultItems,
        getKey: (item) => item.key,
      });

      const { tabPanelProps } = createTabPanel(
        { id: "tab1", "aria-describedby": "description-id" },
        state,
      );

      expect(tabPanelProps["aria-describedby"]).toBe("description-id");
      dispose();
    });
  });
});
