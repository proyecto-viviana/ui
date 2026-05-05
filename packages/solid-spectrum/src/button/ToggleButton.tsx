import { children as resolveChildren, type JSX, mergeProps, splitProps } from "solid-js";
import {
  ToggleButton as HeadlessToggleButton,
  type ToggleButtonProps as HeadlessToggleButtonProps,
  type ToggleButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { useProviderProps } from "../provider";
import type { StaticColor } from "./types";
import type { StyleString } from "../s2-style";
import { fontRelative, style } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { centerBaseline } from "../icon/center-baseline";
import {
  s2ActionButton,
  s2ActionButtonStaticColor,
  s2ToggleButtonText,
  type S2ActionButtonRenderState,
} from "./s2-action-button-styles";
import {
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  useActionButtonGroupContext,
} from "./group-context";
import { IconContext } from "../icon/spectrum-icon";

export type ToggleButtonSize = ActionButtonSize;

export interface ToggleButtonProps extends Omit<
  HeadlessToggleButtonProps,
  "class" | "style" | "children"
> {
  /** The content to display in the button. */
  children?: JSX.Element;
  /** The size of the button. @default 'M' */
  size?: ToggleButtonSize;
  /** The static color style to apply. Useful when the ToggleButton appears over a color background. */
  staticColor?: StaticColor;
  /** Whether the button should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the selected ToggleButton should be emphasized. */
  isEmphasized?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

/**
 * ToggleButtons allow users to toggle a selection on or off.
 */
export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const groupContext = useActionButtonGroupContext();
  const defaultProps: Partial<ToggleButtonProps> = {
    size: "M",
  };
  const groupProps: Partial<ToggleButtonProps> & {
    density?: ActionButtonDensity;
    orientation?: ActionButtonOrientation;
    isJustified?: boolean;
  } = {
    get size() {
      return groupContext?.size;
    },
    get staticColor() {
      return groupContext?.staticColor;
    },
    get isQuiet() {
      return groupContext?.isQuiet;
    },
    get isEmphasized() {
      return groupContext?.isEmphasized;
    },
    get isDisabled() {
      return groupContext?.isDisabled;
    },
    get density() {
      return groupContext?.density;
    },
    get orientation() {
      return groupContext?.orientation;
    },
    get isJustified() {
      return groupContext?.isJustified;
    },
  };

  const mergedProps = mergeProps(defaultProps, providerProps, groupProps, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "staticColor",
    "isQuiet",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "density",
    "orientation",
    "isJustified",
  ]);
  let buttonElement: HTMLButtonElement | undefined;

  const size = (): ToggleButtonSize => local.size ?? "M";
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
  const getS2State = (renderProps: ToggleButtonRenderProps): S2ActionButtonRenderState => ({
    isHovered: renderProps.isHovered,
    isPressed: renderProps.isPressed,
    isFocused: renderProps.isFocused,
    isFocusVisible: renderProps.isFocusVisible,
    isDisabled: renderProps.isDisabled,
    isSelected: renderProps.isSelected,
  });

  const getClassName = (renderProps: ToggleButtonRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        s2ActionButton({
          ...getS2State(renderProps),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
          isQuiet: local.isQuiet,
          isEmphasized: local.isEmphasized,
          density: density(),
          orientation: orientation(),
          isJustified: local.isJustified,
          isInGroup: !!groupContext,
        }),
        local.staticColor
          ? s2ActionButtonStaticColor({
              ...getS2State(renderProps),
              size: size(),
              staticColor: local.staticColor,
              isStaticColor: true,
              isQuiet: local.isQuiet,
              isEmphasized: local.isEmphasized,
              density: density(),
              orientation: orientation(),
              isJustified: local.isJustified,
              isInGroup: !!groupContext,
            })
          : undefined,
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getPressScaleStyle = (renderProps: ToggleButtonRenderProps): JSX.CSSProperties => {
    const style = { ...(local.UNSAFE_style ?? {}) } as JSX.CSSProperties;
    const styleRecord = style as Record<string, string | number | undefined>;
    const willChange = styleRecord["will-change"] ?? "";
    styleRecord["will-change"] = `${willChange} transform`.trim();

    if (renderProps.isPressed && buttonElement) {
      const { width, height } = buttonElement.getBoundingClientRect();
      const perspective = Math.max(height, width / 3, 24);
      const transform = style.transform ?? "";
      style.transform = `${transform} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
    }

    return style;
  };

  function ToggleButtonContent() {
    const iconContextValue = {
      slot: "icon",
      render: centerBaseline({ slot: "icon", styles: style({ order: 0 }) }),
      styles: style({
        size: fontRelative(20),
        marginStart: "--iconMargin",
        flexShrink: 0,
      }),
    };

    function ResolvedContent() {
      const resolvedChildren = resolveChildren(() => local.children);
      const content = () => resolvedChildren();

      return typeof content() === "string" ? (
        <span class={`${s2ToggleButtonText} ${style({ order: 1 })}`} data-rsp-slot="text">
          {content()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <IconContext.Provider value={iconContextValue}>
        <ResolvedContent />
      </IconContext.Provider>
    );
  }

  return (
    <HeadlessToggleButton
      {...headlessProps}
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
      }}
      class={getClassName}
      style={getPressScaleStyle}
      data-size={size()}
      data-static-color={local.staticColor || undefined}
      data-quiet={local.isQuiet ? "true" : undefined}
      data-emphasized={local.isEmphasized ? "true" : undefined}
    >
      <ToggleButtonContent />
    </HeadlessToggleButton>
  );
}
