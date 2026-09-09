/* ── Glasselated — runtime for the signature treatments (SolidJS) ──
   Ported from the frozen external design repository's framework-neutral
   `glasselated.js` (see CREDITS.md, "Glasselated design lane"):
     • meshStrip()      — now lives in @proyecto-viviana/ui (Card's mesh axis rides it);
                          re-exported here so the shell keeps one implementation.
     • createMeshField()— Solid primitive: cursor-tracking (--mx/--my) + world-anchored mesh
                          alignment for every `.mesh-card` inside a root element.
   The theme wipe used to live here too; it is now the library's
   `createThemeTransition`, which dissolves the old frame instead of covering it. */
import { onCleanup, onMount } from "solid-js";

export { meshStrip } from "@proyecto-viviana/ui";
export type { MeshStripOptions } from "@proyecto-viviana/ui";

/* Cursor tracking + world-anchored mesh alignment for `.mesh-card`s inside `getRoot()`.
   Returns an `align` fn so the caller can re-run it when the mesh image changes (e.g. theme). */
export function createMeshField(getRoot: () => HTMLElement | undefined): () => void {
  const align = (): void => {
    const root = getRoot();
    if (!root) return;
    const sx = window.scrollX;
    const sy = window.scrollY;
    root.querySelectorAll<HTMLElement>(".mesh-card").forEach((el) => {
      const rect = el.getBoundingClientRect();
      el.style.backgroundPosition = `${-(rect.left + sx)}px ${-(rect.top + sy)}px`;
    });
  };

  onMount(() => {
    let raf = 0;
    const onMove = (event: MouseEvent): void => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const root = getRoot();
        if (!root) return;
        root.querySelectorAll<HTMLElement>(".mesh-card").forEach((el) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          el.style.setProperty("--my", `${event.clientY - rect.top}px`);
        });
      });
    };
    document.addEventListener("mousemove", onMove);
    window.addEventListener("resize", align);
    align();
    const settle = window.setTimeout(align, 400); // after fonts/images settle
    onCleanup(() => {
      document.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", align);
      window.clearTimeout(settle);
      if (raf) cancelAnimationFrame(raf);
    });
  });

  return align;
}
