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

import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

/** A reactive accessor for the animated element (null until mounted). */
export type ElementAccessor = () => Element | null | undefined;

/**
 * Runs `onEnd` once the element's animations settle while `isActive` is true.
 * Mirrors the private `useAnimation` helper in react-aria's animation utils.
 */
function createAnimation(
  ref: ElementAccessor,
  isActive: Accessor<boolean>,
  onEnd: () => void,
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

    const animations = element.getAnimations();
    if (animations.length === 0) {
      onEnd();
      return;
    }

    let canceled = false;
    Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!canceled) onEnd();
    });

    onCleanup(() => {
      canceled = true;
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
  const [exitState, setExitState] = createSignal<"closed" | "open" | "exiting">(
    isOpen() ? "open" : "closed",
  );

  createEffect(() => {
    const open = isOpen();
    setExitState((current) => {
      // Open element requested to close: begin exiting.
      if (current === "open" && !open) return "exiting";
      // Closed or mid-exit element requested to open: the animation was
      // interrupted (or it is a fresh open), so return to the open state.
      if ((current === "closed" || current === "exiting") && open) return "open";
      return current;
    });
  });

  const isExiting = () => exitState() === "exiting";

  createAnimation(ref, isExiting, () => {
    setExitState((state) => (state === "exiting" ? "closed" : state));
  });

  return isExiting;
}
