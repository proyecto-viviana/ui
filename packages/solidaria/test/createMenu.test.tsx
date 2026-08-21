/**
 * Tests for createMenu, createMenuItem, and createMenuTrigger hooks
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import {
  createMenuState,
  createMenuTriggerState,
  type MenuState,
  type MenuTriggerState,
} from "../../solid-stately/src";
import {
  createMenu,
  createMenuItem,
  createMenuTrigger,
  type AriaMenuTriggerProps,
} from "../src/menu";
import { PressEvent } from "../src/interactions/createPress";

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

  it('keeps disabledBehavior="selection" items actionable but not selectable on click', () => {
    const onAction = vi.fn();
    const onSelectionChange = vi.fn();
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    let state!: MenuState<(typeof items)[number]>;
    let itemRef!: HTMLDivElement;
    render(() => {
      state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        disabledKeys: ["copy"],
        disabledBehavior: "selection",
        onSelectionChange,
      });
      createMenu({ onAction, "aria-label": "Actions" }, state);
      const item = createMenuItem({ key: "copy" }, state, () => itemRef);
      return (
        <div ref={itemRef} {...item.menuItemProps}>
          <span {...item.labelProps}>Copy</span>
        </div>
      );
    });

    const item = screen.getByRole("menuitemradio", { name: "Copy" });
    expect(item).not.toHaveAttribute("aria-disabled");
    expect(item).not.toHaveAttribute("data-disabled");

    fireEvent.click(item);

    expect(onAction).toHaveBeenCalledWith("copy", items[0]);
    expect(state.isSelected("copy")).toBe(false);
    expect(onSelectionChange).not.toHaveBeenCalled();
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

  it("autoFocus true focuses the menu root after paint", async () => {
    const items = [
      { key: "copy", label: "Copy" },
      { key: "paste", label: "Paste" },
    ];

    render(() => {
      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });
      let menuEl: HTMLElement | null = null;
      const { menuProps } = createMenu(
        { autoFocus: true, "aria-label": "Actions" },
        state,
        () => menuEl,
      );
      return (
        <div
          ref={(el) => {
            menuEl = el;
          }}
          {...menuProps}
        >
          <div role="menuitem">Copy</div>
          <div role="menuitem">Paste</div>
        </div>
      );
    });

    await waitFor(() => {
      expect(document.activeElement?.getAttribute("role")).toBe("menu");
    });
  });

  it("autoFocus true requests CSS :focus-visible on the menu root", async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    try {
      const items = [
        { key: "copy", label: "Copy" },
        { key: "paste", label: "Paste" },
      ];

      render(() => {
        const state = createMenuState({
          items,
          getKey: (item) => item.key,
        });
        let menuEl: HTMLElement | null = null;
        const { menuProps } = createMenu(
          { autoFocus: true, "aria-label": "Actions" },
          state,
          () => menuEl,
        );
        return (
          <div
            ref={(el) => {
              menuEl = el;
            }}
            {...menuProps}
          >
            <div role="menuitem">Copy</div>
          </div>
        );
      });

      await waitFor(() => {
        expect(document.activeElement?.getAttribute("role")).toBe("menu");
      });
      expect(focusSpy).toHaveBeenCalledWith(
        expect.objectContaining({ preventScroll: true, focusVisible: true }),
      );
    } finally {
      focusSpy.mockRestore();
    }
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

      expect(onAction).toHaveBeenCalledWith("copy", items[0]);
      dispose();
    });
  });

  it("passes the activated item's value as the second onAction argument", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const items = [
        { key: "copy", label: "Copy", data: 1 },
        { key: "paste", label: "Paste", data: 2 },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
      });

      state.setFocusedKey("paste");

      const { menuProps } = createMenu({ onAction, "aria-label": "Actions" }, state);

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      // Mirrors useMenuItem performAction onAction(key, item?.value): the value
      // is the collection node's original data object.
      expect(onAction).toHaveBeenCalledWith("paste", items[1]);
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

      expect(onAction).toHaveBeenCalledWith("copy", items[0]);
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
      // onSelectionChange receives a `Selection` (Set subclass); compare contents.
      expect(new Set(onSelectionChange.mock.lastCall?.[0])).toEqual(new Set(["copy"]));
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

      state.setFocused(true);
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

  it("fires onAction but does not select a disabled-for-selection item on Enter", () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const onSelectionChange = vi.fn();
      const items = [
        { key: "item1", label: "Item 1" },
        { key: "item2", label: "Item 2" },
      ];

      const state = createMenuState({
        items,
        getKey: (item) => item.key,
        selectionMode: "single",
        disabledKeys: ["item2"],
        disabledBehavior: "selection",
        onSelectionChange,
      });

      const { menuProps } = createMenu({ "aria-label": "Test menu", onAction }, state);

      // item2 is focusable under "selection": activating it fires onAction
      // (allowsActions is gated on the "all" behavior) but never selects it
      // (canSelectItem keeps selection blocked).
      state.setFocusedKey("item2");

      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      onKeyDown({
        key: "Enter",
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent);

      expect(onAction).toHaveBeenCalledWith("item2", items[1]);
      expect(state.isSelected("item2")).toBe(false);
      expect(onSelectionChange).not.toHaveBeenCalled();
      dispose();
    });
  });
});

describe("createMenu - navigation-key consumption", () => {
  afterEach(() => {
    cleanup();
  });

  const threeItems = () => [
    { key: "item1", label: "Item 1" },
    { key: "item2", label: "Item 2" },
    { key: "item3", label: "Item 3" },
  ];

  it("prevents default on an arrow key that moves focus", () => {
    createRoot((dispose) => {
      const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      state.setFocusedKey("item1");
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "ArrowDown", preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item2");
      expect(preventDefault).toHaveBeenCalled();
      dispose();
    });
  });

  it("leaves ArrowDown alone at the last item when wrapping is off", () => {
    createRoot((dispose) => {
      const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      state.setFocusedKey("item3");
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "ArrowDown", preventDefault } as unknown as KeyboardEvent);

      // No target: the key must bubble instead of being swallowed.
      expect(state.focusedKey()).toBe("item3");
      expect(preventDefault).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("leaves ArrowUp alone at the first item when wrapping is off", () => {
    createRoot((dispose) => {
      const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      state.setFocusedKey("item1");
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "ArrowUp", preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBe("item1");
      expect(preventDefault).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("leaves Shift+Home alone when nothing is focused", () => {
    createRoot((dispose) => {
      const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      expect(state.focusedKey()).toBeNull();
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "Home", shiftKey: true, preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBeNull();
      expect(preventDefault).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("still moves to the first item on Home with no focus and no shift", () => {
    createRoot((dispose) => {
      const state = createMenuState({ items: threeItems(), getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      expect(state.focusedKey()).toBeNull();
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "Home", preventDefault } as unknown as KeyboardEvent);

      // The guard is shift-specific: plain Home still enters at the first item.
      expect(state.focusedKey()).toBe("item1");
      expect(preventDefault).toHaveBeenCalled();
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

  it("prevents default on PageDown that moves focus", () => {
    createRoot((dispose) => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      const state = createMenuState({ items, getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      state.setFocusedKey("item1");
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "PageDown", preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).not.toBe("item1");
      expect(preventDefault).toHaveBeenCalled();
      dispose();
    });
  });

  it("leaves PageDown alone when nothing is focused", () => {
    createRoot((dispose) => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      const state = createMenuState({ items, getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      // Mirror useSelectableCollection: with no focused key the Page key is left
      // alone (no focus move, no preventDefault) so it can scroll an enclosing region.
      expect(state.focusedKey()).toBeNull();
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "PageDown", preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBeNull();
      expect(preventDefault).not.toHaveBeenCalled();
      dispose();
    });
  });

  it("leaves PageUp alone when nothing is focused", () => {
    createRoot((dispose) => {
      const items = Array.from({ length: 15 }, (_, i) => ({
        key: `item${i + 1}`,
        label: `Item ${i + 1}`,
      }));

      const state = createMenuState({ items, getKey: (item) => item.key });
      const { menuProps } = createMenu({ "aria-label": "Test menu" }, state);

      expect(state.focusedKey()).toBeNull();
      const onKeyDown = menuProps.onKeyDown as (e: KeyboardEvent) => void;
      const preventDefault = vi.fn();
      onKeyDown({ key: "PageUp", preventDefault } as unknown as KeyboardEvent);

      expect(state.focusedKey()).toBeNull();
      expect(preventDefault).not.toHaveBeenCalled();
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
    vi.useRealTimers();
    vi.restoreAllMocks();
    cleanup();
  });

  function renderTrigger(props: AriaMenuTriggerProps = {}) {
    let state!: MenuTriggerState;
    let trigger!: ReturnType<typeof createMenuTrigger>;

    render(() => {
      state = createMenuTriggerState(props);
      trigger = createMenuTrigger(props, state);
      const domProps = () => {
        const {
          onPress: _onPress,
          onPressStart: _onPressStart,
          preventFocusOnPress: _preventFocusOnPress,
          ...rest
        } = trigger.menuTriggerProps;
        return rest;
      };
      return (
        <button
          {...domProps()}
          aria-haspopup={trigger.menuTriggerProps["aria-haspopup"]}
          aria-expanded={trigger.menuTriggerProps["aria-expanded"]}
          aria-controls={trigger.menuTriggerProps["aria-controls"]}
          aria-describedby={trigger.menuTriggerProps["aria-describedby"]}
        >
          Trigger
        </button>
      );
    });

    return {
      button: screen.getByRole("button", { name: "Trigger" }),
      state,
      get menuProps() {
        return trigger.menuProps;
      },
    };
  }

  it("links the trigger and menu with the upstream ARIA contract", () => {
    const { button, state, menuProps } = renderTrigger({ type: "menu" });

    expect(button).toHaveAttribute("aria-haspopup", "true");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("aria-controls");
    expect(menuProps["aria-labelledby"]).toBe(button.id);
    expect(menuProps.autoFocus).toBe(true);

    state.open();
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAttribute("aria-controls", menuProps.id);
  });

  it("opens on mouse press start, focuses the trigger, and focuses the menu root", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const trigger = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);

      trigger.menuTriggerProps.onPressStart?.(new PressEvent("pressstart", "mouse", null, button));

      expect(state.isOpen()).toBe(true);
      expect(state.focusStrategy()).toBeNull();
      expect(trigger.menuProps.autoFocus).toBe(true);
      expect(document.activeElement).toBe(button);
      button.remove();
      dispose();
    });
  });

  it("opens a virtual press at the first item", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const trigger = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);

      trigger.menuTriggerProps.onPressStart?.(
        new PressEvent("pressstart", "virtual", null, button),
      );

      expect(state.focusStrategy()).toBe("first");
      expect(trigger.menuProps.autoFocus).toBe("first");
      button.remove();
      dispose();
    });
  });

  it("waits for touch release and then toggles", () => {
    createRoot((dispose) => {
      const state = createMenuTriggerState();
      const { menuTriggerProps } = createMenuTrigger({}, state);
      const button = document.createElement("button");
      document.body.append(button);
      const start = new PressEvent("pressstart", "touch", null, button);
      const release = new PressEvent("press", "touch", null, button);

      menuTriggerProps.onPressStart?.(start);
      expect(state.isOpen()).toBe(false);

      menuTriggerProps.onPress?.(release);
      expect(state.isOpen()).toBe(true);
      expect(document.activeElement).toBe(button);

      menuTriggerProps.onPress?.(release);
      expect(state.isOpen()).toBe(false);
      button.remove();
      dispose();
    });
  });

  it("does not open disabled press or keyboard input", () => {
    const { button, state } = renderTrigger({ isDisabled: true });
    fireEvent.keyDown(button, { key: "ArrowDown" });
    expect(state.isOpen()).toBe(false);

    const press = createMenuTrigger({ isDisabled: true }, state).menuTriggerProps;
    press.onPressStart?.(new PressEvent("pressstart", "mouse", null, button));
    press.onPress?.(new PressEvent("press", "touch", null, button));
    expect(state.isOpen()).toBe(false);
  });

  it.each([
    ["Enter", false, "first"],
    [" ", false, "first"],
    ["ArrowDown", false, "first"],
    ["ArrowUp", false, "last"],
    ["ArrowDown", true, "first"],
    ["ArrowUp", true, "last"],
  ] as const)("opens press trigger with %s (Alt: %s) at %s", (key, altKey, strategy) => {
    const { button, state } = renderTrigger();
    const event = new KeyboardEvent("keydown", { key, altKey, bubbles: true, cancelable: true });

    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe(strategy);
  });

  it("leaves a handled keyboard event closed", () => {
    const { button, state } = renderTrigger();
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      bubbles: true,
      cancelable: true,
    });
    event.preventDefault();

    button.dispatchEvent(event);

    expect(state.isOpen()).toBe(false);
  });

  it("requires Alt for long-press keyboard activation", () => {
    const { button, state } = renderTrigger({ trigger: "longPress" });

    fireEvent.keyDown(button, { key: "Enter" });
    expect(state.isOpen()).toBe(false);

    fireEvent.keyDown(button, { key: "Enter", altKey: true });
    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe("first");
  });

  it("opens a long press at the first item and exposes the localized instruction", () => {
    vi.useFakeTimers();
    const { button, state } = renderTrigger({ trigger: "longPress" });

    fireEvent.pointerDown(button, { pointerType: "touch" });
    vi.advanceTimersByTime(500);

    expect(state.isOpen()).toBe(true);
    expect(state.focusStrategy()).toBe("first");
    const descriptionId = button.getAttribute("aria-describedby");
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId!)).toHaveTextContent(
      "Long press or press Alt + ArrowDown to open menu",
    );
  });

  it("opens a context menu at the requested viewport point and removes popup ARIA", () => {
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    const event = new MouseEvent("contextmenu", {
      clientX: 112,
      clientY: 214,
      bubbles: true,
      cancelable: true,
    });
    button.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 112, y: 214 });
    expect(button).not.toHaveAttribute("aria-haspopup");
    expect(button).not.toHaveAttribute("aria-expanded");
    expect(button).not.toHaveAttribute("aria-controls");
  });

  it.each([
    ["right click", { button: 2 }],
    ["Control+click", { button: 0, ctrlKey: true }],
  ])("closes an open context menu on a body %s", (_name, pointer) => {
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    fireEvent.contextMenu(button, { clientX: 4, clientY: 6 });
    expect(state.isOpen()).toBe(true);

    fireEvent.mouseDown(document.body, pointer);
    expect(state.isOpen()).toBe(false);
  });

  it("uses a long press to open a context menu on iOS", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("iPhone");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(button, {
      pointerType: "touch",
      clientX: 112,
      clientY: 214,
    });
    vi.advanceTimersByTime(500);

    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 112, y: 214 });
  });

  it("does not open an iOS context menu when the long press is canceled", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("iPhone");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });

    fireEvent.pointerDown(button, { pointerType: "touch" });
    vi.advanceTimersByTime(200);
    fireEvent.pointerCancel(button, { pointerType: "touch" });
    vi.advanceTimersByTime(400);

    expect(state.isOpen()).toBe(false);
  });

  it("uses the trigger center for the macOS Control+Enter fallback", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      left: 100,
      top: 200,
      right: 140,
      bottom: 220,
      width: 40,
      height: 20,
      toJSON: () => ({}),
    });

    fireEvent.keyDown(button, { key: "Enter", ctrlKey: true });
    vi.advanceTimersByTime(10);

    expect(state.isOpen()).toBe(true);
    expect(state.point()).toEqual({ x: 120, y: 210 });
  });

  it("does not double-open when macOS Control+Enter also fires contextmenu", () => {
    vi.useFakeTimers();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const { button, state } = renderTrigger({ trigger: "contextMenu" });
    const open = vi.spyOn(state, "open");

    fireEvent.keyDown(button, { key: "Enter", ctrlKey: true });
    fireEvent.contextMenu(button, { clientX: 4, clientY: 6 });
    vi.advanceTimersByTime(10);

    expect(state.isOpen()).toBe(true);
    expect(open).toHaveBeenCalledTimes(1);
  });
});
