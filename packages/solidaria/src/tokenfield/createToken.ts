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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tokenfield/useToken.ts

/**
 * Provides the behavior and accessibility implementation for a token within a token field.
 * A token field allows users to enter text with inline tokens.
 */

import { type JSX, createEffect, createSignal, onCleanup } from "solid-js";
import type { TokenFieldState } from "@proyecto-viviana/solid-stately";

export interface TokenProps {}

export interface TokenAria {
  /** Props for the token element. */
  tokenProps: JSX.HTMLAttributes<HTMLSpanElement>;
  /** Whether the token is currently selected. */
  isSelected: () => boolean;
}

/**
 * Provides the behavior and accessibility implementation for a token within a token field.
 */
export function createToken(
  _props: TokenProps,
  _state: TokenFieldState | Record<string, unknown> | null,
  ref: () => HTMLSpanElement | null,
): TokenAria {
  const [isSelected, setSelected] = createSignal(false);

  createEffect(() => {
    if (typeof document === "undefined") return;

    const onSelectionChange = () => {
      const selection = window.getSelection();
      const element = ref();
      if (!selection || selection.rangeCount === 0 || !element) {
        return;
      }

      const range = selection.getRangeAt(0);
      if (!range.collapsed && range.intersectsNode(element)) {
        setSelected(true);
      } else {
        setSelected(false);
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);
    onCleanup(() => document.removeEventListener("selectionchange", onSelectionChange));
  });

  return {
    tokenProps: {
      contentEditable: false,
      // Solid has no suppressContentEditableWarning; keep the RAC contenteditable contract.
      style: {
        "user-select": "all",
        "-webkit-user-select": "all",
      } as JSX.CSSProperties,
    },
    isSelected,
  };
}
