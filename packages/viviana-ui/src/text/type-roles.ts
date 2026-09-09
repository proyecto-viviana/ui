import { style } from "../style" with { type: "macro" };

/* The Glasselated register's CLOSED type ladder — twelve roles, no more.
 *
 * The handoff declares each role as one CSS custom property
 * (`--type-display` … `--type-button`, glasselated.css:154-168) so an app can
 * name a role and get it. The library's type lives in the build-time style()
 * macro instead, so this module is the equivalent surface: one precompiled
 * atom string per role, usable through any component's `styles` prop or as a
 * plain class on a bare element. The values are the register's own, verbatim:
 *
 *   display-xl 500 66px/0.98   Geist Pixel  +0.005em  landing hero
 *   display-lg 500 56px/1.02   Geist Pixel  +0.008em  home greeting
 *   display-md 500 40px/1.08   Geist Pixel  +0.01em   page titles
 *   display   500 28px/1.15   Geist Pixel  +0.01em   hero & page titles
 *   title     600 20px/1.2    Geist Pixel  +0.01em   section/panel titles
 *   headline  700 15px/1.3    Geist Pixel  +0.01em   card & list titles
 *   label     600 13.5px/1.15 Geist Pixel  +0.01em   buttons/nav/chips
 *   body      400 14px/1.55   Geist                  prose
 *   meta      400 12px/1.5    Geist                  secondary, `--text-secondary` ink
 *   micro     700 10px/1.2    Geist Mono   +0.1em    below the pixel floor
 *   terminal  400 11.5px/1.95 Geist Mono             wells & prompts
 *   button    400 13px/1      Geist Mono             control labels
 *
 * Each role opens with a `font:` shorthand purely to pick up the right FAMILY
 * routing (heading-* → display face, body-* → sans, code-* and ui → mono, see
 * spectrum-theme.ts font()) plus the role's semantic ink; the explicit
 * properties after it then pin size/weight/leading/tracking to the register's
 * exact numbers — shorthands expand first, so later keys win. Arbitrary
 * bracket values are deliberate: the register declares exact pixels, not ramp
 * rungs, and this module IS the register's ladder rather than a consumer of
 * Spectrum's.
 *
 * ELSH INVARIANT: the pixel face squares its terminals through a variation axis that
 * only resolves legibly at 16px and up, so a role may take `--font-display` ONLY at
 * >=16px. That is why the three hero tiers are all Pixel and why `label` (13.5px) is
 * the floor the handoff already calls "the 13px pixel floor" — the roles below it
 * (`body`, `meta`, `micro`, `terminal`, `button`) take sans or mono, and any NEW role
 * under 16px must do the same.
 *
 * The weight ladder on the pixel tiers is INVERTED — lighter as it gets
 * bigger (500/600/700) — which font()'s Spectrum weight tokens cannot say;
 * that is why every pixel role restates fontWeight. `meta` is the one role
 * that restates ink: "secondary" is part of the role's definition, not a
 * context choice.
 *
 * Faces come from the `--s2-font-family-*` bridge (display → Geist Pixel,
 * sans → Geist, code → Geist Mono); an app that bridges nothing falls back to
 * the Spectrum stacks and only the metrics of these roles apply. */
export const typeRoles = {
  "display-xl": style({
    font: "heading-3xl",
    fontSize: "[66px]",
    fontWeight: "medium",
    lineHeight: "[0.98]",
    letterSpacing: "0.005em",
  }),
  "display-lg": style({
    font: "heading-2xl",
    fontSize: "[56px]",
    fontWeight: "medium",
    lineHeight: "[1.02]",
    letterSpacing: "0.008em",
  }),
  "display-md": style({
    font: "heading-xl",
    fontSize: "[40px]",
    fontWeight: "medium",
    lineHeight: "[1.08]",
    letterSpacing: "0.01em",
  }),
  display: style({
    font: "heading-lg",
    fontSize: "[28px]",
    fontWeight: "medium",
    lineHeight: "[1.15]",
    letterSpacing: "0.01em",
  }),
  title: style({
    font: "heading-sm",
    fontSize: "[20px]",
    fontWeight: "semi-bold",
    lineHeight: "[1.2]",
    letterSpacing: "0.01em",
  }),
  headline: style({
    font: "heading-2xs",
    fontSize: "[15px]",
    fontWeight: "bold",
    lineHeight: "[1.3]",
    letterSpacing: "0.01em",
  }),
  label: style({
    font: "heading-2xs",
    fontSize: "[13.5px]",
    fontWeight: "semi-bold",
    lineHeight: "[1.15]",
    letterSpacing: "0.01em",
  }),
  body: style({
    font: "body",
    lineHeight: "[1.55]",
  }),
  meta: style({
    font: "body-sm",
    fontSize: "[12px]",
    lineHeight: "[1.5]",
    color: "neutral-subdued",
  }),
  micro: style({
    font: "code-xs",
    fontSize: "[10px]",
    fontWeight: "bold",
    lineHeight: "[1.2]",
    letterSpacing: "0.1em",
  }),
  terminal: style({
    font: "code-xs",
    fontSize: "[11.5px]",
    lineHeight: "[1.95]",
  }),
  button: style({
    font: "ui",
    fontSize: "[13px]",
    fontWeight: "normal",
    lineHeight: "[1]",
  }),
} as const;

export type TypeRole = keyof typeof typeRoles;
