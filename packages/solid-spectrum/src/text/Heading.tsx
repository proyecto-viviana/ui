import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { type BaseContentProps, getContentDomProps, mergeUnsafeClassName } from "./shared";

export interface HeadingProps extends BaseContentProps<HTMLHeadingElement> {
  level?: number;
}

export const HeadingContext = createContext<SpectrumContextValue<HeadingProps>>(null);

export function Heading(props: HeadingProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(HeadingContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as HeadingProps;
  const [local] = splitProps(merged, [
    "children",
    "level",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "isHidden",
    "slot",
    "ref",
  ]);
  const tag = () => `h${local.level ?? 3}` as keyof JSX.IntrinsicElements;
  const className = () =>
    [
      mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className),
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
      {...getContentDomProps(merged)}
      ref={mergeContextRefs(contextProps?.ref, props.ref)}
      class={className()}
      style={unsafeStyle()}
      slot={local.slot || undefined}
    >
      {local.children}
    </Dynamic>
  );
}
