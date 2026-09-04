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
let wipeLayout: HTMLElement | null = null;
let wipeRAF = 0;
let wipeGen = 0;
let wipeTimer = 0;

const WIPE_TILES = 12;
const SURFACE_FILLS = new Set(["#0c0d10", "#e9eff6", "#16171c", "#f4f7fb"]);

function judgeColors(colors: string[]): boolean {
  if (colors.length < 3) return false;
  return !colors.every((color) => SURFACE_FILLS.has(color.toLowerCase()));
}

type LayoutMark = { left: number; top: number; width: number; height: number; color: string };

/* Live old-page layout snapshot. SVG-as-image foreignObject of this CSS never
   finishes; getComputedStyle under the wipe canvas hangs SwiftShader. Empty
   marks take the no-canvas path — never a --surface-app fill. */
function captureOldLayout(): LayoutMark[] {
  const dark = document.documentElement.getAttribute("data-color-scheme") !== "light";
  const ink = dark ? "#e8eef7" : "#1a1d24";
  const elevated = dark ? "#3a4254" : "#c5d0de";
  const muted = dark ? "#8b93a4" : "#4a5568";
  const marks: LayoutMark[] = [];
  const push = (el: Element | null, color: string): void => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    marks.push({ left: rect.left, top: rect.top, width: rect.width, height: rect.height, color });
  };
  push(document.querySelector("header, .gls-topbar"), elevated);
  push(document.querySelector("aside, nav, .gls-topbar-nav"), muted);
  push(document.querySelector(".gls-brand, header a, h1"), ink);
  const labels = document.querySelectorAll(
    "header a, header button, .gls-brand, .gls-navlink, .gls-back, h1",
  );
  const cap = Math.min(labels.length, 24);
  for (let i = 0; i < cap; i++) {
    const el = labels[i] as HTMLElement;
    if (!(el.textContent ?? "").trim()) continue;
    push(el, ink);
  }
  return marks;
}

function mountLayoutOverlay(marks: LayoutMark[]): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("data-theme-wipe-layout", "");
  root.setAttribute(
    "style",
    "position:fixed;left:0;top:0;width:100%;height:100%;margin:0;padding:0;pointer-events:none;z-index:2147483601;overflow:hidden;",
  );
  for (const mark of marks) {
    const box = document.createElement("div");
    box.setAttribute(
      "style",
      `position:absolute;left:${String(mark.left)}px;top:${String(mark.top)}px;width:${String(mark.width)}px;height:${String(mark.height)}px;background:${mark.color};`,
    );
    root.appendChild(box);
  }
  document.documentElement.appendChild(root);
  return root;
}

function abortInFlight(): void {
  wipeGen += 1;
  if (wipeRAF) cancelAnimationFrame(wipeRAF);
  wipeRAF = 0;
  if (wipeTimer) window.clearTimeout(wipeTimer);
  wipeTimer = 0;
  if (wipeLayout && wipeLayout.parentNode) wipeLayout.parentNode.removeChild(wipeLayout);
  wipeLayout = null;
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

function swapWithoutCanvas(swap: () => void, opts: DualWipeOptions): void {
  swap();
  opts.onDone?.();
}

function dropCanvas(canvas: HTMLCanvasElement): void {
  if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  if (wipeCanvas === canvas) wipeCanvas = null;
}

/* Overlay a live old-viewport tile snapshot, swap under it, then Bayer-dissolve.
   SVG-as-image foreignObject of this CSS never finishes; a --surface-app fill is
   not a snapshot. getContext stays on the post-click macrotask. Failed / fill-only
   samples take the no-canvas path. */
export function dualWipe(host: HTMLElement | null, opts: DualWipeOptions = {}): void {
  const swap = opts.onCovered ?? defaultSwap(host, opts);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!host || reduceMotion) {
    abortInFlight();
    swapWithoutCanvas(swap, opts);
    return;
  }

  abortInFlight();
  const gen = wipeGen;
  const marks = captureOldLayout();
  const markColors = [...new Set(marks.map((mark) => mark.color))];
  if (!judgeColors(markColors)) {
    swapWithoutCanvas(swap, opts);
    return;
  }
  const cols = WIPE_TILES;
  const rows = WIPE_TILES;
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  canvas.setAttribute("data-theme-wipe", "");
  canvas.setAttribute("data-theme-wipe-colors", markColors.join(","));
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  canvas.setAttribute(
    "style",
    "position:fixed;left:0;top:0;width:12px;height:12px;margin:0;padding:0;pointer-events:none;z-index:2147483600;image-rendering:pixelated;",
  );
  canvas.style.transform = `scale(${String(vw / cols)},${String(vh / rows)})`;
  canvas.style.transformOrigin = "0 0";
  document.documentElement.appendChild(canvas);
  wipeCanvas = canvas;
  wipeLayout = mountLayoutOverlay(marks);
  swap();

  wipeTimer = window.setTimeout(() => {
    wipeTimer = 0;
    if (gen !== wipeGen) return;
    if (wipeLayout && wipeLayout.parentNode) wipeLayout.parentNode.removeChild(wipeLayout);
    wipeLayout = null;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      dropCanvas(canvas);
      opts.onDone?.();
      return;
    }
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = ((x + 0.5) * vw) / cols;
        const py = ((y + 0.5) * vh) / rows;
        let hex: string | null = null;
        for (const mark of marks) {
          if (
            px >= mark.left &&
            px < mark.left + mark.width &&
            py >= mark.top &&
            py < mark.top + mark.height
          ) {
            hex = mark.color;
          }
        }
        if (!hex) continue;
        ctx.fillStyle = hex;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    dissolveWipe(canvas, ctx, opts, gen, cols, rows, cols / 2, rows / 2);
  }, 50);
}

function dissolveWipe(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  opts: DualWipeOptions,
  gen: number,
  cols: number,
  rows: number,
  ox: number,
  oy: number,
): void {
  const accent = opts.accent ?? "#76b8fe";
  const coverDur = opts.coverDur ?? 300;
  const revealDur = opts.revealDur ?? 360;
  const dur = coverDur + revealDur;
  let maxD = 1;
  for (let cy2 = 0; cy2 < 2; cy2++) {
    for (let cx2 = 0; cx2 < 2; cx2++) {
      const dd = Math.hypot(cx2 * cols - ox, cy2 * rows - oy);
      if (dd > maxD) maxD = dd;
    }
  }

  let start: number | null = null;
  let lastFront = -1;
  let cleaned = false;

  const cleanup = (): void => {
    if (cleaned) return;
    cleaned = true;
    if (wipeRAF) cancelAnimationFrame(wipeRAF);
    wipeRAF = 0;
    if (wipeTimer) window.clearTimeout(wipeTimer);
    wipeTimer = 0;
    dropCanvas(canvas);
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
  wipeTimer = window.setTimeout(cleanup, dur + 260);
}
