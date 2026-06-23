/**
 * Comprehensive tests for createListBox and createOption hooks.
 *
 * Tests ARIA attributes, keyboard navigation, selection modes, and type-to-select.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { cleanup } from "@solidjs/testing-library";
import { createListState, createListCollection } from "../../solid-stately/src";
import { createListBox, createOption } from "../src/listbox";

// Helper to create a mock keyboard event with proper currentTarget
function createMockKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}) {
  const mockElement = document.createElement("div");
  const event = new KeyboardEvent("keydown", { key, ...options });
  Object.defineProperty(event, "preventDefault", { value: vi.fn() });
  Object.defineProperty(event, "stopPropagation", { value: vi.fn() });
  Object.defineProperty(event, "currentTarget", { value: mockElement });
  Object.defineProperty(event, "target", { value: mockElement });
  return event;
}

// Helper to create basic list state
function createBasicListState(
  options: {
    selectionMode?: "none" | "single" | "multiple";
    defaultSelectedKeys?: Iterable<string>;
    disabledKeys?: Iterable<string>;
    disabledBehavior?: "selection" | "all";
    disallowEmptySelection?: boolean;
  } = {},
) {
  const items = [
    { key: "a", label: "Apple" },
    { key: "b", label: "Banana" },
    { key: "c", label: "Cherry" },
    { key: "d", label: "Date" },
    { key: "e", label: "Elderberry" },
  ];

  return createListState({
    items,
    getKey: (item) => item.key,
    selectionMode: options.selectionMode ?? "single",
    defaultSelectedKeys: options.defaultSelectedKeys,
    disabledKeys: options.disabledKeys,
    disabledBehavior: options.disabledBehavior,
    disallowEmptySelection: options.disallowEmptySelection,
  });
}

describe("createListBox", () => {
  afterEach(() => {
    cleanup();
  });

  describe("ARIA attributes", () => {
    it('returns listBoxProps with role="listbox"', () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        expect(listBoxProps.role).toBe("listbox");
        dispose();
      });
    });

    it("sets aria-multiselectable for multiple selection", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        expect(listBoxProps["aria-multiselectable"]).toBe(true);
        dispose();
      });
    });

    it("does not set aria-multiselectable for single selection", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "single" });
        const { listBoxProps } = createListBox({}, state);

        expect(listBoxProps["aria-multiselectable"]).toBeUndefined();
        dispose();
      });
    });

    it("sets aria-disabled when disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ isDisabled: true }, state);

        expect(listBoxProps["aria-disabled"]).toBe(true);
        dispose();
      });
    });

    it("has tabIndex 0 when not disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        expect(listBoxProps.tabIndex).toBe(0);
        dispose();
      });
    });

    it("removes tabIndex when disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ isDisabled: true }, state);

        expect(listBoxProps.tabIndex).toBeUndefined();
        dispose();
      });
    });

    it("passes through aria-label", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ "aria-label": "Fruit selection" }, state);

        expect(listBoxProps["aria-label"]).toBe("Fruit selection");
        dispose();
      });
    });

    it("passes through aria-labelledby", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ "aria-labelledby": "heading-id" }, state);

        expect(listBoxProps["aria-labelledby"]).toBe("heading-id");
        dispose();
      });
    });

    it("passes through aria-describedby", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ "aria-describedby": "desc-id" }, state);

        expect(listBoxProps["aria-describedby"]).toBe("desc-id");
        dispose();
      });
    });

    it("sets aria-activedescendant to the focused option id", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const listBoxAria = createListBox({}, state);

        state.setFocusedKey("c");
        expect(listBoxAria.listBoxProps["aria-activedescendant"]).toBe("c");

        state.setFocusedKey(null);
        expect(listBoxAria.listBoxProps["aria-activedescendant"]).toBeUndefined();
        dispose();
      });
    });
  });

  describe("keyboard navigation", () => {
    it("handles ArrowDown to move focus to next item", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });

    it("handles ArrowUp to move focus to previous item", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("c");

        const event = createMockKeyboardEvent("ArrowUp");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });

    it("handles Home to move focus to first item", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("d");

        const event = createMockKeyboardEvent("Home");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a");
        dispose();
      });
    });

    it("handles End to move focus to last item", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("End");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("e");
        dispose();
      });
    });

    it("handles ArrowRight to move focus to next item when horizontal", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ orientation: "horizontal" }, state);

        state.setFocusedKey("a");

        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowRight"));

        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });

    it("handles ArrowLeft to move focus to previous item when horizontal", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ orientation: "horizontal" }, state);

        state.setFocusedKey("c");

        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowLeft"));

        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });

    it("ignores ArrowRight/ArrowLeft in a vertical (default) listbox", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("c");

        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowRight"));
        expect(state.focusedKey()).toBe("c");

        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowLeft"));
        expect(state.focusedKey()).toBe("c");
        dispose();
      });
    });

    it("flips ArrowRight/ArrowLeft under RTL when horizontal", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox(
          { orientation: "horizontal", direction: "rtl" },
          state,
        );

        state.setFocusedKey("b");
        // RTL: ArrowRight moves to the previous item.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowRight"));
        expect(state.focusedKey()).toBe("a");

        state.setFocusedKey("b");
        // RTL: ArrowLeft moves to the next item.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowLeft"));
        expect(state.focusedKey()).toBe("c");
        dispose();
      });
    });

    it("enters at the first item when navigating the horizontal axis with no focus", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ orientation: "horizontal" }, state);

        expect(state.focusedKey()).toBeNull();

        // Even ArrowLeft (a "backward" key) enters at the FIRST item, mirroring
        // upstream's getFirstKey() fallback for both Left and Right.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowLeft"));
        expect(state.focusedKey()).toBe("a");
        dispose();
      });
    });

    it("skips disabled items navigating the horizontal axis", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ disabledKeys: ["b", "c"] });
        const { listBoxProps } = createListBox({ orientation: "horizontal" }, state);

        state.setFocusedKey("a");

        // ArrowRight skips disabled b and c, landing on d.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowRight"));
        expect(state.focusedKey()).toBe("d");
        dispose();
      });
    });

    it("handles Space to toggle selection", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("b");
        expect(state.selectedKeys().has("b")).toBe(false);

        const event = createMockKeyboardEvent(" ");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().has("b")).toBe(true);
        dispose();
      });
    });

    it("handles Enter to toggle selection and call onAction", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createBasicListState({ selectionMode: "single" });
        const { listBoxProps } = createListBox({ onAction }, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("Enter");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(onAction).toHaveBeenCalledWith("a");
        dispose();
      });
    });

    it("handles Escape to clear selection", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "b"],
        });
        const { listBoxProps } = createListBox({}, state);

        expect(state.selectedKeys().size).toBe(2);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(0);
        dispose();
      });
    });

    it("does not clear selection on Escape when disallowEmptySelection is true", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "single",
          defaultSelectedKeys: ["a"],
          disallowEmptySelection: true,
        });
        const { listBoxProps } = createListBox({}, state);

        expect(state.selectedKeys().size).toBe(1);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(1);
        dispose();
      });
    });

    it("clears on Escape and stops the event so an overlay does not also close", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "b"],
        });
        const { listBoxProps } = createListBox({}, state);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(0);
        // When it actually clears, it swallows the event (mirrors upstream).
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves Escape alone when there is no selection to clear", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        expect(state.selectedKeys().size).toBe(0);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        // Nothing to clear: the event must bubble so an enclosing overlay
        // (popover, combobox, dialog) can handle Escape itself.
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("does not clear selection on Escape when escapeKeyBehavior is 'none'", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "b"],
        });
        const { listBoxProps } = createListBox({ escapeKeyBehavior: "none" }, state);

        expect(state.selectedKeys().size).toBe(2);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        // With 'none', Escape neither clears the selection nor swallows the
        // event — an enclosing overlay can still handle it.
        expect(state.selectedKeys().size).toBe(2);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("clears on Escape when escapeKeyBehavior is explicitly 'clearSelection'", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "b"],
        });
        const { listBoxProps } = createListBox({ escapeKeyBehavior: "clearSelection" }, state);

        const event = createMockKeyboardEvent("Escape");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(0);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        dispose();
      });
    });

    it("handles Ctrl+A to select all in multiple selection mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        expect(state.selectedKeys()).not.toBe("all");

        const event = createMockKeyboardEvent("a", { ctrlKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        // selectAll() sets selection to 'all' special value
        expect(state.selectedKeys()).toBe("all");
        dispose();
      });
    });

    it("handles Meta+A to select all in multiple selection mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        const event = createMockKeyboardEvent("a", { metaKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys()).toBe("all");
        dispose();
      });
    });

    it("does not select all with Ctrl+A in single selection mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "single" });
        const { listBoxProps } = createListBox({}, state);

        const event = createMockKeyboardEvent("a", { ctrlKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(0);
        dispose();
      });
    });

    it("handles Shift+ArrowDown for range selection in multiple mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");
        state.toggleSelection("a");

        const event = createMockKeyboardEvent("ArrowDown", { shiftKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        expect(state.selectedKeys().has("a")).toBe(true);
        expect(state.selectedKeys().has("b")).toBe(true);
        dispose();
      });
    });

    it("does not respond to keyboard when disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ isDisabled: true }, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a"); // Focus should not change
        dispose();
      });
    });

    it("focuses first item when ArrowDown with no focus", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        expect(state.focusedKey()).toBeNull();

        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a");
        dispose();
      });
    });

    it("focuses last item when ArrowUp with no focus", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        expect(state.focusedKey()).toBeNull();

        const event = createMockKeyboardEvent("ArrowUp");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("e");
        dispose();
      });
    });

    it("skips disabled items during keyboard navigation", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ disabledKeys: ["b"] });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("c");
        dispose();
      });
    });

    it("does not skip disabled items during navigation under disabledBehavior 'selection'", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");
        // b is disabled for selection only, so it stays focusable.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowDown"));

        expect(state.focusedKey()).toBe("b");
        dispose();
      });
    });

    it("still blocks selection of a disabled-for-selection item", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowDown"));
        expect(state.focusedKey()).toBe("b");

        // Space on the disabled-for-selection row must not select it.
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent(" "));
        expect(state.selectedKeys()).not.toBe("all");
        expect((state.selectedKeys() as Set<string>).has("b")).toBe(false);
        dispose();
      });
    });

    it("fires onAction but does not select a disabled-for-selection option on Enter", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createBasicListState({
          selectionMode: "multiple",
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        const { listBoxProps } = createListBox({ onAction }, state);

        // b is focusable under "selection": Enter fires onAction but must not
        // select it (toggleSelection self-guards on the raw disabled check).
        state.setFocusedKey("b");
        (listBoxProps.onKeyDown as any)?.(createMockKeyboardEvent("Enter"));

        expect(onAction).toHaveBeenCalledWith("b");
        expect((state.selectedKeys() as Set<string>).has("b")).toBe(false);
        dispose();
      });
    });

    it("wraps focus when shouldFocusWrap is true", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ shouldFocusWrap: true }, state);

        state.setFocusedKey("e");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a");
        dispose();
      });
    });

    it("does not wrap focus when shouldFocusWrap is false", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ shouldFocusWrap: false }, state);

        state.setFocusedKey("e");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("e");
        dispose();
      });
    });

    it("prevents default on an arrow key that actually moves focus", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        expect(event.preventDefault).toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves ArrowDown alone at the last item when wrapping is off", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ shouldFocusWrap: false }, state);

        state.setFocusedKey("e");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        // No target: the event must bubble (e.g. to scroll an enclosing region)
        // instead of being swallowed.
        expect(state.focusedKey()).toBe("e");
        expect(event.preventDefault).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves ArrowUp alone at the first item when wrapping is off", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ shouldFocusWrap: false }, state);

        state.setFocusedKey("a");
        const event = createMockKeyboardEvent("ArrowUp");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a");
        expect(event.preventDefault).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("still consumes ArrowDown at the last item when wrapping is on", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ shouldFocusWrap: true }, state);

        state.setFocusedKey("e");
        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("a");
        expect(event.preventDefault).toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves ArrowRight alone at the last item of a horizontal listbox without wrap", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ orientation: "horizontal" }, state);

        state.setFocusedKey("e");
        const event = createMockKeyboardEvent("ArrowRight");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("e");
        expect(event.preventDefault).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves Shift+Home alone when nothing is focused", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        expect(state.focusedKey()).toBeNull();
        const event = createMockKeyboardEvent("Home", { shiftKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        // No anchor to extend from: don't move focus and don't swallow the key.
        expect(state.focusedKey()).toBeNull();
        expect(event.preventDefault).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("leaves Shift+End alone when nothing is focused", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        expect(state.focusedKey()).toBeNull();
        const event = createMockKeyboardEvent("End", { shiftKey: true });
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBeNull();
        expect(event.preventDefault).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("still moves to the first item on Home with no focus and no shift", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { listBoxProps } = createListBox({}, state);

        expect(state.focusedKey()).toBeNull();
        const event = createMockKeyboardEvent("Home");
        (listBoxProps.onKeyDown as any)?.(event);

        // The guard is shift-specific: plain Home still enters at the first item.
        expect(state.focusedKey()).toBe("a");
        expect(event.preventDefault).toHaveBeenCalled();
        dispose();
      });
    });

    it("does not toggle selection or fire action for disabled focused items", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createBasicListState({
          selectionMode: "multiple",
          disabledKeys: ["c"],
        });
        const { listBoxProps } = createListBox({ onAction }, state);

        state.setFocusedKey("c");
        const event = createMockKeyboardEvent("Enter");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().has("c")).toBe(false);
        expect(onAction).not.toHaveBeenCalled();
        dispose();
      });
    });
  });

  describe("selection behavior", () => {
    it("selects on ArrowDown in single selection mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "single" });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        expect(state.selectedKeys().has("b")).toBe(true);
        dispose();
      });
    });

    it("does not select on ArrowDown in multiple selection mode without shift", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "multiple" });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent("ArrowDown");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.focusedKey()).toBe("b");
        expect(state.selectedKeys().size).toBe(0);
        dispose();
      });
    });

    it("does not modify selection in none selection mode", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ selectionMode: "none" });
        const { listBoxProps } = createListBox({}, state);

        state.setFocusedKey("a");

        const event = createMockKeyboardEvent(" ");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(state.selectedKeys().size).toBe(0);
        dispose();
      });
    });
  });

  describe("onAction callback", () => {
    it("calls onAction when Enter is pressed", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ onAction }, state);

        state.setFocusedKey("c");

        const event = createMockKeyboardEvent("Enter");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(onAction).toHaveBeenCalledWith("c");
        dispose();
      });
    });

    it("calls onAction when Space is pressed", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createBasicListState();
        const { listBoxProps } = createListBox({ onAction }, state);

        state.setFocusedKey("b");

        const event = createMockKeyboardEvent(" ");
        (listBoxProps.onKeyDown as any)?.(event);

        expect(onAction).toHaveBeenCalledWith("b");
        dispose();
      });
    });
  });
});

describe("createOption", () => {
  afterEach(() => {
    cleanup();
  });

  describe("ARIA attributes", () => {
    it('returns optionProps with role="option"', () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { optionProps } = createOption({ key: "a" }, state);

        expect(optionProps.role).toBe("option");
        dispose();
      });
    });

    it("sets aria-selected when selected", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ defaultSelectedKeys: ["a"] });
        const { optionProps } = createOption({ key: "a" }, state);

        expect(optionProps["aria-selected"]).toBe(true);
        dispose();
      });
    });

    it("sets aria-selected false when not selected", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { optionProps } = createOption({ key: "b" }, state);

        expect(optionProps["aria-selected"]).toBe(false);
        dispose();
      });
    });

    it("sets aria-disabled when disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ disabledKeys: ["a"] });
        const { optionProps, isDisabled } = createOption({ key: "a" }, state);

        expect(optionProps["aria-disabled"]).toBe(true);
        expect(isDisabled()).toBe(true);
        dispose();
      });
    });

    it("does not set aria-disabled when not disabled", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { optionProps, isDisabled } = createOption({ key: "a" }, state);

        expect(optionProps["aria-disabled"]).toBeUndefined();
        expect(isDisabled()).toBe(false);
        dispose();
      });
    });

    it("inherits disabled state from parent listbox metadata", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        createListBox({ isDisabled: true }, state);
        const { optionProps, isDisabled } = createOption({ key: "a" }, state);

        expect(optionProps["aria-disabled"]).toBe(true);
        expect(isDisabled()).toBe(true);
        dispose();
      });
    });
  });

  describe("state tracking", () => {
    it("tracks selection state", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { isSelected } = createOption({ key: "a" }, state);

        expect(isSelected()).toBe(false);

        state.select("a");
        expect(isSelected()).toBe(true);

        state.clearSelection();
        expect(isSelected()).toBe(false);
        dispose();
      });
    });

    it("tracks focused state", () => {
      createRoot((dispose) => {
        const state = createBasicListState();
        const { isFocused: isFocusedA } = createOption({ key: "a" }, state);
        const { isFocused: isFocusedB } = createOption({ key: "b" }, state);

        expect(isFocusedA()).toBe(false);
        expect(isFocusedB()).toBe(false);

        state.setFocusedKey("a");
        expect(isFocusedA()).toBe(false);

        state.setFocused(true);
        expect(isFocusedA()).toBe(true);
        expect(isFocusedB()).toBe(false);

        state.setFocusedKey("b");
        expect(isFocusedA()).toBe(false);
        expect(isFocusedB()).toBe(true);
        dispose();
      });
    });

    it("tracks disabled state", () => {
      createRoot((dispose) => {
        const state = createBasicListState({ disabledKeys: ["a"] });
        const { isDisabled: isDisabledA } = createOption({ key: "a" }, state);
        const { isDisabled: isDisabledB } = createOption({ key: "b" }, state);

        expect(isDisabledA()).toBe(true);
        expect(isDisabledB()).toBe(false);
        dispose();
      });
    });
  });

  describe("multiple options", () => {
    it("correctly differentiates between options", () => {
      createRoot((dispose) => {
        const state = createBasicListState({
          selectionMode: "multiple",
          defaultSelectedKeys: ["a", "c"],
          disabledKeys: ["b"],
        });

        state.setFocused(true);
        state.setFocusedKey("c");

        const optionA = createOption({ key: "a" }, state);
        const optionB = createOption({ key: "b" }, state);
        const optionC = createOption({ key: "c" }, state);
        const optionD = createOption({ key: "d" }, state);

        // Option A: selected, not focused, not disabled
        expect(optionA.isSelected()).toBe(true);
        expect(optionA.isFocused()).toBe(false);
        expect(optionA.isDisabled()).toBe(false);

        // Option B: not selected, not focused, disabled
        expect(optionB.isSelected()).toBe(false);
        expect(optionB.isFocused()).toBe(false);
        expect(optionB.isDisabled()).toBe(true);

        // Option C: selected, focused, not disabled
        expect(optionC.isSelected()).toBe(true);
        expect(optionC.isFocused()).toBe(true);
        expect(optionC.isDisabled()).toBe(false);

        // Option D: not selected, not focused, not disabled
        expect(optionD.isSelected()).toBe(false);
        expect(optionD.isFocused()).toBe(false);
        expect(optionD.isDisabled()).toBe(false);

        dispose();
      });
    });
  });
});
