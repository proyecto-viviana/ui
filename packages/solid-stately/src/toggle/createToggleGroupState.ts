/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/toggle/useToggleGroupState.ts

/**
 * Toggle group state for Solid Stately
 *
 * Provides state management for groups of toggle buttons with
 * single or multiple selection.
 *
 * This is a port of @react-stately/toggle's useToggleGroupState.
 */

import { createSignal } from "solid-js";
import type { Key } from "../collections";
import { type MaybeAccessor, access } from "../utils";

export interface ToggleGroupProps {
  /**
   * Whether single or multiple selection is enabled.
   * @default 'single'
   */
  selectionMode?: "single" | "multiple";
  /** Whether empty selection is disallowed. */
  disallowEmptySelection?: boolean;
  /** Controlled selected keys. */
  selectedKeys?: Iterable<Key>;
  /** Uncontrolled initial selected keys. */
  defaultSelectedKeys?: Iterable<Key>;
  /** Called when selected keys change. */
  onSelectionChange?: (keys: Set<Key>) => void;
  /** Whether all items are disabled. */
  isDisabled?: boolean;
}

export interface ToggleGroupState {
  /** Whether single or multiple selection is enabled. */
  readonly selectionMode: "single" | "multiple";
  /** Whether all items are disabled. */
  readonly isDisabled: boolean;
  /** Current selected keys. */
  readonly selectedKeys: Set<Key>;
  /** Toggles selected state for a key. */
  toggleKey(key: Key): void;
  /** Sets selected state for a key. */
  setSelected(key: Key, isSelected: boolean): void;
  /** Replaces selected keys. */
  setSelectedKeys(keys: Set<Key>): void;
}

function toKeySet(keys?: Iterable<Key>): Set<Key> {
  return new Set(keys ? Array.from(keys) : []);
}

/**
 * Manages state for a group of toggle buttons.
 */
export function createToggleGroupState(
  props: MaybeAccessor<ToggleGroupProps> = {},
): ToggleGroupState {
  const getProps = () => access(props);

  const initialProps = getProps();
  const [internalSelectedKeys, setInternalSelectedKeys] = createSignal<Set<Key>>(
    toKeySet(initialProps.defaultSelectedKeys),
  );

  const isControlled = () => getProps().selectedKeys !== undefined;
  const selectedKeys = () =>
    isControlled() ? toKeySet(getProps().selectedKeys) : internalSelectedKeys();

  function setSelectedKeys(keys: Set<Key>): void {
    const nextKeys = new Set(keys);
    if (!isControlled()) {
      setInternalSelectedKeys(nextKeys);
    }
    getProps().onSelectionChange?.(nextKeys);
  }

  function toggleKey(key: Key): void {
    const props = getProps();
    const mode = props.selectionMode ?? "single";
    const disallowEmptySelection = props.disallowEmptySelection ?? false;
    const currentKeys = selectedKeys();

    let nextKeys: Set<Key>;
    if (mode === "multiple") {
      nextKeys = new Set(currentKeys);
      if (nextKeys.has(key) && (!disallowEmptySelection || nextKeys.size > 1)) {
        nextKeys.delete(key);
      } else {
        nextKeys.add(key);
      }
    } else {
      nextKeys = new Set(currentKeys.has(key) && !disallowEmptySelection ? [] : [key]);
    }

    setSelectedKeys(nextKeys);
  }

  function setSelected(key: Key, isSelected: boolean): void {
    if (isSelected !== selectedKeys().has(key)) {
      toggleKey(key);
    }
  }

  return {
    get selectionMode() {
      return getProps().selectionMode ?? "single";
    },
    get isDisabled() {
      return getProps().isDisabled ?? false;
    },
    get selectedKeys() {
      return new Set(selectedKeys());
    },
    toggleKey,
    setSelected,
    setSelectedKeys,
  };
}
