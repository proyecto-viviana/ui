/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Skeleton.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/SkeletonCollection.tsx

// Port of packages/@react-spectrum/s2/src/Skeleton.tsx.
// Port of packages/@react-spectrum/s2/src/SkeletonCollection.tsx.
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type Accessor,
  type JSX,
  useContext,
} from "solid-js";
import { createLeafComponent } from "@proyecto-viviana/solidaria-components";
import { css } from "../style/style-macro" with { type: "macro" };
import { skSweep } from "../style/motion" with { type: "macro" };
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { color } from "../style/spectrum-theme" with { type: "macro" };
import { mergeStyles } from "../style/runtime";

export type SkeletonContextValue = boolean | null | Accessor<boolean | null | undefined>;

export interface SkeletonProps {
  children: JSX.Element;
  isLoading: boolean;
}

export interface SkeletonCollectionProps {
  children: () => JSX.Element;
}

export const SkeletonContext = createContext<SkeletonContextValue>(null);

function readSkeletonContext(value: SkeletonContextValue): boolean | null | undefined {
  return typeof value === "function" ? value() : value;
}

export function createIsSkeleton(): Accessor<boolean> {
  const context = useContext(SkeletonContext);
  return () => readSkeletonContext(context) || false;
}

export function useIsSkeleton(): Accessor<boolean> {
  return createIsSkeleton();
}

/* The register's loading state is a "dither shimmer", not a grey gradient sweep:
 * a diagonal light band crossing the block, seen only through an 8px Bayer mask,
 * so it reads as pixels lighting up in the same grammar as the theme wipe. Port
 * of the handoff's `.sk` (glasselated.css). The sheen colour is a token because
 * it has to invert per scheme; the sweep is a CSS animation on the pseudo-element
 * (a pseudo cannot be reached by the Web Animations calls this module exposes),
 * gated by the reduced-motion media condition rather than a runtime check so a
 * server render and its hydration agree. */
export const loadingStyle = css(
  `
  position: relative;
  overflow: hidden;
  background: var(--surface-inset);
  * {
    visibility: hidden;
  }
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(100deg, transparent 34%, var(--sk-sheen) 50%, transparent 66%);
    background-size: 240% 100%;
    animation: ${skSweep()} 1.5s linear infinite;
    mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='8'%20height='8'%3E%3Cg%20fill='%23fff'%3E%3Crect%20width='4'%20height='4'/%3E%3Crect%20x='4'%20y='4'%20width='4'%20height='4'%20fill-opacity='0.85'/%3E%3Crect%20x='4'%20width='4'%20height='4'%20fill-opacity='0.35'/%3E%3Crect%20y='4'%20width='4'%20height='4'%20fill-opacity='0.55'/%3E%3C/g%3E%3C/svg%3E");
    mask-size: 8px 8px;
    mask-repeat: repeat;
  }
  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`,
  "L",
);

const skeletonTextStyles = style({
  color: "transparent",
  boxDecorationBreak: "clone",
  borderRadius: "sm",
});

const skeletonIconStyles = style({
  borderRadius: "sm",
});

type MaybeAccessor<T> = T | Accessor<T>;

function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" ? (value as Accessor<T>)() : value;
}

function createPrefersReducedMotion(): Accessor<boolean> {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => false;
  }

  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!mediaQuery) {
    return () => false;
  }

  const [matches, setMatches] = createSignal(mediaQuery.matches);
  const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

  mediaQuery.addEventListener?.("change", handleChange);
  onCleanup(() => mediaQuery.removeEventListener?.("change", handleChange));

  return matches;
}

/* Kept for the components that already hold this ref (Image, Icon) and for any
 * consumer animating its own gradient. The skeleton's own shimmer moved into
 * `loadingStyle`'s pseudo-element when the register re-valued it, and a pseudo
 * cannot be driven from here. */
export function useLoadingAnimation(
  isAnimating: MaybeAccessor<boolean>,
): (element: Element | null) => void {
  const reduceMotion = createPrefersReducedMotion();
  const [element, setElement] = createSignal<Element | null>(null);
  let animation: Animation | undefined;

  createEffect(() => {
    const target = element();
    const shouldAnimate = access(isAnimating) && !reduceMotion();

    if (target && shouldAnimate && !animation && typeof target.animate === "function") {
      animation = target.animate([{ backgroundPosition: "100%" }, { backgroundPosition: "0%" }], {
        duration: 2000,
        iterations: Infinity,
        easing: "ease-in-out",
      });
      animation.startTime = 0;
    } else if ((!target || !shouldAnimate) && animation) {
      animation.cancel();
      animation = undefined;
    }
  });

  onCleanup(() => {
    animation?.cancel();
    animation = undefined;
  });

  return setElement;
}

export function useInertAttribute(
  isInert: MaybeAccessor<boolean>,
): (element: Element | null) => void {
  const [element, setElement] = createSignal<Element | null>(null);

  createEffect(() => {
    const target = element();
    if (!target) {
      return;
    }

    if (access(isInert)) {
      target.setAttribute("inert", "true");
    } else {
      target.removeAttribute("inert");
    }
  });

  return setElement;
}

export function Skeleton(props: SkeletonProps): JSX.Element {
  const isLoading = createMemo(() => props.isLoading);

  return <SkeletonContext.Provider value={isLoading}>{props.children}</SkeletonContext.Provider>;
}

export function SkeletonText(props: { children: JSX.Element }): JSX.Element {
  const loadingAnimationRef = useLoadingAnimation(true);
  const inertRef = useInertAttribute(true);

  return (
    <span
      ref={(element) => {
        loadingAnimationRef(element);
        inertRef(element);
      }}
      class={`${loadingStyle} ${skeletonTextStyles}`}
    >
      {props.children}
    </span>
  );
}

export function useSkeletonText(
  children: Accessor<JSX.Element>,
  unsafeStyle: Accessor<JSX.CSSProperties | undefined>,
): [Accessor<JSX.Element>, Accessor<JSX.CSSProperties | undefined>] {
  const isSkeleton = createIsSkeleton();

  return [
    () => (isSkeleton() ? <SkeletonText>{children()}</SkeletonText> : children()),
    () =>
      isSkeleton()
        ? {
            ...unsafeStyle(),
            "-webkit-text-fill-color": "transparent",
          }
        : unsafeStyle(),
  ];
}

export function useSkeletonIcon(styles: MaybeAccessor<StyleString | undefined>): Accessor<string> {
  const isSkeleton = createIsSkeleton();
  return () =>
    mergeStyles(isSkeleton() ? skeletonIconStyles : undefined, access(styles) ?? undefined);
}

export function SkeletonWrapper(props: { children: JSX.Element }): JSX.Element {
  const context = useContext(SkeletonContext);
  const isLoading = () => readSkeletonContext(context);
  const animationRef = useLoadingAnimation(() => isLoading() || false);
  const inertRef = useInertAttribute(() => isLoading() || false);

  if (isLoading() == null) {
    return props.children;
  }

  return (
    <SkeletonContext.Provider value={null}>
      {isLoading() ? (
        <span
          ref={(element) => {
            animationRef(element);
            inertRef(element);
          }}
          class={loadingStyle}
        >
          {props.children}
        </span>
      ) : (
        props.children
      )}
    </SkeletonContext.Provider>
  );
}

const skeletonCollectionCache = new WeakMap<object, JSX.Element>();

export const SkeletonCollection = createLeafComponent<SkeletonCollectionProps>((props, node) => {
  const cacheKey = node ?? props;
  let cached = skeletonCollectionCache.get(cacheKey as object);

  if (!cached) {
    cached = <Skeleton isLoading>{props.children()}</Skeleton>;
    skeletonCollectionCache.set(cacheKey as object, cached);
  }

  return cached;
});
