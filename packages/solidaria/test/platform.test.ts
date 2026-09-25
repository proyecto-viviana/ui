import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import {
  isMac,
  isIPhone,
  isIPad,
  isIOS,
  isAppleDevice,
  isWebKit,
  isSafari,
  isChrome,
  isAndroid,
  isFirefox,
} from "../src/utils/platform";

describe("platform detection", () => {
  type MockNavigatorState = {
    userAgent?: string;
    platform?: string;
    maxTouchPoints?: number;
    userAgentData?: {
      brands?: Array<{ brand: string; version: string }>;
      platform?: string;
    };
  };

  const originalPlatformDesc = Object.getOwnPropertyDescriptor(window.navigator, "platform");
  const originalUserAgentDesc = Object.getOwnPropertyDescriptor(window.navigator, "userAgent");
  const originalMaxTouchPointsDesc = Object.getOwnPropertyDescriptor(
    window.navigator,
    "maxTouchPoints",
  );
  const originalUserAgentDataDesc = Object.getOwnPropertyDescriptor(
    window.navigator,
    "userAgentData",
  );

  function setNavigator(state: MockNavigatorState) {
    if (state.platform !== undefined) {
      Object.defineProperty(window.navigator, "platform", {
        value: state.platform,
        configurable: true,
      });
    } else {
      Object.defineProperty(window.navigator, "platform", {
        value: "",
        configurable: true,
      });
    }

    if (state.userAgent !== undefined) {
      Object.defineProperty(window.navigator, "userAgent", {
        value: state.userAgent,
        configurable: true,
      });
    } else {
      Object.defineProperty(window.navigator, "userAgent", {
        value: "",
        configurable: true,
      });
    }

    if (state.maxTouchPoints !== undefined) {
      Object.defineProperty(window.navigator, "maxTouchPoints", {
        value: state.maxTouchPoints,
        configurable: true,
      });
    } else {
      Object.defineProperty(window.navigator, "maxTouchPoints", {
        value: 0,
        configurable: true,
      });
    }

    if (state.userAgentData !== undefined) {
      Object.defineProperty(window.navigator, "userAgentData", {
        value: state.userAgentData,
        configurable: true,
      });
    } else {
      Object.defineProperty(window.navigator, "userAgentData", {
        value: undefined,
        configurable: true,
      });
    }
  }

  afterEach(() => {
    if (originalPlatformDesc) {
      Object.defineProperty(window.navigator, "platform", originalPlatformDesc);
    } else {
      delete (window.navigator as unknown as Record<string, unknown>).platform;
    }

    if (originalUserAgentDesc) {
      Object.defineProperty(window.navigator, "userAgent", originalUserAgentDesc);
    } else {
      delete (window.navigator as unknown as Record<string, unknown>).userAgent;
    }

    if (originalMaxTouchPointsDesc) {
      Object.defineProperty(window.navigator, "maxTouchPoints", originalMaxTouchPointsDesc);
    } else {
      delete (window.navigator as unknown as Record<string, unknown>).maxTouchPoints;
    }

    if (originalUserAgentDataDesc) {
      Object.defineProperty(window.navigator, "userAgentData", originalUserAgentDataDesc);
    } else {
      delete (window.navigator as unknown as Record<string, unknown>).userAgentData;
    }
  });

  describe("macOS", () => {
    it("detects Mac via navigator.platform", () => {
      setNavigator({ platform: "MacIntel" });
      expect(isMac()).toBe(true);
      expect(isAppleDevice()).toBe(true);
      expect(isIOS()).toBe(false);
      expect(isIPad()).toBe(false);
      expect(isIPhone()).toBe(false);
    });

    it("detects Mac via userAgentData.platform", () => {
      setNavigator({ platform: "Other", userAgentData: { platform: "macOS" } });
      expect(isMac()).toBe(true);
      expect(isAppleDevice()).toBe(true);
    });

    it("prioritizes userAgentData.platform over navigator.platform", () => {
      setNavigator({ platform: "MacIntel", userAgentData: { platform: "Windows" } });
      expect(isMac()).toBe(false);
    });
  });

  describe("iOS devices", () => {
    it("detects iPhone via platform", () => {
      setNavigator({ platform: "iPhone" });
      expect(isIPhone()).toBe(true);
      expect(isIOS()).toBe(true);
      expect(isAppleDevice()).toBe(true);
      expect(isMac()).toBe(false);
      expect(isIPad()).toBe(false);
    });

    it("detects legacy iPad via platform", () => {
      setNavigator({ platform: "iPad" });
      expect(isIPad()).toBe(true);
      expect(isIOS()).toBe(true);
      expect(isAppleDevice()).toBe(true);
      expect(isIPhone()).toBe(false);
    });

    it("detects modern iPad with iPadOS 13+ desktop spoofing (Mac platform + touch points)", () => {
      setNavigator({ platform: "MacIntel", maxTouchPoints: 5 });
      expect(isMac()).toBe(true);
      expect(isIPad()).toBe(true);
      expect(isIOS()).toBe(true);
      expect(isAppleDevice()).toBe(true);
    });

    it("does not report desktop Mac as iPad when maxTouchPoints is <= 1", () => {
      setNavigator({ platform: "MacIntel", maxTouchPoints: 1 });
      expect(isMac()).toBe(true);
      expect(isIPad()).toBe(false);
      expect(isIOS()).toBe(false);
    });
  });

  describe("Android", () => {
    it("detects Android via userAgent", () => {
      setNavigator({
        platform: "Linux armv8l",
        userAgent:
          "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      });
      expect(isAndroid()).toBe(true);
      expect(isAppleDevice()).toBe(false);
      expect(isIOS()).toBe(false);
      expect(isMac()).toBe(false);
    });
  });

  describe("Chrome", () => {
    it("detects desktop Chrome via userAgent", () => {
      setNavigator({
        platform: "Win32",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      });
      expect(isChrome()).toBe(true);
      expect(isWebKit()).toBe(false);
      expect(isSafari()).toBe(false);
      expect(isFirefox()).toBe(false);
    });

    it("detects Chrome via userAgentData.brands", () => {
      setNavigator({
        platform: "Linux",
        userAgent: "Custom browser",
        userAgentData: {
          brands: [
            { brand: "Chromium", version: "120" },
            { brand: "Google Chrome", version: "120" },
          ],
        },
      });
      expect(isChrome()).toBe(true);
    });

    it("detects Chrome on iOS (CriOS)", () => {
      setNavigator({
        platform: "iPhone",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1",
      });
      expect(isChrome()).toBe(true);
      expect(isIOS()).toBe(true);
      expect(isWebKit()).toBe(true);
      expect(isSafari()).toBe(false);
    });

    it("detects Chrome Mobile (CrMo)", () => {
      setNavigator({
        userAgent:
          "Mozilla/5.0 (Linux; Android 4.0.4; Galaxy Nexus Build/IMM76B) AppleWebKit/535.19 CrMo/18.0.1025.133 Mobile Safari/535.19",
      });
      expect(isChrome()).toBe(true);
    });
  });

  describe("Safari and WebKit", () => {
    it("detects Safari on macOS", () => {
      setNavigator({
        platform: "MacIntel",
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      });
      expect(isSafari()).toBe(true);
      expect(isWebKit()).toBe(true);
      expect(isChrome()).toBe(false);
      expect(isFirefox()).toBe(false);
      expect(isMac()).toBe(true);
    });

    it("detects Safari on iOS", () => {
      setNavigator({
        platform: "iPhone",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      });
      expect(isSafari()).toBe(true);
      expect(isWebKit()).toBe(true);
      expect(isIOS()).toBe(true);
      expect(isChrome()).toBe(false);
      expect(isFirefox()).toBe(false);
    });

    it("reports WebKit as true on iOS even when running Chrome (iOS WebKit exception)", () => {
      setNavigator({
        platform: "iPhone",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148",
      });
      expect(isWebKit()).toBe(true);
      expect(isChrome()).toBe(true);
      expect(isSafari()).toBe(false);
    });
  });

  describe("Firefox", () => {
    it("detects desktop Firefox", () => {
      setNavigator({
        platform: "Win32",
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      });
      expect(isFirefox()).toBe(true);
      expect(isChrome()).toBe(false);
      expect(isWebKit()).toBe(false);
      expect(isSafari()).toBe(false);
    });

    it("detects Firefox on iOS (FxiOS)", () => {
      setNavigator({
        platform: "iPhone",
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/120.0 Mobile/15E148 Safari/605.1.15",
      });
      expect(isFirefox()).toBe(true);
      expect(isWebKit()).toBe(true);
      expect(isSafari()).toBe(false);
      expect(isChrome()).toBe(false);
    });
  });
});
