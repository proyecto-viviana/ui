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

/**
 * createPreventScroll tests — Port of React Aria's usePreventScroll.test.js,
 * plus kebab-case setStyle / Reflect focus-restore coverage from RAC 1.21.0.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { createPreventScroll } from "../src/overlays/createPreventScroll";
import { getNonce, resetNonceCache } from "../src/utils/getNonce";

function Example(props: { isDisabled?: boolean }) {
  createPreventScroll({ isDisabled: props.isDisabled });
  return <div />;
}

describe("createPreventScroll", () => {
  afterEach(() => {
    cleanup();
    document.documentElement.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("scrollbar-gutter");
    document.documentElement.style.removeProperty("padding-right");
  });

  it("should set overflow: hidden on the document element on mount and remove on unmount", () => {
    expect(document.documentElement).not.toHaveStyle("overflow: hidden");

    const result = render(() => <Example />);
    expect(document.documentElement).toHaveStyle("overflow: hidden");

    result.unmount();
    expect(document.documentElement).not.toHaveStyle("overflow: hidden");
  });

  it("should work with nested modals", () => {
    expect(document.documentElement).not.toHaveStyle("overflow: hidden");

    const one = render(() => <Example />);
    expect(document.documentElement).toHaveStyle("overflow: hidden");

    const two = render(() => <Example />);
    expect(document.documentElement).toHaveStyle("overflow: hidden");

    two.unmount();
    expect(document.documentElement).toHaveStyle("overflow: hidden");

    one.unmount();
    expect(document.documentElement).not.toHaveStyle("overflow: hidden");
  });

  it("writes kebab-case scrollbar-gutter / padding-right via setProperty, not camelCase style keys", () => {
    Object.defineProperty(document.documentElement.style, "scrollbarGutter", {
      configurable: true,
      enumerable: true,
      value: "",
    });

    const setProperty = vi.spyOn(document.documentElement.style, "setProperty");
    const result = render(() => <Example />);

    const kebabCalls = setProperty.mock.calls.filter(
      (call) => call[0] === "scrollbar-gutter" || call[0] === "padding-right",
    );
    const camelCalls = setProperty.mock.calls.filter(
      (call) => call[0] === "scrollbarGutter" || call[0] === "paddingRight",
    );

    expect(kebabCalls.length).toBeGreaterThan(0);
    expect(camelCalls).toHaveLength(0);

    result.unmount();
    setProperty.mockRestore();
  });
});

// Port of RAC usePreventScroll.ts:139-142 — the mobile Safari branch injects a
// <style> element, which a Content-Security-Policy page blocks unless it carries
// the page's nonce. The branch is gated on isIOS() && isWebKit(), so these fake
// the platform the way createMove.test.tsx does.
describe("createPreventScroll csp nonce", () => {
  const IPHONE_UA =
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

  let platformGetter: ReturnType<typeof vi.spyOn> | undefined;
  let userAgentGetter: ReturnType<typeof vi.spyOn> | undefined;

  beforeEach(() => {
    resetNonceCache();
    platformGetter = vi.spyOn(window.navigator, "platform", "get");
    platformGetter.mockReturnValue("iPhone");
    userAgentGetter = vi.spyOn(window.navigator, "userAgent", "get");
    userAgentGetter.mockReturnValue(IPHONE_UA);
  });

  afterEach(() => {
    cleanup();
    for (const meta of document.head.querySelectorAll('meta[name="csp-nonce"]')) {
      meta.remove();
    }
    platformGetter?.mockRestore();
    userAgentGetter?.mockRestore();
    resetNonceCache();
    document.documentElement.style.removeProperty("overflow");
  });

  function addNonceMeta(value: string) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "csp-nonce");
    meta.setAttribute("content", value);
    document.head.appendChild(meta);
  }

  function renderAndTakeInjectedStyle() {
    const before = new Set(document.head.querySelectorAll("style"));
    const result = render(() => <Example />);
    const style = [...document.head.querySelectorAll("style")].find((el) => !before.has(el));
    return { result, style };
  }

  it("labels the injected style element with the document's csp-nonce", () => {
    addNonceMeta("nonce-from-meta");

    const { result, style } = renderAndTakeInjectedStyle();

    expect(style).toBeDefined();
    expect(style!.textContent).toContain("overscroll-behavior: contain");
    expect(style!.nonce).toBe("nonce-from-meta");

    result.unmount();
    expect(document.head.contains(style!)).toBe(false);
  });

  it("sets no nonce when the document declares none", () => {
    const { result, style } = renderAndTakeInjectedStyle();

    expect(style).toBeDefined();
    expect(style!.textContent).toContain("overscroll-behavior: contain");
    expect(style!.nonce || null).toBeNull();
    expect(style!.getAttribute("nonce")).toBeNull();

    result.unmount();
  });

  it("caches per document until resetNonceCache, and reads the string not the element", () => {
    addNonceMeta("nonce-from-meta");
    expect(getNonce()).toBe("nonce-from-meta");

    document.head.querySelector('meta[name="csp-nonce"]')!.remove();
    expect(getNonce()).toBe("nonce-from-meta");

    resetNonceCache();
    expect(getNonce()).toBeUndefined();
  });
});
