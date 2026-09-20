/**
 * Color state tests
 *
 * Tests for color manipulation and state management including:
 * - Color parsing and conversion
 * - ColorSlider state
 * - ColorArea state
 * - ColorWheel state
 * - ColorField state
 */

import { describe, it, expect } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import type { Color } from "../src/color";
import {
  parseColor,
  normalizeColor,
  normalizeHue,
  createRGBColor,
  createHSLColor,
  createHSBColor,
  createColorSliderState,
  createColorAreaState,
  createColorWheelState,
  createColorFieldState,
} from "../src/color";

describe("Color", () => {
  describe("parseColor", () => {
    it("should parse hex colors", () => {
      flush();
      const color = parseColor("#ff0000");
      expect(color.getChannelValue("red")).toBe(255);
      flush();
      expect(color.getChannelValue("green")).toBe(0);
      flush();
      expect(color.getChannelValue("blue")).toBe(0);
    });

    it("should parse short hex colors", () => {
      flush();
      const color = parseColor("#f00");
      expect(color.getChannelValue("red")).toBe(255);
      flush();
      expect(color.getChannelValue("green")).toBe(0);
      flush();
      expect(color.getChannelValue("blue")).toBe(0);
    });

    it("should parse hex colors with alpha", () => {
      flush();
      const color = parseColor("#ff000080");
      expect(color.getChannelValue("red")).toBe(255);
      flush();
      expect(color.getChannelValue("alpha")).toBeCloseTo(0.5, 1);
    });

    it("should parse rgb() colors", () => {
      flush();
      const color = parseColor("rgb(128, 64, 32)");
      expect(color.getChannelValue("red")).toBe(128);
      flush();
      expect(color.getChannelValue("green")).toBe(64);
      flush();
      expect(color.getChannelValue("blue")).toBe(32);
    });

    it("should parse rgba() colors", () => {
      flush();
      const color = parseColor("rgba(255, 128, 0, 0.5)");
      expect(color.getChannelValue("red")).toBe(255);
      flush();
      expect(color.getChannelValue("green")).toBe(128);
      flush();
      expect(color.getChannelValue("blue")).toBe(0);
      flush();
      expect(color.getChannelValue("alpha")).toBe(0.5);
    });

    it("should parse hsl() colors", () => {
      flush();
      const color = parseColor("hsl(120, 100%, 50%)");
      expect(color.getChannelValue("hue")).toBe(120);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("lightness")).toBe(50);
    });

    it("should parse hsb() colors", () => {
      flush();
      const color = parseColor("hsb(240, 100%, 100%)");
      expect(color.getChannelValue("hue")).toBe(240);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("brightness")).toBe(100);
    });

    it("should parse hsl() colors with hue 360", () => {
      flush();
      const color = parseColor("hsl(360, 100%, 50%)");
      expect(color.getChannelValue("hue")).toBe(360);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("lightness")).toBe(50);
      flush();
      expect(color.toString("hsl")).toBe("hsl(360, 100%, 50%)");
    });

    it("should parse hsb() colors with hue 360", () => {
      flush();
      const color = parseColor("hsb(360, 100%, 100%)");
      expect(color.getChannelValue("hue")).toBe(360);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("brightness")).toBe(100);
      flush();
      expect(color.toString("hsb")).toBe("hsb(360, 100%, 100%)");
    });

    it("should throw for invalid color strings", () => {
      flush();
      expect(() => parseColor("invalid")).toThrow();
      flush();
      expect(() => parseColor("")).toThrow();
      flush();
      expect(() => parseColor("#zzzzzz")).toThrow();
    });
  });

  describe("normalizeHue", () => {
    it("should normalize hue angles into [0, 360) while preserving 360", () => {
      flush();
      expect(normalizeHue(0)).toBe(0);
      flush();
      expect(normalizeHue(360)).toBe(360);
      flush();
      expect(normalizeHue(720)).toBe(0);
      flush();
      expect(normalizeHue(-10)).toBe(350);
      flush();
      expect(normalizeHue(370)).toBe(10);
      flush();
      expect(normalizeHue(180.5)).toBe(180.5);
    });
  });

  describe("normalizeColor", () => {
    it("should return Color objects as-is", () => {
      const color = parseColor("#ff0000");
      flush();
      expect(normalizeColor(color)).toBe(color);
    });

    it("should parse string colors", () => {
      flush();
      const color = normalizeColor("#00ff00");
      expect(color.getChannelValue("green")).toBe(255);
    });
  });

  describe("createRGBColor", () => {
    it("should create RGB color", () => {
      flush();
      const color = createRGBColor(100, 150, 200);
      expect(color.getChannelValue("red")).toBe(100);
      flush();
      expect(color.getChannelValue("green")).toBe(150);
      flush();
      expect(color.getChannelValue("blue")).toBe(200);
      flush();
      expect(color.getChannelValue("alpha")).toBe(1);
    });

    it("should create RGB color with alpha", () => {
      flush();
      const color = createRGBColor(100, 150, 200, 0.5);
      expect(color.getChannelValue("alpha")).toBe(0.5);
    });
  });

  describe("createHSLColor", () => {
    it("should create HSL color", () => {
      flush();
      const color = createHSLColor(180, 50, 75);
      expect(color.getChannelValue("hue")).toBe(180);
      flush();
      expect(color.getChannelValue("saturation")).toBe(50);
      flush();
      expect(color.getChannelValue("lightness")).toBe(75);
    });
  });

  describe("createHSBColor", () => {
    it("should create HSB color", () => {
      flush();
      const color = createHSBColor(270, 80, 90);
      expect(color.getChannelValue("hue")).toBe(270);
      flush();
      expect(color.getChannelValue("saturation")).toBe(80);
      flush();
      expect(color.getChannelValue("brightness")).toBe(90);
    });
  });

  describe("Color methods", () => {
    it("should convert formats", () => {
      const rgb = parseColor("#ff0000");
      flush();
      const hsl = rgb.toFormat("hsl");
      expect(hsl.getChannelValue("hue")).toBe(0);
      flush();
      expect(hsl.getChannelValue("saturation")).toBe(100);
      flush();
      expect(hsl.getChannelValue("lightness")).toBe(50);
    });

    it("should preserve hue 360 across HSL and HSB format conversions", () => {
      const hsl = parseColor("hsl(360, 100%, 50%)");
      flush();
      const hsb = hsl.toFormat("hsb");
      expect(hsb.getChannelValue("hue")).toBe(360);
      flush();
      expect(hsb.getChannelValue("saturation")).toBe(100);
      flush();
      expect(hsb.getChannelValue("brightness")).toBe(100);

      flush();
      const roundtripHsl = hsb.toFormat("hsl");
      expect(roundtripHsl.getChannelValue("hue")).toBe(360);
      flush();
      expect(roundtripHsl.getChannelValue("saturation")).toBe(100);
      flush();
      expect(roundtripHsl.getChannelValue("lightness")).toBe(50);
    });

    it("should retain hue 360 with withChannelValue", () => {
      const hsl = parseColor("hsl(50, 100%, 50%)");
      flush();
      const at360 = hsl.withChannelValue("hue", 360);
      expect(at360.getChannelValue("hue")).toBe(360);
      flush();
      expect(at360.toString("hsl")).toBe("hsl(360, 100%, 50%)");

      const hsb = parseColor("hsb(50, 100%, 100%)");
      flush();
      const hsbAt360 = hsb.withChannelValue("hue", 360);
      expect(hsbAt360.getChannelValue("hue")).toBe(360);
      flush();
      expect(hsbAt360.toString("hsb")).toBe("hsb(360, 100%, 100%)");
    });

    it("should output string formats", () => {
      flush();
      const color = createRGBColor(255, 0, 0);
      expect(color.toString("hex")).toBe("#ff0000");
      flush();
      expect(color.toString("rgb")).toBe("rgb(255, 0, 0)");
    });

    it("should update channel value", () => {
      const color = parseColor("#ff0000");
      flush();
      const updated = color.withChannelValue("green", 128);
      expect(updated.getChannelValue("green")).toBe(128);
      flush();
      expect(color.getChannelValue("green")).toBe(0); // Original unchanged
    });

    it("should get channel range", () => {
      const color = parseColor("#ff0000");
      flush();
      const redRange = color.getChannelRange("red");
      expect(redRange.minValue).toBe(0);
      flush();
      expect(redRange.maxValue).toBe(255);
      flush();
      expect(redRange.step).toBe(1);
    });

    it("should support cross-color-space channels for RGB", () => {
      const color = parseColor("#ff0000");
      // RGB color should support HSB channels
      flush();
      expect(color.getChannelValue("hue")).toBe(0);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("brightness")).toBe(100);
    });

    it("should support cross-color-space channel updates for RGB", () => {
      const color = parseColor("#ff0000");
      const updated = color.withChannelValue("hue", 120);
      // Should now be greenish
      flush();
      expect(updated.getChannelValue("hue")).toBe(120);
    });

    it("should get color name", () => {
      flush();
      const red = parseColor("#ff0000");
      expect(red.getColorName("en-US")).toBeTruthy();
    });

    it("should match React Stately OKLCH color names", () => {
      flush();
      const purple = parseColor("#9B80FF");
      expect(purple.getColorName("en-US")).toBe("vibrant purple");
      flush();
      expect(purple.getHueName("en-US")).toBe("purple");
    });

    it("should get color space", () => {
      flush();
      const rgb = parseColor("#ff0000");
      expect(rgb.getColorSpace()).toBe("rgb");

      flush();
      const hsl = parseColor("hsl(0, 100%, 50%)");
      expect(hsl.getColorSpace()).toBe("hsl");
    });

    it("should get color space axes", () => {
      const color = parseColor("hsb(0, 100%, 100%)");
      flush();
      const axes = color.getColorSpaceAxes({});
      expect(axes.xChannel).toBeTruthy();
      flush();
      expect(axes.yChannel).toBeTruthy();
      flush();
      expect(axes.zChannel).toBeTruthy();
    });
  });
});

describe("createColorSliderState", () => {
  it("should initialize with default value", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsb(180, 100%, 100%)",
      }));

      flush();
      expect(state.value).toBeTruthy();
      flush();
      expect(state.channel).toBe("hue");
      flush();
      expect(state.isDragging).toBe(false);
      dispose();
    });
  });

  it("should get thumb value", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(128, 64, 32)",
      }));

      flush();
      expect(state.getThumbValue()).toBe(128);
      dispose();
    });
  });

  it("should get thumb percent", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(128, 0, 0)",
      }));

      flush();
      const percent = state.getThumbPercent();
      expect(percent).toBeCloseTo(128 / 255, 2);
      dispose();
    });
  });

  it("should call onChange when setting thumb value", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(100, 0, 0)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setThumbValue(150);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(150);
      dispose();
    });
  });

  it("should call onChange when incrementing", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(100, 0, 0)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.incrementThumb();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(101);
      dispose();
    });
  });

  it("should call onChange when decrementing", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(100, 0, 0)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.decrementThumb();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(99);
      dispose();
    });
  });

  it("should clamp values in onChange", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(250, 0, 0)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setThumbValue(300);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(255);
      dispose();
    });
  });

  it("should keep hue at 360 and thumb percent at 1 when set to maxValue", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(50, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setThumbValue(state.maxValue);
      flush();
      expect(state.getThumbValue()).toBe(360);
      flush();
      expect(state.getThumbPercent()).toBe(1);
      flush();
      expect(state.getThumbValueLabel()).toBe("360°");
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(360);
      flush();
      expect(changedColor!.toString("hsl")).toBe("hsl(360, 100%, 50%)");
      dispose();
    });
  });

  it("should call onChangeEnd when dragging ends", () => {
    createRoot((dispose) => {
      let endedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(100, 0, 0)",
        onChangeEnd: (color) => {
          endedColor = color;
        },
      }));

      state.setDragging(true);
      state.setDragging(false);
      flush();
      expect(endedColor).toBeTruthy();
      dispose();
    });
  });

  it("should get step and page size", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "red",
        defaultValue: "rgb(100, 0, 0)",
      }));

      flush();
      expect(state.step).toBe(1);
      flush();
      expect(state.pageSize).toBe(17);
      dispose();
    });
  });

  it("should default to horizontal orientation and expose vertical orientation", () => {
    createRoot((dispose) => {
      const horizontal = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(180, 100%, 50%)",
      }));
      const vertical = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(0, 100%, 50%)",
        orientation: "vertical",
      }));

      flush();
      expect(horizontal.orientation).toBe("horizontal");
      flush();
      expect(vertical.orientation).toBe("vertical");
      dispose();
    });
  });

  it("should format hue labels with degree units", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(50, 100%, 50%)",
      }));

      flush();
      expect(state.getThumbValueLabel()).toBe("50°");
      dispose();
    });
  });

  it("should normalize values and changes into the requested color space", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorSliderState(() => ({
        channel: "brightness",
        colorSpace: "hsb",
        defaultValue: "#336699",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      flush();
      expect(state.value.getColorSpace()).toBe("hsb");
      state.setThumbValue(80);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getColorSpace()).toBe("hsb");
      flush();
      expect(changedColor!.getChannelValue("brightness")).toBe(80);
      dispose();
    });
  });

  it("should use full saturation and lightness for hue display color", () => {
    createRoot((dispose) => {
      const state = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(90, 20%, 20%)",
      }));

      flush();
      const displayColor = state.getDisplayColor();
      expect(displayColor.getChannelValue("hue")).toBe(90);
      flush();
      expect(displayColor.getChannelValue("saturation")).toBe(100);
      flush();
      expect(displayColor.getChannelValue("lightness")).toBe(50);
      dispose();
    });
  });
});

describe("createColorAreaState", () => {
  it("should initialize with default value", () => {
    createRoot((dispose) => {
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 100%, 100%)",
      }));

      flush();
      expect(state.value).toBeTruthy();
      flush();
      expect(state.xChannel).toBeTruthy();
      flush();
      expect(state.yChannel).toBeTruthy();
      flush();
      expect(state.zChannel).toBeTruthy();
      dispose();
    });
  });

  it("should get X and Y values", () => {
    createRoot((dispose) => {
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 75%)",
        xChannel: "saturation",
        yChannel: "brightness",
      }));

      flush();
      expect(state.getXValue()).toBe(50);
      flush();
      expect(state.getYValue()).toBe(75);
      dispose();
    });
  });

  it("should get thumb position", () => {
    createRoot((dispose) => {
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 100%)",
        xChannel: "saturation",
        yChannel: "brightness",
      }));

      flush();
      const pos = state.getThumbPosition();
      expect(pos.x).toBeCloseTo(0.5, 2);
      flush();
      expect(pos.y).toBeCloseTo(0, 2); // 100% brightness = y=0 (top)
      dispose();
    });
  });

  it("should call onChange when setting X value", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 75%)",
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setXValue(80);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("saturation")).toBe(80);
      dispose();
    });
  });

  it("should call onChange when setting Y value", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 75%)",
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setYValue(90);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("brightness")).toBe(90);
      dispose();
    });
  });

  it("should call onChange when setting color from point", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 0%, 0%)",
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      // x=0.5 means 50% saturation, y=0.25 means 75% brightness (y is inverted)
      state.setColorFromPoint(0.5, 0.25);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("saturation")).toBeCloseTo(50, 0);
      flush();
      expect(changedColor!.getChannelValue("brightness")).toBeCloseTo(75, 0);
      dispose();
    });
  });

  it("should call onChange when incrementing X", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 50%)",
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.incrementX();
      flush();
      expect(changedColor!.getChannelValue("saturation")).toBe(51);
      dispose();
    });
  });

  it("should call onChange when incrementing Y", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 50%)",
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.incrementY();
      flush();
      expect(changedColor!.getChannelValue("brightness")).toBe(51);
      dispose();
    });
  });

  it("should get channel step values", () => {
    createRoot((dispose) => {
      const state = createColorAreaState(() => ({
        defaultValue: "hsb(0, 50%, 50%)",
        xChannel: "saturation",
        yChannel: "brightness",
      }));

      flush();
      expect(state.xChannelStep).toBe(1);
      flush();
      expect(state.yChannelStep).toBe(1);
      flush();
      expect(state.xChannelPageStep).toBe(10);
      flush();
      expect(state.yChannelPageStep).toBe(10);
      dispose();
    });
  });

  it("should normalize values and change payloads to the requested color space", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const [colorSpace, setColorSpace] = createSignal<"rgb" | "hsl" | "hsb">("hsb");
      const state = createColorAreaState(() => ({
        defaultValue: "#9B80FF",
        colorSpace: colorSpace(),
        xChannel: "saturation",
        yChannel: "brightness",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      flush();
      expect(state.value.getColorSpace()).toBe("hsb");
      state.setXValue(50);
      flush();
      expect(changedColor?.getColorSpace()).toBe("hsb");

      setColorSpace("rgb");
      flush();
      expect(state.value.getColorSpace()).toBe("rgb");
      dispose();
    });
  });
});

describe("createColorWheelState", () => {
  it("should initialize with default value", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsb(180, 100%, 100%)",
      }));

      flush();
      expect(state.value).toBeTruthy();
      flush();
      expect(state.value.getColorSpace()).toBe("hsb");
      flush();
      expect(state.isDragging).toBe(false);
      dispose();
    });
  });

  it("should initialize to the React Stately default color", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({}));

      flush();
      expect(state.defaultValue.getColorSpace()).toBe("hsl");
      flush();
      expect(state.getHue()).toBe(0);
      flush();
      expect(state.value.getChannelValue("saturation")).toBe(100);
      flush();
      expect(state.value.getChannelValue("lightness")).toBe(50);
      dispose();
    });
  });

  it("should get hue value", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(180, 100%, 50%)",
      }));

      flush();
      expect(state.getHue()).toBe(180);
      dispose();
    });
  });

  it("should get thumb angle", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
      }));

      // Hue 0 = angle 2*PI (or 0)
      flush();
      const angle = state.getThumbAngle();
      expect(angle).toBeCloseTo(2 * Math.PI, 1);
      dispose();
    });
  });

  it("should call onChange when setting hue", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(180, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setHue(90);
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(90);
      dispose();
    });
  });

  it("should normalize hue overflow to the minimum value in onChange", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(180, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setHue(370);
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(0);
      dispose();
    });
  });

  it("should call onChange when setting hue from angle", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      // Angle PI = hue 180
      state.setHueFromAngle(Math.PI);
      flush();
      expect(changedColor!.getChannelValue("hue")).toBeCloseTo(180, 0);
      dispose();
    });
  });

  it("should set hue from a point relative to the center", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setHueFromPoint(0, 100, 100);
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(90);
      dispose();
    });
  });

  it("should get thumb position from hue and radius", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(90, 100%, 50%)",
      }));

      flush();
      const position = state.getThumbPosition(50);
      expect(position.x).toBeCloseTo(0, 1);
      flush();
      expect(position.y).toBeCloseTo(50, 1);
      dispose();
    });
  });

  it("should call onChange when incrementing hue", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(100, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.increment();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(101);
      dispose();
    });
  });

  it("should wrap increment and decrement at the hue bounds", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(359, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.increment();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(0);

      state.setHue(0);
      state.decrement();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(359);
      dispose();
    });
  });

  it("should call onChangeEnd with the latest dragged color", () => {
    createRoot((dispose) => {
      let endedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
        onChangeEnd: (color) => {
          endedColor = color;
        },
      }));

      state.setDragging(true);
      state.setHue(180);
      state.setDragging(false);
      flush();
      expect(endedColor!.getChannelValue("hue")).toBe(180);
      dispose();
    });
  });

  it("should expose a full-saturation HSL display color", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsb(240, 40%, 30%)",
      }));

      flush();
      const color = state.getDisplayColor();
      expect(color.getColorSpace()).toBe("hsl");
      flush();
      expect(color.getChannelValue("hue")).toBe(240);
      flush();
      expect(color.getChannelValue("saturation")).toBe(100);
      flush();
      expect(color.getChannelValue("lightness")).toBe(50);
      dispose();
    });
  });

  it("should call onChange when decrementing hue", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(100, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.decrement();
      flush();
      expect(changedColor!.getChannelValue("hue")).toBe(99);
      dispose();
    });
  });

  it("should get step and page step", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
      }));

      flush();
      expect(state.step).toBe(1);
      flush();
      expect(state.pageStep).toBe(15);
      dispose();
    });
  });
});

describe("createColorFieldState", () => {
  it("should initialize with default value", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
      }));

      flush();
      expect(state.value).toBeTruthy();
      flush();
      expect(state.inputValue).toBe("#FF0000");
      flush();
      expect(state.isInvalid).toBe(false);
      dispose();
    });
  });

  it("should work in single channel mode", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "rgb(128, 64, 32)",
        channel: "red",
      }));

      flush();
      expect(state.inputValue).toBe("128");
      flush();
      expect(state.channel).toBe("red");
      dispose();
    });
  });

  it("should call onChange when committing valid color", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setInputValue("#00ff00");
      state.commit();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("green")).toBe(255);
      dispose();
    });
  });

  it("should reset bad committed hex input to the current value", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
      }));

      state.setInputValue("invalid");
      state.commit();
      flush();
      expect(state.isInvalid).toBe(false);
      flush();
      expect(state.inputValue).toBe("#FF0000");
      dispose();
    });
  });

  it("should accept hex input without a leading hash", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setInputValue("00ff00");
      state.commit();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.toString("hex")).toBe("#00ff00");
      flush();
      expect(state.inputValue).toBe("#00FF00");
      dispose();
    });
  });

  it("should call onChange when incrementing in single channel mode", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "rgb(128, 64, 32)",
        channel: "red",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.increment();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(129);
      dispose();
    });
  });

  it("should call onChange when decrementing in single channel mode", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "rgb(128, 64, 32)",
        channel: "red",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.decrement();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(127);
      dispose();
    });
  });

  it("should call onChange when incrementing to max", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "rgb(200, 64, 32)",
        channel: "red",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.incrementToMax();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(255);
      dispose();
    });
  });

  it("should call onChange when decrementing to min", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorFieldState(() => ({
        defaultValue: "rgb(50, 64, 32)",
        channel: "red",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.decrementToMin();
      flush();
      expect(changedColor).toBeTruthy();
      flush();
      expect(changedColor!.getChannelValue("red")).toBe(0);
      dispose();
    });
  });

  it("should validate input", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
      }));

      state.setInputValue("#00ff00");
      flush();
      expect(state.validate()).toBe(true);
      flush();
      expect(state.validate("#0a")).toBe(true);
      flush();
      expect(state.validate("0a")).toBe(true);

      state.setInputValue("invalid");
      flush();
      expect(state.validate()).toBe(false);
      flush();
      expect(state.validate("#zzzzzz")).toBe(false);
      dispose();
    });
  });

  it("should increment and clamp hex values", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "#000000",
      }));

      state.increment();
      flush();
      expect(state.inputValue).toBe("#000001");

      state.incrementToMax();
      flush();
      expect(state.inputValue).toBe("#FFFFFF");

      state.decrement();
      flush();
      expect(state.inputValue).toBe("#FFFFFE");

      state.decrementToMin();
      flush();
      expect(state.inputValue).toBe("#000000");
      dispose();
    });
  });

  it("should normalize percentage channel state like React Stately", () => {
    createRoot((dispose) => {
      const state = createColorFieldState(() => ({
        defaultValue: "hsb(0, 50%, 100%)",
        channel: "saturation",
        colorSpace: "hsb",
      }));

      flush();
      expect(state.inputValue).toBe("50%");
      flush();
      expect(state.numberValue).toBe(0.5);
      flush();
      expect(state.minValue).toBe(0);
      flush();
      expect(state.maxValue).toBe(1);

      state.setInputValue("25%");
      state.commit();
      flush();
      expect(state.value!.getChannelValue("saturation")).toBe(25);
      flush();
      expect(state.inputValue).toBe("25%");
      dispose();
    });
  });

  it("should call onChange with null for empty input", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = parseColor("#ffffff"); // Set to non-null initially
      const state = createColorFieldState(() => ({
        defaultValue: "#ff0000",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setInputValue("");
      state.commit();
      flush();
      expect(changedColor).toBeNull();
      flush();
      expect(state.isInvalid).toBe(false);
      dispose();
    });
  });

  describe("formatChannelValue", () => {
    it("preserves fraction digits for HSL and HSB hue matching upstream", () => {
      const color = parseColor("#9B80FF");
      const hsl = color.toFormat("hsl");
      const hsb = color.toFormat("hsb");

      flush();
      expect(hsl.formatChannelValue("hue", "en-US")).toBe("252.76°");
      flush();
      expect(hsb.formatChannelValue("hue", "en-US")).toBe("252.76°");
    });

    it("formats integer hues without fractional digits", () => {
      const hsl = parseColor("hsl(210, 50%, 50%)");
      const hsb = parseColor("hsb(210, 50%, 50%)");

      flush();
      expect(hsl.formatChannelValue("hue", "en-US")).toBe("210°");
      flush();
      expect(hsb.formatChannelValue("hue", "en-US")).toBe("210°");
    });
  });
});
