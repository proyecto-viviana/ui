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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/utils/useControlledState.ts

/**
 * TextField state for Solid Stately
 *
 * Provides state management for text input components.
 *
 * This is a port of @react-stately/utils's useControlledState pattern
 * as used by @react-aria/textfield.
 */

import { createSignal, Accessor } from "solid-js";
import { type MaybeAccessor, access } from "../utils";

export interface TextFieldStateOptions {
  /** The current value (controlled). */
  value?: string;
  /** The default value (uncontrolled). */
  defaultValue?: string;
  /** Handler that is called when the value changes. */
  onChange?: (value: string) => void;
}

export interface TextFieldState {
  /** The current value of the text field. */
  readonly value: Accessor<string>;
  /** Sets the value of the text field. */
  setValue(value: string): void;
}

/**
 * Provides state management for text input components.
 * Supports both controlled and uncontrolled modes.
 */
export function createTextFieldState(
  props: MaybeAccessor<TextFieldStateOptions> = {},
): TextFieldState {
  const getProps = () => access(props);

  const initialProps = getProps();
  const initialValue = initialProps.value ?? initialProps.defaultValue ?? "";

  const [internalValue, setInternalValue] = createSignal(initialValue);

  const isControlled = () => getProps().value !== undefined;

  const value: Accessor<string> = () => {
    const p = getProps();
    return isControlled() ? (p.value ?? "") : internalValue();
  };

  function setValue(newValue: string): void {
    const p = getProps();

    if (!isControlled()) {
      setInternalValue(newValue);
    }

    p.onChange?.(newValue);
  }

  return {
    value,
    setValue,
  };
}
