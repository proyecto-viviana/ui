/**
 * SSR half of the TimeField hydration regression (#189).
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { Time } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { TimeField } from "../src/TimeField";
import { DateInput, DateSegment } from "../src/DateField";

function TimeFieldFixture() {
  return (
    <I18nProvider locale="en-US">
      <TimeField aria-label="Event time" value={new Time(14, 30)}>
        <DateInput>{(segment) => <DateSegment segment={segment} />}</DateInput>
      </TimeField>
    </I18nProvider>
  );
}

describe("TimeField SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders segments instead of an aria-hidden placeholder", () => {
    const html = renderToString(() => <TimeFieldFixture />);

    expect(html).not.toContain("solidaria-TimeField--placeholder");
    expect(html).toContain('role="spinbutton"');

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "timefield-ssr.html"), html, "utf8");
  });
});
