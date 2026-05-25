/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { ProgressBar } from "../src/progress-bar";

describe("ProgressBar (solid-spectrum)", () => {
  it('renders with role="progressbar"', () => {
    render(() => <ProgressBar value={25} aria-label="Progress" />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("sets the React Aria progress value attributes", () => {
    render(() => <ProgressBar value={25} aria-label="Progress" />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuenow", "25");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
    expect(progressbar.getAttribute("aria-valuetext")).toMatch(/25\s?%/);
  });

  it("uses the visible label as the accessible name when no aria-label is provided", () => {
    render(() => <ProgressBar value={50} label="Loading assets" />);
    const progressbar = screen.getByRole("progressbar", { name: "Loading assets" });
    const label = screen.getByText("Loading assets");

    expect(progressbar.getAttribute("aria-labelledby")).toBe(label.id);
  });

  it("renders value text for determinate progress when a label is visible", () => {
    render(() => <ProgressBar value={50} label="Progress" />);
    expect(screen.getByText(/50\s?%/)).toBeInTheDocument();
  });

  it("hides value text and aria-valuenow for indeterminate progress", () => {
    render(() => <ProgressBar isIndeterminate label="Loading assets" />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).not.toHaveAttribute("aria-valuenow");
    expect(progressbar).not.toHaveAttribute("aria-valuetext");
    expect(progressbar.textContent).toBe("Loading assets");
  });

  it("supports custom valueLabel for aria and visible output", () => {
    render(() => <ProgressBar value={25} valueLabel="Step 1 of 4" label="Progress" />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuetext", "Step 1 of 4");
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
  });

  it("supports S2 size, labelPosition, and staticColor props", () => {
    render(() => (
      <ProgressBar
        value={50}
        size="XL"
        labelPosition="side"
        staticColor="white"
        aria-label="Progress"
      />
    ));

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("forwards S2 escape hatches, slot, and data attrs", () => {
    render(() => (
      <ProgressBar
        value={50}
        UNSAFE_className="unsafe-class"
        UNSAFE_style={{ margin: "2px" }}
        data-testid="progress"
        slot="progress"
        aria-label="Progress"
      />
    ));
    const progressbar = screen.getByTestId("progress");

    expect(progressbar).toHaveClass("unsafe-class");
    expect(progressbar).toHaveAttribute("slot", "progress");
    expect(progressbar).toHaveStyle({ margin: "2px" });
  });

  it("clamps values between min and max", () => {
    render(() => <ProgressBar value={150} minValue={0} maxValue={100} aria-label="Progress" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("handles equal min and max without NaN", () => {
    render(() => <ProgressBar value={10} minValue={10} maxValue={10} aria-label="Progress" />);
    const progressbar = screen.getByRole("progressbar");

    expect(progressbar).toHaveAttribute("aria-valuetext");
    expect(progressbar.getAttribute("aria-valuetext")).not.toContain("NaN");
  });
});
