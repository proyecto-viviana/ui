/**
 * Provides the behavior and accessibility implementation for a menu item.
 * Based on @react-aria/menu useMenuItem.
 */

import { createEffect, type JSX, type Accessor } from "solid-js";
import { createPress } from "../interactions/createPress";
import { createHover } from "../interactions/createHover";
import { createFocusRing } from "../interactions/createFocusRing";
import { mergeProps } from "../utils/mergeProps";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { focusSafely } from "../utils/focus";
import { getOwnerDocument } from "../utils/dom";
import { getMenuData } from "./createMenu";
import type { MenuState, Key, SelectionMode } from "@proyecto-viviana/solid-stately";

export interface AriaMenuItemProps {
  /** The unique key for the menu item. */
  key: Key;
  /** Whether the menu item is disabled. */
  isDisabled?: boolean;
  /** An accessible label for the menu item. */
  "aria-label"?: string;
  /** Handler called when the menu item is selected. */
  onAction?: () => void;
  /** Whether to close the menu when this item is selected. */
  closeOnSelect?: boolean;
  /** A URL to link to. Turns the menu item into a link. */
  href?: string;
  /** The target window for the link. */
  target?: string;
  /** The relationship between the linked resource and the current page. */
  rel?: string;
  /** Causes the browser to download the linked URL. A string may be provided to suggest a file name. */
  download?: boolean | string;
}

export interface MenuItemAria {
  /** Props for the menu item element. */
  menuItemProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the label text inside the menu item. */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the description text inside the menu item. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the keyboard shortcut inside the menu item. */
  keyboardShortcutProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the menu item is currently focused. */
  isFocused: Accessor<boolean>;
  /** Whether the menu item is keyboard focused. */
  isFocusVisible: Accessor<boolean>;
  /** Whether the menu item is currently pressed. */
  isPressed: Accessor<boolean>;
  /** Whether the menu item is disabled. */
  isDisabled: Accessor<boolean>;
  /** Whether the menu item is selected. */
  isSelected: Accessor<boolean>;
  /** The parent menu selection mode. */
  selectionMode: Accessor<SelectionMode>;
}

/**
 * Provides the behavior and accessibility implementation for a menu item.
 */
export function createMenuItem<T>(
  props: MaybeAccessor<AriaMenuItemProps>,
  state: MenuState<T>,
  ref?: () => HTMLElement | null,
): MenuItemAria {
  const getProps = () => access(props);

  // Get shared data from menu
  const getData = () => getMenuData(state);

  // Computed states
  const isDisabled: Accessor<boolean> = () => {
    return Boolean(
      getData()?.isDisabled || getProps().isDisabled || state.isDisabled(getProps().key),
    );
  };

  const isFocused: Accessor<boolean> = () => {
    return state.focusedKey() === getProps().key;
  };

  // Move real DOM focus onto the associated node when this item becomes the
  // collection's focused key. The tabIndex 0/-1 swap below is only the
  // declarative half of roving tabindex; without imperatively focusing the
  // element here, keyboard navigation updates state but never moves the actual
  // focus or the assistive-technology cursor. Mirrors @react-aria/selection's
  // useSelectableItem, which focuses the item element when `key === manager.focusedKey`.
  createEffect(() => {
    if (!isFocused() || !state.isFocused()) return;

    const element = ref?.();
    if (!element) return;

    // Avoid redundantly re-focusing an element that already has focus.
    const ownerDocument = getOwnerDocument(element);
    if (ownerDocument.activeElement !== element) {
      focusSafely(element);
    }
  });

  const isSelected: Accessor<boolean> = () => {
    return selectionMode() !== "none" && state.isSelected(getProps().key);
  };

  const selectionMode: Accessor<SelectionMode> = () => {
    return state.selectionMode();
  };

  // Whether this is a link item
  const isLink = () => !!getProps().href;

  // Handle press
  const { pressProps, isPressed } = createPress({
    get isDisabled() {
      return isDisabled();
    },
    onPress() {
      const p = getProps();
      const key = p.key;
      const data = getData();

      state.select(key, undefined, state.collection());

      // Call item-specific onAction
      p.onAction?.();

      // Call menu-level onAction with the activated item's value, mirroring
      // useMenuItem performAction: onAction(key, item?.value).
      const item = state.collection().getItem(key);
      data?.onAction?.(key, item?.value);

      // Close menu if closeOnSelect is not explicitly false
      // For link items, default to closing the menu
      if (p.closeOnSelect !== false) {
        data?.onClose?.();
      }
    },
  });

  // Handle hover
  const { hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
    onHoverStart() {
      state.setFocusedKey(getProps().key);
    },
  });

  // Handle focus ring
  const { isFocusVisible, focusProps } = createFocusRing();

  // Generate unique IDs for label and description
  const labelId = `${getProps().key}-label`;
  const descriptionId = `${getProps().key}-desc`;
  const keyboardId = `${getProps().key}-kbd`;

  return {
    get menuItemProps() {
      const p = getProps();
      const key = p.key;
      const ariaLabel = p["aria-label"];
      const mode = selectionMode();
      const selected = isSelected();

      const baseProps: Record<string, unknown> = {
        role:
          mode === "single"
            ? "menuitemradio"
            : mode === "multiple"
              ? "menuitemcheckbox"
              : "menuitem",
        id: String(key),
        "aria-disabled": isDisabled() || undefined,
        "aria-checked": mode !== "none" ? selected : undefined,
        "aria-label": ariaLabel,
        "aria-labelledby": !ariaLabel ? labelId : undefined,
        "aria-describedby": descriptionId,
        tabIndex: isFocused() ? 0 : -1,
        "data-selected": selected || undefined,
        "data-focused": isFocused() || undefined,
        "data-focus-visible": isFocusVisible() || undefined,
        "data-pressed": isPressed() || undefined,
        "data-disabled": isDisabled() || undefined,
      };

      // Add link props when href is present
      if (isLink()) {
        baseProps.href = isDisabled() ? undefined : p.href;
        if (p.target) baseProps.target = p.target;
        if (p.rel) baseProps.rel = p.rel;
        if (p.download != null && p.download !== false) {
          baseProps.download = p.download === true ? "" : p.download;
        }
      }

      return mergeProps(
        pressProps as Record<string, unknown>,
        hoverProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
        baseProps,
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
    labelProps: {
      id: labelId,
    },
    descriptionProps: {
      id: descriptionId,
    },
    keyboardShortcutProps: {
      id: keyboardId,
      "aria-hidden": true,
    },
    isFocused,
    isFocusVisible: () => isFocused() && isFocusVisible(),
    isPressed,
    isDisabled,
    isSelected,
    selectionMode,
  };
}
