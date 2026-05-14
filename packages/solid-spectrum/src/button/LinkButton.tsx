import {
  children as resolveChildren,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
  type JSX,
} from "solid-js";
import {
  DialogTriggerContext,
  Link as HeadlessLink,
  PopoverTriggerContext,
  type LinkProps as HeadlessLinkProps,
  type LinkRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { fontRelative, style, type StyleString } from "../s2-style";
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
import { useProviderProps } from "../provider";
import { pressScale } from "../pressScale";
import { useLinkButtonContext } from "./context";
import { s2Button, s2ButtonGradient, s2ButtonText } from "./s2-button-styles";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";
import type { ButtonFillStyle, ButtonSize, ButtonVariant, StaticColor } from "./types";

export interface LinkButtonProps extends Omit<HeadlessLinkProps, "class" | "style" | "children"> {
  /** The content to display in the LinkButton. */
  children?: JSX.Element;
  /** The visual style of the LinkButton. */
  variant?: ButtonVariant;
  /** The background style of the LinkButton. */
  fillStyle?: ButtonFillStyle;
  /** The size of the LinkButton. */
  size?: ButtonSize;
  /** The static color style to apply. Useful when the LinkButton appears over a color background. */
  staticColor?: StaticColor;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

/**
 * A LinkButton navigates like a link while using the S2 Button visual treatment.
 */
export function LinkButton(props: LinkButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useLinkButtonContext(), props.slot);
  const defaultProps: Partial<LinkButtonProps> = {
    variant: "primary",
    size: "M",
    fillStyle: "fill",
  };
  const merged = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "variant",
    "fillStyle",
    "size",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "ref",
  ]);

  const variant = (): ButtonVariant => local.variant ?? "primary";
  const fillStyle = (): ButtonFillStyle => local.fillStyle ?? "fill";
  const size = (): ButtonSize => local.size ?? "M";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPressed, setIsPressed] = createSignal(false);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);
  let linkElement: HTMLAnchorElement | undefined;
  const assignLinkRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
    props.ref,
  );
  const isOverlayTriggerOpen = () =>
    !!linkElement &&
    ((dialogTriggerContext?.triggerRef() === linkElement && dialogTriggerContext.state.isOpen()) ||
      (popoverTriggerContext?.triggerRef() === linkElement &&
        popoverTriggerContext.state.isOpen()));

  const gradientClass = () =>
    s2ButtonGradient({
      isHovered: isHovered() || isOverlayTriggerOpen(),
      isPressed: isPressed(),
      isDisabled: !!headlessProps.isDisabled,
      isPending: false,
      variant: variant() as Extract<ButtonVariant, "premium" | "genai">,
    });

  const getClassName = (renderProps: LinkRenderProps): string =>
    [
      local.UNSAFE_className,
      s2Button(
        {
          isHovered: renderProps.isHovered || isOverlayTriggerOpen(),
          isPressed: renderProps.isPressed,
          isFocused: renderProps.isFocused,
          isFocusVisible: renderProps.isFocusVisible,
          isDisabled: renderProps.isDisabled,
          isPending: false,
          variant: variant(),
          fillStyle: fillStyle(),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getStyle = (renderProps: LinkRenderProps): JSX.CSSProperties =>
    pressScale(() => linkElement, mergedUnsafeStyle())(renderProps);

  function LinkButtonContent() {
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
      styles: () => s2ButtonText({ isProgressVisible: false }),
      "data-rsp-slot": "text",
    };

    function ResolvedContent() {
      const resolvedChildren = resolveChildren(() => local.children);
      const content = () => resolvedChildren();

      return typeof content() === "string" ? (
        <span class={s2ButtonText({ isProgressVisible: false })} data-rsp-slot="text">
          {content()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <>
        {variant() === "genai" || variant() === "premium" ? <span class={gradientClass()} /> : null}
        <SkeletonContext.Provider value={null}>
          <TextContext.Provider value={textContextValue}>
            <IconContext.Provider value={iconContextValue}>
              <ResolvedContent />
            </IconContext.Provider>
          </TextContext.Provider>
        </SkeletonContext.Provider>
      </>
    );
  }

  return (
    <HeadlessLink
      {...headlessProps}
      class={getClassName}
      style={getStyle}
      ref={(element: HTMLElement) => {
        linkElement = element as HTMLAnchorElement;
        assignLinkRefs(element);
      }}
      onHoverChange={(hovered) => {
        setIsHovered(hovered);
        headlessProps.onHoverChange?.(hovered);
      }}
      onPressStart={(event) => {
        setIsPressed(true);
        headlessProps.onPressStart?.(event);
      }}
      onPressEnd={(event) => {
        setIsPressed(false);
        headlessProps.onPressEnd?.(event);
      }}
      data-variant={variant()}
      data-style={fillStyle()}
      data-size={size()}
      data-static-color={local.staticColor || undefined}
    >
      <LinkButtonContent />
    </HeadlessLink>
  );
}
