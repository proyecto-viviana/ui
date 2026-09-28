/**
 * Default locale stays en-US / ltr on the server even when the runtime has a
 * browser language. That is the markup Spectrum Provider writes for `lang`
 * and `dir` when no locale prop is set.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToString } from "@solidjs/web";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { DefaultLocaleProbe } from "./fixtures/defaultLocale";

const previousNavigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");

afterEach(() => {
  if (previousNavigator) Object.defineProperty(globalThis, "navigator", previousNavigator);
  else Reflect.deleteProperty(globalThis, "navigator");
});

describe("createDefaultLocale SSR", () => {
  it("writes en-US ltr while navigator.language is ar-SA", () => {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { language: "ar-SA" },
    });

    const html = renderToString(() => <DefaultLocaleProbe />);
    expect(html).toContain('lang="en-US"');
    expect(html).toContain('dir="ltr"');
    expect(html).not.toContain("ar-SA");

    const output = resolve(import.meta.dirname, "../../../output");
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, "default-locale-ssr.html"), html, "utf8");
  });
});
