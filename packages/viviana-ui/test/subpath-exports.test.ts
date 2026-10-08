import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const here = dirname(fileURLToPath(import.meta.url));
const spectrum = JSON.parse(
  readFileSync(join(here, "../../solid-spectrum/package.json"), "utf8"),
) as {
  exports: Record<string, { types: string; solid: string; import: string; default: string }>;
};
const ui = JSON.parse(readFileSync(join(here, "../package.json"), "utf8")) as {
  exports: Record<string, { types: string; solid: string; import: string; default: string }>;
};
const viteConfig = readFileSync(join(here, "../vite.config.ts"), "utf8");

function componentSubpaths(exportsMap: Record<string, unknown>): string[] {
  return Object.keys(exportsMap)
    .filter((key) => /^\.\/[A-Z]/.test(key))
    .sort();
}

describe("viviana-ui subpath exports", () => {
  it("publishes every solid-spectrum component subpath", () => {
    const missing = componentSubpaths(spectrum.exports).filter((key) => !(key in ui.exports));
    expect(missing).toEqual([]);
  });

  it("points each mirrored subpath at its own dist entry", () => {
    for (const key of componentSubpaths(spectrum.exports)) {
      const name = key.slice(2);
      const sourceName = name === "Disclosure" ? "disclosure-export" : name;
      expect(ui.exports[key]).toEqual({
        types: `./dist/${sourceName}.d.ts`,
        solid: `./dist/${sourceName}.jsx`,
        import: `./dist/${sourceName}.js`,
        default: `./dist/${sourceName}.js`,
      });
      expect(viteConfig).toContain(`"src/${sourceName}.ts"`);
      const uiSource = readFileSync(join(here, `../src/${sourceName}.ts`), "utf8");
      const spectrumSource = readFileSync(
        join(here, `../../solid-spectrum/src/${sourceName}.ts`),
        "utf8",
      );
      expect(uiSource).toBe(spectrumSource);
    }
  });
});
