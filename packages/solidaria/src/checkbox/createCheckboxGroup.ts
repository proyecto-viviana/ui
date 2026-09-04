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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/checkbox/useCheckboxGroup.ts

/**
 * Checkbox group hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 *
 * This is a 1:1 port of @react-aria/checkbox's useCheckboxGroup hook.
 */

import { JSX, createEffect } from "solid-js";
import { createField } from "../label";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";
import { type MaybeAccessor, access } from "../utils/reactivity";
import {
  type CheckboxGroupState,
  type CheckboxGroupProps,
  type ValidityState,
} from "@proyecto-viviana/solid-stately";

export interface AriaCheckboxGroupProps extends CheckboxGroupProps {
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide a detailed, extended description for the object. */
  "aria-details"?: string;
  /** A description for the field. Provides a hint such as specific requirements for what to choose. */
  description?: JSX.Element;
  /** An error message for the field. */
  errorMessage?: JSX.Element;
}

export interface CheckboxGroupAria {
  /** Props for the checkbox group wrapper element. */
  groupProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the checkbox group's visible label (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the checkbox group description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the checkbox group error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the checkbox group is invalid. */
  isInvalid: boolean;
  /** Validation errors, if any. */
  validationErrors: string[];
  /** Validation details, if any. */
  validationDetails: ValidityState;
}

// WeakMap to share data between checkbox group and checkbox group items
export const checkboxGroupData = new WeakMap<
  CheckboxGroupState,
  {
    name?: string;
    form?: string;
    descriptionId?: string;
    errorMessageId?: string;
    validationBehavior: "aria" | "native";
  }
>();

/**
 * Provides the behavior and accessibility implementation for a checkbox group component.
 * Checkbox groups allow users to select multiple items from a list of options.
 *
 * @param props - Props for the checkbox group.
 * @param state - State for the checkbox group, as returned by `createCheckboxGroupState`.
 */
export function createCheckboxGroup(
  props: MaybeAccessor<AriaCheckboxGroupProps>,
  state: CheckboxGroupState,
): CheckboxGroupAria {
  const getProps = () => access(props);
  const displayValidation = () => state.displayValidation();
  const validationErrors = () => displayValidation().validationErrors;
  const validationDetails = () => displayValidation().validationDetails;

  const isInvalid = () => displayValidation().isInvalid;
  const fallbackErrorMessage = () => {
    const errors = validationErrors();
    return errors.length > 0 ? errors : undefined;
  };

  // Keep the `createField` getters intact. Destructuring `fieldProps` would
  // freeze the first `aria-describedby` snapshot (RAC `useField.ts:51-60`).
  const field = createField({
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    get "aria-describedby"() {
      return getProps()["aria-describedby"];
    },
    get "aria-details"() {
      return getProps()["aria-details"];
    },
    get description() {
      return getProps().description;
    },
    get errorMessage() {
      return getProps().errorMessage ?? fallbackErrorMessage();
    },
    get isInvalid() {
      return isInvalid();
    },
    // Checkbox group is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: "span",
  });

  const updateCheckboxGroupData = () => {
    checkboxGroupData.set(state, {
      name: getProps().name,
      form: getProps().form,
      descriptionId: field.descriptionProps.id,
      errorMessageId: field.errorMessageProps.id,
      validationBehavior: getProps().validationBehavior ?? "native",
    });
  };

  // Store group metadata synchronously for first-render children, then keep it reactive.
  updateCheckboxGroupData();
  createEffect(updateCheckboxGroupData);

  // Filter DOM props
  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  // Handle focus within
  const { focusWithinProps } = createFocusWithin({
    get onBlurWithin() {
      return getProps().onBlur;
    },
    get onFocusWithin() {
      return getProps().onFocus;
    },
    get onFocusWithinChange() {
      return getProps().onFocusChange;
    },
  });

  return {
    get groupProps() {
      return mergeProps(domProps(), {
        role: "group",
        "aria-disabled": state.isDisabled || undefined,
        ...field.fieldProps,
        ...focusWithinProps,
      }) as JSX.HTMLAttributes<HTMLElement>;
    },
    get labelProps() {
      return field.labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get descriptionProps() {
      return field.descriptionProps;
    },
    get errorMessageProps() {
      return field.errorMessageProps;
    },
    get isInvalid() {
      return isInvalid();
    },
    get validationErrors() {
      return validationErrors();
    },
    get validationDetails() {
      return validationDetails();
    },
  };
}
