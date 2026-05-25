// @ts-nocheck
import {
  children as resolveChildren,
  mergeProps as solidMergeProps,
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
import { baseColor, focusRing, space, style } from "../style";
import {
  controlFont,
  controlSize,
  field,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import { useProviderProps } from "../provider";

export type RadioGroupOrientation = "horizontal" | "vertical";
export type RadioGroupSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2RadioGroupSize = "S" | "M" | "L" | "XL";

interface RadioContextValue {
  size: S2RadioGroupSize;
  isEmphasized?: boolean;
}

const RadioStyleContext = createContext<RadioContextValue>({ size: "M" });

export interface RadioGroupProps extends Omit<
  HeadlessRadioGroupProps,
  "class" | "children" | "style"
> {
  /** The size of the RadioGroup. */
  size?: RadioGroupSize;
  /** The axis the radio elements should align with. */
  orientation?: RadioGroupOrientation;
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
}

export interface RadioProps extends Omit<HeadlessRadioProps, "class" | "children" | "style"> {
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

function radioDataSize(size: RadioGroupSize | undefined): RadioGroupSize {
  return size ?? "md";
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

/**
 * Radio groups allow users to select a single option from a list of mutually exclusive options.
 */
export function RadioGroup(props: RadioGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const defaultProps: Partial<RadioGroupProps> = {
    orientation: "vertical",
  };
  const merged = solidMergeProps(defaultProps, providerProps);
  const [local, headlessProps] = splitProps(merged, [
    "size",
    "orientation",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "children",
  ]);
  const size = () => normalizeRadioSize(local.size);
  const labelId = createUniqueId();
  const descriptionId = createUniqueId();
  const errorId = createUniqueId();
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
      local.UNSAFE_className,
      local.class,
      radioGroupRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: "top",
          labelAlign: "start",
          isInForm: false,
        },
        local.styles,
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
            labelPosition: "top",
          })}
        >
          <span id={labelId} class={radioGroupLabel({ ...renderProps, size: size() })}>
            {local.label}
          </span>
        </div>
      </Show>
      <div class={radioGroupItems({ ...renderProps, size: size() })}>{local.children}</div>
      <Show when={local.description && !renderProps.isInvalid}>
        <div id={descriptionId} class={radioGroupHelpText({ ...renderProps, size: size() })}>
          {local.description}
        </div>
      </Show>
      <Show when={local.errorMessage}>
        <div
          id={errorId}
          role="alert"
          class={radioGroupHelpText({ ...renderProps, size: size(), isInvalid: true })}
          style={{ display: renderProps.isInvalid ? undefined : "none" }}
        >
          {local.errorMessage}
        </div>
      </Show>
    </>
  );

  return (
    <RadioStyleContext.Provider
      value={{
        get size() {
          return size();
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
        class={getClassName}
        style={local.UNSAFE_style}
        data-size={radioDataSize(local.size)}
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
  const providerProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(providerProps, [
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
  ]);
  const context = useContext(RadioStyleContext);
  let circleElement: HTMLDivElement | undefined;

  const getClassName = (renderProps: RadioRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      wrapper(
        {
          ...renderProps,
          size: context.size,
          isEmphasized: context.isEmphasized,
          isInForm: false,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessRadio {...headlessProps} class={getClassName} style={local.UNSAFE_style}>
      {(renderProps) => {
        const resolvedChildren = resolveChildren(() =>
          typeof local.children === "function" ? local.children(renderProps) : local.children,
        );
        const radioCircle = (
          <div
            ref={circleElement}
            class={circle({
              ...renderProps,
              size: context.size,
              isEmphasized: context.isEmphasized,
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
