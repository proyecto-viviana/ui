/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 * Based on @react-aria/menu useMenuTrigger.
 */

import { type JSX } from "solid-js";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import type { OverlayTriggerState } from "@proyecto-viviana/solid-stately";

export interface AriaMenuTriggerProps {
  /** The type of menu that the menu trigger opens. */
  type?: "menu" | "listbox";
  /** Whether the menu trigger is disabled. */
  isDisabled?: boolean;
  /** An ID for the menu. */
  id?: string;
}

export type MenuTriggerAutoFocus = boolean | "first" | "last";

export interface MenuTriggerMenuProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Auto-focus strategy forwarded to `createMenu`. Mirrors `useMenuTrigger`. */
  autoFocus?: MenuTriggerAutoFocus;
  /** Close handler forwarded to `createMenu`. */
  onClose?: () => void;
}

export interface MenuTriggerAria {
  /** Props for the menu trigger button. */
  menuTriggerProps: JSX.HTMLAttributes<HTMLElement> & {
    onPress: () => void;
    onKeyDown: (e: KeyboardEvent) => void;
  };
  /** Props for the menu element. */
  menuProps: MenuTriggerMenuProps;
}

type MenuTriggerOverlayState = OverlayTriggerState & {
  focusStrategy?: () => "first" | "last" | null;
  open: (focusStrategy?: "first" | "last" | null) => void;
  toggle: (focusStrategy?: "first" | "last" | null) => void;
};

function openWithStrategy(state: MenuTriggerOverlayState, strategy: "first" | "last" | null): void {
  state.open(strategy);
}

/**
 * Provides the behavior and accessibility implementation for a menu trigger.
 */
export function createMenuTrigger(
  props: MaybeAccessor<AriaMenuTriggerProps>,
  state: OverlayTriggerState,
): MenuTriggerAria {
  const getProps = () => access(props);
  const menuId = createId(getProps().id);
  const triggerState = state as MenuTriggerOverlayState;

  const onPress = () => {
    if (!getProps().isDisabled) {
      triggerState.toggle();
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (getProps().isDisabled) return;

    switch (e.key) {
      case "Enter":
      case " ":
      case "ArrowDown": {
        e.preventDefault();
        if (!triggerState.isOpen()) {
          openWithStrategy(triggerState, "first");
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!triggerState.isOpen()) {
          openWithStrategy(triggerState, "last");
        }
        break;
      }
    }
  };

  return {
    get menuTriggerProps() {
      const p = getProps();
      const type = p.type ?? "menu";
      const isOpen = triggerState.isOpen();

      return {
        "aria-haspopup": type,
        "aria-expanded": isOpen,
        "aria-controls": isOpen ? menuId : undefined,
        "aria-disabled": p.isDisabled || undefined,
        onPress,
        onKeyDown,
      };
    },
    get menuProps() {
      // `focusStrategy || true` matches useMenuTrigger: mouse/press leave the
      // strategy null so the menu root is focused; keyboard open focuses first/last.
      const strategy = triggerState.focusStrategy?.() ?? null;
      return {
        id: menuId,
        autoFocus: strategy || true,
        onClose: () => triggerState.close(),
      };
    },
  };
}
