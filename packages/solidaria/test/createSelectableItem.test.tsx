/**
 * De-risking gate for createSelectableItem (Phase 1 of the press-path epic).
 *
 * Validates the action model (allowsSelection / hasAction derivation) and the
 * full press path — select-on-press-down for rows, the keyboard Space/Enter
 * split, double-click secondary actions, touch toggle, and long-press →
 * selectionBehavior 'toggle' — against the upstream useSelectableItem contract,
 * BEFORE any consumer migrates onto it.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { createRoot } from "solid-js";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { createListState, type ListState, type ListStateProps } from "../../solid-stately/src";
import {
  createSelectableItem,
  type CreateSelectableItemOptions,
  type SelectableItemAria,
} from "../src/selection/createSelectableItem";

const pointerEvent = createPointerEvent;

interface Item {
  key: string;
  label: string;
}

const items: Item[] = [
  { key: "a", label: "Apple" },
  { key: "b", label: "Banana" },
  { key: "c", label: "Cherry" },
];

afterEach(() => {
  cleanup();
});

/** Build state + hook inside a disposable reactive root for pure assertions. */
function withItem(
  options: CreateSelectableItemOptions,
  stateProps: Partial<ListStateProps<Item>>,
  fn: (api: SelectableItemAria, state: ListState<Item>) => void,
): void {
  createRoot((dispose) => {
    const state = createListState<Item>({
      items,
      getKey: (item) => item.key,
      ...stateProps,
    });
    const api = createSelectableItem(
      () => options,
      state,
      () => null,
    );
    fn(api, state);
    dispose();
  });
}

/** Render the item into the DOM and expose state + api + element. */
function renderItem(
  options: CreateSelectableItemOptions,
  stateProps: Partial<ListStateProps<Item>>,
) {
  let state!: ListState<Item>;
  let api!: SelectableItemAria;
  let el!: HTMLDivElement;
  render(() => {
    state = createListState<Item>({
      items,
      getKey: (item) => item.key,
      ...stateProps,
    });
    api = createSelectableItem(
      () => options,
      state,
      () => el,
    );
    return (
      <div ref={el} {...api.itemProps}>
        {options.key}
      </div>
    );
  });
  return {
    get state() {
      return state;
    },
    get api() {
      return api;
    },
    get el() {
      return el;
    },
  };
}

describe("createSelectableItem — action model", () => {
  it("a plain selectable row allows selection and has no action", () => {
    withItem({ key: "a" }, { selectionMode: "multiple", selectionBehavior: "replace" }, (api) => {
      expect(api.allowsSelection()).toBe(true);
      expect(api.hasAction()).toBe(false);
      expect(api.isDisabled()).toBe(false);
    });
  });

  it("selectionMode 'none' with onAction is a primary action, not selectable", () => {
    withItem({ key: "a", onAction: () => {} }, { selectionMode: "none" }, (api) => {
      expect(api.allowsSelection()).toBe(false);
      expect(api.hasAction()).toBe(true);
    });
  });

  it("highlight selection (replace) with onAction keeps selection primary and the action secondary", () => {
    withItem(
      { key: "a", onAction: () => {} },
      { selectionMode: "multiple", selectionBehavior: "replace" },
      (api) => {
        // Selectable AND has a (secondary) action — single click selects, double click acts.
        expect(api.allowsSelection()).toBe(true);
        expect(api.hasAction()).toBe(true);
      },
    );
  });

  it("checkbox selection (toggle) with onAction makes the action primary only while empty", () => {
    // Empty selection → action is primary (single click navigates).
    withItem(
      { key: "a", onAction: () => {} },
      { selectionMode: "multiple", selectionBehavior: "toggle" },
      (api) => {
        expect(api.allowsSelection()).toBe(true);
        expect(api.hasAction()).toBe(true);
      },
    );
    // With something already selected → action is no longer primary, no secondary
    // action in toggle mode, so hasAction is false (single click toggles).
    withItem(
      { key: "a", onAction: () => {} },
      {
        selectionMode: "multiple",
        selectionBehavior: "toggle",
        defaultSelectedKeys: ["b"],
      },
      (api) => {
        expect(api.allowsSelection()).toBe(true);
        expect(api.hasAction()).toBe(false);
      },
    );
  });

  it("a disabled item is non-interactive", () => {
    withItem({ key: "a" }, { selectionMode: "multiple", disabledKeys: ["a"] }, (api) => {
      expect(api.isDisabled()).toBe(true);
      expect(api.allowsSelection()).toBe(false);
      const props = api.itemProps as Record<string, unknown>;
      // No roving tabindex on a disabled item; mousedown is prevented instead.
      expect(props.tabIndex).toBeUndefined();
      expect(typeof props.onMouseDown).toBe("function");
    });
  });

  it("a link with linkBehavior 'override' is not selectable", () => {
    withItem(
      { key: "a", href: "/x", linkBehavior: "override" },
      { selectionMode: "multiple" },
      (api) => {
        expect(api.allowsSelection()).toBe(false);
      },
    );
  });

  it("exposes data-key and a roving tabindex for the focused item", () => {
    withItem({ key: "a" }, { selectionMode: "multiple" }, (api, state) => {
      const before = api.itemProps as Record<string, unknown>;
      expect(before["data-key"]).toBe("a");
      expect(before.tabIndex).toBe(-1);
      state.setFocusedKey("a");
      const after = api.itemProps as Record<string, unknown>;
      expect(after.tabIndex).toBe(0);
    });
  });
});

describe("createSelectableItem — press path", () => {
  // The createPress machinery (touch deferral, synthetic clicks) runs on timers,
  // mirroring the createPress suite's harness.
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  it("selects a row on mouse press down (replace)", () => {
    const { state, el } = renderItem(
      { key: "a" },
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );

    fireEvent(el, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
    expect(state.isSelected("a")).toBe(true);
  });

  it("toggles a row on touch (no modifier keys on touch devices)", () => {
    const { state, el } = renderItem(
      { key: "a" },
      {
        selectionMode: "multiple",
        selectionBehavior: "replace",
        defaultSelectedKeys: ["b"],
      },
    );

    fireEvent(
      el,
      pointerEvent("pointerdown", { pointerId: 1, pointerType: "touch", clientX: 0, clientY: 0 }),
    );
    fireEvent(
      el,
      pointerEvent("pointerup", { pointerId: 1, pointerType: "touch", clientX: 0, clientY: 0 }),
    );
    vi.runAllTimers();
    // Toggled additively rather than replacing.
    expect(state.isSelected("a")).toBe(true);
    expect(state.isSelected("b")).toBe(true);
  });

  it("performs the primary action on mouse press instead of selecting (checkbox, empty)", () => {
    const onAction = vi.fn();
    const { state, el } = renderItem(
      { key: "a", onAction },
      { selectionMode: "multiple", selectionBehavior: "toggle" },
    );

    fireEvent(el, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
    fireEvent(el, pointerEvent("pointerup", { pointerId: 1, pointerType: "mouse" }));
    fireEvent.click(el);
    vi.runAllTimers();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(state.isSelected("a")).toBe(false);
  });

  it("selects on Space key down", () => {
    const { state, el } = renderItem(
      { key: "a" },
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );

    fireEvent.keyDown(el, { key: " ", code: "Space" });
    expect(state.isSelected("a")).toBe(true);
  });

  it("performs the action (not selection) on Enter key up", () => {
    const onAction = vi.fn();
    const { state, el } = renderItem(
      { key: "a", onAction },
      { selectionMode: "multiple", selectionBehavior: "toggle" },
    );

    fireEvent.keyDown(el, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(el, { key: "Enter", code: "Enter" });
    vi.runAllTimers();

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(state.isSelected("a")).toBe(false);
  });

  it("performs the secondary action on double click with a mouse (replace + selectable)", () => {
    const onAction = vi.fn();
    const { el } = renderItem(
      { key: "a", onAction },
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );

    // A pointer down establishes mouse modality (and selects the row).
    fireEvent(el, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
    fireEvent.dblClick(el);
    vi.runAllTimers();

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("long-pressing with touch selects and switches selectionBehavior to 'toggle'", () => {
    const onAction = vi.fn();
    const { state, el } = renderItem(
      { key: "a", onAction },
      // selectionBehavior is controlled here (our state has no uncontrolled
      // 'replace' default), so assert the switch via the manager call.
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );
    const setSelectionBehavior = vi.spyOn(state, "setSelectionBehavior");

    fireEvent(
      el,
      pointerEvent("pointerdown", { pointerId: 1, pointerType: "touch", clientX: 0, clientY: 0 }),
    );
    vi.advanceTimersByTime(600);

    expect(setSelectionBehavior).toHaveBeenCalledWith("toggle");
    expect(state.isSelected("a")).toBe(true);
  });
});
