import { Show, createContext, mergeProps, splitProps, type JSX, useContext } from "solid-js";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  fallback?: string;
  online?: boolean;
  class?: string;
  slot?: string | null;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

const namedSizeStyles: Record<
  Exclude<AvatarSize, number>,
  { container: string; text: string; indicator: string }
> = {
  xs: { container: "w-6 h-6", text: "text-xs", indicator: "w-1.5 h-1.5" },
  sm: { container: "w-8 h-8", text: "text-sm", indicator: "w-2 h-2" },
  md: { container: "w-10 h-10", text: "text-base", indicator: "w-2.5 h-2.5" },
  lg: { container: "w-14 h-14", text: "text-lg", indicator: "w-3 h-3" },
  xl: { container: "w-20 h-20", text: "text-xl", indicator: "w-4 h-4" },
};

export const AvatarContext = createContext<SpectrumContextValue<AvatarProps>>(null);

export function Avatar(props: AvatarProps) {
  const contextProps = getSlottedContextProps(useContext(AvatarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local] = splitProps(merged, [
    "src",
    "alt",
    "size",
    "fallback",
    "online",
    "class",
    "slot",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
  ]);

  const size = () => local.size ?? "md";
  const namedStyles = () =>
    typeof size() === "number" ? null : namedSizeStyles[size() as Exclude<AvatarSize, number>];
  const numericSize = () => (typeof size() === "number" ? `${size()}px` : undefined);
  const textClass = () => namedStyles()?.text ?? "text-xs";
  const indicatorClass = () => namedStyles()?.indicator ?? "w-2 h-2";
  const slot = () => local.slot ?? contextProps?.slot ?? "avatar";
  const mergedStyle = (): JSX.CSSProperties | undefined => {
    const unsafeStyle = mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
    const sizeValue = numericSize();
    return sizeValue
      ? { ...(unsafeStyle ?? {}), width: sizeValue, height: sizeValue }
      : unsafeStyle;
  };

  const initials = () => {
    if (local.fallback) return local.fallback.slice(0, 2).toUpperCase();
    if (local.alt) return local.alt.slice(0, 2).toUpperCase();
    return "?";
  };

  return (
    <div
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      slot={slot() ?? undefined}
      class={[
        "relative inline-block",
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        local.class,
        mergeContextStyles(contextProps?.styles, props.styles),
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergedStyle()}
    >
      <div
        class={`${namedStyles()?.container ?? ""} rounded-full overflow-hidden bg-bg-200 flex items-center justify-center ring-2 ring-accent/50`}
        style={
          numericSize()
            ? {
                width: numericSize(),
                height: numericSize(),
              }
            : undefined
        }
      >
        <Show
          when={local.src}
          fallback={<span class={`${textClass()} font-medium text-primary-300`}>{initials()}</span>}
        >
          <img src={local.src} alt={local.alt ?? "Avatar"} class="w-full h-full object-cover" />
        </Show>
      </div>
      <Show when={local.online !== undefined}>
        <span
          class={`absolute bottom-0 right-0 ${indicatorClass()} rounded-full ring-2 ring-bg-400 ${
            local.online ? "bg-success-400" : "bg-bg-light"
          }`}
        />
      </Show>
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
