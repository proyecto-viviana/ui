/**
 * Hydration half of the Meter server-render regression.
 *
 * This test hydrates the shared Label relationship and checks that the meter
 * and label keep the same ID reference.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { Label } from "../src/Label";
import { Meter } from "../src/Meter";

function MeterFixture() {
  return (
    <Meter value={25}>
      {() => (
        <>
          <Label>Storage space</Label>
          <span>25%</span>
        </>
      )}
    </Meter>
  );
}

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/meter-ssr.html"),
  "utf8",
);

describe("Meter hydration over server markup", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates without a mismatch and keeps the label relationship", () => {
    const container = hydrateOverSsr(ssrHtml, () => <MeterFixture />);
    const meter = container.querySelector<HTMLElement>('[role="meter"]');
    const label = container.querySelector<HTMLElement>("span[id]");
    expect(meter).not.toBeNull();
    expect(label).not.toBeNull();
    expect(meter?.getAttribute("aria-labelledby")).toBe(label?.id);
  });
});
