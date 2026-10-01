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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/radio/useRadioGroup.ts

/**
 * Radio group hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 *
 * This is a 1:1 port of @react-aria/radio's useRadioGroup hook.
 */

import { createTrackedEffect } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createField } from "../label/createField";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { createKeyboard } from "../interactions/createKeyboard";
import { mergeProps } from "../utils/mergeProps";
import { filterDOMProps } from "../utils/filterDOMProps";
import { getEventTarget, getFocusableTreeWalker, getOwnerWindow } from "../utils";
import { useLocale } from "../i18n";
import { createId } from "../ssr";
import { type MaybeAccessor, access } from "../utils/reactivity";
import { type RadioGroupState, type ValidityState } from "@proyecto-viviana/solid-stately";

export interface AriaRadioGroupProps {
  /** The content to display as the label. */
  label?: JSX.Element;
  /** A description for the radio group. Provides additional context. */
  description?: JSX.Element;
  /** An error message for the radio group. */
  errorMessage?:
    | JSX.Element
    | ((validation: { isInvalid: boolean; validationErrors: string[] }) => JSX.Element);
  /** Whether the radio group is disabled. */
  isDisabled?: boolean;
  /** Whether the radio group is read only. */
  isReadOnly?: boolean;
  /** Whether the radio group is required. */
  isRequired?: boolean;
  /** Whether the radio group is invalid. */
  isInvalid?: boolean;
  /** The axis the Radio Button(s) should align with. Defaults to 'vertical'. */
  orientation?: "horizontal" | "vertical";
  /** The name of the radio group, used when submitting an HTML form. */
  name?: string;
  /** The form to associate the radio group with. */
  form?: string;
  /** Validation behavior for the radio group. */
  validationBehavior?: "aria" | "native";
  /** Handler that is called when the radio group receives focus. */
  onFocus?: (e: FocusEvent) => void;
  /** Handler that is called when the radio group loses focus. */
  onBlur?: (e: FocusEvent) => void;
  /** Handler that is called when the radio group's focus status changes. */
  onFocusChange?: (isFocused: boolean) => void;
  /** Defines a string value that labels the current element. */
  "aria-label"?: string;
  /** Identifies the element (or elements) that labels the current element. */
  "aria-labelledby"?: string;
  /** Identifies the element (or elements) that describes the object. */
  "aria-describedby"?: string;
  /** Identifies the element (or elements) that provide an error message for the object. */
  "aria-errormessage"?: string;
  /** The element's unique identifier. */
  id?: string;
}

export interface RadioGroupAria {
  /** Props for the radio group wrapper element. */
  radioGroupProps: JSX.HTMLAttributes<HTMLDivElement>;
  /** Props for the radio group's visible label (if any). */
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the radio group description element, if any. */
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  /** Props for the radio group error message element, if any. */
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  /** Whether the radio group is invalid. */
  isInvalid: boolean;
  /** Validation errors, if any. */
  validationErrors: string[];
  /** Validation details, if any. */
  validationDetails: ValidityState;
}

// WeakMap to share data between radio group and radio items
interface RadioGroupData {
  name: string;
  form: string | undefined;
  descriptionId: string | undefined;
  errorMessageId: string | undefined;
  validationBehavior: "aria" | "native";
}

export const radioGroupData: WeakMap<RadioGroupState, RadioGroupData> = new WeakMap();

/**
 * Provides the behavior and accessibility implementation for a radio group component.
 * Radio groups allow users to select a single item from a list of mutually exclusive options.
 */
export function createRadioGroup(
  props: MaybeAccessor<AriaRadioGroupProps>,
  state: RadioGroupState,
): RadioGroupAria {
  const getProps = () => access(props);
  const locale = useLocale();

  const orientation = () => getProps().orientation ?? "vertical";
  const isReadOnly = () => getProps().isReadOnly ?? false;
  const isRequired = () => getProps().isRequired ?? false;
  const isDisabled = () => getProps().isDisabled ?? false;
  const validationBehavior = () => getProps().validationBehavior ?? "native";
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
  // `aria-describedby` must reach `createField` so slot ids concatenate with
  // the user prop instead of overwriting it (`useField.ts:51-60`).
  const field = createField({
    get id() {
      return getProps().id;
    },
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
    get description() {
      return getProps().description;
    },
    get errorMessage() {
      return getProps().errorMessage ?? fallbackErrorMessage();
    },
    get isInvalid() {
      return isInvalid();
    },
    // Radio group is not an HTML input element so it
    // shouldn't be labeled by a <label> element.
    labelElementType: "span",
  });

  // Handle focus within - reset focusable radio when group loses focus and no selection
  const { focusWithinProps } = createFocusWithin({
    onBlurWithin(e: FocusEvent) {
      getProps().onBlur?.(e);
      if (!state.selectedValue()) {
        state.setLastFocusedValue(null);
      }
    },
    onFocusWithin: (e: FocusEvent) => getProps().onFocus?.(e),
    onFocusWithinChange: (isFocused: boolean) => getProps().onFocusChange?.(isFocused),
  });

  const domProps = () =>
    filterDOMProps(getProps() as unknown as Record<string, unknown>, { labelable: true });

  const groupName = getProps().name ?? createId();

  const updateRadioGroupData = () => {
    radioGroupData.set(state, {
      name: groupName,
      form: getProps().form,
      descriptionId:
        typeof field.descriptionProps.id === "string" ? field.descriptionProps.id : undefined,
      errorMessageId:
        typeof field.errorMessageProps.id === "string" ? field.errorMessageProps.id : undefined,
      validationBehavior: validationBehavior(),
    });
  };
  updateRadioGroupData();
  createTrackedEffect(updateRadioGroupData);

  const getNextElement = (nextDir: "next" | "prev", e: KeyboardEvent): boolean => {
    const root = e.currentTarget;
    if (!(root instanceof HTMLElement)) {
      return false;
    }

    const walker = getFocusableTreeWalker(root, {
      from: getEventTarget<Element>(e) ?? undefined,
      accept: (node) =>
        node instanceof getOwnerWindow(node).HTMLInputElement &&
        (node as HTMLInputElement).type === "radio",
    });

    let nextElem: Node | null;
    if (nextDir === "next") {
      nextElem = walker.nextNode();
      if (!nextElem) {
        walker.currentNode = root;
        nextElem = walker.firstChild();
      }
    } else {
      nextElem = walker.previousNode();
      if (!nextElem) {
        walker.currentNode = root;
        nextElem = walker.lastChild();
      }
    }

    if (
      nextElem instanceof getOwnerWindow(nextElem).HTMLInputElement &&
      nextElem.type === "radio"
    ) {
      // Native focus so keyboard navigation scrolls the radio into view.
      nextElem.focus();
      state.setSelectedValue(nextElem.value);
      return true;
    }
    return false;
  };

  // Pin useKeyboard: a shortcut that returns true prevents default and stops
  // propagation. Returning false (no radio to move to) lets the arrow bubble.
  const { keyboardProps } = createKeyboard({
    allowRepeats: true,
    shortcuts: {
      ArrowRight: (e) => {
        const nextDir: "next" | "prev" =
          locale().direction === "rtl" && orientation() !== "vertical" ? "prev" : "next";
        return getNextElement(nextDir, e);
      },
      ArrowLeft: (e) => {
        const nextDir: "next" | "prev" =
          locale().direction === "rtl" && orientation() !== "vertical" ? "next" : "prev";
        return getNextElement(nextDir, e);
      },
      ArrowDown: (e) => getNextElement("next", e),
      ArrowUp: (e) => getNextElement("prev", e),
    },
  });

  return {
    get radioGroupProps() {
      return mergeProps(
        domProps(),
        focusWithinProps as unknown as Record<string, unknown>,
        {
          role: "radiogroup",
          "aria-invalid": isInvalid() || undefined,
          "aria-errormessage": getProps()["aria-errormessage"],
          "aria-readonly": isReadOnly() || undefined,
          "aria-required": isRequired() || undefined,
          "aria-disabled": isDisabled() || undefined,
          "aria-orientation": orientation(),
          ...field.fieldProps,
        },
        keyboardProps,
      ) as JSX.HTMLAttributes<HTMLDivElement>;
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
