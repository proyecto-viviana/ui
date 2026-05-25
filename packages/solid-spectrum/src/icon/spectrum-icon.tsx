import { type Component, type JSX, createContext, splitProps, useContext } from "solid-js";
import { style, type StyleString } from "../style";
import { mergeStyles } from "../style/runtime";
import { mergeContextRefs, type RefLike } from "../button/spectrum-context";
import {
  createIsSkeleton,
  loadingStyle,
  useInertAttribute,
  useLoadingAnimation,
  useSkeletonIcon,
} from "../skeleton";

export interface IconContextValue {
  slot?: string | null;
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
  UNSAFE_suppressDataSlot?: boolean;
}

export interface SpectrumIllustrationProps extends SpectrumIconProps {
  size?: "S" | "M" | "L";
}

type SpectrumSvgComponentProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  focusable?: boolean | "false" | "true";
  size?: "S" | "M" | "L";
};

const illustrationSizes = {
  S: 48,
  M: 96,
  L: 160,
} as const;

const iconAllowedOverrides = [
  "margin",
  "marginStart",
  "marginEnd",
  "marginTop",
  "marginBottom",
  "marginX",
  "marginY",
  "justifySelf",
  "alignSelf",
  "order",
  "gridArea",
  "gridRowStart",
  "gridRowEnd",
  "gridColumnStart",
  "gridColumnEnd",
  "position",
  "zIndex",
  "top",
  "bottom",
  "inset",
  "insetX",
  "insetY",
  "insetStart",
  "insetEnd",
  "rotate",
  "--iconPrimary",
  "size",
] as const;

const iconBaseStyles = style(
  {
    size: 20,
    flexShrink: 0,
  },
  iconAllowedOverrides,
);

const illustrationBaseStyles = style(
  {
    size: {
      size: illustrationSizes,
    },
    flexShrink: 0,
  },
  iconAllowedOverrides,
);

export function createIcon(Component: Component<SpectrumSvgComponentProps>, context = IconContext) {
  return (props: SpectrumIconProps): JSX.Element => {
    const ctx = useContext(context);
    const [local, rest] = splitProps(props, [
      "slot",
      "styles",
      "class",
      "style",
      "aria-label",
      "aria-hidden",
      "UNSAFE_suppressDataSlot",
      "size" as keyof SpectrumIconProps,
    ]);
    const slot = () => {
      if (local.UNSAFE_suppressDataSlot) {
        return undefined;
      }

      return local.slot ?? ctx.slot ?? undefined;
    };
    const contextStyles = () => (typeof ctx.styles === "function" ? ctx.styles() : ctx.styles);
    const isSkeleton = createIsSkeleton();
    const skeletonAnimationRef = useLoadingAnimation(isSkeleton);
    const inertRef = useInertAttribute(isSkeleton);
    const skeletonStyles = useSkeletonIcon(() =>
      mergeStyles(iconBaseStyles(null, local.styles), contextStyles()),
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
        focusable={false}
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

export function createIllustration(Component: Component<SpectrumSvgComponentProps>) {
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
      "UNSAFE_suppressDataSlot",
    ]);
    const slot = () => {
      if (local.UNSAFE_suppressDataSlot) {
        return undefined;
      }

      return local.slot ?? ctx.slot ?? undefined;
    };
    const size = () => local.size ?? ctx.size ?? "M";
    const contextStyles = () => (typeof ctx.styles === "function" ? ctx.styles() : ctx.styles);

    const mergedClass = () =>
      [
        local.class,
        mergeStyles(illustrationBaseStyles({ size: size() }, local.styles), contextStyles()),
      ]
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
        size={size()}
        focusable={false}
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
