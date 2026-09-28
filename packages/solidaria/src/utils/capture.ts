/**
 * Capture-phase DOM listeners for Solid 2.
 *
 * Solid 2 has no `oncapture:` / `onClickCapture` JSX. Bind capture with
 * `addEventListener(type, handler, true)` from a ref or a ref accessor.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";
import { isServer } from "@solidjs/web";
import { onOwnedCleanup } from "./owner";

export type CaptureListeners = Record<
  string,
  EventListenerOrEventListenerObject | undefined | null
>;

export function attachCaptureListeners(
  el: EventTarget | null | undefined,
  listeners: CaptureListeners,
): () => void {
  if (isServer || !el || typeof (el as EventTarget).addEventListener !== "function") {
    return () => {};
  }
  const target = el as EventTarget;
  const attached: [string, EventListenerOrEventListenerObject][] = [];
  for (const [type, handler] of Object.entries(listeners)) {
    if (!handler) continue;
    target.addEventListener(type, handler, true);
    attached.push([type, handler]);
  }
  return () => {
    for (const [type, handler] of attached) {
      target.removeEventListener(type, handler, true);
    }
  };
}

/** Ref callback that binds capture-phase listeners. */
export function captureRef(
  listeners: CaptureListeners,
): (el: EventTarget | null | undefined) => void {
  if (isServer) return () => {};
  let detach: (() => void) | undefined;
  onOwnedCleanup(() => detach?.());
  return (el) => {
    detach?.();
    if (el) {
      detach = attachCaptureListeners(el, listeners);
    }
  };
}

/** Bind capture listeners to a hook-owned element accessor. */
export function bindCapture(
  el: Accessor<EventTarget | null | undefined>,
  listeners: CaptureListeners,
): void {
  // createEffect takes a hydration slot. Create it while rendering on the
  // server so later ids in this owner match the client.
  createEffect(
    () => el(),
    (node) => {
      if (isServer || !node) return;
      return attachCaptureListeners(node, listeners);
    },
  );
}
