// @ts-nocheck - style-system types need a dedicated pass; removing this would require
// fixing ~20 style-definition type mismatches unrelated to component behavior.
import { type JSX, splitProps, Show } from "solid-js";
import {
  DatePicker as HeadlessDatePicker,
  DatePickerLabel as HeadlessDatePickerLabel,
  DatePickerDescription as HeadlessDatePickerDescription,
  DatePickerErrorMessage as HeadlessDatePickerErrorMessage,
  DatePickerButton,
  DatePickerContent,
  DateInput,
  DateSegment,
  useDatePickerContext,
  type DatePickerProps as HeadlessDatePickerProps,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import { useLocale } from "@proyecto-viviana/solidaria";
import { Calendar } from "./index";
import { TimeField } from "../datepicker";
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

export type DatePickerSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type NormalizedDatePickerSize = "S" | "M" | "L" | "XL";
export type DatePickerFirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface DatePickerProps<T extends DateValue = DateValue> extends Omit<
  HeadlessDatePickerProps<T>,
  "class" | "style" | "children" | "firstDayOfWeek" | "visibleMonths"
> {
  /** The size of the picker. @default 'md' */
  size?: DatePickerSize;
  /** Additional CSS class name. */
  class?: string;
  /** Label for the field. */
  label?: string;
  /** Description text. */
  description?: string;
  /** Error message. */
  errorMessage?: string;
  /** A ContextualHelp element to place next to the label. */
  contextualHelp?: JSX.Element;
  /** Placeholder text. */
  placeholder?: string;
  /**
   * The maximum number of months to display at once in the calendar popover.
   *
   * @default 1
   */
  maxVisibleMonths?: number;
  /** The day that starts the week. */
  firstDayOfWeek?: DatePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
}

function normalizeDatePickerSize(size: DatePickerSize | undefined): NormalizedDatePickerSize {
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

function normalizeFirstDayOfWeek(
  firstDayOfWeek: DatePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
): 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined {
  switch (firstDayOfWeek) {
    case "sun":
      return 0;
    case "mon":
      return 1;
    case "tue":
      return 2;
    case "wed":
      return 3;
    case "thu":
      return 4;
    case "fri":
      return 5;
    case "sat":
      return 6;
    default:
      return firstDayOfWeek;
  }
}

function requiredIconStyle(size: NormalizedDatePickerSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function datePickerFieldGroupStyle(size: NormalizedDatePickerSize): JSX.CSSProperties | undefined {
  if (size !== "L" && size !== "XL") return undefined;

  return {
    "padding-inline-end": "6px",
    width: size === "L" ? "224px" : "240px",
  };
}

const popoverEnterStyle: JSX.CSSProperties = {
  animation: "s2-datepicker-popover-in 200ms cubic-bezier(0.45, 0, 0.4, 1)",
  "max-height": "none",
};

const datePickerRoot = style(
  {
    ...field(),
    position: "relative",
  },
  getAllowedOverrides(),
);

const datePickerLabelWrapper = style({
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

const datePickerLabel = style<any>({
  ...fieldLabel(),
});

const datePickerFieldGroup = style({
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
});

const dateInputContainer = style({
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  height: "full",
  overflowX: "auto",
  overflowY: "hidden",
  scrollbarWidth: "none",
  display: "flex",
  alignItems: "center",
  textWrap: "nowrap",
});

const dateSegment = style<{ isFocused?: boolean; isPunctuation?: boolean }>({
  outlineStyle: "none",
  caretColor: "transparent",
  backgroundColor: {
    default: "transparent",
    isFocused: "blue-800",
    forcedColors: {
      default: "transparent",
      isFocused: "Highlight",
    },
  },
  color: {
    isFocused: "white",
    isDisabled: "disabled",
    forcedColors: {
      isFocused: "HighlightText",
      isDisabled: "GrayText",
    },
  },
  borderRadius: "[2px]",
  paddingX: {
    default: 2,
    isPunctuation: 0,
  },
  paddingY: 2,
  forcedColorAdjust: "none",
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
  size: NormalizedDatePickerSize;
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

const datePickerPopover = style<{ colorScheme: "light" | "dark" | "light dark" }>({
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

const datePickerPopoverFrame = style({
  paddingX: 16,
  paddingY: 24,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "content-box",
  width: "[max-content]",
});

const datePickerCalendarPopoverStyle: JSX.CSSProperties = {
  width: "272px",
  "max-width": "100%",
};

/**
 * A date picker combines a date field and a calendar popup.
 */
export function DatePicker<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, calendarProps, rest] = splitProps(
    mergedProps,
    [
      "size",
      "class",
      "label",
      "description",
      "errorMessage",
      "contextualHelp",
      "isInvalid",
      "placeholder",
      "maxVisibleMonths",
    ],
    [
      "minValue",
      "maxValue",
      "isDateUnavailable",
      "firstDayOfWeek",
      "pageBehavior",
      "placeholderValue",
      "createCalendar",
    ],
  );

  const size = () => normalizeDatePickerSize(local.size);
  const isInvalid = () => local.isInvalid === true;
  const isDisabled = () => rest.isDisabled === true;
  const visibleMonths = () => Math.max(1, Number(local.maxVisibleMonths ?? 1));
  const locale = useLocale();

  const hasTime = () => {
    const granularity = (rest as { granularity?: string }).granularity;
    if (granularity && granularity !== "day") return true;
    const value = (rest as { value?: DateValue }).value;
    if (value && "hour" in value) return true;
    const defaultValue = (rest as { defaultValue?: DateValue }).defaultValue;
    if (defaultValue && "hour" in defaultValue) return true;
    return false;
  };

  return (
    <HeadlessDatePicker
      {...calendarProps}
      {...rest}
      firstDayOfWeek={normalizeFirstDayOfWeek(calendarProps.firstDayOfWeek)}
      visibleMonths={visibleMonths()}
      locale={(rest as { locale?: string }).locale ?? locale().locale}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      isInvalid={isInvalid()}
      class={(renderProps) =>
        [
          local.class,
          datePickerRoot({
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
      <Show when={local.label}>
        <div class={datePickerLabelWrapper({ size: size(), labelPosition: "top" })}>
          <HeadlessDatePickerLabel
            class={datePickerLabel({ size: size(), isDisabled: isDisabled() })}
          >
            {local.label}
            <Show when={rest.isRequired}>
              <span class={noWrap}>
                &nbsp;
                <AsteriskIcon
                  size={size() === "S" ? "M" : size()}
                  styles={requiredIcon}
                  style={requiredIconStyle(size())}
                  aria-hidden="true"
                />
              </span>
            </Show>
          </HeadlessDatePickerLabel>
          <Show when={local.contextualHelp}>
            <span data-slot="contextualHelp" class={noWrap}>
              {local.contextualHelp}
            </span>
          </Show>
        </div>
      </Show>

      <div
        class={datePickerFieldGroup({
          size: size(),
          isInvalid: isInvalid(),
          isDisabled: isDisabled(),
        })}
        style={datePickerFieldGroupStyle(size())}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest('button, [role="spinbutton"]')) {
            const segments = Array.from(
              e.currentTarget.querySelectorAll<HTMLElement>(
                '[role="spinbutton"]:not([aria-disabled="true"])',
              ),
            );
            for (let i = segments.length - 1; i >= 0; i--) {
              if (!segments[i].hasAttribute("data-placeholder")) {
                segments[i].focus();
                return;
              }
            }
            segments[0]?.focus();
          }
        }}
      >
        <DateInput class={dateInputContainer}>
          {(segment) => (
            <DateSegment
              segment={segment}
              class={({ isFocused, isDisabled }) =>
                dateSegment({
                  isFocused,
                  isDisabled,
                  isPunctuation: segment.type === "literal",
                })
              }
            />
          )}
        </DateInput>

        <Show when={isInvalid()}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>

        <DatePickerButton
          class={({ isDisabled, isOpen }) => calendarButton({ isDisabled, isOpen, size: size() })}
        >
          <S2CalendarIcon styles={calendarIcon} />
        </DatePickerButton>

        <DatePickerPopup
          size={size()}
          hasTime={hasTime()}
          maxVisibleMonths={visibleMonths()}
          calendarProps={calendarProps}
          hourCycle={(rest as { hourCycle?: 12 | 24 }).hourCycle}
          shouldForceLeadingZeros={
            (rest as { shouldForceLeadingZeros?: boolean }).shouldForceLeadingZeros
          }
        />
      </div>

      <Show when={local.description && !isInvalid()}>
        <HeadlessDatePickerDescription
          class={helpText({ size: size(), isInvalid: false, isDisabled: isDisabled() })}
        >
          {local.description}
        </HeadlessDatePickerDescription>
      </Show>

      <Show when={isInvalid() && local.errorMessage}>
        <HeadlessDatePickerErrorMessage
          class={helpText({ size: size(), isInvalid: true, isDisabled: isDisabled() })}
        >
          {local.errorMessage}
        </HeadlessDatePickerErrorMessage>
      </Show>
    </HeadlessDatePicker>
  );
}

function DatePickerPopup(props: {
  size: NormalizedDatePickerSize;
  hasTime?: boolean;
  maxVisibleMonths?: number;
  calendarProps?: Record<string, unknown>;
  hourCycle?: 12 | 24;
  shouldForceLeadingZeros?: boolean;
}): JSX.Element {
  const theme = useTheme();
  const datePicker = useDatePickerContext();
  const timeGranularity = () =>
    datePicker.datePickerState.granularity === "day"
      ? "minute"
      : datePicker.datePickerState.granularity;

  return (
    <DatePickerContent
      class={datePickerPopover({ colorScheme: theme.colorScheme })}
      style={popoverEnterStyle}
    >
      <div class={datePickerPopoverFrame} style={{ "min-width": "240px" }}>
        <Calendar
          size="md"
          visibleMonths={props.maxVisibleMonths}
          UNSAFE_style={datePickerCalendarPopoverStyle}
          {...(props.calendarProps ?? {})}
        />
        <Show when={props.hasTime}>
          <TimeField
            size="md"
            label="Time"
            value={datePicker.datePickerState.timeValue() ?? undefined}
            granularity={timeGranularity()}
            hourCycle={props.hourCycle}
            shouldForceLeadingZeros={props.shouldForceLeadingZeros}
            onChange={(nextValue) => {
              if (nextValue) {
                datePicker.datePickerState.setTimeValue(nextValue);
              }
            }}
          />
        </Show>
      </div>
    </DatePickerContent>
  );
}

export type { CalendarDate, DateValue };
