/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { Overlay } from "../src/overlays/Overlay";

describe("Overlay (viviana-ui)", () => {
  it("renders children into a portal when open", () => {
    const { container } = render(() => (
      <Overlay isOpen>
        <div data-testid="overlay-content">Overlay content</div>
      </Overlay>
    ));

    const content = document.body.querySelector("[data-testid='overlay-content']");
    expect(content).not.toBeNull();
    expect(content!.textContent).toBe("Overlay content");
    expect(container.contains(content)).toBe(false);

    const overlayDiv = content!.parentElement;
    expect(overlayDiv).not.toBeNull();
    const classList = overlayDiv!.className.split(/\s+/);
    expect(classList).not.toContain("fixed");
    expect(classList).not.toContain("z-50");
    expect(classList.some((c) => c.startsWith("_"))).toBe(true);
  });

  it("does not render when closed", () => {
    const { container } = render(() => (
      <Overlay isOpen={false}>
        <div data-testid="overlay-content">Hidden content</div>
      </Overlay>
    ));

    expect(document.body.querySelector("[data-testid='overlay-content']")).toBeNull();
    expect(container.textContent).not.toContain("Hidden content");
  });

  it("merges custom class and mounts into custom container", () => {
    const customContainer = document.createElement("div");
    document.body.appendChild(customContainer);

    render(() => (
      <Overlay isOpen container={customContainer} class="custom-overlay-class">
        <div data-testid="custom-content">In custom container</div>
      </Overlay>
    ));

    const content = customContainer.querySelector("[data-testid='custom-content']");
    expect(content).not.toBeNull();
    const overlayDiv = content!.parentElement;
    expect(overlayDiv?.className).toContain("custom-overlay-class");
    expect(overlayDiv?.className.split(/\s+/)).not.toContain("fixed");
    expect(overlayDiv?.className.split(/\s+/)).not.toContain("z-50");

    customContainer.remove();
  });
});
