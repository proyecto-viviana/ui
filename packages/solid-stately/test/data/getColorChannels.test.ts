import { describe, it, expect } from "vite-plus/test";
import { getColorChannels } from "../../src/color/getColorChannels";

describe("getColorChannels", () => {
  it("returns RGB channels", () => {
    expect(getColorChannels("rgb")).toEqual(["red", "green", "blue"]);
  });

  it("returns HSL channels", () => {
    expect(getColorChannels("hsl")).toEqual(["hue", "saturation", "lightness"]);
  });

  it("returns HSB channels", () => {
    expect(getColorChannels("hsb")).toEqual(["hue", "saturation", "brightness"]);
  });

  it("throws for unknown color space", () => {
    expect(() => getColorChannels("xyz" as any)).toThrow("Unknown color space: xyz");
  });

  it("is exported from solid-stately index", async () => {
    const mod = await import("../../src/index");
    expect(typeof mod.getColorChannels).toBe("function");
  });
});
