import {
  children as resolveChildren,
  type JSX,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonRenderProps,
  DialogTriggerContext,
  PopoverTriggerContext,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import type { ButtonFillStyle, ButtonProps, ButtonSize, ButtonVariant } from "./types";
import { fontRelative, style } from "../s2-style";
import { s2IntlStrings } from "../intl";
import { useProviderProps } from "../provider";
import { pressScale } from "../pressScale";
import {
  s2Button,
  s2ButtonGradient,
  s2ButtonPendingIndicator,
  s2ButtonText,
  type S2ButtonRenderState,
} from "./s2-button-styles";
import { createPendingState } from "./pending-state";
import { S2PendingProgressCircle } from "./S2PendingProgressCircle";
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
import { useFormProps } from "../form";
import { useButtonContext } from "./context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";

export function Button(props: ButtonProps): JSX.Element {
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useButtonContext(), props.slot);
  const defaultProps: Partial<ButtonProps> = {
    variant: "primary",
    size: "M",
    fillStyle: "fill",
  };

  const merged = useFormProps(mergeProps(defaultProps, providerProps, contextProps ?? {}, props));

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
    "isPending",
    "onPress",
    "onPressChange",
    "onHoverChange",
  ]);

  const { isProgressVisible } = createPendingState(() => local.isPending);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPressed, setIsPressed] = createSignal(false);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  let buttonElement: HTMLButtonElement | undefined;
  const assignButtonRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLButtonElement> } | null)?.ref,
    props.ref,
  );

  const variant = (): ButtonVariant => local.variant ?? "primary";
  const fillStyle = (): ButtonFillStyle => local.fillStyle ?? "fill";
  const size = (): ButtonSize => local.size ?? "M";
  const isStaticColor = () => !!local.staticColor;
  const isOverlayTriggerOpen = () =>
    !!buttonElement &&
    ((dialogTriggerContext?.triggerRef() === buttonElement &&
      dialogTriggerContext.state.isOpen()) ||
      (popoverTriggerContext?.triggerRef() === buttonElement &&
        popoverTriggerContext.state.isOpen()));
  const pendingLabel = () => stringFormatter().format("button.pending");
  const isDisabled = () => {
    const disabled = headlessProps.isDisabled;
    return typeof disabled === "function" ? disabled() : !!disabled;
  };

  const getS2State = (renderProps: ButtonRenderProps): S2ButtonRenderState => ({
    isHovered: renderProps.isHovered || isOverlayTriggerOpen(),
    isPressed: renderProps.isPressed,
    isFocused: renderProps.isFocused,
    isFocusVisible: renderProps.isFocusVisible,
    isDisabled: renderProps.isDisabled || isProgressVisible(),
    isPending: local.isPending,
  });

  const getClassName = (renderProps: ButtonRenderProps): string =>
    [
      local.UNSAFE_className,
      s2Button(
        {
          ...getS2State(renderProps),
          variant: variant(),
          fillStyle: fillStyle(),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: isStaticColor(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getGradientState = (): S2ButtonRenderState => ({
    isHovered: isHovered() || isOverlayTriggerOpen(),
    isPressed: isPressed(),
    isDisabled: isDisabled() || isProgressVisible(),
    isPending: local.isPending,
  });

  const getPressScaleStyle = (renderProps: ButtonRenderProps): JSX.CSSProperties => {
    return pressScale(() => buttonElement, mergedUnsafeStyle())(renderProps);
  };

  function ButtonContent() {
    const iconContextValue = {
      slot: "icon",
      render: centerBaseline({
        slot: "icon",
        styles: () =>
          style({
            order: 0,
            visibility: {
              isProgressVisible: "hidden",
            },
          })({ isProgressVisible: isProgressVisible() }),
      }),
      styles: () =>
        style({
          size: fontRelative(20),
          marginStart: "--iconMargin",
          flexShrink: 0,
        }),
    };
    const textContextValue = {
      styles: () => s2ButtonText({ isProgressVisible: isProgressVisible() }),
      "data-rsp-slot": "text",
    };

    function ResolvedContent() {
      const resolvedChildren = resolveChildren(() => local.children);
      const content = () => resolvedChildren();

      return typeof content() === "string" ? (
        <span
          class={`${s2ButtonText({ isProgressVisible: isProgressVisible() })} ${style({ order: 1 })}`}
          data-rsp-slot="text"
        >
          {content()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <>
        {variant() === "genai" || variant() === "premium" ? (
          <span
            class={s2ButtonGradient({
              ...getGradientState(),
              variant: variant() as Extract<ButtonVariant, "premium" | "genai">,
            })}
          />
        ) : null}
        <SkeletonContext.Provider value={null}>
          <TextContext.Provider value={textContextValue}>
            <IconContext.Provider value={iconContextValue}>
              <ResolvedContent />
              {local.isPending ? (
                <div
                  class={s2ButtonPendingIndicator({
                    isPending: local.isPending,
                    isProgressVisible: isProgressVisible(),
                  })}
                >
                  <S2PendingProgressCircle
                    aria-label={pendingLabel()}
                    size={size()}
                    staticColor={local.staticColor}
                  />
                </div>
              ) : null}
            </IconContext.Provider>
          </TextContext.Provider>
        </SkeletonContext.Provider>
      </>
    );
  }

  return (
    <HeadlessButton
      {...headlessProps}
      isPending={local.isPending}
      isPendingFocusable
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
        assignButtonRefs(element);
      }}
      onHoverChange={(hovered) => {
        setIsHovered(hovered);
        local.onHoverChange?.(hovered);
      }}
      onPressChange={(pressed) => {
        setIsPressed(pressed);
        local.onPressChange?.(pressed);
      }}
      onPress={(event) => {
        if (!local.isPending) {
          local.onPress?.(event);
        }
      }}
      class={getClassName}
      style={getPressScaleStyle}
      data-variant={variant()}
      data-style={fillStyle()}
      data-size={size()}
      data-static-color={local.staticColor || undefined}
    >
      <ButtonContent />
    </HeadlessButton>
  );
}
