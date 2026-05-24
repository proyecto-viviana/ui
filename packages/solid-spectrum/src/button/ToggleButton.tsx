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
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
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
  useToggleButtonGroupContext,
} from "./group-context";
import { IconContext } from "../icon/spectrum-icon";
import { pressScale } from "../pressScale";
import { useToggleButtonContext } from "./context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";

export type ToggleButtonSize = ActionButtonSize;

type StyledToggleButtonBaseProps = Omit<
  HeadlessToggleButtonProps,
  | "class"
  | "style"
  | "children"
  | "onClick"
  | "elementType"
  | "href"
  | "target"
  | "rel"
  | "allowFocusWhenDisabled"
  | "form"
  | "formAction"
  | "formEncType"
  | "formMethod"
  | "formNoValidate"
  | "formTarget"
  | "name"
  | "type"
  | "value"
>;

export interface ToggleButtonProps extends StyledToggleButtonBaseProps {
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
}

/**
 * ToggleButtons allow users to toggle a selection on or off.
 */
export function ToggleButton(props: ToggleButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useToggleButtonContext(), props.slot);
  const groupContext = getSlottedContextProps(useToggleButtonGroupContext(), undefined);
  const defaultProps: Partial<ToggleButtonProps> = {
    size: "M",
  };
  const standaloneProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const groupProps: Partial<ToggleButtonProps> & {
    density?: ActionButtonDensity;
    orientation?: ActionButtonOrientation;
    isJustified?: boolean;
  } = {
    get size() {
      return groupContext?.size ?? standaloneProps.size;
    },
    get staticColor() {
      return groupContext?.staticColor ?? standaloneProps.staticColor;
    },
    get isQuiet() {
      return groupContext?.isQuiet ?? standaloneProps.isQuiet;
    },
    get isEmphasized() {
      return groupContext?.isEmphasized ?? standaloneProps.isEmphasized;
    },
    get isDisabled() {
      return groupContext?.isDisabled ?? standaloneProps.isDisabled;
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

  const mergedProps = mergeProps(standaloneProps, groupProps);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "staticColor",
    "isQuiet",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "ref",
    "density",
    "orientation",
    "isJustified",
  ]);
  let buttonElement: HTMLButtonElement | undefined;
  const assignButtonRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLButtonElement> } | null)?.ref,
    props.ref,
  );

  const size = (): ToggleButtonSize => local.size ?? "M";
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
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
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getPressScaleStyle = (renderProps: ToggleButtonRenderProps): JSX.CSSProperties =>
    pressScale(() => buttonElement, mergedUnsafeStyle())(renderProps);

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
    const textContextValue = {
      styles: s2ToggleButtonText,
      "data-rsp-slot": "text",
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
      <SkeletonContext.Provider value={null}>
        <TextContext.Provider value={textContextValue}>
          <IconContext.Provider value={iconContextValue}>
            <ResolvedContent />
          </IconContext.Provider>
        </TextContext.Provider>
      </SkeletonContext.Provider>
    );
  }

  return (
    <HeadlessToggleButton
      {...headlessProps}
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
        assignButtonRefs(element);
      }}
      class={getClassName}
      style={getPressScaleStyle}
    >
      <ToggleButtonContent />
    </HeadlessToggleButton>
  );
}
