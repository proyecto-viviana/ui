/**
 * Color class implementation.
 * Based on @react-stately/color.
 *
 * Provides color manipulation, conversion, and formatting.
 */

import type {
  Color,
  ColorFormat,
  ColorSpace,
  ColorChannel,
  ColorChannelRange,
  ColorAxes,
  RGBColor,
  HSLColor,
  HSBColor,
} from "./types";

// Channel ranges
const RGB_CHANNEL_RANGE: ColorChannelRange = {
  minValue: 0,
  maxValue: 255,
  step: 1,
  pageSize: 17,
};

const ALPHA_CHANNEL_RANGE: ColorChannelRange = {
  minValue: 0,
  maxValue: 1,
  step: 0.01,
  pageSize: 0.1,
};

const HUE_CHANNEL_RANGE: ColorChannelRange = {
  minValue: 0,
  maxValue: 360,
  step: 1,
  pageSize: 15,
};

const PERCENT_CHANNEL_RANGE: ColorChannelRange = {
  minValue: 0,
  maxValue: 100,
  step: 1,
  pageSize: 10,
};

// Channel names (English only for now)
const CHANNEL_NAMES: Record<ColorChannel, string> = {
  hue: "Hue",
  saturation: "Saturation",
  brightness: "Brightness",
  lightness: "Lightness",
  red: "Red",
  green: "Green",
  blue: "Blue",
  alpha: "Alpha",
};

// React Stately uses OKLCH for color names so that lightness is perceptually
// consistent across hues.
const ORANGE_LIGHTNESS_THRESHOLD = 0.68;
const YELLOW_GREEN_LIGHTNESS_THRESHOLD = 0.85;
const MAX_DARK_LIGHTNESS = 0.55;
const GRAY_THRESHOLD = 0.001;
const OKLCH_HUES: Array<[number, string]> = [
  [0, "pink"],
  [15, "red"],
  [48, "orange"],
  [94, "yellow"],
  [135, "green"],
  [175, "cyan"],
  [264, "blue"],
  [284, "purple"],
  [320, "magenta"],
  [349, "pink"],
];

/**
 * Clamp a value to a range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to fixed decimal places.
 */
function toFixed(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Convert RGB to HSL.
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB.
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert RGB to HSB.
 */
function rgbToHsb(r: number, g: number, b: number): { h: number; s: number; b: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    b: Math.round(v * 100),
  };
}

/**
 * Convert HSB to RGB.
 */
function hsbToRgb(h: number, s: number, b: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  b /= 100;

  let r: number, g: number, bl: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = b * (1 - s);
  const q = b * (1 - f * s);
  const t = b * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = b;
      g = t;
      bl = p;
      break;
    case 1:
      r = q;
      g = b;
      bl = p;
      break;
    case 2:
      r = p;
      g = b;
      bl = t;
      break;
    case 3:
      r = p;
      g = q;
      bl = b;
      break;
    case 4:
      r = t;
      g = p;
      bl = b;
      break;
    default:
      r = b;
      g = p;
      bl = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(bl * 255),
  };
}

function getOklchHueName(l: number, c: number, h: number): [string, number] {
  if (c < GRAY_THRESHOLD) {
    return ["gray", l];
  }

  for (let i = 0; i < OKLCH_HUES.length; i += 1) {
    let [hue, hueName] = OKLCH_HUES[i];
    const [nextHue, nextHueName] = OKLCH_HUES[i + 1] || [360, "pink"];
    if (h >= hue && h < nextHue) {
      if (hueName === "orange") {
        if (l < ORANGE_LIGHTNESS_THRESHOLD) {
          hueName = "brown";
        } else {
          l = l - ORANGE_LIGHTNESS_THRESHOLD + MAX_DARK_LIGHTNESS;
        }
      }

      if (h > hue + (nextHue - hue) / 2 && hueName !== nextHueName) {
        hueName = `${hueName} ${nextHueName}`;
      } else if (hueName === "yellow" && l < YELLOW_GREEN_LIGHTNESS_THRESHOLD) {
        hueName = "yellow green";
      }

      return [hueName.toLocaleLowerCase(), l];
    }
  }

  return ["pink", l];
}

function getColorNameFromColor(color: Color): string {
  let [l, c, h] = toOKLCH(color);
  const alpha = color.getChannelValue("alpha");

  if (l > 0.999) {
    return alpha < 1 ? `white ${Math.round((1 - alpha) * 100)}% transparent` : "white";
  }

  if (l < 0.001) {
    return alpha < 1 ? `black ${Math.round((1 - alpha) * 100)}% transparent` : "black";
  }

  let hue: string;
  [hue, l] = getOklchHueName(l, c, h);

  let chroma = "";
  if (c <= 0.1 && c >= GRAY_THRESHOLD) {
    chroma = l >= 0.7 ? "pale" : "grayish";
  } else if (c >= 0.15) {
    chroma = "vibrant";
  }

  let lightness = "";
  if (l < 0.3) {
    lightness = "very dark";
  } else if (l < MAX_DARK_LIGHTNESS) {
    lightness = "dark";
  } else if (l < 0.7) {
    lightness = "";
  } else if (l < 0.85) {
    lightness = "light";
  } else {
    lightness = "very light";
  }

  const name = [lightness, chroma, hue].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  if (alpha < 1) {
    return `${Math.round((1 - alpha) * 100)}% transparent ${name}`.trim();
  }

  return name;
}

function getHueNameFromColor(color: Color): string {
  const [l, c, h] = toOKLCH(color);
  const [name] = getOklchHueName(l, c, h);
  return name;
}

function toOKLCH(color: Color): [number, number, number] {
  const rgb = color.toFormat("rgb");
  let red = rgb.getChannelValue("red") / 255;
  let green = rgb.getChannelValue("green") / 255;
  let blue = rgb.getChannelValue("blue") / 255;
  [red, green, blue] = linSRGB(red, green, blue);
  const [x, y, z] = linSRGBToXYZ(red, green, blue);
  const [l, a, b] = xyzToOKLab(x, y, z);
  return okLabToOKLCH(l, a, b);
}

function okLabToOKLCH(l: number, a: number, b: number): [number, number, number] {
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return [l, Math.sqrt(a ** 2 + b ** 2), hue >= 0 ? hue : hue + 360];
}

function linSRGB(r: number, g: number, b: number): [number, number, number] {
  return [linSRGBComponent(r), linSRGBComponent(g), linSRGBComponent(b)];
}

function linSRGBComponent(value: number) {
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);

  if (abs <= 0.04045) {
    return value / 12.92;
  }

  return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
}

function linSRGBToXYZ(r: number, g: number, b: number): [number, number, number] {
  const matrix = [
    506752 / 1228815,
    87881 / 245763,
    12673 / 70218,
    87098 / 409605,
    175762 / 245763,
    12673 / 175545,
    7918 / 409605,
    87881 / 737289,
    1001167 / 1053270,
  ];
  return multiplyMatrix(matrix, r, g, b);
}

function xyzToOKLab(x: number, y: number, z: number): [number, number, number] {
  const xyzToLMS = [
    0.819022437996703, 0.3619062600528904, -0.1288737815209879, 0.0329836539323885,
    0.9292868615863434, 0.0361446663506424, 0.0481771893596242, 0.2642395317527308,
    0.6335478284694309,
  ];
  const lmsToOKLab = [
    0.210454268309314, 0.7936177747023054, -0.0040720430116193, 1.9779985324311684,
    -2.4285922420485799, 0.450593709617411, 0.0259040424655478, 0.7827717124575296,
    -0.8086757549230774,
  ];

  const [a, b, c] = multiplyMatrix(xyzToLMS, x, y, z);
  return multiplyMatrix(lmsToOKLab, Math.cbrt(a), Math.cbrt(b), Math.cbrt(c));
}

function multiplyMatrix(
  matrix: number[],
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  const a = matrix[0] * x + matrix[1] * y + matrix[2] * z;
  const b = matrix[3] * x + matrix[4] * y + matrix[5] * z;
  const c = matrix[6] * x + matrix[7] * y + matrix[8] * z;
  return [a, b, c];
}

/**
 * RGB Color implementation.
 */
class RGBColorImpl implements Color {
  private red: number;
  private green: number;
  private blue: number;
  private alpha: number;

  constructor(red: number, green: number, blue: number, alpha: number = 1) {
    this.red = clamp(Math.round(red), 0, 255);
    this.green = clamp(Math.round(green), 0, 255);
    this.blue = clamp(Math.round(blue), 0, 255);
    this.alpha = clamp(toFixed(alpha, 2), 0, 1);
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case "hex":
      case "hexa":
      case "rgb":
      case "rgba":
        return this.clone();
      case "hsl":
      case "hsla": {
        const { h, s, l } = rgbToHsl(this.red, this.green, this.blue);
        return new HSLColorImpl(h, s, l, this.alpha);
      }
      case "hsb":
      case "hsba": {
        const { h, s, b } = rgbToHsb(this.red, this.green, this.blue);
        return new HSBColorImpl(h, s, b, this.alpha);
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  toString(format?: ColorFormat | "css"): string {
    const f = format ?? "css";

    switch (f) {
      case "hex":
        return `#${this.red.toString(16).padStart(2, "0")}${this.green.toString(16).padStart(2, "0")}${this.blue.toString(16).padStart(2, "0")}`;
      case "hexa":
        return `#${this.red.toString(16).padStart(2, "0")}${this.green.toString(16).padStart(2, "0")}${this.blue.toString(16).padStart(2, "0")}${Math.round(
          this.alpha * 255,
        )
          .toString(16)
          .padStart(2, "0")}`;
      case "rgb":
        return `rgb(${this.red}, ${this.green}, ${this.blue})`;
      case "rgba":
      case "css":
        return this.alpha === 1
          ? `rgb(${this.red}, ${this.green}, ${this.blue})`
          : `rgba(${this.red}, ${this.green}, ${this.blue}, ${this.alpha})`;
      default:
        return this.toFormat(f as ColorFormat).toString(f);
    }
  }

  clone(): Color {
    return new RGBColorImpl(this.red, this.green, this.blue, this.alpha);
  }

  toHexInt(): number {
    return (this.red << 16) | (this.green << 8) | this.blue;
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case "red":
        return this.red;
      case "green":
        return this.green;
      case "blue":
        return this.blue;
      case "alpha":
        return this.alpha;
      // Cross-color-space channels - convert to HSB
      case "hue":
      case "saturation":
      case "brightness":
        return this.toFormat("hsb").getChannelValue(channel);
      case "lightness":
        return this.toFormat("hsl").getChannelValue(channel);
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    switch (channel) {
      case "red":
        return new RGBColorImpl(value, this.green, this.blue, this.alpha);
      case "green":
        return new RGBColorImpl(this.red, value, this.blue, this.alpha);
      case "blue":
        return new RGBColorImpl(this.red, this.green, value, this.alpha);
      case "alpha":
        return new RGBColorImpl(this.red, this.green, this.blue, value);
      // Cross-color-space channels - convert, update, convert back
      case "hue":
      case "saturation":
      case "brightness":
        return this.toFormat("hsb").withChannelValue(channel, value).toFormat("rgb");
      case "lightness":
        return this.toFormat("hsl").withChannelValue(channel, value).toFormat("rgb");
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "red":
      case "green":
      case "blue":
        return RGB_CHANNEL_RANGE;
      case "alpha":
        return ALPHA_CHANNEL_RANGE;
      case "hue":
        return HUE_CHANNEL_RANGE;
      case "saturation":
      case "brightness":
      case "lightness":
        return PERCENT_CHANNEL_RANGE;
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelName(channel: ColorChannel, _locale: string): string {
    return CHANNEL_NAMES[channel] || channel;
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    if (channel === "alpha") {
      return { style: "percent" };
    }
    return { maximumFractionDigits: 0 };
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const value = this.getChannelValue(channel);
    const options = this.getChannelFormatOptions(channel);
    return new Intl.NumberFormat(locale, options).format(value);
  }

  getColorSpace(): ColorSpace {
    return "rgb";
  }

  getColorSpaceAxes(xyChannels?: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    const xChannel = xyChannels?.xChannel ?? "red";
    const yChannel = xyChannels?.yChannel ?? "green";
    const channels: ColorChannel[] = ["red", "green", "blue"];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel) ?? "blue";
    return { xChannel, yChannel, zChannel };
  }

  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return ["red", "green", "blue"];
  }

  getColorName(_locale: string): string {
    return getColorNameFromColor(this);
  }

  getHueName(_locale: string): string {
    return getHueNameFromColor(this);
  }
}

/**
 * HSL Color implementation.
 */
class HSLColorImpl implements Color {
  private hue: number;
  private saturation: number;
  private lightness: number;
  private alpha: number;

  constructor(hue: number, saturation: number, lightness: number, alpha: number = 1) {
    this.hue = clamp(Math.round(hue) % 360, 0, 360);
    this.saturation = clamp(Math.round(saturation), 0, 100);
    this.lightness = clamp(Math.round(lightness), 0, 100);
    this.alpha = clamp(toFixed(alpha, 2), 0, 1);
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case "hsl":
      case "hsla":
        return this.clone();
      case "hex":
      case "hexa":
      case "rgb":
      case "rgba": {
        const { r, g, b } = hslToRgb(this.hue, this.saturation, this.lightness);
        return new RGBColorImpl(r, g, b, this.alpha);
      }
      case "hsb":
      case "hsba": {
        const { r, g, b } = hslToRgb(this.hue, this.saturation, this.lightness);
        const hsb = rgbToHsb(r, g, b);
        return new HSBColorImpl(hsb.h, hsb.s, hsb.b, this.alpha);
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  toString(format?: ColorFormat | "css"): string {
    const f = format ?? "css";

    switch (f) {
      case "hsl":
        return `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`;
      case "hsla":
      case "css":
        return this.alpha === 1
          ? `hsl(${this.hue}, ${this.saturation}%, ${this.lightness}%)`
          : `hsla(${this.hue}, ${this.saturation}%, ${this.lightness}%, ${this.alpha})`;
      default:
        return this.toFormat(f as ColorFormat).toString(f);
    }
  }

  clone(): Color {
    return new HSLColorImpl(this.hue, this.saturation, this.lightness, this.alpha);
  }

  toHexInt(): number {
    return this.toFormat("rgb").toHexInt();
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case "hue":
        return this.hue;
      case "saturation":
        return this.saturation;
      case "lightness":
        return this.lightness;
      case "alpha":
        return this.alpha;
      // Cross-color-space channels
      case "red":
      case "green":
      case "blue":
        return this.toFormat("rgb").getChannelValue(channel);
      case "brightness":
        return this.toFormat("hsb").getChannelValue(channel);
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    switch (channel) {
      case "hue":
        return new HSLColorImpl(value, this.saturation, this.lightness, this.alpha);
      case "saturation":
        return new HSLColorImpl(this.hue, value, this.lightness, this.alpha);
      case "lightness":
        return new HSLColorImpl(this.hue, this.saturation, value, this.alpha);
      case "alpha":
        return new HSLColorImpl(this.hue, this.saturation, this.lightness, value);
      // Cross-color-space channels
      case "red":
      case "green":
      case "blue":
        return this.toFormat("rgb").withChannelValue(channel, value).toFormat("hsl");
      case "brightness":
        return this.toFormat("hsb").withChannelValue(channel, value).toFormat("hsl");
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return HUE_CHANNEL_RANGE;
      case "saturation":
      case "lightness":
      case "brightness":
        return PERCENT_CHANNEL_RANGE;
      case "alpha":
        return ALPHA_CHANNEL_RANGE;
      case "red":
      case "green":
      case "blue":
        return RGB_CHANNEL_RANGE;
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelName(channel: ColorChannel, _locale: string): string {
    return CHANNEL_NAMES[channel] || channel;
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    if (channel === "alpha") {
      return { style: "percent" };
    }
    if (channel === "hue") {
      return { style: "unit", unit: "degree", unitDisplay: "narrow", maximumFractionDigits: 0 };
    }
    return { style: "percent", maximumFractionDigits: 0 };
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const value = this.getChannelValue(channel);
    const options = this.getChannelFormatOptions(channel);
    if (channel === "saturation" || channel === "lightness") {
      return new Intl.NumberFormat(locale, options).format(value / 100);
    }
    return new Intl.NumberFormat(locale, options).format(value);
  }

  getColorSpace(): ColorSpace {
    return "hsl";
  }

  getColorSpaceAxes(xyChannels?: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    const xChannel = xyChannels?.xChannel ?? "saturation";
    const yChannel = xyChannels?.yChannel ?? "lightness";
    const channels: ColorChannel[] = ["hue", "saturation", "lightness"];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel) ?? "hue";
    return { xChannel, yChannel, zChannel };
  }

  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return ["hue", "saturation", "lightness"];
  }

  getColorName(_locale: string): string {
    return getColorNameFromColor(this);
  }

  getHueName(_locale: string): string {
    return getHueNameFromColor(this);
  }
}

/**
 * HSB Color implementation.
 */
class HSBColorImpl implements Color {
  private hue: number;
  private saturation: number;
  private brightness: number;
  private alpha: number;

  constructor(hue: number, saturation: number, brightness: number, alpha: number = 1) {
    this.hue = clamp(Math.round(hue) % 360, 0, 360);
    this.saturation = clamp(Math.round(saturation), 0, 100);
    this.brightness = clamp(Math.round(brightness), 0, 100);
    this.alpha = clamp(toFixed(alpha, 2), 0, 1);
  }

  toFormat(format: ColorFormat): Color {
    switch (format) {
      case "hsb":
      case "hsba":
        return this.clone();
      case "hex":
      case "hexa":
      case "rgb":
      case "rgba": {
        const { r, g, b } = hsbToRgb(this.hue, this.saturation, this.brightness);
        return new RGBColorImpl(r, g, b, this.alpha);
      }
      case "hsl":
      case "hsla": {
        const { r, g, b } = hsbToRgb(this.hue, this.saturation, this.brightness);
        const hsl = rgbToHsl(r, g, b);
        return new HSLColorImpl(hsl.h, hsl.s, hsl.l, this.alpha);
      }
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  toString(format?: ColorFormat | "css"): string {
    const f = format ?? "css";

    switch (f) {
      case "hsb":
        return `hsb(${this.hue}, ${this.saturation}%, ${this.brightness}%)`;
      case "hsba":
      case "css":
        // HSB is not a standard CSS format, convert to RGB
        return this.toFormat("rgba").toString("css");
      default:
        return this.toFormat(f as ColorFormat).toString(f);
    }
  }

  clone(): Color {
    return new HSBColorImpl(this.hue, this.saturation, this.brightness, this.alpha);
  }

  toHexInt(): number {
    return this.toFormat("rgb").toHexInt();
  }

  getChannelValue(channel: ColorChannel): number {
    switch (channel) {
      case "hue":
        return this.hue;
      case "saturation":
        return this.saturation;
      case "brightness":
        return this.brightness;
      case "alpha":
        return this.alpha;
      // Cross-color-space channels
      case "red":
      case "green":
      case "blue":
        return this.toFormat("rgb").getChannelValue(channel);
      case "lightness":
        return this.toFormat("hsl").getChannelValue(channel);
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  withChannelValue(channel: ColorChannel, value: number): Color {
    switch (channel) {
      case "hue":
        return new HSBColorImpl(value, this.saturation, this.brightness, this.alpha);
      case "saturation":
        return new HSBColorImpl(this.hue, value, this.brightness, this.alpha);
      case "brightness":
        return new HSBColorImpl(this.hue, this.saturation, value, this.alpha);
      case "alpha":
        return new HSBColorImpl(this.hue, this.saturation, this.brightness, value);
      // Cross-color-space channels
      case "red":
      case "green":
      case "blue":
        return this.toFormat("rgb").withChannelValue(channel, value).toFormat("hsb");
      case "lightness":
        return this.toFormat("hsl").withChannelValue(channel, value).toFormat("hsb");
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelRange(channel: ColorChannel): ColorChannelRange {
    switch (channel) {
      case "hue":
        return HUE_CHANNEL_RANGE;
      case "saturation":
      case "brightness":
      case "lightness":
        return PERCENT_CHANNEL_RANGE;
      case "alpha":
        return ALPHA_CHANNEL_RANGE;
      case "red":
      case "green":
      case "blue":
        return RGB_CHANNEL_RANGE;
      default:
        throw new Error(`Invalid channel: ${channel}`);
    }
  }

  getChannelName(channel: ColorChannel, _locale: string): string {
    return CHANNEL_NAMES[channel] || channel;
  }

  getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions {
    if (channel === "alpha") {
      return { style: "percent" };
    }
    if (channel === "hue") {
      return { style: "unit", unit: "degree", unitDisplay: "narrow", maximumFractionDigits: 0 };
    }
    return { style: "percent", maximumFractionDigits: 0 };
  }

  formatChannelValue(channel: ColorChannel, locale: string): string {
    const value = this.getChannelValue(channel);
    const options = this.getChannelFormatOptions(channel);
    if (channel === "saturation" || channel === "brightness") {
      return new Intl.NumberFormat(locale, options).format(value / 100);
    }
    return new Intl.NumberFormat(locale, options).format(value);
  }

  getColorSpace(): ColorSpace {
    return "hsb";
  }

  getColorSpaceAxes(xyChannels?: { xChannel?: ColorChannel; yChannel?: ColorChannel }): ColorAxes {
    const xChannel = xyChannels?.xChannel ?? "saturation";
    const yChannel = xyChannels?.yChannel ?? "brightness";
    const channels: ColorChannel[] = ["hue", "saturation", "brightness"];
    const zChannel = channels.find((c) => c !== xChannel && c !== yChannel) ?? "hue";
    return { xChannel, yChannel, zChannel };
  }

  getColorChannels(): [ColorChannel, ColorChannel, ColorChannel] {
    return ["hue", "saturation", "brightness"];
  }

  getColorName(_locale: string): string {
    return getColorNameFromColor(this);
  }

  getHueName(_locale: string): string {
    return getHueNameFromColor(this);
  }
}

/**
 * Parse a color string into a Color object.
 */
export function parseColor(value: string): Color {
  const trimmed = value.trim().toLowerCase();

  // Hex format
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (!/^[0-9a-f]+$/i.test(hex)) {
      throw new Error(`Invalid hex color: ${value}`);
    }
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return new RGBColorImpl(r, g, b);
    }
    if (hex.length === 4) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      const a = parseInt(hex[3] + hex[3], 16) / 255;
      return new RGBColorImpl(r, g, b, a);
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return new RGBColorImpl(r, g, b);
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16) / 255;
      return new RGBColorImpl(r, g, b, a);
    }
    throw new Error(`Invalid hex color: ${value}`);
  }

  // RGB/RGBA format
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    return new RGBColorImpl(r, g, b, a);
  }

  // HSL/HSLA format
  const hslMatch = trimmed.match(
    /^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10);
    const s = parseInt(hslMatch[2], 10);
    const l = parseInt(hslMatch[3], 10);
    const a = hslMatch[4] !== undefined ? parseFloat(hslMatch[4]) : 1;
    return new HSLColorImpl(h, s, l, a);
  }

  // HSB/HSBA format
  const hsbMatch = trimmed.match(
    /^hsba?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/,
  );
  if (hsbMatch) {
    const h = parseInt(hsbMatch[1], 10);
    const s = parseInt(hsbMatch[2], 10);
    const b = parseInt(hsbMatch[3], 10);
    const a = hsbMatch[4] !== undefined ? parseFloat(hsbMatch[4]) : 1;
    return new HSBColorImpl(h, s, b, a);
  }

  throw new Error(`Invalid color format: ${value}`);
}

/**
 * Create an RGB color.
 */
export function createRGBColor(red: number, green: number, blue: number, alpha: number = 1): Color {
  return new RGBColorImpl(red, green, blue, alpha);
}

/**
 * Create an HSL color.
 */
export function createHSLColor(
  hue: number,
  saturation: number,
  lightness: number,
  alpha: number = 1,
): Color {
  return new HSLColorImpl(hue, saturation, lightness, alpha);
}

/**
 * Create an HSB color.
 */
export function createHSBColor(
  hue: number,
  saturation: number,
  brightness: number,
  alpha: number = 1,
): Color {
  return new HSBColorImpl(hue, saturation, brightness, alpha);
}

/**
 * Normalize a color value (string or Color) to a Color object.
 */
export function normalizeColor(value: string | Color): Color {
  if (typeof value === "string") {
    return parseColor(value);
  }
  return value;
}
