// @ts-nocheck
import {
  children as resolveChildren,
  createContext,
  createUniqueId,
  type JSX,
  splitProps,
  mergeProps,
  Show,
  useContext,
} from "solid-js";
import {
  Checkbox as HeadlessCheckbox,
  CheckboxGroup as HeadlessCheckboxGroup,
  type CheckboxProps as HeadlessCheckboxProps,
  type CheckboxGroupProps as HeadlessCheckboxGroupProps,
  type CheckboxRenderProps,
  type CheckboxGroupRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import { baseColor, focusRing, space, style } from "../s2-style";
import {
  controlBorderRadius,
  controlFont,
  controlSize,
  field,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import DashIcon from "../icon/ui-icons/Dash";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type CheckboxSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2CheckboxSize = "S" | "M" | "L" | "XL";
export type CheckboxGroupOrientation = "horizontal" | "vertical";

interface CheckboxGroupStyleContextValue {
  size?: CheckboxSize;
  isEmphasized?: boolean;
}

const CheckboxGroupStyleContext = createContext<CheckboxGroupStyleContextValue>({});

export interface CheckboxProps extends Omit<
  HeadlessCheckboxProps,
  "class" | "children" | "render" | "style" | "slot" | "ref" | "inputRef"
> {
  /** The size of the checkbox. */
  size?: CheckboxSize;
  /** Whether the checkbox should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** Label text for the checkbox. */
  children?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the underlying label element. */
  ref?: RefLike<HTMLLabelElement>;
  /** Ref for the underlying input element. */
  inputRef?: RefLike<HTMLInputElement>;
}

export interface CheckboxGroupProps extends Omit<
  HeadlessCheckboxGroupProps,
  "class" | "children" | "style"
> {
  /** The size of the Checkboxes in the CheckboxGroup. */
  size?: CheckboxSize;
  /** The axis the checkboxes should align with. */
  orientation?: CheckboxGroupOrientation;
  /** Whether the Checkboxes should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Children checkboxes. */
  children?: JSX.Element;
  /** Label for the group. */
  label?: JSX.Element;
  /** Description for the group. */
  description?: JSX.Element;
  /** Error message when invalid. */
  errorMessage?: JSX.Element;
}

interface CheckboxStyleProps {
  size?: S2CheckboxSize;
  isEmphasized?: boolean;
  orientation?: CheckboxGroupOrientation;
  labelPosition?: "top" | "side";
  labelAlign?: "start" | "end";
  isInForm?: boolean;
}

type CheckboxStyleState = CheckboxRenderProps & CheckboxStyleProps;
type CheckboxGroupStyleState = CheckboxGroupRenderProps & CheckboxStyleProps;

export const CheckboxContext = createContext<SpectrumContextValue<CheckboxProps>>(null);

const checkboxGroupRoot = style<CheckboxGroupStyleState>(
  {
    ...field(),
    "--field-gap": {
      type: "rowGap",
      value: "calc(var(--field-height) - 1lh)",
    },
  },
  getAllowedOverrides(),
);

const checkboxGroupLabelWrapper = style<CheckboxGroupStyleState>({
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

const checkboxGroupLabel = style<CheckboxGroupStyleState>({
  ...fieldLabel(),
});

const checkboxGroupItems = style<CheckboxGroupStyleState>({
  gridArea: "input",
  display: "flex",
  flexDirection: {
    orientation: {
      vertical: "column",
      horizontal: "row",
    },
  },
  lineHeight: "ui",
  rowGap: "--field-gap",
  columnGap: 16,
  flexWrap: "wrap",
});

const checkboxGroupHelpText = style<CheckboxGroupStyleState>({
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

const wrapper = style<CheckboxStyleState & { isInForm?: boolean }>(
  {
    display: "flex",
    position: "relative",
    columnGap: "text-to-control",
    alignItems: "baseline",
    width: "fit",
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

const checkboxBox = style<CheckboxStyleState>({
  ...focusRing(),
  ...controlBorderRadius("sm"),
  size: controlSize("sm"),
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: space(2),
  boxSizing: "border-box",
  borderStyle: "solid",
  transition: "default",
  forcedColorAdjust: "none",
  backgroundColor: {
    default: "gray-25",
    forcedColors: "Background",
    isSelected: {
      default: baseColor("neutral"),
      isEmphasized: baseColor("accent-900"),
      forcedColors: "Highlight",
      isInvalid: {
        default: baseColor("negative-900"),
        forcedColors: "Mark",
      },
      isDisabled: {
        default: "gray-400",
        forcedColors: "GrayText",
      },
    },
  },
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "transparent",
  },
});

const checkboxIcon = style({
  pointerEvents: "none",
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "gray-25",
      forcedColors: "HighlightText",
    },
  },
});

const iconSize = {
  S: "XS",
  M: "S",
  L: "M",
  XL: "L",
} as const;

const checkmarkIconPixelSize = {
  S: 10,
  M: 10,
  L: 10,
  XL: 12,
} as const;

const dashIconPixelSize = {
  S: 8,
  M: 8,
  L: 10,
  XL: 12,
} as const;

function normalizeCheckboxSize(size: CheckboxSize | undefined): S2CheckboxSize {
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

function checkboxPressScaleStyle(
  element: HTMLDivElement | undefined,
  renderProps: CheckboxRenderProps,
): JSX.CSSProperties {
  const pressStyle = { "will-change": "transform" } as JSX.CSSProperties;

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    pressStyle.transform = `perspective(${Math.max(height, width / 3, 24)}px) translate3d(0, 0, -2px)`;
  }

  return pressStyle;
}

function checkboxIconSizeStyle(size: number): JSX.CSSProperties {
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
}

/**
 * A checkbox allows users to select one or more items from a set.
 *
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const groupStyleContext = useContext(CheckboxGroupStyleContext);
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(CheckboxContext), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);

  const [local, headlessProps] = splitProps(merged, [
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

  const size = () => normalizeCheckboxSize(local.size ?? groupStyleContext.size);
  const isEmphasized = () => local.isEmphasized ?? groupStyleContext.isEmphasized;
  let boxElement: HTMLDivElement | undefined;
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

  const getClassName = (renderProps: CheckboxRenderProps): string => {
    return [
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
  };

  return (
    <HeadlessCheckbox
      {...headlessProps}
      isSelected={headlessProps.isSelected}
      defaultSelected={headlessProps.defaultSelected}
      onChange={headlessProps.onChange}
      isDisabled={headlessProps.isDisabled}
      isReadOnly={headlessProps.isReadOnly}
      isInvalid={headlessProps.isInvalid}
      isIndeterminate={headlessProps.isIndeterminate}
      ref={(element) => assignRootRef(element)}
      inputRef={(element) => assignInputRef(element)}
      slot={local.slot ?? undefined}
      class={getClassName}
      style={mergedUnsafeStyle()}
    >
      {(renderProps: CheckboxRenderProps) => {
        const checkbox = (
          <div
            ref={boxElement}
            class={checkboxBox({
              ...renderProps,
              isSelected: renderProps.isSelected || renderProps.isIndeterminate,
              size: size(),
              isEmphasized: isEmphasized(),
            })}
            style={checkboxPressScaleStyle(boxElement, renderProps)}
          >
            <Show when={renderProps.isIndeterminate}>
              <DashIcon
                size={iconSize[size()]}
                class={checkboxIcon}
                style={checkboxIconSizeStyle(dashIconPixelSize[size()])}
              />
            </Show>
            <Show when={renderProps.isSelected && !renderProps.isIndeterminate}>
              <CheckmarkIcon
                size={iconSize[size()]}
                class={checkboxIcon}
                style={checkboxIconSizeStyle(checkmarkIconPixelSize[size()])}
              />
            </Show>
          </div>
        );

        const resolvedChildren = resolveChildren(() => local.children);
        const content = () => resolvedChildren();

        if (!content()) {
          return checkbox;
        }

        return (
          <>
            <CenterBaseline>{checkbox}</CenterBaseline>
            {content()}
          </>
        );
      }}
    </HeadlessCheckbox>
  );
}

/**
 * A checkbox group allows users to select multiple items from a list.
 *
 */
export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const defaultProps: Partial<CheckboxGroupProps> = {
    orientation: "vertical",
  };
  const mergedProps = mergeProps(defaultProps, providerProps);
  const [local, headlessProps] = splitProps(mergedProps, [
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
  const size = () => normalizeCheckboxSize(local.size);
  const idBase = createUniqueId();
  const labelId = `${idBase}-label`;
  const descriptionId = `${idBase}-description`;
  const errorId = `${idBase}-error`;

  const ariaDescribedBy = () => {
    const ids = [
      headlessProps["aria-describedby"],
      local.description ? descriptionId : undefined,
      local.errorMessage && headlessProps.isInvalid ? errorId : undefined,
    ].filter(Boolean);
    return ids.length ? ids.join(" ") : undefined;
  };

  const getClassName = (renderProps: CheckboxGroupRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      checkboxGroupRoot(
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

  const renderChildren = (renderProps: CheckboxGroupRenderProps) => (
    <>
      <Show when={local.label}>
        <div
          class={checkboxGroupLabelWrapper({
            ...renderProps,
            size: size(),
            labelPosition: "top",
          })}
        >
          <span id={labelId} class={checkboxGroupLabel({ ...renderProps, size: size() })}>
            {local.label}
          </span>
        </div>
      </Show>
      <div
        class={checkboxGroupItems({
          ...renderProps,
          size: size(),
          orientation: local.orientation,
        })}
      >
        {local.children}
      </div>
      <Show when={local.description && !renderProps.isInvalid}>
        <div id={descriptionId} class={checkboxGroupHelpText({ ...renderProps, size: size() })}>
          {local.description}
        </div>
      </Show>
      <Show when={local.errorMessage}>
        <div
          id={errorId}
          role="alert"
          class={checkboxGroupHelpText({ ...renderProps, size: size(), isInvalid: true })}
          style={{ display: renderProps.isInvalid ? undefined : "none" }}
        >
          {local.errorMessage}
        </div>
      </Show>
    </>
  );

  return (
    <CheckboxGroupStyleContext.Provider
      value={{
        get size() {
          return local.size;
        },
        get isEmphasized() {
          return local.isEmphasized;
        },
      }}
    >
      <HeadlessCheckboxGroup
        {...headlessProps}
        value={headlessProps.value}
        defaultValue={headlessProps.defaultValue}
        onChange={headlessProps.onChange}
        isDisabled={headlessProps.isDisabled}
        isReadOnly={headlessProps.isReadOnly}
        isRequired={headlessProps.isRequired}
        isInvalid={headlessProps.isInvalid}
        aria-labelledby={headlessProps["aria-labelledby"] ?? (local.label ? labelId : undefined)}
        aria-describedby={ariaDescribedBy()}
        class={getClassName}
        style={local.UNSAFE_style}
        data-size={local.size ?? "md"}
      >
        {renderChildren}
      </HeadlessCheckboxGroup>
    </CheckboxGroupStyleContext.Provider>
  );
}
