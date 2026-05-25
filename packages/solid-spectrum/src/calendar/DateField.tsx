// @ts-nocheck - style-system generics need the same dedicated pass as DatePicker.
import { type JSX, Show, splitProps } from "solid-js";
import {
  DateField as HeadlessDateField,
  DateFieldLabel as HeadlessDateFieldLabel,
  DateFieldDescription as HeadlessDateFieldDescription,
  DateFieldErrorMessage as HeadlessDateFieldErrorMessage,
  DateInput,
  DateSegment,
  useDateFieldContext,
  type DateFieldProps as HeadlessDateFieldProps,
  type DateFieldRenderProps,
  type DateSegmentRenderProps,
  type CalendarDate,
  type DateValue,
} from "@proyecto-viviana/solidaria-components";
import { useLocale } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style";
import {
  control,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";

export type DateFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2DateFieldSize = "S" | "M" | "L" | "XL";
export type DateFieldLabelPosition = "top" | "side";
export type DateFieldLabelAlign = "start" | "end";
export type DateFieldNecessityIndicator = "icon" | "label";

export interface DateFieldProps<T extends DateValue = DateValue> extends Omit<
  HeadlessDateFieldProps<T>,
  "class" | "style" | "children"
> {
  /** The size of the field. @default 'M' */
  size?: DateFieldSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label for the field. */
  label?: JSX.Element;
  /** A ContextualHelp element to render next to the label. */
  contextualHelp?: JSX.Element;
  /** Description text. */
  description?: JSX.Element;
  /** Error message. */
  errorMessage?: JSX.Element;
  /** Position of the label relative to the field. */
  labelPosition?: DateFieldLabelPosition;
  /** Label alignment for side labels. */
  labelAlign?: DateFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: DateFieldNecessityIndicator;
}

interface DateFieldStyleProps extends DateFieldRenderProps {
  size?: S2DateFieldSize;
  labelPosition?: DateFieldLabelPosition;
  labelAlign?: DateFieldLabelAlign;
  isFocusWithin?: boolean;
  isInForm?: boolean;
}

const dateFieldRoot = style<DateFieldStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const dateFieldLabelWrapper = style<DateFieldStyleProps>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
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

const dateFieldLabel = style<DateFieldStyleProps>({
  ...fieldLabel(),
});

const dateFieldGroup = style<DateFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default" }),
  ...fieldInput(),
  borderWidth: 2,
  borderStyle: "solid",
  textWrap: "nowrap",
  paddingX: "edge-to-text",
  transition: "default",
  borderColor: {
    default: baseColor("gray-300"),
    forcedColors: "ButtonBorder",
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
  backgroundColor: {
    default: "gray-25",
    forcedColors: "Field",
  },
  color: {
    default: baseColor("neutral"),
    forcedColors: "ButtonText",
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

const segmentContainer = style({
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

const dateSegment = style<DateSegmentRenderProps & { isPunctuation?: boolean }>({
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

const helpText = style<DateFieldStyleProps>({
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

const noWrap = style({
  whiteSpace: "nowrap",
});

function normalizeDateFieldSize(size: DateFieldSize | undefined): S2DateFieldSize {
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

function requiredIconStyle(size: S2DateFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function focusFirstEditableSegment(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;
  if (target?.closest('[role="spinbutton"]')) {
    return;
  }

  event.preventDefault();
  const segments = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
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

function DateFieldContent(props: {
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  size: S2DateFieldSize;
  labelPosition: DateFieldLabelPosition;
  labelAlign: DateFieldLabelAlign;
  necessityIndicator: DateFieldNecessityIndicator;
}): JSX.Element {
  const { state } = useDateFieldContext();
  const isDisabled = () => state.isDisabled();
  const isInvalid = () => state.isInvalid();
  const isRequired = () => state.isRequired();

  return (
    <>
      <Show when={props.label}>
        <div
          class={dateFieldLabelWrapper({
            size: props.size,
            labelPosition: props.labelPosition,
            labelAlign: props.labelAlign,
          })}
        >
          <HeadlessDateFieldLabel
            class={dateFieldLabel({
              size: props.size,
              labelPosition: props.labelPosition,
              isDisabled: isDisabled(),
            })}
          >
            {props.label}
            <Show when={isRequired() || props.necessityIndicator === "label"}>
              <span class={noWrap}>
                &nbsp;
                <Show
                  when={props.necessityIndicator === "icon"}
                  fallback={
                    <span aria-hidden={isRequired() ? true : undefined}>
                      {isRequired() ? "(required)" : "(optional)"}
                    </span>
                  }
                >
                  <AsteriskIcon
                    size={props.size === "S" ? "M" : props.size}
                    styles={requiredIcon}
                    style={requiredIconStyle(props.size)}
                    aria-hidden="true"
                  />
                </Show>
              </span>
            </Show>
          </HeadlessDateFieldLabel>
          <Show when={props.contextualHelp}>
            <span data-slot="contextualHelp" class={noWrap}>
              {props.contextualHelp}
            </span>
          </Show>
        </div>
      </Show>

      <div
        class={dateFieldGroup({
          size: props.size,
          isInvalid: isInvalid(),
          isDisabled: isDisabled(),
        })}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") {
            focusFirstEditableSegment(event);
          }
        }}
        onTouchEnd={focusFirstEditableSegment}
        data-disabled={isDisabled() ? "true" : undefined}
        data-invalid={isInvalid() ? "true" : undefined}
      >
        <DateInput class={segmentContainer}>
          {(segment) => (
            <DateSegment
              segment={segment}
              class={(renderProps) =>
                dateSegment({
                  ...renderProps,
                  isDisabled: isDisabled(),
                  isPunctuation: segment.type === "literal",
                })
              }
            />
          )}
        </DateInput>

        <Show when={isInvalid() && !isDisabled()}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>
      </div>

      <Show when={props.description && !isInvalid()}>
        <HeadlessDateFieldDescription
          class={helpText({ size: props.size, isInvalid: false, isDisabled: isDisabled() })}
        >
          {props.description}
        </HeadlessDateFieldDescription>
      </Show>

      <Show when={props.errorMessage && isInvalid()}>
        <HeadlessDateFieldErrorMessage
          class={helpText({ size: props.size, isInvalid: true, isDisabled: isDisabled() })}
        >
          {props.errorMessage}
        </HeadlessDateFieldErrorMessage>
      </Show>
    </>
  );
}

/**
 * DateFields allow users to enter and edit date and time values using a keyboard.
 */
export function DateField<T extends DateValue = CalendarDate>(
  props: DateFieldProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(useFormProps(props));
  const isInForm = useIsInForm();
  const [local, rest] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "contextualHelp",
    "description",
    "errorMessage",
    "isInvalid",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
  ]);

  const size = () => normalizeDateFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const isInvalid = () => local.isInvalid === true;
  const locale = useLocale();

  const rootClassName = (renderProps: DateFieldRenderProps) =>
    [
      "solidaria-DateField",
      local.UNSAFE_className,
      local.class,
      dateFieldRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessDateField
      {...rest}
      locale={(rest as { locale?: string }).locale ?? locale().locale}
      validationState={
        isInvalid()
          ? "invalid"
          : (rest as { validationState?: "valid" | "invalid" }).validationState
      }
      label={local.label as string | undefined}
      description={local.description as string | undefined}
      errorMessage={local.errorMessage as string | undefined}
      class={rootClassName}
      style={local.UNSAFE_style}
    >
      <DateFieldContent
        label={local.label}
        contextualHelp={local.contextualHelp}
        description={local.description}
        errorMessage={local.errorMessage}
        size={size()}
        labelPosition={labelPosition()}
        labelAlign={labelAlign()}
        necessityIndicator={necessityIndicator()}
      />
    </HeadlessDateField>
  );
}

export type { CalendarDate, DateValue };
