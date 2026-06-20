// An app-authored style() macro call against the design system's macro seam.
// Consuming the *pre-built* ui components needs no macro plugin (their style()
// calls are already expanded in the published build). This is the other case:
// the app writes its OWN style() against `@proyecto-viviana/ui/style`, so its
// build must run the macro — via the published `vivianaMacros()` helper.
//
// The arbitrary `[#abcdef]` background is a sentinel the smoke greps for in the
// generated CSS: its presence proves the macro emitted real CSS and the helper
// loaded it into the bundle. The conditional `backgroundColor` (a `variant`
// custom condition, mirroring src/custom/chip) makes the macro return a runtime
// *function* rather than a static class string — so calling `box({ variant })`
// also exercises the macro-generated runtime under SSR, not just a string.
import { style } from "@proyecto-viviana/ui/style" with { type: "macro" };

const box = style({
  display: "flex",
  alignItems: "center",
  padding: 16,
  borderRadius: "full",
  color: "[var(--color-text)]",
  backgroundColor: {
    default: "[#abcdef]",
    variant: { muted: "[var(--color-bg-200)]" },
  },
});

export function Styled() {
  return <div class={box({ variant: "muted" })}>macro styled</div>;
}
