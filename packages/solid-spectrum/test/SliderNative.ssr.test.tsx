import { isServer, renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SliderNativeFixture } from "./fixtures/slider-native";

describe("Slider native SSR (solid-spectrum)", () => {
  it("writes hydratable scalar and two-thumb RangeSlider markup with native form owners", () => {
    expect(isServer).toBe(true);
    const html = renderToString(() => <SliderNativeFixture />);
    const inputs = html.match(/<input\b[^>]*>/g) ?? [];
    expect(inputs).toHaveLength(3);
    const expected = [
      ["scalar-proof-input-0", "volume", "40", "scalar-help"],
      ["range-proof-input-0", "minimum", "20", "range-help"],
      ["range-proof-input-1", "maximum", "80", "range-help"],
    ];
    inputs.forEach((input, index) => {
      const [id, name, value, description] = expected[index];
      expect(input).toContain('type="range"');
      expect(input).toContain(`id="${id}"`);
      expect(input).toContain(`name="${name}"`);
      expect(input).toContain(`value="${value}"`);
      expect(input).toContain('form="slider-proof-form"');
      expect(input).toContain(`aria-describedby="${description}"`);
      expect(input).toContain('aria-orientation="horizontal"');
      expect(input).not.toContain('aria-hidden="true"');
      expect(input).not.toContain('tabindex="-1"');
    });
    expect(html).not.toMatch(/<div\b[^>]*role="slider"/);
    expect(html).toContain("_hk=");
    expect(html).toContain("Volume");
    expect(html).toContain("Price");
    const directory = resolve(import.meta.dirname, "../../../output");
    mkdirSync(directory, { recursive: true });
    writeFileSync(resolve(directory, "s2-slider-native-ssr.html"), html, "utf8");
  });
});
