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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/menu/useMenuTriggerState.ts

/**
 * State management for menu components.
 *
 * createMenuTriggerState is ported from
 * packages/react-stately/src/menu/useMenuTriggerState.ts.
 * createMenuState is a local composition of the separately attributed list state.
 */

import { createSignal } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import { createOverlayTriggerState, type OverlayTriggerProps } from "../overlays";
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

export type MenuTriggerType = "press" | "longPress" | "contextMenu";

export interface MenuTriggerProps extends OverlayTriggerProps {
  /** How the menu is triggered. */
  trigger?: MenuTriggerType;
}

/** @deprecated Use `MenuTriggerProps`. */
export interface MenuTriggerStateProps extends MenuTriggerProps {}

export interface MenuTriggerState {
  /** Whether the menu is open. */
  readonly isOpen: () => boolean;
  /** Sets whether the menu is open. */
  setOpen(isOpen: boolean): void;
  /** Open the menu. */
  open(focusStrategy?: "first" | "last" | null): void;
  /** Close the menu. */
  close(): void;
  /** Toggle the menu. */
  toggle(focusStrategy?: "first" | "last" | null): void;
  /** Focus strategy for when the menu opens. */
  readonly focusStrategy: () => "first" | "last" | null;
  /** Set the focus strategy. */
  setFocusStrategy(strategy: "first" | "last" | null): void;
  /** Cursor position relative to the window viewport. */
  readonly point: () => { x: number; y: number } | null;
  /** Sets the cursor position relative to the window viewport. */
  setPoint(point: { x: number; y: number }): void;
}

/**
 * Creates state for a menu trigger. Mirrors `@react-stately/menu` `useMenuTriggerState`:
 * overlay open state plus the focus strategy passed through to `createMenu`.
 */
export function createMenuTriggerState(
  props: MaybeAccessor<MenuTriggerProps> = {},
): MenuTriggerState {
  const overlay = createOverlayTriggerState(props);
  const [focusStrategy, setFocusStrategy] = createSignal<"first" | "last" | null>(null);

  return {
    ...overlay,
    focusStrategy,
    setFocusStrategy,
    open(strategy: "first" | "last" | null = null) {
      setFocusStrategy(strategy);
      overlay.open();
    },
    toggle(strategy: "first" | "last" | null = null) {
      setFocusStrategy(strategy);
      overlay.toggle();
    },
  };
}
