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

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Content.tsx

// Port of packages/@react-spectrum/s2/src/Content.tsx.
import type { JSX } from "solid-js";
import type { RefLike } from "../button/spectrum-context";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import type { StyleString } from "../style";

export interface BaseContentProps<T extends HTMLElement = HTMLElement> {
  children?: JSX.Element;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: UnsafeClassName | string;
  UNSAFE_style?: JSX.CSSProperties;
  isHidden?: boolean;
  id?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  role?: string;
  slot?: string | null;
  ref?: RefLike<T>;
  [key: `data-${string}`]: string | undefined;
}

export function mergeUnsafeClassName(
  contextClassName?: UnsafeClassName | string,
  localClassName?: UnsafeClassName | string,
): string | undefined {
  return [contextClassName, localClassName].filter(Boolean).join(" ") || undefined;
}

export function getContentDomProps<T extends HTMLElement>(
  props: BaseContentProps<T>,
): JSX.HTMLAttributes<T> {
  const domProps: Record<string, unknown> = {};

  for (const key of [
    "id",
    "itemProp",
    "itemScope",
    "itemType",
    "itemID",
    "itemRef",
    "role",
  ] as const) {
    const value = props[key];
    if (value !== undefined) {
      domProps[key] = value;
    }
  }

  const record = props as Record<string, unknown>;
  for (const key in record) {
    if (key.startsWith("data-")) {
      const value = record[key];
      domProps[key] = value == null ? undefined : String(value);
    }
  }

  return domProps as JSX.HTMLAttributes<T>;
}
