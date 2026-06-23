/**
 * Tests for createGridList keyboard navigation, focused on disabled-key
 * semantics.
 *
 * Mirrors React Aria's `ListKeyboardDelegate`: disabled rows are skipped during
 * arrow/Home/End navigation only under the default `disabledBehavior: "all"`;
 * under `"selection"` they stay focusable (just not selectable).
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { cleanup } from "@solidjs/testing-library";
import {
  createGridState,
  type GridCollection,
  type GridNode,
  type Key,
} from "../../solid-stately/src";
import { createGridList, createGridListItem } from "../src/gridlist";

// Mock keyboard event with a stubbed preventDefault and currentTarget.
function createMockKeyboardEvent(
  key: string,
  options: Partial<KeyboardEvent> = {},
  mockElement = document.createElement("div"),
) {
  const event = new KeyboardEvent("keydown", { key, ...options });
  Object.defineProperty(event, "preventDefault", { value: vi.fn() });
  Object.defineProperty(event, "currentTarget", { value: mockElement });
  Object.defineProperty(event, "target", { value: mockElement });
  return event;
}

function createRowKeyboardEvent(key: string, currentTarget: HTMLElement, target: HTMLElement) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  let stopped = false;
  Object.defineProperty(event, "cancelBubble", {
    configurable: true,
    get: () => stopped,
    set: (value: boolean) => {
      stopped = value;
    },
  });
  Object.defineProperty(event, "preventDefault", { value: vi.fn() });
  Object.defineProperty(event, "stopPropagation", {
    value: vi.fn(() => {
      stopped = true;
    }),
  });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  Object.defineProperty(event, "target", { value: target });
  return event;
}

function createRowPointerEvent(
  type: "pointerdown" | "mousedown",
  currentTarget: HTMLElement,
  target: HTMLElement,
) {
  const event =
    type === "pointerdown" && typeof PointerEvent === "function"
      ? new PointerEvent(type, { bubbles: true, cancelable: true })
      : new MouseEvent(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "stopPropagation", { value: vi.fn() });
  Object.defineProperty(event, "currentTarget", { value: currentTarget });
  Object.defineProperty(event, "target", { value: target });
  return event;
}

// A flat grid collection whose navigation walks the row items in order, the
// shape a GridList presents (one item per row, no nested cells needed here).
function createRowCollection(keys: Key[]): GridCollection<{ key: Key }> {
  const rowNodes: GridNode<{ key: Key }>[] = keys.map((key, index) => ({
    type: "item",
    key,
    value: { key },
    textValue: String(key),
    rendered: null,
    level: 0,
    index,
    parentKey: null,
    hasChildNodes: false,
    childNodes: [],
  }));

  const keyMap = new Map<Key, GridNode<{ key: Key }>>();
  rowNodes.forEach((node) => keyMap.set(node.key, node));
  const order = rowNodes.map((n) => n.key);

  return {
    rows: rowNodes,
    columns: [],
    headerRows: [],
    get rowCount() {
      return rowNodes.length;
    },
    get columnCount() {
      return 0;
    },
    get size() {
      return rowNodes.length;
    },
    getKeys() {
      return order;
    },
    getItem(key) {
      return keyMap.get(key) ?? null;
    },
    at(index) {
      return rowNodes[index] ?? null;
    },
    getKeyBefore(key) {
      const idx = order.indexOf(key);
      return idx > 0 ? order[idx - 1] : null;
    },
    getKeyAfter(key) {
      const idx = order.indexOf(key);
      return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
    },
    getFirstKey() {
      return order[0] ?? null;
    },
    getLastKey() {
      return order[order.length - 1] ?? null;
    },
    getChildren(key) {
      return keyMap.get(key)?.childNodes ?? [];
    },
    getTextValue(key) {
      return keyMap.get(key)?.textValue ?? "";
    },
    getCell() {
      return null;
    },
    [Symbol.iterator]() {
      return rowNodes[Symbol.iterator]();
    },
  };
}

function createRowGridState(
  options: {
    disabledKeys?: Iterable<Key>;
    disabledBehavior?: "selection" | "all";
    selectionMode?: "none" | "single" | "multiple";
  } = {},
) {
  const collection = createRowCollection(["a", "b", "c", "d", "e"]);
  return createGridState<{ key: Key }>(() => ({
    collection,
    disabledKeys: options.disabledKeys,
    disabledBehavior: options.disabledBehavior,
    selectionMode: options.selectionMode ?? "multiple",
  }));
}

describe("createGridList disabled-key keyboard navigation", () => {
  afterEach(() => {
    cleanup();
  });

  describe('disabledBehavior: "all" (default)', () => {
    it("skips disabled rows on ArrowDown", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["b", "c"] });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        state.setFocusedKey("a");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowDown"));

        // b and c are disabled, so focus lands on d.
        expect(state.focusedKey).toBe("d");
        dispose();
      });
    });

    it("skips disabled rows on ArrowUp", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["c", "d"] });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        state.setFocusedKey("e");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowUp"));

        // d and c are disabled, so focus lands on b.
        expect(state.focusedKey).toBe("b");
        dispose();
      });
    });

    it("lands on the first enabled row for Home", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["a", "b"] });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        state.setFocusedKey("e");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("Home"));

        expect(state.focusedKey).toBe("c");
        dispose();
      });
    });

    it("lands on the last enabled row for End", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["d", "e"] });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        state.setFocusedKey("a");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("End"));

        expect(state.focusedKey).toBe("c");
        dispose();
      });
    });

    it("skips disabled rows navigating the horizontal axis", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["b", "c"] });
        const { gridProps } = createGridList(
          () => ({ orientation: "horizontal" }),
          () => state,
          () => null,
        );

        state.setFocusedKey("a");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowRight"));

        expect(state.focusedKey).toBe("d");
        dispose();
      });
    });

    it("enters at the first enabled row on focus", () => {
      createRoot((dispose) => {
        const state = createRowGridState({ disabledKeys: ["a"] });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        expect(state.focusedKey).toBeNull();
        (gridProps.onFocus as any)?.(new FocusEvent("focus"));

        expect(state.focusedKey).toBe("b");
        dispose();
      });
    });
  });

  describe('disabledBehavior: "selection"', () => {
    it("lands on a disabled row on ArrowDown (no skip)", () => {
      createRoot((dispose) => {
        const state = createRowGridState({
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        const { gridProps } = createGridList(
          () => ({}),
          () => state,
          () => null,
        );

        state.setFocusedKey("a");
        (gridProps.onKeyDown as any)?.(createMockKeyboardEvent("ArrowDown"));

        // b is disabled for selection only, so it remains focusable.
        expect(state.focusedKey).toBe("b");
        dispose();
      });
    });

    it("does not select a disabled row even though it is focusable", () => {
      createRoot((dispose) => {
        const state = createRowGridState({
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        // Selection and activation live on the row hook now (mirroring
        // useSelectableCollection, which has no Space/Enter case); the grid hook
        // only drives navigation and registers actions.
        createGridList(
          () => ({}),
          () => state,
          () => null,
        );
        const item = createGridListItem(
          () => ({ node: state.collection.getItem("b")! }),
          () => state,
          () => null,
        );

        // Space on the disabled-for-selection row must not select it.
        (item.rowProps.onKeyDown as any)?.(createMockKeyboardEvent(" "));
        expect(state.isSelected("b")).toBe(false);
        dispose();
      });
    });

    it("fires onAction but does not select a disabled row on Enter", () => {
      createRoot((dispose) => {
        const onAction = vi.fn();
        const state = createRowGridState({
          disabledKeys: ["b"],
          disabledBehavior: "selection",
        });
        // The grid hook registers onAction (via the gridlist data map) but no
        // longer handles Enter — the row hook performs the action. Under
        // "selection" b stays focusable, so Enter fires onAction; Space selection
        // stays blocked independently.
        createGridList(
          () => ({ onAction }),
          () => state,
          () => null,
        );
        const item = createGridListItem(
          () => ({ node: state.collection.getItem("b")! }),
          () => state,
          () => null,
        );

        const keyboardTarget = document.createElement("div");
        (item.rowProps.onKeyDown as any)?.(createMockKeyboardEvent("Enter", {}, keyboardTarget));
        (item.rowProps.onKeyUp as any)?.(createMockKeyboardEvent("Enter", {}, keyboardTarget));

        expect(onAction).toHaveBeenCalledWith("b");
        expect(state.isSelected("b")).toBe(false);
        dispose();
      });
    });
  });
});

describe("createGridList keyboardNavigationBehavior", () => {
  afterEach(() => {
    cleanup();
  });

  it('stops tabbable child keyboard and pointer events in "tab" mode', () => {
    createRoot((dispose) => {
      const onAction = vi.fn();
      const state = createRowGridState({ selectionMode: "multiple" });
      const row = document.createElement("div");
      const input = document.createElement("input");
      const button = document.createElement("button");
      row.append(input, button);
      document.body.append(row);

      createGridList(
        () => ({ keyboardNavigationBehavior: "tab", onAction }),
        () => state,
        () => null,
      );

      state.setFocused(true);
      state.setFocusedKey("a");

      const item = createGridListItem(
        () => ({ node: state.collection.getItem("a")! }),
        () => state,
        () => row,
      );

      input.focus();

      const space = createRowKeyboardEvent(" ", row, input);
      (item.rowProps.onKeyDown as any)?.(space);

      expect(space.stopPropagation).toHaveBeenCalledTimes(1);
      expect(state.isSelected("a")).toBe(false);
      expect(onAction).not.toHaveBeenCalled();

      const enter = createRowKeyboardEvent("Enter", row, input);
      (item.rowProps.onKeyDown as any)?.(enter);

      expect(enter.stopPropagation).toHaveBeenCalledTimes(1);
      expect(onAction).not.toHaveBeenCalled();

      const tab = createRowKeyboardEvent("Tab", row, input);
      (item.rowProps.onKeyDown as any)?.(tab);

      expect(tab.stopPropagation).toHaveBeenCalledTimes(1);

      const pointerDown = createRowPointerEvent("pointerdown", row, input);
      (item.rowProps.onPointerDown as any)?.(pointerDown);

      expect(pointerDown.stopPropagation).toHaveBeenCalledTimes(1);
      expect(state.isSelected("a")).toBe(false);

      const mouseDown = createRowPointerEvent("mousedown", row, input);
      (item.rowProps.onMouseDown as any)?.(mouseDown);

      expect(mouseDown.stopPropagation).toHaveBeenCalledTimes(1);
      expect(state.isSelected("a")).toBe(false);

      row.remove();
      dispose();
    });
  });
});
