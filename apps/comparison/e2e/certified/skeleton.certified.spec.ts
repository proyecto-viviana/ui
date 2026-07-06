import { registerAxTreeDriver } from "../drivers/ax";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 1, last primitive): Skeleton — the loading
 * placeholder. Unlike every other Tier-1 unit, `Skeleton` renders NO DOM of its
 * own: it is a pure `<SkeletonContext.Provider value={isLoading}>` (upstream S2
 * `Skeleton.tsx`, port `skeleton/index.tsx` — both byte-identical). The visible
 * treatment is applied by the DESCENDANTS that consume the context — here the
 * demo's `Text` lines and one `Icon` — via three faithful helpers verified
 * byte-identical by source read:
 *
 *   - `loadingStyle` (`css(...)`, layer 'L'): a `linear-gradient(to right,
 *     gray-100 33%, light-dark(gray-25, gray-300), gray-100 66%)` background at
 *     `background-size: 300%`, plus `* { visibility: hidden }`. The template
 *     string is character-for-character identical across stacks, so the style
 *     macro hashes it to the SAME class — the computed `background-image` /
 *     `background-size` are therefore guaranteed equal.
 *   - `useSkeletonText(children, style)`: when the context is loading, wraps the
 *     children in `<SkeletonText>` (an inert `<span>` carrying `loadingStyle` +
 *     `{color: transparent, box-decoration-break: clone, border-radius: sm}`)
 *     AND stamps `-webkit-text-fill-color: transparent` onto the OUTER `<Text>`
 *     span (hides the truncation ellipsis). Both stacks render the same nested
 *     `span[data-rsp-slot=text][inert] > span.loadingStyle[inert] > text` shape.
 *   - `useSkeletonIcon(styles)` + `createIcon`'s skeleton branch: merges
 *     `{border-radius: sm}` into the icon styles and appends `loadingStyle` +
 *     `inert` directly onto the single `<svg>` (upstream clones the svg inside
 *     `<SkeletonWrapper>`, which renders no wrapping element; the port applies
 *     the same classes + ref directly — identical single-`<svg>` DOM).
 *
 * The shimmer itself is driven by the **Web Animations API**
 * (`element.animate([{backgroundPosition:'100%'},{backgroundPosition:'0%'}],
 * {duration:2000, iterations:Infinity, easing:'ease-in-out'})` with
 * `startTime = 0` to sync every loading element on the page) — NOT a CSS
 * keyframe. Source is byte-identical between `skeleton/index.tsx` and
 * `Skeleton.tsx`. Only `background-position` animates; everything else is static.
 *
 * SCOPE. This is a deliberately scoped cert of Skeleton's DETERMINISTIC surface:
 *   - D1 (computed styles) pins the static skeleton treatment on the loading
 *     text/icon — the gradient (`background-image`), `background-size: 300%`,
 *     `box-decoration-break: clone`, the `sm` `border-radius`, `color: transparent`
 *     on the inner line-boxes, and `-webkit-text-fill-color: transparent` on the
 *     outer text span. The animated `background-position` is NOT in the allowlist
 *     (never added here), so the WAAPI shimmer never destabilises the capture.
 *   - D6 (AX) pins the headline a11y contract: while loading, the inert skeleton
 *     content is REMOVED from the accessibility tree; once loaded, the real
 *     content (`Placeholder title`, the body copy, `Here is an icon.`) is
 *     restored — identically on both stacks. The D6 root is scoped to the text
 *     subtree (`.comparison-skeleton-copy`) so the cert does not depend on the
 *     Image's AX (a separate, not-yet-certified unit — see below).
 *
 * The rest are **not** registered, each for a source-verified reason:
 *   - D3 pixel: the only visual on the skeleton surface is the infinite WAAPI
 *     shimmer (animated `background-position`); a screenshot of an in-flight
 *     infinite animation is frame-timing-dependent, while the underlying gradient
 *     + geometry is already pinned byte-for-byte by D1. No stable pixel to diff.
 *   - D2 motion: the shimmer is a WAAPI `element.animate()` (not a CSS keyframe),
 *     so the computed `animation` property is `none` — D2 (which reads CSS
 *     keyframes / computed animation) cannot observe it. Its content/timing is
 *     verified byte-identical by source read (2000ms ease-in-out infinite,
 *     100% → 0%, `startTime = 0`).
 *   - D7 contrast: skeleton text is `color: transparent` — no legible text node.
 *   - D4 events / D5 focus: skeleton content is `inert` — not interactive.
 *   - D8 target-size: no interactive target.
 *
 * OUT OF SCOPE (documented, not a divergence): the demo's leading `Image` is
 * excluded from every driver here. The `Image` skeleton path (a `SkeletonWrapper`
 * clone of a real `<img>` with its own load timing) is the concern of a future
 * Image unit; folding it in would couple this cert to un-certified Image AX and
 * to image-load non-determinism. The Skeleton library contract exercised by the
 * Image (the same `loadingStyle` + `inert` + WAAPI ref) is already pinned here by
 * the text and icon captures.
 */
const skeletonScenario: DriverScenario = {
  slug: "skeleton",
  title: "Skeleton",
  // D1 target: the loading title's inner `<SkeletonText>` line-box — the richest
  // skeleton surface (loadingStyle gradient + color:transparent +
  // box-decoration-break:clone + sm radius). Structural, stack-neutral locator:
  // copy child 1 is the title `<Text>` span; its single child span is the
  // `<SkeletonText>`. (Only the `loading` case is a D1 steady state, so the
  // inner span always resolves.)
  target: ({ canvas }) =>
    canvas.locator(
      '[data-comparison-control-root="skeleton"] .comparison-skeleton-copy > *:nth-child(1) > span',
    ),
  parts: {
    // The OUTER title `<Text>` span — carries `-webkit-text-fill-color:
    // transparent` (the ellipsis-hiding skeleton signal) over the demo's title
    // font longhands.
    titleOuter: ({ canvas }) =>
      canvas.locator(
        '[data-comparison-control-root="skeleton"] .comparison-skeleton-copy > *:nth-child(1)',
      ),
    // The body copy's inner `<SkeletonText>` line-box — a second skeleton text
    // line (different font size) proving the treatment is per-`<Text>`.
    bodyInner: ({ canvas }) =>
      canvas.locator(
        '[data-comparison-control-root="skeleton"] .comparison-skeleton-copy > *:nth-child(2) > span',
      ),
    // The inline meta line's inner `<SkeletonText>` — the meta `<Text>` is
    // child 2 of the inline row (the icon is child 1).
    metaInner: ({ canvas }) =>
      canvas.locator(
        '[data-comparison-control-root="skeleton"] .comparison-skeleton-inline > *:nth-child(2) > span',
      ),
    // The skeleton `<Icon>` svg — a single element carrying iconStyles +
    // `border-radius: sm` (useSkeletonIcon) + `loadingStyle`, identical DOM on
    // both stacks (upstream clones the svg inside SkeletonWrapper; the port
    // applies the classes directly).
    icon: ({ canvas }) =>
      canvas.locator('[data-comparison-control-root="skeleton"] .comparison-skeleton-inline > svg'),
  },
  cases: [
    // Loading (the demo default): the skeleton treatment is live — the D1 case.
    { id: "loading", params: {} },
    // Loaded: content restored, no skeleton spans. Excluded from D1/D3 (the
    // inner `<SkeletonText>` spans no longer exist); used by D6 to prove the AX
    // tree is restored.
    { id: "loaded", params: { isLoading: "false" }, steadyState: false },
  ],
  // Non-interactive placeholder: no hover/focus/press treatment.
  states: ["default"],
  // Default allowlist already covers `background-image`, the four `border-*-radius`
  // corners, `color`, the font longhands and `width`/`height`. Add the skeleton
  // longhands it omits — but deliberately NOT `background-position` (the animated
  // WAAPI property), so the shimmer never destabilises the capture.
  styleProps: {
    add: ["background-size", "box-decoration-break", "-webkit-text-fill-color", "flex-shrink"],
  },
  // D6: while `loading`, the inert skeleton content is absent from the AX tree
  // (empty snapshot under the copy subtree); when `loaded`, `Placeholder title` /
  // the body copy / `Here is an icon.` are restored — identical on both stacks.
  // Root scoped to the text subtree so the (deferred) Image's AX is out of scope.
  ax: {
    cases: ["loading", "loaded"],
    roots: {
      copy: ({ canvas }) =>
        canvas.locator('[data-comparison-control-root="skeleton"] .comparison-skeleton-copy'),
    },
  },
};

registerStateMatrixDriver(skeletonScenario);
registerAxTreeDriver(skeletonScenario);
