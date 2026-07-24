import {
  type JSX,
  For,
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
  fieldValue,
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
/* `success` and `warning` are accepted alias names for `positive`/`notice` — the
 * negative/warning/success status trio Button and Badge also expose — folded onto
 * the canonical channel by normalizeVariant before styling. */
type MeterVariantProp = MeterVariant | "success" | "warning";
type MeterStaticColor = "white" | "black" | "auto";
type MeterLabelPosition = "top" | "side";

function normalizeVariant(variant: MeterVariantProp | undefined): MeterVariant {
  switch (variant) {
    case "success":
      return "positive";
    case "warning":
      return "notice";
    default:
      return variant ?? "informative";
  }
}

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
  /**
   * Render the meter as this many discrete blocks instead of a continuous bar —
   * the register's `[▮▮▮▯▯]` capacity form (Panel07's focus/streak/xp/memory
   * rows, TerminalGlassLab.tsx:914-931). The value quantizes to
   * `round(fraction × segments)` filled blocks; the accessible value stays
   * continuous.
   */
  segments?: number;
  /** The visual style variant. `success`/`warning` alias `positive`/`notice`. @default 'informative' */
  variant?: MeterVariantProp;
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
  isSegmented: boolean;
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
      /* Size containment here relies on the bar row to size the grid — the
       * continuous track advertises a 208px intrinsic width (fieldInput's
       * containIntrinsicWidth). The segment row is content-sized (a handful of
       * 7px blocks), so with segments the label must contribute its own width
       * or the value overprints it. */
      top: {
        default: "inline-size",
        isSegmented: "none",
      },
    },
  },
});

const labelStyles = style<MeterStyleState>({
  ...fieldLabel(),
});

const valueStyles = style<MeterStyleState>({
  ...fieldValue(),
  gridArea: "value",
});

const trackStyles = style<MeterStyleState>({
  ...fieldInput(),
  gridArea: "bar",
  /* Containing block for the rim overlay below. wrapperStyles above is already
   * `position: "relative"`, so without this the overlay's `inset: 0` would
   * resolve against the whole component and rim the label and value rows too.
   * `zIndex: 1` below is unaffected: it already applied without positioning
   * (the track is a grid item), and it keeps applying now. */
  position: "relative",
  overflow: "hidden",
  /* Square, matching ProgressBar's track. The register's bar primitive (the XP
   * bar in design-handoff-v2/TerminalGlassLab.tsx) declares no border-radius on
   * either the track or the fill, so both compute to 0. */
  borderRadius: "none",
  backgroundColor: {
    /* The register's recessed surface: the same `var(--surface-inset)` the
     * handoff's bar track paints, and the same one ProgressBar uses. */
    default: "pasteboard",
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

/* The rim goes on its own absolutely-positioned layer rather than on trackStyles,
 * which is how the handoff paints it too (design-handoff-v2/TerminalGlassLab.tsx
 * lays an `inset: 0` / `pointer-events: none` / `box-shadow: var(--edge-glass)`
 * div over the bar's fills). The reason it cannot live on the track: an inset
 * box-shadow is painted with the element's own background, beneath every in-flow
 * descendant. `overflow: hidden` clips the fill but does not lift the track's
 * inset shadow above it, so a rim declared on the track would be occluded across
 * the filled fraction and survive only on the empty remainder — a half-rim that
 * reads as a bug. Kept local rather than shared with ProgressBar: the two have no
 * common style module today and inventing one widens a two-site fix. */
const trackRimStyles = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  borderRadius: "inherit",
  boxShadow: "edge-glass",
});

const fillStyles = style<MeterStyleState>({
  height: "full",
  borderStyle: "none",
  borderRadius: "none",
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

/* The discrete form. The register draws it as literal ▮/▯ glyphs in mono text
 * (TerminalGlassLab.tsx:918: `[▮▮▮▯▯] 3/5`); as a library primitive the blocks
 * are drawn divs at the glyph's box (7×12 — U+25AE's ink at the wells' 11.5px
 * mono), because a glyph's rendered size shifts with the consumer's font stack.
 * Filled and empty share one ink — the glyph pair differs only in fill, and the
 * register keeps channel color OFF the blocks (it lives on the row label). Here
 * the ink follows the variant so the meter still reads outside a well. No rim:
 * the blocks are marks, not a recessed surface. */
/* Static (no conditions), so the macro yields a string used directly as a
 * class — same pattern as trackRimStyles above. */
const segmentRowStyles = style({
  gridArea: "bar",
  display: "flex",
  alignItems: "center",
  columnGap: "[3px]",
});

type MeterSegmentStyleState = MeterStyleState & { isFilled: boolean };

const segmentStyles = style<MeterSegmentStyleState>({
  width: 7,
  height: 12,
  boxSizing: "border-box",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: {
    default: lightDark("informative-800", "informative-900"),
    variant: {
      positive: lightDark("positive-800", "positive-900"),
      notice: lightDark("notice-800", "notice-900"),
      negative: lightDark("negative-800", "negative-900"),
    },
    isStaticColor: "transparent-overlay-900",
    forcedColors: "ButtonText",
  },
  backgroundColor: {
    default: "transparent",
    isFilled: {
      default: lightDark("informative-800", "informative-900"),
      variant: {
        positive: lightDark("positive-800", "positive-900"),
        notice: lightDark("notice-800", "notice-900"),
        negative: lightDark("negative-800", "negative-900"),
      },
      isStaticColor: "transparent-overlay-900",
      forcedColors: "ButtonText",
    },
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
    "segments",
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
  const variant = () => normalizeVariant(local.variant);
  const labelPosition = () => local.labelPosition ?? "top";
  const isStaticColor = () => !!local.staticColor;
  const state = (labelAlign?: "start" | "end"): MeterStyleState => ({
    size: size(),
    variant: variant(),
    staticColor: local.staticColor,
    labelPosition: labelPosition(),
    labelAlign,
    isStaticColor: isStaticColor(),
    isSegmented: segmentCount() != null,
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
  const segmentCount = () => {
    const segments = local.segments;
    return segments != null && Number.isFinite(segments) && segments >= 1
      ? Math.floor(segments)
      : null;
  };
  const filledCount = createMemo(() => {
    const segments = segmentCount();
    return segments == null ? 0 : clamp(Math.round((percentage() / 100) * segments), 0, segments);
  });
  const showValue = () => !!local.label;
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);

  return (
    <div
      {...getDataAttributes(merged)}
      {...meterAria.meterProps}
      role="meter"
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
        {segmentCount() != null ? (
          <div class={segmentRowStyles} aria-hidden="true">
            <For each={Array.from({ length: segmentCount() ?? 0 })}>
              {(_, index) => (
                <div class={segmentStyles({ ...state(), isFilled: index() < filledCount() })} />
              )}
            </For>
          </div>
        ) : (
          <div class={trackStyles(state())}>
            <div class={fillStyles(state())} style={{ width: `${percentage()}%` }} />
            <div aria-hidden="true" class={trackRimStyles} />
          </div>
        )}
      </SkeletonWrapper>
    </div>
  );
}
