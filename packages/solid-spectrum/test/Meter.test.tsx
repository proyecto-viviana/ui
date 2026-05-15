/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Meter, MeterContext } from "../src/meter";
import { Skeleton } from "../src/skeleton";

describe("Meter (solid-spectrum)", () => {
  it("renders with meter role, value attributes, and S2 classes", () => {
    const { container } = render(() => <Meter value={30} aria-label="Battery" />);
    const meter = screen.getByRole("meter", { name: "Battery" });

    expect(meter).toHaveAttribute("aria-valuenow", "30");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter.className).not.toBe("");
    expect(container.querySelector('[style*="width: 30%"]')).toBeInTheDocument();
  });

  it("handles equal min and max without NaN", () => {
    render(() => <Meter value={10} minValue={10} maxValue={10} aria-label="Fixed" />);
    const meter = screen.getByRole("meter", { name: "Fixed" });
    expect(meter.getAttribute("aria-valuetext")).not.toContain("NaN");
  });

  it("renders S2 label and value text when a label is provided", () => {
    render(() => (
      <Meter label="Storage" value={75} minValue={0} maxValue={100} valueLabel="75 GB" />
    ));

    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuetext", "75 GB");
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("75 GB")).toHaveAttribute("data-rsp-slot", "text");
  });

  it("supports S2 variants, static color, sizes, and label position", () => {
    const { container } = render(() => (
      <>
        <Meter label="Default" value={50} />
        <Meter label="Positive" value={50} variant="positive" size="XL" />
        <Meter
          label="Notice"
          value={50}
          variant="notice"
          staticColor="white"
          labelPosition="side"
        />
      </>
    ));

    const fills = Array.from(container.querySelectorAll('[style*="width: 50%"]'));
    expect(fills).toHaveLength(3);
    expect(fills[1]?.className).not.toBe(fills[0]?.className);
    expect(fills[2]?.className).not.toBe(fills[0]?.className);
  });

  it("maps legacy variant and size aliases to S2 styles", () => {
    const { container } = render(() => (
      <>
        <Meter label="Success" value={40} variant="success" size="md" />
        <Meter label="Positive" value={40} variant="positive" size="M" />
      </>
    ));

    const fills = Array.from(container.querySelectorAll('[style*="width: 40%"]'));
    expect(fills[0]?.className).toBe(fills[1]?.className);
  });

  it("supports context props and unsafe escape hatches", () => {
    render(() => (
      <MeterContext.Provider
        value={{
          variant: "negative",
          size: "XL",
          UNSAFE_className: "context-meter",
          UNSAFE_style: { margin: "2px" },
        }}
      >
        <Meter label="Context" value={20} class="local-meter" />
      </MeterContext.Provider>
    ));

    const meter = screen.getByRole("meter", { name: "Context" }) as HTMLElement;
    expect(meter).toHaveClass("context-meter");
    expect(meter).toHaveClass("local-meter");
    expect(meter.style.margin).toBe("2px");
  });

  it("uses the shared Skeleton wrapper for track and value text", () => {
    const { container } = render(() => (
      <Skeleton isLoading>
        <Meter label="Loading" value={35} />
      </Skeleton>
    ));

    expect(container.querySelector("span[inert]")).toBeInTheDocument();
    expect(container.querySelector('[role~="meter"]')).toBeInTheDocument();
  });
});
