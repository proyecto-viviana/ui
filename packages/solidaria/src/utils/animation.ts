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

import {
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Accessor,
} from "solid-js";

/** A reactive accessor for the animated element (null until mounted). */
export type ElementAccessor = () => Element | null | undefined;

/**
 * Runs `onEnd` once the element's animations settle while `isActive` is true.
 * Mirrors the private `useAnimation` helper in react-aria's animation utils.
 *
 * `deferNoAnimation` mirrors React's timing for the no-animation case. Upstream
 * runs `onEnd` inside a `useLayoutEffect`, so an animation-less exit unmounts
 * *after* React commits — i.e. after the triggering input event finishes
 * dispatching (empirically, an Escape's teardown lands after `keyup`, not
 * between `keydown` and `keyup`). A Solid `createEffect` runs synchronously
 * inside the handler, so an animation-less exit would tear the overlay out
 * mid-gesture, firing `focusout` before `keyup` and retargeting `keyup` to the
 * body. Deferring `onEnd` to the next frame — the same primitive `FocusScope`
 * uses to defer focus restore — reproduces React's post-commit ordering. Only
 * the real-browser no-animation branch defers; the JSDOM branch stays
 * synchronous so unit tests that assert immediate unmount are unaffected.
 */
function createAnimation(
  ref: ElementAccessor,
  isActive: Accessor<boolean>,
  onEnd: () => void,
  deferNoAnimation = false,
): void {
  createEffect(() => {
    if (!isActive()) return;
    const element = ref();
    if (!element) return;

    if (!("getAnimations" in element)) {
      // JSDOM and other environments without the Web Animations API.
      onEnd();
      return;
    }

    // `settle` mirrors React's post-commit `useLayoutEffect` timing (see the
    // `deferNoAnimation` note above): a Solid effect runs synchronously inside
    // the triggering input handler, and even the Web-Animations `finished`
    // promise resolves in a microtask that drains *before* the gesture's later
    // events (e.g. an Escape's `keyup`). Deferring the settle to the next frame
    // pushes the overlay teardown past the rest of the current event dispatch,
    // reproducing React's ordering (teardown after `keyup`, not between
    // `keydown` and `keyup`). A real, non-trivial exit transition already
    // finishes long after the gesture, so the extra frame is imperceptible; it
    // only matters for the instant/near-zero-duration exits that would
    // otherwise tear the focused overlay out mid-gesture. Unit environments
    // (no `requestAnimationFrame`, or the no-defer callers) settle synchronously.
    //
    // A single owner-bound `onCleanup` tracks both the pending frame and a
    // `canceled` flag — the flag guards the promise path, whose `.then` runs
    // outside the reactive owner where `onCleanup` could not register.
    let canceled = false;
    let frame: number | undefined;
    const settle = () => {
      if (canceled) return;
      if (deferNoAnimation && typeof requestAnimationFrame === "function") {
        frame = requestAnimationFrame(() => {
          if (!canceled) onEnd();
        });
      } else {
        onEnd();
      }
    };

    const animations = element.getAnimations();
    if (animations.length === 0) {
      settle();
    } else {
      Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
        settle();
      });
    }

    onCleanup(() => {
      canceled = true;
      if (frame !== undefined && typeof cancelAnimationFrame === "function") {
        cancelAnimationFrame(frame);
      }
    });
  });
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
  const [isEntering, setIsEntering] = createSignal(true);
  const isAnimationReady = () => isEntering() && isReady();

  // Cancel any transitions triggered before the ready state (case 2 above), so
  // only the intended enter transition — the one that starts when the initial
  // styles are removed — runs.
  createEffect(() => {
    if (!isAnimationReady()) return;
    const element = ref();
    if (!element || !("getAnimations" in element)) return;
    for (const animation of element.getAnimations()) {
      if (animation instanceof CSSTransition) {
        animation.cancel();
      }
    }
  });

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
  const [exitFinished, setExitFinished] = createSignal(0);

  const exitState = createMemo<{ state: ExitState; ackedFinish: number }>(
    (prev) => {
      const open = isOpen();
      const finish = exitFinished();
      const compute = (): { state: ExitState; ackedFinish: number } => {
        if (open) return { state: "open", ackedFinish: finish };
        // Open element requested to close: begin exiting.
        if (prev.state === "open") return { state: "exiting", ackedFinish: finish };
        // Mid-exit: settle to closed only once the animation reports a new finish.
        if (prev.state === "exiting") {
          if (finish !== prev.ackedFinish) return { state: "closed", ackedFinish: finish };
          return prev;
        }
        return { state: "closed", ackedFinish: finish };
      };
      return compute();
    },
    { state: isOpen() ? "open" : "closed", ackedFinish: 0 },
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
  createComputed(() => void exitState());

  createAnimation(
    ref,
    isExiting,
    () => {
      setExitFinished((n) => n + 1);
    },
    true,
  );

  return isExiting;
}
