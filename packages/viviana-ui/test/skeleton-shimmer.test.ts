import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { loadingStyle } from "../src/skeleton";

const sheetPath = ["packages/viviana-ui/dist/styles.css", "dist/styles.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
if (!sheetPath) throw new Error("build viviana-ui before running this test");
const sheet = readFileSync(sheetPath, "utf8");
const tokensPath = ["packages/viviana-ui/src/viviana-tokens.css", "src/viviana-tokens.css"]
  .map((candidate) => resolve(process.cwd(), candidate))
  .find((candidate) => existsSync(candidate));
const tokens = readFileSync(tokensPath!, "utf8");

/* loadingStyle is a css() escape hatch: it is one string, it typechecks either way,
 * and the class name is a hash of it, so the emitted rule is the only place the
 * shimmer can be read back. */
const rule =
  new RegExp(`\\.${loadingStyle}\\{([\\s\\S]*?)\\}\\s*(?:\\.|@|$)`).exec(sheet)?.[1] ?? "";
const emitted = sheet.slice(
  sheet.indexOf(`.${loadingStyle}{`),
  sheet.indexOf(`.${loadingStyle}{`) + 3000,
);

describe("skeleton shimmer", () => {
  it("sweeps through a dither mask rather than as a smooth gradient", () => {
    /* A bare gradient sweep is the v1 skeleton and reads as glass, not pixels. */
    expect(emitted).toContain("mask-size:8px 8px");
    expect(emitted).toMatch(/mask-image:url\("data:image\/svg\+xml/);
    expect(emitted).toMatch(/animation:[^;]*1\.5s linear infinite/);
  });

  it("hides the content it stands in for", () => {
    expect(rule + emitted).toContain("visibility:hidden");
  });

  it("holds still under reduced motion", () => {
    /* The gate is a media condition, not a runtime check: Solid hydration trusts the
     * server DOM, so a matchMedia branch would mismatch. */
    const guard = /prefers-reduced-motion:reduce\)\{[^@]*?animation:none/.exec(emitted);
    expect(guard).not.toBeNull();
  });

  it("carries a sheen colour in both schemes", () => {
    /* One sheen for both grounds is either invisible on light or blinding on dark. */
    const values = [...tokens.matchAll(/--sk-sheen:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(values).toHaveLength(2);
    expect(values[0]).not.toBe(values[1]);
  });
});
