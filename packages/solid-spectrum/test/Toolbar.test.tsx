/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Toolbar } from "../src/toolbar";

// S2 1.5.1 ships Toolbar as a bare passthrough over the react-aria-components
// Toolbar (no styling, no variant, no size), and solid-spectrum's Toolbar mirrors
// it as a passthrough over the base solidaria-components Toolbar. So the styled
// layer adds nothing of its own — these assert the passthrough forwards role,
// orientation, and arrow navigation, and defaults to the base `solidaria-Toolbar`
// class.
describe("Toolbar (solid-spectrum)", () => {
  it("renders with toolbar role and the base default class", () => {
    const { container } = render(() => (
      <Toolbar aria-label="Formatting tools">
        <button>Bold</button>
        <button>Italic</button>
      </Toolbar>
    ));

    expect(screen.getByRole("toolbar", { name: "Formatting tools" })).toBeInTheDocument();
    expect(container.querySelector(".solidaria-Toolbar")).toBeInTheDocument();
  });

  it("forwards a custom class through the passthrough", () => {
    const { container } = render(() => (
      <Toolbar aria-label="Formatting tools" class="my-toolbar">
        <button>Bold</button>
      </Toolbar>
    ));

    expect(container.querySelector(".my-toolbar")).toBeInTheDocument();
  });

  it("supports vertical orientation attributes", () => {
    render(() => (
      <Toolbar aria-label="Formatting tools" orientation="vertical">
        <button>Bold</button>
        <button>Italic</button>
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar", { name: "Formatting tools" });
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
  });

  it("supports arrow navigation (Home/End are no-ops, upstream useToolbar parity)", () => {
    render(() => (
      <Toolbar aria-label="Formatting tools">
        <button>Bold</button>
        <button>Italic</button>
        <button>Underline</button>
      </Toolbar>
    ));

    const bold = screen.getByRole("button", { name: "Bold" });
    const italic = screen.getByRole("button", { name: "Italic" });

    bold.focus();
    fireEvent.keyDown(bold, { key: "ArrowRight" });
    expect(document.activeElement).toBe(italic);

    // Upstream useToolbar only binds Arrow keys and Tab; Home/End do not move focus.
    fireEvent.keyDown(italic, { key: "End" });
    expect(document.activeElement).toBe(italic);

    fireEvent.keyDown(italic, { key: "Home" });
    expect(document.activeElement).toBe(italic);
  });
});
