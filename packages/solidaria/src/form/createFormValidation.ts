/**
 * createFormValidation hook for solidaria
 *
 * Connects form validation state to native HTML form validation.
 * Handles the invalid event, form reset, and focus management.
 *
 * Port of react-aria's useFormValidation.
 */

import { type Accessor, createEffect, onCleanup } from "solid-js";
import { type FormValidationState, type ValidationResult } from "@proyecto-viviana/solid-stately";
import { setInteractionModality } from "../interactions/createInteractionModality";

export type ValidatableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

export type ValidationBehavior = "aria" | "native";

export interface FormValidationProps {
  /** Validation behavior: 'aria' for realtime, 'native' for on submit. */
  validationBehavior?: ValidationBehavior;
  /** Custom focus function to call on validation error. */
  focus?: () => void;
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

  // Track whether we should ignore form reset (for React-like programmatic resets)
  let isIgnoredReset = false;

  // Set custom validity on the native input
  createEffect(() => {
    const input = ref();
    // `'setCustomValidity' in input` guards refs that aren't true form elements
    // (e.g. a custom element), matching upstream useFormValidation.
    if (
      validationBehavior() === "native" &&
      input &&
      "setCustomValidity" in input &&
      !input.disabled
    ) {
      const realtimeValidation = state.realtimeValidation();
      const errorMessage = realtimeValidation.isInvalid
        ? realtimeValidation.validationErrors.join(" ") || "Invalid value."
        : "";
      input.setCustomValidity(errorMessage);

      // Prevent default tooltip for validation message
      if (!input.hasAttribute("title")) {
        input.title = "";
      }

      // Update validation with native validity if not already invalid
      if (!realtimeValidation.isInvalid) {
        state.updateValidation(getNativeValidity(input));
      }
    }
  });

  // Set up event listeners
  createEffect(() => {
    const input = ref();
    if (!input) {
      return;
    }

    const form = input.form;

    // Handle invalid event
    const onInvalid = (e: Event) => {
      // Only commit validation if we are not already displaying one
      if (!state.displayValidation().isInvalid) {
        state.commitValidation();
      }

      // Auto focus the first invalid input in a form
      if (!e.defaultPrevented && form && getFirstInvalidInput(form) === input) {
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

    // Handle form reset
    const onReset = () => {
      if (!isIgnoredReset) {
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
    form?.addEventListener("reset", onReset);

    onCleanup(() => {
      input.removeEventListener("invalid", onInvalid);
      input.removeEventListener("change", onChange);
      form?.removeEventListener("reset", onReset);
      if (form && originalReset) {
        form.reset = originalReset;
      }
    });
  });
}
