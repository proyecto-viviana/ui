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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/autocomplete/useAutocompleteState.ts

/**
 * createAutocompleteState - State management for autocomplete components
 *
 * Based on @react-stately/autocomplete useAutocompleteState.
 */

import { createSignal, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";

export interface AutocompleteState {
  /** The current value of the autocomplete input. */
  inputValue: Accessor<string>;
  /** Sets the value of the autocomplete input. */
  setInputValue(value: string): void;
  /** The id of the current aria-activedescendant of the autocomplete input. */
  focusedNodeId: Accessor<string | null>;
  /** Sets the id of the current aria-activedescendant of the autocomplete input. */
  setFocusedNodeId(value: string | null): void;
}

export interface AutocompleteStateOptions {
  /** The value of the autocomplete input (controlled). */
  inputValue?: string;
  /** The default value of the autocomplete input (uncontrolled). */
  defaultInputValue?: string;
  /** Handler that is called when the autocomplete input value changes. */
  onInputChange?: (value: string) => void;
}

/**
 * Provides state management for an autocomplete component.
 *
 * @example
 * ```tsx
 * const state = createAutocompleteState({
 *   defaultInputValue: '',
 *   onInputChange: (value) => console.log('Input changed:', value),
 * });
 *
 * // Access current input value
 * console.log(state.inputValue());
 *
 * // Update input value
 * state.setInputValue('new value');
 *
 * // Track focused node for aria-activedescendant
 * state.setFocusedNodeId('item-1');
 * ```
 */
export function createAutocompleteState(
  props: MaybeAccessor<AutocompleteStateOptions> = {},
): AutocompleteState {
  const getProps = () => access(props);

  // Track focused node ID for aria-activedescendant
  const [focusedNodeId, setFocusedNodeId] = createSignal<string | null>(null);

  // Handle controlled vs uncontrolled input value
  const isControlled = () => getProps().inputValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = createSignal(
    getProps().defaultInputValue ?? "",
  );

  const inputValue: Accessor<string> = () => {
    const p = getProps();
    return isControlled() ? (p.inputValue ?? "") : uncontrolledValue();
  };

  const setInputValue = (value: string) => {
    const p = getProps();
    if (!isControlled()) {
      setUncontrolledValue(value);
    }
    p.onInputChange?.(value);
  };

  return {
    inputValue,
    setInputValue,
    focusedNodeId,
    setFocusedNodeId,
  };
}
