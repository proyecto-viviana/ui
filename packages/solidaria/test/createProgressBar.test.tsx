/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { createProgressBar } from "../src/progress";

// Test component that uses createProgressBar
function TestProgressBar(props: {
  value?: number;
  minValue?: number;
  maxValue?: number;
  valueLabel?: string;
  formatOptions?: Intl.NumberFormatOptions;
  isIndeterminate?: boolean;
  label?: string;
  "aria-label"?: string;
}) {
  const { progressBarProps, labelProps } = createProgressBar({
    get value() {
      return props.value;
    },
    get minValue() {
      return props.minValue;
    },
    get maxValue() {
      return props.maxValue;
    },
    get valueLabel() {
      return props.valueLabel;
    },
    get formatOptions() {
      return props.formatOptions;
    },
    get isIndeterminate() {
      return props.isIndeterminate;
    },
    get label() {
      return props.label;
    },
    get "aria-label"() {
      if (props["aria-label"]) return props["aria-label"];
      return props.label ? undefined : "Test progress";
    },
  });

  return (
    <div {...progressBarProps}>
      {props.label && <span {...labelProps}>{props.label}</span>}
      <div
        class="bar"
        style={{ width: `${((props.value ?? 0) / (props.maxValue ?? 100)) * 100}%` }}
      />
    </div>
  );
}

describe("createProgressBar", () => {
  it('should render a progressbar with role="progressbar"', () => {
    render(() => <TestProgressBar value={25} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
  });

  it("should have aria-valuenow for determinate progress", () => {
    render(() => <TestProgressBar value={25} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "25");
  });

  it("should have aria-valuemin and aria-valuemax", () => {
    render(() => <TestProgressBar value={50} minValue={0} maxValue={100} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should format value as percentage by default", () => {
    render(() => <TestProgressBar value={25} />);
    const progressbar = screen.getByRole("progressbar");
    // The format may vary by locale (e.g., "25%" or "25 %")
    expect(progressbar.getAttribute("aria-valuetext")).toMatch(/25\s?%/);
  });

  it("should support custom valueLabel", () => {
    render(() => <TestProgressBar value={25} valueLabel="Step 1 of 4" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuetext", "Step 1 of 4");
  });

  it("should support non-percent formatOptions", () => {
    render(() => <TestProgressBar value={42} formatOptions={{ style: "decimal" }} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuetext", "42");
  });

  it("should clamp value between min and max", () => {
    render(() => <TestProgressBar value={150} minValue={0} maxValue={100} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "100");
  });

  it("should handle indeterminate state", () => {
    render(() => <TestProgressBar isIndeterminate />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).not.toHaveAttribute("aria-valuenow");
    expect(progressbar).not.toHaveAttribute("aria-valuetext");
  });

  it("should support aria-label", () => {
    render(() => <TestProgressBar value={50} aria-label="Loading progress" />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-label", "Loading progress");
  });

  it("should associate label with progressbar", () => {
    render(() => <TestProgressBar value={50} label="Loading..." />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-labelledby");
    const labelId = progressbar.getAttribute("aria-labelledby");
    expect(document.getElementById(labelId!)).toHaveTextContent("Loading...");
  });

  it("should handle custom min and max values", () => {
    render(() => <TestProgressBar value={5} minValue={0} maxValue={10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "5");
    expect(progressbar).toHaveAttribute("aria-valuemin", "0");
    expect(progressbar).toHaveAttribute("aria-valuemax", "10");
    // 5/10 = 50% - format may vary by locale
    expect(progressbar.getAttribute("aria-valuetext")).toMatch(/50\s?%/);
  });

  it("should handle equal min and max values without NaN", () => {
    render(() => <TestProgressBar value={10} minValue={10} maxValue={10} />);
    const progressbar = screen.getByRole("progressbar");
    expect(progressbar).toHaveAttribute("aria-valuenow", "10");
    expect(progressbar.getAttribute("aria-valuetext")).toMatch(/0\s?%/);
  });
});
