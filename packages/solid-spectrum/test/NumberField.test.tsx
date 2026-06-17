/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { NumberField } from "../src/numberfield";

describe("NumberField (solid-spectrum)", () => {
  it("renders the input as a labelled textbox (not a spinbutton)", () => {
    render(() => <NumberField label="Quantity" defaultValue={5} />);
    // Upstream useNumberField overrides the spinbutton role for VoiceOver.
    const input = screen.getByRole("textbox", { name: "Quantity" });
    expect(input).toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("renders stepper controls and supports hiding them", () => {
    render(() => <NumberField label="Qty" defaultValue={1} />);
    expect(screen.getAllByRole("button")).toHaveLength(2);

    cleanup();
    render(() => <NumberField label="Qty" defaultValue={1} hideStepper />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
