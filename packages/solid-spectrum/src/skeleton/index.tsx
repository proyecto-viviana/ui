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
import { css } from "../style/style-macro";
import { style, type StyleString } from "../style";
import { color } from "../style/spectrum-theme";
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

export const loadingStyle = css(
  `
  background-image: linear-gradient(to right, ${color("gray-100" as never)} 33%, light-dark(${color(
    "gray-25" as never,
  )}, ${color("gray-300" as never)}), ${color("gray-100" as never)} 66%);
  background-size: 300%;
  * {
    visibility: hidden;
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
