/**
 * Manual Solid mounts are ES modules. ClientRouter swaps the document without
 * re-executing them, so every page mount must run again on `astro:after-swap`.
 */
export function mountOnAstroPage(mount: () => void, beforeSwap?: () => void): void {
  mount();
  document.addEventListener("astro:after-swap", () => {
    beforeSwap?.();
    mount();
  });
}
