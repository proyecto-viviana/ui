/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { ColorEditor } from "../src/color/ColorEditor";

describe("ColorEditor (solid-spectrum)", () => {
  it("renders styled layout", () => {
    const { container } = render(() => <ColorEditor />);
    expect(container.querySelector(".solidaria-ColorEditor")).toBeInTheDocument();
  });

  it("renders all sub-components", () => {
    const { container } = render(() => <ColorEditor />);
    // Should have ColorArea, sliders, and format selector
    expect(container.querySelector(".solidaria-ColorArea")).toBeInTheDocument();
    expect(screen.getByLabelText("Color format")).toBeInTheDocument();
  });

  it("color space selector works", () => {
    render(() => <ColorEditor />);
    const select = screen.getByLabelText("Color format") as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.value).toBe("hex");
  });

  it("applies custom class", () => {
    const { container } = render(() => <ColorEditor class="my-editor" />);
    const editor = container.querySelector(".solidaria-ColorEditor");
    expect(editor?.className).toContain("my-editor");
  });

  it("all inputs are labeled", () => {
    render(() => <ColorEditor />);
    expect(screen.getByLabelText("Hue")).toBeInTheDocument();
    expect(screen.getByLabelText("Color format")).toBeInTheDocument();
  });
});
