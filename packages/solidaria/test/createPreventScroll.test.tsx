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

import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { createPreventScroll } from "../src/overlays/createPreventScroll";

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
