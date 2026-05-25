import {
  type JSX,
  createContext,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { createProgressBar, useLocale } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { keyframes } from "../style/style-macro" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import {
  centerPadding,
  controlSize,
  fieldInput,
  fieldLabel,
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

export type ProgressBarSize = "S" | "M" | "L" | "XL";
export type ProgressBarStaticColor = "white" | "black" | "auto";
export type ProgressBarLabelPosition = "top" | "side";

export interface ProgressBarProps {
  /** The current value. @default 0 */
  value?: number;
  /** The smallest value allowed. @default 0 */
  minValue?: number;
  /** The largest value allowed. @default 100 */
  maxValue?: number;
  /** The content to display as the value's label, e.g. "1 of 4". */
  valueLabel?: JSX.Element;
  /** Whether presentation is indeterminate when progress isn't known. */
  isIndeterminate?: boolean;
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions;
  /** The size of the progress bar. @default 'M' */
  size?: ProgressBarSize;
  /** The label to display above or beside the progress bar. */
  label?: JSX.Element;
  /** The static color style to apply over a color background. */
  staticColor?: ProgressBarStaticColor;
  /** The label's overall position relative to the progress bar. @default 'top' */
  labelPosition?: ProgressBarLabelPosition;
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

export const ProgressBarContext = createContext<SpectrumContextValue<ProgressBarProps>>(null);

type ProgressBarStyleState = {
  size: ProgressBarSize;
  staticColor?: ProgressBarStaticColor;
  labelPosition: ProgressBarLabelPosition;
  labelAlign?: "start" | "end";
  isStaticColor: boolean;
  isIndeterminate: boolean;
};

const progressBarIndeterminateLtr = keyframes(`
  0% {
    transform: translateX(-70%) scaleX(0.7);
  }

  100% {
    transform: translateX(100%) scaleX(0.7);
  }
`);

const progressBarIndeterminateRtl = keyframes(`
  0% {
    transform: translateX(70%) scaleX(0.7);
  }

  100% {
    transform: translateX(-100%) scaleX(0.7);
  }
`);

const wrapperStyles = style<ProgressBarStyleState>(
  {
    ...staticColorStyles(),
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      default: {
        labelPosition: {
          top: ["1fr", "auto"],
          side: ["auto", "1fr", "auto"],
        },
      },
      isIndeterminate: {
        labelPosition: {
          top: ["1fr"],
          side: ["auto", "1fr"],
        },
      },
    },
    gridTemplateAreas: {
      default: {
        labelPosition: {
          top: ["label value", "bar bar"],
          side: ["label bar value"],
        },
      },
      isIndeterminate: {
        labelPosition: {
          top: ["label", "bar"],
          side: ["label bar"],
        },
      },
    },
    alignItems: "baseline",
    isolation: "isolate",
    minWidth: 48,
    maxWidth: 768,
    "--field-height": {
      type: "height",
      value: controlSize(),
    },
    "--track-to-label": {
      type: "height",
      value: 4,
    },
    "--field-gap": {
      type: "rowGap",
      value: centerPadding("calc(var(--field-height) + var(--track-to-label))"),
    },
    columnGap: 12,
  },
  getAllowedOverrides(),
);

const labelWrapperStyles = style<ProgressBarStyleState>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
  },
});

const labelStyles = style<ProgressBarStyleState>({
  ...fieldLabel(),
});

const valueStyles = style<ProgressBarStyleState>({
  ...fieldLabel(),
  gridArea: "value",
});

const trackStyles = style<ProgressBarStyleState>({
  ...fieldInput(),
  gridArea: "bar",
  overflow: "hidden",
  borderRadius: "full",
  backgroundColor: {
    default: "gray-300",
    isStaticColor: "transparent-overlay-300",
    forcedColors: "ButtonFace",
  },
  outlineWidth: {
    default: 0,
    forcedColors: 1,
  },
  outlineStyle: {
    default: "none",
    forcedColors: "solid",
  },
  outlineColor: {
    default: "transparent",
    forcedColors: "ButtonText",
  },
  zIndex: 1,
  height: {
    default: 6,
    size: {
      S: 4,
      M: 6,
      L: 8,
      XL: 10,
    },
  },
});

const fillStyles = style<ProgressBarStyleState>({
  width: "full",
  height: "full",
  borderStyle: "none",
  borderRadius: "full",
  backgroundColor: {
    default: "accent",
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
  transformOrigin: "left",
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
}

function stringValueLabel(value: JSX.Element | undefined): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
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

function indeterminateAnimation(direction: "ltr" | "rtl" | string): string {
  const keyframe = direction === "rtl" ? progressBarIndeterminateRtl : progressBarIndeterminateLtr;
  return `${keyframe} 1000ms cubic-bezier(.37, 0, .63, 1) infinite`;
}

export function ProgressBar(props: ProgressBarProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ProgressBarContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as ProgressBarProps;
  const [local] = splitProps(merged, [
    "value",
    "minValue",
    "maxValue",
    "valueLabel",
    "isIndeterminate",
    "formatOptions",
    "size",
    "label",
    "staticColor",
    "labelPosition",
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
  const locale = useLocale();
  const labelId = createUniqueId();
  const size = () => local.size ?? "M";
  const labelPosition = () => local.labelPosition ?? "top";
  const isIndeterminate = () => local.isIndeterminate ?? false;
  const isStaticColor = () => !!local.staticColor;
  const state = (labelAlign?: "start" | "end"): ProgressBarStyleState => ({
    size: size(),
    staticColor: local.staticColor,
    labelPosition: labelPosition(),
    labelAlign,
    isStaticColor: isStaticColor(),
    isIndeterminate: isIndeterminate(),
  });
  const accessibleLabelledBy = () =>
    local["aria-labelledby"] ?? (!local["aria-label"] && local.label ? labelId : undefined);

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
    get valueLabel() {
      return stringValueLabel(local.valueLabel);
    },
    get isIndeterminate() {
      return isIndeterminate();
    },
    get formatOptions() {
      return local.formatOptions;
    },
    get "aria-label"() {
      return local["aria-label"];
    },
    get "aria-labelledby"() {
      return accessibleLabelledBy();
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
  const valueText = () =>
    local.valueLabel ?? (progressAria.progressBarProps["aria-valuetext"] as string | undefined);
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
      {local.label && (
        <div class={labelWrapperStyles(state("start"))}>
          <span id={labelId} class={labelStyles(state("start"))}>
            {local.label}
          </span>
        </div>
      )}
      {local.label && !isIndeterminate() && (
        <span class={valueStyles(state("end"))}>{valueText()}</span>
      )}
      <div class={trackStyles(state())}>
        <div
          class={fillStyles(state())}
          style={{
            width: isIndeterminate() ? undefined : `${percentage()}%`,
            animation: isIndeterminate() ? indeterminateAnimation(locale().direction) : undefined,
          }}
        />
      </div>
    </div>
  );
}
