/**
 * Hydration half of the TimeField SSR regression (#189).
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Time } from "@internationalized/date";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
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

describe("TimeField hydration over SSR markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates segments without a mismatch", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../../../output/timefield-ssr.html"), "utf8");
    const container = hydrateOverSsr(html, () => <TimeFieldFixture />);
    expect(container.querySelectorAll('[role="spinbutton"]').length).toBeGreaterThan(0);
  });
});
