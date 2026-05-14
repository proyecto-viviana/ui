import {
  children as resolveChildren,
  type JSX,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  Button as HeadlessButton,
  type ButtonProps as HeadlessButtonProps,
  type ButtonRenderProps,
  DialogTriggerContext,
  PopoverTriggerContext,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import { fontRelative, style } from "../s2-style";
import { useProviderProps } from "../provider";
import { centerBaseline } from "../icon/center-baseline";
import type { StaticColor } from "./types";
import type { StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import {
  s2ActionButton,
  s2ActionButtonPendingIndicator,
  s2ActionButtonStaticColor,
  s2ActionButtonText,
  type S2ActionButtonRenderState,
} from "./s2-action-button-styles";
import { createPendingState } from "./pending-state";
import { S2PendingProgressCircle } from "./S2PendingProgressCircle";
import { pressScale } from "../pressScale";
import {
  type ActionButtonDensity,
  type ActionButtonOrientation,
  type ActionButtonSize,
  useActionButtonGroupContext,
} from "./group-context";
import { IconContext } from "../icon/spectrum-icon";
import { AvatarContext } from "../avatar";
import { ImageContext } from "../image";
import { NotificationBadgeContext } from "../notificationbadge";
import { SkeletonContext } from "../skeleton";
import { TextContext } from "../text";
import { s2IntlStrings } from "../intl";
import { useActionButtonContext } from "./context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "./spectrum-context";

export type { ActionButtonSize } from "./group-context";

const avatarSize: Record<ActionButtonSize, number> = {
  XS: 14,
  S: 16,
  M: 20,
  L: 22,
  XL: 26,
};

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
  const contextProps = getSlottedContextProps(useActionButtonContext(), props.slot);
  const groupContext = getSlottedContextProps(useActionButtonGroupContext(), undefined);
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

  const merged = mergeProps(defaultProps, providerProps, contextProps ?? {}, props, groupProps);
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
    "ref",
    "onPress",
    "onPressChange",
    "onHoverChange",
    "density",
    "orientation",
    "isJustified",
  ] as const);

  const { isProgressVisible } = createPendingState(() => local.isPending);
  const dialogTriggerContext = useContext(DialogTriggerContext);
  const popoverTriggerContext = useContext(PopoverTriggerContext);
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  let buttonElement: HTMLButtonElement | undefined;
  const assignButtonRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLButtonElement> } | null)?.ref,
    props.ref,
  );

  const size = (): ActionButtonSize => local.size ?? "M";
  const density = (): ActionButtonDensity => local.density ?? "regular";
  const orientation = (): ActionButtonOrientation => local.orientation ?? "horizontal";
  const isOverlayTriggerOpen = () =>
    !!buttonElement &&
    ((dialogTriggerContext?.triggerRef() === buttonElement &&
      dialogTriggerContext.state.isOpen()) ||
      (popoverTriggerContext?.triggerRef() === buttonElement &&
        popoverTriggerContext.state.isOpen()));
  const pendingLabel = () => stringFormatter().format("button.pending");
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const getS2State = (renderProps: ButtonRenderProps): S2ActionButtonRenderState => ({
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
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const getPressScaleStyle = (renderProps: ButtonRenderProps): JSX.CSSProperties =>
    pressScale(() => buttonElement, mergedUnsafeStyle())(renderProps);

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
    const textContextValue = {
      styles: () => s2ActionButtonText({ isProgressVisible: isProgressVisible() }),
    };
    const avatarContextValue = {
      get size() {
        return avatarSize[size()];
      },
      get styles() {
        return style({
          marginStart: "--iconMargin",
          gridArea: "icon",
        });
      },
    };
    const imageContextValue = {
      styles: () =>
        style({
          visibility: {
            isProgressVisible: "hidden",
          },
        })({ isProgressVisible: isProgressVisible() }),
    };
    const notificationBadgeContextValue = {
      get staticColor() {
        return local.staticColor;
      },
      get size() {
        const currentSize = size();
        return currentSize === "XS" ? undefined : currentSize;
      },
      get isDisabled() {
        return !!headlessProps.isDisabled;
      },
      styles: () =>
        style({
          position: "absolute",
          top: "--badgeTop",
          marginTop: "calc((self(height) * -1)/2)",
          marginStart: "calc(var(--iconMargin) * 2 + (self(height) * -1)/4)",
          gridColumnStart: 1,
          insetStart: "--badgePosition",
          visibility: {
            isProgressVisible: "hidden",
          },
        })({ isProgressVisible: isProgressVisible() }),
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
      <SkeletonContext.Provider value={null}>
        <TextContext.Provider value={textContextValue}>
          <IconContext.Provider value={iconContextValue}>
            <AvatarContext.Provider value={avatarContextValue}>
              <ImageContext.Provider value={imageContextValue}>
                <NotificationBadgeContext.Provider value={notificationBadgeContextValue}>
                  <ResolvedContent />
                  {local.isPending ? (
                    <div
                      class={s2ActionButtonPendingIndicator({
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
                </NotificationBadgeContext.Provider>
              </ImageContext.Provider>
            </AvatarContext.Provider>
          </IconContext.Provider>
        </TextContext.Provider>
      </SkeletonContext.Provider>
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
        assignButtonRefs(element);
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
