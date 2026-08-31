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

interface NavigatorWithUserAgentData extends Navigator {
  userAgentData?: {
    platform?: string;
  };
}

function getNavigator(): NavigatorWithUserAgentData | null {
  if (typeof window === "undefined" || window.navigator == null) return null;
  return window.navigator as NavigatorWithUserAgentData;
}

function testPlatform(re: RegExp): boolean {
  const nav = getNavigator();
  if (!nav) return false;
  return re.test(nav.platform || nav.userAgentData?.platform || "");
}

function testUserAgent(re: RegExp): boolean {
  const nav = getNavigator();
  return nav ? re.test(nav.userAgent) : false;
}

export function isMac(): boolean {
  return testPlatform(/^Mac/i);
}

export function isIPhone(): boolean {
  return testPlatform(/^iPhone/i);
}

export function isIPad(): boolean {
  return testPlatform(/^iPad/i) || (isMac() && navigator.maxTouchPoints > 1);
}

export function isIOS(): boolean {
  return isIPhone() || isIPad();
}

export function isAppleDevice(): boolean {
  return isMac() || isIOS();
}

export function isWebKit(): boolean {
  return testUserAgent(/AppleWebKit/i) && !isChrome();
}

export function isChrome(): boolean {
  return testUserAgent(/Chrome/i);
}

export function isAndroid(): boolean {
  return testUserAgent(/Android/i);
}

export function isFirefox(): boolean {
  return testUserAgent(/Firefox/i);
}
