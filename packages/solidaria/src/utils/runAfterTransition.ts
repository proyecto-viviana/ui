/**
 * Run a callback after in-flight CSS transitions end.
 * Port of @react-aria/utils runAfterTransition.
 *
 * Track properties per element rather than a count: Chrome can fire both
 * transitionend and transitioncancel for the same property.
 */

import { getEventTarget } from "./dom";

const transitionsByElement = new Map<EventTarget, Set<string>>();
const transitionCallbacks = new Set<() => void>();

function setupGlobalEvents() {
  if (typeof window === "undefined" || typeof document === "undefined" || !document.body) {
    return;
  }

  function isTransitionEvent(event: Event): event is TransitionEvent {
    return "propertyName" in event;
  }

  const onTransitionStart = (e: Event) => {
    const eventTarget = getEventTarget(e);
    if (!isTransitionEvent(e) || !eventTarget) {
      return;
    }

    let transitions = transitionsByElement.get(eventTarget);
    if (!transitions) {
      transitions = new Set();
      transitionsByElement.set(eventTarget, transitions);
      eventTarget.addEventListener("transitioncancel", onTransitionEnd, {
        once: true,
      });
    }

    transitions.add(e.propertyName);
  };

  const onTransitionEnd = (e: Event) => {
    const eventTarget = getEventTarget(e);
    if (!isTransitionEvent(e) || !eventTarget) {
      return;
    }

    const properties = transitionsByElement.get(eventTarget);
    if (!properties) {
      return;
    }

    properties.delete(e.propertyName);

    if (properties.size === 0) {
      eventTarget.removeEventListener("transitioncancel", onTransitionEnd);
      transitionsByElement.delete(eventTarget);
    }

    if (transitionsByElement.size === 0) {
      for (const cb of transitionCallbacks) {
        cb();
      }
      transitionCallbacks.clear();
    }
  };

  document.body.addEventListener("transitionrun", onTransitionStart);
  document.body.addEventListener("transitionend", onTransitionEnd);
}

if (typeof document !== "undefined") {
  if (document.readyState !== "loading") {
    setupGlobalEvents();
  } else {
    document.addEventListener("DOMContentLoaded", setupGlobalEvents);
  }
}

function cleanupDetachedElements() {
  for (const [eventTarget] of transitionsByElement) {
    if ("isConnected" in eventTarget && !eventTarget.isConnected) {
      transitionsByElement.delete(eventTarget);
    }
  }
}

export function runAfterTransition(fn: () => void): void {
  const win = typeof window !== "undefined" ? window : undefined;
  if (!win || typeof win.requestAnimationFrame !== "function") {
    fn();
    return;
  }

  // Wait one frame to see if an animation starts, e.g. a transition on mount.
  win.requestAnimationFrame(() => {
    cleanupDetachedElements();
    if (transitionsByElement.size === 0) {
      fn();
    } else {
      transitionCallbacks.add(fn);
    }
  });
}
