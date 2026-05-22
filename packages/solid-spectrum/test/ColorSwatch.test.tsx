/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import packageJson from "../package.json";
import * as colorSwatchSubpath from "../src/ColorSwatch";

describe("ColorSwatch public subpath", () => {
  it("mirrors public S2 ColorSwatch exports", () => {
    expect(colorSwatchSubpath.ColorSwatch).toBeTypeOf("function");
    expect(colorSwatchSubpath.ColorSwatchContext).toBeDefined();
    expect(colorSwatchSubpath.parseColor).toBeTypeOf("function");
    expect(colorSwatchSubpath.getColorChannels).toBeTypeOf("function");
  });

  it("declares package exports", () => {
    expect(packageJson.exports["./ColorSwatch"]).toMatchObject({
      types: "./dist/ColorSwatch.d.ts",
      solid: "./src/ColorSwatch.ts",
      import: "./dist/ColorSwatch.js",
      default: "./dist/ColorSwatch.js",
    });
  });
});
