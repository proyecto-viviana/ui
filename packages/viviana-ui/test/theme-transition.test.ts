import { createRoot } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { createThemeTransition } from "../src/provider/theme-transition";

const realMatchMedia = window.matchMedia.bind(window);

function stubReducedMotion(reduce: boolean): void {
  window.matchMedia = (query: string) =>
    ({ matches: reduce && query.includes("reduced-motion") }) as MediaQueryList;
}

afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.unstubAllGlobals();
  vi.useRealTimers();
  document.body.replaceChildren();
});

/* The swap is the functional outcome and the dissolve is decoration, so every test
 * here is about the swap surviving the decoration failing. */
describe("createThemeTransition", () => {
  it("swaps instantly and clones nothing under reduced motion", () => {
    stubReducedMotion(true);
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      const onDone = vi.fn();
      const transition = createThemeTransition(() => host, { onDone, sparkle: false });
      const onSwap = vi.fn();

      transition(onSwap);

      expect(onSwap).toHaveBeenCalledTimes(1);
      expect(onDone).toHaveBeenCalledTimes(1);
      expect(document.querySelector("[data-gl-clone-wrap]")).toBeNull();
      dispose();
    });
  });

  it("still swaps when there is no host to clone", () => {
    stubReducedMotion(false);
    createRoot((dispose) => {
      const transition = createThemeTransition(() => undefined);
      const onSwap = vi.fn();
      transition(onSwap);
      expect(onSwap).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it("has the snapshot up before the live tree swaps", () => {
    /* Swapping first would flash the new theme for a frame before the wave starts. */
    stubReducedMotion(false);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      const transition = createThemeTransition(() => host, { sparkle: false });
      let wrapAtSwap: Element | null = null;

      transition(() => {
        wrapAtSwap = document.querySelector("[data-gl-clone-wrap]");
      });

      expect(wrapAtSwap).not.toBeNull();
      /* Two snapshots: the solid old region and the dithered band. */
      expect(document.querySelectorAll("[data-gl-clone]")).toHaveLength(2);
      dispose();
    });
  });

  it("clears the snapshot on a failsafe timer when frames never arrive", () => {
    /* A throttled background tab never runs rAF; without the timer the page is
     * left permanently covered by a frozen copy of the old theme. */
    stubReducedMotion(false);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    vi.useFakeTimers();
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      const onDone = vi.fn();
      const transition = createThemeTransition(() => host, { dur: 100, onDone, sparkle: false });

      transition(() => undefined);
      expect(document.querySelector("[data-gl-clone-wrap]")).not.toBeNull();

      vi.advanceTimersByTime(100 + 300);
      expect(document.querySelector("[data-gl-clone-wrap]")).toBeNull();
      expect(onDone).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it("starts the wave at the last pointerdown, seen in the capture phase", () => {
    /* The toggle usually stops the event, so a bubble-phase listener would miss it
     * and every swap would start from the middle of the screen instead. */
    stubReducedMotion(false);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      const button = document.createElement("button");
      button.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
      });
      host.appendChild(button);
      const transition = createThemeTransition(() => host, { band: 40, sparkle: false });

      button.dispatchEvent(
        new PointerEvent("pointerdown", { clientX: 120, clientY: 64, bubbles: true }),
      );
      transition(() => undefined);

      const band = document.querySelectorAll<HTMLElement>("[data-gl-clone]")[1];
      expect(band?.style.getPropertyValue("--gl-ox")).toBe("120px");
      expect(band?.style.getPropertyValue("--gl-oy")).toBe("64px");
      expect(band?.style.getPropertyValue("--gl-band")).toBe("40px");
      dispose();
    });
  });

  it("intersects the band with grain and checker rather than stacking them", () => {
    /* `mask-composite: add` would paint the whole ring solid and the wavefront would
     * lose its dither entirely. */
    stubReducedMotion(false);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      createThemeTransition(() => host, { tile: 6, sparkle: false })(() => undefined);

      const band = document.querySelectorAll<HTMLElement>("[data-gl-clone]")[1];
      expect(band?.style.getPropertyValue("mask-composite")).toBe("intersect, intersect");
      expect(band?.style.getPropertyValue("mask-size")).toBe("100% 100%, 256px 256px, 6px 6px");
      expect(band?.style.getPropertyValue("mask-image")).toContain("feTurbulence");
      dispose();
    });
  });

  it("removes the snapshot when its owner disposes mid-flight", () => {
    stubReducedMotion(false);
    vi.stubGlobal("requestAnimationFrame", () => 1);
    createRoot((dispose) => {
      const host = document.createElement("main");
      document.body.appendChild(host);
      createThemeTransition(() => host, { sparkle: false })(() => undefined);
      expect(document.querySelector("[data-gl-clone-wrap]")).not.toBeNull();
      dispose();
      expect(document.querySelector("[data-gl-clone-wrap]")).toBeNull();
    });
  });
});
