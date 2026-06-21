// @ts-nocheck
import {
  type JSX,
  createContext,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import {
  getSlottedContextProps,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import {
  Label as HeadlessLabel,
  TextArea as HeadlessTextArea,
  TextField as HeadlessTextField,
  TextFieldContext as HeadlessTextFieldContext,
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
import { mergeStyles } from "../style/runtime";
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { textAreaFieldGroupStyles, textAreaInputStyles } from "./s2-textarea-styles";

export type TextAreaSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2TextAreaSize = "S" | "M" | "L" | "XL";
export type TextAreaVariant = "outline" | "filled";
export type TextAreaLabelPosition = "top" | "side";
export type TextAreaLabelAlign = "start" | "end";
export type TextAreaNecessityIndicator = "icon" | "label";

export interface TextAreaProps extends Omit<
  HeadlessTextFieldProps,
  "class" | "style" | "children" | "type" | "pattern"
> {
  /** The size of the text area. */
  size?: TextAreaSize;
  /** Legacy visual variant. S2 TextAreas do not expose visual variants. */
  variant?: TextAreaVariant;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label text for the textarea. */
  label?: JSX.Element;
  /** Description text shown below the textarea. */
  description?: JSX.Element;
  /** Error message shown when invalid. */
  errorMessage?: JSX.Element;
  /** Position of the label relative to the textarea. */
  labelPosition?: TextAreaLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: TextAreaLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: TextAreaNecessityIndicator;
}

export const TextAreaContext = createContext<SpectrumContextValue<TextAreaProps>>(null);

interface TextAreaStyleProps extends TextFieldRenderProps {
  size?: S2TextAreaSize;
  labelPosition?: TextAreaLabelPosition;
  labelAlign?: TextAreaLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
  isQuiet?: boolean;
}

const textAreaRoot = style<TextAreaStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const textAreaLabelWrapper = style<TextAreaStyleProps>({
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

const textAreaLabel = style<TextAreaStyleProps>({
  ...fieldLabel(),
});

const fieldGroupStyles = style<TextAreaStyleProps>({
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

const helpTextStyles = style<TextAreaStyleProps>({
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

function TextAreaDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(HeadlessTextFieldContext);
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

function TextAreaError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(HeadlessTextFieldContext);
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

function normalizeTextAreaSize(size: TextAreaSize | undefined): S2TextAreaSize {
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

function requiredIconStyle(size: S2TextAreaSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function resizeTextArea(element: HTMLTextAreaElement | undefined) {
  if (!element) {
    return;
  }

  const previousAlignSelf = element.style.alignSelf;
  const previousOverflow = element.style.overflow;
  const isFirefox = "MozAppearance" in element.style;

  if (!isFirefox) {
    element.style.overflow = "hidden";
  }
  element.style.alignSelf = "start";
  element.style.height = "auto";

  const measuredHeight = element.scrollHeight + (element.offsetHeight - element.clientHeight);
  if (measuredHeight > 0) {
    element.style.height = `${measuredHeight}px`;
  }

  element.style.overflow = previousOverflow;
  element.style.alignSelf = previousAlignSelf;
}

/**
 * TextAreas are multiline text inputs, useful for cases where users have
 * a sizable amount of text to enter.
 */
export function TextArea(props: TextAreaProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(TextAreaContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
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
  ]);
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);
  let textAreaElement: HTMLTextAreaElement | undefined;

  const size = () => normalizeTextAreaSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";

  onMount(() => {
    const element = textAreaElement;
    if (!element) {
      return;
    }

    const resize = () => resizeTextArea(element);
    element.addEventListener("input", resize);
    queueMicrotask(resize);
    onCleanup(() => element.removeEventListener("input", resize));
  });

  createEffect(() => {
    headlessProps.value;
    headlessProps.defaultValue;
    queueMicrotask(() => resizeTextArea(textAreaElement));
  });

  const rootClassName = (renderProps: TextFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      textAreaRoot(
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
    textAreaLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: TextFieldRenderProps) =>
    textAreaLabel({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
      isStaticColor: false,
    });

  const groupClass = (renderProps: TextFieldRenderProps) =>
    mergeStyles(
      fieldGroupStyles({
        ...renderProps,
        size: size(),
        isFocusWithin: isFocusWithin(),
      }),
      textAreaFieldGroupStyles,
    );

  // React S2 does not pass field size into TextAreaInput; it inherits font size
  // from the group while keeping the default min-height and center padding.
  const textAreaInputClass = () => textAreaInputStyles({});

  const helpClass = (renderProps: TextFieldRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  return (
    <HeadlessTextField
      {...headlessProps}
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
            <HeadlessTextArea
              class={textAreaInputClass()}
              placeholder={headlessProps.placeholder ?? " "}
              ref={(element) => {
                textAreaElement = element;
                resizeTextArea(element);
              }}
            />
            <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
              <CenterBaseline>
                <AlertTriangleIcon styles={fieldErrorIcon} />
              </CenterBaseline>
            </Show>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <TextAreaDescription class={helpClass(renderProps, false)}>
              {local.description}
            </TextAreaDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <TextAreaError class={helpClass(renderProps, true)}>{local.errorMessage}</TextAreaError>
          </Show>
        </>
      )}
    />
  );
}
