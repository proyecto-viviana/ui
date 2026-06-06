/**
 * SSR half of the Picker hydration regression (#54).
 *
 * Runs under vitest.ssr.config.ts (`solid({ ssr: true })`, node env) so
 * `renderToString` produces hydratable server markup and `isServer === true`
 * — the real workerd SSR path. The emitted HTML is written to
 * `output/picker-ssr.html`; the companion Picker.hydrate.test.tsx hydrates a
 * DOM-compiled Picker over it and asserts there is no mismatch. Run this test
 * first (the hydrate suite reads the file it writes).
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { Picker } from "../src/picker";

interface SectionItem {
  href: string;
  label: string;
}

const sections: SectionItem[] = [
  { href: "#page-title", label: "Accordion" },
  { href: "#api", label: "API" },
];

describe("Picker SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders hydratable server markup and writes it for the hydrate suite", () => {
    const html = renderToString(() => (
      <Picker<SectionItem>
        aria-label="Table of contents"
        items={sections}
        getKey={(item) => item.href}
        getTextValue={(item) => item.label}
        selectedKey="#page-title"
      />
    ));

    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "picker-ssr.html"), html, "utf8");
  });
});
