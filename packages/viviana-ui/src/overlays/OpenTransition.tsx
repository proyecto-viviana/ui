import {
  type JSX,
  createSignal,
  createEffect,
  on,
  onCleanup,
  Show,
  children as resolveChildren,
} from "solid-js";

export interface OpenTransitionProps {
  /** Whether the content is open/visible. */
  open: boolean;
  /** The content to apply transitions to. */
  children: JSX.Element;
  /** CSS classes for the start of the enter transition. */
  enterFrom?: string;
  /** CSS classes for the end of the enter transition. */
  enterTo?: string;
  /** CSS classes for the start of the exit transition. */
  exitFrom?: string;
  /** CSS classes for the end of the exit transition. */
  exitTo?: string;
  /** Transition duration in ms. @default 200 */
  duration?: number;
  /** Callback when exit transition completes (useful for overlay unmounting). */
  onExited?: () => void;
  /** Additional CSS class always applied. */
  class?: string;
}

/**
 * A transition utility that applies CSS classes for enter/exit animations.
 */
export function OpenTransition(props: OpenTransitionProps): JSX.Element {
  const duration = () => props.duration ?? 200;
  const [mounted, setMounted] = createSignal(props.open);
  const [transitionClasses, setTransitionClasses] = createSignal("");

  createEffect(
    on(
      () => props.open,
      (isOpen) => {
        if (isOpen) {
          setMounted(true);
          setTransitionClasses(props.enterFrom ?? "");

          // Double RAF lets the browser commit the start class before the end class.
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTransitionClasses(props.enterTo ?? "");
            });
          });
        } else {
          setTransitionClasses(props.exitFrom ?? "");

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setTransitionClasses(props.exitTo ?? "");
            });
          });

          const timer = setTimeout(() => {
            setMounted(false);
            props.onExited?.();
          }, duration());

          onCleanup(() => clearTimeout(timer));
        }
      },
    ),
  );

  const resolved = resolveChildren(() => props.children);

  return (
    <Show when={mounted()}>
      <div
        class={`${props.class ?? ""} ${transitionClasses()}`}
        style={{ "transition-duration": `${duration()}ms` }}
        data-open={props.open || undefined}
      >
        {resolved()}
      </div>
    </Show>
  );
}
