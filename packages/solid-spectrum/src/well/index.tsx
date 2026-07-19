import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };

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
const wellStyles = style({
  display: "block",
  backgroundColor: "gray-100",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
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
