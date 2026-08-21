/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/label/useField.ts

/**
 * Field hook for Solidaria
 *
 * Provides the accessibility implementation for input fields.
 * Fields accept user input, gain context from their label, and may display
 * a description or error message.
 *
 * This is a 1:1 port of @react-aria/label's useField hook.
 */

import { JSX } from "solid-js";
import { createId } from "../ssr";
import {
  createLabel,
  type LabelAriaProps,
  type LabelAria,
  type AriaLabelingProps,
  type DOMProps,
} from "./createLabel";
import { mergeProps } from "../utils/mergeProps";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface HelpTextProps {
  /** A description for the field. Provides a hint such as specific requirements for what to choose. */
  description?: JSX.Element;
  /** An error message for the field. */
  errorMessage?: JSX.Element | ((validation: ValidationResult) => JSX.Element);
}

export interface ValidationResult {
  /** Whether the input value is invalid. */
  isInvalid: boolean;
  /** The current error messages for the input if it is invalid, otherwise an empty array. */
  validationErrors: string[];
  /** The native validity state for the input. */
  validationDetails: ValidityState;
}

export interface Validation<T> {
  /** Whether the input value is invalid. */
  isInvalid?: boolean;
  /** Whether the input is required before form submission. */
  isRequired?: boolean;
  /** A function that returns an error message if a given value is invalid. */
  validate?: (value: T) => string | string[] | true | null | undefined;
}

export interface AriaFieldProps
  extends LabelAriaProps, HelpTextProps, Omit<Validation<any>, "isRequired"> {}

export interface FieldAria extends LabelAria {
  /** Props for the description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides the accessibility implementation for input fields.
 * Fields accept user input, gain context from their label, and may display
 * a description or error message.
 *
 * @param props - Props for the Field.
 */
export function createField(props: MaybeAccessor<AriaFieldProps>): FieldAria {
  const getProps = () => access(props);

  const { labelProps, fieldProps: baseLabelFieldProps } = createLabel(props);

  // Generate IDs for description and error message
  const descriptionId = createId();
  const errorMessageId = createId();

  const getDescriptionProps = (): FieldAria["descriptionProps"] => {
    const { description, errorMessage, isInvalid } = getProps();

    // Only include ID if description exists or there's an error message that might be shown
    if (!description && !errorMessage && !isInvalid) {
      return {};
    }

    return {
      id: descriptionId,
    };
  };

  const getErrorMessageProps = (): FieldAria["errorMessageProps"] => {
    const { errorMessage, isInvalid } = getProps();

    // Only include ID if there's an error message and the field is invalid
    if (!errorMessage && !isInvalid) {
      return {};
    }

    return {
      id: errorMessageId,
    };
  };

  const getFieldProps = (): AriaLabelingProps & DOMProps => {
    const { description, errorMessage, isInvalid } = getProps();

    const describedByIds: string[] = [];

    // Add description ID if description exists
    if (description) {
      describedByIds.push(descriptionId);
    }

    // Add error message ID if field is invalid and error message exists
    // Use aria-describedby for error message because aria-errormessage is unsupported
    // using VoiceOver or NVDA. See https://github.com/adobe/react-spectrum/issues/1346#issuecomment-740136268
    if (isInvalid && errorMessage) {
      describedByIds.push(errorMessageId);
    }

    // Add any existing aria-describedby from props
    const existingDescribedBy = getProps()["aria-describedby"];
    if (existingDescribedBy) {
      describedByIds.push(existingDescribedBy);
    }

    const ariaDescribedBy = describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

    return mergeProps(baseLabelFieldProps, {
      "aria-describedby": ariaDescribedBy,
    }) as AriaLabelingProps & DOMProps;
  };

  return {
    get labelProps() {
      return labelProps;
    },
    get fieldProps() {
      return getFieldProps();
    },
    get descriptionProps() {
      return getDescriptionProps();
    },
    get errorMessageProps() {
      return getErrorMessageProps();
    },
  };
}
