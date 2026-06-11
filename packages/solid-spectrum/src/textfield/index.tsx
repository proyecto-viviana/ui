// @ts-nocheck
import { type JSX, mergeProps, splitProps, Show, useContext } from "solid-js";
import {
  TextField as HeadlessTextField,
  Label as HeadlessLabel,
  Input as HeadlessInput,
  TextFieldContext,
  type TextFieldProps as HeadlessTextFieldProps,
  type TextFieldRenderProps,
} from "@proyecto-viviana/solidaria-components";
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

export type TextFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2TextFieldSize = "S" | "M" | "L" | "XL";
export type TextFieldVariant = "outline" | "filled";
export type TextFieldLabelPosition = "top" | "side";
export type TextFieldLabelAlign = "start" | "end";
export type TextFieldNecessityIndicator = "icon" | "label";

export interface TextFieldProps extends Omit<
  HeadlessTextFieldProps,
  "class" | "style" | "children"
> {
  /** The size of the text field. */
  size?: TextFieldSize;
  /** Legacy visual variant. S2 TextFields do not expose visual variants. */
  variant?: TextFieldVariant;
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
  /** Position of the label relative to the input. */
  labelPosition?: TextFieldLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: TextFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: TextFieldNecessityIndicator;
}

interface TextFieldStyleProps extends TextFieldRenderProps {
  size?: S2TextFieldSize;
  labelPosition?: TextFieldLabelPosition;
  labelAlign?: TextFieldLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
  isQuiet?: boolean;
}

const textFieldRoot = style<TextFieldStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const textFieldLabelWrapper = style<TextFieldStyleProps>({
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
    isQuiet: "none",
  },
});

const textFieldLabel = style<TextFieldStyleProps>({
  ...fieldLabel(),
});

const fieldGroupStyles = style<TextFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default" }),
  ...fieldInput(),
  borderWidth: 2,
  borderStyle: "solid",
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

const textFieldInput = style({
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
  truncate: true,
});

const helpTextStyles = style<TextFieldStyleProps>({
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

function TextFieldDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(TextFieldContext);
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

function TextFieldError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(TextFieldContext);
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

export { TextArea } from "./TextArea";
export type { TextAreaProps, TextAreaSize, TextAreaVariant } from "./TextArea";

function normalizeTextFieldSize(size: TextFieldSize | undefined): S2TextFieldSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    case "S":
    case "M":
    case "L":
    case "XL":
      return size;
    default:
      return "M";
  }
}

function focusFieldInput(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;

  if (target?.closest("button,input,textarea,[role='button']")) {
    return;
  }

  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>("input, textarea")?.focus();
}

function requiredIconStyle(size: S2TextFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

export function TextField(props: TextFieldProps): JSX.Element {
  const isInForm = useIsInForm();
  const mergedProps = useProviderProps(useFormProps(props));
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "variant",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "validationState",
  ]);

  const size = () => normalizeTextFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const normalizedHeadlessProps = mergeProps(headlessProps, {
    get isInvalid() {
      return headlessProps.isInvalid ?? local.validationState === "invalid";
    },
    get validationBehavior() {
      return headlessProps.validationBehavior ?? (local.validationState ? "aria" : undefined);
    },
  });

  const rootClassName = (renderProps: TextFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      textFieldRoot(
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

  const labelWrapperClass = () =>
    textFieldLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: TextFieldRenderProps) =>
    textFieldLabel({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
      isStaticColor: false,
    });

  const groupClass = (renderProps: TextFieldRenderProps) =>
    fieldGroupStyles({
      ...renderProps,
      size: size(),
      isFocusWithin: renderProps.isFocused,
    });

  const helpClass = (renderProps: TextFieldRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  return (
    <HeadlessTextField
      {...normalizedHeadlessProps}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      class={rootClassName}
      style={local.UNSAFE_style}
      children={(renderProps) => (
        <>
          <Show when={local.label}>
            <div class={labelWrapperClass()}>
              <HeadlessLabel class={labelClass(renderProps)}>
                {local.label}
                <Show when={renderProps.isRequired || necessityIndicator() === "label"}>
                  <span class={noWrap}>
                    &nbsp;
                    <Show
                      when={necessityIndicator() === "icon"}
                      fallback={
                        <span aria-hidden={renderProps.isRequired ? true : undefined}>
                          {renderProps.isRequired ? "(required)" : "(optional)"}
                        </span>
                      }
                    >
                      <AsteriskIcon
                        size={size() === "S" ? "M" : size()}
                        styles={requiredIcon}
                        style={requiredIconStyle(size())}
                        aria-hidden="true"
                      />
                    </Show>
                  </span>
                </Show>
              </HeadlessLabel>
            </div>
          </Show>

          <div
            class={groupClass(renderProps)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") {
                focusFieldInput(event);
              }
            }}
            onTouchEnd={focusFieldInput}
            data-focused={renderProps.isFocused ? "true" : undefined}
            data-focus-visible={renderProps.isFocusVisible ? "true" : undefined}
            data-disabled={renderProps.isDisabled ? "true" : undefined}
            data-invalid={renderProps.isInvalid ? "true" : undefined}
          >
            <HeadlessInput class={textFieldInput} />
            <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
              <CenterBaseline>
                <AlertTriangleIcon styles={fieldErrorIcon} />
              </CenterBaseline>
            </Show>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <TextFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </TextFieldDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <TextFieldError class={helpClass(renderProps, true)}>
              {local.errorMessage}
            </TextFieldError>
          </Show>
        </>
      )}
    />
  );
}

export { TextField as TextFieldBase };
