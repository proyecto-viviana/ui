/**
 * Hydration half of the DatePicker SSR regression (#189).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
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
    document.body.innerHTML = "";
  });

  it("hydrates field segments without a mismatch", () => {
    const html = readFileSync(
      resolve(import.meta.dirname, "../../../output/datepicker-ssr.html"),
      "utf8",
    );
    const container = hydrateOverSsr(html, () => <DatePickerFixture />);
    expect(container.querySelectorAll('[role="spinbutton"]').length).toBeGreaterThan(0);
    const hidden = container.querySelector('input[name="event"][hidden]');
    expect(hidden).not.toBeNull();
    expect(hidden?.getAttribute("value")).toBe("2026-09-04");
  });
});
