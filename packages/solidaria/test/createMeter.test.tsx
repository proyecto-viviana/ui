/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect } from "vitest";
import { cleanup, render, screen } from "@solidjs/testing-library";
import { createMeter } from "../src/meter";

afterEach(() => cleanup());

// Test component that uses createMeter
function TestMeter(props: {
  value?: number;
  minValue?: number;
  maxValue?: number;
  valueLabel?: string;
  label?: string;
  "aria-label"?: string;
}) {
  const { meterProps, labelProps } = createMeter({
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
    get label() {
      return props.label;
    },
    get "aria-label"() {
      if (props["aria-label"]) return props["aria-label"];
      return props.label ? undefined : "Test meter";
    },
  });

  return (
    <div {...meterProps} data-testid="meter">
      {props.label && <span {...labelProps}>{props.label}</span>}
      <div
        class="bar"
        style={{ width: `${((props.value ?? 0) / (props.maxValue ?? 100)) * 100}%` }}
      />
    </div>
  );
}

describe("createMeter", () => {
  it("should render with meter role", () => {
    render(() => <TestMeter value={25} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute("role", "meter");
  });

  it("should have aria-valuenow", () => {
    render(() => <TestMeter value={25} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "25");
  });

  it("should have aria-valuemin and aria-valuemax", () => {
    render(() => <TestMeter value={50} minValue={0} maxValue={100} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("should format value as percentage by default", () => {
    render(() => <TestMeter value={25} />);
    const meter = screen.getByTestId("meter");
    // The format may vary by locale (e.g., "25%" or "25 %")
    expect(meter.getAttribute("aria-valuetext")).toMatch(/25\s?%/);
  });

  it("should support custom valueLabel", () => {
    render(() => <TestMeter value={25} valueLabel="Low" />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuetext", "Low");
  });

  it("should clamp value between min and max", () => {
    render(() => <TestMeter value={150} minValue={0} maxValue={100} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "100");
  });

  it("should support aria-label", () => {
    render(() => <TestMeter value={50} aria-label="Battery level" />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-label", "Battery level");
  });

  it("should associate label with meter", () => {
    render(() => <TestMeter value={50} label="Disk Usage" />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-labelledby");
    const labelId = meter.getAttribute("aria-labelledby");
    expect(document.getElementById(labelId!)).toHaveTextContent("Disk Usage");
  });

  it("should handle custom min and max values", () => {
    render(() => <TestMeter value={5} minValue={0} maxValue={10} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "5");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "10");
    // 5/10 = 50% - format may vary by locale
    expect(meter.getAttribute("aria-valuetext")).toMatch(/50\s?%/);
  });

  it("should handle equal min and max values without NaN", () => {
    render(() => <TestMeter value={10} minValue={10} maxValue={10} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "10");
    expect(meter).toHaveAttribute("aria-valuemin", "10");
    expect(meter).toHaveAttribute("aria-valuemax", "10");
    expect(meter.getAttribute("aria-valuetext")).toMatch(/0\s?%/);
    expect(meter.getAttribute("aria-valuetext")).not.toContain("NaN");
  });

  it("should default min to 0 and max to 100", () => {
    render(() => <TestMeter value={75} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
  });

  it("should handle zero value", () => {
    render(() => <TestMeter value={0} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "0");
  });

  it("should handle 100% value", () => {
    render(() => <TestMeter value={100} />);
    const meter = screen.getByTestId("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "100");
    expect(meter.getAttribute("aria-valuetext")).toMatch(/100\s?%/);
  });
});
