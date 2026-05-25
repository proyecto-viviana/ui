import {
  children as resolveChildren,
  type JSX,
  createContext,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
import { fontRelative, lightDark, style, type StyleString } from "../s2-style";
import { centerBaseline } from "../icon/center-baseline";
import { IconContext } from "../icon/spectrum-icon";
import { control, getAllowedOverrides, type UnsafeClassName } from "../s2-internal/style-utils";
import { SkeletonWrapper } from "../skeleton";
import { Text, TextContext } from "../text";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type BadgeSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
export type BadgeVariant =
  | "accent"
  | "informative"
  | "neutral"
  | "positive"
  | "notice"
  | "negative"
  | "gray"
  | "red"
  | "orange"
  | "yellow"
  | "chartreuse"
  | "celery"
  | "green"
  | "seafoam"
  | "cyan"
  | "blue"
  | "indigo"
  | "purple"
  | "fuchsia"
  | "magenta"
  | "pink"
  | "turquoise"
  | "brown"
  | "cinnamon"
  | "silver"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";
export type BadgeFillStyle = "bold" | "subtle" | "outline";
export type BadgeOverflowMode = "wrap" | "truncate";

type S2BadgeSize = "S" | "M" | "L" | "XL";
type S2BadgeVariant = Exclude<
  BadgeVariant,
  "primary" | "secondary" | "success" | "warning" | "danger" | "info"
>;

export interface BadgeProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "style" | "children" | "ref" | "slot"
> {
  /** The content to display in the badge. */
  children?: JSX.Element;
  /** Backward-compatible count content. Prefer children for S2 parity. */
  count?: number;
  /** The size of the badge. @default 'S' */
  size?: BadgeSize;
  /** The variant changes the background color of the badge. @default 'neutral' */
  variant?: BadgeVariant;
  /** The fill of the badge. @default 'bold' */
  fillStyle?: BadgeFillStyle;
  /** Sets the text behavior for the contents. @default 'wrap' */
  overflowMode?: BadgeOverflowMode;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  slot?: string | null;
  ref?: RefLike<HTMLSpanElement>;
}

export const BadgeContext = createContext<SpectrumContextValue<BadgeProps>>(null);

const badgeStyles = style<{
  size: S2BadgeSize;
  variant: S2BadgeVariant;
  fillStyle: BadgeFillStyle;
}>(
  {
    ...control({ shape: "default", wrap: true, icon: true }),
    justifyContent: "center",
    color: {
      fillStyle: {
        bold: {
          default: "white",
          variant: {
            notice: "black",
            orange: "black",
            yellow: "black",
            chartreuse: "black",
            celery: "black",
          },
        },
        subtle: "gray-1000" as never,
        outline: "gray-1000" as never,
      },
    },
    backgroundColor: {
      fillStyle: {
        bold: {
          variant: {
            accent: "accent",
            informative: "informative",
            neutral: "neutral-subdued",
            positive: "positive",
            notice: "notice",
            negative: "negative",
            gray: "gray",
            red: "red",
            orange: "orange",
            yellow: "yellow",
            chartreuse: "chartreuse",
            celery: "celery",
            green: "green",
            seafoam: "seafoam",
            cyan: "cyan",
            blue: "blue",
            indigo: "indigo",
            purple: "purple",
            fuchsia: "fuchsia",
            magenta: "magenta",
            pink: "pink",
            turquoise: "turquoise",
            brown: "brown",
            cinnamon: "cinnamon",
            silver: "silver",
          },
        },
        subtle: {
          variant: {
            accent: "accent-subtle",
            informative: "informative-subtle",
            neutral: "neutral-subtle",
            positive: "positive-subtle",
            notice: "notice-subtle",
            negative: "negative-subtle",
            gray: "gray-subtle",
            red: "red-subtle",
            orange: "orange-subtle",
            yellow: "yellow-subtle",
            chartreuse: "chartreuse-subtle",
            celery: "celery-subtle",
            green: "green-subtle",
            seafoam: "seafoam-subtle",
            cyan: "cyan-subtle",
            blue: "blue-subtle",
            indigo: "indigo-subtle",
            purple: "purple-subtle",
            fuchsia: "fuchsia-subtle",
            magenta: "magenta-subtle",
            pink: "pink-subtle",
            turquoise: "turquoise-subtle",
            brown: "brown-subtle",
            cinnamon: "cinnamon-subtle",
            silver: "silver-subtle",
          },
        },
        outline: "layer-2",
      },
    },
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: {
      default: "transparent",
      fillStyle: {
        outline: {
          variant: {
            accent: lightDark("accent-800" as never, "accent-900" as never),
            informative: lightDark("informative-800" as never, "informative-900" as never),
            neutral: lightDark("gray-500" as never, "gray-600" as never),
            positive: lightDark("positive-800" as never, "positive-900" as never),
            notice: lightDark("notice-800" as never, "notice-900" as never),
            negative: lightDark("negative-800" as never, "negative-900" as never),
          },
        },
      },
    },
    "--iconPrimary": {
      type: "fill",
      value: "currentColor",
    },
  },
  getAllowedOverrides(),
);

const textStyles = style<{ overflowMode: BadgeOverflowMode }>({
  paddingY: "--labelPadding",
  order: 1,
  overflowX: "hidden",
  overflowY: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: {
    overflowMode: {
      truncate: "nowrap",
      wrap: "normal",
    },
  },
});

const iconCenterStyles = style({ order: 0 });
const iconStyles = style({
  size: fontRelative(20),
  marginStart: "--iconMargin",
  flexShrink: 0,
});

function normalizeSize(size: BadgeSize | undefined): S2BadgeSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    default:
      return size ?? "S";
  }
}

function normalizeVariant(variant: BadgeVariant | undefined): S2BadgeVariant {
  switch (variant) {
    case "primary":
      return "accent";
    case "secondary":
      return "neutral";
    case "success":
      return "positive";
    case "warning":
      return "notice";
    case "danger":
      return "negative";
    case "info":
      return "informative";
    default:
      return variant ?? "neutral";
  }
}

function isTextOnly(value: unknown): boolean {
  if (typeof value === "string" || typeof value === "number") {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(
      (item) =>
        item == null ||
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean",
    );
  }

  return value == null || typeof value === "boolean";
}

export function Badge(props: BadgeProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(BadgeContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "count",
    "size",
    "variant",
    "fillStyle",
    "overflowMode",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
  ]);
  const size = () => normalizeSize(local.size);
  const variant = () => normalizeVariant(local.variant);
  const fillStyle = () => local.fillStyle ?? "bold";
  const overflowMode = () => local.overflowMode ?? "wrap";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLSpanElement> } | null)?.ref,
    props.ref,
  );

  function BadgeContent() {
    const resolvedChildren = resolveChildren(() =>
      local.count !== undefined ? local.count : local.children,
    );
    const content = () => resolvedChildren();
    return isTextOnly(content()) ? <Text>{content()}</Text> : content();
  }

  return (
    <TextContext.Provider
      value={{
        styles: () => textStyles({ overflowMode: overflowMode() }),
      }}
    >
      <IconContext.Provider
        value={{
          slot: "icon",
          render: centerBaseline({ slot: "icon", styles: iconCenterStyles }),
          styles: iconStyles,
        }}
      >
        <SkeletonWrapper>
          <span
            {...filterDOMProps(domProps)}
            ref={(element) => assignRef(element)}
            role="presentation"
            class={[
              contextProps?.UNSAFE_className,
              local.UNSAFE_className,
              local.class,
              badgeStyles(
                {
                  size: size(),
                  variant: variant(),
                  fillStyle: fillStyle(),
                },
                mergedStyles(),
              ),
            ]
              .filter(Boolean)
              .join(" ")}
            style={mergedUnsafeStyle()}
          >
            <BadgeContent />
          </span>
        </SkeletonWrapper>
      </IconContext.Provider>
    </TextContext.Provider>
  );
}
