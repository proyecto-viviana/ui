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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/interactions/useContextMenu.ts

/**
 * Handles context-menu events across mouse, touch, keyboard, and screen readers.
 * Based on @react-aria/interactions useContextMenu.
 */

import type { JSX } from "solid-js";
import { createLongPress } from "./createLongPress";
import { isIOS, isMac, mergeProps } from "../utils";

export interface ContextMenuEvent {
  /** Element that received the context-menu request. */
  target: Element;
  /** Horizontal position relative to the target. */
  x: number;
  /** Vertical position relative to the target. */
  y: number;
}

export interface ContextMenuProps {
  /** Called when the user requests a context menu. */
  onContextMenu?: (event: ContextMenuEvent) => void;
}

export interface ContextMenuAria {
  /** Props for the target element. */
  contextMenuProps: JSX.HTMLAttributes<HTMLElement>;
}

/** Handles native and emulated context-menu requests. */
export function createContextMenu(props: ContextMenuProps): ContextMenuAria {
  let firedContextMenuEvent = false;

  const { longPressProps } = createLongPress({
    onLongPressStart() {
      firedContextMenuEvent = false;
    },
    onLongPress(event) {
      if (!firedContextMenuEvent) {
        props.onContextMenu?.({
          target: event.target,
          x: event.x,
          y: event.y,
        });
      } else {
        firedContextMenuEvent = false;
      }
    },
  });

  if (!props.onContextMenu) {
    return { contextMenuProps: {} };
  }

  const contextMenuProps: JSX.HTMLAttributes<HTMLElement> = {
    onContextMenu(event) {
      event.stopPropagation();
      event.preventDefault();
      firedContextMenuEvent = true;

      const rect = event.currentTarget.getBoundingClientRect();
      props.onContextMenu?.({
        target: event.currentTarget,
        x: event.clientX - rect.x,
        y: event.clientY - rect.y,
      });
    },
    onKeyDown(event) {
      if (!isMac() || !event.ctrlKey || event.key !== "Enter") {
        return;
      }

      firedContextMenuEvent = false;
      const target = event.currentTarget;
      event.stopPropagation();

      setTimeout(() => {
        if (!firedContextMenuEvent) {
          const rect = target.getBoundingClientRect();
          props.onContextMenu?.({
            target,
            x: rect.width / 2,
            y: rect.height / 2,
          });
        } else {
          firedContextMenuEvent = false;
        }
      }, 10);
    },
  };

  return {
    contextMenuProps: mergeProps(isIOS() ? longPressProps : {}, contextMenuProps),
  };
}
