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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/spinbutton/useSpinButton.ts

/**
 * createSpinButton hook for Solidaria
 *
 * Provides the ARIA spinbutton props and live-region announcement behaviour for
 * a single spinbutton (e.g. a date-field segment). Port of the keyboard/announce
 * portion of @react-aria/spinbutton `useSpinButton`. The pointer press-and-hold
 * button machinery (increment/decrement buttons) is intentionally omitted — date
 * segments drive value changes through the keyboard only.
 */

import { createMemo, createEffect } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { createStringFormatter } from "../i18n";
import { announce, clearAnnouncer } from "../live-announcer";
import { spinButtonStrings, type SpinButtonStringKey } from "./intl";

export interface SpinButtonProps {
  /** The current value of the spinbutton. */
  value?: number;
  /** A human-readable text alternative for the value. */
  textValue?: string;
  /** The smallest value allowed. */
  minValue?: number;
  /** The largest value allowed. */
  maxValue?: number;
  /** Whether the spinbutton is disabled. */
  isDisabled?: boolean;
  /** Whether the spinbutton is read only. */
  isReadOnly?: boolean;
  /** Whether the spinbutton is required. */
  isRequired?: boolean;
  onIncrement?: () => void;
  onIncrementPage?: () => void;
  onDecrement?: () => void;
  onDecrementPage?: () => void;
  onDecrementToMin?: () => void;
  onIncrementToMax?: () => void;
}

export interface SpinButtonAria {
  /** Props for the spinbutton element. */
  spinButtonProps: Record<string, unknown>;
}

/**
 * Provides the behaviour and accessibility implementation for a spinbutton.
 */
export function createSpinButton(props: MaybeAccessor<SpinButtonProps>): SpinButtonAria {
  const getProps = () => access(props);
  const stringFormatter = createStringFormatter<SpinButtonStringKey>(
    spinButtonStrings,
    "@react-aria/spinbutton",
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const p = getProps();
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || p.isReadOnly || e.isComposing) {
      return;
    }

    switch (e.key) {
      // Upstream deliberately falls through PageUp → ArrowUp when no page
      // handler exists; our tsconfig forbids lexical fallthrough, so the
      // PageUp case mirrors that branch inline instead.
      case "PageUp":
        if (p.onIncrementPage) {
          e.preventDefault();
          p.onIncrementPage();
        } else if (p.onIncrement) {
          e.preventDefault();
          p.onIncrement();
        }
        break;
      case "ArrowUp":
      case "Up":
        if (p.onIncrement) {
          e.preventDefault();
          p.onIncrement();
        }
        break;
      // Same faithful fallthrough as PageUp, mirrored inline (PageDown → ArrowDown).
      case "PageDown":
        if (p.onDecrementPage) {
          e.preventDefault();
          p.onDecrementPage();
        } else if (p.onDecrement) {
          e.preventDefault();
          p.onDecrement();
        }
        break;
      case "ArrowDown":
      case "Down":
        if (p.onDecrement) {
          e.preventDefault();
          p.onDecrement();
        }
        break;
      case "Home":
        if (p.onDecrementToMin) {
          e.preventDefault();
          p.onDecrementToMin();
        }
        break;
      case "End":
        if (p.onIncrementToMax) {
          e.preventDefault();
          p.onIncrementToMax();
        }
        break;
    }
  };

  // Non-reactive focus flag — matches upstream's `isFocused` ref. Toggling it must
  // NOT re-run the announce effect; only a change in `ariaTextValue` announces.
  let isFocused = false;
  const onFocus = () => {
    isFocused = true;
  };
  const onBlur = () => {
    isFocused = false;
  };

  // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212) so VoiceOver
  // announces it as "minus". Replace the empty string with the word "Empty".
  const ariaTextValue = createMemo(() => {
    const p = getProps();
    return p.textValue === ""
      ? stringFormatter().format("Empty")
      : (p.textValue || `${p.value}`).replace("-", "−");
  });

  createEffect(() => {
    const value = ariaTextValue();
    if (isFocused) {
      clearAnnouncer("assertive");
      announce(value, "assertive");
    }
  });

  const spinButtonProps = createMemo(() => {
    const p = getProps();
    const value = p.value;
    return {
      role: "spinbutton",
      "aria-valuenow": value !== undefined && !isNaN(value) ? value : undefined,
      "aria-valuetext": ariaTextValue(),
      "aria-valuemin": p.minValue,
      "aria-valuemax": p.maxValue,
      "aria-disabled": p.isDisabled || undefined,
      "aria-readonly": p.isReadOnly || undefined,
      "aria-required": p.isRequired || undefined,
      onKeyDown,
      onFocus,
      onBlur,
    };
  });

  return {
    get spinButtonProps() {
      return spinButtonProps();
    },
  };
}
