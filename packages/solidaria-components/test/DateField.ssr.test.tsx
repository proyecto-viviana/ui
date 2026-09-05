/**
 * SSR half of the DateField hydration regression (#189).
 *
 * The field must emit segments and HiddenDateInput on the server. An
 * aria-hidden placeholder is not RAC.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { CalendarDate } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
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

describe("DateField SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders segments and HiddenDateInput instead of an aria-hidden placeholder", () => {
    const html = renderToString(() => <DateFieldFixture />);

    expect(html).not.toContain("solidaria-DateField--placeholder");
    expect(html).toContain('role="spinbutton"');
    expect(html).toContain("hidden-dateinput-container");
    expect(html).toContain('type="date"');

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "datefield-ssr.html"), html, "utf8");
  });
});
