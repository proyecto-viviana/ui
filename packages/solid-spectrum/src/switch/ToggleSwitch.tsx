// @ts-nocheck
import {
  children as resolveChildren,
  mergeProps as solidMergeProps,
  splitProps,
  type JSX,
} from "solid-js";
import { type Direction, useLocale } from "@proyecto-viviana/solidaria";
import {
  ToggleSwitch as HeadlessToggleSwitch,
  type ToggleSwitchProps as HeadlessToggleSwitchProps,
  type ToggleSwitchRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { baseColor, focusRing, fontRelative, style, type StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { CenterBaseline } from "../icon/center-baseline";
import { controlFont, controlSize, getAllowedOverrides } from "../s2-internal/style-utils";
import { useProviderProps } from "../provider";

export type SwitchSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2SwitchSize = "S" | "M" | "L" | "XL";

export interface ToggleSwitchProps extends Omit<
  HeadlessToggleSwitchProps,
  "class" | "style" | "children"
> {
  /** The size of the Switch. */
  size?: SwitchSize;
  /** Whether the Switch should be displayed with an emphasized style. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Additional CSS class name. */
  class?: string;
  /** Label text for the Switch. */
  children?: JSX.Element;
}

interface SwitchStyleProps {
  size?: S2SwitchSize;
  isEmphasized?: boolean;
}

type SwitchStyleState = ToggleSwitchRenderProps & SwitchStyleProps;

const disabledSelectedTrackBackground = "[light-dark(rgb(114, 114, 114), rgb(118, 118, 118))]";

const wrapper = style<SwitchStyleState & { isInForm?: boolean }>(
  {
    display: "flex",
    columnGap: "text-to-control",
    alignItems: "baseline",
    width: "fit",
    font: controlFont(),
    transition: "colors",
    color: {
      default: baseColor("neutral"),
      forcedColors: "ButtonText",
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

const track = style<SwitchStyleState>({
  ...focusRing(),
  borderRadius: "full",
  "--trackWidth": {
    type: "width",
    value: fontRelative(26),
  },
  "--trackHeight": {
    type: "height",
    value: controlSize("sm"),
  },
  width: "--trackWidth",
  height: "--trackHeight",
  boxSizing: "border-box",
  borderWidth: 2,
  borderStyle: "solid",
  transition: "default",
  forcedColorAdjust: "none",
  borderColor: {
    default: baseColor("gray-800"),
    forcedColors: "ButtonBorder",
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "transparent",
  },
  backgroundColor: {
    default: "gray-25",
    isSelected: {
      default: baseColor("neutral"),
      isDisabled: {
        default: disabledSelectedTrackBackground,
        forcedColors: "GrayText",
      },
      isEmphasized: baseColor("accent-900"),
      forcedColors: "Highlight",
    },
  },
});

const disabledSelectedTrack = style({
  backgroundColor: disabledSelectedTrackBackground,
});

const handle = style<SwitchStyleState>({
  height: "full",
  aspectRatio: "square",
  borderRadius: "full",
  backgroundColor: {
    default: baseColor("neutral"),
    isDisabled: {
      default: "gray-400",
      forcedColors: "GrayText",
    },
    isSelected: "gray-25",
  },
  transition: "default",
});

function normalizeSwitchSize(size: SwitchSize | undefined): S2SwitchSize {
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

function switchHandleTransform(isSelected: boolean, direction: Direction): JSX.CSSProperties {
  const placement =
    direction === "ltr"
      ? "translateX(calc(var(--trackWidth) - 100% - 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)"
      : "translateX(calc(100% - var(--trackWidth) + 4px)) perspective(calc(2 * (var(--trackHeight) - 6px))) translateZ(-4px)";

  return {
    transform: isSelected
      ? placement
      : "perspective(calc(var(--trackHeight) - 8px)) translateZ(-4px)",
  };
}

function switchHandlePressStyle(
  element: HTMLDivElement | undefined,
  renderProps: ToggleSwitchRenderProps,
  direction: Direction,
): JSX.CSSProperties {
  const style = {
    ...switchHandleTransform(renderProps.isSelected, direction),
  } as JSX.CSSProperties;
  const styleRecord = style as Record<string, string | number | undefined>;
  const willChange = styleRecord["will-change"] ?? "";
  styleRecord["will-change"] = `${willChange} transform`.trim();

  if (renderProps.isPressed && element) {
    const { width, height } = element.getBoundingClientRect();
    const perspective = Math.max(height, width / 3, 24);
    style.transform =
      `${style.transform ?? ""} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
  }

  return style;
}

/**
 * A switch allows users to turn an individual option on or off.
 * It is usually used to activate or deactivate a specific setting.
 *
 * Named "ToggleSwitch" to avoid conflict with SolidJS's built-in Switch component.
 */
export function ToggleSwitch(props: ToggleSwitchProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const locale = useLocale();
  const defaultProps: Partial<ToggleSwitchProps> = {
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
  const resolvedChildren = resolveChildren(() => local.children);
  const size = () => normalizeSwitchSize(local.size);
  const mergedStyles = () => mergeStyles(local.styles);
  const direction = () => locale().direction;
  let handleElement: HTMLDivElement | undefined;

  const getClassName = (renderProps: ToggleSwitchRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      wrapper(
        {
          ...renderProps,
          isInForm: false,
          size: size(),
          isEmphasized: local.isEmphasized,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const trackClass = (renderProps: ToggleSwitchRenderProps) =>
    mergeStyles(
      track({
        ...renderProps,
        size: size(),
        isEmphasized: local.isEmphasized,
      }),
      renderProps.isSelected && renderProps.isDisabled && !local.isEmphasized
        ? disabledSelectedTrack
        : undefined,
    );

  const handleClass = (renderProps: ToggleSwitchRenderProps) =>
    handle({
      ...renderProps,
      size: size(),
      isEmphasized: local.isEmphasized,
    });

  return (
    <HeadlessToggleSwitch {...headlessProps} class={getClassName} style={local.UNSAFE_style}>
      {(renderProps: ToggleSwitchRenderProps) => (
        <>
          <CenterBaseline>
            <div class={trackClass(renderProps)}>
              <div
                ref={handleElement}
                class={handleClass(renderProps)}
                style={switchHandlePressStyle(handleElement, renderProps, direction())}
              />
            </div>
          </CenterBaseline>
          {resolvedChildren()}
        </>
      )}
    </HeadlessToggleSwitch>
  );
}
