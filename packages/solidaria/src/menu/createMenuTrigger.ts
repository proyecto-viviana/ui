/**
 * Provides behavior and accessibility for a menu trigger.
 * Based on @react-aria/menu useMenuTrigger.
 */

import { createEffect, onCleanup, type JSX } from "solid-js";
import type { MenuTriggerState, MenuTriggerType } from "@proyecto-viviana/solid-stately";
import { createId } from "../ssr";
import { createKeyboard } from "../interactions/createKeyboard";
import { createLongPress } from "../interactions/createLongPress";
import { createContextMenu } from "../interactions/createContextMenu";
import type { CreatePressProps, PressEvent } from "../interactions/createPress";
import { createStringFormatter } from "../i18n";
import { onCloseMap } from "../overlays/createOverlayTrigger";
import { access, focusWithoutScrolling, getEventTarget, mergeProps } from "../utils";
import type { MaybeAccessor } from "../utils/reactivity";
import { menuIntlStrings } from "./intl";

export interface AriaMenuTriggerProps {
  /** The type of menu that the trigger opens. */
  type?: "menu" | "listbox";
  /** Whether the menu trigger is disabled. */
  isDisabled?: boolean;
  /** How the menu is triggered. */
  trigger?: MenuTriggerType;
  /** An ID for the menu. This is a local Solid addition. */
  id?: string;
}

export type MenuTriggerAutoFocus = boolean | "first" | "last";

export interface MenuTriggerMenuProps extends JSX.HTMLAttributes<HTMLElement> {
  /** Auto-focus strategy forwarded to `createMenu`. */
  autoFocus?: MenuTriggerAutoFocus;
  /** Close handler forwarded to `createMenu`. */
  onClose?: () => void;
}

interface MenuTriggerInteractionProps
  extends
    JSX.HTMLAttributes<HTMLElement>,
    Pick<CreatePressProps, "preventFocusOnPress" | "onPressStart" | "onPress"> {}

export interface MenuTriggerAria {
  /** Props for the menu trigger. */
  menuTriggerProps: MenuTriggerInteractionProps;
  /** Props for the menu. */
  menuProps: MenuTriggerMenuProps;
}

/** Provides behavior and accessibility for a menu trigger. */
export function createMenuTrigger(
  props: MaybeAccessor<AriaMenuTriggerProps>,
  state: MenuTriggerState,
  ref?: () => Element | null,
): MenuTriggerAria {
  const getProps = () => access(props);
  const menuId = createId(getProps().id);
  const triggerId = createId();
  const stringFormatter = createStringFormatter(menuIntlStrings, "@react-aria/menu");

  const open = (
    shouldOpen: boolean,
    event: globalThis.KeyboardEvent,
    focusStrategy: "first" | "last" = "first",
  ): boolean => {
    if (!shouldOpen || event.defaultPrevented || getProps().isDisabled) {
      return false;
    }

    state.toggle(focusStrategy);
    return true;
  };

  const { keyboardProps } = createKeyboard({
    shortcuts: {
      Enter: (event) => open(getProps().trigger !== "longPress", event, "first"),
      " ": (event) => open(getProps().trigger !== "longPress", event, "first"),
      ArrowDown: (event) => open(getProps().trigger !== "longPress", event, "first"),
      ArrowUp: (event) => open(getProps().trigger !== "longPress", event, "last"),
      "Alt+Enter": (event) => open(getProps().trigger === "longPress", event, "first"),
      "Alt+ ": (event) => open(getProps().trigger === "longPress", event, "first"),
      "Alt+ArrowDown": (event) => open(true, event, "first"),
      "Alt+ArrowUp": (event) => open(true, event, "last"),
    },
  });

  const { longPressProps } = createLongPress({
    isDisabled: () => Boolean(getProps().isDisabled || getProps().trigger !== "longPress"),
    accessibilityDescription: () => stringFormatter().format("longPressMessage"),
    onLongPressStart() {
      state.close();
    },
    onLongPress() {
      state.open("first");
    },
  });

  const pressProps: Pick<CreatePressProps, "preventFocusOnPress" | "onPressStart" | "onPress"> = {
    preventFocusOnPress: true,
    onPressStart(event: PressEvent) {
      if (
        event.pointerType !== "touch" &&
        event.pointerType !== "keyboard" &&
        !getProps().isDisabled
      ) {
        focusWithoutScrolling(event.target as HTMLElement);
        state.open(event.pointerType === "virtual" ? "first" : null);
      }
    },
    onPress(event: PressEvent) {
      if (event.pointerType === "touch" && !getProps().isDisabled) {
        focusWithoutScrolling(event.target as HTMLElement);
        state.toggle();
      }
    },
  };

  const { contextMenuProps } = createContextMenu({
    onContextMenu(event) {
      const rect = event.target.getBoundingClientRect();
      state.setPoint({ x: rect.x + event.x, y: rect.y + event.y });
      state.open();
    },
  });

  createEffect(() => {
    if (
      !state.isOpen() ||
      getProps().trigger !== "contextMenu" ||
      typeof document === "undefined"
    ) {
      return;
    }

    const onMouseDown = (event: MouseEvent) => {
      if (
        (event.button === 2 || (event.button === 0 && event.ctrlKey)) &&
        getEventTarget(event) === document.body
      ) {
        state.close();
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    onCleanup(() => document.removeEventListener("mousedown", onMouseDown));
  });

  createEffect(() => {
    const element = ref?.();
    if (element) {
      onCloseMap.set(element, state.close);
    }
  });

  return {
    get menuTriggerProps() {
      const type = getProps().type ?? "menu";
      const trigger = getProps().trigger ?? "press";
      const baseProps: MenuTriggerInteractionProps = {
        "aria-haspopup": type === "menu" ? true : "listbox",
        "aria-expanded": state.isOpen(),
        "aria-controls": state.isOpen() ? menuId : undefined,
        "aria-disabled": getProps().isDisabled || undefined,
        id: triggerId,
      };

      if (trigger === "contextMenu") {
        return mergeProps(
          {
            ...baseProps,
            "aria-haspopup": undefined,
            "aria-expanded": undefined,
            "aria-controls": undefined,
          },
          contextMenuProps,
        ) as MenuTriggerInteractionProps;
      }

      return mergeProps(
        baseProps,
        trigger === "longPress" ? longPressProps : pressProps,
        keyboardProps,
      ) as MenuTriggerInteractionProps;
    },
    get menuProps() {
      return {
        id: menuId,
        "aria-labelledby": triggerId,
        autoFocus: state.focusStrategy() || true,
        onClose: state.close,
      };
    },
  };
}
