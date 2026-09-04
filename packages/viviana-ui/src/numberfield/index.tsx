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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/NumberField.tsx

// Port of packages/@react-spectrum/s2/src/NumberField.tsx.

import {
  type JSX,
  createContext,
  createSignal,
  createUniqueId,
  mergeProps,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import {
  NumberField as HeadlessNumberField,
  NumberFieldLabel as HeadlessNumberFieldLabel,
  NumberFieldGroup as HeadlessNumberFieldGroup,
  NumberFieldInput as HeadlessNumberFieldInput,
  NumberFieldIncrementButton as HeadlessNumberFieldIncrementButton,
  NumberFieldDecrementButton as HeadlessNumberFieldDecrementButton,
  NumberFieldContext as HeadlessNumberFieldContext,
  type NumberFieldProps as HeadlessNumberFieldProps,
  type NumberFieldRenderProps,
  type NumberFieldInputRenderProps,
  type NumberFieldButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, space, style } from "../style" with { type: "macro" };
import {
  control,
  controlBorderRadius,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import { s2IntlStrings } from "../intl";
import AddIcon from "../icon/ui-icons/Add";
import DashIcon from "../icon/ui-icons/Dash";
import { FieldPrefix, PrefixInputProvider } from "../field/prefix";
import { useProviderProps } from "../provider";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";
import { HelpText } from "../form/HelpText";

export type NumberFieldSize = "S" | "M" | "L" | "XL";
type S2NumberFieldSize = NumberFieldSize;
export type NumberFieldLabelPosition = "top" | "side";
export type NumberFieldLabelAlign = "start" | "end";
export type NumberFieldNecessityIndicator = "icon" | "label";

export interface NumberFieldProps extends Omit<
  HeadlessNumberFieldProps,
  "class" | "style" | "children" | "label"
> {
  /** The size of the number field. */
  size?: NumberFieldSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label text for the input. */
  label?: JSX.Element;
  /** Description text shown below the input. */
  description?: JSX.Element;
  /** Error message shown when invalid. */
  errorMessage?: JSX.Element;
  /** Whether to hide the stepper buttons. */
  hideStepper?: boolean;
  /** Position of the label relative to the input. */
  labelPosition?: NumberFieldLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: NumberFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: NumberFieldNecessityIndicator;
  /** An icon or text rendered before the input. */
  prefix?: JSX.Element;
}

export const NumberFieldContext = createContext<SpectrumContextValue<NumberFieldProps>>(null);

interface NumberFieldStyleProps extends NumberFieldRenderProps {
  size?: S2NumberFieldSize;
  labelPosition?: NumberFieldLabelPosition;
  labelAlign?: NumberFieldLabelAlign;
  isFocusWithin?: boolean;
  isStepperHidden?: boolean;
  isInForm?: boolean;
}

const numberFieldRoot = style<NumberFieldStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const numberFieldLabelWrapper = style<NumberFieldStyleProps>({
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

const numberFieldLabel = style<NumberFieldStyleProps>({
  ...fieldLabel(),
});

const numberFieldGroup = style<NumberFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", register: "matte" }),
  ...fieldInput(),
  paddingStart: "edge-to-text",
  paddingEnd: {
    default: 0,
    isStepperHidden: "edge-to-text",
  },
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

const numberFieldInput = style({
  padding: 0,
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    "::placeholder": {
      default: "gray-600",
      forcedColors: "GrayText",
    },
  },
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  width: "full",
  outlineStyle: "none",
  borderStyle: "none",
  // Upstream S2 NumberField renders the shared `<Input>` from `Field.tsx`, whose style
  // ends in `truncate: true` (→ overflow:hidden; text-overflow:ellipsis; white-space:nowrap)
  // — NOT `textAlign: 'start'`. The hardcoded `textAlign` was a self-inflicted divergence
  // that dropped truncation; reverted to `truncate` to match the shared Input byte-for-byte.
  truncate: true,
});

const stepperContainer = style<NumberFieldStyleProps>({
  display: "flex",
  flexDirection: "row",
  gap: {
    size: {
      S: 8,
      M: 4,
      L: 8,
      XL: 8,
    },
  },
  marginEnd: {
    size: {
      S: 2,
      M: 4,
      L: space(6),
      XL: space(6),
    },
  },
});

const inputButton = style<
  NumberFieldButtonRenderProps & { size?: S2NumberFieldSize; type: "decrement" | "increment" }
>({
  ...controlBorderRadius("sm"),
  display: "flex",
  outlineStyle: "none",
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
  marginStart: {
    default: "text-to-control",
    type: {
      increment: 0,
    },
  },
  aspectRatio: "square",
  flexShrink: 0,
  minHeight: 0,
  transition: {
    default: "default",
    forcedColors: "none",
  },
  backgroundColor: {
    default: baseColor("gray-100"),
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isHovered: "Highlight",
      isDisabled: "GrayText",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonFace",
    },
  },
  cursor: "default",
});

const iconStyles = style({
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const fieldErrorIcon = style({
  size: "1lh",
  marginStart: "text-to-visual",
  marginEnd: fontRelative(-2),
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "negative-1000",
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

function normalizeNumberFieldSize(size: NumberFieldSize | undefined): S2NumberFieldSize {
  return size ?? "M";
}

function focusFieldInput(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;

  if (target?.closest("button,input,textarea,[role='button']")) {
    return;
  }

  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>("input")?.focus();
}

function requiredIconStyle(size: S2NumberFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function buttonPressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: NumberFieldButtonRenderProps,
): JSX.CSSProperties {
  const pressStyle = { "will-change": "transform" } as JSX.CSSProperties;

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    pressStyle.transform = `perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`;
  }

  return pressStyle;
}

/**
 * NumberFields allow users to input number values with a keyboard or increment/decrement with step buttons.
 */
export function NumberField(props: NumberFieldProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(NumberFieldContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "placeholder",
    "description",
    "errorMessage",
    "hideStepper",
    "onInput",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "prefix",
  ]);
  const prefixId = createUniqueId();
  const size = () => normalizeNumberFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  let decrementButtonElement: HTMLDivElement | undefined;
  let incrementButtonElement: HTMLDivElement | undefined;

  // Match upstream's root style INVOCATION args exactly: S2 `NumberField.tsx` passes
  // only `{ isInForm: !!formContext, labelPosition, size }` to `style(field(), …)(…)`
  // — NOT the render-prop bag. `isDisabled`/`isFocused`/… are threaded DOWN to the
  // FieldGroup/label/help text, not applied to the field grid. The grid's `field()` has
  // no such conditions today, but spreading `…renderProps` here would silently light any
  // future one; keep the arg set faithful (same lesson as SearchField's root-color fix).
  const rootClassName = (_renderProps: NumberFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      numberFieldRoot(
        {
          size: size(),
          labelPosition: labelPosition(),
          isInForm: false,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelWrapperClass = () =>
    numberFieldLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: NumberFieldRenderProps) =>
    numberFieldLabel({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
    });

  const groupClass = (renderProps: NumberFieldRenderProps) =>
    numberFieldGroup({
      ...renderProps,
      size: size(),
      isFocusWithin: isFocusWithin(),
      isStepperHidden: local.hideStepper,
    });

  const stepperClass = () => stepperContainer({ size: size() });

  const inputClass = (_renderProps: NumberFieldInputRenderProps) => numberFieldInput;

  const buttonClass =
    (type: "decrement" | "increment") => (renderProps: NumberFieldButtonRenderProps) =>
      inputButton({
        ...renderProps,
        size: size(),
        type,
      });

  return (
    <HeadlessNumberField
      {...headlessProps}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      class={rootClassName}
      style={local.UNSAFE_style}
      children={(renderProps: NumberFieldRenderProps) => (
        <>
          <Show when={local.label}>
            <div class={labelWrapperClass()}>
              <HeadlessNumberFieldLabel class={labelClass(renderProps)}>
                {local.label}
                <Show when={renderProps.isRequired || necessityIndicator() === "label"}>
                  <span class={noWrap}>
                    &nbsp;
                    <Show
                      when={necessityIndicator() === "label"}
                      fallback={
                        <AsteriskIcon
                          aria-hidden="true"
                          size="XS"
                          class={requiredIcon}
                          style={requiredIconStyle(size())}
                        />
                      }
                    >
                      {stringFormatter().format(
                        renderProps.isRequired ? "label.(required)" : "label.(optional)",
                      )}
                    </Show>
                  </span>
                </Show>
              </HeadlessNumberFieldLabel>
            </div>
          </Show>

          <HeadlessNumberFieldGroup
            class={groupClass(renderProps)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") {
                focusFieldInput(event);
              }
            }}
            onTouchEnd={focusFieldInput}
            onFocusIn={() => setIsFocusWithin(true)}
            onFocusOut={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsFocusWithin(false);
              }
            }}
            data-focused={isFocusWithin() ? "true" : undefined}
            data-disabled={renderProps.isDisabled ? "true" : undefined}
            data-invalid={renderProps.isInvalid ? "true" : undefined}
          >
            <Show
              when={local.prefix}
              fallback={
                <HeadlessNumberFieldInput
                  class={inputClass}
                  placeholder={local.placeholder}
                  onInput={local.onInput}
                />
              }
            >
              <FieldPrefix id={prefixId}>{local.prefix}</FieldPrefix>
              <PrefixInputProvider context={HeadlessNumberFieldContext} prefixId={prefixId}>
                <HeadlessNumberFieldInput
                  class={inputClass}
                  placeholder={local.placeholder}
                  onInput={local.onInput}
                />
              </PrefixInputProvider>
            </Show>
            <Show when={renderProps.isInvalid}>
              <AlertTriangleIcon aria-hidden="true" styles={fieldErrorIcon} />
            </Show>
            <Show when={!local.hideStepper}>
              <div class={stepperClass()}>
                <HeadlessNumberFieldDecrementButton
                  ref={decrementButtonElement}
                  class={buttonClass("decrement")}
                  style={(buttonRenderProps: NumberFieldButtonRenderProps) =>
                    buttonPressScaleStyle(decrementButtonElement, buttonRenderProps)
                  }
                >
                  <DashIcon size={size()} class={iconStyles} />
                </HeadlessNumberFieldDecrementButton>
                <HeadlessNumberFieldIncrementButton
                  ref={incrementButtonElement}
                  class={buttonClass("increment")}
                  style={(buttonRenderProps: NumberFieldButtonRenderProps) =>
                    buttonPressScaleStyle(incrementButtonElement, buttonRenderProps)
                  }
                >
                  <AddIcon size={size()} class={iconStyles} />
                </HeadlessNumberFieldIncrementButton>
              </div>
            </Show>
          </HeadlessNumberFieldGroup>

          <HelpText
            size={size()}
            isDisabled={renderProps.isDisabled}
            isInvalid={renderProps.isInvalid}
            description={local.description}
          >
            {local.errorMessage}
          </HelpText>
        </>
      )}
    />
  );
}

export type { NumberFieldState } from "@proyecto-viviana/solid-stately";
