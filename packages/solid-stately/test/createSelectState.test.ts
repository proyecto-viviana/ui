/**
 * Tests for createSelectState.
 */

import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
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

        expect(state.isOpen()).toBe(false);
        state.open();
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

        expect(state.isOpen()).toBe(true);
        state.close();
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

        expect(state.isOpen()).toBe(false);
        state.toggle();
        expect(state.isOpen()).toBe(true);
        state.toggle();
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
        expect(onOpenChange).toHaveBeenCalledWith(true);

        state.close();
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

        expect(state.isOpen()).toBe(false);

        setIsOpen(true);
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

        expect(state.selectedKey()).toBe(null);
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

        expect(state.selectedKey()).toBe("b");
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
        expect(state.selectedKey()).toBe("c");
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

        expect(state.selectedKey()).toBe("a");

        setSelectedKey("b");
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

        const collection = state.collection();
        expect(collection.size).toBe(3);
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

        expect(state.collection().size).toBe(3);

        setItemList([...items, { key: "d", label: "Date" }]);
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

        expect(state.isFocused()).toBe(false);
        state.setFocused(true);
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

        expect(state.focusedKey()).toBe(null);
        state.setFocusedKey("b");
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

        expect(state.isKeyDisabled("a")).toBe(false);
        expect(state.isKeyDisabled("b")).toBe(true);
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

        expect(state.isKeyDisabled("a")).toBe(false);
        expect(state.isKeyDisabled("b")).toBe(true);
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

        expect(state.selectionMode()).toBe("multiple");
        expect(state.selectedKeys()).toEqual(new Set(["a", "c"]));
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

        expect(state.selectedKeys()).toEqual(new Set(["a"]));
        setSelectedKeys(new Set(["b", "c"]));
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
        expect(onSelectionChangeKeys).toHaveBeenCalledWith(new Set(["a", "b"]));
        dispose();
      });
    });
  });
});
