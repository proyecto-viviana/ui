/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/platform.ts

/**
 * Platform detection utilities.
 * Ported from packages/react-aria/src/utils/platform.ts.
 */

import { isTestEnv } from "./env";

interface NavigatorUAData {
  brands?: Array<{ brand: string; version: string }>;
  platform?: string;
}

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: NavigatorUAData;
}

function testUserAgent(re: RegExp): boolean {
  if (typeof window === "undefined" || window.navigator == null) {
    return false;
  }
  const nav = window.navigator as NavigatorWithUserAgentData;
  const brands = nav.userAgentData?.brands;
  return (
    (Array.isArray(brands) &&
      brands.some((brand: { brand: string; version: string }) => re.test(brand.brand))) ||
    re.test(nav.userAgent)
  );
}

function testPlatform(re: RegExp): boolean {
  if (typeof window === "undefined" || window.navigator == null) {
    return false;
  }
  const nav = window.navigator as NavigatorWithUserAgentData;
  return re.test(nav.userAgentData?.platform || nav.platform || "");
}

function cached(fn: () => boolean): () => boolean {
  if (isTestEnv()) {
    return fn;
  }

  let res: boolean | null = null;
  return () => {
    if (res == null) {
      res = fn();
    }
    return res;
  };
}

export const isMac: () => boolean = cached(function () {
  return testPlatform(/^Mac/i);
});

export const isIPhone: () => boolean = cached(function () {
  return testPlatform(/^iPhone/i);
});

export const isIPad: () => boolean = cached(function () {
  return (
    testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && (typeof navigator !== "undefined" ? navigator.maxTouchPoints > 1 : false))
  );
});

export const isIOS: () => boolean = cached(function () {
  return isIPhone() || isIPad();
});

export const isAppleDevice: () => boolean = cached(function () {
  return isMac() || isIOS();
});

export const isWebKit: () => boolean = cached(function () {
  return testUserAgent(/AppleWebKit/i) && (isIOS() || !isChrome());
});

export const isSafari: () => boolean = cached(function () {
  return isWebKit() && !isChrome() && !isFirefox();
});

export const isChrome: () => boolean = cached(function () {
  return testUserAgent(/Chrome|CriOS|CrMo/i);
});

export const isAndroid: () => boolean = cached(function () {
  return testUserAgent(/Android/i);
});

export const isFirefox: () => boolean = cached(function () {
  return testUserAgent(/(Firefox|FxiOS)/i);
});
