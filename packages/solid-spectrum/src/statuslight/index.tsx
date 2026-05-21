import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
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

type StatusLightVariant =
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
  | "silver";
type StatusLightSize = "S" | "M" | "L" | "XL";

export interface StatusLightProps {
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
  id?: string;
  slot?: string | null;
  ref?: RefLike<HTMLDivElement>;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
  [key: `data-${string}`]: string | undefined;
}

export const StatusLightContext = createContext<SpectrumContextValue<StatusLightProps>>(null);

const wrapperStyles = style<{
  size: StatusLightSize;
  variant: StatusLightVariant;
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
  size: StatusLightSize;
  variant: StatusLightVariant;
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

function mergeUnsafeClassName(
  contextClassName?: UnsafeClassName | string,
  localClassName?: UnsafeClassName | string,
): string | undefined {
  return [contextClassName, localClassName].filter(Boolean).join(" ") || undefined;
}

export function StatusLight(props: StatusLightProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(StatusLightContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as StatusLightProps;
  const [local] = splitProps(merged, [
    "children",
    "variant",
    "size",
    "role",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "slot",
    "ref",
  ]);
  const isSkeleton = useIsSkeleton();
  const size = () => local.size ?? "M";
  const variant = () => local.variant ?? "neutral";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const mergedUnsafeClassName = () =>
    mergeUnsafeClassName(contextProps?.UNSAFE_className, props.UNSAFE_className);
  const nodeEnv = (globalThis as typeof globalThis & { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV;

  if (!local.children && !local["aria-label"] && nodeEnv !== "production") {
    console.warn("If no children are provided, an aria-label must be specified");
  }

  if (
    !local.role &&
    (local["aria-label"] || local["aria-labelledby"]) &&
    nodeEnv !== "production"
  ) {
    console.warn("A labelled StatusLight must have a role.");
  }

  return (
    <TextContext.Provider value={{}}>
      <div
        {...(filterDOMProps(merged, {
          labelable: !!local.role,
        }) as JSX.HTMLAttributes<HTMLDivElement>)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        role={local.role}
        class={[
          mergedUnsafeClassName(),
          wrapperStyles({ size: size(), variant: variant() }, mergedStyles()),
        ]
          .filter(Boolean)
          .join(" ")}
        style={mergedUnsafeStyle()}
      >
        <CenterBaseline>
          <svg
            class={lightStyles({ size: size(), variant: variant(), isSkeleton: isSkeleton() })}
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
