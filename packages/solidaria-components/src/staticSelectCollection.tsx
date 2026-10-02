/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Internal registration helper for a Select whose options are static JSX.
// Menu keeps the same descriptor list for static children. This module is not
// an Adobe port and is not a public entry.

import { createContext, createEffect, onCleanup, useContext } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { Key } from "@proyecto-viviana/solid-stately";

export interface StaticSelectCollectionItem {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
}

export interface StaticSelectCollectionContextValue {
  registerItem(item: StaticSelectCollectionItem): void;
  unregisterItem(id: Key): void;
}

export const StaticSelectCollectionContext =
  createContext<StaticSelectCollectionContextValue | null>(null);

/** True only for the registration copy of static select children. */
export const StaticSelectProbeContext = createContext(false);

/**
 * Display text for a static option. An explicit `textValue` wins, including
 * an empty string. Otherwise a string aria-label, then string or number
 * children. A missing text falls back to the id in the select state getter.
 */
export function staticSelectItemText(props: {
  textValue?: string;
  "aria-label"?: string;
  children?: unknown;
}): string | undefined {
  if (props.textValue != null) return props.textValue;
  const label = props["aria-label"];
  if (typeof label === "string") return label;
  return textFromNode(props.children);
}

function textFromNode(node: unknown): string | undefined {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (typeof node === "function" && node.length === 0) {
    return textFromNode(node());
  }
  if (Array.isArray(node)) {
    let text = "";
    let any = false;
    for (const child of node) {
      const part = textFromNode(child);
      if (part != null) {
        text += part;
        any = true;
      }
    }
    return any ? text : undefined;
  }
  return undefined;
}

/**
 * Mounted while a static select is closed so the collection exists before
 * the listbox opens. Renders nothing.
 */
export function StaticSelectProbeItem(props: {
  id: Key;
  textValue?: string;
  isDisabled?: boolean | (() => boolean);
  "aria-label"?: string;
  children?: unknown;
}): JSX.Element {
  const collection = useContext(StaticSelectCollectionContext);
  let registeredKey: Key | null = null;

  createEffect(
    () => {
      const disabled = props.isDisabled;
      return {
        id: props.id,
        textValue: staticSelectItemText(props),
        isDisabled: typeof disabled === "function" ? Boolean(disabled()) : Boolean(disabled),
      };
    },
    (item) => {
      if (!collection) return;
      if (registeredKey != null && registeredKey !== item.id) {
        collection.unregisterItem(registeredKey);
      }
      registeredKey = item.id;
      collection.registerItem(item);
    },
  );

  onCleanup(() => {
    if (registeredKey != null) {
      collection?.unregisterItem(registeredKey);
    }
  });

  return <></>;
}
