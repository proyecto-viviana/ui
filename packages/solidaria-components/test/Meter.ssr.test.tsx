/**
 * Server-render half of the Meter hydration regression.
 *
 * The companion Meter.hydrate.test.tsx hydrates over this output and checks
 * that the shared Label relationship stays stable.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
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

describe("Meter SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders a labelled meter and writes hydratable markup", () => {
    const html = renderToString(() => <MeterFixture />);
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];

    expect(labelledBy).toBeTruthy();
    expect(html).toContain('role="meter"');
    expect(html).toContain(`id="${labelledBy}"`);
    expect(html).toContain("Storage space");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "meter-ssr.html"), html, "utf8");
  });
});
