/**
 * SSR half of the Calendar hydration regression (#189).
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import {
  Calendar,
  CalendarButton,
  CalendarCell,
  CalendarGrid,
  CalendarHeading,
} from "../src/Calendar";

function CalendarFixture() {
  return (
    <I18nProvider locale="en-US">
      <Calendar
        aria-label="Event calendar"
        defaultFocusedValue={new CalendarDate(2026, 9, 4)}
        defaultValue={new CalendarDate(2026, 9, 4)}
      >
        <header>
          <CalendarButton slot="previous">Previous</CalendarButton>
          <CalendarHeading />
          <CalendarButton slot="next">Next</CalendarButton>
        </header>
        <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
      </Calendar>
    </I18nProvider>
  );
}

describe("Calendar SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders the grid instead of an aria-hidden placeholder", () => {
    const html = renderToString(() => <CalendarFixture />);

    expect(html).not.toContain("solidaria-Calendar--placeholder");
    expect(html).toContain('role="grid"');
    expect(html).toContain('role="gridcell"');

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "calendar-ssr.html"), html, "utf8");
  });
});
