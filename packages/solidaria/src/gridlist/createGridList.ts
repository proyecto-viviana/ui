/**
 * createGridList - Provides accessibility for a grid list.
 * Based on @react-aria/gridlist/useGridList.
 */

import { createMemo, createEffect, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { GridState, GridCollection, Key } from "@proyecto-viviana/solid-stately";
import type { AriaGridListProps, GridListAria } from "./types";
import { scrollIntoViewport } from "../utils";
import { getInteractionModality } from "../interactions/createInteractionModality";

/**
 * Metadata stored for a grid list instance.
 */
interface GridListData {
  /** The generated ID for the grid list. */
  gridListId: string;
  /** How selection should behave when pressing an item. */
  selectionBehavior: "replace" | "toggle";
  /** Whether row selection should occur on press up. */
  shouldSelectOnPressUp: boolean;
  /** How keyboard navigation behaves within row children. */
  keyboardNavigationBehavior: "arrow" | "tab";
  /** Text direction for row-child arrow navigation. */
  direction: "ltr" | "rtl";
  /** Actions registered for the grid list. */
  actions: {
    onAction?: (key: Key) => void;
  };
}

/**
 * WeakMap to store grid list data for child components to access.
 */
const gridListDataMap = new WeakMap<object, GridListData>();

/**
 * Gets the grid list data for a given state.
 */
export function getGridListData<T extends object, C extends GridCollection<T>>(
  state: GridState<T, C>,
): GridListData | undefined {
  return gridListDataMap.get(state);
}

/**
 * Whether a key should be skipped during keyboard navigation. Disabled keys only
 * block navigation under `disabledBehavior: "all"` (the default); under
 * `"selection"` they remain focusable (selection is still blocked elsewhere).
 * Mirrors `ListKeyboardDelegate.isDisabled` in React Aria.
 */
function isNavigationDisabled<T extends object, C extends GridCollection<T>>(
  state: GridState<T, C>,
  key: Key,
): boolean {
  return state.isDisabled(key) && state.disabledBehavior === "all";
}

/**
 * Walks from `startKey` via `step` until reaching a navigable (not
 * navigation-disabled) key, mirroring React Aria's
 * `ListKeyboardDelegate.findNextNonDisabled`. The next/previous lookups and the
 * `getFirstKey`/`getLastKey` boundaries all funnel through this so arrow keys,
 * Home and End land on enabled rows only.
 */
function findNextNavigableKey<T extends object, C extends GridCollection<T>>(
  state: GridState<T, C>,
  startKey: Key | null,
  step: (key: Key) => Key | null,
): Key | null {
  let key = startKey;
  while (key != null && isNavigationDisabled(state, key)) {
    key = step(key);
  }
  return key;
}

/**
 * Creates accessibility props for a grid list.
 */
export function createGridList<T extends object, C extends GridCollection<T> = GridCollection<T>>(
  props: Accessor<AriaGridListProps>,
  state: Accessor<GridState<T, C>>,
  ref: Accessor<HTMLElement | null>,
): GridListAria {
  // Generate a unique ID for the grid list
  const gridListId = props().id ?? createId();

  // Store grid list data for child components
  const gridListData: GridListData = {
    gridListId,
    get selectionBehavior() {
      return props().selectionBehavior ?? "replace";
    },
    get shouldSelectOnPressUp() {
      return props().shouldSelectOnPressUp ?? false;
    },
    get keyboardNavigationBehavior() {
      return props().keyboardNavigationBehavior ?? "arrow";
    },
    get direction() {
      return props().direction ?? "ltr";
    },
    actions: {
      get onAction() {
        return props().onAction;
      },
    },
  };

  // Store in WeakMap using the state as key
  gridListDataMap.set(state(), gridListData);

  // Handle keyboard navigation
  const onKeyDown = (e: KeyboardEvent) => {
    const s = state();
    const p = props();
    const collection = s.collection;
    const focusedKey = s.focusedKey;

    if (p.isDisabled) return;

    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        const nextKey =
          focusedKey != null
            ? findNextNavigableKey(s, collection.getKeyAfter(focusedKey), (k) =>
                collection.getKeyAfter(k),
              )
            : findNextNavigableKey(s, collection.getFirstKey(), (k) => collection.getKeyAfter(k));
        if (nextKey != null) {
          s.setFocusedKey(nextKey);
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const prevKey =
          focusedKey != null
            ? findNextNavigableKey(s, collection.getKeyBefore(focusedKey), (k) =>
                collection.getKeyBefore(k),
              )
            : findNextNavigableKey(s, collection.getLastKey(), (k) => collection.getKeyBefore(k));
        if (prevKey != null) {
          s.setFocusedKey(prevKey);
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
        e.preventDefault();
        const isRtl = p.direction === "rtl";
        const forward = e.key === "ArrowRight" ? !isRtl : isRtl;
        const step = forward
          ? (k: Key) => collection.getKeyAfter(k)
          : (k: Key) => collection.getKeyBefore(k);
        const nextKey =
          focusedKey != null
            ? findNextNavigableKey(s, step(focusedKey), step)
            : findNextNavigableKey(s, collection.getFirstKey(), (k) => collection.getKeyAfter(k));
        if (nextKey != null) {
          s.setFocusedKey(nextKey);
        }
        break;
      }
      case "Home": {
        e.preventDefault();
        const firstKey = findNextNavigableKey(s, collection.getFirstKey(), (k) =>
          collection.getKeyAfter(k),
        );
        if (firstKey != null) {
          s.setFocusedKey(firstKey);
        }
        break;
      }
      case "End": {
        e.preventDefault();
        const lastKey = findNextNavigableKey(s, collection.getLastKey(), (k) =>
          collection.getKeyBefore(k),
        );
        if (lastKey != null) {
          s.setFocusedKey(lastKey);
        }
        break;
      }
      case "a":
      case "A": {
        if ((e.ctrlKey || e.metaKey) && s.selectionMode === "multiple") {
          e.preventDefault();
          s.selectAll();
        }
        break;
      }
      // Space (toggle selection) and Enter (onAction) are intentionally absent
      // here. Upstream's useSelectableCollection has no Space/Enter case — the
      // focused item owns both, via useSelectableItem. We follow browser focus
      // onto the focused row (the effect below), so the row's own handlers in
      // createGridListItem fire. Handling them here too would double-toggle a
      // focused row, because Solid delegates keydown and bubbles the row event
      // up to this grid handler.
      case "Escape": {
        if (s.selectionMode !== "none") {
          e.preventDefault();
          s.clearSelection();
        }
        break;
      }
    }
  };

  const onFocus = () => {
    const s = state();
    s.setFocused(true);

    // If nothing is focused, focus the first navigable item
    if (s.focusedKey == null) {
      const firstKey = findNextNavigableKey(s, s.collection.getFirstKey(), (k) =>
        s.collection.getKeyAfter(k),
      );
      if (firstKey != null) {
        s.setFocusedKey(firstKey);
      }
    }
  };

  const onBlur = () => {
    const s = state();
    s.setFocused(false);
  };

  // Mirror React Aria's useSelectableCollection: once the roving tabindex for the
  // focused key has been committed to the DOM, move browser focus onto that row
  // from a post-commit effect, looking it up by its stable data-key rather than by
  // transient tabindex. Selection and activation live on the row
  // (createGridListItem) to match upstream, so keyboard nav has to carry focus
  // there for the row's Space/Enter handlers to act on.
  createEffect(() => {
    const s = state();
    const key = s.focusedKey;
    const el = ref();
    if (!el || key == null) {
      return;
    }

    // Only manage focus while it already lives inside the grid — i.e. the user is
    // navigating with the keyboard. Gate on the physical position of browser focus
    // rather than the grid's logical isFocused signal: focus can land directly on a
    // row (a pointer click) without ever firing the grid's own focus handler, and
    // the contains() check keeps us from yanking focus back from elsewhere on the
    // page when the focused key changes from a background interaction.
    const active = document.activeElement;
    if (!active || (active !== el && !el.contains(active))) {
      return;
    }

    const target = el.querySelector<HTMLElement>(`[data-key="${key}"]`);
    if (target && target !== active) {
      target.focus();

      // Reveal the newly focused row when navigating with the keyboard, mirroring
      // useSelectableCollection. Pointer-driven focus changes should not shift the
      // scroll position under the user's finger.
      if (getInteractionModality() !== "pointer") {
        scrollIntoViewport(target, { containingElement: el });
      }
    }
  });

  const gridProps = createMemo(() => {
    const p = props();
    const s = state();

    const baseProps: Record<string, unknown> = {
      role: "grid",
      id: gridListId,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      "aria-multiselectable": s.selectionMode === "multiple" ? true : undefined,
      "aria-disabled": p.isDisabled || undefined,
      tabIndex: p.isDisabled ? undefined : 0,
      onKeyDown,
      onFocus,
      onBlur,
    };

    // Add row count for virtualized lists
    if (p.isVirtualized) {
      baseProps["aria-rowcount"] = s.collection.rowCount;
    }

    return baseProps as JSX.HTMLAttributes<HTMLElement>;
  });

  return {
    get gridProps() {
      return gridProps();
    },
  };
}
