// @ts-nocheck

/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/DateRangePicker.tsx

// Port of packages/@react-spectrum/s2/src/DateRangePicker.tsx.
// Style-system types need a dedicated pass; removing this would require
// fixing style-definition type mismatches unrelated to component behavior.
import {
  createContext,
  createSignal,
  type JSX,
  mergeProps,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import { pressScale } from "../pressScale";
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
import { createHover, createStringFormatter, useLocale } from "@proyecto-viviana/solidaria";
import { s2IntlStrings } from "../intl";
import {
  type CalendarDateTime,
  type TimeValue,
  toCalendarDateTime,
  toZoned,
} from "@proyecto-viviana/solid-stately";
import { RangeCalendar } from "./RangeCalendar";
import { TimeField } from "../datepicker";
import {
  baseColor,
  focusRing,
  fontRelative,
  lightDark,
  setColorScheme,
  style,
} from "../style" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import S2CalendarIcon from "../icon/s2wf-icons/CalendarIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps, useTheme } from "../provider";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";
import {
  control,
  controlBorderRadius,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };

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

export const DateRangePickerContext =
  createContext<SpectrumContextValue<DateRangePickerProps<any>>>(null);

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
    // Flat `gray-25` to match S2 `fieldGroupStyles` — see the DatePicker note.
    // `baseColor("gray-25")` would inject a phantom hover-darkening the field
    // surface does not have.
    default: "gray-25",
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
    forcedColors: "ButtonText",
    // Mirror S2 `fieldGroupStyles.color` (Field.tsx): the disabled color nests
    // its own forced-colors branch so a disabled field in forced-colors resolves
    // to `GrayText`, not the flat `ButtonText`. A flat `isDisabled: "disabled"`
    // loses that branch and paints ButtonText in forced-colors (matches the
    // certified single DatePicker).
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  cursor: {
    default: "text",
    isDisabled: "default",
  },
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
  size: "1lh",
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
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
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
  // Mirror S2's `helpTextStyles` (Field.mjs) exactly — the same style the
  // certified DateField/DatePicker help text carries. `--iconPrimary` tints the
  // FieldError icon and `cursor` is set on the help text ITSELF (not inherited):
  // `text` at rest, `default` when disabled.
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

const dateRangePickerPopover = style<{
  colorScheme: "light" | "dark" | "light dark";
  placement?: "top" | "bottom" | "left" | "right";
  isEntering?: boolean;
  isExiting?: boolean;
}>({
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
  maxWidth: "calc(100vw - 24px)",
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
  // Byte-copied from the single DatePicker's `datePickerPopover` motion, which
  // is itself the shared `popover()` enter/exit fade. S2's DateRangePicker
  // popover is a plain `<Popover>`, so the enter transition IS this generic
  // opacity/translate fade — driven by headless Popover `isEntering` / `isExiting`
  // render props inside the shared `DateRangePickerContent`.
  opacity: {
    isEntering: 0,
    isExiting: 0,
  },
  translateY: {
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4,
      },
      bottom: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  translateX: {
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4,
      },
      right: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  pointerEvents: {
    isExiting: "none",
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

const dateRangePickerTimeFields = style({
  display: "flex",
  gap: 16,
  alignItems: "start",
  flexWrap: "wrap",
  maxWidth: "[272px]",
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
  // Anchor-aware, matching the RangeCalendar / RangeCalendarStateProps callback
  // this forwards through (the second arg is the in-progress range's anchor date,
  // null outside an active range selection). Mirrors upstream's
  // useRangeCalendarState / DateRangePicker signature.
  isDateUnavailable?: (date: DateValue, anchorDate: CalendarDate | null) => boolean;
  allowsNonContiguousRanges?: boolean;
  createCalendar?: HeadlessDateRangePickerProps["createCalendar"];
  firstDayOfWeek?: DateRangePickerFirstDayOfWeek | 0 | 1 | 2 | 3 | 4 | 5 | 6;
  pageBehavior?: "single" | "visible";
  hourCycle?: 12 | 24;
  hideTimeZone?: boolean;
  placeholderValue?: DateValue;
}): JSX.Element {
  const context = useDateRangePickerContext();
  const theme = useTheme();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const state = context.calendarState;
  const isDisabled = () => state.isDisabled();
  // S2's FieldGroup renders on RAC's <Group>, whose `useHover` publishes
  // `data-hovered`; the field text `baseColor("neutral")` brightens one gray step
  // on hover via a renderProps-gated atomic class (NOT a bare `[data-hovered]`
  // selector). So the class must be recomputed with `isHovered`; emitting the
  // attribute alone never brightens the text (D7). Suppress hover while disabled.
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });
  // Mirrors S2's shared CalendarButton `buttonRef` → `pressScale(buttonRef)`: the
  // port sizes the press transform against the real trigger element.
  const [buttonEl, setButtonEl] = createSignal<HTMLButtonElement>();
  const timeGranularity = () => {
    const granularity = context.startFieldState.granularity;
    return granularity === "hour" || granularity === "minute" || granularity === "second"
      ? granularity
      : undefined;
  };
  const timeValueFor = (part: "start" | "end"): TimeValue | null => {
    const value =
      part === "start" ? context.startFieldState.value() : context.endFieldState.value();
    return value && "hour" in value ? (value as unknown as TimeValue) : null;
  };
  const commitTimeValue = (part: "start" | "end", nextTime: TimeValue | null) => {
    if (!nextTime) {
      return;
    }

    const fieldState = part === "start" ? context.startFieldState : context.endFieldState;
    const currentValue = fieldState.value();
    if (!currentValue) {
      return;
    }

    let nextValue: DateValue = toCalendarDateTime(currentValue, nextTime);
    if ("timeZone" in currentValue && !("timeZone" in nextValue)) {
      nextValue = toZoned(nextValue as CalendarDateTime, currentValue.timeZone);
    }
    fieldState.setValue(nextValue);
  };
  const timeMinValue = () =>
    props.minValue && "hour" in props.minValue
      ? (props.minValue as unknown as TimeValue)
      : undefined;
  const timeMaxValue = () =>
    props.maxValue && "hour" in props.maxValue
      ? (props.maxValue as unknown as TimeValue)
      : undefined;

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
        {...context.pickerAria.groupProps}
        {...hoverProps}
        // S2 seeds its FieldGroup's RAC <Group> with role="presentation", overriding
        // the faithful role="group" that `createDateRangePicker` returns (RAC
        // useDateRangePicker groupProps). Placed after the spread so it wins.
        role="presentation"
        class={dateRangePickerFieldGroup({
          size: props.size,
          isInvalid: props.isInvalid,
          isDisabled: isDisabled(),
          isHovered: isHovered(),
        })}
        onClick={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('button, [role="spinbutton"]')) {
            return;
          }
          event.currentTarget.querySelector<HTMLElement>('[role="spinbutton"]')?.focus();
        }}
        data-hovered={isHovered() ? "true" : undefined}
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
            ref={setButtonEl}
            class={({ isDisabled, isOpen, isHovered, isPressed, isFocusVisible }) =>
              calendarButton({
                isDisabled,
                isOpen,
                isHovered,
                isPressed,
                isFocusVisible,
                size: props.size,
              })
            }
            style={pressScale(buttonEl)}
          >
            <S2CalendarIcon styles={calendarIcon} />
          </DateRangePickerButton>
        </div>

        <DateRangePickerContent
          class={(rp) =>
            dateRangePickerPopover({
              colorScheme: theme.colorScheme,
              placement: rp.placement ?? undefined,
              isEntering: rp.isEntering,
              isExiting: rp.isExiting,
            })
          }
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
              createCalendar={props.createCalendar}
              firstDayOfWeek={props.firstDayOfWeek}
              pageBehavior={props.pageBehavior}
              isInvalid={props.isInvalid}
              errorMessage={props.isInvalid ? props.errorMessage : undefined}
              visibleMonths={props.maxVisibleMonths ?? 1}
            />
            <Show when={timeGranularity()}>
              <div class={dateRangePickerTimeFields}>
                <TimeField
                  size="md"
                  label={stringFormatter().format("datepicker.startTime")}
                  value={timeValueFor("start") ?? undefined}
                  minValue={timeMinValue()}
                  maxValue={timeMaxValue()}
                  granularity={timeGranularity()}
                  hourCycle={props.hourCycle}
                  hideTimeZone={props.hideTimeZone}
                  placeholderValue={
                    props.placeholderValue && "hour" in props.placeholderValue
                      ? (props.placeholderValue as unknown as TimeValue)
                      : undefined
                  }
                  onChange={(nextValue) => commitTimeValue("start", nextValue)}
                />
                <TimeField
                  size="md"
                  label={stringFormatter().format("datepicker.endTime")}
                  value={timeValueFor("end") ?? undefined}
                  minValue={timeMinValue()}
                  maxValue={timeMaxValue()}
                  granularity={timeGranularity()}
                  hourCycle={props.hourCycle}
                  hideTimeZone={props.hideTimeZone}
                  placeholderValue={
                    props.placeholderValue && "hour" in props.placeholderValue
                      ? (props.placeholderValue as unknown as TimeValue)
                      : undefined
                  }
                  onChange={(nextValue) => commitTimeValue("end", nextValue)}
                />
              </div>
            </Show>
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
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(
    useContext(DateRangePickerContext),
    (props as any).slot,
  );
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, calendarProps, rest] = splitProps(
    merged,
    ["size", "class", "label", "description", "errorMessage", "isInvalid", "maxVisibleMonths"],
    [
      "minValue",
      "maxValue",
      "isDateUnavailable",
      "firstDayOfWeek",
      "pageBehavior",
      "allowsNonContiguousRanges",
      "placeholderValue",
      "createCalendar",
    ],
  );

  const size = () => normalizeDateRangePickerSize(local.size);
  const isInvalid = () => local.isInvalid === true;
  const maxVisibleMonths = () => Math.max(1, Number(local.maxVisibleMonths ?? 1));
  const locale = useLocale();

  return (
    <HeadlessDateRangePicker
      {...calendarProps}
      {...rest}
      firstDayOfWeek={normalizeFirstDayOfWeek(calendarProps.firstDayOfWeek)}
      visibleMonths={maxVisibleMonths()}
      locale={(rest as { locale?: string }).locale ?? locale().locale}
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
        createCalendar={calendarProps.createCalendar}
        firstDayOfWeek={calendarProps.firstDayOfWeek}
        pageBehavior={calendarProps.pageBehavior}
        hourCycle={(rest as { hourCycle?: 12 | 24 }).hourCycle}
        hideTimeZone={(rest as { hideTimeZone?: boolean }).hideTimeZone}
        placeholderValue={calendarProps.placeholderValue}
      />
    </HeadlessDateRangePicker>
  );
}

export type { CalendarDate, DateValue };
