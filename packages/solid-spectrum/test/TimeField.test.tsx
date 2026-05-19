import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { TimeField } from "../src/calendar/TimeField";
import { TimeClass as Time } from "@proyecto-viviana/solid-stately";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });
}

describe("TimeField (solid-spectrum)", () => {
  it("wires visible label to field aria-labelledby", async () => {
    render(() => <TimeField label="Meeting time" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;
    const label = screen.getByText("Meeting time");

    expect(label.tagName).toBe("SPAN");
    expect(label).toHaveAttribute("id");
    expect(group).toHaveAttribute("aria-labelledby");
    expect(group.getAttribute("aria-labelledby")).toContain(label.getAttribute("id"));
  });

  it("wires description to aria-describedby when valid", async () => {
    render(() => <TimeField aria-label="Time" description="Choose a start time" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;
    const description = screen.getByText("Choose a start time");

    expect(description.tagName).toBe("P");
    expect(description).toHaveAttribute("id");
    expect(group).toHaveAttribute("aria-describedby");
    expect(group.getAttribute("aria-describedby")).toContain(description.getAttribute("id"));
  });

  it("wires error message to aria-describedby when invalid", async () => {
    render(() => <TimeField aria-label="Time" isInvalid errorMessage="Time is required" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;
    const error = screen.getByText("Time is required");

    expect(error.tagName).toBe("P");
    expect(error).toHaveAttribute("id");
    expect(group).toHaveAttribute("aria-describedby");
    expect(group.getAttribute("aria-describedby")).toContain(error.getAttribute("id"));
  });

  it("uses the S2 size names and field shell for visible segments", async () => {
    render(() => (
      <TimeField label="Meeting time" size="XL" defaultValue={new Time(9, 30)} hourCycle={24} />
    ));
    await waitForHydration();

    const root = document.querySelector(".solidaria-TimeField") as HTMLElement;
    const group = root.querySelector('[role="presentation"]') as HTMLElement;

    expect(root.className).toContain("macro");
    expect(group.className).toContain("macro");
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
  });

  it("renders a hidden form input when name is provided", async () => {
    render(() => (
      <TimeField aria-label="Time" name="startTime" defaultValue={new Time(9, 30)} hourCycle={24} />
    ));
    await waitForHydration();

    const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "time");
    expect(input).toHaveValue("09:30");
  });

  it("passes form ownership through to the hidden input", async () => {
    render(() => (
      <div>
        <form id="scheduleForm" />
        <TimeField
          aria-label="Time"
          name="startTime"
          form="scheduleForm"
          defaultValue={new Time(9, 30)}
          hourCycle={24}
        />
      </div>
    ));
    await waitForHydration();

    const input = document.querySelector('input[name="startTime"]') as HTMLInputElement;
    const form = document.getElementById("scheduleForm") as HTMLFormElement;
    expect(input).toHaveAttribute("form", "scheduleForm");
    expect(new FormData(form).getAll("startTime").map(String)).toEqual(["09:30"]);
  });

  it("does not treat errorMessage alone as invalid", async () => {
    render(() => <TimeField aria-label="Time" errorMessage="Time is required" />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]') as HTMLElement;

    expect(group).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByText("Time is required")).not.toBeInTheDocument();
  });
});
