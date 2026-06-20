/**
 * Tests for the aria-layer selection decision (selectItem) and its
 * platform-aware modifier helpers. This is where react-aria's
 * useSelectableItem.onSelect logic lives in our port — react-stately's
 * select() only knows pointerType + selectionBehavior.
 */

import { describe, it, expect, afterEach } from "vitest";
import { createRoot } from "solid-js";
import { createListState } from "../../solid-stately/src";
import { selectItem } from "../src/selection/selectItem";
import { isCtrlKeyPressed } from "../src/utils/keyboard";
import { isNonContiguousSelectionModifier } from "../src/selection/utils";

const items = [
  { key: "a", label: "Apple" },
  { key: "b", label: "Banana" },
  { key: "c", label: "Cherry" },
];

function withPlatform(platform: string, fn: () => void): void {
  const original = Object.getOwnPropertyDescriptor(window.navigator, "platform");
  Object.defineProperty(window.navigator, "platform", {
    value: platform,
    configurable: true,
  });
  try {
    fn();
  } finally {
    if (original) {
      Object.defineProperty(window.navigator, "platform", original);
    }
  }
}

function multipleState(behavior: "toggle" | "replace", selected: string[] = []) {
  return createListState({
    items,
    getKey: (item) => item.key,
    selectionMode: "multiple",
    selectionBehavior: behavior,
    defaultSelectedKeys: selected,
  });
}

afterEach(() => {
  // navigator.platform restored by withPlatform; nothing else to clean.
});

describe("isCtrlKeyPressed", () => {
  it("reads ctrlKey on non-Apple platforms and metaKey on macOS", () => {
    withPlatform("Linux x86_64", () => {
      expect(isCtrlKeyPressed({ ctrlKey: true })).toBe(true);
      expect(isCtrlKeyPressed({ metaKey: true })).toBe(false);
    });
    withPlatform("MacIntel", () => {
      expect(isCtrlKeyPressed({ metaKey: true })).toBe(true);
      expect(isCtrlKeyPressed({ ctrlKey: true })).toBe(false);
    });
  });
});

describe("isNonContiguousSelectionModifier", () => {
  it("reads ctrlKey on non-Apple platforms and altKey on macOS", () => {
    withPlatform("Linux x86_64", () => {
      expect(isNonContiguousSelectionModifier({ ctrlKey: true })).toBe(true);
      expect(isNonContiguousSelectionModifier({ altKey: true })).toBe(false);
    });
    withPlatform("MacIntel", () => {
      expect(isNonContiguousSelectionModifier({ altKey: true })).toBe(true);
      expect(isNonContiguousSelectionModifier({ ctrlKey: true })).toBe(false);
    });
  });
});

describe("selectItem — multiple mode, replace behavior", () => {
  it("plain (unmodified) select replaces the whole selection", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = multipleState("replace", ["a"]);
        selectItem(state, "b", { pointerType: "mouse" }, state.collection());
        expect(state.selectedKeys().has("a")).toBe(false);
        expect(state.selectedKeys().has("b")).toBe(true);
      });
      dispose();
    });
  });

  it("the platform ctrl modifier toggles (adds) without clearing the rest", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = multipleState("replace", ["b"]);
        selectItem(state, "c", { pointerType: "mouse", ctrlKey: true }, state.collection());
        expect(state.selectedKeys().has("b")).toBe(true);
        expect(state.selectedKeys().has("c")).toBe(true);
      });
      dispose();
    });
  });

  it("ignores metaKey on non-Apple platforms (replaces, not toggles)", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = multipleState("replace", ["b"]);
        selectItem(state, "c", { pointerType: "mouse", metaKey: true }, state.collection());
        expect(state.selectedKeys().has("b")).toBe(false);
        expect(state.selectedKeys().has("c")).toBe(true);
      });
      dispose();
    });
  });

  it("uses metaKey (not ctrlKey) on macOS", () => {
    createRoot((dispose) => {
      withPlatform("MacIntel", () => {
        const state = multipleState("replace", ["b"]);
        // ctrl is ignored on macOS → replace.
        selectItem(state, "c", { pointerType: "mouse", ctrlKey: true }, state.collection());
        expect(state.selectedKeys().has("b")).toBe(false);
        expect(state.selectedKeys().has("c")).toBe(true);
        // meta toggles (adds) on macOS.
        selectItem(state, "a", { pointerType: "mouse", metaKey: true }, state.collection());
        expect(state.selectedKeys().has("c")).toBe(true);
        expect(state.selectedKeys().has("a")).toBe(true);
      });
      dispose();
    });
  });

  it("shiftKey extends a contiguous range from the anchor", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = multipleState("replace");
        // A plain select establishes the range anchor.
        selectItem(state, "a", { pointerType: "mouse" }, state.collection());
        selectItem(state, "c", { pointerType: "mouse", shiftKey: true }, state.collection());
        expect(state.selectedKeys().has("a")).toBe(true);
        expect(state.selectedKeys().has("b")).toBe(true);
        expect(state.selectedKeys().has("c")).toBe(true);
      });
      dispose();
    });
  });

  it("a keyboard non-contiguous modifier toggles (adds) without clearing the rest", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = multipleState("replace", ["a"]);
        // keyboard + ctrl (non-Apple) toggles b on additively, even though the
        // behavior is replace — this branch fires before the replace path.
        selectItem(state, "b", { pointerType: "keyboard", ctrlKey: true }, state.collection());
        expect(state.selectedKeys().has("a")).toBe(true);
        expect(state.selectedKeys().has("b")).toBe(true);
      });
      dispose();
    });
  });

  it("touch and virtual pointerTypes toggle (no modifier keys on those devices)", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const touch = multipleState("replace", ["b"]);
        selectItem(touch, "c", { pointerType: "touch" }, touch.collection());
        expect(touch.selectedKeys().has("b")).toBe(true);
        expect(touch.selectedKeys().has("c")).toBe(true);

        const virtual = multipleState("replace", ["b"]);
        selectItem(virtual, "c", { pointerType: "virtual" }, virtual.collection());
        expect(virtual.selectedKeys().has("b")).toBe(true);
        expect(virtual.selectedKeys().has("c")).toBe(true);
      });
      dispose();
    });
  });
});

describe("selectItem — single mode", () => {
  it("re-selecting the current item deselects it when empty selection is allowed", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = createListState({
          items,
          getKey: (item) => item.key,
          selectionMode: "single",
          defaultSelectedKeys: ["a"],
        });
        selectItem(state, "a", { pointerType: "mouse" }, state.collection());
        expect(state.selectedKeys().has("a")).toBe(false);
      });
      dispose();
    });
  });

  it("selecting a different item replaces (single selection never accumulates)", () => {
    createRoot((dispose) => {
      withPlatform("Linux x86_64", () => {
        const state = createListState({
          items,
          getKey: (item) => item.key,
          selectionMode: "single",
          defaultSelectedKeys: ["a"],
        });
        // Even with a modifier, single mode replaces rather than accumulating.
        selectItem(state, "b", { pointerType: "mouse", ctrlKey: true }, state.collection());
        expect(state.selectedKeys().has("a")).toBe(false);
        expect(state.selectedKeys().has("b")).toBe(true);
      });
      dispose();
    });
  });
});
