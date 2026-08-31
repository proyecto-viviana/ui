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
 * createTimeField hook for Solidaria
 *
 * Faithful port of `@react-aria/datepicker` `useTimeField`, which is a thin
 * wrapper over `useDateField`: it delegates entirely to the date-field behavior
 * and only rewrites `inputProps.value` to the value in the `Time` domain
 * (`state.timeValue`) so the hidden form input submits e.g. "09:30:00" rather
 * than the anchored `CalendarDateTime` string. TimeField reuses the certified
 * DateField segment/group behavior wholesale — there is no parallel time hook.
 */

import { access, type MaybeAccessor } from "../utils/reactivity";
import { createDateField, type AriaDateFieldProps, type DateFieldAria } from "./createDateField";
import type { TimeFieldState, TimeValue } from "@proyecto-viviana/solid-stately";

export type AriaTimeFieldProps = AriaDateFieldProps;
export type TimeFieldAria = DateFieldAria;

/**
 * Provides the behavior and accessibility implementation for a time field.
 */
export function createTimeField<T extends TimeFieldState<TimeValue>>(
  props: MaybeAccessor<AriaTimeFieldProps>,
  state: T,
  ref: () => HTMLElement | null,
): TimeFieldAria {
  // TimeFieldState IS a DateFieldState (plus `timeValue`), so it drives the
  // certified date-field behavior directly.
  const res = createDateField(props, state, ref);

  // Delegate every prop bag via getters (spreading would freeze the reactive
  // getters). Only `inputProps.value` is rewritten to the Time-domain value.
  return {
    get labelProps() {
      return res.labelProps;
    },
    get fieldProps() {
      return res.fieldProps;
    },
    get inputProps() {
      // Ignore access() lint: state.timeValue is a plain accessor.
      void access;
      return { ...res.inputProps, value: state.timeValue()?.toString() || "" };
    },
    get descriptionProps() {
      return res.descriptionProps;
    },
    get errorMessageProps() {
      return res.errorMessageProps;
    },
    get isInvalid() {
      return res.isInvalid;
    },
    get validationErrors() {
      return res.validationErrors;
    },
    get validationDetails() {
      return res.validationDetails;
    },
  };
}
