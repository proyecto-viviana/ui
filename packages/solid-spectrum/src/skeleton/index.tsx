import type { JSX } from "solid-js";
import { Show, For, createContext, useContext } from "solid-js";

export type SkeletonShape = "text" | "circle" | "rectangle";
export type SkeletonSize = "sm" | "md" | "lg";
export type SkeletonGap = "sm" | "md" | "lg";

export interface SkeletonProps {
  /** Shape variant */
  shape?: SkeletonShape;
  /** Size variant */
  size?: SkeletonSize;
  /** Custom width */
  width?: string | number;
  /** Custom height */
  height?: string | number;
  /** Whether the skeleton is in loading state (default: true) */
  isLoading?: boolean;
  /** Children to show when not loading */
  children?: JSX.Element;
  /** Additional CSS classes */
  class?: string;
}

export interface SkeletonCollectionProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Skeleton props applied to each item */
  itemProps?: Omit<SkeletonProps, "children" | "isLoading">;
  /** Gap between items */
  gap?: SkeletonGap;
  /** Additional CSS classes */
  class?: string;
}

export const SkeletonContext = createContext<boolean | null>(null);

export function useIsSkeleton(): boolean {
  return useContext(SkeletonContext) || false;
}

const sizeHeight: Record<SkeletonSize, string> = {
  sm: "h-4",
  md: "h-6",
  lg: "h-8",
};

const shapeClasses: Record<SkeletonShape, string> = {
  text: "rounded-md",
  circle: "rounded-full",
  rectangle: "rounded-none",
};

const gapClasses: Record<SkeletonGap, string> = {
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
};

/**
 * Inline style for the shimmer gradient + animation.
 * Uses CSS custom properties so theme colors can be adjusted.
 * `prefers-reduced-motion: reduce` is handled via the
 * `motion-reduce:animate-none` Tailwind utility.
 */
const shimmerStyle: JSX.CSSProperties = {
  "background-image":
    "linear-gradient(to right, var(--skeleton-base, oklch(0.85 0 0 / 0.15)) 33%, var(--skeleton-shimmer, oklch(0.92 0 0 / 0.25)) 50%, var(--skeleton-base, oklch(0.85 0 0 / 0.15)) 66%)",
  "background-size": "300% 100%",
  animation: "skeleton-shimmer 2s ease-in-out infinite",
};

/**
 * Global keyframes injected once. We use a <style> tag so the
 * animation works without requiring any external CSS file.
 */
let keyframesInjected = false;

function injectKeyframes() {
  if (keyframesInjected) return;
  if (typeof document === "undefined") return;
  keyframesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
@keyframes skeleton-shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-shimmer { animation: none !important; }
}
`;
  document.head.appendChild(style);
}

function toPx(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton(props: SkeletonProps) {
  const isLoading = () => props.isLoading ?? true;
  const shape = () => props.shape ?? "text";
  const size = () => props.size ?? "md";

  injectKeyframes();

  const dimensionStyle = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {};
    if (props.width != null) s.width = toPx(props.width);
    if (props.height != null) s.height = toPx(props.height);
    // For circle, make width match height when only size is provided
    if (shape() === "circle" && props.width == null && props.height == null) {
      const px = size() === "sm" ? "1rem" : size() === "md" ? "1.5rem" : "2rem";
      s.width = px;
      s.height = px;
    }
    return s;
  };

  return (
    <Show when={isLoading()} fallback={props.children}>
      <div
        role="status"
        aria-busy="true"
        aria-hidden="true"
        class={`skeleton-shimmer bg-bg-300 ${shapeClasses[shape()]} ${
          shape() !== "circle" ? `${sizeHeight[size()]} w-full` : ""
        } motion-reduce:animate-none ${props.class ?? ""}`}
        style={{ ...shimmerStyle, ...dimensionStyle() }}
      />
    </Show>
  );
}

export function SkeletonCollection(props: SkeletonCollectionProps) {
  const count = () => props.count ?? 3;
  const gap = () => props.gap ?? "md";

  const items = () => Array.from({ length: count() }, (_, i) => i);

  return (
    <div class={`flex flex-col ${gapClasses[gap()]} ${props.class ?? ""}`}>
      <For each={items()}>{() => <Skeleton isLoading {...(props.itemProps ?? {})} />}</For>
    </div>
  );
}
