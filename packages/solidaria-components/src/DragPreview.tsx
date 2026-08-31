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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/dnd/DragPreview.tsx

/**
 * Based on packages/react-aria/src/dnd/DragPreview.tsx.
 */

import { onCleanup, type JSX } from "solid-js";
import type { DragItem, DragPreviewRenderer } from "@proyecto-viviana/solid-stately";

export interface DragPreviewProps {
  ref?: { current: DragPreviewRenderer | null };
  children: (
    items: DragItem[],
  ) => JSX.Element | { element: JSX.Element; x?: number; y?: number } | null | undefined;
}

export function DragPreview(props: DragPreviewProps): JSX.Element {
  const hasDom = typeof HTMLElement !== "undefined";
  const isElementNode = (value: unknown): value is HTMLElement => {
    if (!value) return false;
    if (hasDom && value instanceof HTMLElement) return true;
    return typeof value === "object" && (value as { nodeType?: number }).nodeType === 1;
  };

  if (props.ref) {
    const renderer: DragPreviewRenderer = (items, callback) => {
      const rendered = props.children(items);
      if (!rendered) {
        callback(null);
        return;
      }
      if (typeof rendered === "object" && rendered !== null && "element" in rendered) {
        const previewValue = rendered as { element: unknown; x?: number; y?: number };
        callback(
          isElementNode(previewValue.element) ? previewValue.element : null,
          previewValue.x,
          previewValue.y,
        );
        return;
      }
      callback(isElementNode(rendered) ? rendered : null);
    };

    props.ref.current = renderer;
    onCleanup(() => {
      if (props.ref?.current === renderer) {
        props.ref.current = null;
      }
    });
  }

  return null as unknown as JSX.Element;
}
