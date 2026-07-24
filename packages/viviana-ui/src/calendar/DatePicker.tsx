// @ts-nocheck - style-system types need a dedicated pass; removing this would require
// fixing ~20 style-definition type mismatches unrelated to component behavior.
import {
  createContext,
  createSignal,
  type JSX,
  mergeProps,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import { pressScale } from "../pressScale";
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
import { createHover, useLocale } from "@proyecto-viviana/solidaria";
import { Calendar } from "./index";
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

export const DatePickerContext = createContext<SpectrumContextValue<DatePickerProps<any>>>(null);

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
  ...control({ shape: "default", register: "matte" }),
  ...fieldInput(),
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
    // S2 `fieldGroupStyles.backgroundColor` (Field.tsx) is a FLAT `gray-25` with
    // no `isHovered` variant — the field surface does not lighten/darken on hover
    // (only its `color: baseColor("neutral")` does). Wrapping this in
    // `baseColor("gray-25")` injected a phantom `gray-25:hovered` that darkened
    // the field to 248 on hover while S2 stays at 255 (matches certified
    // DateField/TimeField, which use the flat token).
    default: "well",
    forcedColors: "Field",
  },
  borderColor: {
    default: "well-border",
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
    // loses that branch and paints CanvasText in forced-colors.
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
  isHovered?: boolean;
  isPressed?: boolean;
  isFocusVisible?: boolean;
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
  // certified DateField help text carries. `--iconPrimary` tints the FieldError
  // icon and `cursor` is set on the help text ITSELF (class `rD151`/`ri151`), not
  // inherited: `text` at rest, `default` when disabled.
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

const datePickerPopover = style<{
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
  // Glasselated: frost the scene behind the surface — the container bg is the
  // translucent `--surface-card`; the blur is what makes it read as glass.
  backdropFilter: "var(--blur-card)",
  boxShadow: "elevated",
  borderRadius: "panel",
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
  // Byte-copied from the shared `popoverStyles` enter/exit motion (which is
  // itself S2 `Popover.tsx`'s `popover()` motion). S2's DatePicker popover is a
  // plain `<Popover>`, so its enter transition IS this generic opacity/translate
  // fade — NOT a bespoke keyframe. The port's DatePicker owns a private
  // `DatePickerContent` that bypasses the shared Popover, so the same tokens are
  // mirrored here and driven by `createEnterAnimation` (data-entering) below.
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

const datePickerPopoverInner = style({
  padding: 0,
  boxSizing: "border-box",
  outlineStyle: "none",
  borderRadius: "inherit",
  overflow: "auto",
  position: "relative",
  width: "full",
  maxSize: "[inherit]",
});

const datePickerPopoverFrame = style({
  paddingX: 16,
  paddingY: 24,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  gap: 16,
  boxSizing: "border-box",
  size: "full",
});

const datePickerCalendarPopoverStyle: JSX.CSSProperties = {
  width: "272px",
  "max-width": "100%",
};

/**
 * A date picker combines a date field and a calendar popup.
 */
/**
 * The presentation FieldGroup shell. Mirrors the S2/RAC oracle's `_r_3_` node:
 * a `role="presentation"` div carrying the field label (`aria-labelledby`) +
 * describedby + the arrow-navigation/press layer, all sourced from
 * `pickerAria.groupProps`. A context-consuming component (not inline JSX in the
 * DatePicker body) so `useDatePickerContext()` resolves the provider inside
 * `HeadlessDatePicker`. The styled class/style/onClick layer on top.
 */
function DatePickerFieldGroup(props: {
  size: NormalizedDatePickerSize;
  isInvalid: boolean;
  isDisabled: boolean;
  style?: JSX.CSSProperties;
  onClick?: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent>;
  children?: JSX.Element;
}): JSX.Element {
  const datePicker = useDatePickerContext();
  // S2's FieldGroup renders on RAC's <Group>, whose `useHover` publishes
  // `data-hovered`. The field text color is `baseColor("neutral")`, which
  // brightens one gray step (gray-800 → gray-900) on hover. S2's style macro
  // applies that hover step as a *renderProps-gated atomic class* — the class
  // is included in `fieldGroupStyles({isHovered})` only when the Group reports
  // `isHovered`, NOT via a bare `[data-hovered]` CSS selector. So the class
  // itself must be recomputed here with `isHovered`; emitting the attribute
  // alone never brightens the text (D7). Suppress hover while disabled,
  // matching `useHover({isDisabled})`.
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return props.isDisabled;
    },
  });
  return (
    <div
      {...datePicker.pickerAria.groupProps}
      {...hoverProps}
      // S2 seeds its FieldGroup's RAC <Group> with role="presentation", overriding
      // the faithful role="group" that `createDatePicker` returns (RAC useDatePicker
      // groupProps). Placed after the spread so it wins (JSX later-attr precedence).
      role="presentation"
      class={datePickerFieldGroup({
        size: props.size,
        isInvalid: props.isInvalid,
        isDisabled: props.isDisabled,
        isHovered: isHovered(),
      })}
      style={props.style}
      onClick={props.onClick}
      data-hovered={isHovered() ? "true" : undefined}
    >
      {props.children}
    </div>
  );
}

export function DatePicker<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(DatePickerContext), (props as any).slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, calendarProps, rest] = splitProps(
    merged,
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
  // Mirrors S2's CalendarButton `buttonRef` → `pressScale(buttonRef)`: the port
  // sizes the press transform against the real trigger element.
  const [buttonEl, setButtonEl] = createSignal<HTMLButtonElement>();

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

      <DatePickerFieldGroup
        size={size()}
        isInvalid={isInvalid()}
        isDisabled={isDisabled()}
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
        {/*
          Mirror S2 DatePicker's `<DateInputContainer><DateInput /></…>` nesting
          (DatePicker.tsx line 248) — and the port's own DateField. The flex
          container (`dateInputContainer`) lives on a WRAPPING div; the
          AriaDateInput group keeps an EMPTY class so it stays an unstyled block
          div. This matters: if the flex class sits on the group itself, the
          segments become direct flex items and CSS blockifies them
          (display:inline → block) and sizes them as flex items — the segment
          must stay inline/auto to match the S2 oracle.
        */}
        <div class={dateInputContainer}>
          <DateInput class="">
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
        </div>

        <Show when={isInvalid()}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>

        <DatePickerButton
          ref={setButtonEl}
          class={({ isDisabled, isOpen, isHovered, isPressed, isFocusVisible }) =>
            calendarButton({
              isDisabled,
              isOpen,
              isHovered,
              isPressed,
              isFocusVisible,
              size: size(),
            })
          }
          style={pressScale(buttonEl)}
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
      </DatePickerFieldGroup>

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
      class={(rp) =>
        datePickerPopover({
          colorScheme: theme.colorScheme,
          placement: rp.placement ?? undefined,
          isEntering: rp.isEntering,
          isExiting: rp.isExiting,
        })
      }
    >
      <div class={datePickerPopoverInner}>
        <div class={datePickerPopoverFrame}>
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
      </div>
    </DatePickerContent>
  );
}

export type { CalendarDate, DateValue };
