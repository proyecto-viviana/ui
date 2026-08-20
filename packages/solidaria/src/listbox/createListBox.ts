/**
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 * Based on @react-aria/listbox useListBox.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { createSelectableList } from "../selection/createSelectableList";
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
  /**
   * Whether Escape and other collection-level interactions may clear the
   * selection. This is an ARIA behavior override and does not change whether
   * an option press may toggle the final selected item.
   */
  disallowEmptySelection?: boolean;
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
 * Provides the behavior and accessibility implementation for a listbox component.
 * A listbox displays a list of options and allows a user to select one or more of them.
 */
export function createListBox<T>(
  props: MaybeAccessor<AriaListBoxProps>,
  state: ListState<T>,
  ref: () => HTMLElement | null = () => null,
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
    onFocusWithinChange: (isFocused) => getProps().onFocusChange?.(isFocused),
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

  const selectableList = createSelectableList<T>({
    selectionManager: state.selectionManager,
    ref,
    get shouldFocusWrap() {
      return getProps().shouldFocusWrap;
    },
    get disallowEmptySelection() {
      return getProps().disallowEmptySelection ?? state.disallowEmptySelection();
    },
    get escapeKeyBehavior() {
      return getProps().escapeKeyBehavior;
    },
    get selectOnFocus() {
      return getProps().shouldSelectOnFocus;
    },
    get disallowTypeAhead() {
      return getProps().disallowTypeAhead;
    },
    get shouldUseVirtualFocus() {
      return getProps().shouldUseVirtualFocus;
    },
    get isVirtualized() {
      return getProps().isVirtualized;
    },
    get linkBehavior() {
      const p = getProps();
      const selectionBehavior = state.selectionBehavior();
      const behavior = p.linkBehavior ?? (selectionBehavior === "replace" ? "action" : "override");
      if (behavior === "none") {
        // Collection navigation has no "none" mode. Treat links as actions here;
        // createOption still reads "none" from the parent listbox metadata.
        return "action";
      }
      return selectionBehavior === "toggle" && behavior === "action" ? "override" : behavior;
    },
    get orientation() {
      return getProps().orientation;
    },
    get direction() {
      return getProps().direction ?? "ltr";
    },
  });

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get listBoxProps() {
      const p = getProps();
      const selectionMode = state.selectionMode();
      return mergeProps(
        domProps(),
        focusWithinProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        p.isDisabled ? {} : (selectableList.listProps as Record<string, unknown>),
        {
          role: "listbox",
          "aria-orientation": p.orientation ?? "vertical",
          "aria-disabled": p.isDisabled || undefined,
          "aria-multiselectable": selectionMode === "multiple" ? true : undefined,
        },
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
  };
}
