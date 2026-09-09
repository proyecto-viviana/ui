import type { MacroContext } from "@parcel/macros";
import { keyframes } from "./style-macro";

/**
 * Viviana UI v2 (Terminal Glass): the register's motion vocabulary, in one place.
 *
 * The register's rule is that everything steps — `step-end`, `steps(n)`, `linear` — with
 * no eased fades except opacity on hover overlays (handoff README §Motion library). That
 * rule is only enforceable if the timing functions live together; a component that spells
 * its own `@keyframes` inline reaches for `ease-in-out` without anyone noticing, and the
 * screens drift apart one animation at a time.
 *
 * Each export is the CLASS-SAFE NAME the `keyframes()` macro mints at build time, not the
 * CSS text: the macro hashes the body, emits the `@keyframes` block as a build asset, and
 * hands back the identifier, so two components asking for the same animation share one
 * block. Names are stable across builds for identical bodies.
 *
 * Duration and timing are NOT baked in — they belong to the call site, which knows whether
 * it is a 2s live pulse or a 2.6s ring chase — but the register's values are named here as
 * constants so a call site can spell the intent rather than a number.
 *
 * REDUCED MOTION: none of these gate themselves. Every consumer must gate on the CSS media
 * condition (`style()`'s `forcedColors`-style media keys), NOT a runtime `matchMedia`
 * check — Solid hydration trusts the server DOM, so an SSR'd inline `animation` is never
 * removed when the client's check disagrees. The one class of exception is an animation
 * that carries information rather than decoration (an indeterminate spinner, where a
 * frozen frame reads as "done"), and that exception is argued at the call site.
 */

/** Terminal caret: on/off, no fade. The register's blink. */
export function tglCaret(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  50% {
    opacity: 0;
  }
`,
  );
}

/** LIVE / on-air breath: 55% → full → 55% over 2s, well under any flash threshold. */
export function tglPulse(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  0%, 100% {
    opacity: 0.55;
  }

  50% {
    opacity: 1;
  }
`,
  );
}

/** Focus/progress ring chase: each block snaps to full early, then holds. */
export function tglRingBlink(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  0% {
    opacity: 0.15;
  }

  12% {
    opacity: 1;
  }

  100% {
    opacity: 1;
  }
`,
  );
}

/** Log lines arriving: a hard cut, staggered by `animation-delay` per line. */
export function bootIn(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`,
  );
}

/** Typed reply: the element's width, not its text, is what steps. */
export function typeIn(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
`,
  );
}

/** Theater scan sweep: one bright line falling through the frame. */
export function scanDown(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  from {
    transform: translateY(-4px);
  }

  to {
    transform: translateY(100vh);
  }
`,
  );
}

/** Skeleton sheen: a band travelling right to left across an oversized background. */
export function skSweep(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  from {
    background-position: 140% 0;
  }

  to {
    background-position: -40% 0;
  }
`,
  );
}

/** Pixel spinner: a full turn in eight discrete frames. */
export function glSpin(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  to {
    transform: rotate(360deg);
  }
`,
  );
}

/** Poll bar filling to its share. */
export function pollBar(this: MacroContext | void): string {
  return keyframes.call(
    this,
    `
  from {
    width: 0;
  }
`,
  );
}

/**
 * The register's timings, as the call site should spell them.
 *
 * `TOGGLE_KNOB` is a transition rather than an animation — the knob slides between two
 * declared positions — but it belongs to the same vocabulary and to the same three-step
 * feel, so it is named here instead of being retyped per control.
 */
export const motionTiming = {
  caret: "1.1s step-end infinite",
  pulse: "2s ease-in-out infinite",
  ringBlink: "2.6s step-end infinite",
  /** Per-line stagger for `bootIn`. */
  bootIn: "0.01s step-end both",
  bootInStagger: "0.16s",
  typeIn: "2.6s steps(52) both",
  scanDown: "7s linear infinite",
  skSweep: "1.5s linear infinite",
  glSpin: "0.9s steps(8) infinite",
  pollBar: "0.3s steps(6) both",
  toggleKnob: "0.12s steps(3)",
} as const;
