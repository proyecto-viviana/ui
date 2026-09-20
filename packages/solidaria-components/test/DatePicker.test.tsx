/**
 * DatePicker tests - Port of React Aria's DatePicker.test.tsx
 *
 * Tests for DatePicker component functionality including:
 * - Rendering
 * - Opening/closing calendar
 * - Date selection
 * - Validation
 * - Disabled/readonly states
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { DatePicker, DatePickerButton, DatePickerContent } from "../src/DatePicker";
import { DateInput, DateSegment } from "../src/DateField";
import { Text } from "../src/Text";
import { Form } from "../src/Form";
import {
  Calendar,
  CalendarGrid,
  CalendarCell,
  CalendarButton,
  CalendarHeading,
} from "../src/Calendar";
import { CalendarDate, CalendarDateTime, parseZonedDateTime } from "@internationalized/date";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

// Helper to wait for DatePicker to hydrate (it uses client-only rendering)
async function waitForDatePickerHydration() {
  await waitFor(() => {
    const picker = document.querySelector(
      ".solidaria-DatePicker:not(.solidaria-DatePicker--placeholder)",
    );
    expect(picker).toBeInTheDocument();
  });
}

// Helper component for testing DatePicker
function TestDatePicker(props: { pickerProps?: Partial<Parameters<typeof DatePicker>[0]> }) {
  return (
    <DatePicker aria-label="Test Date Picker" {...props.pickerProps}>
      <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      <DatePickerButton>📅</DatePickerButton>
      <DatePickerContent>
        <Calendar>
          <header>
            <CalendarButton slot="previous">◀</CalendarButton>
            <CalendarHeading />
            <CalendarButton slot="next">▶</CalendarButton>
          </header>
          <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
        </Calendar>
      </DatePickerContent>
    </DatePicker>
  );
}

describe("DatePicker", () => {
  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toBeInTheDocument();
    });

    it("should render date segments", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const segments = screen.getAllByRole("spinbutton");
      expect(segments.length).toBe(3); // month, day, year
    });

    it('links aria-describedby to a <Text slot="description"> via TextContext slots', async () => {
      // DatePicker provides descriptionProps as a TextContext slot, so the
      // <Text slot="description"> picks up the description id. Faithful RAC
      // useDatePicker seeds that same id onto BOTH groupProps and buttonProps
      // (useDatePicker.mjs: buttonProps['aria-describedby'] = ariaDescribedBy).
      // The bare roleless container renders no group shell here, so the
      // DatePickerButton is the observable carrier of the linkage.
      render(() => (
        <DatePicker aria-label="Test Date Picker" description="Help text">
          <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
          <DatePickerButton>📅</DatePickerButton>
          <Text slot="description">Help text</Text>
        </DatePicker>
      ));
      await waitForDatePickerHydration();

      const description = document.querySelector(".solidaria-Text[id]") as HTMLElement;
      expect(description).toHaveTextContent("Help text");
      expect(description).toHaveClass("solidaria-Text");
      const descId = description.id;
      expect(descId).toBeTruthy();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      const describedby = button.getAttribute("aria-describedby") ?? "";
      expect(describedby.split(" ")).toContain(descId);
    });

    it("should not apply popup trigger ARIA attrs to DateInput container", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const input = document.querySelector(".solidaria-DateInput");
      expect(input).toBeInTheDocument();
      expect(input).not.toHaveAttribute("aria-haspopup");
      expect(input).not.toHaveAttribute("aria-expanded");
    });

    it("should apply popup trigger ARIA attrs to DatePickerButton", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-haspopup", "dialog");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should render picker button", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton");
      expect(button).toBeInTheDocument();
    });

    it("should render with custom class", async () => {
      render(() => <TestDatePicker pickerProps={{ class: "my-date-picker" }} />);

      // Custom class replaces default, so wait for the custom class
      await waitFor(() => {
        const picker = document.querySelector(".my-date-picker");
        expect(picker).toBeInTheDocument();
      });
    });

    it("should not render calendar content by default", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const content = document.querySelector(".solidaria-DatePickerContent");
      expect(content).not.toBeInTheDocument();
    });
  });

  // ============================================
  // OPENING/CLOSING CALENDAR
  // ============================================

  describe("opening/closing calendar", () => {
    it("should open calendar on button click", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const content = document.querySelector(".solidaria-DatePickerContent");
        expect(content).toBeInTheDocument();
      });
    });

    it("should render calendar content with defaultOpen", async () => {
      render(() => <TestDatePicker pickerProps={{ defaultOpen: true }} />);
      await waitForDatePickerHydration();

      await waitFor(() => {
        const content = document.querySelector(".solidaria-DatePickerContent");
        expect(content).toBeInTheDocument();
      });
    });

    it("should request but not mutate controlled open state", async () => {
      const onOpenChange = vi.fn();
      render(() => <TestDatePicker pickerProps={{ isOpen: false, onOpenChange }} />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      expect(onOpenChange).toHaveBeenCalledWith(true);
      expect(document.querySelector(".solidaria-DatePickerContent")).not.toBeInTheDocument();
    });

    it("should set data-open attribute when open", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const picker = document.querySelector(".solidaria-DatePicker");
        expect(picker).toHaveAttribute("data-open");
      });
    });

    it("should show calendar grid when open", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      // The popover reveals the embedded Calendar — assert its grid and day
      // gridcells by role (mirrors upstream DatePicker.test.js `getAllByRole('gridcell')`).
      const grid = await screen.findByRole("grid");
      expect(grid).toBeInTheDocument();
      expect(within(grid).getAllByRole("gridcell").length).toBeGreaterThanOrEqual(28);
    });

    it("should render content outside picker container (portal)", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const picker = document.querySelector(".solidaria-DatePicker");
        const content = document.querySelector(".solidaria-DatePickerContent");
        expect(content).toBeInTheDocument();
        expect(picker?.contains(content as Node)).toBe(false);
      });
    });

    it("should close calendar on Escape", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const content = document.querySelector(".solidaria-DatePickerContent");
        expect(content).toBeInTheDocument();
      });

      const content = document.querySelector(".solidaria-DatePickerContent") as HTMLElement;
      fireEvent.keyDown(content, { key: "Escape" });

      await waitFor(() => {
        const popup = document.querySelector(".solidaria-DatePickerContent");
        expect(popup).not.toBeInTheDocument();
      });
    });

    it("keeps the calendar mounted and marks it exiting until its animation settles", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);
      const content = await waitFor(() => {
        const node = document.querySelector(".solidaria-DatePickerContent") as HTMLElement | null;
        expect(node).toBeInTheDocument();
        return node!;
      });

      let finishExit!: () => void;
      const finished = new Promise<void>((resolve) => {
        finishExit = resolve;
      });
      Object.defineProperty(content, "getAnimations", {
        configurable: true,
        value: () => [{ finished } as Animation],
      });

      fireEvent.keyDown(content, { key: "Escape" });

      expect(content).toBeInTheDocument();
      expect(content).toHaveAttribute("data-exiting");
      finishExit();

      await waitFor(() => {
        expect(document.querySelector(".solidaria-DatePickerContent")).not.toBeInTheDocument();
      });
    });

    it("should close calendar on outside click", async () => {
      render(() => (
        <div>
          <TestDatePicker />
          <button data-testid="outside">outside</button>
        </div>
      ));
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const content = document.querySelector(".solidaria-DatePickerContent");
        expect(content).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("outside"));

      await waitFor(() => {
        const popup = document.querySelector(".solidaria-DatePickerContent");
        expect(popup).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // DATE SELECTION
  // ============================================

  describe("date selection", () => {
    it("should have interactive calendar cells when opened", async () => {
      // Note: Full date selection involves complex pointer events that
      // don't work reliably in jsdom. This test verifies the calendar
      // renders with interactive cells.
      render(() => (
        <TestDatePicker
          pickerProps={{
            defaultValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForDatePickerHydration();

      // Open calendar
      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      await waitFor(() => {
        const grid = document.querySelector('[role="grid"]');
        expect(grid).toBeInTheDocument();
      });

      // Verify calendar cells are rendered
      const cells = document.querySelectorAll(".solidaria-CalendarCell");
      expect(cells.length).toBeGreaterThan(0);

      // Each cell should have gridcell role
      const gridcells = document.querySelectorAll('[role="gridcell"]');
      expect(gridcells.length).toBeGreaterThan(0);
    });

    it("should display value when provided", async () => {
      render(() => <TestDatePicker pickerProps={{ value: new CalendarDate(2024, 6, 15) }} />);
      await waitForDatePickerHydration();

      const segments = screen.getAllByRole("spinbutton");
      const segmentTexts = segments.map((s) => s.textContent);

      expect(segmentTexts.join(" ")).toContain("15");
      expect(segmentTexts.join(" ")).toContain("2024");
    });

    it("should display defaultValue", async () => {
      render(() => (
        <TestDatePicker pickerProps={{ defaultValue: new CalendarDate(2024, 3, 20) }} />
      ));
      await waitForDatePickerHydration();

      const segments = screen.getAllByRole("spinbutton");
      const segmentTexts = segments.map((s) => s.textContent);

      expect(segmentTexts.join(" ")).toContain("20");
      expect(segmentTexts.join(" ")).toContain("2024");
    });

    it("should render native validation datetime input with form owner by default", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            name: "dueDate",
            form: "projectForm",
            defaultValue: new CalendarDateTime(2025, 2, 3, 8, 45),
            granularity: "minute",
          }}
        />
      ));
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      expect(input.value).toBe("2025-02-03T08:45");
      expect(input.getAttribute("form")).toBe("projectForm");
    });

    it("should participate in associated form data", async () => {
      render(() => (
        <div>
          <form id="projectForm" />
          <TestDatePicker
            pickerProps={{
              name: "dueDate",
              form: "projectForm",
              defaultValue: new CalendarDate(2025, 2, 3),
            }}
          />
        </div>
      ));
      await waitForDatePickerHydration();

      const form = document.getElementById("projectForm") as HTMLFormElement;
      expect(form).toBeInTheDocument();
      expect(new FormData(form).getAll("dueDate").map(String)).toEqual(["2025-02-03"]);
    });

    it("should preserve zoned values in the native validation form input", async () => {
      const value = parseZonedDateTime("2025-02-03T08:45:30-05:00[America/New_York]");
      render(() => (
        <TestDatePicker
          pickerProps={{
            name: "dueDate",
            defaultValue: value,
            granularity: "minute",
          }}
        />
      ));
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      expect(input.value).toBe("2025-02-03T08:45:30-05:00[America/New_York]");
    });

    it("should render a native required input for native validation behavior", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            name: "dueDate",
            isRequired: true,
            validationBehavior: "native",
            defaultValue: new CalendarDate(2025, 2, 3),
          }}
        />
      ));
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "text");
      expect(input).toHaveAttribute("hidden");
      expect(input).toBeRequired();
      // Same element by role: a native-validation hidden form input is a `textbox`
      // (mirrors upstream DatePicker.test.js `getByRole('textbox', {hidden: true})`).
      expect(screen.getByRole("textbox", { hidden: true })).toBe(input);
    });

    it("should render hidden input semantics for aria validation behavior", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            name: "dueDate",
            isRequired: true,
            validationBehavior: "aria",
            defaultValue: new CalendarDate(2025, 2, 3),
          }}
        />
      ));
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "hidden");
      expect(input).not.toHaveAttribute("hidden");
      expect(input).not.toBeRequired();
    });

    it("should inherit validation behavior from Form context", async () => {
      render(() => (
        <Form validationBehavior="aria">
          <TestDatePicker
            pickerProps={{
              name: "dueDate",
              isRequired: true,
              defaultValue: new CalendarDate(2025, 2, 3),
            }}
          />
        </Form>
      ));
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      expect(input).toHaveAttribute("type", "hidden");
      expect(input).not.toHaveAttribute("hidden");
      expect(input).not.toBeRequired();
    });

    it("should update hidden input when controlled zoned value changes", async () => {
      const initialValue = parseZonedDateTime("2025-02-03T08:45:30-05:00[America/New_York]");
      const nextValue = parseZonedDateTime("2025-02-03T09:45:30-05:00[America/New_York]");

      function ControlledDatePicker() {
        const [value, setValue] = createSignal(initialValue);

        queueMicrotask(() => setValue(nextValue));

        return (
          <TestDatePicker
            pickerProps={{
              name: "dueDate",
              value: value(),
              granularity: "minute",
            }}
          />
        );
      }

      render(() => <ControlledDatePicker />);
      await waitForDatePickerHydration();

      const input = document.querySelector('input[name="dueDate"]') as HTMLInputElement;
      await waitFor(() => {
        expect(input.value).toBe("2025-02-03T09:45:30-05:00[America/New_York]");
      });
    });
  });

  // ============================================
  // VALIDATION
  // ============================================

  describe("validation", () => {
    it("should mark picker as invalid when isInvalid prop is true", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            isInvalid: true,
            errorMessage: "Invalid date",
          }}
        />
      ));
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-invalid");
    });

    it("should support isInvalid state", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            value: new CalendarDate(2024, 6, 15),
            validationState: "invalid",
          }}
        />
      ));
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-invalid");
    });

    it("should mark picker as invalid when value is below minValue", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            value: new CalendarDate(2024, 6, 5),
            minValue: new CalendarDate(2024, 6, 10),
          }}
        />
      ));
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-invalid");
    });

    it("should mark picker as invalid when validate returns an error", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            value: new CalendarDate(2024, 6, 15),
            validate: () => "Unavailable date",
            validationBehavior: "aria",
          }}
        />
      ));
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-invalid");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled on DatePicker", async () => {
      render(() => <TestDatePicker pickerProps={{ isDisabled: true }} />);
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-disabled");
    });

    it("should disable button when picker is disabled", async () => {
      render(() => <TestDatePicker pickerProps={{ isDisabled: true }} />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton");
      expect(button).toBeDisabled();
    });

    it("should not open calendar when disabled", async () => {
      render(() => <TestDatePicker pickerProps={{ isDisabled: true }} />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      // Calendar should not open
      const content = document.querySelector(".solidaria-DatePickerContent");
      expect(content).not.toBeInTheDocument();
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly on DatePicker", async () => {
      render(() => <TestDatePicker pickerProps={{ isReadOnly: true }} />);
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-readonly");
    });
  });

  // ============================================
  // REQUIRED STATE
  // ============================================

  describe("required state", () => {
    it("should support isRequired on DatePicker", async () => {
      render(() => <TestDatePicker pickerProps={{ isRequired: true }} />);
      await waitForDatePickerHydration();

      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).toHaveAttribute("data-required");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have spinbutton role on editable segments", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const spinbuttons = screen.getAllByRole("spinbutton");
      expect(spinbuttons.length).toBe(3);
    });

    it("keeps the picker container roleless; the aria-label names the field", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      // Faithful RAC-components DatePicker: the container <div> is BARE and
      // ROLELESS — no role, no aria-label. The label is threaded onto the field
      // semantics (segments + trigger) via useDatePicker's fieldProps flow; the
      // group shell (role="presentation" at the S2 layer) is what carries the
      // label association, never this outer container.
      const picker = document.querySelector(".solidaria-DatePicker");
      expect(picker).not.toHaveAttribute("role");
      expect(picker).not.toHaveAttribute("aria-label");

      // The name reaches the field: each editable segment folds "Test Date Picker"
      // into its accessible label.
      const segment = screen.getAllByRole("spinbutton")[0];
      expect(segment.getAttribute("aria-label")).toContain("Test Date Picker");
    });

    it("should forward shouldForceLeadingZeros to DateInput segments", async () => {
      render(() => (
        <TestDatePicker
          pickerProps={{
            defaultValue: new CalendarDate(2025, 2, 3),
            shouldForceLeadingZeros: true,
          }}
        />
      ));
      await waitForDatePickerHydration();

      expect(screen.getByRole("spinbutton", { name: /month/i })).toHaveTextContent("02");
      expect(screen.getByRole("spinbutton", { name: /day/i })).toHaveTextContent("03");
    });
  });

  // ============================================
  // POPOVER PLACEMENT + TAB ORDER (wave-3 #251)
  // ============================================

  describe("open popover placement and tab order", () => {
    it("seeds data-placement to the preferred bottom axis so the S2 entering translate is not the top sign", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      const popover = await waitFor(() => {
        const node = document.querySelector("[data-trigger='DatePicker']") as HTMLElement | null;
        expect(node).toBeInTheDocument();
        return node!;
      });

      // Failure mode: shared Popover reports placement=null on the first paint
      // (createEffect positioning, unlike RAC useLayoutEffect). S2 popoverStyles
      // then miss `placement === "bottom"` (translateY -4) and the first matching
      // branch is top (translateY +4) — certified D2 open-enter.
      expect(popover.getAttribute("data-placement")).toBe("bottom");
    });

    it("tabs Previous → month grid → Next inside the open calendar dialog, matching RAC Dialog autoFocus", async () => {
      render(() => <TestDatePicker />);
      await waitForDatePickerHydration();

      const button = document.querySelector(".solidaria-DatePickerButton") as HTMLElement;
      await user.click(button);

      const dialog = await waitFor(() => screen.getByRole("dialog"));
      expect(dialog.tagName).toBe("SECTION");

      // Failure mode: PopoverInner focused the overlay (tabIndex=-1) because
      // isDialog started true and createDialog never ran on the raw <section>.
      // First Tab then hit a focus sink before Previous (certified D5 open-trap).
      await waitFor(() => {
        expect(dialog.contains(document.activeElement)).toBe(true);
      });

      await user.tab();
      expect(document.activeElement).toHaveAccessibleName(/previous/i);

      await user.tab();
      const second = document.activeElement as HTMLElement | null;
      expect(second).toBeTruthy();
      const secondName = second?.getAttribute("aria-label") ?? second?.textContent ?? "";
      const secondInGrid = Boolean(second?.closest('[role="grid"]'));
      expect(
        secondInGrid || /next/i.test(secondName),
        `second tab stop was <${second?.tagName?.toLowerCase()} role=${second?.getAttribute("role")} name=${JSON.stringify(secondName)}>`,
      ).toBe(true);
      if (secondInGrid) {
        await user.tab();
        expect(document.activeElement).toHaveAccessibleName(/next/i);
      }
    });
  });
});
