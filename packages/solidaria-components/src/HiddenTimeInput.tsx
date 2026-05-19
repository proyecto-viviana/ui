/**
 * HiddenTimeInput component for solidaria-components
 *
 * A hidden native time input for form submission.
 */
import { type JSX, createEffect } from "solid-js";
import { type TimeValue } from "@proyecto-viviana/solid-stately";

export interface HiddenTimeInputProps {
  name?: string;
  form?: string;
  value?: TimeValue | null;
  autoComplete?: string;
  isDisabled?: boolean;
  minValue?: TimeValue;
  maxValue?: TimeValue;
  granularity?: "hour" | "minute" | "second";
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
  const formattedValue = () => formatTimeValue(props.value, granularity());
  const formattedMin = () => formatTimeValue(props.minValue, granularity());
  const formattedMax = () => formatTimeValue(props.maxValue, granularity());

  let inputRef: HTMLInputElement | undefined;

  createEffect(() => {
    const val = formattedValue();
    if (inputRef && inputRef.value !== val) {
      inputRef.value = val;
    }
  });

  return (
    <input
      ref={(el) => {
        inputRef = el;
      }}
      type="time"
      name={props.name}
      form={props.form}
      value={formattedValue()}
      autocomplete={props.autoComplete}
      disabled={props.isDisabled}
      min={formattedMin() || undefined}
      max={formattedMax() || undefined}
      step={stepForGranularity(granularity())}
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
