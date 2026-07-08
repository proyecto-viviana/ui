/**
 * SharedElementTransition primitives for solidaria-components.
 *
 * Provides FLIP-based shared element animations when elements move between
 * parents within a scope. Captures geometry snapshots on unmount and applies
 * transition animations on mount.
 *
 * Parity target: react-aria-components/src/SharedElementTransition.tsx
 */

import {
  type JSX,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
  untrack,
  useContext,
  Show,
  on,
} from "solid-js";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type RenderChildren,
  useRenderProps,
  filterDOMProps,
} from "./utils";

type SharedElementLifecycle = "hidden" | "entering" | "visible" | "exiting";

/** Safe wrapper — jsdom doesn't implement the Web Animations API. */
function getAnimations(el: HTMLElement): Animation[] {
  return typeof el.getAnimations === "function" ? el.getAnimations() : [];
}

interface Snapshot {
  rect: DOMRect;
  style: [string, string][];
}

interface SharedElementScope {
  snapshots: { [name: string]: Snapshot };
}

const SharedElementContext = createContext<SharedElementScope | null>(null);

export function useHasSharedElementTransitionScope(): boolean {
  return useContext(SharedElementContext) != null;
}

export interface SharedElementTransitionProps {
  children?: JSX.Element;
}

/**
 * A scope for SharedElements, which animate between parents.
 */
export function SharedElementTransition(props: SharedElementTransitionProps): JSX.Element {
  const scope: SharedElementScope = {
    snapshots: {},
  };

  return (
    <SharedElementContext.Provider value={scope}>{props.children}</SharedElementContext.Provider>
  );
}

export interface SharedElementRenderProps {
  isEntering: boolean;
  isExiting: boolean;
}

export interface SharedElementPropsBase extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "ref"
> {
  children?: RenderChildren<SharedElementRenderProps>;
  class?: ClassNameOrFunction<SharedElementRenderProps>;
  style?: StyleOrFunction<SharedElementRenderProps>;
}

export interface SharedElementProps extends SharedElementPropsBase {
  name: string;
  isVisible?: boolean;
  ref?: ((el: HTMLDivElement) => void) | { current?: HTMLDivElement };
}

/**
 * An element that animates between its old and new position when moving
 * between parents within a SharedElementTransition scope.
 */
export function SharedElement(props: SharedElementProps): JSX.Element | null {
  const scope = useContext(SharedElementContext);
  if (!scope) {
    throw new Error("<SharedElement> must be rendered inside a <SharedElementTransition>");
  }

  const [local, domProps] = splitProps(props, [
    "name",
    "isVisible",
    "children",
    "class",
    "style",
    "ref",
  ]);

  const [lifecycle, setLifecycle] = createSignal<SharedElementLifecycle>(
    local.isVisible === false ? "hidden" : "visible",
  );

  // The mounted div, tracked as a signal so the FLIP-read effect below REACTS to
  // it appearing. React guarantees `ref.current` is committed before the layout
  // effect body runs; Solid gives no such ordering between the `<Show>`'s
  // insertion render-effect and a plain createEffect, so we make the read depend
  // on the element instead of racing its mount (see READ PHASE).
  const [element, setElement] = createSignal<HTMLDivElement | undefined>();
  let frame: number | undefined;

  const setRef = (el: HTMLDivElement) => {
    setElement(el);
    // Forward ref to consumer
    const userRef = local.ref;
    if (typeof userRef === "function") {
      userRef(el);
    } else if (userRef !== undefined) {
      userRef.current = el;
    }
  };

  // Store a geometry + transition-style snapshot of the currently-mounted
  // element, so a sibling SharedElement with the same `name` can FLIP from it.
  // Mirrors upstream's layout-effect *cleanup*
  // (react-aria-components/src/SharedElementTransition.tsx), which runs for
  // every `isVisible` flip — not only on unmount.
  const storeSnapshot = () => {
    const el = untrack(element);
    if (el && el.isConnected && !el.hasAttribute("data-exiting")) {
      // Store a snapshot of the rectangle and computed style for transitioning properties.
      const style = window.getComputedStyle(el);
      if (style.transitionProperty !== "none") {
        const transitionProperty = style.transitionProperty.split(/\s*,\s*/);
        scope.snapshots[local.name] = {
          rect: el.getBoundingClientRect(),
          style: transitionProperty.map((property) => [property, style.getPropertyValue(property)]),
        };
      }
    }
  };

  // MOUNT-IN-RENDER — mirrors upstream's render-phase
  // `if (isVisible && state === 'hidden') setState('visible')`. Promoting a
  // hidden element to visible in the render phase mounts its div (via the
  // `<Show>` below) BEFORE the FLIP-read createEffect runs, so the incoming
  // element is in the DOM to be measured and translated. Without this the
  // incoming element's ref is still null when the read effect fires and it can
  // only enter fresh — never FLIP. Keyed on `isVisible` (untracked lifecycle
  // read) so it cannot loop.
  createRenderEffect(
    on(
      () => local.isVisible !== false,
      (isVisible) => {
        if (isVisible && untrack(lifecycle) === "hidden") {
          setLifecycle("visible");
        }
      },
    ),
  );

  // STORE PHASE — a render effect runs before user effects within a Solid
  // batch, exactly as React runs all layout-effect destroys before any create.
  // The cleanup registered here fires on the *next* `isVisible` change (and on
  // disposal), capturing the outgoing snapshot BEFORE any sibling's FLIP-read
  // createEffect below runs — React's two-phase commit. Only the cleanup
  // registered while VISIBLE stores (an outgoing element); an incoming
  // element's prior cleanup was registered while hidden and must not clobber
  // the outgoing snapshot. This mirrors React closing over `element =
  // ref.current`, which is null while hidden.
  createRenderEffect(
    on(
      () => local.isVisible !== false,
      (isVisible) => {
        onCleanup(() => {
          if (isVisible) {
            storeSnapshot();
          }
        });
      },
    ),
  );

  // READ PHASE — mirrors upstream's layout-effect body, which reads the freshly
  // committed `ref.current`. Keying on the `element` signal (not just isVisible)
  // makes this run only once the incoming div is actually mounted: when isVisible
  // flips true the mount-in-render effect above mounts the div, `setRef` sets the
  // signal, and this effect runs with `el` present — never against a null ref.
  // (Solid batches, so an isVisible flip + the resulting mount coalesce into one
  // run with the mounted element.) There is therefore no "element not yet in DOM"
  // fresh-enter branch: with no committed div there is nothing to measure, so we
  // wait — exactly as React never runs the body before commit.
  createEffect(
    on(
      [() => local.isVisible !== false, element] as const,
      ([isVisible, el]) => {
        const name = local.name;

        if (frame != null) {
          cancelAnimationFrame(frame);
          frame = undefined;
        }

        if (isVisible && el) {
          const prevSnapshot = scope.snapshots[name];

          if (prevSnapshot) {
            // FLIP: Element is transitioning from a previous instance.
            setLifecycle("visible");
            const animations = getAnimations(el);

            // Set properties to animate from.
            const values = prevSnapshot.style.map(([property, prevValue]) => {
              const value = el.style.getPropertyValue(property);
              if (property === "translate") {
                const prevRect = prevSnapshot.rect;
                const currentRect = el.getBoundingClientRect();
                const deltaX = prevRect.left - currentRect.left;
                const deltaY = prevRect.top - currentRect.top;
                el.style.setProperty("translate", `${deltaX}px ${deltaY}px`);
              } else {
                el.style.setProperty(property, prevValue);
              }
              return [property, value] as [string, string];
            });

            // Cancel any new animations triggered by these properties.
            for (const a of getAnimations(el)) {
              if (!animations.includes(a)) {
                a.cancel();
              }
            }

            // Remove overrides after one frame to animate to the current values.
            frame = requestAnimationFrame(() => {
              frame = undefined;
              for (const [property, value] of values) {
                el.style.setProperty(property, value);
              }
            });

            delete scope.snapshots[name];
          } else {
            // No previous instance exists, apply the entering state.
            queueMicrotask(() => setLifecycle("entering"));
            frame = requestAnimationFrame(() => {
              frame = undefined;
              setLifecycle("visible");
            });
          }
        } else if (!isVisible && el) {
          // Wait a microtask to check if a snapshot still exists (meaning no new
          // SharedElement consumed it), then enter exiting state.
          queueMicrotask(() => {
            if (scope.snapshots[name]) {
              delete scope.snapshots[name];
              setLifecycle("exiting");
              // Wait for animations to finish before hiding.
              Promise.all(getAnimations(el).map((a) => a.finished))
                .then(() => setLifecycle("hidden"))
                .catch(() => {});
            } else {
              // Snapshot was consumed by another instance, unmount immediately.
              setLifecycle("hidden");
            }
          });
        }
      },
    ),
  );

  // Cancel any pending FLIP frame on disposal. The snapshot store lives in the
  // render-effect cleanup above, which also fires on disposal.
  onCleanup(() => {
    if (frame != null) {
      cancelAnimationFrame(frame);
    }
  });

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SharedElement",
    },
    () => ({
      isEntering: lifecycle() === "entering",
      isExiting: lifecycle() === "exiting",
    }),
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <Show when={lifecycle() !== "hidden"}>
      <div
        ref={setRef}
        {...filteredDomProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-entering={lifecycle() === "entering" || undefined}
        data-exiting={lifecycle() === "exiting" || undefined}
      >
        {renderProps.renderChildren()}
      </div>
    </Show>
  );
}
