import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };
import { wellScan } from "../s2-internal/style-utils" with { type: "macro" };

export interface WellProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
}

// Well has no Spectrum 2 upstream (S2 retired it), so its look is composed from
// S2 design tokens directly rather than mirrored from a pinned component: a subtle
// inset panel — a neutral `gray-100` surface, a 1px `gray-300` hairline, the standard
// `lg` radius, and 16px of inset padding. (`gray-100` is used, not the `layer-1`
// abstraction, because `layer-1` compiles to a `--s2-container-bg` variable that only
// the Card/Provider container machinery reads — a bare element would get no fill.)
// Emitting through the `style()` macro (not hand-authored utility classes) means the
// CSS ships in the package's `styles.css` bundle, so installed consumers get it
// without any Tailwind backfill.
// The handoff has a Well of its own (TerminalGlassLab.tsx:262) and it is the one
// container that is emphatically NOT glass — "matte / opaque, NEVER glass"
// (design-handoff-v2.css:56). So this takes no blur and no rim — but it is not bare
// either: the handoff opens every well with a `<ScanOverlay />`, the 4px `--well-scan`
// dither, which is the one layer that separates a well from a plain rectangle. That
// texture is `wellScan()` (s2-internal/style-utils.ts), the same helper the `matte`
// register hands every field, so this container and the fields inside it share one
// surface. `--well-scan` itself is declared per scheme in viviana-tokens.css:265
// (dark) and :559 (light). `Well` is spread here by hand rather than inherited,
// because it composes its look from tokens directly and never routes through
// `control()`. `lg` is already the handoff's 10px well corner, so the radius needed
// no change; only the two grays did.
const wellStyles = style({
  display: "block",
  backgroundColor: "well",
  ...wellScan(),
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "well-border",
  borderRadius: "lg",
  padding: 16,
});

/**
 * A Well is a styled container that groups content into an inset, subtly
 * emphasized region — for example a code sample or a callout block.
 */
export function Well(props: WellProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "children"]);
  return (
    <div {...domProps} class={[wellStyles, local.class].filter(Boolean).join(" ")}>
      {local.children}
    </div>
  );
}
