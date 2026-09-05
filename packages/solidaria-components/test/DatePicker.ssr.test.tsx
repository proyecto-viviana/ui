/**
 * SSR half of the DatePicker hydration regression (#189).
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
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

describe("DatePicker SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders field segments and HiddenDateInput instead of an aria-hidden placeholder", () => {
    const html = renderToString(() => <DatePickerFixture />);

    expect(html).not.toContain("solidaria-DatePicker--placeholder");
    expect(html).toContain('role="spinbutton"');
    expect(html).toContain('name="event"');
    expect(html).toContain('value="2026-09-04"');
    expect(html).toContain("hidden");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "datepicker-ssr.html"), html, "utf8");
  });
});
