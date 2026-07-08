/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * Based on @react-aria/listbox useListBox.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { createTypeSelect } from "../selection/createTypeSelect";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaListBoxProps {
  /** An ID for the listbox. */
  id?: string;
  /** Whether the listbox is disabled. */
  isDisabled?: boolean;
  /** The label for the listbox. */
  label?: JSX.Element;
  /** An accessible label for the listbox when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the listbox. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the listbox. */
  "aria-describedby"?: string;
  /** Handler called when focus moves into the listbox. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves out of the listbox. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler called when an item is activated (pressed). */
  onAction?: (key: Key) => void;
  /** Whether focus should automatically wrap around. */
  shouldFocusWrap?: boolean;
  /** Whether selection should occur on press up. */
  shouldSelectOnPressUp?: boolean;
  /** Whether to focus items on hover. */
  shouldFocusOnHover?: boolean;
  /** Whether the listbox uses virtual scrolling. */
  isVirtualized?: boolean;
  /** Whether options should use virtual focus instead of receiving DOM focus. */
  shouldUseVirtualFocus?: boolean;
  /** The behavior of links in the collection. */
  linkBehavior?: "action" | "selection" | "override" | "none";
  /**
   * Unstable upstream override that forces items with actions to prefer
   * selection or action behavior.
   */
  UNSTABLE_itemBehavior?: "selection" | "action";
  /**
   * Whether keyboard focus movement should also update selection in single selection mode.
   * @default true
   */
  shouldSelectOnFocus?: boolean;
  /** Whether type-to-select is disabled. @default false */
  disallowTypeAhead?: boolean;
  /**
   * The primary orientation of the items. In a horizontal listbox the Left/Right
   * arrows navigate the list (the block-axis Up/Down arrows still work); in a
   * vertical listbox Left/Right are no-ops, matching upstream's
   * `ListKeyboardDelegate` for a `stack` layout.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * The text direction, used to resolve the horizontal navigation axis. In a
   * horizontal listbox, RTL flips Left/Right (Right=previous, Left=next).
   * @default "ltr"
   */
  direction?: "ltr" | "rtl";
  /**
   * Whether pressing the Escape key should clear selection in the listbox or not.
   * Most experiences should not modify this option as it eliminates a keyboard
   * user's ability to easily clear selection. Only use if the escape key is being
   * handled externally or should not trigger selection clearing contextually.
   * @default "clearSelection"
   */
  escapeKeyBehavior?: "clearSelection" | "none";
}

export interface ListBoxAria {
  /** Props for the listbox element. */
  listBoxProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the listbox's label element (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
}

// Shared data between listbox and options
const listBoxData = new WeakMap<object, ListBoxData>();

interface ListBoxData {
  id: string;
  onAction?: (key: Key) => void;
  shouldSelectOnPressUp?: boolean;
  shouldFocusOnHover?: boolean;
  isVirtualized?: boolean;
  shouldUseVirtualFocus?: boolean;
  isDisabled?: boolean;
  linkBehavior?: "action" | "selection" | "override" | "none";
  UNSTABLE_itemBehavior?: "selection" | "action";
}

export function getListBoxData(state: ListState): ListBoxData | undefined {
  return listBoxData.get(state);
}

/**
 * Whether a key should be skipped during keyboard navigation. Disabled keys only
 * block navigation under `disabledBehavior: "all"` (the default); under
 * `"selection"` they stay focusable (selection is still blocked elsewhere).
 * Mirrors `ListKeyboardDelegate.isDisabled` in React Aria, which gates the skip
 * on the resolved `disabledBehavior` from the selection manager.
 */
function isNavigationDisabled<T>(state: ListState<T>, key: Key): boolean {
  return state.isDisabled(key) && state.disabledBehavior() === "all";
}

function findNextEnabledKey<T>(
  state: ListState<T>,
  currentKey: Key | null,
  direction: "next" | "prev",
  wrap: boolean,
): Key | null {
  const collection = state.collection();
  const getAdjacentKey =
    direction === "next"
      ? (key: Key) => collection.getKeyAfter(key)
      : (key: Key) => collection.getKeyBefore(key);
  const getBoundaryKey =
    direction === "next" ? () => collection.getFirstKey() : () => collection.getLastKey();

  let key = currentKey != null ? getAdjacentKey(currentKey) : getBoundaryKey();
  while (key != null && isNavigationDisabled(state, key)) {
    key = getAdjacentKey(key);
  }

  if (key == null && wrap) {
    key = getBoundaryKey();
    while (key != null && isNavigationDisabled(state, key)) {
      key = getAdjacentKey(key);
    }
  }

  return key;
}

/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
export function createListBox<T>(
  props: MaybeAccessor<AriaListBoxProps>,
  state: ListState<T>,
  _ref?: () => HTMLElement | null,
): ListBoxAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);

  // Development-time warning for missing accessibility labels
  if (isDevEnv()) {
    const p = getProps();
    if (!p.label && !p["aria-label"] && !p["aria-labelledby"]) {
      console.warn(
        "[solidaria] A ListBox requires an aria-label or aria-labelledby attribute for accessibility.",
      );
    }
  }

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const updateSharedData = () => {
    const p = getProps();
    const selectionBehavior = state.selectionBehavior();
    let linkBehavior = p.linkBehavior ?? (selectionBehavior === "replace" ? "action" : "override");
    if (selectionBehavior === "toggle" && linkBehavior === "action") {
      linkBehavior = "override";
    }

    listBoxData.set(state, {
      id,
      onAction: p.onAction,
      shouldSelectOnPressUp: p.shouldSelectOnPressUp,
      shouldFocusOnHover: p.shouldFocusOnHover,
      isVirtualized: p.isVirtualized,
      shouldUseVirtualFocus: p.shouldUseVirtualFocus,
      isDisabled: p.isDisabled,
      linkBehavior,
      UNSTABLE_itemBehavior: p.UNSTABLE_itemBehavior,
    });
  };

  // Ensure options created in the same render pass can read parent metadata.
  updateSharedData();

  // Share data with child options
  createEffect(() => {
    updateSharedData();

    onCleanup(() => {
      listBoxData.delete(state);
    });
  });

  // Handle focus within
  const { focusWithinProps } = createFocusWithin({
    onFocusWithin: (e) => getProps().onFocus?.(e),
    onBlurWithin: (e) => getProps().onBlur?.(e),
    onFocusWithinChange: (isFocused) => {
      getProps().onFocusChange?.(isFocused);
      // Collection focus lives on the selection manager (upstream tracks it in
      // useSelectableCollection); the ListState-level setFocused may be a
      // widget-level focus state (e.g. Select's trigger focus).
      state.selectionManager.setFocused(isFocused);
    },
  });

  // Label handling
  const { labelProps, fieldProps } = createLabel({
    get id() {
      return id;
    },
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Type-to-select
  const { typeSelectProps } = createTypeSelect({
    collection: () => state.collection(),
    focusedKey: () => state.focusedKey(),
    onFocusedKeyChange: (key) => state.setFocusedKey(key),
    isKeyDisabled: (key) => state.isDisabled(key),
    get isDisabled() {
      return getProps().disallowTypeAhead ?? false;
    },
  });

  // Focus marshalling — the container is a trampoline. When a standalone
  // listbox receives DOM focus with nothing focused yet (e.g. Tab lands on the
  // container, whose roving tabIndex is 0 only while `focusedKey == null`), move
  // the focused key to the first/last option; `createSelectableItem`'s focus
  // effect then pulls REAL DOM focus onto that option and the container rolls to
  // tabIndex -1. This mirrors `useSelectableCollection`'s `onFocus`
  // (useSelectableCollection.ts:409-454) and is why upstream never needs
  // `aria-activedescendant` on a standalone listbox — real focus IS the AT
  // channel. Skipped under `shouldUseVirtualFocus` (ComboBox/Autocomplete keep
  // DOM focus on the input and drive an activedescendant via the virtual-focus
  // channel instead).
  //
  // NOTE on the guard: unlike upstream (whose selectable `onFocus` sets
  // `manager.setFocused(true)` itself and guards on `manager.isFocused`), our
  // `createFocusWithin` already flips `setFocused(true)` via `onFocusWithinChange`
  // — and mergeProps chains it BEFORE this handler — so `manager.isFocused` is
  // already true here. Guard on `focusedKey() == null` instead (only marshal when
  // no option is focused yet). `onFocus` is non-bubbling in Solid, so this fires
  // only when the container element itself receives focus, not on child focus.
  const onListBoxFocus: JSX.EventHandler<HTMLElement, FocusEvent> = (e) => {
    const p = getProps();
    if (p.isDisabled || p.shouldUseVirtualFocus) return;
    // Ignore focus events that bubbled through a portal.
    if (!e.currentTarget.contains(e.target as Node)) return;
    if (state.focusedKey() != null) return;

    const manager = state.selectionManager;
    const selectOnFocus = state.selectionBehavior() === "replace";
    const navigateToKey = (key: Key | null | undefined) => {
      if (key == null) return;
      state.setFocusedKey(key);
      if (selectOnFocus && !manager.isSelected(key)) {
        state.replaceSelection(key);
      }
    };

    const collection = state.collection();
    const relatedTarget = e.relatedTarget as Element | null;
    // Detect tab direction: if focus came from an element that FOLLOWS the
    // listbox in the document, the user is shift-tabbing backward into it, so
    // enter at the last item; otherwise enter at the first.
    if (
      relatedTarget &&
      e.currentTarget.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING
    ) {
      navigateToKey(manager.lastSelectedKey ?? collection.getLastKey());
    } else {
      navigateToKey(manager.firstSelectedKey ?? collection.getFirstKey());
    }
  };

  // Keyboard navigation
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    const p = getProps();
    if (p.isDisabled) return;

    const collection = state.collection();
    const shouldWrap = p.shouldFocusWrap ?? false;
    const shouldSelectOnFocus = p.shouldSelectOnFocus ?? true;

    switch (e.key) {
      case "ArrowDown": {
        // Only consume the key once a target exists. Mirrors
        // useSelectableCollection (ArrowDown, 211-225): preventDefault is called
        // inside `if (nextKey != null)`, so at the last item without wrap the
        // arrow is left alone to bubble (e.g. to scroll an enclosing region).
        const nextKey = findNextEnabledKey(state, state.focusedKey(), "next", shouldWrap);
        if (nextKey != null) {
          e.preventDefault();
          state.setFocusedKey(nextKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(nextKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(nextKey, collection);
          }
        }
        break;
      }
      case "ArrowUp": {
        const prevKey = findNextEnabledKey(state, state.focusedKey(), "prev", shouldWrap);
        if (prevKey != null) {
          e.preventDefault();
          state.setFocusedKey(prevKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(prevKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(prevKey, collection);
          }
        }
        break;
      }
      case "ArrowRight":
      case "ArrowLeft": {
        // Horizontal orientation promotes the inline axis to the primary
        // navigation axis. Upstream's ListKeyboardDelegate strips
        // getKeyLeftOf/getKeyRightOf for a vertical stack, so Left/Right stay
        // no-ops there; in a horizontal stack they move prev/next, flipped
        // under RTL (Right=next, Left=prev in LTR).
        if (p.orientation !== "horizontal") break;
        const isRtl = p.direction === "rtl";
        const forward = e.key === "ArrowRight" ? !isRtl : isRtl;
        const focusedKey = state.focusedKey();
        // With nothing focused, both directions enter at the first item,
        // mirroring upstream's getFirstKey() fallback for Left and Right.
        const nextKey =
          focusedKey != null
            ? findNextEnabledKey(state, focusedKey, forward ? "next" : "prev", shouldWrap)
            : findNextEnabledKey(state, null, "next", false);
        // As with the block axis, only swallow the key when it moves focus
        // (useSelectableCollection ArrowLeft/Right, 243-280).
        if (nextKey != null) {
          e.preventDefault();
          state.setFocusedKey(nextKey);
          if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(nextKey);
          } else if (e.shiftKey && state.selectionMode() === "multiple") {
            state.extendSelection(nextKey, collection);
          }
        }
        break;
      }
      case "Home": {
        // Mirror useSelectableCollection (Home, 283-285): with nothing focused,
        // Shift+Home has no anchor to extend a selection from, so leave the
        // event alone (no focus move, no preventDefault).
        if (state.focusedKey() == null && e.shiftKey) break;
        e.preventDefault();
        const firstKey = findNextEnabledKey(state, null, "next", false);
        if (firstKey != null) {
          state.setFocusedKey(firstKey);
          if (e.ctrlKey && e.shiftKey && state.selectionMode() === "multiple") {
            // Select from current to first
            state.extendSelection(firstKey, collection);
          } else if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(firstKey);
          }
        }
        break;
      }
      case "End": {
        // Mirror useSelectableCollection (End, 300-302): same anchor guard as Home.
        if (state.focusedKey() == null && e.shiftKey) break;
        e.preventDefault();
        const lastKey = findNextEnabledKey(state, null, "prev", false);
        if (lastKey != null) {
          state.setFocusedKey(lastKey);
          if (e.ctrlKey && e.shiftKey && state.selectionMode() === "multiple") {
            // Select from current to last
            state.extendSelection(lastKey, collection);
          } else if (shouldSelectOnFocus && !e.shiftKey && state.selectionMode() === "single") {
            state.replaceSelection(lastKey);
          }
        }
        break;
      }
      case " ":
      case "Enter": {
        if (e.target !== e.currentTarget) {
          break;
        }

        e.preventDefault();
        const focusedKey = state.focusedKey();
        // Activation is gated on the navigation-disabled check, not the raw
        // one: under disabledBehavior "selection" a focusable disabled option
        // still fires onAction, mirroring useSelectableItem's allowsActions
        // (manager.isDisabled is gated on "all"). Selection stays blocked —
        // toggleSelection self-guards on the raw disabled check.
        if (focusedKey != null && !isNavigationDisabled(state, focusedKey)) {
          if (state.selectionMode() !== "none") {
            state.toggleSelection(focusedKey);
          }
          p.onAction?.(focusedKey);
        }
        break;
      }
      case "a": {
        if ((e.ctrlKey || e.metaKey) && state.selectionMode() === "multiple") {
          e.preventDefault();
          state.selectAll();
        }
        break;
      }
      case "Escape": {
        // Mirror useSelectableCollection (Escape, 352-362): only clear the
        // selection — and swallow the event — when escapeKeyBehavior is
        // 'clearSelection', there is actually a selection to clear, and empty
        // selection is allowed. With escapeKeyBehavior 'none', or otherwise,
        // leave Escape alone so an enclosing overlay (popover, dialog, combobox)
        // can handle it.
        if (
          (p.escapeKeyBehavior ?? "clearSelection") === "clearSelection" &&
          !state.disallowEmptySelection() &&
          !state.isEmpty()
        ) {
          e.stopPropagation();
          e.preventDefault();
          state.clearSelection();
        }
        break;
      }
    }
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get listBoxProps() {
      const p = getProps();
      const selectionMode = state.selectionMode();
      const virtualFocus = p.shouldUseVirtualFocus ?? false;
      const focusedKey = state.focusedKey();

      // Roving container tabIndex mirrors `useSelectableCollection`
      // (useSelectableCollection.ts:581-582): with real option focus, the
      // container is tabbable (0) only while nothing is focused, then rolls to
      // -1 once focus lands on an option so Tab exits the widget. Under virtual
      // focus (ComboBox/Autocomplete) the container is NOT a tab stop at all —
      // upstream leaves `tabIndex` undefined, so the popover listbox never
      // appears in the roving trail. `aria-activedescendant` is the
      // virtual-focus AT channel and is emitted ONLY on that path — a standalone
      // listbox announces the active option through real DOM focus, so upstream
      // never sets it there.
      const tabIndex = p.isDisabled
        ? undefined
        : virtualFocus
          ? undefined
          : focusedKey != null
            ? -1
            : 0;

      const baseProps = mergeProps(
        domProps(),
        focusWithinProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        {
          role: "listbox",
          tabIndex,
          "aria-disabled": p.isDisabled || undefined,
          "aria-multiselectable": selectionMode === "multiple" ? true : undefined,
          "aria-activedescendant":
            virtualFocus && focusedKey != null ? String(focusedKey) : undefined,
          onKeyDown,
          onFocus: onListBoxFocus,
        },
      );

      // Add type-select props if enabled
      if (!p.disallowTypeAhead) {
        return mergeProps(
          baseProps,
          typeSelectProps as Record<string, unknown>,
        ) as JSX.HTMLAttributes<HTMLElement>;
      }

      return baseProps as JSX.HTMLAttributes<HTMLElement>;
    },
  };
}
