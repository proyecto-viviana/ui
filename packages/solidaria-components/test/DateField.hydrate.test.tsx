/**
 * Hydration half of the DateField SSR regression (#189).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { DateField, DateInput, DateSegment } from "../src/DateField";

function DateFieldFixture() {
  return (
    <I18nProvider locale="en-US">
      <DateField aria-label="Event date" value={new CalendarDate(2026, 9, 4)} name="event">
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </DateField>
    </I18nProvider>
  );
}

describe("DateField hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates segments without a mismatch", () => {
    const html = readFileSync(
      resolve(import.meta.dirname, "../../../output/datefield-ssr.html"),
      "utf8",
    );
    const container = hydrateOverSsr(html, () => <DateFieldFixture />);
    expect(container.querySelectorAll('[role="spinbutton"]').length).toBeGreaterThan(0);
    expect(container.querySelector('[data-testid="hidden-dateinput-container"]')).not.toBeNull();
  });
});
