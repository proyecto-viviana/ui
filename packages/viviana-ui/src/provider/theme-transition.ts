/* The register's theme swap. Ported from the frozen external design repository's
 * framework-neutral `glasselated.js` (`dissolveWipe`; see CREDITS.md,
 * "Glasselated design lane") and replacing the older `dualWipe`, which covered
 * the page with a low-resolution guess at its own layout before swapping.
 *
 * There is no intermediate cover here: a frozen clone of the old theme sits over
 * the viewport, the live tree swaps underneath it immediately, and a hard-edged
 * radial mask erases the clone from the click outward. Every pixel is therefore
 * either fully old or fully new, and the boundary is a dithered band — the same
 * pixel grammar as the rest of the register.
 *
 * The functional outcome never depends on the animation: the swap happens before
 * the first frame, and a failsafe timer removes the clone even if rAF never runs
 * (background tab, throttled renderer). Under `prefers-reduced-motion` the swap
 * is instant and nothing is cloned. */
import { onCleanup } from "solid-js";

export interface ThemeTransitionOptions {
  /** Where the wave starts, in viewport pixels. @default the last pointerdown, else the viewport centre */
  readonly origin?: { readonly x: number; readonly y: number } | undefined;
  /** @default 640 */
  readonly dur?: number | undefined;
  /** Width of the dithered wavefront, in pixels. @default 56 */
  readonly band?: number | undefined;
  /** Dither cell, in pixels. @default 8 */
  readonly tile?: number | undefined;
  /** Colour of the sparkle on the wavefront. @default the register's accent pink */
  readonly accent?: string | undefined;
  /** @default true */
  readonly sparkle?: boolean | undefined;
  /** Runs once the clone is gone, animated or not. */
  readonly onDone?: (() => void) | undefined;
}

/* An irregular wavefront: a fractal-noise tile intersected with the ring, so the
 * boundary is noisy rather than a clean expanding circle. */
const GRAIN_TILE = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><filter id='g'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='3' seed='7' stitchTiles='stitch'/>" +
    "<feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 6 -2.6'/></filter>" +
    "<rect width='100%' height='100%' filter='url(#g)' fill='#000'/></svg>",
)}")`;

const CHECKER = "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)";
/* Beyond the band the old theme is still solid. */
const SOLID =
  "radial-gradient(circle at var(--gl-ox) var(--gl-oy), transparent calc(var(--gl-r) + var(--gl-band) / 2), #000 calc(var(--gl-r) + var(--gl-band) / 2 + 0.5px))";
/* Inside the band the old theme thins out toward the new side. */
const RING =
  "radial-gradient(circle at var(--gl-ox) var(--gl-oy), transparent calc(var(--gl-r) - var(--gl-band) / 2), rgba(0, 0, 0, 0.15) calc(var(--gl-r) - var(--gl-band) / 2 + 1px), rgba(0, 0, 0, 0.6) var(--gl-r), #000 calc(var(--gl-r) + var(--gl-band) / 2), transparent calc(var(--gl-r) + var(--gl-band) / 2 + 0.5px))";
/* The snapshot must not keep animating, and it must not re-run entrance animations. */
const FREEZE_CSS =
  "[data-gl-clone] * { animation-play-state: paused !important; transition: none !important }" +
  "[data-gl-clone] .boot, [data-gl-clone] .typed { animation-delay: -100s !important }";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setMask(
  element: HTMLElement,
  layers: readonly string[],
  sizes: string,
  repeat: string,
): void {
  const image = layers.join(", ");
  element.style.setProperty("-webkit-mask-image", image);
  element.style.setProperty("mask-image", image);
  element.style.setProperty("-webkit-mask-size", sizes);
  element.style.setProperty("mask-size", sizes);
  element.style.setProperty("-webkit-mask-repeat", repeat);
  element.style.setProperty("mask-repeat", repeat);
}

/**
 * Solid primitive: returns a `transition(onSwap)` that swaps the theme under a
 * pixel-dissolve of the outgoing one. `onSwap` does the actual swap (set the
 * color scheme, flip the attribute) and is always called exactly once, whether
 * or not the animation runs.
 */
export function createThemeTransition(
  getHost: () => HTMLElement | undefined,
  options: ThemeTransitionOptions = {},
): (onSwap: () => void) => void {
  /* Captured, so the origin is the toggle the user actually pressed even when the
   * handler stops the event on the way down. */
  let lastClick: { x: number; y: number } | undefined;
  if (typeof document !== "undefined") {
    /* Bound now rather than on mount: the listener has to be in place for the very
     * first click, which may land before effects have flushed. */
    const onPointerDown = (event: PointerEvent): void => {
      lastClick = { x: event.clientX, y: event.clientY };
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    onCleanup(() => {
      document.removeEventListener("pointerdown", onPointerDown, true);
    });
  }

  let mounted: HTMLElement | undefined;
  const dropClone = (): void => {
    mounted?.remove();
    mounted = undefined;
  };
  onCleanup(dropClone);

  return (onSwap: () => void): void => {
    const host = getHost();
    dropClone();
    if (!host || prefersReducedMotion()) {
      onSwap();
      options.onDone?.();
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const origin = options.origin ?? lastClick ?? { x: vw / 2, y: vh / 2 };
    const dur = options.dur ?? 640;
    const band = options.band ?? 56;
    const tile = options.tile ?? 8;
    const maxR = Math.max(
      Math.hypot(origin.x, origin.y),
      Math.hypot(vw - origin.x, origin.y),
      Math.hypot(origin.x, vh - origin.y),
      Math.hypot(vw - origin.x, vh - origin.y),
    );

    const rect = host.getBoundingClientRect();
    const inner = host.cloneNode(true) as HTMLElement;
    inner.setAttribute("data-gl-clone", "");
    inner.removeAttribute("id");
    inner.style.cssText += `;position:fixed;left:${String(rect.left)}px;top:${String(rect.top)}px;width:${String(rect.width)}px;height:${String(rect.height)}px;margin:0;pointer-events:none;overflow:hidden;will-change:mask-position;`;

    /* cloneNode does not copy scroll offsets, and a snapshot scrolled back to the
     * top is visibly not the page the user was looking at. */
    const source = host.querySelectorAll("*");
    const copies = inner.querySelectorAll("*");
    for (let i = 0; i < source.length; i++) {
      const from = source[i] as HTMLElement;
      const to = copies[i] as HTMLElement | undefined;
      if (!to) break;
      if (from.scrollTop) to.scrollTop = from.scrollTop;
      if (from.scrollLeft) to.scrollLeft = from.scrollLeft;
    }
    const freeze = document.createElement("style");
    freeze.textContent = FREEZE_CSS;
    inner.appendChild(freeze);

    inner.style.setProperty("--gl-ox", `${String(origin.x - rect.left)}px`);
    inner.style.setProperty("--gl-oy", `${String(origin.y - rect.top)}px`);
    inner.style.setProperty("--gl-r", "0px");
    inner.style.setProperty("--gl-band", `${String(band)}px`);
    setMask(
      inner,
      [RING, GRAIN_TILE, CHECKER],
      `100% 100%, 256px 256px, ${String(tile)}px ${String(tile)}px`,
      "no-repeat, repeat, repeat",
    );
    inner.style.setProperty("-webkit-mask-composite", "source-in, source-in");
    inner.style.setProperty("mask-composite", "intersect, intersect");

    const outer = inner.cloneNode(true) as HTMLElement;
    setMask(outer, [SOLID], "100% 100%", "no-repeat");
    outer.style.removeProperty("mask-composite");
    outer.style.removeProperty("-webkit-mask-composite");

    const wrap = document.createElement("div");
    wrap.setAttribute("data-gl-clone-wrap", "");
    wrap.style.cssText = "position:fixed;inset:0;z-index:2147483000;pointer-events:none;";
    wrap.append(outer, inner);
    document.body.appendChild(wrap);
    mounted = wrap;

    /* The snapshot is frozen, so its cards must not keep tracking the live cursor. */
    wrap.querySelectorAll<HTMLElement>("[data-mesh]").forEach((card) => {
      card.style.setProperty("--mx", "-999px");
      card.style.setProperty("--my", "-999px");
    });

    onSwap();

    let canvas: HTMLCanvasElement | undefined;
    let ctx: CanvasRenderingContext2D | null = null;
    if (options.sparkle !== false) {
      canvas = document.createElement("canvas");
      canvas.width = vw;
      canvas.height = vh;
      canvas.style.cssText = "position:fixed;inset:0;z-index:2147483001;pointer-events:none;";
      document.body.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }

    const accent = options.accent ?? "#ff9edb";
    let start: number | null = null;
    let done = false;
    let failsafe = 0;
    const cleanup = (): void => {
      if (done) return;
      done = true;
      window.clearTimeout(failsafe);
      wrap.remove();
      canvas?.remove();
      if (mounted === wrap) mounted = undefined;
      options.onDone?.();
    };

    const frame = (ts: number): void => {
      if (done) return;
      start ??= ts;
      const p = Math.min(1, (ts - start) / dur);
      const eased = 1 - (1 - p) ** 2;
      const r = eased * (maxR + band);
      outer.style.setProperty("--gl-r", `${String(r)}px`);
      inner.style.setProperty("--gl-r", `${String(r)}px`);
      if (ctx) {
        ctx.clearRect(0, 0, vw, vh);
        if (p < 0.92) {
          ctx.fillStyle = accent;
          const n = Math.max(24, Math.floor(r / 6));
          for (let k = 0; k < n; k++) {
            if ((k * 7 + Math.floor(p * 60)) % 4 !== 0) continue;
            const a = (k / n) * Math.PI * 2 + p * 0.7;
            const jr = r + (((k * 37) % 11) - 5) * (band / 12);
            const x = Math.floor((origin.x + Math.cos(a) * jr) / tile) * tile;
            const y = Math.floor((origin.y + Math.sin(a) * jr) / tile) * tile;
            ctx.fillRect(x, y, tile, tile);
          }
        }
      }
      if (p >= 1) {
        cleanup();
        return;
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    failsafe = window.setTimeout(cleanup, dur + 300);
  };
}
