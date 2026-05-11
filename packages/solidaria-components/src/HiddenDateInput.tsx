/**
 * HiddenDateInput component for solidaria-components
 *
 * A hidden native date/datetime-local input for form submission.
 * Renders server-side with the initial value for SSR safety.
 */
import { type JSX, createEffect } from "solid-js";
import { type DateValue, toCalendarDateTime } from "@proyecto-viviana/solid-stately";

export interface HiddenDateInputProps {
  name?: string;
  value?: DateValue | null;
  autoComplete?: string;
  isDisabled?: boolean;
  minValue?: DateValue;
  maxValue?: DateValue;
  granularity?: "day" | "hour" | "minute" | "second";
}

function formatDateValue(
  value: DateValue | undefined | null,
  granularity: "day" | "hour" | "minute" | "second",
): string {
  if (!value) return "";

  // Convert ZonedDateTime to CalendarDateTime so hidden input value is timezone-agnostic
  const dateValue = "timeZone" in value ? toCalendarDateTime(value) : value;

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
  const inputType = () => (granularity() === "day" ? "date" : "datetime-local");
  const formattedValue = () => formatDateValue(props.value as DateValue | undefined, granularity());
  const formattedMin = () => formatDateValue(props.minValue, granularity());
  const formattedMax = () => formatDateValue(props.maxValue, granularity());

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
      type={inputType()}
      name={props.name}
      value={formattedValue()}
      autocomplete={props.autoComplete}
      disabled={props.isDisabled}
      min={formattedMin() || undefined}
      max={formattedMax() || undefined}
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
