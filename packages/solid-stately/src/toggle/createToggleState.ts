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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/toggle/useToggleState.ts

/**
 * Toggle state for Solid Stately
 *
 * Provides state management for toggle components like checkboxes and switches.
 *
 * This is a 1:1 port of @react-stately/toggle's useToggleState.
 */

import { createSignal, Accessor } from "solid-js";
import { type MaybeAccessor, access } from "../utils";

export interface ToggleStateOptions {
  /** Whether the element should be selected (controlled). */
  isSelected?: boolean;
  /** Whether the element should be selected by default (uncontrolled). */
  defaultSelected?: boolean;
  /** Handler that is called when the element's selection state changes. */
  onChange?: (isSelected: boolean) => void;
  /** Whether the element is read only. */
  isReadOnly?: boolean;
}

export interface ToggleState {
  /** Whether the toggle is selected. */
  readonly isSelected: Accessor<boolean>;
  /** Whether the toggle is selected by default. */
  readonly defaultSelected: boolean;
  /** Updates selection state. */
  setSelected(isSelected: boolean): void;
  /** Toggle the selection state. */
  toggle(): void;
}

/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function createToggleState(props: MaybeAccessor<ToggleStateOptions> = {}): ToggleState {
  const getProps = () => access(props);

  const initialProps = getProps();
  const initialSelected = initialProps.isSelected ?? initialProps.defaultSelected ?? false;

  const [internalSelected, setInternalSelected] = createSignal(initialSelected);

  const isControlled = () => getProps().isSelected !== undefined;

  const isSelected: Accessor<boolean> = () => {
    const p = getProps();
    return isControlled() ? (p.isSelected ?? false) : internalSelected();
  };

  function setSelected(value: boolean): void {
    const p = getProps();
    if (p.isReadOnly) {
      return;
    }

    if (!isControlled()) {
      setInternalSelected(value);
    }

    p.onChange?.(value);
  }

  function toggle(): void {
    const p = getProps();
    if (p.isReadOnly) {
      return;
    }

    setSelected(!isSelected());
  }

  return {
    isSelected,
    defaultSelected: initialProps.defaultSelected ?? initialSelected,
    setSelected,
    toggle,
  };
}
