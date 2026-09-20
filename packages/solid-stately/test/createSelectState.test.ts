/**
 * Tests for createSelectState.
 */

import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import { createSelectState } from "../src/select/createSelectState";

describe("createSelectState", () => {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
  ];

  describe("overlay state", () => {
    it("starts closed by default", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("respects defaultOpen", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          defaultOpen: true,
        });

        flush();
        expect(state.isOpen()).toBe(true);
        dispose();
      });
    });

    it("open() opens the dropdown", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isOpen()).toBe(false);
        state.open();
        flush();
        expect(state.isOpen()).toBe(true);
        dispose();
      });
    });

    it("close() closes the dropdown", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          defaultOpen: true,
        });

        flush();
        expect(state.isOpen()).toBe(true);
        state.close();
        flush();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("toggle() toggles the dropdown", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isOpen()).toBe(false);
        state.toggle();
        flush();
        expect(state.isOpen()).toBe(true);
        state.toggle();
        flush();
        expect(state.isOpen()).toBe(false);
        dispose();
      });
    });

    it("calls onOpenChange when open state changes", () => {
      const onOpenChange = vi.fn();

      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          onOpenChange,
        });

        state.open();
        flush();
        expect(onOpenChange).toHaveBeenCalledWith(true);

        state.close();
        flush();
        expect(onOpenChange).toHaveBeenCalledWith(false);
        dispose();
      });
    });

    it("supports controlled isOpen", () => {
      createRoot((dispose) => {
        const [isOpen, setIsOpen] = createSignal(false);

        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          get isOpen() {
            return isOpen();
          },
        });

        flush();
        expect(state.isOpen()).toBe(false);

        setIsOpen(true);
        flush();
        expect(state.isOpen()).toBe(true);
        dispose();
      });
    });
  });

  describe("selection state", () => {
    it("has no selection by default", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.selectedKey()).toBe(null);
        flush();
        expect(state.selectedItem()).toBe(null);
        dispose();
      });
    });

    it("respects defaultSelectedKey", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          defaultSelectedKey: "b",
        });

        flush();
        expect(state.selectedKey()).toBe("b");
        flush();
        expect(state.selectedItem()?.value).toEqual({ key: "b", label: "Banana" });
        dispose();
      });
    });

    it("setSelectedKey updates selection", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        state.setSelectedKey("c");
        flush();
        expect(state.selectedKey()).toBe("c");
        flush();
        expect(state.selectedItem()?.value).toEqual({ key: "c", label: "Cherry" });
        dispose();
      });
    });

    it("calls onSelectionChange when selection changes", () => {
      const onSelectionChange = vi.fn();

      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          onSelectionChange,
        });

        state.setSelectedKey("a");
        flush();
        expect(onSelectionChange).toHaveBeenCalledWith("a");
        dispose();
      });
    });

    it("supports controlled selectedKey", () => {
      createRoot((dispose) => {
        const [selectedKey, setSelectedKey] = createSignal<string | null>("a");

        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          get selectedKey() {
            return selectedKey();
          },
        });

        flush();
        expect(state.selectedKey()).toBe("a");

        setSelectedKey("b");
        flush();
        expect(state.selectedKey()).toBe("b");
        dispose();
      });
    });
  });

  describe("collection", () => {
    it("provides collection accessor", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        const collection = state.collection();
        expect(collection.size).toBe(3);
        flush();
        expect(collection.getItem("a")?.value).toEqual({ key: "a", label: "Apple" });
        dispose();
      });
    });

    it("updates collection when items change", () => {
      createRoot((dispose) => {
        const [itemList, setItemList] = createSignal(items);

        const state = createSelectState({
          get items() {
            return itemList();
          },
          getKey: (item) => item.key,
        });

        flush();
        expect(state.collection().size).toBe(3);

        setItemList([...items, { key: "d", label: "Date" }]);
        flush();
        expect(state.collection().size).toBe(4);
        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("tracks focus state", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isFocused()).toBe(false);
        state.setFocused(true);
        flush();
        expect(state.isFocused()).toBe(true);
        dispose();
      });
    });

    it("tracks focused key", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.focusedKey()).toBe(null);
        state.setFocusedKey("b");
        flush();
        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });
  });

  describe("disabled state", () => {
    it("isDisabled defaults to false", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isDisabled).toBe(false);
        dispose();
      });
    });

    it("respects isDisabled prop", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          isDisabled: true,
        });

        flush();
        expect(state.isDisabled).toBe(true);
        dispose();
      });
    });

    it("checks if individual keys are disabled", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          disabledKeys: ["b"],
        });

        flush();
        expect(state.isKeyDisabled("a")).toBe(false);
        flush();
        expect(state.isKeyDisabled("b")).toBe(true);
        flush();
        expect(state.isKeyDisabled("c")).toBe(false);
        dispose();
      });
    });

    it("supports getDisabled function", () => {
      createRoot((dispose) => {
        const itemsWithDisabled = [
          { key: "a", label: "Apple", disabled: false },
          { key: "b", label: "Banana", disabled: true },
          { key: "c", label: "Cherry", disabled: false },
        ];

        const state = createSelectState({
          items: itemsWithDisabled,
          getKey: (item) => item.key,
          getDisabled: (item) => item.disabled,
        });

        flush();
        expect(state.isKeyDisabled("a")).toBe(false);
        flush();
        expect(state.isKeyDisabled("b")).toBe(true);
        flush();
        expect(state.isKeyDisabled("c")).toBe(false);
        dispose();
      });
    });
  });

  describe("required state", () => {
    it("isRequired defaults to false", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
        });

        flush();
        expect(state.isRequired).toBe(false);
        dispose();
      });
    });

    it("respects isRequired prop", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          isRequired: true,
        });

        flush();
        expect(state.isRequired).toBe(true);
        dispose();
      });
    });
  });

  describe("text values", () => {
    it("uses getTextValue for text content", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          getTextValue: (item) => item.label,
        });

        flush();
        expect(state.collection().getItem("a")?.textValue).toBe("Apple");
        dispose();
      });
    });
  });

  describe("multiple selection mode", () => {
    it("supports defaultSelectedKeys", () => {
      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "c"],
        });

        flush();
        expect(state.selectionMode()).toBe("multiple");
        flush();
        expect(state.selectedKeys()).toEqual(new Set(["a", "c"]));
        flush();
        expect(state.selectedItems().map((item) => item.key)).toEqual(["a", "c"]);
        dispose();
      });
    });

    it("supports controlled selectedKeys", () => {
      createRoot((dispose) => {
        const [selectedKeys, setSelectedKeys] = createSignal(new Set(["a"]));

        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          selectionMode: "multiple",
          get selectedKeys() {
            return selectedKeys();
          },
        });

        flush();
        expect(state.selectedKeys()).toEqual(new Set(["a"]));
        setSelectedKeys(new Set(["b", "c"]));
        flush();
        expect(state.selectedKeys()).toEqual(new Set(["b", "c"]));
        dispose();
      });
    });

    it("calls onSelectionChangeKeys for list interactions", () => {
      const onSelectionChangeKeys = vi.fn();

      createRoot((dispose) => {
        const state = createSelectState({
          items,
          getKey: (item) => item.key,
          selectionMode: "multiple",
          onSelectionChangeKeys,
        });

        state.setSelectedKeys(["a", "b"]);
        flush();
        expect(onSelectionChangeKeys).toHaveBeenCalledWith(new Set(["a", "b"]));
        dispose();
      });
    });
  });
});
