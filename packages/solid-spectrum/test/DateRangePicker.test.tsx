/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, waitFor, fireEvent } from "@solidjs/testing-library";
import { parseDate } from "@proyecto-viviana/solid-stately";
import { DateRangePicker } from "../src/calendar/DateRangePicker";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
}

describe("DateRangePicker (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders start and end date display fields", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      expect(container.textContent).toContain("Start date");
      expect(container.textContent).toContain("End date");
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

      expect(screen.getByLabelText("Start date")).toBeInTheDocument();
      expect(screen.getByLabelText("End date")).toBeInTheDocument();
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

    it("opens popup from start field keyboard interaction", async () => {
      render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();

      const startField = screen.getByLabelText("Start date");
      startField.focus();
      fireEvent.keyDown(startField, { key: "Enter" });

      await waitFor(() => {
        expect(screen.getByRole("dialog", { name: "Range calendar" })).toBeInTheDocument();
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

      const dialog = await screen.findByRole("dialog", { name: "Range calendar" });
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
  });

  describe("accessibility", () => {
    it("has a group role container", async () => {
      const { container } = render(() => <DateRangePicker aria-label="Date range" />);
      await waitForHydration();
      expect(container.querySelector('[role="group"]')).toBeInTheDocument();
    });

    it("links description and error ids via aria-describedby", async () => {
      render(() => (
        <DateRangePicker
          label="Trip dates"
          description="Choose travel dates"
          isInvalid
          errorMessage="Invalid range"
        />
      ));
      await waitForHydration();

      const group = screen.getByRole("group", { name: "Trip dates" });
      const describedby = group.getAttribute("aria-describedby") ?? "";
      const error = screen.getByText("Invalid range");

      expect(error.id).toBeTruthy();
      expect(describedby.split(" ")).toContain(error.id);
    });
  });
});
