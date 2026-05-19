/**
 * createTimeField hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a time field component.
 * Based on @react-aria/datepicker useTimeField
 */

import { createMemo } from "solid-js";
import { createId } from "../ssr";
import { createLabel } from "../label/createLabel";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { mergeProps } from "../utils/mergeProps";
import type { TimeFieldState, TimeSegment, TimeValue } from "@proyecto-viviana/solid-stately";

export interface AriaTimeFieldProps {
  /** An ID for the time field. */
  id?: string;
  /** A visible label for the time field. */
  label?: string;
  /** An accessible label for the time field. */
  "aria-label"?: string;
  /** The ID of an element that labels the time field. */
  "aria-labelledby"?: string;
  /** The ID of an element that describes the time field. */
  "aria-describedby"?: string;
  /** Whether the time field is disabled. */
  isDisabled?: boolean;
  /** Whether the time field is read-only. */
  isReadOnly?: boolean;
  /** Whether the time field is required. */
  isRequired?: boolean;
  /** Whether the time field is invalid. */
  isInvalid?: boolean;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** The name of the input element, used when submitting an HTML form. */
  name?: string;
  /** The id of the form the hidden input belongs to. */
  form?: string;
  /** Describes the autocomplete behavior for the hidden input. */
  autoComplete?: string;
}

export interface TimeFieldAria {
  /** Props for the label element. */
  labelProps: Record<string, unknown>;
  /** Props for the field container element. */
  fieldProps: Record<string, unknown>;
  /** Props for the input container (holds segments). */
  inputProps: Record<string, unknown>;
  /** Props for the description element. */
  descriptionProps: Record<string, unknown>;
  /** Props for the error message element. */
  errorMessageProps: Record<string, unknown>;
  /** The segments to render. */
  segments: TimeSegment[];
}

/**
 * Provides the behavior and accessibility implementation for a time field component.
 */
export function createTimeField<T extends TimeFieldState<TimeValue>>(
  props: MaybeAccessor<AriaTimeFieldProps>,
  state: T,
  _ref?: () => HTMLElement | null,
): TimeFieldAria {
  const getProps = () => access(props);
  const id = createId(getProps().id);
  const descriptionId = createId();
  const errorMessageId = createId();

  // Create label handling
  const { labelProps, fieldProps: labelFieldProps } = createLabel({
    get label() {
      return getProps().label;
    },
    get "aria-label"() {
      return getProps()["aria-label"];
    },
    get "aria-labelledby"() {
      return getProps()["aria-labelledby"];
    },
    labelElementType: "span",
  });

  // Build aria-describedby
  const getAriaDescribedBy = () => {
    const p = getProps();
    const ids: string[] = [];
    if (p["aria-describedby"]) {
      ids.push(p["aria-describedby"]);
    }
    if (p.description) {
      ids.push(descriptionId);
    }
    if ((p.isInvalid || state.isInvalid()) && p.errorMessage) {
      ids.push(errorMessageId);
    }
    return ids.length > 0 ? ids.join(" ") : undefined;
  };

  // Segments from state
  const segments = createMemo(() => state.segments());

  // Field container props
  const fieldProps = createMemo(() => {
    const p = getProps();

    return mergeProps(labelFieldProps as Record<string, unknown>, {
      id,
      role: "group",
      "aria-disabled": p.isDisabled || state.isDisabled() || undefined,
      "aria-readonly": p.isReadOnly || state.isReadOnly() || undefined,
      "aria-required": p.isRequired || state.isRequired() || undefined,
      "aria-invalid": p.isInvalid || state.isInvalid() || undefined,
      "aria-describedby": getAriaDescribedBy(),
    });
  });

  // Input container props
  const inputProps = createMemo(() => ({
    role: "presentation",
  }));

  // Description props
  const descriptionProps = createMemo(() => ({
    id: descriptionId,
  }));

  // Error message props
  const errorMessageProps = createMemo(() => ({
    id: errorMessageId,
    role: "alert",
  }));

  return {
    get labelProps() {
      return labelProps as Record<string, unknown>;
    },
    get fieldProps() {
      return fieldProps();
    },
    get inputProps() {
      return inputProps();
    },
    get descriptionProps() {
      return descriptionProps();
    },
    get errorMessageProps() {
      return errorMessageProps();
    },
    get segments() {
      return segments();
    },
  };
}
