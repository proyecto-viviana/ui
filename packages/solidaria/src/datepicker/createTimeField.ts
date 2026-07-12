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
import {
  createDateField,
  type AriaDateFieldProps,
  type DateFieldAria,
} from "./createDateField";
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
