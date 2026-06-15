/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { ProgressCircle } from "../src/progress/ProgressCircle";

afterEach(() => cleanup());

describe("ProgressCircle (solid-spectrum)", () => {
  it("renders a progressbar root and S2 SVG geometry", () => {
    const { container } = render(() => <ProgressCircle value={50} aria-label="Loading" />);

    expect(screen.getByRole("progressbar", { name: "Loading" })).toBeInTheDocument();
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "100%");
    expect(svg).toHaveAttribute("height", "100%");
  });

  it("sets determinate dash offset from the percentage", () => {
    const { container } = render(() => <ProgressCircle value={50} aria-label="Loading" />);
    const fill = container.querySelectorAll("circle")[2];

    expect(fill).toHaveAttribute("pathLength", "100");
    expect(fill).toHaveAttribute("stroke-dasharray", "100 200");
    expect(fill).toHaveAttribute("stroke-dashoffset", "50");
  });

  it("handles equal min and max without NaN dash offset", () => {
    const { container } = render(() => (
      <ProgressCircle value={10} minValue={10} maxValue={10} aria-label="Equal range" />
    ));
    const progressbar = screen.getByRole("progressbar", { name: "Equal range" });
    const fill = container.querySelectorAll("circle")[2];

    expect(progressbar).toHaveAttribute("aria-valuetext");
    expect(progressbar.getAttribute("aria-valuetext")).not.toContain("NaN");
    expect(fill).toHaveAttribute("stroke-dashoffset", "100");
    expect(container.innerHTML).not.toContain("NaN");
  });

  it("uses S2 radius values for sizes", () => {
    const { container } = render(() => <ProgressCircle value={50} size="L" aria-label="Loading" />);
    const circles = container.querySelectorAll("circle");

    for (const circle of circles) {
      expect(circle).toHaveAttribute("r", "calc(50% - 0.125rem)");
    }
  });

  it("omits determinate value attrs and animates the fill when indeterminate", () => {
    const { container } = render(() => <ProgressCircle isIndeterminate aria-label="Loading" />);
    const progressbar = screen.getByRole("progressbar");
    const fill = container.querySelectorAll("circle")[2];

    expect(progressbar).not.toHaveAttribute("aria-valuenow");
    expect(progressbar).not.toHaveAttribute("aria-valuetext");
    expect(fill).not.toHaveAttribute("stroke-dashoffset");
    expect(fill.getAttribute("style")).toContain("animation");
  });

  it("forwards staticColor, S2 escape hatches, slot, and data attrs", () => {
    render(() => (
      <ProgressCircle
        value={50}
        staticColor="black"
        UNSAFE_className="unsafe-class"
        UNSAFE_style={{ margin: "2px" }}
        data-testid="circle"
        slot="progress"
        aria-label="Loading"
      />
    ));
    const progressbar = screen.getByTestId("circle");

    expect(progressbar).toHaveClass("unsafe-class");
    expect(progressbar).toHaveAttribute("slot", "progress");
    expect(progressbar).toHaveStyle({ margin: "2px" });
  });
});
