/* ── Glasselated — runtime for the signature treatments (SolidJS) ──
   Ported from the frozen external design repository's framework-neutral
   `glasselated.js` (see CREDITS.md, "Glasselated design lane"):
     • meshStrip()      — now lives in @proyecto-viviana/ui (Card's mesh axis rides it);
                          re-exported here so the shell keeps one implementation.
     • createMeshField()— Solid primitive: cursor-tracking (--mx/--my) + world-anchored mesh
                          alignment for every `.mesh-card` inside a root element.
     • dualWipe()       — canvas pixel-dissolve theme wipe (covers → swaps under cover → reveals). */
import { onCleanup, onMount } from "solid-js";

export { meshStrip } from "@proyecto-viviana/ui";
export type { MeshStripOptions } from "@proyecto-viviana/ui";

export type GlasselatedTheme = "dark" | "light";

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

export interface DualWipeOptions {
  readonly toTheme?: GlasselatedTheme;
  readonly onCovered?: () => void; // does the theme swap, fired under full cover
  readonly coverColor?: string;
  readonly accent?: string;
  readonly tileSize?: number;
  readonly coverDur?: number;
  readonly revealDur?: number;
  readonly originSelector?: string;
  readonly onDone?: () => void;
}

const BAYER8: readonly (readonly number[])[] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

let wipeCanvas: HTMLCanvasElement | null = null;
let wipeRAF = 0;

/* Full-viewport pixel-dissolve theme wipe: a canvas curtain covers from the most-centered
   `[data-appear]` component outward, fires `onCovered` (which swaps the theme in one clean
   re-render) under full cover, then dissolves the curtain away. Nothing clones the DOM. */
export function dualWipe(host: HTMLElement | null, opts: DualWipeOptions = {}): void {
  const swap =
    opts.onCovered ??
    (() => {
      if (host) {
        host.setAttribute(
          "data-theme",
          opts.toTheme ?? (host.getAttribute("data-theme") === "dark" ? "light" : "dark"),
        );
      }
    });

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!host || reduceMotion) {
    swap();
    opts.onDone?.();
    return;
  }

  if (wipeRAF) cancelAnimationFrame(wipeRAF);
  if (wipeCanvas && wipeCanvas.parentNode) wipeCanvas.parentNode.removeChild(wipeCanvas);

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const size = opts.tileSize ?? 12;
  const cols = Math.ceil(vw / size);
  const rows = Math.ceil(vh / size);

  // origin = center of the most-viewport-centered marked component (fallback: viewport center)
  let ox = vw / 2;
  let oy = vh / 2;
  let bestD = Infinity;
  const comps = host.querySelectorAll<HTMLElement>(opts.originSelector ?? "[data-appear]");
  comps.forEach((comp) => {
    if (comp.hasAttribute("data-gl-follow")) return;
    const rect = comp.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const d = Math.hypot(cx - vw / 2, cy - vh / 2);
    if (d < bestD) {
      bestD = d;
      ox = cx;
      oy = cy;
    }
  });

  let maxD = 1;
  for (let cy2 = 0; cy2 < 2; cy2++) {
    for (let cx2 = 0; cx2 < 2; cx2++) {
      const dd = Math.hypot(cx2 * vw - ox, cy2 * vh - oy);
      if (dd > maxD) maxD = dd;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(vw * dpr);
  canvas.height = Math.round(vh * dpr);
  canvas.style.cssText = `position:fixed;left:0;top:0;width:${vw}px;height:${vh}px;margin:0;padding:0;pointer-events:none;z-index:2147483600;`;
  document.body.appendChild(canvas);
  wipeCanvas = canvas;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    swap();
    canvas.remove();
    wipeCanvas = null;
    opts.onDone?.();
    return;
  }
  ctx.scale(dpr, dpr);

  const cover =
    opts.coverColor ??
    (getComputedStyle(host).getPropertyValue("--surface-app") || "#0C0D10").trim();
  const accent = opts.accent ?? "#76b8fe";
  const coverDur = opts.coverDur ?? 300;
  const revealDur = opts.revealDur ?? 360;
  let start: number | null = null;
  let swapped = false;
  let cleaned = false;

  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    if (wipeRAF) cancelAnimationFrame(wipeRAF);
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (wipeCanvas === canvas) wipeCanvas = null;
    opts.onDone?.();
  };

  const frame = (ts: number): void => {
    if (start == null) start = ts;
    const elapsed = ts - start;
    ctx.clearRect(0, 0, vw, vh);
    const pc = Math.min(1, elapsed / coverDur);
    const pr = elapsed <= coverDur ? 0 : Math.min(1, (elapsed - coverDur) / revealDur);
    const coverFront = pc * 1.15;
    const revealFront = pr * 1.15;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * size + size / 2;
        const py = y * size + size / 2;
        const nd = Math.hypot(px - ox, py - oy) / maxD;
        const jit = (BAYER8[y & 7]![x & 7]! / 64 - 0.5) * 0.14;
        const t = nd + jit;
        if (t <= coverFront && t > revealFront) {
          const edge = coverFront < 0.88 && t > coverFront - 0.05;
          ctx.fillStyle = edge && (x * 7 + y * 3) % 5 === 0 ? accent : cover;
          ctx.fillRect(x * size, y * size, size + 1, size + 1);
        }
      }
    }
    if (!swapped && pc >= 1) {
      swapped = true;
      swap();
    }
    if (pr >= 1) {
      cleanup();
      return;
    }
    wipeRAF = requestAnimationFrame(frame);
  };
  wipeRAF = requestAnimationFrame(frame);

  // failsafes: guarantee the swap + curtain removal even if rAF is throttled (background tab)
  window.setTimeout(() => {
    if (!swapped) {
      swapped = true;
      swap();
    }
  }, coverDur + 60);
  window.setTimeout(cleanup, coverDur + revealDur + 260);
}
