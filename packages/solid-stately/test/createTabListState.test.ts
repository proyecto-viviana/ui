/**
 * @vitest-environment jsdom
 */
import { createRoot, createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createTabListState } from "../src/tabs";

const baseItems = [
  { key: "tab1", label: "Tab 1" },
  { key: "tab2", label: "Tab 2" },
  { key: "tab3", label: "Tab 3" },
];

describe("createTabListState", () => {
  it("selects the first enabled tab by default", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
      });

      expect(state.selectedKey()).toBe("tab1");
      dispose();
    });
  });

  it("uses defaultSelectedKey when valid", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        defaultSelectedKey: "tab3",
      });

      expect(state.selectedKey()).toBe("tab3");
      dispose();
    });
  });

  it("falls back to first enabled tab when defaultSelectedKey is disabled", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        defaultSelectedKey: "tab2",
        disabledKeys: ["tab2"],
      });

      expect(state.selectedKey()).toBe("tab1");
      dispose();
    });
  });

  it("reacts to controlled selectedKey updates", () => {
    createRoot((dispose) => {
      const [selectedKey, setSelectedKey] = createSignal<"tab1" | "tab2">("tab1");
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        get selectedKey() {
          return selectedKey();
        },
      });

      expect(state.selectedKey()).toBe("tab1");
      setSelectedKey("tab2");
      expect(state.selectedKey()).toBe("tab2");
      dispose();
    });
  });

  it("setFocusedKey never changes selection (activation lives in the aria layer)", () => {
    createRoot((dispose) => {
      const onSelectionChange = vi.fn();
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        keyboardActivation: "automatic",
        onSelectionChange,
      });

      state.setFocusedKey("tab2");

      expect(state.focusedKey()).toBe("tab2");
      expect(state.selectedKey()).toBe("tab1");
      expect(onSelectionChange).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("initializes focusedKey to the selected key", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        defaultSelectedKey: "tab2",
      });

      expect(state.focusedKey()).toBe("tab2");
      dispose();
    });
  });

  it("moves focusedKey to a new selected key while the tab list is not focused", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
      });

      state.setSelectedKey("tab3");

      expect(state.focusedKey()).toBe("tab3");
      dispose();
    });
  });

  it("keeps focusedKey while the tab list is focused and selection changes", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        keyboardActivation: "manual",
      });

      state.setFocused(true);
      state.setFocusedKey("tab2");
      state.setSelectedKey("tab3");

      expect(state.focusedKey()).toBe("tab2");
      dispose();
    });
  });

  it("does not emit selection change when focusing the already-selected key", () => {
    createRoot((dispose) => {
      const onSelectionChange = vi.fn();
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        keyboardActivation: "automatic",
        onSelectionChange,
      });

      state.setFocusedKey("tab1");

      expect(state.selectedKey()).toBe("tab1");
      expect(onSelectionChange).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("reconciles uncontrolled selection when selected tab is removed", () => {
    createRoot((dispose) => {
      const [items, setItems] = createSignal(baseItems);
      const state = createTabListState({
        get items() {
          return items();
        },
        getKey: (item) => item.key,
        defaultSelectedKey: "tab2",
      });

      expect(state.selectedKey()).toBe("tab2");
      setItems(baseItems.filter((item) => item.key !== "tab2"));
      expect(state.selectedKey()).toBe("tab1");
      dispose();
    });
  });

  it("selects first enabled tab when items load after initial empty state", () => {
    createRoot((dispose) => {
      const [items, setItems] = createSignal<typeof baseItems>([]);
      const state = createTabListState({
        get items() {
          return items();
        },
        getKey: (item) => item.key,
      });

      expect(state.selectedKey()).toBe(null);
      setItems(baseItems);
      expect(state.selectedKey()).toBe("tab1");
      dispose();
    });
  });

  it("manual activation keeps selection unchanged when only focus changes", () => {
    createRoot((dispose) => {
      const state = createTabListState({
        items: baseItems,
        getKey: (item) => item.key,
        defaultSelectedKey: "tab1",
        keyboardActivation: "manual",
      });

      state.setFocusedKey("tab2");
      expect(state.selectedKey()).toBe("tab1");
      dispose();
    });
  });
});
