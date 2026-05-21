import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { DateField } from "../src/calendar/DateField";
import { CalendarDateClass as CalendarDate } from "@proyecto-viviana/solid-stately";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });
}

describe("DateField (solid-spectrum)", () => {
  it("wires visible label to field aria-labelledby", async () => {
    render(() => <DateField label="Birth date" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;
    const label = screen.getByText("Birth date");

    expect(label.tagName).toBe("SPAN");
    expect(label).toHaveAttribute("id");
    expect(group).toHaveAttribute("aria-labelledby");
    expect(group.getAttribute("aria-labelledby")).toContain(label.getAttribute("id"));
  });

  it("wires error message to aria-describedby when invalid", async () => {
    render(() => <DateField aria-label="Date" isInvalid errorMessage="Date is required" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;
    const error = screen.getByText("Date is required");

    expect(error.tagName).toBe("P");
    expect(error).toHaveAttribute("id");
    expect(group).toHaveAttribute("aria-describedby");
    expect(group.getAttribute("aria-describedby")).toContain(error.getAttribute("id"));
  });

  it("uses the S2 size names and field shell for visible segments", async () => {
    render(() => (
      <DateField label="Birth date" size="XL" defaultValue={new CalendarDate(2025, 2, 3)} />
    ));
    await waitForHydration();

    const root = document.querySelector(".solidaria-DateField") as HTMLElement;
    const group = root.querySelector('[role="presentation"]') as HTMLElement;

    expect(root.className).toContain("macro");
    expect(group.className).toContain("macro");
    expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
  });

  it("renders contextual help next to the visible label", async () => {
    render(() => (
      <DateField label="Birth date" contextualHelp={<button type="button">Date help</button>} />
    ));
    await waitForHydration();

    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]') as HTMLElement;
    expect(contextualHelp).toBeInTheDocument();
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Date help" }));
  });

  it("forwards shouldForceLeadingZeros to visible date segments", async () => {
    render(() => (
      <DateField
        aria-label="Date"
        defaultValue={new CalendarDate(2025, 2, 3)}
        shouldForceLeadingZeros
      />
    ));
    await waitForHydration();

    const segmentTexts = screen.getAllByRole("spinbutton").map((segment) => segment.textContent);
    expect(segmentTexts).toContain("02");
    expect(segmentTexts).toContain("03");
  });

  it("renders a hidden form input when name is provided", async () => {
    render(() => (
      <DateField
        aria-label="Date"
        name="appointmentDate"
        defaultValue={new CalendarDate(2025, 2, 3)}
      />
    ));
    await waitForHydration();

    const input = document.querySelector('input[name="appointmentDate"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("hidden");
    expect(input).toHaveValue("2025-02-03");
  });

  it("passes form ownership through to the hidden input", async () => {
    render(() => (
      <div>
        <form id="appointmentForm" />
        <DateField
          aria-label="Date"
          name="appointmentDate"
          form="appointmentForm"
          defaultValue={new CalendarDate(2025, 2, 3)}
        />
      </div>
    ));
    await waitForHydration();

    const input = document.querySelector('input[name="appointmentDate"]') as HTMLInputElement;
    const form = document.getElementById("appointmentForm") as HTMLFormElement;
    expect(input).toHaveAttribute("form", "appointmentForm");
    expect(new FormData(form).getAll("appointmentDate").map(String)).toEqual(["2025-02-03"]);
  });
});
