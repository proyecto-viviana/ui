/**
 * Provides the behavior and accessibility implementation for a menu item.
 * Based on @react-aria/menu useMenuItem.
 */

import { type JSX, type Accessor } from "solid-js";
import { createPress, type PressEvent } from "../interactions/createPress";
import { createHover } from "../interactions/createHover";
import { createFocusRing } from "../interactions/createFocusRing";
import { createSelectableItem } from "../selection/createSelectableItem";
import { mergeProps } from "../utils/mergeProps";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { getEventTarget } from "../utils/dom";
import { isVirtualClick } from "../utils/events";
import { getMenuData } from "./createMenu";
import type { MenuState, Key, Selection, SelectionMode } from "@proyecto-viviana/solid-stately";

export interface AriaMenuItemProps {
  /** The unique key for the menu item. */
  key: Key;
  /** Optional DOM id for the menu item. Defaults to the key. */
  id?: string;
  /** Whether the menu item is disabled. */
  isDisabled?: boolean;
  /** An accessible label for the menu item. */
  "aria-label"?: string;
  /** Element controlled by this menu item, for submenu triggers. */
  "aria-controls"?: string;
  /** Whether this menu item opens a submenu or subdialog. */
  "aria-haspopup"?: string | boolean;
  /** Whether the submenu or subdialog is expanded. */
  "aria-expanded"?: boolean | "true" | "false";
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

  // Computed states. `state.isDisabled` is SelectionManager.isDisabled, which
  // already respects disabledBehavior="selection"; these items stay actionable
  // while SelectionManager.canSelectItem keeps selection blocked.
  const isDisabled: Accessor<boolean> = () => {
    return Boolean(
      getData()?.isDisabled || getProps().isDisabled || state.isDisabled(getProps().key),
    );
  };

  const selectionMode: Accessor<SelectionMode> = () => {
    return state.selectionMode();
  };

  // Whether this is a link item
  const isLink = () => !!getProps().href;
  const isTrigger = () => !!getProps()["aria-haspopup"];

  const selectableItem = createSelectableItem(
    () => {
      const p = getProps();
      return {
        key: p.key,
        id: p.id ?? String(p.key),
        isDisabled: isDisabled(),
        isLink: isLink(),
        href: p.href,
        shouldSelectOnPressUp: true,
        allowsDifferentPressOrigin: true,
        linkBehavior: "none",
      };
    },
    state,
    () => ref?.() ?? null,
  );

  const isFocused: Accessor<boolean> = () => selectableItem.isFocused();

  const isSelected: Accessor<boolean> = () => {
    return !isTrigger() && selectableItem.isSelected();
  };

  type MenuInteraction = {
    pointerType: PressEvent["pointerType"];
    key?: string;
  };

  let interaction: MenuInteraction | null = null;
  let isMenuPressActive = false;
  let isDispatchingKeyboardClick = false;
  let isDispatchingMenuSyntheticClick = false;
  let selectionEventBeforeMenuPressUp: Selection | null = null;
  let hasSelectionEventBeforeMenuPressUp = false;
  let pendingSyntheticClickSelectionEvent: Selection | null = null;
  let suppressNextKeyboardClick = false;

  const getShouldClose = (): boolean => {
    const p = getProps();
    const explicitClose = p.closeOnSelect ?? getData()?.shouldCloseOnSelect;
    if (explicitClose !== undefined) {
      return explicitClose;
    }

    if (interaction?.pointerType === "keyboard") {
      return interaction.key === "Enter" || selectionMode() === "none" || isLink();
    }

    return selectionMode() !== "multiple" || isLink();
  };

  const performMenuAction = (event: MouseEvent) => {
    if (isDisabled()) {
      event.preventDefault();
      return;
    }

    if (suppressNextKeyboardClick && interaction == null) {
      suppressNextKeyboardClick = false;
      return;
    }

    const p = getProps();
    const key = p.key;
    const data = getData();

    // Submenu triggers open their submenu via the local item action, but do not
    // fire the parent menu onAction or close the menu.
    if (isTrigger()) {
      p.onAction?.();
      interaction = null;
      return;
    }

    // Call item-specific onAction.
    p.onAction?.();

    // Call menu-level onAction with the activated item's value, mirroring
    // useMenuItem performAction: onAction(key, item?.value).
    const item = state.collection().getItem(key);
    data?.onAction?.(key, item?.value);

    if (getShouldClose()) {
      data?.onClose?.();
    }

    interaction = null;
  };

  // Menu-specific press handling is separate from selectable-item selection,
  // matching upstream useMenuItem: useSelectableItem owns selection/focus
  // timing; the menu layer owns pressed state, different-origin release, action,
  // links, and close behavior.
  const { pressProps, isPressed } = createPress({
    get isDisabled() {
      return isDisabled();
    },
    onPressChange(isPressed) {
      isMenuPressActive = isPressed;
    },
    onPressUp(e) {
      if (e.pointerType !== "keyboard" && !isDispatchingKeyboardClick) {
        interaction = { pointerType: e.pointerType };
      }

      // Native menus allow pressing the trigger, dragging to an item, and
      // releasing to activate it. Upstream useMenuItem synthesizes a click in
      // this different-origin mouse case.
      if (e.pointerType === "mouse" && !isMenuPressActive && e.target instanceof HTMLElement) {
        const selectionEventAfterPressUp = state.selectionManager.lastSelectionEvent;
        pendingSyntheticClickSelectionEvent =
          hasSelectionEventBeforeMenuPressUp &&
          selectionEventAfterPressUp != null &&
          selectionEventAfterPressUp !== selectionEventBeforeMenuPressUp
            ? selectionEventAfterPressUp
            : null;

        isDispatchingMenuSyntheticClick = true;
        try {
          e.target.click();
        } finally {
          isDispatchingMenuSyntheticClick = false;
          hasSelectionEventBeforeMenuPressUp = false;
          selectionEventBeforeMenuPressUp = null;
          pendingSyntheticClickSelectionEvent = null;
        }
      }
    },
  });

  const captureSelectionEventBeforeMenuPressUp = () => {
    selectionEventBeforeMenuPressUp = state.selectionManager.lastSelectionEvent;
    hasSelectionEventBeforeMenuPressUp = true;
  };

  const withMenuPressUpSelectionSnapshot = <EventType extends Event>(handler: unknown) => {
    if (typeof handler !== "function") {
      return handler;
    }

    return (event: EventType) => {
      captureSelectionEventBeforeMenuPressUp();
      (handler as (event: EventType) => void)(event);
    };
  };

  const selectableItemProps = () => {
    const props = selectableItem.itemProps as Record<string, unknown>;
    const onClick = props.onClick;

    return {
      ...props,
      onPointerUp: withMenuPressUpSelectionSnapshot<PointerEvent>(props.onPointerUp),
      onMouseUp: withMenuPressUpSelectionSnapshot<MouseEvent>(props.onMouseUp),
      onClick:
        typeof onClick === "function"
          ? (event: MouseEvent) => {
              // The menu layer's upstream-compatible target.click() should activate
              // the menu item, not feed back into selectable-item virtual selection.
              if (isDispatchingMenuSyntheticClick && isVirtualClick(event)) {
                if (pendingSyntheticClickSelectionEvent != null) {
                  state.selectionManager.emitDuplicateSelectionEvent(
                    pendingSyntheticClickSelectionEvent,
                  );
                  pendingSyntheticClickSelectionEvent = null;
                }
                return;
              }

              (onClick as (event: MouseEvent) => void)(event);
            }
          : onClick,
    };
  };

  const menuPressProps = () => {
    const {
      onKeyDown: _onKeyDown,
      onKeyUp: _onKeyUp,
      ...props
    } = pressProps as Record<string, unknown>;
    return props;
  };

  const keyboardProps = {
    onKeyDown: (event: KeyboardEvent) => {
      if (isDisabled() || event.repeat) {
        return;
      }

      if (event.key !== " " && event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      interaction = { pointerType: "keyboard", key: event.key };

      const target = getEventTarget<HTMLElement>(event) ?? ref?.();
      if (target instanceof HTMLElement) {
        suppressNextKeyboardClick = true;
        isDispatchingKeyboardClick = true;
        try {
          target.click();
        } finally {
          isDispatchingKeyboardClick = false;
        }
      }
    },
    onKeyUp: (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Enter") {
        suppressNextKeyboardClick = false;
      }
    },
  };

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
      const trigger = isTrigger();

      const baseProps: Record<string, unknown> = {
        role:
          trigger
            ? "menuitem"
            : mode === "single"
            ? "menuitemradio"
            : mode === "multiple"
              ? "menuitemcheckbox"
              : "menuitem",
        id: p.id ?? String(key),
        "aria-disabled": isDisabled() || undefined,
        "aria-checked": mode !== "none" && !trigger ? selected : undefined,
        "aria-label": ariaLabel,
        "aria-labelledby": !ariaLabel ? labelId : undefined,
        "aria-describedby": [descriptionId, keyboardId].filter(Boolean).join(" "),
        "aria-controls": p["aria-controls"],
        "aria-haspopup": p["aria-haspopup"],
        "aria-expanded": p["aria-expanded"],
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
        selectableItemProps(),
        menuPressProps(),
        hoverProps as Record<string, unknown>,
        focusProps as Record<string, unknown>,
        keyboardProps,
        { onClick: performMenuAction },
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
