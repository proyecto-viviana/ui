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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/animation.ts

/**
 * Enter/exit animation primitives for Solidaria.
 *
 * A faithful SolidJS port of `react-aria`'s `useEnterAnimation` /
 * `useExitAnimation` (react-aria/src/utils/animation.ts). These drive the
 * `data-entering` / `data-exiting` render-prop flags that overlay styles key
 * their motion tokens off of (opacity/translate transitions on Modal, Popover,
 * Tooltip, …). Without them a styled overlay ships the tokens but never flips
 * the state that triggers the transition, so it appears/disappears instantly.
 *
 * Two mechanisms are covered, exactly as upstream:
 *   1. CSS `@keyframes` — the `animation` property is present while entering and
 *      removed when the animation finishes.
 *   2. CSS transitions — the initial styles apply while entering and are removed
 *      immediately, so the transition plays. Premature transitions triggered
 *      before the ready state (e.g. a popover positioned after mount) are
 *      cancelled so only the intended enter transition runs.
 *
 * SolidJS notes:
 * - Refs are passed as accessors (`() => element`) rather than React ref
 *   objects, so a signal-backed ref re-runs the effect when the element mounts.
 * - `isReady` gates the enter animation. In React the caller unmounts the
 *   overlay while closed, so the hook re-initializes per open; a Solid component
 *   often stays mounted with its overlay behind a `<Show>`, so pass
 *   `isReady={isOpen}` to defer the enter until the element actually mounts.
 * - `createEffect` replaces `useLayoutEffect`; effects never run during SSR, so
 *   the `CSSTransition` reference is only touched on the client.
 */

import { createEffect, createMemo, createSignal } from "solid-js";
import type { Accessor } from "solid-js";

/** A reactive accessor for the animated element (null until mounted). */
export type ElementAccessor = () => Element | null | undefined;

/**
 * Runs `onEnd` once the element's animations settle while `isActive` is true.
 * Mirrors the private `useAnimation` helper in react-aria's animation utils.
 *
 */
function createAnimation(
  ref: ElementAccessor,
  isActive: Accessor<boolean>,
  onEnd: () => void,
): void {
  // Split createEffect so `onEnd` (signal writes) runs in apply. A tracked
  // effect is an owned scope and rejects those writes even with ownedWrite.
  // Compute returns the element identity so apply does not re-run (and cancel
  // an in-flight `finished` waiter) unless the node or active gate changes.
  createEffect(
    () => {
      if (!isActive()) return null;
      return ref() ?? null;
    },
    (element) => {
      if (!element) return;

      if (!("getAnimations" in element)) {
        // JSDOM and other environments without the Web Animations API.
        onEnd();
        return;
      }

      // The pinned helper completes immediately when no animations exist and
      // directly after their finished promises settle. Cleanup cancels only
      // the outstanding promise callback, without adding a frame delay.
      let canceled = false;

      const animations = element.getAnimations();
      if (animations.length === 0) {
        onEnd();
      } else {
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (!canceled) onEnd();
        });
      }

      return () => {
        canceled = true;
      };
    },
  );
}

/**
 * Tracks whether an element is playing its enter animation.
 *
 * Returns an accessor that is `true` while the element should carry
 * `data-entering` (its initial, pre-transition styles), then flips to `false`
 * once the animation is set up — which removes the initial styles and lets the
 * CSS transition play.
 *
 * @param ref - Accessor for the animated element.
 * @param isReady - Whether the element is ready to animate in. Defaults to
 *   `true`. Pass an `isOpen` accessor when the component stays mounted while the
 *   overlay is hidden, so the enter state does not resolve before the element
 *   mounts.
 */
export function createEnterAnimation(
  ref: ElementAccessor,
  isReady: Accessor<boolean> = () => true,
): Accessor<boolean> {
  const [isEntering, setIsEntering] = createSignal(true, { ownedWrite: true });
  const isAnimationReady = () => isEntering() && isReady();

  // Cancel any transitions triggered before the ready state (case 2 above), so
  // only the intended enter transition — the one that starts when the initial
  // styles are removed — runs.
  createEffect(
    () => {
      if (!isAnimationReady()) return null;
      return ref() ?? null;
    },
    (element) => {
      if (!element || !("getAnimations" in element)) return;
      for (const animation of element.getAnimations()) {
        if (animation instanceof CSSTransition) {
          animation.cancel();
        }
      }
    },
  );

  createAnimation(ref, isAnimationReady, () => setIsEntering(false));

  return isAnimationReady;
}

/**
 * Tracks whether an element is playing its exit animation.
 *
 * Keeps the caller informed so the element can stay mounted (`isOpen ||
 * isExiting`) until its exit transition finishes. Implements the same
 * `'closed' | 'open' | 'exiting'` state machine as react-aria's
 * `useExitAnimation`, including interruption: reopening mid-exit returns to the
 * open state.
 *
 * @param ref - Accessor for the animated element.
 * @param isOpen - Whether the element is currently open.
 */
export function createExitAnimation(
  ref: ElementAccessor,
  isOpen: Accessor<boolean>,
): Accessor<boolean> {
  // The state machine's synchronous edges (open→exiting on close, →open on
  // reopen) are computed in a `createMemo`, NOT a `createEffect`. This is the
  // Solid equivalent of react-aria's `setState`-*during-render*: because the
  // memo is a dependency of the caller's mount gate (`isOpen() || isExiting()`),
  // Solid recomputes it *before* the gate in the same synchronous propagation
  // that flips `isOpen`. A `createEffect` runs in the later effects phase, so
  // the gate would first observe `!isOpen && !isExiting` and unmount the
  // overlay, then the effect would flip `exiting` true and remount it from
  // scratch — recreating the whole subtree (Dialog section, focus scope) and
  // firing a spurious focus bounce mid-gesture. The memo closes that window so
  // the overlay stays mounted continuously through the exit, matching React's
  // single-commit `isOpen || isExiting`.
  //
  // Only the *async* edge (exiting→closed, when the animation settles) stays
  // event-driven: `createAnimation` bumps `exitFinished`, and the memo
  // acknowledges the new value via `ackedFinish` carried in its own previous
  // result — a pure epoch/ack so the memo never mutates external state.
  type ExitState = "closed" | "open" | "exiting";
  const [exitFinished, setExitFinished] = createSignal(0, { ownedWrite: true });

  // Solid 2 createMemo no longer takes an initial value as the second argument
  // (that slot is options). First compute receives `prev === undefined`.
  const exitState = createMemo<{ state: ExitState; ackedFinish: number }>(
    (prev = { state: "closed", ackedFinish: 0 }) => {
      const open = isOpen();
      const finish = exitFinished();
      if (open) return { state: "open", ackedFinish: finish };
      // Open element requested to close: begin exiting.
      if (prev.state === "open") return { state: "exiting", ackedFinish: finish };
      // Mid-exit: settle to closed only once the animation reports a new finish.
      if (prev.state === "exiting") {
        if (finish !== prev.ackedFinish) return { state: "closed", ackedFinish: finish };
        return prev;
      }
      return { state: "closed", ackedFinish: finish };
    },
  );

  const isExiting = () => exitState().state === "exiting";

  // Keep the state machine eagerly subscribed. The caller's mount gate
  // `isOpen() || isExiting()` short-circuits on `isOpen()` while open and never
  // reads `isExiting`, so this lazy memo would go unobserved for the whole open
  // lifetime — never advancing to "open". Then on close it would recompute once,
  // straight from its stale initial "closed" back to "closed" (the "open→exiting"
  // edge never taken), collapsing the exit: `combinedExiting` stays false, the
  // caller's `<Show>` sees the gate go falsy, and the overlay Portal unmounts
  // synchronously mid-gesture (blurring the focused dialog to <body> before the
  // triggering key's `keyup`). An eager reader forces the memo to track `isOpen`
  // continuously so `prev.state === "open"` holds when the close edge runs —
  // mirroring React, whose component re-renders and re-derives this every commit.
  createEffect(
    () => exitState(),
    () => {},
  );

  createAnimation(ref, isExiting, () => {
    setExitFinished((n) => n + 1);
  });

  return isExiting;
}
