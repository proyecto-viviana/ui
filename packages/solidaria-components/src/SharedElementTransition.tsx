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
  createSignal,
  onCleanup,
  splitProps,
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

  let elementRef: HTMLDivElement | undefined;
  let frame: number | undefined;

  const setRef = (el: HTMLDivElement) => {
    elementRef = el;
    // Forward ref to consumer
    const userRef = local.ref;
    if (typeof userRef === "function") {
      userRef(el);
    } else if (userRef !== undefined) {
      userRef.current = el;
    }
  };

  // Handle visibility transitions with FLIP animation
  createEffect(
    on(
      () => local.isVisible !== false,
      (isVisible) => {
        const name = local.name;
        const element = elementRef;

        if (frame != null) {
          cancelAnimationFrame(frame);
          frame = undefined;
        }

        if (isVisible && element) {
          const prevSnapshot = scope.snapshots[name];

          if (prevSnapshot) {
            // FLIP: Element is transitioning from a previous instance.
            setLifecycle("visible");
            const animations = getAnimations(element);

            // Set properties to animate from.
            const values = prevSnapshot.style.map(([property, prevValue]) => {
              const value = element.style.getPropertyValue(property);
              if (property === "translate") {
                const prevRect = prevSnapshot.rect;
                const currentRect = element.getBoundingClientRect();
                const deltaX = prevRect.left - currentRect.left;
                const deltaY = prevRect.top - currentRect.top;
                element.style.setProperty("translate", `${deltaX}px ${deltaY}px`);
              } else {
                element.style.setProperty(property, prevValue);
              }
              return [property, value] as [string, string];
            });

            // Cancel any new animations triggered by these properties.
            for (const a of getAnimations(element)) {
              if (!animations.includes(a)) {
                a.cancel();
              }
            }

            // Remove overrides after one frame to animate to the current values.
            frame = requestAnimationFrame(() => {
              frame = undefined;
              for (const [property, value] of values) {
                element.style.setProperty(property, value);
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
        } else if (!isVisible && element) {
          // Wait a microtask to check if a snapshot still exists (meaning no new
          // SharedElement consumed it), then enter exiting state.
          queueMicrotask(() => {
            if (scope.snapshots[name]) {
              delete scope.snapshots[name];
              setLifecycle("exiting");
              // Wait for animations to finish before hiding.
              Promise.all(getAnimations(element).map((a) => a.finished))
                .then(() => setLifecycle("hidden"))
                .catch(() => {});
            } else {
              // Snapshot was consumed by another instance, unmount immediately.
              setLifecycle("hidden");
            }
          });
        } else if (isVisible) {
          // Element not yet in DOM, entering fresh
          setLifecycle("entering");
          frame = requestAnimationFrame(() => {
            frame = undefined;
            setLifecycle("visible");
          });
        }
      },
    ),
  );

  // Capture snapshot on cleanup (unmount)
  onCleanup(() => {
    if (frame != null) {
      cancelAnimationFrame(frame);
    }

    const element = elementRef;
    if (element && element.isConnected && !element.hasAttribute("data-exiting")) {
      // Store a snapshot of the rectangle and computed style for transitioning properties.
      const style = window.getComputedStyle(element);
      if (style.transitionProperty !== "none") {
        const transitionProperty = style.transitionProperty.split(/\s*,\s*/);
        scope.snapshots[local.name] = {
          rect: element.getBoundingClientRect(),
          style: transitionProperty.map((property) => [property, style.getPropertyValue(property)]),
        };
      }
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
