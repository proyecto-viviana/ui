import { type JSX, createContext, createMemo, mergeProps, splitProps, useContext } from "solid-js";
import { createProgressBar } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  getAllowedOverrides,
  staticColor as staticColorStyles,
} from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { s2ProgressCircleIndeterminateAnimation } from "./progress-circle-animation";

export type ProgressCircleSize = "S" | "M" | "L";
export type ProgressCircleStaticColor = "white" | "black" | "auto";

export interface ProgressCircleProps {
  /** The current value. @default 0 */
  value?: number;
  /** The smallest value allowed. @default 0 */
  minValue?: number;
  /** The largest value allowed. @default 100 */
  maxValue?: number;
  /** Whether presentation is indeterminate. */
  isIndeterminate?: boolean;
  /** The size of the progress circle. @default 'M' */
  size?: ProgressCircleSize;
  /** The static color style to apply over a color background. */
  staticColor?: ProgressCircleStaticColor;
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

export const ProgressCircleContext = createContext<SpectrumContextValue<ProgressCircleProps>>(null);

type ProgressCircleStyleState = {
  size: ProgressCircleSize;
  staticColor?: ProgressCircleStaticColor;
  isStaticColor: boolean;
};

const wrapperStyles = style<ProgressCircleStyleState>(
  {
    ...staticColorStyles(),
    size: {
      default: 32,
      size: {
        S: 16,
        L: 64,
      },
    },
    aspectRatio: "square",
  },
  getAllowedOverrides({ height: true }),
);

const trackStyles = style<ProgressCircleStyleState>({
  stroke: {
    default: "gray-300",
    isStaticColor: "transparent-overlay-300",
    forcedColors: "Background",
  },
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
    forcedColors: {
      default: "[0.125rem]",
      size: {
        S: "[0.0625rem]",
        L: "[0.1875rem]",
      },
    },
  },
});

const fillStyles = style<ProgressCircleStyleState>({
  stroke: {
    default: "blue-900",
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
  rotate: -90,
  transformOrigin: "center",
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
  },
});

const hcmStrokeStyles = style<ProgressCircleStyleState>({
  stroke: {
    default: "transparent",
    forcedColors: "ButtonText",
  },
  strokeWidth: {
    default: "[0.1875rem]",
    size: {
      S: "[0.125rem]",
      L: "[0.25rem]",
    },
  },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

function radiusForSize(size: ProgressCircleSize): string {
  if (size === "S") {
    return "calc(50% - 0.0625rem)";
  }
  if (size === "L") {
    return "calc(50% - 0.125rem)";
  }
  return "calc(50% - 0.09375rem)";
}

function getDataAttributes(source: object): JSX.HTMLAttributes<HTMLDivElement> {
  const record = source as Record<string, unknown>;
  const attributes: Record<string, string | undefined> = {};

  for (const key in record) {
    if (key.startsWith("data-")) {
      const value = record[key];
      attributes[key] = value == null ? undefined : String(value);
    }
  }

  return attributes as JSX.HTMLAttributes<HTMLDivElement>;
}

export function ProgressCircle(props: ProgressCircleProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ProgressCircleContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as ProgressCircleProps;
  const [local] = splitProps(merged, [
    "value",
    "minValue",
    "maxValue",
    "isIndeterminate",
    "size",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
  ]);
  const size = () => local.size ?? "M";
  const isIndeterminate = () => local.isIndeterminate ?? false;
  const isStaticColor = () => !!local.staticColor;
  const state = (): ProgressCircleStyleState => ({
    size: size(),
    staticColor: local.staticColor,
    isStaticColor: isStaticColor(),
  });
  const progressAria = createProgressBar({
    get id() {
      return local.id;
    },
    get value() {
      return local.value;
    },
    get minValue() {
      return local.minValue;
    },
    get maxValue() {
      return local.maxValue;
    },
    get isIndeterminate() {
      return isIndeterminate();
    },
    get "aria-label"() {
      return local["aria-label"];
    },
    get "aria-labelledby"() {
      return local["aria-labelledby"];
    },
    get "aria-describedby"() {
      return local["aria-describedby"];
    },
    get "aria-details"() {
      return local["aria-details"];
    },
  });
  const percentage = createMemo(() => {
    const minValue = local.minValue ?? 0;
    const maxValue = local.maxValue ?? 100;
    const value = clamp(local.value ?? 0, minValue, maxValue);
    return ((value - minValue) / safeRange(minValue, maxValue)) * 100;
  });
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <div
      {...getDataAttributes(merged)}
      {...progressAria.progressBarProps}
      data-rac=""
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
        props.ref,
      )}
      class={[local.UNSAFE_className, wrapperStyles(state(), mergedStyles())]
        .filter(Boolean)
        .join(" ")}
      style={mergedUnsafeStyle()}
      slot={local.slot ?? undefined}
    >
      <svg fill="none" width="100%" height="100%">
        <circle cx="50%" cy="50%" r={radiusForSize(size())} class={hcmStrokeStyles(state())} />
        <circle cx="50%" cy="50%" r={radiusForSize(size())} class={trackStyles(state())} />
        <circle
          cx="50%"
          cy="50%"
          r={radiusForSize(size())}
          class={fillStyles(state())}
          style={{
            animation: isIndeterminate() ? s2ProgressCircleIndeterminateAnimation : undefined,
          }}
          pathLength="100"
          stroke-dasharray="100 200"
          stroke-dashoffset={isIndeterminate() ? undefined : String(100 - percentage())}
          stroke-linecap="round"
        />
      </svg>
    </div>
  );
}
