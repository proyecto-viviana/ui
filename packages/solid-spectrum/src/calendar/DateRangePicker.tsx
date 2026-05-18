// @ts-nocheck - DateRangePicker still depends on the headless range-field model rather than
// slot-based DateInput segments; the remaining type cleanup belongs with that parity pass.
import { type JSX, createMemo, Show, splitProps } from "solid-js";
import {
  DateRangePicker as HeadlessDateRangePicker,
  DateRangePickerLabel as HeadlessDateRangePickerLabel,
  DateRangePickerDescription as HeadlessDateRangePickerDescription,
  DateRangePickerErrorMessage as HeadlessDateRangePickerErrorMessage,
  DateRangePickerButton,
  DateRangePickerContent,
  useDateRangePickerContext,
  type DateRangePickerProps as HeadlessDateRangePickerProps,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import { RangeCalendar } from "./RangeCalendar";
import { baseColor, focusRing, fontRelative, lightDark, setColorScheme, style } from "../s2-style";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import S2CalendarIcon from "../icon/s2wf-icons/CalendarIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps, useTheme } from "../provider";
import {
  control,
  controlBorderRadius,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";

export type DateRangePickerSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type NormalizedDateRangePickerSize = "S" | "M" | "L" | "XL";

export interface DateRangePickerProps<T extends DateValue = DateValue> extends Omit<
  HeadlessDateRangePickerProps<T>,
  "class" | "style" | "children"
> {
  /** The size of the picker. @default 'M' */
  size?: DateRangePickerSize;
  /** Additional CSS class name. */
  class?: string;
  /** Label for the field. */
  label?: string;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** The maximum number of months to display in the range calendar popover. */
  maxVisibleMonths?: number;
}

function normalizeDateRangePickerSize(
  size: DateRangePickerSize | undefined,
): NormalizedDateRangePickerSize {
  switch (size) {
    case "S":
    case "sm":
      return "S";
    case "L":
    case "lg":
      return "L";
    case "XL":
      return "XL";
    case "M":
    case "md":
    default:
      return "M";
  }
}

function requiredIconStyle(size: NormalizedDateRangePickerSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

const popoverEnterStyle: JSX.CSSProperties = {
  animation: "s2-datepicker-popover-in 200ms cubic-bezier(0.45, 0, 0.4, 1)",
  "max-height": "none",
};

const dateRangePickerRoot = style(
  {
    ...field(),
    position: "relative",
  },
  getAllowedOverrides(),
);

const dateRangePickerLabelWrapper = style({
  gridArea: "label",
  display: "inline",
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
  },
});

const dateRangePickerLabel = style<any>({
  ...fieldLabel(),
});

const dateRangePickerFieldGroup = style({
  ...focusRing(),
  ...control({ shape: "default" }),
  ...fieldInput(),
  borderWidth: 2,
  borderStyle: "solid",
  transition: "default",
  textWrap: "nowrap",
  paddingStart: "edge-to-text",
  paddingEnd: {
    size: {
      S: 2,
      M: 4,
      L: "[6px]",
      XL: "[6px]",
    },
  },
  backgroundColor: {
    default: baseColor("gray-25"),
    forcedColors: "Field",
  },
  borderColor: {
    default: baseColor("gray-300"),
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isFocusWithin: {
      default: "gray-900",
      isInvalid: "negative-1000",
      forcedColors: "Highlight",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: "ButtonText",
  },
  cursor: {
    default: "text",
    isDisabled: "default",
  },
  display: "flex",
  alignItems: "center",
  minWidth: 0,
});

const dateRangePickerFieldPart = style<{ isPlaceholder?: boolean; isDisabled?: boolean }>({
  outlineStyle: "none",
  minWidth: 0,
  flexGrow: 1,
  flexShrink: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  color: {
    default: "neutral",
    isPlaceholder: "neutral-subdued",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isDisabled: "GrayText",
    },
  },
});

const dateRangeSeparator = style({
  flexShrink: 0,
  paddingX: 2,
  color: "neutral-subdued",
});

const fieldErrorIcon = style({
  size: fontRelative(20),
  marginStart: "text-to-visual",
  marginEnd: fontRelative(-2),
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "negative",
      forcedColors: "Mark",
    },
  },
});

const requiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const calendarIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  size: fontRelative(14),
});

const noWrap = style({
  whiteSpace: "nowrap",
});

const calendarButton = style<{
  isOpen?: boolean;
  isDisabled?: boolean;
  size: NormalizedDateRangePickerSize;
}>({
  ...focusRing(),
  ...controlBorderRadius("sm"),
  position: "relative",
  font: {
    size: {
      S: "ui-sm",
      M: "ui",
      L: "ui-lg",
      XL: "ui-xl",
    },
  },
  cursor: "default",
  display: "flex",
  textAlign: "center",
  borderStyle: "none",
  padding: 0,
  alignItems: "center",
  justifyContent: "center",
  width: {
    size: {
      S: 16,
      M: 20,
      L: 24,
      XL: 32,
    },
  },
  height: "auto",
  marginStart: "text-to-control",
  aspectRatio: "square",
  flexShrink: 0,
  transition: {
    default: "default",
    forcedColors: "none",
  },
  backgroundColor: {
    default: baseColor("gray-100"),
    isOpen: "gray-200",
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isHovered: "Highlight",
      isOpen: "Highlight",
      isDisabled: "GrayText",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: "ButtonFace",
  },
});

const helpText = style<{ isInvalid?: boolean; isDisabled?: boolean }>({
  gridArea: "helptext",
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
});

const dateRangePickerPopover = style<{ colorScheme: "light" | "dark" | "light dark" }>({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "layer-2",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  boxShadow: "elevated",
  borderRadius: "lg",
  display: "flex",
  width: "[max-content]",
  padding: 0,
  minHeight: 0,
  overflow: "visible",
  boxSizing: "border-box",
  isolation: "isolate",
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
});

const dateRangePickerPopoverFrame = style({
  paddingX: 16,
  paddingY: 24,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "content-box",
  width: "[max-content]",
});

function formatRangeDate(date: DateValue | null | undefined, locale: string, timeZone: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date.toDate(timeZone));
}

function DateRangeDisplay(props: {
  size: NormalizedDateRangePickerSize;
  isInvalid: boolean;
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  maxVisibleMonths?: number;
}): JSX.Element {
  const context = useDateRangePickerContext();
  const theme = useTheme();
  const state = context.calendarState;
  const isDisabled = () => state.isDisabled();
  const locale = () => state.locale?.() ?? "en-US";
  const startDisplay = createMemo(() =>
    formatRangeDate(state.value?.()?.start ?? state.anchorDate?.(), locale(), state.timeZone),
  );
  const endDisplay = createMemo(() =>
    formatRangeDate(state.value?.()?.end, locale(), state.timeZone),
  );

  return (
    <>
      <Show when={props.label}>
        <div class={dateRangePickerLabelWrapper({ size: props.size, labelPosition: "top" })}>
          <HeadlessDateRangePickerLabel
            class={dateRangePickerLabel({ size: props.size, isDisabled: isDisabled() })}
          >
            {props.label}
            <Show when={props.isRequired}>
              <span class={noWrap}>
                &nbsp;
                <AsteriskIcon
                  size={props.size === "S" ? "M" : props.size}
                  styles={requiredIcon}
                  style={requiredIconStyle(props.size)}
                  aria-hidden="true"
                />
              </span>
            </Show>
          </HeadlessDateRangePickerLabel>
        </div>
      </Show>

      <div
        class={dateRangePickerFieldGroup({
          size: props.size,
          isInvalid: props.isInvalid,
          isDisabled: isDisabled(),
        })}
      >
        <div
          {...context.pickerAria.startFieldProps}
          class={dateRangePickerFieldPart({
            isPlaceholder: !startDisplay(),
            isDisabled: isDisabled(),
          })}
        >
          {startDisplay() || "Start date"}
        </div>
        <span class={dateRangeSeparator} aria-hidden="true">
          &ndash;
        </span>
        <div
          {...context.pickerAria.endFieldProps}
          class={dateRangePickerFieldPart({
            isPlaceholder: !endDisplay(),
            isDisabled: isDisabled(),
          })}
        >
          {endDisplay() || "End date"}
        </div>

        <Show when={props.isInvalid}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>

        <DateRangePickerButton
          class={({ isDisabled, isOpen }) =>
            calendarButton({ isDisabled, isOpen, size: props.size })
          }
        >
          <S2CalendarIcon styles={calendarIcon} />
        </DateRangePickerButton>

        <DateRangePickerContent
          class={dateRangePickerPopover({ colorScheme: theme.colorScheme })}
          style={popoverEnterStyle}
        >
          <div class={dateRangePickerPopoverFrame} style={{ "min-width": "240px" }}>
            <RangeCalendar size="md" visibleMonths={props.maxVisibleMonths ?? 1} />
          </div>
        </DateRangePickerContent>
      </div>

      <Show when={props.description && !props.isInvalid}>
        <HeadlessDateRangePickerDescription
          class={helpText({ size: props.size, isInvalid: false, isDisabled: isDisabled() })}
        >
          {props.description}
        </HeadlessDateRangePickerDescription>
      </Show>

      <Show when={props.isInvalid && props.errorMessage}>
        <HeadlessDateRangePickerErrorMessage
          class={helpText({ size: props.size, isInvalid: true, isDisabled: isDisabled() })}
        >
          {props.errorMessage}
        </HeadlessDateRangePickerErrorMessage>
      </Show>
    </>
  );
}

/**
 * A date range picker combines two date display fields with a range calendar popup.
 */
export function DateRangePicker<T extends DateValue = CalendarDate>(
  props: DateRangePickerProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, calendarProps, rest] = splitProps(
    mergedProps,
    ["size", "class", "label", "description", "errorMessage", "isInvalid", "maxVisibleMonths"],
    [
      "minValue",
      "maxValue",
      "isDateUnavailable",
      "firstDayOfWeek",
      "allowsNonContiguousRanges",
      "placeholderValue",
    ],
  );

  const size = () => normalizeDateRangePickerSize(local.size);
  const isInvalid = () => local.isInvalid === true;

  return (
    <HeadlessDateRangePicker
      {...calendarProps}
      {...rest}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      isInvalid={isInvalid()}
      class={(renderProps) =>
        [
          local.class,
          dateRangePickerRoot({
            ...renderProps,
            size: size(),
            labelPosition: "top",
            isInForm: false,
          }),
        ]
          .filter(Boolean)
          .join(" ")
      }
    >
      <DateRangeDisplay
        size={size()}
        isInvalid={isInvalid()}
        label={local.label}
        description={local.description}
        errorMessage={local.errorMessage}
        isRequired={rest.isRequired}
        maxVisibleMonths={local.maxVisibleMonths}
      />
    </HeadlessDateRangePicker>
  );
}

export type { CalendarDate, DateValue };
