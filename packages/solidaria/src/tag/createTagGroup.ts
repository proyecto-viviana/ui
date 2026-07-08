/**
 * TagGroup hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 *
 * Based on @react-aria/tag useTagGroup
 */

import { createEffect, onCleanup } from "solid-js";
import { createLabel } from "../label/createLabel";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { ListState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaTagGroupProps {
  /** An ID for the tag group. */
  id?: string;
  /** Whether the tag group is disabled. */
  isDisabled?: boolean;
  /** The label for the tag group. */
  label?: string;
  /** An accessible label for the tag group when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the tag group. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the tag group. */
  "aria-describedby"?: string;
  /** A description of the tag group. */
  description?: string;
  /** An error message for the tag group. */
  errorMessage?: string;
  /** Handler that is called when a user removes a tag. */
  onRemove?: (keys: Set<Key>) => void;
  /**
   * The layout direction, threaded from `useLocale`. A TagGroup navigates on the
   * inline axis, so ArrowLeft/ArrowRight flip under RTL (mirrors the direction
   * the ListKeyboardDelegate receives from useTagGroup).
   */
  direction?: "ltr" | "rtl";
}

export interface TagGroupAria {
  /** Props for the tag group container element. */
  gridProps: Record<string, unknown>;
  /** Props for the tag group's visible label (if any). */
  labelProps: Record<string, unknown>;
  /** Props for the tag group description element, if any. */
  descriptionProps: Record<string, unknown>;
  /** Props for the tag group error message element, if any. */
  errorMessageProps: Record<string, unknown>;
}

// Shared data between tag group and tags
const tagGroupData = new WeakMap<object, TagGroupData>();

interface TagGroupData {
  id: string;
  onRemove?: (keys: Set<Key>) => void;
  direction: "ltr" | "rtl";
}

export function getTagGroupData(state: ListState): TagGroupData | undefined {
  return tagGroupData.get(state);
}

/**
 * Provides the behavior and accessibility implementation for a tag group component.
 * A tag group is a focusable list of labels, categories, keywords, filters, or other items,
 * with support for keyboard navigation, selection, and removal.
 */
export function createTagGroup<T>(
  props: MaybeAccessor<AriaTagGroupProps>,
  state: ListState<T>,
  _ref?: () => HTMLElement | null,
): TagGroupAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const descriptionId = createId();
  const errorMessageId = createId();
  const getFallbackAriaLabel = () => {
    const p = getProps();
    return !p.label && !p["aria-label"] && !p["aria-labelledby"] ? "Tag list" : undefined;
  };
  const sharedData: TagGroupData = {
    id,
    get onRemove() {
      return getProps().onRemove;
    },
    get direction() {
      return getProps().direction ?? "ltr";
    },
  };

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Create label handling
  const { labelProps, fieldProps } = createLabel({
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"] ?? getFallbackAriaLabel();
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Share data with child tags before they create their aria state.
  tagGroupData.set(state, sharedData);

  // Clean up the shared state when the tag group owner is disposed.
  createEffect(() => {
    tagGroupData.set(state, sharedData);

    onCleanup(() => {
      if (tagGroupData.get(state) === sharedData) {
        tagGroupData.delete(state);
      }
    });
  });

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if (p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  const getRef = () => _ref?.() ?? null;

  // First/last navigable (non-disabled) row keys — the entry targets.
  const getFirstNavigableKey = (): Key | null => {
    const collection = state.collection();
    let candidate = collection.getFirstKey();
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyAfter(candidate);
    }
    return candidate;
  };

  const getLastNavigableKey = (): Key | null => {
    const collection = state.collection();
    let candidate = collection.getLastKey();
    while (candidate != null && state.isDisabled(candidate)) {
      candidate = collection.getKeyBefore(candidate);
    }
    return candidate;
  };

  // Focus marshalling — the grid container is a trampoline. Its roving tabIndex
  // is 0 only while `focusedKey == null` (see gridProps below), so a forward Tab
  // that reaches the standalone container lands on the container itself; move the
  // focused key onto the first/last row and the post-commit effect below pulls
  // REAL DOM focus there while the container rolls to tabIndex -1. Mirrors
  // useSelectableCollection's `onFocus` (via useTagGroup → useGridList). A
  // Shift+Tab arriving directly on a row is handled by the row's own focusable
  // onFocus, since every non-disabled row is a tab stop when nothing is focused.
  const onFocus = (e: FocusEvent) => {
    state.setFocused(true);

    // `focus` is non-bubbling in Solid, so this fires only when the container
    // itself receives focus; ignore anything that bubbled from a descendant.
    const container = e.currentTarget as HTMLElement | null;
    if (container && e.target && !container.contains(e.target as Node)) return;
    if (state.focusedKey() != null || getProps().isDisabled) return;

    const relatedTarget = e.relatedTarget as Element | null;
    // Focus arriving from an element that FOLLOWS the group in document order
    // means the user shift-tabbed backward into it → enter at the LAST row;
    // otherwise (forward Tab, or programmatic) enter at the FIRST.
    const enterKey =
      relatedTarget &&
      container &&
      container.compareDocumentPosition(relatedTarget) & Node.DOCUMENT_POSITION_FOLLOWING
        ? getLastNavigableKey()
        : getFirstNavigableKey();
    if (enterKey != null) {
      state.setFocusedKey(enterKey);
    }
  };

  const onBlur = () => {
    state.setFocused(false);
  };

  // Once the roving tabindex for the focused key has committed to the DOM, move
  // browser focus onto that row (looked up by its stable data-key), mirroring
  // useSelectableCollection. Only manage focus while it already lives inside the
  // container — i.e. the user is navigating via the trampoline — so a background
  // focusedKey change never yanks focus from elsewhere on the page.
  createEffect(() => {
    const key = state.focusedKey();
    const el = getRef();
    if (!el || key == null) return;

    const active = document.activeElement;
    if (!active || (active !== el && !el.contains(active))) return;

    const target = el.querySelector<HTMLElement>(`[data-key="${CSS.escape(String(key))}"]`);
    if (target && target !== active) {
      target.focus();
    }
  });

  return {
    get gridProps() {
      const p = getProps();
      const hasItems = state.collection().size > 0;

      return mergeProps(domProps(), fieldProps as Record<string, unknown>, {
        id,
        role: hasItems ? "grid" : "group",
        "aria-multiselectable": hasItems && state.selectionMode() === "multiple" ? true : undefined,
        "aria-atomic": false,
        "aria-relevant": "additions",
        "aria-describedby": getAriaDescribedBy(),
        "aria-disabled": p.isDisabled || undefined,
        // Roving container tabIndex mirrors useSelectableCollection: the container
        // is tabbable (0) only while nothing is focused, then rolls to -1 once a
        // row takes focus so Tab exits the group.
        tabIndex: p.isDisabled ? undefined : state.focusedKey() != null ? -1 : 0,
        onFocus,
        onBlur,
      });
    },
    get labelProps() {
      return labelProps as Record<string, unknown>;
    },
    get descriptionProps() {
      return {
        id: descriptionId,
      };
    },
    get errorMessageProps() {
      return {
        id: errorMessageId,
      };
    },
  };
}
