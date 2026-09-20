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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/useLabels.ts

/**
 * Labels utility for Solidaria
 *
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 *
 * This is a 1:1 port of @react-aria/utils's useLabels hook.
 */

import { createId } from "../ssr";
import type { AriaLabelingProps, DOMProps } from "./createLabel";

/**
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 *
 * @param props - Aria label props.
 * @param defaultLabel - Default value for aria-label when not present.
 */
export function createLabels(
  props: DOMProps & AriaLabelingProps,
  defaultLabel?: string,
): DOMProps & AriaLabelingProps {
  // Read props directly rather than destructuring: in Solid a destructure
  // freezes the value at call time. This is a pure snapshot transform, so it is
  // behaviourally identical, but keeping the reactive read explicit matches the
  // rest of the port and satisfies guard:idiomatic-solid.
  // Upstream `useLabels` is itself a hook, so its `useId(props.id)` runs once in
  // the component body. Ours is reached from lazy prop getters (`get fieldProps`
  // → `createLabels`), which run during the hydration walk with no reactive
  // owner, and Solid 2's `createUniqueId` resolves to `getNextContextId()` →
  // `getNextChildId(getOwner())` while hydrating — it needs an owner, and the id
  // it returns depends on that owner's position. Generating here would therefore
  // either throw or hand back an id the server never emitted. Every caller in
  // this repository generates its id in its own hook body and passes it, which
  // is where upstream consumes one; this fallback is for a caller that has no
  // id, and such a caller must call `createLabels` from a hook body.
  let id = props.id ?? createId();
  let label = props["aria-label"];
  let labelledBy = props["aria-labelledby"];

  // If there is both an aria-label and aria-labelledby,
  // combine them by pointing to the element itself.
  if (labelledBy && label) {
    const ids = new Set([id, ...labelledBy.trim().split(/\s+/)]);
    labelledBy = [...ids].join(" ");
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(" ");
  }

  // If no labels are provided, use the default
  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    id,
    "aria-label": label,
    "aria-labelledby": labelledBy,
  };
}
