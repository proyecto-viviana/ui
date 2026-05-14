import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import type { StyleString } from "../s2-style";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export interface ImageProps extends JSX.ImgHTMLAttributes<HTMLImageElement> {
  class?: string;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  hidden?: boolean;
}

export const ImageContext = createContext<SpectrumContextValue<ImageProps>>(null);

export function Image(props: ImageProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ImageContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "hidden",
    "ref",
  ]);

  if (local.hidden) {
    return null as unknown as JSX.Element;
  }

  return (
    <img
      {...domProps}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLImageElement> } | null)?.ref,
        props.ref,
      )}
      class={[
        "max-w-full h-auto",
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        local.class,
        mergeContextStyles(contextProps?.styles, props.styles),
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style) ?? domProps.style
      }
    />
  );
}
