// Local addition — no S2 counterpart. See the JSDoc on HudFrame below.

import { type JSX, Show, splitProps } from "solid-js";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { scanDown } from "../style/motion" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides, hudBracket } from "../s2-internal/style-utils" with { type: "macro" };

/** The bracket arm length: 14px, 22px, 26px. */
export type HudFrameBrackets = "S" | "M" | "L";
/**
 * Which channel the frame reports on. `info` is the register's standing HUD blue;
 * `live` is the recording red a frame takes while it is showing something in
 * flight. (Not the CTA fuchsia `live` badges use — the register rations fuchsia to
 * one filled ask per view, and a frame around media is never that ask.)
 */
export type HudFrameChannel = "info" | "live";

export interface HudFrameProps {
  /** The bracket arm length. @default 'M' */
  brackets?: HudFrameBrackets;
  /** The channel the brackets and the sweep report on. @default 'info' */
  channel?: HudFrameChannel;
  /** Lay the CRT line grille over the content. @default false */
  scanlines?: boolean;
  /** Run a scan line down the frame. @default false */
  sweep?: boolean;
  /** The framed content. */
  children?: JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
}

const scanSweep = scanDown();

type HudFrameStyleState = {
  brackets: HudFrameBrackets;
  channel: HudFrameChannel;
};

const frameStyles = style<HudFrameStyleState>(
  {
    position: "relative",
    display: "block",
    overflow: "hidden",
    /* The overlays below are absolutely positioned children, so the frame owns a
     * stacking context of its own — otherwise a sweep escapes over a sibling. */
    isolation: "isolate",
  },
  getAllowedOverrides({ height: true }),
);

/* One ink for the brackets and the sweep, so a `live` frame cannot end up with a
 * red corner and a blue scan line. */
const inkVariable = {
  "--pv-hud-ink": {
    type: "backgroundColor",
    value: {
      default: "[var(--status-info)]",
      channel: {
        live: "[var(--status-fault)]",
      },
      forcedColors: "ButtonText",
    },
  },
} as const;

/* The corner brackets come from the shared `hudBracket` helper — eight gradient
 * marks, one per arm — so the frame, the theater and anything else that brackets a
 * surface draw the same corner. Only the arm length varies here; the colour is the
 * ink variable above. */
const bracketStyles = style<HudFrameStyleState>({
  ...inkVariable,
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 1,
  ...hudBracket({ color: "var(--pv-hud-ink)" }),
  backgroundSize: {
    brackets: {
      S: hudBracket({ size: "S" }).backgroundSize,
      M: hudBracket({ size: "M" }).backgroundSize,
      L: hudBracket({ size: "L" }).backgroundSize,
    },
  },
});

/* The CRT grille: a 1px line every 3px in `--crt-line`, which is a dark line on the
 * dark scheme and a light one on daylight — the texture, not a tint. */
const scanlineStyles = style({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  zIndex: 1,
  backgroundImage: {
    default: "[repeating-linear-gradient(var(--crt-line) 0 1px, transparent 1px 3px)]",
    forcedColors: "none",
  },
});

/* The falling scan line. Travel is `--scan-travel`, which the keyframes default to
 * the handoff's full viewport; a bounded frame sets it to its own height so the
 * line does not spend most of the loop below the frame. */
const sweepStyles = style<HudFrameStyleState>({
  ...inkVariable,
  position: "absolute",
  insetStart: 0,
  insetEnd: 0,
  top: 0,
  height: 3,
  pointerEvents: "none",
  zIndex: 1,
  "--scan-travel": {
    type: "height",
    value: "100%",
  },
  backgroundColor: "[color-mix(in srgb, var(--pv-hud-ink) 25%, transparent)]",
  animation: {
    default: scanSweep,
    "@media (prefers-reduced-motion: reduce)": "none",
  },
  animationDuration: 7000,
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
});

/**
 * A presentational HUD frame: corner brackets, an optional CRT grille and an
 * optional scan sweep over whatever it wraps.
 *
 * Local addition — no S2 counterpart. It is chrome and nothing else: the wrapper
 * takes no role, and every overlay is `aria-hidden` and `pointer-events: none`, so
 * the framed content keeps its own semantics and stays clickable.
 */
export function HudFrame(props: HudFrameProps): JSX.Element {
  const [local] = splitProps(props, [
    "brackets",
    "channel",
    "scanlines",
    "sweep",
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "id",
  ]);
  const resolvedStyles = () => (typeof local.styles === "function" ? local.styles() : local.styles);
  const state = (): HudFrameStyleState => ({
    brackets: local.brackets ?? "M",
    channel: local.channel ?? "info",
  });

  return (
    <div
      id={local.id}
      class={[local.UNSAFE_className, frameStyles(state(), resolvedStyles())]
        .filter(Boolean)
        .join(" ")}
      style={local.UNSAFE_style}
    >
      {local.children}
      <Show when={local.scanlines}>
        <div aria-hidden="true" class={scanlineStyles} />
      </Show>
      <Show when={local.sweep}>
        <div aria-hidden="true" class={sweepStyles(state())} />
      </Show>
      <div aria-hidden="true" class={bracketStyles(state())} />
    </div>
  );
}
