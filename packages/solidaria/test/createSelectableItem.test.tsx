/**
 * De-risking gate for createSelectableItem (Phase 1 of the press-path epic).
 *
 * Validates the action model (allowsSelection / hasAction derivation) and the
 * full press path — select-on-press-down for rows, the keyboard Space/Enter
 * split, double-click secondary actions, touch toggle, and long-press →
 * selectionBehavior 'toggle' — against the upstream useSelectableItem contract,
 * BEFORE any consumer migrates onto it.
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import { render, cleanup, fireEvent } from "@solidjs/testing-library";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { createListState, type ListState, type ListStateProps } from "../../solid-stately/src";
import {
  createSelectableItem,
  type CreateSelectableItemOptions,
  type LinkBehavior,
  type SelectableItemAria,
  type SelectableItemState,
} from "../src/selection/createSelectableItem";
import { RouterProvider } from "../src/utils/openLink";

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

/** Render the item onto a real `<a href>` with a collection role override. */
function renderLinkItem(
  options: CreateSelectableItemOptions,
  stateProps: Partial<ListStateProps<Item>>,
) {
  let el!: HTMLAnchorElement;
  let state!: ListState<Item>;
  render(() => {
    state = createListState<Item>({
      items,
      getKey: (item) => item.key,
      ...stateProps,
    });
    const api = createSelectableItem(
      () => options,
      state,
      () => el,
    );
    return (
      <a ref={el} href="#target" role="option" {...api.itemProps}>
        {options.key}
      </a>
    );
  });
  return {
    get el() {
      return el;
    },
    get state() {
      return state;
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

  it('disabledBehavior "selection" blocks selection without disabling actions', () => {
    withItem(
      { key: "a", onAction: () => {} },
      { selectionMode: "multiple", disabledKeys: ["a"], disabledBehavior: "selection" },
      (api) => {
        expect(api.isDisabled()).toBe(false);
        expect(api.allowsSelection()).toBe(false);
        expect(api.hasAction()).toBe(true);
      },
    );
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

  it("defers mouse selection to press up when shouldSelectOnPressUp is true", () => {
    const { state, el } = renderItem(
      { key: "a", shouldSelectOnPressUp: true },
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );

    fireEvent(el, pointerEvent("pointerdown", { pointerId: 1, pointerType: "mouse" }));
    expect(state.isSelected("a")).toBe(false);

    fireEvent(el, pointerEvent("pointerup", { pointerId: 1, pointerType: "mouse" }));
    fireEvent.click(el);
    vi.runAllTimers();

    expect(state.isSelected("a")).toBe(true);
  });

  it("allows press-up selection when the press started on a different target", () => {
    const { state, el } = renderItem(
      { key: "a", shouldSelectOnPressUp: true, allowsDifferentPressOrigin: true },
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );

    fireEvent(el, pointerEvent("pointerup", { pointerId: 1, pointerType: "mouse" }));

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
      { selectionMode: "multiple", selectionBehavior: "replace" },
    );
    const setSelectionBehavior = vi.spyOn(state, "setSelectionBehavior");

    expect(state.selectionBehavior()).toBe("replace");

    fireEvent(
      el,
      pointerEvent("pointerdown", { pointerId: 1, pointerType: "touch", clientX: 0, clientY: 0 }),
    );
    vi.advanceTimersByTime(600);

    expect(setSelectionBehavior).toHaveBeenCalledWith("toggle");
    expect(state.isSelected("a")).toBe(true);
    expect(state.selectionBehavior()).toBe("toggle");

    // Deselecting all items resets selectionBehavior back to replace
    state.setSelectedKeys([]);
    flush();
    expect(state.selectionBehavior()).toBe("replace");
  });
});

describe("createSelectableItem — link activation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  /**
   * Counts navigations rather than handler calls. A capture-phase document
   * listener sees every click the item dispatches; the ones that survive
   * `preventDefault` are the ones the browser would follow, so `opened` is the
   * navigation count and `total` is how many clicks the path produced.
   * `selected` is there to tell "the key did nothing" from "the key selected".
   */
  function activate(linkBehavior: LinkBehavior, key: string) {
    const clicks: MouseEvent[] = [];
    const record = (e: Event) => clicks.push(e as MouseEvent);
    document.addEventListener("click", record, true);
    try {
      const { el, state } = renderLinkItem(
        { key: "a", href: "#target", isLink: true, linkBehavior },
        { selectionMode: "multiple" },
      );

      el.focus();
      fireEvent.keyDown(el, { key });
      fireEvent.keyUp(el, { key });

      return {
        total: clicks.length,
        opened: clicks.filter((e) => !e.defaultPrevented).length,
        selected: state.isSelected("a"),
      };
    } finally {
      document.removeEventListener("click", record, true);
      // Two activations in one test each get their own item.
      cleanup();
    }
  }

  it("navigates exactly once when Space activates a role-overridden link", () => {
    // Both halves of the upstream mechanism have to agree. `openLink` sets its
    // `isOpening` flag while it dispatches (openLink.mjs:80-83), and the item's
    // own click guard reads it (useSelectableItem.mjs:254) to decide whether the
    // click is the one *it* asked for. `usePress` therefore passes `false` for
    // its own link click (usePress.mjs:320) so the guard suppresses it.
    //
    // Two clicks are dispatched — the item's own, from `onSelect`'s `openLink`,
    // and createPress's link path — and exactly one survives. `onSelect` puts
    // the previous selection back before it returns (`useSelectableItem.mjs:43`,
    // ours `:288-291`), so a `'selection'` link navigates without selecting.
    expect(activate("selection", " ")).toEqual({ total: 2, opened: 1, selected: false });
  });

  it("navigates on Enter and not on Space under linkBehavior 'override'", () => {
    // The consequence of the same `false` outside `linkBehavior: 'selection'`,
    // pinned because it is a behaviour change in its own right and not a side
    // effect of the test above. `'override'` is what a listbox defaults to
    // whenever `selectionBehavior` is `'toggle'` (`createListBox.ts:164-166`),
    // so it is the configuration most consumers get.
    //
    // Space produces no navigation: an `'override'` link is not selectable
    // (`allowsSelection` excludes `isLinkOverride`, `useSelectableItem.mjs:104`,
    // ours `:230`), `onSelect` returns early for it (`:45`, ours `:294`), and
    // `onPress` never reaches `performAction` because `isActionKey` is
    // Enter-only (`:307-311`, ours `:185`). The one click is createPress's, and
    // the item's own guard cancels it. Enter is the navigation key here, and
    // react-aria 3.52.0 splits the two keys the same way.
    expect(activate("override", " ")).toEqual({ total: 1, opened: 0, selected: false });
    expect(activate("override", "Enter")).toEqual({ total: 1, opened: 1, selected: false });
  });

  it("navigates on Enter and selects on Space under linkBehavior 'action'", () => {
    // Same split under the `createSelectableItem` default, `'action'`
    // (`useSelectableItem.mjs:31`, ours `:202`), where the item *is* selectable:
    // Space reaches `selectItem` through `onSelect` and opens nothing, Enter
    // runs `performAction`'s `openLink`.
    expect(activate("action", " ")).toEqual({ total: 1, opened: 0, selected: true });
    expect(activate("action", "Enter")).toEqual({ total: 1, opened: 1, selected: false });
  });
});

describe("createSelectableItem — approved link boundary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  function pressHandlers() {
    return {
      onPressStart: vi.fn(),
      onPress: vi.fn(),
      onPressEnd: vi.fn(),
      onPressChange: vi.fn(),
      onPressUp: vi.fn(),
      onClick: vi.fn(),
    };
  }

  function expectUnused(handlers: Record<string, ReturnType<typeof vi.fn>>) {
    for (const handler of Object.values(handlers)) {
      expect(handler).not.toHaveBeenCalled();
    }
  }

  function pressKey(el: HTMLElement, key: string) {
    el.focus();
    fireEvent.keyDown(el, { key });
    fireEvent.keyUp(el, { key });
  }

  function firePointer(el: HTMLElement) {
    const at = { pointerId: 1, pointerType: "mouse" as const, clientX: 2, clientY: 2 };
    fireEvent(el, pointerEvent("pointerdown", at));
    fireEvent(el, pointerEvent("pointerup", at));
    fireEvent.click(el);
  }

  function managerWithItemProps(
    state: ListState<Item>,
    itemProps: Record<string, unknown>,
  ): SelectableItemState<Item> {
    return new Proxy(state, {
      get(target, prop, receiver) {
        if (prop === "getItemProps") return () => itemProps;
        if (prop === "isLink") return () => true;
        const value = Reflect.get(target, prop, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }) as unknown as SelectableItemState<Item>;
  }

  /** Grid, tree, and table pass this shape: selection surface, no SelectionManager. */
  function structuralAdapter(
    state: ListState<Item>,
    canSelect: boolean,
  ): SelectableItemState<Item> {
    return {
      collection: () => state.collection(),
      isFocused: () => state.isFocused(),
      setFocused: (focused) => state.setFocused(focused),
      focusedKey: () => state.focusedKey(),
      childFocusStrategy: () => state.childFocusStrategy(),
      setFocusedKey: (key, strategy) => state.setFocusedKey(key, strategy),
      selectionMode: () => state.selectionMode(),
      selectionBehavior: () => state.selectionBehavior(),
      disallowEmptySelection: () => state.disallowEmptySelection(),
      selectedKeys: () => state.selectedKeys(),
      disabledKeys: () => state.disabledKeys(),
      disabledBehavior: () => state.disabledBehavior(),
      isEmpty: () => state.isEmpty(),
      isSelectAll: () => state.isSelectAll(),
      isSelected: (key) => state.isSelected(key),
      isDisabled: (key) => state.isDisabled(key),
      canSelectItem: () => canSelect,
      setSelectionBehavior: (behavior) => state.setSelectionBehavior(behavior),
      toggleSelection: (key) => state.toggleSelection(key),
      replaceSelection: (key) => state.replaceSelection(key),
      setSelectedKeys: (keys) => state.setSelectedKeys(keys),
      selectAll: () => state.selectAll(),
      clearSelection: () => state.clearSelection(),
      toggleSelectAll: () => state.toggleSelectAll(),
      extendSelection: (toKey) => state.extendSelection(toKey),
    };
  }

  function renderRouted(args: {
    options: CreateSelectableItemOptions;
    stateProps?: Partial<ListStateProps<Item>>;
    navigate?: (href: string, routerOptions?: Record<string, unknown>) => void;
    manager?: (state: ListState<Item>) => SelectableItemState<Item>;
    anchorHref?: string;
  }) {
    const navigate = args.navigate ?? vi.fn();
    let state!: ListState<Item>;
    let el!: HTMLElement;

    function Row() {
      state = createListState<Item>({
        items,
        getKey: (item) => item.key,
        selectionMode: "multiple",
        ...args.stateProps,
      });
      const manager = args.manager?.(state) ?? state;
      const api = createSelectableItem(
        () => args.options,
        manager,
        () => el,
      );
      if (args.anchorHref != null) {
        return (
          <a ref={(node) => (el = node)} href={args.anchorHref} role="option" {...api.itemProps}>
            {String(args.options.key)}
          </a>
        );
      }
      return (
        <div ref={(node) => (el = node)} {...api.itemProps}>
          {String(args.options.key)}
        </div>
      );
    }

    render(() => (
      <RouterProvider navigate={navigate}>
        <Row />
      </RouterProvider>
    ));

    return {
      navigate,
      get state() {
        return state;
      },
      get el() {
        return el;
      },
    };
  }

  it("linkBehavior 'none' does not select, client-navigate, or cancel the click", () => {
    const navigate = vi.fn();
    const clicks: MouseEvent[] = [];
    const record = (event: Event) => clicks.push(event as MouseEvent);
    document.addEventListener("click", record, true);
    try {
      const { el, state } = renderRouted({
        navigate,
        anchorHref: "#target",
        options: { key: "a", isLink: true, href: "#target", linkBehavior: "none" },
      });
      pressKey(el, " ");
      pressKey(el, "Enter");
      expect(state.isSelected("a")).toBe(false);
      expect(navigate).not.toHaveBeenCalled();
      expect(clicks.length).toBeGreaterThan(0);
      expect(clicks.every((event) => !event.defaultPrevented)).toBe(true);
    } finally {
      document.removeEventListener("click", record, true);
    }
  });

  it("sends option href and routerOptions to the client router ahead of getItemProps", () => {
    const navigate = vi.fn();
    const handlers = pressHandlers();
    const { el } = renderRouted({
      navigate,
      options: {
        key: "a",
        isLink: true,
        href: "/from-options",
        routerOptions: { replace: true, source: "options" },
        linkBehavior: "action",
      },
      manager: (state) =>
        managerWithItemProps(state, {
          href: "/from-manager",
          routerOptions: { replace: false, source: "manager" },
          ...handlers,
        }),
    });
    firePointer(el);
    pressKey(el, "Enter");
    expect(navigate).toHaveBeenCalledWith("/from-options", { replace: true, source: "options" });
    expectUnused(handlers);
  });

  it("reads href and routerOptions from manager.getItemProps and does not call its press handlers", () => {
    const navigate = vi.fn();
    const handlers = pressHandlers();
    const { el } = renderRouted({
      navigate,
      options: { key: "a", linkBehavior: "action" },
      manager: (state) =>
        managerWithItemProps(state, {
          href: "/from-manager",
          routerOptions: { replace: true, source: "manager" },
          ...handlers,
        }),
    });
    firePointer(el);
    pressKey(el, "Enter");
    expect(navigate.mock.calls.length).toBeGreaterThan(0);
    for (const call of navigate.mock.calls) {
      expect(call).toEqual(["/from-manager", { replace: true, source: "manager" }]);
    }
    expectUnused(handlers);
  });

  it("reads href and routerOptions from selectionManager.getItemProps when the manager omits them", () => {
    const navigate = vi.fn();
    const handlers = pressHandlers();
    const { el, state } = renderRouted({
      navigate,
      options: { key: "a", linkBehavior: "selection" },
      manager: (list) => {
        list.selectionManager.isLink = () => true;
        list.selectionManager.getItemProps = () => ({
          href: "/from-selection-manager",
          routerOptions: { replace: true, source: "selectionManager" },
          ...handlers,
        });
        return list as unknown as SelectableItemState<Item>;
      },
    });
    pressKey(el, " ");
    expect(state.isSelected("a")).toBe(false);
    expect(navigate).toHaveBeenCalledWith("/from-selection-manager", {
      replace: true,
      source: "selectionManager",
    });
    expectUnused(handlers);
  });

  it("falls back to the anchor href when options and item props omit one", () => {
    const navigate = vi.fn();
    const { el, state } = renderRouted({
      navigate,
      anchorHref: "#target",
      options: { key: "a", isLink: true, linkBehavior: "selection" },
    });
    pressKey(el, " ");
    expect(state.isSelected("a")).toBe(false);
    expect(navigate).toHaveBeenCalledWith((el as HTMLAnchorElement).href, undefined);
  });

  it("a structural adapter blocks selection through canSelectItem and still opens the option link", () => {
    const navigate = vi.fn();
    const onAction = vi.fn();
    const { el, state } = renderRouted({
      navigate,
      options: {
        key: "a",
        isLink: true,
        href: "/from-adapter",
        routerOptions: { replace: true },
        linkBehavior: "action",
        onAction,
      },
      manager: (list) => structuralAdapter(list, false),
    });
    pressKey(el, " ");
    expect(state.isSelected("a")).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
    expect(onAction).not.toHaveBeenCalled();
    pressKey(el, "Enter");
    expect(state.isSelected("a")).toBe(false);
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/from-adapter", { replace: true });
  });

  it("a structural adapter selects on Space when canSelectItem allows it", () => {
    const { el, state } = renderRouted({
      options: { key: "a" },
      manager: (list) => structuralAdapter(list, true),
    });
    pressKey(el, " ");
    expect(state.isSelected("a")).toBe(true);
  });
});

describe("createSelectableItem — virtual focus", () => {
  function renderVirtualFocusList() {
    let state!: ListState<Item>;
    let itemAEl!: HTMLDivElement;
    let itemBEl!: HTMLDivElement;
    let inputEl!: HTMLInputElement;

    render(() => {
      state = createListState<Item>({
        items,
        getKey: (item) => item.key,
      });

      const apiA = createSelectableItem(
        () => ({ key: "a", id: "item-a", shouldUseVirtualFocus: true }),
        state,
        () => itemAEl,
      );

      const apiB = createSelectableItem(
        () => ({ key: "b", id: "item-b", shouldUseVirtualFocus: true }),
        state,
        () => itemBEl,
      );

      return (
        <div>
          <input ref={(el) => (inputEl = el)} data-testid="input" />
          <div ref={(el) => (itemAEl = el)} id="item-a" data-testid="item-a" {...apiA.itemProps}>
            Apple
          </div>
          <div ref={(el) => (itemBEl = el)} id="item-b" data-testid="item-b" {...apiB.itemProps}>
            Banana
          </div>
        </div>
      );
    });

    return { state, inputEl, itemAEl, itemBEl };
  }

  it("dispatches virtual focus without moving real DOM focus to the item", () => {
    const { state, inputEl, itemAEl } = renderVirtualFocusList();
    inputEl.focus();
    expect(document.activeElement).toBe(inputEl);

    const events: string[] = [];
    itemAEl.addEventListener("focus", () => events.push("focus"));
    itemAEl.addEventListener("focusin", () => events.push("focusin"));

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("a");
    flush();

    expect(events).toEqual(["focus", "focusin"]);
    expect(document.activeElement).toBe(inputEl);
  });

  it("dispatches virtual blur and focus in upstream order when switching focused items", () => {
    const { state, inputEl, itemAEl, itemBEl } = renderVirtualFocusList();
    inputEl.focus();

    state.selectionManager.setFocused(true);
    state.selectionManager.setFocusedKey("a");
    flush();
    inputEl.setAttribute("aria-activedescendant", "item-a");

    const events: Array<{ type: string; target: string; relatedTarget: string | null }> = [];
    const record = (targetName: string) => (e: Event) => {
      const fe = e as FocusEvent;
      events.push({
        type: fe.type,
        target: targetName,
        relatedTarget: (fe.relatedTarget as HTMLElement)?.id ?? null,
      });
    };

    itemAEl.addEventListener("blur", record("item-a"));
    itemAEl.addEventListener("focusout", record("item-a"));
    itemBEl.addEventListener("focus", record("item-b"));
    itemBEl.addEventListener("focusin", record("item-b"));

    state.selectionManager.setFocusedKey("b");
    flush();

    expect(events).toEqual([
      { type: "blur", target: "item-a", relatedTarget: "item-b" },
      { type: "focusout", target: "item-a", relatedTarget: "item-b" },
      { type: "focus", target: "item-b", relatedTarget: "item-a" },
      { type: "focusin", target: "item-b", relatedTarget: "item-a" },
    ]);
    expect(document.activeElement).toBe(inputEl);
  });
});
