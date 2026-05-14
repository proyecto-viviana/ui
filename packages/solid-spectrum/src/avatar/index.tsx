import { createContext, mergeProps, splitProps, type JSX, useContext } from "solid-js";
import { style, type StyleString } from "../s2-style";
import { getAllowedOverrides } from "../s2-internal/style-utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { centerBaselineBefore } from "../icon/center-baseline";

export type AvatarSize =
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40
  | 44
  | 48
  | 56
  | 64
  | 80
  | 96
  | 112
  | number
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

export interface AvatarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "slot" | "ref"
> {
  src?: string;
  alt?: string;
  /** The size of the avatar. @default 24 */
  size?: AvatarSize;
  /** Whether the avatar is over a color background. */
  isOverBackground?: boolean;
  /** @deprecated Not part of the S2 Avatar API. Kept as a no-op compatibility prop. */
  online?: boolean;
  /** @deprecated Not part of the S2 Avatar API. Kept as a no-op compatibility prop. */
  fallback?: string;
  class?: string;
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

export const AvatarContext = createContext<SpectrumContextValue<AvatarProps>>(null);

const legacySizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
} as const;

const avatarRoot = style(
  {
    backgroundColor: "gray-100" as never,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    borderRadius: "full",
    size: 20,
    flexShrink: 0,
    flexGrow: 0,
    disableTapHighlight: true,
    outlineStyle: {
      default: "none",
      isOverBackground: "solid",
    },
    outlineColor: "--s2-container-bg",
    outlineWidth: {
      default: 1,
      isLarge: 2,
    },
  },
  getAllowedOverrides({ width: false }),
);

const avatarImage = style({
  display: "block",
  width: "full",
  height: "full",
  objectFit: "inherit",
  objectPosition: "inherit",
  opacity: {
    default: 0,
    isRevealed: 1,
  },
  transition: {
    default: "none",
    isTransitioning: "opacity",
  },
  transitionDuration: 500,
});

export function Avatar(props: AvatarProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "src",
    "alt",
    "size",
    "isOverBackground",
    "online",
    "fallback",
    "class",
    "slot",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);

  const size = () => {
    const value = local.size ?? 24;
    return typeof value === "string" ? legacySizeMap[value] : Number(value);
  };
  const remSize = () => `${size() / 16}rem`;
  const slot = () =>
    local.slot === null ? undefined : (local.slot ?? contextProps?.slot ?? "avatar");
  const mergedStyle = (): JSX.CSSProperties | undefined => {
    const unsafeStyle = mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
    return {
      ...(unsafeStyle ?? {}),
      width: remSize(),
      height: remSize(),
    };
  };

  return (
    <div
      {...domProps}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      slot={slot() ?? undefined}
      class={[
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        local.class,
        centerBaselineBefore,
        avatarRoot(
          {
            isOverBackground: local.isOverBackground,
            isLarge: size() >= 64,
          },
          mergeContextStyles(contextProps?.styles, props.styles),
        ),
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle()}
    >
      <img
        src={local.src || undefined}
        alt={local.alt ?? ""}
        class={avatarImage({ isRevealed: !!local.src })}
      />
    </div>
  );
}

export interface AvatarGroupProps {
  children: JSX.Element;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup(props: AvatarGroupProps) {
  return <div class="flex -space-x-2">{props.children}</div>;
}
