/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { parseDate, parseDateTime } from "@proyecto-viviana/solid-stately";
import { DateRangePicker } from "../src/calendar/DateRangePicker";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
}

// S2 overrides RAC's <Group> to role="presentation"; the label/describedby
// associations ride on that presentation FieldGroup (createDateRangePicker
// groupProps). role="presentation" is not in the a11y tree, so it is queried by
// attribute rather than getByRole("group").
function getFieldGroup(): HTMLElement {
  const fieldGroup = document.querySelector(
    '[role="presentation"][aria-labelledby]',
  ) as HTMLElement | null;
  expect(fieldGroup).toBeTruthy();
  return fieldGroup as HTMLElement;
}

function labelledByText(el: HTMLElement): string {
  return (el.getAttribute("aria-labelledby") ?? "")
    .split(" ")
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

describe("DateRangePicker (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders start and end segmented date fields", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      // The range sub-fields are role="presentation" (no queryable field label);
      // createDateField folds each field's localized label ("Start Date"/"End Date")
      // into its segments' accessible names.
      expect(screen.getAllByRole("spinbutton", { name: /Start Date/i })).toHaveLength(3);
      expect(screen.getAllByRole("spinbutton", { name: /End Date/i })).toHaveLength(3);
      expect(screen.getAllByRole("spinbutton")).toHaveLength(6);
    });

    it("renders range separator", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      expect(container.textContent).toContain("–");
    });

    it("renders calendar trigger button", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("button contains calendar SVG icon", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });

    it("applies semantic labels to start/end fields", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();

      // The localized startDate/endDate labels ride on the segment accessible names.
      expect(screen.getByRole("spinbutton", { name: /month, Start Date/i })).toBeInTheDocument();
      expect(screen.getByRole("spinbutton", { name: /month, End Date/i })).toBeInTheDocument();
    });
  });

  describe("label/description/error", () => {
    it("renders label", async () => {
      render(() => <DateRangePicker label="Trip dates" />);
      await waitForHydration();
      expect(screen.getByText("Trip dates")).toBeInTheDocument();
    });

    it("renders description", async () => {
      render(() => (
        <DateRangePicker aria-label="Date range" description="Select your travel dates" />
      ));
      await waitForHydration();
      expect(screen.getByText("Select your travel dates")).toBeInTheDocument();
    });

    it("renders error message when invalid", async () => {
      render(() => (
        <DateRangePicker
          aria-label="Date range"
          isInvalid
          errorMessage="End date must be after start date"
        />
      ));
      await waitForHydration();
      expect(screen.getByText("End date must be after start date")).toBeInTheDocument();
    });

    it("shows required indicator", async () => {
      const { container } = render(() => <DateRangePicker label="Trip dates" isRequired />);
      await waitForHydration();
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("size variants", () => {
    it("applies sm size styles", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" size="sm" />);
      await waitForHydration();
      expect(container.firstElementChild).toBeInTheDocument();
    });

    it("applies md size by default", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      expect(container.firstElementChild).toBeInTheDocument();
    });

    it("applies lg size styles", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" size="lg" />);
      await waitForHydration();
      expect(container.firstElementChild).toBeInTheDocument();
    });

    it("accepts S2 size values", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" size="XL" />);
      await waitForHydration();
      expect(container.firstElementChild).toBeInTheDocument();
    });
  });

  describe("states", () => {
    it("renders disabled state", async () => {
      render(() => <DateRangePicker aria-label="Date range" isDisabled />);
      await waitForHydration();
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("edits start/end segments through the closed field", async () => {
      render(() => (
        <DateRangePicker
          aria-label="Date range"
          defaultValue={{
            start: parseDate("2025-02-03"),
            end: parseDate("2025-02-14"),
          }}
          startName="startDate"
          endName="endDate"
        />
      ));
      await waitForHydration();

      // The start "day" segment carries the folded field label in its name.
      const startDay = screen.getByRole("spinbutton", { name: /day, Start Date/i });
      expect(startDay).toHaveAttribute("aria-valuenow", "3");

      fireEvent.keyDown(startDay, { key: "ArrowUp" });

      await waitFor(() => {
        expect(document.querySelector('input[name="startDate"]')).toHaveValue("2025-02-04");
        expect(document.querySelector('input[name="endDate"]')).toHaveValue("2025-02-14");
      });
    });

    it("routes range calendar props into the popup calendar", async () => {
      render(() => (
        <DateRangePicker
          aria-label="Date range"
          defaultOpen
          value={{
            start: parseDate("2025-02-03"),
            end: parseDate("2025-02-14"),
          }}
          maxVisibleMonths={2}
          firstDayOfWeek="mon"
          pageBehavior="single"
          minValue={parseDate("2025-02-03")}
          maxValue={parseDate("2025-02-20")}
          isDateUnavailable={(date) => date.day === 10}
          isInvalid
          errorMessage="Select a valid date range."
        />
      ));

      // Faithful useDateRangePicker dialogProps are aria-labelledby-only (button +
      // field labels), never aria-label — so the popup dialog carries no fixed name.
      const dialog = await screen.findByRole("dialog");
      await waitFor(() => {
        expect(dialog.querySelectorAll('[role="grid"]')).toHaveLength(2);
      });
      expect(Array.from(dialog.querySelectorAll("th")).map((cell) => cell.textContent)).toEqual([
        "M",
        "T",
        "W",
        "T",
        "F",
        "S",
        "S",
        "M",
        "T",
        "W",
        "T",
        "F",
        "S",
        "S",
      ]);
      expect(
        Array.from(dialog.querySelectorAll("*")).some(
          (node) => node.textContent?.trim() === "Select a valid date range.",
        ),
      ).toBe(true);

      const beforeMin = Array.from(dialog.querySelectorAll('[role="button"]')).find((button) =>
        button.getAttribute("aria-label")?.includes("February 2, 2025"),
      );
      expect(beforeMin).toHaveAttribute("aria-disabled", "true");
      const afterMax = Array.from(dialog.querySelectorAll('[role="button"]')).find((button) =>
        button.getAttribute("aria-label")?.includes("February 21, 2025"),
      );
      expect(afterMax).toHaveAttribute("aria-disabled", "true");
      const unavailable = Array.from(dialog.querySelectorAll('[role="button"]')).find((button) =>
        button.getAttribute("aria-label")?.includes("February 10, 2025"),
      );
      expect(unavailable).toHaveAttribute("aria-disabled", "true");
    });

    it("renders popup time fields and wires time changes back to the range value", async () => {
      let latest = {
        start: parseDateTime("2025-02-03T08:45:00"),
        end: parseDateTime("2025-02-14T17:30:00"),
      };

      function ControlledDateRangePicker() {
        const [value, setValue] = createSignal(latest);

        return (
          <DateRangePicker
            aria-label="Date range"
            defaultOpen
            value={value()}
            granularity="minute"
            hourCycle={24}
            startName="startDate"
            endName="endDate"
            onChange={(nextValue) => {
              if (nextValue) {
                latest = nextValue as typeof latest;
                setValue(() => nextValue as typeof latest);
              }
            }}
          />
        );
      }

      render(() => <ControlledDateRangePicker />);

      const dialog = await screen.findByRole("dialog");
      await waitFor(() => {
        expect(screen.getByText("Start time")).toBeInTheDocument();
        expect(screen.getByText("End time")).toBeInTheDocument();
      });

      let popupStartHourSegment: HTMLElement | undefined;
      await waitFor(() => {
        const hourSegments = within(dialog).getAllByRole("spinbutton", {
          name: /hour/i,
        }) as HTMLElement[];
        expect(hourSegments.length).toBeGreaterThan(0);
        popupStartHourSegment = hourSegments[0];
      });
      if (!popupStartHourSegment) {
        throw new Error("Expected popup start hour segment");
      }
      fireEvent.keyDown(popupStartHourSegment, { key: "ArrowUp" });

      await waitFor(() => {
        expect(String(latest.start)).toContain("T09:45");
        expect(document.querySelector('input[name="startDate"]')).toHaveValue("2025-02-03T09:45");
        expect(document.querySelector('input[name="endDate"]')).toHaveValue("2025-02-14T17:30");
      });
    });
  });

  describe("accessibility", () => {
    it("renders a presentation field-group container (S2 overrides RAC's group)", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();

      // S2 seeds its FieldGroup's RAC <Group> with role="presentation", overriding
      // the faithful role="group" createDateRangePicker returns — so there is no
      // group in the a11y tree, only the presentation FieldGroup.
      expect(document.querySelector('[role="group"]')).not.toBeInTheDocument();
      expect(getFieldGroup()).toBeInTheDocument();
    });

    it("links label and error ids to the presentation field group", async () => {
      render(() => (
        <DateRangePicker
          label="Trip dates"
          description="Choose travel dates"
          isInvalid
          errorMessage="Invalid range"
        />
      ));
      await waitForHydration();

      const fieldGroup = getFieldGroup();
      const describedby = fieldGroup.getAttribute("aria-describedby") ?? "";
      const error = screen.getByText("Invalid range");

      expect(labelledByText(fieldGroup)).toContain("Trip dates");
      expect(error.id).toBeTruthy();
      expect(describedby.split(" ")).toContain(error.id);
    });
  });
});
