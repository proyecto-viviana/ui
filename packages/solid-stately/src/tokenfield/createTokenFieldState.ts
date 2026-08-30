/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/tokenfield/useTokenFieldState.ts

/**
 * Token field state for Solid Stately.
 *
 * Tracks the field value and composition state. Port of
 * @react-stately/tokenfield useTokenFieldState.
 */

import { createSignal, type Accessor } from "solid-js";
import { type MaybeAccessor, access } from "../utils";
import { TokenFieldValue } from "./TokenFieldValue";

export interface TokenFieldStateOptions<T extends TokenFieldValue = TokenFieldValue> {
  /** The current value (controlled). */
  value?: T;
  /** The default value (uncontrolled). */
  defaultValue?: T;
  /** Handler that is called when the value changes. */
  onChange?: (value: T) => void;
}

export interface TokenFieldState<T extends TokenFieldValue = TokenFieldValue> {
  /** The current value of the token field. */
  readonly value: Accessor<T>;
  /** Sets the value of the token field. */
  setValue: (fn: T | ((value: T) => T)) => void;
  /** Whether the token field is composing. */
  readonly isComposing: Accessor<boolean>;
  /** Sets the composing state of the token field. */
  setComposing: (isComposing: boolean) => void;
}

/**
 * Provides state management for a token field. Tracks the field value and the
 * composition state.
 */
export function createTokenFieldState<T extends TokenFieldValue = TokenFieldValue>(
  props: MaybeAccessor<TokenFieldStateOptions<T>> = {},
): TokenFieldState<T> {
  const getProps = () => access(props);

  const initialProps = getProps();
  const initialValue = (initialProps.value ??
    initialProps.defaultValue ??
    new TokenFieldValue([])) as T;

  const [internalValue, setInternalValue] = createSignal(initialValue);
  const [isComposing, setComposing] = createSignal(false);

  const isControlled = () => getProps().value !== undefined;

  const value: Accessor<T> = () => {
    const p = getProps();
    return isControlled() ? ((p.value ?? initialValue) as T) : internalValue();
  };

  function setValue(fn: T | ((current: T) => T)): void {
    const p = getProps();
    const current = value();
    const next = typeof fn === "function" ? (fn as (current: T) => T)(current) : fn;

    if (!isControlled()) {
      setInternalValue(() => next);
    }

    p.onChange?.(next);
  }

  return {
    value,
    setValue,
    isComposing,
    setComposing,
  };
}
