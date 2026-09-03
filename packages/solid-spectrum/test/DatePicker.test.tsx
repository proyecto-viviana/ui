import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, waitFor, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { DatePicker } from "../src/calendar/DatePicker";
import {
  CalendarDateClass as CalendarDate,
  CalendarDateTimeClass as CalendarDateTime,
} from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { style } from "../src/style";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });
}

const user = setupUser();

describe("DatePicker (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
  });

  // S2 overrides RAC's <Group> to role="presentation"; the label/describedby
  // associations ride on that presentation FieldGroup (createDatePicker groupProps).
  // role="presentation" is not in the a11y tree, so it is queried by attribute.
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

  it("links visible label and description to the presentation field group", async () => {
    render(() => <DatePicker label="Event date" description="Select an event day" />);
    await waitForHydration();

    const fieldGroup = getFieldGroup();
    const description = screen.getByText("Select an event day");
    const describedby = fieldGroup.getAttribute("aria-describedby") ?? "";

    expect(labelledByText(fieldGroup)).toContain("Event date");
    expect(description.id).toBeTruthy();
    expect(describedby.split(" ")).toContain(description.id);
  });

  it("links error message to the presentation field group when invalid", async () => {
    render(() => <DatePicker label="Birth date" isInvalid errorMessage="Date is required" />);
    await waitForHydration();

    const fieldGroup = getFieldGroup();
    const error = screen.getByText("Date is required");
    const describedby = fieldGroup.getAttribute("aria-describedby") ?? "";

    expect(labelledByText(fieldGroup)).toContain("Birth date");
    expect(error.id).toBeTruthy();
    expect(describedby.split(" ")).toContain(error.id);
  });

  it("shows required indicator when isRequired is set", async () => {
    render(() => <DatePicker label="Appointment" isRequired />);
    await waitForHydration();

    // S2 renders the required marker as an aria-hidden AsteriskIcon inside the
    // label, NOT as aria-required on the group — faithful useDatePicker groupProps
    // carries no aria-required.
    const fieldGroup = getFieldGroup();
    expect(fieldGroup).not.toHaveAttribute("aria-required");

    const labelledby = fieldGroup.getAttribute("aria-labelledby") ?? "";
    const label = document.getElementById(labelledby.split(" ")[0]) as HTMLElement;
    expect(label).toHaveTextContent("Appointment");
    expect(label.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("renders contextual help next to the visible label", async () => {
    render(() => (
      <DatePicker label="Appointment" contextualHelp={<button type="button">Date help</button>} />
    ));
    await waitForHydration();

    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]') as HTMLElement;
    expect(contextualHelp).toBeInTheDocument();
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Date help" }));
  });

  it("forwards shouldForceLeadingZeros to visible date segments", async () => {
    render(() => (
      <DatePicker
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

  it("forwards custom button aria-label", async () => {
    render(() => <DatePicker aria-label="Date picker" buttonAriaLabel="Choose date" />);
    await waitForHydration();

    expect(screen.getByRole("button", { name: "Choose date" })).toBeInTheDocument();
  });

  it("renders TimeField inside popover when granularity includes time", async () => {
    render(() => <DatePicker label="Event" granularity="minute" />);
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });
  });

  it("renders TimeField inside popover when defaultValue is a CalendarDateTime", async () => {
    render(() => (
      <DatePicker label="Event" defaultValue={new CalendarDateTime(2024, 6, 15, 10, 30)} />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });
  });

  it("forwards shouldForceLeadingZeros to the popup TimeField", async () => {
    render(() => (
      <DatePicker
        label="Event"
        defaultValue={new CalendarDateTime(2025, 2, 3, 8, 5)}
        granularity="minute"
        hourCycle={24}
        shouldForceLeadingZeros
      />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });

    const hourSegments = screen.getAllByRole("spinbutton", { name: /hour/i });
    const minuteSegments = screen.getAllByRole("spinbutton", { name: /minute/i });
    expect(hourSegments[hourSegments.length - 1]).toHaveTextContent("08");
    expect(minuteSegments[minuteSegments.length - 1]).toHaveTextContent("05");
  });

  it("wires popup TimeField changes back to the DatePicker value", async () => {
    let latest = new CalendarDateTime(2024, 6, 15, 10, 30);

    function ControlledDatePicker() {
      const [value, setValue] = createSignal(latest);

      return (
        <DatePicker
          label="Event"
          value={value()}
          granularity="minute"
          hourCycle={24}
          onChange={(nextValue) => {
            if (nextValue) {
              latest = nextValue as typeof latest;
              setValue(() => nextValue as typeof latest);
            }
          }}
        />
      );
    }

    render(() => <ControlledDatePicker />);
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });

    const hourSegments = screen.getAllByRole("spinbutton", { name: /hour/i }) as HTMLElement[];
    const popupHourSegment = hourSegments[hourSegments.length - 1];
    popupHourSegment.focus();
    await user.keyboard("{ArrowUp}");

    await waitFor(() => {
      expect(String(latest)).toContain("T11:30");
    });
  });

  it("routes calendar state props into the popup calendar", async () => {
    render(() => (
      <DatePicker
        label="Event"
        defaultValue={new CalendarDate(2025, 2, 14)}
        maxVisibleMonths={2}
        firstDayOfWeek="mon"
        minValue={new CalendarDate(2025, 2, 3)}
        maxValue={new CalendarDate(2025, 2, 20)}
        isDateUnavailable={(date) => date.day === 10}
      />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getAllByRole("grid")).toHaveLength(2);
    });

    const [firstGrid] = screen.getAllByRole("grid");
    const weekdayLabels = Array.from(firstGrid.querySelectorAll("thead th")).map(
      (cell) => cell.textContent?.trim() ?? "",
    );
    expect(weekdayLabels).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(screen.getByRole("button", { name: /Sunday, February 2, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Monday, February 10, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Friday, February 21, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("renders fixed medium calendar popover geometry by default", async () => {
    render(() => <DatePicker label="Event" defaultValue={new CalendarDate(2025, 2, 14)} />);
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    const dialog = await waitFor(() => screen.getByRole("dialog"));
    const frame = dialog.firstElementChild as HTMLElement;

    expect(frame.className).not.toBe("");
    await waitFor(() => {
      expect(screen.getAllByRole("grid")).toHaveLength(1);
    });

    const grid = screen.getByRole("grid");
    const calendar = grid.parentElement?.parentElement as HTMLElement;
    expect(calendar.style.width).toBe("272px");
    expect(grid).toHaveStyle({ width: "224px" });
  });

  it("widens the calendar popover when maxVisibleMonths is greater than 1", async () => {
    render(() => (
      <DatePicker label="Event" defaultValue={new CalendarDate(2025, 2, 14)} maxVisibleMonths={2} />
    ));
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getAllByRole("grid")).toHaveLength(2);
    });

    const grid = screen.getAllByRole("grid")[0];
    const calendar = grid.parentElement?.parentElement as HTMLElement;
    expect(calendar.style.width).toBe("fit-content");
    expect(calendar.style.width).not.toBe("272px");
  });

  it("disables calendar previous and next when the next page is outside min/max", async () => {
    render(() => (
      <DatePicker
        label="Event"
        defaultValue={new CalendarDate(2025, 2, 14)}
        minValue={new CalendarDate(2025, 2, 3)}
        maxValue={new CalendarDate(2025, 2, 20)}
      />
    ));
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    expect(screen.getAllByRole("button", { name: "Previous" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "Next" })[0]).toBeDisabled();
  });

  it("keeps field segments on the locale calendar when createCalendar is set", async () => {
    render(() => (
      <DatePicker
        label="Due date"
        defaultValue={new CalendarDate(2025, 2, 14)}
        createCalendar={() => {
          throw new Error("createCalendar leaked onto DateField state");
        }}
      />
    ));
    await waitForHydration();

    const segments = screen.getAllByRole("spinbutton");
    expect(segments.map((segment) => segment.getAttribute("aria-valuenow"))).toEqual([
      "2",
      "14",
      "2025",
    ]);
  });

  it("keeps focus on Next and names the grid for the new month after paging", async () => {
    render(() => <DatePicker label="Event" defaultValue={new CalendarDate(2025, 2, 14)} />);
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    const grid = await waitFor(() => screen.getByRole("grid"));
    expect(grid).toHaveAttribute("aria-label", expect.stringMatching(/February 2025/));

    await user.click(screen.getAllByRole("button", { name: "Next" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("grid")).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/March 2025/),
      );
    });
    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: "Next" })[0]).toHaveFocus();
    });
  });

  it("field group click focuses the last non-placeholder segment", async () => {
    render(() => <DatePicker label="Event" defaultValue={new CalendarDate(2024, 6, 15)} />);
    await waitForHydration();

    // The presentation FieldGroup is itself the click target that routes focus into
    // the date input (createDatePicker groupProps + the S2 onClick handler); it holds
    // both the segments and the trigger button.
    const fieldGroup = getFieldGroup();
    expect(fieldGroup.querySelector("button")).toBeTruthy();

    await user.click(fieldGroup);

    const segments = fieldGroup.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    const lastSegment = segments[segments.length - 1];
    expect(document.activeElement).toBe(lastSegment);
  });

  const datePickerEnteringMotion = style<{
    isEntering?: boolean;
    placement?: "top" | "bottom" | "left" | "right";
  }>({
    opacity: {
      isEntering: 0,
    },
    translateY: {
      placement: {
        top: {
          isEntering: 4,
        },
        bottom: {
          isEntering: -4,
        },
      },
    },
  });

  function classTokens(className: string): string[] {
    return className.split(/\s+/).filter(Boolean);
  }

  it("applies the bottom-axis S2 entering translate class, not the top sign", async () => {
    let resolveEnter!: () => void;
    const enterFinished = new Promise<void>((resolve) => {
      resolveEnter = resolve;
    });
    const previous = Object.getOwnPropertyDescriptor(Element.prototype, "getAnimations");
    Object.defineProperty(Element.prototype, "getAnimations", {
      configurable: true,
      writable: true,
      value: () => [{ finished: enterFinished }] as unknown as Animation[],
    });
    if (typeof CSSTransition === "undefined") {
      (globalThis as { CSSTransition?: unknown }).CSSTransition = class CSSTransition {};
    }

    try {
      render(() => <DatePicker label="Event" />);
      await waitForHydration();

      await user.click(screen.getByRole("button"));
      const popover = await waitFor(() => {
        const node = document.querySelector("[data-trigger='DatePicker']") as HTMLElement | null;
        expect(node).toBeInTheDocument();
        return node!;
      });

      await waitFor(() => expect(popover).toHaveAttribute("data-entering"));
      await waitFor(() => expect(popover.getAttribute("data-placement")).toBe("bottom"));

      // Failure mode: DatePickerContent class got placement=null/`undefined` on
      // enter, so `datePickerPopover({ placement: undefined, isEntering: true })`
      // compiled the first placement branch (top, +4px) — certified D2 open-enter.
      const bottomEntering = classTokens(
        datePickerEnteringMotion({ isEntering: true, placement: "bottom" }),
      );
      const topEntering = classTokens(
        datePickerEnteringMotion({ isEntering: true, placement: "top" }),
      );
      const popoverTokens = classTokens(popover.className);
      expect(bottomEntering.some((token) => popoverTokens.includes(token))).toBe(true);
      expect(topEntering.filter((token) => !bottomEntering.includes(token)).length).toBeGreaterThan(
        0,
      );
      expect(
        topEntering
          .filter((token) => !bottomEntering.includes(token))
          .every((token) => !popoverTokens.includes(token)),
      ).toBe(true);
    } finally {
      resolveEnter();
      if (previous) {
        Object.defineProperty(Element.prototype, "getAnimations", previous);
      } else {
        delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
      }
    }
  });

  it("tabs Previous → month grid → Next inside the open popover", async () => {
    render(() => <DatePicker label="Event" />);
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    const dialog = await waitFor(() => screen.getByRole("dialog"));

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
    expect(secondInGrid || /next/i.test(secondName)).toBe(true);
    if (secondInGrid) {
      await user.tab();
      expect(document.activeElement).toHaveAccessibleName(/next/i);
    }
  });
});
