// @ts-nocheck
import { type JSX, createSignal, splitProps, Show, useContext } from "solid-js";
import {
  NumberField as HeadlessNumberField,
  NumberFieldLabel as HeadlessNumberFieldLabel,
  NumberFieldGroup as HeadlessNumberFieldGroup,
  NumberFieldInput as HeadlessNumberFieldInput,
  NumberFieldIncrementButton as HeadlessNumberFieldIncrementButton,
  NumberFieldDecrementButton as HeadlessNumberFieldDecrementButton,
  NumberFieldContext,
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
import AddIcon from "../icon/ui-icons/Add";
import DashIcon from "../icon/ui-icons/Dash";
import { useProviderProps } from "../provider";

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
}

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
  ...control({ shape: "default" }),
  ...fieldInput(),
  borderWidth: 2,
  borderStyle: "solid",
  paddingStart: "edge-to-text",
  paddingEnd: {
    default: 0,
    isStepperHidden: "edge-to-text",
  },
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
  textAlign: "start",
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

const helpTextStyles = style<NumberFieldStyleProps>({
  gridArea: "helptext",
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  fontSize: {
    default: "ui-sm",
    size: {
      S: "ui-xs",
      L: "ui",
      XL: "ui-lg",
    },
  },
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

function NumberFieldDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(NumberFieldContext);
  if (!context) return null;
  const descriptionProps = () => {
    const { ref: _ref, ...rest } = context.descriptionProps as Record<string, unknown>;
    return rest;
  };

  return (
    <p {...descriptionProps()} class={props.class}>
      {props.children}
    </p>
  );
}

function NumberFieldError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(NumberFieldContext);
  if (!context) return null;
  const errorMessageProps = () => {
    const { ref: _ref, ...rest } = context.errorMessageProps as Record<string, unknown>;
    return rest;
  };

  return (
    <p {...errorMessageProps()} class={props.class}>
      {props.children}
    </p>
  );
}

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

function iconSize(size: S2NumberFieldSize) {
  return size === "S" ? "XS" : size;
}

function stepperIconStyle(size: S2NumberFieldSize): JSX.CSSProperties {
  const pixelSize = size === "S" ? 8 : size === "M" || size === "L" ? 10 : 12;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

/**
 * NumberFields allow users to input number values with a keyboard or increment/decrement with step buttons.
 */
export function NumberField(props: NumberFieldProps): JSX.Element {
  const mergedProps = useProviderProps(props);
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
  ]);
  const size = () => normalizeNumberFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  let decrementButtonElement: HTMLDivElement | undefined;
  let incrementButtonElement: HTMLDivElement | undefined;

  const rootClassName = (renderProps: NumberFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      numberFieldRoot(
        {
          ...renderProps,
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

  const helpClass = (renderProps: NumberFieldRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
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
                      (required)
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
            <HeadlessNumberFieldInput
              class={inputClass}
              placeholder={local.placeholder}
              onInput={local.onInput}
            />
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
                  <DashIcon
                    size={iconSize(size())}
                    class={iconStyles}
                    style={stepperIconStyle(size())}
                  />
                </HeadlessNumberFieldDecrementButton>
                <HeadlessNumberFieldIncrementButton
                  ref={incrementButtonElement}
                  class={buttonClass("increment")}
                  style={(buttonRenderProps: NumberFieldButtonRenderProps) =>
                    buttonPressScaleStyle(incrementButtonElement, buttonRenderProps)
                  }
                >
                  <AddIcon
                    size={iconSize(size())}
                    class={iconStyles}
                    style={stepperIconStyle(size())}
                  />
                </HeadlessNumberFieldIncrementButton>
              </div>
            </Show>
          </HeadlessNumberFieldGroup>

          <Show when={local.description && !renderProps.isInvalid}>
            <NumberFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </NumberFieldDescription>
          </Show>
          <Show when={local.errorMessage && renderProps.isInvalid}>
            <NumberFieldError class={helpClass(renderProps, true)}>
              {local.errorMessage}
            </NumberFieldError>
          </Show>
        </>
      )}
    />
  );
}

export type { NumberFieldState } from "@proyecto-viviana/solid-stately";
