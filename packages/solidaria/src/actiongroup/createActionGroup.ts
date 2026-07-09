import { onCleanup, type JSX, type Accessor } from "solid-js";
import { createButton } from "../button";
import {
  filterDOMProps,
  getEventTarget,
  mergeProps,
  nodeContains,
  isFocusable,
  focusSafely,
} from "../utils";
import { useLocale } from "../i18n";
import type { Orientation } from "../toolbar";
import type { Key, ListState } from "@proyecto-viviana/solid-stately";

export interface AriaActionGroupProps<T = unknown> {
  /** List items (optional, parity with React Aria prop shape). */
  items?: T[];
  /** Whether the whole action group is disabled. */
  isDisabled?: boolean;
  /** Group orientation. */
  orientation?: Orientation;
  /** Accessible label. */
  "aria-label"?: string;
  /** Labelled-by id. */
  "aria-labelledby"?: string;
  /** Handler called when an item action is triggered. */
  onAction?: (key: Key) => void;
}

export interface ActionGroupAria {
  actionGroupProps: JSX.HTMLAttributes<HTMLElement>;
}

export interface AriaActionGroupItemProps {
  key: Key;
}

export interface ActionGroupItemAria {
  buttonProps: JSX.HTMLAttributes<HTMLElement>;
}

interface ActionGroupData {
  onAction?: (key: Key) => void;
}

const actionGroupData = new WeakMap<object, ActionGroupData>();

const GROUP_ROLE_BY_MODE = {
  none: "toolbar",
  single: "radiogroup",
  multiple: "toolbar",
} as const;

const ITEM_ROLE_BY_MODE = {
  none: undefined,
  single: "radio",
  multiple: "checkbox",
} as const;

function isActionGroupDisabled<T>(props: AriaActionGroupProps<T>, state: ListState<T>): boolean {
  if (props.isDisabled) return true;
  const keys = [...state.collection().getKeys()];
  if (keys.length === 0) return true;
  return !keys.some((key) => !state.isDisabled(key));
}

export function createActionGroup<T>(
  props: AriaActionGroupProps<T>,
  state: ListState<T>,
  _ref?: Accessor<HTMLElement | null>,
): ActionGroupAria {
  const locale = useLocale();
  let groupRef: HTMLElement | undefined;
  const applyRoleAttributes = (): void => {
    if (!groupRef) return;
    const selectionMode = state.selectionMode();
    const mappedRole = GROUP_ROLE_BY_MODE[selectionMode];
    const nestedToolbar = Boolean(groupRef.parentElement?.closest('[role="toolbar"]'));
    const role = mappedRole === "toolbar" && nestedToolbar ? "group" : mappedRole;
    groupRef.setAttribute("role", role);
    if (mappedRole === "toolbar" && !nestedToolbar) {
      groupRef.setAttribute("aria-orientation", props.orientation ?? "horizontal");
    } else {
      groupRef.removeAttribute("aria-orientation");
    }
  };

  const getFocusableItems = (root: HTMLElement): HTMLElement[] => {
    const out: HTMLElement[] = [];
    const pushIfFocusable = (el: Element | null | undefined): void => {
      if (!el || !(el instanceof HTMLElement)) return;
      if (isFocusable(el) && el.getAttribute("aria-disabled") !== "true") {
        out.push(el);
      }
    };

    pushIfFocusable(root);
    for (const node of root.querySelectorAll("*")) {
      pushIfFocusable(node);
    }
    return out;
  };

  const focusRelative = (
    root: HTMLElement,
    direction: "next" | "previous",
  ): HTMLElement | null => {
    const focusables = getFocusableItems(root);
    if (focusables.length === 0) return null;

    const active = root.ownerDocument.activeElement as HTMLElement | null;
    const currentIndex = active ? focusables.indexOf(active) : -1;
    const delta = direction === "next" ? 1 : -1;
    const nextIndex =
      currentIndex === -1
        ? direction === "next"
          ? 0
          : focusables.length - 1
        : (currentIndex + delta + focusables.length) % focusables.length;
    const next = focusables[nextIndex];
    focusSafely(next);
    return next;
  };

  // Mirrors react-aria `useActionGroup.onKeyDown` (3.50.0): only the four arrows
  // are handled and they are ORIENTATION-AGNOSTIC — ArrowRight/ArrowDown always
  // move next, ArrowLeft/ArrowUp always move previous (orientation only drives
  // `aria-orientation`). `flipDirection` swaps ArrowRight/ArrowLeft under RTL for
  // horizontal groups. No Home/End (they fall through to the browser). Focus
  // moves via `focusRelative` → `focusSafely` → the item's own `onFocus`, which
  // sets the focused key — so there is no selection-follows-focus here.
  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (e) => {
    const root = groupRef;
    if (!root || isActionGroupDisabled(props, state)) return;
    if (!nodeContains(e.currentTarget, getEventTarget(e))) return;

    const orientation = props.orientation ?? "horizontal";
    const flipDirection = locale().direction === "rtl" && orientation === "horizontal";

    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown": {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "ArrowRight" && flipDirection) {
          focusRelative(root, "previous");
        } else {
          focusRelative(root, "next");
        }
        return;
      }
      case "ArrowLeft":
      case "ArrowUp": {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "ArrowLeft" && flipDirection) {
          focusRelative(root, "next");
        } else {
          focusRelative(root, "previous");
        }
        return;
      }
    }
  };

  const actionGroupProps: JSX.HTMLAttributes<HTMLElement> = mergeProps(
    filterDOMProps(props as Record<string, unknown>, { labelable: true }),
    {
      ref: (el: HTMLElement) => {
        groupRef = el;
        applyRoleAttributes();
        queueMicrotask(() => {
          if (!groupRef) return;
          applyRoleAttributes();
        });
      },
      onKeyDown,
      get "aria-label"() {
        return props["aria-label"];
      },
      get "aria-labelledby"() {
        return props["aria-label"] ? undefined : props["aria-labelledby"];
      },
      get "aria-disabled"() {
        return isActionGroupDisabled(props, state) || undefined;
      },
    },
  );

  actionGroupData.set(state, {
    get onAction() {
      return props.onAction;
    },
  });

  onCleanup(() => {
    actionGroupData.delete(state);
  });

  return { actionGroupProps };
}

export function createActionGroupItem<T>(
  props: AriaActionGroupItemProps,
  state: ListState<T>,
): ActionGroupItemAria {
  const button = createButton({
    elementType: "button",
    isDisabled: state.isDisabled(props.key),
    onPress: () => {
      state.setFocusedKey(props.key);
      actionGroupData.get(state)?.onAction?.(props.key);
      if (state.selectionMode() !== "none") {
        state.select(props.key);
      }
    },
  });

  const isFocused = () => props.key === state.focusedKey();

  onCleanup(() => {
    if (isFocused()) {
      state.setFocusedKey(null);
    }
  });

  const buttonProps: JSX.HTMLAttributes<HTMLElement> = mergeProps(button.buttonProps, {
    get role() {
      return ITEM_ROLE_BY_MODE[state.selectionMode()];
    },
    get "aria-checked"() {
      const mode = state.selectionMode();
      if (mode === "none") return undefined;
      return state.isSelected(props.key);
    },
    // Mirrors react-aria `useActionGroupItem` (3.50.0): every enabled item is
    // tabbable until focus engages the group, then the roving stop follows the
    // focused key. There is NO single default tab stop and NO selection bias —
    // disabled items are made non-tabbable by their native `disabled` attribute
    // (via createButton), not by this getter.
    get tabIndex() {
      return isFocused() || state.focusedKey() == null ? 0 : -1;
    },
    "data-key": String(props.key),
    onFocus: () => {
      state.setFocusedKey(props.key);
    },
  });

  return { buttonProps };
}
