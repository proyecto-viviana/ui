/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { Meter } from "../src/meter";

describe("Meter (viviana-ui)", () => {
  it("uses the headless Label relationship", () => {
    render(() => <Meter label="Storage" value={75} valueLabel="75 GB" />);

    const meter = screen.getByRole("meter", { name: "Storage" });
    const label = screen.getByText("Storage");
    expect(label.tagName).toBe("SPAN");
    expect(label).toHaveAttribute("id");
    expect(meter).toHaveAttribute("aria-labelledby", label.id);
    expect(meter).toHaveAttribute("aria-valuetext", "75 GB");
  });

  it("gives an explicit aria-labelledby relationship precedence", () => {
    render(() => (
      <>
        <span id="external-viviana-meter-name">External name</span>
        <Meter label="Visible name" value={50} aria-labelledby="external-viviana-meter-name" />
      </>
    ));

    const meter = screen.getByRole("meter", { name: /External name/ });
    const label = screen.getByText("Visible name");
    expect(meter).toHaveAttribute("aria-labelledby", "external-viviana-meter-name");
    expect(label).not.toHaveAttribute("id");
  });

  it("keeps segmented rendering above the shared headless behavior", () => {
    render(() => <Meter label="Focus" value={60} segments={5} />);

    const meter = screen.getByRole("meter", { name: "Focus" });
    const segmentRow = Array.from(meter.children).find((child) => child.children.length === 5);

    expect(meter).toHaveAttribute("aria-valuenow", "60");
    expect(segmentRow).toBeDefined();
    expect(segmentRow?.children).toHaveLength(5);
  });
});
