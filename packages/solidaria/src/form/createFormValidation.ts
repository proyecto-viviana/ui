/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/form/useFormValidation.ts

/**
 * createFormValidation hook for solidaria
 *
 * Connects form validation state to native HTML form validation.
 * Handles the invalid event, form reset, and focus management.
 *
 * Port of react-aria's useFormValidation.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";
import { type FormValidationState, type ValidationResult } from "@proyecto-viviana/solid-stately";
import { setInteractionModality } from "../interactions/createInteractionModality";
import { followRef } from "../utils/refs";

export type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type ValidationBehavior = "aria" | "native";

export interface FormValidationProps {
  /** Validation behavior: 'aria' for realtime, 'native' for on submit. */
  validationBehavior?: ValidationBehavior;
  /** Custom focus function to call on validation error. */
  focus?: () => void;
  /**
   * Write custom validity, including a clear, before reading `input.validity`.
   * Checkbox groups own that message. Number fields leave it false so a
   * constraint hook's custom error is still visible to the snapshot.
   */
  clearCustomValidityFirst?: boolean;
}

function getValidity(input: ValidatableElement): ValidityState {
  // Create a snapshot of the validity state (the native object is live)
  const validity = input.validity;
  return {
    badInput: validity.badInput,
    customError: validity.customError,
    patternMismatch: validity.patternMismatch,
    rangeOverflow: validity.rangeOverflow,
    rangeUnderflow: validity.rangeUnderflow,
    stepMismatch: validity.stepMismatch,
    tooLong: validity.tooLong,
    tooShort: validity.tooShort,
    typeMismatch: validity.typeMismatch,
    valueMissing: validity.valueMissing,
    valid: validity.valid,
  };
}

function getNativeValidity(input: ValidatableElement): ValidationResult {
  return {
    isInvalid: !input.validity.valid,
    validationDetails: getValidity(input),
    validationErrors: input.validationMessage ? [input.validationMessage] : [],
  };
}

/**
 * Mirrors the native half of `useFormValidation`.
 * `clearCustomValidityFirst` matches the pin: set the message (or `""`), then
 * snapshot. The default reads first so a number field's own custom error survives.
 */
export function syncInputCustomValidity(
  input: ValidatableElement,
  state: FormValidationState,
  clearCustomValidityFirst = false,
): void {
  if (!("setCustomValidity" in input) || input.disabled) {
    return;
  }

  const realtime = state.realtimeValidation();
  const message = realtime.isInvalid ? realtime.validationErrors.join(" ") || "Invalid value." : "";

  if (!input.hasAttribute("title")) {
    input.title = "";
  }

  if (clearCustomValidityFirst) {
    input.setCustomValidity(message);
    if (!realtime.isInvalid) {
      state.updateValidation(getNativeValidity(input));
    }
    return;
  }

  if (realtime.isInvalid) {
    input.setCustomValidity(message);
    return;
  }

  state.updateValidation(getNativeValidity(input));
  if (input.validity.valid) {
    input.setCustomValidity("");
  }
}

function getFirstInvalidInput(form: HTMLFormElement): ValidatableElement | null {
  for (let i = 0; i < form.elements.length; i++) {
    const element = form.elements[i] as ValidatableElement;
    if (!element.validity.valid) {
      return element;
    }
  }
  return null;
}

/**
 * Connects form validation state to a native HTML form input.
 *
 * This hook:
 * - Sets custom validity on the native input based on validation state
 * - Handles the 'invalid' event to commit validation and focus the first invalid input
 * - Handles form reset to clear validation state
 * - Handles input change to commit validation
 *
 * @example
 * ```tsx
 * function MyTextField(props) {
 *   let inputRef: HTMLInputElement | undefined;
 *
 *   const validationState = createFormValidationState({
 *     value: props.value,
 *     validate: props.validate,
 *     validationBehavior: 'native',
 *   });
 *
 *   createFormValidation(
 *     { validationBehavior: 'native' },
 *     validationState,
 *     () => inputRef
 *   );
 *
 *   return (
 *     <input
 *       ref={inputRef}
 *       value={props.value}
 *       aria-invalid={validationState.displayValidation().isInvalid || undefined}
 *     />
 *   );
 * }
 * ```
 */
export function createFormValidation(
  props: FormValidationProps,
  state: FormValidationState,
  ref: Accessor<ValidatableElement | undefined>,
): void {
  const validationBehavior = () => props.validationBehavior ?? "aria";
  const focus = () => props.focus;
  const clearCustomValidityFirst = () => props.clearCustomValidityFirst ?? false;
  const inputRef = followRef(ref);

  // Track whether we should ignore form reset (for React-like programmatic resets)
  let isIgnoredReset = false;

  // Set custom validity on the native input. Writes (`updateValidation`) must
  // run in apply — createTrackedEffect is an owned scope and rejects them.
  createEffect(
    () => {
      const input = inputRef();
      state.realtimeValidation();
      return {
        input,
        behavior: validationBehavior(),
        clearFirst: clearCustomValidityFirst(),
        disabled: !!input?.disabled,
      };
    },
    ({ input, behavior, clearFirst, disabled }) => {
      if (behavior === "native" && input && !disabled) {
        syncInputCustomValidity(input, state, clearFirst);
      }
    },
  );

  // Set up event listeners
  createEffect(
    () => inputRef(),
    (input) => {
      if (!input) {
        return;
      }

      // Effect-time `input.form` is null when the control is associated later
      // via `form="…"`. Keep it only for the RAC `form.reset` monkey-patch
      // (programmatic React-style resets). The reset *listener* reads the live
      // association, matching #466 / #467.
      const form = input.form;

      // Handle invalid event
      const onInvalid = (e: Event) => {
        // Only commit validation if we are not already displaying one
        if (!state.displayValidation().isInvalid) {
          state.commitValidation();
        }

        // RAC reads `ref.current?.form` at event time (`useFormValidation.ts:75`).
        // A `form` attribute associated after mount (D14's injected probe form)
        // leaves the effect-time `input.form` null; using the live association
        // is what focuses TextField / SearchField / Checkbox after requestSubmit.
        const associatedForm = input.form;
        if (
          !e.defaultPrevented &&
          associatedForm &&
          getFirstInvalidInput(associatedForm) === input
        ) {
          const focusFn = focus();
          if (focusFn) {
            focusFn();
          } else {
            input.focus();
          }
          // Always show focus ring
          setInteractionModality("keyboard");
        }

        // Prevent default browser error UI
        e.preventDefault();
      };

      // Handle change event
      const onChange = () => {
        state.commitValidation();
      };

      // Handle form reset. Read `input.form` at event time so a late `form=""`
      // still clears displayValidation (D14-style association after mount).
      const onReset = (e: Event) => {
        if (input.form && e.target === input.form && !isIgnoredReset) {
          state.resetValidation();
        }
      };

      // Patch form.reset to detect programmatic resets
      let originalReset: (() => void) | undefined;
      if (form) {
        originalReset = form.reset.bind(form);
        form.reset = () => {
          // Ignore programmatic resets outside user events
          isIgnoredReset =
            !window.event ||
            (window.event.type === "message" && window.event.target instanceof MessagePort);
          originalReset?.();
          isIgnoredReset = false;
        };
      }

      input.addEventListener("invalid", onInvalid);
      input.addEventListener("change", onChange);
      document.addEventListener("reset", onReset);

      return () => {
        input.removeEventListener("invalid", onInvalid);
        input.removeEventListener("change", onChange);
        document.removeEventListener("reset", onReset);
        if (form && originalReset) {
          form.reset = originalReset;
        }
      };
    },
  );
}
