/**
 * Hydration half of the Calendar SSR regression (#189).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
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

describe("Calendar hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates the grid without a mismatch", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../../../output/calendar-ssr.html"), "utf8");
    const container = hydrateOverSsr(html, () => <CalendarFixture />);
    expect(container.querySelector('[role="grid"]')).not.toBeNull();
    expect(container.querySelectorAll('[role="gridcell"]').length).toBeGreaterThan(0);
  });
});
