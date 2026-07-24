// @ts-nocheck - style-system generics need the same dedicated pass as DateField.
import {
  createContext,
  createEffect,
  createSignal,
  type JSX,
  mergeProps,
  onCleanup,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import {
  TimeField as HeadlessTimeField,
  TimeFieldLabel as HeadlessTimeFieldLabel,
  TimeFieldDescription as HeadlessTimeFieldDescription,
  TimeFieldErrorMessage as HeadlessTimeFieldErrorMessage,
  DateInput,
  DateSegment,
  useDateFieldContext,
  type TimeFieldProps as HeadlessTimeFieldProps,
  type TimeFieldRenderProps,
  type DateSegmentRenderProps,
  type TimeValue,
} from "@proyecto-viviana/solidaria-components";
import {
  useLocale,
  createFocusVisibleListener,
  isFocusVisible as isGlobalFocusVisible,
} from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style" with { type: "macro" };
import {
  control,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";

export type TimeFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2TimeFieldSize = "S" | "M" | "L" | "XL";
export type TimeFieldLabelPosition = "top" | "side";
export type TimeFieldLabelAlign = "start" | "end";
export type TimeFieldNecessityIndicator = "icon" | "label";

export interface TimeFieldProps<T extends TimeValue = TimeValue> extends Omit<
  HeadlessTimeFieldProps<T>,
  "class" | "style" | "children"
> {
  /** The size of the field. @default 'M' */
  size?: TimeFieldSize;
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
  labelPosition?: TimeFieldLabelPosition;
  /** Label alignment for side labels. */
  labelAlign?: TimeFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: TimeFieldNecessityIndicator;
}

export const TimeFieldContext = createContext<SpectrumContextValue<TimeFieldProps<any>>>(null);

interface TimeFieldStyleProps extends TimeFieldRenderProps {
  size?: S2TimeFieldSize;
  labelPosition?: TimeFieldLabelPosition;
  labelAlign?: TimeFieldLabelAlign;
  isFocusWithin?: boolean;
  isFocusVisible?: boolean;
  isInForm?: boolean;
}

const timeFieldRoot = style<TimeFieldStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const timeFieldLabelWrapper = style<TimeFieldStyleProps>({
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

const timeFieldLabel = style<TimeFieldStyleProps>({
  ...fieldLabel(),
});

const timeFieldGroup = style<TimeFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", register: "matte" }),
  ...fieldInput(),
  // Unlike S2 DateField, S2 TimeField's FieldGroup does NOT set textWrap:'nowrap'
  // (see @react-spectrum/s2 TimeField.tsx — the styles prop is only fieldInput()
  // + paddingX). The segmentContainer below still pins nowrap; keeping it here
  // too would make the FieldGroup compute white-space:nowrap where S2 is normal.
  paddingX: "edge-to-text",
  transition: "default",
  borderColor: {
    default: "well-border",
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
    default: "well",
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

const timeSegment = style<DateSegmentRenderProps & { isPunctuation?: boolean }>({
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

const helpText = style<TimeFieldStyleProps>({
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

function normalizeTimeFieldSize(size: TimeFieldSize | undefined): S2TimeFieldSize {
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

function requiredIconStyle(size: S2TimeFieldSize): JSX.CSSProperties {
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

function TimeFieldContent(props: {
  label?: JSX.Element;
  contextualHelp?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
  size: S2TimeFieldSize;
  labelPosition: TimeFieldLabelPosition;
  labelAlign: TimeFieldLabelAlign;
  necessityIndicator: TimeFieldNecessityIndicator;
}): JSX.Element {
  // TimeField reuses the DateField segment stack, so it reads the shared
  // DateFieldContext (state + group aria) exactly like DateFieldContent.
  const { state, aria } = useDateFieldContext();
  const isDisabled = () => state.isDisabled();
  const isInvalid = () => state.isInvalid();
  const isRequired = () => state.isRequired();
  // S2's FieldGroup is a RAC <Group role="presentation"> that consumes the SAME
  // GroupContext as the inner DateInput group, so both elements carry the
  // field's aria-labelledby (label) and aria-describedby (value description +
  // help text). We render the FieldGroup as a styled div, so surface those two
  // identity attributes here; the group event handlers stay local (duplicating
  // the arrow-nav onKeyDown would double-advance focus).
  const groupAria = () => aria.inputProps as Record<string, string | undefined>;
  // Track focus-within on this separate, non-focusable presentation wrapper via
  // the reliably-bubbling onFocusIn/onFocusOut (Solid's onFocus does not bubble),
  // and compose focus-visible from the global interaction modality — exactly how
  // createFocusRing derives `isFocusVisible = isFocused && focusVisibleFlag`.
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);
  const [isFocusVisibleModality, setIsFocusVisibleModality] = createSignal(isGlobalFocusVisible());
  createEffect(() => {
    const cleanup = createFocusVisibleListener((visible) => setIsFocusVisibleModality(visible));
    onCleanup(cleanup);
  });
  const isFocusVisibleWithin = () => isFocusWithin() && isFocusVisibleModality();

  return (
    <>
      <Show when={props.label}>
        <div
          class={timeFieldLabelWrapper({
            size: props.size,
            labelPosition: props.labelPosition,
            labelAlign: props.labelAlign,
          })}
        >
          <HeadlessTimeFieldLabel
            class={timeFieldLabel({
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
          </HeadlessTimeFieldLabel>
          <Show when={props.contextualHelp}>
            <span data-slot="contextualHelp" class={noWrap}>
              {props.contextualHelp}
            </span>
          </Show>
        </div>
      </Show>

      <div
        role="presentation"
        aria-labelledby={groupAria()["aria-labelledby"]}
        aria-describedby={groupAria()["aria-describedby"]}
        class={timeFieldGroup({
          size: props.size,
          isInvalid: isInvalid(),
          isDisabled: isDisabled(),
          isFocusWithin: isFocusWithin(),
          isFocusVisible: isFocusVisibleWithin(),
        })}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") {
            focusFirstEditableSegment(event);
          }
        }}
        onTouchEnd={focusFirstEditableSegment}
        onFocusIn={() => setIsFocusWithin(true)}
        onFocusOut={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsFocusWithin(false);
          }
        }}
        data-focused={isFocusWithin() ? "true" : undefined}
        data-focus-visible={isFocusVisibleWithin() ? "true" : undefined}
        data-disabled={isDisabled() ? "true" : undefined}
        data-invalid={isInvalid() ? "true" : undefined}
      >
        {/*
          S2 layers the segments: FieldGroup (this bordered role="presentation"
          wrapper) → DateInputContainer (segmentContainer div) → AriaDateInput
          (the unstyled role="group"). Keep the segmentContainer styling on the
          wrapper and leave the group unstyled so its computed box matches.
        */}
        <div class={segmentContainer}>
          <DateInput class="">
            {(segment) => (
              <DateSegment
                segment={segment}
                class={(renderProps) =>
                  timeSegment({
                    ...renderProps,
                    isDisabled: isDisabled(),
                    isPunctuation: segment.type === "literal",
                  })
                }
              />
            )}
          </DateInput>
        </div>

        <Show when={isInvalid() && !isDisabled()}>
          <CenterBaseline>
            <AlertTriangleIcon styles={fieldErrorIcon} />
          </CenterBaseline>
        </Show>
      </div>

      <Show when={props.description && !isInvalid()}>
        <HeadlessTimeFieldDescription
          class={helpText({ size: props.size, isInvalid: false, isDisabled: isDisabled() })}
        >
          {props.description}
        </HeadlessTimeFieldDescription>
      </Show>

      <Show when={props.errorMessage && isInvalid()}>
        <HeadlessTimeFieldErrorMessage
          class={helpText({ size: props.size, isInvalid: true, isDisabled: isDisabled() })}
        >
          {props.errorMessage}
        </HeadlessTimeFieldErrorMessage>
      </Show>
    </>
  );
}

/**
 * A time field allows users to enter and edit time values using a keyboard.
 */
export function TimeField<T extends TimeValue = TimeValue>(props: TimeFieldProps<T>): JSX.Element {
  // Slotted context props sit below explicit props; `useFormProps`/`useProviderProps`
  // wrap the result so the form/Skeleton disabled-force stays outermost (mirrors
  // upstream's `useSpectrumContextProps` → `useFormProps` order).
  const contextProps = getSlottedContextProps(useContext(TimeFieldContext), props.slot);
  const merged = useProviderProps(useFormProps(mergeProps(contextProps ?? {}, props)));
  const isInForm = useIsInForm();
  const [local, rest] = splitProps(merged, [
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

  const size = () => normalizeTimeFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const isInvalid = () => local.isInvalid === true;
  const locale = useLocale();

  const rootClassName = (renderProps: TimeFieldRenderProps) =>
    [
      "solidaria-TimeField",
      local.UNSAFE_className,
      local.class,
      timeFieldRoot(
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
    <HeadlessTimeField
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
      <TimeFieldContent
        label={local.label}
        contextualHelp={local.contextualHelp}
        description={local.description}
        errorMessage={local.errorMessage}
        size={size()}
        labelPosition={labelPosition()}
        labelAlign={labelAlign()}
        necessityIndicator={necessityIndicator()}
      />
    </HeadlessTimeField>
  );
}

export type { TimeValue };
