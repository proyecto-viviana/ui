// @ts-nocheck - style-system types need a dedicated pass; removing this would require
// fixing style-definition type mismatches unrelated to component behavior.
import { type JSX, Show, splitProps } from "solid-js";
import {
  DateRangePicker as HeadlessDateRangePicker,
  DateRangePickerLabel as HeadlessDateRangePickerLabel,
  DateRangePickerDescription as HeadlessDateRangePickerDescription,
  DateRangePickerErrorMessage as HeadlessDateRangePickerErrorMessage,
  DateRangePickerButton,
  DateRangePickerContent,
  DateInput,
  DateSegment,
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
type DateRangePickerFirstDayOfWeek = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export interface DateRangePickerProps<T extends DateValue = DateValue> extends Omit<
  HeadlessDateRangePickerProps<T>,
  "class" | "style" | "children" | "firstDayOfWeek"
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
  /** The day that starts the week. */
  firstDayOfWeek?: DateRangePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
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

function normalizeFirstDayOfWeek(
  firstDayOfWeek: DateRangePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
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
  paddingEnd: 4,
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

const dateRangeInputContainer = style({
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

const dateSegment = style<{
  isFocused?: boolean;
  isPunctuation?: boolean;
  isDisabled?: boolean;
}>({
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

const dateRangeSeparator = style({
  flexShrink: 0,
  paddingX: 2,
});

const calendarButtonWrapper = style({
  flexShrink: 0,
  flexGrow: 1,
  display: "flex",
  justifyContent: "end",
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

function DateRangeDisplay(props: {
  size: NormalizedDateRangePickerSize;
  isInvalid: boolean;
  label?: string;
  description?: string;
  errorMessage?: string;
  isRequired?: boolean;
  maxVisibleMonths?: number;
  minValue?: DateValue;
  maxValue?: DateValue;
  isDateUnavailable?: (date: DateValue) => boolean;
  allowsNonContiguousRanges?: boolean;
  firstDayOfWeek?: DateRangePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  pageBehavior?: "single" | "visible";
}): JSX.Element {
  const context = useDateRangePickerContext();
  const theme = useTheme();
  const state = context.calendarState;
  const isDisabled = () => state.isDisabled();

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
        role="presentation"
        class={dateRangePickerFieldGroup({
          size: props.size,
          isInvalid: props.isInvalid,
          isDisabled: isDisabled(),
        })}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('button, [role="spinbutton"]')) {
            return;
          }
          event.currentTarget.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
        }}
      >
        <div class={dateRangeInputContainer}>
          <DateInput slot="start" class="">
            {(segment) => (
              <DateSegment
                segment={segment}
                class={({ isFocused, isEditable }) =>
                  dateSegment({
                    isFocused,
                    isDisabled: !isEditable && isDisabled(),
                    isPunctuation: segment.type === "literal",
                  })
                }
              />
            )}
          </DateInput>
          <span class={dateRangeSeparator} aria-hidden="true">
            &ndash;
          </span>
          <DateInput slot="end" class="">
            {(segment) => (
              <DateSegment
                segment={segment}
                class={({ isFocused, isEditable }) =>
                  dateSegment({
                    isFocused,
                    isDisabled: !isEditable && isDisabled(),
                    isPunctuation: segment.type === "literal",
                  })
                }
              />
            )}
          </DateInput>
        </div>

        <Show when={props.isInvalid}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>

        <div class={calendarButtonWrapper}>
          <DateRangePickerButton
            class={({ isDisabled, isOpen }) =>
              calendarButton({ isDisabled, isOpen, size: props.size })
            }
          >
            <S2CalendarIcon styles={calendarIcon} />
          </DateRangePickerButton>
        </div>

        <DateRangePickerContent
          class={dateRangePickerPopover({ colorScheme: theme.colorScheme })}
          style={popoverEnterStyle}
        >
          <div class={dateRangePickerPopoverFrame} style={{ "min-width": "240px" }}>
            <RangeCalendar
              size="md"
              value={state.value?.() ?? undefined}
              onChange={(value) => state.setValue(value)}
              minValue={props.minValue}
              maxValue={props.maxValue}
              isDateUnavailable={props.isDateUnavailable}
              allowsNonContiguousRanges={props.allowsNonContiguousRanges}
              firstDayOfWeek={props.firstDayOfWeek}
              pageBehavior={props.pageBehavior}
              isInvalid={props.isInvalid}
              errorMessage={props.isInvalid ? props.errorMessage : undefined}
              visibleMonths={props.maxVisibleMonths ?? 1}
            />
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
      "pageBehavior",
      "allowsNonContiguousRanges",
      "placeholderValue",
    ],
  );

  const size = () => normalizeDateRangePickerSize(local.size);
  const isInvalid = () => local.isInvalid === true;
  const maxVisibleMonths = () => Math.max(1, Number(local.maxVisibleMonths ?? 1));

  return (
    <HeadlessDateRangePicker
      {...calendarProps}
      {...rest}
      firstDayOfWeek={normalizeFirstDayOfWeek(calendarProps.firstDayOfWeek)}
      visibleMonths={maxVisibleMonths()}
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
        maxVisibleMonths={maxVisibleMonths()}
        minValue={calendarProps.minValue}
        maxValue={calendarProps.maxValue}
        isDateUnavailable={calendarProps.isDateUnavailable}
        allowsNonContiguousRanges={calendarProps.allowsNonContiguousRanges}
        firstDayOfWeek={calendarProps.firstDayOfWeek}
        pageBehavior={calendarProps.pageBehavior}
      />
    </HeadlessDateRangePicker>
  );
}

export type { CalendarDate, DateValue };
