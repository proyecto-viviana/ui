/**
 * Hydration half of the DatePicker SSR regression (#189).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { waitFor } from "@solidjs/testing-library";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { hydrateOverSsr, setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../../solidaria/test-utils/hydrate";
import { DatePicker, DatePickerButton, DatePickerContent } from "../src/DatePicker";
import { DateInput, DateSegment } from "../src/DateField";
import {
  Calendar,
  CalendarButton,
  CalendarCell,
  CalendarGrid,
  CalendarHeading,
} from "../src/Calendar";

function DatePickerFixture() {
  return (
    <I18nProvider locale="en-US">
      <DatePicker aria-label="Event date" value={new CalendarDate(2026, 9, 4)} name="event">
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
        <DatePickerButton>Open</DatePickerButton>
        <DatePickerContent>
          <Calendar>
            <header>
              <CalendarButton slot="previous">Previous</CalendarButton>
              <CalendarHeading />
              <CalendarButton slot="next">Next</CalendarButton>
            </header>
            <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
          </Calendar>
        </DatePickerContent>
      </DatePicker>
    </I18nProvider>
  );
}

describe("DatePicker hydration over SSR markup", () => {
  afterEach(() => {
    cleanupHydrationRoots();
    document.body.innerHTML = "";
  });

  it("hydrates field segments without a mismatch", async () => {
    const html = readFileSync(
      resolve(import.meta.dirname, "../../../output/datepicker-ssr.html"),
      "utf8",
    );
    const selector = '[role="spinbutton"], button[aria-haspopup="dialog"]';
    let serverNodes: Element[] = [];
    const container = await hydrateOverSsr(html, () => <DatePickerFixture />, {
      beforeHydrate(container) {
        serverNodes = Array.from(container.querySelectorAll(selector));
        expect(serverNodes).toHaveLength(4);
      },
    });
    const hydratedNodes = container.querySelectorAll(selector);
    expect(hydratedNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(hydratedNodes[index]).toBe(node));
    expect(container.querySelectorAll('[role="spinbutton"]').length).toBeGreaterThan(0);
    const hidden = container.querySelector('input[name="event"][hidden]');
    expect(hidden).not.toBeNull();
    expect(hidden?.getAttribute("value")).toBe("2026-09-04");

    const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await setupUser().click(trigger);
    await waitFor(() => {
      expect(document.querySelector(".solidaria-DatePickerContent")).toBeInTheDocument();
    });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const openNodes = container.querySelectorAll(selector);
    expect(openNodes).toHaveLength(serverNodes.length);
    serverNodes.forEach((node, index) => expect(openNodes[index]).toBe(node));
    expect(container.querySelector('input[name="event"][hidden]')).toBe(hidden);
    expect(hidden).toHaveAttribute("value", "2026-09-04");
  });
});
