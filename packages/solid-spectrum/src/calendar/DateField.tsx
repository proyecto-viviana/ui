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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/DateField.tsx

// Port of packages/@react-spectrum/s2/src/DateField.tsx.
// @ts-nocheck - style-system generics need the same dedicated pass as DatePicker.
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

export const DateFieldContext = createContext<SpectrumContextValue<DateFieldProps<any>>>(null);

interface DateFieldStyleProps extends DateFieldRenderProps {
  size?: S2DateFieldSize;
  labelPosition?: DateFieldLabelPosition;
  labelAlign?: DateFieldLabelAlign;
  isFocusWithin?: boolean;
  isFocusVisible?: boolean;
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
  const { state, aria } = useDateFieldContext();
  const isDisabled = () => state.isDisabled();
  const isInvalid = () => state.isInvalid();
  const isRequired = () => state.isRequired();
  // S2's FieldGroup is a RAC <Group role="presentation"> that consumes the SAME
  // GroupContext as the inner DateInput group, so upstream both elements carry
  // the field's aria-labelledby (label) and aria-describedby (value description
  // + help text). We render the FieldGroup as a styled div, so surface those two
  // identity attributes here; the D6 AX driver walks every element with
  // aria-describedby, and the presentation wrapper must match React's. The group
  // event handlers stay local — they're pruned from the AX tree and duplicating
  // the arrow-nav onKeyDown would double-advance focus (RAC relies on synthetic
  // stopPropagation ordering we can't guarantee across Solid's delegation).
  const groupAria = () => aria.inputProps as Record<string, string | undefined>;
  // Mirror the RAC Group that S2's FieldGroup renders on. Its `useFocusRing({
  // within: true })` exposes TWO states the styled FieldGroup reads
  // (Field.tsx:281-284): `isFocusWithin` drives the border color, while
  // `isFocusVisible` (focus-within AND keyboard modality) drives the outline
  // focus ring (`...focusRing()`) and brightens the text to `neutral:focused`
  // (`baseColor('neutral').isFocusVisible`). The headless field tracks focus on
  // the inner role="group"; this bordered presentation wrapper is a separate,
  // non-focusable element, so track focus-within here via the reliably-bubbling
  // onFocusIn/onFocusOut (Solid's onFocus does not bubble to a container) and
  // compose focus-visible from the global interaction modality — exactly how
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
        role="presentation"
        aria-labelledby={groupAria()["aria-labelledby"]}
        aria-describedby={groupAria()["aria-describedby"]}
        class={dateFieldGroup({
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
                  dateSegment({
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
  // Slotted context props sit below explicit props; `useFormProps`/`useProviderProps`
  // wrap the result so the form/Skeleton disabled-force stays outermost (mirrors
  // upstream's `useSpectrumContextProps` → `useFormProps` order).
  const contextProps = getSlottedContextProps(useContext(DateFieldContext), props.slot);
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
