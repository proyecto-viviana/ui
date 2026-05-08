// @ts-nocheck
import { type JSX, createEffect, createSignal, onCleanup, splitProps, Show } from "solid-js";
import {
  DatePicker as HeadlessDatePicker,
  DatePickerLabel as HeadlessDatePickerLabel,
  DatePickerDescription as HeadlessDatePickerDescription,
  DatePickerErrorMessage as HeadlessDatePickerErrorMessage,
  DatePickerButton,
  DatePickerContent,
  DateInput,
  DateSegment,
  type DatePickerProps as HeadlessDatePickerProps,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import { Calendar } from "./index";
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

export interface DatePickerProps<T extends DateValue = DateValue> extends Omit<
  HeadlessDatePickerProps<T>,
  "class" | "style" | "children"
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
  /** Placeholder text. */
  placeholder?: string;
}

const sizeStyles: Record<
  NormalizedDatePickerSize,
  {
    legacyCalendarSize: "sm" | "md" | "lg" | "xl";
  }
> = {
  S: {
    legacyCalendarSize: "sm",
  },
  M: {
    legacyCalendarSize: "md",
  },
  L: {
    legacyCalendarSize: "lg",
  },
  XL: {
    legacyCalendarSize: "xl",
  },
};

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

function requiredIconStyle(size: NormalizedDatePickerSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function calendarIconStyle(size: NormalizedDatePickerSize): JSX.CSSProperties {
  const pixelSize = {
    S: 12,
    M: 14,
    L: 16,
    XL: 18,
  }[size];

  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function datePickerFieldGroupStyle(size: NormalizedDatePickerSize): JSX.CSSProperties | undefined {
  if (size !== "L" && size !== "XL") return undefined;

  return {
    "padding-inline-end": "6px",
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
    isDisabled: "disabled",
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
  boxSizing: "border-box",
  width: "[max-content]",
});

/**
 * A date picker combines a date field and a calendar popup.
 */
export function DatePicker<T extends DateValue = CalendarDate>(
  props: DatePickerProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, rest] = splitProps(mergedProps, [
    "size",
    "class",
    "label",
    "description",
    "errorMessage",
    "isInvalid",
    "placeholder",
  ]);

  const size = () => normalizeDatePickerSize(local.size);
  const isInvalid = () => local.isInvalid === true;
  const isDisabled = () => rest.isDisabled === true;
  const [fieldGroupRef, setFieldGroupRef] = createSignal<HTMLDivElement | null>(null);
  const focusFirstEditableSegment = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
    const target = event.target as HTMLElement | null;
    if (
      !target ||
      target.closest('[role="spinbutton"], button, a, input, textarea, select') ||
      isDisabled()
    ) {
      return;
    }

    const firstSegment = event.currentTarget.querySelector<HTMLElement>(
      '[role="spinbutton"]:not([aria-disabled="true"])',
    );
    if (!firstSegment) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    firstSegment.focus();
    queueMicrotask(() => firstSegment.focus());
    requestAnimationFrame(() => firstSegment.focus());
    setTimeout(() => firstSegment.focus(), 0);
    setTimeout(() => firstSegment.focus(), 50);
  };

  createEffect(() => {
    const element = fieldGroupRef();
    if (!element) return;

    const listener = (event: PointerEvent | MouseEvent) =>
      focusFirstEditableSegment(
        event as (PointerEvent | MouseEvent) & { currentTarget: HTMLDivElement },
      );
    element.addEventListener("pointerdown", listener, { capture: true });
    element.addEventListener("click", listener);
    onCleanup(() => {
      element.removeEventListener("pointerdown", listener, { capture: true });
      element.removeEventListener("click", listener);
    });
  });

  return (
    <HeadlessDatePicker
      {...rest}
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
        </div>
      </Show>

      <div
        ref={setFieldGroupRef}
        class={datePickerFieldGroup({
          size: size(),
          isInvalid: isInvalid(),
          isDisabled: isDisabled(),
        })}
        style={datePickerFieldGroupStyle(size())}
      >
        <DateInput class={dateInputContainer} onPointerDownCapture={focusFirstEditableSegment}>
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
          <S2CalendarIcon styles={calendarIcon} style={calendarIconStyle(size())} />
        </DatePickerButton>

        <DatePickerPopup size={sizeStyles[size()].legacyCalendarSize} />
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

function DatePickerPopup(props: { size: "sm" | "md" | "lg" | "xl" }): JSX.Element {
  const theme = useTheme();
  const popoverWidth = () => {
    switch (props.size) {
      case "lg":
        return 360;
      case "xl":
        return 388;
      case "sm":
      case "md":
      default:
        return 304;
    }
  };

  return (
    <DatePickerContent class={datePickerPopover({ colorScheme: theme.colorScheme })}>
      <div class={datePickerPopoverFrame} style={{ width: `${popoverWidth()}px` }}>
        <Calendar size={props.size} />
      </div>
    </DatePickerContent>
  );
}

export type { CalendarDate, DateValue };
