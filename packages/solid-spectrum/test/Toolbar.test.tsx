/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { Toolbar } from "../src/toolbar";

describe("Toolbar (solid-spectrum)", () => {
  it("renders with toolbar role and default classes", () => {
    const { container } = render(() => (
      <Toolbar aria-label="Formatting tools">
        <button>Bold</button>
        <button>Italic</button>
      </Toolbar>
    ));

    expect(screen.getByRole("toolbar", { name: "Formatting tools" })).toBeInTheDocument();
    expect(container.querySelector(".vui-toolbar")).toBeInTheDocument();
  });

  it("applies variant, size, and custom class", () => {
    const { container } = render(() => (
      <Toolbar aria-label="Formatting tools" variant="bordered" size="lg" class="my-toolbar">
        <button>Bold</button>
      </Toolbar>
    ));

    const toolbar = container.querySelector(".my-toolbar");
    expect(toolbar).toBeInTheDocument();
    expect(toolbar).toHaveClass("border");
    expect(toolbar).toHaveClass("gap-3");
    expect(toolbar).toHaveClass("p-3");
  });

  it("supports vertical orientation styles and attributes", () => {
    const { container } = render(() => (
      <Toolbar aria-label="Formatting tools" orientation="vertical">
        <button>Bold</button>
        <button>Italic</button>
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar", { name: "Formatting tools" });
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
    expect(container.querySelector(".vui-toolbar")).toHaveClass("flex-col");
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
