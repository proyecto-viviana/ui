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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/checkbox/useCheckboxGroupItem.ts

/**
 * Checkbox group item hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a checkbox component
 * contained within a checkbox group.
 *
 * This is a 1:1 port of @react-aria/checkbox's useCheckboxGroupItem hook.
 */

import { createEffect } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createCheckbox, type AriaCheckboxProps, type CheckboxAria } from "./createCheckbox";
import {
  createFormValidationState,
  privateValidationStateProp,
  DEFAULT_VALIDATION_RESULT,
  type CheckboxGroupState,
  type FormValidationState,
  type ToggleState,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { checkboxGroupData } from "./createCheckboxGroup";
import { type MaybeAccessor, access } from "../utils/reactivity";

export interface AriaCheckboxGroupItemProps extends Omit<
  AriaCheckboxProps,
  "isSelected" | "defaultSelected"
> {
  /** The value of the checkbox. */
  value: string;
}

/**
 * Provides the behavior and accessibility implementation for a checkbox component
 * contained within a checkbox group.
 *
 * @param props - Props for the checkbox.
 * @param state - State for the checkbox group, as returned by `createCheckboxGroupState`.
 * @param inputRef - A ref accessor for the HTML input element.
 */
export function createCheckboxGroupItem(
  props: MaybeAccessor<AriaCheckboxGroupItemProps>,
  state: CheckboxGroupState,
  inputRef: () => HTMLInputElement | null,
): CheckboxAria {
  const getProps = () => access(props);

  // Create toggle state that syncs with the group state
  const toggleState: ToggleState = {
    isSelected: () => state.isSelected(getProps().value),
    defaultSelected: state.defaultValue.includes(getProps().value),
    setSelected(isSelected: boolean) {
      const value = getProps().value;
      if (isSelected) {
        state.addValue(value);
      } else {
        state.removeValue(value);
      }
      getProps().onChange?.(isSelected);
    },
    toggle() {
      state.toggleValue(getProps().value);
    },
  };

  const getGroupData = () => checkboxGroupData.get(state);

  // Item-local validation. The group's own errors stay on the group state.
  // `name` stays unset so server errors are not applied twice.
  const itemValidation = createFormValidationState<boolean>({
    get value() {
      return state.isSelected(getProps().value);
    },
    get isInvalid() {
      return getProps().isInvalid;
    },
    get validate() {
      return getProps().validate;
    },
    validationBehavior: "aria",
  });

  let nativeValidation: ValidationResult = DEFAULT_VALIDATION_RESULT;

  const publish = () => {
    const realtime = itemValidation.realtimeValidation();
    state.setInvalid(getProps().value, realtime.isInvalid ? realtime : nativeValidation);
  };

  createEffect(
    () => ({
      value: getProps().value,
      realtime: itemValidation.realtimeValidation(),
    }),
    () => {
      publish();
    },
  );

  const groupRealtime = () => {
    const realtime = state.realtimeValidation();
    return realtime.isInvalid ? realtime : itemValidation.realtimeValidation();
  };

  const groupValidation: FormValidationState = {
    realtimeValidation: groupRealtime,
    displayValidation: () => {
      const behavior =
        getProps().validationBehavior ?? getGroupData()?.validationBehavior ?? "native";
      return behavior === "native" ? state.displayValidation() : groupRealtime();
    },
    updateValidation(result) {
      nativeValidation = result;
      publish();
    },
    resetValidation: () => state.resetValidation(),
    commitValidation: () => state.commitValidation(),
  };

  const checkboxProps = (): AriaCheckboxProps => {
    const p = getProps();
    const groupData = getGroupData();

    const next: AriaCheckboxProps = {
      ...p,
      isReadOnly: p.isReadOnly || state.isReadOnly,
      isDisabled: p.isDisabled || state.isDisabled,
      name: p.name ?? groupData?.name,
      form: p.form ?? groupData?.form,
      isRequired: p.isRequired ?? state.isRequired(),
      validationBehavior: p.validationBehavior ?? groupData?.validationBehavior ?? "native",
    };
    (next as unknown as Record<string, unknown>)[privateValidationStateProp] = groupValidation;
    return next;
  };

  const result = createCheckbox(checkboxProps, toggleState, inputRef);

  return {
    ...result,
    get inputProps() {
      const baseInputProps = result.inputProps;
      const groupData = getGroupData();

      // Mirror upstream useCheckboxGroupItem: keep the checkbox's own
      // aria-describedby (its description/error slot ids from createCheckbox/
      // createToggle, which already fold in the user's aria-describedby) and append
      // the group's shared description/error ids.
      const ariaDescribedBy =
        [
          baseInputProps["aria-describedby"],
          state.isInvalid && groupData?.errorMessageId ? groupData.errorMessageId : null,
          groupData?.descriptionId,
        ]
          .filter(Boolean)
          .join(" ") || undefined;

      return {
        ...baseInputProps,
        "aria-describedby": ariaDescribedBy,
      } as JSX.InputHTMLAttributes<HTMLInputElement>;
    },
  };
}
