/**
 * HiddenDateInput component for solidaria-components
 *
 * A hidden native date/datetime-local input for form submission.
 * Renders server-side with the initial value for SSR safety.
 */
import { type JSX, createEffect, createSignal } from "solid-js";
import { type DateValue, type FormValidationState } from "@proyecto-viviana/solid-stately";
import { createFormValidation } from "@proyecto-viviana/solidaria";

type MaybeAccessor<T> = T | (() => T);

export interface HiddenDateInputProps {
  name?: string;
  form?: string;
  value?: MaybeAccessor<DateValue | null | undefined>;
  autoComplete?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  validationState?: FormValidationState;
  focus?: () => void;
  minValue?: MaybeAccessor<DateValue | undefined>;
  maxValue?: MaybeAccessor<DateValue | undefined>;
  granularity?: "day" | "hour" | "minute" | "second";
}

function accessValue<T>(value: MaybeAccessor<T> | undefined): T | undefined {
  return typeof value === "function" ? (value as () => T)() : value;
}

function formatDateValue(
  value: DateValue | undefined | null,
  granularity: "day" | "hour" | "minute" | "second",
): string {
  if (!value) return "";

  if ("timeZone" in value) {
    return String(value);
  }

  const dateValue = value;

  const year = String(dateValue.year).padStart(4, "0");
  const month = String(dateValue.month).padStart(2, "0");
  const day = String(dateValue.day).padStart(2, "0");

  if (granularity === "day") {
    return `${year}-${month}-${day}`;
  }

  const hasHour = "hour" in dateValue;
  const hour = hasHour ? String((dateValue as { hour: number }).hour).padStart(2, "0") : "00";
  const hasMinute = hasHour && "minute" in dateValue;
  const minute = hasMinute
    ? String((dateValue as { minute: number }).minute).padStart(2, "0")
    : "00";

  if (granularity === "second" && hasMinute && "second" in dateValue) {
    const second = String((dateValue as { second: number }).second).padStart(2, "0");
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  }

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function HiddenDateInput(props: HiddenDateInputProps): JSX.Element {
  const granularity = () => props.granularity ?? "day";
  const hasValidationBehavior = () => props.validationBehavior != null;
  const validationBehavior = () => props.validationBehavior;
  const usesNativeValidation = () => validationBehavior() === "native";
  const value = () => accessValue(props.value);
  const minValue = () => accessValue(props.minValue);
  const maxValue = () => accessValue(props.maxValue);
  const hasTimeZoneValue = () =>
    Boolean(
      (value() && "timeZone" in value()!) ||
      (minValue() && "timeZone" in minValue()!) ||
      (maxValue() && "timeZone" in maxValue()!),
    );
  const inputType = () =>
    usesNativeValidation()
      ? "text"
      : hasValidationBehavior()
        ? "hidden"
        : hasTimeZoneValue()
          ? "hidden"
          : granularity() === "day"
            ? "date"
            : "datetime-local";
  const formattedValue = () => formatDateValue(value(), granularity());
  const formattedMin = () => formatDateValue(minValue(), granularity());
  const formattedMax = () => formatDateValue(maxValue(), granularity());

  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();

  if (props.validationState) {
    createFormValidation(
      {
        get validationBehavior() {
          return validationBehavior();
        },
        get focus() {
          return props.focus;
        },
      },
      props.validationState,
      inputRef,
    );
  }

  createEffect(() => {
    const val = formattedValue();
    const input = inputRef();
    if (input && input.value !== val) {
      input.value = val;
    }
  });

  return (
    <input
      ref={(el) => {
        setInputRef(el);
      }}
      type={inputType()}
      name={props.name}
      form={props.form}
      value={formattedValue()}
      autocomplete={props.autoComplete}
      disabled={props.isDisabled}
      required={usesNativeValidation() && props.isRequired ? true : undefined}
      hidden={usesNativeValidation() || undefined}
      min={hasValidationBehavior() ? undefined : formattedMin() || undefined}
      max={hasValidationBehavior() ? undefined : formattedMax() || undefined}
      onChange={usesNativeValidation() ? () => {} : undefined}
      tabIndex={-1}
      aria-hidden="true"
      style={
        {
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: "0",
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          "white-space": "nowrap",
          "border-width": "0",
        } as JSX.CSSProperties
      }
    />
  );
}
