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

import { describe, it, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import type { Color } from "../src/color";
import {
  parseColor,
  normalizeColor,
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
      const color = parseColor("#ff0000");
      expect(color.getChannelValue("red")).toBe(255);
      expect(color.getChannelValue("green")).toBe(0);
      expect(color.getChannelValue("blue")).toBe(0);
    });

    it("should parse short hex colors", () => {
      const color = parseColor("#f00");
      expect(color.getChannelValue("red")).toBe(255);
      expect(color.getChannelValue("green")).toBe(0);
      expect(color.getChannelValue("blue")).toBe(0);
    });

    it("should parse hex colors with alpha", () => {
      const color = parseColor("#ff000080");
      expect(color.getChannelValue("red")).toBe(255);
      expect(color.getChannelValue("alpha")).toBeCloseTo(0.5, 1);
    });

    it("should parse rgb() colors", () => {
      const color = parseColor("rgb(128, 64, 32)");
      expect(color.getChannelValue("red")).toBe(128);
      expect(color.getChannelValue("green")).toBe(64);
      expect(color.getChannelValue("blue")).toBe(32);
    });

    it("should parse rgba() colors", () => {
      const color = parseColor("rgba(255, 128, 0, 0.5)");
      expect(color.getChannelValue("red")).toBe(255);
      expect(color.getChannelValue("green")).toBe(128);
      expect(color.getChannelValue("blue")).toBe(0);
      expect(color.getChannelValue("alpha")).toBe(0.5);
    });

    it("should parse hsl() colors", () => {
      const color = parseColor("hsl(120, 100%, 50%)");
      expect(color.getChannelValue("hue")).toBe(120);
      expect(color.getChannelValue("saturation")).toBe(100);
      expect(color.getChannelValue("lightness")).toBe(50);
    });

    it("should parse hsb() colors", () => {
      const color = parseColor("hsb(240, 100%, 100%)");
      expect(color.getChannelValue("hue")).toBe(240);
      expect(color.getChannelValue("saturation")).toBe(100);
      expect(color.getChannelValue("brightness")).toBe(100);
    });

    it("should throw for invalid color strings", () => {
      expect(() => parseColor("invalid")).toThrow();
      expect(() => parseColor("")).toThrow();
      expect(() => parseColor("#zzzzzz")).toThrow();
    });
  });

  describe("normalizeColor", () => {
    it("should return Color objects as-is", () => {
      const color = parseColor("#ff0000");
      expect(normalizeColor(color)).toBe(color);
    });

    it("should parse string colors", () => {
      const color = normalizeColor("#00ff00");
      expect(color.getChannelValue("green")).toBe(255);
    });
  });

  describe("createRGBColor", () => {
    it("should create RGB color", () => {
      const color = createRGBColor(100, 150, 200);
      expect(color.getChannelValue("red")).toBe(100);
      expect(color.getChannelValue("green")).toBe(150);
      expect(color.getChannelValue("blue")).toBe(200);
      expect(color.getChannelValue("alpha")).toBe(1);
    });

    it("should create RGB color with alpha", () => {
      const color = createRGBColor(100, 150, 200, 0.5);
      expect(color.getChannelValue("alpha")).toBe(0.5);
    });
  });

  describe("createHSLColor", () => {
    it("should create HSL color", () => {
      const color = createHSLColor(180, 50, 75);
      expect(color.getChannelValue("hue")).toBe(180);
      expect(color.getChannelValue("saturation")).toBe(50);
      expect(color.getChannelValue("lightness")).toBe(75);
    });
  });

  describe("createHSBColor", () => {
    it("should create HSB color", () => {
      const color = createHSBColor(270, 80, 90);
      expect(color.getChannelValue("hue")).toBe(270);
      expect(color.getChannelValue("saturation")).toBe(80);
      expect(color.getChannelValue("brightness")).toBe(90);
    });
  });

  describe("Color methods", () => {
    it("should convert formats", () => {
      const rgb = parseColor("#ff0000");
      const hsl = rgb.toFormat("hsl");
      expect(hsl.getChannelValue("hue")).toBe(0);
      expect(hsl.getChannelValue("saturation")).toBe(100);
      expect(hsl.getChannelValue("lightness")).toBe(50);
    });

    it("should output string formats", () => {
      const color = createRGBColor(255, 0, 0);
      expect(color.toString("hex")).toBe("#ff0000");
      expect(color.toString("rgb")).toBe("rgb(255, 0, 0)");
    });

    it("should update channel value", () => {
      const color = parseColor("#ff0000");
      const updated = color.withChannelValue("green", 128);
      expect(updated.getChannelValue("green")).toBe(128);
      expect(color.getChannelValue("green")).toBe(0); // Original unchanged
    });

    it("should get channel range", () => {
      const color = parseColor("#ff0000");
      const redRange = color.getChannelRange("red");
      expect(redRange.minValue).toBe(0);
      expect(redRange.maxValue).toBe(255);
      expect(redRange.step).toBe(1);
    });

    it("should support cross-color-space channels for RGB", () => {
      const color = parseColor("#ff0000");
      // RGB color should support HSB channels
      expect(color.getChannelValue("hue")).toBe(0);
      expect(color.getChannelValue("saturation")).toBe(100);
      expect(color.getChannelValue("brightness")).toBe(100);
    });

    it("should support cross-color-space channel updates for RGB", () => {
      const color = parseColor("#ff0000");
      const updated = color.withChannelValue("hue", 120);
      // Should now be greenish
      expect(updated.getChannelValue("hue")).toBe(120);
    });

    it("should get color name", () => {
      const red = parseColor("#ff0000");
      expect(red.getColorName("en-US")).toBeTruthy();
    });

    it("should match React Stately OKLCH color names", () => {
      const purple = parseColor("#9B80FF");
      expect(purple.getColorName("en-US")).toBe("vibrant purple");
      expect(purple.getHueName("en-US")).toBe("purple");
    });

    it("should get color space", () => {
      const rgb = parseColor("#ff0000");
      expect(rgb.getColorSpace()).toBe("rgb");

      const hsl = parseColor("hsl(0, 100%, 50%)");
      expect(hsl.getColorSpace()).toBe("hsl");
    });

    it("should get color space axes", () => {
      const color = parseColor("hsb(0, 100%, 100%)");
      const axes = color.getColorSpaceAxes({});
      expect(axes.xChannel).toBeTruthy();
      expect(axes.yChannel).toBeTruthy();
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

      expect(state.value).toBeTruthy();
      expect(state.channel).toBe("hue");
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
      expect(changedColor!.getChannelValue("red")).toBe(255);
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

      expect(state.step).toBe(1);
      expect(state.pageSize).toBe(17);
      dispose();
    });
  });

  it("should default to horizontal orientation and expose vertical orientation", () => {
    createRoot((dispose) => {
      const horizontal = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(0, 100%, 50%)",
      }));
      const vertical = createColorSliderState(() => ({
        channel: "hue",
        defaultValue: "hsl(0, 100%, 50%)",
        orientation: "vertical",
      }));

      expect(horizontal.orientation).toBe("horizontal");
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

      expect(state.value.getColorSpace()).toBe("hsb");
      state.setThumbValue(80);
      expect(changedColor).toBeTruthy();
      expect(changedColor!.getColorSpace()).toBe("hsb");
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

      const displayColor = state.getDisplayColor();
      expect(displayColor.getChannelValue("hue")).toBe(90);
      expect(displayColor.getChannelValue("saturation")).toBe(100);
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

      expect(state.value).toBeTruthy();
      expect(state.xChannel).toBeTruthy();
      expect(state.yChannel).toBeTruthy();
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

      expect(state.getXValue()).toBe(50);
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

      const pos = state.getThumbPosition();
      expect(pos.x).toBeCloseTo(0.5, 2);
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
      expect(changedColor!.getChannelValue("saturation")).toBeCloseTo(50, 0);
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

      expect(state.xChannelStep).toBe(1);
      expect(state.yChannelStep).toBe(1);
      expect(state.xChannelPageStep).toBe(10);
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

      expect(state.value.getColorSpace()).toBe("hsb");
      state.setXValue(50);
      expect(changedColor?.getColorSpace()).toBe("hsb");

      setColorSpace("rgb");
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

      expect(state.value).toBeTruthy();
      expect(state.isDragging).toBe(false);
      dispose();
    });
  });

  it("should get hue value", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(180, 100%, 50%)",
      }));

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
      const angle = state.getThumbAngle();
      expect(angle).toBeCloseTo(2 * Math.PI, 1);
      dispose();
    });
  });

  it("should call onChange when setting hue", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setHue(90);
      expect(changedColor).toBeTruthy();
      expect(changedColor!.getChannelValue("hue")).toBe(90);
      dispose();
    });
  });

  it("should wrap hue value in onChange", () => {
    createRoot((dispose) => {
      let changedColor: Color | null = null;
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
        onChange: (color) => {
          changedColor = color;
        },
      }));

      state.setHue(370);
      expect(changedColor!.getChannelValue("hue")).toBe(10);
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
      expect(changedColor!.getChannelValue("hue")).toBeCloseTo(180, 0);
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
      expect(changedColor!.getChannelValue("hue")).toBe(101);
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
      expect(changedColor!.getChannelValue("hue")).toBe(99);
      dispose();
    });
  });

  it("should get step and page step", () => {
    createRoot((dispose) => {
      const state = createColorWheelState(() => ({
        defaultValue: "hsl(0, 100%, 50%)",
      }));

      expect(state.step).toBe(1);
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

      expect(state.value).toBeTruthy();
      expect(state.inputValue).toBe("#ff0000");
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

      expect(state.inputValue).toBe("128");
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
      expect(changedColor).toBeTruthy();
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
      expect(state.isInvalid).toBe(false);
      expect(state.inputValue).toBe("#ff0000");
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
      expect(changedColor).toBeTruthy();
      expect(changedColor!.toString("hex")).toBe("#00ff00");
      expect(state.inputValue).toBe("#00ff00");
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(changedColor).toBeTruthy();
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
      expect(state.validate()).toBe(true);
      expect(state.validate("#0a")).toBe(true);
      expect(state.validate("0a")).toBe(true);

      state.setInputValue("invalid");
      expect(state.validate()).toBe(false);
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
      expect(state.inputValue).toBe("#000001");

      state.incrementToMax();
      expect(state.inputValue).toBe("#ffffff");

      state.decrement();
      expect(state.inputValue).toBe("#fffffe");

      state.decrementToMin();
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

      expect(state.inputValue).toBe("50%");
      expect(state.numberValue).toBe(0.5);
      expect(state.minValue).toBe(0);
      expect(state.maxValue).toBe(1);

      state.setInputValue("25%");
      state.commit();
      expect(state.value!.getChannelValue("saturation")).toBe(25);
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
      expect(changedColor).toBeNull();
      expect(state.isInvalid).toBe(false);
      dispose();
    });
  });
});
