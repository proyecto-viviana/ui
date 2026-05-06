// @ts-nocheck
import {
  children as resolveChildren,
  type JSX,
  splitProps,
  mergeProps as solidMergeProps,
  Show,
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
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import CheckmarkIcon from "../icon/ui-icons/Checkmark";
import DashIcon from "../icon/ui-icons/Dash";
import { useProviderProps } from "../provider";

export type CheckboxSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2CheckboxSize = "S" | "M" | "L" | "XL";

export interface CheckboxProps extends Omit<
  HeadlessCheckboxProps,
  "class" | "children" | "render" | "style"
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
}

export interface CheckboxGroupProps extends Omit<
  HeadlessCheckboxGroupProps,
  "class" | "children" | "style"
> {
  /** Additional CSS class name. */
  class?: string;
  /** Children checkboxes. */
  children?: JSX.Element;
  /** Label for the group. */
  label?: string;
  /** Description for the group. */
  description?: string;
  /** Error message when invalid. */
  errorMessage?: string;
}

interface CheckboxStyleProps {
  size?: S2CheckboxSize;
  isEmphasized?: boolean;
}

type CheckboxStyleState = CheckboxRenderProps & CheckboxStyleProps;

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
  const providerProps = useProviderProps(props);
  const defaultProps: Partial<CheckboxProps> = {
    size: "M",
  };

  const merged = solidMergeProps(defaultProps, providerProps);

  const [local, headlessProps] = splitProps(merged, [
    "size",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
  ]);

  const size = () => normalizeCheckboxSize(local.size);
  let boxElement: HTMLDivElement | undefined;

  const getClassName = (renderProps: CheckboxRenderProps): string => {
    return [
      local.UNSAFE_className,
      local.class,
      wrapper(
        {
          ...renderProps,
          size: size(),
          isEmphasized: local.isEmphasized,
          isInForm: false,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <HeadlessCheckbox {...headlessProps} class={getClassName} style={local.UNSAFE_style}>
      {(renderProps: CheckboxRenderProps) => {
        const checkbox = (
          <div
            ref={boxElement}
            class={checkboxBox({
              ...renderProps,
              isSelected: renderProps.isSelected || renderProps.isIndeterminate,
              size: size(),
              isEmphasized: local.isEmphasized,
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
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "class",
    "label",
    "description",
    "errorMessage",
  ]);

  const getClassName = (renderProps: CheckboxGroupRenderProps): string => {
    const base = "flex flex-col gap-2";
    const disabledClass = renderProps.isDisabled ? "opacity-50" : "";
    const custom = local.class || "";
    return [base, disabledClass, custom].filter(Boolean).join(" ");
  };

  const renderChildren = (renderProps: CheckboxGroupRenderProps) => (
    <>
      <Show when={local.label}>
        <span class="text-sm font-medium text-primary-200">{local.label}</span>
      </Show>
      <div class="flex flex-col gap-2">{props.children}</div>
      <Show when={local.description && !renderProps.isInvalid}>
        <span class="text-sm text-primary-400">{local.description}</span>
      </Show>
      <Show when={local.errorMessage && renderProps.isInvalid}>
        <span class="text-sm text-danger-400">{local.errorMessage}</span>
      </Show>
    </>
  );
  return (
    <HeadlessCheckboxGroup {...headlessProps} class={getClassName} children={renderChildren} />
  );
}
