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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/searchfield/useSearchFieldState.ts

/**
 * Creates state for a search field component.
 * Based on @react-stately/searchfield useSearchFieldState.
 */

import { type Accessor, createSignal, createMemo } from "solid-js";
import { access, type MaybeAccessor } from "../utils";

export interface SearchFieldStateProps {
  /** The current value (controlled). */
  value?: string;
  /** The default value (uncontrolled). */
  defaultValue?: string;
  /** Handler that is called when the value changes. */
  onChange?: (value: string) => void;
}

export interface SearchFieldState {
  /** The current value of the search field. */
  value: Accessor<string>;
  /** Sets the value of the search field. */
  setValue: (value: string) => void;
}

/**
 * Provides state management for a search field.
 */
export function createSearchFieldState(
  props: MaybeAccessor<SearchFieldStateProps>,
): SearchFieldState {
  const getProps = () => access(props);

  const isControlled = () => getProps().value !== undefined;

  const [internalValue, setInternalValue] = createSignal(getProps().defaultValue ?? "");

  const value = createMemo(() => {
    const p = getProps();
    return isControlled() ? (p.value ?? "") : internalValue();
  });

  const setValue = (newValue: string) => {
    const p = getProps();

    if (!isControlled()) {
      setInternalValue(newValue);
    }

    p.onChange?.(newValue);
  };

  return {
    value,
    setValue,
  };
}
