/**
 * SSR half of the ComboBox hydration twin (#545 class 3).
 *
 * Runs under vitest.ssr.config.ts (node env, `isServer === true`) so the markup
 * carries the hydration keys the server allocated. The companion
 * ComboBox.hydrate.test.tsx adopts it; run this first.
 */
import { renderToString, isServer } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { ComboBoxHelpTextFixture } from "./fixtures/combobox";

describe("ComboBox SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders hydratable server markup and writes it for the hydrate suite", () => {
    const html = renderToString(() => <ComboBoxHelpTextFixture />);

    expect(html).toContain("Favorite food");
    expect(html).toContain("Please select a valid food item");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "combobox-ssr.html"), html, "utf8");
  });
});
