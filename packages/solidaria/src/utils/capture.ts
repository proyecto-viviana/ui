/**
 * Capture-phase DOM listeners for Solid 2.
 *
 * Solid 2 has no `oncapture:` / `onClickCapture` JSX. Bind capture with
 * `addEventListener(type, handler, true)` from a ref or a ref accessor.
 */

import { createEffect } from "solid-js";
import type { Accessor } from "solid-js";

export type CaptureListeners = Record<
  string,
  EventListenerOrEventListenerObject | undefined | null
>;

export function attachCaptureListeners(el: EventTarget, listeners: CaptureListeners): () => void {
  const attached: [string, EventListenerOrEventListenerObject][] = [];
  for (const [type, handler] of Object.entries(listeners)) {
    if (!handler) continue;
    el.addEventListener(type, handler, true);
    attached.push([type, handler]);
  }
  return () => {
    for (const [type, handler] of attached) {
      el.removeEventListener(type, handler, true);
    }
  };
}

/** Ref callback that binds capture-phase listeners. */
export function captureRef(listeners: CaptureListeners): (el: EventTarget) => void {
  let detach: (() => void) | undefined;
  return (el) => {
    detach?.();
    detach = attachCaptureListeners(el, listeners);
  };
}

/** Bind capture listeners to a hook-owned element accessor. */
export function bindCapture(
  el: Accessor<EventTarget | null | undefined>,
  listeners: CaptureListeners,
): void {
  createEffect(
    () => el(),
    (node) => {
      if (!node) return;
      return attachCaptureListeners(node, listeners);
    },
  );
}
