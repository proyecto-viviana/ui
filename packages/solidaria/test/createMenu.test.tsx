/**
 * Tests for createMenu, createMenuItem, and createMenuTrigger hooks
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { cleanup } from "@solidjs/testing-library";
import { createMenuState, createOverlayTriggerState } from "../../solid-stately/src";
import { createMenu, createMenuItem, createMenuTrigger } from "../src/menu";

describe("createMenu", () => {
  afterEach(() => {
    cleanup();
  });

  it('returns menu props with role="menu"', () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Actions" }, state);

      expect(menuProps.role).toBe("menu");
      dispose();
    });
  });

  it("sets aria-disabled when disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ isDisabled: true, "aria-label": "Actions" }, state);

      expect(menuProps["aria-disabled"]).toBe(true);
      dispose();
    });
  });

  it("has tabIndex 0 when not disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Actions" }, state);

      expect(menuProps.tabIndex).toBe(0);
      dispose();
    });
  });

  it("calls onAction when Enter is pressed", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      state.setFocusedKey("copy");

      const { menuProps } = createMenu({ onAction, "aria-label": "Actions" }, state);

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onAction).toHaveBeenCalledWith("copy");
      dispose();
    });
  });

  it("does not call onClose for keyboard activation when shouldCloseOnSelect is false", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const onClose = vi.fn();
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      state.setFocusedKey("copy");

      const { menuProps } = createMenu(
        { onAction, onClose, shouldCloseOnSelect: false, "aria-label": "Actions" },
        state,
      );

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onAction).toHaveBeenCalledWith("copy");
      expect(onClose).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("updates selection when Enter is pressed in selection mode", () => {
    createRoot((dispose) => {
      const onSelectionChange = vi.fn();
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        defaultSelectedKeys: ["paste"],
        onSelectionChange,
      });

      state.setFocusedKey("copy");

      const { menuProps } = createMenu({ "aria-label": "Actions" }, state);

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.isSelected("copy")).toBe(true);
      expect(state.isSelected("paste")).toBe(false);
      expect(onSelectionChange).toHaveBeenCalledWith(new Set(["copy"]));
      dispose();
    });
  });

  it("calls onClose when Escape is pressed", () => {
    createRoot((dispose) => {
      const onClose = vi.fn();
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ onClose, "aria-label": "Actions" }, state);

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Escape",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onClose).toHaveBeenCalled();
      dispose();
    });
  });

  it("wires visible label props via aria-labelledby", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps, labelProps } = createMenu({ label: "Actions" }, state);
      expect(labelProps.id).toBeDefined();
      expect(menuProps["aria-labelledby"]).toContain(String(labelProps.id));
      dispose();
    });
  });
});

describe("createMenuItem", () => {
  afterEach(() => {
    cleanup();
  });

  it('returns menuitem props with role="menuitem"', () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuItemProps } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps.role).toBe("menuitem");
      dispose();
    });
  });

  it("sets aria-disabled when disabled", () => {
    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["copy"],
      });

      const { menuItemProps, isDisabled } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps["aria-disabled"]).toBe(true);
      expect(isDisabled()).toBe(true);
      dispose();
    });
  });

  it("tracks focused state", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { isFocused: isFocusedCopy } = createMenuItem({ key: "copy" }, state);
      const { isFocused: isFocusedPaste } = createMenuItem({ key: "paste" }, state);

      expect(isFocusedCopy()).toBe(false);
      expect(isFocusedPaste()).toBe(false);

      state.setFocusedKey("copy");
      expect(isFocusedCopy()).toBe(true);
      expect(isFocusedPaste()).toBe(false);
      dispose();
    });
  });

  it("has tabIndex based on focus state", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuItemProps: copyProps } = createMenuItem({ key: "copy" }, state);
      const { menuItemProps: pasteProps } = createMenuItem({ key: "paste" }, state);

      expect(copyProps.tabIndex).toBe(-1);
      expect(pasteProps.tabIndex).toBe(-1);

      state.setFocusedKey("copy");

      const { menuItemProps: copyPropsAfter } = createMenuItem({ key: "copy" }, state);
      expect(copyPropsAfter.tabIndex).toBe(0);
      dispose();
    });
  });

  it("inherits disabled state from parent menu metadata", () => {
    createRoot((dispose) => {
      const state = createMenuState({
        items: [{ key: "copy", label: "Copy" }],
        getKey: (item) => item.key,
      });

      createMenu({ isDisabled: true, "aria-label": "Actions" }, state);
      const { menuItemProps, isDisabled } = createMenuItem({ key: "copy" }, state);

      expect(menuItemProps["aria-disabled"]).toBe(true);
      expect(isDisabled()).toBe(true);
      dispose();
    });
  });

  it("exposes radio semantics for single selection mode", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        defaultSelectedKeys: ["copy"],
      });

      const copy = createMenuItem({ key: "copy" }, state);
      const paste = createMenuItem({ key: "paste" }, state);

      expect(copy.menuItemProps.role).toBe("menuitemradio");
      expect(copy.menuItemProps["aria-checked"]).toBe(true);
      expect(copy.menuItemProps["data-selected"]).toBe(true);
      expect(copy.isSelected()).toBe(true);
      expect(copy.selectionMode()).toBe("single");

      expect(paste.menuItemProps.role).toBe("menuitemradio");
      expect(paste.menuItemProps["aria-checked"]).toBe(false);
      expect(paste.menuItemProps["data-selected"]).toBeUndefined();
      expect(paste.isSelected()).toBe(false);
      dispose();
    });
  });

  it("exposes checkbox semantics for multiple selection mode", () => {
    createRoot((dispose) => {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "multiple",
        defaultSelectedKeys: ["copy"],
      });

      const copy = createMenuItem({ key: "copy" }, state);
      const paste = createMenuItem({ key: "paste" }, state);

      expect(copy.menuItemProps.role).toBe("menuitemcheckbox");
      expect(copy.menuItemProps["aria-checked"]).toBe(true);
      expect(copy.isSelected()).toBe(true);
      expect(copy.selectionMode()).toBe("multiple");

      expect(paste.menuItemProps.role).toBe("menuitemcheckbox");
      expect(paste.menuItemProps["aria-checked"]).toBe(false);
      expect(paste.isSelected()).toBe(false);
      dispose();
    });
  });
});

describe("createMenu - disabled key navigation", () => {
  afterEach(() => {
    cleanup();
  });

  it("skips disabled keys when navigating with ArrowDown", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
        { key: "item4", label: "Item 4" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item2", "item3"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item1
      state.setFocusedKey("item1");
      expect(state.focusedKey()).toBe("item1");

      // Press ArrowDown - should skip item2 and item3, land on item4
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item4");
      dispose();
    });
  });

  it("skips disabled keys when navigating with ArrowUp", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
        { key: "item4", label: "Item 4" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item2", "item3"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item4
      state.setFocusedKey("item4");
      expect(state.focusedKey()).toBe("item4");

      // Press ArrowUp - should skip item3 and item2, land on item1
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "ArrowUp",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item1");
      dispose();
    });
  });

  it("skips disabled keys when navigating to Home", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item1"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item3
      state.setFocusedKey("item3");

      // Press Home - should skip item1, land on item2
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Home",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item2");
      dispose();
    });
  });

  it("skips disabled keys when navigating to End", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item3"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item1
      state.setFocusedKey("item1");

      // Press End - should skip item3, land on item2
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "End",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item2");
      dispose();
    });
  });

  it("does not activate disabled items on Enter", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item1"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu", onAction }, state);

      // Focus disabled item1
      state.setFocusedKey("item1");

      // Press Enter - should NOT call onAction
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onAction).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("wraps to first non-disabled key when shouldFocusWrap is true", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item1"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu", shouldFocusWrap: true }, state);

      // Start at item3 (last item)
      state.setFocusedKey("item3");

      // Press ArrowDown - should wrap and skip item1, land on item2
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item2");
      dispose();
    });
  });

  it("does not skip disabled keys under disabledBehavior 'selection'", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item2"],
        disabledBehavior: "selection",
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      state.setFocusedKey("item1");

      // item2 is disabled for selection only, so ArrowDown stays on it.
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item2");
      dispose();
    });
  });

  it("still does not activate a disabled-for-selection item on Enter", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item2"],
        disabledBehavior: "selection",
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu", onAction }, state);

      // item2 is focusable under "selection" but must not activate.
      state.setFocusedKey("item2");

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onAction).not.toHaveBeenCalled();
      dispose();
    });
  });
});

describe("createMenu - page navigation", () => {
  afterEach(() => {
    cleanup();
  });

  it("moves focus down by multiple items on PageDown", () => {
    createRoot((dispose) => {
      // Create 15 items to test page navigation
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item1
      state.setFocusedKey("item1");
      expect(state.focusedKey()).toBe("item1");

      // Press PageDown - should move forward by multiple items
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "PageDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Should have moved past item1 (exact number depends on fallback page size)
      const focused = state.focusedKey();
      expect(focused).not.toBe("item1");
      // Should be somewhere in the middle or end
      const focusedIndex = items.findIndex((i) => i.key === focused);
      expect(focusedIndex).toBeGreaterThan(0);
      dispose();
    });
  });

  it("moves focus up by multiple items on PageUp", () => {
    createRoot((dispose) => {
      // Create 15 items to test page navigation
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at last item
      state.setFocusedKey("item15");
      expect(state.focusedKey()).toBe("item15");

      // Press PageUp - should move backward by multiple items
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "PageUp",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Should have moved before item15
      const focused = state.focusedKey();
      expect(focused).not.toBe("item15");
      // Should be somewhere in the middle or beginning
      const focusedIndex = items.findIndex((i) => i.key === focused);
      expect(focusedIndex).toBeLessThan(14);
      dispose();
    });
  });

  it("skips disabled items on PageDown", () => {
    createRoot((dispose) => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      // Disable several consecutive items
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        disabledKeys: ["item2", "item3", "item4", "item5"],
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item1
      state.setFocusedKey("item1");

      // Press PageDown
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "PageDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Should have skipped disabled items
      const focused = state.focusedKey();
      expect(["item2", "item3", "item4", "item5"]).not.toContain(focused);
      dispose();
    });
  });

  it("stops at last item on PageDown when near end", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item2
      state.setFocusedKey("item2");

      // Press PageDown with only 1 item below
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "PageDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Should be at the last item
      expect(state.focusedKey()).toBe("item3");
      dispose();
    });
  });

  it("stops at first item on PageUp when near beginning", () => {
    createRoot((dispose) => {
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
        { key: "item3", label: "Item 3" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Start at item2
      state.setFocusedKey("item2");

      // Press PageUp with only 1 item above
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "PageUp",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Should be at the first item
      expect(state.focusedKey()).toBe("item1");
      dispose();
    });
  });
});

describe("createMenu - accessibility warnings", () => {
  afterEach(() => {
    cleanup();
  });

  it("should warn when no label is provided in development", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      // Create menu without label, aria-label, or aria-labelledby
      createMenu({}, state);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Menu requires"));
      dispose();
    });

    warnSpy.mockRestore();
  });

  it("should not warn when aria-label is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    createRoot((dispose) => {
      const items = [{ key: "copy", label: "Copy" }];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      createMenu({ "aria-label": "Actions menu" }, state);

      expect(warnSpy).not.toHaveBeenCalled();
      dispose();
    });

    warnSpy.mockRestore();
  });
});

describe("createMenuTrigger", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns trigger props with aria-haspopup", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({ type: "menu" }, state);

      expect(menuTriggerProps["aria-haspopup"]).toBe("menu");
      dispose();
    });
  });

  it("sets aria-expanded based on state", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);

      expect(menuTriggerProps["aria-expanded"]).toBe(false);

      state.open();
      const { menuTriggerProps: triggerPropsAfter } = createMenuTrigger({}, state);
      expect(triggerPropsAfter["aria-expanded"]).toBe(true);
      dispose();
    });
  });

  it("sets aria-controls when open", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps, menuProps } = createMenuTrigger({}, state);

      expect(menuTriggerProps["aria-controls"]).toBeUndefined();

      state.open();
      const { menuTriggerProps: triggerPropsAfter, menuProps: menuPropsAfter } = createMenuTrigger(
        {},
        state,
      );
      expect(triggerPropsAfter["aria-controls"]).toBe(menuPropsAfter.id);
      dispose();
    });
  });

  it("onPress toggles state", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);

      expect(state.isOpen()).toBe(false);

      menuTriggerProps.onPress();
      expect(state.isOpen()).toBe(true);

      menuTriggerProps.onPress();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("does not toggle when disabled", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({ isDisabled: true }, state);

      menuTriggerProps.onPress();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("opens on ArrowDown key", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);

      menuTriggerProps.onKeyDown({
        key: "ArrowDown",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("opens on Enter key", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);

      menuTriggerProps.onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("opens on Space key", () => {
    createRoot((dispose) => {
      const state = createOverlayTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);

      menuTriggerProps.onKeyDown({
        key: " ",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });
});
