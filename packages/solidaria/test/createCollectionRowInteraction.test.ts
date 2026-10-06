/**
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

import { describe, it, expect, vi } from "vite-plus/test";
import { mergeCollectionRowInteractionProps } from "../src/selection/createCollectionRowInteraction";

describe("createCollectionRowInteraction", () => {
  it("does not ignore row event when a child handler replaces the target mid-bubble", () => {
    const row = document.createElement("div");
    const cell1 = document.createElement("div");
    const button1 = document.createElement("button");
    const cell2 = document.createElement("div");
    const button2 = document.createElement("button");
    cell1.appendChild(button1);
    cell2.appendChild(button2);
    row.appendChild(cell1);
    row.appendChild(cell2);
    document.body.appendChild(row);

    button1.focus();

    const baseOnKeyDownCapture = vi.fn();
    const merged = mergeCollectionRowInteractionProps(
      { onKeyDownCapture: baseOnKeyDownCapture },
      {
        ref: () => row,
        keyboardNavigationBehavior: () => "arrow",
        direction: () => "ltr",
      },
    );

    const detachedSpan = document.createElement("span");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperty(event, "currentTarget", { value: row, writable: false });
    Object.defineProperty(event, "target", { value: detachedSpan, writable: false });
    Object.defineProperty(event, "composedPath", {
      value: () => [detachedSpan, button1, cell1, row, document.body],
      writable: false,
    });

    merged.onKeyDownCapture?.(event);

    // Because the event path contains the row and currentTarget, it is NOT ignored.
    // Arrow navigation handles the keydown, moving focus to button2 and preventing default.
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(button2);

    row.remove();
  });
});
