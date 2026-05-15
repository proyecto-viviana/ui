import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { CenterBaseline } from "../icon/center-baseline";
import { style, type StyleString } from "../s2-style";
import { controlFont, getAllowedOverrides, type UnsafeClassName } from "../s2-internal/style-utils";
import { useIsSkeleton } from "../skeleton";
import { Text, TextContext } from "../text";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type StatusLightVariant =
  | "informative"
  | "neutral"
  | "positive"
  | "notice"
  | "negative"
  | "yellow"
  | "chartreuse"
  | "celery"
  | "seafoam"
  | "cyan"
  | "indigo"
  | "purple"
  | "fuchsia"
  | "magenta"
  | "pink"
  | "turquoise"
  | "brown"
  | "cinnamon"
  | "silver"
  | "info";
export type StatusLightSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";

type S2StatusLightVariant = Exclude<StatusLightVariant, "info">;
type S2StatusLightSize = "S" | "M" | "L" | "XL";

export interface StatusLightProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children" | "ref" | "role" | "slot"
> {
  /** The content to display as the label. */
  children?: JSX.Element;
  /**
   * The variant changes the color of the status light.
   * @default 'neutral'
   */
  variant?: StatusLightVariant;
  /** The size of the status light. @default 'M' */
  size?: StatusLightSize;
  /**
   * An accessibility role for the status light.
   * Should be set when the status can change at runtime.
   */
  role?: "status";
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible indicator class alias. Prefer styles for S2 parity. */
  indicatorClass?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
}

export const StatusLightContext = createContext<SpectrumContextValue<StatusLightProps>>(null);

const wrapperStyles = style<{
  size: S2StatusLightSize;
  variant: S2StatusLightVariant;
}>(
  {
    display: "flex",
    gap: "text-to-visual",
    alignItems: "baseline",
    width: "fit",
    font: controlFont(),
    color: {
      default: "neutral",
      variant: {
        neutral: "gray-600" as never,
      },
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const lightStyles = style<{
  size: S2StatusLightSize;
  variant: S2StatusLightVariant;
  isSkeleton: boolean;
}>({
  size: {
    size: {
      S: 8,
      M: 10,
      L: 12,
      XL: 14,
    },
  },
  fill: {
    variant: {
      informative: "informative",
      neutral: "neutral",
      positive: "positive",
      notice: "notice",
      negative: "negative",
      celery: "celery",
      chartreuse: "chartreuse",
      cyan: "cyan",
      fuchsia: "fuchsia",
      purple: "purple",
      magenta: "magenta",
      indigo: "indigo",
      seafoam: "seafoam",
      yellow: "yellow",
      pink: "pink",
      turquoise: "turquoise",
      cinnamon: "cinnamon",
      brown: "brown",
      silver: "silver",
    },
    isSkeleton: "gray-200" as never,
  },
  overflow: "visible",
});

function normalizeSize(size: StatusLightSize | undefined): S2StatusLightSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    default:
      return size ?? "M";
  }
}

function normalizeVariant(variant: StatusLightVariant | undefined): S2StatusLightVariant {
  return variant === "info" ? "informative" : (variant ?? "neutral");
}

export function StatusLight(props: StatusLightProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(StatusLightContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "variant",
    "size",
    "role",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "indicatorClass",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "slot",
    "ref",
  ]);
  const isSkeleton = useIsSkeleton();
  const size = () => normalizeSize(local.size);
  const variant = () => normalizeVariant(local.variant);
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <TextContext.Provider value={{}}>
      <div
        {...domProps}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        role={local.role}
        aria-label={local.role ? local["aria-label"] : undefined}
        aria-labelledby={local.role ? local["aria-labelledby"] : undefined}
        aria-describedby={local.role ? local["aria-describedby"] : undefined}
        aria-details={local.role ? local["aria-details"] : undefined}
        class={[
          contextProps?.UNSAFE_className,
          local.UNSAFE_className,
          local.class,
          wrapperStyles({ size: size(), variant: variant() }, mergedStyles()),
        ]
          .filter(Boolean)
          .join(" ")}
        style={mergedUnsafeStyle()}
      >
        <CenterBaseline>
          <svg
            class={[
              lightStyles({ size: size(), variant: variant(), isSkeleton: isSkeleton() }),
              local.indicatorClass,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            <circle r="50%" cx="50%" cy="50%" />
          </svg>
        </CenterBaseline>
        <Text>{local.children}</Text>
      </div>
    </TextContext.Provider>
  );
}
