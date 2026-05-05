import {
  children as resolveChildren,
  type JSX,
  createSignal,
  mergeProps,
  splitProps,
} from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { ButtonFillStyle, ButtonProps, ButtonSize, ButtonVariant } from "./types";
import { fontRelative, style } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { useProviderProps } from "../provider";
import {
  s2Button,
  s2ButtonGradient,
  s2ButtonPendingIndicator,
  s2ButtonText,
  type S2ButtonRenderState,
} from "./s2-button-styles";
import { s2ProgressCircleIndeterminateAnimation } from "./s2-progress-circle-animation";
import { useButtonGroupContext } from "./group-context";
import { createPendingState } from "./pending-state";
import { IconContext } from "../icon/spectrum-icon";
import { centerBaseline } from "../icon/center-baseline";

export function Button(props: ButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const groupContext = useButtonGroupContext();
  const defaultProps: Partial<ButtonProps> = {
    variant: "primary",
    size: "M",
    fillStyle: "fill",
  };
  const groupProps: Partial<ButtonProps> = {
    get size() {
      return groupContext?.size;
    },
    get isDisabled() {
      return groupContext?.isDisabled;
    },
  };

  const merged = mergeProps(defaultProps, providerProps, groupProps, props);

  const [local, headlessProps] = splitProps(merged, [
    "variant",
    "fillStyle",
    "size",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "isPending",
    "onPress",
    "onPressChange",
    "onHoverChange",
  ]);

  const { isProgressVisible } = createPendingState(() => local.isPending);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isPressed, setIsPressed] = createSignal(false);
  const mergedStyles = () => mergeStyles(groupContext?.styles, local.styles);
  let buttonElement: HTMLButtonElement | undefined;

  const variant = (): ButtonVariant => local.variant ?? "primary";
  const fillStyle = (): ButtonFillStyle => local.fillStyle ?? "fill";
  const size = (): ButtonSize => local.size ?? "M";
  const isStaticColor = () => !!local.staticColor;
  const pendingCircleClass = () =>
    ({
      S: "  Zk13 Fl13 fa13",
      M: "  Zl13 Fm13 fa13",
      L: "  Zm13 Fn13 fa13",
      XL: "  Zo13 Fp13 fa13",
    })[size()];
  const isDisabled = () => {
    const disabled = headlessProps.isDisabled;
    return typeof disabled === "function" ? disabled() : !!disabled;
  };

  const getS2State = (renderProps: ButtonRenderProps): S2ButtonRenderState => ({
    isHovered: renderProps.isHovered,
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
    isHovered: isHovered(),
    isPressed: isPressed(),
    isDisabled: isDisabled() || isProgressVisible(),
    isPending: local.isPending,
  });

  const getPressScaleStyle = (renderProps: ButtonRenderProps): JSX.CSSProperties => {
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
        <IconContext.Provider value={iconContextValue}>
          <ResolvedContent />
          {local.isPending ? (
            <div
              class={s2ButtonPendingIndicator({
                isPending: local.isPending,
                isProgressVisible: isProgressVisible(),
              })}
            >
              <div
                class={pendingCircleClass()}
                role="progressbar"
                data-rac=""
                aria-label="pending"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <svg fill="none" width="100%" height="100%">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="calc(50% - 0.0625rem)"
                    class="  VRWHrbc13 VlUG8Hlc13 _V7m7Gv13"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="calc(50% - 0.0625rem)"
                    class="  Vf13 Vla13 _V7m7Gv13 _Vlai5a013"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="calc(50% - 0.0625rem)"
                    class="  Vh13 VlUG8Hlc13 _Sa13 _0d13 _V7m7Gv13"
                    style={{ animation: s2ProgressCircleIndeterminateAnimation }}
                    pathLength="100"
                    stroke-dasharray="100 200"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          ) : null}
        </IconContext.Provider>
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
