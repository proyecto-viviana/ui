/**
 * State management for menu components.
 * Based on @react-stately/menu.
 */

import { access, type MaybeAccessor } from "../utils";
import { createListState, type ListState, type ListStateProps } from "./createListState";
import type { Key } from "./types";

export interface MenuStateProps<T = unknown> extends ListStateProps<T> {
  /** Handler called when an item is activated (pressed). */
  onAction?: (key: Key) => void;
  /** Handler called when the menu should close. */
  onClose?: () => void;
}

export interface MenuState<T = unknown> extends ListState<T> {
  /** Close the menu. */
  close(): void;
}

/**
 * Creates state for a menu component.
 * Menus are single-select lists that support actions.
 */
export function createMenuState<T = unknown>(
  props: MaybeAccessor<MenuStateProps<T>>,
): MenuState<T> {
  const getProps = () => access(props);

  // Menus default to action-only items, but can opt into single or multiple selection.
  const listState = createListState<T>({
    get items() {
      return getProps().items;
    },
    get getKey() {
      return getProps().getKey;
    },
    get getTextValue() {
      return getProps().getTextValue;
    },
    get getDisabled() {
      return getProps().getDisabled;
    },
    get disabledKeys() {
      return getProps().disabledKeys;
    },
    get disabledBehavior() {
      return getProps().disabledBehavior;
    },
    get selectionMode() {
      return getProps().selectionMode ?? "none";
    },
    get disallowEmptySelection() {
      return getProps().disallowEmptySelection;
    },
    get selectedKeys() {
      if ((getProps().selectionMode ?? "none") === "none") return undefined;
      return getProps().selectedKeys;
    },
    get defaultSelectedKeys() {
      if ((getProps().selectionMode ?? "none") === "none") return undefined;
      return getProps().defaultSelectedKeys;
    },
    get onSelectionChange() {
      if ((getProps().selectionMode ?? "none") === "none") return undefined;
      return getProps().onSelectionChange;
    },
    get selectionBehavior() {
      return getProps().selectionBehavior;
    },
    get allowDuplicateSelectionEvents() {
      return getProps().allowDuplicateSelectionEvents;
    },
  });

  const close = () => {
    getProps().onClose?.();
  };

  return {
    ...listState,
    close,
  };
}

export interface MenuTriggerStateProps {
  /** Whether the menu is open (controlled). */
  isOpen?: boolean;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
}

export interface MenuTriggerState {
  /** Whether the menu is open. */
  readonly isOpen: () => boolean;
  /** Open the menu. */
  open(): void;
  /** Close the menu. */
  close(): void;
  /** Toggle the menu. */
  toggle(): void;
  /** Focus strategy for when the menu opens. */
  readonly focusStrategy: () => "first" | "last" | null;
  /** Set the focus strategy. */
  setFocusStrategy(strategy: "first" | "last" | null): void;
}

/**
 * Creates state for a menu trigger (button that opens a menu).
 * This is essentially the same as overlay trigger state but with focus strategy.
 */
export { createOverlayTriggerState as createMenuTriggerState } from "../overlays";
