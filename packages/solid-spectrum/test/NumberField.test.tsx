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

  it("renders a prefix before the input and labels the input with it", () => {
    render(() => <NumberField label="Price" defaultValue={5} prefix={<span>$</span>} />);

    const input = screen.getByRole("textbox");
    const label = screen.getByText("Price");
    const prefix = screen.getByText("$");
    const prefixContainer = prefix.closest("[id]") as HTMLElement;
    const labelledBy = (input.getAttribute("aria-labelledby") ?? "").split(" ");

    expect(labelledBy).toContain(label.id);
    expect(labelledBy).toContain(prefixContainer.id);
    expect(
      prefixContainer.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
