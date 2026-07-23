/* Glasselated color ramps for Viviana UI.
 *
 * These replace the Adobe Spectrum ramps that @adobe/spectrum-tokens supplies. The style
 * macro bakes color into per-property atomic CSS at BUILD time, so a ramp cannot be
 * retargeted from a consuming app's stylesheet — it has to happen here, and the package
 * must be rebuilt for any edit below to reach the browser.
 *
 * ANCHORING. Every value here is derived from the brand palette declared in the island's
 * own stylesheet (apps/akade/src/styles/design-handoff-v2.css) — `--slate-*`, `--blue-*`,
 * `--amber-*`, `--red-500`, `--violet-500`. Brand stops are interpolated at their true
 * OKLCh values (no global rescale), so the vivid mid stops land on the brand hexes; only
 * Spectrum's extra-dark tail, which the brand ramp simply doesn't have, is extrapolated
 * along each ramp's own trajectory.
 *
 * Do NOT regenerate these from hue math. An earlier revision synthesised gray/blue/red/
 * orange/yellow/green from OKLCh hue anchors; it validated clean for contrast and
 * monotonicity and was still the wrong palette, because nothing had checked the anchors
 * against the island. The island is the source of truth.
 *
 * ACCESSIBILITY. Components fill semantic backgrounds via lightDark("<ramp>-900",
 * "<ramp>-700") with white ink (calendar/RangeCalendar.tsx:373, radio/index.tsx:284,
 * menu/s2-menu-styles.ts:257). Those two stops per ramp are pinned to >= 4.5:1 against
 * white — EXCEPT blue, where 900 is re-pinned to the brand `--accent-primary` #2e90fa
 * in BOTH columns (see the blue ramp note: the darkened #1474e4/#338cfe stops of an
 * earlier revision put the entire accent-coloured population one rung off register).
 * White ink on the light accent fill is therefore ~3.2:1, the 3:1 large-text/graphical
 * floor only — which is exactly how the island spends it (primary button, white 13px/600,
 * glasselated.css:1361-1370; white icon masks, :808-810). It never sets body-size white
 * text on the light accent fill; a component needing readable text on a selected surface
 * takes the raised-pill idiom instead (TabSwitch, switch/index.tsx) or the soft accent
 * pill (`--accent-primary-soft` + blue ink, `.glx-btn-soft` glasselated.css:1382-1392).
 *
 * Two invariants to hold when editing:
 *   - Emit EVERY stop of a ramp. A missing stop silently keeps the Adobe value.
 *   - Keep lightness monotonic, with a perceptible gap (>= 0.02 OKLCh L) between adjacent
 *     stops. `nextColorStop` implements :hover/:active by stepping to the adjacent stop,
 *     so a reversal inverts the state change and too small a gap makes it invisible.
 *
 * KNOWN LIMITATION — THE INK STOP. `gray` carries the primary ink at 800, because that is
 * where Spectrum's `neutral-content-color-default` resolves (spectrum-theme.ts maps `neutral`
 * to it). That leaves only the 800..1000 tail above the ink in dark, where the ink is already
 * near-white, so the dark 800/900/1000 gaps sit just under this file's own 0.02 floor and the
 * hover step off gray-800 is near-flat in dark. The ramp cannot solve that alone. The clean
 * fix is one level up: repoint `neutral-content-color-default` to gray-900 in spectrum-theme.ts
 * and give gray-800 its intermediate value back, which restores both the gap and the hover
 * step. Do not "fix" it by moving the ink off 800 here — that only unpaints the ink.
 *
 * The 13 decorative ramps (purple, indigo, seafoam, cyan, celery, chartreuse, magenta,
 * fuchsia, pink, turquoise, brown, silver, cinnamon) are intentionally left on Adobe
 * values; nothing in the system surfaces them today, but a component exposing
 * `color="purple"` directly would visibly clash.
 */
import type { ColorToken } from "./tokens";

/** [light, dark] per stop. */
type Ramp = Record<number, readonly [light: string, dark: string]>;

const RAMPS: Record<string, Ramp> = {
  /* Cool slate neutrals — brand `--slate-*`. Drives all text, borders, dividers and
   *   disabled states, so this is the highest-blast-radius ramp here.
   *
   *   BOTH columns are read off the island, and they are read off DIFFERENT declarations.
   *   `--slate-*` is not merely inverted in dark: design-handoff-v2.css re-declares it
   *   de-saturated (:216-221) against the light values at :32-38. An earlier revision derived
   *   dark by inverting the light hexes, which kept the light column's blue tint and left the
   *   whole dark neutral band reading cooler than the island it copies. Anchors, per column:
   *     light  400/500/700 = `--slate-400/500/700` (:35,34,33)
   *     dark   400/500/700 = `--slate-400/500/700` (:219,218,217)
   *     dark   25          = `--surface-app` (:176)
   *   600 is interpolated between its neighbours in each column; 25/50/75/100/200/300 hold
   *   the charcoal-glass ends the island's dark surfaces sit on.
   *
   *   800 IS THE INK STOP. Spectrum's `neutral-content-color-default` resolves to gray-800,
   *   so this stop is what paints ordinary label and control text. It is pinned to the
   *   island's `--text-primary`: `--slate-900` #17212e in light (:32,42) and the hardcoded
   *   neutral #f2f3f5 in dark (:170). 900/1000 are then the extrapolated tail past the ink —
   *   the island has no token beyond it in either direction.
   *
   *   500 IS THE SECONDARY INK STOP, by the same logic one rung quieter: it is pinned to
   *   `--text-secondary`, `--slate-500` #64748b in light (:34,43) and the hardcoded neutral
   *   #9aa0a8 in dark (:171). Note dark `--text-secondary` is NOT dark `--slate-500` (#97a1ab,
   *   :218) — the island de-tints its dark ink away from the slate ramp exactly as it does at
   *   800, so following slate here would miss by the same small margin it missed by at 800.
   *   `neutral-subdued-content-color-default` is repointed onto this stop in spectrum-theme.ts;
   *   Adobe resolves it to gray-700, which paints field labels, unselected tab and segment
   *   labels, slider labels and breadcrumbs two rungs too heavy (61 elements, both schemes).
   *
   *   Light 300/400/500 were #c5d0de/#93a3b8/#63748b — each exactly one off the island's
   *   #c4d0de/#94a3b8/#64748b in the red channel. That is a round-trip through OKLCh, not a
   *   transcription; the values are now copied from the declarations. Read these off the CSS,
   *   never recompute them: a one-digit drift still fails an equality check against the token.
   *
   *   The dark 800->900->1000 gaps are ~0.018 OKLCh L, just under the >= 0.02 this file asks
   *   for below. That is a ceiling, not a choice: the dark ink is already at L 0.964 and 1000
   *   must stay pure white (it is consumed as an alpha base, e.g. `gray-1000/42`), so 0.036 is
   *   the entire remaining headroom. Consequence to know: `baseColor("gray-800")` steps to
   *   gray-800 -> gray-900 on hover, so ink hover and the S2 primary-button fill hover are
   *   near-flat in dark. See the note in the header about where that is better fixed.
   *
   *   100/200 stay OPAQUE. The island's dark `--slate-100/200` are alpha whites
   *   (rgba(255,255,255,.06/.1), :220-221), which is why its surfaces read as glass. A ramp
   *   stop cannot carry that here: these values are baked into atomic CSS with no knowledge of
   *   the backdrop, so their composited lightness — and therefore the monotonicity and the
   *   hover step `nextColorStop` derives from it — would vary per surface. The glass edge has
   *   its own tokens instead (`border-subtle`, `border-default`, `well-border`). */
  gray: {
    25: ["#ffffff", "#0c0d10"],
    50: ["#f6f8fa", "#1d1e20"],
    75: ["#edf1f5", "#313336"],
    100: ["#e5eaf1", "#43474d"],
    200: ["#dbe3ed", "#555c64"],
    300: ["#c4d0de", "#67717d"],
    400: ["#94a3b8", "#7c8794"],
    500: ["#64748b", "#9aa0a8"],
    600: ["#465569", "#a8b2c0"],
    700: ["#33455c", "#b9c4d6"],
    800: ["#17212e", "#f2f3f5"],
    900: ["#131b26", "#f8f9fa"],
    1000: ["#000000", "#ffffff"],
  },
  /* Brand `--blue-*` (`--accent-primary` is `--blue-500` #2e90fa). Aliased by BOTH
   *   accent-color-* and informative-color-*, so this drives buttons, links, focus rings,
   *   selection and every informative state at once.
   *
   *   900 IS THE ACCENT STOP, by the same argument that pins gray-800 to the ink: it is
   *   `--accent-primary` #2e90fa, and it is the same value in BOTH columns because the
   *   island genuinely does not override it in dark (design-handoff-v2.css declares
   *   `--accent-primary: var(--blue-500)` at :76 and the dark block never restates it).
   *   Almost everything accent-coloured resolves here — slider fills, radio and checkbox
   *   marks, the selected menu row, the table resize bar, tab indicators, links in light.
   *   It was #1474e4 / #338cfe, one rung either side of the accent, which is why the
   *   single largest off-register cluster in both schemes was accent-coloured (24 light
   *   elements, 15 dark).
   *
   *   700's DARK column is the interactive FILL, which is the one accent value the island
   *   does split by scheme: `--interactive-fill` is `var(--accent-primary)` in light (:83)
   *   but the quieter #407fc1 in dark (:200). That split is exactly what Adobe's
   *   `lightDark("accent-900", "accent-700")` idiom expresses — light takes the accent,
   *   dark steps down — so the idiom stays and only the value it lands on moves. A filled
   *   accent button in dark is a large area of colour; the island damps it and leaves the
   *   small accent marks at full strength.
   *
   *   Nothing else here is pinned. The island publishes no accent hover, so 800 (dark
   *   hover, one step brighter than the damped fill) and 1000 (light hover, one step
   *   deeper) are ours; they exist to give a state the handoff never drew somewhere
   *   consistent to land. */
  blue: {
    100: ["#f6faff", "#0b0d10"],
    200: ["#ecf3fe", "#1c2027"],
    300: ["#ddebfe", "#27313e"],
    400: ["#bfd9fe", "#2d415d"],
    500: ["#9cc4fc", "#2f507f"],
    600: ["#7bb0fa", "#2e5fa1"],
    700: ["#5c9ff9", "#407fc1"],
    800: ["#398dfa", "#267ce7"],
    900: ["#2e90fa", "#2e90fa"],
    1000: ["#0e64c8", "#569eff"],
    1100: ["#0752a7", "#75afff"],
    1200: ["#07448a", "#92c0ff"],
    1300: ["#0a3b77", "#adcfff"],
    1400: ["#093367", "#c7deff"],
    1500: ["#001f4b", "#e0edff"],
    1600: ["#000017", "#fafcff"],
  },
  /* Brand `--amber-*` (`--accent-warm` #f79009). Occupies Spectrum's `orange` slot AND
   *   carries notice/warning (see the overrides below): the island assigns amber the
   *   signal/due channel, so warning states belong here. */
  amber: {
    100: ["#fffbf8", "#120f0c"],
    200: ["#fdf2e9", "#28201a"],
    300: ["#ffe9d6", "#402e1f"],
    400: ["#ffdcbe", "#593a1d"],
    500: ["#ffca9d", "#75440f"],
    600: ["#ffb572", "#8e4f00"],
    700: ["#fea040", "#a35c00"],
    800: ["#f58f06", "#b96900"],
    900: ["#af6400", "#ce7600"],
    1000: ["#a65e00", "#de872a"],
    1100: ["#995600", "#e69b54"],
    1200: ["#804700", "#efae74"],
    1300: ["#713e00", "#f9c08f"],
    1400: ["#623601", "#ffd3ae"],
    1500: ["#422100", "#ffe7d4"],
    1600: ["#090000", "#fffbf7"],
  },
  /* Brand `--red-500` #f04438 promoted to a full ramp. Aliased by negative-color-*. */
  red: {
    100: ["#fffbfa", "#0f0d0c"],
    200: ["#fcf2f1", "#241e1d"],
    300: ["#fee8e5", "#3b2c2a"],
    400: ["#fed7d0", "#543833"],
    500: ["#febab0", "#753e37"],
    600: ["#fc9385", "#9a3d33"],
    700: ["#f7695a", "#c0362c"],
    800: ["#ee4337", "#e0332a"],
    900: ["#db2e26", "#f3493c"],
    1000: ["#bb241e", "#fc6657"],
    1100: ["#9d211a", "#ff8475"],
    1200: ["#85241d", "#ff9f92"],
    1300: ["#75261e", "#ffb8ae"],
    1400: ["#65201a", "#ffcfc8"],
    1500: ["#460a07", "#ffe5e1"],
    1600: ["#090000", "#fffbfa"],
  },
  /* Brand `--violet-500` #8b5cf6 promoted to a full ramp. The island gives violet the
   *   metrics channel, so it is available by name but aliased by no semantic role. */
  violet: {
    100: ["#fbfaff", "#0d0d10"],
    200: ["#f3f2fd", "#201f26"],
    300: ["#eceafc", "#302e3b"],
    400: ["#e2defe", "#403c55"],
    500: ["#cfc7fe", "#504875"],
    600: ["#b7a7fd", "#61509d"],
    700: ["#9d82fb", "#7355c9"],
    800: ["#875bf7", "#8559f4"],
    900: ["#793cef", "#946eff"],
    1000: ["#6d2ade", "#a186ff"],
    1100: ["#5e22c2", "#af9cff"],
    1200: ["#501ea5", "#beb0ff"],
    1300: ["#451d8f", "#cdc4ff"],
    1400: ["#3c197c", "#dcd7ff"],
    1500: ["#28025c", "#ece9ff"],
    1600: ["#030014", "#fcfbff"],
  },
  /* The success channel. The island genuinely has no green (its status channels are
   *   "cyan=info · amber=signal/due · violet=metrics · red=fault", design-handoff-v2.css:90),
   *   so this ramp is the ONE hue here not traced to the island — added by owner decision to
   *   give `success`/`positive` a real green instead of aliasing it to blue (which made
   *   positive read identically to accent/informative; see the resolved note under
   *   SEMANTIC_OVERRIDES). Hue is Untitled-UI Success green (152 deg OKLCh), the same source
   *   family as the brand's other anchors (blue #2e90fa, red #f04438, amber #f79009, violet
   *   #8b5cf6 are Untitled-UI Blue/Error/Orange/Purple 500).
   *
   *   NOT synthesised from hue math in isolation. Every stop is L-solved to carry the SAME
   *   WCAG contrast-on-white as its amber sibling, so the red/amber/green status trio read at
   *   identical weight wherever they sit together (Badge, StatusLight, Meter, InlineAlert). The
   *   consequence that matters: `notice`(amber) already works as fill and as ink in all those
   *   components, so `positive`(this green) at the same contrast works identically — this is a
   *   retrofit guarantee, not just an aesthetic one. The light 900..1600 tail departs from a
   *   pure amber match to keep >= 0.02 OKLCh L gaps (a visible :hover step) once 900 is floored
   *   to AA. 800 holds the vivid brand green; 900(light)/700(dark) are the white-ink fills,
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
 * informative-color-* -> blue, negative-color-* -> red, positive-color-* -> GREEN, and
 * notice-color-* -> ORANGE. Blue and red land on the brand ramps above for free, and green
 * now does too — the real `green` ramp added above backs `positive`/`success`. Only `orange`
 * is retargeted here: the brand's warm base is `--amber-*`, so amber is republished under the
 * `orange`/`notice` keys the Spectrum tokens actually reference. */
const SEMANTIC_OVERRIDES: Record<string, Ramp> = {
  /* The brand's warm is `--amber-*`, and Spectrum's warm base ramp is named `orange`.
   * Publishing amber under BOTH keys is what actually retires Adobe's orange: a ramp named
   * `amber` overrides nothing, because no Spectrum token references that name. */
  orange: RAMPS.amber,
  /* RESOLVED (was "no green"). `positive`/`success` used to alias RAMPS.blue, which the
   * island's four-channel palette (no success slot) technically supported but which made
   * positive read identically to accent/informative — flagged here as needing an owner
   * decision. The owner added a success channel: a real `green` ramp now lives in RAMPS
   * above and positive-color-* (a ref to {green-N}) resolves onto it, so `positive`/`success`
   * and by-name `green` all paint the new green. Distinct from accent (blue) and from the
   * warm channel (amber/notice) — the status trio red/amber/green now reads as three states. */
  /* Warning -> amber. The island states the channel assignment outright
   * (design-handoff-v2.css:90 "amber=signal/due · violet=metrics") and paints every warning
   * it has in amber: `warn:` log lines #ffb45e, the DUE badge #f9b45c, streak chips
   * rgba(247,144,9,.22). An earlier revision routed notice -> violet, which left the library
   * with literally zero warm pixels while the spec beside it had fourteen.
   *
   * This key is redundant today — `orange` above already carries amber, and notice-color-*
   * refs {orange-N} — but it is kept explicit so warning survives if the orange slot is ever
   * repurposed. Note the key is `notice`, NOT `notice-color`: colorScale() strips the
   * "-color" segment when building its keys (tokens.ts:84), so the scale lands in
   * `baseColors` as notice-100..notice-1600 and an override has to use the stripped name to
   * collide with it. Getting this wrong fails silently — the override is just an unread key. */
  notice: RAMPS.amber,
};

/* The create-yellow CTA (`--accent-create-*`). Deliberately NOT a ramp: the island declares
 * exactly three values per scheme and they do not sit on the amber trajectory — this is a
 * pale wash with dark ink, where amber-900 is a saturated fill with white ink. Modelling it
 * as a 16-stop ramp would invent thirteen colours nobody asked for.
 *
 * Spread into `baseColors` alongside the ramps, so `backgroundColor: "create-bg"` resolves
 * like any other token. Hover/press cannot use `nextColorStop` here (no adjacent stop
 * exists), so the button styles name the border colour explicitly for those states. */
export const glasselatedCreateColors: Record<string, ColorToken> = {
  "create-bg": { type: "color", light: "#ffedb0", dark: "#ffde81" },
  "create-border": { type: "color", light: "#f5d88a", dark: "#ffde81" },
  "create-ink": { type: "color", light: "#7a5600", dark: "#3a2e00" },
  /* One step deeper, for :hover / :pressed. Derived by darkening the fill ~4% L while
   * holding hue, the same latitude the AA pass uses. */
  "create-bg-deep": { type: "color", light: "#f8dd8f", dark: "#f5cd63" },
};

export const glasselatedRamps: Record<string, ColorToken> = Object.fromEntries(
  Object.entries({ ...RAMPS, ...SEMANTIC_OVERRIDES }).flatMap(([ramp, stops]) =>
    Object.entries(stops).map(([stop, [light, dark]]) => [
      `${ramp}-${stop}`,
      { type: "color", light, dark } satisfies ColorToken,
    ]),
  ),
);
