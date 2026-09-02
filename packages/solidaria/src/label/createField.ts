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
import { createSlotId } from "../ssr";
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
  extends LabelAriaProps, HelpTextProps, Omit<Validation<any>, "isRequired"> {
  /**
   * Legacy validation state. Kept as a `createSlotId` dependency so a
   * description/error slot is re-probed when this flips, matching RAC
   * `useField` (`useField.ts:38-48`).
   */
  validationState?: "valid" | "invalid";
}

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

  // Keep the label hook intact. Its `fieldProps`/`labelProps` are getters;
  // destructuring them would freeze the first labelledby snapshot.
  const labelAria = createLabel(props);

  // RAC `useField.ts:38-48`: `useSlotId` so the id exists only when an element
  // with that id is in the DOM. Deps re-probe when help-text / invalid state
  // changes (the slot may mount or unmount).
  const descriptionId = createSlotId([
    () => Boolean(getProps().description),
    () => Boolean(getProps().errorMessage),
    () => getProps().isInvalid,
    () => getProps().validationState,
  ]);
  const errorMessageId = createSlotId([
    () => Boolean(getProps().description),
    () => Boolean(getProps().errorMessage),
    () => getProps().isInvalid,
    () => getProps().validationState,
  ]);

  const getFieldProps = (): AriaLabelingProps & DOMProps => {
    // RAC `useField.ts:51-60`: description id, then error id, then the user
    // `aria-describedby`. `createSlotId` yields `undefined` when the slot is
    // not rendered, so dangling references never land on the field.
    return mergeProps(labelAria.fieldProps, {
      "aria-describedby":
        [descriptionId(), errorMessageId(), getProps()["aria-describedby"]]
          .filter(Boolean)
          .join(" ") || undefined,
    }) as AriaLabelingProps & DOMProps;
  };

  return {
    get labelProps() {
      return labelAria.labelProps;
    },
    get fieldProps() {
      return getFieldProps();
    },
    get descriptionProps() {
      return {
        id: descriptionId(),
      };
    },
    get errorMessageProps() {
      return {
        id: errorMessageId(),
      };
    },
  };
}
