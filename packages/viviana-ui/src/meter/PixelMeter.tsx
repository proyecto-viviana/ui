// Local addition — no S2 counterpart. See the JSDoc on PixelMeter below.

import { type JSX, For, Show, createMemo, splitProps } from "solid-js";
import {
  Label as HeadlessLabel,
  Meter as HeadlessMeter,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { tglRingBlink } from "../style/motion" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import type { RefLike } from "../button/spectrum-context";

/** The three pixel forms the register draws a measurement in. */
export type PixelMeterShape = "row" | "ring" | "grid";
/** The register's four status channels; the ink the lit cells take. */
export type PixelMeterChannel = "info" | "signal" | "metric" | "fault";
/**
 * How many ink strengths the cells use, counting the unlit rest state: `2` is
 * rest + full (the streak row), `4` is the activity map's rest + three heats.
 */
export type PixelMeterLevels = 2 | 3 | 4;

export interface PixelMeterProps {
  /** Which pixel form to draw. @default 'row' */
  shape?: PixelMeterShape;
  /** The current value (controlled). @default 0 */
  value?: number;
  /**
   * The largest value allowed. In `row` it also sets the block count (the streak
   * length), clamped to 64. `ring` is always 16 blocks and `grid` always 26 × 7.
   * @default 14 for `row`, 16 for `ring`, 182 for `grid`
   */
  maxValue?: number;
  /**
   * The number of ink strengths, rest included.
   * @default 2 for `row` and `ring`, 4 for `grid`
   */
  levels?: PixelMeterLevels;
  /** The status channel the lit cells take their ink from. @default 'info' */
  channel?: PixelMeterChannel;
  /** The meter's visible label, and its accessible name. `ring` centres it. */
  label?: JSX.Element;
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

/* Geometry. The handoff draws the ring as 16 blocks on a circle, not as an arc —
 * the same construction ProgressCircle's L ring uses (6px blocks, radius 26, in a
 * 64px box), computed once at module load so server and client agree. */
const RING_COUNT = 16;
const RING_BOX = 64;
const RING_RADIUS = 26;
const RING_BLOCK = 6;
const GRID_COLUMNS = 26;
const GRID_ROWS = 7;
const GRID_COUNT = GRID_COLUMNS * GRID_ROWS;
const ROW_DEFAULT_MAX = 14;
const ROW_MAX_BLOCKS = 64;

const RING_POSITIONS = Array.from({ length: RING_COUNT }, (_, i) => {
  const a = (i / RING_COUNT) * Math.PI * 2 - Math.PI / 2;
  return {
    x: Math.round(RING_BOX / 2 + RING_RADIUS * Math.cos(a) - RING_BLOCK / 2),
    y: Math.round(RING_BOX / 2 + RING_RADIUS * Math.sin(a) - RING_BLOCK / 2),
  };
});

/* The register's ring chase, shared through style/motion.ts (2.6s, step-end,
 * staggered 0.16s per block) so it cannot drift from ProgressCircle's ring. */
const ringBlink = tglRingBlink();

type CellInk = "rest" | "low" | "mid" | "full";

type PixelMeterStyleState = {
  shape: PixelMeterShape;
  channel: PixelMeterChannel;
};

type CellStyleState = PixelMeterStyleState & {
  ink: CellInk;
  isLead: boolean;
};

const wrapperStyles = style<PixelMeterStyleState>(
  {
    display: "flex",
    flexDirection: "column",
    rowGap: 4,
    alignItems: "start",
    width: "fit",
    /* Containing block for the ring's centred label, which must stay OUTSIDE the
     * aria-hidden cell container: it is the meter's <label>, and burying a
     * labelledby target in a hidden subtree is how an accessible name goes empty. */
    position: {
      shape: {
        ring: "relative",
      },
    },
  },
  getAllowedOverrides(),
);

/* One ink source for every cell, so a channel change is a single custom-property
 * swap instead of four duplicated colour conditions per level. The four values are
 * the register's status channels — the same tokens a StatusLight dot and a log line
 * report with, so a metric meter can never drift into a different cyan. */
const fieldStyles = style<PixelMeterStyleState>({
  "--pv-pixel-ink": {
    type: "backgroundColor",
    value: {
      default: "[var(--status-info)]",
      channel: {
        signal: "[var(--status-signal)]",
        metric: "[var(--status-metric)]",
        fault: "[var(--status-fault)]",
      },
      forcedColors: "ButtonText",
    },
  },
  display: {
    shape: {
      row: "flex",
      ring: "block",
      grid: "grid",
    },
  },
  alignItems: {
    shape: {
      row: "center",
    },
  },
  columnGap: {
    shape: {
      row: "[3px]",
      grid: "[4px]",
    },
  },
  rowGap: {
    shape: {
      grid: "[4px]",
    },
  },
  gridTemplateColumns: {
    shape: {
      grid: "[repeat(26, 1fr)]",
    },
  },
  gridAutoRows: {
    shape: {
      grid: "[16px]",
    },
  },
  width: {
    shape: {
      ring: 64,
      grid: "full",
    },
  },
  height: {
    shape: {
      ring: 64,
    },
  },
});

const cellStyles = style<CellStyleState>({
  boxSizing: "border-box",
  position: {
    shape: {
      ring: "absolute",
    },
  },
  width: {
    shape: {
      row: 10,
      ring: 6,
      grid: "full",
    },
  },
  height: {
    shape: {
      row: 10,
      ring: 6,
      grid: "full",
    },
  },
  /* Rest is the register's hairline, not a dim tint of the channel: an unlit cell
   * reports "nothing here", and tinting it with the channel makes an empty meter
   * read as a very low reading. The lit strengths are the handoff's activity ramp
   * (28% / 62% / full), mixed off the one ink property above. */
  backgroundColor: {
    ink: {
      rest: "[var(--border-subtle)]",
      low: "[color-mix(in srgb, var(--pv-pixel-ink) 28%, transparent)]",
      mid: "[color-mix(in srgb, var(--pv-pixel-ink) 62%, transparent)]",
      full: "[var(--pv-pixel-ink)]",
    },
    isLead: "transparent",
    forcedColors: {
      ink: {
        rest: "Background",
        low: "ButtonText",
        mid: "ButtonText",
        full: "ButtonText",
      },
    },
  },
  /* The leading edge is the one cell in flight: the register's ordered dither, a
   * conic checker at 3px, so the surface shows through its off quarters. */
  backgroundImage: {
    isLead: "[repeating-conic-gradient(var(--pv-pixel-ink) 0% 25%, transparent 0% 50%)]",
    forcedColors: "none",
  },
  backgroundSize: {
    isLead: "[3px 3px]",
  },
  boxShadow: "edge-glass",
  /* Only the ring blinks — a chase around a circle reads as live work; the same
   * blink on a 182-cell map is a strobe. Gate is the CSS media condition, never a
   * runtime matchMedia read: Solid hydration trusts the server DOM (see Badge). */
  animation: {
    shape: {
      ring: {
        default: ringBlink,
        "@media (prefers-reduced-motion: reduce)": "none",
      },
    },
  },
  animationDuration: {
    shape: {
      ring: 2600,
    },
  },
  animationTimingFunction: {
    shape: {
      ring: "[step-end]",
    },
  },
  animationIterationCount: {
    shape: {
      ring: "infinite",
    },
  },
});

const labelStyles = style({
  font: "ui-sm",
  color: "neutral",
});

/* The ring's label sits in the hole, which is where the register puts the readout;
 * it is the same <label> element, only positioned. */
const ringLabelStyles = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  font: "title-xs",
  color: "neutral",
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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

/**
 * A meter drawn as discrete pixel cells — the register's streak row, pixel ring
 * and activity map — instead of a continuous bar.
 *
 * Local addition — no S2 counterpart. It wraps the same headless Meter as
 * {@link Meter}, so the root keeps `role="meter"` with `aria-valuenow`/`min`/`max`
 * and an accessible name from `label`; the cells are decoration and are hidden
 * from assistive technology.
 *
 * The fill rule is one rule in all three shapes: the value quantizes to a lit cell
 * count, the cells before the boundary are lit (fading over the last `levels - 1`
 * of them), the cell at the boundary is the dithered leading edge, and the rest sit
 * on the hairline.
 */
export function PixelMeter(props: PixelMeterProps): JSX.Element {
  const [local] = splitProps(props, [
    "shape",
    "value",
    "maxValue",
    "levels",
    "channel",
    "label",
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
  const shape = () => local.shape ?? "row";
  const channel = () => local.channel ?? "info";
  const state = (): PixelMeterStyleState => ({ shape: shape(), channel: channel() });
  const cellCount = createMemo(() => {
    switch (shape()) {
      case "ring":
        return RING_COUNT;
      case "grid":
        return GRID_COUNT;
      default: {
        const max = local.maxValue ?? ROW_DEFAULT_MAX;
        return Number.isFinite(max) && max >= 1
          ? clamp(Math.round(max), 1, ROW_MAX_BLOCKS)
          : ROW_DEFAULT_MAX;
      }
    }
  });
  const maxValue = () => {
    if (local.maxValue != null) return local.maxValue;
    return shape() === "row" ? ROW_DEFAULT_MAX : cellCount();
  };
  const levels = (): PixelMeterLevels => local.levels ?? (shape() === "grid" ? 4 : 2);
  const litCount = (percentage: number) =>
    clamp(Math.round((percentage / 100) * cellCount()), 0, cellCount());
  /* Depth back from the boundary picks the strength: the last lit cell is the
   * dimmest available one, and everything `levels - 1` cells or further back is
   * full. With `levels` 2 there is no partial strength and every lit cell is full,
   * which is exactly the streak row. */
  const inkFor = (index: number, lit: number): CellInk => {
    if (index >= lit) return "rest";
    const depth = lit - index;
    const strengths: CellInk[] =
      levels() === 4 ? ["low", "mid", "full"] : levels() === 3 ? ["mid", "full"] : ["full"];
    return strengths[Math.min(depth, strengths.length) - 1]!;
  };
  const isLead = (index: number, lit: number) => index === lit && lit > 0 && lit < cellCount();
  const resolvedStyles = () => (typeof local.styles === "function" ? local.styles() : local.styles);

  return (
    <HeadlessMeter
      {...getDataAttributes(props)}
      id={local.id}
      value={local.value}
      maxValue={maxValue()}
      aria-label={local["aria-label"]}
      aria-labelledby={local["aria-labelledby"]}
      aria-describedby={local["aria-describedby"]}
      aria-details={local["aria-details"]}
      ref={local.ref}
      class={[local.UNSAFE_className, wrapperStyles(state(), resolvedStyles())]
        .filter(Boolean)
        .join(" ")}
      style={local.UNSAFE_style}
      slot={local.slot ?? undefined}
    >
      {({ percentage }) => (
        <>
          <Show when={shape() !== "ring" && local.label != null}>
            <HeadlessLabel class={labelStyles}>{local.label}</HeadlessLabel>
          </Show>
          <div class={fieldStyles(state())} aria-hidden="true">
            <For each={Array.from({ length: cellCount() })}>
              {(_, index) => {
                const lit = () => litCount(percentage);
                const position = () =>
                  shape() === "ring" ? RING_POSITIONS[index() % RING_COUNT]! : undefined;
                return (
                  <div
                    class={cellStyles({
                      ...state(),
                      ink: inkFor(index(), lit()),
                      isLead: isLead(index(), lit()),
                    })}
                    style={
                      shape() === "ring"
                        ? {
                            left: `${position()!.x}px`,
                            top: `${position()!.y}px`,
                            /* The handoff's stagger: i × 0.16s inside the 2.6s
                             * loop. Inert once the media gate zeroes the name. */
                            "animation-delay": `${(index() * 0.16).toFixed(2)}s`,
                          }
                        : undefined
                    }
                  />
                );
              }}
            </For>
          </div>
          <Show when={shape() === "ring" && local.label != null}>
            <HeadlessLabel class={ringLabelStyles}>{local.label}</HeadlessLabel>
          </Show>
        </>
      )}
    </HeadlessMeter>
  );
}
