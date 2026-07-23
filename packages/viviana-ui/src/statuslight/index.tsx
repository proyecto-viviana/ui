import { type JSX, createContext, mergeProps, splitProps, useContext } from "solid-js";
import { filterDOMProps } from "@proyecto-viviana/solidaria";
import { CenterBaseline } from "../icon/center-baseline";
import type { StyleString } from "../style";
import { lightDark, style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  controlFont,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
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
  /* The register's metric channel — the sky-blue that replaced the retired
   * violet (`--status-metric`). Without it the fourth status channel simply
   * has no StatusLight mapping (Panel07's mirror substituted `neutral` and
   * noted "the metrics channel simply goes missing"). */
  | "metric"
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
  /* `success` and `warning` are accepted alias names for the `positive` and
   * `notice` status channels — the same negative/warning/success trio Button and
   * Badge expose — folded onto the canonical channel by normalizeVariant before
   * styling, so a consumer can name the status either way. */
  | "success"
  | "warning";
/* The style maps below only know the canonical channels; the two alias names
 * above never reach them. */
type S2StatusLightVariant = Exclude<StatusLightVariant, "success" | "warning">;
type StatusLightSize = "S" | "M" | "L" | "XL";

function normalizeVariant(variant: StatusLightVariant | undefined): S2StatusLightVariant {
  switch (variant) {
    case "success":
      return "positive";
    case "warning":
      return "notice";
    default:
      return variant ?? "neutral";
  }
}

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
  variant: S2StatusLightVariant;
}>(
  {
    display: "flex",
    gap: "text-to-visual",
    alignItems: "baseline",
    width: "fit",
    font: controlFont(),
    /* Register ink-toning: the wells paint the MESSAGE in the channel ink, not
     * just the dot (Panel07's status rows have no dot at all — the text IS the
     * light). A library StatusLight keeps the dot, but the semantic channels
     * tone the label to match; the same 800/900 pairs Meter's fill uses, so
     * text stays AA on both surfaces. Decorative palette variants keep the
     * neutral label — they are categories, not statuses. */
    color: {
      default: "neutral",
      variant: {
        neutral: "gray-600",
        informative: lightDark("informative-800", "informative-900"),
        positive: lightDark("positive-800", "positive-900"),
        notice: lightDark("notice-800", "notice-900"),
        negative: lightDark("negative-800", "negative-900"),
        metric: "[var(--status-metric)]",
      },
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const lightStyles = style<{
  size: StatusLightSize;
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
      metric: "[var(--status-metric)]",
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
    isSkeleton: "gray-200",
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
  const variant = () => normalizeVariant(local.variant);
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
