/**
 * HiddenTimeInput component for solidaria-components
 *
 * A hidden native time input for form submission.
 */
import { type JSX, createEffect, createSignal } from "solid-js";
import { type FormValidationState, type TimeValue } from "@proyecto-viviana/solid-stately";
import { createFormValidation } from "@proyecto-viviana/solidaria";

type MaybeAccessor<T> = T | (() => T);

export interface HiddenTimeInputProps {
  name?: string;
  form?: string;
  value?: MaybeAccessor<TimeValue | null | undefined>;
  autoComplete?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  validationBehavior?: "aria" | "native";
  validationState?: FormValidationState;
  focus?: () => void;
  minValue?: MaybeAccessor<TimeValue | undefined>;
  maxValue?: MaybeAccessor<TimeValue | undefined>;
  granularity?: "hour" | "minute" | "second";
}

function accessValue<T>(value: MaybeAccessor<T> | undefined): T | undefined {
  return typeof value === "function" ? (value as () => T)() : value;
}

function formatTimeValue(
  value: TimeValue | undefined | null,
  granularity: "hour" | "minute" | "second",
): string {
  if (!value) return "";

  const hour = String(value.hour).padStart(2, "0");
  const minute = String(granularity === "hour" ? 0 : value.minute).padStart(2, "0");

  if (granularity === "second") {
    const second = String(value.second).padStart(2, "0");
    return `${hour}:${minute}:${second}`;
  }

  return `${hour}:${minute}`;
}

function stepForGranularity(granularity: "hour" | "minute" | "second"): number {
  switch (granularity) {
    case "hour":
      return 3600;
    case "second":
      return 1;
    case "minute":
    default:
      return 60;
  }
}

export function HiddenTimeInput(props: HiddenTimeInputProps): JSX.Element {
  const granularity = () => props.granularity ?? "minute";
  const hasValidationBehavior = () => props.validationBehavior != null;
  const validationBehavior = () => props.validationBehavior;
  const usesNativeValidation = () => validationBehavior() === "native";
  const value = () => accessValue(props.value);
  const minValue = () => accessValue(props.minValue);
  const maxValue = () => accessValue(props.maxValue);
  const inputType = () =>
    usesNativeValidation() ? "text" : hasValidationBehavior() ? "hidden" : "time";
  const formattedValue = () => formatTimeValue(value(), granularity());
  const formattedMin = () => formatTimeValue(minValue(), granularity());
  const formattedMax = () => formatTimeValue(maxValue(), granularity());

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
      step={hasValidationBehavior() ? undefined : stepForGranularity(granularity())}
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
