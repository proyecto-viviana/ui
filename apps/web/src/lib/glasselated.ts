/* ── Glasselated — runtime for the signature treatments (SolidJS) ──
   Ported from the frozen external design repository's framework-neutral
   `glasselated.js` (see CREDITS.md, "Glasselated design lane"):
     • meshStrip()      — now lives in @proyecto-viviana/ui (Card's mesh axis rides it);
                          re-exported here so the shell keeps one implementation.
     • createMeshField()— Solid primitive: cursor-tracking (--mx/--my) + world-anchored mesh
                          alignment for every `.mesh-card` inside a root element.
     • dualWipe()       — canvas pixel-dissolve theme wipe (snapshot old → swap → Bayer reveal). */
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
  readonly onCovered?: () => void; // does the theme swap, fired once the old snapshot is painted
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
let wipeGen = 0;
let wipeTimer = 0;

/* Tile-resolution snapshot of the live old page. foreignObject of the full
   document hangs on this CSS (filters + url() raster); getComputedStyle on
   documentElement does too. A header band + scheme fill keep the bitmap from
   being one --surface-app field, without walking the tree. */
function snapshotTiles(cols: number, rows: number): HTMLCanvasElement | null {
  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const ctx = off.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  const dark = document.documentElement.getAttribute("data-color-scheme") !== "light";
  ctx.fillStyle = dark ? "#0C0D10" : "#e9eff6";
  ctx.fillRect(0, 0, cols, rows);
  ctx.fillStyle = dark ? "#16171c" : "#f4f7fb";
  ctx.fillRect(0, 0, cols, Math.max(2, Math.round(rows * 0.08)));
  return off;
}

function abortInFlight(): void {
  wipeGen += 1;
  if (wipeRAF) cancelAnimationFrame(wipeRAF);
  wipeRAF = 0;
  if (wipeTimer) window.clearTimeout(wipeTimer);
  wipeTimer = 0;
  if (wipeCanvas && wipeCanvas.parentNode) wipeCanvas.parentNode.removeChild(wipeCanvas);
  wipeCanvas = null;
}

function defaultSwap(host: HTMLElement | null, opts: DualWipeOptions): () => void {
  return () => {
    if (host) {
      host.setAttribute(
        "data-theme",
        opts.toTheme ?? (host.getAttribute("data-theme") === "dark" ? "light" : "dark"),
      );
    }
  };
}

/* Full-viewport pixel-dissolve theme wipe: rasterize the live old page, overlay that
   bitmap, fire `onCovered` (theme swap) under it, then dissolve Bayer 12px tiles so
   the live new page shows through. Never fills the viewport with `--surface-app`. */
export function dualWipe(host: HTMLElement | null, opts: DualWipeOptions = {}): void {
  const swap = opts.onCovered ?? defaultSwap(host, opts);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!host || reduceMotion) {
    abortInFlight();
    swap();
    opts.onDone?.();
    return;
  }

  abortInFlight();
  const gen = wipeGen;

  const canvas = document.createElement("canvas");
  canvas.width = 12;
  canvas.height = 12;
  canvas.setAttribute(
    "style",
    "position:fixed;left:0;top:0;width:12px;height:12px;margin:0;padding:0;pointer-events:none;z-index:2147483600;image-rendering:pixelated;",
  );
  canvas.setAttribute("data-theme-wipe", "");
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  canvas.style.transform = `scale(${String(vw / 12)},${String(vh / 12)})`;
  canvas.style.transformOrigin = "0 0";
  document.documentElement.appendChild(canvas);
  wipeCanvas = canvas;
  swap();
  document.documentElement.appendChild(canvas);

  /* 2d dissolve on a macrotask so the overlay is observable before getContext. */
  wipeTimer = window.setTimeout(() => {
    wipeTimer = 0;
    if (gen !== wipeGen) return;
    dissolveWipe(canvas, opts, gen);
  }, 50);
}

function dissolveWipe(canvas: HTMLCanvasElement, opts: DualWipeOptions, gen: number): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cols = canvas.width;
  const rows = canvas.height;
  const accent = opts.accent ?? "#76b8fe";
  const coverDur = opts.coverDur ?? 300;
  const revealDur = opts.revealDur ?? 360;
  const dur = coverDur + revealDur;
  const ox = cols / 2;
  const oy = rows / 2;
  let maxD = 1;
  for (let cy2 = 0; cy2 < 2; cy2++) {
    for (let cx2 = 0; cx2 < 2; cx2++) {
      const dd = Math.hypot(cx2 * cols - ox, cy2 * rows - oy);
      if (dd > maxD) maxD = dd;
    }
  }

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    window.setTimeout(() => {
      if (gen !== wipeGen) return;
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      if (wipeCanvas === canvas) wipeCanvas = null;
      opts.onDone?.();
    }, dur + 260);
    return;
  }

  const sx = vw / cols;
  const sy = vh / rows;
  canvas.style.width = `${String(cols)}px`;
  canvas.style.height = `${String(rows)}px`;
  canvas.style.transform = `scale(${String(sx)},${String(sy)})`;
  canvas.style.transformOrigin = "0 0";
  const bitmap = snapshotTiles(cols, rows);
  if (bitmap) ctx.drawImage(bitmap, 0, 0);
  document.documentElement.appendChild(canvas);

  let start: number | null = null;
  let lastFront = -1;
  let cleaned = false;

  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    if (wipeRAF) cancelAnimationFrame(wipeRAF);
    wipeRAF = 0;
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    if (wipeCanvas === canvas) wipeCanvas = null;
    opts.onDone?.();
  };

  const frame = (ts: number): void => {
    if (gen !== wipeGen) {
      cleanup();
      return;
    }
    if (start == null) start = ts;
    const elapsed = Math.max(0, ts - start);
    const p = Math.min(1, elapsed / dur);
    const front = p * 1.15;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nd = Math.hypot(x + 0.5 - ox, y + 0.5 - oy) / maxD;
        const jit = (BAYER8[y & 7]![x & 7]! / 64 - 0.5) * 0.14;
        const t = nd + jit;
        if (t <= front && t > lastFront) {
          ctx.clearRect(x, y, 1, 1);
          const edge = front < 0.88 && t > front - 0.05;
          if (edge && (x * 7 + y * 3) % 5 === 0) {
            ctx.fillStyle = accent;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
    lastFront = front;
    if (p >= 1) {
      cleanup();
      return;
    }
    wipeRAF = requestAnimationFrame(frame);
  };
  wipeRAF = requestAnimationFrame(frame);
  window.setTimeout(cleanup, dur + 260);
}
