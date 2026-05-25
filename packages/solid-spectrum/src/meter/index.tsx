import {
  type JSX,
  createContext,
  createMemo,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { createMeter } from "@proyecto-viviana/solidaria";
import { SkeletonWrapper } from "../skeleton";
import { Text } from "../text";
import type { StyleString } from "../style";
import { lightDark, style } from "../style" with { type: "macro" };
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

type MeterSize = "S" | "M" | "L" | "XL";
type MeterVariant = "informative" | "positive" | "notice" | "negative";
type MeterStaticColor = "white" | "black" | "auto";
type MeterLabelPosition = "top" | "side";

export interface MeterProps {
  /** The current value (controlled). @default 0 */
  value?: number;
  /** The smallest value allowed. @default 0 */
  minValue?: number;
  /** The largest value allowed. @default 100 */
  maxValue?: number;
  /** The content to display as the value's label (e.g. "75 GB"). */
  valueLabel?: JSX.Element;
  /** The display format of the value label. */
  formatOptions?: Intl.NumberFormatOptions;
  /** The size of the meter. @default 'M' */
  size?: MeterSize;
  /** The visual style variant. @default 'informative' */
  variant?: MeterVariant;
  /** The label to display above the meter. */
  label?: JSX.Element;
  /** The static color style to apply over a color background. */
  staticColor?: MeterStaticColor;
  /** The label's overall position relative to the meter. @default 'top' */
  labelPosition?: MeterLabelPosition;
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

export const MeterContext = createContext<SpectrumContextValue<MeterProps>>(null);

type MeterStyleState = {
  size: MeterSize;
  variant: MeterVariant;
  staticColor?: MeterStaticColor;
  labelPosition: MeterLabelPosition;
  labelAlign?: "start" | "end";
  isStaticColor: boolean;
};

const wrapperStyles = style<MeterStyleState>(
  {
    ...staticColorStyles(),
    position: "relative",
    display: "grid",
    gridTemplateColumns: {
      labelPosition: {
        top: ["1fr", "auto"],
        side: ["auto", "1fr"],
      },
    },
    gridTemplateAreas: {
      labelPosition: {
        top: ["label value", "bar bar"],
        side: ["label bar value"],
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

const labelWrapperStyles = style<MeterStyleState>({
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

const labelStyles = style<MeterStyleState>({
  ...fieldLabel(),
});

const valueStyles = style<MeterStyleState>({
  ...fieldLabel(),
  gridArea: "value",
});

const trackStyles = style<MeterStyleState>({
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

const fillStyles = style<MeterStyleState>({
  height: "full",
  borderStyle: "none",
  borderRadius: "full",
  backgroundColor: {
    default: lightDark("informative-800", "informative-900"),
    variant: {
      positive: lightDark("positive-800", "positive-900"),
      notice: lightDark("notice-800", "notice-900"),
      negative: lightDark("negative-800", "negative-900"),
    },
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

export function Meter(props: MeterProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(MeterContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as MeterProps & {
    class?: string;
    role?: string;
    style?: JSX.CSSProperties;
    showValueLabel?: boolean;
    children?: JSX.Element;
  };
  const [local] = splitProps(merged, [
    "value",
    "minValue",
    "maxValue",
    "valueLabel",
    "formatOptions",
    "size",
    "variant",
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
    "class",
    "role",
    "style",
    "showValueLabel",
    "children",
  ]);
  const labelId = createUniqueId();
  const size = () => local.size ?? "M";
  const variant = () => local.variant ?? "informative";
  const labelPosition = () => local.labelPosition ?? "top";
  const isStaticColor = () => !!local.staticColor;
  const state = (labelAlign?: "start" | "end"): MeterStyleState => ({
    size: size(),
    variant: variant(),
    staticColor: local.staticColor,
    labelPosition: labelPosition(),
    labelAlign,
    isStaticColor: isStaticColor(),
  });
  const accessibleLabelledBy = () =>
    local["aria-labelledby"] ?? (!local["aria-label"] && local.label ? labelId : undefined);

  const meterAria = createMeter({
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
    return ((value - minValue) / (maxValue - minValue)) * 100;
  });
  const valueText = () =>
    local.valueLabel ?? (meterAria.meterProps["aria-valuetext"] as string | undefined);
  const showValue = () => !!local.label;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <div
      {...getDataAttributes(merged)}
      {...meterAria.meterProps}
      role={"meter progressbar" as never}
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
      {showValue() && <Text styles={valueStyles(state("end"))}>{valueText()}</Text>}
      <SkeletonWrapper>
        <div class={trackStyles(state())}>
          <div class={fillStyles(state())} style={{ width: `${percentage()}%` }} />
        </div>
      </SkeletonWrapper>
    </div>
  );
}
