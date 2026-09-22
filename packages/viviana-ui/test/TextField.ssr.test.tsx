/**
 * SSR half of the TextField adornment hydration twin (#545 class 2).
 *
 * The server never applies element refs, so this half passes both before and
 * after the fix — it exists to write the markup TextField.hydrate.test.tsx
 * adopts, which is where the defect lands. Run this first.
 */
import { renderToString, isServer } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { TextFieldAdornmentsFixture } from "./fixtures/textfield-adornments";

describe("viviana-ui TextField adornments SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders both adornments once into hydratable markup", () => {
    const html = renderToString(() => <TextFieldAdornmentsFixture />);

    expect(html).toContain("Ask the tutor");
    expect(html.match(/⌘/g) ?? []).toHaveLength(1);
    expect(html.match(/↵/g) ?? []).toHaveLength(1);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "viviana-ui-textfield-adornments-ssr.html"), html, "utf8");
  });
});
