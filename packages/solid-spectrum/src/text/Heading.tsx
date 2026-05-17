import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends Omit<
  JSX.HTMLAttributes<HTMLHeadingElement>,
  "children" | "class" | "style" | "ref" | "slot"
> {
  /** The heading level (1-6). @default 3 */
  level?: HeadingLevel;
  /** Additional CSS class name. */
  class?: string;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  isHidden?: boolean;
  slot?: string | null;
  ref?: RefLike<HTMLElement>;
  /** An accessibility id. */
  id?: string;
  /** The content of the heading. */
  children?: JSX.Element;
}

export const HeadingContext = createContext<SpectrumContextValue<HeadingProps>>(null);

const levelStyles: Record<HeadingLevel, string> = {
  1: "text-4xl font-bold",
  2: "text-3xl font-bold",
  3: "text-2xl font-semibold",
  4: "text-xl font-semibold",
  5: "text-lg font-medium",
  6: "text-base font-medium",
};

/**
 * A styled heading component with configurable level.
 */
export function Heading(props: HeadingProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeadingContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, rest] = splitProps(merged, [
    "level",
    "class",
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const level = () => local.level ?? 3;
  const tag = () => `h${level()}` as keyof JSX.IntrinsicElements;
  const className = () =>
    [
      contextProps ? "" : `text-primary-100 ${levelStyles[level()]}`,
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeContextStyles(contextProps?.styles, props.styles),
    ]
      .filter(Boolean)
      .join(" ");
  const unsafeStyle = () => mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  if (local.isHidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <Dynamic
      component={tag()}
      {...rest}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
    >
      {local.children}
    </Dynamic>
  );
}
