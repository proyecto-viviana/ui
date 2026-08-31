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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/visually-hidden/VisuallyHidden.tsx

/**
 * createVisuallyHidden hook for solidaria
 *
 * Provides styles and props to visually hide content while keeping it
 * accessible to screen readers.
 *
 * Ported from packages/react-aria/src/visually-hidden/VisuallyHidden.tsx.
 */

import { type Accessor, type JSX, createMemo, createSignal } from "solid-js";
import { createFocusWithin } from "../interactions/createFocusWithin";
import { access, type MaybeAccessor } from "../utils";
import { mergeProps } from "../utils/mergeProps";

export interface AriaVisuallyHiddenProps {
  /** Inline styles to merge with the visually hidden styles. */
  style?: JSX.CSSProperties;
  /** Whether the element should become visible when focused (e.g., skip links). */
  isFocusable?: boolean;
}

export interface VisuallyHiddenAria {
  /** Props to spread on the visually hidden element. */
  visuallyHiddenProps: Accessor<JSX.HTMLAttributes<HTMLElement>>;
}

/**
 * CSS styles that visually hide an element while keeping it accessible.
 * These styles ensure the element is read by screen readers but not visible on screen.
 */
export const visuallyHiddenStyles: JSX.CSSProperties = {
  border: "0",
  clip: "rect(0 0 0 0)",
  "clip-path": "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  "white-space": "nowrap",
};

/**
 * Provides props for an element that hides its children visually
 * but keeps content visible to assistive technology.
 *
 * @example
 * ```tsx
 * function SkipLink() {
 *   let ref: HTMLAnchorElement | undefined;
 *   const { visuallyHiddenProps } = createVisuallyHidden({ isFocusable: true });
 *
 *   return (
 *     <a
 *       ref={ref}
 *       href="#main-content"
 *       {...visuallyHiddenProps()}
 *     >
 *       Skip to main content
 *     </a>
 *   );
 * }
 *
 * // For content that should always be hidden
 * function ScreenReaderOnly(props: ParentProps) {
 *   const { visuallyHiddenProps } = createVisuallyHidden();
 *
 *   return (
 *     <span {...visuallyHiddenProps()}>
 *       {props.children}
 *     </span>
 *   );
 * }
 * ```
 */
export function createVisuallyHidden(
  props: MaybeAccessor<AriaVisuallyHiddenProps> = {},
): VisuallyHiddenAria {
  const [isFocused, setIsFocused] = createSignal(false);

  const isFocusable = () => access(props).isFocusable ?? false;
  const style = () => access(props).style;

  // Track focus within for focusable visually hidden elements
  const { focusWithinProps } = createFocusWithin({
    get isDisabled() {
      return !isFocusable();
    },
    onFocusWithinChange: (val: boolean) => setIsFocused(val),
  });

  // Compute combined styles
  const combinedStyles = createMemo<JSX.CSSProperties | undefined>(() => {
    if (isFocused()) {
      // If focused, show the element (for skip links, etc.)
      return style();
    } else if (style()) {
      return { ...visuallyHiddenStyles, ...style() };
    } else {
      return visuallyHiddenStyles;
    }
  });

  const visuallyHiddenProps = createMemo<JSX.HTMLAttributes<HTMLElement>>(() => ({
    ...mergeProps(
      focusWithinProps as unknown as Record<string, unknown>,
      isFocusable()
        ? {
            onFocusIn: () => setIsFocused(true),
            onFocusOut: (e: FocusEvent) => {
              const currentTarget = e.currentTarget as Element | null;
              const relatedTarget = e.relatedTarget as Element | null;
              if (currentTarget && !currentTarget.contains(relatedTarget)) {
                setIsFocused(false);
              }
            },
          }
        : {},
      { style: combinedStyles() },
    ),
  }));

  return {
    visuallyHiddenProps,
  };
}
