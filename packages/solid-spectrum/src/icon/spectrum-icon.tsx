import { type Component, type JSX, createContext, splitProps, useContext } from "solid-js";
import { iconStyle, type StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { mergeContextRefs, type RefLike } from "../button/spectrum-context";
import {
  createIsSkeleton,
  loadingStyle,
  useInertAttribute,
  useLoadingAnimation,
  useSkeletonIcon,
} from "../skeleton";

export interface IconContextValue {
  slot?: string;
  styles?: StyleString | (() => StyleString | undefined);
  render?: (icon: JSX.Element) => JSX.Element;
  size?: "S" | "M" | "L";
}

export const IconContext = createContext<IconContextValue>({});
export const IllustrationContext = createContext<IconContextValue>({});

export interface SpectrumIconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  slot?: string;
  styles?: StyleString;
  class?: string;
  style?: JSX.CSSProperties | string;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "false" | "true";
}

export interface SpectrumIllustrationProps extends SpectrumIconProps {
  size?: "S" | "M" | "L";
}

const illustrationSizes = {
  S: 48,
  M: 96,
  L: 160,
} as const;

export function createIcon(
  Component: Component<JSX.SvgSVGAttributes<SVGSVGElement>>,
  context = IconContext,
) {
  return (props: SpectrumIconProps): JSX.Element => {
    const ctx = useContext(context);
    const [local, rest] = splitProps(props, [
      "slot",
      "styles",
      "class",
      "style",
      "aria-label",
      "aria-hidden",
    ]);
    const slot = () => local.slot ?? ctx.slot ?? "icon";
    const contextStyles = () => (typeof ctx.styles === "function" ? ctx.styles() : ctx.styles);
    const isSkeleton = createIsSkeleton();
    const skeletonAnimationRef = useLoadingAnimation(isSkeleton);
    const inertRef = useInertAttribute(isSkeleton);
    const skeletonStyles = useSkeletonIcon(() =>
      mergeStyles(iconStyle({ size: "M" }), contextStyles(), local.styles),
    );
    const skeletonRef = (element: SVGSVGElement) => {
      skeletonAnimationRef(element);
      inertRef(element);
    };

    const mergedClass = () =>
      [local.class, skeletonStyles(), isSkeleton() ? loadingStyle : undefined]
        .filter(Boolean)
        .join(" ");

    const ariaHidden = () => {
      if (local["aria-label"]) {
        return local["aria-hidden"] || undefined;
      }

      return true;
    };

    const svg = (
      <Component
        {...rest}
        ref={mergeContextRefs((rest as { ref?: RefLike<SVGSVGElement> }).ref, skeletonRef)}
        role="img"
        aria-label={local["aria-label"]}
        aria-hidden={ariaHidden()}
        data-slot={slot()}
        class={mergedClass()}
        style={local.style}
      />
    );

    return ctx.render ? ctx.render(svg) : svg;
  };
}

export function createIllustration(Component: Component<JSX.SvgSVGAttributes<SVGSVGElement>>) {
  return (props: SpectrumIllustrationProps): JSX.Element => {
    const ctx = useContext(IllustrationContext);
    const [local, rest] = splitProps(props, [
      "slot",
      "styles",
      "class",
      "style",
      "aria-label",
      "aria-hidden",
      "size",
    ]);
    const slot = () => local.slot ?? ctx.slot ?? "icon";
    const size = () => local.size ?? ctx.size ?? "M";
    const contextStyles = () => (typeof ctx.styles === "function" ? ctx.styles() : ctx.styles);
    const isSkeleton = createIsSkeleton();
    const skeletonAnimationRef = useLoadingAnimation(isSkeleton);
    const inertRef = useInertAttribute(isSkeleton);
    const skeletonStyles = useSkeletonIcon(() =>
      mergeStyles(iconStyle({ size: "M" }), contextStyles(), local.styles),
    );
    const skeletonRef = (element: SVGSVGElement) => {
      skeletonAnimationRef(element);
      inertRef(element);
    };

    const mergedClass = () =>
      [local.class, skeletonStyles(), isSkeleton() ? loadingStyle : undefined]
        .filter(Boolean)
        .join(" ");

    const ariaHidden = () => {
      if (local["aria-label"]) {
        return local["aria-hidden"] || undefined;
      }

      return true;
    };

    const svg = (
      <Component
        {...rest}
        ref={mergeContextRefs((rest as { ref?: RefLike<SVGSVGElement> }).ref, skeletonRef)}
        role="img"
        aria-label={local["aria-label"]}
        aria-hidden={ariaHidden()}
        data-slot={slot()}
        class={mergedClass()}
        style={{
          width: `${illustrationSizes[size()]}px`,
          height: `${illustrationSizes[size()]}px`,
          ...(typeof local.style === "object" ? local.style : {}),
        }}
      />
    );

    return ctx.render ? ctx.render(svg) : svg;
  };
}
