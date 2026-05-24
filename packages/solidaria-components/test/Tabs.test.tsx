/**
 * Tabs tests - Port of React Aria's Tabs.test.tsx
 *
 * Tests for Tabs component functionality including:
 * - Rendering
 * - Selection
 * - Keyboard navigation
 * - Disabled states
 * - Orientation
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SelectionIndicator,
  TabsStateContext,
} from "../src/Tabs";
import type { Key } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import {
  setupUser,
  assertAriaIdIntegrity,
  checkAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

// Setup userEvent
const user = setupUser();

// Test data
interface TestTab {
  id: string;
  label: string;
  content: string;
}

const testTabs: TestTab[] = [
  { id: "tab1", label: "Tab 1", content: "Content 1" },
  { id: "tab2", label: "Tab 2", content: "Content 2" },
  { id: "tab3", label: "Tab 3", content: "Content 3" },
];

// Helper component for testing Tabs
function TestTabs(props: {
  tabsProps?: Partial<Parameters<typeof Tabs<TestTab>>[0]>;
  tabs?: TestTab[];
}) {
  const tabs = props.tabs || testTabs;
  return (
    <Tabs<TestTab>
      items={tabs}
      getKey={(item) => item.id}
      defaultSelectedKey="tab1"
      {...props.tabsProps}
    >
      <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
      {tabs.map((tab) => (
        <TabPanel id={tab.id}>{tab.content}</TabPanel>
      ))}
    </Tabs>
  );
}

describe("Tabs", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanels>
            {testTabs.map((tab) => (
              <TabPanel id={tab.id}>{tab.content}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ));

      const tabs = document.querySelector(".solidaria-Tabs");
      expect(tabs).toBeInTheDocument();
    });

    it("should render tab list", () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanels>
            {testTabs.map((tab) => (
              <TabPanel id={tab.id}>{tab.content}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ));

      const tablist = screen.getByRole("tablist");
      expect(tablist).toBeInTheDocument();
    });

    it("should render tabs with tab role", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("should render tab list with default class", () => {
      render(() => <TestTabs />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass("solidaria-TabList");
    });

    it("should render tabs with default class", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      for (const tab of tabs) {
        expect(tab).toHaveClass("solidaria-Tab");
      }
    });

    it("should render selected tab panel", () => {
      render(() => <TestTabs />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveTextContent("Content 1");
    });

    it("should render tab panel with default class", () => {
      render(() => <TestTabs />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveClass("solidaria-TabPanel");
    });

    it("should render TabPanels wrapper with default class", () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanels>
            {testTabs.map((tab) => (
              <TabPanel id={tab.id}>{tab.content}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ));

      expect(document.querySelector(".solidaria-TabPanels")).toBeInTheDocument();
    });
  });

  describe("collection composition", () => {
    it("supports static TabList children without Tabs items", async () => {
      render(() => (
        <Tabs defaultSelectedKey="tab2">
          <TabList aria-label="Static tabs">
            <Tab id="tab1">Tab 1</Tab>
            <Tab id="tab2">Tab 2</Tab>
            <Tab id="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel id="tab1">Content 1</TabPanel>
          <TabPanel id="tab2">Content 2</TabPanel>
          <TabPanel id="tab3">Content 3</TabPanel>
        </Tabs>
      ));

      await waitFor(() => {
        expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 2");
      });

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("supports collection items on TabList without Tabs items", async () => {
      render(() => (
        <Tabs defaultSelectedKey="tab3">
          <TabList items={testTabs} aria-label="Dynamic tabs">
            {(item) => <Tab id={item.id}>{item.label}</Tab>}
          </TabList>
          {testTabs.map((tab) => (
            <TabPanel id={tab.id}>{tab.content}</TabPanel>
          ))}
        </Tabs>
      ));

      await waitFor(() => {
        expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 3");
      });

      const tabs = screen.getAllByRole("tab");
      expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    });

    it("uses static tab disabled state for collection navigation", async () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <Tabs defaultSelectedKey="tab1" onSelectionChange={onSelectionChange}>
          <TabList aria-label="Static tabs">
            <Tab id="tab1">Tab 1</Tab>
            <Tab id="tab2" isDisabled>
              Tab 2
            </Tab>
            <Tab id="tab3">Tab 3</Tab>
          </TabList>
          <TabPanel id="tab1">Content 1</TabPanel>
          <TabPanel id="tab2">Content 2</TabPanel>
          <TabPanel id="tab3">Content 3</TabPanel>
        </Tabs>
      ));

      await waitFor(() => {
        expect(screen.getAllByRole("tab")[1]).toHaveAttribute("aria-disabled", "true");
      });

      await user.click(screen.getAllByRole("tab")[1]);
      expect(onSelectionChange).not.toHaveBeenCalled();
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should select tab on click", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("should show corresponding panel on tab select", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveTextContent("Content 2");
    });

    it("should fire onSelectionChange", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs tabsProps={{ onSelectionChange }} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("should support controlled selectedKey", () => {
      render(() => <TestTabs tabsProps={{ selectedKey: "tab2" }} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("should support defaultSelectedKey", () => {
      render(() => <TestTabs tabsProps={{ defaultSelectedKey: "tab3" }} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[2]).toHaveAttribute("aria-selected", "true");
    });

    it("should set data-selected on selected tab", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[0]).toHaveAttribute("data-selected");
    });

    it("should render SelectionIndicator only for selected tab", async () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>
            {(item) => (
              <Tab id={item.id}>
                {() => (
                  <>
                    {item.label}
                    <SelectionIndicator>Selected</SelectionIndicator>
                  </>
                )}
              </Tab>
            )}
          </TabList>
          {testTabs.map((tab) => (
            <TabPanel id={tab.id}>{tab.content}</TabPanel>
          ))}
        </Tabs>
      ));

      expect(screen.getAllByText("Selected")).toHaveLength(1);
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);
      expect(screen.getAllByText("Selected")).toHaveLength(1);
      expect(tabs[1].textContent).toContain("Selected");
    });

    it("should support SelectionIndicator shouldForceMount", () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>
            {(item) => (
              <Tab id={item.id}>
                {() => (
                  <>
                    {item.label}
                    <SelectionIndicator shouldForceMount>Dot</SelectionIndicator>
                  </>
                )}
              </Tab>
            )}
          </TabList>
          {testTabs.map((tab) => (
            <TabPanel id={tab.id}>{tab.content}</TabPanel>
          ))}
        </Tabs>
      ));

      expect(screen.getAllByText("Dot")).toHaveLength(3);
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should move focus with Arrow Right", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      expect(tabs[1]).toHaveAttribute("data-focused");
      expect(document.activeElement).toBe(tabs[1]);
    });

    it("should move focus with Arrow Left", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      await user.keyboard("{ArrowLeft}");

      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("should focus first with Home", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[2].focus();

      await user.keyboard("{Home}");

      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("should focus last with End", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{End}");

      expect(tabs[2]).toHaveAttribute("data-focused");
    });

    it("should not select on arrow key with manual activation", async () => {
      render(() => <TestTabs tabsProps={{ keyboardActivation: "manual" }} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      // In manual mode, arrow keys move focus but don't select
      expect(tabs[0]).toHaveAttribute("aria-selected", "true"); // Still selected
      expect(tabs[1]).toHaveAttribute("data-focused"); // But second is focused
    });

    it("should select on click with manual activation", async () => {
      render(() => <TestTabs tabsProps={{ keyboardActivation: "manual" }} />);

      const tabs = screen.getAllByRole("tab");

      // Click selects the tab
      await user.click(tabs[1]);

      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("should select automatically on focus by default", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      // With automatic activation (default), tab is selected on focus
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    });

    it("should emit one selection change per arrow key in automatic mode", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs tabsProps={{ onSelectionChange }} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      expect(onSelectionChange).toHaveBeenCalledWith("tab2");
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("should wrap focus at end", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[2].focus();

      await user.keyboard("{ArrowRight}");

      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("should wrap focus at start", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowLeft}");

      expect(tabs[2]).toHaveAttribute("data-focused");
    });
  });

  // ============================================
  // DISABLED STATES
  // ============================================

  describe("disabled states", () => {
    it("should support disabledKeys", () => {
      render(() => <TestTabs tabsProps={{ disabledKeys: ["tab2"] }} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("aria-disabled", "true");
    });

    it("should set data-disabled on disabled tabs", () => {
      render(() => <TestTabs tabsProps={{ disabledKeys: ["tab2"] }} />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("data-disabled");
    });

    it("should not select disabled tabs on click", async () => {
      const onSelectionChange = vi.fn();
      render(() => <TestTabs tabsProps={{ disabledKeys: ["tab2"], onSelectionChange }} />);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      expect(onSelectionChange).not.toHaveBeenCalled();
    });

    it("should skip disabled tabs during keyboard navigation", async () => {
      render(() => <TestTabs tabsProps={{ disabledKeys: ["tab2"] }} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      // Should skip tab2 and focus tab3
      expect(tabs[2]).toHaveAttribute("data-focused");
    });

    it("should support isDisabled on Tabs", () => {
      render(() => <TestTabs tabsProps={{ isDisabled: true }} />);

      const tabsContainer = document.querySelector(".solidaria-Tabs");
      expect(tabsContainer).toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // ORIENTATION
  // ============================================

  describe("orientation", () => {
    it("should default to horizontal orientation", () => {
      render(() => <TestTabs />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should support vertical orientation", () => {
      render(() => <TestTabs tabsProps={{ orientation: "vertical" }} />);

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should set data-orientation", () => {
      render(() => <TestTabs tabsProps={{ orientation: "vertical" }} />);

      const tabs = document.querySelector(".solidaria-Tabs");
      expect(tabs).toHaveAttribute("data-orientation", "vertical");
    });

    it("should use Arrow Up/Down for vertical orientation", async () => {
      render(() => <TestTabs tabsProps={{ orientation: "vertical" }} />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowDown}");

      expect(tabs[1]).toHaveAttribute("data-focused");
    });
  });

  // ============================================
  // FOCUS/HOVER STATE
  // ============================================

  describe("focus and hover state", () => {
    it("should set data-focused on focused tab", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("should set data-hovered on hover", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      await user.hover(tabs[0]);

      expect(tabs[0]).toHaveAttribute("data-hovered");
    });

    it("should remove data-hovered on unhover", async () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      await user.hover(tabs[0]);
      await user.unhover(tabs[0]);

      expect(tabs[0]).not.toHaveAttribute("data-hovered");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have tablist role on container", () => {
      render(() => <TestTabs />);

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should have tab role on tabs", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(3);
    });

    it("should have tabpanel role on panel", () => {
      render(() => <TestTabs />);

      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });

    it("should link tab to panel with aria-controls", () => {
      render(() => <TestTabs />);

      const tabs = screen.getAllByRole("tab");
      const selectedTab = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      expect(selectedTab).toHaveAttribute("aria-controls");
    });

    it("should link panel to tab with aria-labelledby", () => {
      render(() => <TestTabs />);

      const panel = screen.getByRole("tabpanel");
      expect(panel).toHaveAttribute("aria-labelledby");
    });

    it("keeps aria-controls/aria-labelledby valid for shared panel pattern", async () => {
      render(() => (
        <Tabs<TestTab> items={testTabs} getKey={(item) => item.id} defaultSelectedKey="tab1">
          <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          <TabPanel>Shared panel</TabPanel>
        </Tabs>
      ));

      const selectedBefore = screen
        .getAllByRole("tab")
        .find((t) => t.getAttribute("aria-selected") === "true");
      expect(selectedBefore).toBeDefined();
      const controlsBefore = selectedBefore?.getAttribute("aria-controls");
      expect(controlsBefore).toBeTruthy();

      const panelBefore = screen.getByRole("tabpanel");
      expect(panelBefore.id).toBe(controlsBefore);
      expect(panelBefore.getAttribute("aria-labelledby")).toBe(selectedBefore?.id);

      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      const selectedAfter = screen
        .getAllByRole("tab")
        .find((t) => t.getAttribute("aria-selected") === "true");
      const controlsAfter = selectedAfter?.getAttribute("aria-controls");
      expect(controlsAfter).toBeTruthy();

      const panelAfter = screen.getByRole("tabpanel");
      expect(panelAfter.id).toBe(controlsAfter);
      expect(panelAfter.getAttribute("aria-labelledby")).toBe(selectedAfter?.id);
    });
  });

  describe("dynamic updates", () => {
    it("reselects first enabled tab when selected tab is removed", () => {
      const [items, setItems] = createSignal(testTabs);

      render(() => (
        <Tabs<TestTab> items={items()} getKey={(item) => item.id} defaultSelectedKey="tab2">
          <TabList>{(item) => <Tab id={item.id}>{item.label}</Tab>}</TabList>
          {items().map((tab) => (
            <TabPanel id={tab.id}>{tab.content}</TabPanel>
          ))}
        </Tabs>
      ));

      let tabs = screen.getAllByRole("tab");
      expect(tabs[1]).toHaveAttribute("aria-selected", "true");

      setItems(testTabs.filter((tab) => tab.id !== "tab2"));

      tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toHaveAttribute("aria-selected", "true");
      expect(screen.getByRole("tabpanel")).toHaveTextContent("Content 1");
    });
  });

  // ============================================
  // A11Y RISK AREA: ARIA ID integrity
  // ============================================

  describe("a11y ARIA ID integrity", () => {
    it("tab aria-controls resolves to matching tabpanel", () => {
      render(() => <TestTabs />);

      const selectedTab = screen
        .getAllByRole("tab")
        .find((t) => t.getAttribute("aria-selected") === "true");
      expect(selectedTab).toBeTruthy();

      const controlsId = selectedTab!.getAttribute("aria-controls");
      expect(controlsId).toBeTruthy();
      expect(document.getElementById(controlsId!)).toBeTruthy();

      assertAriaIdIntegrity(document.body);
    });

    it("tabpanel aria-labelledby resolves to matching tab", () => {
      render(() => <TestTabs />);

      const panel = screen.getByRole("tabpanel");
      const labelledBy = panel.getAttribute("aria-labelledby");
      expect(labelledBy).toBeTruthy();
      expect(document.getElementById(labelledBy!)).toBeTruthy();

      assertAriaIdIntegrity(document.body);
    });

    it("no dangling IDs after switching tabs", async () => {
      render(() => <TestTabs />);

      // Start on tab1
      assertAriaIdIntegrity(document.body);

      // Switch to tab2
      const tabs = screen.getAllByRole("tab");
      await user.click(tabs[1]);

      // Verify no dangling references after switch
      const result = checkAriaIdIntegrity(document.body);
      expect(result.ok).toBe(true);
      expect(result.totalRefsChecked).toBeGreaterThan(0);
    });
  });

  describe("TabPanels animation sizing", () => {
    it("should detect block-size in transition for TabPanels", async () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = ((element: Element) => {
        const style = originalGetComputedStyle(element);
        Object.defineProperty(style, "transition", {
          value: "block-size 400ms ease",
          configurable: true,
        });
        return style;
      }) as typeof window.getComputedStyle;
      const heightSpy = vi
        .spyOn(window.HTMLElement.prototype, "offsetHeight", "get")
        .mockReturnValue(42);

      const [selectedKey, setSelectedKey] = createSignal<Key>("tab1");
      render(() => (
        <TabsStateContext.Provider value={{ selectedKey } as any}>
          <TabPanels>
            <div role="tabpanel">Content</div>
          </TabPanels>
        </TabsStateContext.Provider>
      ));

      setSelectedKey("tab2");

      await waitFor(() => {
        const panels = document.querySelector(".solidaria-TabPanels") as HTMLElement;
        expect(panels.style.getPropertyValue("--tab-panel-height")).toBe("42px");
      });

      heightSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });

    it("should detect inline-size in transition for TabPanels", async () => {
      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = ((element: Element) => {
        const style = originalGetComputedStyle(element);
        Object.defineProperty(style, "transition", {
          value: "inline-size 400ms ease",
          configurable: true,
        });
        return style;
      }) as typeof window.getComputedStyle;
      const widthSpy = vi
        .spyOn(window.HTMLElement.prototype, "offsetWidth", "get")
        .mockReturnValue(120);

      const [selectedKey, setSelectedKey] = createSignal<Key>("tab1");
      render(() => (
        <TabsStateContext.Provider value={{ selectedKey } as any}>
          <TabPanels>
            <div role="tabpanel">Content</div>
          </TabPanels>
        </TabsStateContext.Provider>
      ));

      setSelectedKey("tab2");

      await waitFor(() => {
        const panels = document.querySelector(".solidaria-TabPanels") as HTMLElement;
        expect(panels.style.getPropertyValue("--tab-panel-width")).toBe("120px");
      });

      widthSpy.mockRestore();
      window.getComputedStyle = originalGetComputedStyle;
    });
  });

  // ============================================
  // RTL (Right-to-Left) KEYBOARD NAVIGATION
  // ============================================

  describe("RTL keyboard navigation", () => {
    it("ArrowLeft should move to NEXT tab in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs tabsProps={{ defaultSelectedKey: "tab1" }} />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowLeft}");

      // In RTL, ArrowLeft moves forward (to next tab)
      expect(tabs[1]).toHaveAttribute("data-focused");
    });

    it("ArrowRight should move to PREVIOUS tab in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs tabsProps={{ defaultSelectedKey: "tab2" }} />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[1].focus();

      await user.keyboard("{ArrowRight}");

      // In RTL, ArrowRight moves backward (to previous tab)
      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("ArrowLeft should wrap from last to first in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs tabsProps={{ defaultSelectedKey: "tab3" }} />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[2].focus();

      await user.keyboard("{ArrowLeft}");

      // In RTL, ArrowLeft wraps from last to first
      expect(tabs[0]).toHaveAttribute("data-focused");
    });

    it("ArrowRight should wrap from first to last in RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs tabsProps={{ defaultSelectedKey: "tab1" }} />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      await user.keyboard("{ArrowRight}");

      // In RTL, ArrowRight wraps from first to last
      expect(tabs[2]).toHaveAttribute("data-focused");
    });

    it("vertical orientation should NOT be affected by RTL", async () => {
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestTabs tabsProps={{ orientation: "vertical", defaultSelectedKey: "tab1" }} />
        </I18nProvider>
      ));

      const tabs = screen.getAllByRole("tab");
      tabs[0].focus();

      // ArrowDown should still move to next in vertical, regardless of RTL
      await user.keyboard("{ArrowDown}");
      expect(tabs[1]).toHaveAttribute("data-focused");
    });
  });
});
