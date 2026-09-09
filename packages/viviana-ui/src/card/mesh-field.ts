/* The mesh card's cursor field. Ported from the frozen external design
 * repository's framework-neutral `glasselated.js` (`onMove` + `align`; see
 * CREDITS.md, "Glasselated design lane"), which drove it off a document-wide
 * `.mesh-card` query; here each Card owns its own listener so the primitive
 * needs no registry and cleans up with the component.
 *
 * Two jobs, both pure paint:
 *   • `--mx` / `--my` — the cursor position in the card's own coordinates, which
 *     positions the hover spotlight and the spreading border ring.
 *   • `background-position` / `--gl-pos` — the weave is anchored to the page,
 *     not to the card, so neighbouring cards read as windows onto one continuous
 *     mesh rather than as tiles that each restart the pattern. That alignment
 *     has to be re-run whenever layout moves the card.
 *
 * Nothing here runs on the server: the resting values are the CSS fallbacks
 * (`50%`, `0 0`), so a server render and its hydration pass agree. */
import { createEffect, onCleanup } from "solid-js";

export function createMeshField(
  getElement: () => HTMLElement | undefined,
  isEnabled: () => boolean,
): void {
  const align = (): void => {
    const element = getElement();
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const position = `${String(-(rect.left + window.scrollX))}px ${String(-(rect.top + window.scrollY))}px`;
    element.style.backgroundPosition = position;
    element.style.setProperty("--gl-pos", position);
  };

  createEffect(() => {
    if (!isEnabled()) return;
    let frame = 0;
    const onMove = (event: MouseEvent): void => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const element = getElement();
        if (!element) return;
        const rect = element.getBoundingClientRect();
        element.style.setProperty("--mx", `${String(event.clientX - rect.left)}px`);
        element.style.setProperty("--my", `${String(event.clientY - rect.top)}px`);
      });
    };
    document.addEventListener("mousemove", onMove);
    window.addEventListener("resize", align);
    align();
    // Fonts and images settle after first paint and move the card under the weave.
    const settle = window.setTimeout(align, 400);
    onCleanup(() => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", align);
      window.clearTimeout(settle);
      if (frame) cancelAnimationFrame(frame);
    });
  });
}
