import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import {
  Link as HeadlessLink,
  type LinkProps as HeadlessLinkProps,
  type LinkRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { baseColor, focusRing, style, type StyleString } from "../s2-style";
import { mergeContextRefs, type RefLike } from "../button/spectrum-context";
import {
  getSlottedContextProps,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import {
  getAllowedOverrides,
  staticColor as staticColorStyle,
  type UnsafeClassName,
} from "../s2-internal/style-utils";
import { createIsSkeleton, useInertAttribute, useSkeletonText } from "../skeleton";

type LinkVariant = "primary" | "secondary";
type LinkStaticColor = "white" | "black" | "auto";

export interface LinkProps extends Omit<
  HeadlessLinkProps,
  | "isDisabled"
  | "class"
  | "style"
  | "children"
  | "ref"
  | "onHoverStart"
  | "onHoverEnd"
  | "onHoverChange"
  | "onClick"
> {
  /** The visual style of the link. @default 'primary' */
  variant?: LinkVariant;
  /** The static color style to apply when the link appears over a color background. */
  staticColor?: LinkStaticColor;
  /** Whether the link is on its own vs inside a longer string of text. */
  isStandalone?: boolean;
  /** Whether the link should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** The content of the link. */
  children?: JSX.Element;
  /** Ref for the underlying link element. */
  ref?: RefLike<HTMLElement>;
}

export const LinkContext = createContext<SpectrumContextValue<LinkProps>>(null);

type UnsupportedLinkProps = Pick<
  HeadlessLinkProps,
  "isDisabled" | "onHoverStart" | "onHoverEnd" | "onHoverChange" | "onClick"
> & {
  class?: string;
};

const linkStyles = style<
  LinkRenderProps & {
    variant: LinkVariant;
    staticColor?: LinkStaticColor;
    isStaticColor: boolean;
    isQuiet?: boolean;
    isStandalone?: boolean;
    isSkeleton: boolean;
  }
>(
  {
    ...focusRing(),
    ...staticColorStyle(),
    borderRadius: "sm",
    font: {
      isStandalone: "ui",
    },
    color: {
      variant: {
        primary: baseColor("accent"),
        secondary: baseColor("neutral"),
      },
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "LinkText",
    },
    transition: "default",
    fontWeight: {
      isStandalone: "medium",
    },
    textDecoration: {
      default: "underline",
      isStandalone: {
        isQuiet: {
          default: "none",
          isHovered: "underline",
          isFocusVisible: "underline",
        },
      },
    },
    outlineColor: {
      default: "focus-ring",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "Highlight",
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

/**
 * Links allow users to navigate to a different location.
 * They can be presented inline inside a paragraph or as standalone text.
 *
 *
 * @example
 * ```tsx
 * <Link href="/about">About Us</Link>
 *
 * // Secondary variant
 * <Link href="/help" variant="secondary">Help</Link>
 *
 * // Standalone (bold, no underline until hover)
 * <Link href="/home" isStandalone isQuiet>Home</Link>
 * ```
 */
export function Link(props: LinkProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(LinkContext), props.slot);
  const mergedProps = mergeProps(
    { variant: "primary" as const },
    contextProps ?? {},
    props,
  ) as LinkProps & Partial<UnsupportedLinkProps>;
  const [local, headlessProps] = splitProps(mergedProps, [
    "variant",
    "staticColor",
    "isStandalone",
    "isQuiet",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "ref",
    "children",
    "class",
    "isDisabled",
    "onHoverStart",
    "onHoverEnd",
    "onHoverChange",
    "onClick",
  ]);

  const variant = () => local.variant ?? "primary";
  const isSkeleton = createIsSkeleton();
  const inertRef = useInertAttribute(isSkeleton);
  const assignRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
    props.ref,
    inertRef,
  );
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const [children, skeletonStyle] = useSkeletonText(
    () => local.children,
    () => mergedUnsafeStyle(),
  );

  const getClassName = (renderProps: LinkRenderProps): string =>
    [
      local.UNSAFE_className,
      linkStyles(
        {
          ...renderProps,
          variant: variant(),
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
          isQuiet: !!local.isQuiet,
          isStandalone: !!local.isStandalone,
          isSkeleton: isSkeleton(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessLink
      {...headlessProps}
      ref={(element: HTMLElement) => assignRefs(element)}
      class={getClassName}
      style={() => skeletonStyle() ?? {}}
    >
      {children()}
    </HeadlessLink>
  );
}
