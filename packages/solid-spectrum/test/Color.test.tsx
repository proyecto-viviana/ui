/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ColorSwatch } from "../src/color";

describe("ColorSwatch (solid-spectrum)", () => {
  it("renders a non-interactive swatch with composed accessible name", () => {
    render(() => <ColorSwatch color="#ff0000" colorName="Fire truck red" aria-label="Preview" />);
    expect(screen.getByRole("img", { name: "Fire truck red, Preview" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies S2 size, rounding, and escape-hatch props", () => {
    render(() => (
      <ColorSwatch
        color="#00ff00"
        size="L"
        rounding="full"
        class="custom"
        UNSAFE_className="unsafe"
        UNSAFE_style={{ outline: "1px solid red" }}
        aria-label="Green"
      />
    ));

    const swatch = screen.getByRole("img", { name: /Green/ }) as HTMLElement;
    expect(swatch.className).toContain("custom");
    expect(swatch.className).toContain("unsafe");
    expect(swatch.style.outline).toBe("1px solid red");
  });

  it("renders the transparent slash when no color is provided", () => {
    render(() => <ColorSwatch aria-label="Preview" />);

    const swatch = screen.getByRole("img", { name: "transparent, Preview" }) as HTMLElement;
    const style = swatch.getAttribute("style") ?? "";
    expect(style).toContain("linear-gradient");
    expect(style).not.toContain("repeating-conic-gradient");
  });
});
