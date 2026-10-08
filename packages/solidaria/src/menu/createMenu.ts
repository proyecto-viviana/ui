/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/menu/useMenu.ts

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 * Based on @react-aria/menu useMenu.
 */

import { onOwnedCleanup } from "../utils/owner";
import { createTrackedEffect } from "solid-js";
import type { Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createLabel } from "../label/createLabel";
import { whileItemDOMFocusSuppressed } from "../selection/createSelectableItem";
import { createSelectableList } from "../selection/createSelectableList";
import { ListKeyboardDelegate } from "../selection/ListKeyboardDelegate";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { focusSafely, runAfterPaint } from "../utils/focus";
import { createId } from "../ssr";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { isDevEnv } from "../utils/env";
import type { MenuState, Key } from "@proyecto-viviana/solid-stately";

export interface AriaMenuProps<T = unknown> {
  /** An ID for the menu. */
  id?: string;
  /** Whether the menu is disabled. */
  isDisabled?: boolean;
  /** The label for the menu. */
  label?: JSX.Element;
  /** An accessible label for the menu when no visible label is provided. */
  "aria-label"?: string;
  /** The ID of an element that labels the menu. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the menu. */
  "aria-describedby"?: string;
  /** Handler called when focus moves into the menu. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler called when focus moves out of the menu. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler called when the focus state changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Handler called when an item is activated (pressed). */
  onAction?: (key: Key, value: T) => void;
  /** Handler called when the menu should close. */
  onClose?: () => void;
  /** Whether the menu should close when an item is selected. */
  shouldCloseOnSelect?: boolean;
  /** Whether focus should automatically wrap around. */
  shouldFocusWrap?: boolean;
  /** Whether to auto-focus the menu root (`true`) or the first/last item. */
  autoFocus?: boolean | "first" | "last";
  /** Whether type-to-select is disabled. @default false */
  disallowTypeAhead?: boolean;
}

export interface MenuAria {
  /** Props for the menu element. */
  menuProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the menu's label element (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
}

// Shared data between menu and menu items
const menuData = new WeakMap<object, MenuData>();

interface MenuData {
  id: string;
  // Type-erased like upstream menu/utils.ts MenuData (value: any): the WeakMap
  // is keyed by an untyped state, so the item value flows through as unknown.
  onAction?: (key: Key, value: unknown) => void;
  onClose?: () => void;
  isDisabled?: boolean;
  shouldCloseOnSelect?: boolean;
}

export function getMenuData(state: MenuState): MenuData | undefined {
  return menuData.get(state);
}

/**
 * Provides the behavior and accessibility implementation for a menu component.
 * A menu displays a list of actions or options that a user can choose.
 */
export function createMenu<T>(
  props: MaybeAccessor<AriaMenuProps<T>>,
  state: MenuState<T>,
  ref?: Accessor<HTMLElement | null>,
): MenuAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const elementRef = ref ?? (() => null);

  // Development-time warning for missing accessibility labels
  if (isDevEnv()) {
    const p = getProps();
    if (!p.label && !p["aria-label"] && !p["aria-labelledby"]) {
      console.warn(
        "[solidaria] A Menu requires an aria-label or aria-labelledby attribute for accessibility.",
      );
    }
  }

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const updateSharedData = () => {
    const p = getProps();
    menuData.set(state, {
      id,
      onAction: p.onAction as MenuData["onAction"],
      onClose: p.onClose,
      isDisabled: p.isDisabled,
      shouldCloseOnSelect: p.shouldCloseOnSelect,
    });
  };

  // Ensure menu items created in the same render pass can read parent metadata.
  updateSharedData();

  // Share data with child menu items
  createTrackedEffect(() => {
    const _s2Cleanups: Array<() => void> = [];

    updateSharedData();

    _s2Cleanups.push(() => {
      menuData.delete(state);
    });

    return () => {
      for (const c of _s2Cleanups) c();
    };
  });

  // Handle focus within
  const { focusWithinProps } = createFocusWithin({
    onFocusWithin: (e) => getProps().onFocus?.(e),
    onBlurWithin: (e) => getProps().onBlur?.(e),
    onFocusWithinChange: (isFocused) => {
      getProps().onFocusChange?.(isFocused);
      state.setFocused(isFocused);
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

  // Arrow, Home/End, Page, and typeahead go through the shared list delegate.
  // Escape stays here: the collection's Escape clears selection, and a menu
  // closes instead. Item Enter/Space is createMenuItem, matching useMenuItem.
  // autoFocus is not forwarded. Pointer open focuses the menu root after paint
  // with focusVisible; the collection effect would focus immediately without it.
  const selectableList = createSelectableList<T>({
    selectionManager: state.selectionManager,
    ref: elementRef,
    get shouldFocusWrap() {
      return getProps().shouldFocusWrap ?? true;
    },
    get disallowTypeAhead() {
      return getProps().disallowTypeAhead ?? false;
    },
    linkBehavior: "override",
  });

  // Auto-focus the menu (or its first/last/selected item) when `autoFocus` is
  // set. Mouse open passes `true` (focus the menu root); ArrowDown/ArrowUp
  // pass `"first"`/`"last"`.
  let autoFocusDone = false;
  let cancelAutoFocus: (() => void) | undefined;
  createTrackedEffect(() => {
    const autoFocus = getProps().autoFocus ?? false;
    if (autoFocusDone || autoFocus === false) {
      return;
    }

    const collection = state.collection();
    if (collection.size === 0) {
      return;
    }

    let focusedKey: Key | null = null;
    if (autoFocus === "first" || autoFocus === "last") {
      const delegate = new ListKeyboardDelegate({
        collection,
        disabledKeys: state.selectionManager.disabledKeys,
        disabledBehavior: state.selectionManager.disabledBehavior,
        ref: elementRef,
      });
      focusedKey = autoFocus === "first" ? delegate.getFirstKey() : delegate.getLastKey();
    }

    const selectedKeys = state.selectionManager.rawSelection;
    if (selectedKeys !== "all" && selectedKeys.size) {
      for (const key of selectedKeys) {
        if (state.selectionManager.canSelectItem(key)) {
          focusedKey = key;
          break;
        }
      }
    }

    const root = elementRef();
    if (focusedKey == null && !root) {
      return;
    }

    autoFocusDone = true;
    cancelAutoFocus = runAfterPaint(() => {
      cancelAutoFocus = undefined;
      const focusMenuRoot = () => {
        const el = elementRef();
        if (el) {
          // Mouse-open focuses the menu root. Chromium's used outline for
          // `outline-style: none` is the 1px unspecified sentinel only while
          // that element is `document.activeElement`.
          focusSafely(el, { focusVisible: true });
        }
      };
      // Boolean `autoFocus` is the pointer open. A selection keeps the item
      // as the focused key (tabindex 0, data-focused) but DOM focus stays on
      // the menu, matching the published React menu. "first" / "last" still
      // move real focus onto the item.
      // setFocused before the root receives focus so the collection focusin
      // listener does not move focus onto the first item.
      if (autoFocus === true && focusedKey != null) {
        whileItemDOMFocusSuppressed(() => {
          state.setFocused(true);
          state.setFocusedKey(focusedKey);
          focusMenuRoot();
        });
        return;
      }
      state.setFocused(true);
      state.setFocusedKey(focusedKey);
      if (focusedKey == null) {
        focusMenuRoot();
      }
    });
  });
  onOwnedCleanup(() => {
    cancelAutoFocus?.();
  });

  const onKeyDown = (e: KeyboardEvent) => {
    if (getProps().isDisabled) return;
    // Do not forward Escape. useMenu suppresses the list handler so selection
    // is not cleared; this port also closes, which the overlay owns upstream.
    if (e.key === "Escape") {
      e.preventDefault();
      getProps().onClose?.();
      return;
    }
    selectableList.listProps.onKeyDown?.(e);
  };

  return {
    get labelProps() {
      return labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get menuProps() {
      const p = getProps();
      const {
        onKeyDown: _listKeyDown,
        tabIndex: _listTabIndex,
        ...listRest
      } = p.isDisabled ? {} : selectableList.listProps;

      return mergeProps(
        domProps(),
        focusWithinProps as Record<string, unknown>,
        fieldProps as Record<string, unknown>,
        listRest as Record<string, unknown>,
        {
          role: "menu",
          // Roving tabindex: the menu container is tab-reachable (0) only while no
          // item holds focus; once `focusedKey` is set the container drops to -1 so
          // Tab/Shift+Tab traverse past it and real focus stays on the item. This
          // mirrors upstream `useMenu`, which spreads `useSelectableList`'s
          // `listProps.tabIndex` (`manager.focusedKey == null ? 0 : -1`, non-virtual
          // focus) onto the menu.
          //
          // This MUST be a getter, not an eagerly-evaluated value. Consumers
          // (solidaria-components `Menu.tsx`) destructure `menuProps` once and
          // spread it through `mergeProps`; a plain `tabIndex: <value>` would be
          // computed at that first read (while `focusedKey` is still null → 0) and
          // frozen. As a getter it survives `mergeProps` (which preserves getters),
          // so the consumer's reactive element-spread re-reads `state.focusedKey()`
          // and the container tabindex tracks focus.
          get tabIndex() {
            return getProps().isDisabled ? undefined : state.focusedKey() == null ? 0 : -1;
          },
          "aria-disabled": p.isDisabled || undefined,
          onKeyDown,
        } as Record<string, unknown>,
      ) as JSX.HTMLAttributes<HTMLElement>;
    },
  };
}
