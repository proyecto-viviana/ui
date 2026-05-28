// @ts-nocheck
import {
  children as resolveChildren,
  mergeProps,
  Show,
  splitProps,
  type JSX,
  createContext,
  createUniqueId,
  useContext,
} from "solid-js";
import {
  RadioGroup as HeadlessRadioGroup,
  Radio as HeadlessRadio,
  type RadioGroupProps as HeadlessRadioGroupProps,
  type RadioProps as HeadlessRadioProps,
  type RadioGroupRenderProps,
  type RadioRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { baseColor, focusRing, space, style } from "../style" with { type: "macro" };
import {
  controlFont,
  controlSize,
  field,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { FormContext, useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type RadioGroupOrientation = "horizontal" | "vertical";
export type RadioGroupSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2RadioGroupSize = "S" | "M" | "L" | "XL";
export type RadioGroupLabelPosition = "top" | "side";
export type RadioGroupLabelAlign = "start" | "end";
export type RadioGroupNecessityIndicator = "icon" | "label";

interface RadioStyleContextValue {
  size?: RadioGroupSize;
  isEmphasized?: boolean;
}

const RadioStyleContext = createContext<RadioStyleContextValue>({});

export interface RadioGroupProps extends Omit<
  HeadlessRadioGroupProps,
  "class" | "children" | "style" | "slot" | "ref"
> {
  /** The size of the RadioGroup. */
  size?: RadioGroupSize;
  /** The axis the radio elements should align with. */
  orientation?: RadioGroupOrientation;
  /** The label's overall position relative to the radio items. */
  labelPosition?: RadioGroupLabelPosition;
  /** The label's horizontal alignment relative to the radio items. */
  labelAlign?: RadioGroupLabelAlign;
  /** Whether the required state should be shown as an icon or text label. */
  necessityIndicator?: RadioGroupNecessityIndicator;
  /** A contextual help element to place next to the label. */
  contextualHelp?: JSX.Element;
  /** Whether the RadioGroup should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label for the group. */
  label?: JSX.Element;
  /** Description for the group. */
  description?: JSX.Element;
  /** Error message when invalid. */
  errorMessage?: JSX.Element;
  /** Children radios. */
  children?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the radio group root element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface RadioProps extends Omit<
  HeadlessRadioProps,
  "class" | "children" | "render" | "style" | "slot" | "ref" | "inputRef"
> {
  /** The size of the radio. Usually inherited from the RadioGroup or Form. */
  size?: RadioGroupSize;
  /** Whether the radio should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label text for the element. */
  children?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the underlying label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

interface RadioStyleProps {
  size?: S2RadioGroupSize;
  isEmphasized?: boolean;
  labelPosition?: "top" | "side";
  labelAlign?: "start" | "end";
  isInForm?: boolean;
}

type RadioStyleState = RadioRenderProps & RadioStyleProps;
type RadioGroupStyleState = RadioGroupRenderProps & RadioStyleProps;

export const RadioContext = createContext<SpectrumContextValue<RadioProps>>(null);
export const RadioGroupContext = createContext<SpectrumContextValue<RadioGroupProps>>(null);

const radioGroupRoot = style<RadioGroupStyleState>(
  {
    ...field(),
    "--field-gap": {
      type: "rowGap",
      value: "calc(var(--field-height) - 1lh)",
    },
  },
  getAllowedOverrides(),
);

const radioGroupLabelWrapper = style<RadioGroupStyleState>({
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

const radioGroupLabel = style<RadioGroupStyleState>({
  ...fieldLabel(),
});

const radioGroupItems = style<RadioGroupStyleState>({
  gridArea: "input",
  display: "flex",
  flexDirection: {
    orientation: {
      vertical: "column",
      horizontal: "row",
    },
  },
  flexWrap: "wrap",
  columnGap: 16,
  rowGap: "--field-gap",
});

const radioGroupHelpText = style<RadioGroupStyleState>({
  gridArea: "helptext",
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  contain: "inline-size",
  paddingTop: "--field-gap",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
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
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

const radioGroupRequiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const radioGroupNoWrap = style({
  whiteSpace: "nowrap",
});

const wrapper = style<RadioStyleState & { isInForm?: boolean }>(
  {
    display: "flex",
    position: "relative",
    columnGap: "text-to-control",
    alignItems: "baseline",
    font: controlFont(),
    transition: "colors",
    color: {
      default: baseColor("neutral"),
      isDisabled: {
        default: "disabled",
        forcedColors: "GrayText",
      },
    },
    gridColumnStart: {
      isInForm: "field",
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const circle = style<RadioStyleState>({
  ...focusRing(),
  size: controlSize("sm"),
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "default",
  borderRadius: "full",
  borderStyle: "solid",
  boxSizing: "border-box",
  borderWidth: {
    default: space(2),
    isSelected: "calc((self(height) - (4 / 16) * 1rem) / 2)",
  },
  forcedColorAdjust: "none",
  backgroundColor: "gray-25",
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isSelected: {
      isEmphasized: baseColor("accent-900"),
      forcedColors: "Highlight",
    },
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
  },
});

function normalizeRadioSize(size: RadioGroupSize | undefined): S2RadioGroupSize {
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

function radioPressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: RadioRenderProps,
): JSX.CSSProperties {
  const pressStyle = { "will-change": "transform" } as JSX.CSSProperties;

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    pressStyle.transform = `perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`;
  }

  return pressStyle;
}

function requiredIconStyle(size: S2RadioGroupSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const isInForm = useIsInForm();
  const formContext = useContext(FormContext);
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(RadioGroupContext), props.slot);
  const defaultProps: Partial<RadioGroupProps> = {
    orientation: "vertical",
    labelPosition: "top",
    labelAlign: "start",
    necessityIndicator: "icon",
  };
  const mergedProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "orientation",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "contextualHelp",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "children",
    "slot",
    "ref",
  ]);
  const size = () => normalizeRadioSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const idBase = createUniqueId();
  const labelId = `${idBase}-label`;
  const descriptionId = `${idBase}-description`;
  const errorId = `${idBase}-error`;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );

  const ariaDescribedBy = () => {
    const ids = [
      headlessProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      local.errorMessage && headlessProps.isInvalid ? errorId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const getClassName = (renderProps: RadioGroupRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      radioGroupRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          labelAlign: labelAlign(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const renderChildren = (renderProps: RadioGroupRenderProps) => (
    <>
      <Show when={local.label}>
        <div
          class={radioGroupLabelWrapper({
            ...renderProps,
            size: size(),
            labelPosition: labelPosition(),
            labelAlign: labelAlign(),
          })}
        >
          <span id={labelId} class={radioGroupLabel({ ...renderProps, size: size() })}>
            {local.label}
            <Show when={headlessProps.isRequired || necessityIndicator() === "label"}>
              <span class={radioGroupNoWrap}>
                &nbsp;
                <Show
                  when={necessityIndicator() === "icon"}
                  fallback={
                    <span aria-hidden={headlessProps.isRequired ? true : undefined}>
                      {headlessProps.isRequired ? "(required)" : "(optional)"}
                    </span>
                  }
                >
                  <AsteriskIcon
                    size={size() === "S" ? "M" : size()}
                    class={radioGroupRequiredIcon}
                    style={requiredIconStyle(size())}
                    aria-hidden="true"
                  />
                </Show>
              </span>
            </Show>
          </span>
          <Show when={local.contextualHelp}>
            <span data-slot="contextualHelp">{local.contextualHelp}</span>
          </Show>
        </div>
      </Show>
      <div
        class={radioGroupItems({
          ...renderProps,
          size: size(),
          orientation: local.orientation,
        })}
      >
        <FormContext.Provider
          value={{
            ...(formContext ?? {}),
            get size() {
              return size();
            },
            isRequired: undefined,
          }}
        >
          <RadioContext.Provider
            value={{
              get isEmphasized() {
                return local.isEmphasized;
              },
            }}
          >
            {local.children}
          </RadioContext.Provider>
        </FormContext.Provider>
      </div>
      <Show when={local.description && !renderProps.isInvalid}>
        <div id={descriptionId} class={radioGroupHelpText({ ...renderProps, size: size() })}>
          {local.description}
        </div>
      </Show>
      <Show when={local.errorMessage && renderProps.isInvalid}>
        <div id={errorId} role="alert" class={radioGroupHelpText({ ...renderProps, size: size() })}>
          <CenterBaseline>
            <AlertTriangleIcon aria-hidden="true" />
          </CenterBaseline>
          <span>{local.errorMessage}</span>
        </div>
      </Show>
    </>
  );

  return (
    <RadioStyleContext.Provider
      value={{
        get size() {
          return local.size;
        },
        get isEmphasized() {
          return local.isEmphasized;
        },
      }}
    >
      <HeadlessRadioGroup
        {...headlessProps}
        value={headlessProps.value}
        defaultValue={headlessProps.defaultValue}
        onChange={headlessProps.onChange}
        isDisabled={headlessProps.isDisabled}
        isReadOnly={headlessProps.isReadOnly}
        isRequired={headlessProps.isRequired}
        isInvalid={headlessProps.isInvalid}
        orientation={local.orientation}
        aria-labelledby={headlessProps["aria-labelledby"] ?? (local.label ? labelId : undefined)}
        aria-describedby={ariaDescribedBy()}
        ref={(element) => assignRootRef(element)}
        slot={local.slot ?? undefined}
        class={getClassName}
        style={mergedUnsafeStyle()}
        data-size={size()}
      >
        {renderChildren}
      </HeadlessRadioGroup>
    </RadioStyleContext.Provider>
  );
}

/**
 * Radio buttons allow users to select a single option from a list of mutually exclusive options.
 */
export function Radio(props: RadioProps): JSX.Element {
  const groupStyleContext = useContext(RadioStyleContext);
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(RadioContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "slot",
    "ref",
    "inputRef",
  ]);
  const size = () => normalizeRadioSize(local.size ?? groupStyleContext.size);
  const isEmphasized = () => local.isEmphasized ?? groupStyleContext.isEmphasized;
  let circleElement: HTMLDivElement | undefined;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLLabelElement> } | null)?.ref,
    props.ref,
  );
  const assignInputRef = mergeContextRefs(
    (contextProps as { inputRef?: RefLike<HTMLInputElement> } | null)?.inputRef,
    props.inputRef,
  );

  const getClassName = (renderProps: RadioRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      wrapper(
        {
          ...renderProps,
          size: size(),
          isEmphasized: isEmphasized(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessRadio
      {...headlessProps}
      ref={(element) => assignRootRef(element)}
      inputRef={(element) => assignInputRef(element)}
      slot={local.slot ?? undefined}
      class={getClassName}
      style={mergedUnsafeStyle()}
    >
      {(renderProps) => {
        const resolvedChildren = resolveChildren(() =>
          typeof local.children === "function" ? local.children(renderProps) : local.children,
        );
        const radioCircle = (
          <div
            ref={circleElement}
            class={circle({
              ...renderProps,
              size: size(),
              isEmphasized: isEmphasized(),
            })}
            style={radioPressScaleStyle(circleElement, renderProps)}
          />
        );

        return (
          <>
            <CenterBaseline>{radioCircle}</CenterBaseline>
            <Show when={resolvedChildren()}>{resolvedChildren()}</Show>
          </>
        );
      }}
    </HeadlessRadio>
  );
}
