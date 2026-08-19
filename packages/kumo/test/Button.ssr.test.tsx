/**
 * SSR markup for the experimental Kumo Button.
 *
 * Runs under vitest.ssr.config.ts so renderToString emits hydratable server
 * HTML. The companion Button.hydrate.test.tsx hydrates over this output.
 */
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Button } from "../src/components/button";

describe("Kumo Button SSR", () => {
  it("renders hydratable markup with the safe default type", () => {
    const html = renderToString(() => (
      <div data-theme="kumo">
        <Button variant="primary">Save</Button>
      </div>
    ));

    expect(html).toContain("Save");
    expect(html).toContain('data-kumo-component="Button"');
    expect(html).toMatch(/type="button"/);
    expect(html).toContain("pv-kumo-Button--variant-primary");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "kumo-button-ssr.html"), html, "utf8");
  });
});
