import { children as resolveChildren, type JSX, mergeProps, splitProps } from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
  type ButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { fontRelative, style } from "../s2-style";
import { useProviderProps } from "../provider";
import { centerBaseline } from "../icon/center-baseline";
import type { StaticColor } from "./types";
import type { StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import {
  s2ActionButton,
  s2ActionButtonPendingIndicator,
  s2ActionButtonProgressCircle,
  s2ActionButtonStaticColor,
  s2ActionButtonText,
  type S2ActionButtonRenderState,
} from "./s2-action-button-styles";
import { s2ProgressCircleIndeterminateAnimation } from "./s2-progress-circle-animation";
import { createPendingState } from "./pending-state";
import {
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  useActionButtonGroupContext,
} from "./group-context";
import { IconContext } from "../icon/spectrum-icon";

export type { ActionButtonSize } from "./group-context";

export interface ActionButtonProps extends Omit<
  HeadlessButtonProps,
  "class" | "style" | "children"
> {
  /** The content to display in the ActionButton. */
  children?: JSX.Element;
  /** The size of the button. @default 'M' */
  size?: ActionButtonSize;
  /** The static color style to apply. Useful when the ActionButton appears over a color background. */
  staticColor?: StaticColor;
  /** Whether the button should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Whether the ActionButton is pending. Pending buttons suppress press handlers and show progress. */
  isPending?: boolean;
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
 * ActionButtons allow users to perform an action.
 */
export function ActionButton(props: ActionButtonProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const groupContext = useActionButtonGroupContext();
  const defaultProps: Partial<ActionButtonProps> = {
    size: "M",
  };
  const groupProps: Partial<ActionButtonProps> & {
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

  const merged = mergeProps(defaultProps, providerProps, groupProps, props);
  const [local, headlessProps] = splitProps(merged, [
    "size",
    "staticColor",
    "isQuiet",
    "isPending",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
    "onPress",
    "onPressChange",
    "onHoverChange",
    "density",
    "orientation",
    "isJustified",
  ] as const);

  const { isProgressVisible } = createPendingState(() => local.isPending);
  let buttonElement: HTMLButtonElement | undefined;

  const size = (): ActionButtonSize => local.size ?? "M";
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
  const getS2State = (renderProps: ButtonRenderProps): S2ActionButtonRenderState => ({
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
      local.class,
      mergeStyles(
        s2ActionButton({
          ...getS2State(renderProps),
          size: size(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
          isQuiet: local.isQuiet,
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

  const pendingAccessibleLabel = () => {
    const existingLabel = (headlessProps as Record<string, unknown>)["aria-label"];
    if (existingLabel != null) {
      return existingLabel as string;
    }

    const resolvedChildren = resolveChildren(() => local.children);
    const content = resolvedChildren();
    return local.isPending && typeof content === "string" ? content : undefined;
  };

  function ActionButtonContent() {
    const iconContextValue = {
      slot: "icon",
      render: centerBaseline({
        slot: "icon",
        styles: () =>
          style({
            gridArea: "icon",
            visibility: {
              isProgressVisible: "hidden",
            },
          })({ isProgressVisible: isProgressVisible() }),
      }),
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
        <span
          class={s2ActionButtonText({ isProgressVisible: isProgressVisible() })}
          data-rsp-slot="text"
        >
          {content()}
        </span>
      ) : (
        content()
      );
    }

    return (
      <IconContext.Provider value={iconContextValue}>
        <ResolvedContent />
        {local.isPending ? (
          <div
            class={s2ActionButtonPendingIndicator({
              isProgressVisible: isProgressVisible(),
            })}
          >
            <div
              class={s2ActionButtonProgressCircle({ size: size() })}
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
    );
  }

  return (
    <HeadlessButton
      {...headlessProps}
      aria-label={pendingAccessibleLabel()}
      isPending={local.isPending}
      isPendingFocusable
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
      }}
      onHoverChange={(hovered) => {
        local.onHoverChange?.(hovered);
      }}
      onPressChange={(pressed) => {
        local.onPressChange?.(pressed);
      }}
      onPress={(event) => {
        if (!local.isPending) {
          local.onPress?.(event);
        }
      }}
      class={getClassName}
      style={getPressScaleStyle}
      data-size={size()}
      data-static-color={local.staticColor || undefined}
      data-quiet={local.isQuiet ? "true" : undefined}
    >
      <ActionButtonContent />
    </HeadlessButton>
  );
}
