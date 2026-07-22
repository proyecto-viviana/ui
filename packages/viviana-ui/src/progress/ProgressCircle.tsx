import {
  type JSX,
  For,
  createContext,
  createMemo,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { createProgressBar } from "@proyecto-viviana/solidaria";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { keyframes } from "../style/style-macro" with { type: "macro" };
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
  /**
   * Content centered inside the ring — the register composes a headline count
   * over the pixel ring (TerminalGlassLab.tsx:640-662: "3/5" over "FOCUS").
   * Purely visual; the accessible value stays on the progressbar attributes.
   */
  children?: JSX.Element;
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

type RingBlockStyleState = ProgressCircleStyleState & {
  isLit: boolean;
  isLead: boolean;
  isIndeterminate: boolean;
};

/* The register's ring is not an arc — it is 16 discrete pixel blocks on a circle
 * (PIX_RING, TerminalGlassLab.tsx:74-90): lit blocks in the accent, the two at the
 * leading edge on a checker dither, the remainder recessed on the inset surface,
 * every block beveled with the edge-glass rim. Geometry is pure trig computed once
 * at module load, exactly like the spec (deterministic, so it is SSR-safe). The
 * spec's single instance is 7px blocks at radius 31 in a 76px box; each size here
 * keeps those proportions inside the existing S/M/L = 16/32/64 footprints. */
const RING_COUNT = 16;

interface RingGeometry {
  block: number;
  positions: { x: number; y: number }[];
}

function ringGeometry(container: number, radius: number, block: number): RingGeometry {
  return {
    block,
    positions: Array.from({ length: RING_COUNT }, (_, i) => {
      const a = (i / RING_COUNT) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.round(container / 2 + radius * Math.cos(a) - block / 2),
        y: Math.round(container / 2 + radius * Math.sin(a) - block / 2),
      };
    }),
  };
}

const RING_GEOMETRY: Record<ProgressCircleSize, RingGeometry> = {
  S: ringGeometry(16, 7, 2),
  M: ringGeometry(32, 13, 3),
  L: ringGeometry(64, 26, 6),
};

/* The spec's glxRingBlink (glasselated.css:325-335): each lit block snaps from
 * 15% to full opacity early in a 2.6s loop, step-end, staggered 0.16s per block —
 * a clockwise chase. Determinate rings gate it on prefers-reduced-motion (the
 * blink is decoration; the lit count carries the value). Indeterminate rings keep
 * it unconditionally: there the chase IS the "something is happening" signal, and
 * a frozen full ring would read as 100%. Gate is the CSS media condition, not a
 * runtime matchMedia check — Solid hydration trusts the server DOM (see Badge). */
const ringBlink = keyframes(`
  0% {
    opacity: 0.15;
  }

  12% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
`);

const wrapperStyles = style<ProgressCircleStyleState>(
  {
    ...staticColorStyles(),
    position: "relative",
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

const blockStyles = style<RingBlockStyleState>({
  position: "absolute",
  size: {
    default: 3,
    size: {
      S: 2,
      L: 6,
    },
  },
  backgroundColor: {
    /* Unlit blocks recess into the same inset surface as the linear track
     * (`pasteboard` carries `var(--surface-inset)` — see the note that was on the
     * old arc's trackStyles). Lead blocks go transparent so only their dither
     * paints, exactly like the spec's blocks whose checker shows the panel
     * through its off quarters. */
    default: "pasteboard",
    isLit: "accent",
    isLead: "transparent",
    isStaticColor: {
      default: "transparent-overlay-300",
      isLit: "transparent-overlay-900",
      isLead: "transparent",
    },
    forcedColors: {
      default: "Background",
      isLit: "ButtonText",
    },
  },
  /* The leading-edge dither: the register's one ordered-dither recipe,
   * repeating-conic checker at half the block's own size (3.5px tile on the
   * spec's 7px block = 2×2 sub-cells; scaled per size here). */
  backgroundImage: {
    isLead: "[repeating-conic-gradient(var(--pv-ring-fill) 0% 25%, transparent 0% 50%)]",
  },
  backgroundSize: {
    size: {
      S: "[1px 1px]",
      M: "[1.5px 1.5px]",
      L: "[3px 3px]",
    },
  },
  boxShadow: "edge-glass",
  animation: {
    isLit: {
      default: ringBlink,
      "@media (prefers-reduced-motion: reduce)": "none",
    },
    isIndeterminate: ringBlink,
  },
  animationDuration: {
    isLit: 2600,
  },
  animationTimingFunction: {
    isLit: "[step-end]",
  },
  animationIterationCount: {
    isLit: "infinite",
  },
  "--pv-ring-fill": {
    type: "backgroundColor",
    value: {
      default: "accent",
      isStaticColor: "transparent-overlay-900",
      forcedColors: "ButtonText",
    },
  },
});

const centerStyles = style({
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
});

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function safeRange(min: number, max: number): number {
  const range = max - min;
  return Number.isFinite(range) && range > 0 ? range : 1;
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
    "children",
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
  /* Value → block quantization. Indeterminate lights the whole ring and lets the
   * staggered blink chase around it. The spec's hardcoded 10-lit/2-dithered split
   * is generalized: the last two lit blocks dither while the ring is partial
   * (work in flight has a leading edge; a full or empty ring has none). */
  const litCount = createMemo(() =>
    isIndeterminate()
      ? RING_COUNT
      : clamp(Math.round((percentage() / 100) * RING_COUNT), 0, RING_COUNT),
  );
  const geometry = () => RING_GEOMETRY[size()];
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
      <For each={geometry().positions}>
        {(position, index) => {
          const isLit = () => index() < litCount();
          const isLead = () =>
            !isIndeterminate() &&
            litCount() > 0 &&
            litCount() < RING_COUNT &&
            isLit() &&
            index() >= litCount() - 2;
          return (
            <div
              aria-hidden="true"
              class={blockStyles({
                ...state(),
                isLit: isLit(),
                isLead: isLead(),
                isIndeterminate: isIndeterminate(),
              })}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                /* The spec's stagger: i × 0.16s inside the 2.6s loop. Inert when
                 * the media gate zeroes the animation-name. */
                "animation-delay": isLit() ? `${(index() * 0.16).toFixed(2)}s` : undefined,
              }}
            />
          );
        }}
      </For>
      {/* Read `children` exactly once per run — a repeated getter read
        * re-instantiates the subtree and desyncs hydration keys. */}
      {(() => {
        const content = local.children;
        return content != null ? <div class={centerStyles}>{content}</div> : undefined;
      })()}
    </div>
  );
}
