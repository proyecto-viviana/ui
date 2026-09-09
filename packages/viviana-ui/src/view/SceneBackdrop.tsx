// Local addition — no S2 counterpart. See the JSDoc on SceneBackdrop below.

import { type JSX, For, Show, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };
import { css } from "../style/style-macro" with { type: "macro" };
import { scanDown } from "../style/motion" with { type: "macro" };
import type { UnsafeClassName } from "../s2-internal/style-utils";

export interface SceneBackdropProps {
  /** The scene image. Omit it to keep only the generated layers. */
  src?: string;
  /** Darken the scene under the content with the register's veil. @default true */
  veil?: boolean;
  /** Run a scan line down the scene. @default false */
  sweep?: boolean;
  /** Draw the pixel skyline along the horizon. @default false */
  skyline?: boolean;
  /** Draw the perspective floor grid. @default false */
  grid?: boolean;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  id?: string;
}

/* The handoff's skyline seed: 40 building heights in px, fixed rather than random
 * so the server and the client draw the same city (Solid hydration trusts the
 * server DOM — a random skyline would mismatch on every load). */
const SKYLINE = [
  38, 62, 44, 90, 70, 52, 120, 84, 60, 140, 96, 72, 110, 58, 130, 88, 66, 150, 104, 78, 48, 124, 92,
  64, 136, 100, 70, 116, 82, 54, 128, 94, 68, 142, 108, 76, 50, 118, 86, 60,
] as const;

const scanSweep = scanDown();

const rootStyles = style({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

const layerStyles = style({
  position: "absolute",
  inset: 0,
});

/* Escape hatch: `filter` is a token map in the S2 theme (drop-shadow presets only)
 * and `image-rendering` is not a theme property at all, so the scene's own
 * treatment — the register's `--scene-filter` grade plus nearest-neighbour scaling,
 * the "pixelated" half of Glasselated — cannot be expressed by the macro. */
const sceneImageStyles = css(`
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: var(--scene-filter);
  image-rendering: pixelated;
`);

/* The veil: the register's `--veil-rgb` graded top-to-bottom, plus the fine dither
 * tile so the gradient bands as pixels instead of smooth 8-bit ramps. */
const veilStyles = style({
  position: "absolute",
  inset: 0,
  /* Two layers on one element: the checker paints over the ramp, so the veil bands
   * as pixels instead of a smooth 8-bit gradient. The checker is the same
   * `repeating-conic-gradient` on `--dither-tile-fine` that `dither()` emits —
   * spelled out here only because one element cannot carry two `background-image`
   * declarations, so the helper's object cannot simply be spread in. */
  backgroundImage: {
    default:
      "[repeating-conic-gradient(rgb(var(--veil-rgb) / 0.22) 0% 25%, transparent 0% 50%), linear-gradient(180deg, rgb(var(--veil-rgb) / 0.4), rgb(var(--veil-rgb) / 0.7))]",
    forcedColors: "none",
  },
  backgroundSize: "[var(--dither-tile-fine) var(--dither-tile-fine), auto]",
});

const skylineStyles = style({
  position: "absolute",
  insetStart: 0,
  insetEnd: 0,
  top: 0,
  height: "[52%]",
  display: "flex",
  alignItems: "end",
  opacity: 0.9,
});

const buildingStyles = style({
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: 0,
  backgroundColor: "gray-75",
  borderTopWidth: 2,
  borderTopStyle: "solid",
  borderTopColor: "[color-mix(in srgb, var(--status-info) 70%, transparent)]",
  boxSizing: "border-box",
});

/* Escape hatch: the floor grid needs `mask-image` (absent from the theme) to fade
 * in and out at both ends, and a 3D `perspective()` transform origin the theme's
 * transform-origin token list does not cover as one declaration. */
const gridStyles = css(`
  position: absolute;
  left: -40%;
  right: -40%;
  top: 52%;
  height: 60%;
  transform: perspective(600px) rotateX(64deg);
  transform-origin: top;
  background-image:
    linear-gradient(color-mix(in srgb, var(--status-info) 50%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--status-info) 50%, transparent) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: linear-gradient(180deg, transparent, #000 25%, #000 80%, transparent);
  mask-image: linear-gradient(180deg, transparent, #000 25%, #000 80%, transparent);
`);

const sweepStyles = style({
  position: "absolute",
  insetStart: 0,
  insetEnd: 0,
  top: 0,
  height: 3,
  "--scan-travel": {
    type: "height",
    value: "100%",
  },
  backgroundColor: "[color-mix(in srgb, var(--status-info) 22%, transparent)]",
  animation: {
    default: scanSweep,
    "@media (prefers-reduced-motion: reduce)": "none",
  },
  animationDuration: 7000,
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
});

/**
 * The scene behind a hero: a pixelated, colour-graded image under the register's
 * veil, with an optional pixel skyline, perspective floor grid and scan sweep.
 *
 * Local addition — no S2 counterpart. It is scenery, so it is `aria-hidden` and
 * `pointer-events: none` throughout, and it positions itself `absolute; inset: 0`
 * — give it a positioned parent and put the content after it.
 */
export function SceneBackdrop(props: SceneBackdropProps): JSX.Element {
  const [local] = splitProps(props, [
    "src",
    "veil",
    "sweep",
    "skyline",
    "grid",
    "UNSAFE_className",
    "UNSAFE_style",
    "id",
  ]);

  return (
    <div
      id={local.id}
      aria-hidden="true"
      class={[local.UNSAFE_className, rootStyles].filter(Boolean).join(" ")}
      style={local.UNSAFE_style}
      data-scene-backdrop=""
    >
      <Show when={local.src}>
        {(src) => (
          <div
            data-scene-layer="image"
            class={`${layerStyles} ${sceneImageStyles}`}
            style={{ "background-image": `url("${src()}")` }}
          />
        )}
      </Show>
      <Show when={local.skyline}>
        <div data-scene-layer="skyline" class={skylineStyles}>
          <For each={SKYLINE}>
            {(height) => <span class={buildingStyles} style={{ height: `${height}px` }} />}
          </For>
        </div>
      </Show>
      <Show when={local.grid}>
        <div data-scene-layer="grid" class={gridStyles} />
      </Show>
      <Show when={local.veil ?? true}>
        <div data-scene-layer="veil" class={veilStyles} />
      </Show>
      <Show when={local.sweep}>
        <div data-scene-layer="sweep" class={sweepStyles} />
      </Show>
    </div>
  );
}
