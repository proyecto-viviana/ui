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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/datepicker/useDateField.ts

/**
 * createDateField hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a date field — a
 * segmented spinbutton text input (NOT a calendar grid). Faithful port of
 * @react-aria/datepicker `useDateField`: `fieldProps` IS the labelled
 * `role="group"` that wraps the segments, `inputProps` describes a hidden native
 * `<input>` for form submission, and segment labels/description/focus manager are
 * published to each segment through the shared `hookData` WeakMap.
 */

import { createMemo, onMount } from "solid-js";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { createField } from "../label/createField";
import { createDescription } from "../utils/createDescription";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createFocusManager, type FocusManager } from "../focus/FocusScope";
import { createStringFormatter } from "../i18n";
import { createFormValidation } from "../form/createFormValidation";
import { createFormReset } from "../form/createFormReset";
import { datePickerStrings } from "./intl";
import { createDatePickerGroup } from "./createDatePickerGroup";
import type { DateFieldState } from "@proyecto-viviana/solid-stately";

// Shared channel between the field and its segments. Unlike upstream (which stores
// plain strings and re-runs the hook every render), `ariaDescribedBy` is stored as
// an accessor so segments pick up the description id once `createDescription`'s
// deferred effect has appended its hidden node.
export const hookData = new WeakMap<
  object,
  {
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: () => string | undefined;
    focusManager: FocusManager;
  }
>();

// Symbols used by DatePicker/DateRangePicker to make a nested date field
// role="presentation" and to inject a shared focus manager. Standalone fields
// never receive them.
export const roleSymbol = "__role_" + Date.now();
export const focusManagerSymbol = "__focusManager_" + Date.now();

export interface AriaDateFieldProps {
  /** An ID for the date field. */
  id?: string;
  /** A visible label for the date field. */
  label?: string;
  /** An accessible label for the date field. */
  "aria-label"?: string;
  /** The ID of an element that labels the date field. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the date field. */
  "aria-describedby"?: string;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string | string[];
  /** Whether the date field is disabled. */
  isDisabled?: boolean;
  /** Whether the date field is read-only. */
  isReadOnly?: boolean;
  /** Whether the date field is required. */
  isRequired?: boolean;
  /** Whether the date field is invalid. */
  isInvalid?: boolean;
  /** Whether the element should receive focus on mount. */
  autoFocus?: boolean;
  /** The name of the hidden input used for form submission. */
  name?: string;
  /** The `<form>` the hidden input is associated with. */
  form?: string;
  /** Ref to the hidden input element, for form reset/validation. */
  inputRef?: () => HTMLInputElement | undefined;
  /** Whether HTML form validation is used. */
  validationBehavior?: "aria" | "native";
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocusChange?: (isFocused: boolean) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
  /** @internal presentation-role marker (set by DatePicker). */
  [key: string]: unknown;
}

export interface DateFieldAria {
  /** Props for the label element. */
  labelProps: Record<string, unknown>;
  /** Props for the field group element (wraps the segments). */
  fieldProps: Record<string, unknown>;
  /** Props for the hidden native input element. */
  inputProps: Record<string, unknown>;
  /** Props for the description element. */
  descriptionProps: Record<string, unknown>;
  /** Props for the error message element. */
  errorMessageProps: Record<string, unknown>;
  /** Whether the field is currently invalid. */
  isInvalid: boolean;
  /** The current error messages for the field, if invalid. */
  validationErrors: string[];
  /** The native validity state for the field. */
  validationDetails: ValidityState;
}

/**
 * Provides the behavior and accessibility implementation for a date field.
 */
export function createDateField<T extends DateFieldState>(
  props: MaybeAccessor<AriaDateFieldProps>,
  state: T,
  ref: () => HTMLElement | null,
): DateFieldAria {
  const getProps = () => access(props);

  const isPresentation = () => getProps()[roleSymbol] === "presentation";

  const field = createField(() => {
    const p = getProps();
    const dv = state.displayValidation();
    return {
      id: p.id,
      label: p.label,
      "aria-label": p["aria-label"],
      "aria-labelledby": p["aria-labelledby"],
      "aria-describedby": p["aria-describedby"],
      description: p.description,
      labelElementType: "span",
      isInvalid: dv.isInvalid,
      errorMessage: p.errorMessage || dv.validationErrors,
    };
  });

  // Track the value on focus so we only commit validation when it actually changed.
  let valueOnFocus: unknown = null;
  const { focusWithinProps } = createFocusWithin({
    get isDisabled() {
      return getProps().isDisabled;
    },
    onFocusWithin(e) {
      valueOnFocus = state.value();
      getProps().onFocus?.(e);
    },
    onBlurWithin(e) {
      state.confirmPlaceholder();
      if (state.value() !== valueOnFocus) {
        state.commitValidation();
      }
      getProps().onBlur?.(e);
    },
    onFocusWithinChange(isFocused) {
      getProps().onFocusChange?.(isFocused);
    },
  });

  const stringFormatter = createStringFormatter(datePickerStrings, "@react-aria/datepicker");
  const description = createMemo(() => {
    const value = state.value();
    if (!value) {
      return "";
    }
    const message =
      state.maxGranularity === "hour" ? "selectedTimeDescription" : "selectedDateDescription";
    const fieldKey = state.maxGranularity === "hour" ? "time" : "date";
    return stringFormatter().format(message, {
      [fieldKey]: state.formatValue({ month: "long" }),
    });
  });
  const descProps = createDescription(description);

  // Within a date picker the field is role="presentation" and inherits the
  // picker's own describedby; standalone it appends its own value description.
  const describedBy = (): string | undefined => {
    const fp = field.fieldProps as Record<string, string | undefined>;
    if (isPresentation()) {
      return fp["aria-describedby"];
    }
    return (
      [descProps["aria-describedby"], fp["aria-describedby"]].filter(Boolean).join(" ") || undefined
    );
  };

  const propsFocusManager = getProps()[focusManagerSymbol] as FocusManager | undefined;
  const focusManager = propsFocusManager || createFocusManager(ref);

  const groupProps = createDatePickerGroup(
    state as unknown as { setOpen?: (isOpen: boolean) => void },
    ref,
    isPresentation(),
  );

  // Publish labels and the focus manager to the segments.
  const labelId = (field.labelProps as Record<string, string | undefined>).id;
  hookData.set(state as unknown as object, {
    ariaLabel: getProps()["aria-label"],
    ariaLabelledBy: [labelId, getProps()["aria-labelledby"]].filter(Boolean).join(" ") || undefined,
    ariaDescribedBy: describedBy,
    focusManager,
  });

  // Auto focus the first segment on mount when requested.
  onMount(() => {
    if (getProps().autoFocus) {
      focusManager.focusFirst();
    }
  });

  // Form reset + native validation wiring.
  if (props && typeof props === "object") {
    createFormReset(
      () => getProps().inputRef?.(),
      state.defaultValue,
      state.setValue as (value: unknown) => void,
    );
    createFormValidation(
      {
        get validationBehavior() {
          return getProps().validationBehavior;
        },
        focus() {
          focusManager.focusFirst();
        },
      },
      state as unknown as Parameters<typeof createFormValidation>[1],
      () => getProps().inputRef?.() as unknown as undefined,
    );
  }

  const fieldDOMProps = createMemo(() => {
    if (isPresentation()) {
      return { role: "presentation" };
    }
    return mergeProps(field.fieldProps as Record<string, unknown>, {
      role: "group",
      "aria-disabled": getProps().isDisabled || undefined,
      "aria-describedby": describedBy(),
    });
  });

  const fieldProps = createMemo(() => {
    const p = getProps();
    const domProps = filterDOMProps(p as Record<string, unknown>);
    return mergeProps(
      domProps as Record<string, unknown>,
      fieldDOMProps(),
      groupProps(),
      // In Solid, onFocus/onBlur do not bubble, so the group (which only ever
      // receives focus from its segment descendants) must listen via the
      // bubbling onFocusIn/onFocusOut events instead.
      {
        onFocusIn: focusWithinProps.onFocus,
        onFocusOut: focusWithinProps.onBlur,
      },
      {
        onKeyDown(e: KeyboardEvent) {
          getProps().onKeyDown?.(e);
        },
        onKeyUp(e: KeyboardEvent) {
          getProps().onKeyUp?.(e);
        },
        style: { unicodeBidi: "isolate" as const },
      },
    );
  });

  const inputProps = createMemo(() => {
    const p = getProps();
    const value = state.value();
    const base: Record<string, unknown> = {
      type: "hidden",
      name: p.name,
      form: p.form,
      value: value?.toString() || "",
      disabled: p.isDisabled,
    };
    if (p.validationBehavior === "native") {
      // Use a hidden <input type="text"> rather than <input type="hidden"> so
      // that an empty value blocks HTML form submission when the field is
      // required. Mirrors @react-aria/datepicker useDateField.
      base.type = "text";
      base.hidden = true;
      base.required = p.isRequired;
      // Ignore the controlled-without-onChange warning.
      base.onChange = () => {};
    }
    return base;
  });

  const displayValidation = () => state.displayValidation();

  return {
    get labelProps() {
      return {
        ...(field.labelProps as Record<string, unknown>),
        onClick: () => {
          focusManager.focusFirst();
        },
      };
    },
    get fieldProps() {
      return fieldProps();
    },
    get inputProps() {
      return inputProps();
    },
    get descriptionProps() {
      return field.descriptionProps as Record<string, unknown>;
    },
    get errorMessageProps() {
      return field.errorMessageProps as Record<string, unknown>;
    },
    get isInvalid() {
      return displayValidation().isInvalid;
    },
    get validationErrors() {
      return displayValidation().validationErrors;
    },
    get validationDetails() {
      return displayValidation().validationDetails;
    },
  };
}
