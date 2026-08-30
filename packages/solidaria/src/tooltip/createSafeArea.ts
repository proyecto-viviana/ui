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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tooltip/useSafeArea.ts

/**
 * Tracks whether the pointer is within a "safe area" connecting a trigger and its overlay.
 */

import { createEffect, onCleanup } from "solid-js";
import { getOwnerDocument, getOwnerWindow } from "../utils";

interface Point {
  x: number;
  y: number;
}

export interface SafeAreaOptions {
  /** Ref for the trigger element. */
  triggerRef: () => Element | null;
  /** Ref for the overlay element. */
  overlayRef: () => Element | null;
  /** Whether the overlay is open. */
  isOpen: () => boolean;
  /** Whether this feature is disabled. */
  isDisabled?: () => boolean;
  /**
   * Called on pointer move (and when the pointer leaves the document) with whether the pointer is
   * currently within the "safe area".
   */
  onSafeAreaChange: (isInSafeArea: boolean) => void;
}

const PADDING = 8;

/**
 * Tracks whether the pointer is within a "safe area" connecting a trigger and its overlay.
 */
export function createSafeArea(options: SafeAreaOptions): void {
  createEffect(() => {
    const trigger = options.triggerRef();
    if (options.isDisabled?.() || !options.isOpen() || !trigger) {
      return;
    }

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        return;
      }
      const point = { x: e.clientX, y: e.clientY };
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = options.overlayRef()?.getBoundingClientRect();
      options.onSafeAreaChange(isPointInSafeArea(point, triggerRect, overlayRect));
    };

    const onPointerLeave = () => options.onSafeAreaChange(false);

    const win = getOwnerWindow(trigger);
    const doc = getOwnerDocument(trigger);
    win.addEventListener("pointermove", onPointerMove);
    doc.documentElement.addEventListener("pointerleave", onPointerLeave);
    onCleanup(() => {
      win.removeEventListener("pointermove", onPointerMove);
      doc.documentElement.removeEventListener("pointerleave", onPointerLeave);
    });
  });
}

function isPointInSafeArea(point: Point, triggerRect: DOMRect, overlayRect?: DOMRect): boolean {
  if (rectContains(triggerRect, point)) {
    return true;
  }
  if (!overlayRect) {
    return false;
  }
  if (rectContains(overlayRect, point)) {
    return true;
  }
  const hull = convexHull([...rectCorners(triggerRect), ...rectCorners(overlayRect)]);
  return hull.length >= 3 && isPointInPolygon(point, hull);
}

function rectContains(rect: DOMRect, point: Point): boolean {
  return (
    point.x >= rect.left - PADDING &&
    point.x <= rect.right + PADDING &&
    point.y >= rect.top - PADDING &&
    point.y <= rect.bottom + PADDING
  );
}

function rectCorners(rect: DOMRect): Point[] {
  const left = rect.left - PADDING;
  const right = rect.right + PADDING;
  const top = rect.top - PADDING;
  const bottom = rect.bottom + PADDING;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

function convexHull(points: Point[]): Point[] {
  const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3) {
    return sorted;
  }

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper: Point[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  const { x, y } = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) {
      inside = !inside;
    }
  }
  return inside;
}
