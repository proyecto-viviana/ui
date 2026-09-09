/** @vitest-environment jsdom */
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { SceneBackdrop } from "../src/view";
import { declarationsFor, reducedMotionDeclarationsFor } from "./pixel-css";

function root(container: HTMLElement): HTMLElement {
  return container.querySelector("[data-scene-backdrop]") as HTMLElement;
}

function layers(container: HTMLElement): string[] {
  return [...container.querySelectorAll("[data-scene-layer]")].map((el) =>
    el.getAttribute("data-scene-layer")!,
  );
}

describe("SceneBackdrop", () => {
  it("stays out of the accessibility tree and out of the way of the content", () => {
    const { container } = render(() => <SceneBackdrop src="/scene.png" />);

    /* Scenery: it has nothing to announce, and it covers the whole hero — if it
     * took pointer events it would swallow every click on the copy above it. */
    expect(root(container)).toHaveAttribute("aria-hidden", "true");
    const paint = declarationsFor(root(container));
    expect(paint).toContain("pointer-events:none");
    /* It pins itself, so a caller only has to give it a positioned parent. */
    expect(paint).toContain("position:absolute");
    for (const edge of ["top:0", "bottom:0", "inset-inline-start:0", "inset-inline-end:0"]) {
      expect(paint).toContain(edge);
    }
  });

  it("draws the veil by default and only the layers asked for otherwise", () => {
    const plain = render(() => <SceneBackdrop src="/scene.png" />);
    /* The veil is what makes text on a photograph legible, so it is opt-out. */
    expect(layers(plain.container)).toEqual(["image", "veil"]);

    const bare = render(() => <SceneBackdrop src="/scene.png" veil={false} />);
    expect(layers(bare.container)).toEqual(["image"]);

    const generated = render(() => <SceneBackdrop skyline grid sweep veil={false} />);
    /* No src: the generated layers stand on their own, in back-to-front order. */
    expect(layers(generated.container)).toEqual(["skyline", "grid", "sweep"]);
  });

  it("grades and pixelates the plate rather than scaling it smooth", () => {
    const { container } = render(() => <SceneBackdrop src="/glasselated/bg-scene.png" />);
    const image = container.querySelector('[data-scene-layer="image"]') as HTMLElement;

    expect(image.style.backgroundImage).toBe('url("/glasselated/bg-scene.png")');
    const paint = declarationsFor(image);
    expect(paint).toContain("filter:var(--scene-filter)");
    /* Nearest-neighbour scaling is the "pixelated" half of Glasselated; without it
     * the browser smooths the plate and the register loses its grain. */
    expect(paint).toContain("image-rendering:pixelated");
    expect(paint).toContain("background-size:cover");
  });

  it("draws a deterministic skyline so hydration cannot mismatch", () => {
    const first = render(() => <SceneBackdrop skyline />);
    const second = render(() => <SceneBackdrop skyline />);
    const heights = (c: HTMLElement) =>
      [...(c.querySelector('[data-scene-layer="skyline"]') as HTMLElement).children].map(
        (el) => (el as HTMLElement).style.height,
      );

    expect(heights(first.container)).toHaveLength(40);
    expect(heights(first.container)[0]).toBe("38px");
    /* A random skyline would differ between the server render and the client one,
     * and Solid trusts the server DOM — the city has to be a fixed seed. */
    expect(heights(second.container)).toEqual(heights(first.container));
  });

  it("stops the sweep under reduced motion instead of hiding it with JS", () => {
    const { container } = render(() => <SceneBackdrop sweep veil={false} />);
    const sweep = container.querySelector('[data-scene-layer="sweep"]') as HTMLElement;

    expect(declarationsFor(sweep)).toContain("animation-name:");
    expect(reducedMotionDeclarationsFor(sweep)).toContain("animation-name:none");
  });
});
