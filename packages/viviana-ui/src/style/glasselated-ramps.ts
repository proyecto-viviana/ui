/* Glasselated color ramps for Viviana UI — Terminal Glass v2.
 *
 * These replace the Adobe Spectrum ramps that @adobe/spectrum-tokens supplies. The style
 * macro bakes color into per-property atomic CSS at BUILD time, so a ramp cannot be
 * retargeted from a consuming app's stylesheet — it has to happen here, and the package
 * must be rebuilt for any edit below to reach the browser.
 *
 * ANCHORING. Every value here is derived from the Terminal Glass handoff palette
 * (`tokens/colors.css` in the design handoff) — `--slate-*`, `--blue-*`, `--cyan-500`,
 * `--fuchsia-*`, `--yellow-*`, `--red-500`. Brand stops are interpolated at their true
 * OKLCh values (no global rescale), so the vivid mid stops land on the brand hexes; only
 * the extra-dark / extra-light tails, which the brand ramp simply doesn't have, are
 * extrapolated along each ramp's own trajectory.
 *
 * THE FOUR CHANNELS. The handoff assigns colour by job, not by decoration:
 *   blue/cyan  permanent structure — nav, links, primary fill, progress, prompts, metrics
 *   fuchsia    the ask — CTAs (+Create, Review, Join), LIVE, mentions, notifications
 *   yellow     transient detail — streak, XP, DUE, warn, unsaved dots; never a fill/button
 *   red        fault only
 * Orange and amber are REMOVED, with no aliases: the previous revision published `amber`
 * under Spectrum's `orange` slot, which is exactly what made warm pixels reachable. Notice
 * now resolves onto `yellow`, and `orange` falls back to Adobe's own ramp, unreachable
 * because no public prop exposes it any more (Badge's `"orange"` variant is gone).
 * `violet` is removed too — the metric channel is cyan now.
 *
 * ACCESSIBILITY. Semantic fills with white text are pinned to >= 4.5:1. Blue is the
 * exception at the ramp level: accent-900 is the handoff `--blue-500` (#0f6adb / #3dadff)
 * for marks and links, and the text-bearing fill is the standalone `interactive-fill`
 * token below (`--blue-600`, #0b5dc2 / #0a6fef — 6.25:1 / 4.63:1 under white). Fuchsia
 * and yellow fills carry their own inks (`fuchsia-ink`, `yellow-ink`) rather than white,
 * because white fails AA on both in dark.
 *
 * Two invariants to hold when editing:
 *   - Emit EVERY stop of a ramp. A missing stop silently keeps the Adobe value.
 *   - Keep lightness monotonic, with a perceptible gap (>= 0.02 OKLCh L) between adjacent
 *     stops. `nextColorStop` implements :hover/:active by stepping to the adjacent stop,
 *     so a reversal inverts the state change and too small a gap makes it invisible.
 *     Two ramps run out of headroom and are exempted, by name, in the monotonicity test:
 *     gray's dark 800..1000 tail (see below) and yellow's dark 1000..1600 tail (the brand
 *     signal yellow sits at 900 with L 0.90, leaving 0.1 of L for six stops). Nothing
 *     steps off either tail today; both are strictly monotonic, just not perceptibly so.
 *
 * KNOWN LIMITATION — THE INK STOP. `gray` carries the primary ink at 800, because that is
 * where Spectrum's `neutral-content-color-default` resolves (spectrum-theme.ts maps `neutral`
 * to it). Light 800 is `--slate-900` #0f1622; dark 800 is `--terminal-fg` #f4f8ff (the
 * handoff's dark primary text is literally #ffffff, which 1000 must stay, so the ink takes
 * the near-white it uses for terminal copy). That leaves ~0.027 of L above the ink for two
 * stops, so the dark 800/900/1000 gaps sit under the 0.02 floor and the hover step off
 * gray-800 is near-flat in dark. The clean fix is one level up: repoint
 * `neutral-content-color-default` to gray-900 in spectrum-theme.ts. Do not "fix" it by
 * moving the ink off 800 here — that only unpaints the ink.
 *
 * Negative, notice, and positive *ink* (HelpText, StatusLight, Badge outline) is remapped
 * at the theme (`spectrum-theme.ts` `color.negative` -> 1000). Do not floor 900 here to
 * make HelpText pass on the panel composite — 900 is the white-on-fill stop.
 *
 * The 12 decorative ramps (purple, indigo, seafoam, celery, chartreuse, magenta, pink,
 * turquoise, brown, silver, cinnamon, orange) are intentionally left on Adobe values;
 * nothing in the system surfaces them today.
 */
import type { ColorToken } from "./tokens";

/** [light, dark] per stop. */
type Ramp = Record<number, readonly [light: string, dark: string]>;

const RAMPS: Record<string, Ramp> = {
  /* Cool slate neutrals — handoff `--slate-*`. Drives all text, borders, dividers and
   *   disabled states, so this is the highest-blast-radius ramp here.
   *
   *   Anchors, per column (colors.css):
   *     light 25 #ffffff · 50 `--surface-app` #f3f6fa · 400 `--slate-500` · 500 `--slate-700`
   *           800 `--slate-900` · 1000 #000000
   *     dark  25 `--surface-app` #040506 · 400 `--slate-500` · 500 `--slate-700`
   *           800 `--terminal-fg` · 1000 #ffffff
   *   400 IS THE TERTIARY INK and 500 THE SECONDARY INK: `--text-tertiary` is `--slate-500`
   *   and `--text-secondary` is `--slate-700`, and `neutral-subdued-content-color-default`
   *   is repointed onto 500 in spectrum-theme.ts (Adobe resolves it to gray-700, two rungs
   *   too heavy for labels, unselected tabs, slider labels and breadcrumbs).
   *   800 IS THE PRIMARY INK — see the header note.
   *
   *   Stops stay OPAQUE. The handoff's glass edges are alpha (`--border-subtle` and friends
   *   are rgba over an unknown backdrop); a ramp stop is baked into atomic CSS with no
   *   knowledge of what it sits on, so its composited lightness — and the hover step
   *   `nextColorStop` derives from it — would vary per surface. The glass edge keeps its own
   *   CSS variables instead (`border-subtle`, `border-default`, `well-border`). */
  gray: {
    25: ["#ffffff", "#040506"],
    50: ["#f3f6fa", "#0b0f12"],
    75: ["#d4d9e1", "#22272d"],
    100: ["#b5bdc8", "#3b424a"],
    200: ["#97a2af", "#565f6a"],
    300: ["#7a8897", "#737d8b"],
    400: ["#5e6e80", "#929dae"],
    500: ["#3b4552", "#c6cfdc"],
    600: ["#2b3541", "#d5dce8"],
    700: ["#1d2531", "#e5eaf3"],
    800: ["#0f1622", "#f4f8ff"],
    900: ["#05070b", "#fafcff"],
    1000: ["#000000", "#ffffff"],
  },
  /* Handoff `--blue-*`. Aliased by BOTH accent-color-* and informative-color-*, so this
   *   drives buttons, links, focus rings, selection and every informative state at once.
   *   900 IS THE ACCENT STOP: `--blue-500` (#0f6adb light / #3dadff dark), what
   *   `--accent-primary` resolves to. 700 light is `--blue-400` #3d9be8 (glyphs, prompt
   *   marks) and 1100 dark is its dark counterpart #99d8ff; `--blue-600`, the primary fill,
   *   lands at 1000 light / 800 dark and is also published flat as `interactive-fill`
   *   below, because a fill is a role, not a ramp position. */
  blue: {
    100: ["#f6faff", "#03080f"],
    200: ["#dae9fb", "#020e1b"],
    300: ["#bed9f8", "#011d39"],
    400: ["#a1caf5", "#002c59"],
    500: ["#83baf1", "#003d7a"],
    600: ["#63abed", "#004e9e"],
    700: ["#3d9be8", "#005ec6"],
    800: ["#2283e2", "#0a6fef"],
    900: ["#0f6adb", "#3dadff"],
    1000: ["#0b5dc2", "#6dc3ff"],
    1100: ["#094aa2", "#99d8ff"],
    1200: ["#063884", "#b2deff"],
    1300: ["#032766", "#c7e5ff"],
    1400: ["#01164a", "#daecff"],
    1500: ["#000730", "#ebf4ff"],
    1600: ["#000017", "#fafcff"],
  },
  /* Handoff `--cyan-500` promoted to a full ramp. Cyan is the METRIC channel (the job
   *   `violet` used to hold, which this revision deletes): counters, gauges, data marks.
   *   900 carries the brand hex in both columns; no semantic role aliases it, so it is
   *   reached by name (`color="cyan"`) and through `--status-metric`. */
  cyan: {
    100: ["#f2fdff", "#080d0f"],
    200: ["#dcedf0", "#071419"],
    300: ["#c1dce3", "#102b35"],
    400: ["#a6ccd7", "#194553"],
    500: ["#8cbccb", "#236072"],
    600: ["#71acc0", "#2c7d94"],
    700: ["#569bb4", "#369bb6"],
    800: ["#388baa", "#3fbada"],
    900: ["#0a7a9f", "#48daff"],
    1000: ["#046989", "#6edfff"],
    1100: ["#015973", "#8be4ff"],
    1200: ["#00495f", "#a4eaff"],
    1300: ["#003a4b", "#baefff"],
    1400: ["#002b38", "#cff3ff"],
    1500: ["#001d26", "#e4f8ff"],
    1600: ["#001016", "#f7fdff"],
  },
  /* Handoff `--fuchsia-*` promoted to a full ramp. Fuchsia is THE ASK: +Create, Review,
   *   Join, LIVE, mentions, notification dots. 900 is `--fuchsia-500`, the CTA fill;
   *   1000 light / 800 dark is `--fuchsia-600` (the pressed/deep step, published flat as
   *   `create-bg-deep`); 700 light / 1100 dark is `--fuchsia-400`, which is what dark-scheme
   *   fuchsia TEXT must use — the 500 fails AA as ink on the dark floor. */
  fuchsia: {
    100: ["#fff7fc", "#0f070c"],
    200: ["#ffe7f6", "#1a0713"],
    300: ["#ffd4ef", "#360d28"],
    400: ["#ffc0e7", "#55123f"],
    500: ["#fface0", "#761656"],
    600: ["#ff95d8", "#99186d"],
    700: ["#ff7dd0", "#be1985"],
    800: ["#ed53b0", "#e5179c"],
    900: ["#d9128f", "#ff4fc3"],
    1000: ["#b80f7a", "#ff7bcf"],
    1100: ["#990b68", "#ff9edb"],
    1200: ["#7c0756", "#ffb2e1"],
    1300: ["#600444", "#ffc4e8"],
    1400: ["#460233", "#ffd6ee"],
    1500: ["#2d0121", "#ffe7f5"],
    1600: ["#170010", "#fff8fc"],
  },
  /* Handoff `--yellow-*` promoted to a full ramp, and the base that notice-color-* now
   *   resolves to. Yellow is TRANSIENT DETAIL — streak blocks, XP, DUE bars, warn lines,
   *   string literals, unsaved dots — and is never a button fill. 900 is `--yellow-500`
   *   dark / `--yellow-600` light: the light column steps one rung deeper than the brand
   *   hex because #f5c800 as a *mark* on a white app floor is decoration, not signal, and
   *   `--status-signal` is an ink (`--yellow-text`) rather than this stop. Yellow fills
   *   carry `yellow-ink` #141000, never white. See the header for the dark tail exemption. */
  yellow: {
    100: ["#fffef7", "#0d0b04"],
    200: ["#fdf4c0", "#181404"],
    300: ["#ffeb80", "#362d08"],
    400: ["#fce36c", "#57490c"],
    500: ["#fada56", "#7c670e"],
    600: ["#f7d13a", "#a2860e"],
    700: ["#f5c800", "#cba60a"],
    800: ["#dfb400", "#f5c800"],
    900: ["#c9a000", "#ffe03a"],
    1000: ["#aa8900", "#fff3a6"],
    1100: ["#8c7200", "#fff5b5"],
    1200: ["#6f5c00", "#fff6c3"],
    1300: ["#544600", "#fff8d0"],
    1400: ["#3b3200", "#fffadc"],
    1500: ["#241e00", "#fffbe8"],
    1600: ["#0f0c00", "#fffdf3"],
  },
  /* Handoff `--red-500` promoted to a full ramp. Aliased by negative-color-*, and FAULT
   *   ONLY — the handoff spends no red on anything else. 900 is the brand hex in both
   *   columns (#d92d20 / #ff6b5e), the white-ink fill stop; 1000 is the ink stop (see the
   *   header note and the contrast test). */
  red: {
    100: ["#fffbfa", "#0b0705"],
    200: ["#ffe4dd", "#190b04"],
    300: ["#fdcdc2", "#331809"],
    400: ["#f9b6a7", "#512511"],
    500: ["#f59e8d", "#71331b"],
    600: ["#f08673", "#924128"],
    700: ["#e96d59", "#b54f37"],
    800: ["#e2513f", "#da5d49"],
    900: ["#d92d20", "#ff6b5e"],
    1000: ["#ba2419", "#ff8575"],
    1100: ["#9b1c13", "#ff9c8c"],
    1200: ["#7e130c", "#ffb0a2"],
    1300: ["#610b06", "#ffc4b8"],
    1400: ["#460503", "#ffd7ce"],
    1500: ["#2d0101", "#ffe9e4"],
    1600: ["#160000", "#fffbfa"],
  },
  /* The success channel. The island genuinely has no green (its status channels are
   *   "cyan=info · amber=signal/due · violet=metrics · red=fault", design-handoff-v2.css:90),
   *   so this ramp is the ONE hue here not traced to the island — added by owner decision to
   *   give `success`/`positive` a real green instead of aliasing it to blue (which made
   *   positive read identically to accent/informative; see the resolved note under
   *   SEMANTIC_OVERRIDES). Hue is Untitled-UI Success green (152 deg OKLCh), the same source
   *   family as the brand's other anchors (blue #2e90fa and red #f04438 are Untitled-UI
   *   Blue/Error 500; the warm and violet anchors of that set are retired).
   *
   *   NOT synthesised from hue math in isolation. Every stop is L-solved to carry the SAME
   *   WCAG contrast-on-white as its RED sibling, so the red/green pair reads at identical
   *   weight wherever the two sit together (Badge, StatusLight, Meter, InlineAlert): both are
   *   white-ink fills, so `positive` retrofits onto every surface `negative` already works on.
   *   The third status channel, `notice`, cannot join that pairing — it is the register's
   *   yellow and is inked BLACK on its fills (see the ink note under yellow). The light
   *   900..1600 tail departs from a pure contrast match to keep >= 0.02 OKLCh L gaps (a
   *   visible :hover step) once 900 is floored to AA. 800 holds the vivid brand green; 900(light)/700(dark) are the white-ink fills,
   *   pinned >= 4.5:1 (900 light #1a8346 = 4.80, 700 dark #1c7d43 = 5.17) exactly as the header
   *   ACCESSIBILITY note requires of every semantic fill. */
  green: {
    100: ["#f9fdf9", "#0d110e"],
    200: ["#ebf6ed", "#1b231d"],
    300: ["#dbf3e0", "#233628"],
    400: ["#c6ebce", "#24492f"],
    500: ["#a8e1b6", "#1b5b32"],
    600: ["#81d699", "#166d39"],
    700: ["#56cb7e", "#1c7d43"],
    800: ["#33c06b", "#208e4d"],
    900: ["#1a8346", "#26a057"],
    1000: ["#037339", "#40af68"],
    1100: ["#016431", "#64be7f"],
    1200: ["#005327", "#82cb96"],
    1300: ["#00431e", "#9bd9ab"],
    1400: ["#003517", "#b7e7c2"],
    1500: ["#001f0a", "#d9f1de"],
    1600: ["#000000", "#f8fdf9"],
  },
};

/* Spectrum's semantic ramps are pure aliases resolved through `ref`: accent-color-* and
 * informative-color-* -> blue, negative-color-* -> red, positive-color-* -> green, and
 * notice-color-* -> {orange-N}. Blue, red and green land on the ramps above for free.
 * Only notice needs retargeting, and it is the ONE override left: the warm channel is
 * `yellow` now, and Spectrum has no notice base of its own to point at.
 *
 * There is deliberately no `orange` key any more. Publishing a brand ramp under `orange`
 * is what used to make warm fills reachable everywhere; with the key gone, `orange-*`
 * falls back to Adobe's real orange and no public prop resolves to it. */
const SEMANTIC_OVERRIDES: Record<string, Ramp> = {
  /* Note the key is `notice`, NOT `notice-color`: colorScale() strips the "-color" segment
   * when building its keys (tokens.ts:84), so the scale lands in `baseColors` as
   * notice-100..notice-1600 and an override has to use the stripped name to collide with
   * it. Getting this wrong fails silently — the override is just an unread key. */
  notice: RAMPS.yellow,
};

/* Standalone semantic colours with no honest ramp position. These are ROLES: the handoff
 * declares them as flat tokens (`--interactive-fill`, `--accent-cta*`, `--accent-detail*`,
 * the channel inks) precisely because their value is chosen for the job — AA under a
 * specific ink, or a specific alpha over glass — not for where it sits on a ramp.
 *
 * Spread into `baseColors` alongside the ramps, so `backgroundColor: "create-bg"` resolves
 * like any other token. Hover/press cannot use `nextColorStop` here (no adjacent stop
 * exists), so the button styles name the deep colour explicitly for those states. */
export const glasselatedCreateColors: Record<string, ColorToken> = {
  /* `--interactive-fill`: the primary button / active chip fill, `--blue-600`. Carries
   * white ink at 6.25:1 (light) and 4.63:1 (dark); accent-900 stays the brighter
   * decorative blue so a contrast repair here never moves the focus rings. */
  "interactive-fill": { type: "color", light: "#0b5dc2", dark: "#0a6fef" },
  /* +Create is now the CTA fuchsia, not the old create-yellow. `create-ink` is
   * `--fuchsia-ink`: white in light, near-black #1a0512 in dark, where white fails AA. */
  "create-bg": { type: "color", light: "#d9128f", dark: "#ff4fc3" },
  "create-border": { type: "color", light: "#d9128f", dark: "#ff4fc3" },
  "create-ink": { type: "color", light: "#ffffff", dark: "#1a0512" },
  /* One step deeper, for :hover / :pressed — `--fuchsia-600`. */
  "create-bg-deep": { type: "color", light: "#b80f7a", dark: "#e5179c" },
  /* The ask, by name: LIVE, mentions, notification dots, Review/Join. Same value as
   * `create-bg`; kept as its own token because the handoff names the role separately and
   * a future CTA re-tint must not silently move every LIVE badge. */
  cta: { type: "color", light: "#d9128f", dark: "#ff4fc3" },
  "cta-soft": {
    type: "color",
    light: "rgba(217, 18, 143, 0.12)",
    dark: "rgba(255, 79, 195, 0.18)",
  },
  "cta-ring": {
    type: "color",
    light: "rgba(217, 18, 143, 0.5)",
    dark: "rgba(255, 79, 195, 0.55)",
  },
  /* Transient detail: `--accent-detail` is `--yellow-500` in BOTH columns' own terms. */
  detail: { type: "color", light: "#f5c800", dark: "#ffe03a" },
  "detail-soft": {
    type: "color",
    light: "rgba(245, 200, 0, 0.18)",
    dark: "rgba(255, 224, 58, 0.14)",
  },
  /* Channel INKS — the only sanctioned way to put channel colour on text. `fuchsia-text`
   * is the 600 in light and the 400 in dark; `yellow-text` is a deep olive in light and
   * the 500 in dark. Both clear 4.5:1 on the app floor; the `-ink` pair is what goes ON
   * the corresponding 500 fill. */
  "fuchsia-text": { type: "color", light: "#b80f7a", dark: "#ff9edb" },
  "fuchsia-ink": { type: "color", light: "#ffffff", dark: "#1a0512" },
  "yellow-text": { type: "color", light: "#7a5f00", dark: "#ffe03a" },
  "yellow-ink": { type: "color", light: "#141000", dark: "#141000" },
};

export const glasselatedRamps: Record<string, ColorToken> = Object.fromEntries(
  Object.entries({ ...RAMPS, ...SEMANTIC_OVERRIDES }).flatMap(([ramp, stops]) =>
    Object.entries(stops).map(([stop, [light, dark]]) => [
      `${ramp}-${stop}`,
      { type: "color", light, dark } satisfies ColorToken,
    ]),
  ),
);
