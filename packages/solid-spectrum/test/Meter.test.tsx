/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
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

  it("clamps the visual fill percentage to the value range", () => {
    const { container } = render(() => (
      <>
        <Meter value={150} minValue={0} maxValue={100} aria-label="Over range" />
        <Meter value={-20} minValue={0} maxValue={100} aria-label="Under range" />
      </>
    ));

    expect(container.querySelector('[style*="width: 100%"]')).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 0%"]')).toBeInTheDocument();
  });

  it("uses formatOptions for generated value text", () => {
    render(() => (
      <Meter
        label="Completion"
        value={0.5}
        minValue={0}
        maxValue={1}
        formatOptions={{ style: "percent" }}
      />
    ));

    const meter = screen.getByRole("meter", { name: "Completion" });
    expect(meter).toHaveAttribute("aria-valuetext", "50%");
    expect(screen.getByText("50%")).toHaveAttribute("data-rsp-slot", "text");
  });

  it("renders S2 label and value text when a label is provided", () => {
    render(() => (
      <>
        <Meter label="Storage" value={75} minValue={0} maxValue={100} valueLabel="75 GB" />
        <Meter
          label="Quota"
          value={50}
          minValue={0}
          maxValue={100}
          valueLabel={<span>Half full</span>}
        />
      </>
    ));

    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuetext", "75 GB");
    expect(screen.getByText("Storage")).toBeInTheDocument();
    expect(screen.getByText("75 GB")).toHaveAttribute("data-rsp-slot", "text");
    expect(screen.getByText("Half full")).toBeInTheDocument();
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

  it("matches the S2 prop boundary without legacy aliases or arbitrary DOM props", () => {
    const onClick = vi.fn();
    render(() => (
      <Meter
        {...({
          class: "legacy-meter",
          showValueLabel: false,
          onClick,
          role: "progressbar",
          style: { margin: "99px" },
        } as Record<string, unknown>)}
        label="Boundary"
        value={40}
        data-testid="meter-root"
        UNSAFE_className="unsafe-meter"
        UNSAFE_style={{ margin: "2px" }}
      />
    ));

    const meter = screen.getByRole("meter", { name: "Boundary" }) as HTMLElement;
    expect(screen.getByTestId("meter-root")).toBe(meter);
    expect(meter).toHaveAttribute("role", "meter");
    expect(meter).toHaveClass("unsafe-meter");
    expect(meter).not.toHaveClass("legacy-meter");
    expect(meter).toHaveStyle({ margin: "2px" });
    expect(screen.getByText("40%")).toBeInTheDocument();

    meter.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports context props and lets local unsafe props override context", () => {
    render(() => (
      <MeterContext.Provider
        value={{
          variant: "negative",
          size: "XL",
          UNSAFE_className: "context-meter",
          UNSAFE_style: { margin: "2px", padding: "1px" },
        }}
      >
        <Meter label="Context" value={20} />
        <Meter
          label="Override"
          value={30}
          UNSAFE_className="local-meter"
          UNSAFE_style={{ margin: "4px" }}
        />
      </MeterContext.Provider>
    ));

    const contextMeter = screen.getByRole("meter", { name: "Context" }) as HTMLElement;
    const overrideMeter = screen.getByRole("meter", { name: "Override" }) as HTMLElement;
    expect(contextMeter).toHaveClass("context-meter");
    expect(contextMeter).toHaveStyle({ margin: "2px", padding: "1px" });
    expect(overrideMeter).toHaveClass("local-meter");
    expect(overrideMeter).not.toHaveClass("context-meter");
    expect(overrideMeter).toHaveStyle({ margin: "4px", padding: "1px" });
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
