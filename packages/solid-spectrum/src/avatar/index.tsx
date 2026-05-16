import { createContext, mergeProps, splitProps, type JSX, useContext } from "solid-js";
import { createLabel, filterDOMProps } from "@proyecto-viviana/solidaria";
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
import { Image } from "../image";

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

export type AvatarGroupSize = 16 | 20 | 24 | 28 | 32 | 36 | 40;

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
export const AvatarGroupContext = createContext<SpectrumContextValue<AvatarGroupProps>>(null);

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

const avatarGroupAvatar = style({
  marginStart: {
    default: "calc(var(--size) / -4)",
    ":first-child": 0,
  },
});

const avatarGroupText = style({
  marginStart: 8,
  truncate: true,
  font: {
    size: {
      16: "ui-xs",
      20: "ui-sm",
      24: "ui",
      28: "ui-lg",
      32: "ui-xl",
      36: "ui-2xl",
      40: "ui-3xl",
    },
  },
});

const avatarGroupContainer = style(
  {
    display: "flex",
    alignItems: "center",
  },
  getAllowedOverrides({ width: false }),
);

export function Avatar(props: AvatarProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local] = splitProps(merged, [
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
  const rootClass = () =>
    [contextProps?.UNSAFE_className, local.UNSAFE_className, local.class, centerBaselineBefore]
      .filter(Boolean)
      .join(" ");

  return (
    <Image
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      slot={slot() ?? undefined}
      alt={local.alt ?? ""}
      src={local.src || undefined}
      UNSAFE_className={rootClass()}
      UNSAFE_style={mergedStyle()}
      styles={avatarRoot(
        {
          isOverBackground: local.isOverBackground,
          isLarge: size() >= 64,
        },
        mergeContextStyles(contextProps?.styles, props.styles),
      )}
    />
  );
}

export interface AvatarGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "slot" | "ref"
> {
  /** Avatar children of the avatar group. */
  children?: JSX.Element;
  /** The label for the avatar group. */
  label?: string;
  /** The size of the avatar group. @default 24 */
  size?: AvatarGroupSize;
  class?: string;
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

export function AvatarGroup(props: AvatarGroupProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarGroupContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "label",
    "size",
    "class",
    "slot",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);
  const size = () => local.size ?? 24;
  const labelAria = createLabel(() => ({
    id: domProps.id,
    label: local.label,
    "aria-label": domProps["aria-label"],
    "aria-labelledby": domProps["aria-labelledby"],
    labelElementType: "span",
  }));
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedStyle = (): JSX.CSSProperties =>
    ({
      ...(mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style) ?? {}),
      "--size": `${size() / 16}rem`,
    }) as JSX.CSSProperties;
  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      avatarGroupContainer(null, mergedStyles()),
    ]
      .filter(Boolean)
      .join(" ");
  const avatarContextValue = {
    styles: avatarGroupAvatar,
    get size() {
      return size();
    },
    isOverBackground: true,
  } satisfies Partial<AvatarProps>;

  return (
    <AvatarContext.Provider value={avatarContextValue}>
      <div
        {...filterDOMProps(domProps)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        id={labelAria.fieldProps.id}
        aria-label={labelAria.fieldProps["aria-label"]}
        aria-labelledby={labelAria.fieldProps["aria-labelledby"]}
        role="group"
        class={className()}
        style={mergedStyle()}
      >
        {local.children}
        {local.label && (
          <span
            id={(labelAria.labelProps as JSX.HTMLAttributes<HTMLSpanElement>).id}
            class={avatarGroupText({ size: String(size()) })}
          >
            {local.label}
          </span>
        )}
      </div>
    </AvatarContext.Provider>
  );
}
