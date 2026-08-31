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
 * VisuallyHidden component for solidaria-components
 *
 * Hides content visually but keeps it accessible to screen readers.
 * Solid adaptation of the pinned VisuallyHidden component.
 */

import { type JSX, type ParentProps, splitProps } from "solid-js";
import { ElementTag } from "./ElementTag";
import { createVisuallyHidden, mergeProps } from "@proyecto-viviana/solidaria";

export interface VisuallyHiddenProps extends ParentProps, JSX.HTMLAttributes<HTMLElement> {
  /** The element type to render. @default 'span' */
  elementType?: keyof JSX.IntrinsicElements;
  /** Whether the element should be focusable when focused. */
  isFocusable?: boolean;
  /** Inline style object merged with visually hidden styles. */
  style?: JSX.CSSProperties;
}

/**
 * VisuallyHidden hides its children visually, while keeping content visible to screen readers.
 */
export function VisuallyHidden(props: VisuallyHiddenProps): JSX.Element {
  // Split children so the getter is not read once through `{...mergedProps()}`
  // and again during explicit rendering. Hydration code is sensitive to that.
  const [local, others] = splitProps(props, ["elementType", "isFocusable", "style", "children"]);
  const { visuallyHiddenProps } = createVisuallyHidden(() => ({
    style: local.style,
    isFocusable: local.isFocusable,
  }));

  const mergedProps = () =>
    mergeProps<Record<string, unknown>>(
      others as unknown as Record<string, unknown>,
      visuallyHiddenProps() as unknown as Record<string, unknown>,
    );

  // elementType is read once (structural, not reactive). `ElementTag` renders it
  // as a statically compiled element; `<Dynamic component={string}>` desyncs
  // Solid's hydration markers, leaving the registry dirty so a later sibling
  // re-render throws "template is not a function" in prod (and a hard hydration
  // crash under solid-refresh in dev). See ElementTag.tsx for the mechanism.
  const tag = local.elementType ?? "span";
  return (
    <ElementTag tag={tag} {...mergedProps()}>
      {local.children}
    </ElementTag>
  );
}
