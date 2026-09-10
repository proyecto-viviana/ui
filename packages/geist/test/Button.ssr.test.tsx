/**
 * SSR markup for the experimental Geist Button.
 *
 * Runs under vitest.ssr.config.ts so renderToString emits hydratable server
 * HTML. The companion Button.hydrate.test.tsx hydrates over this output.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Button } from "../src/components/button";

describe("Geist Button SSR", () => {
  it("renders hydratable markup with the safe default type", () => {
    const html = renderToString(() => (
      <div data-theme="geist">
        <Button variant="default">Upload</Button>
      </div>
    ));

    expect(html).toContain("Upload");
    expect(html).toContain('data-geist-component="Button"');
    expect(html).toMatch(/type="button"/);
    expect(html).toContain("pv-geist-Button--variant-default");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "geist-button-ssr.html"), html, "utf8");
  });
});
