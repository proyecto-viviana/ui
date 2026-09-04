/**
 * SSR half of the viviana-ui Form+TextField hydration twin.
 *
 * Writes hydratable markup for the `isRequired + description` profile shape
 * so Form.hydrate.test.tsx can adopt it. See solid-spectrum Form.ssr.test.tsx.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vite-plus/test";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { FormTextFieldFixture } from "./fixtures/form";

const outDir = resolve(import.meta.dirname, "../../../output");

function write(name: string, html: string) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, name), html, "utf8");
}

describe("viviana-ui Form SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders Form+TextField hydratable markup", () => {
    const html = renderToString(() => <FormTextFieldFixture />);
    expect(html).toContain("Nombre");
    expect(html).toContain("Username");
    expect(html).toContain("Guardar");
    write("viviana-ui-form-textfield-ssr.html", html);
  });
});
