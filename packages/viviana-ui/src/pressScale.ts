/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/pressScale.ts

// Port of packages/@react-spectrum/s2/src/pressScale.ts.
import type { Accessor, JSX } from "solid-js";

type ElementRef =
  | HTMLElement
  | undefined
  | null
  | Accessor<HTMLElement | undefined | null>
  | { current?: HTMLElement | undefined | null };

function resolveElement(ref: ElementRef): HTMLElement | undefined | null {
  if (typeof ref === "function") {
    return ref();
  }

  if (ref && typeof ref === "object" && "current" in ref) {
    return ref.current;
  }

  return ref as HTMLElement | undefined | null;
}

function resolveStyle<R>(
  style: JSX.CSSProperties | ((renderProps: R) => JSX.CSSProperties) | undefined,
  renderProps: R,
): JSX.CSSProperties {
  return typeof style === "function" ? style(renderProps) : (style ?? {});
}

export function pressScale<R extends { isPressed: boolean }>(
  ref: ElementRef,
  style?: JSX.CSSProperties | ((renderProps: R) => JSX.CSSProperties),
): (renderProps: R) => JSX.CSSProperties {
  return (renderProps) => {
    const next = { ...resolveStyle(style, renderProps) } as JSX.CSSProperties;
    const styleRecord = next as Record<string, string | number | undefined>;
    const willChange = styleRecord["will-change"] ?? "";
    styleRecord["will-change"] = `${willChange} transform`.trim();

    const element = resolveElement(ref);
    if (renderProps.isPressed && element) {
      const { width, height } = element.getBoundingClientRect();
      const perspective = Math.max(height, width / 3, 24);
      const transform = styleRecord.transform ?? "";
      styleRecord.transform =
        `${transform} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
    }

    return next;
  };
}
